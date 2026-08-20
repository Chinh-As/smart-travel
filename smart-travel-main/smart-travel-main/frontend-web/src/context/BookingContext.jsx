/**
 * BookingContext.jsx — Quản lý luồng đặt vé & thanh toán
 * ----------------------------------------------------------
 *  - pendingBooking : đơn đang trong quá trình thanh toán (mirror sang sessionStorage
 *                     để không mất khi refresh trang /checkout)
 *  - orders         : lịch sử đơn đã thanh toán (lưu localStorage)
 *
 *  Cấu trúc 1 booking item:
 *    { destId, title, image, location, visitDate,
 *      tickets: { adult, student, child },
 *      prices:  { adult, student, child } }   // đơn giá từng loại vé
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const BookingContext = createContext(null)

const ORDERS_KEY  = 'st_orders_v1'
const PENDING_KEY = 'st_pending_booking_v1'

/* ── Helpers dùng chung ───────────────────────────────── */
export const formatVND = (n) => `${new Intl.NumberFormat('vi-VN').format(Math.round(n || 0))}đ`

export const TICKET_LABELS = {
  adult:   'Người lớn',
  student: 'Học sinh / Sinh viên',
  child:   'Trẻ em (< 6 tuổi)',
}

/** Tổng tiền của 1 item (số vé × đơn giá từng loại) */
export const itemTotal = (item) => {
  const t = item.tickets || {}
  const p = item.prices || {}
  return (
    (t.adult   || 0) * (p.adult   || 0) +
    (t.student || 0) * (p.student || 0) +
    (t.child   || 0) * (p.child   || 0)
  )
}

/** Tổng số vé của 1 item */
export const itemTicketCount = (item) => {
  const t = item.tickets || {}
  return (t.adult || 0) + (t.student || 0) + (t.child || 0)
}

/** Tạo mã đơn hàng dạng ST-XXXXXX */
const genOrderCode = () =>
  'ST-' + Math.random().toString(36).slice(2, 8).toUpperCase()

/* ── Provider ─────────────────────────────────────────── */
export function BookingProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const raw = localStorage.getItem(ORDERS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  const [pendingBooking, setPendingBooking] = useState(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  // Đồng bộ orders → localStorage
  useEffect(() => {
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)) } catch {}
  }, [orders])

  // Đồng bộ pendingBooking → sessionStorage
  useEffect(() => {
    try {
      if (pendingBooking) sessionStorage.setItem(PENDING_KEY, JSON.stringify(pendingBooking))
      else sessionStorage.removeItem(PENDING_KEY)
    } catch {}
  }, [pendingBooking])

  /** Bắt đầu 1 phiên đặt vé. type: 'single' | 'itinerary' */
  const startBooking = useCallback((booking) => {
    setPendingBooking({
      type: 'single',
      visitDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // mặc định: ngày mai
      ...booking,
    })
  }, [])

  /** Cập nhật đơn đang thanh toán (số vé, ngày đi, thông tin liên hệ...) */
  const updatePending = useCallback((patch) => {
    setPendingBooking(prev => (prev ? { ...prev, ...patch } : prev))
  }, [])

  const updatePendingItem = useCallback((destId, patch) => {
    setPendingBooking(prev => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map(it =>
          it.destId === destId ? { ...it, ...patch } : it
        ),
      }
    })
  }, [])

  const clearPending = useCallback(() => setPendingBooking(null), [])

  /** Chốt đơn → tạo order & lưu lịch sử. Trả về order vừa tạo. */
  const confirmOrder = useCallback(({ method, contact, totals }) => {
    const order = {
      code: genOrderCode(),
      type: pendingBooking?.type || 'single',
      items: pendingBooking?.items || [],
      visitDate: pendingBooking?.visitDate,
      contact,
      method,
      subtotal: totals.subtotal,
      discount: totals.discount,
      fee: totals.fee,
      total: totals.total,
      status: 'paid',
      createdAt: new Date().toISOString(),
    }
    setOrders(prev => [order, ...prev])
    setPendingBooking(null)
    return order
  }, [pendingBooking])

  const cancelOrder = useCallback((code) => {
    setOrders(prev => prev.map(o =>
      o.code === code ? { ...o, status: 'cancelled' } : o
    ))
  }, [])

  const getOrder = useCallback(
    (code) => orders.find(o => o.code === code) || null,
    [orders]
  )

  return (
    <BookingContext.Provider value={{
      pendingBooking, orders,
      startBooking, updatePending, updatePendingItem, clearPending,
      confirmOrder, cancelOrder, getOrder,
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be inside BookingProvider')
  return ctx
}
