/**
 * paymentMethods.jsx — Danh mục cổng thanh toán (phong cách Traveloka)
 * ------------------------------------------------------------------
 * Logo thương hiệu được dựng bằng SVG/CSS nội bộ nên dự án tự chứa,
 * không phụ thuộc ảnh ngoài. Mỗi cổng có thêm metadata: nhãn (tag),
 * khuyến mãi (promo), danh sách app/ngân hàng để hiển thị màn QR.
 *
 * Các export GIỮ NGUYÊN để không phá vỡ Orders.jsx & Checkout.jsx:
 *   PayBadge, PAYMENT_GROUPS, ALL_METHODS, getMethod, METHOD_FEE
 */
import React from 'react'

/* ════════════════════════════════════════════════════════════
   Logo thương hiệu — dạng tile bo góc, kích thước co giãn theo `size`
   ════════════════════════════════════════════════════════════ */
export function PayBadge({ id, size = 'md' }) {
  const dim = size === 'lg' ? { w: 56, h: 38, r: 9 } : size === 'sm' ? { w: 38, h: 26, r: 6 } : { w: 48, h: 32, r: 8 }
  const tile = {
    width: dim.w, height: dim.h, borderRadius: dim.r,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, overflow: 'hidden', position: 'relative',
    boxShadow: 'inset 0 0 0 1px rgba(15,23,42,.06)',
  }

  switch (id) {
    /* ── MoMo: nền hồng magenta, vòng tròn trắng + chữ "M" ── */
    case 'momo':
      return (
        <div style={{ ...tile, background: 'linear-gradient(135deg,#B5106F,#E2257F)' }}>
          <svg width={dim.h * 0.62} height={dim.h * 0.62} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="11" fill="#fff" />
            <text x="12" y="16.5" textAnchor="middle" fontSize="13" fontWeight="900"
                  fill="#B5106F" fontFamily="Arial, sans-serif">M</text>
          </svg>
        </div>
      )

    /* ── ZaloPay: nền trắng, khối xanh "Z" + chữ ── */
    case 'zalopay':
      return (
        <div style={{ ...tile, background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{
              background: '#0068FF', color: '#fff', fontWeight: 900,
              fontSize: dim.h * 0.42, lineHeight: 1, padding: '2px 4px',
              borderRadius: 4, fontFamily: 'Arial, sans-serif',
            }}>Z</span>
            <span style={{ color: '#0068FF', fontWeight: 800, fontSize: dim.h * 0.3, letterSpacing: '-.3px' }}>Pay</span>
          </div>
        </div>
      )

    /* ── VNPAY: nền trắng, "VN" đỏ + "PAY" xanh ── */
    case 'vnpay':
      return (
        <div style={{ ...tile, background: '#fff' }}>
          <span style={{ fontWeight: 900, fontSize: dim.h * 0.38, letterSpacing: '-.4px', fontFamily: 'Arial, sans-serif' }}>
            <span style={{ color: '#ED1C24' }}>VN</span><span style={{ color: '#005BAA' }}>PAY</span>
          </span>
        </div>
      )

    /* ── Thẻ quốc tế: nền tối, Visa + 2 vòng Mastercard ── */
    case 'card':
      return (
        <div style={{ ...tile, background: 'linear-gradient(135deg,#1F2544,#11152B)', gap: 4 }}>
          <span style={{ color: '#F4F6FF', fontWeight: 800, fontStyle: 'italic', fontSize: dim.h * 0.3, fontFamily: 'Arial, sans-serif' }}>VISA</span>
          <span style={{ position: 'relative', width: dim.h * 0.5, height: dim.h * 0.3 }}>
            <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: dim.h * 0.3, height: dim.h * 0.3, borderRadius: '50%', background: '#EB001B' }} />
            <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: dim.h * 0.3, height: dim.h * 0.3, borderRadius: '50%', background: '#F79E1B', opacity: .9 }} />
          </span>
        </div>
      )

    /* ── Chuyển khoản QR: nền xanh ngân hàng + glyph QR/ngân hàng ── */
    case 'bank':
      return (
        <div style={{ ...tile, background: 'linear-gradient(135deg,#0F4C75,#1A6BA3)' }}>
          <svg width={dim.h * 0.56} height={dim.h * 0.56} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />
          </svg>
        </div>
      )

    default:
      return <div style={{ ...tile, background: '#64748B', color: '#fff', fontWeight: 800, fontSize: 10 }}>PAY</div>
  }
}

/* ════════════════════════════════════════════════════════════
   Cấu hình các cổng thanh toán
   ════════════════════════════════════════════════════════════ */
export const PAYMENT_GROUPS = [
  {
    group: 'Ví điện tử',
    icon: 'wallet',
    methods: [
      {
        id: 'momo', name: 'Ví MoMo', desc: 'Quét QR hoặc mở app MoMo để thanh toán',
        ui: 'qr', color: '#B5106F', tag: 'Phổ biến nhất', promo: 'Hoàn đến 20.000đ',
        app: 'MoMo',
      },
      {
        id: 'zalopay', name: 'ZaloPay', desc: 'Liên kết Zalo, thanh toán trong 1 chạm',
        ui: 'qr', color: '#0068FF', promo: 'Giảm 10% tối đa 30k', app: 'ZaloPay',
      },
      {
        id: 'vnpay', name: 'VNPAY-QR', desc: 'Quét bằng app ngân hàng bất kỳ',
        ui: 'qr', color: '#ED1C24', app: 'ngân hàng / VNPAY',
        banks: ['Vietcombank', 'Techcombank', 'BIDV', 'VietinBank', 'MB Bank', 'ACB'],
      },
    ],
  },
  {
    group: 'Thẻ & Ngân hàng',
    icon: 'card',
    methods: [
      {
        id: 'card', name: 'Thẻ ATM / Visa / Mastercard / JCB', desc: 'Hỗ trợ thẻ nội địa & quốc tế · Trả góp 0%',
        ui: 'card', color: '#1F2544', tag: 'Trả góp 0%',
      },
      {
        id: 'bank', name: 'Chuyển khoản ngân hàng', desc: 'Quét mã VietQR chuyển khoản nhanh 24/7',
        ui: 'qr', color: '#0F4C75', app: 'ngân hàng', accountName: 'CONG TY SMART TRAVEL',
        accountNo: '1903 6868 6868', bankName: 'Vietcombank — CN Hồ Chí Minh',
        banks: ['Vietcombank', 'Techcombank', 'BIDV', 'VietinBank', 'MB Bank', 'ACB', 'TPBank', 'VPBank'],
      },
    ],
  },
]

export const ALL_METHODS = PAYMENT_GROUPS.flatMap(g => g.methods)
export const getMethod = (id) => ALL_METHODS.find(m => m.id === id) || null

/* Phí dịch vụ mô phỏng theo cổng (đồng) — giữ 0đ để khuyến khích đặt vé */
export const METHOD_FEE = {
  momo: 0, zalopay: 0, vnpay: 0, card: 0, bank: 0,
}

/* Phát hiện thương hiệu thẻ theo số đầu (dùng cho card preview) */
export const detectCardBrand = (num = '') => {
  const n = num.replace(/\D/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  if (/^35/.test(n)) return 'jcb'
  if (/^(9704|970)/.test(n)) return 'napas'
  return 'generic'
}
