import { Button } from "@radix-ui/themes";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCallback, useEffect, useState } from "react";
import { address, getProgramDerivedAddress } from "@solana/kit";
import { PublicKey } from "@solana/web3.js";

import { DELEGATION_PROGRAM_ADDRESS } from "../constants";
import { useRpc } from "../hooks/useRpc";
import { useDelegation } from "../hooks/useDelegation";

type FundEscrowButtonProps = Readonly<{
  payer: UiWalletAccount;
}>;

export function FundEscrowButton({ payer }: FundEscrowButtonProps) {
  const [isDelegating, setIsDelegating] = useState(false);
  const { rpc, rpcSubscriptions } = useRpc();
  const { fundEphemeralBalance } = useDelegation({
    payer,
    rpc,
    rpcSubscriptions,
  });
  const [isDelegated, setIsDelegated] = useState(false);

  useEffect(() => {
    async function getBalancePda() {
      let [balancePda, _balancePdaBump] = await getProgramDerivedAddress({
        programAddress: address(DELEGATION_PROGRAM_ADDRESS.toString()),
        seeds: [
          new TextEncoder().encode("balance"),
          new PublicKey(payer.address).toBuffer(),
          Uint8Array.from([0]),
        ],
      });

      const accountInfo = await rpc
        .getAccountInfo(address(balancePda.toString()))
        .send();
      if (accountInfo.value?.owner === DELEGATION_PROGRAM_ADDRESS.toString()) {
        setIsDelegated(true);
      } else {
        setIsDelegated(false);
      }

      let subscription = await rpcSubscriptions
        .accountNotifications(address(balancePda.toString()))
        .subscribe({ abortSignal: new AbortController().signal });
      console.log(subscription);
      for await (const accountInfo of subscription) {
        if (
          accountInfo.value?.owner === DELEGATION_PROGRAM_ADDRESS.toString()
        ) {
          setIsDelegated(true);
        } else {
          setIsDelegated(false);
        }
      }
    }

    getBalancePda();
  }, [rpc, rpcSubscriptions]);

  const handleFundEscrow = useCallback(async () => {
    setIsDelegating(true);
    try {
      const signature = await fundEphemeralBalance();
      console.log(signature);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDelegating(false);
    }
  }, [fundEphemeralBalance]);

  return (
    <Button
      onClick={handleFundEscrow}
      loading={isDelegating}
      disabled={isDelegated}
    >
      Fund Escrow
    </Button>
  );
}
