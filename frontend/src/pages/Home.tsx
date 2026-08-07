import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Zap, BarChart3, Database, Cpu, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../utils/api'

// Hero image from generation
import heroImg from '../assets/hero.png' 

interface HomeProps {
  setDatasetId: (id: string) => void
}

const Home: React.FC<HomeProps> = ({ setDatasetId }) => {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    const loadingToast = toast.loading('Uploading and analyzing dataset...')

    try {
      const response = await api.uploadDataset(file)
      setDatasetId(response.data.dataset_id)
      toast.success('Dataset processed successfully!', { id: loadingToast })
      navigate('/dashboard')
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.detail || 'Failed to upload dataset', { id: loadingToast })
    } finally {
      setIsUploading(false)
    }
  }, [navigate, setDatasetId])

  const downloadSampleData = () => {
    const csvContent = "Age,Income,Score,Category,Active\n25,50000,85,A,True\n30,,90,B,False\n35,60000,,A,True\n,75000,95,C,True\n40,80000,70,,False\n45,90000,60,B,\n50,,50,A,True\n,,40,B,False\n60,120000,,C,True\n22,45000,88,A,False"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'impute_tech_demo.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Demo dataset downloaded! Upload it below to test.')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0]?.message || 'File type not supported. Please upload a CSV or Excel file.';
      toast.error(error);
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.csv'],
      'application/csv': ['.csv'],
      'text/x-csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  })

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold mb-8 uppercase tracking-widest">
                <Zap size={14} className="animate-pulse" /> Enterprise Data Imputation
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tight text-white">
                Solve Missing <br />
                <span className="text-gradient">Data Challenges</span>
              </h1>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-lg">
                ImpuTech AI utilizes state-of-the-art ensemble models to reconstruct missing values with unprecedented precision and statistical integrity.
              </p>
              
              <div className="flex flex-wrap gap-5">
                <button 
                  onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-premium flex items-center gap-2 group"
                >
                  Analyze Dataset 
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={downloadSampleData}
                  className="btn-secondary flex items-center gap-2 text-white"
                >
                  <Database size={18} /> Download Sample
                </button>
              </div>

              <div className="mt-12 flex items-center gap-6 text-slate-500 text-sm">
                <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> HIPAA Compliant</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-success" /> End-to-End Encryption</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-brand/20 blur-[120px] rounded-full animate-pulse-slow"></div>
              <div className="relative glass-card p-2 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                <div className="bg-slate-950 rounded-[2.2rem] overflow-hidden">
                  <img src={heroImg} alt="Dashboard Preview" className="w-full opacity-80 hover:opacity-100 transition-opacity duration-700" />
                </div>
                
                {/* Floating Widgets */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                  className="absolute top-10 -right-6 glass-card p-5 rounded-2xl border-white/10 z-20 shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-success/20 rounded-xl flex items-center justify-center text-success">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Confidence</div>
                      <div className="text-lg font-bold text-white">99.8%</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ repeat: Infinity, duration: 6, delay: 1 }}
                  className="absolute bottom-12 -left-8 glass-card p-5 rounded-2xl border-white/10 z-20 shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-brand/20 rounded-xl flex items-center justify-center text-brand">
                      <Cpu size={22} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Model</div>
                      <div className="text-lg font-bold text-white">HybridForest™</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-24 bg-slate-900/30 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 text-white">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Start Your Analysis</h2>
            <p className="text-slate-400">Securely upload your data for comprehensive missing value evaluation.</p>
          </div>

          <div
            className={`relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-500 p-16 text-center
              ${isDragActive ? 'border-brand bg-brand/5 shadow-[0_0_50px_rgba(56,189,248,0.15)]' : 'border-slate-800 hover:border-brand/40 bg-slate-900/50'}
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-6">
              <div className={`w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ${isDragActive ? 'text-brand' : 'text-slate-500'}`}>
                <Upload size={42} />
              </div>
              <div>
                <p className="text-2xl font-bold mb-3">
                  {isDragActive ? 'Release to Impute' : 'Drag & Drop Data'}
                </p>
                <p className="text-slate-500">
                  Accepts CSV, XLSX, and XLS formats up to 50MB
                </p>
              </div>
              
              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 rounded-3xl backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand mb-4"></div>
                  <p className="text-brand font-bold animate-pulse">Running ML Analytics...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-8 text-xs font-medium text-slate-600 uppercase tracking-widest">
            <span className="flex items-center gap-2 text-slate-500"><Globe size={14} /> Global Privacy</span>
            <span className="flex items-center gap-2 text-slate-500"><Database size={14} /> Cloud Backup</span>
            <span className="flex items-center gap-2 text-slate-500"><ShieldCheck size={14} /> SOC2 Compliant</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <BarChart3 className="text-brand" size={40} />,
                title: "Predictive Analytics",
                desc: "Go beyond simple statistics. Our engine identifies complex correlations to understand the nature of your missing data."
              },
              {
                icon: <Cpu className="text-accent" size={40} />,
                title: "HybridForest™ Engine",
                desc: "Our proprietary ensemble method combining Random Forests and Gradient Boosting for superior accuracy."
              },
              {
                icon: <Globe className="text-success" size={40} />,
                title: "Export Ready",
                desc: "Download cleaned datasets directly in production-ready formats with complete imputation reports."
              }
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-10 rounded-[2rem]"
              >
                <div className="mb-8">{feat.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
