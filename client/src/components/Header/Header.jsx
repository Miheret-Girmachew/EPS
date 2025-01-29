import React from 'react';
import logo from "../../assets/evangadi-logo.png";
import './Header';
import { Link } from "react-router-dom";

function Header() {
    return (
        <div className="navbar headerMain navbar-expand-lg fixed-top shadow-sm">
            <div className="container px-md-4">
                <Link className="navbar-brand" to="/home">
                    <img src={logo} alt="Evangadi Logo" />
                </Link>
            </div>
        </div>
    );
}

export default Header;
