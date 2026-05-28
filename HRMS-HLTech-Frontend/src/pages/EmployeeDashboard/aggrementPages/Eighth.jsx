import React from "react";

const Eighth = ({ watermarkImage, styles, signatureImage }) => {
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
            Works. You retain no rights to use the Work Product and agree not to
            challenge the validity of Company’s and its affiliates' ownership in
            the Work Product. You hereby forever waive all moral rights in the
            Work Product and any results or proceeds there from, even if after
            expiration or termination of your employment hereunder. If you have
            any rights to the Work Product that cannot be assigned to the
            Company or its affiliates, you hereby unconditionally and
            irrevocably waive the enforcement of such rights and all claims and
            causes of action of any kind against the Company and its affiliates
            and their employees, contractors or clients with respect to such
            rights and grant to the Company
          </p>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">11.3</b>You and its affiliates an exclusive,
            irrevocable, perpetual, worldwide, sub-licensable, fully paid-up and
            royalty free license to such Work Product, or part thereof. On
            termination or expiration of your employment or these Terms of
            Employment, you will immediately deliver to Company all Work
            Product, including any parts or copies thereof completed, Created
            and/or prepared up through the date of termination and all copies
            thereof. You agree to, for no further consideration, either during
            or after the termination of employment hereunder maintain records,
            execute any documents and take any other actions reasonably
            requested by Company and its affiliates and their clients and
            contractors to achieve the objectives of this Section (including
            waiver of any such rights including authors’ special rights under
            Section 57 of the Copyright Act 1957). You agree to maintain any
            records, execute any further documents and take any further actions
            requested by the Company to assist it in validating, effectuating,
            maintaining, protecting, enforcing, assigning, perfecting,
            recording, patenting or registering any the Company Works or related
            intellectual property rights. In the event that Company is unable
            for any reason, after reasonable effort, to secure your signature on
            any document needed to perfect the title of Company and its
            affiliates, you hereby irrevocably designate and appoint Company and
            its duly authorized officers and agents as your agent and attorney
            in fact to act for and on your behalf to execute, file and verify
            such documents and to do all other lawfully permitted acts including
            in relation to any government authorities or agencies, with the same
            legal force and effect as if executed by you.
          </p>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">11.4</b> “Prior Works” are Work Products that
            you have created prior to your employment with the Company. You
            agree that you will not incorporate any portion of any Prior Works
            into or use any Prior Works in any work you may undertake as part of
            your employment at the Company. If, notwithstanding the foregoing,
            you incorporate or use any Prior Works in any work as part of your
            employment at the Company, you hereby grant to the Company (and its
            designees) a perpetual, irrevocable, nonexclusive,
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

export default Eighth;
