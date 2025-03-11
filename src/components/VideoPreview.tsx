import React from 'react';

const VideoPreview: React.FC = () => {
  return (
    <div className="h-48 w-full rounded-lg overflow-hidden bg-gray-200 relative">
      <video
        id="video"
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas
        id="canvas"
        className="hidden"
      />
    </div>
  );
};

export default VideoPreview;