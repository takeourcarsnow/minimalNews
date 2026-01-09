import { GET } from '@/app/api/news/route'

// Mock URL and Request since they're not available in test environment
const mockRequest = (url: string) => ({
  url,
  method: 'GET',
  headers: new Map(),
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  formData: () => Promise.resolve(new FormData()),
  blob: () => Promise.resolve(new Blob()),
})

describe('/api/news', () => {
  it('should return news data with default parameters', async () => {
    const request = mockRequest('http://localhost:3000/api/news')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('error')
    expect(data).toHaveProperty('timestamp')
    expect(data.error).toBeNull()
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.data.length).toBeGreaterThan(0)

    // Check structure of first news item
    const firstItem = data.data[0]
    expect(firstItem).toHaveProperty('id')
    expect(firstItem).toHaveProperty('title')
    expect(firstItem).toHaveProperty('source')
    expect(firstItem).toHaveProperty('url')
    expect(firstItem).toHaveProperty('publishedAt')
    expect(firstItem).toHaveProperty('category')
  })

  it('should filter news by category', async () => {
    const request = mockRequest('http://localhost:3000/api/news?category=technology')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toBeDefined()
    expect(data.error).toBeNull()

    // All returned items should have the technology category
    data.data.forEach((item: any) => {
      expect(item.category?.toLowerCase()).toBe('technology')
    })
  })

  it('should limit results', async () => {
    const limit = 5
    const request = mockRequest(`http://localhost:3000/api/news?limit=${limit}`)
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data).toHaveLength(limit)
  })

  it('should handle invalid limit gracefully', async () => {
    const request = mockRequest('http://localhost:3000/api/news?limit=50')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.length).toBeLessThanOrEqual(20) // Should be capped at 20
  })
})