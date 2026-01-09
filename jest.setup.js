import '@testing-library/jest-dom'

// Mock Next.js server imports
jest.mock('next/server', () => ({
  NextResponse: {
    json: function(data, options) {
      return {
        status: options?.status || 200,
        json: () => Promise.resolve(data),
      }
    },
  },
}))

// Mock NextRequest
global.Request = class Request {
  constructor(url, options) {
    this.url = url
    this.method = options?.method || 'GET'
  }
}

// Mock URL constructor for tests
global.URL = class URL {
  constructor(url) {
    const urlParts = url.split('?')
    this.searchParams = new URLSearchParams(urlParts[1] || '')
  }
}

// Ensure a real fetch implementation is available for live network tests
try {
  const { fetch } = require('undici')
  if (!global.fetch) global.fetch = fetch
} catch (err) {
  // undici not available — tests will fail if fetch isn't provided by the environment
}