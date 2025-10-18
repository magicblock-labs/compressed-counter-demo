import { Button } from "@radix-ui/themes";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCallback, useState } from "react";
import { useTestDelegation } from "../hooks/useTestDelegation";
import { useRpc } from "../hooks/useRpc";

type ScheduleUndelegateButtonProps = Readonly<{
  payer: UiWalletAccount;
  disabled: boolean;
}>;

export function ScheduleUndelegateButton({
  payer,
  disabled,
}: ScheduleUndelegateButtonProps) {
  const [isDelegating, setIsDelegating] = useState(false);
  const { rpcEphemeral, rpcSubscriptionsEphemeral } = useRpc();
  const { scheduleUndelegateCounter } = useTestDelegation({
    payer,
    rpc: rpcEphemeral,
    rpcSubscriptions: rpcSubscriptionsEphemeral,
  });

  const handleScheduleUndelegateCounter = useCallback(async () => {
    setIsDelegating(true);
    try {
      const signature = await scheduleUndelegateCounter();
      console.log(signature);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDelegating(false);
    }
  }, [scheduleUndelegateCounter]);

  return (
    <Button
      onClick={handleScheduleUndelegateCounter}
      loading={isDelegating}
      disabled={disabled}
      style={{ height: "40px" }}
    >
      Schedule Undelegate Counter
    </Button>
  );
}
