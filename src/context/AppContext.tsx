import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, childAPI, routineAPI, alertAPI, healthAPI, deviceAPI, locationAPI, geofenceAPI } from "../services/api";

// ─── Types ───────────────────────────────────────────────
export interface ChildData {
    id: number;
    name: string;
    age?: number;
    dateOfBirth?: string;
    dob?: string;
    gender?: string;
    height?: string;
    weight?: string;
    bloodGroup?: string;
    allergies?: string;
    existingIllnesses?: string;
    illnesses?: string;
    medication?: string;
    school?: string;
    emergencyContact?: string;
    phone?: string;
    photo?: string;
    userId?: number;
}

export interface RoutineItem {
    id: string | number;
    title: string;
    category: string;
    start: string;
    end: string;
    description?: string;
    status: "completed" | "in-progress" | "upcoming" | "missed";
    icon?: string;
    childId?: number;
}

export interface AlertItem {
    id: number;
    category: string;
    severity: string;
    title: string;
    description?: string;
    time?: string;
    unread: boolean;
    childId?: number;
}

export interface HealthRecord {
    id: number;
    heartRate?: number;
    temperature?: number;
    createdAt?: string;
}

export interface DeviceData {
    id: number;
    name: string;
    hardwareId?: string;
    battery?: number;
    gsm?: string;
    gps?: string;
    firmware?: string;
    childId?: number;
    activity?: string;
    connectivity?: string;
    signal?: string;
    lastSeen?: string;
    tampered?: boolean;
    sos?: boolean;
}

export interface LocationData {
    id: number;
    latitude: number;
    longitude: number;
    accuracy?: number;
    deviceId?: number;
    createdAt?: string;
}

export interface GeofenceData {
    id?: number;
    name?: string;
    latitude: number;
    longitude: number;
    radius: number;
    childId?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    number?: string;
}

// ─── Context ─────────────────────────────────────────────
interface AppContextType {
    user: User | null;
    children: ChildData[];
    child: ChildData | null;
    selectedChildId: number | null;
    routines: RoutineItem[];
    alerts: AlertItem[];
    health: HealthRecord[];
    device: DeviceData | null;
    location: LocationData | null;
    geofence: GeofenceData | null;
    loading: boolean;
    childLoading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setSelectedChildId: (id: number | null) => void;
    setChild: (child: ChildData | null) => void;
    setRoutines: React.Dispatch<React.SetStateAction<RoutineItem[]>>;
    setAlerts: React.Dispatch<React.SetStateAction<AlertItem[]>>;
    setDevice: (d: DeviceData | null) => void;
    setLocation: (l: LocationData | null) => void;
    setGeofence: (g: GeofenceData | null) => void;
    refreshAll: () => void;
}

const AppContext = createContext<AppContextType>({
    user: null, children: [], child: null, selectedChildId: null, routines: [], alerts: [], health: [],
    device: null, location: null, geofence: null,
    loading: true, childLoading: true,
    setUser: () => { }, setSelectedChildId: () => { }, setChild: () => { }, setRoutines: () => { }, setAlerts: () => { },
    setDevice: () => { }, setLocation: () => { }, setGeofence: () => { },
    refreshAll: () => { },
});

export function useAppData() {
    return useContext(AppContext);
}

// ─── Provider ────────────────────────────────────────────
export function AppDataProvider({ children: content }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [childProfiles, setChildProfiles] = useState<ChildData[]>([]);
    const [child, setChild] = useState<ChildData | null>(null);
    const [selectedChildId, setSelectedChildIdState] = useState<number | null>(() => {
        const stored = localStorage.getItem("selectedChildId");
        return stored ? Number(stored) : null;
    });
    const [routines, setRoutines] = useState<RoutineItem[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [health, setHealth] = useState<HealthRecord[]>([]);
    const [device, setDevice] = useState<DeviceData | null>(null);
    const [location, setLocation] = useState<LocationData | null>(null);
    const [geofence, setGeofence] = useState<GeofenceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [childLoading, setChildLoading] = useState(true);

    const setSelectedChildId = useCallback((id: number | null) => {
        setSelectedChildIdState(id);
        if (id === null) {
            localStorage.removeItem("selectedChildId");
            return;
        }
        localStorage.setItem("selectedChildId", String(id));
    }, []);

    const fetchAll = useCallback(async () => {
        if (!localStorage.getItem("token")) {
            setUser(null);
            setChildProfiles([]);
            setChild(null);
            setRoutines([]);
            setAlerts([]);
            setHealth([]);
            setDevice(null);
            setLocation(null);
            setGeofence(null);
            setLoading(false);
            setChildLoading(false);
            return;
        }

        try {
            const stored = localStorage.getItem("user");
            if (stored) {
                const storedUser = JSON.parse(stored) as User;
                setUser(storedUser);

                try {
                    const profileRes = await authAPI.getMe();
                    const backendUser = profileRes.data?.user ?? profileRes.data ?? null;
                    if (backendUser) {
                        setUser(backendUser as User);
                        localStorage.setItem("user", JSON.stringify(backendUser));
                    }
                } catch {
                    // Keep stored user if backend is unavailable.
                }
            }
        } catch {/* ignore */ }

        setChildLoading(true);

        try {
            let currentChild: ChildData | null = null;

            try {
                const childRes = await childAPI.getMyChildren();
                const serverChildren = Array.isArray(childRes?.data) ? childRes.data : [];
                setChildProfiles(serverChildren as ChildData[]);
                const storedId = selectedChildId && serverChildren.some((item: ChildData) => item.id === selectedChildId)
                    ? selectedChildId
                    : serverChildren[0]?.id ?? null;
                if (storedId && storedId !== selectedChildId) setSelectedChildId(storedId);
                currentChild = serverChildren.find((item: ChildData) => item.id === storedId) ?? null;
            } catch {
                try {
                    const childRes = await childAPI.getMyChild();
                    const serverChild = childRes?.data?.child ?? childRes?.data ?? null;
                    currentChild = serverChild && typeof serverChild === 'object' ? serverChild as ChildData : null;
                    setChildProfiles(currentChild ? [currentChild] : []);
                } catch { currentChild = null; setChildProfiles([]); }
            }

            setChild(currentChild);

            if (currentChild) {
                // Fetch routines
                try {
                    const routineRes = await routineAPI.getRoutines(currentChild.id);
                    setRoutines(Array.isArray(routineRes.data) ? routineRes.data : []);
                } catch { setRoutines([]); }

                // Fetch alerts
                try {
                    const alertRes = await alertAPI.getAlerts(currentChild.id);
                    setAlerts(Array.isArray(alertRes.data) ? alertRes.data : []);
                } catch { setAlerts([]); }

                // Fetch health
                try {
                    const healthRes = await healthAPI.getHealthData(currentChild.id);
                    setHealth(Array.isArray(healthRes.data) ? healthRes.data : []);
                } catch { setHealth([]); }

                // Fetch device
                try {
                    const deviceRes = await deviceAPI.getDevice(currentChild.id);
                    if (deviceRes.data) {
                        const deviceData: DeviceData = deviceRes.data;
                        setDevice(deviceData);

                        try {
                            const locRes = await locationAPI.getLastLocation(deviceData.id);
                            setLocation(locRes.data || null);
                        } catch { setLocation(null); }
                    } else {
                        setDevice(null);
                        setLocation(null);
                    }
                } catch {
                    setDevice(null);
                    setLocation(null);
                }

                // Fetch geofence
                try {
                    const geoRes = await geofenceAPI.getGeofence(currentChild.id);
                    setGeofence(geoRes.data?.geofence ?? geoRes.data ?? null);
                } catch { setGeofence(null); }
            } else {
                setRoutines([]);
                setAlerts([]);
                setHealth([]);
                setDevice(null);
                setLocation(null);
                setGeofence(null);
            }

        } catch {
            setChild(null);
            setRoutines([]);
            setAlerts([]);
            setHealth([]);
            setDevice(null);
            setLocation(null);
            setGeofence(null);
        }

        setChildLoading(false);
        setLoading(false);
    }, [selectedChildId, setSelectedChildId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    useEffect(() => {
        const handleAuthChanged = () => { void fetchAll(); };
        window.addEventListener("guardianband-auth-changed", handleAuthChanged);
        window.addEventListener("storage", handleAuthChanged);
        return () => {
            window.removeEventListener("guardianband-auth-changed", handleAuthChanged);
            window.removeEventListener("storage", handleAuthChanged);
        };
    }, [fetchAll]);

    useEffect(() => {
        const interval = window.setInterval(fetchAll, 30000);
        return () => window.clearInterval(interval);
    }, [fetchAll]);

    return (
        <AppContext.Provider value={{
            user, children: childProfiles, child, selectedChildId, routines, alerts, health, device, location, geofence,
            loading, childLoading,
            setUser, setSelectedChildId, setChild, setRoutines, setAlerts, setDevice, setLocation, setGeofence,
            refreshAll: fetchAll,
        }}>
            {content}
        </AppContext.Provider>
    );
}
