import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, AlertCircle, TrendingUp, Filter, ArrowRight, Table as TableIcon, Download, Info, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../utils/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory'

// @ts-ignore
const Plot = (createPlotlyComponent.default || createPlotlyComponent)(Plotly)

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

interface DashboardProps {
  datasetId: string | null
}

const Dashboard: React.FC<DashboardProps> = ({ datasetId }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [preview, setPreview] = useState<any>(null)
  const [filename, setFilename] = useState<string>('')

  useEffect(() => {
    if (!datasetId) {
      navigate('/')
      return
    }

    const fetchData = async () => {
      try {
        const [analyticsRes, previewRes] = await Promise.all([
          api.getAnalytics(datasetId),
          api.getPreview(datasetId)
        ])
        setAnalytics(analyticsRes.data.analytics)
        setFilename(analyticsRes.data.filename)
        setPreview(previewRes.data)
      } catch (error) {
        toast.error('Failed to load dataset analytics')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [datasetId, navigate])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="relative">
          <div className="absolute -inset-4 bg-brand/20 blur-xl rounded-full animate-pulse"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand relative z-10"></div>
        </div>
        <p className="mt-8 text-slate-400 font-medium tracking-wide">Initializing Neural Diagnostics...</p>
      </div>
    )
  }

  const missingData = {
    labels: Object.keys(analytics.missing_per_col),
    datasets: [
      {
        label: 'Missing Values',
        data: Object.values(analytics.missing_per_col),
        backgroundColor: 'rgba(56, 189, 248, 0.4)',
        borderColor: '#38bdf8',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(56, 189, 248, 0.6)',
      },
    ],
  }

  const typeData = {
    labels: ['Numeric', 'Categorical'],
    datasets: [
      {
        data: [analytics.num_numeric, analytics.num_categorical],
        backgroundColor: ['rgba(56, 189, 248, 0.7)', 'rgba(139, 92, 246, 0.7)'],
        borderColor: ['#38bdf8', '#8b5cf6'],
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand/10 rounded-lg text-brand">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Dataset Intelligence</h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-slate-400">Deep structural analysis and missingness patterns for</p>
            <span className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-brand text-xs font-mono font-bold">
              {filename || 'active_session.csv'}
            </span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/results')}
            className="btn-premium flex items-center gap-2 group shadow-brand/20"
          >
            Run Imputation Engine <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Rows', value: analytics.total_rows.toLocaleString(), icon: <TableIcon className="text-brand" />, color: "brand" },
          { label: 'Feature Space', value: analytics.total_cols, icon: <Layers className="text-accent" />, color: "accent" },
          { label: 'Missing Cells', value: analytics.missing_cells.toLocaleString(), icon: <AlertCircle className="text-danger" />, color: "danger" },
          { label: 'Missing Rate', value: `${analytics.missing_percentage.toFixed(2)}%`, icon: <TrendingUp className="text-success" />, color: "success" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-[1.5rem]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5">
                {stat.icon}
              </div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: i * 0.2 }}
                className={`h-full bg-gradient-to-r ${i === 0 ? 'from-brand/50 to-brand' : i === 1 ? 'from-accent/50 to-accent' : i === 2 ? 'from-danger/50 to-danger' : 'from-success/50 to-success'}`}
              ></motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Missing Values Chart */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Missingness Distribution</h3>
            <div className="text-slate-500 hover:text-white cursor-help"><Info size={18} /></div>
          </div>
          <div className="h-80">
            <Bar
              data={missingData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255,255,255,0.03)' }, 
                    ticks: { color: '#64748b', font: { size: 11 } } 
                  },
                  x: { 
                    grid: { display: false }, 
                    ticks: { color: '#94a3b8', font: { weight: 'bold' } } 
                  },
                },
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#38bdf8',
                    bodyColor: '#f8fafc',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 12,
                  }
                },
              }}
            />
          </div>
        </div>

        {/* Feature Types Chart */}
        <div className="glass-card p-8 rounded-[2rem]">
          <h3 className="text-xl font-bold text-white mb-8">Feature Composition</h3>
          <div className="h-64 flex justify-center items-center mt-4">
            <Pie
              data={typeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    position: 'bottom', 
                    labels: { color: '#94a3b8', padding: 20, font: { size: 12, weight: 'normal' }, usePointStyle: true } 
                  },
                  tooltip: {
                    padding: 12,
                    cornerRadius: 12,
                  }
                },
                cutout: '60%',
              }}
            />
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Numeric</div>
              <div className="text-xl font-bold text-brand">{analytics.num_numeric}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Categorical</div>
              <div className="text-xl font-bold text-accent">{analytics.num_categorical}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Matrix */}
      {analytics.correlation && analytics.correlation.columns && (
        <div className="glass-card p-10 rounded-[2.5rem] mb-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-bold text-white">Feature Correlation Matrix</h3>
              <p className="text-slate-500 text-sm mt-1">Discover linear dependencies between numerical features.</p>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5">
              <Plot
                data={[
                  {
                    z: analytics.correlation.values,
                    x: analytics.correlation.columns,
                    y: analytics.correlation.columns,
                    type: 'heatmap',
                    colorscale: [
                      [0, '#0f172a'],
                      [0.5, '#1e293b'],
                      [1, '#38bdf8']
                    ],
                    showscale: true,
                  },
                ]}
                layout={{
                  width: 700,
                  height: 600,
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  font: { color: '#94a3b8', size: 11, family: 'Inter' },
                  margin: { t: 50, b: 100, l: 100, r: 50 },
                  xaxis: { tickangle: -45, gridcolor: 'rgba(255,255,255,0.02)' },
                  yaxis: { gridcolor: 'rgba(255,255,255,0.02)' },
                }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Data Grid Preview */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/20">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
              Structural Data Preview
            </h3>
            <p className="text-slate-500 text-sm mt-1">Diagnostic view of the first 10 observations.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5 text-xs text-slate-400">
            <Info size={14} /> System-generated preview
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50">
                {preview?.columns.map((col: string) => (
                  <th key={col} className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {preview?.data.map((row: any[], i: number) => (
                <tr key={i} className="hover:bg-brand/5 transition-all group">
                  {row.map((val, j) => (
                    <td key={j} className="px-8 py-5">
                      {val === null ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/10 text-danger text-[10px] font-bold uppercase tracking-wider border border-danger/20">
                          <AlertCircle size={10} /> Missing
                        </span>
                      ) : (
                        <span className="text-slate-300 font-medium">{String(val)}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-900/40 text-center text-xs text-slate-500 font-medium">
          End of diagnostic preview. Run imputation to reconstruct missing data points.
        </div>
      </div>
    </div>
  )
}

export default Dashboard
