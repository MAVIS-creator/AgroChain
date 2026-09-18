import { useState } from "react";

export default function LogisticsPage({
  isWorking,
  IS_PLACEHOLDER,
  activeAccount,
  activeRoleLabel,
  formatAddress,
  onCreateShipment,
  onConfirmDelivery,
  shipmentsList = [],
}) {
  const [shipmentId, setShipmentId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [transporterAddress, setTransporterAddress] = useState("");
  const [originLocation, setOriginLocation] = useState("Oyo Farm Cluster Hub");
  const [destination, setDestination] = useState("Lagos Port / Industrial Mill");

  const [confirmShipmentId, setConfirmShipmentId] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  const canCreateShipment = activeRoleLabel === "TRANSPORTER" || activeRoleLabel === "DISTRIBUTOR" || activeRoleLabel === "ADMINISTRATOR" || activeRoleLabel === "FARMER";

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!shipmentId.trim() || !batchId.trim() || !transporterAddress.trim()) return;
    onCreateShipment({
      shipmentId: Number(shipmentId),
      batchId: Number(batchId),
      transporter: transporterAddress.trim(),
      originLocation: originLocation.trim(),
      destination: destination.trim(),
    });
    setShipmentId("");
    setBatchId("");
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!confirmShipmentId.trim() || !recipientAddress.trim()) return;
    onConfirmDelivery({
      shipmentId: Number(confirmShipmentId),
      recipient: recipientAddress.trim(),
    });
    setConfirmShipmentId("");
    setRecipientAddress("");
  };

  return (
    <main className="mt-20 mb-16 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950">Logistics & Transportation</h1>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              Chain of Custody
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Dispatch shipments, transfer custody to authorized transporters, and log immutable proof of delivery.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white px-4 py-2 text-xs shadow-sm">
          <span className="text-slate-500">Your Role: </span>
          <span className="font-bold text-emerald-800">{activeRoleLabel || "None"}</span>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Create & Dispatch Shipment */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined rounded-lg bg-emerald-50 p-2 text-emerald-700">local_shipping</span>
            <div>
              <h3 className="font-bold text-slate-900">Create & Dispatch Shipment</h3>
              <p className="text-xs text-slate-500">Transporters & Distributors</p>
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Shipment ID</label>
                <input
                  type="number"
                  placeholder="e.g. 9001"
                  value={shipmentId}
                  onChange={(e) => setShipmentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Batch ID</label>
                <input
                  type="number"
                  placeholder="e.g. 20261001"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Transporter Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={transporterAddress}
                onChange={(e) => setTransporterAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Origin Location</label>
                <input
                  type="text"
                  value={originLocation}
                  onChange={(e) => setOriginLocation(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isWorking || IS_PLACEHOLDER || !canCreateShipment}
              className="mt-2 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-all disabled:opacity-50"
            >
              Dispatch Shipment (Stage -> IN_TRANSIT)
            </button>
          </form>
        </div>

        {/* 2. Confirm Delivery & Transfer Custody */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined rounded-lg bg-blue-50 p-2 text-blue-700">done_all</span>
            <div>
              <h3 className="font-bold text-slate-900">Confirm Delivery</h3>
              <p className="text-xs text-slate-500">Transporters & Recipients</p>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Confirm receipt of dispatched shipment at destination facility. Advances the batch lifecycle to DELIVERED and updates custody.
          </p>

          <form onSubmit={handleConfirmSubmit} className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-slate-700">Shipment ID</label>
              <input
                type="number"
                placeholder="e.g. 9001"
                value={confirmShipmentId}
                onChange={(e) => setConfirmShipmentId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Recipient / Consignee Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isWorking || IS_PLACEHOLDER}
              className="mt-4 w-full rounded-xl bg-blue-700 py-2.5 text-xs font-bold text-white hover:bg-blue-800 transition-all disabled:opacity-50"
            >
              Confirm Delivery (Stage -> DELIVERED)
            </button>
          </form>
        </div>
      </div>

      {/* Active Shipments Tracker Table */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="font-bold text-base text-slate-900">Active Supply Chain Shipments</h3>
          <span className="text-xs text-slate-500">{shipmentsList.length} total shipments tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Shipment #</th>
                <th className="py-2.5 px-3 font-semibold">Batch #</th>
                <th className="py-2.5 px-3 font-semibold">Transporter</th>
                <th className="py-2.5 px-3 font-semibold">Origin</th>
                <th className="py-2.5 px-3 font-semibold">Destination</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shipmentsList.length > 0 ? (
                shipmentsList.map((item, idx) => (
                  <tr key={item.shipmentId || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-emerald-950">#{item.shipmentId}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">#{item.batchId}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{formatAddress(item.transporter)}</td>
                    <td className="py-2.5 px-3 text-slate-700">{item.originLocation}</td>
                    <td className="py-2.5 px-3 text-slate-700">{item.destination}</td>
                    <td className="py-2.5 px-3">
                      {item.status === 2 || item.status === "DELIVERED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span> DELIVERED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          <span className="material-symbols-outlined text-[12px]">schedule</span> IN TRANSIT
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active shipments logged yet. Use the dispatch form above to move batches through the value chain.
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
