/**
 * Checkout.jsx — Luồng thanh toán cao cấp (phong cách Traveloka)
 * --------------------------------------------------------------
 *   B1: Chi tiết đặt vé (số vé, ngày đi, thông tin liên hệ)
 *   B2: Thanh toán  (chọn cổng → QR động / thẻ với preview 3D)
 *   B3: Hoàn tất    (vé điện tử + hiệu ứng confetti, in/lưu vé)
 *
 * Giữ nguyên hợp đồng với BookingContext nên không ảnh hưởng phần còn lại.
 */
import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Ticket, Calendar, User, Mail, Phone, Minus, Plus, Check, ChevronLeft,
  ShieldCheck, Clock, Tag, MapPin, Loader2, CreditCard, QrCode,
  CheckCircle2, Sparkles, Lock, Smartphone, Copy, Printer, BadgeCheck,
  Zap, ArrowRight, RotateCw, Info, Wallet, ScanLine,
} from 'lucide-react'
import { useBooking, formatVND, itemTotal, itemTicketCount, TICKET_LABELS } from '../../context/BookingContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  PAYMENT_GROUPS, getMethod, METHOD_FEE, PayBadge, ALL_METHODS, detectCardBrand,
} from '../../data/paymentMethods.jsx'
import './Checkout.css'

/* ════════════════════════════════════════════════════════════
   Mã QR giả lập (lưới module ổn định theo seed) + logo trung tâm
   ════════════════════════════════════════════════════════════ */
function FakeQR({ seed = 'smart-travel', size = 196, accent = '#0F172A', logo = null }) {
  const N = 29
  const cells = useMemo(() => {
    let h = 0
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
    const rng = () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 16) & 1 }
    const grid = []
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) grid.push(rng())
    return grid
  }, [seed])

  const isFinder = (r, c) => {
    const inBox = (br, bc) => r >= br && r < br + 7 && c >= bc && c < bc + 7
    return inBox(0, 0) || inBox(0, N - 7) || inBox(N - 7, 0)
  }
  const mid = Math.floor(N / 2)
  const isHole = (r, c) => Math.abs(r - mid) <= 3 && Math.abs(c - mid) <= 3
  const px = size / N

  return (
    <div className="co-qrsvg" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="#fff" />
        {cells.map((v, i) => {
          const r = Math.floor(i / N), c = i % N
          if (isFinder(r, c) || isHole(r, c)) return null
          return v ? <rect key={i} x={c * px} y={r * px} width={px} height={px} rx={px * 0.18} fill="#0F172A" /> : null
        })}
        {[[0, 0], [0, N - 7], [N - 7, 0]].map(([br, bc], k) => (
          <g key={k}>
            <rect x={bc * px} y={br * px} width={px * 7} height={px * 7} rx={px * 1.4} fill="#0F172A" />
            <rect x={(bc + 1) * px} y={(br + 1) * px} width={px * 5} height={px * 5} rx={px} fill="#fff" />
            <rect x={(bc + 2) * px} y={(br + 2) * px} width={px * 3} height={px * 3} rx={px * 0.6} fill={accent} />
          </g>
        ))}
      </svg>
      {logo && <div className="co-qrsvg__logo">{logo}</div>}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   Thẻ tín dụng preview 3D (lật khi nhập CVV)
   ════════════════════════════════════════════════════════════ */
function CardPreview({ number, name, exp, cvv, flipped }) {
  const brand = detectCardBrand(number)
  const groups = (number || '').padEnd(19, ' ').slice(0, 19)
  const display = number
    ? groups.replace(/(.{4}) (.{4}) (.{4}) (.{4})/, '$1 $2 $3 $4')
    : '•••• •••• •••• ••••'

  const BrandMark = () => {
    if (brand === 'visa') return <span className="co-cc__brand co-cc__brand--visa">VISA</span>
    if (brand === 'mastercard') return (
      <span className="co-cc__mc"><i style={{ background: '#EB001B' }} /><i style={{ background: '#F79E1B' }} /></span>
    )
    if (brand === 'jcb') return <span className="co-cc__brand" style={{ color: '#fff' }}>JCB</span>
    if (brand === 'amex') return <span className="co-cc__brand" style={{ color: '#fff' }}>AMEX</span>
    if (brand === 'napas') return <span className="co-cc__brand" style={{ color: '#fff' }}>NAPAS</span>
    return <CreditCard size={26} color="rgba(255,255,255,.85)" />
  }

  return (
    <div className={`co-cc ${flipped ? 'is-flipped' : ''}`}>
      <div className="co-cc__inner">
        <div className="co-cc__face co-cc__front">
          <div className="co-cc__shine" />
          <div className="co-cc__top">
            <span className="co-cc__chip" />
            <BrandMark />
          </div>
          <div className="co-cc__num">{display}</div>
          <div className="co-cc__bottom">
            <div>
              <span className="co-cc__lbl">Chủ thẻ</span>
              <span className="co-cc__val">{name || 'NGUYEN VAN A'}</span>
            </div>
            <div>
              <span className="co-cc__lbl">Hết hạn</span>
              <span className="co-cc__val">{exp || 'MM/YY'}</span>
            </div>
          </div>
        </div>
        <div className="co-cc__face co-cc__back">
          <div className="co-cc__stripe" />
          <div className="co-cc__cvvrow">
            <span className="co-cc__cvvlbl">CVV</span>
            <span className="co-cc__cvvbox">{cvv ? '•'.repeat(cvv.length) : '•••'}</span>
          </div>
          <div className="co-cc__backbrand"><BrandMark /></div>
        </div>
      </div>
    </div>
  )
}

const STEPS = ['Chi tiết đặt vé', 'Thanh toán', 'Hoàn tất']

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    pendingBooking, updatePending, updatePendingItem, confirmOrder, clearPending,
  } = useBooking()

  const [step, setStep] = useState(1)
  const [contact, setContact] = useState({
    name:  user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [errors, setErrors] = useState({})
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [method, setMethod] = useState(null)
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvv: '' })
  const [cardFlipped, setCardFlipped] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [countdown, setCountdown] = useState(599)
  const [copied, setCopied] = useState('')
  const [doneOrder, setDoneOrder] = useState(null)
  const mainRef = useRef(null)

  useEffect(() => {
    if (step !== 2) return
    const t = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [step])

  const items = pendingBooking?.items || []

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + itemTotal(it), 0)
    const combo = pendingBooking?.type === 'itinerary' ? Math.round(subtotal * 0.05) : 0
    const promoOff = promoApplied ? Math.round(subtotal * 0.10) : 0
    const discount = combo + promoOff
    const fee = method ? (METHOD_FEE[method] || 0) : 0
    const total = Math.max(0, subtotal - discount + fee)
    return { subtotal, combo, promoOff, discount, fee, total }
  }, [items, pendingBooking, promoApplied, method])

  const totalTickets = items.reduce((s, it) => s + itemTicketCount(it), 0)

  if ((!pendingBooking || items.length === 0) && step !== 3) {
    return (
      <div className="co-page">
        <div className="container">
          <div className="co-empty">
            <div className="co-empty__icon"><Ticket size={46} /></div>
            <h2>Chưa có vé nào để thanh toán</h2>
            <p>Hãy chọn một địa điểm và đặt vé, hoặc thanh toán toàn bộ lịch trình của bạn.</p>
            <div className="co-empty__actions">
              <button className="btn btn-purple" onClick={() => navigate('/search')}>Khám phá địa điểm</button>
              <button className="btn btn-outline" onClick={() => navigate('/itinerary')}>Xem lịch trình</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const changeTicket = (destId, key, delta) => {
    const it = items.find(i => i.destId === destId)
    if (!it) return
    const cur = it.tickets?.[key] || 0
    const next = Math.max(0, Math.min(20, cur + delta))
    updatePendingItem(destId, { tickets: { ...it.tickets, [key]: next } })
  }

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === 'SMART10') { setPromoApplied(true); setErrors(e => ({ ...e, promo: '' })) }
    else { setPromoApplied(false); setErrors(e => ({ ...e, promo: 'Mã không hợp lệ' })) }
  }

  const validateStep1 = () => {
    const e = {}
    if (totalTickets < 1) e.tickets = 'Vui lòng chọn ít nhất 1 vé'
    if (!contact.name.trim()) e.name = 'Nhập họ tên người đặt'
    if (!/^[0-9]{9,11}$/.test(contact.phone.replace(/\s/g, ''))) e.phone = 'Số điện thoại không hợp lệ'
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) e.email = 'Email không hợp lệ'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const goStep2 = () => {
    if (!validateStep1()) return
    updatePending({ contact, visitDate: pendingBooking.visitDate })
    setStep(2); setCountdown(599); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const validatePayment = () => {
    if (!method) { setErrors({ method: 'Vui lòng chọn phương thức thanh toán' }); return false }
    if (method === 'card') {
      const e = {}
      if (card.number.replace(/\s/g, '').length < 16) e.cardNumber = 'Số thẻ phải đủ 16 số'
      if (!card.name.trim()) e.cardName = 'Nhập tên chủ thẻ'
      if (!/^\d{2}\/\d{2}$/.test(card.exp)) e.cardExp = 'MM/YY'
      if (!/^\d{3,4}$/.test(card.cvv)) e.cardCvv = 'CVV 3-4 số'
      setErrors(e)
      return Object.keys(e).length === 0
    }
    setErrors({})
    return true
  }

  const handlePay = () => {
    if (!validatePayment()) return
    setProcessing(true)
    setTimeout(() => {
      const order = confirmOrder({ method, contact, totals })
      setProcessing(false)
      setDoneOrder(order)
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 2100)
  }

  const copyText = (text, key) => {
    try { navigator.clipboard?.writeText(text) } catch {}
    setCopied(key); setTimeout(() => setCopied(''), 1600)
  }

  const fmtCountdown = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`
  const countdownPct = Math.max(0, (countdown / 599) * 100)
  const selectedMethod = getMethod(method)

  return (
    <div className="co-page">
      {processing && (
        <div className="co-processing">
          <div className="co-processing__card">
            <div className="co-processing__ring"><Loader2 size={30} /></div>
            <h3>Đang xác nhận giao dịch…</h3>
            <p>Vui lòng không đóng hoặc tải lại trình duyệt</p>
            <div className="co-processing__bar"><span /></div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="co-stepper">
          {STEPS.map((label, i) => {
            const n = i + 1
            const state = step > n ? 'done' : step === n ? 'active' : 'todo'
            return (
              <React.Fragment key={label}>
                <div className={`co-step co-step--${state}`}>
                  <span className="co-step__dot">{step > n ? <Check size={16} strokeWidth={3} /> : n}</span>
                  <span className="co-step__label">{label}</span>
                </div>
                {n < STEPS.length && <span className={`co-step__line ${step > n ? 'is-done' : ''}`} />}
              </React.Fragment>
            )
          })}
        </div>

        {step !== 3 && (
          <div className="co-grid">
            <div className="co-main" ref={mainRef}>

              {step === 1 && (
                <>
                  <section className="co-card">
                    <div className="co-card__head">
                      <span className="co-card__ic"><Ticket size={18} /></span>
                      <h2>Chọn số lượng vé</h2>
                      {pendingBooking.type === 'itinerary' && (
                        <span className="co-badge-combo"><Zap size={12} /> Combo lịch trình −5%</span>
                      )}
                    </div>
                    {errors.tickets && <div className="co-err-banner">{errors.tickets}</div>}

                    <div className="co-items">
                      {items.map(it => (
                        <div key={it.destId} className="co-item">
                          <img className="co-item__img" src={it.image} alt={it.title} loading="lazy" />
                          <div className="co-item__info">
                            <h3>{it.title}</h3>
                            <div className="co-item__loc"><MapPin size={13} /> {it.location}</div>
                            <div className="co-tickets">
                              {['adult', 'student', 'child'].map(key => (
                                <div key={key} className="co-ticket-row">
                                  <div className="co-ticket-row__label">
                                    <span>{TICKET_LABELS[key]}</span>
                                    <span className="co-ticket-row__price">
                                      {(it.prices?.[key] || 0) === 0 ? 'Miễn phí' : formatVND(it.prices?.[key])}
                                    </span>
                                  </div>
                                  <div className="co-stepper-ctrl">
                                    <button onClick={() => changeTicket(it.destId, key, -1)} disabled={(it.tickets?.[key] || 0) === 0} aria-label="Giảm"><Minus size={14} /></button>
                                    <span>{it.tickets?.[key] || 0}</span>
                                    <button onClick={() => changeTicket(it.destId, key, 1)} aria-label="Tăng"><Plus size={14} /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="co-item__sub">{itemTotal(it) === 0 ? 'Miễn phí' : formatVND(itemTotal(it))}</div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="co-card">
                    <div className="co-card__head"><span className="co-card__ic"><Calendar size={18} /></span><h2>Ngày tham quan</h2></div>
                    <input
                      type="date"
                      className="co-input co-input--date"
                      value={pendingBooking.visitDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={e => updatePending({ visitDate: e.target.value })}
                    />
                    <p className="co-hint"><Info size={13} /> Vé có giá trị trong ngày bạn chọn. Vui lòng đến trước giờ đóng cửa.</p>
                  </section>

                  <section className="co-card">
                    <div className="co-card__head"><span className="co-card__ic"><User size={18} /></span><h2>Thông tin người đặt</h2></div>
                    <div className="co-form">
                      <div className="co-field">
                        <label>Họ và tên *</label>
                        <div className={`co-input-wrap ${errors.name ? 'has-err' : ''}`}>
                          <User size={16} />
                          <input value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} placeholder="Nguyễn Văn A" />
                        </div>
                        {errors.name && <span className="co-err">{errors.name}</span>}
                      </div>
                      <div className="co-field">
                        <label>Số điện thoại *</label>
                        <div className={`co-input-wrap ${errors.phone ? 'has-err' : ''}`}>
                          <Phone size={16} />
                          <input value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} placeholder="09xxxxxxxx" />
                        </div>
                        {errors.phone && <span className="co-err">{errors.phone}</span>}
                      </div>
                      <div className="co-field co-field--full">
                        <label>Email (nhận vé điện tử)</label>
                        <div className={`co-input-wrap ${errors.email ? 'has-err' : ''}`}>
                          <Mail size={16} />
                          <input value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} placeholder="email@example.com" />
                        </div>
                        {errors.email && <span className="co-err">{errors.email}</span>}
                      </div>
                    </div>
                  </section>
                </>
              )}

              {step === 2 && (
                <>
                  <button className="co-back" onClick={() => setStep(1)}><ChevronLeft size={16} /> Quay lại chi tiết</button>

                  <div className="co-hold">
                    <div className="co-hold__icon"><Clock size={18} /></div>
                    <div className="co-hold__text">
                      <strong>Đang giữ vé cho bạn</strong>
                      <span>Hoàn tất thanh toán trong <b>{fmtCountdown}</b></span>
                    </div>
                    <div className="co-hold__bar"><span style={{ width: `${countdownPct}%` }} /></div>
                  </div>

                  <section className="co-card">
                    <div className="co-card__head"><span className="co-card__ic"><CreditCard size={18} /></span><h2>Chọn phương thức thanh toán</h2></div>
                    {errors.method && <div className="co-err-banner">{errors.method}</div>}

                    {PAYMENT_GROUPS.map(g => (
                      <div key={g.group} className="co-pay-group">
                        <div className="co-pay-group__title">
                          {g.icon === 'wallet' ? <Wallet size={14} /> : <CreditCard size={14} />}
                          {g.group}
                        </div>
                        {g.methods.map(m => (
                          <label key={m.id} className={`co-pay-opt ${method === m.id ? 'is-selected' : ''}`}>
                            <input type="radio" name="pay" checked={method === m.id} onChange={() => { setMethod(m.id); setErrors({}) }} />
                            <PayBadge id={m.id} size="lg" />
                            <div className="co-pay-opt__text">
                              <strong>
                                {m.name}
                                {m.tag && <span className="co-pay-opt__tag">{m.tag}</span>}
                              </strong>
                              <span>{m.desc}</span>
                              {m.promo && <span className="co-pay-opt__promo"><Tag size={11} /> {m.promo}</span>}
                            </div>
                            <span className="co-pay-opt__radio" />
                          </label>
                        ))}
                      </div>
                    ))}

                    <div className="co-pay-logos">
                      {ALL_METHODS.map(m => <PayBadge key={m.id} id={m.id} size="sm" />)}
                    </div>
                  </section>

                  {selectedMethod?.ui === 'qr' && (
                    <section className="co-card co-qr">
                      <div className="co-card__head"><span className="co-card__ic"><QrCode size={18} /></span><h2>Quét mã để thanh toán</h2></div>
                      <div className="co-qr__body">
                        <div className="co-qr__left">
                          <div className="co-qr__frame" style={{ '--qr-accent': selectedMethod.color }}>
                            <FakeQR
                              seed={`${method}-${totals.total}`}
                              size={196}
                              accent={selectedMethod.color}
                              logo={<PayBadge id={method} size="md" />}
                            />
                            <span className="co-qr__scanline" />
                          </div>
                          <button className="co-qr__refresh" onClick={() => setCountdown(599)}>
                            <RotateCw size={14} /> Tạo mã mới
                          </button>
                        </div>

                        <div className="co-qr__side">
                          <div className="co-qr__amount">
                            <span>Số tiền cần thanh toán</span>
                            <strong style={{ color: selectedMethod.color }}>{formatVND(totals.total)}</strong>
                          </div>
                          <div className="co-qr__timer"><Clock size={15} /> Mã QR hết hạn sau <b>{fmtCountdown}</b></div>

                          {method === 'bank' && (
                            <div className="co-bank">
                              <div className="co-bank__row">
                                <span>Ngân hàng</span><b>{selectedMethod.bankName}</b>
                              </div>
                              <div className="co-bank__row">
                                <span>Số tài khoản</span>
                                <b className="co-bank__copy" onClick={() => copyText(selectedMethod.accountNo.replace(/\s/g, ''), 'acc')}>
                                  {selectedMethod.accountNo} <Copy size={13} />
                                  {copied === 'acc' && <em>Đã chép</em>}
                                </b>
                              </div>
                              <div className="co-bank__row">
                                <span>Chủ tài khoản</span><b>{selectedMethod.accountName}</b>
                              </div>
                            </div>
                          )}

                          <ol className="co-qr__steps">
                            <li><Smartphone size={14} /> Mở app <b>{selectedMethod.app}</b></li>
                            <li><ScanLine size={14} /> Chọn “Quét mã QR” &amp; quét mã bên cạnh</li>
                            <li><BadgeCheck size={14} /> Xác nhận thanh toán <b>{formatVND(totals.total)}</b></li>
                          </ol>

                          {selectedMethod.banks && (
                            <div className="co-qr__banks">
                              <span className="co-qr__banks-lbl">Hỗ trợ:</span>
                              {selectedMethod.banks.slice(0, 6).map(b => <span key={b} className="co-bankchip">{b}</span>)}
                            </div>
                          )}

                          <p className="co-qr__note"><Info size={12} /> Môi trường mô phỏng — nhấn nút bên dưới để hoàn tất thanh toán.</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {selectedMethod?.ui === 'card' && (
                    <section className="co-card">
                      <div className="co-card__head"><span className="co-card__ic"><CreditCard size={18} /></span><h2>Thông tin thẻ</h2></div>

                      <div className="co-cardpay">
                        <CardPreview
                          number={card.number} name={card.name} exp={card.exp} cvv={card.cvv}
                          flipped={cardFlipped}
                        />

                        <div className="co-form">
                          <div className="co-field co-field--full">
                            <label>Số thẻ *</label>
                            <div className={`co-input-wrap ${errors.cardNumber ? 'has-err' : ''}`}>
                              <CreditCard size={16} />
                              <input
                                inputMode="numeric" maxLength={19} placeholder="0000 0000 0000 0000"
                                value={card.number}
                                onFocus={() => setCardFlipped(false)}
                                onChange={e => setCard({ ...card, number: e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim() })}
                              />
                            </div>
                            {errors.cardNumber && <span className="co-err">{errors.cardNumber}</span>}
                          </div>
                          <div className="co-field co-field--full">
                            <label>Tên chủ thẻ *</label>
                            <div className={`co-input-wrap ${errors.cardName ? 'has-err' : ''}`}>
                              <User size={16} />
                              <input placeholder="NGUYEN VAN A" value={card.name}
                                onFocus={() => setCardFlipped(false)}
                                onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })} />
                            </div>
                            {errors.cardName && <span className="co-err">{errors.cardName}</span>}
                          </div>
                          <div className="co-field">
                            <label>Ngày hết hạn *</label>
                            <div className={`co-input-wrap ${errors.cardExp ? 'has-err' : ''}`}>
                              <Calendar size={16} />
                              <input placeholder="MM/YY" maxLength={5} value={card.exp}
                                onFocus={() => setCardFlipped(false)}
                                onChange={e => { let v = e.target.value.replace(/[^\d]/g, ''); if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2, 4); setCard({ ...card, exp: v }) }} />
                            </div>
                            {errors.cardExp && <span className="co-err">{errors.cardExp}</span>}
                          </div>
                          <div className="co-field">
                            <label>CVV *</label>
                            <div className={`co-input-wrap ${errors.cardCvv ? 'has-err' : ''}`}>
                              <Lock size={16} />
                              <input placeholder="123" maxLength={4} inputMode="numeric" value={card.cvv}
                                onFocus={() => setCardFlipped(true)}
                                onBlur={() => setCardFlipped(false)}
                                onChange={e => setCard({ ...card, cvv: e.target.value.replace(/[^\d]/g, '') })} />
                            </div>
                            {errors.cardCvv && <span className="co-err">{errors.cardCvv}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="co-installment">
                        <Zap size={14} /> Hỗ trợ <b>trả góp 0%</b> qua thẻ tín dụng — kỳ hạn 3/6/12 tháng (tuỳ ngân hàng).
                      </div>
                    </section>
                  )}

                  <div className="co-trust">
                    <span><ShieldCheck size={15} /> Bảo mật SSL</span>
                    <span><Lock size={15} /> Mã hoá 256-bit</span>
                    <span><BadgeCheck size={15} /> Chuẩn PCI DSS</span>
                  </div>
                </>
              )}
            </div>

            <aside className="co-summary">
              <div className="co-summary__card">
                <h3><Ticket size={17} /> Tóm tắt đơn hàng</h3>

                <div className="co-sum-list">
                  {items.map(it => (
                    <div key={it.destId} className="co-sum-row">
                      <span className="co-sum-row__left">
                        <span className="co-sum-row__name">{it.title}</span>
                        <span className="co-sum-row__qty">×{itemTicketCount(it)}</span>
                      </span>
                      <span className="co-sum-row__val">{itemTotal(it) === 0 ? 'Miễn phí' : formatVND(itemTotal(it))}</span>
                    </div>
                  ))}
                </div>

                <div className="co-sum-divider" />

                <div className="co-promo">
                  <div className={`co-input-wrap ${errors.promo ? 'has-err' : ''}`} style={{ flex: 1 }}>
                    <Tag size={15} />
                    <input placeholder="Mã giảm giá (SMART10)" value={promo}
                      onChange={e => { setPromo(e.target.value); setErrors(x => ({ ...x, promo: '' })) }} disabled={promoApplied} />
                  </div>
                  <button className="co-promo__btn" onClick={applyPromo} disabled={promoApplied}>
                    {promoApplied ? 'Đã áp dụng' : 'Áp dụng'}
                  </button>
                </div>
                {errors.promo && <span className="co-err" style={{ marginTop: 6, display: 'block' }}>{errors.promo}</span>}
                {promoApplied && <span className="co-promo__ok"><Check size={13} /> Đã giảm 10% với mã SMART10</span>}

                <div className="co-sum-divider" />

                <div className="co-sum-line"><span>Tạm tính ({totalTickets} vé)</span><span>{formatVND(totals.subtotal)}</span></div>
                {totals.combo > 0 && <div className="co-sum-line co-sum-line--off"><span>Ưu đãi combo lịch trình</span><span>−{formatVND(totals.combo)}</span></div>}
                {totals.promoOff > 0 && <div className="co-sum-line co-sum-line--off"><span>Mã giảm giá SMART10</span><span>−{formatVND(totals.promoOff)}</span></div>}
                <div className="co-sum-line"><span>Phí dịch vụ</span><span>{totals.fee === 0 ? 'Miễn phí' : formatVND(totals.fee)}</span></div>

                {totals.discount > 0 && (
                  <div className="co-saving"><Sparkles size={14} /> Bạn tiết kiệm được <b>{formatVND(totals.discount)}</b></div>
                )}

                <div className="co-sum-total">
                  <span>Tổng cộng</span>
                  <strong>{formatVND(totals.total)}</strong>
                </div>

                {step === 1
                  ? <button className="btn co-cta" onClick={goStep2}>Tiếp tục thanh toán <ArrowRight size={17} /></button>
                  : <button className="btn co-cta" onClick={handlePay}>
                      <Lock size={15} />
                      {selectedMethod?.ui === 'qr' ? 'Tôi đã hoàn tất thanh toán' : `Thanh toán ${formatVND(totals.total)}`}
                    </button>}

                <div className="co-secure"><ShieldCheck size={14} /> Giao dịch được mã hoá &amp; bảo mật</div>
              </div>
            </aside>
          </div>
        )}

        {step === 3 && doneOrder && (
          <div className="co-success">
            <div className="co-confetti" aria-hidden>
              {Array.from({ length: 42 }).map((_, i) => {
                const colors = ['#0F4C75', '#3ABFF8', '#D94F57', '#22C55E', '#F59E0B', '#7DD3FC']
                const st = {
                  left: `${(i * 2.38) % 100}%`,
                  background: colors[i % colors.length],
                  animationDelay: `${(i % 10) * 0.12}s`,
                  animationDuration: `${2.6 + (i % 5) * 0.4}s`,
                  transform: `rotate(${i * 32}deg)`,
                }
                return <i key={i} style={st} />
              })}
            </div>

            <div className="co-success__head">
              <div className="co-success__badge"><Check size={40} strokeWidth={3} /></div>
              <h1>Đặt vé thành công!</h1>
              <p>Vé điện tử đã được gửi đến <b>{doneOrder.contact?.email || 'email của bạn'}</b></p>
            </div>

            <div className="co-ticket" id="co-eticket">
              <span className="co-ticket__ribbon"><BadgeCheck size={13} /> ĐÃ THANH TOÁN</span>
              <div className="co-ticket__stub">
                <div className="co-ticket__brand"><Sparkles size={15} /> SMART TRAVEL · E-TICKET</div>
                <div className="co-ticket__main">
                  <div className="co-ticket__qr">
                    <FakeQR seed={doneOrder.code} size={132} accent="#0F4C75" />
                  </div>
                  <div className="co-ticket__info">
                    <div className="co-ticket__place">
                      {doneOrder.items[0]?.title}
                      {doneOrder.items.length > 1 ? ` +${doneOrder.items.length - 1} địa điểm` : ''}
                    </div>
                    <div className="co-ticket__grid">
                      <div>
                        <span>Mã đặt chỗ</span>
                        <b className="co-ticket__code" onClick={() => copyText(doneOrder.code, 'code')}>
                          {doneOrder.code} <Copy size={12} />{copied === 'code' && <em>Đã chép</em>}
                        </b>
                      </div>
                      <div><span>Ngày tham quan</span><b>{doneOrder.visitDate}</b></div>
                      <div><span>Số vé</span><b>{doneOrder.items.reduce((s, it) => s + itemTicketCount(it), 0)} vé</b></div>
                      <div><span>Thanh toán qua</span><b>{getMethod(doneOrder.method)?.name}</b></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="co-ticket__perf" />

              <div className="co-ticket__foot">
                <div className="co-ticket__status"><CheckCircle2 size={16} /> Giao dịch hoàn tất</div>
                <div className="co-ticket__total">
                  <span>Tổng cộng</span>
                  <strong>{formatVND(doneOrder.total)}</strong>
                </div>
              </div>
            </div>

            <div className="co-success__actions">
              <button className="btn co-success__primary" onClick={() => navigate('/orders')}>
                <Ticket size={16} /> Xem đơn đã mua
              </button>
              <button className="btn btn-outline" onClick={() => window.print()}>
                <Printer size={16} /> In / Lưu vé
              </button>
              <button className="btn btn-outline" onClick={() => { clearPending(); navigate('/') }}>Về trang chủ</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
