import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Scale,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  BookMarked,
} from 'lucide-react';
import { LegalGuideItem, Language } from '../types';
import { translations } from '../i18n/translations';

interface ProcedureGuideProps {
  guides: LegalGuideItem[];
  language: Language;
}

export const ProcedureGuide: React.FC<ProcedureGuideProps> = ({
  guides,
  language,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(guides[0]?.id || null);

  const categories = [
    'All',
    'FIR Procedures',
    'Citizen Rights',
    'Cyber Safety',
    'Women Safety',
    'Traffic Laws',
  ];

  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      const matchCat = selectedCategory === 'All' || g.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.keyRights.some((r) => r.toLowerCase().includes(q)) ||
        (g.sections && g.sections.some((s) => s.toLowerCase().includes(q)));

      return matchCat && matchQuery;
    });
  }, [guides, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Citizen Legal Rights & Police Protocols
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{t.policeGuideTitle}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Comprehensive legal manual covering Zero FIRs, Supreme Court arrest safeguards (D.K. Basu), women protection acts, and the new Bharatiya Nyaya Sanhita (BNS) provisions.
            </p>
          </div>

          {/* Quick Helpline Pill */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs shrink-0 space-y-1">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">Free Legal Aid Hotline</span>
            <span className="text-blue-400 font-mono font-black text-sm">15100 (NALSA Legal Aid)</span>
          </div>
        </div>

        {/* Search & Category Pills */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search legal guides (e.g. Zero FIR, Bail, Women arrest after 6 PM, 1930 Cyber)..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Decision Tree Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-950/70 to-slate-900 border border-blue-600/40 p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
            <Scale className="w-4 h-4" />
            <span>Station refuses to file FIR?</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Demand <strong>Zero FIR</strong> under Sec 173 BNSS. Station incharge CANNOT refuse. If refused, escalate to SP / DCP via registered post or digital portal.
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-950/70 to-slate-900 border border-pink-600/40 p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-pink-300 font-bold text-xs">
            <Shield className="w-4 h-4" />
            <span>Arrest of Women Citizens</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Sec 43 BNSS: No woman can be arrested after sunset and before sunrise without prior written order of Judicial Magistrate. Woman officer mandatory.
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-600/40 p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Victim of Cyber Financial Fraud?</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Dial <strong>1930</strong> immediately within the 2-hour Golden Hour. The nodal desk communicates with NPCI and bank gateways to freeze beneficiary accounts.
          </p>
        </div>
      </div>

      {/* Accordion / List of Legal Procedures */}
      <div className="space-y-4">
        {filteredGuides.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className={`border rounded-3xl overflow-hidden transition-all ${
                isExpanded
                  ? 'bg-slate-900 border-blue-500/80 shadow-2xl shadow-blue-950'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Bar */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-5 sm:p-6 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isExpanded
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 group-hover:text-white'
                    }`}
                  >
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                        {item.category}
                      </span>
                      {item.sections && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.sections.join(' • ')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-blue-300">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-800 text-slate-300 group-hover:text-white shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-5 sm:p-6 pt-0 border-t border-slate-800/80 space-y-5 animate-fadeIn">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    {item.summary}
                  </p>

                  {/* Step by Step Action Plan */}
                  <div>
                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Step-by-Step Citizen Protocol
                    </h4>
                    <div className="space-y-2.5">
                      {item.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-start gap-3 text-xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-950 text-blue-300 border border-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-slate-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Rights Highlight Box */}
                  <div className="bg-emerald-950/40 border border-emerald-600/40 p-4 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Key Rights Guaranteed Under Law
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-100">
                      {item.keyRights.map((right, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span>{right}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Relevant Legal Sections */}
                  {item.sections && item.sections.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>Legal Reference:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.sections.map((sec) => (
                          <span
                            key={sec}
                            className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700 font-mono text-[11px]"
                          >
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
