import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, TrendingUp, Database, Layers, Search, Sparkles,
  ArrowRight, Grid, AlertTriangle, Activity, ArrowUpDown,
  ChevronLeft, ChevronRight, FileSpreadsheet, Sigma, Zap,
  AreaChart, PieChart, Hash, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../utils/api'
import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory'

// @ts-ignore
const Plot = (createPlotlyComponent.default || createPlotlyComponent)(Plotly)

interface EDAProps {
  datasetId: string | null
}

// ── Skeleton Block ────────────────────────────────────────────
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-800/60 rounded-xl ${className}`} />
)

// ── Severity badge for outlier/skew ──────────────────────────
const RoleBadge = ({ role }: { role: string }) => {
  const color =
    role.includes('Continuous') ? 'bg-brand/10 text-brand border-brand/20' :
    role.includes('Discrete')   ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
    role.includes('Boolean') || role.includes('Binary') ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
    role.includes('ID')         ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
    role.includes('DateTime')   ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  return (
    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {role}
    </span>
  )
}

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="p-2 bg-slate-900/80 rounded-xl border border-white/5 shrink-0 mt-0.5">{icon}</div>
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
      {subtitle && <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{subtitle}</p>}
    </div>
  </div>
)

// ── Card wrapper ──────────────────────────────────────────────
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`glass-card rounded-[1.75rem] p-6 sm:p-8 ${className}`}>{children}</div>
)

const EDA: React.FC<EDAProps> = ({ datasetId }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [eda, setEda]         = useState<any>(null)
  const [filename, setFilename] = useState('')

  // Table state
  const [activeDistCol, setActiveDistCol] = useState(0)
  const [activeVCCol,   setActiveVCCol]   = useState(0)
  const [profileSearch, setProfileSearch] = useState('')
  const [profileSort,   setProfileSort]   = useState<string>('feature')
  const [profileAsc,    setProfileAsc]    = useState(true)
  const [profilePage,   setProfilePage]   = useState(1)
  const [statsSearch,   setStatsSearch]   = useState('')
  const [statsSort,     setStatsSort]     = useState<string>('feature')
  const [statsAsc,      setStatsAsc]      = useState(true)
  const [statsPage,     setStatsPage]     = useState(1)
  const PAGE_SIZE = 8

  useEffect(() => {
    if (!datasetId) { navigate('/'); return }
    setLoading(true)
    api.getEDA(datasetId)
      .then(res => {
        setEda(res.data.eda)
        setFilename(res.data.filename)
      })
      .catch(() => {
        toast.error('Failed to load dataset EDA')
        navigate('/')
      })
      .finally(() => setLoading(false))
  }, [datasetId, navigate])

  const filteredProfiles = useMemo(() => {
    if (!eda?.column_profiles) return []
    let list = [...eda.column_profiles]
    if (profileSearch.trim()) {
      const t = profileSearch.toLowerCase()
      list = list.filter(r => r.feature.toLowerCase().includes(t) || r.role.toLowerCase().includes(t) || r.dtype.toLowerCase().includes(t))
    }
    list.sort((a, b) => {
      const va = a[profileSort], vb = b[profileSort]
      if (typeof va === 'string') return profileAsc ? va.localeCompare(vb) : vb.localeCompare(va)
      return profileAsc ? (va ?? 0) - (vb ?? 0) : (vb ?? 0) - (va ?? 0)
    })
    return list
  }, [eda, profileSearch, profileSort, profileAsc])

  const profilePages = Math.ceil(filteredProfiles.length / PAGE_SIZE) || 1
  const pagedProfiles = useMemo(() => filteredProfiles.slice((profilePage - 1) * PAGE_SIZE, profilePage * PAGE_SIZE), [filteredProfiles, profilePage])

  const filteredStats = useMemo(() => {
    if (!eda?.descriptive_stats) return []
    let list = [...eda.descriptive_stats]
    if (statsSearch.trim()) {
      const t = statsSearch.toLowerCase()
      list = list.filter(r => r.feature.toLowerCase().includes(t))
    }
    list.sort((a, b) => {
      const va = a[statsSort], vb = b[statsSort]
      if (typeof va === 'string') return statsAsc ? va.localeCompare(vb) : vb.localeCompare(va)
      return statsAsc ? (va ?? 0) - (vb ?? 0) : (vb ?? 0) - (va ?? 0)
    })
    return list
  }, [eda, statsSearch, statsSort, statsAsc])

  const statsPages = Math.ceil(filteredStats.length / PAGE_SIZE) || 1
  const pagedStats = useMemo(() => filteredStats.slice((statsPage - 1) * PAGE_SIZE, statsPage * PAGE_SIZE), [filteredStats, statsPage])

  const handleProfileSort = (field: string) => {
    if (profileSort === field) setProfileAsc(!profileAsc)
    else { setProfileSort(field); setProfileAsc(true) }
    setProfilePage(1)
  }
  const handleStatsSort = (field: string) => {
    if (statsSort === field) setStatsAsc(!statsAsc)
    else { setStatsSort(field); setStatsAsc(true) }
    setStatsPage(1)
  }

  const plotLayout = (extra: any = {}) => ({
    autosize: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#94a3b8', size: 10, family: 'Inter' },
    margin: { t: 20, b: 60, l: 60, r: 20 },
    xaxis: { gridcolor: 'rgba(255,255,255,0.04)', zerolinecolor: 'rgba(255,255,255,0.05)' },
    yaxis: { gridcolor: 'rgba(255,255,255,0.04)', zerolinecolor: 'rgba(255,255,255,0.05)' },
    ...extra
  })

  // ── Loading Skeleton ────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="glass-card p-6 rounded-[1.75rem]">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-12 w-48 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!eda) return null

  const { overview, column_profiles, descriptive_stats, distributions, value_counts,
          correlation, outlier_summary, cardinality, skew_kurt, insights } = eda

  const fmtBytes = (b: number) => {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1024 / 1024).toFixed(2)} MB`
  }

  const overviewCards = [
    { label: 'Total Rows',        value: overview.total_rows.toLocaleString(),        icon: <Database size={16} className="text-brand" /> },
    { label: 'Total Features',    value: overview.total_cols,                          icon: <Layers size={16} className="text-cyan-400" /> },
    { label: 'Numeric',           value: overview.numeric_features,                    icon: <Sigma size={16} className="text-purple-400" /> },
    { label: 'Categorical',       value: overview.categorical_features,                icon: <Hash size={16} className="text-amber-400" /> },
    { label: 'DateTime',          value: overview.datetime_features,                   icon: <Activity size={16} className="text-emerald-400" /> },
    { label: 'Duplicate Rows',    value: `${overview.duplicate_rows.toLocaleString()} (${overview.duplicate_pct}%)`, icon: <AlertTriangle size={16} className="text-rose-400" /> },
    { label: 'Total Cells',       value: overview.total_cells.toLocaleString(),        icon: <Grid size={16} className="text-slate-400" /> },
    { label: 'Memory Usage',      value: fmtBytes(overview.memory_bytes),             icon: <Zap size={16} className="text-brand" /> },
  ]

  const activeDist = distributions?.[activeDistCol]
  const activeVC   = value_counts?.[activeVCCol]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-12">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-slate-900/40 border border-white/5 p-6 rounded-[1.75rem] backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
              <AreaChart size={22} />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Dataset Analytics
            </h1>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-wider">
              General EDA
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-400 text-xs sm:text-sm">
            <span>Comprehensive analysis for</span>
            <span className="px-3 py-1 rounded-md bg-slate-950 border border-slate-800 text-brand font-mono font-bold">
              {filename || 'dataset.csv'}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/results')}
          className="btn-premium flex items-center justify-center gap-2 group shadow-brand/20 text-sm w-full md:w-auto px-6 py-3"
        >
          <span>Run Imputation Engine</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* ── Analytics Tab Switcher ── */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 border border-white/5 rounded-2xl w-fit">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-bold text-xs uppercase tracking-wide transition-all"
        >
          <BarChart3 size={14} /> Missing Value Analysis
        </button>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-xs uppercase tracking-wide shadow-lg shadow-purple-500/30 transition-all"
        >
          <AreaChart size={14} /> Dataset Analytics
        </button>
      </div>

      {/* ── AI Insights ── */}
      {insights && insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 rounded-[1.75rem] border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-brand/5 to-transparent relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles size={120} className="text-purple-400" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Sparkles size={18} /></div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">AI Dataset Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((ins: string, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 p-3.5 bg-slate-950/40 rounded-xl border border-white/5"
              >
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0" />
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{ins}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Overview Cards ── */}
      <div>
        <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <Database size={14} className="text-purple-400" /> Dataset Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {overviewCards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4 rounded-2xl flex flex-col justify-between"
            >
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5 w-fit mb-3">{card.icon}</div>
              <div>
                <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">{card.label}</div>
                <div className="text-base sm:text-xl font-bold text-white tracking-tight">{card.value}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Distribution + Value Counts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

        {/* Numeric Distributions */}
        {distributions && distributions.length > 0 && (
          <Card>
            <SectionHeader
              icon={<AreaChart size={18} className="text-brand" />}
              title="Feature Distributions"
              subtitle="Histogram of numeric features"
            />
            {/* Column Picker */}
            <div className="flex flex-wrap gap-1.5 mb-4 max-h-20 overflow-y-auto custom-scrollbar">
              {distributions.map((d: any, i: number) => (
                <button key={i} onClick={() => setActiveDistCol(i)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    activeDistCol === i ? 'bg-brand text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {d.feature}
                </button>
              ))}
            </div>
            {activeDist && (
              <AnimatePresence mode="wait">
                <motion.div key={activeDistCol} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Plot
                    data={[{
                      x: activeDist.edges.slice(0, -1).map((e: number, i: number) => (e + activeDist.edges[i + 1]) / 2),
                      y: activeDist.counts,
                      type: 'bar',
                      marker: {
                        color: activeDist.counts.map((_: any, i: number) => `hsla(${195 + i * 4}, 80%, 55%, 0.8)`),
                        line: { color: 'rgba(56,189,248,0.3)', width: 1 },
                      },
                      hovertemplate: '<b>Value: %{x:.2f}</b><br>Count: %{y}<extra></extra>',
                    }]}
                    layout={plotLayout({ bargap: 0.05 })}
                    style={{ width: '100%', height: '240px' }}
                    useResizeHandler config={{ responsive: true, displayModeBar: false }}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </Card>
        )}

        {/* Categorical Value Counts */}
        {value_counts && value_counts.length > 0 && (
          <Card>
            <SectionHeader
              icon={<PieChart size={18} className="text-purple-400" />}
              title="Categorical Value Counts"
              subtitle="Top values by frequency"
            />
            <div className="flex flex-wrap gap-1.5 mb-4 max-h-20 overflow-y-auto custom-scrollbar">
              {value_counts.map((d: any, i: number) => (
                <button key={i} onClick={() => setActiveVCCol(i)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    activeVCCol === i ? 'bg-purple-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {d.feature}
                </button>
              ))}
            </div>
            {activeVC && (
              <AnimatePresence mode="wait">
                <motion.div key={activeVCCol} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Plot
                    data={[{
                      y: activeVC.values,
                      x: activeVC.counts,
                      type: 'bar',
                      orientation: 'h',
                      marker: {
                        color: activeVC.counts.map((_: any, i: number) => `hsla(${270 + i * 8}, 60%, 65%, 0.8)`),
                        line: { color: 'rgba(168,85,247,0.3)', width: 1 },
                      },
                      hovertemplate: '<b>%{y}</b><br>Count: %{x}<extra></extra>',
                    }]}
                    layout={plotLayout({ margin: { t: 10, b: 40, l: 120, r: 20 } })}
                    style={{ width: '100%', height: '240px' }}
                    useResizeHandler config={{ responsive: true, displayModeBar: false }}
                  />
                  <div className="text-[10px] text-slate-500 text-right mt-1">
                    Showing top 10 of {activeVC.total_unique} unique values
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </Card>
        )}
      </div>

      {/* ── Correlation Heatmap ── */}
      {correlation?.columns?.length >= 2 && (
        <Card>
          <SectionHeader
            icon={<TrendingUp size={18} className="text-brand" />}
            title="Feature Correlation Matrix"
            subtitle="Pearson correlation between numeric features. +1 = perfect positive, -1 = perfect negative, 0 = no linear relationship."
          />
          <div className="w-full overflow-x-auto bg-slate-950/60 p-4 rounded-2xl border border-white/5">
            <Plot
              data={[{
                z: correlation.values,
                x: correlation.columns,
                y: correlation.columns,
                type: 'heatmap',
                colorscale: [
                  [0, '#7c3aed'], [0.25, '#1e1b4b'], [0.5, '#0f172a'],
                  [0.75, '#164e63'], [1, '#38bdf8']
                ],
                showscale: true,
                hovertemplate: '<b>%{y}</b> × <b>%{x}</b><br>r = %{z:.3f}<extra></extra>',
                zmin: -1, zmax: 1,
              }]}
              layout={plotLayout({
                height: Math.max(300, correlation.columns.length * 32),
                margin: { t: 20, b: 80, l: 120, r: 60 },
                xaxis: { tickangle: -45 },
              })}
              style={{ width: '100%', height: `${Math.max(300, correlation.columns.length * 32)}px` }}
              useResizeHandler config={{ responsive: true, displayModeBar: false }}
            />
          </div>
        </Card>
      )}

      {/* ── Outlier Summary + Skewness ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

        {/* Outlier Bar */}
        {outlier_summary && outlier_summary.length > 0 && (
          <Card>
            <SectionHeader
              icon={<AlertTriangle size={18} className="text-amber-400" />}
              title="Outlier Summary (IQR)"
              subtitle="Features ranked by outlier percentage via 1.5×IQR rule"
            />
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {outlier_summary.map((row: any, i: number) => (
                <div key={i} className="space-y-1.5 p-3 rounded-xl bg-slate-950/40 border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200 font-mono">{row.feature}</span>
                    <div className="flex gap-3">
                      <span className="text-slate-400">{row.outliers.toLocaleString()} outliers</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        row.outlier_pct > 10 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        row.outlier_pct > 5  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>{row.outlier_pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${Math.min(row.outlier_pct * 3, 100)}%` }}
                      transition={{ duration: 0.7, delay: i * 0.04 }}
                      className={`h-full rounded-full ${
                        row.outlier_pct > 10 ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
                        row.outlier_pct > 5  ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                        'bg-gradient-to-r from-cyan-500 to-brand'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Skewness/Kurtosis */}
        {skew_kurt && skew_kurt.length > 0 && (
          <Card>
            <SectionHeader
              icon={<Activity size={18} className="text-emerald-400" />}
              title="Skewness & Kurtosis"
              subtitle="Distribution shape indicators for numeric features"
            />
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {skew_kurt.map((row: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-200 font-mono text-xs">{row.feature}</span>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        Math.abs(row.skewness) > 1 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        Math.abs(row.skewness) > 0.5 ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        Skew: {row.skewness}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-purple-500/10 text-purple-400 border-purple-500/20">
                        Kurt: {row.kurtosis}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1.5 flex gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-400">{row.skew_label}</span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-[10px] text-slate-400">{row.kurt_label}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── Column Profiles Table ── */}
      <div className="glass-card rounded-[1.75rem] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Grid size={18} className="text-brand" /> Column Profiles
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">Role, type, and basic statistics per feature</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input type="text" placeholder="Search features..."
              value={profileSearch}
              onChange={e => { setProfileSearch(e.target.value); setProfilePage(1) }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-white/5">
                {[
                  { k: 'feature', l: 'Feature' }, { k: 'dtype', l: 'Type' },
                  { k: 'role', l: 'Role' }, { k: 'observed', l: 'Observed' },
                  { k: 'unique', l: 'Unique' }, { k: 'unique_pct', l: 'Unique %' },
                ].map(({ k, l }) => (
                  <th key={k} onClick={() => handleProfileSort(k)}
                    className="px-5 py-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">{l} <ArrowUpDown size={11} /></div>
                  </th>
                ))}
                <th className="px-5 py-4">Mean / Top Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {pagedProfiles.length > 0 ? pagedProfiles.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-brand/5 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-white font-mono">{row.feature}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400">{row.dtype}</span>
                  </td>
                  <td className="px-5 py-3.5"><RoleBadge role={row.role} /></td>
                  <td className="px-5 py-3.5 font-mono">{row.observed?.toLocaleString() ?? '—'}</td>
                  <td className="px-5 py-3.5 font-mono">{row.unique?.toLocaleString() ?? '—'}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-400">{row.unique_pct ?? '—'}%</td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono">
                    {row.mean != null ? row.mean : row.top_values?.[0] ? `"${row.top_values[0].value}"` : '—'}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">No features match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {profilePages > 1 && (
          <div className="p-4 bg-slate-950/40 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Page <b className="text-white">{profilePage}</b> / <b className="text-white">{profilePages}</b> ({filteredProfiles.length} features)</span>
            <div className="flex gap-2">
              <button disabled={profilePage === 1} onClick={() => setProfilePage(p => p - 1)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white">
                <ChevronLeft size={16} />
              </button>
              <button disabled={profilePage === profilePages} onClick={() => setProfilePage(p => p + 1)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Descriptive Stats Table ── */}
      {descriptive_stats && descriptive_stats.length > 0 && (
        <div className="glass-card rounded-[1.75rem] overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Sigma size={18} className="text-cyan-400" /> Descriptive Statistics
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Full statistical summary for all numeric features</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input type="text" placeholder="Search features..."
                value={statsSearch}
                onChange={e => { setStatsSearch(e.target.value); setStatsPage(1) }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-white/5">
                  {[
                    { k: 'feature', l: 'Feature' }, { k: 'count', l: 'Count' },
                    { k: 'mean', l: 'Mean' }, { k: 'std', l: 'Std Dev' },
                    { k: 'min', l: 'Min' }, { k: 'p25', l: 'Q1' },
                    { k: 'p50', l: 'Median' }, { k: 'p75', l: 'Q3' },
                    { k: 'max', l: 'Max' }, { k: 'skewness', l: 'Skew' },
                    { k: 'outliers', l: 'Outliers' },
                  ].map(({ k, l }) => (
                    <th key={k} onClick={() => handleStatsSort(k)}
                      className="px-4 py-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">{l} <ArrowUpDown size={10} /></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-mono">
                {pagedStats.length > 0 ? pagedStats.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-brand/5 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-white font-mono">{row.feature}</td>
                    <td className="px-4 py-3.5 text-slate-400">{row.count?.toLocaleString()}</td>
                    <td className="px-4 py-3.5">{row.mean ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-400">{row.std ?? '—'}</td>
                    <td className="px-4 py-3.5">{row.min ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-400">{row.p25 ?? '—'}</td>
                    <td className="px-4 py-3.5 font-bold text-white">{row.p50 ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-400">{row.p75 ?? '—'}</td>
                    <td className="px-4 py-3.5">{row.max ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`font-bold ${Math.abs(row.skewness ?? 0) > 1 ? 'text-amber-400' : Math.abs(row.skewness ?? 0) > 0.5 ? 'text-cyan-400' : 'text-emerald-400'}`}>
                        {row.skewness ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={row.outlier_pct > 10 ? 'text-rose-400' : row.outlier_pct > 5 ? 'text-amber-400' : 'text-slate-400'}>
                        {row.outliers} ({row.outlier_pct}%)
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={11} className="px-5 py-8 text-center text-slate-500">No features match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {statsPages > 1 && (
            <div className="p-4 bg-slate-950/40 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Page <b className="text-white">{statsPage}</b> / <b className="text-white">{statsPages}</b></span>
              <div className="flex gap-2">
                <button disabled={statsPage === 1} onClick={() => setStatsPage(p => p - 1)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white">
                  <ChevronLeft size={16} />
                </button>
                <button disabled={statsPage === statsPages} onClick={() => setStatsPage(p => p + 1)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Cardinality Table ── */}
      <Card>
        <SectionHeader
          icon={<FileSpreadsheet size={18} className="text-brand" />}
          title="Feature Cardinality"
          subtitle="Uniqueness level of each feature — helps detect ID columns, constant columns, and high-cardinality categoricals"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-white/5">
                <th className="px-5 py-3">Feature</th>
                <th className="px-5 py-3">Unique Values</th>
                <th className="px-5 py-3">Unique %</th>
                <th className="px-5 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {cardinality.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-brand/5 transition-colors">
                  <td className="px-5 py-3 font-bold text-white font-mono">{row.feature}</td>
                  <td className="px-5 py-3 font-mono">{row.unique.toLocaleString()}</td>
                  <td className="px-5 py-3 font-mono text-slate-400">{row.unique_pct}%</td>
                  <td className="px-5 py-3"><RoleBadge role={row.role} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Info note ── */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/40 border border-white/5 text-xs text-slate-500">
        <Info size={14} className="text-brand shrink-0 mt-0.5" />
        <p>This section covers <strong className="text-slate-400">general dataset analytics</strong> — distributions, correlations, cardinality, outliers and shape. For missing value diagnostics, use the <strong className="text-slate-400">Missing Value Analysis</strong> tab.</p>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="glass-card p-8 sm:p-10 rounded-[2rem] bg-gradient-to-r from-purple-600/10 via-brand/10 to-transparent border border-purple-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">Ready to Impute?</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Use ML-powered imputation (KNN, MICE, XGBoost, HybridForest™) to fill missing values and generate a complete dataset.
          </p>
        </div>
        <button
          onClick={() => navigate('/results')}
          className="btn-premium flex items-center justify-center gap-2 group text-sm px-8 py-3.5 shrink-0 w-full md:w-auto"
        >
          <span>RUN IMPUTATION ENGINE</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

export default EDA
