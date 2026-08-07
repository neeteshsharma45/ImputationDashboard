import { Database, Mail, ExternalLink, Globe } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-slate-950/80 py-20 px-4 sm:px-6 lg:px-8 mt-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
        {/* Brand & Developer Info */}
        <div className="flex flex-col gap-8 col-span-1 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand rounded-xl text-slate-950 shadow-lg shadow-brand/20">
              <Database size={22} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              ImpuTech<span className="text-brand"> AI</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            Next-generation intelligence for complex data reconstruction. Powered by advanced ensemble learning and proprietary neural architectures.
          </p>
          <div className="pt-8 border-t border-white/5">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3">Architected By</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-brand font-bold">NS</div>
              <div>
                <p className="text-white font-bold text-base leading-none">Neetesh Sharma</p>
                <p className="text-slate-600 text-[10px] mt-1">Lead AI Engineer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-8">
          <h4 className="font-black text-white text-[10px] uppercase tracking-[0.2em]">Ecosystem</h4>
          <ul className="flex flex-col gap-4 text-slate-500 text-sm font-semibold">
            <li><a href="#" className="hover:text-brand transition-all flex items-center gap-2">Neural Models <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" /></a></li>
            <li><a href="#" className="hover:text-brand transition-all">Statistical Benchmarking</a></li>
            <li><a href="#" className="hover:text-brand transition-all">HybridForest™ Core</a></li>
            <li><a href="#" className="hover:text-brand transition-all">API Integration</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <h4 className="font-black text-white text-[10px] uppercase tracking-[0.2em]">Transmission</h4>
          <ul className="flex flex-col gap-6 text-slate-400 text-sm">
            <li className="flex items-center gap-4 group cursor-pointer">
              <div className="p-3 bg-slate-900 rounded-2xl border border-white/5 group-hover:border-brand/40 group-hover:bg-brand/5 transition-all">
                <Mail size={18} className="text-brand" />
              </div>
              <div>
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-0.5">Direct Inquiry</div>
                <a href="mailto:neeteshsharma7723@gmail.com" className="font-bold text-white group-hover:text-brand transition-colors">
                  neeteshsharma7723@gmail.com
                </a>
              </div>
            </li>
            <li className="flex items-center gap-4 group cursor-pointer">
              <div className="p-3 bg-slate-900 rounded-2xl border border-white/5 group-hover:border-success/40 group-hover:bg-success/5 transition-all">
                <Globe size={18} className="text-success" />
              </div>
              <div>
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-0.5">Network Node</div>
                <span className="font-bold text-white group-hover:text-success transition-colors">neeteshsharma.dev</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Social & Community */}
        <div className="flex flex-col gap-8">
          <h4 className="font-black text-white text-[10px] uppercase tracking-[0.2em]">Connect</h4>
          <div className="flex flex-wrap gap-4">
            {[
              { 
                name: 'LinkedIn', 
                href: "https://www.linkedin.com/in/neeteshsharma4545", 
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                ) 
              },
              { 
                name: 'Twitter', 
                href: "https://x.com/neeteshsharma45", 
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                )
              },
              { 
                name: 'GitHub', 
                href: "https://github.com/neeteshsharma45", 
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                )
              },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
                className="p-4 bg-slate-900 border border-white/5 hover:border-brand/40 hover:bg-brand/5 text-slate-500 hover:text-brand rounded-2xl transition-all shadow-xl hover:-translate-y-1"
              >
                {social.icon}
              </a>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic">
            "Reconstructing reality, one data point at a time."
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:row justify-between items-center gap-6">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} ImpuTech AI Platform. Global Operations.
        </p>
        <div className="flex gap-8 text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">
          <a href="#" className="hover:text-brand transition-colors">Security Protocol</a>
          <a href="#" className="hover:text-brand transition-colors">Ethical AI</a>
          <a href="#" className="hover:text-brand transition-colors">Privacy</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
