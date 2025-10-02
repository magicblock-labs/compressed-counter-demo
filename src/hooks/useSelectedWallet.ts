import { useContext } from "react";
import { SelectedWalletAccountContext } from "../context/SelectedWalletAccountContext";

export function useSelectedWallet() {
  return useContext(SelectedWalletAccountContext);
}
