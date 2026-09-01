export type RoutineStatus = "completed" | "in-progress" | "upcoming" | "missed";
export type AlertCategory = "Emergency" | "Health" | "Location" | "Device" | "Safety";

export const mockChild = {
  name: "Amelia Morgan", age: 8, dob: "March 18, 2018", gender: "Female", height: "128 cm", weight: "27 kg", bloodGroup: "O+",
  allergies: "Peanuts", illnesses: "None reported", medication: "Vitamin D · 08:00", school: "Riverside Primary", emergencyContact: "Taylor Morgan · Parent", phone: "+1 (555) 014-2288",
};

export const mockDevice = { name: "GuardianBand GB-2048", id: "GB-2048-AX19", battery: 78, gsm: "Good", gps: "Connected", lastSync: "10 seconds ago", firmware: "v2.4.1", uptime: "4 days, 7 hours" };

export const mockRoutines = [
  { id: "school", title: "School", category: "Education", start: "08:00", end: "15:00", description: "Riverside Primary", status: "completed" as RoutineStatus, icon: "▣" },
  { id: "breakfast", title: "Breakfast", category: "Meals", start: "07:15", end: "07:45", description: "Oatmeal and fruit", status: "completed" as RoutineStatus, icon: "◒" },
  { id: "lunch", title: "Lunch", category: "Meals", start: "12:30", end: "13:00", description: "School cafeteria", status: "in-progress" as RoutineStatus, icon: "◉" },
  { id: "homework", title: "Homework", category: "Learning", start: "16:00", end: "17:00", description: "Reading and maths practice", status: "upcoming" as RoutineStatus, icon: "✎" },
  { id: "outdoor", title: "Outdoor activity", category: "Activity", start: "17:15", end: "18:00", description: "Playground time", status: "upcoming" as RoutineStatus, icon: "⌁" },
  { id: "medication", title: "Medication", category: "Health", start: "18:15", end: "18:20", description: "Vitamin D supplement", status: "upcoming" as RoutineStatus, icon: "+" },
  { id: "dinner", title: "Dinner", category: "Meals", start: "19:00", end: "19:30", description: "Family dinner", status: "upcoming" as RoutineStatus, icon: "◉" },
  { id: "sleep", title: "Sleep", category: "Rest", start: "20:30", end: "07:00", description: "Bedtime", status: "upcoming" as RoutineStatus, icon: "☾" },
];

export const mockAlerts = [
  { id: "a1", category: "Device" as AlertCategory, severity: "Warning", title: "Band battery is below 80%", description: "GuardianBand has approximately two days of battery remaining.", time: "Today at 09:42", unread: true },
  { id: "a2", category: "Location" as AlertCategory, severity: "Info", title: "Amelia arrived at school", description: "The band detected arrival at Riverside Primary.", time: "Today at 08:02", unread: true },
  { id: "a3", category: "Health" as AlertCategory, severity: "Normal", title: "Daily health check complete", description: "Heart rate and temperature readings are within expected ranges.", time: "Yesterday at 18:20", unread: false },
  { id: "a4", category: "Safety" as AlertCategory, severity: "Normal", title: "Safe zone confirmed", description: "Amelia is inside the Riverside Primary safe zone.", time: "Yesterday at 08:05", unread: false },
];

export const mockHealthData = [64, 78, 72, 91, 84, 88, 76, 82, 86, 80, 84, 79];
export const mockSensors = [
  { label: "Smoke sensor", state: "NORMAL", tone: "green", detail: "No smoke detected" },
  { label: "Flame sensor", state: "NORMAL", tone: "green", detail: "No flame detected" },
  { label: "Temperature sensor", state: "NORMAL", tone: "green", detail: "29.4°C environment" },
  { label: "Tamper detection", state: "NORMAL", tone: "green", detail: "Band secure" },
  { label: "Movement detection", state: "ACTIVE", tone: "blue", detail: "Movement detected 2m ago" },
];
