/**
 * MSW handlers — mô phỏng backend Auth API responses cho test môi trường.
 *
 * Mỗi handler là một "interceptor" bắt request network và trả về response giả.
 * Điều này giúp test chạy hoàn toàn offline, không cần server thật.
 */
import { http, HttpResponse } from 'msw'

const BACKEND = 'http://localhost:8000'

// Dữ liệu mock dùng chung
const mockUser = {
  id: 'test-user-id-123',
  name: 'Nguyen Van A',
  username: 'nguyenvana',
  email: 'user@example.com',
  phone: '',
  bio: '',
  hasCompletedOnboarding: false,
  createdAt: '2024-01-01T00:00:00Z',
  role: 'USER',
}

const mockAuthResponse = {
  accessToken: 'mock-access-token',
  tokenType: 'Bearer',
  userId: 'test-user-id-123',
  name: 'Nguyen Van A',
  email: 'user@example.com',
  role: 'USER',
}

export const handlers = [
  // POST /auth/login — Happy path
  http.post(`${BACKEND}/auth/login`, async ({ request }) => {
    const body = await request.json()

    if (body.email === 'user@example.com' && body.password === 'password123') {
      return HttpResponse.json(mockAuthResponse, {
        headers: {
          'Set-Cookie': 'refreshToken=mock-refresh-token; HttpOnly; Path=/auth; SameSite=Lax',
        },
      })
    }

    // Wrong credentials
    return HttpResponse.json(
      { message: 'Invalid email or password' },
      { status: 400 }
    )
  }),

  // POST /auth/register — Happy path
  http.post(`${BACKEND}/auth/register`, async ({ request }) => {
    const body = await request.json()

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      )
    }

    return HttpResponse.json(
      { ...mockAuthResponse, email: body.email, name: body.name },
      {
        headers: {
          'Set-Cookie': 'refreshToken=mock-refresh-token; HttpOnly; Path=/auth; SameSite=Lax',
        },
      }
    )
  }),

  // POST /auth/refresh
  http.post(`${BACKEND}/auth/refresh`, () => {
    return HttpResponse.json(mockAuthResponse)
  }),

  // GET /api/v1/users/me
  http.get(`${BACKEND}/api/v1/users/me`, () => {
    return HttpResponse.json(mockUser)
  }),

  // POST /auth/logout
  http.post(`${BACKEND}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
