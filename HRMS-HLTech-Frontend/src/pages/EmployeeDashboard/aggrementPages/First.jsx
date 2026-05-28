import React, { useEffect } from "react";

// Use the provided date: May 14, 2025
const providedDate = new Date("2025-05-14");
const currentDate = providedDate.toLocaleDateString("en-US"); // Outputs: "5/14/2025"

const First = ({ logoImage, styles, signatureImage, watermarkImage, employeeName, employeeAddress, designation }) => {
  // Debug: Log props to check if data is being passed
  useEffect(() => {
    console.log("First.jsx props:", {
      employeeName,
      employeeAddress,
      designation,
      signatureImage,
      watermarkImage,
    });
  }, [employeeName, employeeAddress, designation, signatureImage, watermarkImage]);

  return (
    <div
      className="page relative w-[210mm] h-[297mm] bg-white py-6 px-10 box-border text-justify"
      style={{
        position: "relative", // Ensure wrapper is relative
        zIndex: 10, // Ensure content is above watermark
        width: "794px",
        height: "1123px",
        padding: "50px",
        boxSizing: "border-box",
        backgroundColor: "#fff",
        fontFamily: '"Bookman Old Style", serif',
        fontSize: "11pt",
        color: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${watermarkImage})`,
          backgroundSize: "50%", // Scale to 50% of container
          backgroundPosition: "center", // Center the watermark
          backgroundRepeat: "no-repeat",
          opacity: 0.05, // Very subtle
          zIndex: 0, // Below content
          pointerEvents: "none", // Prevent interaction
        }}
      />

      {/* Existing content */}
      <div className="relative z-10" style={{ height: "100%" }}>
        {/* Header Section with Company Logo and Title */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px", marginLeft: "450px" }}>
            <img
              src="/hltechlogo.png"
              alt="HL Tech Logo"
              style={{ width: "350px", height: "40px" }}
              onError={() => console.error("Failed to load HL Tech Logo")}
            />
          </div>
          <hr className="mt-2" />
          <p
            style={{
              fontWeight: 700,
              fontSize: "12pt",
              margin: 20,
              textAlign: "center",
            }}
          >
            EMPLOYMENT AGREEMENT
          </p>
        </div>

        {/* Main Content Section */}
        <div style={{ flex: 1, textAlign: "justify", lineHeight: "1.6" }}>
          <p style={{ marginBottom: "10px" }}>
            <span>
              THIS EMPLOYMENT AGREEMENT{" "}
              <span style={{ fontWeight: 700 }}>("Agreement")</span> is entered into on{" "}
              <span style={{ padding: "0 4px" }}>{currentDate}</span>, by and between:
            </span>
          </p>
          <p style={{ marginBottom: "10px" }}>
            <span style={{ fontWeight: 700 }}>HL Tech India Private Limited</span> having its
            office at HN-78, In Front of Classic Gallery, Indrapuri, Sector-C, Bhopal, (MP) 462022{" "}
            <span style={{ fontWeight: 700 }}>("Company"</span>; which expression shall unless it be
            repugnant to the context or meaning thereof be deemed to mean and include their
            successors-in-interest and assigns), of one part;
          </p>
          <p style={{ marginBottom: "10px" }}>
            <span>
              <span style={{ fontWeight: 700 }}>
                <span style={{ padding: "0 4px" }}>{employeeName || "NAME OF EMPLOYEE"}</span>
              </span>{" "}
              residing at{" "}
              <span style={{ padding: "0 4px" }}>{employeeAddress || "ADDRESS"}</span>{" "}
              <span style={{ fontWeight: 700 }}>("Employee"</span>; which expression shall
              unless it be repugnant to the context or meaning thereof be deemed to mean and include
              its successors-in-interest and assign) of the other part.
            </span>
          </p>
          <p style={{ marginBottom: "10px" }}>
            Company and the Employee may individually be referred to as{" "}
            <span style={{ fontWeight: 700 }}>"Party"</span> and collectively as{" "}
            <span style={{ fontWeight: 700 }}>"Parties"</span>.
          </p>
          <p style={{ marginBottom: "10px" }}>
            <span>
              WHEREAS, the Parties mutually desire to enter into this Agreement to define and set
              forth the terms and conditions{" "}
              <span style={{ fontWeight: 700 }}>("Terms & Conditions")</span> of employment of the
              Employee by Company;
            </span>
          </p>

          {/* Updated TERMS & CONDITIONS Section */}
          <div style={{ width: "95%", margin: "0 auto" }}>
            <p
              style={{
                fontWeight: 700,
                fontSize: "12pt",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: "10px",
                marginTop: "50px",
              }}
            >
              TERMS & CONDITIONS
            </p>
            <p
              style={{
                fontWeight: 700,
                fontSize: "11pt",
                marginTop: "12px",
                marginBottom: "10px",
              }}
            >
              1. Employment
            </p>
            <div style={{ width: "95%", marginLeft: "20px" }}>
              <p style={{ marginBottom: "10px" }}>
                Company hereby employs the Employee on the position of{" "}
                <span style={{ padding: "0 4px" }}>{designation || "DESIGNATION"}</span>{" "}
                and the Employee hereby agrees to serve in such capacity, while he/she is employed by
                the Company. (<span style={{ fontWeight: 700 }}>"Tenure"</span>)
              </p>
              <p style={{ marginBottom: "10px" }}>
                The Employee hereby agrees that during the Tenure he/she shall devote his/her full
                business time to the affairs of the Company and shall exercise such powers as may be
                assigned, conferred, or vested in him/her by Company.
              </p>
              <p style={{ marginBottom: "10px" }}>
                The Employee shall also comply with all policies, procedures, rules, and regulations,
                both written and oral, as are announced by the Company from time to time.
              </p>
              <p style={{ marginBottom: "10px" }}>
                The Employee shall be on probation for a period of Three (3) months from the date
              </p>
            </div>
          </div>
        </div>
        <hr className="mt-4" />

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: "10pt",
            color: "black",
            lineHeight: "1.5",
            marginTop: "30px",
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              {signatureImage ? (
                <img
                  src={signatureImage}
                  alt="Employee Signature"
                  style={{
                    ...styles.image1,
                    marginBottom: "2px",
                    backgroundColor: "transparent", // Ensure no background
                  }}
                  onError={() => console.error("Failed to load employee signature")}
                />
              ) : (
                <span style={styles.image1}>______________________</span>
              )}
            </div>
          </div>
          <div style={styles.c31}>
            <span style={styles.c37}>Director Signature:</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={styles.image2}>______________________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default First;