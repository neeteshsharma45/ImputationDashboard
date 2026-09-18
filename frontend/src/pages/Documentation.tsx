import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, FileText, Download, ExternalLink, Terminal, Cpu, Zap, Sparkles } from 'lucide-react'

const Documentation: React.FC = () => {
  const paperUrl = '/imputation_research_paper.pdf'

  const methods = [
    { title: 'KNN Imputation', icon: <Cpu className="text-brand" size={18} />, desc: 'Analysis of spatial clustering and neighbor weights in high-dimensional manifolds.' },
    { title: 'MICE Framework', icon: <Terminal className="text-accent" size={18} />, desc: 'Mathematical convergence of chained equations in multivariate distributions.' },
    { title: 'XGBoost Engine', icon: <Zap className="text-warning" size={18} />, desc: 'Gradient boosted regression trees for predictive reconstruction of missing features.' },
    { title: 'HybridForest™', icon: <Sparkles className="text-brand" size={18} />, desc: 'Our proprietary ensemble architecture with XGBoost residual error correction.' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-8">
            <BookOpen size={13} /> Neural Documentation v2.1
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-5 sm:mb-8 leading-tight tracking-tighter">
            The Science of <br />
            <span className="text-gradient">Data Reconstruction</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-lg leading-relaxed mb-8 sm:mb-12 font-medium">
            Explore the theoretical foundations of ImpuTech AI. Our methodology leverages advanced statistical learning and deep neural benchmarks to ensure maximum data integrity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {methods.map((m, i) => (
              <div key={i} className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border-white/5 group hover:border-brand/40 transition-all">
                <div className="mb-3 sm:mb-4 p-2 bg-slate-900 w-fit rounded-lg border border-white/5">
                  {m.icon}
                </div>
                <h4 className="text-white font-bold mb-1 sm:mb-2 text-sm sm:text-base flex items-center gap-2">
                  {m.title}
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-5">
            <a
              href={paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium flex items-center gap-2 text-sm sm:text-base"
            >
              <Download size={16} /> Research Paper (PDF)
            </a>
            <button className="btn-secondary flex items-center gap-2 text-sm sm:text-base">
              <Terminal size={16} /> API Reference
            </button>
          </div>
        </motion.div>

        {/* Right Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative mt-6 lg:mt-0"
        >
          <div className="absolute -inset-6 sm:-inset-10 bg-brand/10 blur-[80px] sm:blur-[100px] rounded-full animate-pulse-slow"></div>
          <div className="relative glass-card rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-white/10 shadow-2xl flex flex-col bg-slate-950/40">
            <div className="bg-slate-900/60 p-4 sm:p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-1.5 bg-brand/20 rounded-md flex-shrink-0">
                  <FileText className="text-brand" size={14} />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">whitepaper_2024_revised.pdf</span>
              </div>
              <div className="flex gap-1.5 flex-shrink-0 ml-2">
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-danger/40"></div>
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-warning/40"></div>
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-success/40"></div>
              </div>
            </div>
            
            <div className="flex-grow flex items-center justify-center p-8 sm:p-12 bg-gradient-to-b from-transparent to-slate-950/50">
              <div className="text-center">
                <div className="relative inline-flex p-8 sm:p-10 bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] mb-6 sm:mb-8 shadow-inner border border-white/5">
                  <div className="absolute inset-0 bg-brand/5 blur-xl rounded-full"></div>
                  <BookOpen size={48} className="text-slate-600 relative z-10 sm:hidden" />
                  <BookOpen size={64} className="text-slate-600 relative z-10 hidden sm:block" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3 tracking-tight">Systematic Benchmarks</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-xs mx-auto mb-8 sm:mb-10 font-medium">
                  Review the mathematical implementation details and multi-dataset validation results.
                </p>
                <a
                  href={paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 sm:gap-3 text-brand hover:text-white font-bold text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all"
                >
                  Enter Document Viewer <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Decorative bottom bar */}
            <div className="p-6 sm:p-10 border-t border-white/5 bg-slate-900/40 backdrop-blur-md">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="h-1.5 w-24 sm:w-32 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="h-full w-1/2 bg-brand/50"
                  />
                </div>
                <div className="h-1.5 w-12 sm:w-16 bg-slate-800 rounded-full"></div>
              </div>
              <div className="space-y-3 sm:space-y-4">
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
