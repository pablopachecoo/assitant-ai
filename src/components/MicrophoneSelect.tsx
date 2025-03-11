import React, { useState, useEffect } from 'react';

interface MicrophoneDevice {
  id: string;
  label: string;
}

interface MicrophoneSelectProps {
  onChange?: (deviceId: string) => void;
}

const MicrophoneSelect: React.FC<MicrophoneSelectProps> = ({ onChange }) => {
  const [microphones, setMicrophones] = useState<MicrophoneDevice[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>('');

  useEffect(() => {
    const getAvailableMicrophones = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        setMicrophones(audioDevices.map(device => ({
          id: device.deviceId,
          label: device.label || `Microphone ${audioDevices.indexOf(device) + 1}`
        })));
        
        if (audioDevices.length > 0) {
          setSelectedMic(audioDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing microphone devices:', error);
      }
    };

    // We need permission to access device labels
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        // Stop the microphone immediately after getting access
        stream.getTracks().forEach(track => track.stop());
        // Now we can enumerate devices with labels
        getAvailableMicrophones();
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;
    setSelectedMic(deviceId);
    if (onChange) onChange(deviceId);
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium">Microphone Input</label>
      <select
        className="w-full p-2 border rounded"
        value={selectedMic}
        onChange={handleChange}
      >
        {microphones.map(mic => (
          <option key={mic.id} value={mic.id}>
            {mic.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MicrophoneSelect;