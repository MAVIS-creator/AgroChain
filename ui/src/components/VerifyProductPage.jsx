import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

export default function VerifyProductPage({
  searchBatchId,
  setSearchBatchId,
  handleSearchBatch,
  batchDetails,
  batchEvents = [],
  isWorking,
  formatAddress,
  isGanacheReady,
  onBackHome,
  variant = "public",
}) {
  const isWorkspace = variant === "workspace";
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const verificationUrl = useMemo(() => {
    const id = batchDetails?.batchId || searchBatchId;
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("page", "verify");
    if (id) url.searchParams.set("batchId", id);
    return url.toString();
  }, [batchDetails?.batchId, searchBatchId]);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: "M", margin: 2, width: 240 })
      .then((dataUrl) => { if (!cancelled) setQrDataUrl(dataUrl); })
      .catch(() => { if (!cancelled) setQrDataUrl(""); });
    return () => { cancelled = true; };
  }, [verificationUrl]);

  const handleCopyLink = async () => {
    if (!navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className={isWorkspace ? "mt-8 mb-16 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-8" : "mt-20 mb-16 max-w-5xl mx-auto px-4 sm:px-6 w-full space-y-8"}>
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="mb-5 flex justify-start">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            {isWorkspace ? "Back to Dashboard" : "Back to Home"}
          </button>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>{isWorkspace ? "Product Verification Workspace" : "Public Consumer Verification Portal"}</span>
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
            disabled={isWorking || !isGanacheReady}
            className="rounded-xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-800 transition-all shadow-sm shrink-0 disabled:opacity-50"
          >
            Verify Batch
          </button>
        </form>
        <div className={`mt-3 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold ${
          isGanacheReady
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-800"
        }`}>
          <span className="material-symbols-outlined text-[16px]">
            {isGanacheReady ? "cloud_done" : "cloud_off"}
          </span>
          <span>
            {isGanacheReady
              ? "Blockchain verification service is online."
              : "Verification is temporarily unavailable because the local blockchain is offline. Start Ganache on port 7545."}
          </span>
        </div>
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
                  Batch record found on the configured blockchain
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
                  {batchDetails.qualityGrade || "No quality grade recorded"}
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
                {qrDataUrl ? <img src={qrDataUrl} alt={`QR code linking to verification for batch ${batchDetails.batchId}`} className="h-36 w-36" /> : <span className="flex h-36 w-36 items-center justify-center text-xs text-slate-500">Preparing QR code…</span>}
              </div>
              <span className="mt-3 font-mono text-[11px] font-bold text-emerald-950">
                AGROCHAIN-QR-{batchDetails.batchId}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Opens this AgroChain app’s verification page
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
