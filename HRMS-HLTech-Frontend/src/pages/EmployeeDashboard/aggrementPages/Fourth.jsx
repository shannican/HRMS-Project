import React from "react";

const Fourth = ({ watermarkImage, styles, signatureImage }) => {
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
          <div style={{ textAlign: "center", marginBottom: "20px", marginLeft: "450px" }}>
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
        <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
           7. Leaves
          </h3>
          <p style={{ marginBottom: "10px" }}>
            The Employee will be entitled to leaves as governed by the Leave Policy (“refer to
            Leave Policy mentioned in Employee Handbook”) in the company.
          </p>

          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            8. Resignation
          </h3>
          <p style={{ marginBottom: "10px" }}>
            On confirmation, the Company may terminate this employment agreement at any time
            providing two (2) months’ notice without having to assign any reason. You may terminate
            this employment at any time by giving two (2) months’ notice in writing. Respective
            duration remuneration in lieu thereof will be payable by the party terminating the
            employment to the other party. The company reserves the right not to issue your relieving
            document/s if you fail to comply with the two-month notice period policy. Further, the
            company maintains the right to take legal action for breach of this clause and/or any
            serious misconduct.
          </p>

          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            9. Termination
          </h3>
          <p style={{ marginBottom: "10px" }}>
            The Company shall have the right to terminate this Agreement at any time with immediate
            effect by notice in writing for any one or more of the following reasons (
            <span style={{ fontWeight: 700 }}>"Cause"</span>):
          </p>
          <ul className="list-disc pl-6 mb-2">
            <li style={{ marginBottom: "10px" }}>
              a. if the Employee is in the opinion of the Company guilty of inattention or negligence
              in the conduct of the business of the Company or of any other act or omission
              inconsistent with his/her duties or commits any serious or repeated or continual breach
              of any of his obligations under this Agreement; or
            </li>
            <li style={{ marginBottom: "10px" }}>
              b. if the Employee is absent without leave for a period of thirty (30) days; or
            </li>
            <li style={{ marginBottom: "10px" }}>
              c. if the Employee is in the opinion of the Company guilty of any act or omission
              adversely affecting the goodwill, reputation, credit, operations or business of the
              Company, or commission of any crime involving material dishonesty or moral turpitude;
              or
            </li>
            <li style={{ marginBottom: "10px" }}>
              d. if the Employee is in the opinion of the Company guilty of any dishonesty, fraud,
              breach of statutory duties, breach of confidentiality obligations, pilferage and theft,
              attending work under the influence of alcohol, drugs, or other intoxicating substances,
              breach of the Company rules and policy, disobedience of reasonable orders from
              superiors or the Board, causing actual or threatening physical harm or damage to
              Company property, or any other act of misconduct.
            </li>
          </ul>
         
        </div>
        <hr className="mt-4" />

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: "10pt", // Match previous pages
            color: "black",
            lineHeight: "1.5", // Match previous pages
            marginTop: "30px", // Match previous pages
          }}
        >
          <p>Corporate Address: 78, Indrapuri Sector-C, Bhopal (M.P) 462022</p>
          <p>Email: info@hltechindia.com | Contact: +91 94305 52744, +91 85389 11038</p>
        </div>

        {/* Signatures */}
        <div
          className="absolute bottom-1 left-0 right-10 flex justify-between text-[10pt]"
          style={{ color: "rgb(51, 51, 51)" }}
        >
          <div style={styles.c31}>
            <span style={styles.c37}>Employee Signature:</span>
            {signatureImage ? (
              <img src={signatureImage} alt="Employee Signature" style={styles.image1} />
            ) : (
              <span style={styles.image1}>______________________</span>
            )}
          </div>
          <div style={styles.c31}>
            <span style={styles.c37}>Director Signature:</span>
            {signatureImage ? (
              <img src={signatureImage} alt="Director Signature" style={styles.image2} />
            ) : (
              <span style={styles.image2}>______________________</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fourth;