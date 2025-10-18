import {
  AccountRole,
  address,
  appendTransactionMessageInstructions,
  createTransactionMessage,
  getBase58Encoder,
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
import {
  getCompressedDelegationRecordDecoder,
  getUndelegateInstruction,
} from "compressed-delegation-program";
import { useWalletAccountTransactionSigner } from "@solana/react";
import { useChain } from "./useChain";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCounterPda } from "./useCounterPda";
import { COMPRESSED_DELEGATION_PROGRAM_ADDRESS } from "compressed-delegation-program";
import {
  bn,
  deriveAddressSeedV2,
  deriveAddressV2,
  packTreeInfos,
  TreeType,
} from "@lightprotocol/stateless.js";
import { ComputeBudgetProgram, PublicKey } from "@solana/web3.js";

import {
  PackedAccounts,
  SystemAccountMetaConfig,
  usePhoton,
} from "./usePhoton";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";
import { TEST_DELEGATION_PROGRAM_ADDRESS } from "test-delegation";

export const ADDRESS_TREE = new PublicKey(
  "EzKE84aVTkCUhDHLELqyJaq1Y7UVVmqxXqZjVHwHY3rK"
);
export const OUTPUT_QUEUE = new PublicKey(
  "6L7SzhYB3anwEQ9cphpJ1U7Scwj57bx2xueReg7R9cKU"
);
export const DELEGATION_PROGRAM_ADDRESS = new PublicKey(
  "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
);
export const MAGIC_CONTEXT = new PublicKey(
  "MagicContext1111111111111111111111111111111"
);
export const MAGIC_PROGRAM_ADDRESS = new PublicKey(
  "Magic11111111111111111111111111111111111111"
);

type UseCompressedDelegationProps = Readonly<{
  payer: UiWalletAccount;
  rpc: Rpc<SolanaRpcApiMainnet>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}>;

export function useCompressedDelegation({
  payer,
  rpc,
  rpcSubscriptions,
}: UseCompressedDelegationProps) {
  const { chain } = useChain();
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc: rpc,
    rpcSubscriptions: rpcSubscriptions,
  });
  const signer = useWalletAccountTransactionSigner(payer, chain);
  const counterPda = useCounterPda();
  const photonRpc = usePhoton();

  const undelegateAccount = useCallback(async () => {
    if (!payer || !counterPda) {
      throw new Error("Payer or counter not found");
    }

    const addressTree = {
      tree: ADDRESS_TREE,
      queue: OUTPUT_QUEUE,
      tree_type: TreeType.AddressV2,
    };
    const encodedCounterPda = getBase58Encoder().encode(counterPda);
    const addressSeed = deriveAddressSeedV2([
      new Uint8Array(encodedCounterPda),
    ]);
    const delegatedRecordAddress = deriveAddressV2(
      addressSeed,
      addressTree.tree,
      new PublicKey(COMPRESSED_DELEGATION_PROGRAM_ADDRESS)
    );

    const compressedDelegatedRecord = await photonRpc.getCompressedAccount(
      bn(delegatedRecordAddress.toBytes())
    );
    console.log("compressedDelegatedRecord", compressedDelegatedRecord);
    if (!compressedDelegatedRecord || !compressedDelegatedRecord.data) {
      throw new Error("Compressed delegated record not found");
    }

    console.log("delegatedRecordAddress", delegatedRecordAddress);
    const result = await photonRpc.getValidityProofAndRpcContext(
      [
        {
          hash: compressedDelegatedRecord.hash,
          tree: compressedDelegatedRecord.treeInfo.tree,
          queue: compressedDelegatedRecord.treeInfo.queue,
        },
      ],
      []
    );
    const validityProof = result.value.compressedProof;

    const systemAccountConfig = SystemAccountMetaConfig.new(
      new PublicKey(COMPRESSED_DELEGATION_PROGRAM_ADDRESS)
    );
    let packedAccounts =
      PackedAccounts.newWithSystemAccountsSmall(systemAccountConfig);
    console.log("remainingAccounts", packedAccounts);

    const packedTreeInfos = packTreeInfos(
      packedAccounts.toAccountMetas().remainingAccounts.map((a) => a.pubkey),
      [
        {
          hash: compressedDelegatedRecord.hash,
          treeInfo: compressedDelegatedRecord.treeInfo,
          leafIndex: compressedDelegatedRecord.leafIndex,
          rootIndex: result.value.rootIndices[0],
          proveByIndex: compressedDelegatedRecord.proveByIndex !== null,
        },
      ],
      []
    );
    const outputTreeIndex = packedAccounts.insertOrGet(
      compressedDelegatedRecord.treeInfo.tree
    );
    const outputQueueIndex = packedAccounts.insertOrGet(
      compressedDelegatedRecord.treeInfo.queue
    );
    const accountMeta = {
      treeInfo: {
        ...packedTreeInfos.stateTrees!.packedTreeInfos[0],
        merkleTreePubkeyIndex: outputTreeIndex,
        queuePubkeyIndex: outputQueueIndex,
        leafIndex: compressedDelegatedRecord.leafIndex,
      },
      address: Array.from(delegatedRecordAddress.toBytes()),
      outputStateTreeIndex: outputQueueIndex,
      lamports: null,
    };

    const delegationRecord = getCompressedDelegationRecordDecoder().decode(
      compressedDelegatedRecord.data!.data
    );
    console.log("delegationRecord", delegationRecord);

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const message = pipe(
      createTransactionMessage({ version: "legacy" }),
      (m) => setTransactionMessageFeePayerSigner(signer, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      (m) => {
        const ix = getUndelegateInstruction({
          payer: signer,
          ownerProgram: TEST_DELEGATION_PROGRAM_ADDRESS,
          delegatedAccount: counterPda,
          systemProgram: SYSTEM_PROGRAM_ADDRESS,
          args: {
            validityProof: validityProof,
            delegationRecordAccountMeta: accountMeta,
            compressedDelegatedRecord: delegationRecord,
          },
        });
        ix.accounts.push(
          ...packedAccounts.toAccountMetas().remainingAccounts.map((a) => ({
            address: address(a.pubkey.toString()),
            role: (a.isSigner && a.isWritable
              ? AccountRole.WRITABLE_SIGNER
              : a.isSigner && !a.isWritable
              ? AccountRole.READONLY_SIGNER
              : a.isWritable
              ? AccountRole.WRITABLE
              : AccountRole.READONLY) as any,
          }))
        );
        return appendTransactionMessageInstructions(
          [
            ix,
            {
              ...ComputeBudgetProgram.setComputeUnitLimit({
                units: 1000000,
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
    undelegateAccount,
  };
}
