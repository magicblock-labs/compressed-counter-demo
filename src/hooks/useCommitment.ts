import { useContext } from "react";
import { CommitmentContext } from "../context/CommitmentContext";

export function useCommitment() {
  return useContext(CommitmentContext);
}
