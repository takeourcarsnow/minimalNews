import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewsWidget from '@/components/widgets/NewsWidget/NewsWidget'

// Mock fetch
global.fetch = jest.fn()

describe('NewsWidget', () => {
  const mockNewsData = {
    data: [
      {
        id: 'news-1',
        title: 'Test News Article',
        source: 'Test Source',
        url: 'https://example.com',
        publishedAt: '2024-01-10T10:00:00Z',
        category: 'technology'
      },
      {
        id: 'news-2',
        title: 'Another News Article',
        source: 'Another Source',
        url: 'https://example2.com',
        publishedAt: '2024-01-10T09:00:00Z',
        category: 'business'
      }
    ],
    error: null,
    timestamp: '2024-01-10T10:00:00Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    )

    render(<NewsWidget />)

    expect(screen.getByText('news --headlines')).toBeInTheDocument()
    expect(screen.getByText('◐')).toBeInTheDocument() // Spinner
  })

  it('should fetch and display news articles', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockNewsData)
    })

    render(<NewsWidget />)

    await waitFor(() => {
      expect(screen.getByText('Test News Article')).toBeInTheDocument()
    })

    expect(screen.getByText('Another News Article')).toBeInTheDocument()
    expect(screen.getByText(/Test Source/)).toBeInTheDocument() // Source appears in meta
    expect(screen.getByText('2 articles')).toBeInTheDocument()
  })

  it('should handle API errors', async () => {
    const errorData = {
      data: [],
      error: 'Failed to fetch news',
      timestamp: '2024-01-10T10:00:00Z'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(errorData)
    })

    render(<NewsWidget />)

    await waitFor(() => {
      expect(screen.getByText('✗ Error: Failed to fetch news')).toBeInTheDocument()
    })
  })

  it('should filter by category', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(mockNewsData)
    })

    render(<NewsWidget />)

    await waitFor(() => {
      expect(screen.getByText('Test News Article')).toBeInTheDocument()
    })

    // Click technology category button
    const techButtons = screen.getAllByText('[technology]')
    const techButton = techButtons.find(button => button.tagName === 'BUTTON')
    userEvent.click(techButton!)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/news?category=technology&limit=10')
    })
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<NewsWidget />)

    await waitFor(() => {
      expect(screen.getByText('✗ Error: Failed to fetch news')).toBeInTheDocument()
    })
  })
})