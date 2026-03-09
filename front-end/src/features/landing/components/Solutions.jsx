import React from "react";
import Container from "../../../components/ui/Container";
import SectionTitle from "../../../components/ui/SectionTitle";

const solutions = [
  {
    title: "Intelligent Data Extraction",
    description:
      "Advanced OCR and NLP pipelines extract structured clinical entities such as vitals, diagnoses, medications, and timestamps from unstructured prescriptions and reports.",
  },
  {
    title: "Clinical Rule Engine",
    description:
      "Configurable medical thresholds analyze patient vitals and lab values to generate automated risk alerts and highlight abnormal trends.",
  },
  {
    title: "Real-Time Patient Dashboard",
    description:
      "Unified dashboard provides longitudinal health tracking, searchable patient records, and visualized clinical insights in real time.",
  },
];

const Solutions = () => {
  return (
    <section id="solutions" className="py-24 bg-white">
      <Container>
        <SectionTitle
          title="AI-Driven Clinical Intelligence"
          subtitle="Our platform transforms fragmented medical records into structured, actionable healthcare insights."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-background shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-light rounded-xl flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-sm">
                {index + 1}
              </div>

              <h3 className="text-xl font-semibold text-primary mb-4">
                {solution.title}
              </h3>

              <p className="text-secondary leading-relaxed">
                {solution.description}
              </p>
            </div>
          ))}
        </div>

        {/* Supporting Visual */}
        <div className="mt-20 relative">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80"
            alt="AI healthcare data analysis dashboard"
            className="rounded-2xl shadow-2xl"
          />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>
      </Container>
    </section>
  );
};

export default Solutions;