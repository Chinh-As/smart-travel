import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../context/TripContext.jsx'
import './SearchCard.css'

export default function SearchCard({ destination }) {
  const [imgErr, setImgErr] = useState(false)
  const navigate = useNavigate()
  const { toggleFavorite, isFavorite, addToItinerary, removeFromItinerary, itinerary } = useTrip()
  const wished = isFavorite(destination.id)
  const isAdded = itinerary.some(d => d.id === destination.id)

  const { id, title, location, price, priceLabel, originalPrice, discount, rating, suitability, openHours, image, category, overview, description } = destination
  const descText = overview || description || ''
  const fmtPrice = (p) => p === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN').format(p) + 'đ'
  const stars = (r) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.round(r) ? 'star-filled' : 'star-empty'}>★</span>
  ))
  
  const getCategoryFallback = (cat) => {
    if (!cat) return 'landscape';
    const c = cat.toLowerCase();
    if (c.includes('sight') || c.includes('cảnh') || c.includes('quan') || c.includes('landscape')) return 'landscape';
    if (c.includes('hist') || c.includes('lịch') || c.includes('sử') || c.includes('văn') || c.includes('hóa') || c.includes('culture') || c.includes('museum') || c.includes('bảo tàng')) return 'history_culture';
    if (c.includes('beach') || c.includes('biển') || c.includes('resort') || c.includes('nghỉ dưỡng')) return 'beach_resort';
    if (c.includes('culinary') || c.includes('ẩm thực') || c.includes('food') || c.includes('ăn') || c.includes('restaurant') || c.includes('nhà hàng') || c.includes('cafe') || c.includes('café')) return 'culinary';
    if (c.includes('entertainment') || c.includes('giải trí') || c.includes('park') || c.includes('công viên')) return 'entertainment';
    if (c.includes('shop') || c.includes('mua sắm')) return 'shopping';
    if (c.includes('nature') || c.includes('thiên nhiên') || c.includes('forest') || c.includes('núi')) return 'nature';
    if (c.includes('spiritual') || c.includes('tâm linh') || c.includes('chùa') || c.includes('đền')) return 'spiritual';
    return 'landscape';
  }
  const fallback = `/assets/fallback/${getCategoryFallback(category)}.svg`

  return (
    <article className="scard" onClick={() => navigate(`/destination/${id}`)}>
      <div className="scard__img-wrap">
        {discount > 0 && <div className="scard__discount">-{discount}%</div>}
        <button
          className={`scard__wish ${wished ? 'wished' : ''}`}
          onClick={e => { e.stopPropagation(); toggleFavorite(id) }}
          title={wished ? 'Xóa yêu thích' : 'Thêm yêu thích'}
        >
          {wished ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 018 4a3.5 3.5 0 015.5 3c0 3.5-5.5 7-5.5 7z"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 018 4a3.5 3.5 0 015.5 3c0 3.5-5.5 7-5.5 7z" stroke="currentColor" strokeWidth="1.5"/></svg>
          )}
        </button>
        <img className="scard__img" src={imgErr ? fallback : image} alt={title} onError={() => setImgErr(true)} loading="lazy" />
        <div className="scard__price-wrap">
          {originalPrice && <span className="scard__price-orig">{fmtPrice(originalPrice)}</span>}
          <span className="scard__price">{priceLabel || fmtPrice(price)}</span>
        </div>
      </div>
      <div className="scard__body">
        <h3 className="scard__title">{title}</h3>
        {descText && <p className="scard__desc">{descText}</p>}
        <div className="scard__meta">
          <div className="stars">{stars(rating)}<span className="scard__rating">{rating}</span></div>
          <span className="scard__suit">Phù hợp: <strong>{suitability}%</strong></span>
        </div>
        <div className="scard__info">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 3.5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span>Giờ mở cửa <strong>{openHours}</strong></span>
        </div>
        <div className="scard__info">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1C4.5 1 3 2.7 3 4.8 3 8 6.5 12 6.5 12s3.5-4 3.5-7.2C10 2.7 8.5 1 6.5 1z" stroke="currentColor" strokeWidth="1.2"/><circle cx="6.5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
          <span className="scard__loc">{location}</span>
        </div>
        <div className="scard__btns">
          <button className="scard__cta" onClick={e => { e.stopPropagation(); navigate(`/destination/${id}`) }}>Xem chi tiết</button>
          {isAdded ? (
            <button className="scard__add added" onClick={e => { e.stopPropagation(); removeFromItinerary(id) }} title="Xóa khỏi lịch trình">
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ) : (
            <button className="scard__add" onClick={e => { e.stopPropagation(); addToItinerary(destination) }} title="Thêm vào lịch trình">
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
