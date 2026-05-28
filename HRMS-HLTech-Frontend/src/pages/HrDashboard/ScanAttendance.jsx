import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

function ScanAttendance() {
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleScan = async (data) => {
    if (data) {
      setScanResult(data);
      setMessage('');
      setError('');

      try {
        const response = await fetch('http://localhost:5000/api/attendance/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ barcodeId: data }),
        });
        const result = await response.json();
        if (response.ok) {
          setMessage(result.message);
        } else {
          setError(result.message || 'Failed to mark attendance');
        }
      } catch (err) {
        setError('Failed to mark attendance: ' + err.message);
      }
    }
  };

  const handleError = (err) => {
    setError('Error scanning barcode: ' + err.message);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Scan Attendance</h2>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: '100%' }}
        />
        {scanResult && (
          <p className="mt-4 text-center text-gray-600">Scanned Barcode: {scanResult}</p>
        )}
        {message && (
          <p className="mt-4 text-center text-green-600">{message}</p>
        )}
        {error && (
          <p className="mt-4 text-center text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

export default ScanAttendance;