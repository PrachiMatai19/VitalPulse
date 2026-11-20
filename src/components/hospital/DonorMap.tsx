import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Building2, Phone, MapPin, Radio, ShieldCheck } from 'lucide-react';
import { BloodRequest, MatchedDonor } from '../../types';
import { formatDistance } from '../../utils/haversine';

interface DonorMapProps {
  request: BloodRequest;
  acceptedDonors: MatchedDonor[];
  selectedDonor?: MatchedDonor | null;
}

export const DonorMap: React.FC<DonorMapProps> = ({
  request,
  acceptedDonors,
  selectedDonor,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix default marker icon assets for Leaflet in bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [request.lat, request.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when request or acceptedDonors change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Hospital Marker (Red Marker Icon)
    const hospitalIcon = L.divIcon({
      className: 'custom-hosp-pin',
      html: `
        <div style="background-color: #dc2626; color: white; width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); border: 2px solid white;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
            <path d="M9 22v-4h6v4"/>
            <path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/>
            <path d="M12 10h.01"/><path d="M12 14h.01"/>
            <path d="M16 10h.01"/><path d="M16 14h.01"/>
            <path d="M8 10h.01"/><path d="M8 14h.01"/>
          </svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -20],
    });

    const hospMarker = L.marker([request.lat, request.lng], { icon: hospitalIcon });
    hospMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
        <strong style="color: #991b1b; font-size: 13px; display: block;">${request.hospitalName}</strong>
        <span style="font-size: 11px; color: #475569; display: block; margin-top: 2px;">${request.hospitalCity}</span>
        <div style="margin-top: 6px; padding: 4px 8px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; font-size: 11px; font-weight: bold; color: #b91c1c;">
          Needed: ${request.unitsNeeded} Units of ${request.bloodGroup} (${request.urgency})
        </div>
      </div>
    `);
    markersGroup.addLayer(hospMarker);

    // 2. Coverage search radius circle (15 km circle around hospital)
    const circle = L.circle([request.lat, request.lng], {
      color: '#ef4444',
      fillColor: '#fee2e2',
      fillOpacity: 0.15,
      radius: 10000, // 10 km
      weight: 1.5,
      dashArray: '4, 6',
    });
    markersGroup.addLayer(circle);

    const bounds = L.latLngBounds([[request.lat, request.lng]]);

    // 3. Accepted Donors Markers
    acceptedDonors.forEach((donor) => {
      if (!donor.lat || !donor.lng) return;

      const donorIcon = L.divIcon({
        className: 'custom-donor-pin',
        html: `
          <div style="background-color: #059669; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.4); border: 2px solid white; font-weight: 900; font-size: 11px;">
            ${donor.bloodGroup}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const donorMarker = L.marker([donor.lat, donor.lng], { icon: donorIcon });
      donorMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; min-width: 190px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #065f46; font-size: 13px;">${donor.name || 'Accepted Donor'}</strong>
            <span style="background: #d1fae5; color: #065f46; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px;">ACCEPTED</span>
          </div>
          <p style="font-size: 11px; color: #334155; margin: 2px 0;">Blood Group: <strong>${donor.bloodGroup}</strong> · ${donor.age} yrs</p>
          <p style="font-size: 11px; color: #334155; margin: 2px 0;">Distance: <strong>${formatDistance(donor.distanceKm)}</strong></p>
          ${
            donor.phone
              ? `<a href="tel:${donor.phone}" style="display: inline-block; margin-top: 6px; padding: 5px 10px; background: #059669; color: white; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold; text-align: center; width: 100%; box-sizing: border-box;">📞 Call ${donor.phone}</a>`
              : ''
          }
        </div>
      `);

      markersGroup.addLayer(donorMarker);
      bounds.extend([donor.lat, donor.lng]);

      // Connect hospital to accepted donor with a dashed line
      const routeLine = L.polyline(
        [
          [request.lat, request.lng],
          [donor.lat, donor.lng],
        ],
        {
          color: '#059669',
          weight: 2,
          opacity: 0.7,
          dashArray: '5, 8',
        }
      );
      markersGroup.addLayer(routeLine);
    });

    if (acceptedDonors.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView([request.lat, request.lng], 13);
    }
  }, [request, acceptedDonors]);

  // Center on selected donor if passed
  useEffect(() => {
    if (selectedDonor?.lat && selectedDonor?.lng && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedDonor.lat, selectedDonor.lng], 15);
    }
  }, [selectedDonor]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span>Interactive Proximity Map (Leaflet & OpenStreetMap)</span>
          </h4>
          <p className="text-xs text-slate-500">
            Hospital dispatch location, 10km emergency zone, and real-time positions of donors who accepted.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-red-600" />
            <span className="font-semibold text-slate-700">Hospital</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="font-semibold text-slate-700">Accepted Donor</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div ref={mapContainerRef} className="w-full h-80 sm:h-96 z-0" />

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 text-xs shadow-md space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Privacy Rule Enforced:</span>
          </div>
          <p className="text-[11px] text-slate-600 max-w-xs">
            Only donors who have clicked <strong>Accept</strong> are rendered with exact GPS coordinates.
          </p>
        </div>
      </div>
    </div>
  );
};
