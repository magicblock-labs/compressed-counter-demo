import { useEffect, useState } from "react";
import { useRpc } from "./useRpc";
import { useCounterPda } from "./useCounterPda";
import {
  Counter,
  getCounterDecoder,
  TEST_DELEGATION_PROGRAM_ADDRESS,
} from "test-delegation";
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
          setMainnetOwner(TEST_DELEGATION_PROGRAM_ADDRESS);
          const str = getBase58Encoder().encode(accountInfo.value.data);
          console.log(str);
          setCounterMainnet(getCounterDecoder().decode(str));
        } else {
          setMainnetOwner(COMPRESSED_DELEGATION_PROGRAM_ADDRESS);
          accountInfo = await rpcEphemeral
            .getAccountInfo(counterPda, {
              commitment: "confirmed",
            })
            .send();
          if (accountInfo.value) {
            setEphemeralOwner(accountInfo.value.owner);
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
      console.log(subscription);
      for await (const accountInfo of subscription) {
        console.log("ephem subscription", accountInfo);
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

  return { counterMainnet, counterEphemeral, mainnetOwner, ephemeralOwner };
}
