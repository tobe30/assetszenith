import { getMarketData } from '../server/marketData.js'

export default {
  async fetch(request) {
    if (request.method !== 'GET') {
      return Response.json(
        { error: 'Method not allowed.' },
        { status: 405, headers: { Allow: 'GET' } },
      )
    }

    try {
      const marketData = await getMarketData()
      return Response.json(marketData, {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
      })
    } catch (error) {
      console.error('Market data request failed:', error)
      return Response.json({ error: 'Market data could not be loaded.' }, { status: 500 })
    }
  },
}
