import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface UseMediaRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
}

interface ElectronAPI {
  saveRecording: (blobBase64: string) => Promise<{success: boolean, filePath?: string, message?: string}>;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
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
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  const stopScreenRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
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

      const screenCaptureStream = await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions as DisplayMediaStreamConstraints
      );
      setScreenStream(screenCaptureStream);

      const newCombinedStream = new MediaStream();
      
      screenCaptureStream.getVideoTracks().forEach(track => {
        newCombinedStream.addTrack(track);
      });
      
      setCombinedStream(newCombinedStream);

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

      mediaRecorderRef.current = recorder;
      recorder.start(1000);

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
      audioStream.getTracks().forEach(track => {
        track.stop();
      });
      
      if (combinedStream) {
        const audioTracks = combinedStream.getAudioTracks();
        audioTracks.forEach(track => {
          combinedStream.removeTrack(track);
        });
        
        if (isRecording) {
          stopScreenRecording();
          
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
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        
        setAudioStream(micStream);
        
        if (combinedStream) {
          micStream.getAudioTracks().forEach(track => {
            combinedStream.addTrack(track);
          });
          
          if (isRecording) {
            stopScreenRecording();
            
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

  const saveRecording = useCallback(async () => {
    if (recordedChunks.length === 0) {
      toast({
        title: "No Recording Found",
        description: "There is no recording to save.",
        variant: "destructive"
      });
      return;
    }
    
    const blob = new Blob(recordedChunks, {
      type: 'video/webm'
    });

    if (isElectron && window.electronAPI) {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async function() {
          const base64data = reader.result as string;
          const base64Content = base64data.split(',')[1];
          
          const result = await window.electronAPI.saveRecording(base64Content);
          
          if (result.success) {
            toast({
              title: "Recording Saved",
              description: `Your recording has been saved to ${result.filePath}.`
            });
            setRecordedChunks([]);
          } else {
            toast({
              title: "Save Failed",
              description: result.message || "Failed to save the recording.",
              variant: "destructive"
            });
          }
        };
      } catch (error) {
        console.error("Error saving via Electron:", error);
        browserDownload(blob);
      }
    } else {
      browserDownload(blob);
    }
  }, [recordedChunks]);

  const browserDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `screen-recording-${new Date().toISOString()}.webm`;
    
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Recording Saved",
      description: "Your recording has been downloaded to your computer."
    });
    
    setRecordedChunks([]);
  };

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
    saveRecording,
    isElectronApp: isElectron
  };
};

export default useMediaRecorder;
