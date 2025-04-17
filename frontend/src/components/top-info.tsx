import React from "react";
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn
} from "react-icons/fa";

const TopInfoBar: React.FC = () => {
    return (
        <div className="top-bar">
            <div className="contact-info">
                <span>📧 info@company.com</span>
                <span>📞 010-020-0340</span>
            </div>
            <div className="social-icons">
                <FaFacebookF/>
                <FaTwitter/>
                <FaInstagram/>
                <FaLinkedinIn/>
            </div>
        </div>
    );
};

export default TopInfoBar;