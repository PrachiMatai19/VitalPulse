import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { BloodRequest, BloodGroup, ResponseStatus } from '../types';
import { useAuth } from './AuthContext';
import { storageService } from '../services/storageService';
import { isBloodCompatible } from '../utils/bloodCompatibility';
import { calculateDistance } from '../utils/haversine';
import {
  playEmergencyBeaconSound,
  playSuccessChime,
  isSoundMuted,
  setSoundMuted as persistSoundMuted,
} from '../utils/soundEffects';
import { LocationShareModal } from '../components/donor/LocationShareModal';

export interface BloodAlertToast {
  id: string;
  request: BloodRequest;
  distanceKm: number;
  createdAt: number;
  durationMs: number;
  isPaused: boolean;
}

export interface ToastNotificationContextType {
  toasts: BloodAlertToast[];
  activeModalRequest: BloodRequest | null;
  unreadCount: number;
  soundMuted: boolean;
  successMessage: string | null;
  toggleSound: () => void;
  dismissToast: (id: string) => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
  openShareLocationModal: (request: BloodRequest) => void;
  closeShareLocationModal: () => void;
  quickShareLiveLocation: (request: BloodRequest) => void;
  declineRequest: (request: BloodRequest) => void;
  simulateBroadcast: (preferredBloodGroup?: BloodGroup) => void;
  clearSuccessMessage: () => void;
}

const ToastNotificationContext = createContext<ToastNotificationContextType | undefined>(undefined);

export const ToastNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, donorProfile, refreshProfiles } = useAuth();
  const [toasts, setToasts] = useState<BloodAlertToast[]>([]);
  const [activeModalRequest, setActiveModalRequest] = useState<BloodRequest | null>(null);
  const [soundMuted, setSoundMutedState] = useState<boolean>(() => isSoundMuted());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleSound = useCallback(() => {
    setSoundMutedState((prev) => {
      const next = !prev;
      persistSoundMuted(next);
      return next;
    });
  }, []);

  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pauseToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPaused: true } : t))
    );
  }, []);

  const resumeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPaused: false } : t))
    );
  }, []);

  const openShareLocationModal = useCallback((request: BloodRequest) => {
    setActiveModalRequest(request);
  }, []);

  const closeShareLocationModal = useCallback(() => {
    setActiveModalRequest(null);
  }, []);

  // Quick direct 1-tap accept and share live GPS
  const quickShareLiveLocation = useCallback(
    (request: BloodRequest) => {
      if (!donorProfile) return;

      // Update donor profile to share live coordinates with fresh timestamp
      storageService.updateDonor({
        ...donorProfile,
        shareLive: true,
        liveUpdatedAt: new Date().toISOString(),
      });

      storageService.setResponseStatus(request.id, donorProfile.id, 'ACCEPTED');
      playSuccessChime();
      dismissToast(request.id);
      refreshProfiles();

      setSuccessMessage(
        `Location and contact successfully shared with ${request.hospitalName}! Direct triage coordinates transmitted.`
      );
      setTimeout(() => {
        setSuccessMessage(null);
      }, 6000);
    },
    [donorProfile, dismissToast, refreshProfiles]
  );

  // Decline action
  const declineRequest = useCallback(
    (request: BloodRequest) => {
      if (!donorProfile) return;
      storageService.setResponseStatus(request.id, donorProfile.id, 'DECLINED');
      dismissToast(request.id);
      refreshProfiles();
    },
    [donorProfile, dismissToast, refreshProfiles]
  );

  // Handle incoming blood request alert
  const handleIncomingRequest = useCallback(
    (req: BloodRequest) => {
      // 1. If user is a donor, verify blood compatibility
      if (donorProfile) {
        if (!isBloodCompatible(donorProfile.bloodGroup, req.bloodGroup)) {
          return; // Not a compatible match for this donor
        }

        // Calculate distance from active coordinates
        const activeLat =
          donorProfile.shareLive && donorProfile.liveLat
            ? donorProfile.liveLat
            : donorProfile.homeLat;
        const activeLng =
          donorProfile.shareLive && donorProfile.liveLng
            ? donorProfile.liveLng
            : donorProfile.homeLng;

        const distanceKm = calculateDistance(req.lat, req.lng, activeLat, activeLng);

        // Check if response already exists
        const existingResp = storageService.getResponse(req.id, donorProfile.id);
        if (existingResp && existingResp.status === 'ACCEPTED') {
          return; // Already accepted
        }

        const newToast: BloodAlertToast = {
          id: req.id,
          request: req,
          distanceKm,
          createdAt: Date.now(),
          durationMs: 25000, // 25 seconds before auto-dismissing
          isPaused: false,
        };

        setToasts((prev) => {
          // Avoid duplicate toast for same request
          if (prev.some((t) => t.id === req.id)) return prev;
          return [newToast, ...prev.slice(0, 2)]; // Keep up to 3 toasts max
        });

        playEmergencyBeaconSound();
      } else {
        // If not a donor (e.g. testing as guest or admin/hospital)
        const newToast: BloodAlertToast = {
          id: req.id,
          request: req,
          distanceKm: 2.5,
          createdAt: Date.now(),
          durationMs: 25000,
          isPaused: false,
        };

        setToasts((prev) => {
          if (prev.some((t) => t.id === req.id)) return prev;
          return [newToast, ...prev.slice(0, 2)];
        });

        playEmergencyBeaconSound();
      }
    },
    [donorProfile]
  );

  // Simulate emergency broadcast helper
  const simulateBroadcast = useCallback(
    (preferredBloodGroup?: BloodGroup) => {
      const targetGroup = preferredBloodGroup || donorProfile?.bloodGroup || 'O-';
      const simReq = storageService.simulateEmergencyBroadcast(targetGroup);
      handleIncomingRequest(simReq);
    },
    [donorProfile, handleIncomingRequest]
  );

  // Subscribe to real-time events via window
  useEffect(() => {
    const onBloodRequestCreated = (e: Event) => {
      const customEvent = e as CustomEvent<{ request: BloodRequest }>;
      if (customEvent.detail && customEvent.detail.request) {
        handleIncomingRequest(customEvent.detail.request);
      }
    };

    window.addEventListener('vitalpulse:blood-request-created', onBloodRequestCreated);
    return () => {
      window.removeEventListener('vitalpulse:blood-request-created', onBloodRequestCreated);
    };
  }, [handleIncomingRequest]);

  // Initial check: if donor logs in and there is an unresponded OPEN matching request from the past 30 minutes, alert them!
  useEffect(() => {
    if (!donorProfile) return;

    const allRequests = storageService.getRequests();
    const responses = storageService.getResponses();

    const pendingCompatible = allRequests.find((req) => {
      if (req.status !== 'OPEN') return false;
      if (!isBloodCompatible(donorProfile.bloodGroup, req.bloodGroup)) return false;

      const resp = responses.find((r) => r.requestId === req.id && r.donorId === donorProfile.id);
      return !resp || resp.status === 'NOTIFIED';
    });

    if (pendingCompatible) {
      // Small timeout so DOM is ready
      const timer = setTimeout(() => {
        handleIncomingRequest(pendingCompatible);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [donorProfile, handleIncomingRequest]);

  // Handle modal confirmation
  const handleModalConfirmShare = (mode: 'LIVE' | 'HOME') => {
    if (!activeModalRequest || !donorProfile) return;

    if (mode === 'LIVE') {
      storageService.updateDonor({
        ...donorProfile,
        shareLive: true,
        liveUpdatedAt: new Date().toISOString(),
      });
    }

    storageService.setResponseStatus(activeModalRequest.id, donorProfile.id, 'ACCEPTED');
    playSuccessChime();
    dismissToast(activeModalRequest.id);
    setActiveModalRequest(null);
    refreshProfiles();

    setSuccessMessage(
      `Location and contact successfully shared with ${activeModalRequest.hospitalName}! The triage coordinator has been notified.`
    );
    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
  };

  const handleModalDecline = () => {
    if (!activeModalRequest || !donorProfile) return;
    storageService.setResponseStatus(activeModalRequest.id, donorProfile.id, 'DECLINED');
    dismissToast(activeModalRequest.id);
    setActiveModalRequest(null);
    refreshProfiles();
  };

  // Compute unread/pending count for the notification badge
  const unreadCount = toasts.length;

  return (
    <ToastNotificationContext.Provider
      value={{
        toasts,
        activeModalRequest,
        unreadCount,
        soundMuted,
        successMessage,
        toggleSound,
        dismissToast,
        pauseToast,
        resumeToast,
        openShareLocationModal,
        closeShareLocationModal,
        quickShareLiveLocation,
        declineRequest,
        simulateBroadcast,
        clearSuccessMessage,
      }}
    >
      {children}

      {/* Global Location Sharing Modal Triggered Directly from Toasts */}
      {activeModalRequest && donorProfile && user && (
        <LocationShareModal
          isOpen={!!activeModalRequest}
          onClose={closeShareLocationModal}
          request={activeModalRequest}
          donorProfile={donorProfile}
          user={user}
          onConfirmShare={handleModalConfirmShare}
          onDecline={handleModalDecline}
        />
      )}
    </ToastNotificationContext.Provider>
  );
};

export const useToastNotification = (): ToastNotificationContextType => {
  const context = useContext(ToastNotificationContext);
  if (!context) {
    throw new Error('useToastNotification must be used within a ToastNotificationProvider');
  }
  return context;
};
