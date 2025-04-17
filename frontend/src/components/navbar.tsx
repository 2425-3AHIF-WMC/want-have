import React from "react";
import {
    FaSearch,
    FaShoppingCart,
    FaUser
} from "react-icons/fa";

const Navbar: React.FC = () => {
    return (
        <header className="navbar">
            <div className="logo">Zay</div>
            <nav className="nav-links">
                <a href="#">Home</a>
                <a href="#">About</a>
                <a href="#">Shop</a>
                <a href="#">Contact</a>
            </nav>
            <div className="nav-icons">
                <FaSearch />
                <div className="icon-badge">
                    <FaShoppingCart />
                    <span className="badge">7</span>
                </div>
                <div className="icon-badge">
                    <FaUser />
                    <span className="badge">+99</span>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
