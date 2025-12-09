import { Button } from "@radix-ui/themes";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCallback, useState } from "react";
import { useTestDelegation } from "../hooks/useTestDelegation";
import { useRpc } from "../hooks/useRpc";

type CreateCounterButtonProps = Readonly<{
  payer: UiWalletAccount;
}>;

export function CreateCounterButton({ payer }: CreateCounterButtonProps) {
  const [isCreatingCounter, setIsCreatingCounter] = useState(false);
  const { rpc, rpcSubscriptions } = useRpc();
  const { createCounter } = useTestDelegation({ payer, rpc, rpcSubscriptions });

  const handleCreateCounter = useCallback(async () => {
    setIsCreatingCounter(true);
    try {
      const signature = await createCounter();
      console.log(signature);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingCounter(false);
    }
  }, [createCounter]);

  return (
    <Button 
      onClick={handleCreateCounter} 
      loading={isCreatingCounter}
      size="3"
      style={{
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        fontSize: '1rem',
        padding: '1rem 2rem',
        fontWeight: 700,
      }}
    >
      Create Counter
    </Button>
  );
}
