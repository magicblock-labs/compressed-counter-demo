import { useContext } from "react";
import { RpcContext } from "../context/RpcContext";

export function useRpc() {
  return useContext(RpcContext);
}
