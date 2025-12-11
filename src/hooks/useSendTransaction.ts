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
  getSignatureFromTransaction,
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
      // Display toast with first signature
      const sig = getSignatureFromTransaction(tx);
      toast.success("Transaction sent", {
        description: sig.toString(),
      });

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

      return sig;
    },
    [sendAndConfirmTransaction]
  );

  return sendTransaction;
}
