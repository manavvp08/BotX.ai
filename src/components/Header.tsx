import Link from "next/link";
import React from "react";
import Profile from "./Profile";

const Header = () => {
    return (
        <>
            <nav className="wrapper flex-between inset-x-0 z-30 h-24">
                <div className="text-4xl font-bold text-blue-600 sm:text-5xl">
                    <Link href="/">BotX</Link>
                </div>
                <Profile />
            </nav>
        </>
    );
};

export default Header;
