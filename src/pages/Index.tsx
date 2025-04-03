
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ScreenPreview from '@/components/ScreenPreview';
import RecordingControls from '@/components/RecordingControls';
import useMediaRecorder from '@/hooks/useMediaRecorder';

const Index = () => {
  const {
    isRecording,
    isPaused,
    isAudioEnabled,
    hasRecording,
    screenStream,
    startScreenRecording,
    stopScreenRecording,
    pauseRecording,
    resumeRecording,
    toggleAudio,
    saveRecording,
    isElectronApp
  } = useMediaRecorder();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {isElectronApp ? "Desktop Screen Recorder" : "Screen Recorder"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Capture your screen with audio in just a few clicks
            {isElectronApp && " - Running as desktop app"}
          </p>
        </div>

        <Card className="border border-border">
          <CardHeader className="pb-0">
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              {isRecording
                ? "Your screen is being recorded"
                : "Preview of your screen will appear here once you start recording"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ScreenPreview stream={screenStream} isRecording={isRecording} />
          </CardContent>
        </Card>

        <RecordingControls
          startScreenRecording={startScreenRecording}
          stopScreenRecording={stopScreenRecording}
          toggleAudio={toggleAudio}
          pauseRecording={pauseRecording}
          resumeRecording={resumeRecording}
          saveRecording={saveRecording}
          isRecording={isRecording}
          isPaused={isPaused}
          isAudioEnabled={isAudioEnabled}
          hasRecording={hasRecording}
        />

        <Card className="border border-border bg-accent text-accent-foreground">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">How to use:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Click <strong>Record Screen</strong> to begin capturing</li>
              <li>Choose which screen or application window to record</li>
              <li>Toggle <strong>Enable Mic</strong> to record with audio</li>
              <li>Use <strong>Pause</strong> to temporarily stop recording</li>
              <li>Click <strong>Stop Screen</strong> when you're finished</li>
              <li>Click <strong>Save Recording</strong> to {isElectronApp ? "save the file" : "download the video file"}</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
