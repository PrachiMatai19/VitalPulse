import {
  Donor,
  User,
  DonationHistory,
  RequestResponse,
  BloodRequest,
  DonorAchievement,
  AchievementTier,
} from '../types';
import { calculateCooldown } from './bloodCompatibility';

/**
 * Calculates all donor milestones based on live records, donation history, and responses.
 */
export function calculateDonorAchievements(
  donor: Donor,
  user: User,
  history: DonationHistory[],
  responses: RequestResponse[],
  requests: BloodRequest[]
): DonorAchievement[] {
  const totalDonations = Math.max(donor.totalDonations || 0, history.length);
  const totalUnits = history.reduce((sum, h) => sum + (h.units || 1), 0) || totalDonations;

  // 1. First Donation Milestone
  const hasFirstDonation = totalDonations >= 1;
  const firstDonationRecord = history.length > 0
    ? [...history].sort((a, b) => new Date(a.donatedOn).getTime() - new Date(b.donatedOn).getTime())[0]
    : null;

  const firstDonationAchievement: DonorAchievement = {
    id: 'first-donation',
    title: 'First Donation',
    tagline: 'The First Step in Lifesaving',
    description: 'Completed your very first voluntary blood donation at an accredited hospital or mobile blood drive.',
    clinicalImpact: 'A single standard donation of whole blood can be separated into packed red cells, platelets, and plasma, potentially sustaining up to 3 patients.',
    category: 'DONATION',
    tier: 'BRONZE',
    unlocked: hasFirstDonation,
    unlockedAt: firstDonationRecord ? firstDonationRecord.donatedOn : (hasFirstDonation ? donor.lastDonationDate || user.createdAt : undefined),
    progress: {
      current: Math.min(totalDonations, 1),
      target: 1,
      unit: 'donation',
    },
    iconName: 'HeartHandshake',
    badgeColor: 'from-amber-600 to-amber-700',
  };

  // 2. Emergency Hero Milestone
  // Check if donor accepted an emergency request (CRITICAL or URGENT)
  const acceptedResponses = responses.filter((r) => r.status === 'ACCEPTED');
  const emergencyAcceptance = acceptedResponses.some((resp) => {
    const req = requests.find((r) => r.id === resp.requestId);
    return req && (req.urgency === 'CRITICAL' || req.urgency === 'URGENT');
  });

  // Also check if any donation history has emergency or trauma notes
  const emergencyHistoryRecord = history.find(
    (h) => (h.notes && /emergency|trauma|critical|urgent|icu/i.test(h.notes)) || h.requestId !== null
  );

  const isEmergencyHero = emergencyAcceptance || !!emergencyHistoryRecord || totalDonations >= 4;
  const emergencyCount = (emergencyAcceptance ? 1 : 0) + (emergencyHistoryRecord ? 1 : 0) + (totalDonations >= 4 ? 1 : 0);

  const emergencyHeroAchievement: DonorAchievement = {
    id: 'emergency-hero',
    title: 'Emergency Hero',
    tagline: 'Golden Hour First Responder',
    description: 'Responded to and accepted an emergency critical blood broadcast for acute trauma, cardiac surgery, or maternal hemorrhage.',
    clinicalImpact: 'In severe hemorrhagic trauma, rapid transfusion within the initial 60-minute Golden Hour improves patient survival rates by up to 52%.',
    category: 'EMERGENCY',
    tier: 'GOLD',
    unlocked: isEmergencyHero,
    unlockedAt: emergencyHistoryRecord?.donatedOn || (emergencyAcceptance ? new Date().toISOString().split('T')[0] : (isEmergencyHero ? donor.lastDonationDate || undefined : undefined)),
    progress: {
      current: Math.min(emergencyCount, 1),
      target: 1,
      unit: 'emergency response',
    },
    iconName: 'ShieldAlert',
    badgeColor: 'from-amber-400 via-amber-500 to-yellow-600',
  };

  // 3. Quarterly Savior Milestone
  // Check donations across distinct quarters or separated by 90+ days
  const quarters = new Set<string>();
  history.forEach((h) => {
    if (h.donatedOn) {
      const d = new Date(h.donatedOn);
      const q = `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
      quarters.add(q);
    }
  });

  const quarterCount = Math.max(quarters.size, totalDonations >= 2 ? 2 : 0);
  const isQuarterlySavior = quarterCount >= 2;

  const quarterlySaviorAchievement: DonorAchievement = {
    id: 'quarterly-savior',
    title: 'Quarterly Savior',
    tagline: 'Sustainable Lifeline Regular',
    description: 'Maintained steady, recurring blood donations across multiple calendar quarters while respecting biological cooldown intervals.',
    clinicalImpact: 'Regular quarterly donors ensure steady hospital blood bank reserves, preventing sudden seasonal shortages during holidays and monsoons.',
    category: 'CONSISTENCY',
    tier: 'SILVER',
    unlocked: isQuarterlySavior,
    unlockedAt: isQuarterlySavior && history.length >= 2 ? history[0].donatedOn : (totalDonations >= 2 ? donor.lastDonationDate || undefined : undefined),
    progress: {
      current: Math.min(quarterCount, 2),
      target: 2,
      unit: 'quarters active',
    },
    iconName: 'CalendarClock',
    badgeColor: 'from-slate-300 via-slate-400 to-slate-500',
  };

  // 4. Universal LifeLine Milestone
  const isUniversalGroup = donor.bloodGroup === 'O-' || donor.bloodGroup === 'O+';
  const universalLifeLineAchievement: DonorAchievement = {
    id: 'universal-lifeline',
    title: 'Universal LifeLine',
    tagline: donor.bloodGroup === 'O-' ? 'Universal Red Cell Donor (O-)' : 'Universal Rh Compatible (O+)',
    description: donor.bloodGroup === 'O-'
      ? 'Universal O- red blood cells can be safely transfused into any recipient regardless of their ABO/Rh blood type in critical emergencies.'
      : 'O+ blood is the most transfused blood type globally, providing immediate support for all positive blood recipients.',
    clinicalImpact: 'In severe trauma when laboratory crossmatching is too slow, emergency departments immediately transfuse universal donor units.',
    category: 'COMMUNITY',
    tier: donor.bloodGroup === 'O-' ? 'PLATINUM' : 'GOLD',
    unlocked: isUniversalGroup,
    unlockedAt: user.createdAt ? user.createdAt.split('T')[0] : undefined,
    progress: {
      current: isUniversalGroup ? 1 : 0,
      target: 1,
      unit: 'blood match',
    },
    iconName: 'Sparkles',
    badgeColor: donor.bloodGroup === 'O-' ? 'from-cyan-400 via-sky-500 to-indigo-600' : 'from-rose-500 to-red-600',
  };

  // 5. Rapid Responder Milestone
  const isRapidResponder = donor.shareLive && donor.available;
  const rapidResponderAchievement: DonorAchievement = {
    id: 'rapid-responder',
    title: 'Rapid Responder',
    tagline: 'Active Live GPS Dispatch',
    description: 'Enabled live location transmission so hospital emergency dispatch teams can calculate precise route times and travel distances.',
    clinicalImpact: 'Live GPS dispatching slashes transit coordination time by over 35%, helping emergency surgical rooms prepare operating theaters with confidence.',
    category: 'EMERGENCY',
    tier: 'BRONZE',
    unlocked: isRapidResponder,
    unlockedAt: donor.liveUpdatedAt ? donor.liveUpdatedAt.split('T')[0] : undefined,
    progress: {
      current: isRapidResponder ? 1 : 0,
      target: 1,
      unit: 'active standby',
    },
    iconName: 'Navigation',
    badgeColor: 'from-emerald-500 to-teal-600',
  };

  // 6. Triple Impact Milestone
  const targetUnits = 3;
  const isTripleImpact = totalUnits >= targetUnits;
  const tripleImpactAchievement: DonorAchievement = {
    id: 'triple-impact',
    title: 'Triple Impact',
    tagline: '9+ Patient Lives Sustained',
    description: 'Contributed 3 or more verified units of blood across accredited healthcare centers.',
    clinicalImpact: 'Providing 3 or more units supports long-term hematology wards, thalassemia treatments, and severe surgical restorations.',
    category: 'DONATION',
    tier: 'GOLD',
    unlocked: isTripleImpact,
    unlockedAt: isTripleImpact && history.length >= 3 ? history[2].donatedOn : (totalDonations >= 3 ? donor.lastDonationDate || undefined : undefined),
    progress: {
      current: Math.min(totalUnits, targetUnits),
      target: targetUnits,
      unit: 'units donated',
    },
    iconName: 'Flame',
    badgeColor: 'from-red-500 via-rose-600 to-pink-600',
  };

  // 7. Golden Cooldown Milestone
  const cooldownInfo = calculateCooldown(donor.lastDonationDate);
  const isCooldownAdherent = totalDonations > 0 && cooldownInfo.isEligible;
  const goldenCooldownAchievement: DonorAchievement = {
    id: 'golden-cooldown',
    title: 'Golden Cooldown',
    tagline: '100% Biological Recovery',
    description: 'Observed the complete 90-day biological rest window between donations, allowing full erythrocyte and ferritin replenishment.',
    clinicalImpact: 'Strict adherence to donation intervals prevents iron-deficiency anemia and ensures donor safety, making voluntary donation lifelong.',
    category: 'CONSISTENCY',
    tier: 'SILVER',
    unlocked: isCooldownAdherent,
    unlockedAt: isCooldownAdherent ? donor.lastDonationDate || undefined : undefined,
    progress: {
      current: totalDonations > 0 ? (cooldownInfo.isEligible ? 90 : Math.max(0, 90 - cooldownInfo.daysRemaining)) : 0,
      target: 90,
      unit: 'days recovered',
    },
    iconName: 'Clock',
    badgeColor: 'from-blue-500 to-indigo-600',
  };

  return [
    firstDonationAchievement,
    emergencyHeroAchievement,
    quarterlySaviorAchievement,
    universalLifeLineAchievement,
    rapidResponderAchievement,
    tripleImpactAchievement,
    goldenCooldownAchievement,
  ];
}

/**
 * Calculates aggregate donor score, rank, and lives saved estimate.
 */
export function getDonorRank(achievements: DonorAchievement[], totalDonations: number) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const livesSaved = Math.max(totalDonations * 3, unlockedCount * 2);

  let rank = 'Bronze Lifesaver';
  let badgeTier: AchievementTier = 'BRONZE';
  let nextRank = 'Silver Guardian';
  let neededForNext = 2;

  if (unlockedCount >= 6) {
    rank = 'Platinum Legend';
    badgeTier = 'PLATINUM';
    nextRank = 'Max Level Achieved';
    neededForNext = 0;
  } else if (unlockedCount >= 4) {
    rank = 'Gold Champion';
    badgeTier = 'GOLD';
    nextRank = 'Platinum Legend';
    neededForNext = 6 - unlockedCount;
  } else if (unlockedCount >= 2) {
    rank = 'Silver Guardian';
    badgeTier = 'SILVER';
    nextRank = 'Gold Champion';
    neededForNext = 4 - unlockedCount;
  } else {
    rank = 'Bronze Lifesaver';
    badgeTier = 'BRONZE';
    nextRank = 'Silver Guardian';
    neededForNext = 2 - unlockedCount;
  }

  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return {
    rank,
    badgeTier,
    unlockedCount,
    totalCount,
    livesSaved,
    nextRank,
    neededForNext,
    progressPercent,
  };
}
