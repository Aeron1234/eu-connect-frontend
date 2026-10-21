"use client";
import { useEffect, useState } from 'react';
import { socket } from '@/components/ui/SocketProvider';
import { startMapLocationSession } from './mapLocationSession.mjs';
import { straightLineMeters } from './mapVisitPlanning.mjs';

export default function useMapViewerLocation() {
  const [enabled, setEnabled] = useState(false);
  const [position, setPosition] = useState(null);
  const [routePosition, setRoutePosition] = useState(null);
  const [status, setStatus] = useState('Use your location to start routes where you are now.');
  useEffect(() => {
    if (!enabled) return;
    return startMapLocationSession({ socket, geolocation: navigator.geolocation, onStatus: setStatus,
      onPosition(value) {
        setPosition(value);
        setRoutePosition(previous => {
          if (!value) return null;
          const next = { lat: value.latitude, lng: value.longitude, timestamp: value.timestamp, label: 'Your current location', live: true };
          return !previous || (value.timestamp - previous.timestamp >= 30000 && straightLineMeters(previous, next) >= 100) ? next : previous;
        });
      },
    });
  }, [enabled]);
  function start() {
    if (!navigator.geolocation || !window.isSecureContext) { setStatus('Location needs HTTPS (or localhost) and a browser with location support.'); return; }
    setStatus('Getting your current location…'); setEnabled(true);
  }
  function stop() { setEnabled(false); setPosition(null); setRoutePosition(null); setStatus('Routes start from Candelaria.'); }
  return { enabled, position, routePosition, status, start, stop };
}
