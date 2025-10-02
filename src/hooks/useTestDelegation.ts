import {
  appendTransactionMessageInstruction,
  createTransactionMessage,
  getBase58Decoder,
  pipe,
  Rpc,
  RpcSubscriptions,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  signTransactionMessageWithSigners,
  SolanaRpcApiMainnet,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import { useCallback } from "react";
import {
  getCreateCounterInstruction,
  getIncrementCounterInstruction,
} from "test-delegation";
import { useWalletAccountTransactionSigner } from "@solana/react";
import { useChain } from "./useChain";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCounterPda } from "./useCounterPda";

type UseTestDelegationProps = Readonly<{
  payer: UiWalletAccount;
  rpc: Rpc<SolanaRpcApiMainnet>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}>;

export function useTestDelegation({
  payer,
  rpc,
  rpcSubscriptions,
}: UseTestDelegationProps) {
  const { chain } = useChain();
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc: rpc,
    rpcSubscriptions: rpcSubscriptions,
  });
  const signer = useWalletAccountTransactionSigner(payer, chain);
  const counterPda = useCounterPda();

  const createCounter = useCallback(async () => {
    if (!payer || !counterPda) {
      console.log("Payer or counter not found", payer, counterPda);
      throw new Error("Payer or counter not found");
    }

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const message = pipe(
      createTransactionMessage({ version: "legacy" }),
      (m) => setTransactionMessageFeePayerSigner(signer, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      (m) =>
        appendTransactionMessageInstruction(
          getCreateCounterInstruction({
            payer: signer,
            counter: counterPda,
          }),
          m
        )
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
    const signatureBytes = await signAndSendTransactionMessageWithSigners(
      message
    );
    const base58Signature = getBase58Decoder().decode(signatureBytes);
    console.log(base58Signature);
  }, [payer, counterPda, signer]);

  const incrementCounter = useCallback(async () => {
    if (!payer || !counterPda) {
      throw new Error("Payer or counter not found");
    }
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const message = pipe(
      createTransactionMessage({ version: "legacy" }),
      (m) => setTransactionMessageFeePayerSigner(signer, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      (m) =>
        appendTransactionMessageInstruction(
          getIncrementCounterInstruction({
            counter: counterPda,
          }),
          m
        )
    );
    console.log(message);
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
    createCounter,
    incrementCounter,
  };
}
