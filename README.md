
# Screen Recorder Desktop App

A cross-platform desktop application for recording your screen with audio.

## Features

- Record your screen with easy-to-use controls
- Toggle microphone audio on/off
- Pause and resume recordings
- Save recordings to your computer
- Cross-platform support (Windows, macOS, Linux)

## Running the App

### Development Mode

To run the app in development mode:

```bash
# First, start the development server
npm run dev

# In a separate terminal, run the Electron launcher
node electron-launcher.js --dev
```

### Production Mode

To build and run the app in production mode:

```bash
# First, build the app
npm run build

# Then run the Electron app
node electron-launcher.js
```

## Without Electron

You can also use this application as a regular web app:

```bash
npm run dev
```

Then open your browser to http://localhost:8080

## How It Works

This application uses:

- React for the user interface
- Vite for fast development and building
- Electron for the desktop app functionality
- MediaRecorder API for screen and audio recording

## Known Limitations

- The application requires screen recording permissions which may need to be enabled in your system settings
- On macOS, you may need to grant additional permissions for screen recording

