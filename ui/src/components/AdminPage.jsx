import { useState } from "react";

export default function AdminPage({
  isWorking,
  IS_PLACEHOLDER,
  formatAddress,
  activeAccount,
  assignRoleUser,
  setAssignRoleUser,
  assignRoleId,
  setAssignRoleId,
  handleAssignRole,
  refreshNetworkData,
  contractAdmin,
  reloadDatasetInsights,
  stakeholdersList = [],
}) {
  const [stakeholderName, setStakeholderName] = useState("");
  const [stakeholderStatus, setStakeholderStatus] = useState(1); // 1 = ACTIVE, 2 = SUSPENDED

  const roleOptions = [
    { value: 1, label: "ADMINISTRATOR (Full Platform Admin)" },
    { value: 2, label: "FARMER (Crop Producer)" },
    { value: 3, label: "INPUT_SUPPLIER (Certified Seeds / Inputs)" },
    { value: 4, label: "EXTENSION_OFFICER (Agronomic Field Verification)" },
    { value: 5, label: "STORAGE_OPERATOR (Silos & Warehousing)" },
    { value: 6, label: "PROCESSOR (Industrial Milling & Value-Addition)" },
    { value: 7, label: "TRANSPORTER (Haulage & Logistics)" },
    { value: 8, label: "DISTRIBUTOR (Wholesale & Distribution)" },
    { value: 9, label: "FINANCIAL_INSTITUTION (Insurance & Payments)" },
    { value: 10, label: "REGULATOR (Standards & Safety Inspection)" },
    { value: 11, label: "CONSUMER (End-User Verification)" },
  ];

  const onSubmit = (e) => {
    e.preventDefault();
    handleAssignRole(e, {
      nameOrOrg: stakeholderName.trim() || "Assigned Stakeholder",
      status: Number(stakeholderStatus),
    });
    setStakeholderName("");
  };

  return (
    <main className="mt-20 mb-16 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950">Administration & Identity Authority</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              11 Stakeholder Roles
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Permissioned stakeholder registration, wallet role assignment, and on-chain identity lifecycle management.
          </p>
        </div>
        {activeAccount?.address && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-900 shadow-sm">
            <span className="text-blue-700">Connected Admin: </span>
            <span className="font-mono font-bold">{formatAddress(activeAccount.address)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assign Role / Register Stakeholder Form */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined rounded-lg bg-emerald-50 p-2 text-emerald-700">admin_panel_settings</span>
            <div>
              <h3 className="font-bold text-slate-900">Register & Assign Role</h3>
              <p className="text-xs text-slate-500">Only Deployer Admin Address Permitted</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700">User Wallet Address</label>
              <input
                value={assignRoleUser}
                onChange={(e) => setAssignRoleUser(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="0x..."
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Organization / Stakeholder Display Name</label>
              <input
                value={stakeholderName}
                onChange={(e) => setStakeholderName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="e.g. Green Valley Farm Cooperative"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Stakeholder Role</label>
                <select
                  value={assignRoleId}
                  onChange={(e) => setAssignRoleId(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Identity Status</label>
                <select
                  value={stakeholderStatus}
                  onChange={(e) => setStakeholderStatus(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value={1}>ACTIVE</option>
                  <option value={2}>SUSPENDED</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isWorking || IS_PLACEHOLDER}
              className="mt-2 w-full rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white hover:bg-emerald-800 active:scale-98 transition-all disabled:opacity-50 shadow-sm"
            >
              Commit On-Chain Role Assignment
            </button>
          </form>
        </div>

        {/* Network & Identity Controls */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined rounded-lg bg-blue-50 p-2 text-blue-700">tune</span>
            <div>
              <h3 className="font-bold text-slate-900">Network Controls & Authority</h3>
              <p className="text-xs text-slate-500">Chain Synchronizer & Telemetry</p>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            As the system authority, sync live state from Ganache and refresh off-chain dataset cache.
          </p>

          <div className="grid gap-2.5 pt-1">
            <button
              type="button"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-left text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all disabled:opacity-50"
              onClick={refreshNetworkData}
              disabled={isWorking}
            >
              Sync Blockchain State
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
              onClick={reloadDatasetInsights}
            >
              Reload Empirical Dataset Telemetry
            </button>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deployed Admin Address</span>
            <code className="block break-all font-mono text-xs font-semibold text-emerald-900">
              {contractAdmin || "0x..."}
            </code>
          </div>

          {/* Security note */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-700 shrink-0 text-[18px]">security</span>
            <div className="space-y-0.5">
              <span className="font-bold">Security & OSINT Rule: </span>
              <span>Only authorized administrators can modify roles. No backdoor accounts or arbitrary withdrawal mechanisms exist in the smart contract.</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
