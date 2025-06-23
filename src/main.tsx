import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./css/login.css";

import App from "@/App.tsx";

import { PrimeReactProvider } from "primereact/api";
import { BrowserRouter } from "react-router-dom";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { AuthProvider } from "@/context/AuthContext";

const themeId = "theme-link";
const themeHref =
    "https://unpkg.com/primereact/resources/themes/lara-light-blue/theme.css";
const link = document.createElement("link");
link.id = themeId;
link.rel = "stylesheet";
link.href = themeHref;
document.head.appendChild(link);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <PrimeReactProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </PrimeReactProvider>
        </BrowserRouter>
    </StrictMode>
);