import { useState } from "react";

export default function DashboardPage({
  networkMetrics,
  integrityScore,
  createBatchId,
  setCreateBatchId,
  createQuantity,
  setCreateQuantity,
  createOrigin,
  setCreateOrigin,
  createCropType = 0,
  setCreateCropType,
  createUnit = "kg",
  setCreateUnit,
  createQualityGrade = "Grade A Premium",
  setCreateQualityGrade,
  handleCreateBatch,
  transferBatchId,
  setTransferBatchId,
  transferOwner,
  setTransferOwner,
  handleTransferOwnership,
  statusBatchId,
  setStatusBatchId,
  handleUpdateStatus,
  allBatches,
  formatAddress,
  refreshNetworkData,
  isWorking,
  IS_PLACEHOLDER,
  STATUS_LABELS = [],
  lastUpdated,
}) {
  const STAGES = [
    "CREATED",
    "INPUT_VERIFIED",
    "FARM_RECORDED",
    "HARVESTED",
    "STORED",
    "PROCESSED",
    "IN_TRANSIT",
    "DELIVERED",
  ];

  return (
    <main className="mt-20 mb-16 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950">AgroChain Ecosystem Dashboard</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              Dual-Crop Ledger
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Real-time value chain operations, provenance tracking, and immutable custody logging for cassava and maize.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshNetworkData}
          disabled={isWorking || IS_PLACEHOLDER}
          className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">sync</span>
          <span>Sync Chain State</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tracked Batches</span>
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">inventory_2</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{networkMetrics.totalBatches}</div>
          <p className="mt-1 text-[11px] text-slate-500">On-chain active records</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cumulative Volume</span>
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">scale</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {Math.round(networkMetrics.totalWeight / 1000).toLocaleString()} <span className="text-sm text-slate-500 font-normal">tonnes</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">{networkMetrics.totalWeight.toLocaleString()} kg total</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Data Integrity</span>
            <span className="material-symbols-outlined text-teal-600 text-[18px]">verified_user</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-teal-700">{integrityScore}%</div>
          <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600" style={{ width: `${integrityScore}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Finalized Delivery</span>
            <span className="material-symbols-outlined text-blue-600 text-[18px]">local_shipping</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {networkMetrics.statusCounts[7] || networkMetrics.statusCounts[3] || 0}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Fully delivered batches</p>
        </div>
      </div>

      {/* Operations Grid: Log New Batch + Transfer/Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Log New Batch (Cassava or Maize) */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined rounded-lg bg-emerald-50 p-2 text-emerald-700">add_circle</span>
            <div>
              <h3 className="font-bold text-slate-900">Log New Crop Batch</h3>
              <p className="text-xs text-slate-500">Farmers & Producers</p>
            </div>
          </div>

          <form onSubmit={handleCreateBatch} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Batch ID</label>
                <input
                  type="text"
                  value={createBatchId}
                  onChange={(e) => setCreateBatchId(e.target.value)}
                  placeholder="e.g. 20261001"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Crop Commodity</label>
                <select
                  value={createCropType}
                  onChange={(e) => setCreateCropType && setCreateCropType(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value={0}>Cassava Roots</option>
                  <option value={1}>Maize Grain</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-700">Quantity</label>
                <input
                  type="number"
                  value={createQuantity}
                  onChange={(e) => setCreateQuantity(e.target.value)}
                  placeholder="e.g. 3500"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Unit</label>
                <select
                  value={createUnit}
                  onChange={(e) => setCreateUnit && setCreateUnit(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="tonnes">tonnes</option>
                  <option value="bags">bags</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Farm Origin Cluster</label>
                <input
                  type="text"
                  value={createOrigin}
                  onChange={(e) => setCreateOrigin(e.target.value)}
                  placeholder="e.g. Ibadan, Oyo State"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Initial Quality Grade</label>
                <select
                  value={createQualityGrade}
                  onChange={(e) => setCreateQualityGrade && setCreateQualityGrade(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Grade A Premium">Grade A Premium</option>
                  <option value="Grade B Standard">Grade B Standard</option>
                  <option value="Standard Harvest">Standard Harvest</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isWorking || IS_PLACEHOLDER}
              className="mt-2 w-full rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white hover:bg-emerald-800 transition-all shadow-sm disabled:opacity-50"
            >
              Mint Crop Batch On-Chain
            </button>
          </form>
        </div>

        {/* Form 2: Custody Transfer & Stage Progression */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-6">
          {/* Transfer Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">swap_horiz</span>
              <h3 className="font-bold text-slate-900 text-sm">Transfer Batch Custody</h3>
            </div>
            <form onSubmit={handleTransferOwnership} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Batch ID"
                  value={transferBatchId}
                  onChange={(e) => setTransferBatchId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="New Custodian Wallet (0x...)"
                  value={transferOwner}
                  onChange={(e) => setTransferOwner(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isWorking || IS_PLACEHOLDER}
                className="w-full rounded-lg bg-emerald-800 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition-all disabled:opacity-50"
              >
                Transfer Custody On-Chain
              </button>
            </form>
          </div>

          {/* Quick Stage Update Section */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">step_forward</span>
              <h3 className="font-bold text-slate-900 text-sm">Advance Lifecycle Stage</h3>
            </div>
            <input
              type="text"
              placeholder="Target Batch ID to Advance"
              value={statusBatchId}
              onChange={(e) => setStatusBatchId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none mb-2.5"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {STAGES.slice(1).map((stageName, idx) => (
                <button
                  key={stageName}
                  type="button"
                  onClick={() => handleUpdateStatus(idx + 1)}
                  disabled={isWorking || !statusBatchId || IS_PLACEHOLDER}
                  className="rounded-lg border border-emerald-100 bg-emerald-50/60 py-2 px-1 text-[10px] font-bold text-emerald-900 hover:bg-emerald-100 transition-colors disabled:opacity-40"
                >
                  {stageName.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Batches Table */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="font-bold text-base text-slate-900">Recent Batches on Ledger</h3>
          <span className="text-xs text-slate-500">{allBatches.length} total batches synchronized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Batch ID</th>
                <th className="py-2.5 px-3 font-semibold">Crop</th>
                <th className="py-2.5 px-3 font-semibold">Origin</th>
                <th className="py-2.5 px-3 font-semibold">Quantity</th>
                <th className="py-2.5 px-3 font-semibold">Lifecycle Stage</th>
                <th className="py-2.5 px-3 font-semibold">Current Custodian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allBatches.length > 0 ? (
                allBatches.slice(0, 10).map((b) => (
                  <tr key={b.batchId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-emerald-950">#{b.batchId}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.cropType === 1 || b.cropType === "MAIZE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {b.cropType === 1 || b.cropType === "MAIZE" ? "Maize" : "Cassava"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{b.originLocation}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {b.quantityKg || b.quantity} {b.unit || "kg"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        {b.status || STAGES[b.statusIndex] || "CREATED"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {formatAddress(b.currentOwner || b.currentCustodian)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No batches recorded yet. Use the form above to log the first batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
