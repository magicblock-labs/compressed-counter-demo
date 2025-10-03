import {
  AccountRole,
  Address,
  address,
  appendTransactionMessageInstruction,
  createTransactionMessage,
  getBase58Decoder,
  getBase58Encoder,
  getPublicKeyFromAddress,
  pipe,
  Rpc,
  RpcSubscriptions,
  sendAndConfirmTransactionFactory,
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
  TEST_DELEGATION_PROGRAM_ADDRESS,
} from "test-delegation";
import { useWalletAccountTransactionSigner } from "@solana/react";
import { useChain } from "./useChain";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCounterPda } from "./useCounterPda";
import {
  COMPRESSED_DELEGATION_CPI_SIGNER,
  COMPRESSED_DELEGATION_PROGRAM_ADDRESS,
} from "compressed-delegation";
import { serialize } from "borsh";
import {
  CompressedProofLayout,
  deriveAddressSeedV2,
  deriveAddressV2,
  packCompressedAccounts,
  packTreeInfos,
  TreeType,
} from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";

import {
  PackedAccounts,
  SystemAccountMetaConfig,
  usePhoton,
} from "./usePhoton";
import { PackedMerkleContextLayout } from "@lightprotocol/stateless.js";

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

    console.log("delegatedRecordAddress", delegatedRecordAddress);
    const result = await photonRpc.getValidityProofV0(
      [],
      [
        {
          address: delegatedRecordAddress.toBytes(),
          tree: addressTree.tree,
          queue: addressTree.queue,
        },
      ]
    );
    const validityProof = result.compressedProof;
    console.log(result, validityProof, CompressedProofLayout);
    if (!validityProof) {
      throw new Error("Validity proof not found");
    }
    const validityProofBytes = serialize(
      {
        option: {
          struct: {
            a: { array: { type: "u8", len: 32 } },
            b: { array: { type: "u8", len: 64 } },
            c: { array: { type: "u8", len: 32 } },
          },
        },
      },
      validityProof,
      true
    );
    console.log(validityProofBytes);

    const systemAccountConfig = SystemAccountMetaConfig.new(
      new PublicKey(COMPRESSED_DELEGATION_PROGRAM_ADDRESS)
    );
    let remainingAccounts =
      PackedAccounts.newWithSystemAccounts(systemAccountConfig);

    let addressQueuePubkeyIndex = remainingAccounts.insertOrGet(OUTPUT_QUEUE);
    const addressMerkleTreePubkeyIndex =
      remainingAccounts.insertOrGet(ADDRESS_TREE);
    const packedAddreesMerkleContext = {
      rootIndex: result.rootIndices[0],
      addressMerkleTreePubkeyIndex,
      addressQueuePubkeyIndex,
    };
    const packedAddreesMerkleContextBytes = serialize(
      {
        struct: {
          addressMerkleTreePubkeyIndex: "u8",
          addressQueuePubkeyIndex: "u8",
          rootIndex: "u16",
        },
      },
      packedAddreesMerkleContext,
      true
    );

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
    const message = pipe(
      createTransactionMessage({ version: "legacy" }),
      (m) => setTransactionMessageFeePayerSigner(signer, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
      (m) => {
        const ix = getDelegateInstruction({
          payer: signer,
          counter: counterPda,
          validator: VALIDATOR,
          compressedDelegationProgram: COMPRESSED_DELEGATION_PROGRAM_ADDRESS,
          compressedDelegationCpiSigner: COMPRESSED_DELEGATION_CPI_SIGNER,
          validityProofBytes: validityProofBytes,
          addressTreeInfoBytes: packedAddreesMerkleContextBytes,
          outputStateTreeIndex: addressQueuePubkeyIndex,
        });
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
        return appendTransactionMessageInstruction(ix, m);
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
    console.log(signedTransaction.signatures);
    console.log(
      await rpc
        .getTransaction(
          getBase58Decoder().decode(
            signedTransaction.signatures[payer.address as Address]!
          ) as Signature
        )
        .send()
    );
  }, [payer, counterPda, signer]);

  return {
    createCounter,
    incrementCounter,
    delegateCounter,
  };
}
