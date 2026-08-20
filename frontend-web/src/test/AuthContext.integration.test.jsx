/**
 * Integration Test: AuthContext + authApi.js
 *
 * Chiến lược: KHÔNG mock AuthContext hay authApi — test luồng thật qua
 * MSW (network-level interceptor). Render component bọc trong AuthProvider,
 * thực hiện action, và kiểm tra state thay đổi.
 *
 * Đây là bộ test quan trọng nhất: verify rằng:
 *  - AuthContext gọi đúng API endpoint
 *  - State user/isLoggedIn được cập nhật đúng sau login/register
 *  - Token được lưu đúng (in-memory) để gọi /api/v1/users/me
 */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/server.js'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'
import { clearAccessToken } from '../services/authApi.js'

// Mock navigate để tránh lỗi khi AuthProvider gọi navigate('/')
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Component helper: expose auth state ra DOM để test kiểm tra
function AuthTestHarness({ onMount } = {}) {
  const { user, isLoggedIn, login, register } = useAuth()

  return (
    <div>
      <div data-testid="is-logged-in">{isLoggedIn ? 'true' : 'false'}</div>
      <div data-testid="user-email">{user?.email ?? 'none'}</div>
      <div data-testid="user-name">{user?.name ?? 'none'}</div>
      <button
        data-testid="btn-login"
        onClick={() => login('user@example.com', 'password123')}
      >
        Login
      </button>
      <button
        data-testid="btn-login-wrong"
        onClick={async () => {
          try {
            await login('user@example.com', 'wrongpassword')
          } catch (e) {
            document.getElementById('err-display').textContent = e.message
          }
        }}
      >
        Login Wrong
      </button>
      <button
        data-testid="btn-register"
        onClick={() =>
          register({ fullName: 'Nguyen Van A', email: 'newuser@example.com', password: 'password123' })
        }
      >
        Register
      </button>
      <div id="err-display" data-testid="err-display"></div>
    </div>
  )
}

function renderWithAuth() {
  // Cắt đứt auth ban đầu bằng override /auth/refresh → 401
  // để tránh AuthProvider auto-login khi mount
  server.use(
    http.post('http://localhost:8000/auth/refresh', () => {
      return new HttpResponse(null, { status: 401 })
    })
  )

  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthTestHarness />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('AuthContext Integration (with MSW)', () => {

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  describe('Initial state', () => {
    it('khởi đầu ở guest mode khi refresh token không hợp lệ', async () => {
      renderWithAuth()

      await waitFor(() => {
        expect(screen.getByTestId('is-logged-in').textContent).toBe('false')
        expect(screen.getByTestId('user-email').textContent).toBe('none')
      })
    })
  })

  // -----------------------------------------------------------------------
  // Login flow
  // -----------------------------------------------------------------------

  describe('login()', () => {
    it('sau khi login thành công: isLoggedIn=true, user state được cập nhật từ /users/me', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      // Chờ auth init xong (refresh fail → guest)
      await waitFor(() => {
        expect(screen.getByTestId('is-logged-in').textContent).toBe('false')
      })

      // Click login
      await user.click(screen.getByTestId('btn-login'))

      await waitFor(() => {
        expect(screen.getByTestId('is-logged-in').textContent).toBe('true')
        expect(screen.getByTestId('user-email').textContent).toBe('user@example.com')
        expect(screen.getByTestId('user-name').textContent).toBe('Nguyen Van A')
      })
    })

    it('AuthProvider gọi navigate sau khi login thành công (USER → "/")', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      await waitFor(() => expect(screen.getByTestId('is-logged-in').textContent).toBe('false'))

      await user.click(screen.getByTestId('btn-login'))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('login với credentials sai: ném Error với message từ backend', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      await waitFor(() => expect(screen.getByTestId('is-logged-in').textContent).toBe('false'))

      await user.click(screen.getByTestId('btn-login-wrong'))

      await waitFor(() => {
        expect(screen.getByTestId('err-display').textContent).toBe('Invalid email or password')
        expect(screen.getByTestId('is-logged-in').textContent).toBe('false')
      })
    })
  })

  // -----------------------------------------------------------------------
  // Register flow
  // -----------------------------------------------------------------------

  describe('register()', () => {
    it('sau khi register thành công: isLoggedIn=true, user state được set', async () => {
      const user = userEvent.setup()
      renderWithAuth()

      await waitFor(() => expect(screen.getByTestId('is-logged-in').textContent).toBe('false'))

      await user.click(screen.getByTestId('btn-register'))

      await waitFor(() => {
        expect(screen.getByTestId('is-logged-in').textContent).toBe('true')
      })
    })

    it('register với email đã tồn tại: trả về { ok: false, msg }', async () => {
      // Override handler cho email trùng
      server.use(
        http.post('http://localhost:8000/auth/register', () => {
          return HttpResponse.json(
            { message: 'Email already in use' },
            { status: 400 }
          )
        })
      )

      // Render và expose result ra DOM
      let registerResult = null
      function DuplicateEmailHarness() {
        const { register } = useAuth()
        return (
          <button
            data-testid="btn-dup-register"
            onClick={async () => {
              const res = await register({ fullName: 'X', email: 'existing@example.com', password: 'pass1234' })
              registerResult = res
            }}
          >
            Register Duplicate
          </button>
        )
      }

      // Override refresh → 401 để init guest mode nhanh
      server.use(
        http.post('http://localhost:8000/auth/refresh', () => new HttpResponse(null, { status: 401 }))
      )

      render(
        <MemoryRouter>
          <AuthProvider>
            <DuplicateEmailHarness />
          </AuthProvider>
        </MemoryRouter>
      )

      const user = userEvent.setup()
      await user.click(screen.getByTestId('btn-dup-register'))

      await waitFor(() => {
        expect(registerResult).not.toBeNull()
        expect(registerResult.ok).toBe(false)
        expect(registerResult.msg).toMatch(/Email already in use/)
      })
    })
  })
})
