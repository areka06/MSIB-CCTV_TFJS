import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40); // Reduced scroll threshold for earlier effect
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-sm shadow-lg' 
            : 'bg-gradient-to-r from-red-600 to-red-700'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4 group">
              <img 
                className="h-14 w-14 transition-transform duration-300 group-hover:scale-105" 
                src="https://upload.wikimedia.org/wikipedia/commons/b/b8/Coat_of_arms_of_Yogyakarta.svg" 
                alt="Yogyakarta Logo"
              />
              <div className="flex flex-col">
                <span className={`text-xl font-bold transition-colors duration-300 ${
                  scrolled ? 'text-red-600' : 'text-white'
                }`}>
                  Smart Traffic
                </span>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  scrolled ? 'text-red-500/80' : 'text-white/90'
                }`}>
                  Jogja Smart Province
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink to="/" scrolled={scrolled}>Dashboard</NavLink>
              <NavLink to="/counting" scrolled={scrolled}>CCTV Counting</NavLink>
              {/* <NavLink to="/test" scrolled={scrolled}>Test</NavLink> */}
              {/* Enhanced Login Button */}
              <Link 
                to="/login"
                className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  scrolled
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white text-red-600 shadow-lg hover:shadow-xl'
                }`}
              >
                Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu}
              className={`md:hidden p-2.5 rounded-full transition-all duration-300 ${
                scrolled 
                  ? 'hover:bg-red-50 active:bg-red-100' 
                  : 'hover:bg-white/10 active:bg-white/20'
              }`}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X 
                  className={`h-6 w-6 transition-colors duration-300 ${
                    scrolled ? 'text-red-500' : 'text-white'
                  }`} 
                />
              ) : (
                <Menu 
                  className={`h-6 w-6 transition-colors duration-300 ${
                    scrolled ? 'text-red-500' : 'text-white'
                  }`} 
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={`md:hidden transition-all duration-500 ease-in-out ${
            isOpen 
              ? 'max-h-96 opacity-100 visible' 
              : 'max-h-0 opacity-0 invisible'
          }`}
        >
          <div className={`px-4 py-4 space-y-3 ${
            scrolled ? 'bg-white' : 'bg-gradient-to-r from-red-600 to-red-700'
          }`}>
            <MobileNavLink to="/" scrolled={scrolled} onClick={toggleMenu}>
              Dashboard
            </MobileNavLink>
            <MobileNavLink to="/counting" scrolled={scrolled} onClick={toggleMenu}>
              CCTV Counting
            </MobileNavLink>
            <MobileNavLink to="/test" scrolled={scrolled} onClick={toggleMenu}>
              Test
            </MobileNavLink>
            {/* Enhanced Mobile Login Button */}
            <Link 
              to="/login"
              onClick={toggleMenu}
              className={`block w-full text-center px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                scrolled
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-white text-red-600 shadow-lg hover:shadow-xl'
              }`}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Enhanced Overlay for mobile menu */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

// Enhanced Desktop Navigation Link Component
const NavLink = ({ to, children, scrolled }) => (
  <Link
    to={to}
    className={`text-lg font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
      scrolled
        ? 'text-red-600 hover:bg-red-50 hover:scale-105'
        : 'text-white hover:bg-white/10 hover:scale-105'
    }`}
  >
    {children}
  </Link>
);

// Enhanced Mobile Navigation Link Component
const MobileNavLink = ({ to, children, scrolled, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`block w-full px-4 py-3 text-lg font-medium rounded-lg transition-all duration-300 ${
      scrolled
        ? 'text-red-600 hover:bg-red-50 hover:scale-105'
        : 'text-white hover:bg-white/10 hover:scale-105'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;