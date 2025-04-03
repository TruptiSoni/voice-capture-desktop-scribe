
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Save, Pause, Play } from 'lucide-react';
import RecordingButton from './RecordingButton';

interface RecordingControlsProps {
  startScreenRecording: () => void;
  stopScreenRecording: () => void;
  toggleAudio: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  saveRecording: () => void;
  isRecording: boolean;
  isPaused: boolean;
  isAudioEnabled: boolean;
  hasRecording: boolean;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  startScreenRecording,
  stopScreenRecording,
  toggleAudio,
  pauseRecording,
  resumeRecording,
  saveRecording,
  isRecording,
  isPaused,
  isAudioEnabled,
  hasRecording,
}) => {
  return (
    <Card className="border border-border">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
            <RecordingButton 
              type="screen"
              isRecording={isRecording}
              onClick={isRecording ? stopScreenRecording : startScreenRecording}
            />
            
            <RecordingButton 
              type="audio"
              isRecording={isAudioEnabled}
              onClick={toggleAudio}
              disabled={!isRecording && !hasRecording}
            />
          </div>
          
          <Separator className="my-2" />
          
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
            {isRecording && (
              <Button
                variant="outline"
                size="icon"
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="h-12 w-12"
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </Button>
            )}
            
            {hasRecording && (
              <Button
                variant="secondary"
                size="lg"
                onClick={saveRecording}
                className="flex items-center gap-2 h-12 px-4"
              >
                <Save className="h-5 w-5" />
                <span>Save Recording</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingControls;
