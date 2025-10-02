import { useEffect, useState } from "react";
import { useRpc } from "./useRpc";
import { useCounterPda } from "./useCounterPda";
import {
  Counter,
  getCounterDecoder,
  TEST_DELEGATION_PROGRAM_ADDRESS,
} from "test-delegation";
import { getBase58Encoder } from "@solana/kit";

export function useCounter() {
  const { rpc, rpcSubscriptions, rpcEphemeral, rpcSubscriptionsEphemeral } =
    useRpc();
  const counterPda = useCounterPda();
  const [counterMainnet, setCounterMainnet] = useState<Counter | undefined>();
  const [counterEphemeral, setCounterEphemeral] = useState<
    Counter | undefined
  >();

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
      if (accountInfo.value?.data) {
        console.log(accountInfo.value.data);
        if (accountInfo.value.owner === TEST_DELEGATION_PROGRAM_ADDRESS) {
          const str = getBase58Encoder().encode(accountInfo.value.data);
          console.log(str);
          setCounterMainnet(getCounterDecoder().decode(str));
        } else {
          accountInfo = await rpcEphemeral
            .getAccountInfo(counterPda, {
              commitment: "confirmed",
            })
            .send();
          if (accountInfo.value?.data) {
            const str = getBase58Encoder().encode(accountInfo.value.data);
            console.log(str);
            setCounterEphemeral(getCounterDecoder().decode(str));
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
        console.log("accountInfo", accountInfo);
        if (accountInfo.value?.data) {
          const str = getBase58Encoder().encode(accountInfo.value.data);
          console.log(str);
          setCounterMainnet(getCounterDecoder().decode(str));
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
        console.log("accountInfo subscription", accountInfo);
        if (accountInfo.value?.data) {
          const str = getBase58Encoder().encode(accountInfo.value.data);
          console.log(str);
          setCounterEphemeral(getCounterDecoder().decode(str));
        }
      }
    }

    subscribeToCounter();

    return () => {
      abortController.abort();
    };
  }, [counterPda]);

  return { counterMainnet, counterEphemeral };
}
