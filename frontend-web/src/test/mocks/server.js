/**
 * MSW server cho Node.js (Vitest/jsdom environment).
 * Sử dụng setupServer thay vì setupWorker (worker dùng cho browser).
 */
import { setupServer } from 'msw/node'
import { handlers } from './handlers.js'

export const server = setupServer(...handlers)
