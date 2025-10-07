import { Button } from "@radix-ui/themes";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCallback, useState } from "react";
import { useTestDelegation } from "../hooks/useTestDelegation";
import { useRpc } from "../hooks/useRpc";

type UndelegateButtonProps = Readonly<{
  payer: UiWalletAccount;
  disabled: boolean;
}>;

export function UndelegateButton({ payer, disabled }: UndelegateButtonProps) {
  const [isDelegating, setIsDelegating] = useState(false);
  const { rpc, rpcSubscriptions } = useRpc();
  const { undelegateCounter } = useTestDelegation({
    payer,
    rpc,
    rpcSubscriptions,
  });

  const handleUndelegateCounter = useCallback(async () => {
    setIsDelegating(true);
    try {
      const signature = await undelegateCounter();
      console.log(signature);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDelegating(false);
    }
  }, [undelegateCounter]);

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
