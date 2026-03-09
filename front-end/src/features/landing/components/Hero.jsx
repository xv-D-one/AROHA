import React from "react";
import Container from "../../../components/ui/Container";
import Button from "../../../components/ui/Button";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 bg-background">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          
          {/* Left Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight mb-6">
              AI-Powered Clinical Record Intelligence
            </h1>

            <p className="text-secondary text-lg mb-8 leading-relaxed">
              Transform unstructured prescriptions and patient records into
              structured medical data, automated risk alerts, and real-time
              clinical dashboards — securely and intelligently.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button>
                Request Demo
              </Button>

              <Button className="bg-white text-primary border border-primary hover:bg-primary hover:text-white">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1400&q=80"
              alt="Healthcare AI Dashboard"
              className="rounded-2xl shadow-2xl"
            />

            {/* Floating Accent Glow */}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-accent/30 rounded-full blur-3xl"></div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default Hero;