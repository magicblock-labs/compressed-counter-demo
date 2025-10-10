import { useEffect, useState } from "react";
import { useRpc } from "./useRpc";
import { useCounterPda } from "./useCounterPda";
import {
  Counter,
  getCounterDecoder,
  TEST_DELEGATION_PROGRAM_ADDRESS,
} from "test-delegation";
import { getBase58Encoder } from "@solana/kit";
import { COMPRESSED_DELEGATION_PROGRAM_ADDRESS } from "compressed-delegation-program";

export function useCounter() {
  const { rpc, rpcSubscriptions, rpcEphemeral, rpcSubscriptionsEphemeral } =
    useRpc();
  const counterPda = useCounterPda();
  const [counterMainnet, setCounterMainnet] = useState<Counter | undefined>();
  const [counterEphemeral, setCounterEphemeral] = useState<
    Counter | undefined
  >();
  const [isDelegated, setIsDelegated] = useState(false);

  useEffect(() => {
    async function fetchCounter() {
      if (!counterPda) {
        return;
      }
      let accountInfo = await rpc
        .getAccountInfo(counterPda, {
          commitment: "confirmed",
        })
        .send();
      if (accountInfo.value) {
        console.log("counter", accountInfo.value);
        if (accountInfo.value.owner === TEST_DELEGATION_PROGRAM_ADDRESS) {
          setIsDelegated(false);
          const str = getBase58Encoder().encode(accountInfo.value.data);
          console.log(str);
          setCounterMainnet(getCounterDecoder().decode(str));
        } else {
          setIsDelegated(true);
          accountInfo = await rpcEphemeral
            .getAccountInfo(counterPda, {
              commitment: "confirmed",
            })
            .send();
          if (accountInfo.value) {
            console.log("counter ephemeral", accountInfo.value);
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
    }
    fetchCounter();
  }, [counterPda]);

  useEffect(() => {
    const abortController = new AbortController();

    async function subscribeToCounter() {
      if (!counterPda) {
        return;
      }

      let subscription = await rpcSubscriptions
        .accountNotifications(counterPda)
        .subscribe({ abortSignal: abortController.signal });
      console.log(subscription);
      for await (const accountInfo of subscription) {
        console.log("mainnet accountInfo", accountInfo);
        if (accountInfo.value?.data) {
          const str = getBase58Encoder().encode(accountInfo.value.data);
          console.log(str);
          setCounterMainnet(getCounterDecoder().decode(str));
          setIsDelegated(false);
        } else if (
          accountInfo.value?.owner === COMPRESSED_DELEGATION_PROGRAM_ADDRESS
        ) {
          setIsDelegated(true);
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
      console.log(subscription);
      for await (const accountInfo of subscription) {
        console.log("ephem subscription", accountInfo);
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

  return { counterMainnet, counterEphemeral, isDelegated };
}
