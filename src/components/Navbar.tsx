import React from 'react';
import {
  Shield,
  PhoneCall,
  Globe,
  Radio,
  FileText,
  Search,
  AlertTriangle,
  BookOpen,
  Bot,
  Lock,
  Menu,
  X,
  MapPin,
  Car,
  Crosshair,
} from 'lucide-react';
import { AppView, Language } from '../types';
import { languagesList, translations } from '../i18n/translations';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenSOS: () => void;
  onOpenAI: () => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  language,
  setLanguage,
  onOpenSOS,
  onOpenAI,
  isAdminLoggedIn,
  onAdminLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);
  const t = translations[language];

  const currentLangObj = languagesList.find((l) => l.code === language) || languagesList[0];

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
    { id: 'live_location', label: 'Live Device GPS', icon: <Crosshair className="w-4 h-4 text-cyan-400" /> },
    { id: 'stations', label: t.findStation, icon: <MapPin className="w-4 h-4" /> },
    { id: 'report', label: t.reportIncident, icon: <FileText className="w-4 h-4" /> },
    { id: 'track', label: t.trackComplaint, icon: <Search className="w-4 h-4" /> },
    { id: 'missing', label: t.missingSearch, icon: <Radio className="w-4 h-4" /> },
    { id: 'traffic', label: t.trafficReport, icon: <Car className="w-4 h-4" /> },
    { id: 'procedures', label: t.policeGuide, icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top emergency flash strip */}
      <div className="bg-gradient-to-r from-red-700 via-rose-600 to-red-700 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" />
            <span>{t.call112}</span>
            <span className="hidden md:inline text-red-200">| 1930 (Cyber Fraud) | 1091 (Women Safety)</span>
          </div>
          <button
            onClick={onOpenSOS}
            id="top-emergency-sos-btn"
            className="bg-white text-red-700 hover:bg-red-50 font-bold px-3 py-0.5 rounded-full text-xs transition-transform transform active:scale-95 shadow flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 fill-red-600 text-white" />
            <span>SOS 112</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 cursor-pointer group"
            id="nav-brand-logo"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/30 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  {t.appName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-blue-950 text-blue-300 border border-blue-700/50 rounded">
                  POLICE & CITIZEN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                National Public Safety & Assistance
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentView(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* AI Assistant Quick Pill */}
            <button
              onClick={onOpenAI}
              id="nav-ai-assistant-btn"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-900/80 to-purple-900/80 hover:from-indigo-800 hover:to-purple-800 border border-purple-500/40 text-purple-200 text-xs font-semibold shadow-sm transition-all"
            >
              <Bot className="w-4 h-4 text-purple-300 animate-pulse" />
              <span>AI Legal Assistant</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                id="language-selector-button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">{currentLangObj.nativeName}</span>
                <span className="sm:hidden">{currentLangObj.code.toUpperCase()}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 max-h-80 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                    {t.selectLanguage}
                  </div>
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        language === lang.code ? 'text-blue-400 bg-blue-950/40 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      <span className="text-[10px] text-slate-500">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Officer Portal / Admin Switcher */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentView('admin')}
                  id="nav-officer-dashboard-btn"
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Officer Desk</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  id="nav-officer-logout-btn"
                  className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                  title="Logout Officer"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('admin')}
                id="nav-admin-login-btn"
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                title="Police Officer Portal"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">{t.officerLogin}</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle-btn"
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
                currentView === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => {
              onOpenAI();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-purple-300 bg-purple-950/40 border border-purple-800/50"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>AI Legal & Citizen Assistant</span>
          </button>
        </div>
      )}
    </header>
  );
};
