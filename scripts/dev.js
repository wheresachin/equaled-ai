const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const processes = [
  {
    name: 'backend',
    cwd: path.join(rootDir, 'backend'),
    color: '\x1b[36m',
    command: process.execPath,
    args: [path.join(rootDir, 'backend', 'server.js')],
  },
  {
    name: 'frontend',
    cwd: path.join(rootDir, 'frontend'),
    color: '\x1b[35m',
    command: process.execPath,
    args: [path.join(rootDir, 'frontend', 'node_modules', 'vite', 'bin', 'vite.js'), '--host'],
  },
];

let shuttingDown = false;

function prefixOutput(name, color, stream) {
  let buffer = '';

  return (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line) {
        continue;
      }

      stream.write(`${color}[${name}]\x1b[0m ${line}\n`);
    }
  };
}

const children = processes.map(({ name, cwd, color, command, args }) => {
  const child = spawn(command, args, {
    cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: false,
    env: process.env,
  });

  child.stdout.on('data', prefixOutput(name, color, process.stdout));
  child.stderr.on('data', prefixOutput(name, color, process.stderr));

  child.on('exit', (code) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.error(`\n${name} exited with code ${code ?? 'unknown'}. Stopping the other dev server...`);

    for (const otherChild of children) {
      if (otherChild !== child && !otherChild.killed) {
        otherChild.kill('SIGINT');
      }
    }

    process.exit(code ?? 1);
  });

  return child;
});

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
