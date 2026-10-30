const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ key: "dashboard", label: "Dashboard", icon: "dashboard" }],
  },
  {
    label: "Supply Chain",
    items: [
      { key: "trace", label: "Traceability", icon: "route" },
      { key: "inputs", label: "Inputs", icon: "agriculture", roles: ["FARMER", "INPUT_SUPPLIER", "EXTENSION_OFFICER", "ADMINISTRATOR"] },
      { key: "storage", label: "Storage & Processing", icon: "warehouse", roles: ["FARMER", "STORAGE_OPERATOR", "PROCESSOR", "REGULATOR", "ADMINISTRATOR"] },
      { key: "logistics", label: "Logistics", icon: "local_shipping", roles: ["FARMER", "TRANSPORTER", "DISTRIBUTOR", "ADMINISTRATOR"] },
    ],
  },
  {
    label: "Commerce & Insights",
    items: [
      { key: "marketplace", label: "Marketplace", icon: "storefront", roles: ["FARMER", "PROCESSOR", "FINANCIAL_INSTITUTION", "ADMINISTRATOR"] },
      { key: "analytics", label: "Analytics", icon: "monitoring" },
    ],
  },
  {
    label: "Governance",
    items: [
      { key: "security", label: "Security", icon: "shield", roles: ["ADMINISTRATOR"] },
      { key: "admin", label: "Administration", icon: "admin_panel_settings", roles: ["ADMINISTRATOR"] },
    ],
  },
];

export { NAV_GROUPS };

export default function SideDrawer({
  open,
  setOpen,
  activePage,
  setActivePage,
  isMobile = false,
  activeRoleLabel = "NONE",
  hasActiveAccount = false,
}) {
  const navigate = (key) => {
    setActivePage(key);
    if (isMobile) setOpen(false);
  };

  return (
    <>
      {isMobile && open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-emerald-100 bg-white shadow-xl transition-transform duration-300 ${
          isMobile
            ? `${open ? "translate-x-0" : "-translate-x-full"} lg:hidden`
            : "hidden lg:flex"
        }`}
      >
        <div className="flex h-[76px] items-center gap-3 border-b border-emerald-50 px-5">
          <button type="button" onClick={() => navigate("dashboard")} className="flex min-w-0 items-center" aria-label="AgroChain dashboard">
            <img src="/brand/agrochain-full-colour.png" alt="AgroChain" className="h-12 w-auto max-w-[185px] object-contain" />
          </button>
          {isMobile && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-800"
              aria-label="Close navigation"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {NAV_GROUPS
            .filter((group) => group.label !== "Governance" || activeRoleLabel === "ADMINISTRATOR")
            .map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  (() => {
                    const isRestricted = item.roles && hasActiveAccount && !item.roles.includes(activeRoleLabel);
                    return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.key)}
                    title={isRestricted ? "Page is view-only for the connected stakeholder role" : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                      activePage === item.key
                        ? "bg-emerald-700 text-white shadow-sm"
                        : isRestricted
                          ? "text-slate-400 hover:bg-slate-50"
                          : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                    <span>{item.label}</span>
                    {isRestricted && <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">View only</span>}
                  </button>
                    );
                  })()
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-emerald-50 p-4">
          <button
            type="button"
            onClick={() => navigate("workspace-verify")}
            className="flex w-full items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3 text-left text-sm font-bold text-emerald-800 hover:bg-emerald-100"
          >
            <span className="material-symbols-outlined text-[19px]">qr_code_scanner</span>
            <span>Verify a Product</span>
          </button>
        </div>
      </aside>
    </>
  );
}
