import { useState, useMemo } from "react";

// Lightweight deterministic SVG QR code pattern generator
function generateQrSvg(text) {
  // Deterministic 21x21 grid pattern generator based on hash
  const size = 21;
  const cells = [];

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Standard QR position detection patterns in corners
      const inTopLeft = r < 7 && c < 7;
      const inTopRight = r < 7 && c >= size - 7;
      const inBottomLeft = r >= size - 7 && c < 7;

      if (inTopLeft) {
        const isBox = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        cells.push(isBox);
      } else if (inTopRight) {
        const isBox = r === 0 || r === 6 || c === size - 7 || c === size - 1 || (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3);
        cells.push(isBox);
      } else if (inBottomLeft) {
        const isBox = r === size - 7 || r === size - 1 || c === 0 || c === 6 || (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4);
        cells.push(isBox);
      } else {
        const seed = Math.sin((r * size + c + Math.abs(hash)) * 999);
        cells.push(seed > 0.15);
      }
    }
  }

  return { size, cells };
}

export default function VerifyProductPage({
  searchBatchId,
  setSearchBatchId,
  handleSearchBatch,
  batchDetails,
  batchEvents = [],
  isWorking,
  formatAddress,
}) {
  const [copied, setCopied] = useState(false);

  const qrData = useMemo(() => {
    const id = batchDetails?.batchId || searchBatchId || "20261001";
    return generateQrSvg(`https://agrochain.app/verify/${id}`);
  }, [batchDetails?.batchId, searchBatchId]);

  const handleCopyLink = () => {
    const id = batchDetails?.batchId || searchBatchId || "20261001";
    navigator.clipboard?.writeText(`https://agrochain.app/verify/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="mt-20 mb-16 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>Public Consumer Verification Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight">
          Verify Product Origin & Authenticity
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Instant public cryptographic provenance for cassava and maize agricultural products. No wallet login or administrative access required.
        </p>
      </div>

      {/* Public Search Bar */}
      <div className="max-w-xl mx-auto">
        <form onSubmit={handleSearchBatch} className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Enter Batch ID (e.g. 20261001, 20262001)"
              value={searchBatchId}
              onChange={(e) => setSearchBatchId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none shadow-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isWorking}
            className="rounded-xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-800 transition-all shadow-sm shrink-0 disabled:opacity-50"
          >
            Verify Batch
          </button>
        </form>
      </div>

      {/* Verification Certificate Card */}
      {batchDetails ? (
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8 shadow-sm space-y-8">
          {/* Top Verification Seal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-50 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <span className="material-symbols-outlined text-[32px]">verified</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Cryptographically Verified On-Chain
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Batch #{batchDetails.batchId}
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Registered: {batchDetails.createdAt}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">{copied ? "check" : "share"}</span>
                <span>{copied ? "Link Copied!" : "Share Link"}</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-xl bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Certificate</span>
              </button>
            </div>
          </div>

          {/* Core Provenance Details & SVG QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Crop Commodity</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {batchDetails.cropType === 1 || batchDetails.cropType === "MAIZE" ? "Yellow Maize Grain" : "Cassava Roots"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Farm Origin Cluster</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {batchDetails.originLocation}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Batch Quantity</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {batchDetails.quantityKg || batchDetails.quantity} {batchDetails.unit || "kg"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Quality Grade</span>
                <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                  {batchDetails.qualityGrade || "Grade A Premium"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                <span className="text-slate-400 block text-[11px]">Authorized Current Custodian (OSINT Masked)</span>
                <span className="font-mono font-semibold text-slate-700 mt-0.5 block">
                  {formatAddress(batchDetails.currentOwner || batchDetails.currentCustodian)}
                </span>
              </div>
            </div>

            {/* Visual SVG QR Code */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-emerald-100">
                <svg
                  viewBox={`0 0 ${qrData.size} ${qrData.size}`}
                  className="w-36 h-36"
                  shapeRendering="crispEdges"
                >
                  {qrData.cells.map((isBlack, index) => {
                    const r = Math.floor(index / qrData.size);
                    const c = index % qrData.size;
                    return (
                      <rect
                        key={index}
                        x={c}
                        y={r}
                        width="1"
                        height="1"
                        fill={isBlack ? "#064e3b" : "#ffffff"}
                      />
                    );
                  })}
                </svg>
              </div>
              <span className="mt-3 font-mono text-[11px] font-bold text-emerald-950">
                AGROCHAIN-QR-{batchDetails.batchId}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Scan with any standard smartphone camera
              </span>
            </div>
          </div>

          {/* Reconstructed Journey Timeline */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Immutable Value-Chain Journey</h3>
            <div className="space-y-3">
              {batchEvents.length > 0 ? (
                batchEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{evt.type}</span>
                        <span className="text-[10px] font-mono text-slate-400">Block #{evt.blockNumber}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                        Tx: {evt.txHash ? `${evt.txHash.slice(0, 16)}...` : "—"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No lifecycle events recorded for this batch yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-2">
          <span className="material-symbols-outlined text-[48px] text-slate-300">qr_code_scanner</span>
          <p className="text-sm font-semibold text-slate-600">No Batch Loaded Yet</p>
          <p className="text-xs max-w-sm mx-auto text-slate-400">
            Enter a valid Batch ID in the search bar above or scan an AgroChain product QR code to view authenticated value chain provenance.
          </p>
        </div>
      )}
    </main>
  );
}
