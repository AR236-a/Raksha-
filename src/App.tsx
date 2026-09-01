import React, { useState, useEffect } from 'react';
import {
  AppView,
  Language,
  Complaint,
  PoliceStation,
  MissingRecord,
  TrafficReport as TrafficReportType,
  LegalGuideItem,
} from './types';
import { Navbar } from './components/Navbar';
import { HomeOverview } from './components/HomeOverview';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { NearestStations } from './components/NearestStations';
import { ReportIncident } from './components/ReportIncident';
import { TrackComplaint } from './components/TrackComplaint';
import { MissingSearch } from './components/MissingSearch';
import { TrafficReport } from './components/TrafficReport';
import { ProcedureGuide } from './components/ProcedureGuide';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LiveDeviceTracker } from './components/LiveDeviceTracker';
import {
  mockComplaints,
  mockPoliceStations,
  mockMissingRecords,
  mockTrafficReports,
  mockLegalGuides,
} from './data/mockData';
import { translations } from './i18n/translations';
import { Shield, PhoneCall, Globe, Heart, Lock, AlertTriangle, BookOpen, Bot } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('stations');
  const [language, setLanguage] = useState<Language>('en');
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [initialTrackingId, setInitialTrackingId] = useState<string>('FIR-2026-DEL-1042');
  const [focusedStationId, setFocusedStationId] = useState<string | null>(null);

  // Application Data States
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [stations, setStations] = useState<PoliceStation[]>(mockPoliceStations);
  const [missingRecords, setMissingRecords] = useState<MissingRecord[]>(mockMissingRecords);
  const [trafficReports, setTrafficReports] = useState<TrafficReportType[]>(mockTrafficReports);
  const [legalGuides, setLegalGuides] = useState<LegalGuideItem[]>(mockLegalGuides);

  const t = translations[language];

  // Fetch live backend data if available
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, stationsRes, missingRes, trafficRes, guidesRes] = await Promise.allSettled([
          fetch('/api/complaints').then((r) => r.json()),
          fetch('/api/stations').then((r) => r.json()),
          fetch('/api/missing').then((r) => r.json()),
          fetch('/api/traffic').then((r) => r.json()),
          fetch('/api/guides').then((r) => r.json()),
        ]);

        if (complaintsRes.status === 'fulfilled' && Array.isArray(complaintsRes.value)) {
          setComplaints(complaintsRes.value);
        }
        if (stationsRes.status === 'fulfilled' && Array.isArray(stationsRes.value)) {
          setStations(stationsRes.value);
        }
        if (missingRes.status === 'fulfilled' && Array.isArray(missingRes.value)) {
          setMissingRecords(missingRes.value);
        }
        if (trafficRes.status === 'fulfilled' && Array.isArray(trafficRes.value)) {
          setTrafficReports(trafficRes.value);
        }
        if (guidesRes.status === 'fulfilled' && Array.isArray(guidesRes.value)) {
          setLegalGuides(guidesRes.value);
        }
      } catch (err) {
        console.warn('API sync fallback to mock data:', err);
      }
    };

    fetchData();
  }, []);

  const handleComplaintCreated = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
  };

  const handleNavigateToTrack = (trackingNumber: string) => {
    setInitialTrackingId(trackingNumber);
    setCurrentView('track');
  };

  const handleMissingCreated = (newRec: MissingRecord) => {
    setMissingRecords((prev) => [newRec, ...prev]);
  };

  const handleTrafficCreated = (newReport: TrafficReportType) => {
    setTrafficReports((prev) => [newReport, ...prev]);
  };

  const handleUpdateComplaintStatus = async (
    id: string,
    newStatus: Complaint['status'],
    note: string,
    officerName?: string
  ) => {
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note, officerName }),
      });
      const updated = await res.json();
      setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (e) {
      console.error(e);
      // Fallback local update
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: newStatus,
                timeline: [
                  ...c.timeline,
                  {
                    status: newStatus,
                    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                    note,
                    officer: officerName,
                  },
                ],
              }
            : c
        )
      );
    }
  };

  const handleMarkMissingTraced = async (id: string) => {
    try {
      const res = await fetch(`/api/missing/${id}/traced`, { method: 'PATCH' });
      const updated = await res.json();
      setMissingRecords((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (e) {
      setMissingRecords((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'Traced' } : m))
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        language={language}
        setLanguage={setLanguage}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={() => {
          setIsAdminLoggedIn(false);
          setCurrentView('home');
        }}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'home' && (
          <HomeOverview
            onNavigate={setCurrentView}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenAI={() => setIsAIOpen(true)}
            language={language}
            stationsCount={stations.length}
            complaintsCount={complaints.length}
            missingCount={missingRecords.length}
          />
        )}

        {currentView === 'live_location' && (
          <LiveDeviceTracker
            language={language}
            stations={stations}
            onOpenSOS={() => setIsSOSOpen(true)}
            onNavigateToStation={(stationId) => {
              setFocusedStationId(stationId);
              setCurrentView('stations');
            }}
          />
        )}

        {currentView === 'stations' && (
          <NearestStations
            stations={stations}
            language={language}
            selectedStationId={focusedStationId}
          />
        )}

        {currentView === 'report' && (
          <ReportIncident
            onComplaintCreated={handleComplaintCreated}
            onNavigateToTrack={handleNavigateToTrack}
            language={language}
          />
        )}

        {currentView === 'track' && (
          <TrackComplaint
            complaints={complaints}
            initialTrackingId={initialTrackingId}
            language={language}
          />
        )}

        {currentView === 'missing' && (
          <MissingSearch
            records={missingRecords}
            onRecordCreated={handleMissingCreated}
            language={language}
          />
        )}

        {currentView === 'traffic' && (
          <TrafficReport
            reports={trafficReports}
            onReportCreated={handleTrafficCreated}
            language={language}
          />
        )}

        {currentView === 'procedures' && (
          <ProcedureGuide guides={legalGuides} language={language} />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            isLoggedIn={isAdminLoggedIn}
            onLogin={() => setIsAdminLoggedIn(true)}
            onLogout={() => setIsAdminLoggedIn(false)}
            complaints={complaints}
            missingRecords={missingRecords}
            trafficReports={trafficReports}
            stations={stations}
            onUpdateComplaintStatus={handleUpdateComplaintStatus}
            onMarkMissingTraced={handleMarkMissingTraced}
            language={language}
          />
        )}
      </main>

      {/* Emergency SOS Panic Modal */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        language={language}
      />

      {/* AI Legal Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        language={language}
        onNavigate={setCurrentView}
        onOpenSOS={() => {
          setIsAIOpen(false);
          setIsSOSOpen(true);
        }}
      />

      {/* Floating Action Button on Bottom Right for AI */}
      <button
        onClick={() => setIsAIOpen(true)}
        id="floating-ai-assistant-fab"
        className="fixed bottom-6 right-6 z-40 p-3.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-2xl shadow-purple-950 border border-purple-400/40 flex items-center gap-2 transition-transform transform hover:scale-105 active:scale-95"
        title="Open AI Legal Assistant"
      >
        <Bot className="w-5 h-5 animate-pulse text-amber-300" />
        <span className="hidden sm:inline">AI Legal Help ({language.toUpperCase()})</span>
      </button>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-amber-300">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-white">{t.appName}</span>
                <p className="text-[11px] text-slate-400">
                  National Police & Citizen Assistance Digital Platform
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-slate-300 font-bold">24x7 Helplines:</span>
              <span className="text-red-400 font-mono font-bold">112 (Emergency)</span>
              <span className="text-pink-400 font-mono font-bold">1091 (Women)</span>
              <span className="text-blue-400 font-mono font-bold">1930 (Cyber Crime)</span>
              <span className="text-slate-300 font-mono font-bold">1098 (Childline)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>
              Grounded in Bharatiya Nyaya Sanhita (BNS), Bharatiya Nagarik Suraksha Sanhita (BNSS), and National Emergency Response System (NERS 112).
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('admin')}
                className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
              >
                <Lock className="w-3 h-3" />
                <span>Officer Desk</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
