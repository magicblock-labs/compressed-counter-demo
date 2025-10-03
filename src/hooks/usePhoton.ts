import { LightSystemProgram } from "@lightprotocol/stateless.js";
import {
  createRpc,
  defaultStaticAccountsStruct,
} from "@lightprotocol/stateless.js";
import { AccountMeta, PublicKey } from "@solana/web3.js";
import { useMemo } from "react";

export const RPC_URL = "http://localhost:8899";
export const INDEXER_URL = "http://localhost:8784";
export const PROVER_URL = "http://localhost:3001";

export function usePhoton() {
  const photonRpc = useMemo(
    () => createRpc(RPC_URL, INDEXER_URL, PROVER_URL),
    []
  );

  return photonRpc;
}

export class SystemAccountMetaConfig {
  selfProgram: PublicKey;
  cpiContext?: PublicKey;
  solCompressionRecipient?: PublicKey;
  solPoolPda?: PublicKey;

  private constructor(
    selfProgram: PublicKey,
    cpiContext?: PublicKey,
    solCompressionRecipient?: PublicKey,
    solPoolPda?: PublicKey
  ) {
    this.selfProgram = selfProgram;
    this.cpiContext = cpiContext;
    this.solCompressionRecipient = solCompressionRecipient;
    this.solPoolPda = solPoolPda;
  }

  static new(selfProgram: PublicKey): SystemAccountMetaConfig {
    return new SystemAccountMetaConfig(selfProgram);
  }

  static newWithCpiContext(
    selfProgram: PublicKey,
    cpiContext: PublicKey
  ): SystemAccountMetaConfig {
    return new SystemAccountMetaConfig(selfProgram, cpiContext);
  }
}

export class PackedAccounts {
  private preAccounts: AccountMeta[] = [];
  private systemAccounts: AccountMeta[] = [];
  private nextIndex: number = 0;
  private map: Map<PublicKey, [number, AccountMeta]> = new Map();

  static newWithSystemAccounts(
    config: SystemAccountMetaConfig
  ): PackedAccounts {
    const instance = new PackedAccounts();
    instance.addSystemAccounts(config);
    return instance;
  }

  static newWithSystemAccountsSmall(
    config: SystemAccountMetaConfig
  ): PackedAccounts {
    const instance = new PackedAccounts();
    instance.addSystemAccountsSmall(config);
    return instance;
  }

  addPreAccountsSigner(pubkey: PublicKey): void {
    this.preAccounts.push({ pubkey, isSigner: true, isWritable: false });
  }

  addPreAccountsSignerMut(pubkey: PublicKey): void {
    this.preAccounts.push({ pubkey, isSigner: true, isWritable: true });
  }

  addPreAccountsMeta(accountMeta: AccountMeta): void {
    this.preAccounts.push(accountMeta);
  }

  addSystemAccounts(config: SystemAccountMetaConfig): void {
    this.systemAccounts.push(...getLightSystemAccountMetas(config));
  }

  addSystemAccountsSmall(config: SystemAccountMetaConfig): void {
    this.systemAccounts.push(...getLightSystemAccountMetasSmall(config));
  }

  insertOrGet(pubkey: PublicKey): number {
    return this.insertOrGetConfig(pubkey, false, true);
  }

  insertOrGetReadOnly(pubkey: PublicKey): number {
    return this.insertOrGetConfig(pubkey, false, false);
  }

  insertOrGetConfig(
    pubkey: PublicKey,
    isSigner: boolean,
    isWritable: boolean
  ): number {
    const entry = this.map.get(pubkey);
    if (entry) {
      return entry[0];
    }
    const index = this.nextIndex++;
    const meta: AccountMeta = { pubkey, isSigner, isWritable };
    this.map.set(pubkey, [index, meta]);
    return index;
  }

  private hashSetAccountsToMetas(): AccountMeta[] {
    const entries = Array.from(this.map.entries());
    entries.sort((a, b) => a[1][0] - b[1][0]);
    return entries.map(([, [, meta]]) => meta);
  }

  private getOffsets(): [number, number] {
    const systemStart = this.preAccounts.length;
    const packedStart = systemStart + this.systemAccounts.length;
    return [systemStart, packedStart];
  }

  toAccountMetas(): {
    remainingAccounts: AccountMeta[];
    systemStart: number;
    packedStart: number;
  } {
    const packed = this.hashSetAccountsToMetas();
    const [systemStart, packedStart] = this.getOffsets();
    return {
      remainingAccounts: [
        ...this.preAccounts,
        ...this.systemAccounts,
        ...packed,
      ],
      systemStart,
      packedStart,
    };
  }
}

export function getLightSystemAccountMetas(
  config: SystemAccountMetaConfig
): AccountMeta[] {
  let signerSeed = new TextEncoder().encode("cpi_authority");
  const cpiSigner = PublicKey.findProgramAddressSync(
    [signerSeed],
    config.selfProgram
  )[0];
  const defaults = SystemAccountPubkeys.default();
  const metas: AccountMeta[] = [
    { pubkey: defaults.lightSystemProgram, isSigner: false, isWritable: false },
    { pubkey: cpiSigner, isSigner: false, isWritable: false },
    {
      pubkey: defaults.registeredProgramPda,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: new PublicKey("noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: defaults.accountCompressionAuthority,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: defaults.accountCompressionProgram,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: config.selfProgram,
      isSigner: false,
      isWritable: false,
    },
  ];
  if (config.solPoolPda) {
    metas.push({
      pubkey: config.solPoolPda,
      isSigner: false,
      isWritable: true,
    });
  }
  if (config.solCompressionRecipient) {
    metas.push({
      pubkey: config.solCompressionRecipient,
      isSigner: false,
      isWritable: true,
    });
  }
  metas.push({
    pubkey: defaults.systemProgram,
    isSigner: false,
    isWritable: false,
  });
  if (config.cpiContext) {
    metas.push({
      pubkey: config.cpiContext,
      isSigner: false,
      isWritable: true,
    });
  }
  return metas;
}

export function getLightSystemAccountMetasSmall(
  config: SystemAccountMetaConfig
): AccountMeta[] {
  let signerSeed = new TextEncoder().encode("cpi_authority");
  const cpiSigner = PublicKey.findProgramAddressSync(
    [signerSeed],
    config.selfProgram
  )[0];
  const defaults = SystemAccountPubkeys.default();

  const metas: AccountMeta[] = [
    { pubkey: defaults.lightSystemProgram, isSigner: false, isWritable: false },
    { pubkey: cpiSigner, isSigner: false, isWritable: false },
    {
      pubkey: defaults.registeredProgramPda,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: defaults.accountCompressionAuthority,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: defaults.accountCompressionProgram,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: defaults.systemProgram,
      isSigner: false,
      isWritable: false,
    },
  ];
  if (config.solPoolPda) {
    metas.push({
      pubkey: config.solPoolPda,
      isSigner: false,
      isWritable: true,
    });
  }
  if (config.solCompressionRecipient) {
    metas.push({
      pubkey: config.solCompressionRecipient,
      isSigner: false,
      isWritable: true,
    });
  }
  if (config.cpiContext) {
    metas.push({
      pubkey: config.cpiContext,
      isSigner: false,
      isWritable: true,
    });
  }
  return metas;
}

export class SystemAccountPubkeys {
  lightSystemProgram: PublicKey;
  systemProgram: PublicKey;
  accountCompressionProgram: PublicKey;
  accountCompressionAuthority: PublicKey;
  registeredProgramPda: PublicKey;
  solPoolPda: PublicKey;

  private constructor(
    lightSystemProgram: PublicKey,
    systemProgram: PublicKey,
    accountCompressionProgram: PublicKey,
    accountCompressionAuthority: PublicKey,
    registeredProgramPda: PublicKey,
    solPoolPda: PublicKey
  ) {
    this.lightSystemProgram = lightSystemProgram;
    this.systemProgram = systemProgram;
    this.accountCompressionProgram = accountCompressionProgram;
    this.accountCompressionAuthority = accountCompressionAuthority;
    this.registeredProgramPda = registeredProgramPda;
    this.solPoolPda = solPoolPda;
  }

  static default(): SystemAccountPubkeys {
    return new SystemAccountPubkeys(
      LightSystemProgram.programId,
      PublicKey.default,
      defaultStaticAccountsStruct().accountCompressionProgram,
      defaultStaticAccountsStruct().accountCompressionAuthority,
      defaultStaticAccountsStruct().registeredProgramPda,
      PublicKey.default
    );
  }
}
