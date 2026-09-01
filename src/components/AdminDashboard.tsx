import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  FileText,
  Radio,
  Car,
  UserCheck,
  CheckCircle2,
  Clock,
  Search,
  Lock,
  PhoneCall,
  MapPin,
  TrendingUp,
  Filter,
  Eye,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { Complaint, MissingRecord, TrafficReport, PoliceStation, Language } from '../types';
import { translations } from '../i18n/translations';

interface AdminDashboardProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  complaints: Complaint[];
  missingRecords: MissingRecord[];
  trafficReports: TrafficReport[];
  stations: PoliceStation[];
  onUpdateComplaintStatus: (id: string, newStatus: Complaint['status'], note: string, officerName?: string) => void;
  onMarkMissingTraced: (id: string) => void;
  language: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isLoggedIn,
  onLogin,
  onLogout,
  complaints,
  missingRecords,
  trafficReports,
  stations,
  onUpdateComplaintStatus,
  onMarkMissingTraced,
  language,
}) => {
  const t = translations[language];
  const [adminTab, setAdminTab] = useState<'SOS' | 'Complaints' | 'Missing' | 'Traffic'>('Complaints');

  // Login credentials state
  const [badgeId, setBadgeId] = useState('DEL-POL-8842');
  const [pinCode, setPinCode] = useState('1122');
  const [stationCode, setStationCode] = useState('PS-DEL-001');

  // Selected complaint for status update modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<Complaint['status']>('Under Investigation');
  const [statusNote, setStatusNote] = useState('');
  const [assignedOfficerName, setAssignedOfficerName] = useState('SI Rajesh Sharma (Badge #8842)');

  // Filter complaints
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComplaints = complaints.filter((c) => {
    const matchCat = filterCategory === 'All' || c.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const matchQ =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.complainant.name.toLowerCase().includes(q) ||
      c.location.address.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    onUpdateComplaintStatus(
      selectedComplaint.id,
      newStatus,
      statusNote || `Status updated to ${newStatus} by Desk Incharge.`,
      assignedOfficerName
    );

    alert(`Complaint ${selectedComplaint.id} updated to "${newStatus}".`);
    setSelectedComplaint(null);
    setStatusNote('');
  };

  // If not logged in -> Show Official Login Screen
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-900/40 border border-amber-400/30">
            <Shield className="w-8 h-8 text-amber-200" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
            OFFICIAL USE ONLY
          </span>
          <h2 className="text-2xl font-black text-white">Police Officer Desk Portal</h2>
          <p className="text-xs text-slate-400">
            Authorized access for Station House Officers (SHO), Duty Officers & Control Room Dispatchers.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Police Station Jurisdiction</label>
            <select
              value={stationCode}
              onChange={(e) => setStationCode(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Officer Badge ID / Service No.</label>
            <input
              type="text"
              value={badgeId}
              onChange={(e) => setBadgeId(e.target.value)}
              placeholder="e.g. DEL-POL-8842"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-mono"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Security PIN / Passcode</label>
            <input
              type="password"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="••••"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-mono"
              required
            />
          </div>

          <div className="bg-blue-950/40 border border-blue-800/40 p-3 rounded-xl text-[11px] text-blue-200 space-y-1">
            <span className="font-bold block">Demo Access Credentials:</span>
            <span>Badge ID: <code>DEL-POL-8842</code> | PIN: <code>1122</code></span>
          </div>

          <button
            type="submit"
            id="admin-login-submit-btn"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-blue-950 text-xs tracking-wider"
          >
            Authenticate & Open Control Desk
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Officer Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Police Control Room • Duty Station
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                  BADGE: {badgeId}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Officer Command & Dispatch Console
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl"
            >
              Sign Out Desk
            </button>
          </div>
        </div>

        {/* Real-time Police Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total e-FIRs</span>
            <p className="text-xl font-black text-white font-mono">{complaints.length}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Active 112 SOS</span>
            <p className="text-xl font-black text-red-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              1 Live
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Missing Bulletins</span>
            <p className="text-xl font-black text-amber-300 font-mono">{missingRecords.length}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Response Time</span>
            <p className="text-xl font-black text-emerald-400 font-mono">4.2 MINS</p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 text-xs">
          {(['Complaints', 'SOS', 'Missing', 'Traffic'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setAdminTab(tab)}
              className={`px-4 py-2 rounded-xl font-extrabold transition-all flex items-center gap-1.5 ${
                adminTab === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
              }`}
            >
              {tab === 'Complaints' && <FileText className="w-4 h-4" />}
              {tab === 'SOS' && <AlertTriangle className="w-4 h-4 text-red-400" />}
              {tab === 'Missing' && <Radio className="w-4 h-4 text-amber-400" />}
              {tab === 'Traffic' && <Car className="w-4 h-4 text-blue-400" />}
              <span>{tab === 'Complaints' ? 'e-FIR Investigation Queue' : tab === 'SOS' ? '112 SOS Distress Board' : tab === 'Missing' ? 'Missing Bulletins' : 'Road Reports'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab: e-FIR Investigation Queue */}
      {adminTab === 'Complaints' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by FIR ID, complainant name, or keywords..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200"
            >
              <option value="All">All Categories</option>
              <option value="Theft & Burglary">Theft & Burglary</option>
              <option value="Cyber Crime & Fraud">Cyber Crime & Fraud</option>
              <option value="Women Safety & Harassment">Women Safety</option>
              <option value="Lost & Found Property">Lost Property</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredComplaints.map((c) => (
              <div
                key={c.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-slate-700"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black font-mono px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {c.id}
                    </span>
                    <span className="text-xs font-bold text-slate-300">{c.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'Action Taken' || c.status === 'Resolved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : c.status === 'Under Investigation'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-blue-950 text-blue-300 border border-blue-700'
                      }`}
                    >
                      ● {c.status}
                    </span>
                    {c.priority === 'Emergency' && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-700 animate-pulse">
                        CRITICAL PRIORITY
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white">{c.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>
                      <strong className="text-slate-300">Complainant:</strong>{' '}
                      {c.isAnonymous ? 'Confidential (Anonymous)' : `${c.complainant.name} (${c.complainant.phone})`}
                    </span>
                    <span>
                      <strong className="text-slate-300">Location:</strong> {c.location.address}, {c.location.city}
                    </span>
                    <span>
                      <strong className="text-slate-300">Lodged:</strong> {c.dateTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      setNewStatus(c.status);
                    }}
                    id={`update-fir-status-${c.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow"
                  >
                    Update Status & IO
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: SOS Distress Board */}
      {adminTab === 'SOS' && (
        <div className="space-y-4">
          <div className="bg-red-950/40 border border-red-600/50 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-red-800/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <h3 className="text-base font-black text-red-200 uppercase tracking-wide">
                  Active Emergency SOS Distress Beacons
                </h3>
              </div>
              <span className="text-xs text-red-300 font-mono font-bold">1 Alert Awaiting Interceptor</span>
            </div>

            <div className="bg-slate-900 border border-red-500/40 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-amber-300 text-sm">SOS-ALERT #8921</span>
                  <span className="bg-red-950 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-700">
                    General SOS / Distress
                  </span>
                </div>
                <p className="text-slate-200 font-semibold">
                  Location: Near Connaught Place Outer Circle, New Delhi (GPS 28.6315°N, 77.2167°E)
                </p>
                <p className="text-slate-400 text-[11px]">Beacon Transmitted 2 mins ago via Citizen Mobile App</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Patrol Interceptor #14 dispatched with Siren priority.')}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  <Car className="w-4 h-4" />
                  <span>Dispatch Patrol Unit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Missing Bulletins */}
      {adminTab === 'Missing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missingRecords.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 text-xs"
              >
                <img
                  src={m.photoUrl}
                  alt={m.title}
                  className="w-20 h-24 object-cover rounded-xl border border-slate-700 shrink-0"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-blue-400 font-bold">{m.policeCaseNo}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.status === 'Traced'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white">{m.name || m.title}</h4>
                  <p className="text-slate-400 text-[11px]">Last seen: {m.lastSeenLocation}</p>
                  {m.status !== 'Traced' && (
                    <button
                      onClick={() => onMarkMissingTraced(m.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] mt-1"
                    >
                      Mark as Traced / Found
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Traffic Reports */}
      {adminTab === 'Traffic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trafficReports.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">{t.type} - {t.title}</span>
                  <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400">
                    {t.city}
                  </span>
                </div>
                <p className="text-slate-300">{t.description}</p>
                <p className="text-[11px] text-slate-400">📍 {t.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Status Update & IO Assignment */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Update Status for Case #{selectedComplaint.id}
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Investigation Stage</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                >
                  <option value="Submitted">Submitted (Under Initial Review)</option>
                  <option value="Under Investigation">Under Investigation (IO Dispatched)</option>
                  <option value="Action Taken">Action Taken (FIR / ChargeSheet Filed)</option>
                  <option value="Resolved">Resolved / Recovered</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Assign Investigating Officer (IO)
                </label>
                <input
                  type="text"
                  value={assignedOfficerName}
                  onChange={(e) => setAssignedOfficerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Case Diary Update Note (Visible on Citizen Tracker)
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. CCTV footage requisitioned from junction camera. IO visited site."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                >
                  Commit Case Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
