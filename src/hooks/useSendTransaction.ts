import {
  sendAndConfirmTransactionFactory,
  SolanaRpcSubscriptionsApi,
  SolanaRpcApiMainnet,
  Rpc,
  RpcSubscriptions,
  FullySignedTransaction,
  TransactionFromTransactionMessage,
  BaseTransactionMessage,
  TransactionMessageWithFeePayer,
  TransactionMessageWithSigners,
  TransactionWithBlockhashLifetime,
  getBase58Decoder,
} from "@solana/kit";
import { useCallback } from "react";
import { toast } from "sonner";

type UseSendTransactionProps = Readonly<{
  rpc: Rpc<SolanaRpcApiMainnet>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}>;

export function useSendTransaction({
  rpc,
  rpcSubscriptions,
}: UseSendTransactionProps) {
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });

  const sendTransaction = useCallback(
    async (
      tx: FullySignedTransaction &
        TransactionFromTransactionMessage<
          BaseTransactionMessage &
            TransactionMessageWithFeePayer &
            TransactionMessageWithSigners &
            TransactionWithBlockhashLifetime
        >
    ) => {
      console.log(tx);
      // Display toast with first signature
      const signatureValues = Object.values(tx.signatures).filter(
        (sig) => sig !== null
      );
      if (signatureValues.length > 0) {
        const firstSignature = signatureValues[0];
        if (firstSignature !== null) {
          const signatureBase58 = getBase58Decoder().decode(
            firstSignature as Uint8Array
          );
          toast.success("Transaction sent", {
            description: signatureBase58,
          });
        }
      }

      await sendAndConfirmTransaction(
        {
          ...tx,
          "__transactionSignedness:@solana/kit": "fullySigned",
          "__transactionSize:@solana/kit": "withinLimit",
          lifetimeConstraint: tx.lifetimeConstraint,
        },
        {
          commitment: "confirmed",
          skipPreflight: true,
        }
      );
    },
    [sendAndConfirmTransaction]
  );

  return sendTransaction;
}
