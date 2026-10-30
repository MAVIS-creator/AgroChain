import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getContract,
  getContractEvents,
  prepareContractCall,
  prepareEvent,
  readContract,
} from "thirdweb";
import {
  useActiveAccount,
  useActiveWallet,
  useActiveWalletChain,
  useConnect,
  useDisconnect,
  useSendTransaction,
} from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

import Header from "./components/Header.jsx";
import LandingPage from "./components/LandingPage.jsx";
import Footer from "./components/Footer.jsx";
import DashboardPage from "./components/DashboardPage.jsx";
import TraceabilityPage from "./components/TraceabilityPage.jsx";
import InputsPage from "./components/InputsPage.jsx";
import StorageProcessingPage from "./components/StorageProcessingPage.jsx";
import LogisticsPage from "./components/LogisticsPage.jsx";
import MarketplacePage from "./components/MarketplacePage.jsx";
import AnalyticsPage from "./components/AnalyticsPage.jsx";
import AdminPage from "./components/AdminPage.jsx";
import SecurityPage from "./components/SecurityPage.jsx";
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
  { key: "landing", label: "Home" },
  { key: "dashboard", label: "Dashboard" },
  { key: "trace", label: "Traceability" },
  { key: "inputs", label: "Inputs" },
  { key: "storage", label: "Storage & Processing" },
  { key: "logistics", label: "Logistics" },
  { key: "marketplace", label: "Marketplace" },
  { key: "analytics", label: "Analytics" },
  { key: "security", label: "Security" },
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
      "AgroChain supports local agricultural value-chain coordination and academic evaluation.",
      "Digital payment and insurance workflows currently record local test-mode settlement and coverage evidence.",
      "Confirmed on-chain transactions are permanent on the active Ganache ledger.",
    ],
  },
  Documentation: {
    title: "AgroChain Technical Documentation",
    body: [
      "Sole scope authority: docs/AGROCHAIN_ANTIGRAVITY_IMPLEMENTATION_BRIEF.md",
      "Platform workflow runbook: docs/LIVE_DEMO_SCRIPT.md",
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
  if (
    base === "Failed to fetch" ||
    base.includes("failed to fetch") ||
    base.includes("NetworkError") ||
    base.includes("ECONNREFUSED")
  ) {
    return "The blockchain network is offline. Start Ganache on http://127.0.0.1:7545, then try verification again.";
  }
  if (base.includes("execution reverted") || base.includes("reverted")) {
    return "Batch ID not found on-chain. Please verify the batch number and try again.";
  }

  return base;
};

export default function App() {
  const [sharedVerificationId] = useState(() => new URLSearchParams(window.location.search).get("batchId") || "");
  const [activePage, setActivePageState] = useState(() => new URLSearchParams(window.location.search).get("page") || "landing");
  const [statusMessage, setStatusMessage] = useState("");
  const [isWalletSessionApproved, setIsWalletSessionApproved] = useState(false);
  const [isWalletConnectionPending, setIsWalletConnectionPending] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGanacheReady, setIsGanacheReady] = useState(false);
  const [isContractReady, setIsContractReady] = useState(false);
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
  const [searchBatchId, setSearchBatchId] = useState(() => new URLSearchParams(window.location.search).get("batchId") || "");

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
  const lastAuthEventWallet = useRef("");
  const sharedVerificationLoaded = useRef(false);
  const userInitiatedConnection = useRef(false);
  const walletConnectionPending = useRef(false);
  useEffect(() => {
    if (!isWalletMenuOpen) return undefined;

    const closeOnOutsidePress = (event) => {
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target)) {
        setIsWalletMenuOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsWalletMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isWalletMenuOpen]);

  const setActivePage = useCallback((page) => {
    const nextPage = page || "landing";
    setActivePageState(nextPage);
    const params = new URLSearchParams(window.location.search);
    params.set("page", nextPage);
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleHistoryNavigation = () => {
      setActivePageState(new URLSearchParams(window.location.search).get("page") || "landing");
    };
    window.addEventListener("popstate", handleHistoryNavigation);
    return () => window.removeEventListener("popstate", handleHistoryNavigation);
  }, []);

  const sdkActiveAccount = useActiveAccount();
  const activeAccount = isWalletSessionApproved ? sdkActiveAccount : undefined;
  const activeWallet = useActiveWallet();
  const activeChain = useActiveWalletChain();
  const { connect, isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { mutateAsync: sendTransaction, isPending } = useSendTransaction();

  const isWorking = isBusy || isRefreshing || isPending;
  const isWalletConnecting = isConnecting || isWalletConnectionPending;

  useEffect(() => {
    if (!activeWallet || userInitiatedConnection.current) return;
    disconnect(activeWallet);
  }, [activeWallet, disconnect]);

  const securityRequest = useCallback(async (method, pathname, payload = {}) => {
    if (!activeAccount?.address || typeof activeAccount.signMessage !== "function") {
      throw new Error("Connect the wallet that owns this security action.");
    }
    const timestamp = Date.now();
    const message = ["AgroChain local admin request", method, pathname, String(timestamp), JSON.stringify(payload)].join("|");
    const signature = await activeAccount.signMessage({ message });
    const actor = activeAccount.address;
    const headers = {
      "Content-Type": "application/json",
      "X-AgroChain-Actor": actor,
      "X-AgroChain-Timestamp": String(timestamp),
      "X-AgroChain-Signature": signature,
    };
    const response = await fetch(`${DATASET_API_BASE}${pathname}`, {
      method,
      headers,
      ...(method === "GET" ? {} : { body: JSON.stringify({ ...payload, payload, actor, timestamp, signature }) }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Security API returned ${response.status}.`);
    return data;
  }, [activeAccount?.address, activeAccount?.signMessage]);

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

  // Check both the Ganache RPC and the configured contract deployment.
  useEffect(() => {
    let unmounted = false;
    const rpcRequest = async (method, params = []) => {
      const response = await fetch("http://127.0.0.1:7545", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: method, method, params }),
      });
      return response.json();
    };

    const checkNetwork = async () => {
      try {
        const blockPayload = await rpcRequest("eth_blockNumber");
        const rpcReady = typeof blockPayload?.result === "string";
        if (!unmounted) setIsGanacheReady(rpcReady);

        if (!rpcReady || IS_PLACEHOLDER) {
          if (!unmounted) setIsContractReady(false);
          return;
        }

        const codePayload = await rpcRequest("eth_getCode", [CONTRACT_ADDRESS, "latest"]);
        if (!unmounted) {
          setIsContractReady(typeof codePayload?.result === "string" && codePayload.result !== "0x");
        }
      } catch {
        if (!unmounted) {
          setIsGanacheReady(false);
          setIsContractReady(false);
        }
      }
    };

    checkNetwork();
    const timer = setInterval(checkNetwork, 10000);
    return () => {
      unmounted = true;
      clearInterval(timer);
    };
  }, []);

  // Fetch Connected Role from Contract
  useEffect(() => {
    if (!contract || !isContractReady || !activeAccount?.address) {
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
  }, [contract, isContractReady, activeAccount?.address]);

  useEffect(() => {
    const walletAddress = activeAccount?.address;
    if (!walletAddress) {
      lastAuthEventWallet.current = "";
      return;
    }
    if (lastAuthEventWallet.current.toLowerCase() === walletAddress.toLowerCase()) return;
    lastAuthEventWallet.current = walletAddress;
    securityRequest("POST", "/api/security/events", {
      eventType: "WALLET_AUTHENTICATION",
      severity: "INFO",
      summary: "Wallet connected to the AgroChain local web application.",
    }).catch(() => {});
  }, [activeAccount?.address, securityRequest]);

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
    if (walletConnectionPending.current) {
      setMessage("A MetaMask connection request is already open. Complete it in MetaMask before trying again.");
      return;
    }

    walletConnectionPending.current = true;
    setIsWalletConnectionPending(true);
    userInitiatedConnection.current = true;
    try {
      const metamask = createWallet("io.metamask");
      let connectedAccount;
      await connect(async () => {
        connectedAccount = await metamask.connect({ client });
        return metamask;
      });

      if (!connectedAccount?.address) {
        throw new Error("MetaMask did not return an account. Unlock MetaMask and approve the connection request.");
      }

      setIsWalletSessionApproved(true);
      setIsWalletMenuOpen(false);
      setMessage("MetaMask connected successfully.");
      setActivePage("dashboard");

    } catch (error) {
      userInitiatedConnection.current = false;
      setIsWalletSessionApproved(false);
      const errorMessage = error?.message || String(error);
      const isPendingRequest = error?.code === -32002 || /already pending|requestpermissions.*pending/i.test(errorMessage);
      setMessage(isPendingRequest
        ? "A MetaMask connection request is already pending. Open MetaMask and approve or reject it, then try again."
        : `Wallet connection error: ${errorMessage}`);
    } finally {
      walletConnectionPending.current = false;
      setIsWalletConnectionPending(false);
    }
  };
  const ensureWalletReady = () => {
    if (!activeAccount) {
      setMessage("Please connect your MetaMask wallet before submitting transactions.");
      return false;
    }
    return true;
  };

  // Synchronize every persisted operational record from contract events and getters.
  const refreshNetworkData = async () => {
    if (!contract || !isContractReady) {
      setMessage(isGanacheReady
        ? "Ganache is online, but the configured AgroChain contract is not deployed on this chain."
        : "Ganache is offline. Start the local blockchain before synchronizing.");
      return;
    }
    try {
      setIsRefreshing(true);
      const readEvents = (signature) => getContractEvents({
        contract,
        events: [prepareEvent({ signature })],
        fromBlock: 1n,
        toBlock: "latest",
        useIndexer: false,
      }).catch(() => []);
      const [createdEvents, inputEvents, shipmentEvents, listingEvents, orderEvents, policyEvents] = await Promise.all([
        readEvents("event BatchCreated(uint256 indexed batchId, uint8 indexed cropType, address indexed producer, uint256 quantity, string unit)"),
        readEvents("event InputRegistered(string inputId, address indexed supplier, uint8 cropApplicability, string inputType)"),
        readEvents("event ShipmentCreated(uint256 indexed shipmentId, uint256 indexed batchId, address indexed transporter, string destination)"),
        readEvents("event ListingCreated(uint256 indexed listingId, uint256 indexed batchId, address indexed seller, uint256 pricePerUnit)"),
        readEvents("event OrderPlaced(uint256 indexed orderId, uint256 indexed listingId, address indexed buyer, uint256 quantity)"),
        readEvents("event InsurancePolicyIssued(uint256 indexed policyId, uint256 indexed batchId, address indexed insurer, address beneficiary, uint256 coverageAmount)"),
      ]);
      const unique = (values) => [...new Set(values.filter((value) => value !== undefined && value !== null).map(String))];
      const fetchRecords = async (events, key, method, normalize) => Promise.all(
        unique(events.map((event) => event.args[key])).map(async (id) => {
          try {
            const data = await readContract({ contract, method, params: [method === "getAgroInput" ? id : BigInt(id)] });
            return normalize(data);
          } catch {
            return null;
          }
        }),
      );
      const fetchedBatches = await fetchRecords(createdEvents, "batchId", "getAgroBatch", (data) => ({
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
      }));
      const fetchedInputs = await fetchRecords(inputEvents, "inputId", "getAgroInput", (data) => ({
        inputId: data.inputId, supplierName: data.supplierName, supplierWallet: data.supplierWallet,
        inputType: data.inputType, cropApplicability: Number(data.cropApplicability),
        certReference: data.certReference, isVerified: data.isVerified, verifiedBy: data.verifiedBy,
      }));
      const fetchedShipments = await fetchRecords(shipmentEvents, "shipmentId", "getShipment", (data) => ({
        shipmentId: data.shipmentId.toString(), batchId: data.batchId.toString(), transporter: data.transporter,
        originLocation: data.originLocation, destination: data.destination, status: Number(data.status),
      }));
      const fetchedListings = await fetchRecords(listingEvents, "listingId", "getListing", (data) => ({
        listingId: data.listingId.toString(), batchId: data.batchId.toString(), seller: data.seller,
        cropType: Number(data.cropType), quantity: Number(data.quantity), unit: data.unit,
        pricePerUnit: Number(data.pricePerUnit), location: data.location,
        qualityGrade: data.qualityGrade, status: Number(data.status),
      }));
      const fetchedOrders = await fetchRecords(orderEvents, "orderId", "getOrder", (data) => ({
        orderId: data.orderId.toString(), listingId: data.listingId.toString(), batchId: data.batchId.toString(),
        buyer: data.buyer, seller: data.seller, quantity: Number(data.quantity),
        totalPrice: Number(data.totalPrice), status: Number(data.status),
      }));
      const fetchedPolicies = await fetchRecords(policyEvents, "policyId", "getInsurancePolicy", (data) => ({
        policyId: data.policyId.toString(), batchId: data.batchId.toString(), insurer: data.insurer,
        beneficiary: data.beneficiary, coverageAmount: Number(data.coverageAmount),
        policyStatus: Number(data.policyStatus), claimStatus: Number(data.claimStatus),
      }));
      const validBatches = fetchedBatches.filter(Boolean).sort((a, b) => Number(b.batchId) - Number(a.batchId));
      const statusCounts = Array(STAGE_LABELS.length).fill(0);
      let totalWeight = 0;
      validBatches.forEach((batch) => {
        totalWeight += batch.quantityKg;
        if (statusCounts[batch.statusIndex] !== undefined) statusCounts[batch.statusIndex] += 1;
      });
      setContractAdmin(await readContract({ contract, method: "admin" }));
      setAllBatches(validBatches);
      setInputsList(fetchedInputs.filter(Boolean));
      setShipmentsList(fetchedShipments.filter(Boolean));
      setListingsList(fetchedListings.filter(Boolean));
      setOrdersList(fetchedOrders.filter(Boolean));
      setPoliciesList(fetchedPolicies.filter(Boolean));
      setNetworkMetrics({
        totalBatches: validBatches.length, totalWeight, statusCounts,
        recentRows: createdEvents.slice(-6).reverse(), lastUpdated: new Date().toLocaleTimeString(),
      });
      await loadIoTReadings();
    } catch (error) {
      setMessage(parseAppError(error));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (contract && isContractReady) {
      refreshNetworkData();
    }
  }, [contract, isContractReady]);

  const loadBatchEvents = async (batchId) => {
    const definitions = [
      ["Batch Created", "event BatchCreated(uint256 indexed batchId, uint8 indexed cropType, address indexed producer, uint256 quantity, string unit)"],
      ["Lifecycle Stage Updated", "event StageUpdated(uint256 indexed batchId, uint8 newStage, address indexed updatedBy)"],
      ["Custody Transferred", "event CustodyTransferred(uint256 indexed batchId, address indexed previousCustodian, address indexed newCustodian)"],
      ["Agro-Input Linked", "event InputLinked(uint256 indexed batchId, string inputId)"],
      ["Storage Reading Recorded", "event StorageReadingRecorded(uint256 indexed batchId, string facility, int256 temperature, uint256 humidity, bool isSimulated, uint256 timestamp)"],
      ["Processing Recorded", "event ProcessingRecorded(uint256 indexed batchId, address indexed processor, string outputProduct, uint256 outputQuantity)"],
      ["Quality Certified", "event QualityCertified(uint256 indexed batchId, address indexed certifier, string qualityGrade, bool passed)"],
      ["Shipment Created", "event ShipmentCreated(uint256 indexed shipmentId, uint256 indexed batchId, address indexed transporter, string destination)"],
      ["Shipment Dispatched", "event ShipmentDispatched(uint256 indexed shipmentId, uint256 indexed batchId)"],
      ["Shipment Delivered", "event ShipmentDelivered(uint256 indexed shipmentId, uint256 indexed batchId, address indexed recipient)"],
      ["Marketplace Listing Created", "event ListingCreated(uint256 indexed listingId, uint256 indexed batchId, address indexed seller, uint256 pricePerUnit)"],
      ["Insurance Policy Issued", "event InsurancePolicyIssued(uint256 indexed policyId, uint256 indexed batchId, address indexed insurer, address beneficiary, uint256 coverageAmount)"],
      ["Insurance Claim Filed", "event InsuranceClaimFiled(uint256 indexed policyId, uint256 indexed batchId, string reason)"],
    ];

    const groups = await Promise.all(definitions.map(async ([type, signature]) => {
      try {
        const events = await getContractEvents({ contract, events: [prepareEvent({ signature })], fromBlock: 1n, toBlock: "latest", useIndexer: false });
        return events
          .filter((event) => event.args?.batchId !== undefined && BigInt(event.args.batchId) === batchId)
          .map((event) => ({ type, blockNumber: Number(event.blockNumber), logIndex: Number(event.logIndex ?? 0), txHash: event.transactionHash }));
      } catch {
        return [];
      }
    }));

    return groups.flat().sort((left, right) => {
      if (left.blockNumber === right.blockNumber) return Number(left.logIndex) - Number(right.logIndex);
      return left.blockNumber < right.blockNumber ? -1 : 1;
    });
  };
  // Operational Handlers
  const handleSearchBatch = async (e, requestedBatchId = searchBatchId) => {
    e?.preventDefault();
    if (!isGanacheReady) {
      setMessage("The blockchain network is offline. Start Ganache on http://127.0.0.1:7545, then try verification again.");
      return;
    }
    if (!contract) {
      setMessage("Contract not ready. Deploy with: node scripts/deploy.js");
      return;
    }
    try {
      setIsBusy(true);
      const bId = parseNumericInput(requestedBatchId, "Batch ID");
      const data = await readContract({
        contract,
        method: "getAgroBatch",
        params: [bId],
      });

      const events = await loadBatchEvents(bId);

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
      setBatchEvents(events);

      setMessage(`Loaded batch #${bId} from blockchain records.`);
    } catch (error) {
      setBatchDetails(null);
      setBatchEvents([]);
      setMessage(parseAppError(error));
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    if (!sharedVerificationId || !contract || sharedVerificationLoaded.current) return;
    sharedVerificationLoaded.current = true;
    setActivePage("verify");
    handleSearchBatch(null, sharedVerificationId);
  }, [contract, sharedVerificationId]);

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
        setMessage(`Local IoT observation generated for batch #${batchId}.`);
      }
    } catch {
      setMessage("Local IoT data service is offline.");
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
      setMessage(`Payment settlement record created for order #${oId}.`);
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
      setMessage(`Insurance policy record #${pId} issued on-chain.`);
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
      case "landing":
        return (
          <LandingPage
            onConnectWallet={connectWallet}
            isConnecting={isWalletConnecting}
            activeAccount={activeAccount}
            activeRoleLabel={activeRoleLabel}
            formatAddress={formatAddress}
          />
        );
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

      case "security":
        return <SecurityPage activeRoleLabel={activeRoleLabel} securityRequest={securityRequest} />;

      case "verify":
      case "workspace-verify":
        return (
          <VerifyProductPage
            searchBatchId={searchBatchId}
            setSearchBatchId={setSearchBatchId}
            handleSearchBatch={handleSearchBatch}
            batchDetails={batchDetails}
            batchEvents={batchEvents}
            isWorking={isWorking}
            formatAddress={formatAddress}
            isGanacheReady={isContractReady}
            variant={activePage === "workspace-verify" ? "workspace" : "public"}
            onBackHome={() => setActivePage(activePage === "workspace-verify" ? "dashboard" : "landing")}
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
  const isWorkspacePage = activePage !== "landing" && activePage !== "verify";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <Header
        activePage={activePage}
        setActivePage={setActivePage}
        navItems={NAV_ITEMS}
        activeAccount={activeAccount}
        formatAddress={formatAddress}
        isConnecting={isWalletConnecting}
        onConnectWallet={connectWallet}
        onDisconnect={() => {
          userInitiatedConnection.current = false;
          setIsWalletSessionApproved(false);
          if (activeWallet) disconnect(activeWallet);
          setActiveRoleId(0);
          setIsWalletMenuOpen(false);
          setMessage("Wallet disconnected.");
        }}
        isWorking={isWorking}
        isWalletMenuOpen={isWalletMenuOpen}
        setIsWalletMenuOpen={setIsWalletMenuOpen}
        walletMenuRef={walletMenuRef}
        chainLabel={chainLabel}
        onOpenNotifications={() => {
          setMessage(`Wallet: ${activeRoleLabel} | RPC: ${isGanacheReady ? "ONLINE" : "OFFLINE"} | Contract: ${isContractReady ? "READY" : "MISSING"}`);
        }}
        activeRoleLabel={activeRoleLabel}
        isGanacheReady={isGanacheReady}
        isContractReady={isContractReady}
      />

      <div className={isWorkspacePage ? "workspace-shell min-h-screen lg:pl-72" : ""}>
        {IS_PLACEHOLDER && (
          <div className="px-4 pt-20">
            <div className="mx-auto max-w-7xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              Contract address is not configured. Run: <code>node scripts/deploy.js</code> to deploy AgroChain.
            </div>
          </div>
        )}

        {isWorkspacePage && activeAccount && (
          <div className="workspace-status-wrap px-4 sm:px-6">
            <div className={`workspace-status mx-auto flex max-w-7xl items-center gap-4 rounded-2xl border px-5 py-4 shadow-sm ${
              activeAccount
                ? activeRoleLabel === "NONE"
                  ? "border-amber-200 bg-amber-50 text-amber-950"
                  : "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-blue-200 bg-blue-50 text-blue-950"
            }`}>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                activeAccount
                  ? activeRoleLabel === "NONE" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                <span className="material-symbols-outlined text-[23px]">
                  {activeAccount ? activeRoleLabel === "NONE" ? "warning" : "verified_user" : "account_balance_wallet"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">
                  {activeAccount
                    ? activeRoleLabel === "NONE" ? "Wallet connected — role not assigned" : `Connected as ${activeRoleLabel}`
                    : "Read-only workspace"}
                </p>
                <p className="mt-0.5 text-xs opacity-80">
                  {activeAccount
                    ? activeRoleLabel === "NONE"
                      ? "You can view records, but a registered stakeholder role is required for protected actions."
                      : "Transaction permissions are enforced by the AgroChain smart contract."
                    : "Connect your wallet to submit transactions, create records, and manage the value chain."}
                </p>
              </div>
              {!activeAccount && (
                <button
                  type="button"
                  onClick={connectWallet}
                  disabled={isWalletConnecting}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        )}

        {isWorkspacePage && (!activeAccount || activeRoleLabel === "NONE") ? (
          <main className="mx-auto mt-6 mb-10 flex w-full max-w-3xl flex-1 items-center px-4 py-10 sm:mt-8 sm:px-6 sm:py-12 lg:px-8">
            <section className="w-full rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm sm:p-12">
              <span className="material-symbols-outlined rounded-2xl bg-emerald-50 p-3 text-3xl text-emerald-800">account_balance_wallet</span>
              <h1 className="mt-6 text-3xl font-bold text-emerald-950">{activeAccount ? "Stakeholder access required" : "Enter AgroChain"}</h1>
              <p className="mt-3 text-slate-600">{activeAccount ? "This wallet has no registered stakeholder role. Ask the platform administrator to assign one, or switch to a registered wallet." : "Connect a registered wallet to see your role and workspaces. Your wallet is your sign-in; there is no separate platform password."}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {!activeAccount && <button type="button" onClick={connectWallet} disabled={isWalletConnecting} className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50">{isWalletConnecting ? "Connecting…" : "Connect Wallet"}</button>}
                <button type="button" onClick={() => setActivePage("verify")} className="rounded-xl border border-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">Verify a Product without a wallet</button>
              </div>
              <p className="mt-6 text-xs text-slate-500">Product verification is public. Blockchain records are public even when displayed addresses are shortened.</p>
            </section>
          </main>
        ) : renderActivePage()}

        <Footer onOpenResource={(r) => setResourceModal(RESOURCE_CONTENT[r])} />
      </div>

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
