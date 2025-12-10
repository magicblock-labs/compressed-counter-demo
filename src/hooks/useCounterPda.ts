import { address, Address } from "@solana/kit";
import { useEffect, useState } from "react";
import { findCounterPda } from "test-delegation";
import { useSelectedWallet } from "./useSelectedWallet";

export function useCounterPda() {
  const [counterPda, setCounterPda] = useState<Address>();
  const [selectedWalletAccount] = useSelectedWallet();

  useEffect(() => {
    async function fetchCounterPda() {
      if (!selectedWalletAccount?.address) {
        return;
      }
      const [pda] = await findCounterPda({
        authority: address(selectedWalletAccount.address),
      });
      console.log("pda", pda);
      setCounterPda(pda);
    }
    fetchCounterPda();
  }, [selectedWalletAccount]);

  return counterPda;
}
