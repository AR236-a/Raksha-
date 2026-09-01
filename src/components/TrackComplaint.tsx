import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  User,
  PhoneCall,
  Shield,
  FileText,
  Printer,
  QrCode,
  Send,
  Star,
  Download,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Complaint, Language } from '../types';
import { translations } from '../i18n/translations';

interface TrackComplaintProps {
  complaints: Complaint[];
  initialTrackingId?: string;
  language: Language;
}

export const TrackComplaint: React.FC<TrackComplaintProps> = ({
  complaints,
  initialTrackingId = '',
  language,
}) => {
  const t = translations[language];
  const [searchInput, setSearchInput] = useState(initialTrackingId || 'FIR-2026-DEL-1042');
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(
    complaints.find(
      (c) => c.id.toUpperCase() === (initialTrackingId || 'FIR-2026-DEL-1042').toUpperCase()
    ) || complaints[0] || null
  );

  const [supplementaryNote, setSupplementaryNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim().toUpperCase();
    if (!q) return;

    const found = complaints.find(
      (c) =>
        c.id.toUpperCase() === q ||
        c.trackingNumber.toUpperCase() === q ||
        c.complainant.phone.includes(q)
    );

    if (found) {
      setActiveComplaint(found);
    } else {
      alert(`No complaint found with ID or Phone: ${q}. Please check the number.`);
    }
  };

  const handleAddCitizenNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplementaryNote.trim() || !activeComplaint) return;

    setIsSubmittingNote(true);
    try {
      const res = await fetch(`/api/complaints/${activeComplaint.id}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: supplementaryNote }),
      });
      const updated = await res.json();
      setActiveComplaint(updated);
      setSupplementaryNote('');
      alert('Your supplementary statement has been recorded into the case diary.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Search Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Live Investigation Status & Case Diary
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t.trackComplaintTitle}</h1>
          <p className="text-xs text-slate-400 mt-1">{t.trackComplaintSub}</p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter FIR / Acknowledgment No (e.g. FIR-2026-DEL-1042) or Mobile No..."
              className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            id="track-complaint-submit-btn"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl shadow-md shadow-blue-900/50 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search Case</span>
          </button>
        </form>

        {/* Quick Demo Case Chips */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1">
          <span className="text-[11px] text-slate-400 font-semibold shrink-0">Sample Cases to Track:</span>
          {complaints.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchInput(c.id);
                setActiveComplaint(c);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium whitespace-nowrap transition-colors ${
                activeComplaint?.id === c.id
                  ? 'bg-blue-950 text-blue-300 border border-blue-500'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {c.id} ({c.category.split('&')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Main Track Details */}
      {activeComplaint ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Investigation Timeline & Details (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Case Overview Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {activeComplaint.id}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        activeComplaint.status === 'Action Taken' || activeComplaint.status === 'Resolved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : activeComplaint.status === 'Under Investigation'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-blue-950 text-blue-300 border border-blue-700'
                      }`}
                    >
                      ● {activeComplaint.status}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {activeComplaint.title}
                  </h2>
                </div>

                <button
                  onClick={() => setShowCertificateModal(true)}
                  id="view-stamped-acknowledgment-btn"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Certified Slip</span>
                </button>
              </div>

              {/* Description & Facts */}
              <div className="space-y-2 text-xs">
                <p className="text-slate-300 leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  {activeComplaint.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 font-semibold block">Incident Location:</span>
                    <span className="text-slate-300 font-medium">
                      {activeComplaint.location.address}, {activeComplaint.location.city}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 font-semibold block">Lodged By:</span>
                    <span className="text-slate-300 font-medium">
                      {activeComplaint.isAnonymous ? 'Confidential' : activeComplaint.complainant.name}
                    </span>
                  </div>
                </div>

                {/* Legal Sections */}
                {activeComplaint.legalSections && activeComplaint.legalSections.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Applicable Bharatiya Nyaya Sanhita (BNS) Sections
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeComplaint.legalSections.map((sec) => (
                        <span
                          key={sec}
                          className="text-[11px] bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded-lg border border-blue-800/60 font-semibold"
                        >
                          ⚖️ {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Investigation Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Live Case Diary & Investigation Stages</span>
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                {activeComplaint.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400">{event.status}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{event.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300">{event.note}</p>
                      {event.officer && (
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Recorded by: {event.officer}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Assigned Officer & Supplementary Input (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Assigned Investigating Officer (IO) Card */}
            {activeComplaint.assignedOfficer ? (
              <div className="bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-900 border border-blue-600/40 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                    Assigned Investigating Officer
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900 text-blue-200 font-mono">
                    {activeComplaint.assignedOfficer.badgeNumber}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg">
                    <Shield className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {activeComplaint.assignedOfficer.name}
                    </h4>
                    <p className="text-xs text-blue-300 font-medium">
                      {activeComplaint.assignedOfficer.rank}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {activeComplaint.assignedOfficer.station}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Official Contact</span>
                    <span className="text-xs text-slate-200 font-mono">
                      {activeComplaint.assignedOfficer.phone}
                    </span>
                  </div>
                  <a
                    href={`tel:${activeComplaint.assignedOfficer.phone}`}
                    id="call-investigating-officer-btn"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call IO</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center text-xs text-slate-400 space-y-2">
                <Shield className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-bold text-slate-300">Investigating Officer Allocation in Progress</p>
                <p className="text-[11px]">
                  The Control Room is assigning a specialized officer based on jurisdiction and case nature.
                </p>
              </div>
            )}

            {/* Add Citizen Supplementary Statement */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Submit Additional Case Information
              </h3>
              <p className="text-[11px] text-slate-400">
                Did you discover new evidence, suspect sightings, or bank transaction IDs? Submit a supplementary note directly to the IO.
              </p>

              <form onSubmit={handleAddCitizenNote} className="space-y-2">
                <textarea
                  rows={3}
                  value={supplementaryNote}
                  onChange={(e) => setSupplementaryNote(e.target.value)}
                  placeholder="Type additional details or updates..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmittingNote}
                  id="submit-supplementary-note-btn"
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isSubmittingNote ? 'Saving to Diary...' : 'Add to Case Diary'}</span>
                </button>
              </form>

              {/* Render existing citizen notes */}
              {activeComplaint.citizenNotes && activeComplaint.citizenNotes.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Your Previous Supplementary Statements:
                  </span>
                  {activeComplaint.citizenNotes.map((n, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Citizen Satisfaction Feedback */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Citizen Police Assistance Feedback
              </h3>
              {!feedbackSubmitted ? (
                <div className="space-y-2 text-xs">
                  <p className="text-[11px] text-slate-400">
                    Rate the promptness and conduct of the police response:
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-300 ml-2">
                      {rating === 5 ? 'Excellent' : rating >= 3 ? 'Satisfactory' : 'Needs Improvement'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setFeedbackSubmitted(true);
                      alert('Thank you. Your feedback has been registered with the Police Complaints Authority.');
                    }}
                    className="w-full py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold mt-1"
                  >
                    Submit Police Rating
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/60 border border-emerald-600/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Feedback recorded. Thank you for helping improve citizen policing!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
          Enter an FIR reference number to track its current investigation stage.
        </div>
      )}

      {/* Modal: Stamped Certified Digital Acknowledgment */}
      {showCertificateModal && activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 max-w-xl w-full rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Certified e-FIR Record Slip
                </span>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="text-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white">POLICE DEPARTMENT OF INDIA</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                  STATE CRIME RECORDS REPOSITORY (BNSS SECTION 173)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-500 font-bold block">FIR / Reference ID:</span>
                  <span className="text-amber-300 font-mono font-black">{activeComplaint.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Lodged Timestamp:</span>
                  <span className="text-slate-300">{activeComplaint.dateTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Incident Category:</span>
                  <span className="text-slate-300">{activeComplaint.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">Complainant:</span>
                  <span className="text-slate-300">{activeComplaint.isAnonymous ? 'Confidential' : activeComplaint.complainant.name}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Statement Summary:</span>
                <p className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono">
                  {activeComplaint.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-blue-400" />
                  <div className="text-[9px] text-slate-400">
                    <span>DIGITAL CRYPTOGRAPHIC HASH</span>
                    <span className="block font-mono text-emerald-400">SHA256-POLICE-VERIFIED</span>
                  </div>
                </div>
                <div className="text-right text-[10px]">
                  <span className="text-slate-400 block">Status:</span>
                  <span className="font-bold text-blue-400 uppercase">{activeComplaint.status}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
