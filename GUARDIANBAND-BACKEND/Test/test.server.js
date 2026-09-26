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
import Telemetry from "../telemetry/telemetry.model.js";
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

    const login = await request(app)
      .post("/api/users/login")
      .send({ email: `test${id}@example.com`, password: "Password123!" });
    assert.equal(login.status, 200, JSON.stringify(login.body));
    assert.ok(login.body.token);

    const profile = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${login.body.token}`);
    assert.equal(profile.status, 200, JSON.stringify(profile.body));
    assert.equal(profile.body.user.email, `test${id}@example.com`);
    assert.equal(profile.body.user.password, undefined);

    const updatedProfile = await request(app)
      .put("/api/users/me")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ name: "Updated Test User", phone: `+237688${id.toString().slice(-9)}` });
    assert.equal(updatedProfile.status, 200, JSON.stringify(updatedProfile.body));
    assert.equal(updatedProfile.body.user.name, "Updated Test User");
    assert.equal(updatedProfile.body.user.number, `+237688${id.toString().slice(-9)}`);

    const pushTest = await request(app)
      .post("/api/notifications/test")
      .set("Authorization", `Bearer ${login.body.token}`);
    assert.equal(pushTest.status, 200, JSON.stringify(pushTest.body));
    assert.equal(pushTest.body.sent, 0);
    assert.equal(pushTest.body.skipped, false);

    const endpoint = `https://push.example.test/${id}`;
    const subscription = await request(app)
      .post("/api/notifications/subscription")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ endpoint, keys: { p256dh: "test-p256dh", auth: "test-auth" } });
    assert.equal(subscription.status, 201, JSON.stringify(subscription.body));

    const removedSubscription = await request(app)
      .delete("/api/notifications/subscription")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ endpoint });
    assert.equal(removedSubscription.status, 204);
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

    const linkedDevice = await request(app)
      .post(`/api/devices/child/${first.body.child.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Linked Test Band", hardwareId: `LINK-${id}` });
    assert.equal(linkedDevice.status, 201, JSON.stringify(linkedDevice.body));
    assert.ok(linkedDevice.body.apiKey);

    const listedDevice = await request(app)
      .get(`/api/devices/child/${first.body.child.id}`)
      .set("Authorization", `Bearer ${token}`);
    assert.equal(listedDevice.status, 200);
    assert.equal(listedDevice.body.hardwareId, `LINK-${id}`);
    assert.equal(listedDevice.body.apiKey, undefined);

    const createdGeofence = await request(app)
      .post(`/api/geofences/child/${first.body.child.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Safe Zone", latitude: 3.848, longitude: 11.5021, radius: 200 });
    assert.equal(createdGeofence.status, 201, JSON.stringify(createdGeofence.body));

    const savedGeofence = await request(app)
      .get(`/api/geofences/child/${first.body.child.id}`)
      .set("Authorization", `Bearer ${token}`);
    assert.equal(savedGeofence.status, 200);
    assert.equal(savedGeofence.body.name, "Test Safe Zone");

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
    const otherParentDevice = await request(app)
      .get(`/api/devices/child/${first.body.child.id}`)
      .set("Authorization", `Bearer ${otherToken}`);
    assert.equal(otherParentDevice.status, 404);

    const otherParentGeofence = await request(app)
      .get(`/api/geofences/child/${first.body.child.id}`)
      .set("Authorization", `Bearer ${otherToken}`);
    assert.equal(otherParentGeofence.status, 404);

    const deletedGeofence = await request(app)
      .delete(`/api/geofences/child/${first.body.child.id}`)
      .set("Authorization", `Bearer ${token}`);
    assert.equal(deletedGeofence.status, 200);
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
      connectivity: "connected",
      signal: "-67 dBm",
      acceleration: { x: 0.02, y: 0.11, z: 0.98 },
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
    await device.reload();
    assert.equal(device.battery, 84);
    assert.equal(device.activity, "active");
    assert.equal(device.connectivity, "connected");
    assert.equal(device.signal, "-67 dBm");
    assert.equal(device.tampered, true);
    assert.equal(device.sos, true);
    const savedTelemetry = await Telemetry.findOne({ where: { eventId: `event-${id}` } });
    assert.equal(JSON.parse(savedTelemetry.acceleration).x, 0.02);
    assert.equal(savedTelemetry.connectivity, "connected");
    assert.equal(savedTelemetry.signal, "-67 dBm");
    assert.equal(await Alert.count({ where: { childId: child.id } }), 2);

    const ownerToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "fallback_secret");
    const healthResponse = await request(app)
      .get(`/api/health/child/${child.id}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    assert.equal(healthResponse.status, 200);
    assert.equal(healthResponse.body[0].heartRate, 82);

    const locationResponse = await request(app)
      .get(`/api/locations/device/${device.id}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    assert.equal(locationResponse.status, 200);
    assert.equal(locationResponse.body.latitude, 3.848);

    const latest = await request(app)
      .get(`/api/iot/device/${device.id}/latest`)
      .set("Authorization", `Bearer ${ownerToken}`);
    assert.equal(latest.status, 200, JSON.stringify(latest.body));
    assert.equal(latest.body.eventId, `event-${id}`);
    assert.equal(latest.body.acceleration.x, 0.02);

    const otherParentToken = jwt.sign({ id: -1 }, process.env.JWT_SECRET || "fallback_secret");
    const forbiddenTelemetry = await request(app)
      .get(`/api/iot/device/${device.id}/latest`)
      .set("Authorization", `Bearer ${otherParentToken}`);
    assert.equal(forbiddenTelemetry.status, 403);

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