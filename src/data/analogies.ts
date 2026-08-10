import { RealWorldAnalogy } from '../types';

export const REAL_WORLD_ANALOGIES: RealWorldAnalogy[] = [
  {
    id: 'beach',
    title: 'Should I Go To The Beach?',
    icon: 'Sun',
    description: 'Imagine making a weekend decision based on two key factors: Weather and Free Time.',
    input1Label: 'Is it Sunny? (1 = Yes, 0 = No)',
    input2Label: 'Is it the Weekend? (1 = Yes, 0 = No)',
    weight1Default: 3.5, // Sunshine matters a lot
    weight2Default: 1.5, // Weekend matters a bit
    biasDefault: -3.0,   // General bias against going unless conditions are good
    thresholdName: 'Decision Threshold',
    outputYes: '🏖️ GO TO BEACH!',
    outputNo: '🏠 STAY HOME',
  },
  {
    id: 'spam',
    title: 'Spam Email Detector',
    icon: 'MailWarning',
    description: 'An AI filter deciding if an incoming email is Spam based on key trigger signals.',
    input1Label: 'Contains "URGENT!!!" (0 to 1)',
    input2Label: 'Contains Unknown Link (0 to 1)',
    weight1Default: 2.8,
    weight2Default: 4.2,
    biasDefault: -2.5,
    thresholdName: 'Spam Risk Score',
    outputYes: '🚨 MOVE TO SPAM FOLDER',
    outputNo: '📥 SAFE INBOX EMAIL',
  },
  {
    id: 'loan',
    title: 'Bank Credit Approval',
    icon: 'CreditCard',
    description: 'Estimating if a credit line should be automatically approved based on income & credit score.',
    input1Label: 'Income Level (High = 1)',
    input2Label: 'On-Time Payment Record (1 = Perfect)',
    weight1Default: 2.0,
    weight2Default: 5.0,
    biasDefault: -4.0,
    thresholdName: 'Credit Confidence Score',
    outputYes: '✅ APPROVED LOAN',
    outputNo: '❌ REJECTED LOAN',
  },
];
