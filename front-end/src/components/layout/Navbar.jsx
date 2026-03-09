import React, { useState, useEffect } from "react";
import Container from "../ui/Container";
import Button from "../ui/Button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="text-2xl font-bold text-primary cursor-pointer">
            AROHA Health AI
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-primary font-medium">
            <a
              href="#problems"
              className="hover:text-accent transition-colors duration-300"
            >
              Problem
            </a>

            <a
              href="#solutions"
              className="hover:text-accent transition-colors duration-300"
            >
              Solution
            </a>

            <a
              href="#how-it-works"
              className="hover:text-accent transition-colors duration-300"
            >
              How It Works
            </a>

            <a
              href="#technology"
              className="hover:text-accent transition-colors duration-300"
            >
              Technology
            </a>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3 ml-4">
              <Button className="bg-transparent text-primary border border-primary hover:bg-primary hover:text-white px-5 py-2 text-sm">
                Login
              </Button>

              <Button className="px-5 py-2 text-sm">
                Sign Up
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary focus:outline-none"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4 text-primary font-medium">
            <a href="#problems">Problem</a>
            <a href="#solutions">Solution</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#technology">Technology</a>

            <div className="flex flex-col gap-3 mt-4">
              <Button className="bg-transparent text-primary border border-primary hover:bg-primary hover:text-white">
                Login
              </Button>

              <Button>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;