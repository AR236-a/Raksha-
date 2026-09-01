import React, { useState } from 'react';
import {
  FileText,
  Shield,
  Sparkles,
  MapPin,
  Upload,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Printer,
  Search,
  Lock,
  QrCode,
  Download,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { IncidentCategory, Complaint, Language } from '../types';
import { translations } from '../i18n/translations';

interface ReportIncidentProps {
  onComplaintCreated: (newComplaint: Complaint) => void;
  onNavigateToTrack: (trackingNumber: string) => void;
  language: Language;
}

export const ReportIncident: React.FC<ReportIncidentProps> = ({
  onComplaintCreated,
  onNavigateToTrack,
  language,
}) => {
  const t = translations[language];

  // Form State
  const [category, setCategory] = useState<IncidentCategory>('Theft & Burglary');
  const [title, setTitle] = useState('');
  const [rawDescription, setRawDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState(
    new Date().toISOString().slice(0, 10) + 'T' + new Date().toTimeString().slice(0, 5)
  );
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [landmark, setLandmark] = useState('');
  const [suspectInfo, setSuspectInfo] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Complainant Details
  const [complainantName, setComplainantName] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [complainantEmail, setComplainantEmail] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');

  // Evidence state
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [hasAudioNote, setHasAudioNote] = useState(false);

  // AI Drafter state
  const [isDraftingAI, setIsDraftingAI] = useState(false);
  const [aiDraftOutput, setAiDraftOutput] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<Complaint | null>(null);

  const categories: { name: IncidentCategory; desc: string; icon: string }[] = [
    { name: 'Theft & Burglary', desc: 'House break-in, pickpocketing, stolen valuables', icon: '🔓' },
    { name: 'Cyber Crime & Fraud', desc: 'UPI fraud, OTP phishing, unauthorized debits, impersonation', icon: '💻' },
    { name: 'Women Safety & Harassment', desc: 'Eve-teasing, stalking, cyber abuse, threats', icon: '🛡️' },
    { name: 'Lost & Found Property', desc: 'Lost mobile phone, bag, wallet, documents (Aadhaar/Passport)', icon: '📦' },
    { name: 'Vehicle Theft', desc: 'Stolen motorcycle, car, two-wheeler, or commercial vehicle', icon: '🚗' },
    { name: 'Assault & Threat', desc: 'Physical altercation, extortion, intimidation', icon: '⚠️' },
    { name: 'Anonymous Tip', desc: 'Confidential lead on illegal trade, narcotics, gambling', icon: '🕵️' },
  ];

  // GPS autofill
  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          setAddress(`Geo-Coordinates: ${lat}°N, ${lng}°E (Detected automatically)`);
        },
        (err) => {
          setAddress('Connaught Place, New Delhi');
        }
      );
    } else {
      setAddress('Central Delhi Area');
    }
  };

  // AI FIR Drafting helper
  const handleAIDraftFIR = async () => {
    if (!rawDescription.trim()) {
      alert('Please write a brief summary of what happened first, then click AI Draft to format it into legal language.');
      return;
    }

    setIsDraftingAI(true);
    try {
      const res = await fetch('/api/gemini/draft-fir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          rawIncidentText: rawDescription,
          date: incidentDate,
          location: `${address}, ${city} ${landmark ? '(' + landmark + ')' : ''}`,
          suspectInfo,
        }),
      });
      const data = await res.json();
      if (data.formalDraft) {
        setAiDraftOutput(data.formalDraft);
        setRawDescription(data.formalDraft);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDraftingAI(false);
    }
  };

  // Simulated file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f: File) => f.name);
      setEvidenceFiles((prev) => [...prev, ...names]);
    }
  };

  // Audio voice note simulation
  const handleToggleVoiceNote = () => {
    if (!isRecordingAudio) {
      setIsRecordingAudio(true);
      setTimeout(() => {
        setIsRecordingAudio(false);
        setHasAudioNote(true);
      }, 4000);
    } else {
      setIsRecordingAudio(false);
      setHasAudioNote(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawDescription.trim()) {
      alert('Please provide an incident description.');
      return;
    }
    if (!isAnonymous && (!complainantName.trim() || !complainantPhone.trim())) {
      alert('Please enter your name and phone number (or check Anonymous Tip).');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        category,
        title: title || `${category} Report at ${address || city}`,
        description: rawDescription,
        dateTime: incidentDate.replace('T', ' '),
        location: {
          address: address || 'Reported Location',
          city,
          landmark,
        },
        isAnonymous,
        complainant: {
          name: complainantName,
          phone: complainantPhone,
          email: complainantEmail,
          aadhaarLast4,
        },
        suspectDetails: suspectInfo,
        vehiclePlate,
        evidenceFiles,
        audioNote: hasAudioNote ? 'voice_recording_statement.mp3' : undefined,
        priority: category === 'Women Safety & Harassment' || category === 'Assault & Threat' ? 'Emergency' : 'Medium',
      };

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const newRecord: Complaint = await response.json();
      setSubmittedReceipt(newRecord);
      onComplaintCreated(newRecord);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* If Receipt Generated -> Show Digital Certified Acknowledgment */}
      {submittedReceipt ? (
        <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          {/* Header Banner with Emblem */}
          <div className="text-center border-b border-slate-800 pb-6 space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-500/40 mb-1">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 block">
              OFFICIAL e-FIR / COMPLAINT ACKNOWLEDGMENT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Report Successfully Registered
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your report has been logged into the State Police Central Crime Repository. An Investigating Officer is being assigned.
            </p>
          </div>

          {/* Unique FIR Tracking ID Callout */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-blue-600/50 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">
                Permanent Tracking & FIR Reference Number
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-wider">
                {submittedReceipt.id}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Save this number to track live status and view investigating officer details.
              </p>
            </div>

            {/* Simulated QR Code Badge */}
            <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
              <QrCode className="w-8 h-8 text-blue-400" />
              <div className="text-left text-[10px]">
                <span className="text-slate-400 font-bold block">VERIFIED e-SEAL</span>
                <span className="text-emerald-400 font-mono">DIGITAL-SIGN-OK</span>
              </div>
            </div>
          </div>

          {/* Key Incident Metadata Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Incident Category</span>
              <p className="font-bold text-slate-200">{submittedReceipt.category}</p>
              <span className="text-[10px] uppercase font-bold text-slate-500 block pt-1">Date & Time</span>
              <p className="text-slate-300">{submittedReceipt.dateTime}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Jurisdiction Location</span>
              <p className="font-bold text-slate-200">
                {submittedReceipt.location.address}, {submittedReceipt.location.city}
              </p>
              <span className="text-[10px] uppercase font-bold text-slate-500 block pt-1">Complainant Name</span>
              <p className="text-slate-300">
                {submittedReceipt.isAnonymous ? 'Confidential (Anonymous)' : submittedReceipt.complainant.name}
              </p>
            </div>
          </div>

          {/* Legal Sections Attached */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Applicable Criminal Provisions (BNS / BNSS)
            </span>
            <div className="flex flex-wrap gap-2">
              {submittedReceipt.legalSections?.map((sec) => (
                <span
                  key={sec}
                  className="text-xs font-semibold bg-blue-950 text-blue-300 px-3 py-1 rounded-lg border border-blue-800/60"
                >
                  ⚖️ {sec}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => window.print()}
              id="print-fir-receipt-btn"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print Acknowledgment Receipt</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSubmittedReceipt(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                File Another
              </button>
              <button
                onClick={() => onNavigateToTrack(submittedReceipt.id)}
                id="track-new-complaint-btn"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-950"
              >
                <span>Track This Complaint Live</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* The Incident Reporting Form */
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Online Crime & Incident Reporting
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{t.reportIncidentTitle}</h1>
            <p className="text-xs text-slate-400 mt-1">{t.reportIncidentSub}</p>
          </div>

          {/* Step 1: Select Incident Category */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
              1. Select Incident Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    category === cat.name
                      ? 'bg-blue-950/70 border-blue-500 text-white shadow-md shadow-blue-950'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-xs font-bold">{cat.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Incident Date, Time & Location */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
              2. When & Where Did It Occur?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Date & Time of Incident
                </label>
                <input
                  type="datetime-local"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">City / Region</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="New Delhi">New Delhi (NCR)</option>
                  <option value="Mumbai">Mumbai (Maharashtra)</option>
                  <option value="Bengaluru">Bengaluru (Karnataka)</option>
                  <option value="Kolkata">Kolkata (West Bengal)</option>
                  <option value="Chennai">Chennai (Tamil Nadu)</option>
                  <option value="Hyderabad">Hyderabad (Telangana)</option>
                  <option value="Ahmedabad">Ahmedabad (Gujarat)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Nearest Landmark / Sector
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Metro Gate 3"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-400">
                  Exact Street Address / Location
                </label>
                <button
                  type="button"
                  onClick={handleUseGPS}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Use My Current GPS</span>
                </button>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 302, Pocket 4, Mayur Vihar, New Delhi"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Step 3: Description & AI Polish Assistant */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                3. Incident Statement / Facts of the Case
              </label>

              {/* AI FIR Drafter Button */}
              <button
                type="button"
                onClick={handleAIDraftFIR}
                disabled={isDraftingAI}
                id="ai-fir-drafter-action-btn"
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 hover:from-purple-800 hover:to-indigo-800 text-purple-200 border border-purple-500/50 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto disabled:opacity-50"
              >
                {isDraftingAI ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>AI Legal Drafter & Polish</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={rawDescription}
              onChange={(e) => setRawDescription(e.target.value)}
              placeholder="Describe the incident chronologically. State what happened, time of incident, suspects, stolen articles, or fraud amount. You can write in your own natural words or regional language and click 'AI Legal Drafter' to structure it!"
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
              required
            />

            {/* Suspect / Vehicle extra info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Suspect Information (Optional)
                </label>
                <input
                  type="text"
                  value={suspectInfo}
                  onChange={(e) => setSuspectInfo(e.target.value)}
                  placeholder="e.g. Phone number, appearance, fake name"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Vehicle Registration Plate (If applicable)
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  placeholder="e.g. DL 01 AB 1234"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Evidence Attachments & Voice Note */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
              4. Evidence & Voice Note Statement (Optional)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File upload input */}
              <label className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-700 hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center text-center transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-300">Upload Photos / Bank Proofs</span>
                <span className="text-[10px] text-slate-500">PNG, JPG, PDF up to 10MB</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Voice note recorder button */}
              <button
                type="button"
                onClick={handleToggleVoiceNote}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                  isRecordingAudio
                    ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse'
                    : hasAudioNote
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {isRecordingAudio ? (
                  <>
                    <Mic className="w-6 h-6 text-red-400 animate-bounce mb-1" />
                    <span className="text-xs font-bold">Recording Voice Statement... (Speak now)</span>
                  </>
                ) : hasAudioNote ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-xs font-bold">Voice Statement Attached (14s)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold">Record Voice Note Statement</span>
                    <span className="text-[10px] text-slate-500">Describe in your spoken language</span>
                  </>
                )}
              </button>
            </div>

            {/* Attached files chips */}
            {evidenceFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {evidenceFiles.map((file, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-xl border border-slate-700 flex items-center gap-1.5"
                  >
                    📎 {file}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Step 5: Complainant Information or Anonymous Tip */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                5. Complainant Identification
              </label>

              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`text-xs px-3 py-1 rounded-xl border font-bold flex items-center gap-1.5 transition-colors ${
                  isAnonymous
                    ? 'bg-amber-950 text-amber-300 border-amber-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>{isAnonymous ? 'Anonymous Mode Active' : 'Report Anonymously'}</span>
              </button>
            </div>

            {!isAnonymous ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={complainantName}
                    onChange={(e) => setComplainantName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required={!isAnonymous}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={complainantPhone}
                    onChange={(e) => setComplainantPhone(e.target.value)}
                    placeholder="e.g. +91 98110 00000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required={!isAnonymous}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Email ID</label>
                  <input
                    type="email"
                    value={complainantEmail}
                    onChange={(e) => setComplainantEmail(e.target.value)}
                    placeholder="e.g. name@gmail.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Aadhaar Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value)}
                    placeholder="e.g. 4892"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-amber-950/40 border border-amber-600/40 p-4 rounded-2xl text-xs text-amber-200 flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Confidential Citizen Vigilance Mode</p>
                  <p className="text-[11px] text-amber-300/80">
                    Your personal identification and contact details will not be stored or revealed to anyone.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <p className="text-[11px] text-slate-500 max-w-sm">
              By submitting, you certify under Bharatiya Sakshya Adhiniyam that information provided is true to the best of your knowledge.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-incident-fir-btn"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wide shadow-xl shadow-blue-900/50 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering e-FIR...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit & Generate e-FIR Slip</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
