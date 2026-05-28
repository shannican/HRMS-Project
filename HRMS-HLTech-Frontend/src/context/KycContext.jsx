import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../context/authHooks";

const KycContext = createContext();

export const KycProvider = ({ children }) => {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState("Pending");

  useEffect(() => {
    const checkKycStatus = async () => {
      if (!user || !user.userId || !user.tokenKey) {
        console.log('Skipping checkKycStatus: No user, userId, or tokenKey', {
          user: !!user,
          userId: user?.userId,
          tokenKey: !!user?.tokenKey,
        });
        return;
      }

      try {
        const token = localStorage.getItem(user.tokenKey);
        if (!token) {
          console.error('No token found for tokenKey:', user.tokenKey);
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/kyc/status/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKycStatus(response.data.status || "Pending");
        console.log('KYC status set:', response.data.status);
      } catch (error) {
        console.error("Error fetching KYC status in KycContext:", error, error.stack);
      }
    };

    checkKycStatus();
  }, [user]);

  return (
    <KycContext.Provider value={{ kycStatus, setKycStatus }}>
      {children}
    </KycContext.Provider>
  );
};

export const useKyc = () => useContext(KycContext);