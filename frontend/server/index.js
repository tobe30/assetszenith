import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { getMarketData } from './marketData.js'

const serverDirectory = dirname(fileURLToPath(import.meta.url))
const projectDirectory = resolve(serverDirectory, '..')

const loadLocalEnv = async () => {
  try {
    const contents = await readFile(resolve(projectDirectory, '.env'), 'utf8')
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!match || match[1] in process.env) continue
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

await loadLocalEnv()

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost')
  if (requestUrl.pathname !== '/api/markets' || request.method !== 'GET') {
    response.writeHead(404, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  try {
    const marketData = await getMarketData()
    response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
    response.end(JSON.stringify(marketData))
  } catch (error) {
    console.error('Market data request failed:', error)
    response.writeHead(500, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: 'Market data could not be loaded.' }))
  }
})

const port = Number(process.env.API_PORT || 3001)
server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Assets Zenith market API listening on http://127.0.0.1:${port}\n`)
})
