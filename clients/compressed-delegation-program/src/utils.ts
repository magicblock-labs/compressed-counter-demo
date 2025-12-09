import { serialize } from 'borsh';
import {
  CompressedAccountMeta,
  PackedAddressTreeInfo,
  ValidityProof,
} from '@lightprotocol/stateless.js';

export const CompressedProofSchema = {
  struct: {
    a: 'u32',
    b: 'u64',
    c: 'u32',
  },
};

export function serializeProof(validityProof: ValidityProof | null) {
  return serialize(
    {
      option: {
        struct: {
          a: { array: { type: 'u8', len: 32 } },
          b: { array: { type: 'u8', len: 64 } },
          c: { array: { type: 'u8', len: 32 } },
        },
      },
    },
    validityProof,
    true
  );
}

export function serializeAddressTreeInfo(
  packedAddressTreeInfo: PackedAddressTreeInfo
) {
  return serialize(
    {
      struct: {
        addressMerkleTreePubkeyIndex: 'u8',
        addressQueuePubkeyIndex: 'u8',
        rootIndex: 'u16',
      },
    },
    packedAddressTreeInfo,
    true
  );
}

export function serializeOptionalAddressTreeInfo(
  packedAddressTreeInfo: PackedAddressTreeInfo | null
) {
  return serialize(
    {
      option: {
        struct: {
          addressMerkleTreePubkeyIndex: 'u8',
          addressQueuePubkeyIndex: 'u8',
          rootIndex: 'u16',
        },
      },
    },
    packedAddressTreeInfo,
    true
  );
}

export function serializeAccountMeta(
  compressedAccountMeta: CompressedAccountMeta
) {
  return serialize(
    {
      struct: {
        treeInfo: {
          struct: {
            rootIndex: 'u16',
            proveByIndex: 'bool',
            merkleTreePubkeyIndex: 'u8',
            queuePubkeyIndex: 'u8',
            leafIndex: 'u32',
          },
        },
        address: {
          array: { type: 'u8', len: 32 },
        },
        outputStateTreeIndex: 'u8',
      },
    },
    compressedAccountMeta,
    true
  );
}

export function serializeOptionalAccountMeta(
  compressedAccountMeta: CompressedAccountMeta
) {
  return serialize(
    {
      option: {
        struct: {
          treeInfo: {
            struct: {
              rootIndex: 'u16',
              proveByIndex: 'bool',
              merkleTreePubkeyIndex: 'u8',
              queuePubkeyIndex: 'u8',
              leafIndex: 'u32',
            },
          },
          address: {
            array: { type: 'u8', len: 32 },
          },
          outputStateTreeIndex: 'u8',
        },
      },
    },
    compressedAccountMeta,
    true
  );
}
