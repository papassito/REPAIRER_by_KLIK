export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'CUSTOMER';

export type OrderStatus = 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'QUALITY_CHECK' 
  | 'COMPLETED' 
  | 'WAITING_PART' 
  | 'WAITING_CLIENT' 
  | 'REPAIR_COMPLETED' 
  | 'WARRANTY'
  | 'APPROVED'
  | 'AUTHORIZED'
  | 'CANCELLED'
  | 'CLOSED'
  | 'DELIVERED'
  | 'DIAGNOSED'
  | 'DIAGNOSING'
  | 'DRAFT'
  | 'ESTIMATE_PENDING'
  | 'FAILED_NO_CHANGE'
  | 'FAILED_PARTIAL'
  | 'INSPECTION'
  | 'WAITING_APPROVAL';

export type EvidenceAngle = 'front' | 'back' | 'bottom' | 'top' | 'left' | 'right' | 'internal_damage' | 'after_qc' | 'system_registry' | 'file_integrity' | 'security_log';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  dniOrTaxId?: string;
  address?: string;
  createdAt: string;
}

export interface Device {
  id: string;
  customerId: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  imei1?: string;
  imei2?: string;
  operatingSystem: string;
  color?: string;
  storage: string;
  carrier?: string;
  notes?: string;
  ram?: string;
  processor?: string;
  batteryCapacity?: string;
  technicalIdentity?: {
    adbSerial?: string;
    androidId?: string;
    buildFingerprint?: string;
    manufacturer?: string;
    product?: string;
    model?: string;
    bootloaderState?: 'LOCKED' | 'UNLOCKED';
    usbVendorId?: string;
    usbProductId?: string;
    lastConnectedAt?: string;
    connectionHistory?: Array<{
      timestamp: string;
      state: string;
      bridge: string;
      details: string;
    }>;
  };
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  location?: string;
  locationBin?: string;   // Propiedad agregada para solucionar TS2551
  warrantyDays?: number;  // Propiedad agregada para solucionar TS2339
}
interface BaseEstimateItem {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  total: number;
}

interface PartEstimateItem extends BaseEstimateItem {
  type: 'PART';
  partId: string; // Mandatory for parts
  partSku: string; // Mandatory for parts
}

interface LaborEstimateItem extends BaseEstimateItem {
  type: 'LABOR' | 'SERVICE';
  partId?: never; // Explicitly forbidden
  partSku?: never; // Explicitly forbidden
}

export type EstimateItem = PartEstimateItem | LaborEstimateItem;

export interface Estimate {
  id: string;
  versionNumber: number;
  repairOrderId: string;
  createdAt: string;
  createdBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  laborTotal: number;
  partsTotal: number;
  servicesTotal: number;
  discountTotal: number;
  taxRate: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string;
  viewedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  customerSignature?: string;
  items: EstimateItem[];
}

export interface WorkLogEntry {
  id: string;
  timestamp: string;
  technicianId: string;
  technicianName: string;
  category: 'START' | 'DISASSEMBLY' | 'REPAIR' | 'REPLACEMENT' | 'CLEANING' | 'TEST' | 'ASSEMBLY' | 'INCIDENT';
  action: string;
  notes?: string;
  toolsUsed?: string[];
  partsReplaced?: string[];
}

export interface QCItem {
  id: string;
  name: string;
  subsystem?: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_TESTED';
  notes?: string;
}

export interface QualityControlRecord {
  id: string;
  repairOrderId: string;
  performedAt: string;
  performedBy: string;
  status: 'PASSED' | 'REJECTED';
  checklist: QCItem[];
  beforeAfterComparison: {
    initialSymptom: string;
    initialFaultConfirmed: string;
    repairedSolution: string;
    postRepairValidation: string;
  };
  notes?: string;
}

export interface Payment {
  id: string;
  repairOrderId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'TRANSFER';
  reference: string;
  date: string;
  receivedBy: string;
  invoiceIssued: boolean;
}

export interface DeliveryRecord {
  deliveredAt: string;
  deliveredBy: string;
  receiverName: string;
  receiverIdentification: string;
  customerSignature: string;
  checklistSigned: boolean;
  paymentSettled: boolean;
  notes?: string;
}

export interface WarrantyRecord {
  id: string;
  repairOrderId: string;
  policyNumber: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  terms: string;
  status: 'ACTIVE' | 'EXPIRED' | 'VOID';
  claims: any[];
}

export interface RepairOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceId: string;
  deviceSummary: string;
  status: OrderStatus;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  intakeReason: string;
  receivedAccessories: string[];
  physicalCondition: string;
  createdAt: string;
  createdBy: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  evidence: Array<{
    id: string;
    repairOrderId: string;
    type: EvidenceAngle;
    fileUrl: string;
    hash: string;
    createdAt: string;
    createdBy: string;
    metadata: {
      description: string;
      damageFlagged: boolean;
      damageNotes?: string;
    };
  }>;
  checkIn: {
    id: string;
    conductedAt: string;
    conductedBy: string;
    items: Record<string, QCItem>;
    initialTechnicalSummary: string;
  };
  diagnosticSessions: DiagnosticSession[];
  findings: Finding[];
  estimates: Estimate[];
  activeEstimateId?: string;
  authorizedAt?: string;
  authorizedBy?: string;
  workLogs: WorkLogEntry[];
  partsConsumed: Array<{
    partId: string;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    consumedAt: string;
  }>;
  qualityControl?: QualityControlRecord;
  payments: Payment[];
  delivery?: DeliveryRecord;
  warranty?: WarrantyRecord;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    changedBy: string;
    comment?: string;
  }>;
}

export interface DiagnosticTest {
  id: string;
  subsystem: 'cpu' | 'memory' | 'storage' | 'battery' | 'usb' | 'display' | 'network' | 'registry' | 'services' | 'filesystem';
  name: string;
  status: 'PASS' | 'FAIL';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
  commandUsed: string;
  rawOutput?: string;
}

export interface Finding {
  id: string;
  symptom: string;
  observation: string;
  hypothesis: string;
  testConducted: string;
  testResult: string;
  conclusion: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  recommendedPartSku?: string;
}

export interface DiagnosticSession {
  id: string;
  repairOrderId: string;
  deviceId: string;
  technicianId: string;
  technicianName: string;
  bridge: 'ADB' | 'MANUAL' | 'WINDOWS_API';
  startedAt: string;
  finishedAt: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  tests: DiagnosticTest[];
  findings: Finding[];
  summary: string;
}

export interface StockMovement {
  id: string;
  partId: string;
  partSku: string;
  partName: string;
  repairOrderId?: string;
  type: 'INCOMING' | 'CONSUMPTION' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  timestamp: string;
  performedBy: string;
  reason: string;
}

export interface AuditLogEntry {
  id: string;
  repairOrderId?: string;
  timestamp: string;
  who: {
    id: string;
    name: string;
    role: string;
  };
  what: string;
  actionType: 'ORDER_CREATE' | 'CHECK_IN_INSPECTION' | 'ADB_COMMAND' | 'ESTIMATE_CREATE' | 'ESTIMATE_APPROVE' | 'PART_CONSUME' | 'QC_EVALUATION' | 'DELIVERY_CLOSE' | 'STATUS_CHANGE' | 'DEVICE_CONNECT' | 'DIAGNOSTIC_RUN' | 'EVIDENCE_UPLOAD' | 'WORKLOG_APPEND' | 'ZERO_TRUST_AUDIT' | 'SECURITY_VIOLATION' | 'COMPENSATION_RUN';
  where: string;
  why: string;
  result: 'PASS' | 'FAIL';
  command?: string;
  payloadSummary: string;
  hash: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'TECHNICIAN' | 'RECEPTION' | 'QC' | 'ADMIN' | 'CUSTOMER';
  avatarUrl?: string;
}

export type DeviceConnectionState = 'UNKNOWN' | 'USB_DETECTED' | 'ADB_UNAUTHORIZED' | 'ADB_READY' | 'DIAGNOSTIC_SESSION' | 'FASTBOOT' | 'DISCONNECTED';

export const ADB_ALLOWLIST = [
  'sys.get_os_info',
  'sys.get_services',
  'sys.get_registry_status',
  'sys.get_file_hashes',
  'sys.get_disk_health',
  'sys.verify_system_integrity'
];