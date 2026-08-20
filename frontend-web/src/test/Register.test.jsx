/**
 * Unit Test: Register.jsx
 *
 * Chiến lược: Mock useAuth().register() để kiểm tra component behavior:
 * render form, client-side validation, gọi đúng API, xử lý lỗi backend.
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Register from '../pages/Register/Register.jsx'

// ---- Mock AuthContext ----
const mockRegister = vi.fn()
vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ register: mockRegister }),
}))

// ---- Mock react-router navigate ----
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// ---- CSS stub ----
vi.mock('../pages/Register/Register.css', () => ({}))

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  )
}

// Helper: điền form hợp lệ
async function fillValidForm(user) {
  await user.type(screen.getByPlaceholderText(/Họ và Tên/i), 'Nguyen Van A')
  await user.type(screen.getByPlaceholderText(/Tên đăng nhập/i), 'nguyenvana')
  await user.type(screen.getByPlaceholderText(/Email/i), 'user@example.com')
  await user.type(screen.getByPlaceholderText(/Mật khẩu/i), 'password123')
  await user.click(screen.getByRole('checkbox'))
}

describe('Register.jsx', () => {

  beforeEach(() => {
    mockRegister.mockReset()
    mockNavigate.mockReset()
  })

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  describe('Render', () => {
    it('hiển thị đúng 4 input text và checkbox đồng ý điều khoản', () => {
      renderRegister()
      expect(screen.getByPlaceholderText(/Họ và Tên/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Tên đăng nhập/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Mật khẩu/i)).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('hiển thị nút "Tạo tài khoản"', () => {
      renderRegister()
      expect(screen.getByRole('button', { name: /Tạo tài khoản/i })).toBeInTheDocument()
    })

    it('hiển thị link chuyển về trang Đăng nhập', () => {
      renderRegister()
      expect(screen.getByText(/Đã có tài khoản/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Đăng nhập/i })).toBeInTheDocument()
    })
  })

  // -----------------------------------------------------------------------
  // Validation (client-side)
  // -----------------------------------------------------------------------

  describe('Validation (client-side)', () => {
    it('hiển thị lỗi khi submit form trống', async () => {
      const user = userEvent.setup()
      renderRegister()

      await user.click(screen.getByRole('button', { name: /Tạo tài khoản/i }))

      expect(await screen.findByText(/Vui lòng nhập họ và tên/i)).toBeInTheDocument()
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('hiển thị lỗi "Email không hợp lệ" khi email không có @', async () => {
      const user = userEvent.setup()
      renderRegister()

      await user.type(screen.getByPlaceholderText(/Họ và Tên/i), 'Nguyen Van A')
      await user.type(screen.getByPlaceholderText(/Tên đăng nhập/i), 'nguyenvana')
      await user.type(screen.getByPlaceholderText(/Email/i), 'not-an-email')
      await user.type(screen.getByPlaceholderText(/Mật khẩu/i), 'password123')
      await user.click(screen.getByRole('button', { name: /Tạo tài khoản/i }))

      expect(await screen.findByText(/Email không hợp lệ/i)).toBeInTheDocument()
    })

    it('hiển thị lỗi khi mật khẩu ít hơn 8 ký tự', async () => {
      const user = userEvent.setup()
      renderRegister()

      await user.type(screen.getByPlaceholderText(/Họ và Tên/i), 'Nguyen Van A')
      await user.type(screen.getByPlaceholderText(/Tên đăng nhập/i), 'nguyenvana')
      await user.type(screen.getByPlaceholderText(/Email/i), 'user@example.com')
      await user.type(screen.getByPlaceholderText(/Mật khẩu/i), 'short')
      await user.click(screen.getByRole('button', { name: /Tạo tài khoản/i }))

      expect(await screen.findByText(/ít nhất 8 ký tự/i)).toBeInTheDocument()
    })

    it('hiển thị lỗi khi chưa tick đồng ý điều khoản', async () => {
      const user = userEvent.setup()
      renderRegister()

      await user.type(screen.getByPlaceholderText(/Họ và Tên/i), 'Nguyen Van A')
      await user.type(screen.getByPlaceholderText(/Tên đăng nhập/i), 'nguyenvana')
      await user.type(screen.getByPlaceholderText(/Email/i), 'user@example.com')
      await user.type(screen.getByPlaceholderText(/Mật khẩu/i), 'password123')
      // KHÔNG click checkbox
      await user.click(screen.getByRole('button', { name: /Tạo tài khoản/i }))

      expect(await screen.findByText(/đồng ý với điều khoản/i)).toBeInTheDocument()
      expect(mockRegister).not.toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  // Gọi API & xử lý kết quả
  // -----------------------------------------------------------------------

  describe('Gọi API qua AuthContext', () => {
    it('gọi register() với fullName, email, password khi form hợp lệ', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValueOnce({ ok: true })
      renderRegister()

      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /Tạo tài khoản/i }))

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledOnce()
        expect(mockRegister).toHaveBeenCalledWith({
          fullName: 'Nguyen Van A',
          email: 'user@example.com',
          password: 'password123',
        })
      })
    })

    it('chuyển trang đến /onboarding sau khi đăng ký thành công', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValueOnce({ ok: true })
      renderRegister()

      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /Tạo tài khoản/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/onboarding')
      })
    })

    it('hiển thị lỗi từ backend khi email đã tồn tại (ok: false)', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValueOnce({ ok: false, msg: 'Email already in use' })
      renderRegister()

      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /Tạo tài khoản/i }))

      expect(await screen.findByText(/Email already in use/i)).toBeInTheDocument()
      // Không navigate
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('hiển thị lỗi fallback khi register() ném Error', async () => {
      const user = userEvent.setup()
      mockRegister.mockRejectedValueOnce(new Error('Network Error'))
      renderRegister()

      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /Tạo tài khoản/i }))

      expect(await screen.findByText(/Network Error/i)).toBeInTheDocument()
    })

    it('hiển thị trạng thái loading khi đang tạo tài khoản', async () => {
      const user = userEvent.setup()
      // register() không resolve ngay — pending
      mockRegister.mockReturnValueOnce(new Promise(() => {}))
      renderRegister()

      await fillValidForm(user)
      await user.click(screen.getByRole('button', { name: /Tạo tài khoản/i }))

      expect(await screen.findByText(/Đang tạo/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Đang tạo/i })).toBeDisabled()
    })
  })
})
