import React from "react";

const Eleventh = ({ watermarkImage, styles, signatureImage }) => {
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
            or any (B) prospective employee with whom the Organization has had
            discussions or negotiations within six months prior to Employee’s
            termination of employment, not to establish a relationship with the
            Organization, (ii) induce or attempt to induce any current customer
            to terminate its relationship with the Organization or (iii) induce
            any potential customer with whom the Organization has had
            discussions or negotiations within six months prior to Employee’s
            termination of employment not to establish a relationship with the
            Organization.
          </p>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">13.3</b> The Employee agrees that any material breach or written
            threatened breach of this clause may not be remedied solely by
            monetary damages, and that in addition to any other remedies, the
            Organization is entitled to seek injunction against the Employee in
            a forum of competent jurisdiction for any such breach.
          </p>
          <p style={{ marginBottom: "10px" }}>
           <b className="text-xs">13.4</b> The Employee agrees and acknowledges that the restrictions
            contained in this clause are considered to be reasonable in all the
            circumstances for the protection of the legitimate interests of the
            Organization and shall be enforceable independently. While the
            undertakings and agreements under clause 9 are considered by the
            Organization and the Employee to be reasonable in all circumstances,
            if one or more should be held to be invalid as an unreasonable
            restraint of trade or for any other reason whatsoever by a final
            adjudication of any tribunal or court of competent jurisdiction, but
            would have been held valid if part of the wording thereof had been
            deleted or the period thereof reduced or the range of activities or
            area dealt with reduced in scope, the said undertakings and
            agreements shall apply with such modifications as may be necessary
            to make them valid and effective.
          </p>
          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            14. Company Hardware / Software usage policy
          </h3>
          <p style={{ marginBottom: "10px" }}>
            During the term of employment the Employee shall comply with the
            Usage of Company’s Software/ Hardware Policy mentioned in the
            Employee Handbook.
          </p>
          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            15. Return of materials and documents
          </h3>
          <p style={{ marginBottom: "10px" }}>
            Upon the written request of the Company, the Employee shall return
            to it (or, at the request of the Company, erase or destroy) all
            materials that contain or embody any Confidential Information of the
            Company, including but not limited to all computer programs,
            documentation, financial statement, forms, notes, plans, drawings,
            customer information and copies thereof. Return or destruction of
            such material shall not relieve the Employee of its obligations of
            confidentiality. Upon the request of the Company, the
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
            marginTop: "30px", // Match previous pages
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

export default Eleventh;
