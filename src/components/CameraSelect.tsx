import React, { useState, useEffect } from 'react';

interface CameraDevice {
  id: string;
  label: string;
}

interface CameraSelectProps {
  onChange?: (deviceId: string) => void;
}

const CameraSelect: React.FC<CameraSelectProps> = ({ onChange }) => {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  useEffect(() => {
    const getAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        setCameras(videoDevices.map(device => ({
          id: device.deviceId,
          label: device.label || `Camera ${videoDevices.indexOf(device) + 1}`
        })));
        
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing camera devices:', error);
      }
    };

    // We need permission to access device labels
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        // Stop the camera immediately after getting access
        stream.getTracks().forEach(track => track.stop());
        // Now we can enumerate devices with labels
        getAvailableCameras();
      })
      .catch(error => {
        console.error('Error accessing camera:', error);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;
    setSelectedCamera(deviceId);
    if (onChange) onChange(deviceId);
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium">Camera Input</label>
      <select
        className="w-full p-2 border rounded"
        value={selectedCamera}
        onChange={handleChange}
      >
        {cameras.map(camera => (
          <option key={camera.id} value={camera.id}>
            {camera.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CameraSelect;