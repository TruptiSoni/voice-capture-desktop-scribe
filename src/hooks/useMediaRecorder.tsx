
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface UseMediaRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
}

const useMediaRecorder = (options: UseMediaRecorderOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Define stopScreenRecording function
  const stopScreenRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks in the streams
      if (screenStream) {
        screenStream.getTracks().forEach(track => {
          track.stop();
        });
      }
      
      setIsRecording(false);
      setIsPaused(false);
      
      toast({
        title: "Recording Stopped",
        description: "Your recording has been successfully captured."
      });
    }
  }, [isRecording, screenStream]);

  const startScreenRecording = useCallback(async () => {
    try {
      const displayMediaOptions = {
        video: {
          cursor: "always",
          displaySurface: "monitor",
        },
        audio: false,
      };

      // Request screen capture permission
      const screenCaptureStream = await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions as DisplayMediaStreamConstraints
      );
      setScreenStream(screenCaptureStream);

      // Create a new combined stream that we'll add audio to if needed
      const newCombinedStream = new MediaStream();
      
      // Add all video tracks from screen capture
      screenCaptureStream.getVideoTracks().forEach(track => {
        newCombinedStream.addTrack(track);
      });
      
      setCombinedStream(newCombinedStream);

      // Create and setup media recorder
      const recorder = new MediaRecorder(newCombinedStream, {
        mimeType: options.mimeType || 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: options.videoBitsPerSecond || 2500000,
        audioBitsPerSecond: options.audioBitsPerSecond || 128000
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstart = () => {
        setIsRecording(true);
        setIsPaused(false);
      };

      recorder.onstop = () => {
        setIsRecording(false);
        setIsPaused(false);
      };

      recorder.onpause = () => {
        setIsPaused(true);
      };

      recorder.onresume = () => {
        setIsPaused(false);
      };

      recorder.onerror = () => {
        toast({
          title: "Recording Error",
          description: "There was an error with the recording process.",
          variant: "destructive"
        });
      };

      // Start recording
      mediaRecorderRef.current = recorder;
      recorder.start(1000); // Collect data every second
      
      // Listen for the user ending the screen share
      screenCaptureStream.getVideoTracks()[0].onended = () => {
        stopScreenRecording();
      };

    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Permission Denied",
        description: "Screen recording permission was denied.",
        variant: "destructive"
      });
    }
  }, [options, stopScreenRecording]);

  const toggleAudio = useCallback(async () => {
    if (isAudioEnabled && audioStream) {
      // Remove audio
      audioStream.getTracks().forEach(track => {
        track.stop();
      });
      
      if (combinedStream) {
        const audioTracks = combinedStream.getAudioTracks();
        audioTracks.forEach(track => {
          combinedStream.removeTrack(track);
        });
        
        // Recreate the media recorder with the updated stream if recording
        if (isRecording) {
          stopScreenRecording();
          
          // Small delay to ensure the previous recorder is fully stopped
          setTimeout(() => {
            const recorder = new MediaRecorder(combinedStream, {
              mimeType: options.mimeType || 'video/webm;codecs=vp9,opus',
              videoBitsPerSecond: options.videoBitsPerSecond || 2500000,
            });
            
            recorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                setRecordedChunks(prev => [...prev, event.data]);
              }
            };
            
            mediaRecorderRef.current = recorder;
            recorder.start(1000);
          }, 100);
        }
      }
      
      setAudioStream(null);
      setIsAudioEnabled(false);
      
      toast({
        title: "Microphone Disabled",
        description: "Audio recording has been turned off."
      });
      
    } else {
      try {
        // Request microphone permission
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        
        setAudioStream(micStream);
        
        if (combinedStream) {
          // Add all audio tracks from microphone
          micStream.getAudioTracks().forEach(track => {
            combinedStream.addTrack(track);
          });
          
          // Recreate the media recorder with the updated stream if recording
          if (isRecording) {
            stopScreenRecording();
            
            // Small delay to ensure the previous recorder is fully stopped
            setTimeout(() => {
              const recorder = new MediaRecorder(combinedStream, {
                mimeType: options.mimeType || 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: options.videoBitsPerSecond || 2500000,
                audioBitsPerSecond: options.audioBitsPerSecond || 128000
              });
              
              recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                  setRecordedChunks(prev => [...prev, event.data]);
                }
              };
              
              mediaRecorderRef.current = recorder;
              recorder.start(1000);
            }, 100);
          }
        }
        
        setIsAudioEnabled(true);
        
        toast({
          title: "Microphone Enabled",
          description: "Audio recording has been turned on."
        });
        
      } catch (error) {
        console.error("Error getting audio:", error);
        toast({
          title: "Microphone Access Denied",
          description: "Unable to access your microphone.",
          variant: "destructive"
        });
      }
    }
  }, [isAudioEnabled, audioStream, combinedStream, isRecording, options, stopScreenRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      toast({
        title: "Recording Paused",
        description: "You can resume recording at any time."
      });
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      toast({
        title: "Recording Resumed",
        description: "Your recording is now continuing."
      });
    }
  }, [isRecording, isPaused]);

  const saveRecording = useCallback(() => {
    if (recordedChunks.length === 0) {
      toast({
        title: "No Recording Found",
        description: "There is no recording to save.",
        variant: "destructive"
      });
      return;
    }
    
    // Combine all recorded chunks into a single blob
    const blob = new Blob(recordedChunks, {
      type: 'video/webm'
    });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `screen-recording-${new Date().toISOString()}.webm`;
    
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Recording Saved",
      description: "Your recording has been downloaded to your computer."
    });
    
    // Clear recorded chunks after saving
    setRecordedChunks([]);
    
  }, [recordedChunks]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenStream, audioStream]);

  return {
    isRecording,
    isPaused,
    isAudioEnabled,
    hasRecording: recordedChunks.length > 0,
    screenStream: combinedStream,
    startScreenRecording,
    stopScreenRecording,
    pauseRecording,
    resumeRecording,
    toggleAudio,
    saveRecording
  };
};

export default useMediaRecorder;
