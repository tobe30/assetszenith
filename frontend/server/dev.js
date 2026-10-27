import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const serverDirectory = dirname(fileURLToPath(import.meta.url))
const projectDirectory = resolve(serverDirectory, '..')
const children = []
let shuttingDown = false

const start = (label, script, args = []) => {
  const child = spawn(process.execPath, [script, ...args], {
    cwd: projectDirectory,
    stdio: 'inherit',
    env: process.env,
  })
  children.push(child)
  child.on('error', (error) => {
    process.stderr.write(`${label} failed to start: ${error.message}\n`)
    stop(1)
  })
  child.on('exit', (code) => {
    if (!shuttingDown) stop(code ?? 1)
  })
  return child
}

const stop = (exitCode = 0) => {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (child.exitCode === null) child.kill()
  }
  process.exitCode = exitCode
}

process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))

start('Market API', resolve(serverDirectory, 'index.js'))
start('Vite', resolve(projectDirectory, 'node_modules/vite/bin/vite.js'))
