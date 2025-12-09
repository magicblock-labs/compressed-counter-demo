import { Button } from "@radix-ui/themes";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCallback, useState } from "react";
import { useTestDelegation } from "../hooks/useTestDelegation";
import { useRpc } from "../hooks/useRpc";

type DelegateButtonProps = Readonly<{
  payer: UiWalletAccount;
  disabled?: boolean;
}>;

export function DelegateButton({ payer, disabled }: DelegateButtonProps) {
  const [isDelegating, setIsDelegating] = useState(false);
  const { rpc, rpcSubscriptions } = useRpc();
  const { delegateCounter } = useTestDelegation({
    payer,
    rpc,
    rpcSubscriptions,
    ephemeral: false,
  });

  const handleDelegateCounter = useCallback(async () => {
    setIsDelegating(true);
    try {
      const signature = await delegateCounter();
      console.log(signature);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDelegating(false);
    }
  }, [delegateCounter]);

  return (
    <Button
      onClick={handleDelegateCounter}
      loading={isDelegating}
      disabled={disabled}
    >
      Delegate Counter
    </Button>
  );
}
