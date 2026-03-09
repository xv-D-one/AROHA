import React from "react";
import Container from "../ui/Container";

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 mt-24">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              AROHA Health AI
            </h3>
            <p className="text-sm text-light leading-relaxed">
              AI-assisted medical record intelligence platform designed to
              structure clinical data, generate risk alerts, and empower
              smarter healthcare decisions.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-light">
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                Features
              </li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                Security
              </li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                Technology
              </li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                Roadmap
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-light">
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                About Us
              </li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                Contact
              </li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                Careers
              </li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                Privacy Policy
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-sm text-light mb-2">
              Email: support@arohahealth.ai
            </p>
            <p className="text-sm text-light mb-2">
              Phone: +91 98765 43210
            </p>
            <p className="text-sm text-light">
              Location: India
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-light/30 mt-12 pt-6 text-center text-sm text-light">
          © {new Date().getFullYear()} AROHA Health AI. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;