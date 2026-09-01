import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, childAPI, routineAPI, alertAPI, healthAPI, deviceAPI, locationAPI, geofenceAPI } from "../services/api";
import { demoDevice, demoHealthData, demoRoutines, demoAlerts, demoGeofences } from "../data/demoFallback";

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
    child: ChildData | null;
    routines: RoutineItem[];
    alerts: AlertItem[];
    health: HealthRecord[];
    device: DeviceData | null;
    location: LocationData | null;
    geofence: GeofenceData | null;
    loading: boolean;
    childLoading: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setChild: (child: ChildData | null) => void;
    setRoutines: React.Dispatch<React.SetStateAction<RoutineItem[]>>;
    setAlerts: React.Dispatch<React.SetStateAction<AlertItem[]>>;
    setDevice: (d: DeviceData | null) => void;
    setLocation: (l: LocationData | null) => void;
    setGeofence: (g: GeofenceData | null) => void;
    refreshAll: () => void;
}

const AppContext = createContext<AppContextType>({
    user: null, child: null, routines: [], alerts: [], health: [],
    device: null, location: null, geofence: null,
    loading: true, childLoading: true,
    setUser: () => { }, setChild: () => { }, setRoutines: () => { }, setAlerts: () => { },
    setDevice: () => { }, setLocation: () => { }, setGeofence: () => { },
    refreshAll: () => { },
});

export function useAppData() {
    return useContext(AppContext);
}

// ─── Provider ────────────────────────────────────────────
export function AppDataProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [child, setChild] = useState<ChildData | null>(null);
    const [routines, setRoutines] = useState<RoutineItem[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [health, setHealth] = useState<HealthRecord[]>([]);
    const [device, setDevice] = useState<DeviceData | null>(null);
    const [location, setLocation] = useState<LocationData | null>(null);
    const [geofence, setGeofence] = useState<GeofenceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [childLoading, setChildLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        // Load user from localStorage
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
                const childRes = await childAPI.getMyChild();
                const serverChild = childRes?.data?.child ?? childRes?.data ?? null;
                currentChild = serverChild && typeof serverChild === 'object' ? serverChild as ChildData : null;
            } catch (error) {
                const status = (error as any)?.response?.status;
                if (status === 404) {
                    currentChild = null;
                } else {
                    currentChild = null;
                }
            }

            setChild(currentChild);

            if (currentChild) {
                // Fetch routines
                try {
                    const routineRes = await routineAPI.getRoutines(currentChild.id);
                    setRoutines(routineRes.data?.length > 0 ? routineRes.data : demoRoutines as any);
                } catch { setRoutines(demoRoutines as any); }

                // Fetch alerts
                try {
                    const alertRes = await alertAPI.getAlerts(currentChild.id);
                    setAlerts(alertRes.data?.length > 0 ? alertRes.data : demoAlerts as any);
                } catch { setAlerts(demoAlerts as any); }

                // Fetch health
                try {
                    const healthRes = await healthAPI.getHealthData(currentChild.id);
                    setHealth(healthRes.data?.length > 0 ? healthRes.data : demoHealthData as any);
                } catch { setHealth(demoHealthData as any); }

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
                        setDevice(demoDevice as any);
                        setLocation({ latitude: demoGeofences[0].center.lat, longitude: demoGeofences[0].center.lng } as any);
                    }
                } catch {
                    setDevice(demoDevice as any);
                    setLocation({ latitude: demoGeofences[0].center.lat, longitude: demoGeofences[0].center.lng } as any);
                }

                // Fetch geofence
                try {
                    const geoRes = await geofenceAPI.getGeofence(currentChild.id);
                    setGeofence(geoRes.data?.geofence ?? geoRes.data);
                } catch { setGeofence(demoGeofences[0] as any); }
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
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    return (
        <AppContext.Provider value={{
            user, child, routines, alerts, health, device, location, geofence,
            loading, childLoading,
            setUser, setChild, setRoutines, setAlerts, setDevice, setLocation, setGeofence,
            refreshAll: fetchAll,
        }}>
            {children}
        </AppContext.Provider>
    );
}
