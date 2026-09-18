export default function TraceabilityPage({
  searchBatchId,
  setSearchBatchId,
  handleSearchBatch,
  batchDetails,
  batchEvents = [],
  statusPercent = 0,
  formatAddress,
  isWorking,
  IS_PLACEHOLDER,
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
    "CONSUMER_VERIFIED",
  ];

  return (
    <main className="mt-20 mb-16 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-8">
      {/* Search Section */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearchBatch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              value={searchBatchId}
              onChange={(e) => setSearchBatchId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              placeholder="Enter Batch ID (e.g. 20261001, 20262001)"
              type="text"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isWorking || IS_PLACEHOLDER}
            className="rounded-xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-800 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">travel_explore</span>
            <span>Reconstruct Journey</span>
          </button>
        </form>
      </div>

      {batchDetails ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Batch Overview & Progress */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Batch Provenance Overview</h2>
                  <p className="text-xs text-slate-500">Authenticated on-chain ledger records</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span> Verified
                </span>
              </div>

              <div className="space-y-3 text-xs divide-y divide-slate-100">
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Batch Identifier</span>
                  <span className="font-mono font-bold text-emerald-950">#{batchDetails.batchId}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Commodity Crop</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    batchDetails.cropType === 1 || batchDetails.cropType === "MAIZE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {batchDetails.cropType === 1 || batchDetails.cropType === "MAIZE" ? "Yellow Maize Grain" : "Cassava Roots"}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Farm Origin Cluster</span>
                  <span className="font-semibold text-slate-800">{batchDetails.originLocation}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Quantity</span>
                  <span className="font-bold text-slate-800">
                    {batchDetails.quantityKg || batchDetails.quantity} {batchDetails.unit || "kg"}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Quality Grade</span>
                  <span className="font-bold text-emerald-700">
                    {batchDetails.qualityGrade || "Grade A"}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Current Custodian</span>
                  <span className="font-mono text-slate-600">
                    {formatAddress(batchDetails.currentOwner || batchDetails.currentCustodian)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Lifecycle Stage</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {batchDetails.status || STAGES[batchDetails.statusIndex] || "CREATED"}
                  </span>
                </div>
              </div>

              {/* Progress Gauge */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">TRACEABILITY PROGRESS</span>
                  <span className="text-emerald-700">{statusPercent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: `${statusPercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Immutable Event Timeline */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm h-full space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Blockchain Event Journey</h2>

              <div className="relative pl-6 space-y-6 max-h-[540px] overflow-y-auto">
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-emerald-100" />

                {batchEvents.length > 0 ? (
                  batchEvents.map((evt, idx) => (
                    <div key={`${evt.txHash}-${idx}`} className="relative pl-2">
                      <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-emerald-950">{evt.type}</span>
                          <span className="rounded bg-white px-2 py-0.5 font-mono text-[10px] text-slate-500 border border-slate-200">
                            Block #{evt.blockNumber ? evt.blockNumber.toString() : "—"}
                          </span>
                        </div>
                        {evt.detail && <p className="text-slate-700">{evt.detail}</p>}
                        <div className="font-mono text-[11px] text-slate-400 truncate">
                          Tx: {evt.txHash ? `${evt.txHash.slice(0, 20)}...${evt.txHash.slice(-8)}` : "—"}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6">No on-chain events recorded for this batch yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-2">
          <span className="material-symbols-outlined text-[44px] text-slate-300">timeline</span>
          <p className="text-sm font-semibold text-slate-600">Reconstruct Provenance</p>
          <p className="text-xs max-w-sm mx-auto text-slate-400">
            Enter a Batch ID above to fetch the chronological immutable event journey across farm, storage, processing, and delivery.
          </p>
        </div>
      )}
    </main>
  );
}
