import React from "react";

const Tenth = ({ watermarkImage, styles, signatureImage }) => {
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
            providing any products or services for his/her own account or for the account of any
            third party. The Employee shall protect the Confidential Information by using the same
            degree of care, but no less than reasonable care, to prevent the unauthorized use,
            dissemination or publication of the Confidential Information as the Employee uses to
            protect its own Confidential Information. The Employee shall limit its internal
            disclosure of the Confidential Information to only those employees and agents who have a
            need to know the information for the limited purpose of executing his/her job
            responsibility.
          </p>
          <h3
            style={{
              fontWeight: 700,
              fontSize: "11pt",
              marginTop: "12px",
              marginBottom: "10px",
            }}
          >
            13. Non-Competition and Non-Solicitation
          </h3>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">13.1 </b> <span style={{ fontWeight: 700 }}>Non-competition:</span> The Employee acknowledges that he is, in the course of
            his employment with the Organization, likely from time to time to obtain knowledge of
            trade secrets, Intellectual Properties and other confidential information of the
            Organization and its affiliates and to have dealings with the customers and suppliers of
            the Organization. The Employee acknowledges the importance and commercial significance of
            the covenants under this clause and admits and acknowledges that he has various other
            technologies and information which if deployed by him elsewhere or for a third party
            during the course of his employment or after he ceases to be an employee or ceases to be
            associated with the Organization, would result in him competing against the Organization.
            The Employee undertakes the following to the Organization: (a) that he shall not, for the
            duration of employment with the Organization, and for a period of two (2) years after the
            date on which he ceases to be employed by the Organization, either personally or through
            an agent, Organization or through a partnership or as a shareholder, joint venture
            partner, collaborator consultant, advisor, principal contractor or sub-contractor,
            director, trustee, committee member, office bearer or agent or in any other manner
            whatsoever, whether for profit or otherwise: be concerned in any business directly or
            indirectly manufacturing, operating, selling or distributing products or services which
            compete with any business then carried on by the Organization; and (ii) except on behalf
            of the Organization, canvass or solicit business or custom for products of a similar type
            to those being manufactured or dealt in or for services similar to those being provided
            by the Organization from any Person who is a customer of the Organization;
          </p>
          <p style={{ marginBottom: "10px" }}>
            <b className="text-xs">13.2</b> <span style={{ fontWeight: 700 }}>Non-solicitation:</span> For two (2) years following termination of Employee’s
            employment (i) the Employee shall not solicit, encourage, or induce or attempt to
            solicit, encourage, or induce any (A) employee, marketing agent, or consultant of the
            Organization to terminate his employment, agency, or consultancy with the Organization
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

export default Tenth;