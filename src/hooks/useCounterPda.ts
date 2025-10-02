import { Address, getProgramDerivedAddress } from "@solana/kit";
import { useEffect, useState } from "react";
import { TEST_DELEGATION_PROGRAM_ADDRESS } from "test-delegation";

export function useCounterPda() {
  const [counterPda, setCounterPda] = useState<Address>();

  useEffect(() => {
    async function fetchCounterPda() {
      const pda = await getProgramDerivedAddress({
        programAddress: TEST_DELEGATION_PROGRAM_ADDRESS,
        seeds: [new TextEncoder().encode("counter")],
      });
      setCounterPda(pda[0]);
    }
    fetchCounterPda();
  }, []);

  return counterPda;
}
