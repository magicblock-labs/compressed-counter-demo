import { useMemo, useState } from "react";

import { CommitmentContext } from "./CommitmentContext";

export function CommitmentContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [commitmentSignature, setCommitmentSignature] = useState<
    string | null | undefined
  >();
  const contextValue = useMemo<CommitmentContext>(() => {
    return {
      commitmentSignature,
      setCommitmentSignature,
    };
  }, [commitmentSignature]);
  console.log("commitmentSignature", commitmentSignature);

  return (
    <CommitmentContext.Provider
      value={useMemo(
        () => ({
          ...contextValue,
          setCommitmentSignature,
        }),
        [contextValue]
      )}
    >
      {children}
    </CommitmentContext.Provider>
  );
}
