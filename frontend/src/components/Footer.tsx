import { Database, Mail, MapPin, Users } from 'lucide-react'
import neeteshImg from '../assets/neetesh.png'
import dhananjayImg from '../assets/dhananjay.png'

const Footer = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/neeteshsharma45',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/neeteshsharma4545',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
    {
      name: 'Twitter / X',
      href: 'https://x.com/neeteshsharma45',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      ),
    },
    {
      name: 'Email',
      href: 'mailto:neeteshsharma7723@gmail.com',
      icon: <Mail size={18} />,
    },
  ]

  return (
    <footer className="bg-[#060d1f] border-t border-white/5 mt-12 sm:mt-20 relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* ── Col 1: Brand ── */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand rounded-xl text-slate-950 shadow-lg shadow-brand/20">
                <Database size={20} />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">
                ImpuTech<span className="text-brand"> AI</span>
              </span>
            </div>

            {/* Tagline */}
            <p className="text-[11px] font-bold text-brand/80 tracking-wide">
              Smarter Imputation | Better Data | Stronger Decisions
            </p>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed">
              Next-generation intelligence for complex data reconstruction. Powered by advanced
              ensemble learning and proprietary neural architectures.
            </p>

            {/* Institute badge */}
            <div className="flex items-center gap-2.5 mt-1">
              <div className="p-1.5 bg-brand/10 rounded-lg border border-brand/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div>
                <p className="text-white text-xs font-bold">MITS, Gwalior</p>
                <p className="text-slate-500 text-[10px]">Student Project</p>
              </div>
            </div>
          </div>

          {/* ── Col 2: Quick Links ── */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
              </svg>
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3">
              {['Home', 'About', 'Features', 'Research', 'Documentation', 'Contact'].map(link => (
                <li key={link}>
                  <a href="#"
                    className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors text-xs font-medium group"
                  >
                    <span className="text-slate-600 group-hover:text-brand transition-colors">›</span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Research & Technology ── */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
              </svg>
              Research &amp; Technology
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { icon: '🧠', label: 'Machine Learning' },
                { icon: '⚙️', label: 'Deep Learning' },
                { icon: '📊', label: 'Data Imputation' },
                { icon: '📈', label: 'Data Analytics' },
                { icon: '🐍', label: 'Python | FastAPI' },
                { icon: '⚛️', label: 'React | Vercel' },
              ].map(({ icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-slate-400 text-xs font-medium">
                  <span className="text-sm">{icon}</span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Get In Touch ── */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <Mail size={15} className="text-brand" />
              Get In Touch
            </h4>
            <ul className="flex flex-col gap-5">
              {/* Email */}
              <li className="flex items-start gap-3">
                <div className="p-1.5 bg-brand/10 rounded-lg border border-brand/20 mt-0.5 shrink-0">
                  <Mail size={13} className="text-brand" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Email</p>
                  <a href="mailto:neeteshsharma7723@gmail.com"
                    className="text-slate-300 hover:text-brand transition-colors text-xs font-medium break-all">
                    neeteshsharma7723@gmail.com
                  </a>
                </div>
              </li>

              {/* Location */}
              <li className="flex items-start gap-3">
                <div className="p-1.5 bg-brand/10 rounded-lg border border-brand/20 mt-0.5 shrink-0">
                  <MapPin size={13} className="text-brand" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Location</p>
                  <p className="text-slate-300 text-xs font-medium">MITS, Gwalior</p>
                </div>
              </li>

              {/* Collaboration */}
              <li className="flex items-start gap-3">
                <div className="p-1.5 bg-brand/10 rounded-lg border border-brand/20 mt-0.5 shrink-0">
                  <Users size={13} className="text-brand" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">For Collaboration / Research</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Feel free to reach out for internships, research, or project collaborations.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* ── Col 5: Guided By ── */}
          <div className="flex flex-col gap-5">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <Users size={15} className="text-brand" />
              Guided By
            </h4>

            <div className="flex flex-col gap-5">
              {/* Person 1: Neetesh */}
              <div className="flex items-center gap-3">
                <img src={neeteshImg} alt="Neetesh Sharma" className="w-11 h-11 rounded-full object-cover border border-brand/30 shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">Neetesh Sharma</p>
                  <p className="text-slate-400 text-[11px]">Student | MITS Gwalior</p>
                  <p className="text-brand text-[10px] mt-0.5 font-semibold">AI/ML Research &amp; Development</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/5" />

              {/* Person 2: Dr. Dhananjay */}
              <div className="flex items-center gap-3">
                <img src={dhananjayImg} alt="Dr. Dhananjay Bisen" className="w-11 h-11 rounded-full object-cover border border-purple-500/30 shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">Dr. Dhananjay Bisen</p>
                  <p className="text-slate-400 text-[11px]">Assistant Professor</p>
                  <p className="text-slate-500 text-[10px]">MITS, Gwalior</p>
                  <p className="text-purple-400 text-[10px] mt-0.5 font-semibold italic">Project Guide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-slate-600 text-[11px] font-medium">
            © {new Date().getFullYear()} ImpuTech AI. All rights reserved.
          </p>

          {/* Center tagline */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block h-px w-8 bg-slate-800" />
            <div className="flex items-center gap-2 text-slate-600 text-[11px] font-medium">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                <path d="M12 8v4l3 3" />
              </svg>
              Building Smarter Solutions for a Data-Driven Future
            </div>
            <div className="hidden sm:block h-px w-8 bg-slate-800" />
          </div>

          {/* Social icons + Made with love */}
          <div className="flex items-center gap-4">
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" title={s.name}
                  className="p-2 rounded-lg text-slate-500 hover:text-brand transition-colors hover:bg-brand/5"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-slate-800" />

            {/* Made with love */}
            <p className="text-slate-600 text-[11px] font-medium flex items-center gap-1">
              Made with
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#e11d48" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              at MITS, Gwalior
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
