// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgroChain: Blockchain-Powered Smart Cassava and Maize Value Chain Ecosystem
 * @notice Sole product-scope authority: docs/AGROCHAIN_ANTIGRAVITY_IMPLEMENTATION_BRIEF.md
 * @dev Strict security implementation: zero backdoors, zero funds custody loopholes,
 *      role-based access controls, forward-only lifecycle validation, and auditable event trails.
 */
contract AgroChain {
    // ------------------------------------------------------------------------
    // Stakeholder Roles & Identity
    // ------------------------------------------------------------------------
    enum Role {
        NONE,                   // 0
        ADMINISTRATOR,          // 1
        FARMER,                 // 2
        INPUT_SUPPLIER,         // 3
        EXTENSION_OFFICER,      // 4
        STORAGE_OPERATOR,       // 5
        PROCESSOR,              // 6
        TRANSPORTER,            // 7
        DISTRIBUTOR,            // 8
        FINANCIAL_INSTITUTION,  // 9
        REGULATOR,              // 10
        CONSUMER                // 11
    }

    enum StakeholderStatus {
        PENDING,
        ACTIVE,
        SUSPENDED
    }

    struct Stakeholder {
        address wallet;
        string nameOrOrg;
        Role role;
        StakeholderStatus status;
        uint256 registeredAt;
        bool exists;
    }

    // ------------------------------------------------------------------------
    // Crops & Batch Lifecycle
    // ------------------------------------------------------------------------
    enum CropType {
        CASSAVA, // 0
        MAIZE    // 1
    }

    enum Stage {
        CREATED,            // 0 - Batch created/registered
        INPUT_VERIFIED,     // 1 - Agro-inputs linked & verified
        FARM_RECORDED,      // 2 - Farm activities & production logged
        HARVESTED,          // 3 - Harvest confirmed
        STORED,             // 4 - Storage conditions logged
        PROCESSED,          // 5 - Output processed & documented
        IN_TRANSIT,         // 6 - Logistics/transportation in progress
        DELIVERED,          // 7 - Delivery confirmed by recipient
        CONSUMER_VERIFIED   // 8 - Consumer scanned / public verification
    }

    struct Batch {
        uint256 batchId;
        CropType cropType;
        string originLocation;
        address producer;
        uint256 quantity;
        string unit;            // "kg", "tonnes", "bags"
        uint256 createdAt;
        address currentCustodian;
        Stage stage;
        string qualityGrade;    // "Grade A", "Standard", etc.
        bool exists;
    }

    // ------------------------------------------------------------------------
    // Agro-Input Authenticity
    // ------------------------------------------------------------------------
    struct AgroInput {
        string inputId;
        string supplierName;
        address supplierWallet;
        string inputType;        // "Seed", "Fertilizer", "Pesticide"
        CropType cropApplicability;
        string certReference;
        bool isVerified;
        address verifiedBy;
        uint256 registeredAt;
        bool exists;
    }

    // ------------------------------------------------------------------------
    // Storage & IoT Telemetry (Simulated or Real)
    // ------------------------------------------------------------------------
    struct StorageReading {
        uint256 batchId;
        string facility;
        int256 temperature;     // In degrees Celsius (e.g. 24)
        uint256 humidity;        // Relative humidity percent (e.g. 65)
        string sensorId;
        uint256 timestamp;
        bool isSimulated;
    }

    // ------------------------------------------------------------------------
    // Processing & Quality Records
    // ------------------------------------------------------------------------
    struct ProcessingRecord {
        uint256 batchId;
        address processor;
        string outputProduct;
        uint256 outputQuantity;
        string unit;
        string notes;
        uint256 processedAt;
        bool exists;
    }

    struct QualityCertificate {
        uint256 batchId;
        address certifier;
        string qualityGrade;
        string certReference;
        bool passed;
        string notes;
        uint256 certifiedAt;
        bool exists;
    }

    // ------------------------------------------------------------------------
    // Logistics & Shipments
    // ------------------------------------------------------------------------
    enum ShipmentStatus {
        CREATED,
        DISPATCHED,
        DELIVERED,
        CANCELLED
    }

    struct Shipment {
        uint256 shipmentId;
        uint256 batchId;
        address transporter;
        string originLocation;
        string destination;
        uint256 dispatchedAt;
        uint256 deliveredAt;
        ShipmentStatus status;
        bool exists;
    }

    // ------------------------------------------------------------------------
    // Marketplace: Listings & Procurement Orders
    // ------------------------------------------------------------------------
    enum ListingStatus {
        ACTIVE,
        FULFILLED,
        CANCELLED
    }

    struct Listing {
        uint256 listingId;
        uint256 batchId;
        address seller;
        CropType cropType;
        uint256 quantity;
        string unit;
        uint256 pricePerUnit;   // Demo currency units (e.g. NGN / kg)
        string location;
        string qualityGrade;
        ListingStatus status;
        uint256 createdAt;
        bool exists;
    }

    enum OrderStatus {
        PLACED,
        PAID,
        SHIPPED,
        COMPLETED,
        CANCELLED
    }

    struct Order {
        uint256 orderId;
        uint256 listingId;
        uint256 batchId;
        address buyer;
        address seller;
        uint256 quantity;
        uint256 totalPrice;
        OrderStatus status;
        uint256 createdAt;
        bool exists;
    }

    // ------------------------------------------------------------------------
    // Digital Payments & Insurance (Simulated Demonstrator Records)
    // ------------------------------------------------------------------------
    enum PaymentStatus {
        PENDING,
        SETTLED,
        REFUNDED,
        FAILED
    }

    struct PaymentRecord {
        uint256 paymentId;
        uint256 orderId;
        address payer;
        address payee;
        uint256 amount;
        string settlementUnit;   // "SIM-NGN", "SIM-USD"
        PaymentStatus status;
        bool isSimulated;
        uint256 timestamp;
        bool exists;
    }

    enum InsurancePolicyStatus {
        ACTIVE,
        EXPIRED,
        CLAIMED
    }

    enum ClaimStatus {
        NONE,
        FILED,
        APPROVED,
        REJECTED,
        SETTLED
    }

    struct InsuranceRecord {
        uint256 policyId;
        uint256 batchId;
        address insurer;
        address beneficiary;
        uint256 coverageAmount;
        InsurancePolicyStatus policyStatus;
        ClaimStatus claimStatus;
        bool isSimulated;
        uint256 createdAt;
        bool exists;
    }

    // ------------------------------------------------------------------------
    // Storage & State
    // ------------------------------------------------------------------------
    address public immutable admin;

    mapping(address => Stakeholder) public stakeholders;
    mapping(address => Role) public roles; // Backwards compatible convenience lookup
    address[] public stakeholderAddresses;

    mapping(uint256 => Batch) private batches;
    uint256[] public allBatchIds;

    mapping(string => AgroInput) private agroInputs;
    string[] public allInputIds;
    mapping(uint256 => string[]) private batchInputIds;

    StorageReading[] public storageReadings;
    mapping(uint256 => uint256[]) private batchStorageIndices;

    mapping(uint256 => ProcessingRecord) private processingRecords;
    mapping(uint256 => QualityCertificate) private qualityCertificates;

    mapping(uint256 => Shipment) private shipments;
    uint256[] public allShipmentIds;

    mapping(uint256 => Listing) private listings;
    uint256[] public allListingIds;

    mapping(uint256 => Order) private orders;
    uint256[] public allOrderIds;

    mapping(uint256 => PaymentRecord) private payments;
    uint256[] public allPaymentIds;

    mapping(uint256 => InsuranceRecord) private insurancePolicies;
    uint256[] public allPolicyIds;

    // ------------------------------------------------------------------------
    // Events (Audit Trails)
    // ------------------------------------------------------------------------
    event StakeholderRegistered(address indexed wallet, string nameOrOrg, Role role, StakeholderStatus status);
    event StakeholderStatusUpdated(address indexed wallet, StakeholderStatus newStatus);
    event RoleAssigned(address indexed user, Role role);

    event BatchCreated(uint256 indexed batchId, CropType indexed cropType, address indexed producer, uint256 quantity, string unit);
    event CustodyTransferred(uint256 indexed batchId, address indexed previousCustodian, address indexed newCustodian);
    event StageUpdated(uint256 indexed batchId, Stage newStage, address indexed updatedBy);

    event InputRegistered(string inputId, address indexed supplier, CropType cropApplicability, string inputType);
    event InputVerified(string inputId, address indexed verifiedBy);
    event InputLinked(uint256 indexed batchId, string inputId);

    event StorageReadingRecorded(uint256 indexed batchId, string facility, int256 temperature, uint256 humidity, bool isSimulated, uint256 timestamp);
    event ProcessingRecorded(uint256 indexed batchId, address indexed processor, string outputProduct, uint256 outputQuantity);
    event QualityCertified(uint256 indexed batchId, address indexed certifier, string qualityGrade, bool passed);

    event ShipmentCreated(uint256 indexed shipmentId, uint256 indexed batchId, address indexed transporter, string destination);
    event ShipmentDispatched(uint256 indexed shipmentId, uint256 indexed batchId);
    event ShipmentDelivered(uint256 indexed shipmentId, uint256 indexed batchId, address indexed recipient);

    event ListingCreated(uint256 indexed listingId, uint256 indexed batchId, address indexed seller, uint256 pricePerUnit);
    event ListingStatusUpdated(uint256 indexed listingId, ListingStatus status);
    event OrderPlaced(uint256 indexed orderId, uint256 indexed listingId, address indexed buyer, uint256 quantity);
    event OrderStatusUpdated(uint256 indexed orderId, OrderStatus status);

    event PaymentRecorded(uint256 indexed paymentId, uint256 indexed orderId, address indexed payer, address payee, uint256 amount);
    event PaymentSettled(uint256 indexed paymentId, uint256 indexed orderId);

    event InsurancePolicyIssued(uint256 indexed policyId, uint256 indexed batchId, address indexed insurer, address beneficiary, uint256 coverageAmount);
    event InsuranceClaimFiled(uint256 indexed policyId, uint256 indexed batchId, string reason);
    event InsuranceClaimSettled(uint256 indexed policyId, ClaimStatus status);

    // ------------------------------------------------------------------------
    // Modifiers & Access Controls
    // ------------------------------------------------------------------------
    modifier onlyAdmin() {
        require(msg.sender == admin, "AgroChain: Only admin permitted");
        _;
    }

    modifier onlyRole(Role requiredRole) {
        require(
            roles[msg.sender] == requiredRole || msg.sender == admin,
            "AgroChain: Caller does not have required role"
        );
        _;
    }

    modifier onlyActiveStakeholder() {
        require(
            stakeholders[msg.sender].status == StakeholderStatus.ACTIVE || msg.sender == admin,
            "AgroChain: Caller identity is not active"
        );
        _;
    }

    modifier batchExists(uint256 batchId) {
        require(batches[batchId].exists, "AgroChain: Batch does not exist");
        _;
    }

    modifier onlyCustodian(uint256 batchId) {
        require(
            batches[batchId].currentCustodian == msg.sender || msg.sender == admin,
            "AgroChain: Only current batch custodian permitted"
        );
        _;
    }

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.ADMINISTRATOR;
        stakeholders[msg.sender] = Stakeholder({
            wallet: msg.sender,
            nameOrOrg: "AgroChain System Authority",
            role: Role.ADMINISTRATOR,
            status: StakeholderStatus.ACTIVE,
            registeredAt: block.timestamp,
            exists: true
        });
        stakeholderAddresses.push(msg.sender);

        emit RoleAssigned(msg.sender, Role.ADMINISTRATOR);
        emit StakeholderRegistered(msg.sender, "AgroChain System Authority", Role.ADMINISTRATOR, StakeholderStatus.ACTIVE);
    }

    // ------------------------------------------------------------------------
    // Stakeholder & Identity Management
    // ------------------------------------------------------------------------
    function registerStakeholder(
        address wallet,
        string calldata nameOrOrg,
        Role role,
        StakeholderStatus status
    ) external onlyAdmin {
        require(wallet != address(0), "AgroChain: Zero address not permitted");
        require(role != Role.NONE, "AgroChain: Invalid role specified");
        require(bytes(nameOrOrg).length > 0, "AgroChain: Stakeholder name or organization required");

        if (!stakeholders[wallet].exists) {
            stakeholderAddresses.push(wallet);
        }

        stakeholders[wallet] = Stakeholder({
            wallet: wallet,
            nameOrOrg: nameOrOrg,
            role: role,
            status: status,
            registeredAt: block.timestamp,
            exists: true
        });
        roles[wallet] = role;

        emit RoleAssigned(wallet, role);
        emit StakeholderRegistered(wallet, nameOrOrg, role, status);
    }

    function assignRole(address user, Role role) external onlyAdmin {
        require(user != address(0), "AgroChain: Zero address not permitted");
        require(role != Role.NONE, "AgroChain: Invalid role specified");

        roles[user] = role;
        if (stakeholders[user].exists) {
            stakeholders[user].role = role;
        } else {
            stakeholders[user] = Stakeholder({
                wallet: user,
                nameOrOrg: "Assigned Stakeholder",
                role: role,
                status: StakeholderStatus.ACTIVE,
                registeredAt: block.timestamp,
                exists: true
            });
            stakeholderAddresses.push(user);
        }

        emit RoleAssigned(user, role);
        emit StakeholderRegistered(user, stakeholders[user].nameOrOrg, role, stakeholders[user].status);
    }

    function updateStakeholderStatus(address wallet, StakeholderStatus newStatus) external onlyAdmin {
        require(stakeholders[wallet].exists, "AgroChain: Stakeholder does not exist");
        stakeholders[wallet].status = newStatus;
        emit StakeholderStatusUpdated(wallet, newStatus);
    }

    function getStakeholder(address wallet) external view returns (Stakeholder memory) {
        require(stakeholders[wallet].exists, "AgroChain: Stakeholder not found");
        return stakeholders[wallet];
    }

    function getStakeholderCount() external view returns (uint256) {
        return stakeholderAddresses.length;
    }

    // ------------------------------------------------------------------------
    // Batch Traceability & Provenance
    // ------------------------------------------------------------------------
    function createBatch(
        uint256 batchId,
        CropType cropType,
        string calldata originLocation,
        uint256 quantity,
        string calldata unit,
        string calldata qualityGrade
    ) external onlyActiveStakeholder {
        require(
            roles[msg.sender] == Role.FARMER || msg.sender == admin,
            "AgroChain: Only active Farmer or Admin can create crop batch"
        );
        require(!batches[batchId].exists, "AgroChain: Batch ID already exists");
        require(batchId > 0, "AgroChain: Invalid batch ID");
        require(bytes(originLocation).length > 0, "AgroChain: Origin location required");
        require(quantity > 0, "AgroChain: Quantity must be greater than zero");
        require(bytes(unit).length > 0, "AgroChain: Unit is required");

        batches[batchId] = Batch({
            batchId: batchId,
            cropType: cropType,
            originLocation: originLocation,
            producer: msg.sender,
            quantity: quantity,
            unit: unit,
            createdAt: block.timestamp,
            currentCustodian: msg.sender,
            stage: Stage.CREATED,
            qualityGrade: bytes(qualityGrade).length > 0 ? qualityGrade : "Standard",
            exists: true
        });

        allBatchIds.push(batchId);

        emit BatchCreated(batchId, cropType, msg.sender, quantity, unit);
        emit StageUpdated(batchId, Stage.CREATED, msg.sender);
    }

    function transferCustody(
        uint256 batchId,
        address newCustodian
    ) external batchExists(batchId) onlyCustodian(batchId) {
        require(newCustodian != address(0), "AgroChain: Zero address not permitted");
        require(newCustodian != msg.sender, "AgroChain: Cannot transfer custody to self");
        require(stakeholders[newCustodian].exists, "AgroChain: New custodian must be registered");
        require(
            stakeholders[newCustodian].status == StakeholderStatus.ACTIVE,
            "AgroChain: New custodian identity is not active"
        );

        Batch storage batch = batches[batchId];
        require(batch.stage != Stage.DELIVERED, "AgroChain: Custody transfer locked after final delivery");
        require(batch.stage != Stage.CONSUMER_VERIFIED, "AgroChain: Custody transfer locked after consumer verification");

        address previousCustodian = batch.currentCustodian;
        batch.currentCustodian = newCustodian;

        emit CustodyTransferred(batchId, previousCustodian, newCustodian);
    }

    function advanceStage(
        uint256 batchId,
        Stage newStage
    ) external batchExists(batchId) {
        Batch storage batch = batches[batchId];

        require(uint8(newStage) > uint8(batch.stage), "AgroChain: Lifecycle stage must advance forward");
        require(batch.stage != Stage.CONSUMER_VERIFIED, "AgroChain: Batch lifecycle already finalized");

        // Role enforcement per stage transition
        if (newStage == Stage.INPUT_VERIFIED) {
            require(
                roles[msg.sender] == Role.INPUT_SUPPLIER || roles[msg.sender] == Role.EXTENSION_OFFICER || msg.sender == admin,
                "AgroChain: Role unauthorized for input verification stage"
            );
        } else if (newStage == Stage.FARM_RECORDED || newStage == Stage.HARVESTED) {
            require(
                roles[msg.sender] == Role.FARMER || roles[msg.sender] == Role.EXTENSION_OFFICER || msg.sender == admin,
                "AgroChain: Role unauthorized for farm/harvest stage"
            );
        } else if (newStage == Stage.STORED) {
            require(
                roles[msg.sender] == Role.STORAGE_OPERATOR || msg.sender == admin || msg.sender == batch.currentCustodian,
                "AgroChain: Role unauthorized for storage stage"
            );
        } else if (newStage == Stage.PROCESSED) {
            require(
                roles[msg.sender] == Role.PROCESSOR || msg.sender == admin,
                "AgroChain: Role unauthorized for processing stage"
            );
        } else if (newStage == Stage.IN_TRANSIT) {
            require(
                roles[msg.sender] == Role.TRANSPORTER || roles[msg.sender] == Role.DISTRIBUTOR || msg.sender == admin,
                "AgroChain: Role unauthorized for logistics stage"
            );
        } else if (newStage == Stage.DELIVERED) {
            require(
                roles[msg.sender] == Role.TRANSPORTER || roles[msg.sender] == Role.DISTRIBUTOR || msg.sender == admin,
                "AgroChain: Role unauthorized for delivery stage"
            );
        }

        batch.stage = newStage;
        emit StageUpdated(batchId, newStage, msg.sender);
    }

    function recordConsumerVerification(uint256 batchId) external batchExists(batchId) {
        Batch storage batch = batches[batchId];
        if (batch.stage < Stage.CONSUMER_VERIFIED) {
            batch.stage = Stage.CONSUMER_VERIFIED;
            emit StageUpdated(batchId, Stage.CONSUMER_VERIFIED, msg.sender);
        }
    }

    // ------------------------------------------------------------------------
    // Agro-Input Authenticity
    // ------------------------------------------------------------------------
    function registerAgroInput(
        string calldata inputId,
        string calldata supplierName,
        string calldata inputType,
        CropType cropApplicability,
        string calldata certReference
    ) external onlyActiveStakeholder {
        require(
            roles[msg.sender] == Role.INPUT_SUPPLIER || msg.sender == admin,
            "AgroChain: Only Input Supplier or Admin can register agro-input"
        );
        require(bytes(inputId).length > 0, "AgroChain: Input ID required");
        require(!agroInputs[inputId].exists, "AgroChain: Input ID already registered");
        require(bytes(supplierName).length > 0, "AgroChain: Supplier name required");
        require(bytes(inputType).length > 0, "AgroChain: Input type required");

        agroInputs[inputId] = AgroInput({
            inputId: inputId,
            supplierName: supplierName,
            supplierWallet: msg.sender,
            inputType: inputType,
            cropApplicability: cropApplicability,
            certReference: certReference,
            isVerified: false,
            verifiedBy: address(0),
            registeredAt: block.timestamp,
            exists: true
        });

        allInputIds.push(inputId);

        emit InputRegistered(inputId, msg.sender, cropApplicability, inputType);
    }

    function verifyAgroInput(string calldata inputId) external onlyActiveStakeholder {
        require(
            roles[msg.sender] == Role.REGULATOR ||
            roles[msg.sender] == Role.EXTENSION_OFFICER ||
            msg.sender == admin,
            "AgroChain: Only Regulator, Extension Officer, or Admin can verify agro-input"
        );
        require(agroInputs[inputId].exists, "AgroChain: Agro-input not found");
        require(!agroInputs[inputId].isVerified, "AgroChain: Agro-input already verified");

        agroInputs[inputId].isVerified = true;
        agroInputs[inputId].verifiedBy = msg.sender;

        emit InputVerified(inputId, msg.sender);
    }

    function linkInputToBatch(
        uint256 batchId,
        string calldata inputId
    ) external batchExists(batchId) onlyActiveStakeholder {
        require(agroInputs[inputId].exists, "AgroChain: Agro-input not found");
        require(
            msg.sender == batches[batchId].currentCustodian ||
            roles[msg.sender] == Role.FARMER ||
            roles[msg.sender] == Role.INPUT_SUPPLIER ||
            roles[msg.sender] == Role.EXTENSION_OFFICER ||
            msg.sender == admin,
            "AgroChain: Caller unauthorized to link input to batch"
        );

        batchInputIds[batchId].push(inputId);

        if (batches[batchId].stage < Stage.INPUT_VERIFIED) {
            batches[batchId].stage = Stage.INPUT_VERIFIED;
            emit StageUpdated(batchId, Stage.INPUT_VERIFIED, msg.sender);
        }

        emit InputLinked(batchId, inputId);
    }

    function getBatchInputIds(uint256 batchId) external view batchExists(batchId) returns (string[] memory) {
        return batchInputIds[batchId];
    }

    function getAgroInput(string calldata inputId) external view returns (AgroInput memory) {
        require(agroInputs[inputId].exists, "AgroChain: Agro-input not found");
        return agroInputs[inputId];
    }

    // ------------------------------------------------------------------------
    // Storage & IoT Telemetry
    // ------------------------------------------------------------------------
    function recordStorageReading(
        uint256 batchId,
        string calldata facility,
        int256 temperature,
        uint256 humidity,
        string calldata sensorId,
        bool isSimulated
    ) external batchExists(batchId) onlyActiveStakeholder {
        require(
            roles[msg.sender] == Role.STORAGE_OPERATOR ||
            roles[msg.sender] == Role.FARMER ||
            msg.sender == batches[batchId].currentCustodian ||
            msg.sender == admin,
            "AgroChain: Unauthorized to log storage readings"
        );
        require(bytes(facility).length > 0, "AgroChain: Storage facility name required");
        require(humidity <= 100, "AgroChain: Invalid relative humidity percentage");

        storageReadings.push(StorageReading({
            batchId: batchId,
            facility: facility,
            temperature: temperature,
            humidity: humidity,
            sensorId: sensorId,
            timestamp: block.timestamp,
            isSimulated: isSimulated
        }));

        batchStorageIndices[batchId].push(storageReadings.length - 1);

        if (batches[batchId].stage < Stage.STORED) {
            batches[batchId].stage = Stage.STORED;
            emit StageUpdated(batchId, Stage.STORED, msg.sender);
        }

        emit StorageReadingRecorded(batchId, facility, temperature, humidity, isSimulated, block.timestamp);
    }

    function getBatchStorageReadingsCount(uint256 batchId) external view batchExists(batchId) returns (uint256) {
        return batchStorageIndices[batchId].length;
    }

    // ------------------------------------------------------------------------
    // Processing & Quality Assurance
    // ------------------------------------------------------------------------
    function recordProcessing(
        uint256 batchId,
        string calldata outputProduct,
        uint256 outputQuantity,
        string calldata unit,
        string calldata notes
    ) external batchExists(batchId) onlyActiveStakeholder {
        require(
            roles[msg.sender] == Role.PROCESSOR || msg.sender == admin,
            "AgroChain: Only Processor or Admin can record processing events"
        );
        require(bytes(outputProduct).length > 0, "AgroChain: Output product name required");
        require(outputQuantity > 0, "AgroChain: Output quantity must be positive");

        processingRecords[batchId] = ProcessingRecord({
            batchId: batchId,
            processor: msg.sender,
            outputProduct: outputProduct,
            outputQuantity: outputQuantity,
            unit: bytes(unit).length > 0 ? unit : "kg",
            notes: notes,
            processedAt: block.timestamp,
            exists: true
        });

        if (batches[batchId].stage < Stage.PROCESSED) {
            batches[batchId].stage = Stage.PROCESSED;
            emit StageUpdated(batchId, Stage.PROCESSED, msg.sender);
        }

        emit ProcessingRecorded(batchId, msg.sender, outputProduct, outputQuantity);
    }

    function recordQualityCertificate(
        uint256 batchId,
        string calldata qualityGrade,
        string calldata certReference,
        bool passed,
        string calldata notes
    ) external batchExists(batchId) onlyActiveStakeholder {
        require(
            roles[msg.sender] == Role.REGULATOR ||
            roles[msg.sender] == Role.EXTENSION_OFFICER ||
            msg.sender == admin,
            "AgroChain: Only Regulator, Extension Officer, or Admin can record quality certification"
        );
        require(bytes(qualityGrade).length > 0, "AgroChain: Quality grade required");

        qualityCertificates[batchId] = QualityCertificate({
            batchId: batchId,
            certifier: msg.sender,
            qualityGrade: qualityGrade,
            certReference: certReference,
            passed: passed,
            notes: notes,
            certifiedAt: block.timestamp,
            exists: true
        });

        batches[batchId].qualityGrade = qualityGrade;

        emit QualityCertified(batchId, msg.sender, qualityGrade, passed);
    }

    function getProcessingRecord(uint256 batchId) external view batchExists(batchId) returns (ProcessingRecord memory) {
        return processingRecords[batchId];
    }

    function getQualityCertificate(uint256 batchId) external view batchExists(batchId) returns (QualityCertificate memory) {
        return qualityCertificates[batchId];
    }

    // ------------------------------------------------------------------------
    // Logistics & Shipments
    // ------------------------------------------------------------------------
    function createShipment(
        uint256 shipmentId,
        uint256 batchId,
        address transporter,
        string calldata originLocation,
        string calldata destination
    ) external batchExists(batchId) onlyActiveStakeholder {
        require(shipmentId > 0, "AgroChain: Invalid shipment ID");
        require(!shipments[shipmentId].exists, "AgroChain: Shipment ID already exists");
        require(transporter != address(0), "AgroChain: Transporter required");
        require(
            roles[transporter] == Role.TRANSPORTER || transporter == msg.sender,
            "AgroChain: Designated transporter must have TRANSPORTER role"
        );
        require(
            msg.sender == batches[batchId].currentCustodian ||
            roles[msg.sender] == Role.DISTRIBUTOR ||
            roles[msg.sender] == Role.TRANSPORTER ||
            msg.sender == admin,
            "AgroChain: Unauthorized to create shipment for batch"
        );

        shipments[shipmentId] = Shipment({
            shipmentId: shipmentId,
            batchId: batchId,
            transporter: transporter,
            originLocation: originLocation,
            destination: destination,
            dispatchedAt: block.timestamp,
            deliveredAt: 0,
            status: ShipmentStatus.DISPATCHED,
            exists: true
        });

        allShipmentIds.push(shipmentId);

        batches[batchId].currentCustodian = transporter;
        if (batches[batchId].stage < Stage.IN_TRANSIT) {
            batches[batchId].stage = Stage.IN_TRANSIT;
            emit StageUpdated(batchId, Stage.IN_TRANSIT, msg.sender);
        }

        emit ShipmentCreated(shipmentId, batchId, transporter, destination);
        emit ShipmentDispatched(shipmentId, batchId);
    }

    function confirmShipmentDelivery(
        uint256 shipmentId,
        address recipient
    ) external onlyActiveStakeholder {
        require(shipments[shipmentId].exists, "AgroChain: Shipment not found");
        require(recipient != address(0), "AgroChain: Recipient address required");

        Shipment storage shipment = shipments[shipmentId];
        require(shipment.status == ShipmentStatus.DISPATCHED, "AgroChain: Shipment not in dispatched state");
        require(
            msg.sender == shipment.transporter ||
            msg.sender == recipient ||
            roles[msg.sender] == Role.DISTRIBUTOR ||
            msg.sender == admin,
            "AgroChain: Unauthorized to confirm delivery"
        );

        shipment.status = ShipmentStatus.DELIVERED;
        shipment.deliveredAt = block.timestamp;

        Batch storage batch = batches[shipment.batchId];
        batch.currentCustodian = recipient;
        if (batch.stage < Stage.DELIVERED) {
            batch.stage = Stage.DELIVERED;
            emit StageUpdated(shipment.batchId, Stage.DELIVERED, msg.sender);
        }

        emit ShipmentDelivered(shipmentId, shipment.batchId, recipient);
    }

    function getShipment(uint256 shipmentId) external view returns (Shipment memory) {
        require(shipments[shipmentId].exists, "AgroChain: Shipment not found");
        return shipments[shipmentId];
    }

    // ------------------------------------------------------------------------
    // Agricultural Marketplace (Listings & Procurement Orders)
    // ------------------------------------------------------------------------
    function createListing(
        uint256 listingId,
        uint256 batchId,
        uint256 quantity,
        string calldata unit,
        uint256 pricePerUnit,
        string calldata location,
        string calldata qualityGrade
    ) external batchExists(batchId) onlyActiveStakeholder {
        require(listingId > 0, "AgroChain: Invalid listing ID");
        require(!listings[listingId].exists, "AgroChain: Listing ID already exists");
        require(quantity > 0, "AgroChain: Quantity must be greater than zero");
        require(pricePerUnit > 0, "AgroChain: Price must be positive");
        require(
            msg.sender == batches[batchId].currentCustodian ||
            roles[msg.sender] == Role.FARMER ||
            roles[msg.sender] == Role.PROCESSOR ||
            msg.sender == admin,
            "AgroChain: Unauthorized to list batch"
        );

        listings[listingId] = Listing({
            listingId: listingId,
            batchId: batchId,
            seller: msg.sender,
            cropType: batches[batchId].cropType,
            quantity: quantity,
            unit: bytes(unit).length > 0 ? unit : batches[batchId].unit,
            pricePerUnit: pricePerUnit,
            location: bytes(location).length > 0 ? location : batches[batchId].originLocation,
            qualityGrade: bytes(qualityGrade).length > 0 ? qualityGrade : batches[batchId].qualityGrade,
            status: ListingStatus.ACTIVE,
            createdAt: block.timestamp,
            exists: true
        });

        allListingIds.push(listingId);

        emit ListingCreated(listingId, batchId, msg.sender, pricePerUnit);
    }

    function createOrder(
        uint256 orderId,
        uint256 listingId,
        uint256 quantity
    ) external onlyActiveStakeholder {
        require(orderId > 0, "AgroChain: Invalid order ID");
        require(!orders[orderId].exists, "AgroChain: Order ID already exists");
        require(listings[listingId].exists, "AgroChain: Listing does not exist");
        Listing storage listing = listings[listingId];
        require(listing.status == ListingStatus.ACTIVE, "AgroChain: Listing is not active");
        require(quantity > 0 && quantity <= listing.quantity, "AgroChain: Invalid order quantity");
        require(msg.sender != listing.seller, "AgroChain: Cannot order own listing");

        uint256 totalPrice = quantity * listing.pricePerUnit;

        orders[orderId] = Order({
            orderId: orderId,
            listingId: listingId,
            batchId: listing.batchId,
            buyer: msg.sender,
            seller: listing.seller,
            quantity: quantity,
            totalPrice: totalPrice,
            status: OrderStatus.PLACED,
            createdAt: block.timestamp,
            exists: true
        });

        allOrderIds.push(orderId);

        emit OrderPlaced(orderId, listingId, msg.sender, quantity);
    }

    function updateOrderStatus(uint256 orderId, OrderStatus newStatus) external onlyActiveStakeholder {
        require(orders[orderId].exists, "AgroChain: Order not found");
        Order storage order = orders[orderId];
        require(
            msg.sender == order.buyer || msg.sender == order.seller || msg.sender == admin,
            "AgroChain: Unauthorized to update order"
        );

        order.status = newStatus;
        emit OrderStatusUpdated(orderId, newStatus);
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        require(listings[listingId].exists, "AgroChain: Listing not found");
        return listings[listingId];
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        require(orders[orderId].exists, "AgroChain: Order not found");
        return orders[orderId];
    }

    // ------------------------------------------------------------------------
    // Demonstrable Simulated Payments & Insurance Records
    // ------------------------------------------------------------------------
    function recordPayment(
        uint256 paymentId,
        uint256 orderId,
        address payee,
        uint256 amount,
        string calldata settlementUnit
    ) external onlyActiveStakeholder {
        require(paymentId > 0, "AgroChain: Invalid payment ID");
        require(!payments[paymentId].exists, "AgroChain: Payment ID already exists");
        require(orders[orderId].exists, "AgroChain: Order not found");
        require(payee != address(0), "AgroChain: Invalid payee address");
        require(amount > 0, "AgroChain: Payment amount must be positive");

        payments[paymentId] = PaymentRecord({
            paymentId: paymentId,
            orderId: orderId,
            payer: msg.sender,
            payee: payee,
            amount: amount,
            settlementUnit: bytes(settlementUnit).length > 0 ? settlementUnit : "SIM-NGN",
            status: PaymentStatus.SETTLED, // Local demonstration mode settlements are instant
            isSimulated: true,
            timestamp: block.timestamp,
            exists: true
        });

        allPaymentIds.push(paymentId);
        orders[orderId].status = OrderStatus.PAID;

        emit PaymentRecorded(paymentId, orderId, msg.sender, payee, amount);
        emit PaymentSettled(paymentId, orderId);
        emit OrderStatusUpdated(orderId, OrderStatus.PAID);
    }

    function issueInsurancePolicy(
        uint256 policyId,
        uint256 batchId,
        address beneficiary,
        uint256 coverageAmount
    ) external batchExists(batchId) onlyActiveStakeholder {
        require(
            roles[msg.sender] == Role.FINANCIAL_INSTITUTION || msg.sender == admin,
            "AgroChain: Only Financial Institution or Admin can issue insurance policy"
        );
        require(policyId > 0, "AgroChain: Invalid policy ID");
        require(!insurancePolicies[policyId].exists, "AgroChain: Policy ID already exists");
        require(beneficiary != address(0), "AgroChain: Invalid beneficiary address");
        require(coverageAmount > 0, "AgroChain: Coverage amount must be positive");

        insurancePolicies[policyId] = InsuranceRecord({
            policyId: policyId,
            batchId: batchId,
            insurer: msg.sender,
            beneficiary: beneficiary,
            coverageAmount: coverageAmount,
            policyStatus: InsurancePolicyStatus.ACTIVE,
            claimStatus: ClaimStatus.NONE,
            isSimulated: true,
            createdAt: block.timestamp,
            exists: true
        });

        allPolicyIds.push(policyId);

        emit InsurancePolicyIssued(policyId, batchId, msg.sender, beneficiary, coverageAmount);
    }

    function fileInsuranceClaim(uint256 policyId, string calldata reason) external onlyActiveStakeholder {
        require(insurancePolicies[policyId].exists, "AgroChain: Policy not found");
        InsuranceRecord storage policy = insurancePolicies[policyId];
        require(
            msg.sender == policy.beneficiary || msg.sender == admin,
            "AgroChain: Only beneficiary or Admin can file claim"
        );
        require(policy.policyStatus == InsurancePolicyStatus.ACTIVE, "AgroChain: Policy is not active");
        require(policy.claimStatus == ClaimStatus.NONE, "AgroChain: Claim already filed");

        policy.claimStatus = ClaimStatus.FILED;
        emit InsuranceClaimFiled(policyId, policy.batchId, reason);
    }

    function settleInsuranceClaim(uint256 policyId, bool approved) external onlyActiveStakeholder {
        require(insurancePolicies[policyId].exists, "AgroChain: Policy not found");
        InsuranceRecord storage policy = insurancePolicies[policyId];
        require(
            msg.sender == policy.insurer || msg.sender == admin,
            "AgroChain: Only issuing insurer or Admin can settle claim"
        );
        require(policy.claimStatus == ClaimStatus.FILED, "AgroChain: Claim not pending");

        if (approved) {
            policy.claimStatus = ClaimStatus.SETTLED;
            policy.policyStatus = InsurancePolicyStatus.CLAIMED;
        } else {
            policy.claimStatus = ClaimStatus.REJECTED;
        }

        emit InsuranceClaimSettled(policyId, policy.claimStatus);
    }

    function getPayment(uint256 paymentId) external view returns (PaymentRecord memory) {
        require(payments[paymentId].exists, "AgroChain: Payment not found");
        return payments[paymentId];
    }

    function getInsurancePolicy(uint256 policyId) external view returns (InsuranceRecord memory) {
        require(insurancePolicies[policyId].exists, "AgroChain: Policy not found");
        return insurancePolicies[policyId];
    }

    // ------------------------------------------------------------------------
    // Comprehensive Batch Views & Backwards Compatibility
    // ------------------------------------------------------------------------
    function getBatch(uint256 batchId) external view batchExists(batchId) returns (
        uint256,
        string memory,
        uint256,
        uint256,
        address,
        Stage,
        bool
    ) {
        Batch memory b = batches[batchId];
        return (
            b.batchId,
            b.originLocation,
            b.quantity,
            b.createdAt,
            b.currentCustodian,
            b.stage,
            b.exists
        );
    }

    function getAgroBatch(uint256 batchId) external view batchExists(batchId) returns (Batch memory) {
        return batches[batchId];
    }

    function getAllBatchCount() external view returns (uint256) {
        return allBatchIds.length;
    }
}
