import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"


const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) {
    throw new Error("Missing Publishable Key");
}

const root = ReactDOM.createRoot(document.getElementById("root"));


root.render(
    <React.StrictMode>
        <BrowserRouter>
            <ClerkProvider publishableKey={clerkPubKey}>
                <App />
                <Toaster />
            </ClerkProvider>
        </BrowserRouter>
    </React.StrictMode>
);