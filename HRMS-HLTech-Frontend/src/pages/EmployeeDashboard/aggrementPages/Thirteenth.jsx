import React from "react";

const Thirteenth = ({ watermarkImage, styles, signatureImage }) => {
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
        <div style={{ flex: 1, textAlign: "justify", lineHeight: "1.8" }}>
          <p style={{ marginBottom: "10px", marginTop: "50px", textAlign: "start" }}>
            hereby declare that all terms and conditions mentioned in the said letter are acceptable
            and is applicable to them in totality.
          </p>

            <p style={{ fontWeight: 700, textAlign: "start", marginTop: "40px" }}>
              For HL Tech India Private Limited
            </p>
          <div style={{ marginTop: "80px" }}>
            <p style={{ textAlign: "start" }}>Priya Kumari</p>
            <p style={{ textAlign: "start" }}>
              Chief Operating Officer (COO)
            </p>
            <p style={{ textAlign: "start" }}>
              HL Tech India Private Limited
            </p>
            <p style={{ textAlign: "start" }}>Date: __/__/____</p>
          </div>

          <div style={{ marginTop: "80px" }}>
            <p style={{ fontWeight: 700, textAlign: "start" }}>For Employee</p>
            <p style={{ marginTop: "50px", textAlign: "start" }}>
              {signatureImage ? (
                <img
                  src={signatureImage}
                  alt="Employee Signature"
                  style={{ width: "118px", height: "40px", margin: "0 auto", display: "block" }}
                />
              ) : (
                <span
                  style={{
                    display: "inline-block",
                    width: "118px",
                    borderBottom: "1px solid black",
                    textAlign: "start",
                  }}
                >
                </span>
              )}
            </p>
            <p style={{ marginTop: "30px", textAlign: "start" }}>Date: __/__/____</p>
          </div>

          {/* Additional spacing to fill the page (matching previous pages) */}
          <div style={{ marginTop: "80px" }}></div>
        </div>
        <hr className="mt-4" />

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: "10pt", // Match previous pages
            color: "black",
            lineHeight: "1.8", // Match previous pages
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

export default Thirteenth;