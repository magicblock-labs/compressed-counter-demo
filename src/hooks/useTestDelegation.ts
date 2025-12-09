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
  getCreateCounterInstruction,
  getDelegateInstruction,
  getIncrementCounterInstruction,
  getScheduleUndelegateInstruction,
} from "test-delegation";
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
  PackedAddressTreeInfo,
} from "@lightprotocol/stateless.js";
import { ComputeBudgetProgram, PublicKey } from "@solana/web3.js";

import {
  PackedAccounts,
  SystemAccountMetaConfig,
  usePhoton,
} from "./usePhoton";
import {
  ADDRESS_TREE,
  MAGIC_CONTEXT,
  MAGIC_PROGRAM_ADDRESS,
  OUTPUT_QUEUE,
  VALIDATOR,
} from "../constants";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";

type UseTestDelegationProps = Readonly<{
  payer: UiWalletAccount;
  rpc: Rpc<SolanaRpcApiMainnet>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  ephemeral?: boolean;
}>;

export function useTestDelegation({
  payer,
  rpc,
  rpcSubscriptions,
  ephemeral = false,
}: UseTestDelegationProps) {
  const { chain } = useChain();
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc: rpc,
    rpcSubscriptions: rpcSubscriptions,
  });
  const signer = useWalletAccountTransactionSigner(payer, chain);
  const counterPda = useCounterPda();
  const photonRpc = usePhoton();

  const incrementCounter = useCallback(async () => {
    if (!payer || !counterPda) {
      throw new Error("Payer or counter not found");
    }
    const counterInfo = (await rpc.getAccountInfo(counterPda).send()).value;
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const message = pipe(
      createTransactionMessage({ version: "legacy" }),
      (m) => setTransactionMessageFeePayerSigner(signer, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      (m) => {
        let createIx;
        if (!counterInfo && !ephemeral) {
          // Initialize mainnet counter if it does not exist
          createIx = getCreateCounterInstruction({
            payer: signer,
            counter: counterPda,
            systemProgram: SYSTEM_PROGRAM_ADDRESS,
          });
        }
        return appendTransactionMessageInstructions(
          [
            createIx,
            getIncrementCounterInstruction({
              counter: counterPda,
              authority: signer,
            }),
          ].filter((ix) => !!ix),
          m
        );
      }
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

  const delegateCounter = useCallback(async () => {
    if (!payer || !counterPda) {
      throw new Error("Payer or counter not found");
    }

    const counterInfo = (await rpc.getAccountInfo(counterPda).send()).value;

    const addressTree = await photonRpc.getAddressTreeInfoV2();
    addressTree.queue = OUTPUT_QUEUE;
    console.log("addressTree", addressTree);
    console.log("addressTree.tree", addressTree.tree.toString());
    console.log("addressTree.queue", addressTree.queue.toString());
    console.log(ADDRESS_TREE.toString());
    console.log(OUTPUT_QUEUE.toString());
    const encodedCounterPda = getBase58Encoder().encode(counterPda);
    const addressSeed = deriveAddressSeedV2([
      new Uint8Array(encodedCounterPda),
    ]);
    const delegatedRecordAddress = deriveAddressV2(
      addressSeed,
      addressTree.tree,
      new PublicKey(COMPRESSED_DELEGATION_PROGRAM_ADDRESS)
    );

    const systemAccountConfig = SystemAccountMetaConfig.new(
      new PublicKey(COMPRESSED_DELEGATION_PROGRAM_ADDRESS)
    );
    const remainingAccounts =
      PackedAccounts.newWithSystemAccountsSmall(systemAccountConfig);

    let result;
    let delegateIx;
    try {
      // Try to get the proof of a new address
      result = await photonRpc.getValidityProofV0(
        [],
        [
          {
            address: delegatedRecordAddress.toBytes(),
            tree: addressTree.tree,
            queue: addressTree.queue,
          },
        ]
      );

      // Insert trees in accounts
      const addressMerkleTreePubkeyIndex = remainingAccounts.insertOrGet(
        addressTree.tree
      );
      const addressQueuePubkeyIndex = remainingAccounts.insertOrGet(
        addressTree.queue
      );

      const validityProof = result.compressedProof;

      const packedAddreesMerkleContext: PackedAddressTreeInfo = {
        rootIndex: result.rootIndices[0],
        addressMerkleTreePubkeyIndex,
        addressQueuePubkeyIndex,
      };

      delegateIx = getDelegateInstruction({
        payer: signer,
        counter: counterPda,
        compressedDelegationProgram: COMPRESSED_DELEGATION_PROGRAM_ADDRESS,
        args: {
          validator: VALIDATOR,
          validityProof,
          addressTreeInfo: packedAddreesMerkleContext,
          outputStateTreeIndex: addressQueuePubkeyIndex,
          accountMeta: null,
        },
      });
    } catch (error) {
      // Try getting an existing account
      const compressedDelegatedRecord = await photonRpc.getCompressedAccount(
        bn(delegatedRecordAddress.toBytes())
      );
      if (!compressedDelegatedRecord) {
        throw new Error(`Compressed delegated record not found (${error})`);
      }
      result = await photonRpc.getValidityProofV0(
        [
          {
            hash: compressedDelegatedRecord.hash,
            tree: addressTree.tree,
            queue: addressTree.queue,
          },
        ],
        []
      );

      const validityProof = result.compressedProof;

      const packedTreeInfos = packTreeInfos(
        remainingAccounts
          .toAccountMetas()
          .remainingAccounts.map((a) => a.pubkey),
        [
          {
            hash: compressedDelegatedRecord.hash,
            treeInfo: compressedDelegatedRecord.treeInfo,
            leafIndex: compressedDelegatedRecord.leafIndex,
            rootIndex: result.rootIndices[0],
            proveByIndex: compressedDelegatedRecord.proveByIndex !== null,
          },
        ],
        []
      );

      const addressMerkleTreePubkeyIndex = remainingAccounts.insertOrGet(
        compressedDelegatedRecord.treeInfo.tree
      );
      const addressQueuePubkeyIndex = remainingAccounts.insertOrGet(
        compressedDelegatedRecord.treeInfo.queue
      );

      const accountMeta = {
        treeInfo: {
          ...packedTreeInfos.stateTrees!.packedTreeInfos[0],
          merkleTreePubkeyIndex: addressMerkleTreePubkeyIndex,
          queuePubkeyIndex: addressQueuePubkeyIndex,
          leafIndex: compressedDelegatedRecord.leafIndex,
        },
        address: Array.from(delegatedRecordAddress.toBytes()),
        outputStateTreeIndex: addressQueuePubkeyIndex,
        lamports: null,
      };

      delegateIx = getDelegateInstruction({
        payer: signer,
        counter: counterPda,
        compressedDelegationProgram: COMPRESSED_DELEGATION_PROGRAM_ADDRESS,
        args: {
          validator: VALIDATOR,
          validityProof,
          addressTreeInfo: null,
          outputStateTreeIndex: accountMeta.outputStateTreeIndex,
          accountMeta,
        },
      });
    }

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const message = pipe(
      createTransactionMessage({ version: "legacy" }),
      (m) => setTransactionMessageFeePayerSigner(signer, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      (m) => {
        let createIx;
        if (!counterInfo && !ephemeral) {
          // Initialize mainnet counter if it does not exist
          createIx = getCreateCounterInstruction({
            payer: signer,
            counter: counterPda,
            systemProgram: SYSTEM_PROGRAM_ADDRESS,
          });
        }
        delegateIx.accounts.push(
          ...remainingAccounts.toAccountMetas().remainingAccounts.map((a) => ({
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
            createIx,
            delegateIx,
            {
              ...ComputeBudgetProgram.setComputeUnitLimit({
                units: 1000000,
              }),
              programAddress: address(
                ComputeBudgetProgram.programId.toString()
              ),
            },
          ].filter((ix) => !!ix),
          m
        );
      }
    );
    console.log(counterInfo, ephemeral);
    console.log(message);

    const signedTransaction = await signTransactionMessageWithSigners(message);
    console.log(signedTransaction);
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

  const scheduleUndelegateCounter = useCallback(async () => {
    if (!payer || !counterPda) {
      throw new Error("Payer or counter not found");
    }

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const message = pipe(
      createTransactionMessage({ version: "legacy" }),
      (m) => setTransactionMessageFeePayerSigner(signer, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      (m) => {
        const ix = getScheduleUndelegateInstruction({
          payer: signer,
          counter: counterPda,
          magicContext: address(MAGIC_CONTEXT.toString()),
          magicProgram: address(MAGIC_PROGRAM_ADDRESS.toString()),
        });
        return appendTransactionMessageInstructions(
          [
            ix,
            {
              ...ComputeBudgetProgram.setComputeUnitLimit({
                units: 100000,
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
    incrementCounter,
    delegateCounter,
    scheduleUndelegateCounter,
  };
}
