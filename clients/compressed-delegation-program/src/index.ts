import { address } from '@solana/kit';

export * from './generated';
export * from './utils';

// Re-export the program address for convenience
export { COMPRESSED_DELEGATION_PROGRAM_ADDRESS } from './generated/programs';

export const COMPRESSED_DELEGATION_CPI_SIGNER = address(
  '4Vk23DJV4JGkAs98yKLk3dTozpB3Dv323NeamH5BTz6u'
);
