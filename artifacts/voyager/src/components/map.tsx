import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import { Link } from "wouter";
import "maplibre-gl/dist/maplibre-gl.css";

type MapLayer = "openfreemap" | "versa" | "satellite";

const MAP_LAYERS: Record<MapLayer, { url: string; label: string; attribution: string }> = {
  openfreemap: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    label: "OpenFreeMap",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  versa: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    label: "VersaTiles",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    label: "SentinelMap",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri",
  },
};

interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: Array<{
    id: string | number;
    lat: number;
    lng: number;
    title: string;
    subtitle?: string;
    link?: string;
    color?: string;
  }>;
  onMarkerClick?: (id: string | number) => void;
  className?: string;
  interactive?: boolean;
  showLayerToggle?: boolean;
}

function LayerToggle({ layer, onChange }: { layer: MapLayer; onChange: (l: MapLayer) => void }) {
  return (
    <div className="absolute top-3 right-3 z-[1000] flex gap-1 bg-background/90 border border-border/60 p-1 backdrop-blur-sm">
      {(Object.keys(MAP_LAYERS) as MapLayer[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-all ${
            layer === key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          {MAP_LAYERS[key].label}
        </button>
      ))}
    </div>
  );
}

export function UrbexMap({
  center,
  zoom,
  markers = [],
  onMarkerClick,
  className = "h-[400px] w-full",
  interactive = true,
  showLayerToggle = true,
}: MapProps) {
  const [layer, setLayer] = useState<MapLayer>("openfreemap");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const baseStyle = useMemo<StyleSpecification>(() => ({
    version: 8,
    sources: {
      base: {
        type: "raster",
        tiles: [MAP_LAYERS[layer].url],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: "base",
        type: "raster",
        source: "base",
      },
    ],
  }), [layer]);

  const updateMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    const map = mapRef.current;
    if (!map) return;

    markers.forEach((marker) => {
      const markerEl = document.createElement("button");
      markerEl.type = "button";
      markerEl.className = "urbex-map-marker";
      markerEl.style.backgroundColor = marker.color ?? "hsl(var(--primary))";
      markerEl.style.borderColor = "hsl(var(--background))";
      markerEl.addEventListener("click", () => onMarkerClick?.(marker.id));

      const popupRoot = document.createElement("div");
      popupRoot.className = "urbex-popup-content";

      const title = document.createElement("div");
      title.className = "urbex-popup-title";
      title.textContent = marker.title;
      popupRoot.appendChild(title);

      if (marker.subtitle) {
        const subtitle = document.createElement("div");
        subtitle.className = "urbex-popup-subtitle";
        subtitle.textContent = marker.subtitle;
        popupRoot.appendChild(subtitle);
      }

      if (marker.link) {
        const link = document.createElement("a");
        link.href = marker.link;
        link.textContent = "View details";
        link.className = "urbex-popup-link";
        popupRoot.appendChild(link);
      }

      const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setDOMContent(popupRoot);
      const mapMarker = new maplibregl.Marker({ element: markerEl, anchor: "center" })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(mapMarker);
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: baseStyle,
      center,
      zoom,
      interactive,
      dragPan: interactive,
      scrollZoom: interactive,
      doubleClickZoom: interactive,
      touchZoomRotate: interactive,
      boxZoom: interactive,
      keyboard: false,
      attributionControl: false,
    });

    if (interactive) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    }

    map.on("load", () => {
      updateMarkers();
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setCenter(center);
    map.setZoom(zoom);
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(baseStyle);
    map.once("styledata", () => {
      updateMarkers();
    });
  }, [baseStyle]);

  useEffect(() => {
    updateMarkers();
  }, [markers]);

  return (
    <div className={`border border-border/50 bg-muted/20 relative z-0 ${className}`}>
      {interactive && showLayerToggle && <LayerToggle layer={layer} onChange={setLayer} />}
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute bottom-3 left-3 z-[1000] rounded-none bg-background/90 border border-border/50 p-2 text-[10px] text-muted-foreground font-mono">
        {MAP_LAYERS[layer].label}
      </div>
    </div>
  );
}

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    .urbex-map-marker {
      width: 16px;
      height: 16px;
      border: 2px solid hsl(var(--background));
      border-radius: 9999px;
      box-shadow: 0 0 12px rgba(0,0,0,0.2);
      cursor: pointer;
      transform: translate(-50%, -50%);
    }
    .urbex-popup-content {
      min-width: 160px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      color: hsl(var(--foreground));
    }
    .urbex-popup-title {
      font-weight: 700;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: hsl(var(--primary));
    }
    .urbex-popup-subtitle {
      margin-bottom: 0.5rem;
      color: hsl(var(--muted-foreground));
      font-size: 0.8rem;
      line-height: 1.3;
    }
    .urbex-popup-link {
      display: inline-block;
      margin-top: 0.3rem;
      color: hsl(var(--accent));
      text-decoration: underline;
    }
    .maplibregl-popup-content {
      background: hsl(var(--background));
      color: hsl(var(--foreground));
      border: 1px solid hsl(var(--border));
      border-radius: 0;
      box-shadow: 0 0 18px rgba(0,0,0,0.35);
    }
    .maplibregl-popup-tip {
      color: hsl(var(--background));
    }
  `;
  document.head.appendChild(style);
}
