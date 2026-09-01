import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  initialComplaints,
  initialPoliceStations,
  initialMissingRecords,
  initialTrafficReports,
} from './src/data/mockData.ts';
import { Complaint, MissingRecord, TrafficReport, EmergencySOS } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory data store with live state
let complaints: Complaint[] = [...initialComplaints];
let policeStations = [...initialPoliceStations];
let missingRecords: MissingRecord[] = [...initialMissingRecords];
let trafficReports: TrafficReport[] = [...initialTrafficReports];
let activeSosAlerts: EmergencySOS[] = [
  {
    id: 'SOS-2026-9901',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    location: {
      lat: 28.6315,
      lng: 77.2167,
      address: 'Outer Circle, Connaught Place, New Delhi',
    },
    emergencyType: 'Violence/Threat',
    status: 'Patrol Dispatched',
    dispatchedUnit: {
      vehicleNo: 'PCR Van #14 (DL-1C-4421)',
      officerInCharge: 'Head Constable Sunil Yadav',
      etaMinutes: 3,
      contact: '+91 98110 99881',
    },
    batteryPercent: 68,
  },
];

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. AI Legal & Citizen Assistant
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, language = 'en', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAIClient();
    if (!ai) {
      // Fallback helpful guidance if API key not yet set
      return res.json({
        text: `[Rakshak Legal Advisor] Regarding your query on "${message}": Under Indian law (including the new Bharatiya Nyaya Sanhita - BNS and BNSS), citizens have fundamental rights including Zero FIR (filing a complaint at ANY police station under BNSS 173), right to an arrest memo with family notification within 12 hours (D.K. Basu guidelines), and immediate cyber fraud reporting to Helpline 1930 within the 2-hour Golden Hour. For immediate physical emergency, dial 112 directly.`,
        suggestedActions: [
          'File e-FIR / Complaint',
          'Find Nearest Station',
          'Call 112 (Emergency)',
          'Read Zero FIR Guide',
        ],
        legalCitations: [
          'BNSS Section 173 (Zero FIR)',
          'BNS Section 303 (Theft)',
          'IT Act 66D (Cyber Fraud)',
        ],
      });
    }

    const systemInstruction = `You are "Rakshak AI", a dedicated, compassionate, highly knowledgeable, and authoritative Indian Police & Citizen Legal Assistant.
Your primary role is to assist citizens with:
1. Indian Criminal Law & Procedures: Bharatiya Nyaya Sanhita (BNS 2023/2024), Bharatiya Nagarik Suraksha Sanhita (BNSS), Bharatiya Sakshya Adhiniyam (BSA), Information Technology Act, Motor Vehicles Act, and old IPC/CrPC cross-references when helpful.
2. Citizen Rights: D.K. Basu arrest guidelines, Zero FIR rules, Women safety protections (no arrest after sunset without magistrate order, female officer presence), Traffic police rules (DigiLocker validity, key confiscation bans).
3. Practical Step-by-Step Action Guides: What to do in case of mobile theft, cyber financial fraud (1930 Helpline Golden Hour), road accidents, domestic violence, extortion, or harassment.
4. Language Adaptability: Answer naturally and fluently in the requested language (Language requested: ${language}). If the user asks in Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Punjabi, Malayalam, or English, reply in that language with high clarity, warm empathy, and precise legal terminology.
5. Tone: Professional, reassuring, objective, empowering, and strictly law-abiding. Never give illegal advice.
Always include key legal sections (e.g. BNS/BNSS/IT Act) where applicable, and remind citizens that for active physical life-threatening emergencies, they should immediately trigger Emergency SOS or call 112.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `User Query in language '${language}': ${message}`,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const replyText = response.text || 'I am here to assist you with police procedures and citizen rights.';

    // Extract quick suggested actions and sections based on content
    let suggestedActions: string[] = ['Find Nearest Police Station', 'Check Legal Rights Guide'];
    if (message.toLowerCase().includes('fir') || message.toLowerCase().includes('theft') || message.toLowerCase().includes('fraud')) {
      suggestedActions.unshift('File e-FIR / Incident Report');
    }
    if (message.toLowerCase().includes('emergency') || message.toLowerCase().includes('help') || message.toLowerCase().includes('threat')) {
      suggestedActions.unshift('Trigger SOS / Call 112');
    }

    res.json({
      text: replyText,
      suggestedActions,
      legalCitations: ['BNSS 173 (FIR)', 'BNS 2024 Provisions', 'National Emergency 112'],
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      error: 'Failed to process AI query',
      details: error.message,
    });
  }
});

// 2. AI FIR Drafting Helper
app.post('/api/gemini/draft-fir', async (req, res) => {
  try {
    const { category, rawIncidentText, date, location, suspectInfo } = req.body;

    const ai = getAIClient();
    if (!ai) {
      // Formulate formatted draft fallback
      return res.json({
        structuredTitle: `Complaint regarding ${category} at ${location || 'incident site'}`,
        formalDescription: `To,\nThe Station House Officer (SHO),\n\nSubject: Formal Complaint regarding ${category}\n\nRespected Sir/Madam,\n\nI wish to bring to your immediate attention an incident of ${category} that occurred on ${date || 'the stated date'} at/around ${location || 'the specified location'}.\n\nFacts of the Case:\n${rawIncidentText}\n\nSuspect / Identifying Information: ${suspectInfo || 'Unknown person(s)'}.\n\nI kindly request you to register a formal FIR/Complaint under relevant sections of the Bharatiya Nyaya Sanhita (BNS) and initiate necessary investigation at the earliest.\n\nYours faithfully,\nComplainant`,
        recommendedSections: ['BNS Section 303 (Theft)', 'BNS Section 318 (Cheating)'],
        categoryConfirmed: category,
      });
    }

    const prompt = `Convert the following raw incident description into an official, legally sound Indian Police Complaint / FIR application draft.
Category: ${category}
Date & Time: ${date}
Location: ${location}
Suspect Details: ${suspectInfo || 'Unknown'}
Raw Citizen Statement:
"""
${rawIncidentText}
"""

Format the output cleanly in proper formal police application format (To SHO, Subject, Concise Chronological Facts, Details of Loss/Threat, Legal Prayer, and Recommended BNS / BNSS / IT Act sections). Return clean formatted text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert legal drafter for Indian police complaints. Output structured, legally precise, respectful official drafts with exact relevant Bharatiya Nyaya Sanhita (BNS) sections.',
        temperature: 0.2,
      },
    });

    res.json({
      formalDraft: response.text,
      category,
    });
  } catch (error: any) {
    console.error('FIR Drafter error:', error);
    res.status(500).json({ error: 'Failed to draft FIR', details: error.message });
  }
});

// 3. Complaints & e-FIR CRUD
app.get('/api/complaints', (req, res) => {
  const { query, category, status } = req.query;
  let filtered = [...complaints];

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.complainant.name.toLowerCase().includes(q) ||
        c.complainant.phone.includes(q)
    );
  }

  if (category && typeof category === 'string' && category !== 'All') {
    filtered = filtered.filter((c) => c.category === category);
  }

  if (status && typeof status === 'string' && status !== 'All') {
    filtered = filtered.filter((c) => c.status === status);
  }

  res.json(filtered);
});

app.get('/api/complaints/:id', (req, res) => {
  const item = complaints.find((c) => c.id.toUpperCase() === req.params.id.toUpperCase());
  if (!item) return res.status(404).json({ error: 'Complaint not found' });
  res.json(item);
});

app.post('/api/complaints', (req, res) => {
  const body = req.body;
  const year = new Date().getFullYear();
  const stateCode = body.location?.city?.toLowerCase().includes('mumbai')
    ? 'MH'
    : body.location?.city?.toLowerCase().includes('bengaluru')
    ? 'KA'
    : 'DEL';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newId = `FIR-${year}-${stateCode}-${randomNum}`;

  const newComplaint: Complaint = {
    id: newId,
    trackingNumber: newId,
    category: body.category || 'Theft & Burglary',
    title: body.title || `${body.category} Complaint at ${body.location?.address || 'City'}`,
    description: body.description || '',
    dateTime: body.dateTime || new Date().toISOString().replace('T', ' ').slice(0, 16),
    location: body.location || { address: 'Local Area', city: 'New Delhi' },
    isAnonymous: !!body.isAnonymous,
    complainant: body.isAnonymous
      ? { name: 'Anonymous Citizen', phone: 'CONFIDENTIAL' }
      : {
          name: body.complainant?.name || 'Citizen',
          phone: body.complainant?.phone || '+91 99999 00000',
          email: body.complainant?.email || '',
          aadhaarLast4: body.complainant?.aadhaarLast4 || '',
        },
    suspectDetails: body.suspectDetails || '',
    vehiclePlate: body.vehiclePlate || '',
    legalSections: body.legalSections || ['BNS Section 303 (Cognizable Offense)'],
    status: 'Submitted',
    priority: body.priority || 'Medium',
    evidenceFiles: body.evidenceFiles || [],
    audioNote: body.audioNote || '',
    timeline: [
      {
        status: 'Submitted',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        note: 'e-FIR successfully lodged and registered in the Police State Central Repository.',
      },
    ],
  };

  complaints.unshift(newComplaint);
  res.status(201).json(newComplaint);
});

app.patch('/api/complaints/:id/status', (req, res) => {
  const { status, note, officerName, officerBadge, officerPhone, officerRank } = req.body;
  const index = complaints.findIndex((c) => c.id.toUpperCase() === req.params.id.toUpperCase());
  if (index === -1) return res.status(404).json({ error: 'Complaint not found' });

  const complaint = complaints[index];
  complaint.status = status || complaint.status;

  if (officerName) {
    complaint.assignedOfficer = {
      name: officerName,
      badgeNumber: officerBadge || 'POL-IO-991',
      rank: officerRank || 'Sub-Inspector',
      phone: officerPhone || '+91 98110 11223',
      station: 'Jurisdictional Police Station',
    };
  }

  complaint.timeline.push({
    status: complaint.status,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    note: note || `Status updated to ${complaint.status}`,
    officer: officerName || 'Duty Officer',
  });

  res.json(complaint);
});

app.post('/api/complaints/:id/note', (req, res) => {
  const { note } = req.body;
  const complaint = complaints.find((c) => c.id.toUpperCase() === req.params.id.toUpperCase());
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  if (!complaint.citizenNotes) complaint.citizenNotes = [];
  complaint.citizenNotes.push(`${new Date().toLocaleDateString()}: ${note}`);
  res.json(complaint);
});

// 4. Police Stations
app.get('/api/stations', (req, res) => {
  const { city, search } = req.query;
  let stations = [...policeStations];

  if (city && typeof city === 'string' && city !== 'All') {
    stations = stations.filter((s) => s.city.toLowerCase() === city.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    stations = stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.shoName.toLowerCase().includes(q)
    );
  }

  res.json(stations);
});

// 5. Missing Persons / Items
app.get('/api/missing', (req, res) => {
  const { type, status, query } = req.query;
  let records = [...missingRecords];

  if (type && typeof type === 'string' && type !== 'All') {
    records = records.filter((r) => r.type === type);
  }
  if (status && typeof status === 'string' && status !== 'All') {
    records = records.filter((r) => r.status === status);
  }
  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    records = records.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        r.lastSeenLocation.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.policeCaseNo.toLowerCase().includes(q)
    );
  }

  res.json(records);
});

app.post('/api/missing', (req, res) => {
  const body = req.body;
  const newRecord: MissingRecord = {
    id: `MIS-2026-${Math.floor(100 + Math.random() * 900)}`,
    type: body.type || 'Person',
    title: body.title || `Missing ${body.name || 'Individual'}`,
    name: body.name,
    age: body.age ? Number(body.age) : undefined,
    gender: body.gender,
    height: body.height,
    lastSeenDate: body.lastSeenDate || new Date().toISOString().slice(0, 10),
    lastSeenLocation: body.lastSeenLocation || 'Unknown',
    city: body.city || 'New Delhi',
    description: body.description || '',
    identificationMarks: body.identificationMarks || '',
    itemCategory: body.itemCategory,
    serialOrIMEI: body.serialOrIMEI,
    vehicleRegistration: body.vehicleRegistration,
    photoUrl:
      body.photoUrl ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    status: 'Active Search',
    reportedDate: new Date().toISOString().slice(0, 10),
    policeCaseNo: `MIS-POL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    reward: body.reward || '',
    contactStation: body.contactStation || 'Central Police Station (112)',
    spottedTipsCount: 0,
  };

  missingRecords.unshift(newRecord);
  res.status(201).json(newRecord);
});

app.post('/api/missing/:id/tip', (req, res) => {
  const record = missingRecords.find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  record.spottedTipsCount = (record.spottedTipsCount || 0) + 1;
  res.json({ success: true, count: record.spottedTipsCount });
});

app.patch('/api/missing/:id/status', (req, res) => {
  const { status } = req.body;
  const record = missingRecords.find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  record.status = status;
  res.json(record);
});

// 6. Traffic Reports
app.get('/api/traffic', (req, res) => {
  res.json(trafficReports);
});

app.post('/api/traffic', (req, res) => {
  const body = req.body;
  const newReport: TrafficReport = {
    id: `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    type: body.type || 'Congestion',
    title: body.title || `${body.type} reported at ${body.location}`,
    location: body.location || 'Road Junction',
    city: body.city || 'New Delhi',
    lat: body.lat,
    lng: body.lng,
    description: body.description || '',
    vehicleNumber: body.vehicleNumber || '',
    photoUrl: body.photoUrl || '',
    reportedAt: 'Just now',
    status: 'Reported',
    upvotes: 1,
  };

  trafficReports.unshift(newReport);
  res.status(201).json(newReport);
});

app.post('/api/traffic/:id/upvote', (req, res) => {
  const report = trafficReports.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  report.upvotes += 1;
  res.json(report);
});

// 7. Emergency SOS Endpoints
app.get('/api/sos/active', (req, res) => {
  res.json(activeSosAlerts);
});

app.post('/api/sos/trigger', (req, res) => {
  const { lat = 28.6315, lng = 77.2167, address = 'Current GPS Location', emergencyType = 'General SOS', batteryPercent } = req.body;

  const newAlert: EmergencySOS = {
    id: `SOS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    location: { lat, lng, address },
    emergencyType,
    status: 'Patrol Dispatched',
    dispatchedUnit: {
      vehicleNo: `PCR Interceptor #${Math.floor(10 + Math.random() * 40)}`,
      officerInCharge: 'Sub-Inspector On Duty',
      etaMinutes: Math.floor(2 + Math.random() * 4),
      contact: '112 / +91 98110 44332',
    },
    batteryPercent: batteryPercent || 85,
  };

  activeSosAlerts.unshift(newAlert);
  res.status(201).json(newAlert);
});

app.patch('/api/sos/:id/dispatch', (req, res) => {
  const { status, vehicleNo, officerInCharge, etaMinutes } = req.body;
  const alert = activeSosAlerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  alert.status = status || alert.status;
  if (vehicleNo && alert.dispatchedUnit) {
    alert.dispatchedUnit.vehicleNo = vehicleNo;
    if (officerInCharge) alert.dispatchedUnit.officerInCharge = officerInCharge;
    if (etaMinutes) alert.dispatchedUnit.etaMinutes = Number(etaMinutes);
  }
  res.json(alert);
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rakshak Police & Citizen Assistant running on http://localhost:${PORT}`);
  });
}

startServer();
