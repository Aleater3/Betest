
import { Question } from './types';

export const QUESTIONS: Question[] = [
    { pillar: "Excavate", text: "Do you abandon projects when they hit 70% completion because a 'better' idea strikes?", options: [ { label: "Rarely. I finish what I start.", score: 10 }, { label: "Occasionally.", score: 6 }, { label: "Frequently.", score: 2 } ] },
    { pillar: "Excavate", text: "Can you define your #1 revenue driver for the next 90 days in one sentence?", options: [ { label: "Yes, absolute clarity.", score: 10 }, { label: "I have 2-3 priorities.", score: 5 }, { label: "No.", score: 1 } ] },
    { pillar: "Excavate", text: "Time from 'Revenue Idea' to 'Market Launch'?", options: [ { label: "Under 48 Hours", score: 10 }, { label: "1-2 Weeks", score: 6 }, { label: "Months/Never", score: 2 } ] },
    { pillar: "Destabilize", text: "How do you view 'being busy'?", options: [ { label: "Busy is a system failure.", score: 10 }, { label: "I feel guilty if not working.", score: 4 }, { label: "It is a badge of honor.", score: 1 } ] },
    { pillar: "Destabilize", text: "Maintenance vs Deep Work ratio?", options: [ { label: "80% Deep / 20% Admin", score: 10 }, { label: "50% / 50%", score: 5 }, { label: "20% Deep / 80% Admin", score: 2 } ] },
    { pillar: "Destabilize", text: "Reaction to a revenue ceiling?", options: [ { label: "Analyze systems & Pivot.", score: 10 }, { label: "Work longer hours.", score: 5 }, { label: "Spiral/Doubt.", score: 1 } ] },
    { pillar: "Prime", text: "Workspace triggers Flow or Distraction?", options: [ { label: "Flow (Cockpit).", score: 10 }, { label: "Neutral.", score: 6 }, { label: "Distraction.", score: 2 } ] },
    { pillar: "Prime", text: "Do you have a codified 'Start Sequence'?", options: [ { label: "Yes, non-negotiable.", score: 10 }, { label: "Sometimes.", score: 5 }, { label: "No.", score: 1 } ] },
    { pillar: "Prime", text: "Trivial decisions before noon?", options: [ { label: "Zero.", score: 10 }, { label: "A few.", score: 6 }, { label: "Many.", score: 2 } ] },
    { pillar: "Execute", text: "Consecutive days hitting your #1 target?", options: [ { label: "Every day.", score: 10 }, { label: "Most days.", score: 6 }, { label: "Sporadically.", score: 2 } ] },
    { pillar: "Execute", text: "Do you track output metrics visually?", options: [ { label: "Yes, daily scoreboard.", score: 10 }, { label: "Mental tally.", score: 4 }, { label: "No.", score: 1 } ] },
    { pillar: "Execute", text: "Reaction to missing a target?", options: [ { label: "Ruthless System Audit.", score: 10 }, { label: "Promise to 'do better'.", score: 4 }, { label: "Avoid the data.", score: 1 } ] }
];

// Updated to B12 Payment Link
export const B12_PAYMENT_URL = "https://be-extraordinary.site/book-online";
export const PAYPAL_ME_LINK = "https://www.paypal.com/ncp/payment/Y44X3EY3PW8BU";
