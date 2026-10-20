"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import logo from "@/public/logo.png";
import philippinesMap from "@/public/philippines-network-map.svg";

// These illustrative locations are deliberately independent of application data.
// Keep this projection aligned with public/philippines-network-map.svg.
function project(longitude, latitude) {
  return {
    x: 60 + (longitude - 116.6) * 36 * Math.cos(12 * Math.PI / 180),
    y: 20 + (21.2 - latitude) * 36,
  };
}

const campus = project(121.423, 13.931);
const locations = [
  ["laoag", "Laoag", "Ilocos Norte", 120.59, 18.2],
  ["tuguegarao", "Tuguegarao", "Cagayan", 121.72, 17.61],
  ["baguio", "Baguio", "Benguet", 120.6, 16.4],
  ["santiago", "Santiago", "Isabela", 121.55, 16.69],
  ["olongapo", "Olongapo", "Zambales", 120.29, 14.84],
  ["legazpi", "Legazpi", "Albay", 123.74, 13.14],
  ["coron", "Coron", "Palawan", 120.2, 12.0],
  ["puerto-princesa", "Puerto Princesa", "Palawan", 118.74, 9.74],
  ["roxas", "Roxas", "Capiz", 122.75, 11.58],
  ["iloilo", "Iloilo", "Iloilo", 122.56, 10.72],
  ["cebu", "Cebu", "Cebu", 123.89, 10.315],
  ["tacloban", "Tacloban", "Leyte", 125.0, 11.244],
  ["dumaguete", "Dumaguete", "Negros Oriental", 123.3, 9.31],
  ["surigao", "Surigao", "Surigao del Norte", 125.49, 9.79],
  ["cagayan-de-oro", "Cagayan de Oro", "Misamis Oriental", 124.63, 8.45],
  ["dipolog", "Dipolog", "Zamboanga del Norte", 123.34, 8.59],
  ["zamboanga", "Zamboanga", "Zamboanga Peninsula", 122.08, 6.92],
  ["cotabato", "Cotabato", "Maguindanao del Norte", 124.25, 7.22],
  ["davao", "Davao", "Davao del Sur", 125.46, 7.19],
  ["general-santos", "General Santos", "South Cotabato", 125.17, 6.12],
  ["manila", "Manila", "Metro Manila", 120.9842, 14.5995],
].map(([id, name, province, longitude, latitude], index) => {
  const point = project(longitude, latitude);
  const dx = point.x - campus.x;
  const dy = point.y - campus.y;
  const bend = index % 2 ? 0.14 : -0.14;
  return {
    id, name, province, ...point,
    path: `M ${campus.x} ${campus.y} Q ${(campus.x + point.x) / 2 - dy * bend} ${(campus.y + point.y) / 2 + dx * bend} ${point.x} ${point.y}`,
  };
});

function position(point) {
  return { left: `${point.x / 520 * 100}%`, top: `${point.y / 640 * 100}%` };
}

const ROUTE_DURATION_MS = 1800;
const ROUTE_OVERLAP_MS = 100;
const MAX_ACTIVE_ROUTES = 11; // Two groups of up to five, plus a selected pin's pulse.

export default function PhilippinesNetwork() {
  const [selectedId, setSelectedId] = useState(null);
  const [flights, setFlights] = useState([]);
  const sequence = useRef(0);
  const selected = locations.find(location => location.id === selectedId);
  const activeLocationIds = new Set(flights.map(flight => flight.id));

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const expiryTimers = new Set();
    let nextTimer;
    let previousIds = new Set();

    function animate() {
      const choices = locations.filter(location => !previousIds.has(location.id));
      const count = 2 + Math.floor(Math.random() * 4);
      const batch = Array.from({ length: count }, () => {
        const [location] = choices.splice(Math.floor(Math.random() * choices.length), 1);
        return { id: location.id, path: location.path, sequence: ++sequence.current };
      });
      previousIds = new Set(batch.map(flight => flight.id));
      const batchKeys = new Set(batch.map(flight => flight.sequence));
      setFlights(current => [...current, ...batch].slice(-MAX_ACTIVE_ROUTES));

      const expiryTimer = window.setTimeout(() => {
        expiryTimers.delete(expiryTimer);
        setFlights(current => current.filter(flight => !batchKeys.has(flight.sequence)));
      }, ROUTE_DURATION_MS);
      expiryTimers.add(expiryTimer);
      nextTimer = window.setTimeout(animate, ROUTE_DURATION_MS - ROUTE_OVERLAP_MS);
    }

    function clearTimers() {
      window.clearTimeout(nextTimer);
      for (const timer of expiryTimers) window.clearTimeout(timer);
      expiryTimers.clear();
    }

    function updateMotion() {
      clearTimers();
      setFlights([]);
      previousIds = new Set();
      if (!motion.matches) nextTimer = window.setTimeout(animate, 300);
    }

    if (!motion.matches) nextTimer = window.setTimeout(animate, 300);
    motion.addEventListener("change", updateMotion);
    return () => {
      clearTimers();
      motion.removeEventListener("change", updateMotion);
    };
  }, []);

  function selectLocation(location) {
    setSelectedId(location.id);
    const pulse = { id: location.id, path: location.path, sequence: ++sequence.current, manual: true };
    setFlights(current => [...current.filter(flight => !flight.manual), pulse].slice(-MAX_ACTIVE_ROUTES));
  }

  return (
    <figure className="landing-network" style={{ "--network-route-duration": `${ROUTE_DURATION_MS}ms` }} aria-label="MSEUF-Candelaria connected to company locations across the Philippines">
      <div className="landing-network-heading">
        <div>
          <p className="landing-network-eyebrow">Our OJT community</p>
          <h2>From Candelaria. Connected across the Philippines.</h2>
        </div>
        <span className="landing-network-badge"><span /> Philippines</span>
      </div>

      <div className="landing-network-stage">
        <div className="landing-network-orbit landing-network-orbit-one" aria-hidden="true" />
        <div className="landing-network-orbit landing-network-orbit-two" aria-hidden="true" />
        <Image
          src={philippinesMap}
          alt="Outline of the Philippine islands"
          width={520}
          height={640}
          className="landing-network-map"
          draggable={false}
        />

        <svg className="landing-network-routes" viewBox="0 0 520 640" fill="none" aria-hidden="true">
          {locations.map(location => <path key={location.id} d={location.path} className="landing-network-route-base" />)}
          {flights.map(flight => (
            <path
              key={flight.sequence}
              d={flight.path}
              pathLength="1"
              className="landing-network-route-active"
              onAnimationEnd={() => setFlights(current => current.filter(item => item.sequence !== flight.sequence))}
            />
          ))}
          {selected && <path d={selected.path} className="landing-network-route-selected" />}
          <g className="landing-network-island-labels">
            <text x="312" y="178">LUZON</text>
            <text x="374" y="369">VISAYAS</text>
            <text x="365" y="576">MINDANAO</text>
          </g>
        </svg>

        {locations.map(location => (
          <button
            key={location.id}
            type="button"
            className="landing-network-pin"
            data-location={location.id}
            style={position(location)}
            data-active={activeLocationIds.has(location.id) || undefined}
            aria-pressed={selectedId === location.id}
            aria-label={`Company location: ${location.name}. Highlight connection from MSEUF-Candelaria.`}
            title={`${location.name}, ${location.province}`}
            onClick={() => selectLocation(location)}
          >
            <span className="landing-network-pin-glow" aria-hidden="true" />
            <MapPin aria-hidden="true" />
          </button>
        ))}

        <button
          type="button"
          className="landing-network-campus"
          style={position(campus)}
          aria-label="MSEUF-Candelaria campus, Candelaria, Quezon. Clear selected connection."
          onClick={() => { setSelectedId(null); setFlights([]); }}
        >
          <span className="landing-network-campus-ring" aria-hidden="true" />
          <Image src={logo} alt="MSEUF-Candelaria school seal" width={48} height={48} draggable={false} />
          <span className="landing-network-campus-label">MSEUF-CI<span>Candelaria, Quezon</span></span>
        </button>

        <div className="landing-network-map-note" aria-hidden="true"><span /> It starts with our school.</div>
      </div>

      <figcaption className="landing-network-caption">
        <div className="landing-network-selection" role="status" aria-live="polite" aria-atomic="true">
          <span className="landing-network-caption-icon"><MapPin aria-hidden="true" /></span>
          <div><p>{selected ? `${selected.name}, ${selected.province}` : "Connected across the Philippines"}</p><span>{selected ? "Connected to MSEUF-Candelaria" : "Select a pin to light up its connection"}</span></div>
        </div>
        <ArrowUpRight className="landing-network-caption-arrow" aria-hidden="true" />
      </figcaption>
      <p className="landing-network-footnote">Illustrative company locations</p>
    </figure>
  );
}
