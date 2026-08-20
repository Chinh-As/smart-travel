/**
 * Review.jsx — Post-trip rating & review screen
 * Stars, comment tags, free text, "start new trip" + next suggestion
 */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { destinations, reviewTags } from '../../data/mockData.js'
import { useTrip } from '../../context/TripContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { apiSubmitReview } from '../../services/reviewApi.js'
import './Review.css'

export default function Review() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { resetTrip } = useTrip()
  const { isLoggedIn } = useAuth()
  
  const [dest, setDest] = useState(null)
  const [nextDest, setNextDest] = useState(null)
  const [loading, setLoading] = useState(true)

  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [selectedTags, setSelectedTags] = useState([])
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const { fetchDestinationById, searchDestinations } = await import('../../services/recommendationApi.js');
        const { transformPlaceToDestination, transformPlacesToDestinations } = await import('../../services/dataTransformers.js');
        
        const data = await fetchDestinationById(id);
        if (data) {
          const transformed = transformPlaceToDestination(data);
          setDest(transformed);
          
          // Next dest suggestion based on same category
          const searchData = await searchDestinations({ category: data.category || '', limit: 3 });
          const related = transformPlacesToDestinations(searchData.results);
          const next = related.find(r => String(r.id) !== String(id)) || related[0];
          setNextDest(next);
        }
      } catch (err) {
        console.error('API failed', err);
        const mockDest = destinations.find(d => String(d.id) === String(id));
        setDest(mockDest || null);
        setNextDest(destinations.find(d => String(d.id) !== String(id)) || destinations[1]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const toggleTag = (tag) => {
    setSelectedTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag])
  }

  const handleSubmit = async () => {
    if (stars === 0 || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await apiSubmitReview(id, { rating: stars, tags: selectedTags, comment })
      setSubmitted(true)
    } catch (err) {
      if (err.status === 409) {
        setSubmitError('Bạn đã đánh giá địa điểm này rồi.')
      } else {
        setSubmitError('Gửi đánh giá thất bại. Vui lòng thử lại.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleNewTrip = () => { resetTrip(); navigate('/') }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>

  if (!dest) return <div style={{ padding: 40, textAlign: 'center' }}><button onClick={() => navigate('/')}>Về trang chủ</button></div>

  return (
    <div className="review-page">
      <div className="review-page__bg">
        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&h=900&fit=crop" alt="" />
        <div className="review-page__overlay" />
      </div>

      <div className="review-page__inner">
        <div className="review-card-main">
          {/* Header */}
          <div className="review-page__header">
            <h1 className="review-page__title">ĐÁNH GIÁ CHUYẾN THAM QUAN</h1>
          </div>

          <h2 className="review-page__dest-name">{dest.title}</h2>

          {!submitted ? (
            <div className="review-form">
              <div className="review-form__cols">
                {/* Stars */}
                <div className="review-form__stars-box">
                  <div className="review-form__box-title">Mức độ hài lòng</div>
                  <div className="review-stars">
                    {[1,2,3,4,5].map(i => (
                      <button
                        key={i}
                        className={`review-star ${i <= (hovered || stars) ? 'active' : ''}`}
                        onClick={() => setStars(prev => prev === i ? 0 : i)}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(0)}
                      >★</button>
                    ))}
                  </div>
                  {stars > 0 && (
                    <div className="review-stars__label">
                      {['','Tệ','Không hay','Bình thường','Tốt','Tuyệt vời!'][stars]}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="review-form__tags-box">
                  <div className="review-form__box-title">Nhận xét</div>
                  <div className="review-tags">
                    {reviewTags.map(tag => (
                      <button
                        key={tag}
                        className={`review-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {selectedTags.includes(tag) && '✓ '}{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment */}
              <textarea
                className="review-comment"
                placeholder="Thêm nhận xét của bạn..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
              />

              <div className="review-form__actions">
                {submitError && (
                  <p className="review-submit-error">{submitError}</p>
                )}
                {isLoggedIn ? (
                  <button
                    className="btn btn-primary review-submit"
                    onClick={handleSubmit}
                    disabled={stars === 0 || submitting}
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary review-submit"
                    onClick={() => navigate('/login')}
                  >
                    Đăng nhập để đánh giá
                  </button>
                )}
                <button className="review-skip-btn" onClick={handleNewTrip}>
                  Bỏ qua & bắt đầu chuyến mới
                </button>
              </div>
            </div>
          ) : (
            <div className="review-success fade-in">
              <div className="review-success__icon">✅</div>
              <p className="review-success__msg">Cảm ơn bạn đã đánh giá!</p>
              
              <button className="btn btn-primary review-newtrip-btn" onClick={handleNewTrip}>
                🔄 Bắt đầu một chuyến đi mới
              </button>
            </div>
          )}
        </div>

        {/* Next destination suggestion */}
        {nextDest && (
          <div className="review-next fade-in-up" onClick={() => navigate(`/destination/${nextDest.id}`)}>
            <img src={nextDest.image} alt={nextDest.title} className="review-next__img" />
            <div className="review-next__info">
              <div className="review-next__label">GỢI Ý CHẶNG TIẾP THEO</div>
              <div className="review-next__name">{nextDest.title}</div>
            </div>
            <div className="review-next__dist">
              <span>📍</span>
              <span>{nextDest.distance} km</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
