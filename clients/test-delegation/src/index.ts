import { address } from '@solana/kit';

export * from './generated';

// Re-export the program address for convenience
export { TEST_DELEGATION_PROGRAM_ADDRESS } from './generated/programs';

export const TEST_DELEGATION_CPI_SIGNER = address(
  'DwBhQtt9kJj9EAmuXoZ12THBe1d3pYujU5uSyMrRS87P'
);
