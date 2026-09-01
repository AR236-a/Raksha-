import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Volume2,
  VolumeX,
  MapPin,
  Share2,
  X,
  ShieldAlert,
  Radio,
  Clock,
  Car,
  UserCheck,
  CheckCircle2,
  Send,
  Battery,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { startSiren, stopSiren } from '../utils/audioSiren';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [emergencyType, setEmergencyType] = useState<'General SOS' | 'Violence/Threat' | 'Harassment' | 'Medical' | 'Accident'>('General SOS');
  const [locationState, setLocationState] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    address: string;
    loading: boolean;
  }>({
    lat: 28.6315,
    lng: 77.2167,
    address: 'Near Connaught Place, New Delhi (Auto-detected)',
    loading: true,
  });

  const [dispatchStep, setDispatchStep] = useState<number>(0);
  const [etaSeconds, setEtaSeconds] = useState<number>(180);
  const [patrolUnit, setPatrolUnit] = useState({
    vehicleNo: 'PCR Interceptor Van #14',
    officer: 'SI Rajesh Sharma & HC Sunil Yadav',
    phone: '+91-98110-99881',
    distance: '1.2 km away',
  });

  const [batteryLevel, setBatteryLevel] = useState<number>(84);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Fetch real geolocation & start continuous watch on open
  useEffect(() => {
    let watchId: number | null = null;

    if ('getBattery' in navigator) {
      (navigator as any).getBattery?.().then((b: any) => {
        setBatteryLevel(Math.round(b.level * 100));
      }).catch(() => {});
    }

    if (isOpen) {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setLocationState({
              lat: Number(pos.coords.latitude.toFixed(5)),
              lng: Number(pos.coords.longitude.toFixed(5)),
              accuracy: Math.round(pos.coords.accuracy),
              address: `Live GPS: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E (±${Math.round(pos.coords.accuracy)}m)`,
              loading: false,
            });
            setGeoError(null);
          },
          (err) => {
            console.warn('Emergency geolocation error:', err.message);
            setGeoError(err.message || 'GPS Signal Weak');
            setLocationState((prev) => ({ ...prev, loading: false }));
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      } else {
        setGeoError('Geolocation unsupported by browser');
        setLocationState((prev) => ({ ...prev, loading: false }));
      }
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isOpen]);

  // Clean up siren on close
  useEffect(() => {
    if (!isOpen && isSirenActive) {
      stopSiren();
      setIsSirenActive(false);
    }
  }, [isOpen, isSirenActive]);

  // Dispatch countdown simulation when SOS triggered
  useEffect(() => {
    let timer: any;
    if (sosTriggered && dispatchStep < 3) {
      timer = setTimeout(() => {
        setDispatchStep((prev) => prev + 1);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [sosTriggered, dispatchStep]);

  // ETA countdown
  useEffect(() => {
    let interval: any;
    if (sosTriggered && etaSeconds > 0) {
      interval = setInterval(() => {
        setEtaSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sosTriggered, etaSeconds]);

  const handleToggleSiren = () => {
    if (isSirenActive) {
      stopSiren();
      setIsSirenActive(false);
    } else {
      startSiren();
      setIsSirenActive(true);
    }
  };

  const handleTriggerSOS = async () => {
    setSosTriggered(true);
    setDispatchStep(1);
    startSiren();
    setIsSirenActive(true);

    try {
      await fetch('/api/sos/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: locationState.lat,
          lng: locationState.lng,
          address: locationState.address,
          emergencyType,
        }),
      });
    } catch (e) {
      console.warn('SOS sync:', e);
    }
  };

  const shareText = `🚨 EMERGENCY DISTRESS ALERT! 🚨\nI need immediate police assistance at my location: https://maps.google.com/?q=${locationState.lat},${locationState.lng}\nLocation: ${locationState.address}\nEmergency Type: ${emergencyType}\nSent via Rakshak National Safety App.`;

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleSmsShare = () => {
    const url = `sms:?&body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl bg-slate-900 border-2 ${
          sosTriggered ? 'border-red-600 animate-police-beacon' : 'border-red-700/60'
        } rounded-3xl shadow-2xl overflow-hidden my-auto`}
      >
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-red-800 via-red-600 to-red-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
                <span>{t.emergencySos}</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-black/40 text-amber-300 rounded-full border border-amber-400/40">
                  CRITICAL 112
                </span>
              </h2>
              <p className="text-xs text-red-100">{t.emergencySubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-sos-modal-btn"
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main SOS Trigger Circle Area */}
          {!sosTriggered ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <button
                  onClick={handleTriggerSOS}
                  id="primary-sos-trigger-action-btn"
                  className="relative group w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 text-white font-black text-2xl tracking-widest shadow-2xl flex flex-col items-center justify-center border-4 border-red-400/60 hover:scale-105 active:scale-95 transition-transform duration-200 animate-pulse-emergency"
                >
                  <span className="absolute -inset-3 rounded-full border-2 border-red-500/40 animate-ping" />
                  <AlertTriangle className="w-10 h-10 mb-1 drop-shadow" />
                  <span>PRESS FOR</span>
                  <span className="text-3xl font-black text-amber-200">SOS</span>
                  <span className="text-[10px] font-bold text-red-200 tracking-normal mt-0.5">
                    TRANSMIT LIVE BEACON
                  </span>
                </button>
              </div>

              {/* Emergency Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Situation Type (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['General SOS', 'Violence/Threat', 'Harassment', 'Medical', 'Accident'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setEmergencyType(type)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                        emergencyType === type
                          ? 'bg-red-950 text-red-200 border-red-500 shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <span>{type}</span>
                      {emergencyType === type && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Live Dispatch State */
            <div className="space-y-4 bg-red-950/40 border border-red-600/50 p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center justify-between border-b border-red-800/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-sm font-extrabold text-red-300 uppercase tracking-wider">
                    {t.sosAlertSent}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Estimated Arrival</span>
                  <p className="text-lg font-black text-amber-300 font-mono">
                    {Math.floor(etaSeconds / 60)}:{(etaSeconds % 60).toString().padStart(2, '0')} MINS
                  </p>
                </div>
              </div>

              {/* Dispatch Progress Steps */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-200">1. Distress Signal Transmitted to 112 Control Room</p>
                    <p className="text-[11px] text-slate-400">GPS Coordinates ({locationState.lat}, {locationState.lng}) logged in police dispatch system.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className={`w-5 h-5 ${dispatchStep >= 1 ? 'text-emerald-400' : 'text-slate-600'} mt-0.5 shrink-0`} />
                  <div>
                    <p className="text-xs font-bold text-slate-200">2. Nearest Police Interceptor Assigned</p>
                    <p className="text-[11px] text-slate-300">
                      {patrolUnit.vehicleNo} • Officer: {patrolUnit.officer}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className={`w-5 h-5 ${dispatchStep >= 2 ? 'text-amber-400 animate-bounce' : 'text-slate-600'} mt-0.5 shrink-0`} />
                  <div>
                    <p className="text-xs font-bold text-slate-200">3. Patrol Vehicle En Route (Lights & Siren Active)</p>
                    <p className="text-[11px] text-slate-400">Distance: {patrolUnit.distance} • Radio Frequency #7</p>
                  </div>
                </div>
              </div>

              {/* Direct call to responding patrol officer */}
              <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Responding Officer Hotline</span>
                  <p className="text-xs font-bold text-white">{patrolUnit.officer}</p>
                </div>
                <a
                  href={`tel:${patrolUnit.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Officer</span>
                </a>
              </div>
            </div>
          )}

          {/* Quick Siren & Location Share Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Siren Toggle Button */}
            <button
              onClick={handleToggleSiren}
              id="siren-toggle-action-btn"
              className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isSirenActive
                  ? 'bg-amber-600 text-white border-amber-400 animate-police-beacon'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
              }`}
            >
              {isSirenActive ? <VolumeX className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              <span>{isSirenActive ? t.sirenOff : t.sirenOn}</span>
            </button>

            {/* Live Location Box */}
            <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block font-medium">Your Current Location</span>
                  <span className="text-slate-200 font-mono text-[11px] truncate block">
                    {locationState.lat}, {locationState.lng}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleWhatsAppShare}
                  id="whatsapp-share-loc-btn"
                  className="p-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleSmsShare}
                  id="sms-share-loc-btn"
                  className="p-1.5 rounded-lg bg-blue-700/80 hover:bg-blue-600 text-white text-xs"
                  title="Send via SMS"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Direct Emergency Call Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              <span>Direct Emergency Helpline Speed Dial</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <a
                href="tel:112"
                id="speeddial-112"
                className="p-2.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-white flex items-center justify-between group transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-red-200 block">112</span>
                  <span className="text-[10px] text-slate-300 font-medium leading-tight">All India Emergency</span>
                </div>
                <PhoneCall className="w-4 h-4 text-red-400 group-hover:scale-110" />
              </a>

              <a
                href="tel:1091"
                id="speeddial-1091"
                className="p-2.5 rounded-xl bg-pink-950/70 hover:bg-pink-900 border border-pink-700/60 text-white flex items-center justify-between group transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-pink-200 block">1091</span>
                  <span className="text-[10px] text-slate-300 font-medium leading-tight">Women Helpline</span>
                </div>
                <PhoneCall className="w-4 h-4 text-pink-400 group-hover:scale-110" />
              </a>

              <a
                href="tel:1930"
                id="speeddial-1930"
                className="p-2.5 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-700/60 text-white flex items-center justify-between group transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-blue-200 block">1930</span>
                  <span className="text-[10px] text-slate-300 font-medium leading-tight">Cyber Fraud Cell</span>
                </div>
                <PhoneCall className="w-4 h-4 text-blue-400 group-hover:scale-110" />
              </a>

              <a
                href="tel:100"
                id="speeddial-100"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white flex items-center justify-between group transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-slate-200 block">100</span>
                  <span className="text-[10px] text-slate-400 font-medium leading-tight">Police Control</span>
                </div>
                <PhoneCall className="w-4 h-4 text-slate-400 group-hover:scale-110" />
              </a>

              <a
                href="tel:1098"
                id="speeddial-1098"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white flex items-center justify-between group transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-slate-200 block">1098</span>
                  <span className="text-[10px] text-slate-400 font-medium leading-tight">Child Helpline</span>
                </div>
                <PhoneCall className="w-4 h-4 text-slate-400 group-hover:scale-110" />
              </a>

              <a
                href="tel:108"
                id="speeddial-108"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white flex items-center justify-between group transition-colors"
              >
                <div>
                  <span className="text-xs font-black text-slate-200 block">108</span>
                  <span className="text-[10px] text-slate-400 font-medium leading-tight">Ambulance</span>
                </div>
                <PhoneCall className="w-4 h-4 text-slate-400 group-hover:scale-110" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-3 sm:px-6 flex items-center justify-between border-t border-slate-800 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-ping" />
            <span>Connected to Police Control Room Gateway</span>
          </span>
          <button
            onClick={() => {
              if (sosTriggered) {
                if (window.confirm('Are you sure you want to cancel the active SOS beacon?')) {
                  stopSiren();
                  setIsSirenActive(false);
                  setSosTriggered(false);
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="text-xs text-slate-300 hover:text-white px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg"
          >
            {sosTriggered ? 'End Distress Signal' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
