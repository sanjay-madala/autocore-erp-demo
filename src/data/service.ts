/**
 * AutoCore ERP — Service (Fixed Ops)
 * Flows: F12 Service Drive & Appointments, F13 Repair Order & MPI, F14 Dispatch & Technician Efficiency
 */

export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_progress' | 'waiting_parts' | 'completed' | 'no_show' | 'cancelled';
export type TransportType = 'waiter' | 'loaner' | 'shuttle' | 'drop_off';
export type ROStatus = 'open' | 'in_progress' | 'waiting_parts' | 'waiting_approval' | 'completed' | 'invoiced' | 'cancelled';
export type ROType = 'customer_pay' | 'warranty' | 'internal' | 'recall' | 'cp_recon';
export type MpiStatus = 'green' | 'yellow' | 'red';
export type MpiCategory = 'safety' | 'maintenance' | 'wear' | 'fluid' | 'tire' | 'battery';
export type TechnicianLevel = 'A' | 'B' | 'C' | 'Lube';

export interface Technician {
  id: string;
  name: string;
  level: TechnicianLevel;
  certifications: string[];
  rooftopId: 'dtown' | 'north' | 'westside';
  efficiencyPct: number; // flagged hours / clock hours
  hoursFlaggedMTD: number;
  hoursClockedMTD: number;
  currentROs: string[];
  maxBays: number;
}

export interface ServiceAppointment {
  id: string;
  appointmentNumber: string;
  rooftopId: 'dtown' | 'north' | 'westside';
  rooftopName: string;
  customerId: string;
  customerName: string;
  phone: string;
  vehicle: { year: number; make: string; model: string; vin: string; mileage: number };
  advisor: string;
  scheduledAt: string;
  arrivalAt?: string;
  status: AppointmentStatus;
  transport: TransportType;
  concern: string; // customer stated concern
  servicesRequested: string[]; // e.g., "Oil Change", "Brake Inspection"
  loanerVehicleId?: string;
  reminderSentAt?: string;
  checkedInAt?: string;
  roId?: string; // linked RO
  promiseTime?: string;
}

export interface MpiItem {
  id: string;
  category: MpiCategory;
  item: string;
  status: MpiStatus;
  measurement?: string; // e.g., "4/32" or "12.1V"
  spec?: string;
  recommendation: string;
  laborOp?: string;
  partsRequired?: string[]; // part numbers
  laborHours?: number;
  retailAmount?: number;
  declined?: boolean;
  declinedReason?: string;
  photoUrl?: string;
  videoUrl?: string;
}

export interface VideoMpi {
  id: string;
  roId: string;
  technicianId: string;
  technicianName: string;
  videoUrl: string; // placeholder
  thumbnailUrl: string;
  durationSec: number;
  createdAt: string;
  viewedByCustomerAt?: string;
  views: number;
  itemsCovered: string[]; // mpi item ids
}

export interface DispatchEntry {
  roId: string;
  technicianId: string;
  technicianName: string;
  bay: string;
  assignedAt: string;
  startedAt?: string;
  flaggedHours: number;
  clockHours?: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'on_hold';
}

export interface RepairOrder {
  id: string;
  roNumber: string;
  appointmentId?: string;
  rooftopId: 'dtown' | 'north' | 'westside';
  rooftopName: string;
  type: ROType;
  status: ROStatus;
  customerId: string;
  customerName: string;
  vehicle: { year: number; make: string; model: string; vin: string; mileage: number };
  advisor: string;
  technicianId?: string;
  technicianName?: string;
  openedAt: string;
  promisedAt?: string;
  closedAt?: string;
  concern: string;
  cause?: string;
  correction?: string;
  mpiItems: MpiItem[];
  videoMpi?: VideoMpi;
  dispatch?: DispatchEntry;
  // Financials
  laborTotal: number;
  partsTotal: number;
  shopSupplies: number;
  tax: number;
  total: number;
  warrantyClaimNumber?: string;
  // Approval flow (F13 digital MPI approval)
  approvalStatus?: 'pending' | 'approved' | 'partially_approved' | 'declined' | 'not_required';
  approvedAt?: string;
  approvedBy?: string;
  declinedItems?: string[];
}

export const technicians: Technician[] = [
  { id: 'TECH-01', name: 'W. Schmidt — BMW Master', level: 'A', certifications: ['BMW Master', 'ASE L1'], rooftopId: 'westside', efficiencyPct: 142, hoursFlaggedMTD: 68.4, hoursClockedMTD: 48, currentROs: ['RO-1003'], maxBays: 2 },
  { id: 'TECH-02', name: 'R. Ortiz — Toyota MDT', level: 'A', certifications: ['Toyota MDT', 'Hybrid Certified'], rooftopId: 'dtown', efficiencyPct: 118, hoursFlaggedMTD: 56.2, hoursClockedMTD: 47.5, currentROs: ['RO-1001', 'RO-1005'], maxBays: 2 },
  { id: 'TECH-03', name: 'K. Nguyen — Honda Senior', level: 'B', certifications: ['Honda Master', 'ASE A1-A8'], rooftopId: 'westside', efficiencyPct: 105, hoursFlaggedMTD: 42.0, hoursClockedMTD: 40, currentROs: ['RO-1004'], maxBays: 1 },
  { id: 'TECH-04', name: 'J. Walker — Ford Senior Master', level: 'A', certifications: ['Ford Senior Master', 'Diesel Certified'], rooftopId: 'north', efficiencyPct: 131, hoursFlaggedMTD: 61.5, hoursClockedMTD: 47, currentROs: ['RO-1002'], maxBays: 2 },
  { id: 'TECH-05', name: 'D. Brooks — Lube & Recon', level: 'Lube', certifications: ['ASE G1'], rooftopId: 'dtown', efficiencyPct: 98, hoursFlaggedMTD: 32.1, hoursClockedMTD: 32.8, currentROs: [], maxBays: 1 },
  { id: 'TECH-06', name: 'A. Foster — Apprentice', level: 'C', certifications: ['ASE A5'], rooftopId: 'north', efficiencyPct: 87, hoursFlaggedMTD: 28.4, hoursClockedMTD: 32.5, currentROs: ['RO-1006'], maxBays: 1 },
];

export const serviceAppointments: ServiceAppointment[] = [
  {
    id: 'APT-001',
    appointmentNumber: 'SA-88412',
    rooftopId: 'dtown',
    rooftopName: 'Sovereign Toyota Downtown',
    customerId: 'CUS-015',
    customerName: 'Grace Kim',
    phone: '+1-615-555-0142',
    vehicle: { year: 2018, make: 'Toyota', model: 'Camry LE', vin: '4T1BF1FK6JU084412', mileage: 81200 },
    advisor: 'T. Holloway',
    scheduledAt: '2026-04-20T08:30:00Z',
    arrivalAt: '2026-04-20T08:27:00Z',
    status: 'checked_in',
    transport: 'waiter',
    concern: 'Oil change + tire rotation — also brake squeak front left',
    servicesRequested: ['Oil Change — Synthetic', 'Tire Rotation', 'Brake Inspection'],
    reminderSentAt: '2026-04-19T16:00:00Z',
    checkedInAt: '2026-04-20T08:28:00Z',
    roId: 'RO-1001',
    promiseTime: '2026-04-20T11:30:00Z',
  },
  {
    id: 'APT-002',
    appointmentNumber: 'SA-88413',
    rooftopId: 'north',
    rooftopName: 'Sovereign Ford North',
    customerId: 'CUS-004',
    customerName: 'Robert Owens',
    phone: '+1-629-881-4420',
    vehicle: { year: 2018, make: 'Ford', model: 'F-150 XLT', vin: '1FTFX1E87JKE44201', mileage: 94200 },
    advisor: 'C. Daniels',
    scheduledAt: '2026-04-20T09:00:00Z',
    status: 'scheduled',
    transport: 'drop_off',
    concern: 'Trailer brake controller fault — message on dash',
    servicesRequested: ['Diag — Trailer Brake Controller', 'Recall 23S27 Check'],
    reminderSentAt: '2026-04-19T16:00:00Z',
    promiseTime: '2026-04-20T16:00:00Z',
  },
  {
    id: 'APT-003',
    appointmentNumber: 'SA-88414',
    rooftopId: 'westside',
    rooftopName: 'Sovereign Westside (Honda / BMW / Hyundai)',
    customerId: 'CUS-012',
    customerName: 'Diego Hernandez',
    phone: '+1-615-944-3321',
    vehicle: { year: 2020, make: 'Hyundai', model: 'Tucson SEL', vin: 'KM8J33A48LU123882', mileage: 51200 },
    advisor: 'S. Park',
    scheduledAt: '2026-04-20T09:30:00Z',
    status: 'in_progress',
    transport: 'shuttle',
    concern: '45k service — check engine light intermittent',
    servicesRequested: ['45k Scheduled Maintenance', 'CEL Diagnosis'],
    checkedInAt: '2026-04-20T09:32:00Z',
    roId: 'RO-1003',
    promiseTime: '2026-04-20T15:00:00Z',
  },
  {
    id: 'APT-004',
    appointmentNumber: 'SA-88415',
    rooftopId: 'westside',
    rooftopName: 'Sovereign Westside (Honda / BMW / Hyundai)',
    customerId: 'CUS-009',
    customerName: 'Emily Carter',
    phone: '+1-615-601-2291',
    vehicle: { year: 2022, make: 'BMW', model: 'X5 xDrive40i', vin: '5UXCR6C05N9P88412', mileage: 42800 },
    advisor: 'S. Park',
    scheduledAt: '2026-04-19T14:00:00Z',
    arrivalAt: '2026-04-19T14:10:00Z',
    status: 'completed',
    transport: 'loaner',
    concern: 'Annual inspection + oil service + wiper streak',
    servicesRequested: ['Oil Service', 'Inspection II', 'Wiper Replacement'],
    checkedInAt: '2026-04-19T14:15:00Z',
    loanerVehicleId: 'LOAN-W-03 — 2024 X3',
    roId: 'RO-1004',
  },
  {
    id: 'APT-005',
    appointmentNumber: 'SA-88416',
    rooftopId: 'westside',
    rooftopName: 'Sovereign Westside (Honda / BMW / Hyundai)',
    customerId: 'CUS-003',
    customerName: 'Priya Nair',
    phone: '+1-615-344-7712',
    vehicle: { year: 2021, make: 'BMW', model: 'X3 xDrive30i', vin: '5UX53DP05M9E88412', mileage: 42800 },
    advisor: 'S. Park',
    scheduledAt: '2026-04-20T13:00:00Z',
    status: 'scheduled',
    transport: 'waiter',
    concern: 'Pre-purchase inspection — trading to Grand Highlander',
    servicesRequested: ['Pre-Purchase Inspection', 'AppraisalAssist'],
    reminderSentAt: '2026-04-19T16:00:00Z',
    promiseTime: '2026-04-20T15:00:00Z',
  },
  {
    id: 'APT-006',
    appointmentNumber: 'SA-88417',
    rooftopId: 'dtown',
    rooftopName: 'Sovereign Toyota Downtown',
    customerId: 'CUS-011',
    customerName: 'Linda Parker',
    phone: '+1-615-383-7711',
    vehicle: { year: 2017, make: 'Toyota', model: 'Avalon XLE', vin: '4T1BK1EB8HU084412', mileage: 78200 },
    advisor: 'T. Holloway',
    scheduledAt: '2026-04-14T10:00:00Z',
    arrivalAt: '2026-04-14T10:05:00Z',
    status: 'no_show', // converted to sales appointment
    transport: 'waiter',
    concern: 'Oil change — plus interested in Grand Highlander (equity mining handoff)',
    servicesRequested: ['Oil Change'],
    roId: 'RO-1000', // voided
  },
  {
    id: 'APT-007',
    appointmentNumber: 'SA-88418',
    rooftopId: 'north',
    rooftopName: 'Sovereign Ford North',
    customerId: 'CUS-014',
    customerName: 'Marcus Cole',
    phone: '+1-615-876-2014',
    vehicle: { year: 2015, make: 'Ford', model: 'F-250 XL', vin: '1FTBF2B64FEB88412', mileage: 112400 },
    advisor: 'C. Daniels',
    scheduledAt: '2026-04-20T10:30:00Z',
    status: 'scheduled',
    transport: 'drop_off',
    concern: 'Fleet — DOT inspection + brakes',
    servicesRequested: ['DOT Annual Inspection', 'Brake System Service'],
    promiseTime: '2026-04-20T17:00:00Z',
  },
];

export const repairOrders: RepairOrder[] = [
  // RO-1001 — dtown — Camry — open MPI with red/yellow/green mix + video MPI
  {
    id: 'RO-1001',
    roNumber: 'RO-30112',
    appointmentId: 'APT-001',
    rooftopId: 'dtown',
    rooftopName: 'Sovereign Toyota Downtown',
    type: 'customer_pay',
    status: 'waiting_approval',
    customerId: 'CUS-015',
    customerName: 'Grace Kim',
    vehicle: { year: 2018, make: 'Toyota', model: 'Camry LE', vin: '4T1BF1FK6JU084412', mileage: 81200 },
    advisor: 'T. Holloway',
    technicianId: 'TECH-02',
    technicianName: 'R. Ortiz — Toyota MDT',
    openedAt: '2026-04-20T08:35:00Z',
    promisedAt: '2026-04-20T11:30:00Z',
    concern: 'Brake squeak front left + scheduled maintenance',
    cause: 'Front brake pads at 3mm, rotors glazed; LF tire 4/32, rears 6/32',
    correction: 'Recommend pads/rotors + tire replacement LF (or pair) — pending approval',
    mpiItems: [
      { id: 'MPI-1001-01', category: 'safety', item: 'Front Brake Pads', status: 'red', measurement: '3mm', spec: 'Min 2mm', recommendation: 'Replace pads + resurface/replace rotors — safety', laborOp: 'BRK-F-01', partsRequired: ['04465-33150', '43512-33150 x2'], laborHours: 1.2, retailAmount: 389, photoUrl: 'https://picsum.photos/seed/mpi-brake/600/400' },
      { id: 'MPI-1001-02', category: 'tire', item: 'LF Tire Tread', status: 'yellow', measurement: '4/32"', spec: 'Replace at 3/32"', recommendation: 'Replace soon — uneven wear, alignment check', laborOp: 'TIRE-01', partsRequired: ['235/45R18 — Michelin Defender'], laborHours: 0.5, retailAmount: 189, photoUrl: 'https://picsum.photos/seed/mpi-tire/600/400' },
      { id: 'MPI-1001-03', category: 'tire', item: 'RF/RR/LR Tires', status: 'green', measurement: '6-7/32"', recommendation: 'Good — monitor', laborHours: 0, retailAmount: 0 },
      { id: 'MPI-1001-04', category: 'battery', item: 'Battery Health', status: 'yellow', measurement: '12.1V 385 CCA / 640 rated', recommendation: 'Marginal — recommend replacement within 3 months', laborOp: 'BATT-01', partsRequired: ['00544-21171-710'], laborHours: 0.3, retailAmount: 199 },
      { id: 'MPI-1001-05', category: 'fluid', item: 'Brake Fluid', status: 'yellow', measurement: '3.2% moisture', spec: '<2%', recommendation: 'Brake fluid exchange', laborOp: 'FLUSH-BR', laborHours: 0.7, retailAmount: 129 },
      { id: 'MPI-1001-06', category: 'maintenance', item: 'Cabin Air Filter', status: 'red', measurement: 'Clogged / debris', recommendation: 'Replace — air flow restricted', laborOp: 'CAF-01', partsRequired: ['87139-07010'], laborHours: 0.2, retailAmount: 49 },
      { id: 'MPI-1001-07', category: 'safety', item: 'Wiper Blades', status: 'green', recommendation: 'Good', laborHours: 0, retailAmount: 0 },
    ],
    videoMpi: {
      id: 'VID-1001',
      roId: 'RO-1001',
      technicianId: 'TECH-02',
      technicianName: 'R. Ortiz',
      videoUrl: 'https://video.example/mpi/RO-30112.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/vid-1001/320/180',
      durationSec: 87,
      createdAt: '2026-04-20T09:15:00Z',
      viewedByCustomerAt: '2026-04-20T09:40:00Z',
      views: 2,
      itemsCovered: ['MPI-1001-01', 'MPI-1001-02', 'MPI-1001-04', 'MPI-1001-06'],
    },
    dispatch: { roId: 'RO-1001', technicianId: 'TECH-02', technicianName: 'R. Ortiz — Toyota MDT', bay: 'Bay 03', assignedAt: '2026-04-20T08:40:00Z', startedAt: '2026-04-20T08:55:00Z', flaggedHours: 2.9, status: 'in_progress' },
    laborTotal: 0,
    partsTotal: 0,
    shopSupplies: 0,
    tax: 0,
    total: 0,
    approvalStatus: 'pending',
  },
  // RO-1002 — north — F-150 — waiting parts
  {
    id: 'RO-1002',
    roNumber: 'RO-40211',
    appointmentId: undefined,
    rooftopId: 'north',
    rooftopName: 'Sovereign Ford North',
    type: 'warranty',
    status: 'waiting_parts',
    customerId: 'CUS-014',
    customerName: 'Marcus Cole',
    vehicle: { year: 2015, make: 'Ford', model: 'F-250 XL', vin: '1FTBF2B64FEB88412', mileage: 112400 },
    advisor: 'C. Daniels',
    technicianId: 'TECH-04',
    technicianName: 'J. Walker — Ford Senior Master',
    openedAt: '2026-04-19T11:00:00Z',
    promisedAt: '2026-04-20T17:00:00Z',
    concern: 'DOT inspection + brake pulsation',
    cause: 'Front rotors out of spec, rear pads 2mm — DOT requires correction',
    correction: 'Replace front rotors + pads, rear pads — parts ordered',
    mpiItems: [
      { id: 'MPI-1002-01', category: 'safety', item: 'Front Rotors', status: 'red', measurement: 'Below min thickness', recommendation: 'Replace both front rotors + pads', laborOp: 'BRK-F-02', partsRequired: ['BRF-1552', 'BRF-1553'], laborHours: 1.8, retailAmount: 589 },
      { id: 'MPI-1002-02', category: 'safety', item: 'Rear Pads', status: 'red', measurement: '2mm', recommendation: 'Replace', laborOp: 'BRK-R-01', partsRequired: ['BRF-1554'], laborHours: 0.9, retailAmount: 289 },
    ],
    dispatch: { roId: 'RO-1002', technicianId: 'TECH-04', technicianName: 'J. Walker', bay: 'Bay 05 — Lift 2', assignedAt: '2026-04-19T11:15:00Z', startedAt: '2026-04-19T11:30:00Z', flaggedHours: 2.7, status: 'on_hold' },
    laborTotal: 0,
    partsTotal: 0,
    shopSupplies: 0,
    tax: 0,
    total: 0,
    warrantyClaimNumber: 'WC-F-88412',
    approvalStatus: 'approved',
    approvedAt: '2026-04-19T12:00:00Z',
    approvedBy: 'M. Cole (fleet owner)',
  },
  // RO-1003 — westside — Tucson — in progress, CEL diagnosis
  {
    id: 'RO-1003',
    roNumber: 'RO-50144',
    appointmentId: 'APT-003',
    rooftopId: 'westside',
    rooftopName: 'Sovereign Westside (Honda / BMW / Hyundai)',
    type: 'customer_pay',
    status: 'in_progress',
    customerId: 'CUS-012',
    customerName: 'Diego Hernandez',
    vehicle: { year: 2020, make: 'Hyundai', model: 'Tucson SEL', vin: 'KM8J33A48LU123882', mileage: 51200 },
    advisor: 'S. Park',
    technicianId: 'TECH-01',
    technicianName: 'W. Schmidt — BMW Master',
    openedAt: '2026-04-20T09:40:00Z',
    promisedAt: '2026-04-20T15:00:00Z',
    concern: 'Check engine light intermittent + 45k service',
    cause: 'DTC P0302 — Cylinder 2 misfire; spark plugs original 51k',
    correction: 'Replace spark plugs + coil #2, perform 45k service; MPI pending',
    mpiItems: [
      { id: 'MPI-1003-01', category: 'maintenance', item: 'Spark Plugs', status: 'red', measurement: 'Worn — gap 1.38mm spec 1.1mm', recommendation: 'Replace all 4 + coil #2', laborOp: 'ENG-SP-01', partsRequired: ['18846-11070 x4', '27301-2E601'], laborHours: 1.1, retailAmount: 345 },
      { id: 'MPI-1003-02', category: 'fluid', item: 'Transmission Fluid', status: 'yellow', measurement: 'Dark, slightly burnt', recommendation: 'Exchange — due at 60k but recommend early', laborOp: 'TRANS-EX', laborHours: 0.8, retailAmount: 199 },
      { id: 'MPI-1003-03', category: 'tire', item: 'Tires All', status: 'green', measurement: '7/32" — even', recommendation: 'Good', laborHours: 0, retailAmount: 0 },
      { id: 'MPI-1003-04', category: 'battery', item: 'Battery', status: 'green', measurement: '12.6V 580 CCA', recommendation: 'Good', laborHours: 0, retailAmount: 0 },
    ],
    dispatch: { roId: 'RO-1003', technicianId: 'TECH-01', technicianName: 'W. Schmidt', bay: 'Bay 08', assignedAt: '2026-04-20T09:45:00Z', startedAt: '2026-04-20T10:00:00Z', flaggedHours: 1.9, status: 'in_progress' },
    laborTotal: 0,
    partsTotal: 0,
    shopSupplies: 0,
    tax: 0,
    total: 0,
    approvalStatus: 'pending',
  },
  // RO-1004 — westside — X5 — completed / invoiced — high-line
  {
    id: 'RO-1004',
    roNumber: 'RO-50141',
    appointmentId: 'APT-004',
    rooftopId: 'westside',
    rooftopName: 'Sovereign Westside (Honda / BMW / Hyundai)',
    type: 'customer_pay',
    status: 'invoiced',
    customerId: 'CUS-009',
    customerName: 'Emily Carter',
    vehicle: { year: 2022, make: 'BMW', model: 'X5 xDrive40i', vin: '5UXCR6C05N9P88412', mileage: 42800 },
    advisor: 'S. Park',
    technicianId: 'TECH-03',
    technicianName: 'K. Nguyen — Honda Senior',
    openedAt: '2026-04-19T14:20:00Z',
    promisedAt: '2026-04-19T17:30:00Z',
    closedAt: '2026-04-19T17:10:00Z',
    concern: 'Oil service + inspection + wiper streak',
    cause: 'Oil service due (CBS), wipers torn, cabin filter restricted',
    correction: 'Performed oil service 5W-30 LL01, replaced wipers + cabin filter, Inspection II completed — all green except noted',
    mpiItems: [
      { id: 'MPI-1004-01', category: 'wear', item: 'Wiper Blades', status: 'red', measurement: 'Torn — streaking', recommendation: 'Replaced — BMW OE', laborOp: 'WIPER-01', partsRequired: ['61615A17503'], laborHours: 0.2, retailAmount: 89, declined: false },
      { id: 'MPI-1004-02', category: 'maintenance', item: 'Cabin Filter', status: 'yellow', measurement: 'Restricted', recommendation: 'Replaced', laborOp: 'CAF-02', partsRequired: ['64119362549'], laborHours: 0.3, retailAmount: 79, declined: false },
      { id: 'MPI-1004-03', category: 'tire', item: 'Tires', status: 'green', measurement: '6/32" — even', recommendation: 'Good', laborHours: 0, retailAmount: 0 },
      { id: 'MPI-1004-04', category: 'battery', item: 'Battery', status: 'green', measurement: '12.7V', recommendation: 'Good — AGM 92Ah', laborHours: 0, retailAmount: 0 },
      { id: 'MPI-1004-05', category: 'maintenance', item: 'Brake Fluid', status: 'yellow', measurement: 'Due per time (2yr)', recommendation: 'Customer declined — will return', laborOp: 'FLUSH-BR', laborHours: 0.7, retailAmount: 189, declined: true, declinedReason: 'Declined — time only, no symptom' },
    ],
    videoMpi: {
      id: 'VID-1004',
      roId: 'RO-1004',
      technicianId: 'TECH-03',
      technicianName: 'K. Nguyen',
      videoUrl: 'https://video.example/mpi/RO-50141.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/vid-1004/320/180',
      durationSec: 64,
      createdAt: '2026-04-19T15:30:00Z',
      viewedByCustomerAt: '2026-04-19T15:55:00Z',
      views: 1,
      itemsCovered: ['MPI-1004-01', 'MPI-1004-02', 'MPI-1004-05'],
    },
    dispatch: { roId: 'RO-1004', technicianId: 'TECH-03', technicianName: 'K. Nguyen', bay: 'Bay 06', assignedAt: '2026-04-19T14:25:00Z', startedAt: '2026-04-19T14:30:00Z', flaggedHours: 1.5, clockHours: 1.2, status: 'completed' },
    laborTotal: 289,
    partsTotal: 168,
    shopSupplies: 18,
    tax: 33,
    total: 508,
    approvalStatus: 'partially_approved',
    approvedAt: '2026-04-19T16:00:00Z',
    approvedBy: 'E. Carter',
    declinedItems: ['MPI-1004-05'],
  },
  // RO-1005 — dtown — internal recon for Highlander CPO
  {
    id: 'RO-1005',
    roNumber: 'RO-30108',
    rooftopId: 'dtown',
    rooftopName: 'Sovereign Toyota Downtown',
    type: 'cp_recon',
    status: 'completed',
    customerId: 'INTERNAL',
    customerName: 'Internal — Recon',
    vehicle: { year: 2023, make: 'Toyota', model: 'Highlander Limited AWD', vin: 'JTMAAACA4PA042118', mileage: 34210 },
    advisor: 'M. Singh',
    technicianId: 'TECH-02',
    technicianName: 'R. Ortiz',
    openedAt: '2026-04-03T08:00:00Z',
    closedAt: '2026-04-05T16:00:00Z',
    concern: 'CPO Recon — 160pt + tires, detail, windshield chip',
    cause: 'Tires 4/32 front, windshield chip, detail required for front line',
    correction: 'Replaced 2 front tires (Bridgestone Alenza), windshield repair, full detail + CPO certification. Cost $1,845 billed to Used Car Dept.',
    mpiItems: [],
    dispatch: { roId: 'RO-1005', technicianId: 'TECH-02', technicianName: 'R. Ortiz', bay: 'Recon Bay 2', assignedAt: '2026-04-03T08:10:00Z', flaggedHours: 2.4, clockHours: 2.1, status: 'completed' },
    laborTotal: 480,
    partsTotal: 865,
    shopSupplies: 0,
    tax: 0,
    total: 1345, // internal — plus $500 detail sublet = $1,845 in vehicle reconCost
    approvalStatus: 'approved',
    approvedAt: '2026-04-05T16:00:00Z',
    approvedBy: 'M. Singh',
  },
  // RO-1006 — north — apprentice job — Escape PDI (new vehicle)
  {
    id: 'RO-1006',
    roNumber: 'RO-40218',
    rooftopId: 'north',
    rooftopName: 'Sovereign Ford North',
    type: 'internal',
    status: 'in_progress',
    customerId: 'INTERNAL',
    customerName: 'Internal — PDI',
    vehicle: { year: 2025, make: 'Ford', model: 'Escape ST-Line Select AWD', vin: '1FMCU9J92PMA11842', mileage: 8 },
    advisor: 'C. Daniels',
    technicianId: 'TECH-06',
    technicianName: 'A. Foster — Apprentice',
    openedAt: '2026-04-20T08:00:00Z',
    concern: 'PDI — New vehicle delivery inspection',
    cause: '',
    correction: 'PDI checklist in progress — 12/24 items complete',
    mpiItems: [],
    dispatch: { roId: 'RO-1006', technicianId: 'TECH-06', technicianName: 'A. Foster', bay: 'PDI Lane', assignedAt: '2026-04-20T08:05:00Z', startedAt: '2026-04-20T08:10:00Z', flaggedHours: 0.8, status: 'in_progress' },
    laborTotal: 0,
    partsTotal: 0,
    shopSupplies: 0,
    tax: 0,
    total: 0,
    approvalStatus: 'not_required',
  },
];

export const repairOrdersById = Object.fromEntries(repairOrders.map(r => [r.id, r])) as Record<string, RepairOrder>;
export const appointmentsById = Object.fromEntries(serviceAppointments.map(a => [a.id, a])) as Record<string, ServiceAppointment>;
