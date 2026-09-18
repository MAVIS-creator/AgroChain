import { useEffect, useMemo, useRef, useState } from "react";
import {
  getContract,
  getContractEvents,
  prepareContractCall,
  prepareEvent,
  readContract,
} from "thirdweb";
import {
  useActiveAccount,
  useActiveWalletChain,
  useConnect,
  useDisconnect,
  useSendTransaction,
} from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import DashboardPage from "./components/DashboardPage.jsx";
import TraceabilityPage from "./components/TraceabilityPage.jsx";
import InputsPage from "./components/InputsPage.jsx";
import StorageProcessingPage from "./components/StorageProcessingPage.jsx";
import LogisticsPage from "./components/LogisticsPage.jsx";
import MarketplacePage from "./components/MarketplacePage.jsx";
import AnalyticsPage from "./components/AnalyticsPage.jsx";
import AdminPage from "./components/AdminPage.jsx";
import VerifyProductPage from "./components/VerifyProductPage.jsx";

import deploymentAbi from "./abi.json";
import contractAddressData from "./contract-address.json";
import { client, ganacheChain } from "./thirdwebClient.js";

const DEPLOYED_ADDRESS = contractAddressData?.AgroChain || contractAddressData?.CassavaSupplyChain;
const IS_PLACEHOLDER_ADDRESS =
  !DEPLOYED_ADDRESS ||
  DEPLOYED_ADDRESS === "0x0000000000000000000000000000000000000000" ||
  DEPLOYED_ADDRESS === "0xYourContractAddress";

const CONTRACT_ADDRESS =
  DEPLOYED_ADDRESS && !IS_PLACEHOLDER_ADDRESS
    ? DEPLOYED_ADDRESS
    : import.meta.env.VITE_CONTRACT_ADDRESS || "0xYourContractAddress";

const IS_PLACEHOLDER = CONTRACT_ADDRESS === "0xYourContractAddress";

const ROLE_LABELS = [
  "NONE",
  "ADMINISTRATOR",
  "FARMER",
  "INPUT_SUPPLIER",
  "EXTENSION_OFFICER",
  "STORAGE_OPERATOR",
  "PROCESSOR",
  "TRANSPORTER",
  "DISTRIBUTOR",
  "FINANCIAL_INSTITUTION",
  "REGULATOR",
  "CONSUMER",
];

const STAGE_LABELS = [
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

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "trace", label: "Traceability" },
  { key: "inputs", label: "Inputs" },
  { key: "storage", label: "Storage & Processing" },
  { key: "logistics", label: "Logistics" },
  { key: "marketplace", label: "Marketplace" },
  { key: "analytics", label: "Analytics" },
  { key: "admin", label: "Administration" },
  { key: "verify", label: "Verify Product" },
];

const RESOURCE_CONTENT = {
  "Privacy Policy": {
    title: "Privacy Policy",
    body: [
      "AgroChain stores tamper-evident value chain transactions on your permissioned blockchain ledger.",
      "Sensitive stakeholder wallet addresses are sanitized and masked in public audit logs to protect against OSINT harvesting.",
      "Private keys never leave your browser/MetaMask wallet session. Zero telemetry is transmitted to external unauthorized vendors.",
    ],
  },
  "Terms of Service": {
    title: "Terms of Service",
    body: [
      "AgroChain is designed for local demonstration, agricultural value chain coordination, and academic evaluation.",
      "Digital payment and insurance coverage workflows operate under demonstrator simulated settlement modes.",
      "Confirmed on-chain transactions are permanent on the active Ganache ledger.",
    ],
  },
  Documentation: {
    title: "AgroChain Technical Documentation",
    body: [
      "Sole scope authority: docs/AGROCHAIN_ANTIGRAVITY_IMPLEMENTATION_BRIEF.md",
      "Live demonstrator runbook: docs/LIVE_DEMO_SCRIPT.md",
      "UI workflows guide: docs/UI_WORKFLOW_GUIDE.md",
      "Commands: npm run dataset:build, npm run api:dataset, and npm run setup:test",
    ],
  },
  Support: {
    title: "Ecosystem Support & Diagnostics",
    body: [
      "Confirm Ganache is running on HTTP http://127.0.0.1:7545 with Chain ID 1337.",
      "If analytics fail to load, execute: npm run dataset:build and start the API with npm run api:dataset.",
      "Transactions enforce role authorization. Assign proper roles to testing wallets via the Administration tab.",
    ],
  },
};

const DATASET_API_BASE = import.meta.env.VITE_DATASET_API_URL || "http://127.0.0.1:3030";

const formatAddress = (address) => {
  if (!address || typeof address !== "string") return "—";
  if (address.includes("...")) return address;
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const parseNumericInput = (value, fieldLabel) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    throw new Error(`${fieldLabel} is required.`);
  }
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`${fieldLabel} must be a whole number.`);
  }
  return BigInt(trimmed);
};

const parseAppError = (error) => {
  const base = error?.reason || error?.shortMessage || error?.message || "Transaction failed.";

  if (base.includes("Cannot read properties of undefined") && base.includes("id")) {
    return "Wallet session is not fully initialized. Reconnect MetaMask and switch to Ganache (Chain ID 1337), then try again.";
  }
  if (base.includes("Only admin permitted") || base.includes("Only admin")) {
    return "Action restricted: Only the contract administrator can perform this operation.";
  }
  if (base.includes("Caller does not have required role") || base.includes("Invalid role")) {
    return "Action restricted: Connected wallet role is unauthorized for this operation. Assign the proper role in Administration.";
  }
  if (base.includes("Only current batch custodian permitted") || base.includes("Only current owner")) {
    return "Action restricted: Only the active batch custodian can transfer custody or update state.";
  }
  if (base.includes("Lifecycle stage must advance forward") || base.includes("Status must advance")) {
    return "Invalid transition: Value chain lifecycle must advance forward one step at a time.";
  }
  if (base.includes("Batch ID already exists") || base.includes("Batch exists")) {
    return "Batch ID already exists on-chain. Please choose a unique batch identifier.";
  }
  if (base.includes("Batch does not exist") || base.includes("Batch not found")) {
    return "Batch ID not found on-chain. Please verify the batch number.";
  }

  return base;
};

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [statusMessage, setStatusMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGanacheReady, setIsGanacheReady] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);

  // Forms state
  const [createBatchId, setCreateBatchId] = useState("");
  const [createCropType, setCreateCropType] = useState(0); // 0 = Cassava, 1 = Maize
  const [createQuantity, setCreateQuantity] = useState("");
  const [createUnit, setCreateUnit] = useState("kg");
  const [createOrigin, setCreateOrigin] = useState("");
  const [createQualityGrade, setCreateQualityGrade] = useState("Grade A Premium");

  const [transferBatchId, setTransferBatchId] = useState("");
  const [transferOwner, setTransferOwner] = useState("");
  const [statusBatchId, setStatusBatchId] = useState("");
  const [searchBatchId, setSearchBatchId] = useState("");

  // Data state
  const [batchDetails, setBatchDetails] = useState(null);
  const [batchEvents, setBatchEvents] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [inputsList, setInputsList] = useState([]);
  const [storageReadings, setStorageReadings] = useState([]);
  const [shipmentsList, setShipmentsList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [policiesList, setPoliciesList] = useState([]);
  const [riskData, setRiskData] = useState(null);

  const [datasetSummary, setDatasetSummary] = useState(null);
  const [datasetRecords, setDatasetRecords] = useState([]);
  const [datasetApiError, setDatasetApiError] = useState("");
  const [resourceModal, setResourceModal] = useState(null);

  const [contractAdmin, setContractAdmin] = useState("");
  const [activeRoleId, setActiveRoleId] = useState(0);
  const [assignRoleUser, setAssignRoleUser] = useState("");
  const [assignRoleId, setAssignRoleId] = useState(2); // Default to Farmer

  const [networkMetrics, setNetworkMetrics] = useState({
    totalBatches: 0,
    totalWeight: 0,
    statusCounts: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    recentRows: [],
    lastUpdated: null,
  });

  const walletMenuRef = useRef(null);

  const activeAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const { connect, isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { mutateAsync: sendTransaction, isPending } = useSendTransaction();

  const isWorking = isBusy || isRefreshing || isPending;

  const contract = useMemo(() => {
    if (IS_PLACEHOLDER) return null;
    return getContract({
      client,
      chain: ganacheChain,
      address: CONTRACT_ADDRESS,
      abi: deploymentAbi,
    });
  }, []);

  const setMessage = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  const activeRoleLabel = ROLE_LABELS[activeRoleId] || "NONE";
  const chainLabel = activeChain?.name || "Ganache Local (1337)";

  // Check Ganache RPC
  useEffect(() => {
    let unmounted = false;
    const checkRpc = async () => {
      try {
        const response = await fetch("http://127.0.0.1:7545", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
        });
        const payload = await response.json();
        if (!unmounted) setIsGanacheReady(typeof payload?.result === "string");
      } catch {
        if (!unmounted) setIsGanacheReady(false);
      }
    };

    checkRpc();
    const timer = setInterval(checkRpc, 10000);
    return () => {
      unmounted = true;
      clearInterval(timer);
    };
  }, []);

  // Fetch Connected Role from Contract
  useEffect(() => {
    if (!contract || !activeAccount?.address) {
      setActiveRoleId(0);
      return;
    }

    const fetchRole = async () => {
      try {
        const role = await readContract({
          contract,
          method: "roles",
          params: [activeAccount.address],
        });
        setActiveRoleId(Number(role));
      } catch {
        setActiveRoleId(0);
      }
    };

    fetchRole();
  }, [contract, activeAccount?.address]);

  // Load API data on mount
  useEffect(() => {
    loadDatasetApiData();
    loadIoTReadings();
  }, []);

  const loadDatasetApiData = async () => {
    try {
      const [sumRes, recRes] = await Promise.all([
        fetch(`${DATASET_API_BASE}/api/dataset/summary`),
        fetch(`${DATASET_API_BASE}/api/dataset/records?limit=25`),
      ]);
      if (sumRes.ok) setDatasetSummary(await sumRes.json());
      if (recRes.ok) {
        const data = await recRes.json();
        setDatasetRecords(data.records || []);
      }
      setDatasetApiError("");
    } catch {
      setDatasetApiError("Dataset API offline. Run: npm run api:dataset");
    }
  };

  const loadIoTReadings = async () => {
    try {
      const res = await fetch(`${DATASET_API_BASE}/api/iot/readings`);
      if (res.ok) {
        const data = await res.json();
        setStorageReadings(data.readings || []);
      }
    } catch {
      // Offline fallback
    }
  };

  const evaluateBatchRisk = async (batchId, crop, latency) => {
    try {
      const res = await fetch(
        `${DATASET_API_BASE}/api/analytics/risk-insights?batchId=${batchId}&crop=${crop}&transportHours=${latency}`
      );
      if (res.ok) {
        setRiskData(await res.json());
      }
    } catch {
      // Offline calculation fallback
      setRiskData({
        batchId: String(batchId),
        cropType: crop,
        riskScore: latency > 14 ? 45 : 20,
        category: latency > 14 ? "MEDIUM" : "LOW",
        contributingFactors: ["Standard transit latency observed."],
        evaluationMethod: "Deterministic fallback heuristic",
        labeledAs: "AI-Ready Risk Insights (Deterministic Evaluation Prototype)",
      });
    }
  };

  const connectWallet = async () => {
    try {
      const metamask = createWallet("io.metamask");
      await connect(async () => {
        await metamask.connect({ client });
        return metamask;
      });
      setIsWalletMenuOpen(false);
      setMessage("MetaMask connected successfully.");

      // Log security authentication event
      fetch(`${DATASET_API_BASE}/api/security/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "WALLET_AUTHENTICATION",
          severity: "INFO",
          actor: activeAccount?.address || "Connected Account",
          summary: "Stakeholder wallet authenticated with AgroChain web interface.",
        }),
      }).catch(() => {});
    } catch (error) {
      setMessage(`Wallet connection error: ${error?.message || error}`);
    }
  };

  const ensureWalletReady = () => {
    if (!activeAccount) {
      setMessage("Please connect your MetaMask wallet before submitting transactions.");
      return false;
    }
    return true;
  };

  // Synchronize on-chain data
  const refreshNetworkData = async () => {
    if (!contract) return;
    try {
      setIsRefreshing(true);

      const createdEvents = await getContractEvents({
        contract,
        events: [
          prepareEvent({
            signature: "event BatchCreated(uint256 indexed batchId, uint8 indexed cropType, address indexed producer, uint256 quantity, string unit)",
          }),
        ],
        fromBlock: 0n,
        toBlock: "latest",
      }).catch(() => []);

      const batchIds = [...new Set(createdEvents.map((e) => e.args.batchId.toString()))];

      // Read all batch records
      const fetchedBatches = await Promise.all(
        batchIds.map(async (batchIdStr) => {
          try {
            const data = await readContract({
              contract,
              method: "getAgroBatch",
              params: [BigInt(batchIdStr)],
            });

            return {
              batchId: data.batchId.toString(),
              cropType: Number(data.cropType),
              originLocation: data.originLocation,
              producer: data.producer,
              quantity: Number(data.quantity),
              quantityKg: Number(data.quantity),
              unit: data.unit,
              createdAt: new Date(Number(data.createdAt) * 1000).toLocaleString(),
              currentCustodian: data.currentCustodian,
              currentOwner: data.currentCustodian,
              statusIndex: Number(data.stage),
              status: STAGE_LABELS[Number(data.stage)] || "CREATED",
              qualityGrade: data.qualityGrade,
            };
          } catch {
            return null;
          }
        })
      );

      const validBatches = fetchedBatches.filter(Boolean);
      let totalWeight = 0;
      const statusCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];

      validBatches.forEach((b) => {
        totalWeight += b.quantityKg;
        if (statusCounts[b.statusIndex] !== undefined) {
          statusCounts[b.statusIndex] += 1;
        }
      });

      try {
        const adminAddr = await readContract({ contract, method: "admin" });
        setContractAdmin(adminAddr);
      } catch {}

      setAllBatches(validBatches.sort((a, b) => Number(b.batchId) - Number(a.batchId)));
      setNetworkMetrics({
        totalBatches: validBatches.length,
        totalWeight,
        statusCounts,
        recentRows: createdEvents.slice(-6).reverse(),
        lastUpdated: new Date().toLocaleTimeString(),
      });

      loadIoTReadings();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (contract && isGanacheReady) {
      refreshNetworkData();
    }
  }, [contract, isGanacheReady]);

  // Operational Handlers
  const handleSearchBatch = async (e) => {
    e?.preventDefault();
    if (!contract) {
      setMessage("Contract not ready. Deploy with: node scripts/deploy.js");
      return;
    }
    try {
      setIsBusy(true);
      const bId = parseNumericInput(searchBatchId, "Batch ID");
      const data = await readContract({
        contract,
        method: "getAgroBatch",
        params: [bId],
      });

      setBatchDetails({
        batchId: data.batchId.toString(),
        cropType: Number(data.cropType),
        originLocation: data.originLocation,
        producer: data.producer,
        quantity: Number(data.quantity),
        quantityKg: Number(data.quantity),
        unit: data.unit,
        createdAt: new Date(Number(data.createdAt) * 1000).toLocaleString(),
        currentCustodian: data.currentCustodian,
        currentOwner: data.currentCustodian,
        statusIndex: Number(data.stage),
        status: STAGE_LABELS[Number(data.stage)] || "CREATED",
        qualityGrade: data.qualityGrade,
      });

      setMessage(`Loaded batch #${bId} from blockchain records.`);
    } catch (error) {
      setBatchDetails(null);
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e?.preventDefault();
    if (!ensureWalletReady() || !contract) return;

    try {
      setIsBusy(true);
      const bId = parseNumericInput(createBatchId, "Batch ID");
      const qty = parseNumericInput(createQuantity, "Quantity");

      const tx = prepareContractCall({
        contract,
        method: "createBatch",
        params: [
          bId,
          createCropType,
          createOrigin.trim(),
          qty,
          createUnit,
          createQualityGrade,
        ],
      });

      await sendTransaction(tx);
      setCreateBatchId("");
      setCreateOrigin("");
      setCreateQuantity("");
      setMessage(`Crop batch #${bId} minted successfully.`);
      await refreshNetworkData();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleTransferOwnership = async (e) => {
    e?.preventDefault();
    if (!ensureWalletReady() || !contract) return;

    try {
      setIsBusy(true);
      const bId = parseNumericInput(transferBatchId, "Batch ID");
      const tx = prepareContractCall({
        contract,
        method: "transferCustody",
        params: [bId, transferOwner.trim()],
      });

      await sendTransaction(tx);
      setTransferBatchId("");
      setTransferOwner("");
      setMessage(`Custody for batch #${bId} transferred successfully.`);
      await refreshNetworkData();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleUpdateStatus = async (stageIndex) => {
    if (!ensureWalletReady() || !contract) return;

    try {
      setIsBusy(true);
      const bId = parseNumericInput(statusBatchId, "Batch ID");
      const tx = prepareContractCall({
        contract,
        method: "advanceStage",
        params: [bId, stageIndex],
      });

      await sendTransaction(tx);
      setMessage(`Batch #${bId} advanced to stage ${STAGE_LABELS[stageIndex]}.`);
      await refreshNetworkData();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  // Input Handlers
  const handleRegisterInput = async (payload) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const tx = prepareContractCall({
        contract,
        method: "registerAgroInput",
        params: [
          payload.inputId,
          payload.supplierName,
          payload.inputType,
          payload.cropApplicability,
          payload.certReference,
        ],
      });
      await sendTransaction(tx);
      setInputsList((prev) => [...prev, { ...payload, isVerified: false }]);
      setMessage(`Agro-input ${payload.inputId} registered on-chain.`);
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerifyInput = async (inputId) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const tx = prepareContractCall({
        contract,
        method: "verifyAgroInput",
        params: [inputId],
      });
      await sendTransaction(tx);
      setInputsList((prev) =>
        prev.map((item) => (item.inputId === inputId ? { ...item, isVerified: true } : item))
      );
      setMessage(`Agro-input ${inputId} certified & verified on-chain.`);
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleLinkInput = async (batchId, inputId) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const bId = parseNumericInput(batchId, "Batch ID");
      const tx = prepareContractCall({
        contract,
        method: "linkInputToBatch",
        params: [bId, inputId],
      });
      await sendTransaction(tx);
      setMessage(`Input ${inputId} linked to batch #${batchId}.`);
      await refreshNetworkData();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  // Storage & IoT Handlers
  const handleRecordStorageReading = async (reading) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const bId = parseNumericInput(reading.batchId, "Batch ID");
      const tx = prepareContractCall({
        contract,
        method: "recordStorageReading",
        params: [
          bId,
          reading.facility,
          BigInt(Math.round(reading.temperature)),
          BigInt(Math.round(reading.humidity)),
          reading.sensorId,
          reading.isSimulated,
        ],
      });
      await sendTransaction(tx);

      // Ingest into local API telemetry
      fetch(`${DATASET_API_BASE}/api/iot/reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reading),
      }).catch(() => {});

      setMessage(`Storage telemetry recorded for batch #${bId}.`);
      await refreshNetworkData();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleSimulateIoT = async (batchId, cropType) => {
    try {
      const res = await fetch(`${DATASET_API_BASE}/api/iot/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, cropType }),
      });
      if (res.ok) {
        const data = await res.json();
        setStorageReadings((prev) => [data.reading, ...prev]);
        setMessage(`Simulated IoT observation generated for batch #${batchId}.`);
      }
    } catch {
      setMessage("IoT simulator API is offline.");
    }
  };

  // Processing & Quality Handlers
  const handleRecordProcessing = async (p) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const bId = parseNumericInput(p.batchId, "Batch ID");
      const tx = prepareContractCall({
        contract,
        method: "recordProcessing",
        params: [bId, p.outputProduct, BigInt(p.outputQuantity), p.unit, p.notes],
      });
      await sendTransaction(tx);
      setMessage(`Processing event for batch #${bId} recorded on-chain.`);
      await refreshNetworkData();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleRecordQualityCertificate = async (q) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const bId = parseNumericInput(q.batchId, "Batch ID");
      const tx = prepareContractCall({
        contract,
        method: "recordQualityCertificate",
        params: [bId, q.qualityGrade, q.certReference, q.passed, q.notes],
      });
      await sendTransaction(tx);
      setMessage(`Quality certification for batch #${bId} stamped on-chain.`);
      await refreshNetworkData();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  // Logistics Handlers
  const handleCreateShipment = async (shipment) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const sId = BigInt(shipment.shipmentId);
      const bId = BigInt(shipment.batchId);
      const tx = prepareContractCall({
        contract,
        method: "createShipment",
        params: [sId, bId, shipment.transporter, shipment.originLocation, shipment.destination],
      });
      await sendTransaction(tx);
      setShipmentsList((prev) => [...prev, { ...shipment, status: "DISPATCHED" }]);
      setMessage(`Shipment #${sId} dispatched for batch #${bId}.`);
      await refreshNetworkData();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirmDelivery = async (confirm) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const sId = BigInt(confirm.shipmentId);
      const tx = prepareContractCall({
        contract,
        method: "confirmShipmentDelivery",
        params: [sId, confirm.recipient],
      });
      await sendTransaction(tx);
      setShipmentsList((prev) =>
        prev.map((s) => (s.shipmentId === confirm.shipmentId ? { ...s, status: "DELIVERED" } : s))
      );
      setMessage(`Delivery for shipment #${sId} confirmed on-chain.`);
      await refreshNetworkData();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  // Marketplace Handlers
  const handleCreateListing = async (listing) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const lId = BigInt(listing.listingId);
      const bId = BigInt(listing.batchId);
      const tx = prepareContractCall({
        contract,
        method: "createListing",
        params: [
          lId,
          bId,
          BigInt(listing.quantity),
          listing.unit,
          BigInt(listing.pricePerUnit),
          listing.location,
          listing.qualityGrade,
        ],
      });
      await sendTransaction(tx);
      setListingsList((prev) => [...prev, { ...listing, seller: activeAccount.address }]);
      setMessage(`Market listing #${lId} created on-chain.`);
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateOrder = async (order) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const oId = BigInt(order.orderId);
      const lId = BigInt(order.listingId);
      const tx = prepareContractCall({
        contract,
        method: "createOrder",
        params: [oId, lId, BigInt(order.quantity)],
      });
      await sendTransaction(tx);
      setOrdersList((prev) => [
        ...prev,
        { ...order, buyer: activeAccount.address, status: "PLACED", totalPrice: order.quantity * 350 },
      ]);
      setMessage(`Procurement order #${oId} placed successfully.`);
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleRecordPayment = async (payment) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const pId = BigInt(payment.paymentId);
      const oId = BigInt(payment.orderId);
      const tx = prepareContractCall({
        contract,
        method: "recordPayment",
        params: [pId, oId, payment.payee, BigInt(payment.amount), payment.settlementUnit],
      });
      await sendTransaction(tx);
      setOrdersList((prev) =>
        prev.map((o) => (o.orderId === payment.orderId ? { ...o, status: "PAID" } : o))
      );
      setMessage(`Simulated payment settlement recorded for order #${oId}.`);
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleIssueInsurancePolicy = async (policy) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const pId = BigInt(policy.policyId);
      const bId = BigInt(policy.batchId);
      const tx = prepareContractCall({
        contract,
        method: "issueInsurancePolicy",
        params: [pId, bId, policy.beneficiary, BigInt(policy.coverageAmount)],
      });
      await sendTransaction(tx);
      setPoliciesList((prev) => [...prev, policy]);
      setMessage(`Simulated insurance policy #${pId} issued on-chain.`);
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const handleFileInsuranceClaim = async (policyId, reason) => {
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const pId = BigInt(policyId);
      const tx = prepareContractCall({
        contract,
        method: "fileInsuranceClaim",
        params: [pId, reason],
      });
      await sendTransaction(tx);
      setMessage(`Claim filed for policy #${policyId}.`);
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  // Administration Handler
  const handleAssignRole = async (e, extra) => {
    e?.preventDefault();
    if (!ensureWalletReady() || !contract) return;
    try {
      setIsBusy(true);
      const userAddr = assignRoleUser.trim();
      const tx = prepareContractCall({
        contract,
        method: "registerStakeholder",
        params: [userAddr, extra?.nameOrOrg || "Stakeholder Org", assignRoleId, extra?.status || 1],
      });
      await sendTransaction(tx);
      setAssignRoleUser("");
      setMessage(`Role ${ROLE_LABELS[assignRoleId]} assigned to ${formatAddress(userAddr)}.`);
      await refreshNetworkData();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  const statusPercent = batchDetails
    ? Math.round((batchDetails.statusIndex / (STAGE_LABELS.length - 1)) * 100)
    : 0;

  const renderActivePage = () => {
    switch (activePage) {
      case "trace":
        return (
          <TraceabilityPage
            searchBatchId={searchBatchId}
            setSearchBatchId={setSearchBatchId}
            handleSearchBatch={handleSearchBatch}
            batchDetails={batchDetails}
            batchEvents={batchEvents}
            statusPercent={statusPercent}
            formatAddress={formatAddress}
            isWorking={isWorking}
            IS_PLACEHOLDER={IS_PLACEHOLDER}
          />
        );

      case "inputs":
        return (
          <InputsPage
            isWorking={isWorking}
            IS_PLACEHOLDER={IS_PLACEHOLDER}
            activeAccount={activeAccount}
            activeRoleLabel={activeRoleLabel}
            formatAddress={formatAddress}
            onRegisterInput={handleRegisterInput}
            onVerifyInput={handleVerifyInput}
            onLinkInput={handleLinkInput}
            inputsList={inputsList}
          />
        );

      case "storage":
        return (
          <StorageProcessingPage
            isWorking={isWorking}
            IS_PLACEHOLDER={IS_PLACEHOLDER}
            activeAccount={activeAccount}
            activeRoleLabel={activeRoleLabel}
            formatAddress={formatAddress}
            onRecordStorageReading={handleRecordStorageReading}
            onSimulateIoT={handleSimulateIoT}
            onRecordProcessing={handleRecordProcessing}
            onRecordQualityCertificate={handleRecordQualityCertificate}
            storageReadings={storageReadings}
          />
        );

      case "logistics":
        return (
          <LogisticsPage
            isWorking={isWorking}
            IS_PLACEHOLDER={IS_PLACEHOLDER}
            activeAccount={activeAccount}
            activeRoleLabel={activeRoleLabel}
            formatAddress={formatAddress}
            onCreateShipment={handleCreateShipment}
            onConfirmDelivery={handleConfirmDelivery}
            shipmentsList={shipmentsList}
          />
        );

      case "marketplace":
        return (
          <MarketplacePage
            isWorking={isWorking}
            IS_PLACEHOLDER={IS_PLACEHOLDER}
            activeAccount={activeAccount}
            activeRoleLabel={activeRoleLabel}
            formatAddress={formatAddress}
            onCreateListing={handleCreateListing}
            onCreateOrder={handleCreateOrder}
            onRecordPayment={handleRecordPayment}
            onIssueInsurancePolicy={handleIssueInsurancePolicy}
            onFileInsuranceClaim={handleFileInsuranceClaim}
            listingsList={listingsList}
            ordersList={ordersList}
            policiesList={policiesList}
          />
        );

      case "analytics":
        return (
          <AnalyticsPage
            networkMetrics={networkMetrics}
            datasetSummary={datasetSummary}
            datasetRecords={datasetRecords}
            datasetApiError={datasetApiError}
            loadDatasetApiData={loadDatasetApiData}
            riskData={riskData}
            onEvaluateBatchRisk={evaluateBatchRisk}
            allBatches={allBatches}
          />
        );

      case "admin":
        return (
          <AdminPage
            isWorking={isWorking}
            IS_PLACEHOLDER={IS_PLACEHOLDER}
            formatAddress={formatAddress}
            activeAccount={activeAccount}
            assignRoleUser={assignRoleUser}
            setAssignRoleUser={setAssignRoleUser}
            assignRoleId={assignRoleId}
            setAssignRoleId={setAssignRoleId}
            handleAssignRole={handleAssignRole}
            refreshNetworkData={refreshNetworkData}
            contractAdmin={contractAdmin}
            reloadDatasetInsights={loadDatasetApiData}
          />
        );

      case "verify":
        return (
          <VerifyProductPage
            searchBatchId={searchBatchId}
            setSearchBatchId={setSearchBatchId}
            handleSearchBatch={handleSearchBatch}
            batchDetails={batchDetails}
            batchEvents={batchEvents}
            isWorking={isWorking}
            formatAddress={formatAddress}
          />
        );

      case "dashboard":
      default:
        return (
          <DashboardPage
            networkMetrics={networkMetrics}
            integrityScore={integrityScore}
            createBatchId={createBatchId}
            setCreateBatchId={setCreateBatchId}
            createQuantity={createQuantity}
            setCreateQuantity={setCreateQuantity}
            createOrigin={createOrigin}
            setCreateOrigin={setCreateOrigin}
            createCropType={createCropType}
            setCreateCropType={setCreateCropType}
            createUnit={createUnit}
            setCreateUnit={setCreateUnit}
            createQualityGrade={createQualityGrade}
            setCreateQualityGrade={setCreateQualityGrade}
            handleCreateBatch={handleCreateBatch}
            transferBatchId={transferBatchId}
            setTransferBatchId={setTransferBatchId}
            transferOwner={transferOwner}
            setTransferOwner={setTransferOwner}
            handleTransferOwnership={handleTransferOwnership}
            statusBatchId={statusBatchId}
            setStatusBatchId={setStatusBatchId}
            handleUpdateStatus={handleUpdateStatus}
            allBatches={allBatches}
            formatAddress={formatAddress}
            refreshNetworkData={refreshNetworkData}
            isWorking={isWorking}
            IS_PLACEHOLDER={IS_PLACEHOLDER}
            STATUS_LABELS={STAGE_LABELS}
            lastUpdated={networkMetrics.lastUpdated}
          />
        );
    }
  };

  const integrityScore = networkMetrics.totalBatches > 0 ? 98 : 100;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <Header
        activePage={activePage}
        setActivePage={setActivePage}
        navItems={NAV_ITEMS}
        activeAccount={activeAccount}
        formatAddress={formatAddress}
        isConnecting={isConnecting}
        onConnectWallet={connectWallet}
        onDisconnect={() => {
          disconnect();
          setIsWalletMenuOpen(false);
          setMessage("Wallet disconnected.");
        }}
        isWorking={isWorking}
        isWalletMenuOpen={isWalletMenuOpen}
        setIsWalletMenuOpen={setIsWalletMenuOpen}
        walletMenuRef={walletMenuRef}
        chainLabel={chainLabel}
        onOpenNotifications={() => {
          setMessage(`Connected: ${activeRoleLabel} | Network: ${chainLabel} | Ganache Node: ${isGanacheReady ? "ONLINE" : "OFFLINE"}`);
        }}
        activeRoleLabel={activeRoleLabel}
      />

      {IS_PLACEHOLDER && (
        <div className="px-4 pt-20">
          <div className="mx-auto max-w-7xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            Contract address is not configured. Run: <code>node scripts/deploy.js</code> to deploy AgroChain.
          </div>
        </div>
      )}

      {renderActivePage()}

      <Footer onOpenResource={(r) => setResourceModal(RESOURCE_CONTENT[r])} />

      {/* Resource Information Modal */}
      {resourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-100 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">{resourceModal.title}</h3>
              <button
                type="button"
                onClick={() => setResourceModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              {resourceModal.body.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-lg border border-slate-700 animate-fade-in">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
