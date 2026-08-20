// Category mapping from English to Vietnamese
const CATEGORY_LABELS = {
  cafe: 'Café',
  restaurant: 'Nhà hàng',
  hotel: 'Khách sạn',
  food: 'Ẩm thực',
  sightseeing: 'Tham quan',
  museum: 'Bảo tàng',
  park: 'Công viên',
};

// Price level to approximate VND price and label
const PRICE_MAP = {
  low: { price: 75000, label: 'Dưới 100.000đ', detail: { adult: 75000, student: 60000, child: 40000 } },
  medium: { price: 250000, label: '100k - 500k', detail: { adult: 250000, student: 200000, child: 150000 } },
  high: { price: 500000, label: 'Trên 500.000đ', detail: { adult: 500000, student: 400000, child: 300000 } },
};

// Famous landmark image overrides for high visual accuracy
const LANDMARK_IMAGE_OVERALAYS = [
  { keywords: ['bưu điện thành phố', 'buu dien thanh pho', 'post office'], url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=450&fit=crop&q=80' },
  { keywords: ['vincom đồng khởi', 'vincom dong khoi', 'vincom center'], url: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=600&h=450&fit=crop&q=80' },
  { keywords: ['chợ bến thành', 'cho ben thanh', 'ben thanh market'], url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=450&fit=crop&q=80' },
  { keywords: ['nhà thờ đức bà', 'nha tho duc ba', 'notre dame'], url: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=600&h=450&fit=crop&q=80' },
  { keywords: ['nhà hát thành phố', 'opera house'], url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=600&h=450&fit=crop&q=80' },
  { keywords: ['landmark 81'], url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=450&fit=crop&q=80' },
  { keywords: ['dinh độc lập', 'dinh doc lap', 'independence palace'], url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&h=450&fit=crop&q=80' },
  { keywords: ['bảo tàng chứng tích', ' chiến tranh', 'war remnants'], url: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=600&h=450&fit=crop&q=80' },
  { keywords: ['bảo tàng thành phố', 'bao tang thanh pho'], url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&h=450&fit=crop&q=80' },
  { keywords: ['hồ hoàn kiếm', 'ho hoan kiem', 'tháp rùa'], url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&h=450&fit=crop&q=80' },
  { keywords: ['phố cổ hội an', 'pho co hoi an'], url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=450&fit=crop&q=80' },
  { keywords: ['bãi biển mỹ khê', 'my khe beach'], url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=450&fit=crop&q=80' },
  { keywords: ['cơm tấm'], url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=450&fit=crop&q=80' },
  { keywords: ['phở'], url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=450&fit=crop&q=80' },
  { keywords: ['cà phê', 'cafe', 'coffee'], url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=450&fit=crop&q=80' },
];

export function transformPlaceToDestination(place) {
  if (!place) return null;
  const nameLower = (place.name || '').toLowerCase();
  
  // Filter out non-travel related places
  const unwanted_keywords = ["nha khoa", "thẩm mỹ", "clinic", "dental", "dentist", "dentistry", "spa", "phòng khám", "bệnh viện", "salon", "massage", "thuốc", "nha thuoc", "hieu thuoc", "tiệm thuốc", "hiệu thuốc"];
  if (unwanted_keywords.some(kw => nameLower.includes(kw))) {
    return null;
  }

  const priceLevel = place.price_level || place.priceLevel;
  const category = place.category || (place.categories && place.categories[0]) || 'other';

  // Smart price label calculation
  let price = 0;
  let priceLabel = 'Tham quan miễn phí';

  if (place.priceLabel) {
    priceLabel = place.priceLabel;
    price = place.price || 0;
  } else if (place.ticket_price != null && Number(place.ticket_price) >= 0) {
    price = Number(place.ticket_price);
    priceLabel = price === 0 ? 'Tham quan miễn phí' : `Vé ${new Intl.NumberFormat('vi-VN').format(price)}đ`;
  } else if (place.price != null && Number(place.price) >= 0) {
    price = Number(place.price);
    const catLower = String(category).toLowerCase();
    const isFood = catLower.includes('food') || catLower.includes('ẩm thực') || catLower.includes('quán') || catLower.includes('nhà hàng') || catLower.includes('restaurant') || catLower.includes('cafe');
    priceLabel = price === 0 ? (isFood ? 'Miễn phí' : 'Tham quan miễn phí') : (isFood ? `Khoảng ${new Intl.NumberFormat('vi-VN').format(price)}đ` : `Từ ${new Intl.NumberFormat('vi-VN').format(price)}đ`);
  } else if (priceLevel && PRICE_MAP[priceLevel]) {
    price = PRICE_MAP[priceLevel].price;
    priceLabel = PRICE_MAP[priceLevel].label;
  } else {
    const catLower = String(category).toLowerCase();
    if (catLower.includes('food') || catLower.includes('ẩm thực') || catLower.includes('nhà hàng') || catLower.includes('cafe')) {
      price = 50000;
      priceLabel = 'Từ 50.000đ';
    } else {
      price = 0;
      priceLabel = 'Tham quan miễn phí';
    }
  }

  // Parse image URL if it's a JSON string array
  let parsedImage = place.image_url || place.mainImageUrl || place.image;
  if (typeof parsedImage === 'string' && parsedImage.trim().startsWith('[')) {
    try {
      const arr = JSON.parse(parsedImage);
      if (Array.isArray(arr) && arr.length > 0) {
        parsedImage = arr[0];
      }
    } catch (e) {
      // Ignore parse error
    }
  }

  // Landmark image override matching
  const matchedOverlay = LANDMARK_IMAGE_OVERALAYS.find(item => item.keywords.some(kw => nameLower.includes(kw)));
  let finalImage = matchedOverlay ? matchedOverlay.url : parsedImage;

  // Fallback if empty or placeholder
  if (!finalImage || finalImage.includes('placehold.co') || finalImage.includes('photo-1558618666-fcd25c85cd64') || finalImage.includes('photo-1555421689-491a97ff2040')) {
    finalImage = matchedOverlay ? matchedOverlay.url : `https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=450&fit=crop&q=80`;
  }
  
  return {
    id: place.place_id || place.id,
    title: place.name || place.title || 'Không rõ tên',
    location: place.address || place.location || '',
    city: extractCityFromAddress(place.address || place.location),
    price,
    priceLabel,
    originalPrice: place.originalPrice || null,
    discount: place.discount || 0,
    rating: Number(place.rating) || 4.5,
    reviewCount: Number(place.review_count) || Number(place.reviewCount) || 120,
    suitability: place.suitability || Math.min(98, Math.round((Number(place.rating) || 4.5) * 20)),
    openHours: place.opening_hours || place.rawOpeningHours || place.openHours || '08:00 - 22:00',
    image: finalImage,
    category: CATEGORY_LABELS[category] || category || 'Tham quan',
    categories: Array.isArray(place.categories) ? place.categories : [category],
    distance: place.distance_km != null ? Number(place.distance_km) : (place.distanceKm != null ? Number(place.distanceKm) : 0),
    featured: Boolean(place.featured),
    lat: Number(place.lat) || 0,
    lng: Number(place.lng) || 0,
    overview: place.description || place.overview || place.match_reason || 'Địa điểm tham quan hấp dẫn không thể bỏ qua tại địa phương.',
    facilities: place.facilities || ((place.wheelchair_access || place.wheelchairAccess) ? 'Xe lăn, Điều hòa' : 'Điều hòa'),
    tourType: place.tourType || (category === 'restaurant' ? 'Nhà hàng' : category === 'cafe' ? 'Quán cà phê' : category === 'hotel' ? 'Khách sạn' : 'Tham quan'),
    reviews: place.reviews || [],
    priceDetail: place.priceDetail || { adult: price, student: Math.round(price * 0.7), child: Math.round(price * 0.5) },
    _apiData: place,
  };
}

function extractCityFromAddress(address) {
  if (!address) return '';
  const parts = address.split(',').map(s => s.trim());
  // Try to find city name from address parts (usually near the end)
  const cityKeywords = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Huế', 'Hội An', 'Nha Trang', 'Đà Lạt', 'Phú Quốc', 'Vũng Tàu', 'Hạ Long', 'Sa Pa', 'Cần Thơ'];
  for (const part of parts.reverse()) {
    for (const city of cityKeywords) {
      if (part.includes(city)) return city;
    }
  }
  return parts[parts.length - 1] || '';
}

export function transformPlacesToDestinations(places) {
  if (!Array.isArray(places)) return [];
  return places.map(transformPlaceToDestination).filter(Boolean);
}

// Transform itinerary time slot from backend to frontend format
export function transformItinerarySlot(slot) {
  if (!slot) return null;
  return {
    ...slot,
    place: slot.place ? transformPlaceToDestination(slot.place) : null,
  };
}

export function transformItinerary(itinerary) {
  if (!Array.isArray(itinerary)) return [];
  return itinerary.map(transformItinerarySlot).filter(Boolean);
}
