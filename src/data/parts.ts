/**
 * AutoCore ERP — Parts (Catalog, Inventory, Wholesale, Short Sales)
 * Flows: F15 Parts Catalog & Inventory, F16 Wholesale & Fulfillment
 */

export type PartCategory = 'Maintenance' | 'Brake' | 'Engine' | 'Electrical' | 'Tires' | 'Accessories' | 'Chemicals' | 'Collision';
export type BinArea = 'A' | 'B' | 'C' | 'TIRE' | 'BULK' | 'COLLISION';
export type PartStatus = 'active' | 'superseded' | 'discontinued';

export interface BinLocation {
  area: BinArea;
  aisle: string;
  bin: string; // e.g., "A-12-04"
  onHand: number;
}

export interface Part {
  partNumber: string;
  supersededBy?: string;
  status?: PartStatus;
  description: string;
  category: PartCategory;
  make: 'Toyota' | 'Ford' | 'Honda' | 'BMW' | 'Hyundai' | 'Universal';
  // Pricing — matrix vs list demonstration (F15)
  listPrice: number; // OEM MSRP
  cost: number; // dealer cost
  matrixPrice: number; // matrix applied retail (often > list for small parts, < list for competitive)
  matrixCode: string; // e.g., "M2", "M4", "L1" (list)
  coreCharge?: number;
  // Inventory
  onHand: number;
  allocated: number; // reserved for ROs
  onOrder: number;
  minStock: number;
  maxStock: number;
  bins: BinLocation[];
  // Wholesale
  wholesalePrice?: number; // discounted for wholesale accounts
  // Velocity
  demand30: number; // units sold last 30 days
  demand12Mo: number;
  daysOfSupply: number;
  // Source
  vendor: string;
  vendorPartNumber?: string;
}

export interface WholesaleAccount {
  id: string;
  name: string;
  type: 'independent_shop' | 'body_shop' | 'fleet' | 'dealer';
  contact: string;
  phone: string;
  email: string;
  priceLevel: 'W1' | 'W2' | 'W3'; // discount tier: W1 = list -10%, W2 -15%, W3 -20%
  terms: 'COD' | 'Net 15' | 'Net 30';
  creditLimit: number;
  balanceDue: number;
  ytdPurchases: number;
  discountPct: number;
}

export interface PartsInvoiceLine {
  partNumber: string;
  description: string;
  qty: number;
  listPrice: number;
  soldPrice: number; // matrix or wholesale price actually charged
  extended: number;
}

export interface PartsInvoice {
  id: string;
  invoiceNumber: string;
  type: 'retail' | 'wholesale' | 'internal' | 'warranty';
  customerId?: string;
  customerName: string;
  wholesaleAccountId?: string;
  roNumber?: string;
  rooftopId: 'dtown' | 'north' | 'westside';
  createdAt: string;
  lines: PartsInvoiceLine[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'open' | 'posted' | 'paid' | 'voided';
  // Short sale flag (F16)
  isShortSale?: boolean;
  shortSaleNotes?: string;
}

export interface ShortSale {
  id: string;
  invoiceNumber: string;
  partNumber: string;
  description: string;
  qtyShort: number;
  reason: 'stock_out' | 'bin_error' | 'damaged' | 'vendor_backorder';
  requestedAt: string;
  promisedAt?: string;
  fulfilledAt?: string;
  status: 'open' | 'ordered' | 'fulfilled' | 'cancelled';
  customerName: string;
  roNumber?: string;
  vendorPO?: string;
}

// ── 25 parts — OEM catalog covering all 5 makes + matrix pricing showcase ──

export const parts: Part[] = [
  // Toyota
  {
    partNumber: '04152-YZZA1',
    description: 'Oil Filter — Toyota Genuine (Camry / RAV4 / Highlander 2.5L)',
    category: 'Maintenance',
    make: 'Toyota',
    listPrice: 12.95,
    cost: 6.80,
    matrixPrice: 18.95, // M4 on cheap parts: +46% over list
    matrixCode: 'M4',
    onHand: 48,
    allocated: 6,
    onOrder: 24,
    minStock: 12,
    maxStock: 48,
    bins: [{ area: 'A', aisle: '03', bin: 'A-03-12', onHand: 48 }],
    wholesalePrice: 10.95,
    demand30: 62,
    demand12Mo: 710,
    daysOfSupply: 23,
    vendor: 'Toyota Motor Sales',
  },
  {
    partNumber: '04465-33150',
    description: 'Brake Pad Set — Front (Camry / Avalon / ES350)',
    category: 'Brake',
    make: 'Toyota',
    listPrice: 89.50,
    cost: 52.30,
    matrixPrice: 129.95, // M2
    matrixCode: 'M2',
    onHand: 14,
    allocated: 2,
    onOrder: 0,
    minStock: 4,
    maxStock: 12,
    bins: [{ area: 'B', aisle: '08', bin: 'B-08-22', onHand: 14 }],
    wholesalePrice: 78.00,
    demand30: 11,
    demand12Mo: 128,
    daysOfSupply: 38,
    vendor: 'Toyota Motor Sales',
  },
  {
    partNumber: '43512-33150',
    description: 'Brake Rotor — Front (Camry 18-24)',
    category: 'Brake',
    make: 'Toyota',
    listPrice: 145.00,
    cost: 88.00,
    matrixPrice: 189.00,
    matrixCode: 'M2',
    onHand: 8,
    allocated: 2,
    onOrder: 4,
    minStock: 4,
    maxStock: 10,
    bins: [{ area: 'B', aisle: '08', bin: 'B-08-24', onHand: 8 }],
    wholesalePrice: 128.00,
    demand30: 6,
    demand12Mo: 72,
    daysOfSupply: 40,
    vendor: 'Toyota Motor Sales',
  },
  {
    partNumber: '87139-07010',
    description: 'Cabin Air Filter — Charcoal (Camry / RAV4)',
    category: 'Maintenance',
    make: 'Toyota',
    listPrice: 28.50,
    cost: 14.20,
    matrixPrice: 42.95,
    matrixCode: 'M3',
    onHand: 22,
    allocated: 1,
    onOrder: 0,
    minStock: 6,
    maxStock: 18,
    bins: [{ area: 'A', aisle: '04', bin: 'A-04-08', onHand: 22 }],
    wholesalePrice: 24.50,
    demand30: 18,
    demand12Mo: 210,
    daysOfSupply: 37,
    vendor: 'Toyota Motor Sales',
  },
  {
    partNumber: '00544-21171-710',
    description: 'Battery — TrueStart 710 CCA Group 24F',
    category: 'Electrical',
    make: 'Toyota',
    listPrice: 189.00,
    cost: 118.00,
    matrixPrice: 199.00, // near list — competitive (L1)
    matrixCode: 'L1',
    onHand: 9,
    allocated: 1,
    onOrder: 6,
    minStock: 4,
    maxStock: 10,
    bins: [{ area: 'C', aisle: '01', bin: 'C-01-04', onHand: 9 }],
    coreCharge: 18.00,
    wholesalePrice: 165.00,
    demand30: 8,
    demand12Mo: 95,
    daysOfSupply: 34,
    vendor: 'Toyota Motor Sales',
  },
  // Ford
  {
    partNumber: 'FL-500S',
    description: 'Oil Filter — Motorcraft FL-500S (F-150 / Mustang 5.0 / Explorer)',
    category: 'Maintenance',
    make: 'Ford',
    listPrice: 14.25,
    cost: 7.10,
    matrixPrice: 19.95,
    matrixCode: 'M4',
    onHand: 36,
    allocated: 4,
    onOrder: 12,
    minStock: 12,
    maxStock: 36,
    bins: [{ area: 'A', aisle: '02', bin: 'A-02-18', onHand: 36 }],
    wholesalePrice: 11.50,
    demand30: 41,
    demand12Mo: 480,
    daysOfSupply: 26,
    vendor: 'Ford Motorcraft',
  },
  {
    partNumber: 'BRF-1552',
    description: 'Brake Rotor — Front LH (F-150 21-25)',
    category: 'Brake',
    make: 'Ford',
    listPrice: 168.00,
    cost: 98.00,
    matrixPrice: 219.00,
    matrixCode: 'M2',
    onHand: 3,
    allocated: 2,
    onOrder: 4,
    minStock: 2,
    maxStock: 6,
    bins: [{ area: 'B', aisle: '10', bin: 'B-10-04', onHand: 3 }],
    wholesalePrice: 148.00,
    demand30: 4,
    demand12Mo: 52,
    daysOfSupply: 22,
    vendor: 'Ford Motorcraft',
  },
  {
    partNumber: 'BRF-1553',
    description: 'Brake Rotor — Front RH (F-150 21-25)',
    category: 'Brake',
    make: 'Ford',
    listPrice: 168.00,
    cost: 98.00,
    matrixPrice: 219.00,
    matrixCode: 'M2',
    onHand: 1, // low — triggers short sale scenario
    allocated: 1,
    onOrder: 4,
    minStock: 2,
    maxStock: 6,
    bins: [{ area: 'B', aisle: '10', bin: 'B-10-06', onHand: 1 }],
    wholesalePrice: 148.00,
    demand30: 4,
    demand12Mo: 52,
    daysOfSupply: 7,
    vendor: 'Ford Motorcraft',
  },
  {
    partNumber: 'XT-12-QULV',
    description: 'Transmission Fluid — Mercon ULV ATF (Quart)',
    category: 'Chemicals',
    make: 'Ford',
    listPrice: 12.50,
    cost: 6.90,
    matrixPrice: 16.95,
    matrixCode: 'M4',
    onHand: 24,
    allocated: 0,
    onOrder: 0,
    minStock: 12,
    maxStock: 24,
    bins: [{ area: 'A', aisle: '06', bin: 'A-06-14', onHand: 24 }],
    demand30: 14,
    demand12Mo: 160,
    daysOfSupply: 51,
    vendor: 'Ford Motorcraft',
  },
  {
    partNumber: 'SP-550',
    description: 'Spark Plug — Motorcraft SP-550 (EcoBoost 2.7/3.5)',
    category: 'Engine',
    make: 'Ford',
    listPrice: 18.75,
    cost: 10.20,
    matrixPrice: 26.95,
    matrixCode: 'M3',
    onHand: 18,
    allocated: 0,
    onOrder: 0,
    minStock: 8,
    maxStock: 24,
    bins: [{ area: 'A', aisle: '05', bin: 'A-05-10', onHand: 18 }],
    demand30: 10,
    demand12Mo: 118,
    daysOfSupply: 54,
    vendor: 'Ford Motorcraft',
  },
  // Honda
  {
    partNumber: '15400-PLM-A02',
    description: 'Oil Filter — Honda Genuine (Civic / CR-V / Accord 1.5T/2.0)',
    category: 'Maintenance',
    make: 'Honda',
    listPrice: 11.95,
    cost: 6.20,
    matrixPrice: 17.95,
    matrixCode: 'M4',
    onHand: 32,
    allocated: 3,
    onOrder: 18,
    minStock: 12,
    maxStock: 32,
    bins: [{ area: 'A', aisle: '03', bin: 'A-03-22', onHand: 32 }],
    wholesalePrice: 9.95,
    demand30: 38,
    demand12Mo: 445,
    daysOfSupply: 25,
    vendor: 'American Honda',
  },
  {
    partNumber: '45022-TVA-A00',
    description: 'Brake Pad Set — Front (Accord 18-22 / Civic 22-25)',
    category: 'Brake',
    make: 'Honda',
    listPrice: 78.50,
    cost: 44.10,
    matrixPrice: 119.95,
    matrixCode: 'M2',
    onHand: 11,
    allocated: 1,
    onOrder: 0,
    minStock: 4,
    maxStock: 10,
    bins: [{ area: 'B', aisle: '08', bin: 'B-08-18', onHand: 11 }],
    wholesalePrice: 68.00,
    demand30: 9,
    demand12Mo: 105,
    daysOfSupply: 37,
    vendor: 'American Honda',
  },
  {
    partNumber: '17220-5AA-A00',
    description: 'Air Filter — Engine (Civic 1.5T / CR-V 1.5T)',
    category: 'Maintenance',
    make: 'Honda',
    listPrice: 32.00,
    cost: 16.80,
    matrixPrice: 44.95,
    matrixCode: 'M3',
    onHand: 16,
    allocated: 0,
    onOrder: 0,
    minStock: 6,
    maxStock: 16,
    bins: [{ area: 'A', aisle: '04', bin: 'A-04-14', onHand: 16 }],
    demand30: 12,
    demand12Mo: 140,
    daysOfSupply: 40,
    vendor: 'American Honda',
  },
  // BMW — high list, matrix often below list (competitive)
  {
    partNumber: '11428507698',
    description: 'Oil Filter Kit — BMW (B48/B58 — 3/5/X3/X5)',
    category: 'Maintenance',
    make: 'BMW',
    listPrice: 28.50,
    cost: 16.40,
    matrixPrice: 34.95,
    matrixCode: 'M2',
    onHand: 18,
    allocated: 2,
    onOrder: 6,
    minStock: 6,
    maxStock: 18,
    bins: [{ area: 'A', aisle: '03', bin: 'A-03-30', onHand: 18 }],
    wholesalePrice: 25.00,
    demand30: 14,
    demand12Mo: 165,
    daysOfSupply: 39,
    vendor: 'BMW NA',
  },
  {
    partNumber: '34116867194',
    description: 'Brake Pad Set — Front (X5 G05 / X6 / 5-Series)',
    category: 'Brake',
    make: 'BMW',
    listPrice: 245.00,
    cost: 148.00,
    matrixPrice: 229.00, // BELOW list — matrix L2 (competitive, high price sensitivity)
    matrixCode: 'L2',
    onHand: 6,
    allocated: 1,
    onOrder: 2,
    minStock: 2,
    maxStock: 6,
    bins: [{ area: 'B', aisle: '12', bin: 'B-12-08', onHand: 6 }],
    wholesalePrice: 198.00,
    demand30: 3,
    demand12Mo: 38,
    daysOfSupply: 60,
    vendor: 'BMW NA',
  },
  {
    partNumber: '64119362549',
    description: 'Cabin Microfilter — Charcoal (X5 G05 / X7)',
    category: 'Maintenance',
    make: 'BMW',
    listPrice: 58.00,
    cost: 32.00,
    matrixPrice: 72.00,
    matrixCode: 'M2',
    onHand: 10,
    allocated: 1,
    onOrder: 0,
    minStock: 4,
    maxStock: 10,
    bins: [{ area: 'A', aisle: '04', bin: 'A-04-30', onHand: 10 }],
    demand30: 5,
    demand12Mo: 58,
    daysOfSupply: 60,
    vendor: 'BMW NA',
  },
  {
    partNumber: '61615A17503',
    description: 'Wiper Blade Set — Front (X5 G05)',
    category: 'Maintenance',
    make: 'BMW',
    listPrice: 68.00,
    cost: 38.50,
    matrixPrice: 72.00, // near list
    matrixCode: 'L1',
    onHand: 7,
    allocated: 0,
    onOrder: 4,
    minStock: 4,
    maxStock: 8,
    bins: [{ area: 'A', aisle: '05', bin: 'A-05-30', onHand: 7 }],
    demand30: 4,
    demand12Mo: 48,
    daysOfSupply: 52,
    vendor: 'BMW NA',
  },
  // Hyundai
  {
    partNumber: '26300-35505',
    description: 'Oil Filter — Hyundai Genuine (Palisade / Santa Fe 3.8L)',
    category: 'Maintenance',
    make: 'Hyundai',
    listPrice: 13.50,
    cost: 7.20,
    matrixPrice: 19.95,
    matrixCode: 'M4',
    onHand: 20,
    allocated: 2,
    onOrder: 12,
    minStock: 8,
    maxStock: 20,
    bins: [{ area: 'A', aisle: '03', bin: 'A-03-42', onHand: 20 }],
    wholesalePrice: 11.00,
    demand30: 16,
    demand12Mo: 185,
    daysOfSupply: 37,
    vendor: 'Hyundai Mobis',
  },
  {
    partNumber: '18846-11070',
    description: 'Spark Plug — Iridium (Tucson / Santa Fe 2.5L)',
    category: 'Engine',
    make: 'Hyundai',
    listPrice: 22.00,
    cost: 12.50,
    matrixPrice: 29.95,
    matrixCode: 'M3',
    onHand: 16,
    allocated: 4, // allocated to RO-1003 (needs 4)
    onOrder: 8,
    minStock: 8,
    maxStock: 16,
    bins: [{ area: 'A', aisle: '05', bin: 'A-05-42', onHand: 16 }],
    demand30: 8,
    demand12Mo: 92,
    daysOfSupply: 60,
    vendor: 'Hyundai Mobis',
  },
  {
    partNumber: '27301-2E601',
    description: 'Ignition Coil (Tucson 2.5L / Santa Cruz)',
    category: 'Engine',
    make: 'Hyundai',
    listPrice: 89.00,
    cost: 54.00,
    matrixPrice: 119.00,
    matrixCode: 'M2',
    onHand: 4,
    allocated: 1, // RO-1003
    onOrder: 4,
    minStock: 2,
    maxStock: 6,
    bins: [{ area: 'B', aisle: '06', bin: 'B-06-42', onHand: 4 }],
    demand30: 2,
    demand12Mo: 28,
    daysOfSupply: 60,
    vendor: 'Hyundai Mobis',
  },
  // Tires / Universal
  {
    partNumber: 'TIRE-2354518-MD',
    description: 'Tire — Michelin Defender 235/45R18 94V',
    category: 'Tires',
    make: 'Universal',
    listPrice: 189.00,
    cost: 132.00,
    matrixPrice: 199.00, // tires typically at/near list
    matrixCode: 'L1',
    onHand: 8,
    allocated: 0,
    onOrder: 4,
    minStock: 4,
    maxStock: 12,
    bins: [{ area: 'TIRE', aisle: '01', bin: 'TIRE-01-08', onHand: 8 }],
    wholesalePrice: 172.00,
    demand30: 6,
    demand12Mo: 72,
    daysOfSupply: 40,
    vendor: 'NTW / ATD',
    vendorPartNumber: 'MCH-23412',
  },
  {
    partNumber: 'BAT-24F-AGM',
    description: 'Battery — AGM Group 24F 710 CCA',
    category: 'Electrical',
    make: 'Universal',
    listPrice: 219.00,
    cost: 138.00,
    matrixPrice: 229.00,
    matrixCode: 'L1',
    onHand: 6,
    allocated: 0,
    onOrder: 4,
    minStock: 4,
    maxStock: 8,
    bins: [{ area: 'C', aisle: '01', bin: 'C-01-12', onHand: 6 }],
    coreCharge: 22.00,
    wholesalePrice: 189.00,
    demand30: 5,
    demand12Mo: 62,
    daysOfSupply: 36,
    vendor: 'Interstate',
  },
  {
    partNumber: 'CHEM-BRK-12',
    description: 'Brake Fluid — DOT 4 LV (500ml)',
    category: 'Chemicals',
    make: 'Universal',
    listPrice: 14.95,
    cost: 7.50,
    matrixPrice: 19.95,
    matrixCode: 'M4',
    onHand: 18,
    allocated: 1,
    onOrder: 0,
    minStock: 12,
    maxStock: 24,
    bins: [{ area: 'A', aisle: '06', bin: 'A-06-22', onHand: 18 }],
    demand30: 9,
    demand12Mo: 105,
    daysOfSupply: 60,
    vendor: 'WorldPac',
  },
  {
    partNumber: 'COL-BUMP-RAV4-19',
    description: 'Bumper Cover — Front Primed (RAV4 19-24)',
    category: 'Collision',
    make: 'Toyota',
    listPrice: 485.00,
    cost: 312.00,
    matrixPrice: 485.00, // collision at list (insurance)
    matrixCode: 'L1',
    onHand: 0, // special order — backorder showcase
    allocated: 0,
    onOrder: 1,
    minStock: 0,
    maxStock: 1,
    bins: [{ area: 'COLLISION', aisle: '02', bin: 'COLLISION-02-04', onHand: 0 }],
    demand30: 1,
    demand12Mo: 8,
    daysOfSupply: 0,
    vendor: 'Toyota Collision',
    status: 'active',
  },
  {
    partNumber: 'ACC-MAT-HIGH-23',
    description: 'All-Weather Floor Mat Set (Highlander 23-25)',
    category: 'Accessories',
    make: 'Toyota',
    listPrice: 189.00,
    cost: 108.00,
    matrixPrice: 189.00, // accessories at list
    matrixCode: 'L1',
    onHand: 5,
    allocated: 0,
    onOrder: 2,
    minStock: 2,
    maxStock: 6,
    bins: [{ area: 'A', aisle: '07', bin: 'A-07-12', onHand: 5 }],
    demand30: 4,
    demand12Mo: 42,
    daysOfSupply: 37,
    vendor: 'Toyota Accessories',
  },
];

export const wholesaleAccounts: WholesaleAccount[] = [
  { id: 'WS-001', name: 'Nashville Auto Tech', type: 'independent_shop', contact: 'Frank Morales', phone: '+1-615-244-8811', email: 'frank@nashvilleautotech.com', priceLevel: 'W2', terms: 'Net 15', creditLimit: 15000, balanceDue: 3420, ytdPurchases: 28400, discountPct: 15 },
  { id: 'WS-002', name: 'Music City Body & Paint', type: 'body_shop', contact: 'Tina Rhodes', phone: '+1-615-883-2290', email: 'tina@musiccitybody.com', priceLevel: 'W3', terms: 'Net 30', creditLimit: 25000, balanceDue: 8120, ytdPurchases: 45600, discountPct: 20 },
  { id: 'WS-003', name: 'Middle TN Fleet Services', type: 'fleet', contact: 'Darren Cole', phone: '+1-629-555-0144', email: 'darren@mtnfleet.com', priceLevel: 'W1', terms: 'Net 30', creditLimit: 40000, balanceDue: 12450, ytdPurchases: 88200, discountPct: 10 },
  { id: 'WS-004', name: 'EuroFix Nashville (BMW Specialist)', type: 'independent_shop', contact: 'Hans Weber', phone: '+1-615-321-7788', email: 'hans@eurofixnash.com', priceLevel: 'W2', terms: 'Net 15', creditLimit: 12000, balanceDue: 1890, ytdPurchases: 19200, discountPct: 15 },
  { id: 'WS-005', name: 'Quick Lube Plus — 5 Locations', type: 'independent_shop', contact: 'Linda Park', phone: '+1-615-399-0011', email: 'lpark@quicklubeplus.com', priceLevel: 'W3', terms: 'COD', creditLimit: 5000, balanceDue: 0, ytdPurchases: 31200, discountPct: 20 },
];

export const partsInvoices: PartsInvoice[] = [
  {
    id: 'PI-001',
    invoiceNumber: 'P-88412',
    type: 'retail',
    customerId: 'CUS-015',
    customerName: 'Grace Kim — RO-30112 (pending approval)',
    roNumber: 'RO-30112',
    rooftopId: 'dtown',
    createdAt: '2026-04-20T09:20:00Z',
    lines: [
      { partNumber: '04465-33150', description: 'Brake Pad Set — Front', qty: 1, listPrice: 89.50, soldPrice: 129.95, extended: 129.95 },
      { partNumber: '43512-33150', description: 'Brake Rotor — Front (x2)', qty: 2, listPrice: 145.00, soldPrice: 189.00, extended: 378.00 },
      { partNumber: '87139-07010', description: 'Cabin Air Filter', qty: 1, listPrice: 28.50, soldPrice: 42.95, extended: 42.95 },
      { partNumber: 'CHEM-BRK-12', description: 'Brake Fluid DOT 4 LV', qty: 1, listPrice: 14.95, soldPrice: 19.95, extended: 19.95 },
      { partNumber: '00544-21171-710', description: 'Battery TrueStart 710 CCA', qty: 1, listPrice: 189.00, soldPrice: 199.00, extended: 199.00 },
    ],
    subtotal: 769.85,
    tax: 74.68,
    total: 844.53,
    status: 'open',
  },
  {
    id: 'PI-002',
    invoiceNumber: 'P-88413',
    type: 'wholesale',
    customerName: 'Nashville Auto Tech',
    wholesaleAccountId: 'WS-001',
    rooftopId: 'dtown',
    createdAt: '2026-04-20T08:15:00Z',
    lines: [
      { partNumber: '04152-YZZA1', description: 'Oil Filter Toyota', qty: 12, listPrice: 12.95, soldPrice: 10.95, extended: 131.40 },
      { partNumber: 'FL-500S', description: 'Oil Filter Motorcraft FL-500S', qty: 6, listPrice: 14.25, soldPrice: 11.50, extended: 69.00 },
    ],
    subtotal: 200.40,
    tax: 0, // wholesale — resale exempt
    total: 200.40,
    status: 'posted',
  },
  {
    id: 'PI-003',
    invoiceNumber: 'P-88414',
    type: 'wholesale',
    customerName: 'Music City Body & Paint',
    wholesaleAccountId: 'WS-002',
    rooftopId: 'north',
    createdAt: '2026-04-19T14:00:00Z',
    lines: [
      { partNumber: 'COL-BUMP-RAV4-19', description: 'Bumper Cover — Front Primed (RAV4 19-24)', qty: 1, listPrice: 485.00, soldPrice: 388.00, extended: 388.00 }, // W3 -20%
    ],
    subtotal: 388.00,
    tax: 0,
    total: 388.00,
    status: 'open',
    isShortSale: true,
    shortSaleNotes: 'Part on backorder — customer notified, ETA 4/28 from PDC. Short sale created SS-001.',
  },
  {
    id: 'PI-004',
    invoiceNumber: 'P-88415',
    type: 'internal',
    customerName: 'Internal — Recon — RO-30108 Highlander',
    roNumber: 'RO-30108',
    rooftopId: 'dtown',
    createdAt: '2026-04-05T10:00:00Z',
    lines: [
      { partNumber: 'TIRE-2354518-MD', description: 'Tire — Michelin Defender 235/45R18', qty: 2, listPrice: 189.00, soldPrice: 132.00, extended: 264.00 }, // internal at cost
    ],
    subtotal: 264.00,
    tax: 0,
    total: 264.00,
    status: 'posted',
  },
  {
    id: 'PI-005',
    invoiceNumber: 'P-88416',
    type: 'wholesale',
    customerName: 'EuroFix Nashville',
    wholesaleAccountId: 'WS-004',
    rooftopId: 'westside',
    createdAt: '2026-04-19T16:30:00Z',
    lines: [
      { partNumber: '11428507698', description: 'Oil Filter Kit BMW B48/B58', qty: 6, listPrice: 28.50, soldPrice: 25.00, extended: 150.00 },
      { partNumber: '34116867194', description: 'Brake Pad Set Front X5 G05', qty: 1, listPrice: 245.00, soldPrice: 198.00, extended: 198.00 },
    ],
    subtotal: 348.00,
    tax: 0,
    total: 348.00,
    status: 'posted',
  },
];

export const shortSales: ShortSale[] = [
  {
    id: 'SS-001',
    invoiceNumber: 'P-88414',
    partNumber: 'COL-BUMP-RAV4-19',
    description: 'Bumper Cover — Front Primed (RAV4 19-24)',
    qtyShort: 1,
    reason: 'vendor_backorder',
    requestedAt: '2026-04-19T14:00:00Z',
    promisedAt: '2026-04-28T12:00:00Z',
    status: 'ordered',
    customerName: 'Music City Body & Paint',
    vendorPO: 'PO-77312 — Toyota PDC Memphis',
  },
  {
    id: 'SS-002',
    invoiceNumber: 'P-88412',
    partNumber: 'BRF-1553',
    description: 'Brake Rotor — Front RH (F-150 21-25)',
    qtyShort: 1,
    reason: 'stock_out',
    requestedAt: '2026-04-20T09:00:00Z',
    promisedAt: '2026-04-21T10:00:00Z',
    status: 'open',
    customerName: 'Grace Kim — RO-30112 (if approved)',
    roNumber: 'RO-30112',
    vendorPO: 'PO-77318 — Ford PDC Nashville (emergency order)',
  },
];

export const partsByNumber = Object.fromEntries(parts.map(p => [p.partNumber, p])) as Record<string, Part>;
