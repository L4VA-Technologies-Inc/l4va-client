// Rewards API Types for L4VA Client

// ============================================================================
// Epoch Types
// ============================================================================

export interface Epoch {
  id: string;
  startDate: string;
  endDate: string;
  status: EpochStatus;
  totalEmission?: number;
  weekNumber?: number;
}

export enum EpochStatus {
  ACTIVE = 'active',
  PROCESSING = 'processing',
  FINALIZED = 'finalized',
}

export interface EpochDetails extends Epoch {
  metadata?: Record<string, any>;
  finalizedAt?: string;
  processedAt?: string;
}

// ============================================================================
// Score & History Types
// ============================================================================

export interface WalletScore {
  walletAddress: string;
  score: number;
  epoch?: string;
  breakdown?: {
    creatorScore?: number;
    participantScore?: number;
    lpScore?: number;
    governanceScore?: number;
  };
}

export interface RewardHistory {
  walletAddress: string;
  epochId: string;
  epoch?: Epoch;
  totalReward: number;
  immediateReward: number;
  vestedReward: number;
  score?: number;
  isCapped?: boolean;
  capApplied?: boolean;
  createdAt?: string;
}

// ============================================================================
// Vault Rewards Types
// ============================================================================

export interface VaultScore {
  vaultId: string;
  walletAddress: string;
  score: number;
  rank?: number;
}

export interface WalletVaultReward {
  vaultId: string;
  walletAddress: string;
  totalReward: number;
  creatorReward?: number;
  participantReward?: number;
  immediateReward?: number;
  vestedReward?: number;
  role?: 'creator' | 'participant' | 'both';
}

export interface WalletVaultsResponse {
  walletAddress: string;
  vaults: Array<{
    vaultId: string;
    vaultName?: string;
    role: 'creator' | 'participant' | 'both';
    totalReward: number;
    epochCount?: number;
  }>;
}

// ============================================================================
// Claims Types
// ============================================================================

export interface ClaimsSummary {
  walletAddress: string;
  totalClaimable: number;
  totalClaimed: number;
  pendingClaims?: number;
  lastClaimDate?: string;
}

export interface ClaimableAmount {
  walletAddress: string;
  claimableAmount: number;
  breakdown?: {
    immediate?: number;
    unlocked?: number;
  };
}

export interface ClaimHistory {
  id: string;
  walletAddress: string;
  amount: number;
  claimedAt: string;
  transactionHash?: string;
  status: ClaimStatus;
  epochId?: string;
}

export enum ClaimStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface ClaimTransaction {
  id: string;
  walletAddress: string;
  amount: number;
  transactionHash?: string;
  status: ClaimStatus;
  createdAt: string;
  confirmedAt?: string;
  failedAt?: string;
  errorMessage?: string;
}

export interface ClaimRequest {
  walletAddress: string;
  signature?: string;
}

export interface ClaimResponse {
  success: boolean;
  transactionHash?: string;
  claimedAmount?: number;
  message?: string;
}

// ============================================================================
// Vesting Types
// ============================================================================

export interface VestingSummary {
  walletAddress: string;
  totalVested: number;
  totalLocked: number;
  totalUnlocked: number;
  nextUnlock?: {
    amount: number;
    date: string;
  };
  activePositions?: number;
}

export interface VestingPosition {
  id: string;
  walletAddress: string;
  totalAmount: number;
  vestedAmount: number;
  claimedAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  unlockDate?: string;
  status: VestingStatus;
  epochId?: string;
  vaultId?: string;
  source?: RewardSource;
}

export enum VestingStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum RewardSource {
  CREATOR = 'creator',
  PARTICIPANT = 'participant',
  LP = 'lp',
  GOVERNANCE = 'governance',
  ACQUIRE = 'acquire',
  CONTRIBUTION = 'contribution',
  EXPANSION = 'expansion',
}

// ============================================================================
// Weights & Configuration Types
// ============================================================================

export interface RewardWeights {
  creatorWeight: number;
  participantWeight: number;
  lpWeight?: number;
  governanceWeight?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
