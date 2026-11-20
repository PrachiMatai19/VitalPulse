import { BloodGroup } from '../types';

/**
 * Blood Compatibility Matrix
 * Key: Recipient Blood Group
 * Value: Array of Donor Blood Groups that can safely donate to the recipient
 */
export const RECIPIENT_CAN_RECEIVE_FROM: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'], // Universal Donor can only receive from O-
};

/**
 * Key: Donor Blood Group
 * Value: Array of Recipient Blood Groups that the donor can safely donate to
 */
export const DONOR_CAN_GIVE_TO: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Universal Recipient can only donate to AB+
};

/**
 * Check if a donor with `donorGroup` can donate blood to recipient with `recipientGroup`
 */
export function isBloodCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean {
  const allowed = RECIPIENT_CAN_RECEIVE_FROM[recipientGroup] || [];
  return allowed.includes(donorGroup);
}

/**
 * Cooldown calculation (90 days / 3 months)
 */
export const COOLDOWN_DAYS = 90;

export interface CooldownInfo {
  isEligible: boolean;
  nextEligibleDate: string | null;
  daysRemaining: number;
  progressPercent: number;
}

export function calculateCooldown(lastDonationDate: string | null): CooldownInfo {
  if (!lastDonationDate) {
    return {
      isEligible: true,
      nextEligibleDate: null,
      daysRemaining: 0,
      progressPercent: 100,
    };
  }

  const lastDate = new Date(lastDonationDate);
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + COOLDOWN_DAYS);

  const now = new Date();
  const diffMs = nextDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      isEligible: true,
      nextEligibleDate: nextDate.toISOString().split('T')[0],
      daysRemaining: 0,
      progressPercent: 100,
    };
  }

  const elapsedDays = Math.max(0, COOLDOWN_DAYS - daysRemaining);
  const progressPercent = Math.min(100, Math.round((elapsedDays / COOLDOWN_DAYS) * 100));

  return {
    isEligible: false,
    nextEligibleDate: nextDate.toISOString().split('T')[0],
    daysRemaining,
    progressPercent,
  };
}
