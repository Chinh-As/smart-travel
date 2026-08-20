/**
 * TripContext — Global state for active trip, favorites, itinerary
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { destinations } from '../data/mockData.js'
import { useAuth } from './AuthContext.jsx'
import { itineraryService } from '../services/itineraryService.js'
import { transformPlaceToDestination } from '../services/dataTransformers.js'
import { apiGetFavorites, apiAddFavorite, apiRemoveFavorite } from '../services/favoriteApi.js'

const TripContext = createContext(null)

export function TripProvider({ children }) {
  const [activeTrip, setActiveTrip] = useState(() => {
    try { const saved = localStorage.getItem('activeTrip'); return saved ? JSON.parse(saved) : null; } catch { return null; }
  })
  const [tripStarted, setTripStarted] = useState(() => {
    try { const saved = localStorage.getItem('tripStarted'); return saved ? JSON.parse(saved) : false; } catch { return false; }
  })
  const [favorites, setFavorites] = useState([])

  const [itinerary, setItinerary] = useState(() => {
    try { const saved = localStorage.getItem('itinerary'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  })
  const itineraryIdRef = useRef(null)     // database ID of saved itinerary
  const [userLocation, setUserLocation] = useState(null)   // { lat, lng, address }
  
  const { isLoggedIn, user, authLoading } = useAuth()
  const initialLoadDone = useRef(false)
  const loadFailed = useRef(false)

  // Sync state to localStorage
  useEffect(() => { localStorage.setItem('activeTrip', JSON.stringify(activeTrip)); }, [activeTrip]);
  useEffect(() => { localStorage.setItem('tripStarted', JSON.stringify(tripStarted)); }, [tripStarted]);
  // Persist favorites to localStorage to keep cache
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => { localStorage.setItem('itinerary', JSON.stringify(itinerary)); }, [itinerary]);

  // Load user's saved itinerary on initialization
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish before deciding
    console.log('[TripContext] authLoading changed. isLoggedIn:', isLoggedIn);
    if (isLoggedIn) {
      initialLoadDone.current = false;
      loadFailed.current = false;
      console.log('[TripContext] Fetching itineraries for logged in user...');
      itineraryService.getUserItineraries()
        .then(list => {
          console.log('[TripContext] Loaded itineraries from DB:', list);
          if (list && list.length > 0) {
            const active = list[0];
            console.log('[TripContext] Active itinerary found. ID:', active.id);
            itineraryIdRef.current = active.id;
            const flatItems = [];
            active.days.forEach(day => {
              day.items.forEach(item => {
                if (item.place) {
                  const dest = transformPlaceToDestination(item.place);
                  flatItems.push({
                    ...dest,
                    day: day.dayIndex,
                    timeSlot: item.timeSlot,
                    startTime: item.startTime,
                    endTime: item.endTime,
                    note: item.note || '',
                  });
                }
              });
            });
            console.log('[TripContext] Setting itinerary state to:', flatItems);
            setItinerary(flatItems);
          } else {
            console.log('[TripContext] No saved itineraries found. Resetting state.');
            itineraryIdRef.current = null;
            setItinerary([]);
          }
          initialLoadDone.current = true;
        })
        .catch(err => {
          console.error('[TripContext] Failed to load user itineraries from DB', err);
          loadFailed.current = true;
        });
    } else {
      console.log('[TripContext] User logged out. Clearing itinerary state.');
      itineraryIdRef.current = null;
      setItinerary([]);
      initialLoadDone.current = false;
      loadFailed.current = false;
    }
  }, [isLoggedIn, authLoading]);

  // Load user's saved favorites on initialization
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish before deciding
    if (isLoggedIn) {
      console.log('[TripContext] Loading favorites for user...');
      apiGetFavorites()
        .then(list => {
          console.log('[TripContext] Loaded favorites from DB:', list);
          if (list && list.length > 0) {
            const backendFavs = list.map(fav => fav.placeId);
            console.log('[TripContext] Setting favorites from backend:', backendFavs);
            setFavorites(backendFavs);
          } else {
            console.log('[TripContext] No favorites in backend, clearing state.');
            setFavorites([]);
          }
        })
        .catch(err => {
          console.error('[TripContext] Failed to load user favorites from DB', err);
          // Fallback to localStorage
          const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
          if (localFavs.length > 0) {
            console.log('[TripContext] DB load failed, using localStorage:', localFavs);
            setFavorites(localFavs);
          }
        });
    } else {
      // Don't clear localStorage here — keep it for next login fallback
      console.log('[TripContext] User logged out. Clearing favorites state (keeping localStorage).');
      setFavorites([]);
    }
  }, [isLoggedIn, authLoading]);

  // Sync itinerary changes back to database
  useEffect(() => {
    console.log('[TripContext] Sync trigger. isLoggedIn:', isLoggedIn, 'initialLoadDone:', initialLoadDone.current, 'loadFailed:', loadFailed.current, 'itinerary:', itinerary);
    if (!isLoggedIn || !initialLoadDone.current || loadFailed.current || authLoading) {
      console.log('[TripContext] Sync conditions not met. Skipping sync.');
      return;
    }

    const sync = async () => {
      try {
        const items = itinerary.map(item => ({
          placeId: item.id,
          dayIndex: item.day || 1,
          startTime: item.startTime || '08:00',
          endTime: item.endTime || '10:30',
          note: item.note || '',
        }));
        const payload = {
          title: 'Lịch trình của tôi',
          items,
        };
        console.log('[TripContext] Syncing itinerary to DB. Payload:', payload);
        const saved = itineraryIdRef.current
          ? await itineraryService.updateItinerary(itineraryIdRef.current, payload)
          : await itineraryService.saveItinerary(payload);
        console.log('[TripContext] Sync success. Saved response:', saved);
        if (saved && !itineraryIdRef.current) {
          console.log('[TripContext] Sync set new itineraryId:', saved.id);
          itineraryIdRef.current = saved.id;
        }
      } catch (err) {
        console.error('[TripContext] Failed to sync itinerary to DB', err);
      }
    };

    const timer = setTimeout(sync, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [itinerary, isLoggedIn]);

  // Get real device location
  const getLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        // fallback to HCMC center
        const fallback = { lat: 10.7769, lng: 106.7009, address: 'TP. Hồ Chí Minh (mô phỏng)' }
        setUserLocation(fallback)
        resolve(fallback)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, address: 'Vị trí hiện tại của bạn' }
          setUserLocation(loc)
          resolve(loc)
        },
        () => {
          // permission denied or error — use HCMC fallback
          const fallback = { lat: 10.7769, lng: 106.7009, address: 'TP. Hồ Chí Minh (mô phỏng)' }
          setUserLocation(fallback)
          resolve(fallback)
        }
      )
    })
  }, [])

  const startTrip = useCallback(async (destination) => {
    const loc = await getLocation()
    setActiveTrip(destination)
    setTripStarted(true)
    return loc
  }, [getLocation])

  const endTrip = useCallback(() => {
    setTripStarted(false)
  }, [])

  const resetTrip = useCallback(() => {
    setActiveTrip(null)
    setTripStarted(false)
  }, [])

  const toggleFavorite = useCallback(async (destId) => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để lưu địa điểm yêu thích!');
      return;
    }

    const isFav = favorites.includes(destId);
    console.log('[TripContext] toggleFavorite:', destId, 'isFav:', isFav);
    
    // Optimistic UI update
    setFavorites(prev =>
      isFav ? prev.filter(id => id !== destId) : [...prev, destId]
    );

    try {
      if (isFav) {
        console.log('[TripContext] Removing favorite from DB:', destId);
        await apiRemoveFavorite(destId);
        console.log('[TripContext] Remove favorite success');
      } else {
        console.log('[TripContext] Adding favorite to DB:', destId);
        await apiAddFavorite(destId);
        console.log('[TripContext] Add favorite success');
      }
    } catch (error) {
      console.error('[TripContext] Failed to toggle favorite', error);
      // Revert on failure
      setFavorites(prev =>
        isFav ? [...prev, destId] : prev.filter(id => id !== destId)
      );
      alert('Có lỗi xảy ra khi lưu yêu thích!');
    }
  }, [favorites, isLoggedIn]);

  const isFavorite = useCallback((destId) => favorites.includes(destId), [favorites])

  const addToItinerary = useCallback((dest, timeSlot, day) => {
    setItinerary(prev => {
      if (prev.find(d => d.id === dest.id)) return prev
      // Auto-assign day and time slot if not provided
      const autoDay = day || 1
      const slotsInDay = prev.filter(d => (d.day || 1) === autoDay)
      const slotIds = ['MORNING', 'NOON', 'AFTERNOON', 'EVENING']
      const autoSlot = timeSlot || slotIds[slotsInDay.length % slotIds.length]
      const defaults = {
        MORNING:   { startTime: '08:00', endTime: '10:30' },
        NOON:      { startTime: '11:30', endTime: '13:00' },
        AFTERNOON: { startTime: '14:00', endTime: '16:30' },
        EVENING:   { startTime: '18:00', endTime: '20:00' },
      }
      return [...prev, {
        ...dest,
        addedAt: new Date().toISOString(),
        note: '',
        day: autoDay,
        timeSlot: autoSlot,
        startTime: defaults[autoSlot].startTime,
        endTime: defaults[autoSlot].endTime,
      }]
    })
  }, [])

  const removeFromItinerary = useCallback((destId) => {
    setItinerary(prev => prev.filter(d => d.id !== destId))
  }, [])

  const updateItineraryNote = useCallback((destId, note) => {
    setItinerary(prev => prev.map(d => d.id === destId ? { ...d, note } : d))
  }, [])

  const updateItineraryItem = useCallback((destId, updates) => {
    setItinerary(prev => prev.map(d => d.id === destId ? { ...d, ...updates } : d))
  }, [])

  const removeDayFromItinerary = useCallback((dayNum) => {
    setItinerary(prev => {
      const filtered = prev.filter(d => (d.day || 1) !== dayNum)
      return filtered.map(d => {
        const dDay = d.day || 1
        if (dDay > dayNum) return { ...d, day: dDay - 1 }
        return d
      })
    })
  }, [])

  return (
    <TripContext.Provider value={{
      activeTrip, tripStarted, favorites, itinerary, userLocation,
      startTrip, endTrip, resetTrip,
      toggleFavorite, isFavorite,
      addToItinerary, removeFromItinerary, updateItineraryNote, updateItineraryItem, removeDayFromItinerary,
      getLocation,
    }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be inside TripProvider')
  return ctx
}
