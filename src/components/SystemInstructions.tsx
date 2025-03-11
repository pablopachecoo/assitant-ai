import React from 'react';

interface SystemInstructionsProps {
  value: string;
  onChange: (value: string) => void;
}

const SystemInstructions: React.FC<SystemInstructionsProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium">System Instructions</label>
      <textarea
        className="w-full p-2 border rounded"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter system instructions here..."
      />
    </div>
  );
};

export default SystemInstructions;