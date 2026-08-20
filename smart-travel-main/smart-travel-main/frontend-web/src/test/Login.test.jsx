/**
 * Unit Test: Login.jsx
 *
 * Chiến lược: Mock toàn bộ useAuth() context (không cần MSW ở đây vì
 * Login.jsx không trực tiếp gọi API — nó delegate cho AuthContext.login()).
 * Test tập trung vào behavior của component: render, validate, và callback.
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login/Login.jsx'

// ---- Mock AuthContext ----
const mockLogin = vi.fn()
vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

// ---- Mock react-router navigate ----
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: null } }),
  }
})

// ---- CSS stub (jsdom không cần CSS) ----
vi.mock('../pages/Login/Login.css', () => ({}))

// Helper: render component trong MemoryRouter
function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login.jsx', () => {

  beforeEach(() => {
    mockLogin.mockReset()
    mockNavigate.mockReset()
  })

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  describe('Render', () => {
    it('hiển thị đúng form với input credential, password và nút Đăng nhập', () => {
      renderLogin()
      expect(screen.getByPlaceholderText(/Email hoặc Tên đăng nhập/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Mật khẩu/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument()
    })

    it('KHÔNG còn nút "Dùng tài khoản demo" sau khi tích hợp API thật', () => {
      renderLogin()
      expect(screen.queryByText(/demo/i)).not.toBeInTheDocument()
    })

    it('hiển thị link "Đăng kí" và "Quên mật khẩu?"', () => {
      renderLogin()
      expect(screen.getByText(/Đăng kí/i)).toBeInTheDocument()
      expect(screen.getByText(/Quên mật khẩu/i)).toBeInTheDocument()
    })
  })

  // -----------------------------------------------------------------------
  // Client-side Validation
  // -----------------------------------------------------------------------

  describe('Validation (client-side)', () => {
    it('hiển thị lỗi khi submit form trống', async () => {
      const user = userEvent.setup()
      renderLogin()

      await user.click(screen.getByRole('button', { name: /Đăng nhập/i }))

      expect(await screen.findByText(/Vui lòng nhập email/i)).toBeInTheDocument()
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('hiển thị lỗi khi mật khẩu ít hơn 6 ký tự', async () => {
      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByPlaceholderText(/Email hoặc Tên đăng nhập/i), 'user@example.com')
      await user.type(screen.getByPlaceholderText(/Mật khẩu/i), '123')
      await user.click(screen.getByRole('button', { name: /Đăng nhập/i }))

      expect(await screen.findByText(/ít nhất 6 ký tự/i)).toBeInTheDocument()
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('không hiển thị lỗi khi data hợp lệ', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce({ ok: true })
      renderLogin()

      await user.type(screen.getByPlaceholderText(/Email hoặc Tên đăng nhập/i), 'user@example.com')
      await user.type(screen.getByPlaceholderText(/Mật khẩu/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Đăng nhập/i }))

      await waitFor(() => {
        expect(screen.queryByText(/Vui lòng nhập/i)).not.toBeInTheDocument()
      })
    })
  })

  // -----------------------------------------------------------------------
  // Gọi API (delegate qua AuthContext)
  // -----------------------------------------------------------------------

  describe('Gọi API qua AuthContext', () => {
    it('gọi login() với đúng credential và password khi submit form hợp lệ', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce({ ok: true })
      renderLogin()

      await user.type(screen.getByPlaceholderText(/Email hoặc Tên đăng nhập/i), 'user@example.com')
      await user.type(screen.getByPlaceholderText(/Mật khẩu/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Đăng nhập/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledOnce()
        expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123')
      })
    })

    it('hiển thị lỗi từ backend khi login() ném Error', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'))
      renderLogin()

      await user.type(screen.getByPlaceholderText(/Email hoặc Tên đăng nhập/i), 'wrong@example.com')
      await user.type(screen.getByPlaceholderText(/Mật khẩu/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /Đăng nhập/i }))

      expect(await screen.findByText(/Invalid email or password/i)).toBeInTheDocument()
    })

    it('hiển thị trạng thái loading khi đang đăng nhập', async () => {
      const user = userEvent.setup()
      // login() không resolve ngay — tạo pending promise
      mockLogin.mockReturnValueOnce(new Promise(() => {}))
      renderLogin()

      await user.type(screen.getByPlaceholderText(/Email hoặc Tên đăng nhập/i), 'user@example.com')
      await user.type(screen.getByPlaceholderText(/Mật khẩu/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Đăng nhập/i }))

      expect(await screen.findByText(/Đang đăng nhập/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Đang đăng nhập/i })).toBeDisabled()
    })
  })
})
