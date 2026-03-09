import React from "react";
import Container from "../../../components/ui/Container";
import SectionTitle from "../../../components/ui/SectionTitle";
import AI_Medical_Document_Processing from "../../../assets/images/AI_Medical_Document_Processing.png"

const ProductScreens = () => {
  return (
    <section id="product-screens" className="py-24 bg-white">
      <Container>
        <SectionTitle
          title="Designed for Clinical Efficiency"
          subtitle="A clean, intelligent interface built for doctors, administrators, and healthcare providers."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 items-center">
          
          {/* Dashboard Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1400&q=80"
              alt="Medical Dashboard Interface"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -top-8 -left-8 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-2xl font-semibold text-primary mb-4">
              Patient Intelligence Dashboard
            </h3>

            <p className="text-secondary mb-6 leading-relaxed">
              Access complete patient timelines, vitals history, lab trends,
              and real-time clinical alerts in a single unified dashboard.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-light text-primary rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                <p className="text-secondary">
                  Longitudinal patient health tracking
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-light text-primary rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                <p className="text-secondary">
                  Automated clinical risk alerts
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-light text-primary rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                <p className="text-secondary">
                  Fast patient ID-based search system
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Secondary Screen Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20 items-center">
          
          {/* Content */}
          <div>
            <h3 className="text-2xl font-semibold text-primary mb-4">
              Smart Record Upload & AI Processing
            </h3>

            <p className="text-secondary mb-6 leading-relaxed">
              Upload prescriptions or medical documents and let AI extract
              structured medical entities automatically using OCR and NLP.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-light text-primary rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                <p className="text-secondary">
                  Automatic vitals & diagnosis extraction
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-light text-primary rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                <p className="text-secondary">
                  Secure structured database storage
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-light text-primary rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                <p className="text-secondary">
                  Configurable clinical rule engine
                </p>
              </li>
            </ul>
          </div>

          {/* Upload Image */}
          <div className="relative">
            <img
              src={AI_Medical_Document_Processing}
              alt="AI Medical Document Processing"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
          </div>
        </div>

      </Container>
    </section>
  );
};

export default ProductScreens;