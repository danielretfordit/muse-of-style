import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Send,
  Shirt,
  ShoppingBag,
  Palette,
  CloudSun,
  MessageSquare,
  Wand2,
  RefreshCw,
  Save,
  Loader2,
  Bot,
  User,
  TrendingUp,
  Lightbulb,
  ChevronRight,
  Heart,
  Calendar,
  Zap,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWeather } from "@/hooks/useWeather";
import { DEV_BYPASS_AUTH } from "@/lib/devMode";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AIOutfitSuggestion } from "@/components/dashboard/AIOutfitSuggestion";
import { extractStoragePath, getSignedUrls } from "@/lib/storage";
import { ItemDetailSheet } from "@/components/wardrobe/ItemDetailSheet";

type ChatMode = "chat" | "outfit" | "analyze" | "shopping";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode?: ChatMode;
}

interface SavedOutfit {
  id: string;
  name: string;
  description: string;
  occasion: string;
  created_at: string;
}

interface WardrobeItemFull {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  color: string | null;
  brand: string | null;
  image_url: string;
  season: string | null;
  price: number | null;
  currency: string | null;
  is_favorite: boolean;
  ownership_status: string;
  tags: string[] | null;
}

interface OutfitBlock {
  items: Array<{ id: string; reason: string }>;
}

const QUICK_PROMPTS: Array<{ icon: React.ElementType; text: string; mode: ChatMode }> = [
  { icon: CloudSun, text: "Подбери образ по погоде", mode: "outfit" },
  { icon: ShoppingBag, text: "Что купить в первую очередь?", mode: "shopping" },
  { icon: Palette, text: "Проанализируй мой стиль", mode: "analyze" },
  { icon: Calendar, text: "Образ для деловой встречи", mode: "outfit" },
  { icon: Heart, text: "Романтический образ на вечер", mode: "outfit" },
  { icon: TrendingUp, text: "Какие тренды мне подойдут?", mode: "chat" },
];

const MODE_CONFIG: Record<ChatMode, { label: string; icon: React.ElementType; color: string }> = {
  chat: { label: "Чат", icon: MessageSquare, color: "text-primary" },
  outfit: { label: "Образы", icon: Wand2, color: "text-emerald-500" },
  analyze: { label: "Анализ", icon: Palette, color: "text-violet-500" },
  shopping: { label: "Шопинг", icon: ShoppingBag, color: "text-amber-500" },
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-stylist-chat`;

// Parse :::outfit blocks from message content
function parseOutfitBlocks(content: string): Array<{ type: "text"; value: string } | { type: "outfit"; value: OutfitBlock }> {
  const parts: Array<{ type: "text"; value: string } | { type: "outfit"; value: OutfitBlock }> = [];
  const regex = /:::outfit\s*\n?([\s\S]*?)\n?:::/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Text before the outfit block
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim();
      if (text) parts.push({ type: "text", value: text });
    }

    // Parse the outfit JSON
    try {
      const jsonStr = match[1].trim();
      const items = JSON.parse(jsonStr);
      if (Array.isArray(items)) {
        parts.push({ type: "outfit", value: { items } });
      }
    } catch {
      // If JSON parse fails, treat as text
      parts.push({ type: "text", value: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last block
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim();
    if (text) parts.push({ type: "text", value: text });
  }

  if (parts.length === 0 && content.trim()) {
    parts.push({ type: "text", value: content });
  }

  return parts;
}

// Outfit card component rendered inline in chat
function OutfitCardInline({
  outfitBlock,
  wardrobeMap,
  signedImages,
  onItemClick,
  onSaveOutfit,
}: {
  outfitBlock: OutfitBlock;
  wardrobeMap: Map<string, WardrobeItemFull>;
  signedImages: Map<string, string>;
  onItemClick: (id: string) => void;
  onSaveOutfit: (itemIds: string[]) => void;
}) {
  const resolvedItems = outfitBlock.items
    .map((oi) => {
      const item = wardrobeMap.get(oi.id);
      return item ? { ...oi, item } : null;
    })
    .filter(Boolean) as Array<{ id: string; reason: string; item: WardrobeItemFull }>;

  if (resolvedItems.length === 0) return null;

  const getImageUrl = (item: WardrobeItemFull): string => {
    if (DEV_BYPASS_AUTH) return item.image_url;
    const path = extractStoragePath(item.image_url, "wardrobe");
    if (path && signedImages.has(path)) return signedImages.get(path)!;
    return item.image_url;
  };

  return (
    <div className="my-3">
      <div className="bg-background/80 rounded-xl border border-border/50 overflow-hidden">
        {/* Item grid */}
        <div className={cn(
          "grid gap-1 p-2",
          resolvedItems.length <= 2 ? "grid-cols-2" :
          resolvedItems.length === 3 ? "grid-cols-3" :
          "grid-cols-4"
        )}>
          {resolvedItems.map(({ id, reason, item }) => (
            <div
              key={id}
              className="group relative cursor-pointer"
              onClick={() => onItemClick(id)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-muted ring-0 hover:ring-2 hover:ring-primary/50 transition-all">
                <img
                  src={getImageUrl(item)}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-foreground/70 to-transparent rounded-b-lg">
                <p className="text-[10px] font-medium text-background truncate">{item.name}</p>
                {item.brand && (
                  <p className="text-[8px] text-background/70 truncate">{item.brand}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reasons strip */}
        <div className="px-3 py-2 border-t border-border/30 bg-muted/30">
          <div className="flex flex-wrap gap-1.5">
            {resolvedItems.map(({ id, reason, item }) => (
              <span key={id} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
                <span className="font-medium text-foreground">{item.name}</span>
                <span>— {reason}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="px-3 py-2 border-t border-border/30 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5 text-primary hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onSaveOutfit(resolvedItems.map((i) => i.id));
            }}
          >
            <Save className="w-3 h-3" />
            Сохранить образ
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Stylist() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { weather } = useWeather();

  const [activeTab, setActiveTab] = useState<"chat" | "outfits">("chat");
  const [chatMode, setChatMode] = useState<ChatMode>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [showOutfitGenerator, setShowOutfitGenerator] = useState(false);

  // Wardrobe items map for resolving outfit blocks
  const [wardrobeMap, setWardrobeMap] = useState<Map<string, WardrobeItemFull>>(new Map());
  const [signedImages, setSignedImages] = useState<Map<string, string>>(new Map());

  // Item detail sheet
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch wardrobe items + saved outfits
  useEffect(() => {
    if (!user) return;
    if (DEV_BYPASS_AUTH) {
      setWardrobeCount(8);
      setSavedOutfits([]);
      return;
    }

    const fetchData = async () => {
      const [{ data: items, count }, { data: looks }] = await Promise.all([
        supabase
          .from("wardrobe_items")
          .select("id, name, category, subcategory, color, brand, image_url, season, price, currency, is_favorite, ownership_status, tags")
          .eq("user_id", user.id),
        supabase
          .from("looks")
          .select("id, name, description, occasion, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      // Build wardrobe map
      const map = new Map<string, WardrobeItemFull>();
      if (items) {
        for (const item of items) {
          map.set(item.id, item as WardrobeItemFull);
        }
        setWardrobeCount(items.length);

        // Fetch signed URLs for all wardrobe images
        const paths: string[] = [];
        items.forEach((item: any) => {
          const path = extractStoragePath(item.image_url, "wardrobe");
          if (path) paths.push(path);
        });
        if (paths.length > 0) {
          const urlMap = await getSignedUrls("wardrobe", paths);
          setSignedImages(urlMap);
        }
      }
      setWardrobeMap(map);
      setSavedOutfits((looks || []) as SavedOutfit[]);
    };
    fetchData();
  }, [user]);

  const sendMessage = async (text: string, mode?: ChatMode) => {
    if (!text.trim() || isStreaming) return;

    const currentMode = mode || chatMode;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
      mode: currentMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date(), mode: currentMode },
    ]);

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: chatMessages,
          mode: currentMode,
          context: {
            weather: weather
              ? { temperature: weather.temperature, condition: weather.condition, humidity: weather.humidity }
              : undefined,
            wardrobeCount,
          },
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
              );
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = err instanceof Error ? err.message : "Ошибка подключения";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `⚠️ ${errorMessage}. Попробуйте ещё раз.` }
            : m
        )
      );
      toast.error(errorMessage);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (prompt: string, mode: ChatMode) => {
    setChatMode(mode);
    sendMessage(prompt, mode);
  };

  const saveOutfitFromItems = async (itemIds: string[]) => {
    if (!user || DEV_BYPASS_AUTH) {
      toast.info("Сохранение доступно после авторизации");
      return;
    }

    try {
      const itemNames = itemIds
        .map((id) => wardrobeMap.get(id)?.name)
        .filter(Boolean)
        .join(", ");

      const { data, error } = await supabase
        .from("looks")
        .insert({
          user_id: user.id,
          name: `AI образ: ${itemNames.slice(0, 60)}`,
          description: `Подобран AI стилистом. Состав: ${itemNames}`,
          occasion: chatMode === "outfit" ? "casual" : "other",
          tags: ["ai-generated"],
        })
        .select()
        .single();

      if (error) throw error;

      // Add look items
      if (data) {
        const lookItems = itemIds.map((itemId, idx) => ({
          look_id: data.id,
          wardrobe_item_id: itemId,
          position: idx,
        }));
        await supabase.from("look_items").insert(lookItems);
      }

      setSavedOutfits((prev) => [data as SavedOutfit, ...prev]);
      toast.success("Образ сохранён в коллекцию!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Не удалось сохранить образ");
    }
  };

  const saveOutfitFromText = async (messageContent: string) => {
    if (!user || DEV_BYPASS_AUTH) {
      toast.info("Сохранение доступно после авторизации");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("looks")
        .insert({
          user_id: user.id,
          name: `Образ от AI стилиста`,
          description: messageContent.slice(0, 500),
          occasion: chatMode === "outfit" ? "casual" : "other",
          tags: ["ai-generated"],
        })
        .select()
        .single();

      if (error) throw error;
      setSavedOutfits((prev) => [data as SavedOutfit, ...prev]);
      toast.success("Образ сохранён!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Не удалось сохранить образ");
    }
  };

  const handleItemClick = async (itemId: string) => {
    if (DEV_BYPASS_AUTH) return;
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("id", itemId)
        .maybeSingle();

      if (data && !error) {
        const path = extractStoragePath(data.image_url, "wardrobe");
        if (path && signedImages.has(path)) {
          data.image_url = signedImages.get(path)!;
        } else if (path) {
          const urlMap = await getSignedUrls("wardrobe", [path]);
          if (urlMap.has(path)) data.image_url = urlMap.get(path)!;
        }
        setSelectedItem(data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      console.error("Failed to load item:", err);
    }
  };

  const handleUpdateItem = async (id: string, updates: Record<string, any>) => {
    const { error } = await supabase.from("wardrobe_items").update(updates).eq("id", id);
    if (!error) setSelectedItem((prev: any) => prev ? { ...prev, ...updates } : prev);
  };

  const handleDeleteItem = async (id: string) => {
    const item = selectedItem;
    if (item) {
      const path = extractStoragePath(item.image_url, "wardrobe");
      if (path) await supabase.storage.from("wardrobe").remove([path]);
    }
    await supabase.from("wardrobe_items").delete().eq("id", id);
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    const { error } = await supabase.from("wardrobe_items").update({ is_favorite: !current }).eq("id", id);
    if (!error) setSelectedItem((prev: any) => prev ? { ...prev, is_favorite: !current } : prev);
  };

  // Render a message with parsed outfit blocks
  const renderMessageContent = (msg: ChatMessage) => {
    const parts = parseOutfitBlocks(msg.content);
    const hasOutfitBlock = parts.some((p) => p.type === "outfit");

    return (
      <>
        {parts.map((part, idx) => {
          if (part.type === "outfit") {
            return (
              <OutfitCardInline
                key={idx}
                outfitBlock={part.value as OutfitBlock}
                wardrobeMap={wardrobeMap}
                signedImages={signedImages}
                onItemClick={handleItemClick}
                onSaveOutfit={saveOutfitFromItems}
              />
            );
          }
          return (
            <div key={idx} className="font-body text-sm whitespace-pre-wrap leading-relaxed">
              {(part.value as string)}
            </div>
          );
        })}

        {/* Streaming indicator */}
        {isStreaming &&
          msg.role === "assistant" &&
          msg.id === messages[messages.length - 1]?.id &&
          msg.content === "" && (
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
            </span>
          )}

        {/* Save text button (only if no outfit blocks) */}
        {msg.role === "assistant" && msg.content && !isStreaming && !hasOutfitBlock && (
          <div className="flex gap-1 mt-2 pt-2 border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => saveOutfitFromText(msg.content)}
            >
              <Save className="w-3 h-3" />
              Сохранить
            </Button>
          </div>
        )}
      </>
    );
  };

  const hasWardrobe = wardrobeCount > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)]">
      {/* Header */}
      <header className="shrink-0 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                AI Стилист
                <Badge variant="secondary" className="text-[10px] font-normal">
                  <Zap className="w-3 h-3 mr-0.5" />
                  2026
                </Badge>
              </h1>
              <p className="font-body text-xs text-muted-foreground">
                {weather
                  ? `${weather.icon} ${weather.temperature}°C • ${wardrobeCount} вещей`
                  : `${wardrobeCount} вещей в гардеробе`}
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "outfits")}>
            <TabsList className="h-8">
              <TabsTrigger value="chat" className="text-xs px-3 h-7 gap-1">
                <MessageSquare className="w-3 h-3" />
                Чат
              </TabsTrigger>
              <TabsTrigger value="outfits" className="text-xs px-3 h-7 gap-1">
                <Shirt className="w-3 h-3" />
                Образы
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {activeTab === "chat" ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mode Selector */}
          <div className="shrink-0 px-4 py-2 border-b border-border/50 bg-muted/30">
            <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto">
              {(Object.entries(MODE_CONFIG) as [ChatMode, typeof MODE_CONFIG.chat][]).map(
                ([key, cfg]) => (
                  <Button
                    key={key}
                    variant={chatMode === key ? "default" : "ghost"}
                    size="sm"
                    className={cn("h-7 text-xs gap-1 shrink-0", chatMode !== key && cfg.color)}
                    onClick={() => setChatMode(key)}
                  >
                    <cfg.icon className="w-3 h-3" />
                    {cfg.label}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                    <Bot className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold mb-2">
                    Привет! Я ваш AI стилист ✨
                  </h2>
                  <p className="font-body text-muted-foreground max-w-md mb-8">
                    {hasWardrobe
                      ? `У меня есть доступ к вашему гардеробу (${wardrobeCount} вещей). Помогу подобрать образ, проанализирую стиль или подскажу что купить.`
                      : "Помогу подобрать образ, проанализирую стиль или подскажу что купить. Начните с добавления вещей в гардероб!"}
                  </p>

                  {/* Quick prompts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickPrompt(prompt.text, prompt.mode)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <prompt.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-body text-sm text-foreground">{prompt.text}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>

                  {!hasWardrobe && (
                    <Button
                      variant="outline"
                      className="mt-6 gap-2"
                      onClick={() => navigate("/app/wardrobe")}
                    >
                      <Shirt className="w-4 h-4" />
                      Перейти в гардероб
                    </Button>
                  )}
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}
                    >
                      {renderMessageContent(msg)}
                    </div>

                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-foreground" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="shrink-0 border-t border-border bg-background px-4 py-3">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  chatMode === "outfit"
                    ? "Опишите событие или настроение..."
                    : chatMode === "analyze"
                    ? "О чём хотите узнать о своём стиле?"
                    : chatMode === "shopping"
                    ? "Что вы ищете?"
                    : "Спросите что угодно о стиле..."
                }
                disabled={isStreaming}
                className="flex-1 rounded-full border-border/50 bg-muted/50 focus:bg-background"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isStreaming}
                className="rounded-full shrink-0 w-10 h-10"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        /* Outfits Tab */
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card
              className="cursor-pointer border-dashed border-primary/30 hover:border-primary/60 transition-colors bg-gradient-to-br from-primary/5 to-accent/5"
              onClick={() => setShowOutfitGenerator(!showOutfitGenerator)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground">
                    Сгенерировать образ по погоде
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    AI подберёт вещи из вашего гардероба
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-primary" />
              </CardContent>
            </Card>

            {showOutfitGenerator && (
              <AIOutfitSuggestion
                weather={weather}
                onClose={() => setShowOutfitGenerator(false)}
              />
            )}

            {/* Saved Outfits */}
            <div>
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Сохранённые образы
                {savedOutfits.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {savedOutfits.length}
                  </Badge>
                )}
              </h2>

              {savedOutfits.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Shirt className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-display text-base font-semibold mb-2">
                      Пока нет сохранённых образов
                    </h3>
                    <p className="font-body text-sm text-muted-foreground mb-4">
                      Попросите AI стилиста подобрать образ или сохраните совет из чата
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("chat")}
                      className="gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Открыть чат
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {savedOutfits.map((outfit) => (
                    <Card
                      key={outfit.id}
                      className="hover:border-primary/30 transition-colors cursor-pointer"
                      onClick={() => navigate("/app/looks")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-display text-sm font-semibold truncate">
                                {outfit.name}
                              </h3>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {outfit.occasion}
                              </Badge>
                            </div>
                            {outfit.description && (
                              <p className="font-body text-xs text-muted-foreground line-clamp-2">
                                {outfit.description}
                              </p>
                            )}
                            <p className="font-body text-[10px] text-muted-foreground mt-1">
                              {new Date(outfit.created_at).toLocaleDateString("ru-RU")}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Sheet */}
      <ItemDetailSheet
        item={selectedItem}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setSelectedItem(null);
        }}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
