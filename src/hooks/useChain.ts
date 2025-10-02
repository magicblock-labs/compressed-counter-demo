import { useContext } from "react";
import { ChainContext } from "../context/ChainContext";

export function useChain() {
  return useContext(ChainContext);
}
