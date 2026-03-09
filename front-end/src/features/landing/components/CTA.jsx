import React from "react";
import Container from "../../../components/ui/Container";
import Button from "../../../components/ui/Button";

const CTA = () => {
  return (
    <section className="relative bg-linear-to-r from-secondary to-accent py-20 mt-24 overflow-hidden">
      <Container>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            Transform Clinical Data into Actionable Intelligence
          </h2>

          <p className="text-white/90 text-base md:text-lg mb-10">
            Empower healthcare professionals with AI-assisted record
            structuring, automated risk alerts, and intelligent patient
            dashboards — all in one secure platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-white text-secondary hover:bg-light hover:text-primary">
              Schedule Demo
            </Button>

            <Button className="bg-primary text-white hover:bg-white hover:text-primary border border-white">
              Contact Sales
            </Button>
          </div>
        </div>
      </Container>

      {/* Decorative Blur Background Effect */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
    </section>
  );
};

export default CTA;