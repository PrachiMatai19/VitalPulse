import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Flame,
  AlertTriangle,
  MapPin,
  Droplet,
  Building2,
  Filter,
  Layers,
  ZoomIn,
  RotateCcw,
  Clock,
  Radio,
  Activity,
  Maximize2,
  Compass,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { BloodRequest, BloodGroup, UrgencyLevel, Hospital } from '../../types';

interface RequestHeatmapProps {
  requests: BloodRequest[];
  hospitals: Hospital[];
}

export const RequestHeatmap: React.FC<RequestHeatmapProps> = ({
  requests,
  hospitals,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Filters State
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'CRITICAL' | 'URGENT'>('ALL');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE_ONLY' | 'ALL'>('ACTIVE_ONLY');
  const [radiusMultiplier, setRadiusMultiplier] = useState<number>(1.2);
  const [viewMode, setViewMode] = useState<'HEATMAP' | 'PINS' | 'HYBRID'>('HYBRID');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  // Filter requests according to user selection
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Status filter
      if (statusFilter === 'ACTIVE_ONLY') {
        if (req.status !== 'OPEN' && req.status !== 'ACCEPTED') return false;
      }

      // Urgency filter
      if (urgencyFilter === 'CRITICAL' && req.urgency !== 'CRITICAL') return false;
      if (urgencyFilter === 'URGENT' && req.urgency === 'NORMAL') return false;

      // Blood group filter
      if (bloodGroupFilter !== 'ALL' && req.bloodGroup !== bloodGroupFilter) return false;

      return true;
    });
  }, [requests, statusFilter, urgencyFilter, bloodGroupFilter]);

  // Aggregate stats
  const totalUnitsNeeded = useMemo(() => {
    return filteredRequests.reduce((sum, r) => sum + r.unitsNeeded, 0);
  }, [filteredRequests]);

  const criticalHotspotsCount = useMemo(() => {
    return filteredRequests.filter((r) => r.urgency === 'CRITICAL').length;
  }, [filteredRequests]);

  // Group requests by region/city for regional concentration index
  const regionalBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        city: string;
        requestCount: number;
        totalUnits: number;
        hasCritical: boolean;
        bloodGroups: Set<string>;
        lat: number;
        lng: number;
      }
    >();

    filteredRequests.forEach((req) => {
      const city = req.hospitalCity || 'General Metro';
      const existing = map.get(city) || {
        city,
        requestCount: 0,
        totalUnits: 0,
        hasCritical: false,
        bloodGroups: new Set<string>(),
        lat: req.lat,
        lng: req.lng,
      };

      existing.requestCount += 1;
      existing.totalUnits += req.unitsNeeded;
      if (req.urgency === 'CRITICAL') existing.hasCritical = true;
      existing.bloodGroups.add(req.bloodGroup);
      map.set(city, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.totalUnits - a.totalUnits);
  }, [filteredRequests]);

  // Blood group demand distribution
  const bloodGroupStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRequests.forEach((r) => {
      counts[r.bloodGroup] = (counts[r.bloodGroup] || 0) + r.unitsNeeded;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredRequests]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix marker assets
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapInstanceRef.current) {
      // Default center around regional medical corridor
      const initialLat = filteredRequests[0]?.lat || 12.9716;
      const initialLng = filteredRequests[0]?.lng || 77.5946;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
      });

      // CartoDB Positron / OSM tiles for crisp clinical rendering
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const heatGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);

      heatLayerGroupRef.current = heatGroup;
      markersLayerGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Heatmap Layers & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const heatGroup = heatLayerGroupRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !heatGroup || !markersGroup) return;

    heatGroup.clearLayers();
    markersGroup.clearLayers();

    if (filteredRequests.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Iterate through filtered requests and render multi-ring heat diffusion
    filteredRequests.forEach((req) => {
      const latLng: [number, number] = [req.lat, req.lng];
      bounds.extend(latLng);

      const isCritical = req.urgency === 'CRITICAL';
      const isUrgent = req.urgency === 'URGENT';

      // Base radius calculation weighted by unitsNeeded & radiusMultiplier
      const baseRadiusMeters = (800 + req.unitsNeeded * 350) * radiusMultiplier;

      // Color scheme according to urgency
      const primaryColor = isCritical ? '#dc2626' : isUrgent ? '#ea580c' : '#ca8a04';
      const glowColor = isCritical ? '#ef4444' : isUrgent ? '#f97316' : '#eab308';
      const auraColor = isCritical ? '#fee2e2' : isUrgent ? '#ffedd5' : '#fef9c3';

      // 1. Render Concentric Heat Diffusion Zones (Heatmap Effect)
      if (viewMode === 'HEATMAP' || viewMode === 'HYBRID') {
        // Outer dissipation halo
        const outerHalo = L.circle(latLng, {
          radius: baseRadiusMeters * 2.2,
          color: glowColor,
          fillColor: auraColor,
          fillOpacity: isCritical ? 0.22 : 0.14,
          weight: 0,
          interactive: false,
        });
        heatGroup.addLayer(outerHalo);

        // Middle thermal concentration layer
        const midHalo = L.circle(latLng, {
          radius: baseRadiusMeters * 1.3,
          color: primaryColor,
          fillColor: glowColor,
          fillOpacity: isCritical ? 0.38 : 0.25,
          weight: 0.8,
          dashArray: '3, 4',
          interactive: false,
        });
        heatGroup.addLayer(midHalo);

        // Core high-intensity epicenter
        const coreHalo = L.circle(latLng, {
          radius: baseRadiusMeters * 0.6,
          color: primaryColor,
          fillColor: primaryColor,
          fillOpacity: isCritical ? 0.65 : 0.45,
          weight: 1.5,
          interactive: false,
        });
        heatGroup.addLayer(coreHalo);
      }

      // 2. Render Interactive Hotspot Pin / Center Marker
      if (viewMode === 'PINS' || viewMode === 'HYBRID') {
        const pinHtml = `
          <div class="group relative flex items-center justify-center cursor-pointer">
            ${
              isCritical
                ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(220, 38, 38, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="
              background: ${primaryColor};
              color: white;
              width: 36px;
              height: 36px;
              border-radius: 12px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px ${primaryColor}66;
              border: 2px solid white;
              font-family: ui-sans-serif, system-ui, sans-serif;
              z-index: 10;
            ">
              <span style="font-size: 11px; font-weight: 900; line-height: 1;">${req.bloodGroup}</span>
              <span style="font-size: 9px; font-weight: 700; opacity: 0.9; line-height: 1; margin-top: 1px;">${req.unitsNeeded}U</span>
            </div>
          </div>
        `;

        const hotspotIcon = L.divIcon({
          className: 'custom-heat-pin',
          html: pinHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -20],
        });

        const marker = L.marker(latLng, { icon: hotspotIcon });

        const timeAgoText = new Date(req.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        marker.bindPopup(`
          <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 220px; max-width: 280px; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
              <span style="
                background: ${isCritical ? '#fef2f2' : isUrgent ? '#fff7ed' : '#fefce8'};
                color: ${primaryColor};
                font-size: 10px;
                font-weight: 800;
                padding: 2px 7px;
                border-radius: 9999px;
                border: 1px solid ${isCritical ? '#fecaca' : isUrgent ? '#fed7aa' : '#fef08a'};
                text-transform: uppercase;
              ">
                ${req.urgency} Hotspot
              </span>
              <span style="font-size: 10px; color: #64748b; font-family: monospace;">#${req.id}</span>
            </div>

            <strong style="color: #0f172a; font-size: 13px; display: block; line-height: 1.3;">
              ${req.hospitalName}
            </strong>
            <span style="font-size: 11px; color: #475569; display: block; margin-top: 2px;">
              📍 ${req.hospitalCity}
            </span>

            <div style="margin-top: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span style="color: #64748b;">Demand:</span>
                <strong style="color: #b91c1c; font-size: 12px;">${req.unitsNeeded} Units of ${req.bloodGroup}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span style="color: #64748b;">Status:</span>
                <strong style="color: ${req.status === 'ACCEPTED' ? '#059669' : '#d97706'}; font-weight: 700;">
                  ${req.status}
                </strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 4px;">
                <span>Raised at:</span>
                <span>${timeAgoText}</span>
              </div>
            </div>

            ${
              req.patientNotes
                ? `<p style="margin-top: 6px; font-size: 10px; color: #475569; font-style: italic; background: #fff1f2; border: 1px solid #ffe4e6; padding: 4px 6px; border-radius: 6px;">
                    "${req.patientNotes}"
                  </p>`
                : ''
            }
          </div>
        `);

        markersGroup.addLayer(marker);
      }
    });

    // Fit map bounds to encompass all filtered hotspots
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 13,
      });
    }
  }, [filteredRequests, radiusMultiplier, viewMode]);

  // Quick zoom to a specific region or hospital
  const handleFlyTo = (lat: number, lng: number, zoomLevel = 14) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoomLevel, {
        animate: true,
        duration: 1.2,
      });
    }
  };

  const handleResetZoom = () => {
    if (mapInstanceRef.current && filteredRequests.length > 0) {
      const bounds = L.latLngBounds(filteredRequests.map((r) => [r.lat, r.lng]));
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Heatmap Intelligence Summary Header */}
      <div className="bg-linear-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 text-white shadow-2xl border border-rose-900/50 relative overflow-hidden">
        {/* Ambient Gradient Glow Accents */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-rose-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-red-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-400/30 text-rose-200 px-3 py-1 rounded-full text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Real-Time Geospatial Emergency Heatmap</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Active Blood Request Hotspots</span>
            </h2>
            <p className="text-xs sm:text-sm text-rose-200/90 max-w-2xl">
              Visualizing geographical request clusters, acute deficit density, and emergency trauma epicenters across metropolitan hospital districts.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">
                Active Hotspots
              </span>
              <span className="text-2xl font-black text-white">{filteredRequests.length}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Epicenters detected</span>
            </div>

            <div className="bg-slate-900/80 border border-red-500/40 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                Critical Epicenters
              </span>
              <span className="text-2xl font-black text-red-400 flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                {criticalHotspotsCount}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Immediate danger</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                Total Units Deficit
              </span>
              <span className="text-2xl font-black text-amber-300">{totalUnitsNeeded}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Emergency units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Card & Interactive Filter Control Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Geospatial Filter Controls
              </span>
            </div>

            {/* View Mode Toggle: Heatmap vs Pins vs Hybrid */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <button
                onClick={() => setViewMode('HYBRID')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'HYBRID'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hybrid (Thermal + Pins)
              </button>
              <button
                onClick={() => setViewMode('HEATMAP')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'HEATMAP'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thermal Heatmap
              </button>
              <button
                onClick={() => setViewMode('PINS')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'PINS'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clinical Pins
              </button>
            </div>
          </div>

          {/* Filter Pills and Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Urgency Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Urgency Level
              </label>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="ALL">All Urgencies ({requests.length})</option>
                <option value="CRITICAL">Critical Only (Highest Priority)</option>
                <option value="URGENT">Urgent & Critical</option>
              </select>
            </div>

            {/* 2. Blood Group Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Blood Group Demand
              </label>
              <select
                value={bloodGroupFilter}
                onChange={(e) => setBloodGroupFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="ALL">All Blood Groups</option>
                <option value="O-">O- (Universal Red Cells)</option>
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+ (Universal Plasma)</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* 3. Status Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Request Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="ACTIVE_ONLY">Active Emergency Only (Open/Accepted)</option>
                <option value="ALL">All Requests (Including Fulfilled)</option>
              </select>
            </div>

            {/* 4. Radius / Intensity Multiplier */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span className="uppercase tracking-wider">Heat Radius Diffusion</span>
                <span className="text-rose-600 font-mono">{radiusMultiplier.toFixed(1)}x</span>
              </div>
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="range"
                  min="0.6"
                  max="2.4"
                  step="0.2"
                  value={radiusMultiplier}
                  onChange={(e) => setRadiusMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Quick Region Focus Shortcuts */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Quick Focus Region:
            </span>
            <button
              onClick={handleResetZoom}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3 h-3 text-slate-500" />
              <span>Full Grid Overview</span>
            </button>
            {regionalBreakdown.map((reg) => (
              <button
                key={reg.city}
                onClick={() => handleFlyTo(reg.lat, reg.lng, 13)}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-700 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>
                  {reg.city} ({reg.totalUnits} Units)
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Map Viewport Container */}
        <div className="relative">
          <div ref={mapContainerRef} className="w-full h-[450px] sm:h-[520px] z-0" />

          {/* Overlay Map Legend & Quick Calibration */}
          <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 text-xs shadow-lg space-y-2 max-w-xs hidden sm:block">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                Hotspot Thermal Intensity
              </span>
              <button
                onClick={handleResetZoom}
                className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer"
                title="Fit all markers"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-red-300" />
                  <span className="font-medium text-slate-700">Critical Hotspot (High Deficit)</span>
                </div>
                <span className="font-mono text-red-600 font-bold">15-30km aura</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-300" />
                  <span className="font-medium text-slate-700">Urgent Demand Zone</span>
                </div>
                <span className="font-mono text-orange-600 font-bold">10-20km aura</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-yellow-300" />
                  <span className="font-medium text-slate-700">Standard Replenishment</span>
                </div>
                <span className="font-mono text-yellow-600 font-bold">5-10km aura</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>Real-time hospital coordinates synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hotspots Analytics & Regional Concentration Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Concentration Index */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-600" />
                <span>Regional Hotspot Concentration Index</span>
              </h3>
              <p className="text-xs text-slate-500">
                Blood unit deficits and urgent demand density aggregated by municipal healthcare district.
              </p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
              {regionalBreakdown.length} Districts Affected
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {regionalBreakdown.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active hotspots match the selected filters.
              </div>
            ) : (
              regionalBreakdown.map((reg) => {
                const percentage = Math.round(
                  (reg.totalUnits / (totalUnitsNeeded || 1)) * 100
                );

                return (
                  <div
                    key={reg.city}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                        <strong className="text-slate-900 text-sm font-bold">
                          {reg.city}
                        </strong>
                        {reg.hasCritical && (
                          <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Critical Shortage
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          {reg.totalUnits} Units Required
                        </span>
                        <button
                          onClick={() => handleFlyTo(reg.lat, reg.lng, 14)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Zoom to Region"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar indicating concentration % */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          reg.hasCritical
                            ? 'bg-linear-to-r from-red-600 to-rose-500'
                            : 'bg-linear-to-r from-amber-500 to-yellow-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>
                        {reg.requestCount} active request(s) · {percentage}% of total network demand
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-600">Demanded Types:</span>
                        {Array.from(reg.bloodGroups).map((bg) => (
                          <span
                            key={bg}
                            className="bg-red-50 text-red-700 font-mono font-bold px-1.5 py-0.2 rounded text-[10px]"
                          >
                            {bg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Most Demanded Blood Groups in Hotspots */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Droplet className="w-5 h-5 text-red-600 fill-red-600" />
              <span>Hotspot Demand by Blood Group</span>
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated units in acute deficit across all active geospatial hotspots.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {bloodGroupStats.map(([group, units]) => {
              const isUniversal = group === 'O-';
              return (
                <div
                  key={group}
                  onClick={() => setBloodGroupFilter(group === bloodGroupFilter ? 'ALL' : group)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    bloodGroupFilter === group
                      ? 'bg-red-50 border-red-400 ring-1 ring-red-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-red-100 text-red-800 font-black text-sm flex items-center justify-center font-mono">
                      {group}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">
                        Blood Type {group}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isUniversal ? 'Universal Red Cell Donor' : 'Compatible Donors'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {units}
                    </span>{' '}
                    <span className="text-[11px] text-slate-500">Units</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 text-xs text-rose-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Geospatial Dispatch Guidance:</span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Admins can trigger localized emergency blood drives or re-route donor notifications by identifying overlapping hotspot radii.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Hotspots Detailed Epicenter Directory */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-700" />
              <span>Active Hotspot Epicenter Register</span>
            </h3>
            <p className="text-xs text-slate-500">
              Click any hospital hotspot to smoothly fly the map viewport to its geographic coordinates.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600">
            {filteredRequests.length} Hotspots Located
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((req) => {
            const isCritical = req.urgency === 'CRITICAL';
            return (
              <div
                key={req.id}
                onClick={() => handleFlyTo(req.lat, req.lng, 15)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 hover:shadow-md ${
                  isCritical
                    ? 'border-red-200 bg-red-50/20 hover:border-red-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-red-600 text-white'
                        : req.urgency === 'URGENT'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {req.urgency}
                  </span>

                  <span className="text-[10px] font-mono text-slate-400">#{req.id}</span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-rose-600">
                    {req.hospitalName}
                  </h4>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{req.hospitalCity}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Demanded Blood</span>
                    <strong className="text-red-700 font-bold font-mono">
                      {req.unitsNeeded} Units of {req.bloodGroup}
                    </strong>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlyTo(req.lat, req.lng, 15);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Focus</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
