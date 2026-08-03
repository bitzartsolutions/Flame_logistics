const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');

console.log('🚀 Starting Flame Logistics Backend & Frontend...\n');

const backend = spawn('npm', ['start'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('Failed to start backend:', err.message);
});

backend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Backend exited with code ${code}`);
  }
});

const frontend = spawn('npm', ['start'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'inherit',
  shell: true
});

frontend.on('error', (err) => {
  console.error('Failed to start frontend:', err.message);
});

frontend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Frontend exited with code ${code}`);
  }
});

process.on('SIGINT', () => {
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit();
});
