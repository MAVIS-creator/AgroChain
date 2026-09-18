import { useState } from "react";

export default function InputsPage({
  isWorking,
  IS_PLACEHOLDER,
  activeAccount,
  activeRoleLabel,
  formatAddress,
  onRegisterInput,
  onVerifyInput,
  onLinkInput,
  inputsList = [],
}) {
  const [inputId, setInputId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [inputType, setInputType] = useState("Certified Seed");
  const [cropApplicability, setCropApplicability] = useState(0); // 0 = Cassava, 1 = Maize
  const [certReference, setCertReference] = useState("");

  const [verifyId, setVerifyId] = useState("");
  const [linkBatchId, setLinkBatchId] = useState("");
  const [linkInputId, setLinkInputId] = useState("");

  const canRegister = activeRoleLabel === "INPUT_SUPPLIER" || activeRoleLabel === "ADMINISTRATOR";
  const canVerify = activeRoleLabel === "REGULATOR" || activeRoleLabel === "EXTENSION_OFFICER" || activeRoleLabel === "ADMINISTRATOR";

  const handleRegister = (e) => {
    e.preventDefault();
    if (!inputId.trim() || !supplierName.trim()) return;
    onRegisterInput({
      inputId: inputId.trim(),
      supplierName: supplierName.trim(),
      inputType,
      cropApplicability: Number(cropApplicability),
      certReference: certReference.trim() || "CERT-NASC-STD",
    });
    setInputId("");
    setSupplierName("");
    setCertReference("");
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verifyId.trim()) return;
    onVerifyInput(verifyId.trim());
    setVerifyId("");
  };

  const handleLink = (e) => {
    e.preventDefault();
    if (!linkBatchId.trim() || !linkInputId.trim()) return;
    onLinkInput(linkBatchId.trim(), linkInputId.trim());
    setLinkBatchId("");
    setLinkInputId("");
  };

  return (
    <main className="mt-20 mb-16 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950">Agro-Input Authenticity</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              Verified Registry
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Verify certified seeds, disease-resistant stem cuttings, and organic fertilizers before linking them to harvest batches.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white px-4 py-2 text-xs shadow-sm">
          <span className="text-slate-500">Your Role: </span>
          <span className="font-bold text-emerald-800">{activeRoleLabel || "None"}</span>
        </div>
      </div>

      {/* Action Grid: Register, Verify, Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Register Input */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined rounded-lg bg-emerald-50 p-2 text-emerald-700">app_registration</span>
            <div>
              <h3 className="font-bold text-slate-900">Register Agro-Input</h3>
              <p className="text-xs text-slate-500">Input Suppliers & Admins</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Input Unique ID</label>
              <input
                type="text"
                placeholder="e.g. SEED-MZ-2026-09"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Supplier Name / Org</label>
              <input
                type="text"
                placeholder="e.g. Premier Seeds Ltd"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Input Category</label>
                <select
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Certified Hybrid Seed">Certified Hybrid Seed</option>
                  <option value="Disease-Resistant Stem Cuttings">Stem Cuttings</option>
                  <option value="Organic Soil Fertilizer">Organic Fertilizer</option>
                  <option value="Crop Protection">Crop Protection</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Applicability</label>
                <select
                  value={cropApplicability}
                  onChange={(e) => setCropApplicability(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value={0}>Cassava</option>
                  <option value={1}>Maize</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Certification Reference</label>
              <input
                type="text"
                placeholder="e.g. NASC-CERT-2026-81"
                value={certReference}
                onChange={(e) => setCertReference(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isWorking || IS_PLACEHOLDER || !canRegister}
              className="mt-2 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-all disabled:opacity-50"
            >
              {canRegister ? "Register On-Chain" : "Restricted (Input Supplier Role Req.)"}
            </button>
          </form>
        </div>

        {/* Card 2: Regulatory Verification */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined rounded-lg bg-blue-50 p-2 text-blue-700">verified_user</span>
            <div>
              <h3 className="font-bold text-slate-900">Input Verification</h3>
              <p className="text-xs text-slate-500">Regulators & Extension Officers</p>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Regulators certify compliance with national standards (e.g. NASC, SON). Once verified, inputs carry cryptographic proof.
          </p>

          <form onSubmit={handleVerify} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Input ID to Verify</label>
              <input
                type="text"
                placeholder="e.g. SEED-MZ-2026-09"
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-[11px] text-blue-800">
              Verifying commits an on-chain stamp recording your authority address and timestamp.
            </div>

            <button
              type="submit"
              disabled={isWorking || IS_PLACEHOLDER || !canVerify}
              className="w-full rounded-xl bg-blue-700 py-2.5 text-xs font-bold text-white hover:bg-blue-800 transition-all disabled:opacity-50"
            >
              {canVerify ? "Certify & Verify Input" : "Restricted (Regulator Role Req.)"}
            </button>
          </form>
        </div>

        {/* Card 3: Link Input to Batch */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined rounded-lg bg-amber-50 p-2 text-amber-700">link</span>
            <div>
              <h3 className="font-bold text-slate-900">Link Input to Batch</h3>
              <p className="text-xs text-slate-500">Farmers & Custodians</p>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Link verified agro-inputs to your farm crop batch to establish complete provenance and advance lifecycle to INPUT_VERIFIED.
          </p>

          <form onSubmit={handleLink} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700">Target Batch ID</label>
              <input
                type="text"
                placeholder="e.g. 20261001"
                value={linkBatchId}
                onChange={(e) => setLinkBatchId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Agro-Input ID</label>
              <input
                type="text"
                placeholder="e.g. SEED-MZ-2026-09"
                value={linkInputId}
                onChange={(e) => setLinkInputId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isWorking || IS_PLACEHOLDER}
              className="w-full rounded-xl bg-amber-700 py-2.5 text-xs font-bold text-white hover:bg-amber-800 transition-all disabled:opacity-50"
            >
              Link Input to Provenance
            </button>
          </form>
        </div>
      </div>

      {/* Input Records Table */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="font-bold text-base text-slate-900">Registered Agro-Inputs Audit Log</h3>
          <span className="text-xs text-slate-500">{inputsList.length} registered inputs on record</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Input ID</th>
                <th className="py-2.5 px-3 font-semibold">Supplier</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Crop</th>
                <th className="py-2.5 px-3 font-semibold">Cert Ref</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inputsList.length > 0 ? (
                inputsList.map((item, idx) => (
                  <tr key={item.inputId || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-emerald-950">{item.inputId}</td>
                    <td className="py-2.5 px-3 text-slate-700">{item.supplierName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.inputType}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.cropApplicability === 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {item.cropApplicability === 0 ? "Cassava" : "Maize"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{item.certReference || "—"}</td>
                    <td className="py-2.5 px-3">
                      {item.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          <span className="material-symbols-outlined text-[12px]">pending</span> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No agro-inputs registered yet. Use the form above to register certified seeds or fertilizers.
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
