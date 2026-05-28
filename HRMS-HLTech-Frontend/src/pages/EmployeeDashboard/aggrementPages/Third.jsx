import React from "react";

const Third = ({ watermarkImage, styles, signatureImage }) => {
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
        fontSize: "11pt", // Match First.jsx and Second.jsx
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
              style={{ width: "350px", height: "40px" }} // Match First.jsx and Second.jsx
            />
          </div>
          <hr className="mt-2" />
        </div>

        {/* Main Content Section */}
        <div style={{ flex: 1, textAlign: "justify", lineHeight: "1.6" }}>
          <p style={{ marginBottom: "10px" }}>
            3.4 Company may at any time, in its sole discretion, require you to work beyond eight
            (8) or four (4) hours a day upon notice to you.
          </p>
          <p style={{ marginBottom: "10px" }}>
            3.5 You may be required to work out of our client’s office/site within India, out of
            business requirement. During such a deployment you will be required to align your daily
            working hours and/or regular work week as per the client’s working norms.
          </p>

          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            4. Compensation & Benefits
          </h3>
          <p style={{ marginBottom: "10px" }}>
            4.1 As full compensation for all services rendered, the Employee shall be paid
            compensation as specified in Annexure A (<span style={{ fontWeight: 700 }}>"Compensation"</span>).
            The Company's salary structure may be altered/modified at any time without prior notice.
            Remuneration package & other terms may be changed/ modified from time to time.
          </p>
          <p style={{ marginBottom: "10px" }}>
            4.2 The Compensation shall be reviewed on an annual basis subject to appraisal and
            performance of the Employee. Such Compensation shall be subject to applicable statutory
            deductions by the Company.
          </p>

          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            5. Duties & Obligations
          </h3>
          <p style={{ marginBottom: "10px" }}>
            The Employee shall work full time for the Company, devoting his/her time, attention, and
            skills to the duties of his/her office and shall faithfully, efficiently, competently,
            and diligently perform such duties and exercise such powers as may from time to time be
            assigned to or vested in him/her and shall comply with all lawful directions given by or
            under the authority of the management and use his/her best endeavors to promote and
            extend the business of the Company and to protect and further the interests and
            reputation of the Company.
          </p>

          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            6. Multiple Employments
          </h3>
          <p style={{ marginBottom: "10px" }}>
            The Employee is required by the Company not to undertake or enter into any other type of
            association anywhere else, even on a part time basis whether for any consideration or
            not. Contravention of this will lead to termination of your services from the company
            without notice, with no liability on part of the company for payment of compensation in
            lieu of such notice. The rules of the company governing all matters specified above
            including matters such as designation, emoluments and the structure thereof, etc. are
            subject to change without prior notice.
          </p>

          
          
        </div>
        <hr className="mt-4" />

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: "10pt", // Match First.jsx and Second.jsx
            color: "black",
            lineHeight: "1.5", // Match First.jsx and Second.jsx
            marginTop: "30px", // Match First.jsx and Second.jsx
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

export default Third;