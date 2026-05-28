import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authHooks';
import toast from 'react-hot-toast';

// Pre-configured office location
const OFFICE_LOCATION = {
  latitude: 23.251955021598498,
  longitude: 77.46472966689575,
};
const OFFICE_RADIUS = 60;
const OFFICE_NAME = 'HL Tech';

// Function to calculate distance using Haversine formula (in meters)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Function to determine location area
const getLocationArea = (location) => {
  if (!location || !location.latitude || !location.longitude) {
    return 'N/A';
  }

  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    OFFICE_LOCATION.latitude,
    OFFICE_LOCATION.longitude
  );

  return distance <= OFFICE_RADIUS ? OFFICE_NAME : 'Outside Office';
};

function CheckOutModal({ isOpen, onClose, location, onConfirm }) {
  const { user } = useAuth();
  console.log('CheckOutModal rendered, isOpen:', isOpen, 'location:', location, 'user:', user);

  const [areaName, setAreaName] = useState('Fetching location...');

  // Fetch area name using reverse geocoding when location changes, unless it's HL Tech
  useEffect(() => {
    const fetchAreaName = async () => {
      if (!location || !location.latitude || !location.longitude) {
        setAreaName('Location not available');
        return;
      }

      // Check if the location is within the office radius
      const initialArea = getLocationArea(location);
      if (initialArea === OFFICE_NAME) {
        setAreaName(OFFICE_NAME);
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        if (data && data.address) {
          const address = data.address;
          const locality = address.neighbourhood || address.suburb || address.locality || address.residential || '';
          const city = address.city || address.town || address.village || 'Unknown City';
          
          const formattedArea = locality ? `${locality}, ${city}` : city;
          setAreaName(formattedArea);
        } else {
          setAreaName('Unknown Area');
        }
      } catch (error) {
        console.error('Error fetching area name:', error);
        setAreaName('Error fetching location');
      }
    };

    if (isOpen) {
      fetchAreaName();
    }
  }, [isOpen, location]);

  if (!isOpen) {
    console.log('Modal not rendered because isOpen is false');
    return null;
  }

  const handleConfirm = async () => {
    if (!user || !user.userId || !user.tokenKey) {
      console.error('Missing user, userId, or tokenKey in handleConfirm:', user);
      toast.error('User not authenticated. Redirecting to login.');
      window.location.href = '/login';
      return;
    }

    if (!location) {
      toast.error('Location not available. Please enable location services.');
      return;
    }

    try {
      const token = localStorage.getItem(user.tokenKey);
      if (!token) {
        console.error('No token found for tokenKey:', user.tokenKey);
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch('http://localhost:5000/api/attendance/check-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          bypassGeolocation: false,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        onConfirm();
        onClose();
      } else {
        toast.error(result.message || 'Failed to check out');
      }
    } catch (err) {
      console.error('Error in check-out request:', err);
      toast.error('Failed to check out: ' + err.message);
      if (err.message.includes('No authentication token found') || err.message.includes('401')) {
        window.location.href = '/login';
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Check Out</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Your current location: {areaName}
          </p>
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
          >
            Confirm Check Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckOutModal;