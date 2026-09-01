export const demoChild = {
    id: "demo-child-001",
    name: "Bridney Johnson",
    age: 8,
    gender: "Female",
    dob: "2018-05-14",
    height: "128 cm",
    weight: "27 kg",
    bloodGroup: "O+",
    allergies: "Peanuts",
    illnesses: "None",
    medication: "None",
    school: "Green Valley Primary School",
    emergencyContact: "+237 6XX XXX XXX",
    phone: "N/A"
};

export const demoDevice = {
    id: "GB-001",
    name: "GuardianBand GB-001",
    battery: 87,
    gsm: "Excellent (-67 dBm)",
    gps: "Active",
    firmware: "v1.0.0",
    lastSync: "Just now",
    uptime: "42 days"
};

export const demoHealthData = [
    { heartRate: 72, temperature: 36.5, timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
    { heartRate: 75, temperature: 36.6, timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
    { heartRate: 88, temperature: 36.8, timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
    { heartRate: 110, temperature: 37.1, timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
    { heartRate: 95, temperature: 36.9, timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    { heartRate: 82, temperature: 36.8, timestamp: new Date(Date.now() - 3600000 * 1).toISOString() },
    { heartRate: 84, temperature: 36.7, timestamp: new Date().toISOString() },
];

export const demoRoutines = [
    { id: "r1", title: "Wake up", category: "Rest", start: "07:00", end: "07:15", description: "Start the day gracefully.", status: "completed", icon: "☀️", date: new Date().toISOString().split('T')[0] },
    { id: "r2", title: "Breakfast", category: "Meals", start: "07:30", end: "08:00", description: "Healthy morning meal.", status: "completed", icon: "🍳", date: new Date().toISOString().split('T')[0] },
    { id: "r3", title: "School", category: "Education", start: "08:00", end: "14:30", description: "Green Valley Primary School.", status: "in-progress", icon: "🎒", date: new Date().toISOString().split('T')[0] },
    { id: "r4", title: "Lunch", category: "Meals", start: "13:00", end: "13:45", description: "School lunch.", status: "missing", icon: "🍱", date: new Date().toISOString().split('T')[0] },
    { id: "r5", title: "Homework", category: "Education", start: "16:00", end: "17:00", description: "Complete school assignments.", status: "upcoming", icon: "📚", date: new Date().toISOString().split('T')[0] },
    { id: "r6", title: "Play time", category: "Activity", start: "18:00", end: "19:00", description: "Outdoor activity.", status: "upcoming", icon: "⚽", date: new Date().toISOString().split('T')[0] },
    { id: "r7", title: "Prepare for bed", category: "Rest", start: "20:00", end: "20:30", description: "Brush teeth and read a book.", status: "upcoming", icon: "📖", date: new Date().toISOString().split('T')[0] },
    { id: "r8", title: "Sleep", category: "Rest", start: "21:00", end: "07:00", description: "Good night rest.", status: "upcoming", icon: "🌙", date: new Date().toISOString().split('T')[0] }
];

export const demoAlerts = [
    { id: "a1", title: "GuardianBand connected successfully", severity: "Info", category: "Device", description: "The band is online and transmitting secure telemetry.", time: "5 minutes ago", unread: false },
    { id: "a2", title: "Bridney arrived at school", severity: "Info", category: "Location", description: "Entered safe zone 'School'.", time: "1 hour ago", unread: true },
    { id: "a3", title: "Battery level below 30%", severity: "Warning", category: "Device", description: "Device battery is getting low. Consider charging soon.", time: "Yesterday", unread: false }
];

export const demoGeofences = [
    { id: "g1", name: "Home", radius: 150, status: "Active", center: { lat: 37.7749, lng: -122.4194 } },
    { id: "g2", name: "School", radius: 250, status: "Active", center: { lat: 37.7849, lng: -122.4094 } },
    { id: "g3", name: "Grandmother's House", radius: 100, status: "Inactive", center: { lat: 37.7649, lng: -122.4294 } }
];

export const currentMetrics = {
    heartRate: 84,
    bodyTemp: 36.7,
    envTemp: 27,
    activity: "Active",
    steps: 6842,
    sleep: "8h 12m"
};
