"use client"

import { Link as LinkScroll } from "react-scroll"
import { useEffect, useState } from "react"
import clsx from "clsx"
import { SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/clerk-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { X, Menu } from "lucide-react" // Import icons for better visibility

const Header = () => {
    const [hasScrolled, setHasScrolled] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const { isSignedIn, getToken } = useAuth()
    const navigate = useNavigate()
    const user = useUser()
    const location = useLocation()

    // Redirect to /dashboard when signed in
    useEffect(() => {
        if (isSignedIn && location.pathname === "/signin") {
            navigate("/dashboard")
        }
    }, [isSignedIn, navigate, location])

    useEffect(() => {
        const authenticateBackend = async () => {
            if (!isSignedIn) return // Only proceed if the user is signed in

            try {
                // Automatically fetch the JWT using the "USERJWT" template

                // Send the token to the backend for validation
                const response = await fetch("http://localhost:5000/api/auth/verify-token", {
                    method: "POST",

                    headers: {
                        Authorization: `Clerk ${user.id}`,
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error(`Authentication failed: ${response.status}`)
                }

                // Backend validation success
                const result = await response.json()
                console.log("Backend Validation Success:", result)

                // Navigate to the dashboard after successful backend validation
                navigate("/dashboard")
            } catch (error) {
                console.error("Error validating token with backend:", error)
            }
        }

        authenticateBackend() // Automatically run the authentication
    }, [isSignedIn, getToken, navigate])

    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 32)
        }

        window.addEventListener("scroll", handleScroll)

        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    const NavLink = ({ title }) => (
        <LinkScroll
            onClick={() => setIsOpen(false)}
            to={title}
            offset={-100}
            spy
            smooth
            activeClass="nav-active"
            className="base-bold text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5"
        >
            {title}
        </LinkScroll>
    )

    return (
        <header
            className={clsx(
                "w-full bg-[#080D27] py-2", // Added solid background color
                hasScrolled ? "shadow-lg" : "",
            )}
            style={{ zIndex: 100 }} // Increased z-index to be above sidebar
        >
            <div className="container flex h-14 items-center max-lg:px-5">
                <a className="lg:hidden flex-1 cursor-pointer z-10">
                    <img src="images/xora.svg" width={115} height={55} alt="logo" />
                </a>

                <div
                    className={clsx(
                        "w-full max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:w-full max-lg:bg-[#080D27]", // Changed from bg-s2 to match your color
                        isOpen ? "max-lg:opacity-100 max-lg:z-[90]" : "max-lg:pointer-events-none max-lg:opacity-0 max-lg:z-0",
                    )}
                >
                    <div className="max-lg:relative max-lg:flex max-lg:flex-col max-lg:min-h-screen max-lg:p-6 max-lg:overflow-hidden sidebar-before max-md:px-4 bg-[#080D27]">
                        {/* Close button for mobile - positioned absolutely in the top right */}
                        <button
                            className="lg:hidden absolute top-4 right-4 z-[95] size-10 border-2 border-white/25 rounded-full flex justify-center items-center text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="size-5" />
                        </button>
                        <nav className="max-lg:relative max-lg:z-20 max-lg:my-auto">
                            <ul className="flex justify-center items-center max-lg:block max-lg:px-12">
                                <li className="nav-li">
                                    <Link
                                        to="/"
                                        className="base-bold text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5"
                                    >
                                        Home
                                    </Link>
                                    <div className="dot" />
                                    <Link
                                        to="/dashboard"
                                        className="base-bold text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5"
                                    >
                                        Dashboard
                                    </Link>
                                </li>

                                <li className="nav-logo">
                                    <LinkScroll
                                        to="hero"
                                        offset={-250}
                                        spy
                                        smooth
                                        className={clsx("max-lg:hidden transition-transform duration-500 cursor-pointer")}
                                    >
                                        <img src="images/xora.svg" width={160} height={55} alt="logo" />
                                    </LinkScroll>
                                </li>

                                <li className="nav-li base-bold text-p4 uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5">
                                    <NavLink title="faq" />
                                    <div className="dot" />

                                    <SignedOut>
                                        {/* Replace Clerk's SignInButton with a Link component */}
                                        <Link to="/signin">
                                            <button className="sign-in-button">Sign In</button>
                                        </Link>
                                    </SignedOut>

                                    <SignedIn>
                                        {/* Show user button when signed in */}
                                        <UserButton afterSignOutUrl="/" />
                                    </SignedIn>
                                </li>
                            </ul>
                        </nav>
                        <div className="lg:hidden block absolute top-1/2 left-0 w-[960px] h-[380px] translate-x-[-290px] -translate-y-1/2 rotate-90">
                            <img src="/images/bg-outlines.svg" width={960} height={380} alt="outline" className="relative z-2" />
                            <img
                                src="/images/bg-outlines-fill.png"
                                width={960}
                                height={380}
                                alt="outline"
                                className="absolute inset-0 mix-blend-soft-light opacity-5"
                            />
                        </div>
                    </div>
                </div>

                {/* Toggle button for mobile menu */}
                <button
                    className="lg:hidden z-[95] size-10 border-2 border-white/25 rounded-full flex justify-center items-center text-white"
                    onClick={() => setIsOpen((prevState) => !prevState)}
                >
                    {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
            </div>
        </header>
    )
}

export default Header

