import React, { useState, useMemo } from 'react';
import {
  Search,
  Radio,
  User,
  Package,
  Car,
  MapPin,
  Clock,
  PhoneCall,
  Eye,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
  Share2,
} from 'lucide-react';
import { MissingRecord, Language } from '../types';
import { translations } from '../i18n/translations';

interface MissingSearchProps {
  records: MissingRecord[];
  onRecordCreated: (newRecord: MissingRecord) => void;
  language: Language;
}

export const MissingSearch: React.FC<MissingSearchProps> = ({
  records,
  onRecordCreated,
  language,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'Person' | 'Item' | 'Vehicle' | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedForTip, setSelectedForTip] = useState<MissingRecord | null>(null);
  const [tipLocation, setTipLocation] = useState('');
  const [tipDetails, setTipDetails] = useState('');
  const [tipSubmitted, setTipSubmitted] = useState(false);

  // Report form state
  const [formType, setFormType] = useState<'Person' | 'Item' | 'Vehicle'>('Person');
  const [formTitle, setFormTitle] = useState('');
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [formHeight, setFormHeight] = useState('');
  const [formLastSeenDate, setFormLastSeenDate] = useState(new Date().toISOString().slice(0, 10));
  const [formLastSeenLocation, setFormLastSeenLocation] = useState('');
  const [formCity, setFormCity] = useState('New Delhi');
  const [formDesc, setFormDesc] = useState('');
  const [formMarks, setFormMarks] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formReward, setFormReward] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchType = activeTab === 'All' || r.type === activeTab;
      const matchCity = selectedCity === 'All' || r.city.toLowerCase() === selectedCity.toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        r.lastSeenLocation.toLowerCase().includes(q) ||
        r.policeCaseNo.toLowerCase().includes(q) ||
        (r.identificationMarks && r.identificationMarks.toLowerCase().includes(q));

      return matchType && matchCity && matchQuery;
    });
  }, [records, activeTab, selectedCity, searchQuery]);

  const handleSendTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForTip || !tipDetails.trim()) return;

    try {
      await fetch(`/api/missing/${selectedForTip.id}/tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: tipLocation,
          details: tipDetails,
        }),
      });
      setTipSubmitted(true);
      setTimeout(() => {
        setTipSubmitted(false);
        setSelectedForTip(null);
        setTipLocation('');
        setTipDetails('');
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        type: formType,
        title: formTitle || `Missing ${formName || 'Valuables'}`,
        name: formName,
        age: formAge ? Number(formAge) : undefined,
        gender: formGender,
        height: formHeight,
        lastSeenDate: formLastSeenDate,
        lastSeenLocation: formLastSeenLocation,
        city: formCity,
        description: formDesc,
        identificationMarks: formMarks,
        serialOrIMEI: formSerial,
        reward: formReward,
        photoUrl:
          formPhoto ||
          (formType === 'Person'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80'),
      };

      const res = await fetch('/api/missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const newRec: MissingRecord = await res.json();
      onRecordCreated(newRec);
      setShowReportModal(false);
      alert('Missing report broadcasted to Police Control Room & Citizen Network.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                National Missing & Traced Network
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{t.missingSearchTitle}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Search nationwide database of missing persons, lost electronics, documents, and stolen vehicles. Report sightings to assist police investigations.
            </p>
          </div>

          <button
            onClick={() => setShowReportModal(true)}
            id="open-report-missing-modal-btn"
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-950 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Missing Person / Valuables</span>
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, marks, IMEI, vehicle plate, or case number..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Regions / Cities</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Navi Mumbai">Navi Mumbai</option>
            </select>
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {(['All', 'Person', 'Item', 'Vehicle'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                }`}
              >
                {tab === 'Person' && <User className="w-3.5 h-3.5" />}
                {tab === 'Item' && <Package className="w-3.5 h-3.5" />}
                {tab === 'Vehicle' && <Car className="w-3.5 h-3.5" />}
                <span>{tab === 'All' ? 'All Broadcasts' : `Missing ${tab}s`}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Missing Records */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecords.map((record) => (
          <div
            key={record.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group"
          >
            {/* Top Photo & Status */}
            <div>
              <div className="relative h-48 sm:h-52 bg-slate-950 overflow-hidden">
                <img
                  src={record.photoUrl}
                  alt={record.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg border shadow backdrop-blur-md ${
                      record.type === 'Person'
                        ? 'bg-red-950/80 text-red-300 border-red-700'
                        : 'bg-blue-950/80 text-blue-300 border-blue-700'
                    }`}
                  >
                    {record.type}
                  </span>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 shadow">
                    ● {record.status}
                  </span>
                </div>

                {/* Reward Banner */}
                {record.reward && (
                  <div className="absolute bottom-2 left-3 right-3 bg-amber-950/90 border border-amber-500/50 text-amber-200 px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{record.reward}</span>
                  </div>
                )}
              </div>

              {/* Body Details */}
              <div className="p-4 sm:p-5 space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">
                    Case No: {record.policeCaseNo}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {record.name || record.title}
                  </h3>
                  {record.age && (
                    <p className="text-xs text-blue-400 font-semibold">
                      Age: {record.age} yrs • Gender: {record.gender} • Height: {record.height || 'N/A'}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-1">
                      <strong className="text-slate-400">Last Seen:</strong> {record.lastSeenLocation}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      <strong className="text-slate-400">Date:</strong> {record.lastSeenDate}
                    </span>
                  </div>
                </div>

                {record.identificationMarks && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                    <span className="text-slate-500 font-bold block">Identifying Marks:</span>
                    <p className="line-clamp-2">{record.identificationMarks}</p>
                  </div>
                )}

                {record.serialOrIMEI && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono">
                    <span className="text-slate-500 font-bold block">Serial / IMEI:</span>
                    <span>{record.serialOrIMEI}</span>
                  </div>
                )}

                <p className="text-xs text-slate-400 line-clamp-2">{record.description}</p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
              <button
                onClick={() => setSelectedForTip(record)}
                id={`report-sighting-btn-${record.id}`}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>I Spotted This</span>
              </button>

              <a
                href="tel:112"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1"
                title="Call Police Desk"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Sighting Tip Modal */}
      {selectedForTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Report Sighting Lead for: {selectedForTip.name || selectedForTip.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedForTip(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
            </div>

            {tipSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Information Dispatched to Search Team!</h4>
                <p className="text-xs text-slate-400">
                  Thank you for your civic contribution. The investigating officer has received your sighting tip.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendTip} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Where & When Did You Spot Them?
                  </label>
                  <input
                    type="text"
                    value={tipLocation}
                    onChange={(e) => setTipLocation(e.target.value)}
                    placeholder="e.g. Near New Delhi Railway Station Platform 3 at 11:30 AM"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Key Observations / Clothing / Vehicle / Companions
                  </label>
                  <textarea
                    rows={3}
                    value={tipDetails}
                    onChange={(e) => setTipDetails(e.target.value)}
                    placeholder="Describe clothing, physical condition, direction of movement..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedForTip(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    Submit Sighting to Police
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Missing Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Broadcast Missing Person or Lost Valuables
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
              {/* Type selector */}
              <div>
                <label className="text-slate-400 font-bold block mb-1">Select Type</label>
                <div className="flex gap-2">
                  {(['Person', 'Item', 'Vehicle'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setFormType(t)}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                        formType === t
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {formType === 'Person' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Age</label>
                    <input
                      type="number"
                      value={formAge}
                      onChange={(e) => setFormAge(e.target.value)}
                      placeholder="e.g. 72"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Gender</label>
                    <select
                      value={formGender}
                      onChange={(e: any) => setFormGender(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Title / Item Name</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Lost iPhone 15 Pro / Stolen Honda Activa"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Last Seen Date</label>
                  <input
                    type="date"
                    value={formLastSeenDate}
                    onChange={(e) => setFormLastSeenDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Last Seen Location / Landmark
                </label>
                <input
                  type="text"
                  value={formLastSeenLocation}
                  onChange={(e) => setFormLastSeenLocation(e.target.value)}
                  placeholder="e.g. Near Lodhi Garden Gate 2, New Delhi"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Identifying Marks / Distinguishing Features
                </label>
                <input
                  type="text"
                  value={formMarks}
                  onChange={(e) => setFormMarks(e.target.value)}
                  placeholder="e.g. Scar on forehead, wearing yellow kurta, spectacles"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Provide full description of circumstances, medical conditions, languages spoken, etc."
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish to Police Network'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
