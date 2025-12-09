import {
  Decoder,
  getArrayDecoder,
  getArrayEncoder,
  getBooleanDecoder,
  getBooleanEncoder,
  getOptionDecoder,
  getStructDecoder,
  getStructEncoder,
  getU16Decoder,
  getU16Encoder,
  getU32Decoder,
  getU32Encoder,
  getU64Decoder,
  getU64Encoder,
  getU8Decoder,
  getU8Encoder,
  OptionOrNullable,
  type Encoder,
} from '@solana/kit';
import { getOptionEncoder } from '@solana/kit';

import { ValidityProof as LightProtocolValidityProof } from '@lightprotocol/stateless.js';

export type ValidityProof = OptionOrNullable<LightProtocolValidityProof>;
export type ValidityProofArgs = OptionOrNullable<LightProtocolValidityProof>;

export function getValidityProofEncoder(): Encoder<ValidityProofArgs> {
  return getOptionEncoder(
    getStructEncoder([
      ['a', getArrayEncoder(getU8Encoder(), { size: 32 })],
      ['b', getArrayEncoder(getU8Encoder(), { size: 64 })],
      ['c', getArrayEncoder(getU8Encoder(), { size: 32 })],
    ])
  );
}

export function getValidityProofDecoder(): Decoder<ValidityProof> {
  return getOptionDecoder(
    getStructDecoder([
      ['a', getArrayDecoder(getU8Decoder(), { size: 32 })],
      ['b', getArrayDecoder(getU8Decoder(), { size: 64 })],
      ['c', getArrayDecoder(getU8Decoder(), { size: 32 })],
    ])
  );
}

export type CompressedAccountMeta = {
  treeInfo: PackedStateTreeInfo;
  address: number[];
  outputStateTreeIndex: number;
};
export type CompressedAccountMetaArgs = {
  treeInfo: PackedStateTreeInfo;
  address: number[];
  outputStateTreeIndex: number;
};

export function getCompressedAccountMetaEncoder(): Encoder<CompressedAccountMeta> {
  return getStructEncoder([
    ['treeInfo', getPackedStateTreeInfoEncoder()],
    ['address', getArrayEncoder(getU8Encoder(), { size: 32 })],
    ['outputStateTreeIndex', getU8Encoder()],
  ]);
}

export function getCompressedAccountMetaDecoder(): Decoder<CompressedAccountMeta> {
  return getStructDecoder([
    ['treeInfo', getPackedStateTreeInfoDecoder()],
    ['address', getArrayDecoder(getU8Decoder(), { size: 32 })],
    ['outputStateTreeIndex', getU8Decoder()],
  ]);
}

export type PackedStateTreeInfo = {
  rootIndex: number;
  proveByIndex: boolean;
  merkleTreePubkeyIndex: number;
  queuePubkeyIndex: number;
  leafIndex: number;
};
export type PackedStateTreeInfoArgs = {
  rootIndex: number;
  proveByIndex: boolean;
  merkleTreePubkeyIndex: number;
  queuePubkeyIndex: number;
  leafIndex: number;
};

export function getPackedStateTreeInfoEncoder(): Encoder<PackedStateTreeInfo> {
  return getStructEncoder([
    ['rootIndex', getU16Encoder()],
    ['proveByIndex', getBooleanEncoder()],
    ['merkleTreePubkeyIndex', getU8Encoder()],
    ['queuePubkeyIndex', getU8Encoder()],
    ['leafIndex', getU32Encoder()],
  ]);
}

export function getPackedStateTreeInfoDecoder(): Decoder<PackedStateTreeInfo> {
  return getStructDecoder([
    ['rootIndex', getU16Decoder()],
    ['proveByIndex', getBooleanDecoder()],
    ['merkleTreePubkeyIndex', getU8Decoder()],
    ['queuePubkeyIndex', getU8Decoder()],
    ['leafIndex', getU32Decoder()],
  ]);
}

export type PackedAddressTreeInfo = {
  addressMerkleTreePubkeyIndex: number;
  addressQueuePubkeyIndex: number;
  rootIndex: number;
};
export type PackedAddressTreeInfoArgs = {
  addressMerkleTreePubkeyIndex: number;
  addressQueuePubkeyIndex: number;
  rootIndex: number;
};

export function getPackedAddressTreeInfoEncoder(): Encoder<PackedAddressTreeInfo> {
  return getStructEncoder([
    ['addressMerkleTreePubkeyIndex', getU8Encoder()],
    ['addressQueuePubkeyIndex', getU8Encoder()],
    ['rootIndex', getU16Encoder()],
  ]);
}

export function getPackedAddressTreeInfoDecoder(): Decoder<PackedAddressTreeInfo> {
  return getStructDecoder([
    ['addressMerkleTreePubkeyIndex', getU8Decoder()],
    ['addressQueuePubkeyIndex', getU8Decoder()],
    ['rootIndex', getU16Decoder()],
  ]);
}

export type OptionalPackedStateTreeInfo = OptionOrNullable<PackedStateTreeInfo>;
export type OptionalPackedStateTreeInfoArgs =
  OptionOrNullable<PackedStateTreeInfoArgs>;

export function getOptionalPackedStateTreeInfoEncoder(): Encoder<OptionalPackedStateTreeInfo> {
  return getOptionEncoder(getPackedStateTreeInfoEncoder());
}

export function getOptionalPackedStateTreeInfoDecoder(): Decoder<OptionalPackedStateTreeInfo> {
  return getOptionDecoder(getPackedStateTreeInfoDecoder());
}

export type OptionalPackedAddressTreeInfo =
  OptionOrNullable<PackedAddressTreeInfo>;
export type OptionalPackedAddressTreeInfoArgs =
  OptionOrNullable<PackedAddressTreeInfoArgs>;

export function getOptionalPackedAddressTreeInfoEncoder(): Encoder<OptionalPackedAddressTreeInfo> {
  return getOptionEncoder(getPackedAddressTreeInfoEncoder());
}

export function getOptionalPackedAddressTreeInfoDecoder(): Decoder<OptionalPackedAddressTreeInfo> {
  return getOptionDecoder(getPackedAddressTreeInfoDecoder());
}

export type OptionalCompressedAccountMeta =
  OptionOrNullable<CompressedAccountMeta>;
export type OptionalCompressedAccountMetaArgs =
  OptionOrNullable<CompressedAccountMeta>;

export function getOptionalCompressedAccountMetaEncoder(): Encoder<OptionalCompressedAccountMeta> {
  return getOptionEncoder(getCompressedAccountMetaEncoder());
}

export function getOptionalCompressedAccountMetaDecoder(): Decoder<OptionalCompressedAccountMeta> {
  return getOptionDecoder(getCompressedAccountMetaDecoder());
}

export type CompressedDelegationRecord = {
  address: number[];
  data: number[];
};
export type CompressedDelegationRecordArgs = {
  address: number[];
  data: number[];
};

export function getCompressedDelegationRecordEncoder(): Encoder<CompressedDelegationRecordArgs> {
  return getStructEncoder([
    ['address', getArrayEncoder(getU8Encoder(), { size: 32 })],
    ['data', getArrayEncoder(getU8Encoder())],
  ]);
}

export function getCompressedDelegationRecordDecoder(): Decoder<CompressedDelegationRecord> {
  return getStructDecoder([
    ['address', getArrayDecoder(getU8Decoder(), { size: 32 })],
    ['data', getArrayDecoder(getU8Decoder())],
  ]);
}

export type ExternalUndelegateArgs = {
  validityProof: ValidityProof;
  counterAccountMeta: CompressedAccountMeta;
  delegationRecordAccountMeta: CompressedAccountMeta;
  compressedDelegationRecord: CompressedDelegationRecord;
};
export type ExternalUndelegateArgsArgs = {
  validityProof: ValidityProofArgs;
  counterAccountMeta: CompressedAccountMetaArgs;
  delegationRecordAccountMeta: CompressedAccountMetaArgs;
  compressedDelegationRecord: CompressedDelegationRecordArgs;
};

export function getExternalUndelegateArgsEncoder(): Encoder<ExternalUndelegateArgs> {
  return getStructEncoder([
    ['validityProof', getValidityProofEncoder()],
    ['counterAccountMeta', getCompressedAccountMetaEncoder()],
    ['delegationRecordAccountMeta', getCompressedAccountMetaEncoder()],
    ['compressedDelegationRecord', getCompressedDelegationRecordEncoder()],
  ]);
}

export function getExternalUndelegateArgsDecoder(): Decoder<ExternalUndelegateArgs> {
  return getStructDecoder([
    ['validityProof', getValidityProofDecoder()],
    ['counterAccountMeta', getCompressedAccountMetaDecoder()],
    ['delegationRecordAccountMeta', getCompressedAccountMetaDecoder()],
    ['compressedDelegationRecord', getCompressedDelegationRecordDecoder()],
  ]);
}

export type InAccount = {
  discriminator: number[];
  dataHash: number[];
  merkleContext: PackedMerkleContext;
  rootIndex: number;
  lamports: number | bigint;
  address: OptionOrNullable<number[]>;
};
export type InAccountArgs = {
  discriminator: number[];
  dataHash: number[];
  merkleContext: PackedMerkleContextArgs;
  rootIndex: number;
  lamports: number | bigint;
  address: OptionOrNullable<number[]>;
};

export function getInAccountEncoder(): Encoder<InAccount> {
  return getStructEncoder([
    ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
    ['dataHash', getArrayEncoder(getU8Encoder(), { size: 32 })],
    ['merkleContext', getPackedMerkleContextEncoder()],
    ['rootIndex', getU16Encoder()],
    ['lamports', getU64Encoder()],
    [
      'address',
      getOptionEncoder(getArrayEncoder(getU8Encoder(), { size: 32 })),
    ],
  ]);
}

export function getInAccountDecoder(): Decoder<InAccount> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['dataHash', getArrayDecoder(getU8Decoder(), { size: 32 })],
    ['merkleContext', getPackedMerkleContextDecoder()],
    ['rootIndex', getU16Decoder()],
    ['lamports', getU64Decoder()],
    [
      'address',
      getOptionDecoder(getArrayDecoder(getU8Decoder(), { size: 32 })),
    ],
  ]);
}

export type PackedMerkleContext = {
  merkleTreePubkeyIndex: number;
  queuePubkeyIndex: number;
  leafIndex: number;
  proveByIndex: boolean;
};
export type PackedMerkleContextArgs = {
  merkleTreePubkeyIndex: number;
  queuePubkeyIndex: number;
  leafIndex: number;
  proveByIndex: boolean;
};

export function getPackedMerkleContextEncoder(): Encoder<PackedMerkleContextArgs> {
  return getStructEncoder([
    ['merkleTreePubkeyIndex', getU8Encoder()],
    ['queuePubkeyIndex', getU8Encoder()],
    ['leafIndex', getU32Encoder()],
    ['proveByIndex', getBooleanEncoder()],
  ]);
}

export function getPackedMerkleContextDecoder(): Decoder<PackedMerkleContext> {
  return getStructDecoder([
    ['merkleTreePubkeyIndex', getU8Decoder()],
    ['queuePubkeyIndex', getU8Decoder()],
    ['leafIndex', getU32Decoder()],
    ['proveByIndex', getBooleanDecoder()],
  ]);
}

export type OutputCompressedAccountWithPackedContext = {
  compressedAccount: CompressedAccount;
  merkleTreeIndex: number;
};
export type OutputCompressedAccountWithPackedContextArgs = {
  compressedAccount: CompressedAccountArgs;
  merkleTreeIndex: number;
};

export function getOutputCompressedAccountWithPackedContextEncoder(): Encoder<OutputCompressedAccountWithPackedContextArgs> {
  return getStructEncoder([
    ['compressedAccount', getCompressedAccountEncoder()],
    ['merkleTreeIndex', getU8Encoder()],
  ]);
}

export function getOutputCompressedAccountWithPackedContextDecoder(): Decoder<OutputCompressedAccountWithPackedContext> {
  return getStructDecoder([
    ['compressedAccount', getCompressedAccountDecoder()],
    ['merkleTreeIndex', getU8Decoder()],
  ]);
}

export type CompressedAccount = {
  owner: number[];
  lamports: number | bigint;
  address: OptionOrNullable<number[]>;
  data: OptionOrNullable<CompressedAccountData>;
};
export type CompressedAccountArgs = {
  owner: number[];
  lamports: number | bigint;
  address: OptionOrNullable<number[]>;
  data: OptionOrNullable<CompressedAccountDataArgs>;
};

export function getCompressedAccountEncoder(): Encoder<CompressedAccount> {
  return getStructEncoder([
    ['owner', getArrayEncoder(getU8Encoder(), { size: 32 })],
    ['lamports', getU64Encoder()],
    [
      'address',
      getOptionEncoder(getArrayEncoder(getU8Encoder(), { size: 32 })),
    ],
    ['data', getOptionEncoder(getCompressedAccountDataEncoder())],
  ]);
}

export function getCompressedAccountDecoder(): Decoder<CompressedAccount> {
  return getStructDecoder([
    ['owner', getArrayDecoder(getU8Decoder(), { size: 32 })],
    ['lamports', getU64Decoder()],
    [
      'address',
      getOptionDecoder(getArrayDecoder(getU8Decoder(), { size: 32 })),
    ],
    ['data', getOptionDecoder(getCompressedAccountDataDecoder())],
  ]);
}

export type CompressedAccountData = {
  discriminator: number[];
  data: number[];
  dataHash: number[];
};
export type CompressedAccountDataArgs = {
  discriminator: number[];
  data: number[];
  dataHash: number[];
};

export function getCompressedAccountDataEncoder(): Encoder<CompressedAccountDataArgs> {
  return getStructEncoder([
    ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
    ['data', getArrayEncoder(getU8Encoder())],
    ['dataHash', getArrayEncoder(getU8Encoder(), { size: 32 })],
  ]);
}

export function getCompressedAccountDataDecoder(): Decoder<CompressedAccountData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['data', getArrayDecoder(getU8Decoder())],
    ['dataHash', getArrayDecoder(getU8Decoder(), { size: 32 })],
  ]);
}
