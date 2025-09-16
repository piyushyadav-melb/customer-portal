import Image from "next/image";
import Link from "next/link";
import FavIcon from "@/public/images/all-img/fav-icon.png";
import { Button } from "react-day-picker";

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo on the left */}
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <Image
                                src={FavIcon}
                                alt="Mind Namo Logo"
                                className="w-14 h-14 object-cover"
                                priority={true}
                            />
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-blue-700">MINDNAMO.COM</h1>
                                <p className="text-sm text-gray-600">Expert Consultation Platform</p>
                            </div>
                        </Link>

                        {/* Login and Signup buttons on the right */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="px-6 py-2 text-blue-700 border border-blue-700 rounded hover:bg-blue-50 transition-colors"
                            >
                                Login
                            </Link>
                            <Link href="/register" className="px-6 py-2 text-blue-700 border border-blue-700 rounded hover:bg-blue-50 transition-colors">Sign Up</Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};

export default layout;