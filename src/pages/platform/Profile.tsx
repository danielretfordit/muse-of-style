import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  User,
  Camera,
  Plus,
  MapPin,
  Thermometer,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Loader2,
  Check,
  X,
  Sparkles,
  Upload,
  Trash2,
  Edit2,
  Heart,
  Calendar,
  Ruler,
  Palette,
  ShoppingBag,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ProfileCompletion } from "@/components/profile/ProfileCompletion";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  photos: string[];
  body_type: string | null;
  height: number | null;
  weight: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  shoe_size: string | null;
  preferred_styles: string[];
  favorite_colors: string[];
  disliked_colors: string[];
  preferred_brands: string[];
  budget_min: number | null;
  budget_max: number | null;
  occasion_preferences: Record<string, boolean>;
  location_city: string | null;
  location_country: string | null;
  latitude: number | null;
  longitude: number | null;
  gender: string | null;
  birth_date: string | null;
  style_avatars: StyleAvatar[];
}

interface StyleAvatar {
  id: string;
  occasion: string;
  image_url: string;
  created_at: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  wind: number;
  recommendation: string;
}

const styleOptions = [
  { key: "classic", label: "Классика", emoji: "👔" },
  { key: "casual", label: "Кэжуал", emoji: "👕" },
  { key: "sporty", label: "Спортивный", emoji: "🏃" },
  { key: "romantic", label: "Романтика", emoji: "🌸" },
  { key: "bohemian", label: "Бохо", emoji: "🌻" },
  { key: "minimalist", label: "Минимализм", emoji: "⬜" },
  { key: "glamour", label: "Гламур", emoji: "✨" },
  { key: "streetwear", label: "Стритвир", emoji: "🛹" },
  { key: "preppy", label: "Преппи", emoji: "📚" },
  { key: "vintage", label: "Винтаж", emoji: "📻" },
];

const colorOptions = [
  { key: "black", label: "Чёрный", color: "#000000" },
  { key: "white", label: "Белый", color: "#FFFFFF" },
  { key: "gray", label: "Серый", color: "#808080" },
  { key: "beige", label: "Бежевый", color: "#D4C4B0" },
  { key: "brown", label: "Коричневый", color: "#8B4513" },
  { key: "navy", label: "Тёмно-синий", color: "#1E3A5F" },
  { key: "blue", label: "Синий", color: "#0066CC" },
  { key: "red", label: "Красный", color: "#CC0000" },
  { key: "pink", label: "Розовый", color: "#FFB6C1" },
  { key: "green", label: "Зелёный", color: "#228B22" },
  { key: "yellow", label: "Жёлтый", color: "#FFD700" },
  { key: "purple", label: "Фиолетовый", color: "#800080" },
  { key: "orange", label: "Оранжевый", color: "#FF8C00" },
  { key: "burgundy", label: "Бордовый", color: "#722F37" },
  { key: "olive", label: "Оливковый", color: "#556B2F" },
  { key: "coral", label: "Коралловый", color: "#FF7F50" },
];

const occasionOptions = [
  { key: "business", label: "Деловой", emoji: "💼" },
  { key: "evening", label: "Вечерний", emoji: "🌙" },
  { key: "casual", label: "Повседневный", emoji: "☕" },
  { key: "formal", label: "Торжественный", emoji: "🎉" },
  { key: "sport", label: "Спортивный", emoji: "🏋️" },
  { key: "vacation", label: "Отпуск", emoji: "🏖️" },
];

const bodyTypeOptions = [
  { key: "hourglass", label: "Песочные часы" },
  { key: "pear", label: "Груша" },
  { key: "apple", label: "Яблоко" },
  { key: "rectangle", label: "Прямоугольник" },
  { key: "inverted-triangle", label: "Перевёрнутый треугольник" },
  { key: "athletic", label: "Атлетическое" },
];

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState("business");
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      // If profile row is missing (common after OAuth sign-in when no DB trigger exists),
      // create it on the fly so the user can enter the platform.
      let row = data;
      if (!row) {
        const { data: created, error: createError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            full_name:
              (user.user_metadata as any)?.full_name ||
              (user.user_metadata as any)?.name ||
              user.email?.split("@")[0] ||
              null,
            avatar_url: (user.user_metadata as any)?.avatar_url ?? null,
          })
          .select("*")
          .single();

        if (createError) throw createError;
        row = created;
      }

      if (row) {
        setProfile({
          ...row,
          photos: (row.photos as string[]) || [],
          preferred_styles: (row.preferred_styles as string[]) || [],
          favorite_colors: (row.favorite_colors as string[]) || [],
          disliked_colors: (row.disliked_colors as string[]) || [],
          preferred_brands: (row.preferred_brands as string[]) || [],
          occasion_preferences: (row.occasion_preferences as Record<string, boolean>) || {},
          style_avatars: (row.style_avatars as unknown as StyleAvatar[]) || [],
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Ошибка загрузки профиля");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Fetch weather based on location
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setWeatherLoading(true);
    try {
      // Using Open-Meteo API (free, no API key needed)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      const data = await response.json();
      
      const weatherCode = data.current.weather_code;
      let condition = "Ясно";
      let icon = "sun";
      let recommendation = "Идеальная погода для любого образа!";

      if (weatherCode >= 0 && weatherCode <= 3) {
        condition = weatherCode === 0 ? "Ясно" : "Переменная облачность";
        icon = "sun";
        recommendation = "Лёгкая одежда подойдёт. Не забудьте солнцезащитные очки!";
      } else if (weatherCode >= 45 && weatherCode <= 48) {
        condition = "Туман";
        icon = "cloud";
        recommendation = "Выберите яркие цвета для видимости";
      } else if (weatherCode >= 51 && weatherCode <= 67) {
        condition = "Дождь";
        icon = "rain";
        recommendation = "Возьмите зонт и выберите непромокаемую обувь";
      } else if (weatherCode >= 71 && weatherCode <= 77) {
        condition = "Снег";
        icon = "snow";
        recommendation = "Тёплая многослойная одежда — ваш выбор";
      } else if (weatherCode >= 80 && weatherCode <= 82) {
        condition = "Ливень";
        icon = "rain";
        recommendation = "Дождевик и резиновые сапоги!";
      }

      if (data.current.wind_speed_10m > 40) {
        recommendation = "Сильный ветер! Избегайте лёгких тканей и длинных юбок";
      }

      setWeather({
        temp: Math.round(data.current.temperature_2m),
        condition,
        icon,
        humidity: data.current.relative_humidity_2m,
        wind: Math.round(data.current.wind_speed_10m),
        recommendation,
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile?.latitude && profile?.longitude) {
      fetchWeather(profile.latitude, profile.longitude);
    }
  }, [profile?.latitude, profile?.longitude, fetchWeather]);

  // Get current location
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Геолокация не поддерживается вашим браузером");
      return;
    }

    toast.loading("Определяем местоположение...", { id: "location" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding using Nominatim (free)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          const city = data.address.city || data.address.town || data.address.village || "";
          const country = data.address.country || "";

          setProfile((prev) => prev ? {
            ...prev,
            latitude,
            longitude,
            location_city: city,
            location_country: country,
          } : null);

          toast.success("Местоположение определено!", { id: "location" });
          fetchWeather(latitude, longitude);
        } catch {
          setProfile((prev) => prev ? {
            ...prev,
            latitude,
            longitude,
          } : null);
          toast.success("Координаты получены", { id: "location" });
          fetchWeather(latitude, longitude);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Не удалось определить местоположение", { id: "location" });
      },
      { enableHighAccuracy: true }
    );
  };

  // Save profile
  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          photos: profile.photos,
          body_type: profile.body_type,
          height: profile.height,
          weight: profile.weight,
          chest: profile.chest,
          waist: profile.waist,
          hips: profile.hips,
          shoe_size: profile.shoe_size,
          preferred_styles: profile.preferred_styles,
          favorite_colors: profile.favorite_colors,
          disliked_colors: profile.disliked_colors,
          preferred_brands: profile.preferred_brands,
          budget_min: profile.budget_min,
          budget_max: profile.budget_max,
          occasion_preferences: profile.occasion_preferences,
          location_city: profile.location_city,
        location_country: profile.location_country,
        latitude: profile.latitude,
        longitude: profile.longitude,
        gender: profile.gender,
        birth_date: profile.birth_date,
        style_avatars: JSON.parse(JSON.stringify(profile.style_avatars)),
      })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Профиль сохранён!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  // Upload photo
  const handlePhotoUpload = async (file: File) => {
    if (!user) return;

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/photos/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profiles")
        .getPublicUrl(fileName);

      setProfile((prev) => prev ? {
        ...prev,
        photos: [...prev.photos, urlData.publicUrl],
      } : null);

      toast.success("Фото загружено!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Ошибка загрузки фото");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Upload avatar
  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profiles")
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? {
        ...prev,
        avatar_url: urlData.publicUrl,
      } : null);

      toast.success("Аватар обновлён!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Ошибка загрузки аватара");
    }
  };

  // Remove photo
  const handleRemovePhoto = async (photoUrl: string) => {
    setProfile((prev) => prev ? {
      ...prev,
      photos: prev.photos.filter((p) => p !== photoUrl),
    } : null);
    toast.success("Фото удалено");
  };

  // Toggle style preference
  const toggleStyle = (styleKey: string) => {
    setProfile((prev) => {
      if (!prev) return null;
      const styles = prev.preferred_styles.includes(styleKey)
        ? prev.preferred_styles.filter((s) => s !== styleKey)
        : [...prev.preferred_styles, styleKey];
      return { ...prev, preferred_styles: styles };
    });
  };

  // Toggle color preference
  const toggleFavoriteColor = (colorKey: string) => {
    setProfile((prev) => {
      if (!prev) return null;
      const colors = prev.favorite_colors.includes(colorKey)
        ? prev.favorite_colors.filter((c) => c !== colorKey)
        : [...prev.favorite_colors, colorKey];
      // Remove from disliked if adding to favorite
      const disliked = prev.disliked_colors.filter((c) => c !== colorKey);
      return { ...prev, favorite_colors: colors, disliked_colors: disliked };
    });
  };

  const toggleDislikedColor = (colorKey: string) => {
    setProfile((prev) => {
      if (!prev) return null;
      const disliked = prev.disliked_colors.includes(colorKey)
        ? prev.disliked_colors.filter((c) => c !== colorKey)
        : [...prev.disliked_colors, colorKey];
      // Remove from favorites if adding to disliked
      const favorites = prev.favorite_colors.filter((c) => c !== colorKey);
      return { ...prev, disliked_colors: disliked, favorite_colors: favorites };
    });
  };

  // Toggle occasion
  const toggleOccasion = (occasionKey: string) => {
    setProfile((prev) => {
      if (!prev) return null;
      const prefs = { ...prev.occasion_preferences };
      prefs[occasionKey] = !prefs[occasionKey];
      return { ...prev, occasion_preferences: prefs };
    });
  };

  // Generate style avatar (placeholder - would use AI in production)
  const handleGenerateAvatar = async () => {
    if (!user || !profile?.photos.length) {
      toast.error("Сначала загрузите свои фото");
      return;
    }

    setGeneratingAvatar(true);
    try {
      // In production, this would call an AI API to generate the avatar
      // For now, we'll simulate the process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const newAvatar: StyleAvatar = {
        id: Date.now().toString(),
        occasion: selectedOccasion,
        image_url: profile.photos[0], // Placeholder - would be generated image
        created_at: new Date().toISOString(),
      };

      setProfile((prev) => prev ? {
        ...prev,
        style_avatars: [...prev.style_avatars, newAvatar],
      } : null);

      toast.success("Аватар создан! (Демо-режим)");
      setAvatarDialogOpen(false);
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast.error("Ошибка генерации аватара");
    } finally {
      setGeneratingAvatar(false);
    }
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case "sun":
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case "cloud":
        return <Cloud className="w-8 h-8 text-muted-foreground" />;
      case "rain":
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case "snow":
        return <Snowflake className="w-8 h-8 text-blue-200" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Профиль не найден</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Мой профиль</h1>
          <p className="text-muted-foreground font-body text-sm">
            Настройте предпочтения для персонализированных рекомендаций
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          Сохранить
        </Button>
      </div>

      {/* Profile Completion */}
      <ProfileCompletion profile={profile} />

      {/* Avatar & Basic Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {profile.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleAvatarUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Ваше имя"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Пол</Label>
                  <Select
                    value={profile.gender || ""}
                    onValueChange={(value) => setProfile({ ...profile, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Женский</SelectItem>
                      <SelectItem value="male">Мужской</SelectItem>
                      <SelectItem value="other">Другой</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Дата рождения</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={profile.birth_date || ""}
                    onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Тип фигуры</Label>
                  <Select
                    value={profile.body_type || ""}
                    onValueChange={(value) => setProfile({ ...profile, body_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyTypeOptions.map((opt) => (
                        <SelectItem key={opt.key} value={opt.key}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="photos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="photos" className="text-xs md:text-sm">
            <ImageIcon className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Фото</span>
          </TabsTrigger>
          <TabsTrigger value="measurements" className="text-xs md:text-sm">
            <Ruler className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Параметры</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs md:text-sm">
            <Palette className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Стиль</span>
          </TabsTrigger>
          <TabsTrigger value="avatars" className="text-xs md:text-sm">
            <Sparkles className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Аватары</span>
          </TabsTrigger>
          <TabsTrigger value="weather" className="text-xs md:text-sm">
            <MapPin className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Погода</span>
          </TabsTrigger>
        </TabsList>

        {/* Photos Tab */}
        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Мои фото
              </CardTitle>
              <CardDescription>
                Загрузите фото для виртуальной примерки и создания аватаров
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Upload Button */}
                <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                  {uploadingPhoto ? (
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-sm font-body text-muted-foreground">
                        Добавить фото
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPhoto}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handlePhotoUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                {/* Photos Grid */}
                {profile.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                    <img
                      src={photo}
                      alt={`Фото ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemovePhoto(photo)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Параметры тела
              </CardTitle>
              <CardDescription>
                Укажите размеры для точных рекомендаций по посадке
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Рост (см)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height || ""}
                    onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || null })}
                    placeholder="170"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Вес (кг)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight || ""}
                    onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) || null })}
                    placeholder="65"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chest">Грудь (см)</Label>
                  <Input
                    id="chest"
                    type="number"
                    value={profile.chest || ""}
                    onChange={(e) => setProfile({ ...profile, chest: parseInt(e.target.value) || null })}
                    placeholder="90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">Талия (см)</Label>
                  <Input
                    id="waist"
                    type="number"
                    value={profile.waist || ""}
                    onChange={(e) => setProfile({ ...profile, waist: parseInt(e.target.value) || null })}
                    placeholder="70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hips">Бёдра (см)</Label>
                  <Input
                    id="hips"
                    type="number"
                    value={profile.hips || ""}
                    onChange={(e) => setProfile({ ...profile, hips: parseInt(e.target.value) || null })}
                    placeholder="95"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shoe">Размер обуви</Label>
                  <Input
                    id="shoe"
                    value={profile.shoe_size || ""}
                    onChange={(e) => setProfile({ ...profile, shoe_size: e.target.value })}
                    placeholder="38"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Style Preferences Tab */}
        <TabsContent value="style" className="space-y-4">
          {/* Preferred Styles */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Любимые стили
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {styleOptions.map((style) => (
                  <Badge
                    key={style.key}
                    variant={profile.preferred_styles.includes(style.key) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 text-sm"
                    onClick={() => toggleStyle(style.key)}
                  >
                    {style.emoji} {style.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Favorite Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Любимые цвета
              </CardTitle>
              <CardDescription>
                Выберите цвета, которые вам нравятся
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.key}
                    onClick={() => toggleFavoriteColor(color.key)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                      profile.favorite_colors.includes(color.key)
                        ? "border-primary scale-110 ring-2 ring-primary/30"
                        : "border-border hover:scale-105"
                    )}
                    style={{ backgroundColor: color.color }}
                    title={color.label}
                  >
                    {profile.favorite_colors.includes(color.key) && (
                      <Heart className="w-4 h-4 text-white drop-shadow" fill="currentColor" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disliked Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <X className="w-5 h-5" />
                Нежелательные цвета
              </CardTitle>
              <CardDescription>
                Цвета, которые вы хотите избегать
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.key}
                    onClick={() => toggleDislikedColor(color.key)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                      profile.disliked_colors.includes(color.key)
                        ? "border-destructive scale-110 ring-2 ring-destructive/30"
                        : "border-border hover:scale-105"
                    )}
                    style={{ backgroundColor: color.color }}
                    title={color.label}
                  >
                    {profile.disliked_colors.includes(color.key) && (
                      <X className="w-4 h-4 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Occasions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Типичные события
              </CardTitle>
              <CardDescription>
                Для каких случаев вам чаще нужны образы?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {occasionOptions.map((occasion) => (
                  <div
                    key={occasion.key}
                    onClick={() => toggleOccasion(occasion.key)}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                      profile.occasion_preferences[occasion.key]
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl">{occasion.emoji}</span>
                    <span className="font-body text-sm">{occasion.label}</span>
                    {profile.occasion_preferences[occasion.key] && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Бюджет
              </CardTitle>
              <CardDescription>
                Ценовой диапазон для рекомендаций
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-min">Минимум (₽)</Label>
                  <Input
                    id="budget-min"
                    type="number"
                    value={profile.budget_min || ""}
                    onChange={(e) => setProfile({ ...profile, budget_min: parseInt(e.target.value) || null })}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-max">Максимум (₽)</Label>
                  <Input
                    id="budget-max"
                    type="number"
                    value={profile.budget_max || ""}
                    onChange={(e) => setProfile({ ...profile, budget_max: parseInt(e.target.value) || null })}
                    placeholder="50000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Style Avatars Tab */}
        <TabsContent value="avatars">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Стильные аватары
              </CardTitle>
              <CardDescription>
                Создайте свой образ в разных обстановках с помощью AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Generate New Avatar Button */}
                <div
                  onClick={() => setAvatarDialogOpen(true)}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-body text-muted-foreground text-center px-2">
                    Создать аватар
                  </span>
                </div>

                {/* Existing Avatars */}
                {profile.style_avatars.map((avatar) => {
                  const occasion = occasionOptions.find((o) => o.key === avatar.occasion);
                  return (
                    <div key={avatar.id} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img
                        src={avatar.image_url}
                        alt={occasion?.label || avatar.occasion}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <Badge variant="secondary" className="text-xs">
                          {occasion?.emoji} {occasion?.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {profile.photos.length === 0 && (
                <div className="mt-6 p-6 rounded-xl bg-secondary/20 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-body text-sm text-muted-foreground">
                    Для создания аватаров сначала загрузите свои фото во вкладке "Фото"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weather & Location Tab */}
        <TabsContent value="weather">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Местоположение и погода
              </CardTitle>
              <CardDescription>
                Получайте рекомендации с учётом погодных условий
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="flex-1 space-y-2">
                  <Label>Город</Label>
                  <div className="flex gap-2">
                    <Input
                      value={profile.location_city || ""}
                      onChange={(e) => setProfile({ ...profile, location_city: e.target.value })}
                      placeholder="Москва"
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={handleGetLocation}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Определить
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Страна</Label>
                  <Input
                    value={profile.location_country || ""}
                    onChange={(e) => setProfile({ ...profile, location_country: e.target.value })}
                    placeholder="Россия"
                  />
                </div>
              </div>

              <Separator />

              {/* Weather Card */}
              {weatherLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : weather ? (
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/30">
                  <div className="flex items-center gap-6">
                    {getWeatherIcon(weather.icon)}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-4xl font-bold">{weather.temp}°</span>
                        <span className="text-muted-foreground font-body">{weather.condition}</span>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-4 h-4" />
                          Влажность: {weather.humidity}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Wind className="w-4 h-4" />
                          Ветер: {weather.wind} км/ч
                        </span>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="font-body text-sm">{weather.recommendation}</p>
                  </div>
                </div>
              ) : profile.latitude && profile.longitude ? (
                <Button onClick={() => fetchWeather(profile.latitude!, profile.longitude!)}>
                  Загрузить погоду
                </Button>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-body text-sm">
                    Определите местоположение, чтобы получать рекомендации по погоде
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Avatar Generation Dialog */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Создать стильный аватар</DialogTitle>
            <DialogDescription>
              Выберите обстановку и AI создаст ваш образ
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Выберите обстановку</Label>
              <div className="grid grid-cols-2 gap-3">
                {occasionOptions.map((occasion) => (
                  <div
                    key={occasion.key}
                    onClick={() => setSelectedOccasion(occasion.key)}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3",
                      selectedOccasion === occasion.key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl">{occasion.emoji}</span>
                    <span className="font-body text-sm">{occasion.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {profile.photos.length > 0 && (
              <div className="space-y-2">
                <Label>Исходное фото</Label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {profile.photos.slice(0, 4).map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Фото ${index + 1}`}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAvatarDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleGenerateAvatar} disabled={generatingAvatar || !profile.photos.length}>
              {generatingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Создать
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
