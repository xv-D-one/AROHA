import React from "react";
import Container from "../../../components/ui/Container";
import SectionTitle from "../../../components/ui/SectionTitle";

const Security = () => {
  return (
    <section id="security" className="py-24 bg-background">
      <Container>
        <SectionTitle
          title="Enterprise-Grade Security & Data Privacy"
          subtitle="Built with healthcare-grade security principles to protect sensitive patient data and ensure trusted clinical operations."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-16">
          
          {/* Security Content */}
          <div className="space-y-8">
            <div className="flex gap-5">
              <div className="w-12 h-12 bg-light rounded-xl flex items-center justify-center text-primary font-bold shadow-md">
                🔐
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Encrypted Data Storage
                </h3>
                <p className="text-secondary leading-relaxed">
                  All patient records and structured medical data are securely
                  encrypted to prevent unauthorized access.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="w-12 h-12 bg-light rounded-xl flex items-center justify-center text-primary font-bold shadow-md">
                👤
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Role-Based Access Control
                </h3>
                <p className="text-secondary leading-relaxed">
                  Access permissions are controlled based on user roles such
                  as admin, doctor, or healthcare staff.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="w-12 h-12 bg-light rounded-xl flex items-center justify-center text-primary font-bold shadow-md">
                📊
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Audit Logging
                </h3>
                <p className="text-secondary leading-relaxed">
                  System activities are logged to maintain transparency and
                  accountability within the healthcare workflow.
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="w-12 h-12 bg-light rounded-xl flex items-center justify-center text-primary font-bold shadow-md">
                ☁️
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Secure Deployment Options
                </h3>
                <p className="text-secondary leading-relaxed">
                  Flexible deployment models including secure cloud hosting or
                  controlled on-premise infrastructure.
                </p>
              </div>
            </div>
          </div>

          {/* Security Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1400&q=80"
              alt="Healthcare Data Security"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -top-8 -right-8 w-48 h-48 bg-accent/20 rounded-full blur-3xl"></div>
          </div>

        </div>
      </Container>
    </section>
  );
};

export default Security;