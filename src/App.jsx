import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./LandingPage/xora-main/src/sections/Header.jsx";
import SignupPage from "./Pages/Signup.jsx";
import SignInPage from "./Pages/SignIn.jsx";
import Chat from "./Pages/Chat.jsx";
import LandingPage from "./LandingPage/xora-main/src/LandingPage.jsx";
import Dashboard from "./Pages/Dashboard.jsx";

const App = () => {
    return ( 
        <div className="flex flex-col min-h-screen">
            <div className="fixed top-0 left-0 right-0 z-[50]">
                <Header />
            </div>
            <div className="mt-[72px]"> {/* Adjust this value based on your header height */}
                <Routes>
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;
