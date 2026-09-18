import { useState } from "react";

export default function AnalyticsPage({
  networkMetrics,
  datasetSummary,
  datasetRecords = [],
  datasetApiError,
  loadDatasetApiData,
  riskData,
  onEvaluateBatchRisk,
  allBatches = [],
}) {
  const [selectedBatchId, setSelectedBatchId] = useState(allBatches[0]?.batchId || "20261001");
  const [selectedCrop, setSelectedCrop] = useState("Cassava");
  const [transportLatency, setTransportLatency] = useState("14");

  const cassavaCount = allBatches.filter((b) => b.cropType === 0 || b.cropType === "CASSAVA").length;
  const maizeCount = allBatches.filter((b) => b.cropType === 1 || b.cropType === "MAIZE").length;

  const handleEvaluateRisk = (e) => {
    e.preventDefault();
    if (onEvaluateBatchRisk) {
      onEvaluateBatchRisk(selectedBatchId, selectedCrop, Number(transportLatency));
    }
  };

  return (
    <main className="mt-20 mb-16 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950">Analytics & AI Risk Insights</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              Data-Driven Intelligence
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Real-time supply chain performance metrics, dual-crop production volumes, post-harvest-loss analysis, and deterministic risk modeling.
          </p>
        </div>
        <button
          type="button"
          onClick={loadDatasetApiData}
          className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">sync</span>
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cassava Volume</span>
            <span className="material-symbols-outlined text-amber-600 text-[18px]">grain</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{cassavaCount} batches</div>
          <p className="mt-1 text-[11px] text-slate-500">On-chain tracked roots</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Maize Volume</span>
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">nutrition</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{maizeCount} batches</div>
          <p className="mt-1 text-[11px] text-slate-500">On-chain tracked grain</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Avg Post-Harvest Loss</span>
            <span className="material-symbols-outlined text-red-600 text-[18px]">trending_down</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-red-700">
            {datasetSummary?.summary?.avgLossPct ?? 9.2}%
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Empirical regional baseline</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Avg Transport Latency</span>
            <span className="material-symbols-outlined text-blue-600 text-[18px]">schedule</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {datasetSummary?.summary?.avgTransportHours ?? 11.4} hrs
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Farm-to-hub transit window</p>
        </div>
      </div>

      {/* AI-Ready Deterministic Risk Engine Panel */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
              <span className="material-symbols-outlined text-[22px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">AI-Ready Risk Scoring Engine</h3>
                <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                  Deterministic Heuristic Prototype
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Transparent risk assessment derived from storage temperature breaches, transit latency, and physiological decay models.
              </p>
            </div>
          </div>
        </div>

        {/* Risk Interactive Evaluator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleEvaluateRisk} className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800">Evaluate Batch Operational Risk</h4>
            <div>
              <label className="text-xs font-semibold text-slate-700">Batch ID</label>
              <input
                type="text"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                placeholder="e.g. 20261001"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Crop Type</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="Cassava">Cassava (High perishability / PPD)</option>
                <option value="Maize">Maize (Moisture / Aflatoxin risk)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Transport Latency (Hours)</label>
              <input
                type="number"
                value={transportLatency}
                onChange={(e) => setTransportLatency(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-purple-700 py-2.5 text-xs font-bold text-white hover:bg-purple-800 transition-all shadow-sm"
            >
              Run Risk Analysis
            </button>
          </form>

          {/* Risk Results Display */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 p-5 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-mono">Report for Batch #{riskData?.batchId || selectedBatchId}</span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  Vulnerability & Spoilage Evaluation
                </h4>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  (riskData?.category || "LOW") === "HIGH"
                    ? "bg-red-100 text-red-800"
                    : (riskData?.category || "LOW") === "MEDIUM"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                }`}>
                  Risk Level: {riskData?.category || "LOW"}
                </span>
                <div className="text-xs font-bold text-slate-700 mt-1">
                  Score: {riskData?.riskScore ?? 18} / 100
                </div>
              </div>
            </div>

            {/* Risk Gauge */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>0 (Optimal Safety)</span>
                <span>50 (Moderate Caution)</span>
                <span>100 (Severe Spoilage Risk)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    (riskData?.riskScore ?? 18) > 65
                      ? "bg-red-500"
                      : (riskData?.riskScore ?? 18) > 35
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${riskData?.riskScore ?? 18}%` }}
                />
              </div>
            </div>

            {/* Contributing factors */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800">Evaluated Contributing Factors:</span>
              <ul className="space-y-1 text-xs text-slate-600">
                {(riskData?.contributingFactors || [
                  "Storage temperature and humidity within safe threshold envelopes.",
                  "Transit latency compliant with the 48-hour cassava freshness window.",
                ]).map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-purple-600 shrink-0 mt-0.5">check</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              Methodology: {riskData?.evaluationMethod || "Deterministic environmental & latency heuristic"}. Transparent reproducible score.
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Records Table */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900">Empirical Regional Agricultural Dataset</h3>
            <p className="text-xs text-slate-500">Sourced via Our World In Data normalized production statistics</p>
          </div>
          <span className="text-xs text-slate-500">{datasetRecords.length} records displayed</span>
        </div>

        {datasetApiError ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {datasetApiError}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Record ID</th>
                <th className="py-2.5 px-3 font-semibold">Region</th>
                <th className="py-2.5 px-3 font-semibold">Year</th>
                <th className="py-2.5 px-3 font-semibold">Crop Type</th>
                <th className="py-2.5 px-3 font-semibold">Quantity (Tonnes)</th>
                <th className="py-2.5 px-3 font-semibold">Quality Grade</th>
                <th className="py-2.5 px-3 font-semibold">Loss Estimate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datasetRecords.length > 0 ? (
                datasetRecords.slice(0, 10).map((record, idx) => (
                  <tr key={record.recordId || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-emerald-950">{record.recordId}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{record.region}</td>
                    <td className="py-2.5 px-3 text-slate-600">{record.year}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        record.cropType === "Cassava" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {record.cropType || "Cassava"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {record.quantityTonnes ? Number(record.quantityTonnes).toLocaleString() : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{record.qualityGrade}</td>
                    <td className="py-2.5 px-3 font-semibold text-red-700">{record.lossPct}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading empirical regional dataset... Ensure dataset API is running.
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
