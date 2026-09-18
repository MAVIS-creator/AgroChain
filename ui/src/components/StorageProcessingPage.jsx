import { useState } from "react";

export default function StorageProcessingPage({
  isWorking,
  IS_PLACEHOLDER,
  activeAccount,
  activeRoleLabel,
  formatAddress,
  onRecordStorageReading,
  onSimulateIoT,
  onRecordProcessing,
  onRecordQualityCertificate,
  storageReadings = [],
  processingRecords = [],
  qualityRecords = [],
}) {
  // Storage state
  const [storageBatchId, setStorageBatchId] = useState("");
  const [facility, setFacility] = useState("Central Hub Silo & Cold Storage");
  const [temperature, setTemperature] = useState("24");
  const [humidity, setHumidity] = useState("65");

  // Processing state
  const [procBatchId, setProcBatchId] = useState("");
  const [outputProduct, setOutputProduct] = useState("High Quality Cassava Flour (HQCF)");
  const [outputQuantity, setOutputQuantity] = useState("");
  const [procUnit, setProcUnit] = useState("kg");
  const [procNotes, setProcNotes] = useState("");

  // Quality certification state
  const [qcBatchId, setQcBatchId] = useState("");
  const [qualityGrade, setQualityGrade] = useState("Grade A Premium");
  const [certReference, setCertReference] = useState("QC-CERT-2026-001");
  const [qcPassed, setQcPassed] = useState(true);
  const [qcNotes, setQcNotes] = useState("");

  const canStore = activeRoleLabel === "STORAGE_OPERATOR" || activeRoleLabel === "FARMER" || activeRoleLabel === "ADMINISTRATOR";
  const canProcess = activeRoleLabel === "PROCESSOR" || activeRoleLabel === "ADMINISTRATOR";
  const canCertify = activeRoleLabel === "REGULATOR" || activeRoleLabel === "EXTENSION_OFFICER" || activeRoleLabel === "ADMINISTRATOR";

  const handleStorageSubmit = (e) => {
    e.preventDefault();
    if (!storageBatchId.trim()) return;
    onRecordStorageReading({
      batchId: storageBatchId.trim(),
      facility: facility.trim(),
      temperature: Number(temperature),
      humidity: Number(humidity),
      sensorId: `DHT22-LOCAL-${storageBatchId.slice(-4)}`,
      isSimulated: true,
    });
    setStorageBatchId("");
  };

  const handleSimulateClick = () => {
    const target = storageBatchId.trim() || "20261001";
    onSimulateIoT(target, "Cassava");
  };

  const handleProcessSubmit = (e) => {
    e.preventDefault();
    if (!procBatchId.trim() || !outputQuantity.trim()) return;
    onRecordProcessing({
      batchId: procBatchId.trim(),
      outputProduct,
      outputQuantity: Number(outputQuantity),
      unit: procUnit,
      notes: procNotes.trim() || "Standard industrial processing completed.",
    });
    setProcBatchId("");
    setOutputQuantity("");
    setProcNotes("");
  };

  const handleQcSubmit = (e) => {
    e.preventDefault();
    if (!qcBatchId.trim()) return;
    onRecordQualityCertificate({
      batchId: qcBatchId.trim(),
      qualityGrade,
      certReference: certReference.trim(),
      passed: qcPassed,
      notes: qcNotes.trim() || "Complies with national food safety standards.",
    });
    setQcBatchId("");
    setQcNotes("");
  };

  return (
    <main className="mt-20 mb-16 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950">Storage & Processing Operations</h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              IoT & Value Addition
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Monitor warehouse climate telemetry, log industrial processing outputs, and record official food safety certifications.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white px-4 py-2 text-xs shadow-sm">
          <span className="text-slate-500">Your Role: </span>
          <span className="font-bold text-emerald-800">{activeRoleLabel || "None"}</span>
        </div>
      </div>

      {/* Simulation Notice Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3 text-amber-900">
        <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5">sensors</span>
        <div className="text-xs space-y-0.5">
          <span className="font-bold uppercase tracking-wider">Demonstrator Simulation Protocol: </span>
          <span>
            Storage readings are generated via local simulation endpoints. IoT sensor telemetry (temperature, humidity) demonstrates automated threshold breach detection for post-harvest loss prevention.
          </span>
        </div>
      </div>

      {/* Tri-Column Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Storage & IoT Logging */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined rounded-lg bg-teal-50 p-2 text-teal-700">thermostat</span>
              <div>
                <h3 className="font-bold text-slate-900">IoT Storage Log</h3>
                <p className="text-xs text-slate-500">Storage Operators</p>
              </div>
            </div>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Simulated</span>
          </div>

          <form onSubmit={handleStorageSubmit} className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700">Batch ID</label>
              <input
                type="text"
                placeholder="e.g. 20261001"
                value={storageBatchId}
                onChange={(e) => setStorageBatchId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Storage Facility</label>
              <input
                type="text"
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Temp (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Humidity (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                type="submit"
                disabled={isWorking || IS_PLACEHOLDER || !canStore}
                className="flex-1 rounded-xl bg-teal-700 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-all disabled:opacity-50"
              >
                Log Reading
              </button>
              <button
                type="button"
                onClick={handleSimulateClick}
                disabled={isWorking}
                title="Generate simulated readings from API"
                className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 hover:bg-teal-100 transition-all"
              >
                Simulate
              </button>
            </div>
          </form>
        </div>

        {/* 2. Processing Transformation */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-2 text-indigo-700">precision_manufacturing</span>
            <div>
              <h3 className="font-bold text-slate-900">Processing Event</h3>
              <p className="text-xs text-slate-500">Authorized Processors</p>
            </div>
          </div>

          <form onSubmit={handleProcessSubmit} className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700">Source Batch ID</label>
              <input
                type="text"
                placeholder="e.g. 20261001"
                value={procBatchId}
                onChange={(e) => setProcBatchId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Processed Output Product</label>
              <select
                value={outputProduct}
                onChange={(e) => setOutputProduct(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                <optgroup label="Cassava Products">
                  <option value="High Quality Cassava Flour (HQCF)">High Quality Cassava Flour (HQCF)</option>
                  <option value="Industrial Cassava Starch">Industrial Cassava Starch</option>
                  <option value="Premium Garri (Ijebu Grade)">Premium Garri</option>
                  <option value="Cassava Chips / Pellets">Cassava Chips / Pellets</option>
                </optgroup>
                <optgroup label="Maize Products">
                  <option value="Fortified Maize Flour">Fortified Maize Flour</option>
                  <option value="Brewery Maize Grits">Brewery Maize Grits</option>
                  <option value="Livestock Poultry Feed">Livestock Poultry Feed</option>
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Output Quantity</label>
                <input
                  type="number"
                  placeholder="e.g. 3200"
                  value={outputQuantity}
                  onChange={(e) => setOutputQuantity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Unit</label>
                <select
                  value={procUnit}
                  onChange={(e) => setProcUnit(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="tonnes">tonnes</option>
                  <option value="bags (50kg)">bags (50kg)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Processing Notes</label>
              <input
                type="text"
                placeholder="e.g. Moisture dried to 10%, sieved to 180 mesh."
                value={procNotes}
                onChange={(e) => setProcNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isWorking || IS_PLACEHOLDER || !canProcess}
              className="mt-1 w-full rounded-xl bg-indigo-700 py-2.5 text-xs font-bold text-white hover:bg-indigo-800 transition-all disabled:opacity-50"
            >
              {canProcess ? "Record Processing On-Chain" : "Restricted (Processor Role Req.)"}
            </button>
          </form>
        </div>

        {/* 3. Quality & Certification */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined rounded-lg bg-emerald-50 p-2 text-emerald-700">verified</span>
            <div>
              <h3 className="font-bold text-slate-900">Quality Certification</h3>
              <p className="text-xs text-slate-500">Regulators & Officers</p>
            </div>
          </div>

          <form onSubmit={handleQcSubmit} className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700">Target Batch ID</label>
              <input
                type="text"
                placeholder="e.g. 20261001"
                value={qcBatchId}
                onChange={(e) => setQcBatchId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Assigned Grade</label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="Grade A Premium Export">Grade A Premium Export</option>
                <option value="Grade B Standard Commercial">Grade B Standard Commercial</option>
                <option value="Industrial Processing Grade">Industrial Processing Grade</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Official Certificate Ref</label>
              <input
                type="text"
                value={certReference}
                onChange={(e) => setCertReference(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs font-semibold text-slate-700">Outcome:</label>
              <label className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                <input
                  type="radio"
                  name="passed"
                  checked={qcPassed}
                  onChange={() => setQcPassed(true)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                PASSED
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-red-700 font-bold">
                <input
                  type="radio"
                  name="passed"
                  checked={!qcPassed}
                  onChange={() => setQcPassed(false)}
                  className="text-red-600 focus:ring-red-500"
                />
                FAILED
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Safety Criteria & Notes</label>
              <input
                type="text"
                placeholder="e.g. Cyanide < 10ppm; Aflatoxin < 4ppb."
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isWorking || IS_PLACEHOLDER || !canCertify}
              className="mt-1 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-all disabled:opacity-50"
            >
              {canCertify ? "Issue Quality Certificate" : "Restricted (Regulator Role Req.)"}
            </button>
          </form>
        </div>
      </div>

      {/* Storage Telemetry Feed Table */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900">IoT Storage Telemetry Log</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              Safe: &lt;28°C / &lt;70% RH
            </span>
          </div>
          <span className="text-xs text-slate-500">{storageReadings.length} readings recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Batch ID</th>
                <th className="py-2.5 px-3 font-semibold">Facility</th>
                <th className="py-2.5 px-3 font-semibold">Temperature</th>
                <th className="py-2.5 px-3 font-semibold">Humidity</th>
                <th className="py-2.5 px-3 font-semibold">Threshold Check</th>
                <th className="py-2.5 px-3 font-semibold">Time Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {storageReadings.length > 0 ? (
                storageReadings.map((reading, idx) => {
                  const isTempHigh = reading.temperature > 28;
                  const isHumHigh = reading.humidity > 70;
                  const isBreach = isTempHigh || isHumHigh;

                  return (
                    <tr key={reading.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-emerald-950">{reading.batchId}</td>
                      <td className="py-2.5 px-3 text-slate-700">{reading.facility}</td>
                      <td className={`py-2.5 px-3 font-semibold ${isTempHigh ? "text-red-700 font-bold" : "text-slate-700"}`}>
                        {reading.temperature}°C
                      </td>
                      <td className={`py-2.5 px-3 font-semibold ${isHumHigh ? "text-red-700 font-bold" : "text-slate-700"}`}>
                        {reading.humidity}% RH
                      </td>
                      <td className="py-2.5 px-3">
                        {isBreach ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                            <span className="material-symbols-outlined text-[12px]">warning</span> Threshold Breach
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span> Optimal
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {new Date(reading.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No storage telemetry recorded yet. Use the storage logger or trigger a simulated observation.
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
