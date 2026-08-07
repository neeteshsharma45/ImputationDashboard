import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, FileText, Download, ExternalLink, ChevronRight, ShieldCheck, Zap, Sparkles, Terminal, Cpu } from 'lucide-react'

const Documentation: React.FC = () => {
  const paperUrl = '/imputation_research_paper.pdf'

  const methods = [
    { title: 'KNN Imputation', icon: <Cpu className="text-brand" />, desc: 'Analysis of spatial clustering and neighbor weights in high-dimensional manifolds.' },
    { title: 'MICE Framework', icon: <Terminal className="text-accent" />, desc: 'Mathematical convergence of chained equations in multivariate distributions.' },
    { title: 'XGBoost Engine', icon: <Zap className="text-warning" />, desc: 'Gradient boosted regression trees for predictive reconstruction of missing features.' },
    { title: 'HybridForest™', icon: <Sparkles className="text-brand" />, desc: 'Our proprietary ensemble architecture with XGBoost residual error correction.' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <BookOpen size={14} /> Neural Documentation v2.1
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tighter">
            The Science of <br />
            <span className="text-gradient">Data Reconstruction</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-12 font-medium">
            Explore the theoretical foundations of ImpuTech AI. Our methodology leverages advanced statistical learning and deep neural benchmarks to ensure maximum data integrity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {methods.map((m, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border-white/5 group hover:border-brand/40 transition-all">
                <div className="mb-4 p-2 bg-slate-900 w-fit rounded-lg border border-white/5">
                  {m.icon}
                </div>
                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                  {m.title}
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-5">
            <a
              href={paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium flex items-center gap-2"
            >
              <Download size={18} /> Research Paper (PDF)
            </a>
            <button className="btn-secondary flex items-center gap-2">
              <Terminal size={18} /> API Reference
            </button>
          </div>
        </motion.div>

        {/* Right Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-10 bg-brand/10 blur-[100px] rounded-full animate-pulse-slow"></div>
          <div className="relative glass-card rounded-[2.5rem] overflow-hidden border-white/10 shadow-2xl aspect-[3/4] flex flex-col bg-slate-950/40">
            <div className="bg-slate-900/60 p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-brand/20 rounded-md">
                  <FileText className="text-brand" size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">whitepaper_2024_revised.pdf</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-warning/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-success/40"></div>
              </div>
            </div>
            
            <div className="flex-grow flex items-center justify-center p-12 bg-gradient-to-b from-transparent to-slate-950/50">
              <div className="text-center">
                <div className="relative inline-flex p-10 bg-slate-900 rounded-[2rem] mb-8 shadow-inner border border-white/5">
                  <div className="absolute inset-0 bg-brand/5 blur-xl rounded-full"></div>
                  <BookOpen size={64} className="text-slate-600 relative z-10" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Systematic Benchmarks</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mb-10 font-medium">
                  Review the mathematical implementation details and multi-dataset validation results.
                </p>
                <a
                  href={paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-brand hover:text-white font-bold text-xs uppercase tracking-[0.2em] transition-all"
                >
                  Enter Document Viewer <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Decorative bottom bar */}
            <div className="p-10 border-t border-white/5 bg-slate-900/40 backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="h-full w-1/2 bg-brand/50"
                  />
                </div>
                <div className="h-1.5 w-16 bg-slate-800 rounded-full"></div>
              </div>
              <div className="space-y-4">
                <div className="h-1.5 w-full bg-slate-800/30 rounded-full"></div>
                <div className="h-1.5 w-full bg-slate-800/30 rounded-full"></div>
                <div className="h-1.5 w-3/4 bg-slate-800/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Documentation
