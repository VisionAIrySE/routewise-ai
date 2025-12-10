// Mock data for demo purposes
export type UrgencyTier = 'CRITICAL' | 'URGENT' | 'SOON' | 'NORMAL';
export type Company = 'MIL' | 'IPI' | 'SIG';
export type InspectionStatus = 'PENDING' | 'PLANNED' | 'COMPLETED';
export type StopStatus = 'PLANNED' | 'COMPLETED' | 'SKIPPED';

export interface Inspection {
  id: string;
  address_key: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  fullAddress: string;
  company: Company;
  dueDate: string;
  daysRemaining: number;
  urgencyTier: UrgencyTier;
  fixedAppointment?: string;
  status: InspectionStatus;
  claimNumber: string;
  uploadBatchId?: string;
}

export interface Route {
  id: string;
  routeDate: string;
  plannedCount: number;
  completedCount: number;
  completionRate: number;
  totalEstDriveTime: number;
  totalDistanceMiles: number;
  geographicFocus: string;
  aiRecommended: boolean;
  userModified: boolean;
  routeNotes: string;
  sessionId?: string;
}

export interface RouteStop {
  id: string;
  routeId: string;
  inspectionId: string;
  stopOrder: number;
  status: StopStatus;
  inspection?: Inspection;
}

// Generate mock inspections
export const mockInspections: Inspection[] = [
  {
    id: '1',
    address_key: 'insp_001',
    street: '123 Main Street',
    city: 'Hartford',
    state: 'CT',
    zip: '06103',
    fullAddress: '123 Main Street, Hartford, CT 06103',
    company: 'MIL',
    dueDate: new Date().toISOString().split('T')[0],
    daysRemaining: 0,
    urgencyTier: 'CRITICAL',
    status: 'PENDING',
    claimNumber: 'MIL-2024-0001',
  },
  {
    id: '2',
    address_key: 'insp_002',
    street: '456 Oak Avenue',
    city: 'New Haven',
    state: 'CT',
    zip: '06511',
    fullAddress: '456 Oak Avenue, New Haven, CT 06511',
    company: 'IPI',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysRemaining: 2,
    urgencyTier: 'URGENT',
    status: 'PENDING',
    claimNumber: 'IPI-2024-0042',
  },
  {
    id: '3',
    address_key: 'insp_003',
    street: '789 Industrial Blvd',
    city: 'Bridgeport',
    state: 'CT',
    zip: '06604',
    fullAddress: '789 Industrial Blvd, Bridgeport, CT 06604',
    company: 'SIG',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysRemaining: 3,
    urgencyTier: 'URGENT',
    fixedAppointment: '2024-11-08T10:30:00',
    status: 'PLANNED',
    claimNumber: 'SIG-2024-0103',
  },
  {
    id: '4',
    address_key: 'insp_004',
    street: '321 Pine Road',
    city: 'Stamford',
    state: 'CT',
    zip: '06901',
    fullAddress: '321 Pine Road, Stamford, CT 06901',
    company: 'MIL',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysRemaining: 5,
    urgencyTier: 'SOON',
    status: 'PENDING',
    claimNumber: 'MIL-2024-0055',
  },
  {
    id: '5',
    address_key: 'insp_005',
    street: '567 Elm Street',
    city: 'Waterbury',
    state: 'CT',
    zip: '06702',
    fullAddress: '567 Elm Street, Waterbury, CT 06702',
    company: 'IPI',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysRemaining: 10,
    urgencyTier: 'NORMAL',
    status: 'PENDING',
    claimNumber: 'IPI-2024-0078',
  },
  {
    id: '6',
    address_key: 'insp_006',
    street: '890 Commerce Way',
    city: 'Danbury',
    state: 'CT',
    zip: '06810',
    fullAddress: '890 Commerce Way, Danbury, CT 06810',
    company: 'SIG',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysRemaining: 5,
    urgencyTier: 'SOON',
    fixedAppointment: '2024-11-10T14:00:00',
    status: 'PENDING',
    claimNumber: 'SIG-2024-0099',
  },
  {
    id: '7',
    address_key: 'insp_007',
    street: '234 Maple Lane',
    city: 'Norwalk',
    state: 'CT',
    zip: '06850',
    fullAddress: '234 Maple Lane, Norwalk, CT 06850',
    company: 'MIL',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysRemaining: 1,
    urgencyTier: 'URGENT',
    status: 'PENDING',
    claimNumber: 'MIL-2024-0088',
  },
  {
    id: '8',
    address_key: 'insp_008',
    street: '456 Cedar Court',
    city: 'Greenwich',
    state: 'CT',
    zip: '06830',
    fullAddress: '456 Cedar Court, Greenwich, CT 06830',
    company: 'IPI',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysRemaining: -1,
    urgencyTier: 'CRITICAL',
    status: 'PENDING',
    claimNumber: 'IPI-2024-0112',
  },
];

export const mockRoutes: Route[] = [
  {
    id: 'route_001',
    routeDate: new Date().toISOString().split('T')[0],
    plannedCount: 6,
    completedCount: 2,
    completionRate: 33,
    totalEstDriveTime: 150,
    totalDistanceMiles: 47,
    geographicFocus: 'NE Hartford Area',
    aiRecommended: true,
    userModified: false,
    routeNotes: 'Clustered 4 urgent inspections near I-95, scheduled SIG at 10:30 as midpoint anchor.',
  },
  {
    id: 'route_002',
    routeDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    plannedCount: 5,
    completedCount: 0,
    completionRate: 0,
    totalEstDriveTime: 120,
    totalDistanceMiles: 38,
    geographicFocus: 'New Haven Region',
    aiRecommended: true,
    userModified: false,
    routeNotes: 'Optimized for morning start, avoiding highway traffic.',
  },
];

export const mockRouteStops: RouteStop[] = [
  { id: 'stop_001', routeId: 'route_001', inspectionId: '1', stopOrder: 1, status: 'COMPLETED' },
  { id: 'stop_002', routeId: 'route_001', inspectionId: '2', stopOrder: 2, status: 'COMPLETED' },
  { id: 'stop_003', routeId: 'route_001', inspectionId: '3', stopOrder: 3, status: 'PLANNED' },
  { id: 'stop_004', routeId: 'route_001', inspectionId: '4', stopOrder: 4, status: 'PLANNED' },
  { id: 'stop_005', routeId: 'route_001', inspectionId: '7', stopOrder: 5, status: 'PLANNED' },
  { id: 'stop_006', routeId: 'route_001', inspectionId: '8', stopOrder: 6, status: 'PLANNED' },
];

// Helper functions
export function getUrgencyColor(tier: UrgencyTier): string {
  switch (tier) {
    case 'CRITICAL': return 'critical';
    case 'URGENT': return 'urgent';
    case 'SOON': return 'soon';
    case 'NORMAL': return 'normal';
  }
}

export function getCompanyBadgeVariant(company: Company): 'default' | 'secondary' | 'outline' {
  switch (company) {
    case 'MIL': return 'default';
    case 'IPI': return 'secondary';
    case 'SIG': return 'outline';
  }
}
