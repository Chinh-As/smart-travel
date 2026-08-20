/**
 * Orders.jsx — Lịch sử đơn hàng đã thanh toán
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, Calendar, MapPin, X, Receipt, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { useBooking, formatVND, itemTicketCount, itemTotal, TICKET_LABELS } from '../../context/BookingContext.jsx'
import { getMethod, PayBadge } from '../../data/paymentMethods.jsx'
import './Orders.css'

const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}

export default function Orders() {
  const navigate = useNavigate()
  const { orders, cancelOrder } = useBooking()
  const [active, setActive] = useState(null)

  if (!orders.length) {
    return (
      <div className="od-page">
        <div className="container">
          <h1 className="od-title"><Receipt size={24} /> Đơn hàng của tôi</h1>
          <div className="od-empty">
            <div className="od-empty__icon"><Ticket size={44} /></div>
            <h2>Chưa có đơn hàng nào</h2>
            <p>Các vé bạn đã đặt và thanh toán sẽ xuất hiện ở đây.</p>
            <button className="btn btn-purple" onClick={() => navigate('/search')}>Bắt đầu đặt vé</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="od-page">
      <div className="container">
        <h1 className="od-title"><Receipt size={24} /> Đơn hàng của tôi</h1>
        <p className="od-sub">{orders.length} đơn hàng</p>

        <div className="od-list">
          {orders.map(o => (
            <div key={o.code} className={`od-card ${o.status === 'cancelled' ? 'is-cancelled' : ''}`} onClick={() => setActive(o)}>
              <img className="od-card__img" src={o.items[0]?.image} alt="" loading="lazy" />
              <div className="od-card__body">
                <div className="od-card__top">
                  <span className="od-card__code">{o.code}</span>
                  <span className={`od-status od-status--${o.status}`}>
                    {o.status === 'paid' ? <><CheckCircle2 size={13} /> Đã thanh toán</> : <><XCircle size={13} /> Đã huỷ</>}
                  </span>
                </div>
                <h3 className="od-card__name">
                  {o.items[0]?.title}{o.items.length > 1 ? ` +${o.items.length - 1} địa điểm` : ''}
                </h3>
                <div className="od-card__meta">
                  <span><Calendar size={13} /> {o.visitDate}</span>
                  <span><Ticket size={13} /> {o.items.reduce((s, it) => s + itemTicketCount(it), 0)} vé</span>
                </div>
                <div className="od-card__foot">
                  <span className="od-card__date">Đặt lúc {fmtDate(o.createdAt)}</span>
                  <strong className="od-card__total">{formatVND(o.total)}</strong>
                </div>
              </div>
              <ChevronRight className="od-card__chev" size={20} />
            </div>
          ))}
        </div>
      </div>

      {/* Modal chi tiết */}
      {active && (
        <div className="od-overlay" onClick={() => setActive(null)}>
          <div className="od-modal" onClick={e => e.stopPropagation()}>
            <div className="od-modal__head">
              <div>
                <span className="od-modal__code">{active.code}</span>
                <span className={`od-status od-status--${active.status}`}>
                  {active.status === 'paid' ? 'Đã thanh toán' : 'Đã huỷ'}
                </span>
              </div>
              <button className="od-modal__close" onClick={() => setActive(null)}><X size={18} /></button>
            </div>

            <div className="od-modal__body">
              <div className="od-modal__section">
                <h4>Vé đã đặt</h4>
                {active.items.map(it => (
                  <div key={it.destId} className="od-mitem">
                    <img src={it.image} alt="" />
                    <div className="od-mitem__info">
                      <strong>{it.title}</strong>
                      <span className="od-mitem__loc"><MapPin size={12} /> {it.location}</span>
                      <div className="od-mitem__tickets">
                        {['adult', 'student', 'child'].filter(k => (it.tickets?.[k] || 0) > 0).map(k => (
                          <span key={k}>{TICKET_LABELS[k]}: {it.tickets[k]}</span>
                        ))}
                      </div>
                    </div>
                    <b>{formatVND(itemTotal(it))}</b>
                  </div>
                ))}
              </div>

              <div className="od-modal__section">
                <h4>Thông tin</h4>
                <div className="od-info-row"><span>Ngày tham quan</span><b>{active.visitDate}</b></div>
                <div className="od-info-row"><span>Người đặt</span><b>{active.contact?.name}</b></div>
                <div className="od-info-row"><span>Liên hệ</span><b>{active.contact?.phone}</b></div>
                <div className="od-info-row">
                  <span>Phương thức</span>
                  <b className="od-method"><PayBadge id={active.method} /> {getMethod(active.method)?.name}</b>
                </div>
              </div>

              <div className="od-modal__section od-modal__bill">
                <div className="od-info-row"><span>Tạm tính</span><b>{formatVND(active.subtotal)}</b></div>
                {active.discount > 0 && <div className="od-info-row od-info-row--off"><span>Giảm giá</span><b>−{formatVND(active.discount)}</b></div>}
                <div className="od-info-row"><span>Phí dịch vụ</span><b>{active.fee === 0 ? 'Miễn phí' : formatVND(active.fee)}</b></div>
                <div className="od-info-row od-info-row--total"><span>Tổng cộng</span><b>{formatVND(active.total)}</b></div>
              </div>
            </div>

            {active.status === 'paid' && (
              <div className="od-modal__foot">
                <button className="btn btn-outline od-cancel" onClick={() => {
                  if (window.confirm('Bạn chắc chắn muốn huỷ đơn hàng này? (mô phỏng hoàn tiền)')) {
                    cancelOrder(active.code)
                    setActive(a => ({ ...a, status: 'cancelled' }))
                  }
                }}>Huỷ đơn & hoàn tiền</button>
                <button className="btn btn-purple" onClick={() => setActive(null)}>Đóng</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
