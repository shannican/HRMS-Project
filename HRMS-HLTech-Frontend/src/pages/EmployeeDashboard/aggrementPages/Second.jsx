import React from "react";

const Second = ({ watermarkImage, styles, signatureImage }) => {
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
        fontSize: "11pt", // Match First.jsx
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
              style={{ width: "350px", height: "40px" }} // Match First.jsx
            />
          </div>
          <hr className="mt-2" />
        </div>

        {/* Main Content Section */}
        <div style={{ flex: 1, textAlign: "justify", lineHeight: "1.6" }}>
          <p style={{ marginBottom: "10px" }}>
            joining. The company reserves the right to further extend the probation period as per its
            discretion or terminate the Employee’s employment, for any reason without or with giving
            15 days' notice or cause during the probation period. And the Employee may terminate this
            employment at any time by giving 30 days’ notice during the probation period.
          </p>
          <p style={{ marginBottom: "10px" }}>The Employee shall;</p>
          <ul className="list-disc pl-6 mb-4">
            <li style={{ marginBottom: "10px" }}>
              be entitled to one (1) leave per month leaves during the probation period, except for
              these all other leaves will be unpaid and these days of leaves will be added to the
              probation period i.e., the probation period will be strict at 90 days;
            </li>
            <li style={{ marginBottom: "10px" }}>
              not receive any document (Experience letter, Relieving letter, or Salary slips) without
              the completion of the probation period;
            </li>
            <li style={{ marginBottom: "10px" }}>
              work for a minimum of Ten (10) days (excluding week-offs) for being entitled to the
              compensation, if not the Employee shall be treated as absconded, therefore no amount of
              salary would be paid;
            </li>
            <li style={{ marginBottom: "10px" }}>
              receive all benefits of a confirmed employee such as medical insurance, provident fund
              (PF) & employee state insurance (ESI), if applicable after the completion of probation
              period.
            </li>
          </ul>

          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            2. Posting & Transfer
          </h3>
          <p style={{ marginBottom: "10px" }}>
            The Employee’s services are liable to be transferred, at the sole discretion of
            management, in such other capacity as the Company may determine, to any
            department/section, location, associate, sister concern, or subsidiary, at any place in
            India or abroad, whether existing today or which may come up in future.
          </p>

          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            3. Working hours & Timing
          </h3>
          <p style={{ marginBottom: "10px" }}>
            3.1 A full time working day shall comprise eight (08) hours, irrespective of shifts, and
            a break of 60 mins.
          </p>
          <p style={{ marginBottom: "10px" }}>
            3.2 A part time working day shall comprise nine (04) hours, irrespective of shifts.
          </p>
          <p style={{ marginBottom: "10px" }}>
            3.3 Company may, at any time and in its sole discretion, change the shift timings upon
            notice to you.
          </p>
        </div>
        <hr className="mt-4" />

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: "10pt", // Match First.jsx
            color: "black",
            lineHeight: "1.5", // Match First.jsx
            marginTop: "30px", // Match First.jsx
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

export default Second;