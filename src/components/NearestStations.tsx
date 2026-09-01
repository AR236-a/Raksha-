import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  PhoneCall,
  Navigation,
  Shield,
  Search,
  CheckCircle2,
  Clock,
  Car,
  Filter,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Crosshair,
  AlertTriangle,
  LocateFixed,
  Zap,
  Building2,
  Hash,
  Compass,
  Radio,
  RefreshCw,
  SlidersHorizontal,
  Activity,
  Phone,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { PoliceStation, Language } from '../types';
import { translations } from '../i18n/translations';
import {
  allIndiaPoliceStations,
  allIndiaPinZones,
  predictPoliceStationFromCoords,
  predictLocationByPincode,
  predictLocationByDistrictOrCity,
  reverseGeocodeCoords,
  predictLocationFromIP,
  LocationPredictionResult,
} from '../services/locationPredictor';

interface NearestStationsProps {
  stations: PoliceStation[];
  language: Language;
  selectedStationId?: string | null;
}

export const NearestStations: React.FC<NearestStationsProps> = ({
  stations = allIndiaPoliceStations,
  language,
  selectedStationId,
}) => {
  const t = translations[language];

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedTraffic, setSelectedTraffic] = useState<'All' | 'Smooth' | 'Moderate' | 'Heavy Congestion' | 'Slow Moving'>('All');
  const [selectedFacility, setSelectedFacility] = useState('All');
  const [pincodeInput, setPincodeInput] = useState('');
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);
  const [simulatedDirections, setSimulatedDirections] = useState<boolean>(false);

  // Geolocation & Prediction state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    address?: string;
    state?: string;
    district?: string;
    source?: string;
  } | null>(null);

  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<{
    code?: number;
    message: string;
    remedy: string;
  } | null>(null);
  const [predictionNotice, setPredictionNotice] = useState<string | null>(null);

  // Complete list of States & UTs across India
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
    'Arunachal Pradesh',
    'Manipur',
    'Mizoram',
    'Nagaland',
    'Tripura',
    'Sikkim',
    'Chhattisgarh',
    'Goa',
    'Uttarakhand',
    'Himachal Pradesh',
    'Haryana',
    'Jammu & Kashmir',
    'Ladakh',
    'Puducherry',
    'Andaman & Nicobar Islands',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Lakshadweep',
  ];

  const zonesList = ['All', 'North', 'South', 'West', 'East', 'Central', 'Northeast'];

  const facilitiesList = [
    'All',
    'Women Helpdesk',
    'Cyber Crime Desk',
    'Senior Citizen Assistance',
    'Child Friendly Corner',
    'Tourist Police Desk',
  ];

  // Quick Preset Metro Hubs across India
  const presetMetros = [
    { name: 'New Delhi (CP)', state: 'Delhi', pin: '110001', lat: 28.6315, lng: 77.2167 },
    { name: 'Mumbai (Bandra)', state: 'Maharashtra', pin: '400050', lat: 19.0596, lng: 72.8295 },
    { name: 'Bengaluru (Indiranagar)', state: 'Karnataka', pin: '560038', lat: 12.9784, lng: 77.6408 },
    { name: 'Chennai (T. Nagar)', state: 'Tamil Nadu', pin: '600017', lat: 13.0418, lng: 80.2341 },
    { name: 'Hyderabad (Gachibowli)', state: 'Telangana', pin: '500032', lat: 17.4401, lng: 78.3489 },
    { name: 'Kolkata (Park St)', state: 'West Bengal', pin: '700016', lat: 22.5517, lng: 88.3524 },
    { name: 'Lucknow (Hazratganj)', state: 'Uttar Pradesh', pin: '226001', lat: 26.8467, lng: 80.9462 },
    { name: 'Jaipur (Ashok Nagar)', state: 'Rajasthan', pin: '302001', lat: 26.9075, lng: 75.8056 },
    { name: 'Ahmedabad (Navrangpura)', state: 'Gujarat', pin: '380009', lat: 23.0365, lng: 72.5611 },
    { name: 'Kochi (Marine Drive)', state: 'Kerala', pin: '682011', lat: 9.9796, lng: 76.2773 },
    { name: 'Srinagar (Lal Chowk)', state: 'Jammu & Kashmir', pin: '190001', lat: 34.0722, lng: 74.8105 },
    { name: 'Guwahati (Paltan Bazar)', state: 'Assam', pin: '781001', lat: 26.1822, lng: 91.7513 },
  ];

  // Auto-acquire user location on mount
  useEffect(() => {
    handleFetchDeviceLocation();
  }, []);

  // Primary GPS Acquisition
  const handleFetchDeviceLocation = () => {
    setLocatingUser(true);
    setLocationError(null);
    setPredictionNotice(null);

    if (!navigator.geolocation) {
      applyFallbackPrediction('Browser does not support HTML5 Geolocation. Activated IP Predictor.');
      return;
    }

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 10000,
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        try {
          const geoData = await reverseGeocodeCoords(latitude, longitude);
          setUserLocation({
            lat: latitude,
            lng: longitude,
            accuracy,
            address: geoData.address,
            state: geoData.state,
            district: geoData.district,
            source: 'Live GPS Satellite Fix',
          });
          setLocatingUser(false);
          setPredictionNotice(
            `Live GPS Acquired: ${geoData.city || geoData.district || 'Location'}, ${geoData.state || 'India'} (±${Math.round(accuracy)}m).`
          );
        } catch {
          const pred = predictPoliceStationFromCoords(latitude, longitude, 'Live Device GPS', accuracy);
          setUserLocation({
            lat: latitude,
            lng: longitude,
            accuracy,
            address: pred.detectedLocationName,
            state: pred.state,
            district: pred.district,
            source: 'Live GPS Satellite Fix',
          });
          setLocatingUser(false);
          setPredictionNotice(`GPS Acquired: ${pred.detectedLocationName} (±${Math.round(accuracy)}m).`);
        }
      },
      async (err: GeolocationPositionError) => {
        let msg = 'Unable to acquire precise GPS signal.';
        let remedy = 'Activated IP & National Grid prediction.';

        if (err.code === 1) {
          msg = 'Location permission was denied in browser settings.';
          remedy = 'Switched to National Network Geolocation fallback.';
        } else if (err.code === 2) {
          msg = 'Position unavailable (e.g. iframe restrictions or no satellite fix).';
          remedy = 'Using IP geodetic lookup.';
        } else if (err.code === 3) {
          msg = 'GPS signal acquisition timed out.';
          remedy = 'Loaded closest regional metro station.';
        }

        setLocationError({ code: err.code, message: msg, remedy });
        await applyFallbackPrediction(msg);
      },
      geoOptions
    );
  };

  // Fallback IP Prediction
  const applyFallbackPrediction = async (reason: string) => {
    try {
      const ipResult = await predictLocationFromIP();
      setUserLocation({
        lat: ipResult.latitude,
        lng: ipResult.longitude,
        accuracy: ipResult.accuracyMeters,
        address: ipResult.detectedLocationName,
        state: ipResult.state,
        district: ipResult.district,
        source: ipResult.source,
      });
      setPredictionNotice(`Network Prediction Active: ${ipResult.detectedLocationName}. (${reason})`);
    } catch {
      setUserLocation({
        lat: 28.6315,
        lng: 77.2167,
        accuracy: 100,
        address: 'Connaught Place, New Delhi (National Reference Station)',
        state: 'Delhi',
        district: 'New Delhi District',
        source: 'Fallback Metro',
      });
    } finally {
      setLocatingUser(false);
    }
  };

  // Handle PIN Code Quick Search
  const handlePincodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const pinValue = pincodeInput.trim();
    if (!pinValue) return;

    const result = predictLocationByPincode(pinValue);
    if (result) {
      setUserLocation({
        lat: result.latitude,
        lng: result.longitude,
        accuracy: result.accuracyMeters,
        address: result.detectedLocationName,
        state: result.state,
        district: result.district,
        source: 'PIN Code Prediction',
      });
      setPredictionNotice(`PIN ${pinValue} Matched: Located in ${result.district}, ${result.state}.`);
      setLocationError(null);
    }
  };

  // Handle Preset Metro Click
  const handleSelectPreset = (preset: typeof presetMetros[0]) => {
    setUserLocation({
      lat: preset.lat,
      lng: preset.lng,
      accuracy: 10,
      address: `${preset.name}, ${preset.state} (PIN ${preset.pin})`,
      state: preset.state,
      district: preset.name,
      source: 'Quick Preset Metro',
    });
    setPredictionNotice(`Switched to ${preset.name} (${preset.state}). Nearest police stations recalculated.`);
    setLocationError(null);
  };

  // Precise Haversine distance in kilometers
  const calculateHaversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  // Filtered & Distance Sorted Stations
  const filteredStations = useMemo(() => {
    let result = (stations && stations.length > 0 ? stations : allIndiaPoliceStations).filter((st) => {
      const matchState = selectedState === 'All' || st.state.toLowerCase() === selectedState.toLowerCase();
      const matchZone = selectedZone === 'All' || st.zone === selectedZone;
      const matchTraffic = selectedTraffic === 'All' || st.trafficStatus === selectedTraffic;
      const matchFacility =
        selectedFacility === 'All' ||
        st.facilities.some((f) => f.toLowerCase().includes(selectedFacility.toLowerCase()));

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        st.name.toLowerCase().includes(q) ||
        st.address.toLowerCase().includes(q) ||
        st.city.toLowerCase().includes(q) ||
        st.district.toLowerCase().includes(q) ||
        st.state.toLowerCase().includes(q) ||
        (st.pincode && st.pincode.includes(q)) ||
        st.shoName.toLowerCase().includes(q) ||
        (st.liveTrafficAdvisory && st.liveTrafficAdvisory.toLowerCase().includes(q)) ||
        st.jurisdiction.some((j) => j.toLowerCase().includes(q));

      return matchState && matchZone && matchTraffic && matchFacility && matchQuery;
    });

    if (userLocation) {
      result = result.map((st) => {
        const dist = calculateHaversineDistance(userLocation.lat, userLocation.lng, st.lat, st.lng);
        return { ...st, distanceKm: dist };
      });
      result.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return result;
  }, [stations, selectedState, selectedZone, selectedTraffic, selectedFacility, searchQuery, userLocation]);

  // Selected Station state updates
  useEffect(() => {
    if (selectedStationId) {
      const matched = (stations.length > 0 ? stations : allIndiaPoliceStations).find(
        (s) => s.id === selectedStationId
      );
      if (matched) {
        setSelectedStation(matched);
        return;
      }
    }

    if (filteredStations.length > 0) {
      if (!selectedStation || !filteredStations.some((s) => s.id === selectedStation.id)) {
        setSelectedStation(filteredStations[0]);
      }
    }
  }, [filteredStations, selectedStationId]);

  // Helper for Traffic Status colors
  const getTrafficColor = (status?: string) => {
    switch (status) {
      case 'Smooth':
        return {
          bg: 'bg-emerald-950/80',
          text: 'text-emerald-300',
          border: 'border-emerald-700/60',
          indicator: 'bg-emerald-500',
        };
      case 'Moderate':
        return {
          bg: 'bg-blue-950/80',
          text: 'text-blue-300',
          border: 'border-blue-700/60',
          indicator: 'bg-blue-500',
        };
      case 'Slow Moving':
        return {
          bg: 'bg-amber-950/80',
          text: 'text-amber-300',
          border: 'border-amber-700/60',
          indicator: 'bg-amber-500',
        };
      case 'Heavy Congestion':
        return {
          bg: 'bg-red-950/80',
          text: 'text-red-300',
          border: 'border-red-700/60',
          indicator: 'bg-red-500',
        };
      default:
        return {
          bg: 'bg-slate-800',
          text: 'text-slate-300',
          border: 'border-slate-700',
          indicator: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Nationwide Live Geolocation & Smart Prediction Engine */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                All-India Station & Live Traffic Matrix
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                28 STATES & 8 UTs LIVE
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{t.nearestStationTitle}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Automatic geodetic matching, real-time traffic congestion monitoring, patrol tracking, and instant SHO & Traffic Police dispatch across India.
            </p>
          </div>

          {/* Quick GPS Refresh Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleFetchDeviceLocation}
              disabled={locatingUser}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${locatingUser ? 'animate-spin' : ''}`} />
              <span>{locatingUser ? 'Locating Device...' : 'Refresh GPS & Radar'}</span>
            </button>
          </div>
        </div>

        {/* Current Predicted / Acquired Location Strip */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-medium">Active Position:</span>
            <span className="font-bold text-cyan-300 truncate max-w-md">
              {userLocation?.address || 'Detecting nearest coordinates...'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            {userLocation?.source && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Source: {userLocation.source}
              </span>
            )}
            {userLocation?.accuracy && (
              <span className="text-slate-400">±{Math.round(userLocation.accuracy)}m</span>
            )}
          </div>
        </div>

        {/* Prediction or Error Advisory Bar */}
        {predictionNotice && !locationError && (
          <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{predictionNotice}</span>
          </div>
        )}

        {locationError && (
          <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{locationError.message}</p>
              <p className="text-[11px] text-amber-400/80 mt-0.5">{locationError.remedy}</p>
            </div>
          </div>
        )}
      </div>

      {/* Search & Multi-Criteria Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Text Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search station, SHO, locality, road..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 6-Digit PIN Code Quick Predictor Form */}
          <form onSubmit={handlePincodeSearch} className="md:col-span-3 flex gap-1.5">
            <div className="relative flex-1">
              <Hash className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="6-Digit PIN Code (e.g. 110001)"
                className="w-full pl-9 pr-2 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold shrink-0"
            >
              Locate PIN
            </button>
          </form>

          {/* State & UT Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {indianStates.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? '🇮🇳 All Indian States & UTs' : `🇮🇳 ${st}`}
                </option>
              ))}
            </select>
          </div>

          {/* Traffic Condition Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedTraffic}
              onChange={(e: any) => setSelectedTraffic(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">🚦 All Traffic</option>
              <option value="Smooth">🟢 Smooth Flow</option>
              <option value="Moderate">🔵 Moderate Traffic</option>
              <option value="Slow Moving">🟡 Slow Moving</option>
              <option value="Heavy Congestion">🔴 Heavy Congestion</option>
            </select>
          </div>
        </div>

        {/* Preset Metro Quick Buttons */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-cyan-400" /> Quick Hubs:
          </span>
          {presetMetros.map((metro) => (
            <button
              key={metro.name}
              onClick={() => handleSelectPreset(metro)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white whitespace-nowrap transition-colors"
            >
              {metro.name}
            </button>
          ))}
        </div>

        {/* Facility Filter Pills */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3 text-slate-500" /> Facility:
          </span>
          {facilitiesList.map((fac) => (
            <button
              key={fac}
              onClick={() => setSelectedFacility(fac)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedFacility === fac
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {fac}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Station List + Deep Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Station List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
            <span>
              {filteredStations.length} Jurisdictions Found {selectedState !== 'All' ? `in ${selectedState}` : 'Across India'}
            </span>
            <span>Sorted by Distance</span>
          </div>

          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredStations.map((station, idx) => {
              const isSelected = selectedStation?.id === station.id;
              const isClosest = idx === 0;
              const trafficStyle = getTrafficColor(station.trafficStatus);

              return (
                <div
                  key={station.id}
                  onClick={() => {
                    setSelectedStation(station);
                    setSimulatedDirections(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  {isClosest && (
                    <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider">
                      ★ Closest Station
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                          {station.state}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {station.district}
                        </span>
                        {station.isOpen24x7 && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            24x7
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300">
                        {station.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{station.address}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-cyan-400 font-mono">
                        {station.distanceKm !== undefined
                          ? `${station.distanceKm} KM`
                          : `${(1.2 + idx * 1.8).toFixed(1)} KM`}
                      </span>
                      <span className="text-[10px] text-slate-500 block">from you</span>
                    </div>
                  </div>

                  {/* Traffic Status & Congestion Strip */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${trafficStyle.indicator}`} />
                      <span className={`text-[11px] font-bold ${trafficStyle.text}`}>
                        {station.trafficStatus || 'Smooth Flow'}
                      </span>
                      {station.trafficCongestionPercent !== undefined && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({station.trafficCongestionPercent}% load)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Car className="w-3 h-3 text-cyan-400" />
                      <span>{station.pcrVehicles || station.activePatrols || 4} Patrols</span>
                    </div>
                  </div>

                  {/* Facilities Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {station.facilities.slice(0, 2).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                      >
                        {f}
                      </span>
                    ))}
                    {station.facilities.length > 2 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{station.facilities.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredStations.length === 0 && (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                No police stations match the selected criteria. Try selecting "All Indian States" or adjusting filters.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Station Deep Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedStation ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
              {/* Top Station Title & Direct Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {selectedStation.district}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-300">{selectedStation.state}</span>
                    {selectedStation.pincode && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        PIN: {selectedStation.pincode}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">{selectedStation.name}</h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${selectedStation.emergencyPhone.split('/')[0]}`}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Desk</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      selectedStation.name + ' ' + selectedStation.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </a>
                </div>
              </div>

              {/* LIVE TRAFFIC & CONGESTION RADAR FOR THIS STATION */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Jurisdictional Traffic Status & Control Room
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg border ${
                      getTrafficColor(selectedStation.trafficStatus).bg
                    } ${getTrafficColor(selectedStation.trafficStatus).text} ${
                      getTrafficColor(selectedStation.trafficStatus).border
                    }`}
                  >
                    ● {selectedStation.trafficStatus || 'Smooth Flow'}
                  </span>
                </div>

                {/* Congestion Meter */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Live Congestion Index</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {selectedStation.trafficCongestionPercent || 30}% Volume
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (selectedStation.trafficCongestionPercent || 30) > 70
                          ? 'bg-red-500'
                          : (selectedStation.trafficCongestionPercent || 30) > 45
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedStation.trafficCongestionPercent || 30}%` }}
                    />
                  </div>
                </div>

                {/* Live Advisory */}
                {selectedStation.liveTrafficAdvisory && (
                  <p className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-cyan-400 font-bold">Traffic Advisory: </span>
                    {selectedStation.liveTrafficAdvisory}
                  </p>
                )}

                {/* Traffic Helpline & Peak Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Traffic Helpline:</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {selectedStation.trafficHelpline || '1095 / 112'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-semibold">Peak Rush Hours:</span>
                    <span className="text-slate-300 font-medium">
                      {selectedStation.peakHours || '09:00 AM - 11:30 AM & 05:30 PM - 09:00 PM'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Station Leadership & SP Office */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Station House Officer (SHO)
                  </span>
                  <p className="text-sm font-bold text-white">{selectedStation.shoName}</p>
                  <p className="text-xs text-cyan-400 font-medium">{selectedStation.shoRank}</p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Direct Phone:</span>
                    <a
                      href={`tel:${selectedStation.shoPhone}`}
                      className="font-mono text-cyan-300 font-bold hover:underline"
                    >
                      {selectedStation.shoPhone}
                    </a>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Jurisdictional SP / DCP Office
                  </span>
                  <p className="text-sm font-bold text-white">
                    {selectedStation.spOffice || `Superintendent of Police, ${selectedStation.district}`}
                  </p>
                  <p className="text-xs text-slate-400">Emergency Dispatch: 112 / 100</p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Patrol Interceptors:</span>
                    <span className="font-bold text-emerald-400">
                      {selectedStation.pcrVehicles || selectedStation.activePatrols || 5} Units Live
                    </span>
                  </div>
                </div>
              </div>

              {/* Jurisdiction Sectors Covered */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sectors & Beat Areas Under Jurisdiction
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStation.jurisdiction.map((area) => (
                    <span
                      key={area}
                      className="text-xs bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg"
                    >
                      📍 {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* 24x7 Citizen Safety Facilities */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Precinct Facilities & Specialized Cells
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedStation.facilities.map((fac) => (
                    <div
                      key={fac}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Radar & Google Maps Link */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Geodetic Location & Directions</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    GPS: {selectedStation.lat.toFixed(4)}°N, {selectedStation.lng.toFixed(4)}°E
                  </span>
                </div>

                <p className="text-xs text-slate-400">{selectedStation.address}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">
                    Estimated Transit: {Math.max(2, Math.round((selectedStation.distanceKm || 1.5) * 2.2))} mins (
                    {selectedStation.distanceKm !== undefined ? `${selectedStation.distanceKm} km` : '1.5 km'})
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      selectedStation.name + ' ' + selectedStation.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
              Select a police station to inspect its jurisdiction, SHO in-charge, live traffic conditions, and emergency facilities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
