// Global test setup — runs before every test file
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server.js'

// Start MSW before all tests in this suite
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset handlers between tests to avoid state leaking
afterEach(() => server.resetHandlers())

// Clean up after all tests finish
afterAll(() => server.close())
