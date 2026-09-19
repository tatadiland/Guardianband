# GuardianBand IoT Telemetry API

The physical bracelet sends telemetry to the backend using a device-specific API key. It does not use a parent's JWT and never receives database credentials.

## Device setup

Link a device through the authenticated parent endpoint:

```http
POST /api/devices/child/:childId
Authorization: Bearer <parent-jwt>
Content-Type: application/json
```

```json
{
  "name": "GuardianBand GB001",
  "hardwareId": "GB001"
}
```

The response contains `apiKey` once. Store it securely in the firmware. Existing devices created before this integration need to be linked again or provisioned with a new key by an administrator.

## Telemetry ingestion

```http
POST /api/iot/data
x-device-id: GB001
x-device-key: <device-api-key>
Content-Type: application/json
```

Example body:

```json
{
  "deviceId": "GB001",
  "eventId": "esp32-000123",
  "latitude": 3.848,
  "longitude": 11.5021,
  "heartRate": 82,
  "bodyTemperature": 36.7,
  "activity": "active",
  "acceleration": { "x": 0.02, "y": 0.11, "z": 0.98 },
  "battery": 84,
  "connectivity": "connected",
  "signal": "-67 dBm",
  "tampered": false,
  "sos": false,
  "timestamp": "2026-09-18T10:30:00.000Z"
}
```

All telemetry fields other than `deviceId` are optional. `eventId` is recommended and must be unique per device event. If omitted, the backend derives a deterministic event key from the device, timestamp, and safety flags.

Successful response:

```json
{
  "message": "Telemetry accepted",
  "telemetry": { "id": 1, "deviceId": 2, "heartRate": 82 },
  "device": { "id": 2, "hardwareId": "GB001", "childId": 7, "lastSeen": "2026-09-18T10:30:00.000Z" }
}
```

Errors:

- `400`: invalid device ID, coordinates, sensor range, battery, or timestamp.
- `401`: missing or invalid `x-device-id` / `x-device-key`.
- `404`: the device's child association cannot be found.
- `500`: database or server failure.

## Processing behavior

- Health readings are appended to `Health`.
- GPS readings are appended to `Location`.
- Device battery, activity, connectivity, signal, tamper, SOS, and `lastSeen` are updated on `Device`.
- `sos: true` creates one Emergency alert on a false-to-true transition.
- `tampered: true` creates one Safety alert on a false-to-true transition.
- Battery alerts use `LOW_BATTERY_THRESHOLD` and are emitted when crossing below the threshold.
- Re-sending the same `eventId` returns `duplicate: true` and creates no duplicate data or alert.