import React from "react";

const Fifth = ({ watermarkImage, styles, signatureImage }) => {
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
          <p style={{ marginBottom: "10px", marginLeft:"15px" }}>
            attending work under the influence of alcohol, drugs, or other
            intoxicating substances, breach of the Company rules and policy,
            disobedience of reasonable orders from superiors or the Board,
            causing actual or threatening physical harm or damage to Company
            property, or any other act of misconduct.
          </p>
          <p style={{ marginBottom: "10px" }}>
            Additionally, the Company reserves the right to terminate this
            employment at any time, with or without notice, due to business
            exigencies, restructuring, downsizing, layoffs, or any other reason
            at its sole discretion.
          </p>

          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            10. Confidential Information
          </h3>
          <p style={{ marginBottom: "10px", marginLeft:"15px" }}>
            <b className="text-xs">10.1</b> You agree, as part of your employment hereunder, you will have
            access, directly or indirectly, to certain Confidential Information
            of Company and its affiliates and their employees, contractors
            and/or clients. At any time during the term of your employment, you
            agree to execute nondisclosure or similar agreements required by the
            Company and its affiliates and their employees, contractors and/or
            clients with respect to such Confidential Information.
          </p>
          <p style={{ marginBottom: "10px", marginLeft:"15px" }}>
            <b className="text-xs">10.2</b> During the term of your employment and thereafter, you
            shall:(a) hold the Confidential Information in the strictest
            confidence; (b) not make known, communicate, share, provide access
            to, transfer, disclose, reproduce, distribute or use or attempt to
            use, reproduce, distribute or disclose, or otherwise make available,
            the Confidential Information, at any time, either during or after
            your employment with the Company, except as expressly permitted in
            writing by the Company and solely for the purpose of performing your
            assigned duties for the Company for which such Confidential
            Information was disclosed to you and you shall also use your best
            endeavors to prevent any other person from doing so;(c) not disclose
            or divulge, share, provide access to, transfer or otherwise make
            available the Confidential Information to or for the benefit of any
            third person or entity, except to partners, employees or other
            authorized agents of the Company, to the extent you must do so to
            perform your assigned duties for the Company, without the prior
            written authorization of the Company and you shall also use your
            best endeavors to prevent any other person from disclosing or
            divulging such Confidential Information; (d) give prompt notice to
            Company of any actual or attempted unauthorized use or disclosure of
            the Confidential Information; and (e) return the Confidential
            Information, including any copies or reproductions, at Company
            request or upon termination of your employment and you shall cease
            all use of any Confidential Information and you shall promptly, at
            Company’s option, deliver to the Company
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
          className="absolute mt-10 left-0 right-10 flex justify-between text-[10pt]"
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

export default Fifth;
