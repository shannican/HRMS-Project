import React from "react";

const Twelfth = ({ watermarkImage, styles, signatureImage }) => {
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
          <p style={{ marginBottom: "10px" }}>
            Employee will certify that it has complied with the provisions of this paragraph.
          </p>
          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            16. Settlements of Disputes & Government Law
          </h3>
          <p style={{ marginBottom: "10px" }}>
            16.1 This Agreement shall be governed and interpreted according to the laws of India.
          </p>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">16.2</b> The Parties shall seek to resolve any dispute, controversy, claim or breach arising
            out of or in relation to this Agreement including any questions, issues or disputes
            concerning its existence, validity or termination, by amicable arrangement and in the
            spirit of compromise, and only if the Parties fail to resolve the same by amicable
            arrangement and compromise within a period of fifteen (15) days of receipt of written
            notice of the same by the other Party, either Party may resort to arbitration as provided
            herein.
          </p>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">16.3</b> Any dispute, controversy, claim or breach arising out of or in relation to this
            Agreement, including any questions, issues or disputes concerning its existence, validity
            or termination, shall be referred to arbitration in accordance with the Arbitration and
            Conciliation Act, 1996 of India. The arbitral tribunal shall consist of three members of
            whom the Parties shall nominate one each and the thus nominated two members shall in turn
            appoint the third member. The arbitration shall be conducted in English language at
            Bhopal, Madhya Pradesh. Depending on the consent of parties, the arbitrator may decide to
            hold proceedings at any other location.
          </p>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">16.4</b> This agreement shall be subject to jurisdiction of courts at Bhopal, Madhya Pradesh
            only.
          </p>
          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            17. Non-Assignment
          </h3>
          <p style={{ marginBottom: "10px" }}>
            This Agreement is personal to the Employee, and Employee may not assign or delegate any
            of Employee's rights or obligations hereunder without first obtaining the express written
            consent of the Employer.
          </p>
          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            18. Modifications of this agreement
          </h3>
          <p style={{ marginBottom: "10px" }}>
            No amendment, modification, or addition to this Agreement shall be effective or binding
            on either of the Parties hereto unless set forth in writing and executed by them through
            their duly authorized representatives; and subject to obtaining requisite approvals, if
            any, following such execution.
          </p>
          <p style={{ marginBottom: "10px", marginTop: "24px" }}>
            By acknowledging this Employment Agreement, the Parties hereto have executed this
            Agreement
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

export default Twelfth;