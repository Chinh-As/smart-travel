import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../context/TripContext.jsx'
import { destinations } from '../../data/mockData.js'
import SearchCard from '../../components/SearchCard/SearchCard.jsx'
import './Favorites.css'

export default function Favorites({ asTab = false }) {
  const { favorites, toggleFavorite } = useTrip()
  const navigate = useNavigate()
  const [favDests, setFavDests] = useState([])

  useEffect(() => {
    async function loadFavorites() {
      if (!favorites || favorites.length === 0) {
        setFavDests([]);
        return;
      }
      try {
        const { fetchDestinationById } = await import('../../services/recommendationApi.js');
        const { transformPlaceToDestination } = await import('../../services/dataTransformers.js');
        
        const promises = favorites.map(id => fetchDestinationById(id));
        const results = await Promise.allSettled(promises);
        const valid = results
          .filter(r => r.status === 'fulfilled' && r.value)
          .map(r => transformPlaceToDestination(r.value));
        
        if (valid.length > 0) {
          setFavDests(valid);
        } else {
          throw new Error('No valid API results');
        }
      } catch (err) {
        console.error('API failed, fallback to mock', err);
        const mockFavs = destinations.filter(d => favorites.includes(d.id) || favorites.includes(String(d.id)));
        setFavDests(mockFavs);
      }
    }
    loadFavorites();
  }, [favorites]);

  return (
    <div className={asTab ? "fav-tab" : "fav-page"}>
      <div className={asTab ? "" : "container"}>
        {!asTab && (
          <div className="fav-page__header">
            <h1 className="fav-page__title">❤️ Danh mục yêu thích</h1>
            <button className="btn btn-green" onClick={() => navigate('/search')}>+ Thêm địa điểm</button>
          </div>
        )}

        {favDests.length === 0 ? (
          <div className="fav-empty">
            <div className="fav-empty__icon">🤍</div>
            <h3>Chưa có địa điểm yêu thích</h3>
            <p>Nhấn nút ❤️ trên thẻ địa điểm để thêm vào danh sách yêu thích</p>
            <button className="btn btn-purple" onClick={() => navigate('/search')}>Tìm kiếm địa điểm</button>
          </div>
        ) : (
          <div className="fav-grid">
            {favDests.map((d, i) => (
              <div key={d.id} className="fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <SearchCard destination={d} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
