import assert from "node:assert/strict";
import { network } from "hardhat";

const connection = await network.connect("hardhat");
const { ethers } = connection;
const [admin, farmer, supplier, regulator, storageOperator, processor, transporter, distributor, financier, consumer, outsider] = await ethers.getSigners();

const Role = { ADMIN: 1, FARMER: 2, SUPPLIER: 3, STORAGE: 5, PROCESSOR: 6, TRANSPORTER: 7, DISTRIBUTOR: 8, FINANCIAL: 9, REGULATOR: 10, CONSUMER: 11 };
const Status = { ACTIVE: 1 };
const Crop = { CASSAVA: 0, MAIZE: 1 };
const Stage = { INPUT_VERIFIED: 1, FARM_RECORDED: 2, HARVESTED: 3, STORED: 4, PROCESSED: 5, DELIVERED: 7, CONSUMER_VERIFIED: 8 };

function pass(label) {
  console.log(`[PASS] ${label}`);
}

async function rejects(promise, expected) {
  try {
    await promise;
  } catch (error) {
    assert.match(error.message, expected);
    return;
  }
  assert.fail(`Expected revert matching ${expected}`);
}

try {
  const factory = await ethers.getContractFactory("AgroChain");
  const agro = await factory.deploy();
  await agro.waitForDeployment();

  const stakeholders = [
    [farmer, "Farmer", Role.FARMER],
    [supplier, "Supplier", Role.SUPPLIER],
    [regulator, "Regulator", Role.REGULATOR],
    [storageOperator, "Storage", Role.STORAGE],
    [processor, "Processor", Role.PROCESSOR],
    [transporter, "Transporter", Role.TRANSPORTER],
    [distributor, "Distributor", Role.DISTRIBUTOR],
    [financier, "Financial Institution", Role.FINANCIAL],
    [consumer, "Consumer", Role.CONSUMER],
  ];
  for (const [signer, name, role] of stakeholders) {
    await agro.registerStakeholder(signer.address, name, role, Status.ACTIVE);
  }
  assert.equal(await agro.getStakeholderCount(), 10n);
  pass("admin registers all required operational stakeholder roles");

  const cassavaBatch = 10001n;
  await agro.connect(farmer).createBatch(cassavaBatch, Crop.CASSAVA, "Oyo, Nigeria", 2500n, "kg", "Grade A");
  await rejects(agro.connect(farmer).advanceStage(cassavaBatch, Stage.HARVESTED), /advance one step/);
  await agro.connect(supplier).registerAgroInput("SEED-01", "Local Supplier", "Cassava Cutting", Crop.CASSAVA, "CERT-01");
  await rejects(agro.connect(farmer).linkInputToBatch(cassavaBatch, "SEED-01"), /must be verified/);
  await agro.connect(regulator).verifyAgroInput("SEED-01");
  await agro.connect(farmer).linkInputToBatch(cassavaBatch, "SEED-01");
  await agro.connect(farmer).advanceStage(cassavaBatch, Stage.FARM_RECORDED);
  await agro.connect(farmer).advanceStage(cassavaBatch, Stage.HARVESTED);
  await agro.connect(storageOperator).recordStorageReading(cassavaBatch, "Oyo Store", 25n, 60n, "SIM-SENSOR", true);
  await agro.connect(processor).recordProcessing(cassavaBatch, "HQCF", 900n, "kg", "Demonstration record");
  await agro.connect(regulator).recordQualityCertificate(cassavaBatch, "Grade A", "QC-01", true, "Local demo certificate");
  await agro.connect(farmer).createShipment(5001n, cassavaBatch, transporter.address, "Oyo", "Lagos");
  await agro.connect(transporter).confirmShipmentDelivery(5001n, distributor.address);
  await rejects(agro.connect(outsider).recordConsumerVerification(cassavaBatch), /Only active consumers/);
  await agro.connect(consumer).recordConsumerVerification(cassavaBatch);
  const cassava = await agro.getAgroBatch(cassavaBatch);
  assert.equal(Number(cassava.stage), Stage.CONSUMER_VERIFIED);
  assert.equal(Number(cassava.cropType), Crop.CASSAVA);
  assert.deepEqual(Array.from(await agro.getBatchInputIds(cassavaBatch)), ["SEED-01"]);
  pass("cassava traceability enforces verified inputs, ordered stages, quality, delivery, and consumer role");

  const maizeBatch = 10002n;
  await agro.connect(farmer).createBatch(maizeBatch, Crop.MAIZE, "Kaduna, Nigeria", 5000n, "kg", "Standard");
  await agro.connect(supplier).registerAgroInput("SEED-MAIZE-01", "Local Supplier", "Hybrid Maize Seed", Crop.MAIZE, "CERT-02");
  await agro.connect(regulator).verifyAgroInput("SEED-MAIZE-01");
  await agro.connect(farmer).linkInputToBatch(maizeBatch, "SEED-MAIZE-01");
  await agro.connect(farmer).advanceStage(maizeBatch, Stage.FARM_RECORDED);
  await agro.connect(farmer).advanceStage(maizeBatch, Stage.HARVESTED);
  await agro.connect(storageOperator).recordStorageReading(maizeBatch, "Kaduna Silo", 27n, 65n, "SIM-SILO", true);
  await agro.connect(processor).recordProcessing(maizeBatch, "Maize Flour", 4000n, "kg", "Demonstration record");
  await agro.connect(farmer).createShipment(5002n, maizeBatch, transporter.address, "Kaduna", "Lagos");
  await agro.connect(transporter).confirmShipmentDelivery(5002n, distributor.address);
  assert.equal(Number((await agro.getAgroBatch(maizeBatch)).stage), Stage.DELIVERED);
  pass("maize batch completes storage, processing, and logistics journey");

  const listingId = 7001n;
  await agro.connect(farmer).createListing(listingId, maizeBatch, 1000n, "kg", 50n, "Kaduna", "Grade A");
  await agro.connect(distributor).createOrder(8001n, listingId, 700n);
  assert.equal(await agro.listingCommittedQuantity(listingId), 700n);
  await rejects(agro.connect(processor).createOrder(8002n, listingId, 400n), /unavailable order quantity/);
  await rejects(agro.connect(processor).recordPayment(9001n, 8001n, farmer.address, 35000n, "SIM-NGN"), /Only order buyer/);
  await rejects(agro.connect(distributor).recordPayment(9001n, 8001n, outsider.address, 35000n, "SIM-NGN"), /payee must be the order seller/);
  await rejects(agro.connect(distributor).recordPayment(9001n, 8001n, farmer.address, 34999n, "SIM-NGN"), /amount must match order total/);
  await agro.connect(distributor).recordPayment(9001n, 8001n, farmer.address, 35000n, "SIM-NGN");
  await agro.connect(distributor).updateOrderStatus(8001n, 2);
  await agro.connect(farmer).updateOrderStatus(8001n, 3);
  assert.equal((await agro.getOrder(8001n)).status, 3n);
  pass("marketplace prevents over-ordering and binds simulated settlement to buyer, seller, and exact total");

  await agro.connect(farmer).createListing(7002n, maizeBatch, 200n, "kg", 10n, "Kaduna", "Standard");
  await agro.connect(distributor).createOrder(8003n, 7002n, 200n);
  await agro.connect(distributor).updateOrderStatus(8003n, 4);
  assert.equal(await agro.listingCommittedQuantity(7002n), 0n);
  await rejects(agro.connect(distributor).updateOrderStatus(8003n, 4), /Only unpaid orders can be cancelled/);
  pass("unpaid order cancellation releases listing capacity and cannot be repeated");

  await agro.connect(financier).issueInsurancePolicy(6001n, maizeBatch, farmer.address, 1000n);
  await agro.connect(farmer).fileInsuranceClaim(6001n, "Demonstration claim");
  await agro.connect(financier).settleInsuranceClaim(6001n, true);
  const policy = await agro.getInsurancePolicy(6001n);
  assert.equal(policy.isSimulated, true);
  assert.equal(policy.claimStatus, 4n);
  pass("insurance policy, claim, and simulated settlement lifecycle works");

  console.log("All executable AgroChain contract integration checks passed.");
} finally {
  await connection.close();
}
