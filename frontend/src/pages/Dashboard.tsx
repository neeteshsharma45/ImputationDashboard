import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Table as TableIcon,
  Layers,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Database,
  ShieldAlert,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Grid,
  FileSpreadsheet,
  AreaChart
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../utils/api'
import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory'

// @ts-ignore
const Plot = (createPlotlyComponent.default || createPlotlyComponent)(Plotly)

interface DashboardProps {
  datasetId: string | null
}

const Dashboard: React.FC<DashboardProps> = ({ datasetId }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [filename, setFilename] = useState<string>('')

  // Summary Table State
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'feature' | 'missing_count' | 'missing_percentage' | 'data_type'>('missing_percentage')
  const [sortAsc, setSortAsc] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    if (!datasetId) {
      navigate('/')
      return
    }

    const fetchData = async () => {
      try {
        const analyticsRes = await api.getAnalytics(datasetId)
        setAnalytics(analyticsRes.data.analytics)
        setFilename(analyticsRes.data.filename)
      } catch (error) {
        toast.error('Failed to load dataset analytics')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [datasetId, navigate])

  // Filtered & Sorted Summary Table Data
  const filteredSummary = useMemo(() => {
    if (!analytics?.summary_table) return []
    let list = [...analytics.summary_table]

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      list = list.filter(item =>
        item.feature.toLowerCase().includes(term) ||
        item.data_type.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
      )
    }

    list.sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }
      return sortAsc ? valA - valB : valB - valA
    })

    return list
  }, [analytics, searchTerm, sortField, sortAsc])

  const totalPages = Math.ceil(filteredSummary.length / pageSize) || 1
  const paginatedSummary = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredSummary.slice(start, start + pageSize)
  }, [filteredSummary, currentPage, pageSize])

  const handleSort = (field: 'feature' | 'missing_count' | 'missing_percentage' | 'data_type') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="relative">
          <div className="absolute -inset-4 bg-brand/20 blur-xl rounded-full animate-pulse"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand relative z-10"></div>
        </div>
        <p className="mt-8 text-slate-400 font-medium tracking-wide text-sm sm:text-base">
          Computing Missingness Diagnostics...
        </p>
      </div>
    )
  }

  const { overview, row_missingness, missing_matrix, missing_patterns, missing_correlation, potential_indicators, insights } = analytics

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'None':
        return <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 size={13} /> Zero Missingness</span>
      case 'Low':
        return <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 size={13} /> Low Severity</span>
      case 'Moderate':
        return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle size={13} /> Moderate Severity</span>
      case 'High':
        return <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><ShieldAlert size={13} /> High Severity</span>
      case 'Critical':
        return <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><AlertCircle size={13} /> Critical Severity</span>
      default:
        return null
    }
  }

  const featuresWithMissing = analytics.summary_table ? analytics.summary_table.filter((f: any) => f.missing_count > 0) : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-12">
      {/* Top Header & Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-slate-900/40 border border-white/5 p-6 rounded-[1.75rem] backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="p-2.5 bg-brand/10 rounded-xl text-brand border border-brand/20">
              <BarChart3 size={22} />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Missing Value Analysis
            </h1>
            <div className="ml-0 sm:ml-2">
              {getSeverityBadge(overview.severity)}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-400 text-xs sm:text-sm">
            <span>Diagnostic scan for file</span>
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-slate-950 font-bold text-xs uppercase tracking-wide shadow-lg shadow-brand/30 transition-all"
        >
          <BarChart3 size={14} /> Missing Value Analysis
        </button>
        <button
          onClick={() => navigate('/eda')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-bold text-xs uppercase tracking-wide transition-all"
        >
          <AreaChart size={14} /> Dataset Analytics
        </button>
      </div>

      {/* AI Missingness Insights */}
      {insights && insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 rounded-[1.75rem] border-brand/20 bg-gradient-to-r from-brand/5 via-purple-500/5 to-transparent relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles size={120} className="text-brand" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand/10 rounded-lg text-brand">
              <Sparkles size={18} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              AI Missingness Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {insights.map((insight: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-950/40 rounded-xl border border-white/5">
                <div className="w-2 h-2 rounded-full bg-brand mt-2 shrink-0" />
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Overview Cards (6 Metrics) */}
      <div>
        <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <Database size={14} className="text-brand" /> Dataset Health Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: 'Total Rows', value: overview.total_rows.toLocaleString(), icon: <TableIcon className="text-brand" size={16} /> },
            { label: 'Total Features', value: overview.total_cols, icon: <Layers className="text-cyan-400" size={16} /> },
            { label: 'Total Cells', value: overview.total_cells.toLocaleString(), icon: <Grid className="text-purple-400" size={16} /> },
            { label: 'Missing Cells', value: overview.missing_cells.toLocaleString(), icon: <AlertCircle className="text-rose-400" size={16} /> },
            { label: 'Missing Rate', value: `${overview.missing_percentage}%`, icon: <TrendingUp className="text-amber-400" size={16} /> },
            { label: 'Affected Features', value: `${overview.affected_features} / ${overview.total_cols}`, icon: <ShieldAlert className="text-emerald-400" size={16} /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                  {stat.icon}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1">
                  {stat.label}
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {stat.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Clean Dataset Banner if 0 missing values */}
      {overview.missing_cells === 0 && (
        <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-2xl font-bold text-white">Dataset is 100% Complete</h3>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            No missing values were detected across any of the {overview.total_cols} features. Your tabular dataset is completely intact and ready for modeling or analytics.
          </p>
        </div>
      )}

      {/* Missing Values by Feature & Row-wise Missingness */}
      {overview.missing_cells > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature Missingness Bar Visualization */}
          <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-[1.75rem] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 size={18} className="text-brand" /> Missing Values by Feature
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Features ranked by proportion of missing observations
                  </p>
                </div>
                <span className="text-xs px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-slate-400">
                  {featuresWithMissing.length} feature(s) affected
                </span>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                {featuresWithMissing.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-950/40 border border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200">{item.feature}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono">{item.missing_count.toLocaleString()} missing</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          item.missing_percentage > 30 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          item.missing_percentage > 10 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {item.missing_percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(item.missing_percentage, 2)}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                        className={`h-full rounded-full ${
                          item.missing_percentage > 30 ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
                          item.missing_percentage > 10 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                          'bg-gradient-to-r from-cyan-500 to-brand'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row-wise Missingness Overview */}
          <div className="glass-card p-6 sm:p-8 rounded-[1.75rem] flex flex-col justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-2">
                <PieChart size={18} className="text-purple-400" /> Row-wise Missingness
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mb-6">
                Completeness breakdown of individual row records
              </p>

              {/* Complete vs Incomplete pill bars */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-400" /> Complete Rows
                    </span>
                    <span className="font-bold text-white">{row_missingness.complete_rows.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(row_missingness.complete_rows / overview.total_rows * 100).toFixed(1)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 text-right">
                    {((row_missingness.complete_rows / overview.total_rows) * 100).toFixed(1)}% of total rows
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-rose-400" /> Incomplete Rows
                    </span>
                    <span className="font-bold text-white">{row_missingness.incomplete_rows.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${(row_missingness.incomplete_rows / overview.total_rows * 100).toFixed(1)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 text-right">
                    {((row_missingness.incomplete_rows / overview.total_rows) * 100).toFixed(1)}% of total rows
                  </div>
                </div>

                {/* Most incomplete rows snippet */}
                {row_missingness.most_incomplete && row_missingness.most_incomplete.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="text-xs font-bold text-slate-400 mb-2">Most Incomplete Rows (Sample)</div>
                    <div className="space-y-1.5">
                      {row_missingness.most_incomplete.slice(0, 3).map((r: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[11px] px-3 py-1.5 bg-slate-900/50 rounded-lg">
                          <span className="font-mono text-slate-400">Row #{r.row_index}</span>
                          <span className="text-rose-400 font-semibold">{r.missing_count} fields missing ({r.missing_pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Missingness Matrix (Plotly Heatmap) */}
      {missing_matrix && missing_matrix.columns && (
        <div className="glass-card p-6 sm:p-8 rounded-[1.75rem]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Grid size={18} className="text-cyan-400" /> Missingness Matrix
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Visual map of missing value occurrences across sampled observations (Cyan = Missing, Dark = Observed)
              </p>
            </div>
            <span className="text-[11px] px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-slate-400">
              Sampled {missing_matrix.row_indices?.length || 0} rows
            </span>
          </div>

          <div className="w-full overflow-x-auto bg-slate-950/60 p-4 rounded-2xl border border-white/5">
            <Plot
              data={[
                {
                  z: missing_matrix.data,
                  x: missing_matrix.columns,
                  y: missing_matrix.row_indices.map((idx: number) => `Row ${idx}`),
                  type: 'heatmap',
                  colorscale: [
                    [0, '#0f172a'], // Dark Navy for Observed
                    [1, '#38bdf8']  // Cyan for Missing
                  ],
                  showscale: false,
                  hoverinfo: 'x+y+z',
                }
              ]}
              layout={{
                autosize: true,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#94a3b8', size: 10, family: 'Inter' },
                margin: { t: 20, b: 60, l: 60, r: 20 },
                xaxis: { tickangle: -45, gridcolor: 'rgba(255,255,255,0.02)' },
                yaxis: { gridcolor: 'rgba(255,255,255,0.02)', showticklabels: false },
              }}
              style={{ width: '100%', height: '320px' }}
              useResizeHandler={true}
              config={{ responsive: true, displayModeBar: false }}
            />
          </div>
        </div>
      )}

      {/* Patterns & Correlation Side-by-Side */}
      {overview.missing_cells > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Missingness Patterns */}
          <div className="glass-card p-6 sm:p-8 rounded-[1.75rem]">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-2">
              <Layers size={18} className="text-purple-400" /> Top Missingness Patterns
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">
              Features that frequently drop out together in the dataset
            </p>

            {missing_patterns && missing_patterns.length > 0 ? (
              <div className="space-y-3">
                {missing_patterns.map((pat: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {pat.features.map((f: string, fIdx: number) => (
                        <span key={fIdx} className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-mono font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-white">{pat.count} rows</div>
                      <div className="text-[10px] text-purple-400 font-semibold">{pat.percentage}% of dataset</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/30 rounded-xl">
                No complex multi-feature missingness patterns detected.
              </div>
            )}
          </div>

          {/* Missingness Correlation Heatmap */}
          <div className="glass-card p-6 sm:p-8 rounded-[1.75rem]">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-brand" /> Missingness Correlation
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">
              Correlation between missing value occurrences (+1 means missing together)
            </p>

            {missing_correlation && missing_correlation.columns && missing_correlation.columns.length > 1 ? (
              <div className="w-full overflow-x-auto bg-slate-950/60 p-3 rounded-xl border border-white/5">
                <Plot
                  data={[
                    {
                      z: missing_correlation.values,
                      x: missing_correlation.columns,
                      y: missing_correlation.columns,
                      type: 'heatmap',
                      colorscale: [
                        [0, '#0f172a'],
                        [0.5, '#1e293b'],
                        [1, '#a855f7']
                      ],
                      showscale: true,
                    }
                  ]}
                  layout={{
                    autosize: true,
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: '#94a3b8', size: 9, family: 'Inter' },
                    margin: { t: 20, b: 60, l: 60, r: 20 },
                    xaxis: { tickangle: -45 },
                  }}
                  style={{ width: '100%', height: '240px' }}
                  useResizeHandler={true}
                  config={{ responsive: true, displayModeBar: false }}
                />
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/30 rounded-xl">
                Insufficient missing features to compute correlation matrix.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Potential Stealth Missing Indicators Alert */}
      {potential_indicators && potential_indicators.length > 0 && (
        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Potential Stealth Missing Indicators Detected</h4>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Found placeholder strings (e.g., "NULL", "N/A", "-1") that may represent unencoded missing values.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {potential_indicators.map((ind: any, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-mono">
                    {ind.feature}: '{ind.value}' ({ind.count} occurrences)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Missingness Summary Table (With Search, Sort, Pagination) */}
      <div className="glass-card rounded-[1.75rem] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-brand" /> Feature Summary Table
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Detailed missingness audit per dataset feature
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-white/5">
                <th
                  onClick={() => handleSort('feature')}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Feature Name <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('data_type')}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Data Type <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('missing_count')}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Missing Count <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('missing_percentage')}
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Missing % <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4">Observed Count</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-medium">
              {paginatedSummary.length > 0 ? (
                paginatedSummary.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-brand/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white font-mono">{item.feature}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-400">
                        {item.data_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{item.missing_count.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold">
                      <span className={item.missing_percentage > 20 ? 'text-rose-400' : item.missing_percentage > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                        {item.missing_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">{item.observed_count.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        item.status === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        item.status === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        item.status === 'Low' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-xs">
                    No features match your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950/40 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span> ({filteredSummary.length} features)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA Banner */}
      <div className="glass-card p-8 sm:p-10 rounded-[2rem] bg-gradient-to-r from-brand/10 via-purple-600/10 to-transparent border border-brand/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Ready to Impute Your Dataset?
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Configure automated statistical & machine learning imputation algorithms (Mean/Median, MICE, KNN, XGBoost) to generate a fully complete dataset.
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

export default Dashboard
