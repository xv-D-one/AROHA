import React from "react";
import Container from "../../../components/ui/Container";
import SectionTitle from "../../../components/ui/SectionTitle";

const techStack = [
  {
    name: "React",
    description:
      "Modern frontend framework for building scalable, responsive user interfaces.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
  },
  {
    name: "Tailwind CSS",
    description:
      "Utility-first CSS framework for fast, consistent, and modern UI development.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
  },
  {
    name: "FastAPI",
    description:
      "High-performance Python backend framework for building secure and scalable APIs.",
    image:
      "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png",
  },
  {
    name: "PostgreSQL",
    description:
      "Reliable relational database for secure and structured medical data storage.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg",
  },
  {
    name: "OCR + NLP",
    description:
      "AI-driven document processing pipeline for extracting structured clinical data.",
    image:
      "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
  },
  {
    name: "Cloud Infrastructure",
    description:
      "Scalable and secure deployment-ready architecture for healthcare environments.",
    image:
      "https://cdn-icons-png.flaticon.com/512/4144/4144517.png",
  },
];

const TechStack = () => {
  return (
    <section id="technology" className="py-24 bg-white">
      <Container>
        <SectionTitle
          title="Built on a Modern Scalable Stack"
          subtitle="Engineered with industry-standard technologies to ensure performance, scalability, and security."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 mt-16">
          {techStack.map((tech, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
            >
              <div className="flex justify-center mb-6">
                <img
                  src={tech.image}
                  alt={tech.name}
                  className="h-16 w-16 object-contain"
                />
              </div>

              <h3 className="text-xl font-semibold text-primary mb-4">
                {tech.name}
              </h3>

              <p className="text-secondary leading-relaxed text-sm">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default TechStack;