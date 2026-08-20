import { getAccessToken } from '../../context/AuthContext.jsx';

const API_BASE_URL = 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const adminDestinationService = {
  getAllDestinations: async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/places/search?size=1000`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch destinations');
    const data = await res.json();
    return data.content.map(p => ({
      id: p.id,
      name: p.name,
      location: p.address || 'Vietnam',
      category: p.categories && p.categories.length > 0 ? p.categories[0] : 'Chung',
      categoryIds: p.categoryIds || [],
      status: 'Hoạt động',
      rating: p.rating || 0.0,
      image: p.mainImageUrl || 'https://via.placeholder.com/150',
      description: p.description || '',
      lng: p.lng,
      lat: p.lat
    }));
  },
  
  getDestinationById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/places/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch destination details');
    const p = await res.json();
    return {
      id: p.id,
      name: p.name,
      location: p.address || 'Vietnam',
      category: p.categories && p.categories.length > 0 ? p.categories[0] : 'Chung',
      categoryIds: p.categoryIds || [],
      status: 'Hoạt động',
      rating: p.rating || 0.0,
      image: p.mainImageUrl || 'https://via.placeholder.com/150',
      description: p.description || '',
      lng: p.lng,
      lat: p.lat
    };
  },
  
  createDestination: async (data) => {
    const body = {
      name: data.name,
      description: data.description || '',
      address: data.location || '',
      lng: data.lng || 106.681,
      lat: data.lat || 10.763,
      mainImageUrl: data.image || '',
      wheelchairAccess: data.wheelchairAccess || false,
      rawOpeningHours: data.rawOpeningHours || '08:00 - 22:00',
      categoryIds: data.categoryIds || [],
      rating: data.rating || 0.0,
      reviewCount: data.reviewCount || 0,
      priceLevel: data.priceLevel || 'medium'
    };
    
    const res = await fetch(`${API_BASE_URL}/api/v1/places`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create destination');
    }
    const p = await res.json();
    return {
      id: p.id,
      name: p.name,
      location: p.address || 'Vietnam',
      category: p.categories && p.categories.length > 0 ? p.categories[0] : 'Chung',
      categoryIds: p.categoryIds || [],
      status: 'Hoạt động',
      rating: p.rating || 0.0,
      image: p.mainImageUrl || 'https://via.placeholder.com/150',
      description: p.description || '',
      lng: p.lng,
      lat: p.lat
    };
  },
  
  updateDestination: async (id, data) => {
    const body = {
      name: data.name,
      description: data.description || '',
      address: data.location || '',
      lng: data.lng || 106.681,
      lat: data.lat || 10.763,
      mainImageUrl: data.image || '',
      wheelchairAccess: data.wheelchairAccess || false,
      rawOpeningHours: data.rawOpeningHours || '08:00 - 22:00',
      categoryIds: data.categoryIds || [],
      rating: data.rating || 0.0,
      reviewCount: data.reviewCount || 0,
      priceLevel: data.priceLevel || 'medium'
    };
    
    const res = await fetch(`${API_BASE_URL}/api/v1/places/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update destination');
    }
    const p = await res.json();
    return {
      id: p.id,
      name: p.name,
      location: p.address || 'Vietnam',
      category: p.categories && p.categories.length > 0 ? p.categories[0] : 'Chung',
      categoryIds: p.categoryIds || [],
      status: 'Hoạt động',
      rating: p.rating || 0.0,
      image: p.mainImageUrl || 'https://via.placeholder.com/150',
      description: p.description || '',
      lng: p.lng,
      lat: p.lat
    };
  },
  
  deleteDestination: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/places/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete destination');
    return { success: true };
  },

  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/categories`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json(); // [{id, displayName}]
  }
};
