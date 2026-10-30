import { useState } from "react";
import SideDrawer from "./SideDrawer.jsx";

export default function Header({
  activePage,
  setActivePage,
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
  isGanacheReady,
  isContractReady,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isPublicPage = activePage === "landing" || activePage === "verify";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-emerald-100 bg-white/95 backdrop-blur-md">
        <div className={`app-header-inner mx-auto flex h-[76px] items-center justify-between gap-4 ${isPublicPage ? "app-public-header max-w-7xl" : "app-workspace-header lg:ml-72 lg:max-w-none"}`}>
          <div className="flex min-w-0 items-center gap-3">
            {!isPublicPage && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="rounded-xl p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800 lg:hidden"
                aria-label="Open workspace navigation"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActivePage(isPublicPage ? "landing" : "dashboard")}
              className="flex items-center text-left"
              aria-label="AgroChain home"
            >
              <img
                src="/brand/agrochain-full-colour.png"
                alt="AgroChain"
                className="h-10 w-auto max-w-[132px] object-contain sm:h-11 sm:max-w-[172px]"
              />
            </button>
          </div>

          {isPublicPage ? (
            <nav className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePage("verify")}
                aria-label="Verify Product"
                title="Verify Product"
                className={`inline-flex h-9 w-9 items-center justify-center gap-1.5 rounded-lg border border-dashed p-0 text-xs font-bold transition-all sm:h-auto sm:w-auto sm:px-3 sm:py-2 ${activePage === "verify" ? "border-emerald-700 bg-emerald-50 text-emerald-900 shadow-[0_0_0_2px_rgba(21,84,59,0.05)]" : "border-emerald-300 bg-white text-emerald-800 hover:border-emerald-600 hover:bg-emerald-50"}`}
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span className="hidden sm:inline">Verify Product</span>
                <span className="hidden h-1 w-1 rounded-full bg-[#D6A637] sm:block" aria-hidden="true" />              </button>
              <button
                type="button"
                onClick={() => setActivePage("dashboard")}
                className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Enter Platform
              </button>
            </nav>
          ) : (
            <div className="flex items-center gap-2" ref={walletMenuRef}>
              <button
                type="button"
                onClick={() => setActivePage("landing")}
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 md:block"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => setActivePage("landing")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 md:hidden"
                aria-label="Go to public home page"
                title="Home"
              >
                <span className="material-symbols-outlined text-[20px] leading-none">home</span>
              </button>
              <span className={`hidden items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:flex ${
                isContractReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isContractReady ? "bg-emerald-500" : "bg-amber-500"}`} />
                {isContractReady ? "System online" : isGanacheReady ? "Contract missing" : "Network offline"}
              </span>
              <div className="hidden text-right sm:block">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current role</p>
                <p className="text-xs font-bold text-emerald-800">{activeRoleLabel || "Public viewer"}</p>
              </div>
              <button
                type="button"
                onClick={onOpenNotifications}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"
                title="System status"
                aria-label="System status"
              >
                <span className="material-symbols-outlined text-[20px] leading-none">info</span>
              </button>
              {activeAccount && <button
                type="button"
                onClick={() => setIsWalletMenuOpen((curr) => !curr)}
                aria-label={activeAccount ? `Wallet ${formatAddress(activeAccount.address)}` : "Connect Wallet"}
                title={activeAccount ? formatAddress(activeAccount.address) : "Connect Wallet"}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 p-0 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3.5 sm:py-2.5"
              >
                <span className="material-symbols-outlined text-[18px] leading-none">account_balance_wallet</span>
                <span className="hidden whitespace-nowrap sm:inline">{activeAccount ? formatAddress(activeAccount.address) : "Connect Wallet"}</span>
              </button>}
              {isWalletMenuOpen && (
                <div className="absolute right-4 top-[calc(100%+8px)] w-[300px] rounded-2xl border border-emerald-100 bg-white p-4 shadow-xl">
                  <div className="space-y-2 border-b border-emerald-50 pb-3 text-xs">
                    <p className="font-bold text-slate-800">
                      {activeAccount ? `Address: ${formatAddress(activeAccount.address)}` : "Wallet Not Connected"}
                    </p>
                    <div className="flex justify-between text-slate-600">
                      <span>Network</span><span className="font-bold text-emerald-700">{chainLabel}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Role</span><span className="font-bold text-emerald-800">{activeRoleLabel || "NONE"}</span>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <button
                      type="button"
                      onClick={() => { onConnectWallet(); setIsWalletMenuOpen(false); }}
                      disabled={isWorking || isConnecting}
                      className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {activeAccount ? "Switch Account / Reconnect" : "Connect MetaMask"}
                    </button>
                    {activeAccount && (
                      <button
                        type="button"
                        onClick={() => { onDisconnect(); setIsWalletMenuOpen(false); }}
                        disabled={isWorking}
                        className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      {!isPublicPage && (
        <>
          <SideDrawer
            activePage={activePage}
            setActivePage={setActivePage}
            activeRoleLabel={activeRoleLabel}
            hasActiveAccount={Boolean(activeAccount)}
          />
          <SideDrawer
            open={drawerOpen}
            setOpen={setDrawerOpen}
            activePage={activePage}
            setActivePage={setActivePage}
            isMobile
            activeRoleLabel={activeRoleLabel}
            hasActiveAccount={Boolean(activeAccount)}
          />
        </>
      )}
    </>
  );
}
