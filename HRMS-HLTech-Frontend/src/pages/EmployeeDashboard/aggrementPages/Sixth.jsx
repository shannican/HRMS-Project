import React from "react";

const Sixth = ({ watermarkImage, styles, signatureImage }) => {
  return (
    <div
      className="page relative w-[210mm] h-[297mm] bg-white py-6 px-10 box-border text-justify"
      style={{
        width: "794px", // A4 width at 96 DPI
        height: "1123px", // A4 height at 96 DPI
        padding: "50px", // ~20mm margins
        boxSizing: "border-box",
        backgroundColor: "#fff",
        fontFamily: '"Bookman Old Style", serif',
        fontSize: "11pt", // Match previous pages
        color: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // Distribute content to fill the page
      }}
    >
      {/* Watermark */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${watermarkImage}')`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "50%",
          opacity: 0.1,
          zIndex: 0,
        }}
      />
      <div className="relative z-10" style={{ height: "100%" }}>
        {/* Header Section with Company Logo */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
              marginLeft: "450px",
            }}
          >
            <img
              src="/hltechlogo.png" // Logo path from the public folder
              alt="HL Tech Logo"
              style={{ width: "350px", height: "40px" }} // Match previous pages
            />
          </div>
          <hr className="mt-2" />
        </div>

        {/* Main Content Section */}
        <div style={{ flex: 1, textAlign: "justify", lineHeight: "1.6" }}>
          <p style={{ marginBottom: "10px" }}>
            delete all originals and copies of any Confidential Information in
            any form or medium in your possession or control (including any of
            the foregoing stored or located in your office, home, laptop, tablet
            computer, smartphone, storage device or any other device that is not
            Company property or is not returned to Company) and shall notify and
            fully cooperate with the Company regarding the delivery or deletion
            of any other Confidential Information of which you are aware. Your
            obligations under this Section shall remain in effect and survive
            any termination or expiration of your employment or these Terms of
            Employment. Company shall be entitled to immediate injunctive
            relief, claim damages (liquidated or unliquidated) or similar relief
            and/or take disciplinary action (including but not limiting to
            termination) upon a potential, threatened or actual breach of this
            Section by you, including in the event where you take up or attempt
            to take up employment with or act or attempt to act as consultant or
            contractor to, any person, who may be a competitor of Company, or
            take up or attempt to take up employment or contract with any person
            in a manner that may result in disclosure or misuse of Confidential
            Information. You agree that any threatened or actual breach of this
            Section by you is likely to cause the Company substantial and
            irrevocable damage that is difficult to measure and may not be
            remedied solely by damages, and if the Company chooses to enforce
            its right to obtain an injunction from a court restraining such a
            breach or threatened breach, or specific performance of the
            provisions of this Section, you hereby waive the adequacy of a
            remedy at law as a defense to such relief Company's right under this
            clause is notwithstanding any other right available to the Company
            under these Terms of Employment or otherwise.
          </p>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">10.3</b> “Confidential Information” means any proprietary or
            confidential information, work product(whether produced by you or
            other resources of the Company or provided to you by Company or on
            Company’s and its affiliates’ and their employees’, contractors’
            and/or clients’ behalf) designs, business information or plans,
            inventions, technical data, business strategies, trade secrets or
            knowhow, in any media of Company, its affiliates and their
            employees, contractors and/or clients, and any other information
            concerning the business of the Company, its affiliates, or any of
            their dealings, transactions and affairs or any information
            concerning any of their suppliers, agents, distributors or customers
            which you possess, make or discover during your employment with the
            Company, whether oral or written or in electronic format, and
            whether marked as confidential or proprietary or not, including but
            not limited to, research, business plans, product plans, service
            offerings or services descriptions, projects or opportunities,
            proposals, Work Product or deliverables, computer programs and
            documentation, contractor, customer or client lists,
          </p>
        </div>
        <hr className="mt-4" />

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: "10pt", // Match previous pages
            color: "black",
            lineHeight: "1.5", // Match previous pages
            marginTop: "20px", // Match previous pages
          }}
        >
          <p>Corporate Address: 78, Indrapuri Sector-C, Bhopal (M.P) 462022</p>
          <p>
            Email: info@hltechindia.com | Contact: +91 94305 52744, +91 85389
            11038
          </p>
        </div>

        {/* Signatures */}
        <div
          className="absolute bottom-1 left-0 right-10 flex justify-between text-[10pt]"
          style={{ color: "rgb(51, 51, 51)" }}
        >
          <div style={styles.c31}>
            <span style={styles.c37}>Employee Signature:</span>
            {signatureImage ? (
              <img
                src={signatureImage}
                alt="Employee Signature"
                style={styles.image1}
              />
            ) : (
              <span style={styles.image1}>______________________</span>
            )}
          </div>
          <div style={styles.c31}>
            <span style={styles.c37}>Director Signature:</span>
            {signatureImage ? (
              <img
                src={signatureImage}
                alt="Director Signature"
                style={styles.image2}
              />
            ) : (
              <span style={styles.image2}>______________________</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sixth;
