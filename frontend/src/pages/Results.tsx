import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  CheckCircle2,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ArrowLeft,
  Terminal,
  Activity,
  LucideIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../utils/api'

interface ResultsProps {
  datasetId: string | null
}

interface ImputationMethod {
  id: string
  name: string
  Icon: LucideIcon
  desc: string
  premium: boolean
}

const METHODS: ImputationMethod[] = [
  { id: 'knn', name: 'K-Nearest Neighbors', Icon: Cpu, desc: 'Spatial similarity imputation', premium: false },
  { id: 'mice', name: 'MICE Algorithm', Icon: Layers, desc: 'Chained iterative equations', premium: false },
  { id: 'xgboost', name: 'XGBoost Predictor', Icon: Zap, desc: 'Gradient boosted trees', premium: false },
  { id: 'missforest', name: 'MissForest', Icon: ShieldCheck, desc: 'Random forest iterative fill', premium: false },
  { id: 'hybridforest', name: 'HybridForest™', Icon: Sparkles, desc: 'State-of-the-art ensemble', premium: true }
]

const Results: React.FC<ResultsProps> = ({ datasetId }) => {
  const navigate = useNavigate()
  const [selectedMethod, setSelectedMethod] = useState<string>('hybridforest')
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [comparison, setComparison] = useState<any>(null)
  const [filename, setFilename] = useState<string>('')

  useEffect(() => {
    if (!datasetId) {
      navigate('/')
      return
    }

    const fetchInfo = async () => {
      try {
        const res = await api.getAnalytics(datasetId)
        setFilename(res.data.filename)
      } catch (error) {
        console.error('Failed to fetch dataset info')
      }
    }
    fetchInfo()
  }, [datasetId, navigate])

  const runImputation = async () => {
    if (!datasetId) return
    setIsRunning(true)
    const loadingToast = toast.loading(`Initializing ${selectedMethod} engine...`)

    try {
      const response = await api.runImputation(datasetId, selectedMethod)
      setResults(response.data)
      toast.success(`${selectedMethod} optimization complete!`, { id: loadingToast })

      const compRes = await api.getComparison(datasetId)
      setComparison(compRes.data.comparisons)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Engine error', { id: loadingToast })
    } finally {
      setIsRunning(false)
    }
  }

  const downloadData = async (format: string) => {
    if (!datasetId) return
    window.open(api.downloadUrl(datasetId, format, selectedMethod), '_blank')
  }

  const currentMethod = METHODS.find(m => m.id === selectedMethod)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Page Header */}
      <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="p-2.5 sm:p-3 bg-slate-900 border border-white/5 hover:border-brand/40 rounded-xl sm:rounded-2xl text-slate-400 hover:text-brand transition-all shadow-xl flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight flex flex-wrap items-center gap-2">
            Neural Reconstruction <span className="text-brand/50 text-base sm:text-2xl font-light">| Engine</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-slate-500 text-xs sm:text-sm">Target Dataset:</p>
            <span className="px-2 sm:px-3 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-brand text-[9px] sm:text-[10px] font-mono font-bold tracking-widest truncate max-w-[180px] sm:max-w-none">
              {filename || 'active_session.csv'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        {/* Method Selection Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
          <div className="glass-card p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem]">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <Terminal size={16} className="text-brand" /> Select Engine
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {METHODS.map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ x: 3 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`cursor-pointer p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center gap-3 sm:gap-4 ${
                    selectedMethod === method.id
                      ? 'bg-brand/10 border-brand/40 shadow-[0_0_20px_rgba(56,189,248,0.1)]'
                      : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`p-2 sm:p-3 rounded-xl transition-colors flex-shrink-0 ${selectedMethod === method.id ? 'bg-brand text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                    <method.Icon size={18} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-bold text-xs sm:text-sm ${selectedMethod === method.id ? 'text-white' : 'text-slate-400'}`}>{method.name}</h4>
                      {method.premium && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-black border border-amber-500/20">PRO</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[9px] sm:text-[10px] uppercase tracking-wider mt-0.5 truncate">{method.desc}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-2 h-2 rounded-full bg-brand shadow-[0_0_10px_#38bdf8] flex-shrink-0"></div>
                  )}
                </motion.div>
              ))}
            </div>

            <button
              onClick={runImputation}
              disabled={isRunning}
              className={`w-full mt-6 sm:mt-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-xs transition-all shadow-xl
                ${isRunning ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'btn-premium text-white'}
              `}
            >
              {isRunning ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin h-4 w-4 border-2 border-brand/30 border-t-brand rounded-full"></div>
                  Optimizing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Initialize Model <ChevronRight size={15} />
                </div>
              )}
            </button>
          </div>

          <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border-brand/10 bg-brand/5">
            <h4 className="text-brand text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Sparkles size={13} /> Model Insight
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              {currentMethod?.id === 'hybridforest' 
                ? "Our proprietary HybridForest engine utilizes XGBoost residual correction for peak accuracy in complex non-linear distributions."
                : "Standard statistical model optimized for high-dimensional feature spaces and linear dependencies."}
            </p>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[400px] sm:min-h-[600px] glass-card rounded-[2rem] sm:rounded-[2.5rem] flex flex-col items-center justify-center p-8 sm:p-16 text-center border-dashed border-2"
              >
                <div className="relative mb-8 sm:mb-10">
                  <div className="absolute inset-0 bg-brand/10 blur-[80px] rounded-full animate-pulse"></div>
                  <div className="relative p-8 sm:p-10 bg-slate-900/50 rounded-full text-slate-700 border border-white/5">
                    <Activity size={56} className="sm:hidden" />
                    <Activity size={80} className="hidden sm:block" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">System Ready</h3>
                <p className="text-slate-500 max-w-xs sm:max-w-md leading-relaxed text-sm sm:text-base">
                  The imputation engine is synchronized and awaiting model selection. Choose an algorithm to begin the reconstruction process.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Performance Header */}
                <div className="glass-card p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-10">
                    <CheckCircle2 size={80} className="sm:hidden" />
                    <CheckCircle2 size={120} className="hidden sm:block" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className="p-3 sm:p-4 bg-success/10 rounded-xl sm:rounded-2xl text-success border border-success/20">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-3xl font-bold text-white">Reconstruction Complete</h2>
                        <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">Recovered {results.metrics.missing_before.toLocaleString()} missing data points.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      {[
                        { label: 'RMSE Accuracy', value: results.metrics.rmse.toFixed(5), detail: 'Lower is better', color: 'text-brand' },
                        { label: 'R² Correlation', value: (results.metrics.r2 * 100).toFixed(1) + '%', detail: 'Information gain', color: 'text-success' },
                        { label: 'Neural Latency', value: results.metrics.execution_time + 's', detail: 'Total compute time', color: 'text-accent' },
                      ].map((m, i) => (
                        <div key={i} className="bg-slate-950/40 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5">
                          <div className="text-[9px] sm:text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">{m.label}</div>
                          <div className={`text-xl sm:text-2xl font-black ${m.color} mb-1`}>{m.value}</div>
                          <div className="text-[9px] sm:text-[10px] text-slate-500 italic">{m.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Export Hub */}
                <div className="glass-card p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem]">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Production Export</h3>
                    <div className="px-3 sm:px-4 py-1.5 rounded-full bg-slate-900 border border-white/5 text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Secure Handshake</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                    <button
                      onClick={() => downloadData('csv')}
                      className="group p-4 sm:p-6 bg-slate-900 hover:bg-brand/5 border border-white/5 hover:border-brand/40 rounded-2xl sm:rounded-3xl transition-all text-left"
                    >
                      <Layers size={24} className="text-brand mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-white mb-1 text-sm sm:text-base">Raw CSV</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-bold">Standard format</div>
                    </button>
                    <button
                      onClick={() => downloadData('excel')}
                      className="group p-4 sm:p-6 bg-slate-900 hover:bg-emerald-500/5 border border-white/5 hover:border-emerald-500/40 rounded-2xl sm:rounded-3xl transition-all text-left"
                    >
                      <BarChart3 size={24} className="text-emerald-500 mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-white mb-1 text-sm sm:text-base">Structured XLS</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-bold">Excel optimized</div>
                    </button>
                    <button
                      onClick={() => downloadData('pdf')}
                      className="group p-4 sm:p-6 bg-slate-900 hover:bg-accent/5 border border-white/5 hover:border-accent/40 rounded-2xl sm:rounded-3xl transition-all text-left"
                    >
                      <Sparkles size={24} className="text-accent mb-3 sm:mb-4 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-white mb-1 text-sm sm:text-base">Insight Report</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-bold">Full PDF diagnostic</div>
                    </button>
                  </div>
                </div>

                {/* Benchmark Table */}
                {comparison && (
                  <div className="glass-card rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
                    <div className="p-5 sm:p-8 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
                      <h3 className="text-base sm:text-xl font-bold text-white flex items-center gap-3">
                        <Activity size={18} className="text-brand" /> Engine Benchmark
                      </h3>
                      <span className="text-xs text-slate-500 font-medium tracking-wide italic hidden sm:block">Multi-model comparison</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950/80 text-slate-500 uppercase text-[9px] sm:text-[10px] font-black tracking-widest">
                          <tr>
                            <th className="px-4 sm:px-8 py-4 sm:py-5 whitespace-nowrap">Algorithm</th>
                            <th className="px-4 sm:px-8 py-4 sm:py-5 text-right whitespace-nowrap">RMSE</th>
                            <th className="px-4 sm:px-8 py-4 sm:py-5 text-right whitespace-nowrap">R² Index</th>
                            <th className="px-4 sm:px-8 py-4 sm:py-5 text-center whitespace-nowrap">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {Object.entries(comparison).map(([method, data]: [string, any]) => {
                            return (
                              <tr key={method} className={`transition-colors ${selectedMethod === method ? 'bg-brand/5' : 'hover:bg-white/5'}`}>
                                <td className="px-4 sm:px-8 py-4 sm:py-6">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedMethod === method ? 'bg-brand animate-pulse' : 'bg-slate-700'}`}></div>
                                    <span className={`font-bold capitalize text-xs sm:text-sm ${selectedMethod === method ? 'text-white' : 'text-slate-400'}`}>{method}</span>
                                    {method === 'hybridforest' && <Sparkles size={11} className="text-amber-500" />}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-8 py-4 sm:py-6 text-right font-mono text-slate-400 text-xs sm:text-sm">{data.metrics.rmse.toFixed(5)}</td>
                                <td className={`px-4 sm:px-8 py-4 sm:py-6 text-right font-mono font-bold text-xs sm:text-sm ${data.metrics.r2 > 0.9 ? 'text-success' : 'text-slate-500'}`}>{(data.metrics.r2 * 100).toFixed(2)}%</td>
                                <td className="px-4 sm:px-8 py-4 sm:py-6">
                                  <div className="flex justify-center">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${selectedMethod === method ? 'bg-brand/20 text-brand' : 'bg-slate-800 text-slate-600'}`}>
                                      {selectedMethod === method ? 'Active' : 'Standby'}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Results
