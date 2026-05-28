import React from "react";

const Ninth = ({ watermarkImage, styles, signatureImage }) => {
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
            royalty-free, worldwide, assignable, sublicensable (through multiple
            layers) license under all intellectual property and other rights
            (including patents, copyrights, trademarks and trade secrets) in any
            such Prior Works for all purposes in connection with Company’s
            current and future business. If you own any Prior Works that are
            relevant or related to your work or employment duties at the
            Company, you have disclosed a description of such items on Exhibit
          </p>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">11.5</b> You agree that you will not violate
            or attempt to violate the intellectual property rights, interests or
            title of any third party. You will not, while employed by the
            Company, use or disclose any proprietary information, intellectual
            property, Confidential Information or trade secrets of any former
            employers or other third parties and you will not store on any
            Company device or bring onto the premises of the Company any
            documents (regardless of the media on which those documents are
            contained) or any property belonging to your former employers or
            other third parties unless consented to in writing by the relevant
            employer and/or third party. You shall indemnify, hold harmless and
            (at Company’s request) defend the Company and its partners,
            officers, directors, employees and other representatives from any
            breach (or claim that if true would be a breach) of the foregoing
            covenant. Your obligations under this Section shall remain in effect
            and survive any termination or expiration of your employment or
            these Terms of Employment. Company shall be entitled to immediate
            injunctive relief or claim damages (liquidated or unliquidated) or
            similar relief and/or take disciplinary action (including but not
            limiting to termination) upon potential or actual breach of this
            Section by you. Company's right under this clause is notwithstanding
            any other right available to the Company under these Terms of
            Employment or otherwise.
          </p>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">11.6 </b> You shall comply with all relevant
            policies and guidelines of the Company regarding the protection of
            Confidential Information and intellectual property, including,
            without limitation, the Company’s Confidentiality Policy and
            Intellectual Property Policy. You acknowledge that the Company may
            amend any such policies and guidelines from time to time, and that
            you remain at all times bound by their most current version. If
            there is any conflict between the terms of any such policies and
            guidelines and the terms of this Terms of Employment, the latter
            will prevail.
          </p>
          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            12. Non-Disclosure
          </h3>
          <p style={{ marginBottom: "10px" }}>
            The Employee expressly agrees that he/she shall not use Confidential
            Information provided by the Company in the development or delivery
            or for personal gain from
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

export default Ninth;
