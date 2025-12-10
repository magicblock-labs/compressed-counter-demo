import { useEffect, useState } from "react";
import { useRpc } from "./useRpc";
import { Address } from "@solana/kit";

export function useValidatorId() {
  const { rpcEphemeral } = useRpc();
  const [validatorId, setValidatorId] = useState<Address | undefined>();
  useEffect(() => {
    async function fetchValidatorId() {
      const result = await rpcEphemeral.getIdentity().send();
      setValidatorId(result.identity);
    }
    fetchValidatorId();
  }, [rpcEphemeral]);
  return validatorId;
}
