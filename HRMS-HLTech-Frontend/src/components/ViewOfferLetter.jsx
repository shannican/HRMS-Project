import React, { useEffect, useState } from 'react';
import watermarkImage from '/HLTechLogoWaterMark.png';
import hltechLogo from '/hltechlogo.png';
import axios from 'axios';

const ViewOfferLetter = ({ state }) => {
  const [data,setData] = useState(null);

  const { jobId, candidateId, candidateDetails, formData, offerLetter } = state || {};


  useEffect(()=>{
    const fetchData = async()=>{
    const {data} = await axios.get(`http://localhost:5000/api/job/${jobId}`);
    console.log(data.data[0])
    setData(data.data[0])

    }
    fetchData()
  },[])

  // Fallback values if data is not available
  const candidateName = candidateDetails?.candidateName || '[Name]';
  const mobileNumber = candidateDetails?.phoneNumber || '[Number]';
  const address = candidateDetails?.currentLocation || '[Address]';

  // Ensure formData fields are extracted safely
  const employeeDesignation = data?.offerFormData?.Employee_Designation || '[Employee_Designation]';
  const joiningDate = data?.offerFormData?.Employee_Joining_Date || '[Employee_Joining_Date]';
  const probationPeriod = data?.offerFormData?.Probation_Period || 'three months';
  const annualCTC = data?.offerFormData?.Annual_CTC || '[Annual_CTC]';

  // Current date (May 24, 2025)
  const currentDate = '24-05-2025';


  // If critical data is missing, show an error message
  if (!candidateDetails || !candidateId || !jobId) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>Error: Offer letter data is incomplete.</p>
        <p>Please ensure an offer letter has been generated for this job application.</p>
        <p>Debug Info: Missing fields - {JSON.stringify({ candidateDetails, formData, candidateId, jobId })}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 font-serif text-sm leading-relaxed relative min-h-[842px] h-full">
      {/* Watermark Image */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0"
        style={{
          opacity: 0.1,
        }}
      >
        <img
          src={watermarkImage}
          alt="HL Tech Watermark"
          className="w-[500px] h-auto"
        />
      </div>

      {/* Content wrapper with higher z-index to appear above the watermark */}
      <div className="relative z-10">
        {/* Header with Logo */}
        <div className="flex justify-end mb-3">
          <img
            src={hltechLogo}
            alt="HL Tech Logo"
            className="w-[230px] h-auto"
          />
        </div>
        <hr className="mb-4 bg-gray-500 border-gray-500 h-[3px]" />

        {/* Reference Number */}
        <div className="mb-6">
          <span className="font-semibold">Ref. No: -HLTI/JOIN/050325/033</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-lg font-bold tracking-wider">OFFER OF EMPLOYMENT</h1>
        </div>

        {/* Date */}
        <div className="text-right mb-8">
          <span>Date: {currentDate}</span>
        </div>

        {/* Recipient Details */}
        <div className="mb-6 space-y-1">
          <div><span className="font-semibold">Ms./Mr.</span> {candidateName}</div>
          <div><span className="font-semibold">Mobile:</span> {mobileNumber}</div>
          <div><span className="font-semibold">Address:</span> {address}</div>
        </div>

        {/* Salutation */}
        <div className="mb-6">
          <span className="font-semibold">Dear {candidateName},</span>
        </div>

        {/* Main Content */}
        <div className="space-y-4 mb-6">
          <p>
            Based on your performance in the Technical and HR interview rounds, we are pleased to offer 
            you the position of <span className="font-semibold">{employeeDesignation}</span> at <span className="font-semibold">HL Tech India Private Limited, Bhopal </span> 
            effective from <span className="font-semibold">{joiningDate}</span>.
          </p>

          <p>
            You will be on a probation period of <span className="font-semibold">{probationPeriod}</span> from the date of joining. However, this period 
            may be extended or shortened based on your performance. Your roles and responsibilities were 
            discussed with you during the interview. Your <span className="font-semibold">CTC</span> has been set at <span className="font-semibold">Rs. {Number(annualCTC).toLocaleString("en-IN")} per 
            annum</span>.
          </p>

          <p>
            The allowances, benefits, and other terms and conditions of your employment will be detailed in 
            the <span className="font-semibold">Appointment Letter</span>, which will be provided to you on the date of joining, as per the 
            company policies applicable at that time.
          </p>

          <p>
            If you accept this offer, please confirm your acceptance by replying to this email. For any queries, 
            feel free to contact the undersigned.
          </p>

          <p>
            Once again, congratulations and welcome to the <span className="font-semibold">HL Tech India Pvt. Ltd.</span> family!
          </p>
        </div>

        {/* Closing */}
        <div className="mb-8">
          <span className="font-semibold">Best regards,</span>
        </div>

        {/* Signature Section */}
        <div className="mb-12">
          <div className="mb-2">
            <div className="w-32 h-8 bg-blue-100 rounded mb-2"></div>
          </div>
          <div className="space-y-1">
            <div className="font-semibold">Arunakshi Pratap Singh</div>
            <div className="font-semibold">HR Manager</div>
            <div className="font-semibold">HL Tech India Private Limited</div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 space-y-2 text-center text-xs mb-8">
          <div>
            <span className="font-semibold">Corporate Address:</span> 78, Indrapuri Sector-C, Bhopal (M.P.) 462022
          </div>
          <div className="flex justify-center space-x-8">
            <div>
              <span className="font-semibold">Email:</span> info@hltechindia.com
            </div>
            <div>
              <span className="font-semibold">Contact:</span> +91 94305 52744, +91 85389 11038
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOfferLetter;