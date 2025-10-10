import {
  AccountRole,
  Address,
  address,
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  createTransactionMessage,
  getBase58Decoder,
  getBase58Encoder,
  pipe,
  Rpc,
  RpcSubscriptions,
  sendAndConfirmTransactionFactory,
  sendTransactionWithoutConfirmingFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  Signature,
  signTransactionMessageWithSigners,
  SolanaRpcApiMainnet,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import { useCallback } from "react";
import {
  getCreateCounterInstruction,
  getDelegateInstruction,
  getIncrementCounterInstruction,
  getUndelegateInstruction,
  TEST_DELEGATION_PROGRAM_ADDRESS,
} from "test-delegation";
import { useWalletAccountTransactionSigner } from "@solana/react";
import { useChain } from "./useChain";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCounterPda } from "./useCounterPda";
import {
  COMPRESSED_DELEGATION_CPI_SIGNER,
  COMPRESSED_DELEGATION_PROGRAM_ADDRESS,
  serializeAccountMeta,
  serializeProof,
  serializeAddressTreeInfo,
} from "compressed-delegation-program";
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
import { PackedAddressTreeInfo } from "@lightprotocol/stateless.js";

const ADDRESS_TREE = new PublicKey(
  "EzKE84aVTkCUhDHLELqyJaq1Y7UVVmqxXqZjVHwHY3rK"
);
const OUTPUT_QUEUE = new PublicKey(
  "6L7SzhYB3anwEQ9cphpJ1U7Scwj57bx2xueReg7R9cKU"
);

type UseTestDelegationProps = Readonly<{
  payer: UiWalletAccount;
  rpc: Rpc<SolanaRpcApiMainnet>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}>;

const VALIDATOR = address("45cWPYAk14mYTsn5GvNu89y3kxA1XqAzzbPH7bSPCajA");

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
  const photonRpc = usePhoton();

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
    console.log(await rpc.getAccountInfo(counterPda).send());
    const signedTransaction = await signTransactionMessageWithSigners(message);

    // const factory = sendTransactionWithoutConfirmingFactory({ rpc: rpc });
    // console.log(
    //   await factory(
    //     {
    //       signatures: signedTransaction.signatures,
    //       messageBytes: signedTransaction.messageBytes,
    //       "__transactionSignedness:@solana/kit": "fullySigned",
    //       "__transactionSize:@solana/kit": "withinLimit",
    //       // lifetimeConstraint: latestBlockhash,
    //     },
    //     { commitment: "finalized", skipPreflight: true }
    //   )
    // );
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

    const systemAccountConfig = SystemAccountMetaConfig.new(
      new PublicKey(COMPRESSED_DELEGATION_PROGRAM_ADDRESS)
    );
    const remainingAccounts =
      PackedAccounts.newWithSystemAccountsSmall(systemAccountConfig);

    console.log("delegatedRecordAddress", delegatedRecordAddress);
    let result;
    let ix;
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
      console.log("result", result);

      // Insert trees in accounts
      const addressMerkleTreePubkeyIndex =
        remainingAccounts.insertOrGet(ADDRESS_TREE);
      const addressQueuePubkeyIndex =
        remainingAccounts.insertOrGet(OUTPUT_QUEUE);
      console.log("addressMerkleTreePubkeyIndex", addressMerkleTreePubkeyIndex);
      console.log("addressQueuePubkeyIndex", addressQueuePubkeyIndex);

      const validityProof = result.compressedProof;
      const validityProofBytes = serializeProof(validityProof);
      console.log(validityProof);

      const packedAddreesMerkleContext: PackedAddressTreeInfo = {
        rootIndex: result.rootIndices[0],
        addressMerkleTreePubkeyIndex,
        addressQueuePubkeyIndex,
      };
      const packedAddreesMerkleContextBytes = serializeAddressTreeInfo(
        packedAddreesMerkleContext
      );

      ix = getDelegateInstruction({
        payer: signer,
        counter: counterPda,
        validator: VALIDATOR,
        compressedDelegationProgram: COMPRESSED_DELEGATION_PROGRAM_ADDRESS,
        compressedDelegationCpiSigner: COMPRESSED_DELEGATION_CPI_SIGNER,
        validityProofBytes: validityProofBytes,
        addressTreeInfoBytes: packedAddreesMerkleContextBytes,
        outputStateTreeIndex: addressQueuePubkeyIndex,
        accountMetaBytes: null,
      });
    } catch (error) {
      // Try getting an existing account
      const compressedDelegatedRecord = await photonRpc.getCompressedAccount(
        bn(delegatedRecordAddress.toBytes())
      );
      console.log("compressedDelegatedRecord", compressedDelegatedRecord);
      if (!compressedDelegatedRecord) {
        throw new Error("Compressed delegated record not found");
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
      const validityProofBytes = serializeProof(validityProof);

      console.log("remainingAccounts", remainingAccounts);
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
      console.log("packedTreeInfos", packedTreeInfos);

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
      const accountMetaBytes = serializeAccountMeta(accountMeta);

      ix = getDelegateInstruction({
        payer: signer,
        counter: counterPda,
        validator: VALIDATOR,
        compressedDelegationProgram: COMPRESSED_DELEGATION_PROGRAM_ADDRESS,
        compressedDelegationCpiSigner: COMPRESSED_DELEGATION_CPI_SIGNER,
        validityProofBytes: validityProofBytes,
        addressTreeInfoBytes: null,
        outputStateTreeIndex: accountMeta.outputStateTreeIndex,
        accountMetaBytes,
      });
    }

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const message = pipe(
      createTransactionMessage({ version: "legacy" }),
      (m) => setTransactionMessageFeePayerSigner(signer, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      (m) => {
        ix.accounts.push(
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

  const undelegateCounter = useCallback(async () => {
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
    const validityProofBytes = serializeProof(validityProof);
    console.log(validityProofBytes);

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
    const accountMetaBytes = serializeAccountMeta(accountMeta);

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const message = pipe(
      createTransactionMessage({ version: "legacy" }),
      (m) => setTransactionMessageFeePayerSigner(signer, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      (m) => {
        const ix = getUndelegateInstruction({
          payer: signer,
          counter: counterPda,
          validator: VALIDATOR,
          compressedDelegationProgram: COMPRESSED_DELEGATION_PROGRAM_ADDRESS,
          compressedDelegationCpiSigner: COMPRESSED_DELEGATION_CPI_SIGNER,
          validityProofBytes: validityProofBytes,
          accountMetaBytes,
          compressedDelegatedAccountBytes: compressedDelegatedRecord.data!.data,
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
    createCounter,
    incrementCounter,
    delegateCounter,
    undelegateCounter,
  };
}
