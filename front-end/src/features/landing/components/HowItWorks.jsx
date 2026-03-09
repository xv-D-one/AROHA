import React from "react";
import Container from "../../../components/ui/Container";
import SectionTitle from "../../../components/ui/SectionTitle";

const steps = [
  {
    number: "01",
    title: "Upload Medical Records",
    description:
      "Admins or healthcare staff upload prescriptions, lab reports, or scanned medical documents into the secure system.",
  },
  {
    number: "02",
    title: "AI Extracts Clinical Data",
    description:
      "OCR and NLP engines automatically extract vitals, diagnoses, medications, and timestamps into structured formats.",
  },
  {
    number: "03",
    title: "Risk Engine Analysis",
    description:
      "Clinical rule engine evaluates medical thresholds and identifies potential health risks based on patient trends.",
  },
  {
    number: "04",
    title: "Interactive Dashboard",
    description:
      "Doctors access a real-time patient dashboard with historical data, alerts, and visual health insights.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <Container>
        <SectionTitle
          title="How It Works"
          subtitle="From prescription upload to clinical insight — our intelligent pipeline transforms raw data into actionable healthcare intelligence."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-16">
          
          {/* Steps */}
          <div className="space-y-10">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-light flex items-center justify-center text-primary font-bold text-lg shadow-md">
                  {step.number}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Workflow Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=1200&q=80"
              alt="Healthcare AI Workflow"
              className="rounded-2xl shadow-xl"
            />
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-accent/30 rounded-full blur-3xl"></div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;