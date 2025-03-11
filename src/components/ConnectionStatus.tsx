import React, { JSX } from 'react';
import { CloudOff, HourglassIcon, Cloud, AudioWaveform } from 'lucide-react';

type ConnectionStatusType = 'disconnected' | 'connecting' | 'connected' | 'speaking';

interface StatusConfig {
  icon: JSX.Element;
  text: string;
  bgColor: string;
  textColor: string;
  animation: string;
}

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const getStatusConfig = (): StatusConfig => {
    switch (status) {
      case 'disconnected':
        return {
          icon: <CloudOff className="text-disconnectedText" />,
          text: 'disconnected',
          bgColor: 'bg-disconnected',
          textColor: 'text-disconnectedText',
          animation: ''
        };
      case 'connecting':
        return {
          icon: <HourglassIcon className="text-connectingText" />,
          text: 'connecting...',
          bgColor: 'bg-connecting',
          textColor: 'text-connectingText',
          animation: 'animate-throb'
        };
      case 'connected':
        return {
          icon: <Cloud className="text-connectedText" />,
          text: 'connected',
          bgColor: 'bg-connected',
          textColor: 'text-connectedText',
          animation: ''
        };
      case 'speaking':
        return {
          icon: <AudioWaveform className="text-speakingText" />,
          text: 'model speaking',
          bgColor: 'bg-speaking',
          textColor: 'text-speakingText',
          animation: 'animate-throb'
        };
      default:
        return {
          icon: <CloudOff className="text-disconnectedText" />,
          text: 'unknown status',
          bgColor: 'bg-gray-200',
          textColor: 'text-gray-700',
          animation: ''
        };
    }
  };

  const { icon, text, bgColor, textColor, animation } = getStatusConfig();

  return (
    <div className={`state ${bgColor} ${textColor} ${animation} mx-auto max-w-xs flex flex-col items-center`}>
      {icon}
      <span className="ml-2">{text}</span>
    </div>
  );
};

export default ConnectionStatus;