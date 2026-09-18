export default function Footer({ onOpenResource }) {
  const resources = ["Privacy Policy", "Terms of Service", "Documentation", "Support"];

  return (
    <footer className="mt-auto w-full border-t border-emerald-100 bg-stone-50/90 text-stone-700">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 text-base font-bold text-emerald-950">
            <span className="material-symbols-outlined text-emerald-700">agriculture</span>
            <span>AgroChain Ecosystem</span>
          </div>
          <p className="max-w-sm text-xs text-slate-500">
            Blockchain-Powered Smart Cassava and Maize Value Chain Ecosystem for provenance, quality assurance, and marketplace coordination.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {resources.map((resource) => (
            <button
              key={resource}
              type="button"
              onClick={() => onOpenResource(resource)}
              className="text-xs font-semibold text-emerald-900/70 hover:text-emerald-700 transition-all underline underline-offset-4"
            >
              {resource}
            </button>
          ))}
        </div>

        <div className="text-center md:text-right text-xs text-slate-400 space-y-1">
          <p>© 2026 AgroChain Research & Development Ecosystem.</p>
          <p className="text-[11px] text-slate-400">Academic & Demonstrator Evaluation Platform.</p>
        </div>
      </div>
    </footer>
  );
}
