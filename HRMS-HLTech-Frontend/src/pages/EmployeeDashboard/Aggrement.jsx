import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "../../../utils/axiosInstance";

// Import page components
import First from "./aggrementPages/First";
import Second from "./aggrementPages/Second";
import Third from "./aggrementPages/Third";
import Fourth from "./aggrementPages/Fourth";
import Fifth from "./aggrementPages/Fifth";
import Sixth from "./aggrementPages/Sixth";
import Seventh from "./aggrementPages/Seventh";
import Eighth from "./aggrementPages/Eighth";
import Ninth from "./aggrementPages/Ninth";
import Tenth from "./aggrementPages/Tenth";
import Eleventh from "./aggrementPages/Eleventh";
import Twelfth from "./aggrementPages/Twelfth";
import Thirteenth from "./aggrementPages/Thirteenth";
import Fourteenth from "./aggrementPages/Fourteenth";

// Watermark image path
const watermarkImage = "/HLTechLogoWaterMark.png";

const Agreement = () => {
  const pdfContentRef = useRef(null);
  const pageRefs = useRef([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [signatureImage, setSignatureImage] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeAddress, setEmployeeAddress] = useState("");
  const [designation, setDesignation] = useState("");

  const logoImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";

  // Fetch employee signature, name, address, and position from backend on component mount
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get("/api/kyc/current", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const employeeData = response.data;
        console.log("Employee data fetched from /api/kyc/current:", employeeData); // Debug log
        if (employeeData) {
          // Set employee name
          if (employeeData.fullName) {
            setEmployeeName(employeeData.fullName);
          } else {
            setError("Employee name not found in KYC data.");
          }
          // Set employee address (format the address object into a string)
          if (employeeData.address) {
            const { country, city, postalCode } = employeeData.address;
            const formattedAddress = `${country || "Unknown Country"}, ${city || "Unknown City"}, ${postalCode || "Unknown Postal Code"}`;
            setEmployeeAddress(formattedAddress);
          } else {
            setError("Employee address not found in KYC data.");
          }
          // Set employee designation (use position from schema)
          if (employeeData.position) {
            setDesignation(employeeData.position);
          } else if (employeeData.jobTitle) {
            setDesignation(employeeData.jobTitle); // Fallback to jobTitle if position is missing
            console.log("Using jobTitle as designation:", employeeData.jobTitle);
          } else {
            setDesignation("Employee"); // Fallback if both position and jobTitle are missing
            setError("Employee position and jobTitle not found in KYC data. Using default: 'Employee'.");
          }
          // Set employee signature
          if (employeeData.employeeSignature) {
            setSignatureImage(employeeData.employeeSignature);
          } else {
            setError("Employee signature not found. Please upload your signature in the KYC section.");
          }
        } else {
          setError("Failed to fetch employee data.");
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setError("Failed to fetch employee data. Please try again.");
      }
    };

    fetchEmployeeData();
  }, []);

  const downloadPDF = async () => {
    setIsDownloading(true);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const pixelToMm = 0.264583;

    const pages = pageRefs.current.filter((ref) => ref);

    const cleanStyles = (element) => {
      const elements = element.getElementsByTagName("*");
      for (let el of elements) {
        const computedStyle = window.getComputedStyle(el);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;
        const borderColor = computedStyle.borderColor;

        if (color.includes("oklch")) {
          el.style.color = "#000000";
        }
        if (backgroundColor.includes("oklch")) {
          el.style.backgroundColor = "#FFFFFF";
        }
        if (borderColor.includes("oklch")) {
          el.style.borderColor = "transparent";
        }
      }
    };

    const capturePage = async (pageElement, isLastPage) => {
      try {
        cleanStyles(pageElement);

        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          windowWidth: pageElement.offsetWidth,
          logging: false,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.5);
        const imgWidthPx = canvas.width;
        const imgHeightPx = canvas.height;
        const imgWidth = imgWidthPx * pixelToMm;
        const imgHeight = imgHeightPx * pixelToMm;

        let scale = pdfWidth / imgWidth;
        let scaledWidth = pdfWidth;
        let scaledHeight = imgHeight * scale;

        if (scaledHeight > pdfHeight) {
          scale = pdfHeight / imgHeight;
          scaledWidth = imgWidth * scale;
          scaledHeight = pdfHeight;
        }

        const xOffset = (pdfWidth - scaledWidth) / 2;
        pdf.addImage(imgData, "JPEG", xOffset, 0, scaledWidth, scaledHeight);

        if (!isLastPage) {
          pdf.addPage();
        }
      } catch (error) {
        console.error("Error capturing page:", error);
        throw new Error("Failed to capture page for PDF");
      }
    };

    try {
      for (let i = 0; i < pages.length; i++) {
        console.log(`Processing page ${i + 1}`);
        await capturePage(pages[i], i === pages.length - 1);
      }

      pdf.save("employment-agreement.pdf");
      const pdfBlob = pdf.output("blob");
      console.log("PDF Blob generated:", pdfBlob.size, "bytes");
      return pdfBlob;
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  const SubmitAgreement = async () => {
    try {
      setIsDownloading(true);
      setError("");
      console.log("Starting agreement submission");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Generating PDF");
      const pdfBlob = await downloadPDF();
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error("Failed to generate valid PDF");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("agreement", pdfBlob, "employment-agreement.pdf");
      console.log("FormData prepared, sending to /api/kyc/agreement/upload");

      const response = await axios.post(
        "/api/kyc/agreement/upload",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Agreement uploaded successfully:", response.data);
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error uploading agreement:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        setError(
          `Failed to upload agreement: ${
            error.response.data.message || "Server error"
          }`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("Failed to upload agreement: No response from server");
      } else {
        console.error("Error setting up request:", error.message);
        setError(`Failed to upload agreement: ${error.message}`);
      }
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  const styles = {
    c1: { margin: "0", padding: "0" },
    c2: { marginBottom: "10px" },
    c0: { fontWeight: "bold" },
    c5: { fontSize: "14px", lineHeight: "1.5" },
    c8: { color: "#000" },
    c11: { fontStyle: "italic" },
    c14: { marginLeft: "20px" },
    c15: { fontSize: "13px" },
    c17: { color: "#333" },
    c20: { marginBottom: "5px" },
    c25: { fontWeight: "bold" },
    c26: { marginTop: "10px" },
    c28: { fontWeight: "bold", textDecoration: "underline" },
    c30: { fontStyle: "italic" },
    c31: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "20px",
    },
    c32: { width: "20px" },
    c35: { textTransform: "uppercase" },
    c37: { fontWeight: "bold" },
    c41: { textAlign: "center", marginTop: "20px" },
    image1: { width: "118px", height: "auto", marginRight: "10px" },
    image2: { width: "106.53px", height: "4px" },
    hr: { display: "none" },
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: "80px" }}>
      <style>
        {`
          [style*="oklch"],
          *[style*="oklch"],
          [class*="oklch"],
          *[class*="oklch"] {
            color: #000 !important;
            background-color: #fff !important;
            border-color: transparent !important;
          }
          .prose {
            max-width: 794px !important;
          }
          .prose > div {
            min-height: 1123px;
            box-sizing: border-box;
            padding: 10px;
            display: flex;
            flex-direction: column;
            justify-content: "space-between";
          }
        `}
      </style>


      <div
        ref={pdfContentRef}
        style={{ padding: 20, color: "#000" }}
        className="p-6 max-w-5xl mx-auto min-h-screen my-20 rounded-2xl"
      >
        {error && (
          <div
            className="mb-4 p-4 rounded-lg"
            style={{ backgroundColor: "rgb(254, 242, 242)", color: "rgb(185, 28, 28)" }}
          >
            {error}
          </div>
        )}

        <div className="prose prose-sm">
          <div ref={(el) => (pageRefs.current[0] = el)}>
            <First
              logoImage={logoImage}
              styles={styles}
              signatureImage={signatureImage}
              watermarkImage={watermarkImage}
              employeeName={employeeName}
              employeeAddress={employeeAddress}
              designation={designation}
            />
          </div>
          <div ref={(el) => (pageRefs.current[1] = el)}>
            <Second styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[2] = el)}>
            <Third styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[3] = el)}>
            <Fourth styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[4] = el)}>
            <Fifth styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[5] = el)}>
            <Sixth styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[6] = el)}>
            <Seventh styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[7] = el)}>
            <Eighth styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[8] = el)}>
            <Ninth styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[9] = el)}>
            <Tenth styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[10] = el)}>
            <Eleventh styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[11] = el)}>
            <Twelfth styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[12] = el)}>
            <Thirteenth styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
          <div ref={(el) => (pageRefs.current[13] = el)}>
            <Fourteenth styles={styles} signatureImage={signatureImage} watermarkImage={watermarkImage} />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
          padding: "16px",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          maxWidth: "300px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={downloadPDF}
          disabled={isDownloading}
          style={{
            padding: "10px 20px",
            borderRadius: "9999px",
            fontWeight: "500",
            color: "white",
            backgroundColor: isDownloading ? "#a0a0a0" : "#745be7",
            cursor: isDownloading ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
            border: "none",
            outline: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isDownloading ? (
            <>
              <svg
                style={{
                  animation: "spin 1s linear infinite",
                  height: "20px",
                  width: "20px",
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
              Downloading...
            </>
          ) : (
            <>
              <svg
                style={{ height: "20px", width: "20px" }}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              Download
            </>
          )}
        </button>

        <button
          onClick={SubmitAgreement}
          disabled={isDownloading || !signatureImage}
          style={{
            padding: "10px 20px",
            borderRadius: "9999px",
            fontWeight: "500",
            color: "white",
            backgroundColor: isDownloading || !signatureImage ? "#a0a0a0" : "#745be7",
            cursor: isDownloading || !signatureImage ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
            border: "none",
            outline: "none",
          }}
        >
          Submit
        </button>
      </div>

      {error && (
        <div
          style={{
            position: "fixed",
            bottom: "60px",
            left: 0,
            right: 0,
            textAlign: "center",
            padding: "8px",
            backgroundColor: "rgb(254, 242, 242)",
            color: "rgb(185, 28, 28)",
            zIndex: 1001,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default Agreement;