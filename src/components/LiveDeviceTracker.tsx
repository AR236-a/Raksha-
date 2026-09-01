import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  MapPin,
  Compass,
  Battery,
  BatteryCharging,
  Wifi,
  Shield,
  AlertTriangle,
  Radio,
  Share2,
  Copy,
  Check,
  RefreshCw,
  PlusCircle,
  Clock,
  Car,
  User,
  Users,
  Smartphone,
  Eye,
  Crosshair,
  Sliders,
  CheckCircle2,
  PhoneCall,
  Activity,
  Maximize2,
  LocateFixed,
  Send,
  Zap,
} from 'lucide-react';
import { Language, TrackedDevice, PoliceStation } from '../types';
import { translations } from '../i18n/translations';

interface LiveDeviceTrackerProps {
  language: Language;
  stations: PoliceStation[];
  onOpenSOS: () => void;
  onNavigateToStation: (stationId: string) => void;
}

export const LiveDeviceTracker: React.FC<LiveDeviceTrackerProps> = ({
  language,
  stations,
  onOpenSOS,
  onNavigateToStation,
}) => {
  const t = translations[language];

  // Geolocation State
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
    altitude: number | null;
    timestamp: number;
  }>({
    lat: 28.6315,
    lng: 77.2167,
    accuracy: 8,
    speed: 0,
    heading: 45,
    altitude: 216,
    timestamp: Date.now(),
  });

  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [geoError, setGeoError] = useState<{ code: number; message: string; type: string } | null>(null);
  const [usingSimulatedGps, setUsingSimulatedGps] = useState<boolean>(false);
  const [simulationType, setSimulationType] = useState<'None' | 'Movement' | 'Error_Denied' | 'Error_Unavailable' | 'Error_Timeout' | 'Low_Accuracy'>('None');

  // Battery Telemetry
  const [battery, setBattery] = useState<{ level: number; charging: boolean }>({
    level: 84,
    charging: false,
  });

  // Safe Journey / Night Walk Live Beacon
  const [isSafeJourneyActive, setIsSafeJourneyActive] = useState<boolean>(false);
  const [journeyDestination, setJourneyDestination] = useState<string>('Home (Vasant Kunj)');
  const [journeyTimerMinutes, setJourneyTimerMinutes] = useState<number>(30);
  const [journeyElapsedSeconds, setJourneyElapsedSeconds] = useState<number>(0);
  const [breadcrumbs, setBreadcrumbs] = useState<{ lat: number; lng: number; time: string }[]>([
    { lat: 28.6315, lng: 77.2167, time: '10:00:00' },
  ]);

  // Selected Tab in Tracker
  const [activeTab, setActiveTab] = useState<'CurrentDevice' | 'FleetDevices' | 'JourneyMode' | 'Diagnostics'>('CurrentDevice');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Connected Family & Fleet Devices
  const [trackedDevices, setTrackedDevices] = useState<TrackedDevice[]>([
    {
      id: 'DEV-SELF-01',
      name: 'Current Citizen Phone (This Device)',
      type: 'Citizen Device',
      lat: 28.6315,
      lng: 77.2167,
      accuracy: 8,
      speed: 0,
      heading: 45,
      altitude: 216,
      batteryLevel: 84,
      isCharging: false,
      status: 'Active Beacon',
      lastUpdated: 'Just now (Live GPS)',
      emergencyContact: '+91-98765-43210',
      address: 'Near Connaught Place Outer Circle, New Delhi',
    },
    {
      id: 'DEV-FAM-02',
      name: "Priya's Mobile (Daughter)",
      type: 'Family Member',
      lat: 28.6385,
      lng: 77.221,
      accuracy: 12,
      speed: 18.5,
      heading: 120,
      batteryLevel: 62,
      isCharging: false,
      status: 'In Transit',
      lastUpdated: '12s ago',
      emergencyContact: '+91-98111-22334',
      address: 'Near Barakhamba Road Metro, New Delhi',
    },
    {
      id: 'DEV-VEH-03',
      name: 'Family Car GPS (DL-3C-9021)',
      type: 'Vehicle GPS',
      lat: 28.629,
      lng: 77.209,
      accuracy: 4,
      speed: 0,
      heading: 0,
      batteryLevel: 98,
      isCharging: true,
      status: 'Safe Zone',
      lastUpdated: '45s ago',
      emergencyContact: '+91-98765-43210',
      address: 'Home Garage Safe Zone, New Delhi',
    },
    {
      id: 'DEV-PATROL-14',
      name: 'Police Interceptor Unit #14 (Nearby PCR)',
      type: 'Police Patrol Unit',
      lat: 28.634,
      lng: 77.219,
      accuracy: 5,
      speed: 34.2,
      heading: 260,
      batteryLevel: 100,
      isCharging: true,
      status: 'Active Beacon',
      lastUpdated: '3s ago',
      emergencyContact: '112 / +91-98110-99881',
      address: 'Janpath Junction Patrol Beat',
    },
  ]);

  const [newDeviceModalOpen, setNewDeviceModalOpen] = useState<boolean>(false);
  const [newDeviceForm, setNewDeviceForm] = useState<{
    name: string;
    type: TrackedDevice['type'];
    emergencyContact: string;
  }>({
    name: '',
    type: 'Family Member',
    emergencyContact: '',
  });

  const watchIdRef = useRef<number | null>(null);

  // 1. Initial & Continuous Real-time Geolocation Watch
  useEffect(() => {
    // Battery API Check
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        setBattery({
          level: Math.round(batt.level * 100),
          charging: batt.charging,
        });

        batt.addEventListener('levelchange', () => {
          setBattery((prev) => ({ ...prev, level: Math.round(batt.level * 100) }));
        });
        batt.addEventListener('chargingchange', () => {
          setBattery((prev) => ({ ...prev, charging: batt.charging }));
        });
      }).catch(() => {});
    }

    startRealGpsWatch();

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const startRealGpsWatch = () => {
    setIsLocating(true);
    setGeoError(null);
    setUsingSimulatedGps(false);

    if (!navigator.geolocation) {
      setGeoError({
        code: 0,
        type: 'UNSUPPORTED',
        message: 'Geolocation is not supported by your current browser environment.',
      });
      setIsLocating(false);
      return;
    }

    try {
      // First quick lock
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newC = {
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy),
            speed: pos.coords.speed ? Number((pos.coords.speed * 3.6).toFixed(1)) : 0,
            heading: pos.coords.heading ? Math.round(pos.coords.heading) : 45,
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : 216,
            timestamp: pos.timestamp,
          };
          setCoords(newC);
          setIsLocating(false);

          setBreadcrumbs((prev) => [
            ...prev.slice(-15),
            {
              lat: newC.lat,
              lng: newC.lng,
              time: new Date().toLocaleTimeString(),
            },
          ]);

          // Update current device in list
          setTrackedDevices((prev) =>
            prev.map((d) =>
              d.id === 'DEV-SELF-01'
                ? {
                    ...d,
                    lat: newC.lat,
                    lng: newC.lng,
                    accuracy: newC.accuracy,
                    speed: newC.speed || 0,
                    altitude: newC.altitude,
                    heading: newC.heading,
                    lastUpdated: 'Live GPS (' + new Date().toLocaleTimeString() + ')',
                  }
                : d
            )
          );
        },
        (err) => {
          console.warn('Geolocation initial lock error:', err);
          handleGpsError(err);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );

      // Continuous Watch Position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newC = {
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy),
            speed: pos.coords.speed ? Number((pos.coords.speed * 3.6).toFixed(1)) : 0,
            heading: pos.coords.heading ? Math.round(pos.coords.heading) : 45,
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : 216,
            timestamp: pos.timestamp,
          };
          setCoords(newC);
          setGeoError(null);
          setIsLocating(false);

          setBreadcrumbs((prev) => [
            ...prev.slice(-20),
            {
              lat: newC.lat,
              lng: newC.lng,
              time: new Date().toLocaleTimeString(),
            },
          ]);
        },
        (err) => {
          console.warn('Geolocation continuous watch error:', err);
          handleGpsError(err);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 2000 }
      );
    } catch (e: any) {
      setGeoError({
        code: 99,
        type: 'EXCEPTION',
        message: e?.message || 'Error initializing browser geolocation.',
      });
      setIsLocating(false);
    }
  };

  const handleGpsError = (err: GeolocationPositionError) => {
    setIsLocating(false);
    let type = 'UNKNOWN';
    let msg = err.message || 'Unable to retrieve your location.';

    if (err.code === 1) {
      type = 'PERMISSION_DENIED';
      msg = 'Location permission was denied. Please allow location access in your browser or select a fallback city.';
    } else if (err.code === 2) {
      type = 'POSITION_UNAVAILABLE';
      msg = 'GPS signal is currently weak or unavailable in this environment.';
    } else if (err.code === 3) {
      type = 'TIMEOUT';
      msg = 'GPS acquisition request timed out. Retrying or switching to network location.';
    }

    setGeoError({
      code: err.code,
      type,
      message: msg,
    });
  };

  // 2. Simulated GPS movement interval when Movement simulation is active
  useEffect(() => {
    let interval: any;
    if (simulationType === 'Movement') {
      interval = setInterval(() => {
        setCoords((prev) => {
          const deltaLat = (Math.random() - 0.48) * 0.0008;
          const deltaLng = (Math.random() - 0.48) * 0.0008;
          const newLat = Number((prev.lat + deltaLat).toFixed(6));
          const newLng = Number((prev.lng + deltaLng).toFixed(6));
          const newSpeed = Number((15 + Math.random() * 20).toFixed(1));

          setBreadcrumbs((b) => [
            ...b.slice(-25),
            { lat: newLat, lng: newLng, time: new Date().toLocaleTimeString() },
          ]);

          return {
            ...prev,
            lat: newLat,
            lng: newLng,
            speed: newSpeed,
            accuracy: 6,
            heading: (prev.heading || 0 + 10) % 360,
            timestamp: Date.now(),
          };
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [simulationType]);

  // 3. Safe journey timer interval
  useEffect(() => {
    let interval: any;
    if (isSafeJourneyActive) {
      interval = setInterval(() => {
        setJourneyElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSafeJourneyActive]);

  // Switch to Preset Indian Cities
  const setCityFallback = (cityLat: number, cityLng: number, cityName: string) => {
    setCoords({
      lat: cityLat,
      lng: cityLng,
      accuracy: 10,
      speed: 0,
      heading: 0,
      altitude: 210,
      timestamp: Date.now(),
    });
    setUsingSimulatedGps(true);
    setGeoError(null);
    setIsLocating(false);

    setTrackedDevices((prev) =>
      prev.map((d) =>
        d.id === 'DEV-SELF-01'
          ? {
              ...d,
              lat: cityLat,
              lng: cityLng,
              address: `Manual Preset: ${cityName}`,
              lastUpdated: 'Preset Lock',
            }
          : d
      )
    );
  };

  // Trigger simulated errors for testing "Error it"
  const handleApplySimulation = (type: typeof simulationType) => {
    setSimulationType(type);

    if (type === 'None') {
      startRealGpsWatch();
    } else if (type === 'Error_Denied') {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setGeoError({
        code: 1,
        type: 'PERMISSION_DENIED',
        message: 'SIMULATED ERROR: Geolocation permission was blocked by the user or security policy.',
      });
      setIsLocating(false);
    } else if (type === 'Error_Unavailable') {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setGeoError({
        code: 2,
        type: 'POSITION_UNAVAILABLE',
        message: 'SIMULATED ERROR: GPS satellite and cellular triangulation signal unavailable.',
      });
      setIsLocating(false);
    } else if (type === 'Error_Timeout') {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setGeoError({
        code: 3,
        type: 'TIMEOUT',
        message: 'SIMULATED ERROR: Geolocation response exceeded 10,000ms timeout threshold.',
      });
      setIsLocating(false);
    } else if (type === 'Low_Accuracy') {
      setGeoError(null);
      setCoords((prev) => ({
        ...prev,
        accuracy: 185, // High inaccuracy
      }));
    } else if (type === 'Movement') {
      setGeoError(null);
    }
  };

  // Share Live Location
  const shareLiveUrl = `https://rakshak.police.gov.in/live-beacon?id=RAKSHAK-BEACON-${coords.lat.toFixed(4)}-${coords.lng.toFixed(4)}`;
  const liveShareMessage = `🛡️ RAKSHAK LIVE SAFETY BEACON 🛡️\nTracking my live device location in real-time:\n📍 Location: https://maps.google.com/?q=${coords.lat},${coords.lng}\n📊 GPS Accuracy: ±${coords.accuracy}m | Speed: ${coords.speed || 0} km/h\n🔋 Battery: ${battery.level}%\n🚨 In Emergency, call 112 directly.`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(liveShareMessage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleWhatsAppLiveShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(liveShareMessage)}`;
    window.open(url, '_blank');
  };

  const handleSmsLiveShare = () => {
    const url = `sms:?&body=${encodeURIComponent(liveShareMessage)}`;
    window.location.href = url;
  };

  // Add new device
  const handleAddNewDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceForm.name) return;

    const offsetLat = coords.lat + (Math.random() - 0.5) * 0.02;
    const offsetLng = coords.lng + (Math.random() - 0.5) * 0.02;

    const newDev: TrackedDevice = {
      id: `DEV-NEW-${Date.now().toString().slice(-4)}`,
      name: newDeviceForm.name,
      type: newDeviceForm.type,
      lat: Number(offsetLat.toFixed(5)),
      lng: Number(offsetLng.toFixed(5)),
      accuracy: 10,
      speed: 0,
      batteryLevel: 90,
      isCharging: false,
      status: 'Active Beacon',
      lastUpdated: 'Just added',
      emergencyContact: newDeviceForm.emergencyContact || '+91-98765-00000',
      address: 'Linked Tracking Safety Beacon',
    };

    setTrackedDevices((prev) => [...prev, newDev]);
    setNewDeviceModalOpen(false);
    setNewDeviceForm({ name: '', type: 'Family Member', emergencyContact: '' });
  };

  // Compute closest police station to live coordinates
  const nearestStationToLiveGps = stations.reduce((closest, current) => {
    const dLat = (current.lat - coords.lat) * 111;
    const dLng = (current.lng - coords.lng) * 111 * Math.cos((coords.lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);

    if (!closest || dist < closest.distance) {
      return { station: current, distance: dist };
    }
    return closest;
  }, null as { station: PoliceStation; distance: number } | null);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <Crosshair className="w-4 h-4 animate-spin-slow" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Satellite GPS & Device Telemetry
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                LIVE RADAR
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Live Device Location & Safety Radar
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              High-accuracy real-time GPS telemetry, safe journey beacons, linked family device tracking, and instant police precinct radar.
            </p>
          </div>

          {/* Real-time Status Badge & 112 SOS shortcut */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenSOS}
              id="live-tracker-sos-panic-btn"
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-950 flex items-center gap-2 animate-pulse-emergency"
            >
              <AlertTriangle className="w-4 h-4 fill-white text-red-600" />
              <span>EMERGENCY SOS 112</span>
            </button>

            <button
              onClick={startRealGpsWatch}
              id="refresh-live-gps-btn"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white"
              title="Refresh GPS Lock"
            >
              <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-800/80 mt-6 text-xs">
          <button
            onClick={() => setActiveTab('CurrentDevice')}
            id="tab-current-device-telemetry"
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'CurrentDevice'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-300" />
            <span>My Device Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('JourneyMode')}
            id="tab-safe-journey-beacon"
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'JourneyMode'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Safe Journey & Night Beacon</span>
            {isSafeJourneyActive && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
          </button>

          <button
            onClick={() => setActiveTab('FleetDevices')}
            id="tab-family-fleet-radar"
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'FleetDevices'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-300" />
            <span>Family & Vehicle Beacons ({trackedDevices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('Diagnostics')}
            id="tab-gps-diagnostics-error"
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'Diagnostics'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-300" />
            <span>GPS Error & Simulation Mode</span>
            {geoError && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
          </button>
        </div>
      </div>

      {/* Geolocation Error Alert Banner (When Error Occurs) */}
      {geoError && (
        <div className="bg-red-950/70 border-2 border-red-600 rounded-3xl p-5 shadow-2xl space-y-3 animate-shake">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-900/80 border border-red-500/50 flex items-center justify-center text-red-200 shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase text-red-300 tracking-wider">
                    GPS Geolocation Error (Code {geoError.code}: {geoError.type})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/40 text-red-300 font-mono text-[10px]">
                    Automatic Fallback Active
                  </span>
                </div>
                <p className="text-slate-200 font-medium">{geoError.message}</p>
                <p className="text-[11px] text-slate-400">
                  Tip: Enable device location in your browser bar, or click any city preset below for instant precision lock.
                </p>
              </div>
            </div>

            <button
              onClick={startRealGpsWatch}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shrink-0"
            >
              Retry GPS
            </button>
          </div>

          {/* Instant 1-Click Fallback Metro Presets */}
          <div className="pt-3 border-t border-red-800/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-300">All-India Quick Presets:</span>
            <button
              onClick={() => setCityFallback(28.6315, 77.2167, 'New Delhi (CP)')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              🇮🇳 New Delhi (28.63°N)
            </button>
            <button
              onClick={() => setCityFallback(19.0596, 72.8295, 'Mumbai (Bandra)')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              🇮🇳 Mumbai (19.06°N)
            </button>
            <button
              onClick={() => setCityFallback(12.9784, 77.6408, 'Bengaluru (Indiranagar)')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              🇮🇳 Bengaluru (12.98°N)
            </button>
            <button
              onClick={() => setCityFallback(17.4401, 78.3489, 'Hyderabad (Gachibowli)')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              🇮🇳 Hyderabad (17.44°N)
            </button>
            <button
              onClick={() => setCityFallback(13.0418, 80.2341, 'Chennai (T. Nagar)')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              🇮🇳 Chennai (13.04°N)
            </button>
            <button
              onClick={() => setCityFallback(22.5517, 88.3524, 'Kolkata (Park St)')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              🇮🇳 Kolkata (22.55°N)
            </button>
            <button
              onClick={() => setCityFallback(26.8467, 80.9462, 'Lucknow (Hazratganj)')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              🇮🇳 Lucknow (26.85°N)
            </button>
            <button
              onClick={() => setCityFallback(26.9075, 75.8056, 'Jaipur (Ashok Nagar)')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              🇮🇳 Jaipur (26.91°N)
            </button>
            <button
              onClick={() => setCityFallback(23.0365, 72.5611, 'Ahmedabad (Navrangpura)')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              🇮🇳 Ahmedabad (23.04°N)
            </button>
            <button
              onClick={() => setCityFallback(34.0722, 74.8105, 'Srinagar (Lal Chowk)')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              🇮🇳 Srinagar (34.07°N)
            </button>
            <button
              onClick={() => setCityFallback(26.1822, 91.7513, 'Guwahati (Paltan Bazar)')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px]"
            >
              🇮🇳 Guwahati (26.18°N)
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout: Live Radar Visualizer (Left 7 cols) + Metric Panels (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Radar Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            {/* Visual Radar Stage */}
            <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-6 min-h-[380px] flex flex-col justify-between overflow-hidden">
              {/* Radar Rings Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Distance Rings */}
                <div className="w-[340px] h-[340px] border border-cyan-500/20 rounded-full flex items-center justify-center">
                  <span className="absolute top-2 text-[9px] text-cyan-600 font-mono">5.0 KM</span>
                  <div className="w-[260px] h-[260px] border border-cyan-500/30 rounded-full flex items-center justify-center">
                    <span className="absolute top-12 text-[9px] text-cyan-600 font-mono">2.5 KM</span>
                    <div className="w-[170px] h-[170px] border border-cyan-500/40 rounded-full flex items-center justify-center">
                      <span className="absolute top-24 text-[9px] text-cyan-500 font-mono">1.0 KM</span>
                      <div className="w-[80px] h-[80px] border border-cyan-500/50 rounded-full flex items-center justify-center bg-cyan-950/20">
                        <span className="text-[9px] text-cyan-400 font-mono">500M</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Radar Grid Crosshairs */}
                <div className="absolute w-full h-[1px] bg-cyan-500/20" />
                <div className="absolute h-full w-[1px] bg-cyan-500/20" />

                {/* Sweeping Radar Beam */}
                <div className="absolute w-48 h-48 rounded-full border-r-2 border-cyan-400 opacity-40 animate-spin-slow origin-center pointer-events-none" />
              </div>

              {/* Top Radar Bar */}
              <div className="relative z-10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white">Live GNSS Active</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      coords.accuracy <= 15
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : coords.accuracy <= 40
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-red-950 text-red-300 border-red-700'
                    }`}
                  >
                    {coords.accuracy <= 15
                      ? `🟢 High Precision (±${coords.accuracy}m)`
                      : coords.accuracy <= 40
                      ? `🟡 Good Lock (±${coords.accuracy}m)`
                      : `🟠 Approximate (±${coords.accuracy}m)`}
                  </span>
                </div>
              </div>

              {/* Center Device Pin & Radar Blips */}
              <div className="relative z-10 my-12 flex flex-col items-center justify-center text-center space-y-2">
                {/* User Center Pin */}
                <div className="relative">
                  <span className="absolute -inset-3 rounded-full bg-cyan-500/30 animate-ping" />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border-2 border-white flex items-center justify-center text-white shadow-2xl shadow-cyan-500/60">
                    <Navigation
                      className="w-6 h-6 transform"
                      style={{ transform: `rotate(${coords.heading || 0}deg)` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-900/95 border border-cyan-500/50 px-3 py-1.5 rounded-xl shadow-xl">
                  <p className="text-xs font-black text-white flex items-center justify-center gap-1.5">
                    <span>YOU ARE HERE</span>
                    <span className="text-[10px] text-cyan-300 font-mono">
                      (Alt: {coords.altitude || 216}m)
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-300 font-medium">
                    Speed: {coords.speed || 0} km/h • Heading: {coords.heading || 45}°
                  </p>
                </div>

                {/* Surrounding Tracked Device Markers (Simulated on Canvas) */}
                <div className="w-full flex items-center justify-between px-2 pt-4">
                  {/* Nearest Police Station Radar Tag */}
                  {nearestStationToLiveGps && (
                    <div
                      onClick={() => onNavigateToStation(nearestStationToLiveGps.station.id)}
                      className="cursor-pointer bg-blue-950/90 hover:bg-blue-900 border border-blue-500/60 px-2.5 py-1.5 rounded-xl text-left shadow-lg text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center gap-1 text-blue-300 font-bold">
                        <Shield className="w-3.5 h-3.5 text-amber-300" />
                        <span>{nearestStationToLiveGps.station.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-300">
                        {nearestStationToLiveGps.distance.toFixed(1)} km away • SHO: {nearestStationToLiveGps.station.shoName}
                      </p>
                    </div>
                  )}

                  {/* Active Police Patrol Interceptor Tag */}
                  <div className="bg-red-950/90 border border-red-500/60 px-2.5 py-1.5 rounded-xl text-left shadow-lg text-[11px] space-y-0.5">
                    <div className="flex items-center gap-1 text-red-300 font-bold">
                      <Car className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                      <span>PCR Patrol Van #14</span>
                    </div>
                    <p className="text-[10px] text-slate-300">1.2 km away • Speed: 34 km/h</p>
                  </div>
                </div>
              </div>

              {/* Bottom Radar Controls Bar */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery: {battery.level}% {battery.charging ? '(Charging)' : ''}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-blue-400" />
                    <span>Network: Online</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleWhatsAppLiveShare}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold flex items-center gap-1 text-[11px]"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>WhatsApp Live</span>
                  </button>
                  <button
                    onClick={handleCopyShareLink}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 text-[11px]"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Breadcrumb Route Coordinates Timeline */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Real-Time Breadcrumb Trail ({breadcrumbs.length} Pings Logged)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Auto-Updating</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 text-[10px] font-mono text-slate-400">
                {breadcrumbs.slice(-6).map((b, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl shrink-0 space-y-0.5"
                  >
                    <span className="text-cyan-400 block font-bold">{b.time}</span>
                    <span>{b.lat.toFixed(4)}, {b.lng.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tab View Panels (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* TAB 1: Current Device Telemetry */}
          {activeTab === 'CurrentDevice' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>Active Device Live Sensors</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    SATELLITE SYNC
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Latitude</span>
                    <p className="text-base font-black text-cyan-300 font-mono mt-0.5">
                      {coords.lat.toFixed(6)}°
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Longitude</span>
                    <p className="text-base font-black text-cyan-300 font-mono mt-0.5">
                      {coords.lng.toFixed(6)}°
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Ground Speed</span>
                    <p className="text-base font-black text-white font-mono mt-0.5">
                      {coords.speed || 0} <span className="text-xs text-slate-400 font-sans">km/h</span>
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Compass Heading</span>
                    <p className="text-base font-black text-amber-300 font-mono mt-0.5 flex items-center gap-1">
                      <Compass className="w-4 h-4 text-amber-400" />
                      {coords.heading || 45}°
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">GPS Precision Margin</span>
                    <p className="text-base font-black text-emerald-400 font-mono mt-0.5">
                      ±{coords.accuracy} <span className="text-xs text-slate-400 font-sans">meters</span>
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Altitude (MSL)</span>
                    <p className="text-base font-black text-slate-200 font-mono mt-0.5">
                      {coords.altitude || 216} <span className="text-xs text-slate-400 font-sans">m</span>
                    </p>
                  </div>
                </div>

                {/* Device Identification Box */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl space-y-1.5 text-slate-300 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 uppercase font-bold text-[10px]">National Safety Beacon ID</span>
                    <span className="font-mono text-cyan-300 font-bold">BEACON-IND-9942-GPS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 uppercase font-bold text-[10px]">Geocoded Landmark</span>
                    <span className="text-slate-300 truncate max-w-[200px]">Connaught Place, New Delhi</span>
                  </div>
                </div>

                {/* Quick Action Broadcast */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleWhatsAppLiveShare}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Broadcast Live GPS to WhatsApp Contacts</span>
                  </button>

                  <button
                    onClick={handleSmsLiveShare}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Transmit Coordinates via SMS</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Safe Journey & Night Walk Beacon */}
          {activeTab === 'JourneyMode' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Safe Journey / Night Walk Mode</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Auto-broadcasts your live track to family & alerts 112 if destination is not reached.
                    </p>
                  </div>
                </div>

                {!isSafeJourneyActive ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Destination Name / Address</label>
                      <input
                        type="text"
                        value={journeyDestination}
                        onChange={(e) => setJourneyDestination(e.target.value)}
                        placeholder="e.g. Home, Hostel, Metro Station..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">
                        Expected Journey Duration (Minutes)
                      </label>
                      <select
                        value={journeyTimerMinutes}
                        onChange={(e) => setJourneyTimerMinutes(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                      >
                        <option value={15}>15 Minutes (Short Walk / Auto)</option>
                        <option value={30}>30 Minutes (Standard Commute)</option>
                        <option value={45}>45 Minutes (Late Night Cab)</option>
                        <option value={60}>60 Minutes (Intercity Transit)</option>
                      </select>
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-xl text-[11px] text-emerald-200 space-y-1">
                      <span className="font-bold block">Safety Guarantee:</span>
                      <span>
                        While active, your GPS coordinates are recorded every 5 seconds. If you don't check in within {journeyTimerMinutes} minutes, an automated distress alert can be triggered to your emergency contacts.
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsSafeJourneyActive(true);
                        setJourneyElapsedSeconds(0);
                      }}
                      id="start-safe-journey-btn"
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-950 flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-white" />
                      <span>Start Safe Journey Beacon Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 bg-emerald-950/30 border border-emerald-500/50 p-4 rounded-2xl">
                    <div className="flex items-center justify-between border-b border-emerald-800/40 pb-2">
                      <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        JOURNEY BEACON ACTIVE
                      </span>
                      <span className="text-white font-mono font-bold">
                        {Math.floor(journeyElapsedSeconds / 60)}:{(journeyElapsedSeconds % 60).toString().padStart(2, '0')} ELAPSED
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-300">
                        <strong className="text-white">Destination:</strong> {journeyDestination}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Target Arrival in {Math.max(0, journeyTimerMinutes - Math.floor(journeyElapsedSeconds / 60))} minutes
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsSafeJourneyActive(false);
                          alert('Safe journey completed. Beacon ended safely.');
                        }}
                        className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
                      >
                        I Have Arrived Safely
                      </button>

                      <button
                        onClick={onOpenSOS}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Panic SOS</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Family & Fleet Devices */}
          {activeTab === 'FleetDevices' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Linked Family & Vehicle Devices</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Live coordinates of trusted registered safety beacons.</p>
                  </div>

                  <button
                    onClick={() => setNewDeviceModalOpen(true)}
                    id="add-family-device-btn"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Link Beacon</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {trackedDevices.map((dev) => (
                    <div
                      key={dev.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2 hover:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{dev.name}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                dev.status === 'Safe Zone'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : dev.status === 'In Transit'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              ● {dev.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{dev.address}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            {dev.speed ? `${dev.speed} km/h` : 'Stationary'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">{dev.lastUpdated}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-900">
                        <span>
                          🔋 Battery: <strong className="text-slate-300">{dev.batteryLevel}%</strong>
                        </span>
                        <a
                          href={`tel:${dev.emergencyContact?.split('/')[0] || ''}`}
                          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call: {dev.emergencyContact}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GPS Diagnostics & Error Simulation ("Error it") */}
          {activeTab === 'Diagnostics' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-purple-800/40 rounded-3xl p-5 shadow-xl space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>GPS Error Diagnostics & Simulation Mode</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Test and simulate location error recovery, signal loss, and moving vehicle telemetry.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-400 font-semibold block">Select Simulation / Error State</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleApplySimulation('None')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                        simulationType === 'None'
                          ? 'bg-purple-950 text-purple-200 border-purple-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span className="block text-white">🟢 Real Hardware GPS</span>
                      <span className="text-[10px] text-slate-500 font-normal">Real browser GPS watch</span>
                    </button>

                    <button
                      onClick={() => handleApplySimulation('Movement')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                        simulationType === 'Movement'
                          ? 'bg-purple-950 text-purple-200 border-purple-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span className="block text-white">🚗 Moving Vehicle (25 km/h)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Simulates active road travel</span>
                    </button>

                    <button
                      onClick={() => handleApplySimulation('Error_Denied')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                        simulationType === 'Error_Denied'
                          ? 'bg-red-950 text-red-200 border-red-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span className="block text-red-300">❌ Error: Permission Denied (Code 1)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Simulate user blocked GPS</span>
                    </button>

                    <button
                      onClick={() => handleApplySimulation('Error_Unavailable')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                        simulationType === 'Error_Unavailable'
                          ? 'bg-red-950 text-red-200 border-red-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span className="block text-red-300">📡 Error: Position Unavailable (Code 2)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Simulate lost satellite lock</span>
                    </button>

                    <button
                      onClick={() => handleApplySimulation('Error_Timeout')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                        simulationType === 'Error_Timeout'
                          ? 'bg-red-950 text-red-200 border-red-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span className="block text-amber-300">⏱️ Error: Timeout (Code 3)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Simulate connection timeout</span>
                    </button>

                    <button
                      onClick={() => handleApplySimulation('Low_Accuracy')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                        simulationType === 'Low_Accuracy'
                          ? 'bg-amber-950 text-amber-200 border-amber-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span className="block text-amber-300">⚠️ Low Precision (±185m)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Simulate cell tower fallback</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-slate-400 font-semibold block mb-1">
                    Manual GPS Coordinates Override
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.0001"
                      value={coords.lat}
                      onChange={(e) => setCoords((prev) => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                      placeholder="Lat (e.g. 28.6315)"
                      className="w-1/2 p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-mono"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={coords.lng}
                      onChange={(e) => setCoords((prev) => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                      placeholder="Lng (e.g. 77.2167)"
                      className="w-1/2 p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Link New Family / Fleet Device */}
      {newDeviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                <span>Link Safety Device / Family Member</span>
              </h3>
              <button
                onClick={() => setNewDeviceModalOpen(false)}
                className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddNewDevice} className="space-y-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Device / Person Name</label>
                <input
                  type="text"
                  value={newDeviceForm.name}
                  onChange={(e) => setNewDeviceForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Grandmother's GPS, Son's School Bag Tracker"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Device Type</label>
                <select
                  value={newDeviceForm.type}
                  onChange={(e: any) => setNewDeviceForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                >
                  <option value="Family Member">Family Member Mobile</option>
                  <option value="Child Watch">Child GPS Smartwatch</option>
                  <option value="Elderly Tracker">Elderly Medical SOS Pendant</option>
                  <option value="Vehicle GPS">Vehicle OBD Tracker / Bike GPS</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Emergency Contact Phone Number</label>
                <input
                  type="tel"
                  value={newDeviceForm.emergencyContact}
                  onChange={(e) => setNewDeviceForm((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="e.g. +91-98765-43210"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewDeviceModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Register Device Beacon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
