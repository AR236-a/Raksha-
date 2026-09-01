import {
  PoliceStation,
  Complaint,
  MissingRecord,
  TrafficReport,
  LegalGuideTopic,
} from '../types';
import { allIndiaPoliceStations } from '../services/locationPredictor';

export const initialPoliceStations: PoliceStation[] = allIndiaPoliceStations;

export const initialComplaints: Complaint[] = [
  {
    id: 'FIR-2026-DEL-1042',
    trackingNumber: 'FIR-2026-DEL-1042',
    category: 'Cyber Crime & Fraud',
    title: 'Unauthorized UPI debit after impersonation call',
    description:
      'Complainant received a phone call pretending to be electricity board officer warning power cutoff in 30 minutes. Asked to download QuickSupport app and execute test transaction of ₹10. Subsequently ₹85,000 was debited in 3 transactions from SBI account.',
    dateTime: '2026-08-28 14:15',
    location: {
      address: 'Pocket B, Mayur Vihar Phase 2',
      city: 'New Delhi',
      landmark: 'Near Neelam Mata Mandir',
      lat: 28.6189,
      lng: 77.3012,
    },
    isAnonymous: false,
    complainant: {
      name: 'Amitabh Sen',
      phone: '+91 98110 44211',
      email: 'amitabh.sen88@gmail.com',
      aadhaarLast4: '4892',
    },
    suspectDetails: 'Phone +91 92341 88921, Fake name: Rahul Verma (Electricity Dept)',
    legalSections: ['BNS Section 318(4) (Cheating by Impersonation)', 'Information Technology Act Section 66D'],
    status: 'Under Investigation',
    priority: 'High',
    assignedOfficer: {
      name: 'Sub-Inspector Rohit Vashisht',
      badgeNumber: 'DL-PSI-8912',
      rank: 'Sub-Inspector (Cyber Wing)',
      phone: '+91 98119 55443',
      station: 'Central Cyber Police Station, New Delhi',
    },
    evidenceFiles: ['bank_statement_august.pdf', 'fraud_sms_screenshot.png', 'call_recording.mp3'],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-08-28 14:40',
        note: 'e-FIR submitted via Rakshak Citizen Portal with digital signature verification.',
      },
      {
        status: 'Under Review',
        timestamp: '2026-08-28 15:10',
        note: 'Complaint reviewed by Cyber Cell Control Desk. 1930 Portal ticket synchronized.',
      },
      {
        status: 'IO Assigned',
        timestamp: '2026-08-28 16:30',
        note: 'Assigned to SI Rohit Vashisht for swift bank account freeze under BNSS Section 106.',
        officer: 'Inspector Rajesh Sharma (SHO)',
      },
      {
        status: 'Under Investigation',
        timestamp: '2026-08-29 11:20',
        note: 'Bank notice dispatched to beneficiary account. ₹62,000 put on hold in mule account by SBI Cyber Nodal Team.',
        officer: 'SI Rohit Vashisht',
      },
    ],
    citizenNotes: ['Submitted secondary bank transaction UTR numbers on 29th Aug.'],
  },
  {
    id: 'FIR-2026-MH-4921',
    trackingNumber: 'FIR-2026-MH-4921',
    category: 'Theft & Burglary',
    title: 'Two-wheeler theft outside Metro Station Parking',
    description:
      'Honda Activa 6G (Black, Registration MH 02 EG 8412) parked at designated roadside parking at 08:30 AM. Found missing upon return at 18:45 PM. Handle lock was engaged.',
    dateTime: '2026-08-27 18:45',
    location: {
      address: 'Opposite Bandra Metro Station Pillar 42',
      city: 'Mumbai',
      landmark: 'Near Sagar Sweets',
      lat: 19.0602,
      lng: 72.8361,
    },
    isAnonymous: false,
    complainant: {
      name: 'Pooja Deshmukh',
      phone: '+91 98205 11990',
      email: 'pdeshmukh92@yahoo.com',
      aadhaarLast4: '7123',
    },
    vehiclePlate: 'MH 02 EG 8412',
    legalSections: ['BNS Section 303(2) (Theft of Motor Vehicle)'],
    status: 'IO Assigned',
    priority: 'Medium',
    assignedOfficer: {
      name: 'Assistant Sub-Inspector Tanaji Shinde',
      badgeNumber: 'MH-ASI-3341',
      rank: 'Assistant Sub-Inspector',
      phone: '+91 98209 88771',
      station: 'Bandra West Police Station, Mumbai',
    },
    evidenceFiles: ['rc_book_copy.jpg', 'insurance_policy.pdf', 'cctv_footage_clip.mp4'],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-08-27 19:30',
        note: 'Online report filed with scanned Registration Certificate.',
      },
      {
        status: 'Under Review',
        timestamp: '2026-08-27 20:15',
        note: 'Checked against stolen vehicle blacklist and automated toll plaza ANPR cameras.',
      },
      {
        status: 'IO Assigned',
        timestamp: '2026-08-28 09:30',
        note: 'ASI Tanaji Shinde requisitioned CCTV footage from Metro Authority.',
        officer: 'Sr. PI Vikram Kadam',
      },
    ],
  },
  {
    id: 'FIR-2026-KA-7730',
    trackingNumber: 'FIR-2026-KA-7730',
    category: 'Women Safety & Harassment',
    title: 'Stalking and repeated harassment along commute path',
    description:
      'Complainant reported an unknown person on a red motorcycle following her daily from metro station to apartment complex between 8 PM and 9 PM for the past 3 days and passing objectionable remarks.',
    dateTime: '2026-08-30 20:30',
    location: {
      address: '12th Main Road, HAL 2nd Stage',
      city: 'Bengaluru',
      landmark: 'Near Defence Colony Arch',
      lat: 12.9755,
      lng: 77.6431,
    },
    isAnonymous: false,
    complainant: {
      name: 'Ananya Rao',
      phone: '+91 94801 33221',
      email: 'ananya.rao_blr@gmail.com',
    },
    suspectDetails: 'Male, approx 25-30 yrs, black jacket, Red Pulsar bike with partially obscured plate',
    legalSections: ['BNS Section 78 (Stalking)', 'BNS Section 79 (Word, gesture or act intended to insult modesty of woman)'],
    status: 'Action Taken',
    priority: 'Emergency',
    assignedOfficer: {
      name: 'Woman Sub-Inspector Geetha Gowda',
      badgeNumber: 'KA-WSI-1109',
      rank: 'Sub-Inspector (Pink Patrol Wing)',
      phone: '+91 94808 22119',
      station: 'Indiranagar Police Station, Bengaluru',
    },
    evidenceFiles: ['bike_rear_photo.jpg'],
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-08-30 21:00',
        note: 'Immediate high-priority alert received at Women Helpdesk.',
      },
      {
        status: 'IO Assigned',
        timestamp: '2026-08-30 21:15',
        note: 'Assigned to WSI Geetha Gowda. Immediate Pink Patrol deployment ordered.',
      },
      {
        status: 'Action Taken',
        timestamp: '2026-08-31 08:30',
        note: 'Patrol intensified between 7:30 PM and 10 PM. Suspect identified via commercial complex CCTV and detained for questioning.',
        officer: 'WSI Geetha Gowda',
      },
    ],
  },
];

export const initialMissingRecords: MissingRecord[] = [
  {
    id: 'MIS-2026-091',
    type: 'Person',
    title: 'Missing Elderly Citizen - Rameshwar Prasad Sharma',
    name: 'Rameshwar Prasad Sharma',
    age: 74,
    gender: 'Male',
    height: "5'6\" (168 cm)",
    lastSeenDate: '2026-08-29 16:30',
    lastSeenLocation: 'Near Lodhi Gardens Main Gate, New Delhi',
    city: 'New Delhi',
    description: 'Patient suffers from mild Alzheimer’s. Speaks Hindi and English. Was wearing a white kurta-pyjama with brown Nehru jacket and black sandals.',
    identificationMarks: 'Old scar mark on left forehead, wears gold-rimmed reading spectacles.',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    status: 'Active Search',
    reportedDate: '2026-08-29',
    policeCaseNo: 'MIS-NCR-2026-8819',
    reward: '₹25,000 for verified information',
    contactStation: 'Tughlak Road Police Station, New Delhi (011-23014123)',
    spottedTipsCount: 3,
  },
  {
    id: 'MIS-2026-104',
    type: 'Person',
    title: 'Missing Boy - Aarav Patel (Age 9)',
    name: 'Aarav Patel',
    age: 9,
    gender: 'Male',
    height: "4'2\" (127 cm)",
    lastSeenDate: '2026-08-30 17:15',
    lastSeenLocation: 'Public Park, Sector 15, Vashi, Navi Mumbai',
    city: 'Navi Mumbai',
    description: 'Was playing cricket with friends in society park. Wearing yellow t-shirt, blue denim shorts, and red sports shoes. Speaks Hindi, Marathi, and English.',
    identificationMarks: 'Birthmark near right ear.',
    photoUrl: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=400&auto=format&fit=crop&q=80',
    status: 'Active Search',
    reportedDate: '2026-08-30',
    policeCaseNo: 'AMBER-MH-2026-114',
    reward: '₹50,000 for critical lead',
    contactStation: 'Vashi Police Station (022-27821100)',
    spottedTipsCount: 8,
  },
  {
    id: 'MIS-2026-218',
    type: 'Item',
    title: 'Lost Leather Bag with Laptop & Passport',
    itemCategory: 'Electronics & Travel Documents',
    serialOrIMEI: 'MacBook Pro M2 (Serial: C02G8419MD6R)',
    lastSeenDate: '2026-08-28 21:00',
    lastSeenLocation: 'Auto-rickshaw from Indiranagar Metro to Koramangala 4th Block',
    city: 'Bengaluru',
    description: 'Brown leather messenger bag containing Apple MacBook Pro, Indian Passport (No. Z4892110), work diary, and prescription spectacles in black case.',
    photoUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
    status: 'Active Search',
    reportedDate: '2026-08-28',
    policeCaseNo: 'LA-BLR-2026-3391',
    reward: '₹10,000 token of gratitude',
    contactStation: 'Indiranagar Police Station (080-22942542)',
    spottedTipsCount: 1,
  },
  {
    id: 'MIS-2026-305',
    type: 'Vehicle',
    title: 'Stolen Royal Enfield Hunter 350 (Dapper Ash)',
    itemCategory: 'Motorcycle',
    vehicleRegistration: 'DL 03 CA 9021',
    serialOrIMEI: 'Chassis No: ME3J3540PA198211',
    lastSeenDate: '2026-08-26 22:30',
    lastSeenLocation: 'Outside Saket District Centre, New Delhi',
    city: 'New Delhi',
    description: 'Dapper Ash color, fitted with custom black crash guard and brown touring seat. Single owner.',
    photoUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=80',
    status: 'Active Search',
    reportedDate: '2026-08-27',
    policeCaseNo: 'FIR-STN-2026-778',
    contactStation: 'Saket Police Station (011-29561001)',
    spottedTipsCount: 2,
  },
];

export const initialTrafficReports: TrafficReport[] = [
  {
    id: 'TRF-2026-4401',
    type: 'Signal Failure',
    title: 'Traffic light dead at major junction causing 4-way gridlock',
    location: 'ITO Intersection, Ring Road towards Delhi Gate',
    city: 'New Delhi',
    lat: 28.6289,
    lng: 77.2415,
    description: 'Traffic signals completely non-functional following rain. Vehicles stuck in cross-junction. Immediate traffic marshal required.',
    reportedAt: '15 mins ago',
    status: 'Traffic Patrol Dispatched',
    upvotes: 24,
  },
  {
    id: 'TRF-2026-4402',
    type: 'Illegal Parking',
    title: 'Double parking blocking emergency ambulance lane',
    location: 'Outside KEM Hospital, Parel',
    city: 'Mumbai',
    lat: 19.0034,
    lng: 72.8421,
    description: '3 private commercial vehicles parked in the dedicated ambulance drop-off lane preventing emergency patient transfer.',
    vehicleNumber: 'MH 01 CR 5541',
    reportedAt: '32 mins ago',
    status: 'Reported',
    upvotes: 18,
  },
  {
    id: 'TRF-2026-4403',
    type: 'Road Hazard',
    title: 'Deep unbarricaded road trench after water pipeline work',
    location: '100 Feet Road, HAL 2nd Stage, near 12th Main',
    city: 'Bengaluru',
    lat: 12.9778,
    lng: 77.6419,
    description: 'Water board trench left open without reflective cones or warning tape. Poses extreme threat to two-wheeler riders after dark.',
    reportedAt: '1 hour ago',
    status: 'Reported',
    upvotes: 41,
  },
];

export const legalGuideTopics: LegalGuideTopic[] = [
  {
    id: 'zero-fir',
    title: 'Zero FIR: Filing a Complaint at ANY Police Station',
    category: 'FIR',
    shortSummary: 'You have the fundamental right to file an FIR at any police station across India, regardless of where the crime occurred.',
    keyRights: [
      'Police officers CANNOT refuse to register an FIR claiming the incident happened outside their jurisdiction.',
      'The receiving station must record the FIR, assign it "Zero" as the FIR serial number, and transfer the case to the jurisdictional station.',
      'Refusal by a police officer to register an FIR for cognizable crimes is a punishable offense under BNS Section 199 (Old IPC 166A).',
      'You are entitled to a free, stamped copy of the FIR on the spot.',
    ],
    actionSteps: [
      'Approach the nearest police station or use Rakshak e-FIR portal.',
      'State clearly to the Duty Officer: "I want to lodge a Zero FIR under BNSS Section 173."',
      'Provide accurate written or oral details of the incident.',
      'Verify the written statement, sign it, and demand an official copy with station seal and Zero FIR number.',
    ],
    applicableLaws: [
      {
        bns: 'Bharatiya Nagarik Suraksha Sanhita (BNSS) Section 173',
        ipcEquivalent: 'CrPC Section 154',
        description: 'Mandates recording of information in cognizable cases irrespective of territorial jurisdiction.',
      },
      {
        bns: 'Bharatiya Nyaya Sanhita (BNS) Section 199',
        ipcEquivalent: 'IPC Section 166A',
        description: 'Punishment of up to 2 years imprisonment for public servant defying law to record crime information.',
      },
    ],
    faqs: [
      {
        q: 'Can police tell me to go to another police station because the crime happened elsewhere?',
        a: 'No. Under Supreme Court guidelines and BNSS 173, the police officer MUST register a Zero FIR immediately and subsequently transfer the investigation.',
      },
      {
        q: 'Do I need to pay any fee to register an FIR or receive a copy?',
        a: 'No, FIR registration and obtaining the initial certified copy is 100% free of charge by law.',
      },
    ],
  },
  {
    id: 'arrest-rights',
    title: 'Citizen Rights Upon Arrest (D.K. Basu Guidelines)',
    category: 'Arrest',
    shortSummary: 'Crucial constitutional protections and procedural rights every citizen has during detention or arrest by police.',
    keyRights: [
      'Right to know the exact grounds of arrest and whether the offense is bailable or non-bailable.',
      'Right to inform a family member, friend, or relative immediately within 8 to 12 hours of detention.',
      'Right to free legal aid and to consult an advocate of your choice during interrogation.',
      'Arresting police personnel must wear clear identification badges with names and designations.',
      'Mandatory medical examination by a trained medical officer at the time of arrest and every 48 hours in custody.',
      'Must be produced before the nearest Judicial Magistrate within 24 hours (excluding transit time).',
    ],
    actionSteps: [
      'Ask the arresting officer politely: "Under which section am I being arrested, and can I see the arrest memo?"',
      'Ensure the Arrest Memo is signed by at least one independent witness (family member or respectable local resident).',
      'Request to make a phone call to your family and lawyer immediately.',
      'Insist on recording any pre-existing injuries during the medical examination.',
    ],
    applicableLaws: [
      {
        bns: 'BNSS Sections 35 to 48 (Arrest Safeguards)',
        ipcEquivalent: 'CrPC Sections 41 to 57 & Article 22 of Constitution',
        description: 'Statutory incorporation of Supreme Court D.K. Basu guidelines for protection against custodial abuse.',
      },
    ],
    faqs: [
      {
        q: 'Can police detain me indefinitely for questioning without an arrest memo?',
        a: 'No. Unauthorized detention without formal documentation is illegal under Article 21 & 22 of the Constitution.',
      },
      {
        q: 'Can I be forced to confess in police custody?',
        a: 'No. Confessions made to police officers are inadmissible in court under Bharatiya Sakshya Adhiniyam (BSA) / Indian Evidence Act.',
      },
    ],
  },
  {
    id: 'women-safety-laws',
    title: 'Special Legal Protections for Women',
    category: 'WomenSafety',
    shortSummary: 'Statutory safeguards regarding arrest of women, search procedures, zero-tolerance for harassment, and recording statements.',
    keyRights: [
      'No woman can be arrested after sunset (6 PM) and before sunrise (6 AM), except in extraordinary circumstances with prior written permission from a Judicial Magistrate.',
      'Women must be arrested and physically searched ONLY by a female police officer with strict decency.',
      'A woman witness cannot be called to the police station for questioning; her statement must be recorded at her residence in the presence of parents/guardian.',
      'In sexual offense cases, statements must be recorded by a woman police officer or in the presence of a woman facilitator, with medical examination conducted by a female doctor.',
      'Identity of victims of sexual offenses must never be disclosed under any circumstances.',
    ],
    actionSteps: [
      'If stopped or summoned after sunset, assert your right under BNSS Section 43(5).',
      'Dial 1091 (Women in Distress) or 112 for immediate assistance from specialized Pink Patrol units.',
      'Use the Rakshak e-FIR portal or anonymous reporting option for cyber stalking or harassment.',
    ],
    applicableLaws: [
      {
        bns: 'BNSS Section 43(5)',
        ipcEquivalent: 'CrPC Section 46(4)',
        description: 'Prohibition of arresting women between sunset and sunrise without prior Judicial Magistrate sanction.',
      },
      {
        bns: 'BNS Sections 74 to 79',
        ipcEquivalent: 'IPC Sections 354, 354A-D, 509',
        description: 'Strict penalties for stalking, voyeurism, sexual harassment, and outraging modesty.',
      },
    ],
    faqs: [
      {
        q: 'Can a male police officer search a female citizen during a traffic check or routine raid?',
        a: 'Strictly No. Any physical search of a female citizen can ONLY be conducted by a female officer with utmost regard to decency.',
      },
    ],
  },
  {
    id: 'cyber-fraud-golden-hour',
    title: 'Cyber Financial Fraud: The "Golden Hour" Protocol',
    category: 'CyberCrime',
    shortSummary: 'Essential immediate steps to recover money and freeze fraudulent recipient bank accounts within the first 2 hours.',
    keyRights: [
      'Immediate financial freeze requests can be initiated via National Cyber Crime Helpline 1930 without waiting for a court order.',
      'Banks and payment gateways (UPI/IMPS/Wallets) are legally bound to hold funds in mule accounts upon 1930 alert.',
    ],
    actionSteps: [
      'STEP 1: Call 1930 immediately or log in to cybercrime.gov.in within 2 hours of unauthorized transaction.',
      'STEP 2: Note down transaction details: Bank Account No, UPI Transaction ID (UTR), Beneficiary details, and exact timestamp.',
      'STEP 3: Contact your bank branch or customer care to hotlist debit/credit cards and block internet banking.',
      'STEP 4: File e-FIR on Rakshak with bank statement and screenshots of fraud calls/messages.',
    ],
    applicableLaws: [
      {
        bns: 'Information Technology Act 2000 Section 66C & 66D',
        ipcEquivalent: 'IPC Section 419/420',
        description: 'Punishment for identity theft and cheating by personation using computer resources.',
      },
      {
        bns: 'BNSS Section 106',
        ipcEquivalent: 'CrPC Section 102',
        description: 'Power of police to seize or freeze bank accounts used as proceeds of crime.',
      },
    ],
    faqs: [
      {
        q: 'What is 1930 and how does it help?',
        a: '1930 is the Citizen Financial Cyber Fraud Reporting System (CFCFRS) connecting law enforcement directly with 250+ banks to hold stolen funds before fraudsters withdraw cash.',
      },
    ],
  },
  {
    id: 'motor-vehicles-rights',
    title: 'Traffic Police Checks & Citizen Rights on Roads',
    category: 'Traffic',
    shortSummary: 'Understand the legal limits of traffic police powers, document verification rules on DigiLocker, and towing regulations.',
    keyRights: [
      'Traffic police cannot physically snatch or forcefully remove keys from the ignition of your vehicle.',
      'Digital driving license and RC on mParivahan or DigiLocker apps are 100% legally valid at par with physical originals (Ministry of Road Transport circular).',
      'Only an officer of the rank of Sub-Inspector (ASI/SI with one or more stars) or above can issue spot fines exceeding ₹100.',
      'Traffic police must possess an official e-Challan machine or government receipt book; never pay cash without an official printed receipt.',
      'A vehicle cannot be towed if the driver is seated inside or arrives before the vehicle is physically hitched to the tow crane.',
    ],
    actionSteps: [
      'Keep your DigiLocker / mParivahan app logged in and verified.',
      'Ask the officer respectfully for their name and rank if they are not wearing their badge.',
      'Request an official e-Challan SMS receipt to your registered mobile number.',
      'If harassed, record polite video evidence and report via Rakshak Traffic portal or call 112.',
    ],
    applicableLaws: [
      {
        bns: 'Motor Vehicles (Amendment) Act 2019 & Rule 139 Central Motor Vehicles Rules',
        description: 'Acceptance of electronic transport documents and strict regulation of enforcement authorities.',
      },
    ],
    faqs: [
      {
        q: 'Can a traffic constable without stars confiscate my vehicle or demand high fines?',
        a: 'No. Head Constables and Constables cannot issue major challans on their own unless accompanied by an authorized SI/ASI.',
      },
    ],
  },
];

export const mockLegalGuides = legalGuideTopics.map((g) => ({
  id: g.id,
  title: g.title,
  summary: g.shortSummary,
  category: g.category === 'FIR' ? 'FIR Procedures' : g.category === 'Arrest' ? 'Citizen Rights' : g.category === 'WomenSafety' ? 'Women Safety' : g.category === 'CyberCrime' ? 'Cyber Safety' : g.category === 'Traffic' ? 'Traffic Laws' : 'Citizen Rights',
  keyRights: g.keyRights,
  steps: g.actionSteps,
  sections: g.applicableLaws.map((l) => l.bns),
}));

export const mockPoliceStations = initialPoliceStations;
export const mockComplaints = initialComplaints;
export const mockMissingRecords = initialMissingRecords;
export const mockTrafficReports = initialTrafficReports;
