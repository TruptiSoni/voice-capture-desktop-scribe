
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface ScreenPreviewProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

const ScreenPreview: React.FC<ScreenPreviewProps> = ({ stream, isRecording }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Card className="relative overflow-hidden rounded-lg border border-border bg-card shadow-md">
      <div className="aspect-video w-full bg-muted relative">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-muted-foreground">
              {isRecording 
                ? "Recording in progress..."
                : "Click 'Record Screen' to start capturing"}
            </p>
          </div>
        )}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
            <div className="h-3 w-3 rounded-full bg-destructive recording-pulse"></div>
            <span className="text-xs font-medium">Recording</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScreenPreview;
