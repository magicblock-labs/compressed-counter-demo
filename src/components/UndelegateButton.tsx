import { Button } from "@radix-ui/themes";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRpc } from "../hooks/useRpc";
import { useCompressedDelegation } from "../hooks/useCompressedDelegation";
import { useChain } from "../hooks/useChain";
import {
  extractTransactionSignature,
  buildSolanaExplorerUrl,
} from "../utils/transactionErrors";
import { getErrorMessage } from "../errors";
import { useCommitment } from "../hooks/useCommitment";

type UndelegateButtonProps = Readonly<{
  payer: UiWalletAccount;
  disabled: boolean;
}>;

export function UndelegateButton({ payer, disabled }: UndelegateButtonProps) {
  const [isUndelegating, setIsUndelegating] = useState(false);
  const { rpc, rpcSubscriptions } = useRpc();
  const { undelegateAccount } = useCompressedDelegation({
    payer,
    rpc,
    rpcSubscriptions,
  });
  const { solanaExplorerClusterName } = useChain();
  const { commitmentSignature, setCommitmentSignature } = useCommitment();
  const [isUndelegatable, setIsUndelegatable] = useState(false);

  const handleUndelegateCounter = useCallback(async () => {
    setIsUndelegating(true);
    try {
      await undelegateAccount();
      setCommitmentSignature(undefined);
    } catch (error) {
      console.error(error);
      const signature = extractTransactionSignature(error);
      const errorMessage = getErrorMessage(error, "Transaction failed");

      if (signature) {
        const explorerUrl = buildSolanaExplorerUrl(
          signature,
          solanaExplorerClusterName
        );
        toast.error("Transaction failed", {
          description: (
            <div>
              <div style={{ marginBottom: "8px" }}>{errorMessage}</div>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#3b82f6",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                View on Solana Explorer
              </a>
            </div>
          ),
          duration: 10000,
        });
      } else {
        toast.error("Transaction failed", {
          description: errorMessage,
          duration: 5000,
        });
      }
    } finally {
      setIsUndelegating(false);
    }
  }, [undelegateAccount, solanaExplorerClusterName]);

  useEffect(() => {
    if (commitmentSignature || commitmentSignature === undefined) {
      setIsUndelegatable(true);
    } else {
      setIsUndelegatable(false);
    }
  }, [commitmentSignature]);

  return (
    <Button
      onClick={handleUndelegateCounter}
      loading={isUndelegating}
      disabled={disabled || !isUndelegatable}
    >
      Undelegate Counter
    </Button>
  );
}
