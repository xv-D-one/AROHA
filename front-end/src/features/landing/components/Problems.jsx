import React from "react";
import Container from "../../../components/ui/Container";
import SectionTitle from "../../../components/ui/SectionTitle";
import manual_paperwork from "../../../assets/images/Manual_medical_paperwork.png"

const problems = [
  {
    title: "Fragmented Patient Records",
    description:
      "Medical data is often stored across paper prescriptions, scanned documents, and manual entries, making it difficult to maintain a unified patient history.",
  },
  {
    title: "Manual Risk Identification",
    description:
      "Doctors and administrators must manually review vitals and lab values, increasing the chances of missing early risk indicators.",
  },
  {
    title: "Administrative Overload",
    description:
      "Excessive documentation and record handling reduce the time healthcare professionals can dedicate to patient care.",
  },
];

const Problems = () => {
  return (
    <section id="problems" className="py-24 bg-background">
      <Container>
        <SectionTitle
          title="Healthcare Data Is Fragmented and Underutilized"
          subtitle="Traditional record management systems create inefficiencies, increase risk, and limit the potential of structured clinical insights."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-14 h-14 bg-light rounded-xl flex items-center justify-center mb-6 text-primary font-bold text-xl">
                {index + 1}
              </div>

              <h3 className="text-xl font-semibold text-primary mb-4">
                {problem.title}
              </h3>

              <p className="text-secondary leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* Supporting Image */}
        <div className="mt-20 flex justify-center relative">
          <div className="relative w-full max-w-xl">
            <img
              src={manual_paperwork}
              alt="Manual medical paperwork in hospital"
              className="rounded-2xl shadow-2xl mx-auto object-cover"
            />

            {/* Soft Glow Effect */}
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Problems;