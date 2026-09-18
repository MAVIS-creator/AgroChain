import { useState } from "react";

export default function MarketplacePage({
  isWorking,
  IS_PLACEHOLDER,
  activeAccount,
  activeRoleLabel,
  formatAddress,
  onCreateListing,
  onCreateOrder,
  onRecordPayment,
  onIssueInsurancePolicy,
  onFileInsuranceClaim,
  onSettleInsuranceClaim,
  listingsList = [],
  ordersList = [],
  policiesList = [],
}) {
  const [activeTab, setActiveTab] = useState("listings"); // listings, orders, insurance

  // Listing form state
  const [listId, setListId] = useState("");
  const [listBatchId, setListBatchId] = useState("");
  const [listQty, setListQty] = useState("");
  const [listUnit, setListUnit] = useState("kg");
  const [listPrice, setListPrice] = useState("380");
  const [listLocation, setListLocation] = useState("Oyo Agricultural Hub");
  const [listGrade, setListGrade] = useState("Grade A Premium");

  // Order form state
  const [orderId, setOrderId] = useState("");
  const [orderListingId, setOrderListingId] = useState("");
  const [orderQty, setOrderQty] = useState("");

  // Payment simulation state
  const [payId, setPayId] = useState("");
  const [payOrderId, setPayOrderId] = useState("");
  const [payeeAddr, setPayeeAddr] = useState("");
  const [payAmount, setPayAmount] = useState("");

  // Insurance form state
  const [policyId, setPolicyId] = useState("");
  const [insBatchId, setInsBatchId] = useState("");
  const [beneficiaryAddr, setBeneficiaryAddr] = useState("");
  const [coverageAmt, setCoverageAmt] = useState("1500000");

  const [claimPolicyId, setClaimPolicyId] = useState("");
  const [claimReason, setClaimReason] = useState("");

  const canList = activeRoleLabel === "FARMER" || activeRoleLabel === "PROCESSOR" || activeRoleLabel === "ADMINISTRATOR";
  const canInsure = activeRoleLabel === "FINANCIAL_INSTITUTION" || activeRoleLabel === "ADMINISTRATOR";

  const handleCreateListingSubmit = (e) => {
    e.preventDefault();
    if (!listId.trim() || !listBatchId.trim() || !listQty.trim() || !listPrice.trim()) return;
    onCreateListing({
      listingId: Number(listId),
      batchId: Number(listBatchId),
      quantity: Number(listQty),
      unit: listUnit,
      pricePerUnit: Number(listPrice),
      location: listLocation.trim(),
      qualityGrade: listGrade,
    });
    setListId("");
    setListBatchId("");
    setListQty("");
  };

  const handleCreateOrderSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim() || !orderListingId.trim() || !orderQty.trim()) return;
    onCreateOrder({
      orderId: Number(orderId),
      listingId: Number(orderListingId),
      quantity: Number(orderQty),
    });
    setOrderId("");
    setOrderListingId("");
    setOrderQty("");
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!payId.trim() || !payOrderId.trim() || !payeeAddr.trim() || !payAmount.trim()) return;
    onRecordPayment({
      paymentId: Number(payId),
      orderId: Number(payOrderId),
      payee: payeeAddr.trim(),
      amount: Number(payAmount),
      settlementUnit: "SIM-NGN",
    });
    setPayId("");
    setPayOrderId("");
    setPayeeAddr("");
    setPayAmount("");
  };

  const handleIssuePolicySubmit = (e) => {
    e.preventDefault();
    if (!policyId.trim() || !insBatchId.trim() || !beneficiaryAddr.trim()) return;
    onIssueInsurancePolicy({
      policyId: Number(policyId),
      batchId: Number(insBatchId),
      beneficiary: beneficiaryAddr.trim(),
      coverageAmount: Number(coverageAmt),
    });
    setPolicyId("");
    setInsBatchId("");
    setBeneficiaryAddr("");
  };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (!claimPolicyId.trim() || !claimReason.trim()) return;
    onFileInsuranceClaim(Number(claimPolicyId), claimReason.trim());
    setClaimPolicyId("");
    setClaimReason("");
  };

  return (
    <main className="mt-20 mb-16 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950">Marketplace & Settlement</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              Procurement & Coverage
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Facilitate direct B2B trading between producers and processors with auditable simulated settlement and risk insurance.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white px-4 py-2 text-xs shadow-sm">
          <span className="text-slate-500">Your Role: </span>
          <span className="font-bold text-emerald-800">{activeRoleLabel || "None"}</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("listings")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "listings" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Market Listings & Orders
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "payments" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Simulated Payments ({ordersList.length} Orders)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("insurance")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "insurance" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Simulated Agricultural Insurance
        </button>
      </div>

      {/* Tab 1: Listings & Orders */}
      {activeTab === "listings" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Listing Form */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined rounded-lg bg-emerald-50 p-2 text-emerald-700">storefront</span>
                <div>
                  <h3 className="font-bold text-slate-900">Create Crop Listing</h3>
                  <p className="text-xs text-slate-500">Farmers & Processors</p>
                </div>
              </div>

              <form onSubmit={handleCreateListingSubmit} className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Listing ID</label>
                    <input
                      type="number"
                      placeholder="e.g. 501"
                      value={listId}
                      onChange={(e) => setListId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Linked Batch ID</label>
                    <input
                      type="number"
                      placeholder="e.g. 20261001"
                      value={listBatchId}
                      onChange={(e) => setListBatchId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-700">Quantity</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={listQty}
                      onChange={(e) => setListQty(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Unit</label>
                    <select
                      value={listUnit}
                      onChange={(e) => setListUnit(e.target.value)}
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
                    <label className="text-xs font-semibold text-slate-700">Price Per Unit (SIM-NGN)</label>
                    <input
                      type="number"
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Quality Grade</label>
                    <select
                      value={listGrade}
                      onChange={(e) => setListGrade(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="Grade A Premium">Grade A Premium</option>
                      <option value="Grade B Standard">Grade B Standard</option>
                      <option value="Industrial Grade">Industrial Grade</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Storage / Pickup Location</label>
                  <input
                    type="text"
                    value={listLocation}
                    onChange={(e) => setListLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isWorking || IS_PLACEHOLDER || !canList}
                  className="mt-2 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-all disabled:opacity-50"
                >
                  {canList ? "Publish Marketplace Listing" : "Restricted (Farmer / Processor Role Req.)"}
                </button>
              </form>
            </div>

            {/* Procurement Order Form */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined rounded-lg bg-blue-50 p-2 text-blue-700">shopping_cart</span>
                <div>
                  <h3 className="font-bold text-slate-900">Place Procurement Order</h3>
                  <p className="text-xs text-slate-500">Processors, Distributors & Retailers</p>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Purchase directly from authenticated producers. Placing an order freezes availability and creates a verifiable procurement contract.
              </p>

              <form onSubmit={handleCreateOrderSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Order ID</label>
                  <input
                    type="number"
                    placeholder="e.g. 801"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Target Listing ID</label>
                  <input
                    type="number"
                    placeholder="e.g. 501"
                    value={orderListingId}
                    onChange={(e) => setOrderListingId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Quantity to Procure</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={orderQty}
                    onChange={(e) => setOrderQty(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isWorking || IS_PLACEHOLDER}
                  className="mt-4 w-full rounded-xl bg-blue-700 py-2.5 text-xs font-bold text-white hover:bg-blue-800 transition-all disabled:opacity-50"
                >
                  Create Procurement Order
                </button>
              </form>
            </div>
          </div>

          {/* Active Listings Table */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="font-bold text-base text-slate-900">Active Crop Listings</h3>
              <span className="text-xs text-slate-500">{listingsList.length} items listed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Listing ID</th>
                    <th className="py-2.5 px-3 font-semibold">Batch #</th>
                    <th className="py-2.5 px-3 font-semibold">Crop</th>
                    <th className="py-2.5 px-3 font-semibold">Quantity</th>
                    <th className="py-2.5 px-3 font-semibold">Price / Unit</th>
                    <th className="py-2.5 px-3 font-semibold">Grade</th>
                    <th className="py-2.5 px-3 font-semibold">Seller</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listingsList.length > 0 ? (
                    listingsList.map((item, idx) => (
                      <tr key={item.listingId || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-emerald-950">#{item.listingId}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">#{item.batchId}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.cropType === 0 || item.cropType === "CASSAVA" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {item.cropType === 0 || item.cropType === "CASSAVA" ? "Cassava" : "Maize"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{item.quantity} {item.unit}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-700">₦{item.pricePerUnit} / {item.unit}</td>
                        <td className="py-2.5 px-3 text-slate-600">{item.qualityGrade}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{formatAddress(item.seller)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No marketplace listings active yet. Use the form above to list cassava or maize batches.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Simulated Payments */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 flex items-start gap-3 text-blue-900">
            <span className="material-symbols-outlined text-blue-700 shrink-0 mt-0.5">paid</span>
            <div className="text-xs space-y-0.5">
              <span className="font-bold uppercase tracking-wider">Simulated Settlement Notice: </span>
              <span>
                Demonstrator digital settlement occurs in SIM-NGN test units. No actual fiat or cryptocurrency funds are debited. All transactions record cryptographic proof of procurement settlement.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Record Payment Form */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined rounded-lg bg-emerald-50 p-2 text-emerald-700">account_balance</span>
                <div>
                  <h3 className="font-bold text-slate-900">Execute Settlement</h3>
                  <p className="text-xs text-slate-500">Order Buyer</p>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Payment ID</label>
                    <input
                      type="number"
                      placeholder="e.g. 7001"
                      value={payId}
                      onChange={(e) => setPayId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Target Order ID</label>
                    <input
                      type="number"
                      placeholder="e.g. 801"
                      value={payOrderId}
                      onChange={(e) => setPayOrderId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Payee Wallet Address (Seller)</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={payeeAddr}
                    onChange={(e) => setPayeeAddr(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Settlement Amount (SIM-NGN)</label>
                  <input
                    type="number"
                    placeholder="e.g. 875000"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isWorking || IS_PLACEHOLDER}
                  className="mt-2 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-all disabled:opacity-50"
                >
                  Record & Settle Payment (Simulated)
                </button>
              </form>
            </div>

            {/* Orders summary */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900">Orders Awaiting / In Settlement</h3>
              <div className="overflow-y-auto max-h-[320px] space-y-2">
                {ordersList.length > 0 ? (
                  ordersList.map((order, idx) => (
                    <div key={order.orderId || idx} className="rounded-xl border border-slate-100 p-3 bg-slate-50/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">Order #{order.orderId} (Batch #{order.batchId})</div>
                        <div className="text-slate-500 font-mono text-[11px]">Buyer: {formatAddress(order.buyer)}</div>
                        <div className="text-emerald-800 font-semibold mt-0.5">Qty: {order.quantity} | Total: ₦{order.totalPrice}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.status === 2 || order.status === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {order.status === 2 || order.status === "PAID" ? "PAID" : "PLACED"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No procurement orders placed yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Simulated Insurance */}
      {activeTab === "insurance" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3 text-amber-900">
            <span className="material-symbols-outlined text-amber-600 shrink-0 mt-0.5">security</span>
            <div className="text-xs space-y-0.5">
              <span className="font-bold uppercase tracking-wider">Simulated Insurance Record: </span>
              <span>
                Demonstrator crop insurance coverage policies and indemnity claims are managed locally on-chain. No third-party underwriting integration is claimed.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issue Policy */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined rounded-lg bg-emerald-50 p-2 text-emerald-700">policy</span>
                <div>
                  <h3 className="font-bold text-slate-900">Issue Insurance Policy</h3>
                  <p className="text-xs text-slate-500">Financial Institutions</p>
                </div>
              </div>

              <form onSubmit={handleIssuePolicySubmit} className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Policy ID</label>
                    <input
                      type="number"
                      placeholder="e.g. 6001"
                      value={policyId}
                      onChange={(e) => setPolicyId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Insured Batch ID</label>
                    <input
                      type="number"
                      placeholder="e.g. 20261001"
                      value={insBatchId}
                      onChange={(e) => setInsBatchId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Beneficiary Address (Farmer / Producer)</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={beneficiaryAddr}
                    onChange={(e) => setBeneficiaryAddr(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Coverage Sum (SIM-NGN)</label>
                  <input
                    type="number"
                    value={coverageAmt}
                    onChange={(e) => setCoverageAmt(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isWorking || IS_PLACEHOLDER || !canInsure}
                  className="mt-2 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition-all disabled:opacity-50"
                >
                  {canInsure ? "Issue Policy On-Chain" : "Restricted (Financial Institution Role Req.)"}
                </button>
              </form>
            </div>

            {/* File Claim */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined rounded-lg bg-amber-50 p-2 text-amber-700">report_problem</span>
                <div>
                  <h3 className="font-bold text-slate-900">File Insurance Claim</h3>
                  <p className="text-xs text-slate-500">Beneficiary Policy Holder</p>
                </div>
              </div>

              <form onSubmit={handleClaimSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Policy ID</label>
                  <input
                    type="number"
                    placeholder="e.g. 6001"
                    value={claimPolicyId}
                    onChange={(e) => setClaimPolicyId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Claim Incident Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Flood damage in storage silo facility"
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isWorking || IS_PLACEHOLDER}
                  className="mt-4 w-full rounded-xl bg-amber-700 py-2.5 text-xs font-bold text-white hover:bg-amber-800 transition-all disabled:opacity-50"
                >
                  Submit Claim For Settlement
                </button>
              </form>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
                <h4 className="font-bold text-slate-800">Active Insurance Policies ({policiesList.length})</h4>
                <div className="max-h-[140px] overflow-y-auto space-y-1.5">
                  {policiesList.length > 0 ? (
                    policiesList.map((p, idx) => (
                      <div key={p.policyId || idx} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-800">#{p.policyId}</span> (Batch #{p.batchId})
                        </div>
                        <span className="text-emerald-700 font-semibold">₦{p.coverageAmount}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 py-2">No active policies issued.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
