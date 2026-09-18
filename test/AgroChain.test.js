import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgroChain Smart Contract Suite", function () {
  let agroChain;
  let admin, farmer, inputSupplier, extensionOfficer, storageOp, processor, transporter, distributor, financier, regulator, consumer, unauthorized;

  // Enum mappings matching AgroChain.sol
  const Role = {
    NONE: 0,
    ADMINISTRATOR: 1,
    FARMER: 2,
    INPUT_SUPPLIER: 3,
    EXTENSION_OFFICER: 4,
    STORAGE_OPERATOR: 5,
    PROCESSOR: 6,
    TRANSPORTER: 7,
    DISTRIBUTOR: 8,
    FINANCIAL_INSTITUTION: 9,
    REGULATOR: 10,
    CONSUMER: 11,
  };

  const StakeholderStatus = {
    PENDING: 0,
    ACTIVE: 1,
    SUSPENDED: 2,
  };

  const CropType = {
    CASSAVA: 0,
    MAIZE: 1,
  };

  const Stage = {
    CREATED: 0,
    INPUT_VERIFIED: 1,
    FARM_RECORDED: 2,
    HARVESTED: 3,
    STORED: 4,
    PROCESSED: 5,
    IN_TRANSIT: 6,
    DELIVERED: 7,
    CONSUMER_VERIFIED: 8,
  };

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    [
      admin,
      farmer,
      inputSupplier,
      extensionOfficer,
      storageOp,
      processor,
      transporter,
      distributor,
      financier,
      regulator,
      consumer,
      unauthorized,
    ] = signers;

    const AgroChainFactory = await ethers.getContractFactory("AgroChain");
    agroChain = await AgroChainFactory.deploy();
    await agroChain.waitForDeployment();

    // Register primary stakeholder identities
    await agroChain.registerStakeholder(farmer.address, "Green Valley Farms", Role.FARMER, StakeholderStatus.ACTIVE);
    await agroChain.registerStakeholder(inputSupplier.address, "AgroSeeds Ltd", Role.INPUT_SUPPLIER, StakeholderStatus.ACTIVE);
    await agroChain.registerStakeholder(extensionOfficer.address, "State Extension Office", Role.EXTENSION_OFFICER, StakeholderStatus.ACTIVE);
    await agroChain.registerStakeholder(storageOp.address, "Central Silos & Storage", Role.STORAGE_OPERATOR, StakeholderStatus.ACTIVE);
    await agroChain.registerStakeholder(processor.address, "Sunrise Agro Processors", Role.PROCESSOR, StakeholderStatus.ACTIVE);
    await agroChain.registerStakeholder(transporter.address, "Swift Haulage Logistics", Role.TRANSPORTER, StakeholderStatus.ACTIVE);
    await agroChain.registerStakeholder(distributor.address, "Apex Foods Distribution", Role.DISTRIBUTOR, StakeholderStatus.ACTIVE);
    await agroChain.registerStakeholder(financier.address, "AgriCredit Bank", Role.FINANCIAL_INSTITUTION, StakeholderStatus.ACTIVE);
    await agroChain.registerStakeholder(regulator.address, "National Food Safety Board", Role.REGULATOR, StakeholderStatus.ACTIVE);
    await agroChain.registerStakeholder(consumer.address, "Verified Consumer", Role.CONSUMER, StakeholderStatus.ACTIVE);
  });

  describe("1. Deployment & Stakeholder Authorization", function () {
    it("should initialize admin correctly and record 11 registered stakeholders", async function () {
      expect(await agroChain.admin()).to.equal(admin.address);
      expect(await agroChain.roles(admin.address)).to.equal(Role.ADMINISTRATOR);
      const count = await agroChain.getStakeholderCount();
      expect(count).to.equal(11n);
    });

    it("should prevent non-admin from registering stakeholders", async function () {
      await expect(
        agroChain.connect(unauthorized).registerStakeholder(
          unauthorized.address,
          "Rogue Org",
          Role.FARMER,
          StakeholderStatus.ACTIVE
        )
      ).to.be.revertedWith("AgroChain: Only admin permitted");
    });

    it("should reject zero address for stakeholder registration", async function () {
      await expect(
        agroChain.registerStakeholder(
          ethers.ZeroAddress,
          "Zero Address Org",
          Role.FARMER,
          StakeholderStatus.ACTIVE
        )
      ).to.be.revertedWith("AgroChain: Zero address not permitted");
    });

    it("should allow admin to suspend and reactivate a stakeholder", async function () {
      await agroChain.updateStakeholderStatus(farmer.address, StakeholderStatus.SUSPENDED);
      const suspended = await agroChain.getStakeholder(farmer.address);
      expect(suspended.status).to.equal(StakeholderStatus.SUSPENDED);

      // Suspended stakeholder cannot create batch
      await expect(
        agroChain.connect(farmer).createBatch(101n, CropType.CASSAVA, "Oyo, Nigeria", 5000n, "kg", "Grade A")
      ).to.be.revertedWith("AgroChain: Caller identity is not active");

      // Reactivate
      await agroChain.updateStakeholderStatus(farmer.address, StakeholderStatus.ACTIVE);
      await expect(
        agroChain.connect(farmer).createBatch(101n, CropType.CASSAVA, "Oyo, Nigeria", 5000n, "kg", "Grade A")
      ).to.emit(agroChain, "BatchCreated");
    });
  });

  describe("2. Dual-Crop Batch Traceability (Cassava & Maize)", function () {
    it("should allow a Farmer to create a Cassava batch and inspect provenance", async function () {
      const batchId = 20261001n;
      await expect(
        agroChain.connect(farmer).createBatch(batchId, CropType.CASSAVA, "Ibadan, Nigeria", 3500n, "kg", "Grade A Premium")
      )
        .to.emit(agroChain, "BatchCreated")
        .withArgs(batchId, CropType.CASSAVA, farmer.address, 3500n, "kg");

      const batch = await agroChain.getAgroBatch(batchId);
      expect(batch.batchId).to.equal(batchId);
      expect(batch.cropType).to.equal(CropType.CASSAVA);
      expect(batch.quantity).to.equal(3500n);
      expect(batch.unit).to.equal("kg");
      expect(batch.producer).to.equal(farmer.address);
      expect(batch.currentCustodian).to.equal(farmer.address);
      expect(batch.stage).to.equal(Stage.CREATED);
    });

    it("should allow a Farmer to create a Maize batch", async function () {
      const batchId = 20262001n;
      await expect(
        agroChain.connect(farmer).createBatch(batchId, CropType.MAIZE, "Kaduna, Nigeria", 12000n, "kg", "Grade A Yellow Maize")
      )
        .to.emit(agroChain, "BatchCreated")
        .withArgs(batchId, CropType.MAIZE, farmer.address, 12000n, "kg");

      const batch = await agroChain.getAgroBatch(batchId);
      expect(batch.cropType).to.equal(CropType.MAIZE);
      expect(batch.quantity).to.equal(12000n);
    });

    it("should prevent duplicate batch IDs", async function () {
      const batchId = 20263001n;
      await agroChain.connect(farmer).createBatch(batchId, CropType.CASSAVA, "Abeokuta, Nigeria", 2000n, "kg", "Grade B");
      await expect(
        agroChain.connect(farmer).createBatch(batchId, CropType.CASSAVA, "Abeokuta, Nigeria", 2000n, "kg", "Grade B")
      ).to.be.revertedWith("AgroChain: Batch ID already exists");
    });

    it("should reject unauthorized callers from creating batches", async function () {
      await expect(
        agroChain.connect(unauthorized).createBatch(9999n, CropType.CASSAVA, "Unknown", 1000n, "kg", "Standard")
      ).to.be.revertedWith("AgroChain: Caller identity is not active");
    });

    it("should support forward custody transfers between active registered stakeholders", async function () {
      const batchId = 20264001n;
      await agroChain.connect(farmer).createBatch(batchId, CropType.CASSAVA, "Ondo, Nigeria", 4000n, "kg", "Grade A");

      // Custody transfer from Farmer to Processor
      await expect(agroChain.connect(farmer).transferCustody(batchId, processor.address))
        .to.emit(agroChain, "CustodyTransferred")
        .withArgs(batchId, farmer.address, processor.address);

      const batch = await agroChain.getAgroBatch(batchId);
      expect(batch.currentCustodian).to.equal(processor.address);
    });

    it("should reject custody transfer to self or unregistered address", async function () {
      const batchId = 20264002n;
      await agroChain.connect(farmer).createBatch(batchId, CropType.MAIZE, "Kano, Nigeria", 8000n, "kg", "Grade A");

      await expect(agroChain.connect(farmer).transferCustody(batchId, farmer.address))
        .to.be.revertedWith("AgroChain: Cannot transfer custody to self");

      await expect(agroChain.connect(farmer).transferCustody(batchId, unauthorized.address))
        .to.be.revertedWith("AgroChain: New custodian must be registered");
    });
  });

  describe("3. Agro-Input Authenticity & Linking", function () {
    const inputId = "SEED-MAIZE-2026-01";

    it("should allow Input Supplier to register certified inputs", async function () {
      await expect(
        agroChain.connect(inputSupplier).registerAgroInput(
          inputId,
          "AgroSeeds Ltd",
          "Certified Hybrid Seed",
          CropType.MAIZE,
          "CERT-NASC-2026-88"
        )
      )
        .to.emit(agroChain, "InputRegistered")
        .withArgs(inputId, inputSupplier.address, CropType.MAIZE, "Certified Hybrid Seed");

      const input = await agroChain.getAgroInput(inputId);
      expect(input.supplierName).to.equal("AgroSeeds Ltd");
      expect(input.isVerified).to.be.false;
    });

    it("should allow Regulator or Extension Officer to verify agro-inputs", async function () {
      await agroChain.connect(inputSupplier).registerAgroInput(
        "FERT-NPK-2026",
        "Fertilizer Corp",
        "Organic Soil Fertilizer",
        CropType.CASSAVA,
        "CERT-SON-992"
      );

      await expect(agroChain.connect(regulator).verifyAgroInput("FERT-NPK-2026"))
        .to.emit(agroChain, "InputVerified")
        .withArgs("FERT-NPK-2026", regulator.address);

      const input = await agroChain.getAgroInput("FERT-NPK-2026");
      expect(input.isVerified).to.be.true;
      expect(input.verifiedBy).to.equal(regulator.address);
    });

    it("should link verified input to a batch and advance stage to INPUT_VERIFIED", async function () {
      const batchId = 20265001n;
      await agroChain.connect(farmer).createBatch(batchId, CropType.MAIZE, "Benue, Nigeria", 6000n, "kg", "Grade A");

      await agroChain.connect(inputSupplier).registerAgroInput(
        "SEED-LINK-01",
        "AgroSeeds",
        "Hybrid Maize",
        CropType.MAIZE,
        "CERT-REF-01"
      );

      await expect(agroChain.connect(farmer).linkInputToBatch(batchId, "SEED-LINK-01"))
        .to.emit(agroChain, "InputLinked")
        .withArgs(batchId, "SEED-LINK-01");

      const batch = await agroChain.getAgroBatch(batchId);
      expect(batch.stage).to.equal(Stage.INPUT_VERIFIED);

      const linkedIds = await agroChain.getBatchInputIds(batchId);
      expect(linkedIds.length).to.equal(1);
      expect(linkedIds[0]).to.equal("SEED-LINK-01");
    });
  });

  describe("4. Storage & IoT Telemetry Logging", function () {
    it("should record timestamped temperature and humidity readings", async function () {
      const batchId = 20266001n;
      await agroChain.connect(farmer).createBatch(batchId, CropType.CASSAVA, "Ogun, Nigeria", 5000n, "kg", "Standard");

      await expect(
        agroChain.connect(storageOp).recordStorageReading(
          batchId,
          "Warehouse Facility 01",
          24n, // 24 deg C
          62n, // 62% humidity
          "IOT-DHT22-SN01",
          true // Simulated
        )
      ).to.emit(agroChain, "StorageReadingRecorded");

      const count = await agroChain.getBatchStorageReadingsCount(batchId);
      expect(count).to.equal(1n);

      const batch = await agroChain.getAgroBatch(batchId);
      expect(batch.stage).to.equal(Stage.STORED);
    });

    it("should reject invalid relative humidity above 100%", async function () {
      const batchId = 20266002n;
      await agroChain.connect(farmer).createBatch(batchId, CropType.MAIZE, "Kwara, Nigeria", 4000n, "kg", "Standard");

      await expect(
        agroChain.connect(storageOp).recordStorageReading(
          batchId,
          "Silo Unit B",
          25n,
          105n, // Invalid humidity
          "IOT-SN02",
          false
        )
      ).to.be.revertedWith("AgroChain: Invalid relative humidity percentage");
    });
  });

  describe("5. Processing & Quality Certification", function () {
    it("should record processing events and outputs", async function () {
      const batchId = 20267001n;
      await agroChain.connect(farmer).createBatch(batchId, CropType.CASSAVA, "Iseyin, Nigeria", 10000n, "kg", "Standard");
      await agroChain.connect(farmer).transferCustody(batchId, processor.address);

      await expect(
        agroChain.connect(processor).recordProcessing(
          batchId,
          "High Quality Cassava Flour (HQCF)",
          3200n,
          "kg",
          "Milled and dried to 10% moisture specification"
        )
      )
        .to.emit(agroChain, "ProcessingRecorded")
        .withArgs(batchId, processor.address, "High Quality Cassava Flour (HQCF)", 3200n);

      const record = await agroChain.getProcessingRecord(batchId);
      expect(record.outputProduct).to.equal("High Quality Cassava Flour (HQCF)");
      expect(record.outputQuantity).to.equal(3200n);

      const batch = await agroChain.getAgroBatch(batchId);
      expect(batch.stage).to.equal(Stage.PROCESSED);
    });

    it("should allow Regulator to certify quality and safety standards", async function () {
      const batchId = 20267002n;
      await agroChain.connect(farmer).createBatch(batchId, CropType.MAIZE, "Plateau, Nigeria", 8000n, "kg", "Standard");

      await expect(
        agroChain.connect(regulator).recordQualityCertificate(
          batchId,
          "Grade A Premium Export",
          "QC-CERT-2026-NFC",
          true,
          "Aflatoxin levels < 4ppb. Meets food safety criteria."
        )
      )
        .to.emit(agroChain, "QualityCertified")
        .withArgs(batchId, regulator.address, "Grade A Premium Export", true);

      const cert = await agroChain.getQualityCertificate(batchId);
      expect(cert.passed).to.be.true;
      expect(cert.qualityGrade).to.equal("Grade A Premium Export");

      const batch = await agroChain.getAgroBatch(batchId);
      expect(batch.qualityGrade).to.equal("Grade A Premium Export");
    });
  });

  describe("6. Logistics, Shipments, and Delivery", function () {
    it("should create shipment, dispatch, and confirm delivery", async function () {
      const batchId = 20268001n;
      const shipmentId = 9001n;

      await agroChain.connect(farmer).createBatch(batchId, CropType.MAIZE, "Nasarawa, Nigeria", 5000n, "kg", "Standard");

      // Create shipment with Transporter
      await expect(
        agroChain.connect(farmer).createShipment(
          shipmentId,
          batchId,
          transporter.address,
          "Nasarawa Hub",
          "Lagos Processing Mill"
        )
      )
        .to.emit(agroChain, "ShipmentCreated")
        .withArgs(shipmentId, batchId, transporter.address, "Lagos Processing Mill");

      let batch = await agroChain.getAgroBatch(batchId);
      expect(batch.stage).to.equal(Stage.IN_TRANSIT);
      expect(batch.currentCustodian).to.equal(transporter.address);

      // Confirm delivery by Transporter / Distributor
      await expect(
        agroChain.connect(transporter).confirmShipmentDelivery(shipmentId, distributor.address)
      )
        .to.emit(agroChain, "ShipmentDelivered")
        .withArgs(shipmentId, batchId, distributor.address);

      batch = await agroChain.getAgroBatch(batchId);
      expect(batch.stage).to.equal(Stage.DELIVERED);
      expect(batch.currentCustodian).to.equal(distributor.address);
    });
  });

  describe("7. Marketplace & Procurement", function () {
    it("should allow seller to create listing and buyer to place order", async function () {
      const batchId = 20269001n;
      const listingId = 501n;
      const orderId = 801n;

      await agroChain.connect(farmer).createBatch(batchId, CropType.CASSAVA, "Oyo, Nigeria", 5000n, "kg", "Grade A");

      await expect(
        agroChain.connect(farmer).createListing(
          listingId,
          batchId,
          5000n,
          "kg",
          350n, // 350 NGN per kg
          "Oyo Central Hub",
          "Grade A"
        )
      )
        .to.emit(agroChain, "ListingCreated")
        .withArgs(listingId, batchId, farmer.address, 350n);

      // Processor places procurement order
      await expect(
        agroChain.connect(processor).createOrder(orderId, listingId, 2500n)
      )
        .to.emit(agroChain, "OrderPlaced")
        .withArgs(orderId, listingId, processor.address, 2500n);

      const order = await agroChain.getOrder(orderId);
      expect(order.buyer).to.equal(processor.address);
      expect(order.totalPrice).to.equal(2500n * 350n);
    });
  });

  describe("8. Simulated Payments & Insurance Records", function () {
    it("should record demonstrable simulated payment for an order", async function () {
      const batchId = 20269002n;
      const listingId = 502n;
      const orderId = 802n;
      const paymentId = 7001n;

      await agroChain.connect(farmer).createBatch(batchId, CropType.MAIZE, "Kaduna, Nigeria", 3000n, "kg", "Standard");
      await agroChain.connect(farmer).createListing(listingId, batchId, 3000n, "kg", 400n, "Kaduna", "Standard");
      await agroChain.connect(distributor).createOrder(orderId, listingId, 3000n);

      await expect(
        agroChain.connect(distributor).recordPayment(
          paymentId,
          orderId,
          farmer.address,
          1200000n, // 3000 * 400
          "SIM-NGN"
        )
      )
        .to.emit(agroChain, "PaymentRecorded")
        .withArgs(paymentId, orderId, distributor.address, farmer.address, 1200000n);

      const payment = await agroChain.getPayment(paymentId);
      expect(payment.isSimulated).to.be.true;
      expect(payment.status).to.equal(1); // SETTLED
    });

    it("should issue simulated insurance policy, file claim, and settle", async function () {
      const batchId = 20269003n;
      const policyId = 6001n;

      await agroChain.connect(farmer).createBatch(batchId, CropType.CASSAVA, "Ondo, Nigeria", 4000n, "kg", "Standard");

      // AgriCredit Bank issues policy
      await expect(
        agroChain.connect(financier).issueInsurancePolicy(
          policyId,
          batchId,
          farmer.address,
          1500000n // Coverage amount
        )
      )
        .to.emit(agroChain, "InsurancePolicyIssued")
        .withArgs(policyId, batchId, financier.address, farmer.address, 1500000n);

      // Farmer files claim due to transit flooding
      await expect(
        agroChain.connect(farmer).fileInsuranceClaim(policyId, "Water damage in transit during heavy rainfall")
      )
        .to.emit(agroChain, "InsuranceClaimFiled")
        .withArgs(policyId, batchId, "Water damage in transit during heavy rainfall");

      // Financier settles claim
      await expect(
        agroChain.connect(financier).settleInsuranceClaim(policyId, true)
      ).to.emit(agroChain, "InsuranceClaimSettled");

      const policy = await agroChain.getInsurancePolicy(policyId);
      expect(policy.isSimulated).to.be.true;
      expect(policy.claimStatus).to.equal(4); // SETTLED
    });
  });

  describe("9. Public Consumer QR Verification", function () {
    it("should allow consumer verification scan and return complete batch data", async function () {
      const batchId = 20269004n;
      await agroChain.connect(farmer).createBatch(batchId, CropType.CASSAVA, "Delta, Nigeria", 3000n, "kg", "Grade A");

      await expect(
        agroChain.connect(consumer).recordConsumerVerification(batchId)
      )
        .to.emit(agroChain, "StageUpdated")
        .withArgs(batchId, Stage.CONSUMER_VERIFIED, consumer.address);

      const batch = await agroChain.getAgroBatch(batchId);
      expect(batch.stage).to.equal(Stage.CONSUMER_VERIFIED);

      // Backwards compatible getBatch test
      const legacy = await agroChain.getBatch(batchId);
      expect(legacy[0]).to.equal(batchId);
      expect(legacy[1]).to.equal("Delta, Nigeria");
      expect(legacy[2]).to.equal(3000n);
    });
  });
});
