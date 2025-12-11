import {
  AccountRole,
  address,
  appendTransactionMessageInstructions,
  createTransactionMessage,
  getBase58Encoder,
  pipe,
  Rpc,
  RpcSubscriptions,
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
import { useSendTransaction } from "./useSendTransaction";
import { BATCHED_MERKLE_TREE, OUTPUT_QUEUE } from "../constants";

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
  const sendTransaction = useSendTransaction({ rpc, rpcSubscriptions });
  const signer = useWalletAccountTransactionSigner(payer, chain);
  const counterPda = useCounterPda();
  const photonRpc = usePhoton();

  const undelegateAccount = useCallback(async () => {
    if (!payer || !counterPda) {
      throw new Error("Payer or counter not found");
    }

    const addressTree = await photonRpc.getAddressTreeInfoV2();
    addressTree.queue = OUTPUT_QUEUE;
    const encodedCounterPda = getBase58Encoder().encode(counterPda);
    const addressSeed = deriveAddressSeedV2([
      new Uint8Array(encodedCounterPda),
    ]);
    const delegatedRecordAddress = deriveAddressV2(
      addressSeed,
      addressTree.tree,
      new PublicKey(COMPRESSED_DELEGATION_PROGRAM_ADDRESS)
    );

    // Insert the batched merkle state trees into the photon rpc
    await photonRpc.getStateTreeInfos();
    photonRpc.allStateTreeInfos?.push({
      tree: BATCHED_MERKLE_TREE,
      queue: OUTPUT_QUEUE,
      treeType: TreeType.StateV2,
      nextTreeInfo: null,
    });
    const compressedDelegatedRecord = await photonRpc.getCompressedAccount(
      bn(delegatedRecordAddress.toBytes())
    );
    if (!compressedDelegatedRecord || !compressedDelegatedRecord.data) {
      throw new Error("Compressed delegated record not found");
    }

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

    const signedTransaction = await signTransactionMessageWithSigners(message);
    await sendTransaction({
      ...signedTransaction,
      lifetimeConstraint: latestBlockhash,
    });
  }, [payer, counterPda, signer]);

  return {
    undelegateAccount,
  };
}
