import React from 'react';
import {
  Shield,
  PhoneCall,
  MapPin,
  FileText,
  Search,
  Radio,
  Car,
  BookOpen,
  Bot,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Volume2,
  Clock,
  Crosshair,
} from 'lucide-react';
import { AppView, Language, Complaint, PoliceStation } from '../types';
import { translations } from '../i18n/translations';

interface HomeOverviewProps {
  onNavigate: (view: AppView) => void;
  onOpenSOS: () => void;
  onOpenAI: () => void;
  language: Language;
  stationsCount: number;
  complaintsCount: number;
  missingCount: number;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onNavigate,
  onOpenSOS,
  onOpenAI,
  language,
  stationsCount,
  complaintsCount,
  missingCount,
}) => {
  const t = translations[language];

  const quickFeatures = [
    {
      id: 'live_location' as AppView,
      title: 'Live Device GPS & Radar',
      desc: 'Real-time high-precision device telemetry, safe night-walk beacons, and linked family tracker.',
      icon: <Crosshair className="w-6 h-6 text-cyan-400" />,
      accent: 'border-cyan-500/40 hover:border-cyan-400 bg-gradient-to-br from-cyan-950/40 to-slate-900',
      tag: 'Live Telemetry & Radar',
    },
    {
      id: 'stations' as AppView,
      title: t.findStation,
      desc: 'Locate jurisdictional police stations, direct SHO contact numbers, and 24x7 helpdesks.',
      icon: <MapPin className="w-6 h-6 text-blue-400" />,
      accent: 'border-blue-500/30 hover:border-blue-500 bg-gradient-to-br from-blue-950/40 to-slate-900',
      tag: `${stationsCount} Stations Live`,
    },
    {
      id: 'report' as AppView,
      title: t.reportIncident,
      desc: 'Register online e-FIR, cyber crime, theft, or anonymous tips with AI Legal Drafting assistance.',
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
      accent: 'border-emerald-500/30 hover:border-emerald-500 bg-gradient-to-br from-emerald-950/40 to-slate-900',
      tag: 'AI e-FIR Drafter',
    },
    {
      id: 'track' as AppView,
      title: t.trackComplaint,
      desc: 'Track live investigation timeline, case diary notes, and call assigned Investigating Officer (IO).',
      icon: <Search className="w-6 h-6 text-amber-400" />,
      accent: 'border-amber-500/30 hover:border-amber-500 bg-gradient-to-br from-amber-950/40 to-slate-900',
      tag: `${complaintsCount} In Case Diary`,
    },
    {
      id: 'missing' as AppView,
      title: t.missingSearch,
      desc: 'Search missing persons, lost mobile phones, and stolen vehicles or report confidential sighting leads.',
      icon: <Radio className="w-6 h-6 text-rose-400" />,
      accent: 'border-rose-500/30 hover:border-rose-500 bg-gradient-to-br from-rose-950/40 to-slate-900',
      tag: `${missingCount} Active Bulletins`,
    },
    {
      id: 'traffic' as AppView,
      title: t.trafficReport,
      desc: 'Report signal failures, heavy road congestion, and check/pay camera e-Challans online.',
      icon: <Car className="w-6 h-6 text-indigo-400" />,
      accent: 'border-indigo-500/30 hover:border-indigo-500 bg-gradient-to-br from-indigo-950/40 to-slate-900',
      tag: 'e-Challan Portal',
    },
    {
      id: 'procedures' as AppView,
      title: t.policeGuide,
      desc: 'Know your legal rights on Zero FIR, Supreme Court D.K. Basu arrest rules, and Women Safety laws.',
      icon: <BookOpen className="w-6 h-6 text-purple-400" />,
      accent: 'border-purple-500/30 hover:border-purple-500 bg-gradient-to-br from-purple-950/40 to-slate-900',
      tag: 'BNS & BNSS Code',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Hero Card with SOS Panic Strip */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/90 text-blue-300 border border-blue-700/60 text-xs font-bold shadow-sm">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>National Citizen Safety & Police Assistance Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Rapid Police Aid & Transparent Citizen Services
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Instant 112 SOS beacon dispatch, jurisdictional station locator with direct SHO helplines, online e-FIR with AI drafting, live case investigation tracking, and missing person search across India.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenSOS}
                id="hero-sos-emergency-trigger-btn"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm tracking-wider flex items-center gap-2.5 shadow-xl shadow-red-950 transition-transform transform active:scale-95 animate-pulse-emergency"
              >
                <AlertTriangle className="w-4 h-4 fill-white text-red-600" />
                <span>EMERGENCY SOS 112</span>
              </button>

              <button
                onClick={onOpenAI}
                id="hero-ai-legal-assistant-btn"
                className="px-5 py-3 rounded-2xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-bold text-xs flex items-center gap-2 shadow-lg transition-colors"
              >
                <Bot className="w-4 h-4 text-purple-400" />
                <span>AI Legal Assistant ({language.toUpperCase()})</span>
              </button>
            </div>
          </div>

          {/* Quick SOS Keypad Widget */}
          <div className="bg-slate-950/90 border border-red-500/40 rounded-3xl p-5 shadow-2xl space-y-4 max-w-sm w-full shrink-0">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black uppercase text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                24x7 Emergency Helplines
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Toll-Free</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:112"
                className="p-2.5 bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 rounded-xl flex items-center justify-between text-white transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-red-200 block">112</span>
                  <span className="text-[10px] text-slate-400">National SOS</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              </a>

              <a
                href="tel:1091"
                className="p-2.5 bg-pink-950/60 hover:bg-pink-900/80 border border-pink-800/60 rounded-xl flex items-center justify-between text-white transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-pink-200 block">1091</span>
                  <span className="text-[10px] text-slate-400">Women Safety</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-pink-400" />
              </a>

              <a
                href="tel:1930"
                className="p-2.5 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/60 rounded-xl flex items-center justify-between text-white transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-blue-200 block">1930</span>
                  <span className="text-[10px] text-slate-400">Cyber Crime</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              </a>

              <a
                href="tel:1098"
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between text-white transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-slate-200 block">1098</span>
                  <span className="text-[10px] text-slate-400">Child Helpline</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            <button
              onClick={onOpenSOS}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>Launch Emergency Siren & Patrol Dispatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 6 Feature Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Citizen Police Services</h2>
            <p className="text-xs text-slate-400">Select a module to access direct public safety tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickFeatures.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              id={`feature-card-${item.id}`}
              className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-xl flex flex-col justify-between group hover:scale-[1.02] duration-200 ${item.accent}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shadow-md group-hover:border-blue-400/50">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                    {item.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                <span>Access Service</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Alert Crime & Public Safety Advisory Ticker */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Public Safety & Cyber Advisory Bulletin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">🚨 Beware of Fake Police Video Call Digital Arrests</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Police officers or CBI NEVER conduct arrests over Skype or WhatsApp video calls or demand money transfers for clearing customs or parcel fraud. Report immediately to 1930.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">⚖️ Zero FIR Guaranteed Right under BNSS 2023</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              You can file a Zero FIR at any police station in India irrespective of jurisdiction. The station must accept the complaint and transfer it to the concerned station.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
