import { useCallback, useEffect, useState } from "react";
import { useRpc } from "./useRpc";
import { useCounterPda } from "./useCounterPda";
import { Counter, getCounterDecoder } from "test-delegation";
import { Address, getBase58Encoder } from "@solana/kit";
import { COMPRESSED_DELEGATION_PROGRAM_ADDRESS } from "compressed-delegation-program";

export function useCounter() {
  const { rpc, rpcSubscriptions, rpcEphemeral, rpcSubscriptionsEphemeral } =
    useRpc();
  const counterPda = useCounterPda();
  const [counterMainnet, setCounterMainnet] = useState<Counter | undefined>();
  const [counterEphemeral, setCounterEphemeral] = useState<
    Counter | undefined
  >();
  const [mainnetOwner, setMainnetOwner] = useState<Address | undefined>();
  const [ephemeralOwner, setEphemeralOwner] = useState<Address | undefined>();

  const fetchCounter = useCallback(async () => {
    if (!counterPda) {
      console.log("no counterPda");
      return;
    }
    console.log("fetchCounter", counterPda);
    let accountInfo = await rpc
      .getAccountInfo(counterPda, {
        commitment: "confirmed",
      })
      .send();
    if (accountInfo.value) {
      console.log(
        "counter",
        accountInfo.value,
        accountInfo.value.owner === COMPRESSED_DELEGATION_PROGRAM_ADDRESS
      );
      setMainnetOwner(accountInfo.value.owner);
      if (accountInfo.value.owner === COMPRESSED_DELEGATION_PROGRAM_ADDRESS) {
        accountInfo = await rpcEphemeral
          .getAccountInfo(counterPda, {
            commitment: "confirmed",
          })
          .send();
        console.log("counter ephemeral", accountInfo.value);
        if (accountInfo.value) {
          setEphemeralOwner(accountInfo.value.owner);
          const str =
            typeof accountInfo.value.data === "string"
              ? accountInfo.value.data
              : accountInfo.value.data[0];
          setCounterEphemeral(
            getCounterDecoder().decode(getBase58Encoder().encode(str))
          );
        }
      } else {
        const str = getBase58Encoder().encode(accountInfo.value.data);
        setCounterMainnet(getCounterDecoder().decode(str));
      }
    }
  }, [counterPda]);

  useEffect(() => {
    fetchCounter();
  }, [fetchCounter]);

  useEffect(() => {
    const abortController = new AbortController();

    async function subscribeToCounter() {
      if (!counterPda) {
        return;
      }

      let subscription = await rpcSubscriptions
        .accountNotifications(counterPda)
        .subscribe({ abortSignal: abortController.signal });
      for await (const accountInfo of subscription) {
        console.log("mainnet subscription", accountInfo);
        setMainnetOwner(accountInfo.value.owner);
        if (accountInfo.value?.data) {
          const str = getBase58Encoder().encode(accountInfo.value.data);
          console.log(str);
          setCounterMainnet(getCounterDecoder().decode(str));
        } else if (
          accountInfo.value?.owner === COMPRESSED_DELEGATION_PROGRAM_ADDRESS
        ) {
        }
      }
    }

    subscribeToCounter();

    return () => {
      abortController.abort();
    };
  }, [counterPda]);

  useEffect(() => {
    const abortController = new AbortController();

    async function subscribeToCounter() {
      if (!counterPda) {
        return;
      }

      let subscription = await rpcSubscriptionsEphemeral
        .accountNotifications(counterPda)
        .subscribe({ abortSignal: abortController.signal });
      for await (const accountInfo of subscription) {
        console.log("ephem notification", accountInfo);
        setEphemeralOwner(accountInfo.value.owner);
        if (accountInfo.value?.data) {
          const str =
            typeof accountInfo.value.data === "string"
              ? accountInfo.value.data
              : accountInfo.value.data[0];
          setCounterEphemeral(
            getCounterDecoder().decode(getBase58Encoder().encode(str))
          );
        }
      }
    }

    subscribeToCounter();

    return () => {
      abortController.abort();
    };
  }, [counterPda]);

  return {
    counterMainnet,
    counterEphemeral,
    mainnetOwner,
    ephemeralOwner,
    fetchCounter,
  };
}
