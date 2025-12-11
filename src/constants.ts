import { address } from "@solana/kit";
import { PublicKey } from "@solana/web3.js";

export const DEVNET_PORT = 7799;
export const EPHEMERAL_PORT = 8899;

export const BATCHED_MERKLE_TREE = new PublicKey(
  "bmt1LryLZUMmF7ZtqESaw7wifBXLfXHQYoE4GAmrahU"
);
export const OUTPUT_QUEUE = new PublicKey(
  "oq1na8gojfdUhsfCpyjNt6h4JaDWtHf1yQj4koBWfto"
);
export const DELEGATION_PROGRAM_ADDRESS = address(
  "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
);
export const MAGIC_CONTEXT = new PublicKey(
  "MagicContext1111111111111111111111111111111"
);
export const MAGIC_PROGRAM_ADDRESS = new PublicKey(
  "Magic11111111111111111111111111111111111111"
);
