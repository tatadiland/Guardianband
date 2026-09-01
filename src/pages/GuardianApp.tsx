import { useState, useEffect, useMemo, type FormEvent, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { demoGeofences, currentMetrics } from "../data/demoFallback";
import { mockHealthData } from "../data/mockData";
import { BASE_URL } from "../services/api";
import Map from "../components/Map";
import LocationSearch from "../components/LocationSearch";


export type RoutineStatus = "completed" | "in-progress" | "upcoming" | "missed";

const toneClasses = {
  blue: "tone-blue",
  green: "tone-green",
  amber: "tone-amber",
  red: "tone-red",
  slate: "tone-slate",
} as const;

type Tone = keyof typeof toneClasses;

type IconName =
  | "grid"
  | "heart"
  | "pin"
  | "band"
  | "bell"
  | "calendar"
  | "spark"
  | "user"
  | "settings";

const iconPaths: Record<IconName, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  heart:
    "M20.8 8.8c0 5.4-8.8 10-8.8 10s-8.8-4.6-8.8-10A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z",
  pin: "M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  band: "M7 4a5 5 0 0 0 0 16M17 4a5 5 0 0 1 0 16M7 8a1 1 0 0 0 0 8M17 8a1 1 0 0 1 0 8M8 12h8",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  calendar:
    "M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2ZM8 2v4M16 2v4M3 10h18",
  spark:
    "m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3ZM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z",
  user: "M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  settings:
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-2.5h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4h2.5v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.5H20a1.7 1.7 0 0 0-1.6 1.3Z",
};

/* FIX: navItems was missing */
const navItems: {
  path: string;
  label: string;
  icon: IconName;
}[] = [
    { path: "/dashboard", label: "Dashboard", icon: "grid" },
    { path: "/iot", label: "IoT Dashboard", icon: "band" },
    { path: "/health", label: "Health", icon: "heart" },
    { path: "/location", label: "Location", icon: "pin" },
    { path: "/geofencing", label: "Geofencing", icon: "pin" },
    { path: "/device", label: "Device", icon: "band" },
    { path: "/alerts", label: "Alerts", icon: "bell" },
    { path: "/routine", label: "Routine", icon: "calendar" },
    { path: "/assistant", label: "AI Assistant", icon: "spark" },
    { path: "/investigation", label: "Investigation", icon: "pin" },
  ];

type RoutineDraft = {
  title: string;
  category: string;
  date: string;
  start: string;
  end: string;
  description: string;
  reminder: boolean;
};

const defaultRoutineDraft: RoutineDraft = {
  title: "",
  category: "Activity",
  date: "2026-08-25",
  start: "16:00",
  end: "17:00",
  description: "",
  reminder: true,
};

function Icon({
  name,
  size = 18,
}: {
  name: IconName;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

function Status({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span className={`status ${toneClasses[tone]}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`panel ${className}`}>{children}</section>;
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow blue-text">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Metric({
  label,
  value,
  unit = "",
  detail,
  tone = "green",
  icon = "band",
}: {
  label: string;
  value: string;
  unit?: string;
  detail: string;
  tone?: Tone;
  icon?: IconName;
}) {
  return (
    <Card className="metric-card">
      <div className={`metric-icon ${toneClasses[tone]}`}>
        <Icon name={icon} size={20} />
      </div>

      <div>
        <p className="eyebrow">{label}</p>

        <strong className="metric-value">
          {value}
          <small>{unit}</small>
        </strong>

        <p className="metric-detail">{detail}</p>
      </div>
    </Card>
  );
}

// Helper component for rendering child avatar with photo fallback
function ChildAvatar({ child, className = "" }: { child: any; className?: string }) {
  const childInitials = child?.name
    ? child.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "GB";
  
  const photoUrl = child?.photo ? `${BASE_URL}${child.photo}` : null;
  
  return (
    <div
      className={`avatar ${className}`}
      style={photoUrl ? {
        backgroundImage: `url(${photoUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {!photoUrl && childInitials}
    </div>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, child, alerts } = useAppData();

  const unreadCount = alerts.filter(a => a.unread).length;

  const current = navItems.find((item) =>
    location.pathname.startsWith(item.path)
  );

  const userInitials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "JD";

  return (
    <div className="app-frame">
      <aside
        className={`sidebar ${mobileOpen ? "sidebar-open" : ""
          }`}
      >
        <div className="brand">
          <div className="brand-mark">GB</div>

          <div>
            <strong>GuardianBand</strong>
            <span>Child safety &amp; well-being</span>
          </div>
        </div>

        <div className="child-mini">
          <ChildAvatar child={child} />

          <div>
            <strong>{child?.name ?? "No child profile"}</strong>
            <span>{child ? "Connected" : "Set up profile"}</span>
          </div>

          <span className="online-dot" />
        </div>

        <nav className="main-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Icon name={item.icon} />

              <span>{item.label}</span>

              {item.label === "Alerts" && unreadCount > 0 && (
                <b className="nav-badge">{unreadCount}</b>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/profile" className="nav-link">
            <Icon name="user" />
            <span>Child profile</span>
          </NavLink>

          <NavLink to="/settings" className="nav-link">
            <Icon name="settings" />
            <span>Settings</span>
          </NavLink>

          <button
            className="logout-link"
            onClick={() => navigate("/login")}
          >
            Log out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="scrim"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="menu-button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>

          <div>
            <p className="breadcrumb">
              Workspace /{" "}
              <strong>
                {current?.label ?? "Dashboard"}
              </strong>
            </p>
          </div>

          <div className="top-actions">
            <Link
              to="/alerts"
              className="icon-button"
              aria-label="Alerts"
            >
              <Icon name="bell" />
              {unreadCount > 0 && <span className="notification-dot" />}
            </Link>

            <div className="profile-chip">
              <div className="avatar avatar-small">{userInitials}</div>

              <div>
                <strong>{user?.name ?? "Guardian"}</strong>
                <span>Guardian</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content">{children}</div>
      </main>
    </div>
  );
}

function EmergencyModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const { child, device } = useAppData();

  return (
    <div className="modal-backdrop">
      <div className="modal emergency-modal">
        {confirmed ? (
          <>
            <div className="critical-mark">!</div>

            <h2>Emergency alert simulated</h2>

            <p>
              {child?.name ?? "Your child"}'s emergency contacts have been
              notified with the current location and device
              status.
            </p>

            <button
              className="button button-danger"
              onClick={onClose}
            >
              Close emergency state
            </button>
          </>
        ) : (
          <>
            <Status tone="red">
              Emergency confirmation
            </Status>

            <h2>Confirm emergency response?</h2>

            <p>
              This will share {child?.name ?? "your child"}'s latest
              location, band status and recent health readings
              with the emergency contacts.
            </p>

            <div className="emergency-facts">
              <span>
                Child <b>{child?.name ?? "—"}</b>
              </span>

              <span>
                Location <b>{child?.school ?? "Unknown"}</b>
              </span>

              <span>
                Device{" "}
                <b>
                  {device ? `Connected · ${device.battery}%` : "Not connected"}
                </b>
              </span>
            </div>

            <div className="modal-actions">
              <button
                className="button button-quiet"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className="button button-danger"
                onClick={() => setConfirmed(true)}
              >
                Confirm emergency
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const { user, child, routines, alerts, health, device, loading, childLoading } = useAppData();

  if (loading || childLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2>Welcome to GuardianBand!</h2>
        <p className="text-slate-500 mt-2">Please set up your child's profile to get started.</p>
        <Link to="/profile" className="button button-primary mt-4">+ Add Child</Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        title={`Good morning, ${user?.name?.split(" ")[0] || "Guardian"}`}
        description={`Here is how ${child.name.split(" ")[0]} is doing today.`}
        action={
          <button
            className="button button-danger"
            onClick={() => setEmergencyOpen(true)}
          >
            Emergency action
          </button>
        }
      />

      {emergencyOpen && (
        <EmergencyModal
          onClose={() => setEmergencyOpen(false)}
        />
      )}

      <Card className="safety-banner">
        <div className="safety-check">✓</div>

        <div>
          <strong>
            {child.name} is safe and connected
          </strong>

          <p>
            All GuardianBand systems are working normally.
          </p>
        </div>

        <Status>Safe now</Status>

        <span className="banner-time">
          Updated 2 min ago
        </span>
      </Card>

      <div className="section-heading">
        <h2>Live overview</h2>
        <Link to="/health">View health details →</Link>
      </div>

      <div className="metrics-grid">
        <Metric
          label="Heart rate"
          value={String(health[health.length - 1]?.heartRate ?? currentMetrics.heartRate)}
          unit=" BPM"
          detail="Within healthy range"
          tone="green"
          icon="heart"
        />

        <Metric
          label="Body temperature"
          value={String(health[health.length - 1]?.temperature ?? currentMetrics.bodyTemp)}
          unit=" °C"
          detail="Normal reading"
          tone="green"
          icon="band"
        />

        <Metric
          label="Activity"
          value={currentMetrics.activity}
          detail={`${currentMetrics.steps.toLocaleString()} steps today`}
          tone="blue"
          icon="pin"
        />

        <Metric
          label="Battery"
          value={String(device?.battery ?? currentMetrics.bodyTemp)}
          unit="%"
          detail={device?.battery && device.battery > 50 ? "Good level" : "Charge soon"}
          tone={(device?.battery ?? 87) > 30 ? "green" : "amber"}
          icon="band"
        />
      </div>

      <div className="dashboard-grid">
        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Current location</p>
              <h2>Riverside Primary</h2>
            </div>

            <Status tone="blue">
              GPS connected
            </Status>
          </div>

          <div className="map-preview">
            <div className="map-grid" />

            <div className="map-pin">
              <span>AM</span>
            </div>

            <div className="map-label">
              <strong>14 Maple Avenue</strong>
              <span>Last known · 2 minutes ago</span>
            </div>
          </div>

          <div className="card-footer">
            <span>GSM good · Accuracy 8m</span>
            <Link to="/location">Open location →</Link>
          </div>
        </Card>

        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Today's routine</p>
              <h2>Monday schedule</h2>
            </div>

            <Link to="/routine">
              View full routine
            </Link>
          </div>

          <div className="compact-list">
            {routines.slice(0, 4).map((item) => (
              <div
                className="compact-routine"
                key={item.id}
              >
                <span>{item.start}</span>

                <strong>{item.title}</strong>

                <Status
                  tone={
                    item.status === "completed"
                      ? "green"
                      : "slate"
                  }
                >
                  {item.status.replace("-", " ")}
                </Status>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="dashboard-grid lower-grid">
        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Recent alerts</p>
              <h2>Needs your attention</h2>
            </div>

            <Link to="/alerts">View all</Link>
          </div>

          <div className="alert-stack">
            {alerts.length > 0 ? alerts.slice(0, 2).map((alert) => (
              <div className="alert-row" key={alert.id}>
                <div
                  className={`alert-symbol ${alert.severity === "Warning"
                    ? "tone-amber"
                    : alert.category === "Emergency"
                      ? "tone-red"
                      : "tone-blue"
                    }`}
                >
                  !
                </div>

                <div>
                  <strong>{alert.title}</strong>
                  <p>{alert.time}</p>
                </div>
              </div>
            )) : <p className="text-slate-500 text-sm">No recent alerts</p>}
          </div>
        </Card>

        <Card className="device-summary">
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                GuardianBand device
              </p>
              <h2>{device?.name || "No Device Linked"}</h2>
            </div>

            <Status>Connected</Status>
          </div>

          <div className="device-line">
            <span>Signal strength</span>
            <strong>Excellent</strong>
          </div>

          <div className="device-line">
            <span>Last sync</span>
            <strong>{device?.firmware ? "Active" : "Unknown"}</strong>
          </div>

          <div className="device-line">
            <span>Battery</span>
            <strong>{device?.battery ?? "--"}%</strong>
          </div>

          <Link
            className="button button-quiet"
            to="/device"
          >
            Manage device →
          </Link>
        </Card>
      </div>
    </>
  );
}

function IotPage() {
  const { device, health } = useAppData();

  if (!device) return <div className="p-8 text-center text-slate-500">No device currently connected.</div>;

  return (
    <>
      <PageHeader
        eyebrow="IoT command center"
        title="GuardianBand Live"
        description="Real-time telemetry from wearable device."
        action={<Status>Connected</Status>}
      />

      <Card className="iot-overview">
        <div className="device-orb">GB</div>

        <div>
          <p className="eyebrow">{device.name || "GuardianBand Device"}</p>

          <h2>Monitoring live sensor network</h2>

          <p className="muted">
            ID {device.id} · Firmware {device.firmware || "Latest"}
          </p>
        </div>

        <div className="iot-overview-stats">
          <span>
            <b>{device.battery ?? "--"}%</b>
            Battery
          </span>

          <span>
            <b>{device.gsm || "--"}</b>
            GSM
          </span>

          <span>
            <b>Connected</b>
            GPS
          </span>
        </div>
      </Card>

      <div className="section-heading">
        <h2>Live sensor data</h2>
        <span className="live-pulse">
          ● Updating now
        </span>
      </div>

      <div className="metrics-grid iot-metrics">
        <Metric
          label="Heart rate"
          value="84"
          unit=" BPM"
          detail="Normal"
          tone="green"
          icon="heart"
        />

        <Metric
          label="Body temperature"
          value="36.7"
          unit=" °C"
          detail="Normal"
          tone="green"
          icon="band"
        />

        <Metric
          label="Environment"
          value="29.4"
          unit=" °C"
          detail="Comfortable"
          tone="blue"
          icon="band"
        />

        <Metric
          label="Activity"
          value="Active"
          detail="Movement 2m ago"
          tone="blue"
          icon="pin"
        />

        <Metric
          label="GPS"
          value="Connected"
          detail="Accuracy 8m"
          tone="green"
          icon="pin"
        />

        <Metric
          label="GSM"
          value="Good"
          detail="4 of 4 bars"
          tone="green"
          icon="band"
        />

        <Metric
          label="Battery"
          value="78"
          unit="%"
          detail="2 days left"
          tone="amber"
          icon="band"
        />
      </div>

      <div className="dashboard-grid">
        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Safety sensors</p>
              <h2>Environmental protection</h2>
            </div>
            <Status>All normal</Status>
          </div>
          <div className="sensor-grid">
            <div className="p-4 text-center text-slate-500">All environmental sensors active.</div>
          </div>
        </Card>

        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Connectivity</p>
              <h2>Device health</h2>
            </div>
            <Status>Online</Status>
          </div>

          <div className="device-line">
            <span>Hardware</span>
            <strong>Healthy</strong>
          </div>

          <div className="device-line">
            <span>Firmware</span>
            <strong>{device.firmware || "Up to date"}</strong>
          </div>

          <div className="device-line">
            <span>GSM signal</span>
            <strong>{device.gsm || "Good"}</strong>
          </div>
        </Card>
      </div>

      <Card className="chart-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Live activity</p>
            <h2>Recent readings</h2>
          </div>

          <Status tone="blue">Live</Status>
        </div>

        <div className="bar-chart health-bars">
          {health.length > 0 ? health.slice(0, 7).map((record, index) => (
            <span
              key={index}
              style={{
                height: `${Math.max(20, (record.heartRate || 60) - 40)}%`,
              }}
            />
          )) : <div className="text-sm text-slate-400 p-4">No recent records</div>}
        </div>
      </Card>
    </>
  );
}

function HealthPage() {
  const { child } = useAppData();
  const [range, setRange] = useState("Today");

  if (!child) return <div className="p-8 text-center text-slate-500">Child profile not set up.</div>;

  return (
    <>
      <PageHeader
        eyebrow="Health monitoring"
        title={`${child.name}'s health`}
        description="Historical readings and current wellbeing at a glance."
        action={
          <div className="segmented">
            {["Today", "7 Days", "30 Days"].map(
              (item) => (
                <button
                  key={item}
                  className={
                    range === item
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setRange(item)
                  }
                >
                  {item}
                </button>
              )
            )}
          </div>
        }
      />

      <div className="metrics-grid">
        <Metric
          label="Heart rate"
          value="84"
          unit=" BPM"
          detail="Latest · Normal"
          tone="green"
          icon="heart"
        />

        <Metric
          label="Body temperature"
          value="36.7"
          unit=" °C"
          detail="Latest · Normal"
          tone="green"
          icon="band"
        />

        <Metric
          label="Activity"
          value="6,420"
          unit=" steps"
          detail="72% of daily goal"
          tone="blue"
          icon="pin"
        />

        <Metric
          label="Environment"
          value="29.4"
          unit=" °C"
          detail="Comfortable"
          tone="blue"
          icon="band"
        />
      </div>

      <Card className="chart-card">
        <div className="card-heading">
          <div>
            <p className="eyebrow">
              Heart rate history
            </p>
            <h2>{range} readings</h2>
          </div>

          <Status>Healthy range</Status>
        </div>

        <div className="chart-summary">
          <span>
            <b>84 BPM</b>Latest
          </span>

          <span>
            <b>78 BPM</b>Average
          </span>

          <span>
            <b>64 BPM</b>Minimum
          </span>

          <span>
            <b>96 BPM</b>Maximum
          </span>
        </div>

        <div className="bar-chart health-bars">
          {mockHealthData.map((value, index) => (
            <span
              key={index}
              style={{
                height: `${Math.max(
                  20,
                  value
                )}%`,
              }}
            />
          ))}
        </div>
      </Card>

      <div className="info-grid">
        <Card>
          <div className="card-heading">
            <h2>Health status</h2>
            <Status>All normal</Status>
          </div>

          <p className="muted">
            No unusual readings detected in the
            selected period. Amelia's heart rate and
            temperature remain within expected range.
          </p>
        </Card>

        <Card>
          <div className="card-heading">
            <h2>Care note</h2>
            <span className="big-blue">
              29.4°C
            </span>
          </div>

          <p className="muted">
            The environment is warmer than ideal.
            Encourage a water break after outdoor
            activity.
          </p>
        </Card>
      </div>
    </>
  );
}

function LocationPage() {
  const { child, location, device, geofence } = useAppData();
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number; label: string } | null>(null);

  if (!child) return <div className="p-8 text-center text-slate-500">Child profile not set up.</div>;

  const lat = Number.isFinite(location?.latitude) ? location!.latitude : 37.7749;
  const lng = Number.isFinite(location?.longitude) ? location!.longitude : -122.4194;
  const usingDemoLocation = !location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude);

  const markers = geofence ? [{
    lat: geofence.latitude,
    lng: geofence.longitude,
    label: geofence.name || 'Geofence',
    color: 'green',
  }] : [];

  const circles = geofence ? [{
    lat: geofence.latitude,
    lng: geofence.longitude,
    radius: geofence.radius || 100,
    label: geofence.name || 'Safe zone',
  }] : [];

  const handleLocationSelect = (lat: number, lng: number, name: string) => {
    setSearchMarker({ lat, lng, label: name });
  };

  return (
    <>
      <PageHeader
        eyebrow="Location tracking"
        title={`Where ${child.name.split(" ")[0]} is`}
        description={usingDemoLocation ? "Demo location is active because the GuardianBand device is not connected." : "Review the last known location and nearby activity."}
        action={
          <Status tone={usingDemoLocation ? "amber" : "blue"}>
            {usingDemoLocation ? "Demo location" : "GPS connected"}
          </Status>
        }
      />

      <Card className="large-map">
        <div className="map-toolbar">
          <div>
            <strong>{usingDemoLocation ? "Demo Map" : "Map preview"}</strong>
            <span>
              {usingDemoLocation ? 'GuardianBand device not connected' : `Last known location · ${location ? '2 minutes ago' : 'N/A'}`}
            </span>
          </div>

          <Link
            to="/investigation"
            className="button button-danger"
          >
            Investigation mode
          </Link>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f8fafc' }}>
          <LocationSearch onSelectLocation={handleLocationSelect} />
        </div>

        <div style={{ height: '400px', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
          <Map 
            latitude={lat} 
            longitude={lng}
            zoom={15}
            markers={markers}
            circles={circles}
            searchMarker={searchMarker || undefined}
          />
        </div>

        <div className="location-meta">
          <span>
            Last update: {usingDemoLocation ? 'Demo data' : '2 minutes ago'}
          </span>

          <span>
            GSM: {device?.gsm || 'N/A'} · GPS: {device?.gps || 'N/A'}
          </span>

          <span>
            Time since contact: {usingDemoLocation ? 'Demo mode' : '2 min'}
          </span>
        </div>
      </Card>

      <div className="location-cta-row">
        <Link to="/location" className="button button-primary">Open Full Map</Link>
        <Link to="/geofencing" className="button button-quiet">Manage Geofencing</Link>
      </div>

      <div className="dashboard-grid">
        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                Location information
              </p>

              <h2>Last known position</h2>
            </div>

            <Status tone="blue">
              Accuracy {location?.accuracy || '8'}m
            </Status>
          </div>

          <div className="device-line">
            <span>Address</span>
            <strong>
              {location ? `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}` : '14 Maple Avenue, Riverside'}
            </strong>
          </div>

          <div className="device-line">
            <span>Child</span>
            <strong>{child.name}</strong>
          </div>

          <div className="device-line">
            <span>Battery</span>
            <strong>{device?.battery ?? "--"}%</strong>
          </div>
        </Card>

        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                Recent movement
              </p>

              <h2>Activity trail</h2>
            </div>
          </div>

          <div className="compact-list">
            <div className="compact-routine">
              <span>09:46</span>
              <strong>Riverside Primary</strong>
              <Status>Current</Status>
            </div>

            <div className="compact-routine">
              <span>08:02</span>
              <strong>Arrived at school</strong>
              <Status tone="slate">
                Recorded
              </Status>
            </div>

            <div className="compact-routine">
              <span>07:41</span>
              <strong>Left home</strong>
              <Status tone="slate">
                Logged
              </Status>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function RoutinePage() {
  const { routines } = useAppData();
  const [items, setItems] = useState(routines);

  useEffect(() => {
    setItems(routines);
  }, [routines]);

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [draft, setDraft] =
    useState<RoutineDraft>(
      defaultRoutineDraft
    );

  const openForm = (
    item?: (typeof items)[number]
  ) => {
    if (item) {
      setEditingId(String(item.id));

      setDraft({
        title: item.title,
        category: item.category,
        date: "2026-08-25",
        start: item.start,
        end: item.end,
        description: item.description ?? "",
        reminder: true,
      });
    } else {
      setEditingId(null);
      setDraft(defaultRoutineDraft);
    }

    setShowModal(true);
  };

  const saveRoutine = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!draft.title.trim()) return;

    if (editingId) {
      setItems((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
              ...item,
              title: draft.title,
              category: draft.category,
              start: draft.start,
              end: draft.end,
              description:
                draft.description,
            }
            : item
        )
      );
    } else {
      setItems((current) => [
        ...current,
        {
          id: `routine-${Date.now()}`,
          title: draft.title,
          category: draft.category,
          start: draft.start,
          end: draft.end,
          description: draft.description,
          status:
            "upcoming" as RoutineStatus,
          icon: "◉",
        },
      ]);
    }

    setShowModal(false);
  };

  const deleteRoutine = (id: string | number) => {
    setItems((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  const markDone = (id: string | number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
            ...item,
            status:
              item.status === "completed"
                ? "upcoming"
                : "completed",
          }
          : item
      )
    );
  };

  const ordered = useMemo(
    () =>
      [...items].sort((a, b) =>
        a.start.localeCompare(b.start)
      ),
    [items]
  );

  return (
    <>
      <PageHeader
        eyebrow="Monday, August 24, 2026"
        title="Today's Routine"
        description="Manage Amelia's meals, learning and rest."
        action={
          <button
            className="button button-primary"
            onClick={() => openForm()}
          >
            Add Routine
          </button>
        }
      />

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal large-modal">
            <div className="modal-heading">
              <h2>
                {editingId
                  ? "Edit routine"
                  : "Add routine"}
              </h2>

              <button
                className="close-button"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={saveRoutine}
              className="routine-form"
            >
              <div className="field-grid">
                <Field label="Routine title">
                  <input
                    value={draft.title}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        title:
                          event.target.value,
                      })
                    }
                    placeholder="Breakfast"
                  />
                </Field>

                <Field label="Category">
                  <select
                    value={draft.category}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        category:
                          event.target.value,
                      })
                    }
                  >
                    <option>Education</option>
                    <option>Meals</option>
                    <option>Learning</option>
                    <option>Health</option>
                    <option>Activity</option>
                    <option>Rest</option>
                  </select>
                </Field>

                <Field label="Date">
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        date:
                          event.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Start time">
                  <input
                    type="time"
                    value={draft.start}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        start:
                          event.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="End time">
                  <input
                    type="time"
                    value={draft.end}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        end:
                          event.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={draft.description}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        description:
                          event.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Notes for caregivers"
                  />
                </Field>
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={draft.reminder}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      reminder:
                        event.target.checked,
                    })
                  }
                />

                Enable reminder
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button button-primary"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card className="routine-board">
        <div className="card-heading">
          <div>
            <p className="eyebrow">
              {ordered.length} scheduled items
            </p>

            <h2>Timeline</h2>
          </div>

          <Status>
            {
              items.filter(
                (item) =>
                  item.status === "completed"
              ).length
            }{" "}
            completed
          </Status>
        </div>

        <div className="routine-list">
          {ordered.map((item) => (
            <div
              className={`routine-row ${item.status}`}
              key={item.id}
            >
              <div className="routine-time">
                <time>{item.start}</time>
                <small>{item.end}</small>
              </div>

              <div className="routine-icon">
                {item.icon}
              </div>

              <div className="routine-copy">
                <div className="routine-topline">
                  <strong>{item.title}</strong>
                  <span className="routine-category">
                    {item.category}
                  </span>
                </div>

                <p>{item.description}</p>

                <div className="routine-status-row">
                  <Status
                    tone={
                      item.status ===
                        "completed"
                        ? "green"
                        : item.status ===
                          "in-progress"
                          ? "blue"
                          : item.status ===
                            "missed"
                            ? "red"
                            : "slate"
                    }
                  >
                    {item.status}
                  </Status>

                  <span>{draft.date}</span>
                </div>
              </div>

              <div className="routine-actions">
                <button
                  className="mini-button"
                  onClick={() =>
                    markDone(item.id)
                  }
                >
                  Mark done
                </button>

                <button
                  className="mini-button"
                  onClick={() =>
                    openForm(item)
                  }
                >
                  Edit
                </button>

                <button
                  className="mini-button danger"
                  onClick={() =>
                    deleteRoutine(item.id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function AlertsPage() {
  const { alerts: contextAlerts, child } = useAppData();
  const [alerts, setAlerts] = useState(contextAlerts);

  useEffect(() => {
    setAlerts(contextAlerts);
  }, [contextAlerts]);

  const [filter, setFilter] =
    useState("All");

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const filters = [
    "All",
    "Unread",
    "Emergency",
    "Health",
    "Location",
    "Device",
  ];

  const visible = alerts.filter(
    (alert) => {
      if (filter === "All") return true;
      if (filter === "Unread")
        return alert.unread;

      return alert.category === filter;
    }
  );

  const selected =
    alerts.find(
      (alert) => String(alert.id) === selectedId
    ) ?? null;

  return (
    <>
      <PageHeader
        eyebrow="Alerts & notifications"
        title="Alert center"
        description={`Important safety updates for ${child?.name || "your child"}.`}
        action={
          <button
            className="button button-quiet"
            onClick={() =>
              setAlerts((current) =>
                current.map((item) => ({
                  ...item,
                  unread: false,
                }))
              )
            }
          >
            Mark all as read
          </button>
        }
      />

      <div className="filter-row">
        {filters.map((item) => (
          <button
            key={item}
            className={
              filter === item
                ? "filter active"
                : "filter"
            }
            onClick={() =>
              setFilter(item)
            }
          >
            {item}
          </button>
        ))}
      </div>

      <div className="alert-list">
        {visible.length === 0 ? (
          <Card className="empty-state">
            <h2>No alerts here</h2>
            <p className="muted">
              There are no alerts matching this
              filter.
            </p>
          </Card>
        ) : (
          visible.map((alert) => (
            <button
              key={alert.id}
              className={`alert-card ${alert.unread ? "unread" : ""
                }`}
              onClick={() => {
                setSelectedId(String(alert.id));

                setAlerts((current) =>
                  current.map((item) =>
                    item.id === alert.id
                      ? {
                        ...item,
                        unread: false,
                      }
                      : item
                  )
                );
              }}
            >
              <div
                className={`alert-symbol ${alert.severity === "Warning"
                  ? "tone-amber"
                  : alert.category ===
                    "Emergency"
                    ? "tone-red"
                    : "tone-blue"
                  }`}
              >
                !
              </div>

              <div className="alert-copy">
                <div className="alert-headline">
                  <strong>
                    {alert.title}
                  </strong>

                  <span>
                    {alert.severity}
                  </span>
                </div>

                <p>{alert.description}</p>

                <div className="alert-meta">
                  <small>
                    {alert.category}
                  </small>

                  <small>
                    {alert.time}
                  </small>

                  <small>
                    {alert.unread
                      ? "Unread"
                      : "Read"}
                  </small>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {selected && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-heading">
              <h2>{selected.title}</h2>

              <button
                className="close-button"
                onClick={() =>
                  setSelectedId(null)
                }
              >
                ×
              </button>
            </div>

            <Status
              tone={
                selected.severity ===
                  "Warning"
                  ? "amber"
                  : selected.category ===
                    "Emergency"
                    ? "red"
                    : "blue"
              }
            >
              {selected.category}
            </Status>

            <p className="modal-copy">
              {selected.description}
            </p>

            <div className="emergency-facts">
              <span>
                Child{" "}
                <b>{child?.name || "Child"}</b>
              </span>

              <span>
                Time{" "}
                <b>{selected.time}</b>
              </span>

              <span>
                Severity{" "}
                <b>{selected.severity}</b>
              </span>
            </div>

            <div className="modal-actions">
              <button
                className="button button-quiet"
                onClick={() =>
                  setSelectedId(null)
                }
              >
                Close
              </button>

              <button
                className="button button-primary"
                onClick={() =>
                  setSelectedId(null)
                }
              >
                Mark as read
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AssistantPage() {
  const [messages, setMessages] =
    useState([
      {
        id: "welcome",
        sender: "ai",
        text: "Hello Jordan. I can help with general guidance about Amelia's health, sleep and routines.",
        time: "09:01",
      },
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const suggestions = [
    "What should I do if my child’s temperature is high?",
    "How much sleep does my child need?",
    "What are signs of dehydration in children?",
    "How can I improve my child’s sleep routine?",
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input.trim(),
      time: new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    const response = (() => {
      const text =
        input.trim().toLowerCase();

      if (text.includes("temperature"))
        return "A temperature above 38°C in a child needs attention. Encourage fluids, monitor symptoms and contact a healthcare professional if it persists.";

      if (text.includes("sleep"))
        return "Most children aged 6 to 10 need 9 to 12 hours of sleep with a consistent bedtime and calm wind-down routine.";

      if (text.includes("dehydration"))
        return "Signs include dry mouth, fewer tears, dizziness and reduced urination. Offer water and seek medical advice if symptoms are serious.";

      return "For general wellbeing, focus on hydration, consistent sleep, balanced meals and close monitoring of any worsening symptoms. If symptoms are concerning, consult a clinician.";
    })();

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: response,
          time: new Date().toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
        },
      ]);

      setLoading(false);
    }, 700);
  };

  return (
    <>
      <PageHeader
        eyebrow="GuardianBand AI"
        title="AI Health Assistant"
        description="General guidance for everyday questions and wellbeing support."
      />

      <Card className="chat-card">
        <div className="chat-history">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.sender}`}
            >
              <div className="chat-bubble">
                <p>{message.text}</p>
                <span>{message.time}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message ai">
              <div className="chat-bubble loading">
                <p>Thinking…</p>
              </div>
            </div>
          )}
        </div>

        <div className="suggestions-row">
          {suggestions.map(
            (suggestion) => (
              <button
                key={suggestion}
                className="suggestion-chip"
                onClick={() =>
                  setInput(suggestion)
                }
              >
                {suggestion}
              </button>
            )
          )}
        </div>

        <div className="chat-input-row">
          <input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) =>
              event.key === "Enter" &&
              handleSend()
            }
            placeholder="Ask about sleep, hydration, health routines…"
          />

          <button
            className="button button-primary"
            onClick={handleSend}
          >
            Send
          </button>
        </div>

        <p className="tiny-note">
          The AI assistant provides general guidance
          and does not replace professional medical
          advice.
        </p>
      </Card>
    </>
  );
}

type ChildFormState = {
  name: string;
  dateOfBirth: string;
  gender: string;
  height: string;
  weight: string;
  bloodGroup: string;
  allergies: string;
  existingIllnesses: string;
  medication: string;
  school: string;
  emergencyContact: string;
  phone: string;
  photo: string;
  photoFile?: File | null;
  photoPreview?: string;
};

const buildChildFormState = (childData?: any | null): ChildFormState => ({
  name: childData?.name ?? "",
  dateOfBirth: childData?.dateOfBirth ?? childData?.dob ?? "",
  gender: childData?.gender ?? "",
  height: childData?.height ?? "",
  weight: childData?.weight ?? "",
  bloodGroup: childData?.bloodGroup ?? "",
  allergies: childData?.allergies ?? "",
  existingIllnesses: childData?.existingIllnesses ?? childData?.illnesses ?? "",
  medication: childData?.medication ?? "",
  school: childData?.school ?? "",
  emergencyContact: childData?.emergencyContact ?? "",
  phone: childData?.phone ?? "",
  photo: childData?.photo ?? "",
});

const getAgeFromDateOfBirth = (dateValue?: string) => {
  if (!dateValue) return "Age not set";

  const birthDate = new Date(dateValue);
  if (Number.isNaN(birthDate.getTime())) return "Age not set";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return `${age} years`;
};

function ProfilePage() {
  const { child, setChild, refreshAll } = useAppData();
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formOpen, setFormOpen] = useState(false);
  const [formState, setFormState] = useState<ChildFormState>(() => buildChildFormState(child));
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (child) {
      setFormState(buildChildFormState(child));
    } else {
      setFormState(buildChildFormState(null));
    }
  }, [child]);

  const openAddForm = () => {
    setFormMode("add");
    setValidationErrors({});
    setSubmitState(null);
    setFormState(buildChildFormState(null));
    setFormOpen(true);
  };

  const openEditForm = () => {
    if (!child) return;
    setFormMode("edit");
    setValidationErrors({});
    setSubmitState(null);
    setFormState(buildChildFormState(child));
    setFormOpen(true);
  };

  const handleFieldChange = (field: keyof ChildFormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
    setValidationErrors((current) => ({ ...current, [field]: "" }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormState((current) => ({
        ...current,
        photoFile: file,
        photoPreview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (data: ChildFormState) => {
    const nextErrors: Record<string, string> = {};

    if (!data.name.trim()) {
      nextErrors.name = "Child name is required.";
    }

    if (!data.dateOfBirth) {
      nextErrors.dateOfBirth = "Date of birth is required.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateForm(formState);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSubmitState({ type: "error", message: "Please fix the highlighted required fields." });
      return;
    }

    setSubmitting(true);
    setSubmitState(null);

    try {
      // Use FormData for multipart/form-data to support file upload
      const formData = new FormData();
      formData.append('name', formState.name.trim());
      formData.append('dateOfBirth', formState.dateOfBirth);
      if (formState.gender) formData.append('gender', formState.gender);
      if (formState.height) formData.append('height', formState.height);
      if (formState.weight) formData.append('weight', formState.weight);
      if (formState.bloodGroup) formData.append('bloodGroup', formState.bloodGroup);
      if (formState.allergies) formData.append('allergies', formState.allergies);
      if (formState.existingIllnesses) formData.append('existingIllnesses', formState.existingIllnesses);
      if (formState.medication) formData.append('medication', formState.medication);
      if (formState.school) formData.append('school', formState.school);
      if (formState.emergencyContact) formData.append('emergencyContact', formState.emergencyContact);
      if (formState.phone) formData.append('phone', formState.phone);
      if (formState.photoFile) formData.append('photo', formState.photoFile);

      if (formMode === "add") {
        const response = await (await import("../services/api")).childAPI.createChild(formData as any);
        const createdChild = response.data?.child ?? response.data ?? null;
        if (createdChild) {
          setChild(createdChild);
          await refreshAll();
        }
        setSubmitState({ type: "success", message: "Child profile created successfully." });
      } else if (child?.id) {
        const response = await (await import("../services/api")).childAPI.updateChild(child.id, formData as any);
        const updatedChild = response.data?.child ?? response.data ?? child;
        setChild(updatedChild);
        await refreshAll();
        setSubmitState({ type: "success", message: "Child profile updated successfully." });
      }

      setTimeout(() => {
        setFormOpen(false);
        setSubmitState(null);
      }, 500);
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "The child profile could not be saved right now.";
      setSubmitState({ type: "error", message: backendMessage });
    } finally {
      setSubmitting(false);
    }
  };

  if (!child) {
    return (
      <>
        <PageHeader
          eyebrow="Child profile"
          title="Child profile"
          description="Set up your child's profile for health, routines and safety monitoring."
          action={
            <button className="button button-primary" onClick={openAddForm}>
              + Add Child
            </button>
          }
        />

        <Card className="empty-state-card">
          <div className="empty-state-icon">👧</div>
          <h2>Your child's profile hasn't been set up yet.</h2>
          <p>
            Add your child’s details to start tracking health, routines, location and emergency information.
          </p>
          <button className="button button-primary" onClick={openAddForm}>
            + Add Child
          </button>
        </Card>

        {formOpen && (
          <div className="modal-backdrop">
            <div className="modal large-modal">
              <div className="modal-heading">
                <h2>{formMode === "add" ? "Add child" : "Edit child"}</h2>
                <button className="close-button" onClick={() => setFormOpen(false)} type="button">×</button>
              </div>

              <form onSubmit={handleSubmit}>
                {submitState && (
                  <div className={`inline-message ${submitState.type === "success" ? "success" : "error"}`}>
                    {submitState.message}
                  </div>
                )}

                <div className="field-grid">
                  <Field label="Child name *">
                    <input
                      value={formState.name}
                      aria-invalid={Boolean(validationErrors.name)}
                      onChange={(event) => handleFieldChange("name", event.target.value)}
                    />
                    {validationErrors.name && <span className="field-error">{validationErrors.name}</span>}
                  </Field>

                  <Field label="Add Photo">
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handlePhotoChange}
                      />
                      {formState.photoPreview && (
                        <div style={{ marginTop: '8px' }}>
                          <img src={formState.photoPreview} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                        </div>
                      )}
                      {!formState.photoPreview && formMode === "edit" && child && (child as any)?.photo ? (
                        <div style={{ marginTop: '8px' }}>
                          <img src={`${BASE_URL}${(child as any)?.photo}`} alt="Current" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                        </div>
                      ) : null}
                    </div>
                  </Field>

                  <Field label="Date of birth *">
                    <input
                      type="date"
                      value={formState.dateOfBirth}
                      aria-invalid={Boolean(validationErrors.dateOfBirth)}
                      onChange={(event) => handleFieldChange("dateOfBirth", event.target.value)}
                    />
                    {validationErrors.dateOfBirth && <span className="field-error">{validationErrors.dateOfBirth}</span>}
                  </Field>

                  <Field label="Gender">
                    <input
                      value={formState.gender}
                      onChange={(event) => handleFieldChange("gender", event.target.value)}
                    />
                  </Field>

                  <Field label="Height">
                    <input
                      value={formState.height}
                      onChange={(event) => handleFieldChange("height", event.target.value)}
                    />
                  </Field>

                  <Field label="Weight">
                    <input
                      value={formState.weight}
                      onChange={(event) => handleFieldChange("weight", event.target.value)}
                    />
                  </Field>

                  <Field label="Blood group">
                    <input
                      value={formState.bloodGroup}
                      onChange={(event) => handleFieldChange("bloodGroup", event.target.value)}
                    />
                  </Field>

                  <Field label="Allergies">
                    <input
                      value={formState.allergies}
                      onChange={(event) => handleFieldChange("allergies", event.target.value)}
                    />
                  </Field>

                  <Field label="Existing illnesses">
                    <input
                      value={formState.existingIllnesses}
                      onChange={(event) => handleFieldChange("existingIllnesses", event.target.value)}
                    />
                  </Field>

                  <Field label="Medication">
                    <input
                      value={formState.medication}
                      onChange={(event) => handleFieldChange("medication", event.target.value)}
                    />
                  </Field>

                  <Field label="School">
                    <input
                      value={formState.school}
                      onChange={(event) => handleFieldChange("school", event.target.value)}
                    />
                  </Field>

                  <Field label="Emergency contact">
                    <input
                      value={formState.emergencyContact}
                      onChange={(event) => handleFieldChange("emergencyContact", event.target.value)}
                    />
                  </Field>

                  <Field label="Phone number">
                    <input
                      value={formState.phone}
                      onChange={(event) => handleFieldChange("phone", event.target.value)}
                    />
                  </Field>
                </div>

                <div className="modal-actions">
                  <button className="button button-quiet" type="button" onClick={() => setFormOpen(false)}>
                    Cancel
                  </button>
                  <button className="button button-primary" type="submit" disabled={submitting}>
                    {submitting ? (formMode === "add" ? "Creating..." : "Saving...") : (formMode === "add" ? "Create Child" : "Save changes")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Child profile"
        title={child.name}
        description={`Personal, medical and school information for ${child.name}.`}
        action={
          <button className="button button-primary" onClick={openEditForm}>
            Edit Profile
          </button>
        }
      />

      {formOpen && (
        <div className="modal-backdrop">
          <div className="modal large-modal">
            <div className="modal-heading">
              <h2>{formMode === "add" ? "Add child" : "Edit child"}</h2>
              <button className="close-button" onClick={() => setFormOpen(false)} type="button">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              {submitState && (
                <div className={`inline-message ${submitState.type === "success" ? "success" : "error"}`}>
                  {submitState.message}
                </div>
              )}

              <div className="field-grid">
                <Field label="Child name *">
                  <input
                    value={formState.name}
                    aria-invalid={Boolean(validationErrors.name)}
                    onChange={(event) => handleFieldChange("name", event.target.value)}
                  />
                  {validationErrors.name && <span className="field-error">{validationErrors.name}</span>}
                </Field>

                <Field label="Add Photo">
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoChange}
                    />
                    {formState.photoPreview && (
                      <div style={{ marginTop: '8px' }}>
                        <img src={formState.photoPreview} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                      </div>
                    )}
                    {!formState.photoPreview && formMode === "edit" && child && (child as any)?.photo ? (
                      <div style={{ marginTop: '8px' }}>
                        <img src={`${BASE_URL}${(child as any)?.photo}`} alt="Current" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                      </div>
                    ) : null}
                  </div>
                </Field>

                <Field label="Date of birth *">
                  <input
                    type="date"
                    value={formState.dateOfBirth}
                    aria-invalid={Boolean(validationErrors.dateOfBirth)}
                    onChange={(event) => handleFieldChange("dateOfBirth", event.target.value)}
                  />
                  {validationErrors.dateOfBirth && <span className="field-error">{validationErrors.dateOfBirth}</span>}
                </Field>

                <Field label="Gender">
                  <input
                    value={formState.gender}
                    onChange={(event) => handleFieldChange("gender", event.target.value)}
                  />
                </Field>

                <Field label="Height">
                  <input
                    value={formState.height}
                    onChange={(event) => handleFieldChange("height", event.target.value)}
                  />
                </Field>

                <Field label="Weight">
                  <input
                    value={formState.weight}
                    onChange={(event) => handleFieldChange("weight", event.target.value)}
                  />
                </Field>

                <Field label="Blood group">
                  <input
                    value={formState.bloodGroup}
                    onChange={(event) => handleFieldChange("bloodGroup", event.target.value)}
                  />
                </Field>

                <Field label="Allergies">
                  <input
                    value={formState.allergies}
                    onChange={(event) => handleFieldChange("allergies", event.target.value)}
                  />
                </Field>

                <Field label="Existing illnesses">
                  <input
                    value={formState.existingIllnesses}
                    onChange={(event) => handleFieldChange("existingIllnesses", event.target.value)}
                  />
                </Field>

                <Field label="Medication">
                  <input
                    value={formState.medication}
                    onChange={(event) => handleFieldChange("medication", event.target.value)}
                  />
                </Field>

                <Field label="School">
                  <input
                    value={formState.school}
                    onChange={(event) => handleFieldChange("school", event.target.value)}
                  />
                </Field>

                <Field label="Emergency contact">
                  <input
                    value={formState.emergencyContact}
                    onChange={(event) => handleFieldChange("emergencyContact", event.target.value)}
                  />
                </Field>

                <Field label="Phone number">
                  <input
                    value={formState.phone}
                    onChange={(event) => handleFieldChange("phone", event.target.value)}
                  />
                </Field>
              </div>

              <div className="modal-actions">
                <button className="button button-quiet" type="button" onClick={() => setFormOpen(false)}>
                  Cancel
                </button>
                <button className="button button-primary" type="submit" disabled={submitting}>
                  {submitting ? (formMode === "add" ? "Creating..." : "Saving...") : (formMode === "add" ? "Create Child" : "Save changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Profile overview</p>
              <h2>Personal information</h2>
            </div>
            <Status tone="green">Connected</Status>
          </div>

          <div className="profile-header">
            <ChildAvatar child={child} className="large-avatar" />
            <div>
              <h3>{child.name}</h3>
              <p>
                {getAgeFromDateOfBirth(child.dateOfBirth || child.dob)} · Safety status: Safe
              </p>
            </div>
          </div>

          <div className="device-line">
            <span>Date of birth</span>
            <strong>{child.dateOfBirth || child.dob || "Not set"}</strong>
          </div>

          <div className="device-line">
            <span>Gender</span>
            <strong>{child.gender || "Not set"}</strong>
          </div>

          <div className="device-line">
            <span>Height</span>
            <strong>{child.height || "Not set"}</strong>
          </div>

          <div className="device-line">
            <span>Weight</span>
            <strong>{child.weight || "Not set"}</strong>
          </div>

          <div className="device-line">
            <span>Blood group</span>
            <strong>{child.bloodGroup || "Not set"}</strong>
          </div>
        </Card>

        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Medical</p>
              <h2>Medical information</h2>
            </div>
          </div>

          <div className="device-line">
            <span>Allergies</span>
            <strong>{child.allergies || "Not set"}</strong>
          </div>

          <div className="device-line">
            <span>Existing illnesses</span>
            <strong>{child.existingIllnesses || child.illnesses || "Not set"}</strong>
          </div>

          <div className="device-line">
            <span>Medication</span>
            <strong>{child.medication || "Not set"}</strong>
          </div>

          <div className="device-line">
            <span>School</span>
            <strong>{child.school || "Not set"}</strong>
          </div>
        </Card>
      </div>

      <Card>
        <div className="card-heading">
          <div>
            <p className="eyebrow">Emergency contact</p>
            <h2>Guardian information</h2>
          </div>
        </div>

        <div className="device-line">
          <span>Contact name</span>
          <strong>{child.emergencyContact || "Not set"}</strong>
        </div>

        <div className="device-line">
          <span>Phone number</span>
          <strong>{child.phone || "Not set"}</strong>
        </div>
      </Card>
    </>
  );
}

function SettingsPage() {
  const { child, user, setUser } = useAppData();
  const [parentProfile, setParentProfile] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [saveState, setSaveState] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setParentProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || user.number || "",
        password: "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    const payload: Record<string, string> = {
      name: parentProfile.name.trim(),
      email: parentProfile.email.trim(),
      phone: parentProfile.phone.trim(),
    };

    if (parentProfile.password.trim()) {
      payload.password = parentProfile.password.trim();
    }

    if (!payload.name || !payload.email || !payload.phone) {
      setSaveState({ type: "error", message: "Name, email, and phone are required." });
      return;
    }

    try {
      setSaving(true);
      setSaveState(null);
      const response = await (await import("../services/api")).authAPI.updateMe(payload);
      const updatedUser = response.data?.user ?? response.data ?? null;

      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setParentProfile((current) => ({
        ...current,
        password: "",
      }));

      setSaveState({ type: "success", message: "Account updated successfully." });
    } catch (error: any) {
      setSaveState({ type: "error", message: error?.response?.data?.message || "Unable to update account details." });
    } finally {
      setSaving(false);
    }
  };

  const [toggles, setToggles] =
    useState({
      emergencyAlerts: true,
      healthAlerts: true,
      locationAlerts: true,
      deviceAlerts: true,
      privacyMode: false,
    });

  return (
    <>
      <PageHeader
        eyebrow="Workspace settings"
        title="Settings"
        description="Manage your account, child profile and device preferences."
      />

      <div className="settings-grid">
        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Account</p>
              <h2>Parent profile</h2>
            </div>
          </div>

          <div className="field-grid compact-grid">
            <Field label="Parent name">
              <input
                value={parentProfile.name}
                onChange={(event) =>
                  setParentProfile({
                    ...parentProfile,
                    name: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Email">
              <input
                value={parentProfile.email}
                onChange={(event) =>
                  setParentProfile({
                    ...parentProfile,
                    email: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Phone number">
              <input
                value={parentProfile.phone}
                onChange={(event) =>
                  setParentProfile({
                    ...parentProfile,
                    phone: event.target.value,
                  })
                }
              />
            </Field>

            <Field label="Password">
              <input
                value={parentProfile.password}
                type="password"
                placeholder="Leave blank to keep current password"
                onChange={(event) =>
                  setParentProfile({
                    ...parentProfile,
                    password: event.target.value,
                  })
                }
              />
            </Field>
          </div>

          {saveState && (
            <div className={`inline-message ${saveState.type === "success" ? "success" : "error"}`} style={{ marginTop: "14px" }}>
              {saveState.message}
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: "18px" }}>
            <button className="button button-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </Card>

        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">Child</p>
              <h2>Child profile</h2>
            </div>
          </div>

          <div className="field-grid compact-grid">
            <Field label="Child name">
              <input
                value={child?.name || 'Child Profile'}
                readOnly
              />
            </Field>

            <Field label="Emergency contacts">
              <input
                value={child?.emergencyContact || "Not set"}
                readOnly
              />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                Notifications
              </p>

              <h2>Alerts</h2>
            </div>
          </div>

          <div className="toggle-stack">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={
                  toggles.emergencyAlerts
                }
                onChange={() =>
                  setToggles((current) => ({
                    ...current,
                    emergencyAlerts:
                      !current.emergencyAlerts,
                  }))
                }
              />
              Emergency alerts
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={toggles.healthAlerts}
                onChange={() =>
                  setToggles((current) => ({
                    ...current,
                    healthAlerts:
                      !current.healthAlerts,
                  }))
                }
              />
              Health alerts
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={
                  toggles.locationAlerts
                }
                onChange={() =>
                  setToggles((current) => ({
                    ...current,
                    locationAlerts:
                      !current.locationAlerts,
                  }))
                }
              />
              Location alerts
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={
                  toggles.deviceAlerts
                }
                onChange={() =>
                  setToggles((current) => ({
                    ...current,
                    deviceAlerts:
                      !current.deviceAlerts,
                  }))
                }
              />
              Device alerts
            </label>
          </div>
        </Card>

        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                Security
              </p>

              <h2>Access management</h2>
            </div>
          </div>

          <div className="toggle-stack">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={
                  toggles.privacyMode
                }
                onChange={() =>
                  setToggles((current) => ({
                    ...current,
                    privacyMode:
                      !current.privacyMode,
                  }))
                }
              />
              Privacy mode enabled
            </label>

            <button className="button button-quiet">
              Change password
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}

function DevicePage() {
  const { device } = useAppData();

  if (!device) return <div className="p-8 text-center text-slate-500">No device connected.</div>;

  return (
    <>
      <PageHeader
        eyebrow="GuardianBand device"
        title="Device management"
        description="Monitor device health, connectivity and troubleshooting state."
      />

      <div className="dashboard-grid">
        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                Device information
              </p>

              <h2>{device.name || "GuardianBand Device"}</h2>
            </div>
            <Status>Connected</Status>
          </div>

          <div className="device-line">
            <span>GuardianBand ID</span>
            <strong>{device.id}</strong>
          </div>

          <div className="device-line">
            <span>Battery</span>
            <strong>{device.battery ?? "--"}%</strong>
          </div>

          <div className="device-line">
            <span>GSM</span>
            <strong>{device.gsm || "--"}</strong>
          </div>

          <div className="device-line">
            <span>GPS</span>
            <strong>Connected</strong>
          </div>

          <div className="device-line">
            <span>Firmware</span>
            <strong>{device.firmware || "Latest"}</strong>
          </div>

          <div className="device-line">
            <span>Device health</span>
            <strong>Stable</strong>
          </div>
        </Card>

        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                Troubleshooting
              </p>

              <h2>Connection states</h2>
            </div>
          </div>

          <div className="status-stack">
            <Status tone="green">
              Connected
            </Status>

            <Status tone="amber">
              Low battery
            </Status>

            <Status tone="red">
              No signal
            </Status>

            <Status tone="slate">
              Tamper detected
            </Status>
          </div>

          <p className="muted">
            The band is currently stable. Battery
            and signal are within expected operating
            range.
          </p>
        </Card>
      </div>
    </>
  );
}

function InvestigationPage() {
  const { device } = useAppData();

  if (!device) return <div className="p-8 text-center text-slate-500">No device connected.</div>;

  return (
    <>
      <PageHeader
        eyebrow="Emergency workspace"
        title="Investigation mode"
        description="A focused overview of Amelia's recent location and device condition."
      />

      <div className="investigation-layout">
        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                Freeze frame
              </p>

              <h2>Last known location</h2>
            </div>

            <Status tone="red">
              Critical review
            </Status>
          </div>

          <div className="device-line">
            <span>Location</span>
            <strong>
              Riverside Primary
            </strong>
          </div>

          <div className="device-line">
            <span>Battery</span>
            <strong>
              {device.battery ?? "--"}%
            </strong>
          </div>

          <div className="device-line">
            <span>GSM signal</span>
            <strong>{device.gsm || "--"}</strong>
          </div>

          <div className="device-line">
            <span>GPS signal</span>
            <strong>Connected</strong>
          </div>

          <div className="device-line">
            <span>Recent alerts</span>
            <strong>
              1 location safety alert
            </strong>
          </div>
        </Card>

        <Card>
          <div className="card-heading">
            <div>
              <p className="eyebrow">
                Details
              </p>

              <h2>Context</h2>
            </div>
          </div>

          <p className="muted">
            Student was last detected at the school
            location two minutes ago. Network health
            remains stable, and the band is still
            reporting live telemetry.
          </p>
        </Card>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Geofencing Page
────────────────────────────────────────────── */
function GeofencingPage() {
  type Zone = { id: string; name: string; radius: number; status: string; center: { lat: number; lng: number } };

  const [zones, setZones] = useState<Zone[]>(demoGeofences as Zone[]);
  const [showForm, setShowForm] = useState(false);
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [draft, setDraft] = useState({ name: "", radius: 150, status: "Active", lat: 37.7749, lng: -122.4194 });
  const [searchMarker, setSearchMarker] = useState<{ lat: number; lng: number; label: string } | null>(null);

  const mapCenterLat = zones[0]?.center?.lat ?? 37.7749;
  const mapCenterLng = zones[0]?.center?.lng ?? -122.4194;
  const geofenceMapCircles = zones.map(zone => ({
    lat: zone.center.lat,
    lng: zone.center.lng,
    radius: zone.radius,
    label: zone.name,
  }));

  const openAdd = () => {
    setEditZone(null);
    setDraft({ name: "", radius: 150, status: "Active", lat: 37.7749, lng: -122.4194 });
    setShowForm(true);
  };

  const openEdit = (zone: Zone) => {
    setEditZone(zone);
    setDraft({ name: zone.name, radius: zone.radius, status: zone.status, lat: zone.center.lat, lng: zone.center.lng });
    setShowForm(true);
  };

  const handleLocationSelect = (lat: number, lng: number, name: string) => {
    // Update draft with searched location
    setDraft(prev => ({
      ...prev,
      lat,
      lng,
      name: name.split(',')[0], // Use first part of address as geofence name
    }));
    setSearchMarker({ lat, lng, label: name });
    setShowForm(true);
  };

  const saveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    if (editZone) {
      setZones(prev => prev.map(z => z.id === editZone.id ? { ...z, name: draft.name, radius: draft.radius, status: draft.status, center: { lat: draft.lat, lng: draft.lng } } : z));
    } else {
      setZones(prev => [...prev, { id: `g${Date.now()}`, name: draft.name, radius: draft.radius, status: draft.status, center: { lat: draft.lat, lng: draft.lng } }]);
    }
    setShowForm(false);
    setSearchMarker(null);
  };

  const deleteZone = (id: string) => setZones(prev => prev.filter(z => z.id !== id));
  const toggleZone = (id: string) => setZones(prev => prev.map(z => z.id === id ? { ...z, status: z.status === "Active" ? "Inactive" : "Active" } : z));

  return (
    <>
      <PageHeader
        eyebrow="Safety zones"
        title="Manage Geofencing"
        description={zones.length > 0 ? "Define safe zones and get alerts when your child enters or leaves them." : "No geofence configured yet. Add a safe zone to start monitoring."}
        action={
          <button className="button button-primary" onClick={openAdd}>
            + Add Safe Zone
          </button>
        }
      />

      <Card className="large-map geofence-map-card">
        <div className="map-toolbar">
          <div>
            <strong>{zones.length > 0 ? "Geofence map" : "No geofence configured"}</strong>
            <span>{zones.length > 0 ? "Demo geofence data is visible for the current monitoring view." : "Add a safe zone to begin tracking."}</span>
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f8fafc' }}>
          <LocationSearch onSelectLocation={handleLocationSelect} placeholder="Search for a safe zone location..." />
        </div>

        <div style={{ height: '360px', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
          {zones.length > 0 ? (
            <Map
              latitude={mapCenterLat}
              longitude={mapCenterLng}
              zoom={13}
              circles={geofenceMapCircles}
              searchMarker={searchMarker || undefined}
            />
          ) : (
            <div style={{ height: '360px', display: 'grid', placeItems: 'center', background: '#f7fafc', color: '#64748b', fontWeight: 600 }}>
              No geofence configured
            </div>
          )}
        </div>
      </Card>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal large-modal">
            <div className="modal-heading">
              <h2>{editZone ? "Edit Safe Zone" : "Add Safe Zone"}</h2>
              <button className="close-button" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={saveZone} className="routine-form">
              <div className="field-grid">
                <Field label="Zone name">
                  <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Home, School" required />
                </Field>
                <Field label="Radius (metres)">
                  <input type="number" min={50} max={1000} value={draft.radius} onChange={e => setDraft({ ...draft, radius: Number(e.target.value) })} />
                </Field>
                <Field label="Status">
                  <select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </Field>
                <Field label="Latitude">
                  <input type="number" step="0.0001" value={draft.lat} onChange={e => setDraft({ ...draft, lat: Number(e.target.value) })} />
                </Field>
                <Field label="Longitude">
                  <input type="number" step="0.0001" value={draft.lng} onChange={e => setDraft({ ...draft, lng: Number(e.target.value) })} />
                </Field>
              </div>
              <div className="modal-actions">
                <button type="button" className="button button-quiet" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="button button-primary">Save Zone</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="geofence-summary-row">
        <Card className="geofence-stat">
          <p className="eyebrow">Active zones</p>
          <h2>{zones.filter(z => z.status === "Active").length}</h2>
        </Card>
        <Card className="geofence-stat">
          <p className="eyebrow">Total zones</p>
          <h2>{zones.length}</h2>
        </Card>
        <Card className="geofence-stat">
          <p className="eyebrow">Current status</p>
          <h2><Status tone="green">Inside zone</Status></h2>
        </Card>
      </div>

      <div className="geofence-zone-list">
        {zones.map(zone => (
          <Card key={zone.id} className={`geofence-zone-card ${zone.status === "Inactive" ? "inactive" : ""}`}>
            <div className="geofence-zone-header">
              <div className="geofence-zone-icon">{zone.name.charAt(0)}</div>
              <div>
                <h3>{zone.name}</h3>
                <p className="muted">Radius: {zone.radius} m &middot; Centre: {zone.center.lat.toFixed(4)}, {zone.center.lng.toFixed(4)}</p>
              </div>
              <Status tone={zone.status === "Active" ? "green" : "slate"}>{zone.status}</Status>
            </div>

            <div className="geofence-zone-visual">
              <div className="geo-circle-outer" style={{ width: `${Math.min(zone.radius / 2, 160)}px`, height: `${Math.min(zone.radius / 2, 160)}px` }}>
                <div className="geo-circle-inner">
                  <span>{zone.name.charAt(0)}</span>
                </div>
              </div>
              <div className="geo-info">
                <div className="device-line"><span>Zone name</span><strong>{zone.name}</strong></div>
                <div className="device-line"><span>Radius</span><strong>{zone.radius} metres</strong></div>
                <div className="device-line"><span>Status</span><strong>{zone.status}</strong></div>
                <div className="device-line"><span>Child present</span><strong>{zone.status === "Active" ? "Yes — inside zone" : "N/A"}</strong></div>
              </div>
            </div>

            <div className="geofence-zone-actions">
              <button className="mini-button" onClick={() => toggleZone(zone.id)}>
                {zone.status === "Active" ? "Deactivate" : "Activate"}
              </button>
              <button className="mini-button" onClick={() => openEdit(zone)}>Edit</button>
              <button className="mini-button danger" onClick={() => deleteZone(zone.id)}>Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function GuardianApp({
  kind,
}: {
  kind: string;
}) {
  const pageMap: Record<string, ReactNode> = {
    dashboard: <Dashboard />,
    iot: <IotPage />,
    health: <HealthPage />,
    location: <LocationPage />,
    geofencing: <GeofencingPage />,
    device: <DevicePage />,
    alerts: <AlertsPage />,
    routine: <RoutinePage />,
    assistant: <AssistantPage />,
    profile: <ProfilePage />,
    settings: <SettingsPage />,
    investigation: <InvestigationPage />,
  };

  return (
    <AppShell>
      {pageMap[kind] ?? <Dashboard />}
    </AppShell>
  );
}