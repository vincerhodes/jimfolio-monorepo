// TypeScript type definitions for string-based enums

export type Role = 'TEAM_MEMBER' | 'MANAGER' | 'SENIOR_MANAGER';

export type VerificationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type VerificationResult = 'GENUINE' | 'INCONCLUSIVE' | 'FALSE' | 'UNABLE_TO_VERIFY';

export type StatusBadgeType = 'genuine' | 'inconclusive' | 'false' | 'unable' | 'pending' | 'in-progress' | 'completed';

// Helper functions for type safety
export const isValidRole = (role: string): role is Role => {
  return ['TEAM_MEMBER', 'MANAGER', 'SENIOR_MANAGER'].includes(role);
};

export const isValidStatus = (status: string): status is VerificationStatus => {
  return ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status);
};

export const isValidResult = (result: string): result is VerificationResult => {
  return ['GENUINE', 'INCONCLUSIVE', 'FALSE', 'UNABLE_TO_VERIFY'].includes(result);
};

// Status color mapping helpers
export const getStatusColor = (status: VerificationStatus): string => {
  switch (status) {
    case 'PENDING': return 'status-pending';
    case 'IN_PROGRESS': return 'status-in-progress';
    case 'COMPLETED': return 'status-genuine';
    default: return 'status-pending';
  }
};

export const getResultColor = (result: VerificationResult): string => {
  switch (result) {
    case 'GENUINE': return 'status-genuine';
    case 'INCONCLUSIVE': return 'status-inconclusive';
    case 'FALSE': return 'status-false';
    case 'UNABLE_TO_VERIFY': return 'status-unable';
    default: return 'status-unable';
  }
};
