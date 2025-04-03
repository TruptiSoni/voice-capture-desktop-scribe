
#!/usr/bin/env node

/**
 * This is a simple script to launch the Electron app without modifying package.json.
 * Run this script directly with Node.js: node electron-launcher.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

console.log('Screen Recorder Desktop App Launcher');
console.log('=====================================');

// Check if running in development or production mode
const args = process.argv.slice(2);
const isDev = args.includes('--dev') || args.includes('-d');

// Function to run electron
function runElectron() {
  console.log(`Starting Electron in ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode...`);
  
  // Set environment variables
  const env = { ...process.env, NODE_ENV: isDev ? 'development' : 'production' };
  
  // Run electron with the main file
  const electronProc = spawn(
    'npx', 
    ['electron', './electron.js'], 
    { 
      env,
      stdio: 'inherit',
      shell: true
    }
  );
  
  electronProc.on('error', (err) => {
    console.error('Failed to start electron:', err);
  });
  
  electronProc.on('close', (code) => {
    console.log(`Electron exited with code ${code}`);
  });
}

// Function to run development server
function runDevServer() {
  console.log('Starting development server...');
  
  const serverProc = spawn(
    'npm',
    ['run', 'dev'],
    { 
      stdio: 'inherit',
      shell: true
    }
  );
  
  serverProc.on('error', (err) => {
    console.error('Failed to start development server:', err);
  });
  
  // Wait for the server to start before launching electron
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Once the dev server is running, press Enter to launch Electron...', () => {
    rl.close();
    runElectron();
  });
}

if (isDev) {
  // In development, start both the dev server and electron
  runDevServer();
} else {
  // In production, just run electron
  runElectron();
}
