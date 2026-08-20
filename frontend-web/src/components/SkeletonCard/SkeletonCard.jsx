import React from 'react'
import './SkeletonCard.css'

export function SkeletonCard() {
  return (
    <div className="sk-card" aria-hidden="true">
      <div className="skeleton sk-card__img" />
      <div className="sk-card__body">
        <div className="skeleton sk-card__title" />
        <div className="skeleton sk-card__title sk-card__title--s" />
        <div className="sk-card__row">
          <div className="skeleton sk-card__stars" />
          <div className="skeleton sk-card__badge" />
        </div>
        <div className="skeleton sk-card__line" />
        <div className="skeleton sk-card__line sk-card__line--s" />
        <div className="skeleton sk-card__btn" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="sk-grid" role="status" aria-label="Đang tải...">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export default SkeletonCard
