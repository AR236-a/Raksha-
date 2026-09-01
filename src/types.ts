export type Language = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn' | 'pa' | 'ml';

export type AppView =
  | 'home'
  | 'emergency'
  | 'stations'
  | 'live_location'
  | 'report'
  | 'track'
  | 'missing'
  | 'traffic'
  | 'procedures'
  | 'ai_assistant'
  | 'admin';

export interface TrackedDevice {
  id: string;
  name: string;
  type: 'Citizen Device' | 'Family Member' | 'Vehicle GPS' | 'Child Watch' | 'Elderly Tracker' | 'Police Patrol Unit';
  lat: number;
  lng: number;
  accuracy: number;
  speed: number;
  altitude?: number;
  heading?: number;
  batteryLevel?: number;
  isCharging?: boolean;
  status: 'Active Beacon' | 'Safe Zone' | 'In Transit' | 'Distress / Alert' | 'Offline';
  lastUpdated: string;
  emergencyContact?: string;
  address: string;
  breadcrumbs?: { lat: number; lng: number; timestamp: string }[];
}

export type IncidentCategory =
  | 'Theft & Burglary'
  | 'Cyber Crime & Fraud'
  | 'Women Safety & Harassment'
  | 'Lost & Found Property'
  | 'Assault & Threat'
  | 'Vehicle Theft'
  | 'Vandalism & Public Nuisance'
  | 'Anonymous Tip';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'IO Assigned'
  | 'Under Investigation'
  | 'Action Taken'
  | 'Resolved'
  | 'Closed';

export interface InvestigatingOfficer {
  name: string;
  badgeNumber: string;
  rank: string;
  phone: string;
  station: string;
}

export interface ComplaintTimelineEvent {
  status: ComplaintStatus;
  timestamp: string;
  note: string;
  officer?: string;
}

export interface Complaint {
  id: string; // e.g. FIR-2026-DEL-1042
  trackingNumber: string;
  category: IncidentCategory;
  title: string;
  description: string;
  dateTime: string;
  location: {
    address: string;
    city: string;
    landmark?: string;
    lat?: number;
    lng?: number;
  };
  isAnonymous: boolean;
  complainant: {
    name: string;
    phone: string;
    email?: string;
    aadhaarLast4?: string;
  };
  suspectDetails?: string;
  vehiclePlate?: string;
  legalSections?: string[]; // e.g. ["BNS 303 (Theft)", "BNS 318 (Cheating)"]
  status: ComplaintStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  assignedOfficer?: InvestigatingOfficer;
  evidenceFiles: string[];
  audioNote?: string;
  timeline: ComplaintTimelineEvent[];
  citizenNotes?: string[];
  rating?: number;
  feedback?: string;
}

export interface PoliceStation {
  id: string;
  name: string;
  district: string;
  city: string;
  state: string;
  pincode?: string;
  zone?: 'North' | 'South' | 'West' | 'East' | 'Central' | 'Northeast';
  spOffice?: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  phone: string;
  emergencyPhone: string;
  shoName: string;
  shoRank: string;
  shoPhone: string;
  jurisdiction: string[];
  facilities: string[];
  isOpen24x7: boolean;
  rating: number;
  activePatrols: number;
  trafficStatus?: 'Smooth' | 'Moderate' | 'Heavy Congestion' | 'Slow Moving' | 'Diverted';
  trafficCongestionPercent?: number;
  trafficHelpline?: string;
  trafficControlRoom?: string;
  pcrVehicles?: number;
  liveTrafficAdvisory?: string;
  peakHours?: string;
}

export interface MissingRecord {
  id: string;
  type: 'Person' | 'Item' | 'Vehicle';
  title: string;
  name?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  height?: string;
  lastSeenDate: string;
  lastSeenLocation: string;
  city: string;
  description: string;
  identificationMarks?: string;
  itemCategory?: string;
  serialOrIMEI?: string;
  vehicleRegistration?: string;
  photoUrl: string;
  status: 'Active Search' | 'Traced' | 'Resolved';
  reportedDate: string;
  policeCaseNo: string;
  reward?: string;
  contactStation: string;
  spottedTipsCount?: number;
}

export interface TrafficReport {
  id: string;
  type: 'Congestion' | 'Illegal Parking' | 'Signal Failure' | 'Road Hazard' | 'Accident' | 'Other';
  title: string;
  location: string;
  city: string;
  lat?: number;
  lng?: number;
  description: string;
  vehicleNumber?: string;
  photoUrl?: string;
  reportedAt: string;
  status: 'Reported' | 'Traffic Patrol Dispatched' | 'Cleared';
  upvotes: number;
}

export interface EmergencySOS {
  id: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  emergencyType: 'Medical' | 'Violence/Threat' | 'Harassment' | 'Accident' | 'General SOS';
  status: 'Received' | 'Patrol Dispatched' | 'On Scene' | 'Resolved';
  dispatchedUnit?: {
    vehicleNo: string;
    officerInCharge: string;
    etaMinutes: number;
    contact: string;
  };
  batteryPercent?: number;
}

export interface LegalGuideTopic {
  id: string;
  title: string;
  shortSummary: string;
  category: 'FIR' | 'Arrest' | 'CyberCrime' | 'WomenSafety' | 'Traffic' | 'Bail' | 'NewCriminalLaws';
  keyRights: string[];
  actionSteps: string[];
  applicableLaws: {
    bns: string; // Bharatiya Nyaya Sanhita / BNSS
    ipcEquivalent?: string; // Old IPC / CrPC
    description: string;
  }[];
  faqs: { q: string; a: string }[];
}

export interface LegalGuideItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  keyRights: string[];
  steps: string[];
  sections?: string[];
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  legalCitations?: string[];
}
