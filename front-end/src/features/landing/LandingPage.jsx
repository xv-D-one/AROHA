import React from "react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import Hero from "./components/Hero";
import Problems from "./components/Problems";
import Solutions from "./components/Solutions";
import HowItWorks from "./components/HowItWorks";
import ProductScreens from "./components/ProductScreens";
import Security from "./components/Security";
import TechStack from "./components/TechStack";
import CTA from "./components/CTA";

const LandingPage = () => {
  return (
    <>
      <Navbar />

      <main className="overflow-x-hidden">
        <Hero />
        <Problems />
        <Solutions />
        <HowItWorks />
        <ProductScreens />
        <Security />
        <TechStack />
        <CTA />
      </main>

      <Footer />
    </>
  );
};

export default LandingPage;