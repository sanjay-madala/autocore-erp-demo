/**
 * AutoCore ERP — Deals (Desking / F&I / Funding)
 * Flows: F1 Retail Cash, F3 Retail Finance, F4 Trade Appraisal, F5 Credit & Compliance, F6 F&I Menu, F7 Contracting, F8 Funding/CIT
 */

export type DealType = 'cash' | 'finance' | 'lease' | 'balloon';
export type DealFlow = 'F1' | 'F3'; // F1 = Cash/Balloon, F3 = Finance (with lender)
export type DealStatus = 'draft' | 'penciled' | 'pending_approval' | 'approved' | 'contracted' | 'funded' | 'unwound' | 'cancelled';
export type FundingStatus = 'not_submitted' | 'pending' | 'approved' | 'funded' | 'rejected' | 'conditioned';

export interface PencilScenario {
  id: string;
  label: string; // e.g., "Option A — 72mo @ 6.99%"
  termMonths: number;
  apr: number;
  downPayment: number;
  amountFinanced: number;
  monthlyPayment: number;
  totalOfPayments: number;
  lender?: string;
  isSelected?: boolean;
  // F&I inclusion toggle per pencil
  includesProducts: string[]; // product ids
  grossProfit: number;
  frontGross: number;
  backGross: number;
  reserve?: number;
}

export interface TradeDetail {
  year: number;
  make: string;
  model: string;
  vin: string;
  mileage: number;
  payoffAmount: number;
  payoffLender?: string;
  payoffGoodThrough?: string;
  acv: number; // actual cash value
  allowance: number; // what we show customer
  overAllowance?: number; // allowance - acv
  condition: 'clean' | 'average' | 'rough';
  appraisalBy: string;
  appraisalDate: string;
  reconditionEstimate: number;
}

export interface FiProductSelection {
  productId: string;
  name: string;
  category: 'vsc' | 'gap' | 'tire_wheel' | 'maintenance' | 'ppf' | 'etch' | 'appearance' | 'dent';
  termMonths?: number;
  mileage?: number;
  cost: number;
  retail: number;
  profit: number;
  selected: boolean;
  provider: string;
}

export interface Deal {
  id: string;
  dealNumber: string;
  flow: DealFlow;
  type: DealType;
  status: DealStatus;
  rooftopId: 'dtown' | 'north' | 'westside';
  rooftopName: string;
  customerId: string;
  customerName: string;
  coBuyerId?: string;
  vehicleId: string;
  stockNo: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  salePrice: number;
  msrp: number;
  discount: number;
  rebates: number;
  fees: { docFee: number; titleFee: number; tempTag: number; electronicFiling: number };
  taxes: number;
  totalSalePrice: number; // sale + fees + taxes - rebates
  trade?: TradeDetail;
  pencils: PencilScenario[];
  selectedPencilId?: string;
  fiProducts: FiProductSelection[];
  fiMenuPresentation?: {
    presentedAt: string;
    presentedBy: string;
    acceptanceRate: number; // 0-1
    menuLevel: 'A' | 'B' | 'C'; // 3-tier menu
  };
  funding: {
    status: FundingStatus;
    lender?: string;
    lenderDecision?: 'approved' | 'conditioned' | 'declined';
    aprApproved?: number;
    amountFunded?: number;
    conditions?: string[];
    submittedAt?: string;
    fundedAt?: string;
    fundedAmount?: number;
    reserveAmount?: number;
    citDays?: number; // contracts in transit days
  };
  gross: {
    front: number;
    back: number;
    total: number;
    pack: number;
    holdback: number;
  };
  salesperson: string;
  fiManager?: string;
  salesManager: string;
  createdAt: string;
  updatedAt: string;
  contractedAt?: string;
  // Compliance flags (F5)
  ofacChecked: boolean;
  redFlagsChecked: boolean;
  adverseActionNotice?: boolean;
  // eSign (F7)
  eSignStatus?: 'not_sent' | 'sent' | 'viewed' | 'signed' | 'voided';
  eSignCompletedAt?: string;
}

const FI_PRODUCTS_TPL: Omit<FiProductSelection, 'selected' | 'cost' | 'retail' | 'profit'>[] = [
  { productId: 'VSC-ELITE', name: 'Elite Vehicle Service Contract', category: 'vsc', termMonths: 84, mileage: 100000, provider: 'Zurich' },
  { productId: 'GAP-WAIVE', name: 'GAP Waiver', category: 'gap', provider: 'Allstate Dealer Services' },
  { productId: 'TIRE-WHEEL', name: 'Tire & Wheel Protection', category: 'tire_wheel', termMonths: 60, provider: 'Safe-Guard' },
  { productId: 'MAINT-45K', name: 'Prepaid Maintenance 45k', category: 'maintenance', termMonths: 36, mileage: 45000, provider: 'ToyotaCare+' },
  { productId: 'PPF-FRONT', name: 'Paint Protection Film — Front', category: 'ppf', provider: 'XPEL via Dealer' },
  { productId: 'ETCH-THEFT', name: 'Theft Deterrent / Etch', category: 'etch', provider: 'Safe-Guard' },
];

export const deals: Deal[] = [
  // ── D-1041 — F3 Finance — Highlander (dtown) — funded, 2 pencils, full menu ──
  {
    id: 'DEAL-001',
    dealNumber: 'D-1041',
    flow: 'F3',
    type: 'finance',
    status: 'funded',
    rooftopId: 'dtown',
    rooftopName: 'Sovereign Toyota Downtown',
    customerId: 'CUS-007',
    customerName: 'Aaliyah Johnson',
    coBuyerId: undefined,
    vehicleId: 'VEH-003',
    stockNo: 'T23157',
    year: 2023,
    make: 'Toyota',
    model: 'Highlander',
    trim: 'Limited AWD',
    vin: 'JTMAAACA4PA042118',
    salePrice: 36490,
    msrp: 48950,
    discount: 0,
    rebates: 0,
    fees: { docFee: 699, titleFee: 125, tempTag: 15, electronicFiling: 25 },
    taxes: 2595,
    totalSalePrice: 39924,
    trade: {
      year: 2019,
      make: 'Toyota',
      model: 'Highlander LE',
      vin: '5TDBZRFH4KS203441',
      mileage: 67800,
      payoffAmount: 11200,
      payoffLender: 'Ally',
      payoffGoodThrough: '2026-04-30',
      acv: 19800,
      allowance: 21000,
      overAllowance: 1200,
      condition: 'average',
      appraisalBy: 'M. Singh — Used Car Mgr',
      appraisalDate: '2026-04-15',
      reconditionEstimate: 890,
    },
    pencils: [
      { id: 'P-1041-A', label: 'A — 72 mo @ 7.49% • $2,500 down', termMonths: 72, apr: 7.49, downPayment: 2500, amountFinanced: 29824, monthlyPayment: 514, totalOfPayments: 37008, lender: 'Ally', isSelected: true, includesProducts: ['VSC-ELITE', 'GAP-WAIVE'], grossProfit: 3420, frontGross: 1890, backGross: 1530, reserve: 420 },
      { id: 'P-1041-B', label: 'B — 60 mo @ 6.99% • $4,000 down', termMonths: 60, apr: 6.99, downPayment: 4000, amountFinanced: 28324, monthlyPayment: 561, totalOfPayments: 33660, lender: 'Ally', includesProducts: [], grossProfit: 1890, frontGross: 1890, backGross: 0, reserve: 0 },
      { id: 'P-1041-C', label: 'C — 84 mo @ 8.29% • $1,000 down', termMonths: 84, apr: 8.29, downPayment: 1000, amountFinanced: 31324, monthlyPayment: 491, totalOfPayments: 41244, lender: 'Ally', includesProducts: ['VSC-ELITE', 'GAP-WAIVE', 'TIRE-WHEEL'], grossProfit: 4210, frontGross: 1890, backGross: 2320, reserve: 580 },
    ],
    selectedPencilId: 'P-1041-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[0], cost: 1495, retail: 2495, profit: 1000, selected: true },
      { ...FI_PRODUCTS_TPL[1], cost: 295, retail: 795, profit: 500, selected: true },
      { ...FI_PRODUCTS_TPL[2], cost: 420, retail: 895, profit: 475, selected: false },
      { ...FI_PRODUCTS_TPL[3], cost: 380, retail: 695, profit: 315, selected: false },
      { ...FI_PRODUCTS_TPL[4], cost: 650, retail: 1295, profit: 645, selected: false },
      { ...FI_PRODUCTS_TPL[5], cost: 95, retail: 299, profit: 204, selected: false },
    ],
    fiMenuPresentation: { presentedAt: '2026-04-16T15:30:00Z', presentedBy: 'L. Harmon — F&I', acceptanceRate: 0.33, menuLevel: 'B' },
    funding: { status: 'funded', lender: 'Ally', lenderDecision: 'approved', aprApproved: 7.49, amountFunded: 29824, submittedAt: '2026-04-16T16:10:00Z', fundedAt: '2026-04-18T11:00:00Z', fundedAmount: 29824, reserveAmount: 420, citDays: 2 },
    gross: { front: 1890, back: 1530, total: 3420, pack: 799, holdback: 0 },
    salesperson: 'J. Alvarez',
    fiManager: 'L. Harmon',
    salesManager: 'M. Singh',
    createdAt: '2026-04-15T14:00:00Z',
    updatedAt: '2026-04-18T11:00:00Z',
    contractedAt: '2026-04-16T16:00:00Z',
    ofacChecked: true,
    redFlagsChecked: true,
    eSignStatus: 'signed',
    eSignCompletedAt: '2026-04-16T16:45:00Z',
  },
  // D-1042 — F3 — Mustang GT — conditioned funding, trade rough
  {
    id: 'DEAL-002',
    dealNumber: 'D-1042',
    flow: 'F3',
    type: 'finance',
    status: 'contracted',
    rooftopId: 'north',
    rooftopName: 'Sovereign Ford North',
    customerId: 'CUS-010',
    customerName: 'Tyler Brooks',
    vehicleId: 'VEH-012',
    stockNo: 'F30881',
    year: 2020,
    make: 'Ford',
    model: 'Mustang',
    trim: 'GT Premium',
    vin: '1FA6P8CF1L5108842',
    salePrice: 33990,
    msrp: 45200,
    discount: 1000,
    rebates: 0,
    fees: { docFee: 699, titleFee: 125, tempTag: 15, electronicFiling: 25 },
    taxes: 2412,
    totalSalePrice: 36241,
    trade: {
      year: 2017,
      make: 'Ford',
      model: 'Mustang EcoBoost',
      vin: '1FA6P8TH0H5218842',
      mileage: 74200,
      payoffAmount: 4800,
      payoffLender: 'USAA',
      payoffGoodThrough: '2026-05-01',
      acv: 14200,
      allowance: 15000,
      overAllowance: 800,
      condition: 'rough',
      appraisalBy: 'R. Owens',
      appraisalDate: '2026-04-18',
      reconditionEstimate: 1450,
    },
    pencils: [
      { id: 'P-1042-A', label: 'A — 75 mo @ 9.49% • $1,500 down (USAA)', termMonths: 75, apr: 9.49, downPayment: 1500, amountFinanced: 26741, monthlyPayment: 472, totalOfPayments: 35400, lender: 'USAA', isSelected: true, includesProducts: ['GAP-WAIVE'], grossProfit: 2140, frontGross: 1640, backGross: 500, reserve: 280 },
      { id: 'P-1042-B', label: 'B — 60 mo @ 8.99% • $3,000 down', termMonths: 60, apr: 8.99, downPayment: 3000, amountFinanced: 25241, monthlyPayment: 524, totalOfPayments: 31440, lender: 'Ally', includesProducts: [], grossProfit: 1640, frontGross: 1640, backGross: 0, reserve: 0 },
    ],
    selectedPencilId: 'P-1042-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[0], cost: 1395, retail: 2295, profit: 900, selected: false },
      { ...FI_PRODUCTS_TPL[1], cost: 295, retail: 795, profit: 500, selected: true },
      { ...FI_PRODUCTS_TPL[2], cost: 420, retail: 895, profit: 475, selected: false },
      { ...FI_PRODUCTS_TPL[3], cost: 380, retail: 695, profit: 315, selected: false },
      { ...FI_PRODUCTS_TPL[4], cost: 650, retail: 1295, profit: 645, selected: false },
      { ...FI_PRODUCTS_TPL[5], cost: 95, retail: 299, profit: 204, selected: false },
    ],
    fiMenuPresentation: { presentedAt: '2026-04-19T11:00:00Z', presentedBy: 'D. Price — F&I', acceptanceRate: 0.16, menuLevel: 'C' },
    funding: { status: 'conditioned', lender: 'USAA', lenderDecision: 'conditioned', aprApproved: 9.49, amountFunded: 26741, conditions: ['Proof of residency — utility bill', 'POI — LES within 30 days'], submittedAt: '2026-04-19T12:00:00Z', citDays: 3 },
    gross: { front: 1640, back: 500, total: 2140, pack: 799, holdback: 0 },
    salesperson: 'T. Brooks',
    fiManager: 'D. Price',
    salesManager: 'R. Owens',
    createdAt: '2026-04-18T10:00:00Z',
    updatedAt: '2026-04-19T15:00:00Z',
    contractedAt: '2026-04-19T13:00:00Z',
    ofacChecked: true,
    redFlagsChecked: true,
    eSignStatus: 'sent',
  },
  // D-1043 — F1 Cash — Palisade (westside) — cash, no lender, etch+appearance
  {
    id: 'DEAL-003',
    dealNumber: 'D-1043',
    flow: 'F1',
    type: 'cash',
    status: 'funded',
    rooftopId: 'westside',
    rooftopName: 'Sovereign Westside (Honda / BMW / Hyundai)',
    customerId: 'CUS-006',
    customerName: 'Kenji Tanaka',
    vehicleId: 'VEH-018',
    stockNo: 'W40221',
    year: 2023,
    make: 'Hyundai',
    model: 'Palisade',
    trim: 'Calligraphy AWD',
    vin: 'KM8R5DGE2PU142088',
    salePrice: 38990,
    msrp: 52500,
    discount: 0,
    rebates: 0,
    fees: { docFee: 599, titleFee: 125, tempTag: 15, electronicFiling: 25 },
    taxes: 2768,
    totalSalePrice: 42522,
    pencils: [
      { id: 'P-1043-A', label: 'Cash — $42,522 out the door', termMonths: 1, apr: 0, downPayment: 42522, amountFinanced: 0, monthlyPayment: 0, totalOfPayments: 42522, isSelected: true, includesProducts: ['ETCH-THEFT'], grossProfit: 2680, frontGross: 2190, backGross: 490, reserve: 0 },
    ],
    selectedPencilId: 'P-1043-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[0], cost: 1495, retail: 2495, profit: 1000, selected: false },
      { ...FI_PRODUCTS_TPL[1], cost: 295, retail: 795, profit: 500, selected: false },
      { ...FI_PRODUCTS_TPL[5], cost: 95, retail: 299, profit: 204, selected: true },
      { productId: 'APPEAR-5YR', name: 'Appearance Protection 5yr', category: 'appearance', termMonths: 60, provider: 'Safe-Guard', cost: 280, retail: 695, profit: 415, selected: true },
    ],
    fiMenuPresentation: { presentedAt: '2026-04-12T14:00:00Z', presentedBy: 'K. Adams — F&I', acceptanceRate: 0.5, menuLevel: 'A' },
    funding: { status: 'funded', lender: 'Cash', lenderDecision: 'approved', fundedAt: '2026-04-12T15:00:00Z', fundedAmount: 42522, citDays: 0 },
    gross: { front: 2190, back: 490, total: 2680, pack: 699, holdback: 0 },
    salesperson: 'L. Carter',
    fiManager: 'K. Adams',
    salesManager: 'D. Nguyen',
    createdAt: '2026-04-12T10:00:00Z',
    updatedAt: '2026-04-12T15:00:00Z',
    contractedAt: '2026-04-12T14:30:00Z',
    ofacChecked: true,
    redFlagsChecked: true,
    eSignStatus: 'signed',
    eSignCompletedAt: '2026-04-12T14:50:00Z',
  },
  // D-1044 — F3 — F-150 XLT (north) — funded, commercial fleet
  {
    id: 'DEAL-004',
    dealNumber: 'D-1044',
    flow: 'F3',
    type: 'finance',
    status: 'funded',
    rooftopId: 'north',
    rooftopName: 'Sovereign Ford North',
    customerId: 'CUS-014',
    customerName: 'Marcus Cole',
    vehicleId: 'VEH-013',
    stockNo: 'F30814',
    year: 2024,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT SuperCrew 4x4',
    vin: '1FTFW1E89NKE99821',
    salePrice: 53490,
    msrp: 54995,
    discount: 1505,
    rebates: 1000,
    fees: { docFee: 699, titleFee: 125, tempTag: 15, electronicFiling: 25 },
    taxes: 3796,
    totalSalePrice: 56625,
    trade: {
      year: 2019,
      make: 'Ford',
      model: 'Transit 250',
      vin: '1FTBR1CG3KKA88412',
      mileage: 88400,
      payoffAmount: 11200,
      payoffLender: 'Ford Credit',
      payoffGoodThrough: '2026-04-28',
      acv: 16500,
      allowance: 16500,
      overAllowance: 0,
      condition: 'average',
      appraisalBy: 'R. Owens',
      appraisalDate: '2026-04-06',
      reconditionEstimate: 1200,
    },
    pencils: [
      { id: 'P-1044-A', label: 'A — 60 mo @ 6.49% • $5,000 down (Ford Credit Commercial)', termMonths: 60, apr: 6.49, downPayment: 5000, amountFinanced: 40325, monthlyPayment: 789, totalOfPayments: 47340, lender: 'Ford Credit', isSelected: true, includesProducts: ['VSC-ELITE'], grossProfit: 2890, frontGross: 1445, backGross: 1445, reserve: 510 },
    ],
    selectedPencilId: 'P-1044-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[0], cost: 1595, retail: 2795, profit: 1200, selected: true },
      { ...FI_PRODUCTS_TPL[1], cost: 295, retail: 795, profit: 500, selected: false },
      { productId: 'COMMERCIAL-GAP', name: 'Commercial GAP', category: 'gap', provider: 'Stallion', cost: 350, retail: 895, profit: 545, selected: false },
    ],
    fiMenuPresentation: { presentedAt: '2026-04-07T11:30:00Z', presentedBy: 'D. Price', acceptanceRate: 0.33, menuLevel: 'B' },
    funding: { status: 'funded', lender: 'Ford Credit Commercial', aprApproved: 6.49, amountFunded: 40325, submittedAt: '2026-04-07T13:00:00Z', fundedAt: '2026-04-11T09:00:00Z', fundedAmount: 40325, reserveAmount: 510, citDays: 4 },
    gross: { front: 1445, back: 1445, total: 2890, pack: 599, holdback: 1649 },
    salesperson: 'T. Brooks',
    fiManager: 'D. Price',
    salesManager: 'R. Owens',
    createdAt: '2026-04-06T09:00:00Z',
    updatedAt: '2026-04-11T09:00:00Z',
    contractedAt: '2026-04-07T14:00:00Z',
    ofacChecked: true,
    redFlagsChecked: true,
    eSignStatus: 'signed',
    eSignCompletedAt: '2026-04-07T14:20:00Z',
  },
  // D-1045 — F3 — BMW X5 (westside) — pending approval, high line, excellent credit
  {
    id: 'DEAL-005',
    dealNumber: 'D-1045',
    flow: 'F3',
    type: 'finance',
    status: 'pending_approval',
    rooftopId: 'westside',
    rooftopName: 'Sovereign Westside (Honda / BMW / Hyundai)',
    customerId: 'CUS-003',
    customerName: 'Priya Nair',
    vehicleId: 'VEH-017',
    stockNo: 'W50112',
    year: 2024,
    make: 'BMW',
    model: 'X5',
    trim: 'xDrive40i M Sport',
    vin: 'WBA53BH09PCM88412',
    salePrice: 71490,
    msrp: 72450,
    discount: 960,
    rebates: 0,
    fees: { docFee: 599, titleFee: 150, tempTag: 15, electronicFiling: 25 },
    taxes: 5075,
    totalSalePrice: 77354,
    trade: {
      year: 2021,
      make: 'BMW',
      model: 'X3 xDrive30i',
      vin: '5UX53DP05M9E88412',
      mileage: 42800,
      payoffAmount: 18200,
      payoffLender: 'BMW Financial',
      payoffGoodThrough: '2026-05-10',
      acv: 26800,
      allowance: 27500,
      overAllowance: 700,
      condition: 'clean',
      appraisalBy: 'W. Schmidt',
      appraisalDate: '2026-04-17',
      reconditionEstimate: 650,
    },
    pencils: [
      { id: 'P-1045-A', label: 'A — 60 mo @ 5.99% • $8,000 down (BMW FS)', termMonths: 60, apr: 5.99, downPayment: 8000, amountFinanced: 41854, monthlyPayment: 809, totalOfPayments: 48540, lender: 'BMW Financial', isSelected: true, includesProducts: ['VSC-ELITE', 'TIRE-WHEEL', 'PPF-FRONT'], grossProfit: 5120, frontGross: 3390, backGross: 1730, reserve: 620 },
      { id: 'P-1045-B', label: 'B — 72 mo @ 6.49% • $5,000 down', termMonths: 72, apr: 6.49, downPayment: 5000, amountFinanced: 44854, monthlyPayment: 754, totalOfPayments: 54288, lender: 'BMW Financial', includesProducts: ['VSC-ELITE'], grossProfit: 4390, frontGross: 3390, backGross: 1000, reserve: 400 },
      { id: 'P-1045-C', label: 'Lease — 36/10k $1,150/mo $4k DAS', termMonths: 36, apr: 5.49, downPayment: 4000, amountFinanced: 42000, monthlyPayment: 1150, totalOfPayments: 41400, lender: 'BMW Financial', includesProducts: [], grossProfit: 2980, frontGross: 2980, backGross: 0, reserve: 0 },
    ],
    selectedPencilId: 'P-1045-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[0], cost: 1895, retail: 3295, profit: 1400, selected: true },
      { ...FI_PRODUCTS_TPL[1], cost: 295, retail: 795, profit: 500, selected: false },
      { ...FI_PRODUCTS_TPL[2], cost: 520, retail: 1195, profit: 675, selected: true },
      { ...FI_PRODUCTS_TPL[4], cost: 650, retail: 1295, profit: 645, selected: true },
    ],
    funding: { status: 'pending', lender: 'BMW Financial', submittedAt: '2026-04-18T16:00:00Z' },
    gross: { front: 3390, back: 1730, total: 5120, pack: 699, holdback: 2173 },
    salesperson: 'L. Carter',
    fiManager: 'K. Adams',
    salesManager: 'D. Nguyen',
    createdAt: '2026-04-17T10:00:00Z',
    updatedAt: '2026-04-18T16:00:00Z',
    ofacChecked: true,
    redFlagsChecked: true,
    eSignStatus: 'not_sent',
  },
  // D-1046 — F1 Cash — Corolla (dtown) — draft, first pencil only
  {
    id: 'DEAL-006',
    dealNumber: 'D-1046',
    flow: 'F1',
    type: 'cash',
    status: 'draft',
    rooftopId: 'dtown',
    rooftopName: 'Sovereign Toyota Downtown',
    customerId: 'CUS-002',
    customerName: 'Darnell Washington',
    vehicleId: 'VEH-006',
    stockNo: 'T23188',
    year: 2023,
    make: 'Toyota',
    model: 'Corolla',
    trim: 'LE',
    vin: 'JTDBCMFE2P3021198',
    salePrice: 19990,
    msrp: 24500,
    discount: 0,
    rebates: 0,
    fees: { docFee: 699, titleFee: 125, tempTag: 15, electronicFiling: 25 },
    taxes: 1419,
    totalSalePrice: 22273,
    trade: {
      year: 2016,
      make: 'Ford',
      model: 'Fusion SE',
      vin: '3FA6P0H71GR284011',
      mileage: 89200,
      payoffAmount: 0,
      acv: 6200,
      allowance: 6200,
      overAllowance: 0,
      condition: 'average',
      appraisalBy: 'J. Alvarez',
      appraisalDate: '2026-04-19',
      reconditionEstimate: 1100,
    },
    pencils: [
      { id: 'P-1046-A', label: 'Cash — $22,273 OTD less trade $6,200 = $16,073 due', termMonths: 1, apr: 0, downPayment: 16073, amountFinanced: 0, monthlyPayment: 0, totalOfPayments: 16073, isSelected: true, includesProducts: [], grossProfit: 1090, frontGross: 1090, backGross: 0, reserve: 0 },
    ],
    selectedPencilId: 'P-1046-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[0], cost: 1195, retail: 1995, profit: 800, selected: false },
      { ...FI_PRODUCTS_TPL[1], cost: 295, retail: 795, profit: 500, selected: false },
    ],
    funding: { status: 'not_submitted', lender: 'Cash' },
    gross: { front: 1090, back: 0, total: 1090, pack: 799, holdback: 0 },
    salesperson: 'M. Chen',
    salesManager: 'M. Singh',
    createdAt: '2026-04-19T12:00:00Z',
    updatedAt: '2026-04-19T12:00:00Z',
    ofacChecked: false,
    redFlagsChecked: false,
    eSignStatus: 'not_sent',
  },
  // D-1047 — F3 — Tundra (dtown) — funded, shows CIT = 1 day (fast)
  {
    id: 'DEAL-007',
    dealNumber: 'D-1047',
    flow: 'F3',
    type: 'finance',
    status: 'funded',
    rooftopId: 'dtown',
    rooftopName: 'Sovereign Toyota Downtown',
    customerId: 'CUS-004',
    customerName: 'Robert Owens',
    vehicleId: 'VEH-005',
    stockNo: 'T24102',
    year: 2025,
    make: 'Toyota',
    model: 'Tundra',
    trim: 'Limited CrewMax 4x4',
    vin: '5TFMA5DB9PX089441',
    salePrice: 56990,
    msrp: 58270,
    discount: 1280,
    rebates: 1500,
    fees: { docFee: 699, titleFee: 150, tempTag: 15, electronicFiling: 25 },
    taxes: 4046,
    totalSalePrice: 60425,
    pencils: [
      { id: 'P-1047-A', label: 'A — 72 mo @ 6.99% • $10,000 down (TFS)', termMonths: 72, apr: 6.99, downPayment: 10000, amountFinanced: 50425, monthlyPayment: 860, totalOfPayments: 61920, lender: 'Toyota Financial', isSelected: true, includesProducts: ['VSC-ELITE', 'TIRE-WHEEL'], grossProfit: 3240, frontGross: 1540, backGross: 1700, reserve: 540 },
    ],
    selectedPencilId: 'P-1047-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[0], cost: 1595, retail: 2795, profit: 1200, selected: true },
      { ...FI_PRODUCTS_TPL[2], cost: 420, retail: 895, profit: 475, selected: true },
      { ...FI_PRODUCTS_TPL[4], cost: 650, retail: 1295, profit: 645, selected: false },
    ],
    fiMenuPresentation: { presentedAt: '2026-04-08T10:30:00Z', presentedBy: 'L. Harmon', acceptanceRate: 0.66, menuLevel: 'A' },
    funding: { status: 'funded', lender: 'Toyota Financial', lenderDecision: 'approved', aprApproved: 6.99, amountFunded: 50425, submittedAt: '2026-04-08T11:00:00Z', fundedAt: '2026-04-09T10:00:00Z', fundedAmount: 50425, reserveAmount: 540, citDays: 1 },
    gross: { front: 1540, back: 1700, total: 3240, pack: 499, holdback: 1165 },
    salesperson: 'S. Mitchell',
    fiManager: 'L. Harmon',
    salesManager: 'M. Singh',
    createdAt: '2026-04-08T09:00:00Z',
    updatedAt: '2026-04-09T10:00:00Z',
    contractedAt: '2026-04-08T11:30:00Z',
    ofacChecked: true,
    redFlagsChecked: true,
    eSignStatus: 'signed',
    eSignCompletedAt: '2026-04-08T12:00:00Z',
  },
  // D-1048 — F3 — Bronco (north) — penciled, awaiting customer decision, subprime
  {
    id: 'DEAL-008',
    dealNumber: 'D-1048',
    flow: 'F3',
    type: 'finance',
    status: 'penciled',
    rooftopId: 'north',
    rooftopName: 'Sovereign Ford North',
    customerId: 'CUS-005',
    customerName: 'Sofia Martinez',
    vehicleId: 'VEH-011',
    stockNo: 'F30992',
    year: 2023,
    make: 'Ford',
    model: 'Bronco',
    trim: 'Outer Banks 4-Door 4x4',
    vin: '1FTBR1CG8PKA88301',
    salePrice: 41495,
    msrp: 48200,
    discount: 0,
    rebates: 0,
    fees: { docFee: 699, titleFee: 125, tempTag: 15, electronicFiling: 25 },
    taxes: 2946,
    totalSalePrice: 45305,
    pencils: [
      { id: 'P-1048-A', label: 'A — 72 mo @ 13.49% • $3,500 down (Westlake)', termMonths: 72, apr: 13.49, downPayment: 3500, amountFinanced: 41805, monthlyPayment: 858, totalOfPayments: 61776, lender: 'Westlake Financial', isSelected: true, includesProducts: ['GAP-WAIVE'], grossProfit: 2580, frontGross: 2595, backGross: -15, reserve: 0 },
      { id: 'P-1048-B', label: 'B — 60 mo @ 12.49% • $5,000 down (CPS)', termMonths: 60, apr: 12.49, downPayment: 5000, amountFinanced: 40305, monthlyPayment: 905, totalOfPayments: 54300, lender: 'CPS', includesProducts: [], grossProfit: 2595, frontGross: 2595, backGross: 0, reserve: 0 },
    ],
    selectedPencilId: 'P-1048-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[0], cost: 1395, retail: 2295, profit: 900, selected: false },
      { ...FI_PRODUCTS_TPL[1], cost: 295, retail: 795, profit: 500, selected: true },
      { ...FI_PRODUCTS_TPL[3], cost: 380, retail: 695, profit: 315, selected: false },
    ],
    funding: { status: 'pending', lender: 'Westlake Financial', submittedAt: '2026-04-20T10:00:00Z' },
    gross: { front: 2595, back: -15, total: 2580, pack: 799, holdback: 0 },
    salesperson: 'R. Owens',
    fiManager: 'D. Price',
    salesManager: 'R. Owens',
    createdAt: '2026-04-19T18:00:00Z',
    updatedAt: '2026-04-20T10:00:00Z',
    ofacChecked: true,
    redFlagsChecked: true,
    adverseActionNotice: false,
    eSignStatus: 'not_sent',
  },
  // D-1049 — F1 Cash — Civic EX (westside) — contracted, cashier's check pending
  {
    id: 'DEAL-009',
    dealNumber: 'D-1049',
    flow: 'F1',
    type: 'cash',
    status: 'contracted',
    rooftopId: 'westside',
    rooftopName: 'Sovereign Westside (Honda / BMW / Hyundai)',
    customerId: 'CUS-015',
    customerName: 'Grace Kim',
    vehicleId: 'VEH-020',
    stockNo: 'W40174',
    year: 2021,
    make: 'Honda',
    model: 'Civic',
    trim: 'EX',
    vin: '19XFE2H58PE009812',
    salePrice: 17990,
    msrp: 24300,
    discount: 0,
    rebates: 0,
    fees: { docFee: 599, titleFee: 125, tempTag: 15, electronicFiling: 25 },
    taxes: 1277,
    totalSalePrice: 20031,
    trade: {
      year: 2018,
      make: 'Toyota',
      model: 'Camry LE',
      vin: '4T1BF1FK6JU084412',
      mileage: 81200,
      payoffAmount: 0,
      acv: 11200,
      allowance: 11500,
      overAllowance: 300,
      condition: 'average',
      appraisalBy: 'D. Nguyen',
      appraisalDate: '2026-04-11',
      reconditionEstimate: 480,
    },
    pencils: [
      { id: 'P-1049-A', label: 'Cash — $20,031 OTD — net $8,531 after trade', termMonths: 1, apr: 0, downPayment: 8531, amountFinanced: 0, monthlyPayment: 0, totalOfPayments: 8531, isSelected: true, includesProducts: ['MAINT-45K'], grossProfit: 1190, frontGross: 1190, backGross: 0, reserve: 0 },
    ],
    selectedPencilId: 'P-1049-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[3], cost: 380, retail: 695, profit: 315, selected: true },
      { ...FI_PRODUCTS_TPL[5], cost: 95, retail: 299, profit: 204, selected: false },
    ],
    fiMenuPresentation: { presentedAt: '2026-04-12T16:30:00Z', presentedBy: 'K. Adams', acceptanceRate: 0.5, menuLevel: 'B' },
    funding: { status: 'funded', lender: 'Cash', lenderDecision: 'approved', fundedAt: '2026-04-14T09:00:00Z', fundedAmount: 8531, citDays: 0 },
    gross: { front: 1190, back: 0, total: 1190, pack: 699, holdback: 0 },
    salesperson: 'K. Adams',
    fiManager: 'K. Adams',
    salesManager: 'D. Nguyen',
    createdAt: '2026-04-12T10:00:00Z',
    updatedAt: '2026-04-14T09:00:00Z',
    contractedAt: '2026-04-12T17:00:00Z',
    ofacChecked: true,
    redFlagsChecked: true,
    eSignStatus: 'signed',
    eSignCompletedAt: '2026-04-12T17:15:00Z',
  },
  // D-1050 — F3 — BMW 330i CPO (westside) — rejected funding → second look
  {
    id: 'DEAL-010',
    dealNumber: 'D-1050',
    flow: 'F3',
    type: 'finance',
    status: 'pending_approval',
    rooftopId: 'westside',
    rooftopName: 'Sovereign Westside (Honda / BMW / Hyundai)',
    customerId: 'CUS-005',
    customerName: 'Sofia Martinez',
    vehicleId: 'VEH-019',
    stockNo: 'W40198',
    year: 2022,
    make: 'BMW',
    model: '3 Series',
    trim: '330i xDrive',
    vin: 'WBA33AG05PCM20184',
    salePrice: 31790,
    msrp: 48500,
    discount: 0,
    rebates: 0,
    fees: { docFee: 599, titleFee: 125, tempTag: 15, electronicFiling: 25 },
    taxes: 2257,
    totalSalePrice: 34811,
    pencils: [
      { id: 'P-1050-A', label: 'A — 72 mo @ 11.99% • $2,000 down (Ally)', termMonths: 72, apr: 11.99, downPayment: 2000, amountFinanced: 32811, monthlyPayment: 642, totalOfPayments: 46224, lender: 'Ally', isSelected: true, includesProducts: ['GAP-WAIVE'], grossProfit: 1990, frontGross: 1990, backGross: 0, reserve: 0 },
    ],
    selectedPencilId: 'P-1050-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[0], cost: 1395, retail: 2295, profit: 900, selected: false },
      { ...FI_PRODUCTS_TPL[1], cost: 295, retail: 795, profit: 500, selected: true },
    ],
    funding: { status: 'rejected', lender: 'Ally', lenderDecision: 'declined', conditions: ['Declined — DTI 48% exceeds 45% max', 'Second look: Exeter @ 14.49% with $3,500 down'], submittedAt: '2026-04-16T10:00:00Z' },
    gross: { front: 1990, back: 0, total: 1990, pack: 699, holdback: 0 },
    salesperson: 'L. Carter',
    salesManager: 'D. Nguyen',
    createdAt: '2026-04-16T09:00:00Z',
    updatedAt: '2026-04-18T09:00:00Z',
    ofacChecked: true,
    redFlagsChecked: true,
    adverseActionNotice: true,
    eSignStatus: 'not_sent',
  },
  // D-1051 — F3 — Honda CR-V Hybrid (westside) — lease vs finance comparison, not yet contracted
  {
    id: 'DEAL-011',
    dealNumber: 'D-1051',
    flow: 'F3',
    type: 'lease',
    status: 'penciled',
    rooftopId: 'westside',
    rooftopName: 'Sovereign Westside (Honda / BMW / Hyundai)',
    customerId: 'CUS-013',
    customerName: 'Aisha Patel',
    vehicleId: 'VEH-016',
    stockNo: 'W50088',
    year: 2025,
    make: 'Honda',
    model: 'CR-V',
    trim: 'Sport Touring Hybrid',
    vin: '19XFL2H59PE012403',
    salePrice: 40750,
    msrp: 41200,
    discount: 450,
    rebates: 0,
    fees: { docFee: 599, titleFee: 150, tempTag: 15, electronicFiling: 25 },
    taxes: 2893,
    totalSalePrice: 44432,
    pencils: [
      { id: 'P-1051-A', label: 'Lease 36/12k — $589/mo $2,999 DAS (HFS)', termMonths: 36, apr: 4.9, downPayment: 2999, amountFinanced: 38000, monthlyPayment: 589, totalOfPayments: 21204, lender: 'Honda Financial', isSelected: true, includesProducts: [], grossProfit: 1890, frontGross: 1890, backGross: 0, reserve: 0 },
      { id: 'P-1051-B', label: 'Finance 60 mo @ 6.49% • $5,000 down', termMonths: 60, apr: 6.49, downPayment: 5000, amountFinanced: 39432, monthlyPayment: 771, totalOfPayments: 46260, lender: 'Honda Financial', includesProducts: ['VSC-ELITE'], grossProfit: 2680, frontGross: 1890, backGross: 790, reserve: 320 },
    ],
    selectedPencilId: 'P-1051-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[0], cost: 1495, retail: 2495, profit: 1000, selected: false },
      { productId: 'LEASE-WEAR', name: 'Lease Wear Protection', category: 'appearance', termMonths: 36, provider: 'Honda Care', cost: 380, retail: 795, profit: 415, selected: false },
    ],
    funding: { status: 'not_submitted', lender: 'Honda Financial' },
    gross: { front: 1890, back: 0, total: 1890, pack: 549, holdback: 824 },
    salesperson: 'K. Adams',
    salesManager: 'D. Nguyen',
    createdAt: '2026-04-19T09:30:00Z',
    updatedAt: '2026-04-19T09:30:00Z',
    ofacChecked: true,
    redFlagsChecked: true,
    eSignStatus: 'not_sent',
  },
  // D-1052 — F3 — Ford Escape (north) — unwound (bounced funding — stip failure)
  {
    id: 'DEAL-012',
    dealNumber: 'D-1052',
    flow: 'F3',
    type: 'finance',
    status: 'unwound',
    rooftopId: 'north',
    rooftopName: 'Sovereign Ford North',
    customerId: 'CUS-012',
    customerName: 'Diego Hernandez',
    vehicleId: 'VEH-010',
    stockNo: 'F41055',
    year: 2025,
    make: 'Ford',
    model: 'Escape',
    trim: 'ST-Line Select AWD',
    vin: '1FMCU9J92PMA11842',
    salePrice: 33200,
    msrp: 34205,
    discount: 1005,
    rebates: 500,
    fees: { docFee: 699, titleFee: 125, tempTag: 15, electronicFiling: 25 },
    taxes: 2357,
    totalSalePrice: 35921,
    trade: {
      year: 2020,
      make: 'Hyundai',
      model: 'Tucson SEL',
      vin: 'KM8J33A48LU123882',
      mileage: 51200,
      payoffAmount: 6200,
      payoffLender: 'Hyundai Motor Finance',
      payoffGoodThrough: '2026-04-25',
      acv: 14200,
      allowance: 14500,
      overAllowance: 300,
      condition: 'average',
      appraisalBy: 'R. Owens',
      appraisalDate: '2026-04-10',
      reconditionEstimate: 620,
    },
    pencils: [
      { id: 'P-1052-A', label: 'A — 72 mo @ 7.99% • $2,000 down (Ally)', termMonths: 72, apr: 7.99, downPayment: 2000, amountFinanced: 28221, monthlyPayment: 495, totalOfPayments: 35640, lender: 'Ally', isSelected: true, includesProducts: ['VSC-ELITE', 'GAP-WAIVE'], grossProfit: 2320, frontGross: 1100, backGross: 1220, reserve: 380 },
    ],
    selectedPencilId: 'P-1052-A',
    fiProducts: [
      { ...FI_PRODUCTS_TPL[0], cost: 1395, retail: 2295, profit: 900, selected: true },
      { ...FI_PRODUCTS_TPL[1], cost: 295, retail: 795, profit: 500, selected: true },
    ],
    fiMenuPresentation: { presentedAt: '2026-04-11T15:00:00Z', presentedBy: 'D. Price', acceptanceRate: 1.0, menuLevel: 'A' },
    funding: { status: 'rejected', lender: 'Ally', lenderDecision: 'declined', conditions: ['Unable to verify income — POI insufficient', 'Customer declined to provide additional docs — deal unwound 4/15'], submittedAt: '2026-04-11T16:00:00Z', citDays: 4 },
    gross: { front: 1100, back: 1220, total: 2320, pack: 599, holdback: 1026 },
    salesperson: 'T. Brooks',
    fiManager: 'D. Price',
    salesManager: 'R. Owens',
    createdAt: '2026-04-10T11:00:00Z',
    updatedAt: '2026-04-15T16:00:00Z',
    contractedAt: '2026-04-11T15:30:00Z',
    ofacChecked: true,
    redFlagsChecked: true,
    adverseActionNotice: true,
    eSignStatus: 'signed',
    eSignCompletedAt: '2026-04-11T16:00:00Z',
  },
];

export const dealsById = Object.fromEntries(deals.map(d => [d.id, d])) as Record<string, Deal>;
export const dealsByNumber = Object.fromEntries(deals.map(d => [d.dealNumber, d])) as Record<string, Deal>;
