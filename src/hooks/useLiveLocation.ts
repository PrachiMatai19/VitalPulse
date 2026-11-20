import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  lastUpdated: string | null;
  isTracking: boolean;
  error: string | null;
}

export function useLiveLocation() {
  const { donorProfile, updateLiveLocation } = useAuth();
  const [locationState, setLocationState] = useState<LocationState>({
    lat: donorProfile?.liveLat || donorProfile?.homeLat || null,
    lng: donorProfile?.liveLng || donorProfile?.homeLng || null,
    accuracy: 15,
    lastUpdated: donorProfile?.liveUpdatedAt || null,
    isTracking: donorProfile?.shareLive ?? false,
    error: null,
  });

  const pushLocationUpdate = useCallback(
    (lat: number, lng: number, accuracy: number = 15) => {
      const timestamp = new Date().toISOString();
      setLocationState((prev) => ({
        ...prev,
        lat,
        lng,
        accuracy,
        lastUpdated: timestamp,
        error: null,
      }));
      updateLiveLocation(lat, lng);
    },
    [updateLiveLocation]
  );

  const requestBrowserPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        pushLocationUpdate(
          position.coords.latitude,
          position.coords.longitude,
          position.coords.accuracy
        );
      },
      (err) => {
        // In iframe or sandboxed environments, provide smooth graceful fallback
        console.warn('Geolocation lookup notice:', err.message);
        if (donorProfile?.liveLat && donorProfile?.liveLng) {
          pushLocationUpdate(donorProfile.liveLat, donorProfile.liveLng);
        } else if (donorProfile?.homeLat && donorProfile?.homeLng) {
          pushLocationUpdate(donorProfile.homeLat, donorProfile.homeLng);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [donorProfile, pushLocationUpdate]);

  // Interval hook: Every 5 minutes (300,000 ms) per Section 6
  useEffect(() => {
    if (!donorProfile?.shareLive) {
      return;
    }

    // Immediate initial sync
    requestBrowserPosition();

    // 5-minute recurring timer
    const interval = setInterval(() => {
      requestBrowserPosition();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [donorProfile?.shareLive, requestBrowserPosition]);

  // Simulation helper to test live location drift
  const simulateMovement = (deltaLat: number, deltaLng: number) => {
    const currentLat = locationState.lat || donorProfile?.homeLat || 12.9716;
    const currentLng = locationState.lng || donorProfile?.homeLng || 77.5946;
    pushLocationUpdate(currentLat + deltaLat, currentLng + deltaLng, 10);
  };

  return {
    locationState,
    requestBrowserPosition,
    pushLocationUpdate,
    simulateMovement,
  };
}
