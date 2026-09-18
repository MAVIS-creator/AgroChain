import { useState } from "react";

export default function Header({
  activePage,
  setActivePage,
  navItems,
  activeAccount,
  formatAddress,
  isConnecting,
  onConnectWallet,
  onDisconnect,
  isWorking,
  isWalletMenuOpen,
  setIsWalletMenuOpen,
  walletMenuRef,
  chainLabel,
  onOpenNotifications,
  activeRoleLabel,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(13,40,29,0.06)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 py-3.5">
        {/* Brand Logo & Name */}
        <button
          type="button"
          onClick={() => setActivePage("dashboard")}
          className="flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-[0_8px_20px_rgba(16,112,65,0.28)]">
            <span className="material-symbols-outlined text-[22px]">agriculture</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-emerald-950 tracking-tight">AgroChain</span>
              <span className="hidden sm:inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Cassava & Maize
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/80 font-medium truncate">Smart Value Chain Ecosystem</p>
          </div>
        </button>

        {/* Desktop Navigation (Scrollable or multi-row safe) */}
        <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActivePage(item.key)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activePage === item.key
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-emerald-900/80 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Controls & Wallet Connection */}
        <div className="flex items-center gap-2" ref={walletMenuRef}>
          {/* Mobile menu toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((curr) => !curr)}
            className="lg:hidden rounded-lg p-2 text-emerald-900/80 hover:bg-emerald-50"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? "close" : "menu"}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            className="rounded-lg p-2 text-emerald-900/70 hover:bg-emerald-50"
            title="System Telemetry & Status"
          >
            <span className="material-symbols-outlined text-[20px]">info</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWalletMenuOpen((curr) => !curr)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-900 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            <span>{activeAccount ? formatAddress(activeAccount.address) : "Connect Wallet"}</span>
          </button>

          {/* Wallet dropdown modal */}
          {isWalletMenuOpen && (
            <div className="absolute right-4 top-[calc(100%+8px)] w-[300px] rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_16px_40px_rgba(13,40,29,0.18)] z-50">
              <div className="space-y-1.5 pb-3 border-b border-emerald-50">
                <p className="text-xs font-bold text-slate-800">
                  {activeAccount ? `Address: ${formatAddress(activeAccount.address)}` : "Wallet Not Connected"}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Network:</span>
                  <span className="font-medium text-emerald-700">{chainLabel}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Stakeholder Role:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {activeRoleLabel || "NONE"}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onConnectWallet();
                    setIsWalletMenuOpen(false);
                  }}
                  disabled={isWorking || isConnecting}
                  className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-800 disabled:opacity-50"
                >
                  {activeAccount ? "Switch Account / Reconnect" : "Connect MetaMask"}
                </button>

                {activeAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      onDisconnect();
                      setIsWalletMenuOpen(false);
                    }}
                    disabled={isWorking}
                    className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white px-4 py-3 shadow-inner">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActivePage(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`rounded-lg px-3 py-2 text-xs font-semibold text-left transition-all ${
                  activePage === item.key
                    ? "bg-emerald-700 text-white font-bold"
                    : "bg-slate-50 text-emerald-950 hover:bg-emerald-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
