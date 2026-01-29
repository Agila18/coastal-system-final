import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Waves, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
                        <Waves className="w-8 h-8" />
                        <span className="text-2xl font-bold">Hydro Hub</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className="hover:text-blue-200 transition-colors font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            to="/selection"
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Select Village
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-white hover:text-blue-200 focus:outline-none"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100 pb-4' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="flex flex-col space-y-3 pt-2">
                        <Link
                            to="/"
                            onClick={toggleMenu}
                            className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            to="/selection"
                            onClick={toggleMenu}
                            className="mx-4 bg-white text-blue-600 px-4 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors text-center shadow-lg"
                        >
                            Select Village
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
