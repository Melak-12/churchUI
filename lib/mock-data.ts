import { Member, Vote, Communication, Settings } from '@/types';

export const mockMembers: Member[] = [
  {
    id: '1',
    firstName: 'Abebe',
    lastName: 'Kebede',
    phone: '+251911234567',
    email: 'abebe.kebede@email.com',
    address: 'Bole, Addis Ababa, Ethiopia',
    consent: true,
    status: 'PAID',
    delinquencyDays: 0,
    eligibility: 'ELIGIBLE',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    lastPaymentDate: '2024-12-01T10:00:00Z'
  },
  {
    id: '2',
    firstName: 'Tigist',
    lastName: 'Assefa',
    phone: '+251912345678',
    email: 'tigist.assefa@email.com',
    consent: true,
    status: 'DELINQUENT',
    delinquencyDays: 45,
    eligibility: 'ELIGIBLE',
    eligibilityReason: 'Delinquent for 45 days (under 90 day limit)',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
    lastPaymentDate: '2024-11-01T10:00:00Z'
  },
  {
    id: '3',
    firstName: 'Mengistu',
    lastName: 'Haile',
    phone: '+251913456789',
    email: 'mengistu.haile@email.com',
    consent: true,
    status: 'DELINQUENT',
    delinquencyDays: 120,
    eligibility: 'NOT_ELIGIBLE',
    eligibilityReason: 'Delinquent for 120 days (exceeds 90 day limit)',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-08-15T10:00:00Z',
    lastPaymentDate: '2024-08-15T10:00:00Z'
  },
  {
    id: '4',
    firstName: 'Aster',
    lastName: 'Girma',
    phone: '+251914567890',
    email: 'aster.girma@email.com',
    consent: true,
    status: 'PAID',
    delinquencyDays: 0,
    eligibility: 'ELIGIBLE',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    lastPaymentDate: '2024-12-01T10:00:00Z'
  }
];

export const mockVotes: Vote[] = [
  {
    id: '1',
    title: 'Board Member Election 2024',
    description: 'Vote for the board members who will serve our community for the next term.',
    type: 'SINGLE_CHOICE',
    options: ['Alemayehu Tsegaye', 'Birtukan Mulugeta', 'Chaltu Bekele'],
    startAt: '2024-12-15T09:00:00Z',
    endAt: '2024-12-22T17:00:00Z',
    status: 'ACTIVE',
    anonymous: false,
    eligibleCount: 3,
    participationCount: 1,
    participationPercent: 33,
    createdAt: '2024-12-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Budget Approval',
    description: 'Approve the proposed budget for the upcoming fiscal year.',
    type: 'YES_NO',
    options: ['Yes', 'No'],
    startAt: '2024-11-01T09:00:00Z',
    endAt: '2024-11-30T17:00:00Z',
    status: 'CLOSED',
    anonymous: true,
    eligibleCount: 3,
    participationCount: 2,
    participationPercent: 67,
    createdAt: '2024-10-15T10:00:00Z',
    results: {
      'Yes': 2,
      'No': 0
    }
  }
];

export const mockCommunications: Communication[] = [
  {
    id: '1',
    name: 'Voting Reminder',
    audience: 'ELIGIBLE',
    body: 'Hi {{firstName}}, don\'t forget to vote in our board election! Your vote matters. {{ballotLink}}',
    sentAt: '2024-12-10T14:00:00Z',
    sent: 3,
    delivered: 3,
    failed: 0,
    status: 'SENT'
  },
  {
    id: '2',
    name: 'Payment Reminder',
    audience: 'DELINQUENT_30',
    body: 'Hello {{firstName}}, your membership payment is overdue. Please update your payment to maintain voting eligibility.',
    sentAt: '2024-12-01T10:00:00Z',
    sent: 1,
    delivered: 1,
    failed: 0,
    status: 'SENT'
  }
];

export const mockSettings: Settings = {
  organizationName: 'Ethiopian Orthodox Church Community',
  primaryColor: '#3B82F6',
  consentText: 'I consent to receive communications from the organization via SMS and phone.',
  smsFooter: 'Reply STOP to unsubscribe. Msg & data rates may apply.',
  twilioSenderId: '+251911234567',
  privacyPolicyUrl: 'https://example.com/privacy'
};