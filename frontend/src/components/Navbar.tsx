import React from "react";

const Navbar: React.FC = () => (
    <nav className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-blue-600">Want-Have</h1>
        <div>
            <button className="mr-4">Login</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Post Item</button>
        </div>
    </nav>
);

export default Navbar;
