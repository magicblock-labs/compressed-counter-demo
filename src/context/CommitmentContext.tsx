import { createContext } from "react";

export type CommitmentContext = Readonly<{
  commitmentSignature?: string | null;
  setCommitmentSignature: (signature: string | null | undefined) => void;
}>;

export const DEFAULT_COMMITMENT_CONFIG = Object.freeze({
  setCommitmentSignature: () => {},
});

export const CommitmentContext = createContext<CommitmentContext>(
  DEFAULT_COMMITMENT_CONFIG
);
