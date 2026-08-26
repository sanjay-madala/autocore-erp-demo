/**
 * AutoCore ERP — AI (Call Intelligence, Transcripts, Scores, Copilot Suggestions)
 * Flows: F18 AI / Analytics — Speed-to-Lead, Call Scoring, Next-Best Action
 */

export type CallDirection = 'inbound' | 'outbound';
export type CallOutcome = 'connected' | 'voicemail' | 'no_answer' | 'busy' | 'failed';
export type CallSentiment = 'positive' | 'neutral' | 'negative' | 'mixed';
export type SuggestionType = 'next_best_action' | 'pricing' | 'follow_up' | 'compliance' | 'coaching';
export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface TranscriptSegment {
  speaker: 'agent' | 'customer' | 'system';
  startSec: number;
  endSec: number;
  text: string;
  sentiment?: CallSentiment;
}

export interface AiCall {
  id: string;
  leadId?: string;
  customerId: string;
  customerName: string;
  rooftopId: 'dtown' | 'north' | 'westside';
  direction: CallDirection;
  outcome: CallOutcome;
  durationSec: number;
  createdAt: string;
  agent: string;
  phone: string;
  recordingUrl?: string; // placeholder
  transcript: TranscriptSegment[];
  summary: string;
  // AI scores (0-100)
  scores: {
    overall: number;
    sentiment: number; // 0 negative → 100 positive
    talkRatioAgent: number; // % agent talked
    talkRatioCustomer: number;
    speedToLeadSec?: number; // if this call is first response
    compliance: number; // disclosure adherence
    closingAttempt: number; // 0-100 — did agent ask for appointment/close?
  };
  keywords: string[];
  nextSteps?: string[];
}

export interface SpeedToLeadMetric {
  period: string; // e.g., "2026-04-20"
  rooftopId: 'dtown' | 'north' | 'westside' | 'group';
  leads: number;
  contacted: number;
  avgSec: number;
  medianSec: number;
  p90Sec: number;
  gradeA: number; // count <2min
  gradeF: number; // count >60min or uncontacted
  slaMetPct: number; // % under 5min target
}

export interface CopilotSuggestion {
  id: string;
  type: SuggestionType;
  priority: SuggestionPriority;
  title: string;
  detail: string;
  relatedId?: string; // lead/deal/ro/vehicle id
  relatedType?: 'lead' | 'deal' | 'ro' | 'vehicle' | 'customer';
  rooftopId: 'dtown' | 'north' | 'westside' | 'group';
  createdAt: string;
  dismissed?: boolean;
  accepted?: boolean;
  // For demo: what action CTA would do
  ctaLabel: string;
  ctaAction: string;
}

export const aiCalls: AiCall[] = [
  {
    id: 'CALL-001',
    leadId: 'LEAD-001',
    customerId: 'CUS-008',
    customerName: 'Jonathan Reeves',
    rooftopId: 'dtown',
    direction: 'outbound',
    outcome: 'connected',
    durationSec: 218,
    createdAt: '2026-04-18T14:23:45Z',
    agent: 'M. Chen — BDC',
    phone: '+1-615-298-4412',
    recordingUrl: 'https://calls.example/CALL-001.mp3',
    transcript: [
      { speaker: 'agent', startSec: 0, endSec: 8, text: 'Hi, is this Jonathan? This is Maria with Sovereign Toyota Downtown — you just inquired about the RAV4 Hybrid?' },
      { speaker: 'customer', startSec: 8, endSec: 22, text: 'Oh wow, that was fast — yeah, I was just looking at the Blueprint Hybrid XLE Premium. Is that still available? And do you have the Highlander nearby to compare?' },
      { speaker: 'agent', startSec: 22, endSec: 42, text: 'It is — it’s actually in transit, arriving in a couple days, but we have a Highlander Limited on the front line you can see today. Are you free tomorrow around 6pm for a quick comparison?' },
      { speaker: 'customer', startSec: 42, endSec: 52, text: 'Tomorrow at 6 works. Can you text me the address and a couple photos?' },
      { speaker: 'agent', startSec: 52, endSec: 68, text: 'Absolutely — I’ll text photos of the RAV4 and the Highlander, plus a pin. And Jonathan, just to confirm — same number for texts?' },
      { speaker: 'customer', startSec: 68, endSec: 74, text: 'Yep, this number is perfect. Thanks!' },
    ],
    summary: 'Speed-to-lead 95s — highly responsive. Customer wants RAV4 Hybrid XLE Premium (in-transit T24093) vs Highlander Limited (T23157). Appointment set for 4/20 6pm. Requested photos via SMS.',
    scores: { overall: 92, sentiment: 88, talkRatioAgent: 48, talkRatioCustomer: 52, speedToLeadSec: 95, compliance: 96, closingAttempt: 94 },
    keywords: ['RAV4 Hybrid', 'Highlander', 'appointment', 'photos', 'in-transit'],
    nextSteps: ['Send photos + address via SMS', 'Confirm appointment reminder 2hr prior'],
  },
  {
    id: 'CALL-002',
    leadId: 'LEAD-004',
    customerId: 'CUS-005',
    customerName: 'Sofia Martinez',
    rooftopId: 'north',
    direction: 'outbound',
    outcome: 'connected',
    durationSec: 184,
    createdAt: '2026-04-19T18:06:10Z',
    agent: 'R. Owens',
    phone: '+1-615-203-9981',
    recordingUrl: 'https://calls.example/CALL-002.mp3',
    transcript: [
      { speaker: 'agent', startSec: 0, endSec: 10, text: 'Hi Sofia, this is Robert at Sovereign Ford North — I saw your chat about the green Bronco Outer Banks?' },
      { speaker: 'customer', startSec: 10, endSec: 18, text: 'Yes! Is it still there? I love the Sasquatch package.' },
      { speaker: 'agent', startSec: 18, endSec: 38, text: 'It is — Eruption Green with Sasquatch and Lux, 22k miles, one owner. It’s on the front line. What’s your timeline — are you trading anything?' },
      { speaker: 'customer', startSec: 38, endSec: 48, text: 'No trade — just need a payment around $800 if possible. Can I come tomorrow morning?' },
      { speaker: 'agent', startSec: 48, endSec: 66, text: 'Tomorrow at 11am is perfect. I’ll have it pulled up and we’ll run numbers. I’ll text you confirmation.' },
    ],
    summary: '37s speed-to-lead — excellent. Customer wants Bronco F30992, no trade, payment sensitive (~$800). Appointment 4/20 11am. Subprime credit (612) — needs special finance prep.',
    scores: { overall: 88, sentiment: 84, talkRatioAgent: 52, talkRatioCustomer: 48, speedToLeadSec: 37, compliance: 90, closingAttempt: 92 },
    keywords: ['Bronco', 'Sasquatch', 'payment', 'appointment', 'no trade'],
    nextSteps: ['Pre-qual via RouteOne before appointment', 'Prepare Westlake/CPS pencils at $800/mo'],
  },
  {
    id: 'CALL-003',
    leadId: 'LEAD-007',
    customerId: 'CUS-002',
    customerName: 'Darnell Washington',
    rooftopId: 'dtown',
    direction: 'outbound',
    outcome: 'voicemail',
    durationSec: 42,
    createdAt: '2026-04-10T15:22:18Z',
    agent: 'M. Chen — BDC',
    phone: '+1-615-922-1148',
    recordingUrl: 'https://calls.example/CALL-003.mp3',
    transcript: [
      { speaker: 'agent', startSec: 0, endSec: 38, text: 'Hi Darnell, this is Maria with Sovereign Toyota Downtown about the Corolla LE you viewed on CarGurus. I’ll text you a video walkaround and we can set a time to see it — call me back at 615-438-9000. Thanks!' },
    ],
    summary: 'First response 18min (C grade) — voicemail. Customer viewed Corolla T23188 via CarGurus. Follow-up via SMS video.',
    scores: { overall: 54, sentiment: 50, talkRatioAgent: 100, talkRatioCustomer: 0, speedToLeadSec: 1098, compliance: 88, closingAttempt: 60 },
    keywords: ['voicemail', 'CarGurus', 'Corolla', 'video'],
    nextSteps: ['SMS video walkaround', 'Second call attempt in 2 hours'],
  },
  {
    id: 'CALL-004',
    leadId: 'LEAD-014',
    customerId: 'CUS-008',
    customerName: 'Jonathan Reeves',
    rooftopId: 'dtown',
    direction: 'inbound',
    outcome: 'connected',
    durationSec: 142,
    createdAt: '2026-04-19T08:03:15Z',
    agent: 'M. Chen — BDC',
    phone: '+1-615-298-4412',
    recordingUrl: 'https://calls.example/CALL-004.mp3',
    transcript: [
      { speaker: 'customer', startSec: 0, endSec: 12, text: 'Hi, this is Jonathan Reeves — I called yesterday about the RAV4 Hybrid, but I also saw a Civic on Cars.com at your North store. Is that the same company?' },
      { speaker: 'agent', startSec: 12, endSec: 32, text: 'It is — we’re all Sovereign Auto Group. I have you down for 6pm tonight downtown to see the RAV4 and Highlander. Do you want me to also line up the Civic at North — or keep it to downtown tonight?' },
      { speaker: 'customer', startSec: 32, endSec: 44, text: 'Let’s just do downtown tonight — but good to know you’re connected. Saves me repeating everything.' },
      { speaker: 'system', startSec: 44, endSec: 48, text: '[AI Copilot: Dedup detected — LEAD-006 Cars.com duplicate auto-merged to LEAD-001]' },
    ],
    summary: 'Inbound deduplication showcase — customer called about Civic at North, but already has downtown lead. Agent correctly consolidated. Copilot flagged dedup. Customer appreciates single record.',
    scores: { overall: 80, sentiment: 76, talkRatioAgent: 46, talkRatioCustomer: 54, compliance: 92, closingAttempt: 70 },
    keywords: ['dedup', 'Civic', 'Sovereign Auto Group', 'consolidated'],
    nextSteps: ['Keep single appointment — do not create duplicate opportunity'],
  },
  {
    id: 'CALL-005',
    leadId: 'LEAD-019',
    customerId: 'CUS-011',
    customerName: 'Linda Parker',
    rooftopId: 'dtown',
    direction: 'outbound',
    outcome: 'no_answer',
    durationSec: 0,
    createdAt: '2026-04-08T18:30:00Z',
    agent: 'M. Chen — BDC',
    phone: '+1-615-383-7711',
    recordingUrl: undefined,
    transcript: [],
    summary: 'No answer — 4.5hr after lead creation (F grade). Customer later bought elsewhere. Speed-to-lead failure.',
    scores: { overall: 22, sentiment: 30, talkRatioAgent: 0, talkRatioCustomer: 0, speedToLeadSec: 16200, compliance: 70, closingAttempt: 0 },
    keywords: ['no_answer', 'late_response', 'lost'],
    nextSteps: ['Coaching: BDC load balancing — this lead was orphaned in queue'],
  },
  {
    id: 'CALL-006',
    leadId: undefined, // service call, not sales lead
    customerId: 'CUS-015',
    customerName: 'Grace Kim',
    rooftopId: 'dtown',
    direction: 'outbound',
    outcome: 'connected',
    durationSec: 96,
    createdAt: '2026-04-20T09:45:00Z',
    agent: 'T. Holloway — Service Advisor',
    phone: '+1-615-555-0142',
    recordingUrl: 'https://calls.example/CALL-006.mp3',
    transcript: [
      { speaker: 'agent', startSec: 0, endSec: 14, text: 'Hi Grace, it’s Tyler in service — your Camry is on the lift. Our tech sent a video — front brakes are at 3mm and the cabin filter is clogged. Can I text you the video to review?' },
      { speaker: 'customer', startSec: 14, endSec: 22, text: 'Yes please — how much for the brakes?' },
      { speaker: 'agent', startSec: 22, endSec: 38, text: 'Pads and rotors would be $389 plus the filter $49 — I’ll send the full MPI with approve/decline buttons. No pressure, you can pick what you want.' },
    ],
    summary: 'Service MPI approval call — RO-30112. Video MPI sent, customer asked for breakdown. Advisor used digital approval flow.',
    scores: { overall: 86, sentiment: 78, talkRatioAgent: 58, talkRatioCustomer: 42, compliance: 94, closingAttempt: 82 },
    keywords: ['MPi', 'video', 'brakes', 'approve/decline'],
    nextSteps: ['Wait for digital approval — follow up in 30min if no response'],
  },
  {
    id: 'CALL-007',
    leadId: 'LEAD-002',
    customerId: 'CUS-003',
    customerName: 'Priya Nair',
    rooftopId: 'dtown',
    direction: 'outbound',
    outcome: 'connected',
    durationSec: 312,
    createdAt: '2026-04-17T09:18:40Z',
    agent: 'J. Alvarez',
    phone: '+1-615-344-7712',
    recordingUrl: 'https://calls.example/CALL-007.mp3',
    transcript: [
      { speaker: 'agent', startSec: 0, endSec: 16, text: 'Hi Priya, it’s Javier at Sovereign Toyota — you inquired about the Grand Highlander Hybrid MAX. I have the Platinum in the showroom right now.' },
      { speaker: 'customer', startSec: 16, endSec: 42, text: 'I’m actually comparing it to the BMW X5 — I have an X3 lease ending. The Grand Highlander’s third row is appealing but I love BMW driving feel. What do you have to make me switch?' },
      { speaker: 'agent', startSec: 42, endSec: 72, text: 'Great question — the Hybrid MAX has 362 horsepower and actually feels quick, plus you get Toyota resale and lower cost of ownership. Want to drive it back-to-back? I can also show you our X5 allocations at Westside.' },
      { speaker: 'customer', startSec: 72, endSec: 84, text: 'That’s helpful — let’s do a test drive today at 2pm.' },
    ],
    summary: 'Consultative call — cross-shopping BMW vs Toyota. Agent leveraged group inventory (Westside X5) as alternative. Appointment set.',
    scores: { overall: 90, sentiment: 82, talkRatioAgent: 50, talkRatioCustomer: 50, speedToLeadSec: 258, compliance: 93, closingAttempt: 88 },
    keywords: ['Grand Highlander', 'X5', 'lease', 'test drive', 'group inventory'],
    nextSteps: ['Prepare side-by-side comparison sheet', 'Alert Westside if customer prefers X5'],
  },
  {
    id: 'CALL-008',
    customerId: 'CUS-005',
    customerName: 'Sofia Martinez',
    rooftopId: 'north',
    direction: 'outbound',
    outcome: 'voicemail',
    durationSec: 38,
    createdAt: '2026-04-20T10:30:00Z',
    agent: 'D. Price — F&I',
    phone: '+1-615-203-9981',
    recordingUrl: 'https://calls.example/CALL-008.mp3',
    transcript: [
      { speaker: 'agent', startSec: 0, endSec: 35, text: 'Hi Sofia, this is Daniel in finance — we’re working on getting your Bronco approved. Can you send a recent pay stub when you have a chance? That’ll help us get you the best rate. Thanks!' },
    ],
    summary: 'F&I stip request — D-1048 subprime. Need POI for Westlake approval.',
    scores: { overall: 68, sentiment: 60, talkRatioAgent: 100, talkRatioCustomer: 0, compliance: 91, closingAttempt: 55 },
    keywords: ['pay stub', 'POI', 'Westlake', 'approval'],
    nextSteps: ['SMS stip request with secure upload link'],
  },
];

export const speedToLeadMetrics: SpeedToLeadMetric[] = [
  { period: '2026-04-14', rooftopId: 'group', leads: 4, contacted: 4, avgSec: 680, medianSec: 669, p90Sec: 1098, gradeA: 0, gradeF: 0, slaMetPct: 50 },
  { period: '2026-04-15', rooftopId: 'group', leads: 2, contacted: 2, avgSec: 588, medianSec: 588, p90Sec: 1080, gradeA: 0, gradeF: 0, slaMetPct: 0 },
  { period: '2026-04-16', rooftopId: 'group', leads: 3, contacted: 3, avgSec: 310, medianSec: 260, p90Sec: 458, gradeA: 0, gradeF: 0, slaMetPct: 66 },
  { period: '2026-04-17', rooftopId: 'group', leads: 2, contacted: 2, avgSec: 190, medianSec: 190, p90Sec: 258, gradeA: 0, gradeF: 0, slaMetPct: 100 },
  { period: '2026-04-18', rooftopId: 'group', leads: 3, contacted: 3, avgSec: 84, medianSec: 95, p90Sec: 122, gradeA: 2, gradeF: 0, slaMetPct: 100 },
  { period: '2026-04-19', rooftopId: 'group', leads: 5, contacted: 5, avgSec: 522, medianSec: 75, p90Sec: 2268, gradeA: 2, gradeF: 1, slaMetPct: 80 },
  { period: '2026-04-20', rooftopId: 'group', leads: 4, contacted: 3, avgSec: 946, medianSec: 226, p90Sec: 2268, gradeA: 1, gradeF: 2, slaMetPct: 50 },
  // by rooftop today
  { period: '2026-04-20', rooftopId: 'dtown', leads: 1, contacted: 1, avgSec: 75, medianSec: 75, p90Sec: 75, gradeA: 1, gradeF: 0, slaMetPct: 100 },
  { period: '2026-04-20', rooftopId: 'north', leads: 2, contacted: 2, avgSec: 1374, medianSec: 1374, p90Sec: 2268, gradeA: 0, gradeF: 1, slaMetPct: 50 },
  { period: '2026-04-20', rooftopId: 'westside', leads: 1, contacted: 0, avgSec: 0, medianSec: 0, p90Sec: 0, gradeA: 0, gradeF: 1, slaMetPct: 0 },
];

export const copilotSuggestions: CopilotSuggestion[] = [
  {
    id: 'COP-001',
    type: 'next_best_action',
    priority: 'high',
    title: 'Hot lead uncontacted — 22 min and counting',
    detail: 'LEAD-020 Emily Carter (BMW 330i inquiry, westside) has been “new” for 22 minutes. SLA is 5 min. Auto-assign to next BDC rep or trigger AI SMS.',
    relatedId: 'LEAD-020',
    relatedType: 'lead',
    rooftopId: 'westside',
    createdAt: '2026-04-20T16:17:00Z',
    ctaLabel: 'Assign & Call Now',
    ctaAction: 'assignLead(LEAD-020) → dial()',
  },
  {
    id: 'COP-002',
    type: 'pricing',
    priority: 'high',
    title: 'Mustang GT — 62 days, recommend $1,500 price drop to market',
    detail: 'F30881 velocity: vAuto 58, market day supply 55. Similar GTs moved at $32,500 avg. Current $33,990 is $1,490 over market. Aging watch.',
    relatedId: 'VEH-012',
    relatedType: 'vehicle',
    rooftopId: 'north',
    createdAt: '2026-04-20T07:00:00Z',
    ctaLabel: 'Apply Price Change',
    ctaAction: 'updatePrice(VEH-012, 32490)',
  },
  {
    id: 'COP-003',
    type: 'follow_up',
    priority: 'medium',
    title: 'MPI approval pending — Camry RO-30112 (Grace Kim)',
    detail: 'Video MPI viewed 2x, no approval after 35 minutes. Customer asked for brake price ($389). Nudge with single-tap approve for brakes only?',
    relatedId: 'RO-1001',
    relatedType: 'ro',
    rooftopId: 'dtown',
    createdAt: '2026-04-20T10:15:00Z',
    ctaLabel: 'Send Nudge SMS',
    ctaAction: 'sendMpiNudge(RO-1001, SMS)',
  },
  {
    id: 'COP-004',
    type: 'compliance',
    priority: 'high',
    title: 'CIT overdue — D-1050 requires adverse action notice',
    detail: 'Ally declined D-1050 (Sofia Martinez — BMW 330i). Reg B requires adverse action within 30 days. Timer: 4 days since application.',
    relatedId: 'DEAL-010',
    relatedType: 'deal',
    rooftopId: 'westside',
    createdAt: '2026-04-20T09:00:00Z',
    ctaLabel: 'Generate Adverse Action',
    ctaAction: 'generateAdverseAction(DEAL-010)',
  },
  {
    id: 'COP-005',
    type: 'coaching',
    priority: 'medium',
    title: 'Coaching — BDC talk ratio low close rate on voicemails',
    detail: 'M. Chen had 2 voicemails without closing question (“call me back” vs “what time tomorrow?”). Win rate +18% when closing question asked.',
    relatedId: 'CALL-003',
    relatedType: 'lead',
    rooftopId: 'dtown',
    createdAt: '2026-04-20T12:00:00Z',
    ctaLabel: 'View Coaching Tip',
    ctaAction: 'openCoaching(CALL-003)',
  },
  {
    id: 'COP-006',
    type: 'next_best_action',
    priority: 'medium',
    title: 'Equity mining — Linda Parker (Avalon) high equity $11,200',
    detail: 'Service drive equity alert — 2017 Avalon clean, low miles. Grand Highlander Platinum Hybrid MAX in stock (T24055). Send personalized offer?',
    relatedId: 'CUS-011',
    relatedType: 'customer',
    rooftopId: 'dtown',
    createdAt: '2026-04-14T10:30:00Z',
    ctaLabel: 'Create Offer',
    ctaAction: 'createOffer(CUS-011, VEH-007)',
  },
  {
    id: 'COP-007',
    type: 'pricing',
    priority: 'low',
    title: 'RAV4 XLE CPO — priced $600 under market, consider $400 increase',
    detail: 'T23204 vAuto 64 suggests room. CarGurus shows 3 comps at $26,400 avg. Current $25,888 is value leader — can lift front gross.',
    relatedId: 'VEH-004',
    relatedType: 'vehicle',
    rooftopId: 'dtown',
    createdAt: '2026-04-19T07:00:00Z',
    ctaLabel: 'Review Pricing',
    ctaAction: 'openPricing(VEH-004)',
  },
  {
    id: 'COP-008',
    type: 'follow_up',
    priority: 'high',
    title: 'Funding conditioned — D-1042 needs POI + residency proof',
    detail: 'USAA conditioned D-1042 (Tyler Brooks). Customer active — send stip upload link via SMS. CIT day 1/3 to funding target.',
    relatedId: 'DEAL-002',
    relatedType: 'deal',
    rooftopId: 'north',
    createdAt: '2026-04-20T12:30:00Z',
    ctaLabel: 'Send Stip Request',
    ctaAction: 'sendStipRequest(DEAL-002)',
  },
];
