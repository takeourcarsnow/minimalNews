import { GET } from '@/app/api/weather/route'

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

describe('/api/weather', () => {
  it('should return weather data with default location', async () => {
    const request = mockRequest('http://localhost:3000/api/weather')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('error')
    expect(data).toHaveProperty('timestamp')
    expect(data.error).toBeNull()
    expect(data.data).toBeDefined()

    const weather = data.data
    expect(weather).toHaveProperty('location')
    expect(weather).toHaveProperty('current')
    expect(weather).toHaveProperty('forecast')
    expect(weather).toHaveProperty('lastUpdated')

    // Check current weather structure
    expect(weather.current).toHaveProperty('temp')
    expect(weather.current).toHaveProperty('feels_like')
    expect(weather.current).toHaveProperty('humidity')
    expect(weather.current).toHaveProperty('wind_speed')
    expect(weather.current).toHaveProperty('wind_direction')
    expect(weather.current).toHaveProperty('condition')
    expect(weather.current).toHaveProperty('icon')
    expect(weather.current).toHaveProperty('visibility')
    expect(weather.current).toHaveProperty('pressure')

    // Check forecast structure
    expect(Array.isArray(weather.forecast)).toBe(true)
    expect(weather.forecast.length).toBe(5)
    weather.forecast.forEach((day: any) => {
      expect(day).toHaveProperty('date')
      expect(day).toHaveProperty('high')
      expect(day).toHaveProperty('low')
      expect(day).toHaveProperty('condition')
      expect(day).toHaveProperty('icon')
      expect(day).toHaveProperty('precipitation')
    })
  })

  it('should return weather data for custom location', async () => {
    const location = 'London'
    const request = mockRequest(`http://localhost:3000/api/weather?location=${location}`)
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.location).toBe(location)
  })

  it('should handle coordinate format', async () => {
    const coordinates = '51.5074,-0.1278'
    const request = mockRequest(`http://localhost:3000/api/weather?location=${coordinates}`)
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.location).toBe(coordinates)
  })

  it('should return valid temperature ranges', async () => {
    const request = mockRequest('http://localhost:3000/api/weather')
    const response = await GET(request as any)
    const data = await response.json()

    const { current, forecast } = data.data

    // Temperature should be reasonable (between -50 and 60°C)
    expect(current.temp).toBeGreaterThanOrEqual(-50)
    expect(current.temp).toBeLessThanOrEqual(60)

    // Forecast temperatures should also be reasonable
    forecast.forEach((day: any) => {
      expect(day.high).toBeGreaterThanOrEqual(-50)
      expect(day.high).toBeLessThanOrEqual(60)
      expect(day.low).toBeGreaterThanOrEqual(-50)
      expect(day.low).toBeLessThanOrEqual(60)
      expect(day.high).toBeGreaterThanOrEqual(day.low)
    })
  })

  it('should return valid humidity and other metrics', async () => {
    const request = mockRequest('http://localhost:3000/api/weather')
    const response = await GET(request as any)
    const data = await response.json()

    const { current } = data.data

    // Humidity should be between 0 and 100
    expect(current.humidity).toBeGreaterThanOrEqual(0)
    expect(current.humidity).toBeLessThanOrEqual(100)

    // Wind speed should be non-negative
    expect(current.wind_speed).toBeGreaterThanOrEqual(0)

    // Visibility should be positive
    expect(current.visibility).toBeGreaterThan(0)

    // Pressure should be in reasonable range
    expect(current.pressure).toBeGreaterThanOrEqual(900)
    expect(current.pressure).toBeLessThanOrEqual(1100)
  })
})