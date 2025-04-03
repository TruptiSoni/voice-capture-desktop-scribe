
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordingButtonProps {
  isRecording: boolean;
  onClick: () => void;
  type: 'screen' | 'audio';
  disabled?: boolean;
  className?: string;
}

const RecordingButton: React.FC<RecordingButtonProps> = ({
  isRecording,
  onClick,
  type,
  disabled = false,
  className,
}) => {
  return (
    <Button
      variant={isRecording ? "destructive" : "secondary"}
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className={cn("flex items-center gap-2 h-12 px-4", 
        isRecording && "recording-pulse",
        className
      )}
    >
      {type === 'screen' ? (
        <>
          {isRecording ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          <span>{isRecording ? 'Stop Screen' : 'Record Screen'}</span>
        </>
      ) : (
        <>
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          <span>{isRecording ? 'Mute Mic' : 'Enable Mic'}</span>
        </>
      )}
    </Button>
  );
};

export default RecordingButton;
