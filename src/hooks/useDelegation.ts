import {
  address,
  appendTransactionMessageInstructions,
  createTransactionMessage,
  getProgramDerivedAddress,
  pipe,
  Rpc,
  RpcSubscriptions,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  SolanaRpcApiMainnet,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import { useCallback } from "react";
import { getFundEphemeralBalanceInstruction } from "test-delegation";
import { useWalletAccountTransactionSigner } from "@solana/react";
import { useChain } from "./useChain";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCounterPda } from "./useCounterPda";
import { ComputeBudgetProgram, PublicKey } from "@solana/web3.js";
import {
  delegateBufferPdaFromDelegatedAccountAndOwnerProgram,
  delegationMetadataPdaFromDelegatedAccount,
  delegationRecordPdaFromDelegatedAccount,
} from "@magicblock-labs/ephemeral-rollups-sdk";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";

import {
  DELEGATION_PROGRAM_ADDRESS,
  MAGIC_CONTEXT,
  MAGIC_PROGRAM_ADDRESS,
  VALIDATOR,
} from "../constants";

type UseDelegationProps = Readonly<{
  payer: UiWalletAccount;
  rpc: Rpc<SolanaRpcApiMainnet>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}>;

export function useDelegation({
  payer,
  rpc,
  rpcSubscriptions,
}: UseDelegationProps) {
  const { chain } = useChain();
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc: rpc,
    rpcSubscriptions: rpcSubscriptions,
  });
  const signer = useWalletAccountTransactionSigner(payer, chain);
  const counterPda = useCounterPda();

  const fundEphemeralBalance = useCallback(async () => {
    if (!payer || !counterPda) {
      throw new Error("Payer or counter not found");
    }

    let [balancePda, _balancePdaBump] = await getProgramDerivedAddress({
      programAddress: address(DELEGATION_PROGRAM_ADDRESS.toString()),
      seeds: [
        new TextEncoder().encode("balance"),
        new PublicKey(payer.address).toBuffer(),
        Uint8Array.from([0]),
      ],
    });
    let delegateBufferPda =
      delegateBufferPdaFromDelegatedAccountAndOwnerProgram(
        new PublicKey(balancePda.toString()),
        new PublicKey(SYSTEM_PROGRAM_ADDRESS)
      );
    let delegationRecordPda = delegationRecordPdaFromDelegatedAccount(
      new PublicKey(balancePda.toString())
    );
    let delegationMetadataPda = delegationMetadataPdaFromDelegatedAccount(
      new PublicKey(balancePda.toString())
    );

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const message = pipe(
      createTransactionMessage({ version: "legacy" }),
      (m) => setTransactionMessageFeePayerSigner(signer, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      (m) => {
        const ix = getFundEphemeralBalanceInstruction({
          payer: signer,
          pubkey: signer,
          ephemeralBalance: address(balancePda.toString()),
          delegateBuffer: address(delegateBufferPda.toString()),
          delegationRecord: address(delegationRecordPda.toString()),
          delegationMetadata: address(delegationMetadataPda.toString()),
          delegationProgram: address(DELEGATION_PROGRAM_ADDRESS.toString()),
          systemProgram: SYSTEM_PROGRAM_ADDRESS,
          args: {
            validator: VALIDATOR,
          },
        });
        return appendTransactionMessageInstructions(
          [
            ix,
            {
              ...ComputeBudgetProgram.setComputeUnitLimit({
                units: 200000,
              }),
              programAddress: address(
                ComputeBudgetProgram.programId.toString()
              ),
            },
          ],
          m
        );
      }
    );
    console.log(message);
    console.log(
      await rpc.getAccountInfo(address(MAGIC_CONTEXT.toString())).send()
    );
    console.log(
      await rpc.getAccountInfo(address(MAGIC_PROGRAM_ADDRESS.toString())).send()
    );
    const signedTransaction = await signTransactionMessageWithSigners(message);
    await sendAndConfirmTransaction(
      {
        signatures: signedTransaction.signatures,
        messageBytes: signedTransaction.messageBytes,
        "__transactionSignedness:@solana/kit": "fullySigned",
        "__transactionSize:@solana/kit": "withinLimit",
        lifetimeConstraint: latestBlockhash,
      },
      { commitment: "confirmed", skipPreflight: true }
    );
  }, [payer, counterPda, signer]);

  return {
    fundEphemeralBalance,
  };
}
