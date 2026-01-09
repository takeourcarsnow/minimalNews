import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WeatherWidget from '@/components/widgets/WeatherWidget/WeatherWidget'

// Mock fetch and geolocation
global.fetch = jest.fn()
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
}
Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
})

describe('WeatherWidget', () => {
  const mockWeatherData = {
    data: {
      location: 'New York',
      current: {
        temp: 22,
        feels_like: 24,
        humidity: 65,
        wind_speed: 15,
        wind_direction: 'SW',
        condition: 'Partly cloudy',
        icon: '⛅',
        visibility: 10,
        pressure: 1013
      },
      forecast: [
        {
          date: '2024-01-10',
          high: 25,
          low: 18,
          condition: 'Sunny',
          icon: '☀',
          precipitation: 0
        },
        {
          date: '2024-01-11',
          high: 23,
          low: 16,
          condition: 'Cloudy',
          icon: '☁',
          precipitation: 2
        }
      ],
      lastUpdated: '2024-01-10T10:00:00Z'
    },
    error: null,
    timestamp: '2024-01-10T10:00:00Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock geolocation to fail immediately so we can test the default behavior
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ message: 'Geolocation blocked' })
    })
  })

  it('should render loading state initially', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    )

    render(<WeatherWidget />)

    expect(screen.getByText('weather --location')).toBeInTheDocument()
    expect(screen.getByText('◐')).toBeInTheDocument() // Spinner
  })

  it('should fetch and display weather data', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockWeatherData)
    })

    render(<WeatherWidget />)

    // Wait for geolocation to fail and weather to load
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument()
    })

    expect(screen.getByText('22°C')).toBeInTheDocument()
    expect(screen.getByText('(feels like 24°C)')).toBeInTheDocument()
    expect(screen.getByText('Partly cloudy')).toBeInTheDocument()
    expect(screen.getByText('💧 65%')).toBeInTheDocument()
    expect(screen.getByText('💨 15 km/h SW')).toBeInTheDocument()
  })

  it('should display forecast', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockWeatherData)
    })

    render(<WeatherWidget />)

    await waitFor(() => {
      expect(screen.getByText('─── forecast ───')).toBeInTheDocument()
    })

    expect(screen.getByText('25°')).toBeInTheDocument()
    expect(screen.getByText('18°')).toBeInTheDocument()
    expect(screen.getByText('☀')).toBeInTheDocument() // Sun icon for Sunny
  })

  it('should handle location input', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(mockWeatherData)
    })

    render(<WeatherWidget />)

    // Wait for initial weather to load
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Enter location/)
    const form = input.closest('form')

    await userEvent.clear(input)
    await userEvent.type(input, 'London')
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/weather?location=London')
    })
  })

  it('should handle API errors', async () => {
    const errorData = {
      data: null,
      error: 'Failed to fetch weather data',
      timestamp: '2024-01-10T10:00:00Z'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(errorData)
    })

    render(<WeatherWidget />)

    await waitFor(() => {
      expect(screen.getByText('✗ Error: Failed to fetch weather data')).toBeInTheDocument()
    })
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<WeatherWidget />)

    await waitFor(() => {
      expect(screen.getByText('✗ Error: Failed to fetch weather')).toBeInTheDocument()
    })
  })

  it('should attempt geolocation on mount', () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      })
    })

    render(<WeatherWidget />)

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
  })

  it('should handle geolocation failure gracefully', () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error({ message: 'Geolocation blocked' })
    })

    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(mockWeatherData)
    })

    render(<WeatherWidget />)

    // Should still work with default location
    expect(global.fetch).toHaveBeenCalledWith('/api/weather?location=New%20York')
  })
})