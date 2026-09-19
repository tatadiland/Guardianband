import assert from "node:assert/strict";
import request from "supertest";
import { sequelize } from "../db.connect.js";
import { connectDB } from "../db.connect.js";
import { ensureSchemaColumns } from "../db.schema.js";
import User from "../user/user.model.js";
import Child from "../child/child.model.js";
import Device from "../device/device.model.js";
import Health from "../health/health.model.js";
import Location from "../location/location.model.js";
import Alert from "../alert/alert.model.js";
import jwt from "jsonwebtoken";

process.env.NODE_ENV = "test";
const { app } = await import("../server.js");

describe("User API", function () {
  this.timeout(30000);

  before(async function () {
    await connectDB();
    await ensureSchemaColumns();
    await sequelize.sync({ force: false });
  });

  it("registers a new user", async function () {
    const id = Date.now();
    const response = await request(app)
      .post("/api/users/register")
      .send({
        name: "Test User",
        email: `test${id}@example.com`,
        number: `+237677${id.toString().slice(-6)}`,
        password: "Password123!",
      });

    assert.equal(response.status, 201, JSON.stringify(response.body));
    assert.equal(response.body.user.email, `test${id}@example.com`);
    assert.equal(response.body.user.password, undefined);
  });

  it("allows one parent to create and list multiple children", async function () {
    const id = Date.now();
    const user = await User.create({
      name: "Multi Child Parent",
      email: `multi${id}@example.com`,
      number: `+237699${id.toString().slice(-6)}`,
      password: "hashed-test-password",
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "fallback_secret");
    const payload = (name) => ({ name, dateOfBirth: "2017-05-01", gender: "Other" });

    const first = await request(app).post("/api/children").set("Authorization", `Bearer ${token}`).send(payload("First Child"));
    const second = await request(app).post("/api/children").set("Authorization", `Bearer ${token}`).send(payload("Second Child"));
    assert.equal(first.status, 201, JSON.stringify(first.body));
    assert.equal(second.status, 201, JSON.stringify(second.body));

    const list = await request(app).get("/api/children/user/me/all").set("Authorization", `Bearer ${token}`);
    assert.equal(list.status, 200);
    assert.equal(list.body.length, 2);
    assert.deepEqual(list.body.map((child) => child.name), ["First Child", "Second Child"]);

    const other = await User.create({
      name: "Other Parent",
      email: `other${id}@example.com`,
      number: `+237677${id.toString().slice(-6)}`,
      password: "hashed-test-password",
    });
    const otherToken = jwt.sign({ id: other.id }, process.env.JWT_SECRET || "fallback_secret");
    const forbidden = await request(app)
      .get(`/api/children/${first.body.child.id}`)
      .set("Authorization", `Bearer ${otherToken}`);
    assert.equal(forbidden.status, 403);
  });

  it("accepts telemetry, persists health/location, and deduplicates SOS and tamper alerts", async function () {
    const id = Date.now();
    const user = await User.create({
      name: "IoT Test Parent",
      email: `iot${id}@example.com`,
      number: `+237688${id.toString().slice(-6)}`,
      password: "hashed-test-password",
    });
    const child = await Child.create({
      name: "IoT Test Child",
      dateOfBirth: "2018-01-01",
      gender: "Other",
      userId: user.id,
    });
    const device = await Device.create({
      name: "Telemetry Test Band",
      hardwareId: `TEST-${id}`,
      apiKey: `key-${id}`,
      childId: child.id,
    });
    const telemetry = {
      deviceId: device.hardwareId,
      latitude: 3.848,
      longitude: 11.5021,
      heartRate: 82,
      bodyTemperature: 36.7,
      activity: "active",
      battery: 84,
      tampered: true,
      sos: true,
      timestamp: "2026-09-18T10:30:00.000Z",
      eventId: `event-${id}`,
    };

    const response = await request(app)
      .post("/api/iot/data")
      .set("x-device-id", device.hardwareId)
      .set("x-device-key", device.apiKey)
      .send(telemetry);

    assert.equal(response.status, 201, JSON.stringify(response.body));
    const health = await Health.findOne({ where: { childId: child.id } });
    const location = await Location.findOne({ where: { deviceId: device.id } });
    assert.equal(health.heartRate, 82);
    assert.equal(health.temperature, 36.7);
    assert.equal(location.latitude, 3.848);
    assert.equal(location.longitude, 11.5021);
    assert.equal(await Alert.count({ where: { childId: child.id } }), 2);

    const duplicate = await request(app)
      .post("/api/iot/data")
      .set("x-device-id", device.hardwareId)
      .set("x-device-key", device.apiKey)
      .send(telemetry);

    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.duplicate, true);
    assert.equal(await Alert.count({ where: { childId: child.id } }), 2);

    const invalidSensor = await request(app)
      .post("/api/iot/data")
      .set("x-device-id", device.hardwareId)
      .set("x-device-key", device.apiKey)
      .send({ deviceId: device.hardwareId, heartRate: 500, eventId: `invalid-${id}` });
    assert.equal(invalidSensor.status, 400);
  });

  it("rejects telemetry without valid device credentials", async function () {
    const response = await request(app)
      .post("/api/iot/data")
      .send({ deviceId: "unknown", heartRate: 80 });

    assert.equal(response.status, 401);
  });

  after(async function () {
    await sequelize.close();
  });
});