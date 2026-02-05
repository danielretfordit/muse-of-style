// DEV MODE: Mock profile for development without real auth
// This profile is used when DEV_BYPASS_AUTH is enabled

export const DEV_MOCK_PROFILE = {
  id: "dev-profile-001",
  user_id: "dev-user-001",
  full_name: "Анна Тестова",
  avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  photos: [
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
  ],
  gender: "female",
  birth_date: "1995-06-15",
  body_type: "hourglass",
  height: 168,
  weight: 58,
  chest: 88,
  waist: 64,
  hips: 92,
  shoe_size: "38",
  preferred_styles: ["casual", "minimalist", "romantic", "classic"],
  favorite_colors: ["black", "white", "beige", "burgundy", "navy"],
  disliked_colors: ["orange", "yellow"],
  preferred_brands: ["Zara", "Massimo Dutti", "COS", "H&M", "Uniqlo"],
  budget_min: 5000,
  budget_max: 50000,
  occasion_preferences: {
    casual: true,
    business: true,
    evening: true,
    vacation: true,
    formal: false,
    sport: false,
  },
  location_city: "Москва",
  location_country: "Россия",
  latitude: 55.7558,
  longitude: 37.6173,
  style_avatars: [],
};

export const DEV_MOCK_USER = {
  id: "dev-user-001",
  email: "dev@stilisti.test",
  user_metadata: {
    full_name: "Анна Тестова",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
};
