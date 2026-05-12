import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet's default icon path issues with Vite
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// Force dark mode
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(<App />);
