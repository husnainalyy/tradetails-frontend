import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">My Application</h1>
                <nav>
                    <ul className="flex space-x-4">
                        <li><Link to="/" className="hover:text-gray-400">Home</Link></li>
                        <li><Link to="/dashboard" className="hover:text-gray-400">Dasboard</Link></li>
                        <li>
                            <SignedOut>
                                <SignInButton mode="redirect" redirectUrl="/signin" />
                            </SignedOut>

                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;