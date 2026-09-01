import React, { useState, useMemo } from 'react';
import {
  Car,
  AlertTriangle,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  PlusCircle,
  Shield,
  CreditCard,
  ExternalLink,
  ChevronRight,
  Radio,
  PhoneCall,
  Navigation,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { TrafficReport as TrafficReportType, Language } from '../types';
import { translations } from '../i18n/translations';
import { allIndiaPoliceStations } from '../services/locationPredictor';

interface TrafficReportProps {
  reports: TrafficReportType[];
  onReportCreated: (newReport: TrafficReportType) => void;
  language: Language;
}

export const TrafficReport: React.FC<TrafficReportProps> = ({
  reports,
  onReportCreated,
  language,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'StationRadar' | 'Feed' | 'Report' | 'Challan'>('StationRadar');

  // Station Traffic Radar filters
  const [selectedRadarState, setSelectedRadarState] = useState<string>('All');
  const [radarTrafficStatus, setRadarTrafficStatus] = useState<string>('All');
  const [radarSearch, setRadarSearch] = useState<string>('');

  // New report form state
  const [issueType, setIssueType] = useState<
    'Signal Failure' | 'Severe Traffic Jam' | 'Pothole/Road Hazard' | 'Illegal Parking' | 'Accident/Obstruction'
  >('Signal Failure');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [description, setDescription] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [severity, setSeverity] = useState<'Critical' | 'Moderate' | 'Minor'>('Critical');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Challan search simulator
  const [challanQuery, setChallanQuery] = useState('DL 01 AB 1234');
  const [challanResult, setChallanResult] = useState<{
    vehicle: string;
    owner: string;
    challans: { id: string; offense: string; date: string; fine: number; status: string; location: string }[];
  } | null>(null);

  // Filtered stations for radar
  const filteredStationRadar = useMemo(() => {
    return allIndiaPoliceStations.filter((st) => {
      const matchState = selectedRadarState === 'All' || st.state.toLowerCase() === selectedRadarState.toLowerCase();
      const matchTraffic = radarTrafficStatus === 'All' || st.trafficStatus === radarTrafficStatus;
      const q = radarSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        st.name.toLowerCase().includes(q) ||
        st.district.toLowerCase().includes(q) ||
        st.city.toLowerCase().includes(q) ||
        st.state.toLowerCase().includes(q) ||
        (st.liveTrafficAdvisory && st.liveTrafficAdvisory.toLowerCase().includes(q));

      return matchState && matchTraffic && matchSearch;
    });
  }, [selectedRadarState, radarTrafficStatus, radarSearch]);

  const indianStates = [
    'All',
    'Delhi',
    'Maharashtra',
    'Karnataka',
    'Tamil Nadu',
    'Telangana',
    'Andhra Pradesh',
    'West Bengal',
    'Uttar Pradesh',
    'Gujarat',
    'Rajasthan',
    'Kerala',
    'Punjab',
    'Chandigarh',
    'Madhya Pradesh',
    'Bihar',
    'Jharkhand',
    'Odisha',
    'Assam',
    'Meghalaya',
    'Jammu & Kashmir',
    'Uttarakhand',
    'Himachal Pradesh',
    'Haryana',
    'Goa',
  ];

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        issueType,
        location,
        city,
        description,
        vehicleNumber: vehicleNumber.trim() ? vehicleNumber.toUpperCase() : undefined,
        severity,
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=400&auto=format&fit=crop&q=80',
      };

      const res = await fetch('/api/traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const newRec: TrafficReportType = await res.json();
      onReportCreated(newRec);
      setActiveTab('Feed');
      alert('Traffic hazard reported to Traffic Police Control & Marshals dispatched.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckChallan = (e: React.FormEvent) => {
    e.preventDefault();
    const q = challanQuery.trim().toUpperCase();
    if (!q) return;

    setChallanResult({
      vehicle: q,
      owner: 'R. K. Sharma',
      challans: [
        {
          id: 'CH-2026-TR-9041',
          offense: 'Jumping Red Light (Sec 184 MV Act)',
          date: '2026-03-24 14:10',
          fine: 1000,
          status: 'Pending Payment',
          location: 'Ring Road Moti Bagh Junction',
        },
        {
          id: 'CH-2026-TR-8120',
          offense: 'Exceeding Speed Limit (>65 km/h)',
          date: '2026-03-12 09:45',
          fine: 2000,
          status: 'Settled Online',
          location: 'Outer Ring Road Flyover',
        },
      ],
    });
  };

  const getTrafficBadge = (status?: string) => {
    switch (status) {
      case 'Smooth':
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
          dot: 'bg-emerald-500',
        };
      case 'Moderate':
        return {
          bg: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
          dot: 'bg-blue-500',
        };
      case 'Slow Moving':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          dot: 'bg-amber-500',
        };
      case 'Heavy Congestion':
        return {
          bg: 'bg-red-950/80 text-red-300 border-red-700/60',
          dot: 'bg-red-500',
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Car className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                National Traffic & Road Advisory Division
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">{t.trafficAdvisoryTitle}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Live traffic congestion index for every police jurisdiction across India, real-time road blockage alerts, and instant e-Challan payment portal.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('StationRadar')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'StationRadar'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All-India Station Traffic
            </button>
            <button
              onClick={() => setActiveTab('Feed')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'Feed'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Incident Feed
            </button>
            <button
              onClick={() => setActiveTab('Report')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'Report'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Report Hazard
            </button>
            <button
              onClick={() => setActiveTab('Challan')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'Challan'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              e-Challan Portal
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: ALL-INDIA POLICE STATION TRAFFIC RADAR */}
      {activeTab === 'StationRadar' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={radarSearch}
                onChange={(e) => setRadarSearch(e.target.value)}
                placeholder="Search station jurisdiction or highway..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedRadarState}
                onChange={(e) => setSelectedRadarState(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {indianStates.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? '🇮🇳 All Indian States & UTs' : `🇮🇳 ${s}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={radarTrafficStatus}
                onChange={(e) => setRadarTrafficStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="All">🚦 All Conditions</option>
                <option value="Smooth">🟢 Smooth Flow</option>
                <option value="Moderate">🔵 Moderate Flow</option>
                <option value="Slow Moving">🟡 Slow Moving</option>
                <option value="Heavy Congestion">🔴 Heavy Congestion</option>
              </select>
            </div>
          </div>

          {/* Station Traffic Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStationRadar.map((st) => {
              const badge = getTrafficBadge(st.trafficStatus);

              return (
                <div
                  key={st.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    {/* Header: State & Live Condition */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {st.state} • {st.district}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1.5 ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {st.trafficStatus || 'Smooth'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-1">{st.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{st.address}</p>

                    {/* Congestion Load Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Road Volume Load</span>
                        <span className="font-mono font-bold text-amber-300">
                          {st.trafficCongestionPercent || 25}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            (st.trafficCongestionPercent || 25) > 70
                              ? 'bg-red-500'
                              : (st.trafficCongestionPercent || 25) > 45
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${st.trafficCongestionPercent || 25}%` }}
                        />
                      </div>
                    </div>

                    {/* Live Advisory */}
                    {st.liveTrafficAdvisory && (
                      <p className="text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 mt-3">
                        <span className="text-amber-400 font-bold">Advisory: </span>
                        {st.liveTrafficAdvisory}
                      </p>
                    )}

                    {/* Peak Hours & Patrols */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>PCR Interceptors: <strong className="text-emerald-400">{st.pcrVehicles || 4} Live</strong></span>
                      <span>Helpline: <strong className="text-cyan-300 font-mono">{st.trafficHelpline || '1095'}</strong></span>
                    </div>
                  </div>

                  {/* Actions: Dial Traffic Control & Google Maps Nav */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <a
                      href={`tel:${st.trafficHelpline || st.emergencyPhone}`}
                      className="py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 text-center"
                    >
                      <PhoneCall className="w-3 h-3 text-cyan-400" />
                      <span>Traffic Desk</span>
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        st.name + ' ' + st.address
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1 text-center"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Navigate</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INCIDENT FEED */}
      {activeTab === 'Feed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              Live Reports Logged by Citizens & Traffic Officers ({reports.length})
            </span>
            <button
              onClick={() => setActiveTab('Report')}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Road Incident</span>
            </button>
          </div>

          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.severity === 'Critical'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : r.severity === 'Moderate'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {r.severity} Severity
                    </span>
                    <span className="text-xs font-bold text-white">{r.issueType}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{r.location}, {r.city}</span>
                  </div>
                  <p className="text-xs text-slate-300">{r.description}</p>
                  {r.vehicleNumber && (
                    <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-300">
                      Vehicle: {r.vehicleNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {r.status}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">{r.reportedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REPORT HAZARD */}
      {activeTab === 'Report' && (
        <form onSubmit={handleCreateReport} className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-xl font-black text-white">Broadcast Traffic Hazard / Signal Failure</h2>
            <p className="text-xs text-slate-400 mt-1">
              Your submission will trigger immediate priority routing to the regional Traffic Police control marshals.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Issue Category</label>
              <select
                value={issueType}
                onChange={(e: any) => setIssueType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
              >
                <option value="Signal Failure">Signal Light Broken / Blank</option>
                <option value="Severe Traffic Jam">Severe Gridlock / Jam</option>
                <option value="Pothole/Road Hazard">Deep Pothole / Construction Hazard</option>
                <option value="Illegal Parking">Illegal Parking Blocking Road</option>
                <option value="Accident/Obstruction">Vehicle Breakdown / Collision</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Location / Intersection</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ring Road Moti Bagh Underpass"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Optional Vehicle Number (for illegal parking/offense)</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. DL 03 CA 9988"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Description & Impact</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current congestion length, broken signal lights, or safety hazard..."
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('Feed')}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg"
              >
                {isSubmitting ? 'Transmitting...' : 'Dispatch to Traffic Police'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: e-CHALLAN LOOKUP */}
      {activeTab === 'Challan' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-xl font-black text-white">National Parivahan & e-Challan Portal</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your vehicle registration number to fetch camera-captured speed, signal, or helmet challans.
              </p>
            </div>

            <form onSubmit={handleCheckChallan} className="flex gap-2">
              <input
                type="text"
                value={challanQuery}
                onChange={(e) => setChallanQuery(e.target.value)}
                placeholder="e.g. DL 01 AB 1234 or MH 02 CD 5678"
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-slate-200 font-mono uppercase focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-2xl shadow"
              >
                Search Challans
              </button>
            </form>
          </div>

          {challanResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Vehicle Number</span>
                  <p className="text-base font-black text-amber-300 font-mono">{challanResult.vehicle}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Registered Owner</span>
                  <p className="text-xs font-bold text-slate-200">{challanResult.owner}</p>
                </div>
              </div>

              <div className="space-y-3">
                {challanResult.challans.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-amber-400">{ch.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            ch.status.includes('Pending')
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {ch.status}
                        </span>
                      </div>
                      <p className="font-bold text-white">{ch.offense}</p>
                      <p className="text-[11px] text-slate-400">
                        {ch.location} • {ch.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase">Fine Amount</span>
                        <p className="text-sm font-black text-amber-300 font-mono">₹{ch.fine}</p>
                      </div>
                      {ch.status.includes('Pending') && (
                        <button
                          onClick={() => alert(`Simulated Payment Gateway: ₹${ch.fine} settled for ${ch.id}.`)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Online</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
