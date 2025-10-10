import { Button } from "@radix-ui/themes";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCallback, useState } from "react";
import { useTestDelegation } from "../hooks/useTestDelegation";
import {
  Rpc,
  RpcSubscriptions,
  SolanaRpcApiMainnet,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";

type IncrementCounterButtonProps = Readonly<{
  payer: UiWalletAccount;
  rpc: Rpc<SolanaRpcApiMainnet>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  disabled?: boolean;
}>;

export function IncrementCounterButton({
  payer,
  rpc,
  rpcSubscriptions,
  disabled,
}: IncrementCounterButtonProps) {
  const [isIncrementingCounter, setIsIncrementingCounter] = useState(false);
  const { incrementCounter } = useTestDelegation({
    payer,
    rpc,
    rpcSubscriptions,
  });

  const handleIncrementCounter = useCallback(async () => {
    setIsIncrementingCounter(true);
    try {
      const signature = await incrementCounter();
      console.log(signature);
    } catch (error) {
      console.error(error);
    } finally {
      setIsIncrementingCounter(false);
    }
  }, [incrementCounter]);

  return (
    <Button
      onClick={handleIncrementCounter}
      loading={isIncrementingCounter}
      disabled={disabled}
    >
      Increment Counter
    </Button>
  );
}
