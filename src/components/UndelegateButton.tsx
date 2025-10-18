import { Button } from "@radix-ui/themes";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCallback, useState } from "react";
import { useRpc } from "../hooks/useRpc";
import { useCompressedDelegation } from "../hooks/useCompressedDelegation";

type UndelegateButtonProps = Readonly<{
  payer: UiWalletAccount;
  disabled: boolean;
}>;

export function UndelegateButton({ payer, disabled }: UndelegateButtonProps) {
  const [isDelegating, setIsDelegating] = useState(false);
  const { rpc, rpcSubscriptions } = useRpc();
  const { undelegateAccount } = useCompressedDelegation({
    payer,
    rpc,
    rpcSubscriptions,
  });

  const handleUndelegateCounter = useCallback(async () => {
    setIsDelegating(true);
    try {
      const signature = await undelegateAccount();
      console.log(signature);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDelegating(false);
    }
  }, [undelegateAccount]);

  return (
    <Button
      onClick={handleUndelegateCounter}
      loading={isDelegating}
      disabled={disabled}
    >
      Undelegate Counter
    </Button>
  );
}
