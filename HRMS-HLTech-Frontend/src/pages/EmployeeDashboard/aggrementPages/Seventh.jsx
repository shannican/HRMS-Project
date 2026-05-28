import React from "react";

const Seventh = ({ watermarkImage, styles, signatureImage }) => {
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
            software, developments, inventions, processes, formulas, technology,
            drawings, engineering plans, distribution and sales methods, sales
            and profit figures, finances, titles and descriptions of any patents
            or patent applications filed or which could be applied for in any
            country or jurisdiction, methodologies, training materials,
            personnel information and internal publications. Confidential
            Information shall not include information which is publicly
            available.
          </p>

          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            11. Intellectual property rights
          </h3>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">11.1</b> You agree that any rights, title and interest whatsoever,
            including, but not limited to, patents, copyright, trade secret and
            design rights, mask rights, whether registrable or not, arising or
            Created (defined below) as a result of the development of and/or the
            application of any tangible or intangible work product or materials
            and/or have been Created with the use of any equipment, supplies,
            facilities or other resources, trade secrets or other proprietary or
            Confidential Information of the Company produced by you during or as
            a consequence of your employment, whether alone or in conjunction
            with others and whether during normal working hours or not,
            including, but not limited to, software, databases, systems,
            applications, presentations, training materials, reports, results of
            research or development, textual works, content, artwork, graphics
            or audiovisual materials, any invention, design, discovery,
            improvement, computer program, documentation, or other material (
            <span style={{ fontWeight: 700 }}>"Work Product"</span>) which you
            conceive, discover, reduce to practice, design, develop, contribute
            to, improve, invent or create (
            <span style={{ fontWeight: 700 }}>"Create"</span>) during or in
            consequence of employment hereunder shall belong and shall be owned
            exclusively by the Company. You hereby convey ownership in such
            rights, title and interest to Company and its affiliates upon
            inception or development.
          </p>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">11.2</b> All Work Product shall constitute a work(s) made for hire under
            all copyright acts and you shall promptly and fully disclose all
            Work Products Created by you that are relevant to or implicated by
            your work at the Company together with any information reasonably
            requested by the Company to determine whether the Work Product is
            the Company Works. To the extent that any Work Product does not
            constitute a work made for hire under the foregoing laws, you hereby
            irrevocably assign, transfer and convey all worldwide right, title,
            and interest (including without limitation, patents, copyright,
            trade secret, trademarks, design rights, contract and licensing
            rights and other intellectual property rights and all rights, if
            any, under other laws) in such Work Product to Company and its
            affiliates. You shall have the burden of proving that any Work
            Product Created by you that are relevant to or implicated by your
            work at the Company are not the Company
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

export default Seventh;
