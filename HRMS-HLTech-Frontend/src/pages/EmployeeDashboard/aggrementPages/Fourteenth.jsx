import React from "react";

const Fourteenth = ({
  watermarkImage,
  styles,
  signatureImage,
  handleFileChange,
  isLoading,
  error,
  saveSignature,
  selectedSignature,
}) => {
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
          <div style={{ marginTop: "48px" }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: "18pt",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: "10px",
              }}
            >
              ANNEXURE A ("Compensation")
            </h2>
            <p style={{ marginBottom: "15px", marginTop:"30px" }}>
              <span style={{ fontWeight: 700 }}>Name:</span> "NAME OF EMPLOYEE"
            </p>
            <p style={{ marginBottom: "15px" }}>
              <span style={{ fontWeight: 700 }}>Designation:</span> "DESIGNATION"
            </p>
            <p style={{ marginBottom: "15px" }}>
              <span style={{ fontWeight: 700 }}>Date of Joining:</span> (date of joining)
            </p>
            <p style={{ marginBottom: "15px" }}>
              This is your expected monthly salary structure
            </p>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "16px",
                marginTop: "30px",
                border: "1px solid #d1d5db", // Gray border
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6" }}>
                  <th
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "8px",
                      textAlign: "left",
                      fontWeight: 700,
                    }}
                  >
                    Salary Component
                  </th>
                  <th
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "8px",
                      textAlign: "left",
                      fontWeight: 700,
                    }}
                  >
                    Amount (Rs.)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #d1d5db", padding: "8px" }}>
                    Basic Salary
                  </td>
                  <td style={{ border: "1px solid #d1d5db", padding: "8px" }}></td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #d1d5db", padding: "8px" }}>
                    House Rent Allowance (HRA)
                  </td>
                  <td style={{ border: "1px solid #d1d5db", padding: "8px" }}></td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #d1d5db", padding: "8px" }}>
                    Special Allowance
                  </td>
                  <td style={{ border: "1px solid #d1d5db", padding: "8px" }}></td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #d1d5db", padding: "8px" }}>
                    Leave Travel Allowance (LTA)
                  </td>
                  <td style={{ border: "1px solid #d1d5db", padding: "8px" }}></td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "8px",
                      fontWeight: 700,
                    }}
                  >
                    Total
                  </td>
                  <td style={{ border: "1px solid #d1d5db", padding: "8px" }}></td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginBottom: "10px",marginTop:"40px", fontSize: "12pt" }}>
              <span style={{ fontWeight: 700 }}>Note:</span> You will receive your salary and all
              other benefits forming part of your remuneration package, subject to deductions for TDS,
              PF, ESI, and taxes in accordance with applicable law.
            </p>

            {/* Signature Upload UI
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                maxWidth: "500px",
                margin: "24px auto", // Centered with more margin
                backgroundColor: "#fff", // White background for contrast
              }}
            >
              <label
                style={{
                  flex: 1,
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  padding: "8px",
                  backgroundColor: "#f9fafb",
                  cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    display: "block",
                    width: "100%",
                    fontSize: "14px",
                    color: "#666",
                    border: "none",
                    outline: "none",
                  }}
                />
              </label>
              <button
                onClick={saveSignature}
                disabled={isLoading || !selectedSignature}
                style={{
                  padding: "10px 20px",
                  borderRadius: "9999px",
                  fontWeight: "500",
                  color: "white",
                  backgroundColor: isLoading || !selectedSignature ? "#a0a0a0" : "#745be7",
                  cursor: isLoading || !selectedSignature ? "not-allowed" : "pointer",
                  transition: "background-color 0.2s",
                  border: "none",
                  outline: "none",
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      style={{
                        animation: "spin 1s linear infinite",
                        height: "20px",
                        width: "20px",
                        marginRight: "8px",
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        style={{ opacity: 0.25 }}
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        style={{ opacity: 0.75 }}
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Signature"
                )}
              </button>
            </div>
            {error && (
              <p
                style={{
                  color: "red",
                  textAlign: "center",
                  marginTop: "8px",
                  marginBottom: "10px",
                }}
              >
                {error}
              </p>
            )} */}
          </div>
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

export default Fourteenth;