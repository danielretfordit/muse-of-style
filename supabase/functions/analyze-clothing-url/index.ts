import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Category mapping for AI response
const categoryMapping: Record<string, string> = {
  "tops": "tops",
  "top": "tops",
  "shirt": "tops",
  "blouse": "tops",
  "sweater": "tops",
  "t-shirt": "tops",
  "свитер": "tops",
  "блузка": "tops",
  "футболка": "tops",
  "рубашка": "tops",
  "верх": "tops",
  
  "bottoms": "bottoms",
  "bottom": "bottoms",
  "pants": "bottoms",
  "jeans": "bottoms",
  "skirt": "bottoms",
  "shorts": "bottoms",
  "брюки": "bottoms",
  "джинсы": "bottoms",
  "юбка": "bottoms",
  "шорты": "bottoms",
  "низ": "bottoms",
  
  "dresses": "dresses",
  "dress": "dresses",
  "платье": "dresses",
  
  "outerwear": "outerwear",
  "coat": "outerwear",
  "jacket": "outerwear",
  "blazer": "outerwear",
  "пальто": "outerwear",
  "куртка": "outerwear",
  "пиджак": "outerwear",
  "верхняя одежда": "outerwear",
  
  "shoes": "shoes",
  "shoe": "shoes",
  "boots": "shoes",
  "sneakers": "shoes",
  "heels": "shoes",
  "обувь": "shoes",
  "ботинки": "shoes",
  "кроссовки": "shoes",
  "туфли": "shoes",
  "сапоги": "shoes",
  
  "accessories": "accessories",
  "accessory": "accessories",
  "bag": "accessories",
  "belt": "accessories",
  "scarf": "accessories",
  "jewelry": "accessories",
  "аксессуары": "accessories",
  "сумка": "accessories",
  "ремень": "accessories",
  "шарф": "accessories",
};

// Color mapping
const colorMapping: Record<string, string> = {
  "black": "black",
  "чёрный": "black",
  "черный": "black",
  "white": "white",
  "белый": "white",
  "gray": "gray",
  "grey": "gray",
  "серый": "gray",
  "beige": "beige",
  "бежевый": "beige",
  "brown": "brown",
  "коричневый": "brown",
  "navy": "navy",
  "тёмно-синий": "navy",
  "темно-синий": "navy",
  "blue": "blue",
  "синий": "blue",
  "голубой": "blue",
  "red": "red",
  "красный": "red",
  "pink": "pink",
  "розовый": "pink",
  "green": "green",
  "зелёный": "green",
  "зеленый": "green",
  "yellow": "yellow",
  "жёлтый": "yellow",
  "желтый": "yellow",
  "purple": "purple",
  "фиолетовый": "purple",
  "orange": "orange",
  "оранжевый": "orange",
  "multicolor": "multicolor",
  "многоцветный": "multicolor",
};

function normalizeCategory(category: string): string {
  const lower = category.toLowerCase().trim();
  return categoryMapping[lower] || "accessories";
}

function normalizeColor(color: string): string {
  const lower = color.toLowerCase().trim();
  return colorMapping[lower] || "multicolor";
}

async function fetchImageFromUrl(url: string): Promise<{ base64: string; contentType: string } | null> {
  try {
    let imageUrl = url;
    
    // Handle Pinterest URLs - need to extract the actual image
    if (url.includes("pinterest.com") || url.includes("pin.it")) {
      // First, follow redirects to get the actual Pinterest URL
      let finalUrl = url;
      
      if (url.includes("pin.it")) {
        // Short URL - need to follow redirect
        const redirectResponse = await fetch(url, {
          method: "HEAD",
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        finalUrl = redirectResponse.url;
        console.log("Followed redirect to:", finalUrl);
      }
      
      // Fetch the Pinterest page
      const pageResponse = await fetch(finalUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });
      
      if (!pageResponse.ok) {
        console.error("Failed to fetch Pinterest page:", pageResponse.status);
        return null;
      }
      
      const html = await pageResponse.text();
      
      // Try multiple patterns to extract the image URL
      const patterns = [
        // og:image meta tag
        /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/,
        /<meta[^>]*content="([^"]+)"[^>]*property="og:image"/,
        // Pinterest specific patterns
        /"orig":\s*\{\s*"url":\s*"([^"]+)"/,
        /"originals":\s*\{\s*"url":\s*"([^"]+)"/,
        /"736x":\s*\{\s*"url":\s*"([^"]+)"/,
        /"564x":\s*\{\s*"url":\s*"([^"]+)"/,
        // Image in script data
        /"image_url":\s*"([^"]+)"/,
        /"imageSpec_orig":\s*\{\s*"url":\s*"([^"]+)"/,
        // Direct image URLs in HTML
        /src="(https:\/\/i\.pinimg\.com\/[^"]+)"/,
      ];
      
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          imageUrl = match[1].replace(/\\u002F/g, "/").replace(/\\/g, "");
          console.log("Extracted Pinterest image URL:", imageUrl);
          break;
        }
      }
      
      if (imageUrl === url || imageUrl === finalUrl) {
        console.error("Could not extract image URL from Pinterest page");
        console.log("HTML snippet:", html.substring(0, 2000));
        return null;
      }
    }
    
    // Fetch the actual image
    console.log("Fetching image from:", imageUrl);
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });
    
    if (!imageResponse.ok) {
      console.error("Failed to fetch image:", imageResponse.status);
      return null;
    }
    
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imageResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);
    
    console.log("Successfully fetched image, size:", uint8Array.length, "bytes");
    return { base64, contentType };
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    console.log("analyze-clothing-url called by user:", userId);

    const body = await req.json();
    const { url, language: lang } = body;
    const language = typeof lang === "string" && ["ru", "en"].includes(lang) ? lang : "ru";

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (url.length > 2000) {
      return new Response(
        JSON.stringify({ error: "URL is too long (max 2000 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL format
    try {
      const parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return new Response(
          JSON.stringify({ error: "Only HTTP and HTTPS URLs are allowed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing URL:", url);

    // Fetch image from URL
    const imageData = await fetchImageFromUrl(url);
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "Could not fetch image from URL. Please try uploading the image directly." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call AI to analyze the image
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = language === "ru" 
      ? `Ты - эксперт по моде. Проанализируй изображение одежды и определи:
1. Название предмета (кратко, например: "Кашемировый свитер" или "Шёлковая блузка")
2. Бренд (если видно на изображении, иначе null)
3. Категория (одна из: tops, bottoms, dresses, outerwear, shoes, accessories)
4. Основной цвет (один из: black, white, gray, beige, brown, navy, blue, red, pink, green, yellow, purple, orange, multicolor)
5. Краткое описание (материал, стиль, особенности - 1-2 предложения)

Отвечай ТОЛЬКО на русском языке.`
      : `You are a fashion expert. Analyze the clothing image and determine:
1. Item name (brief, e.g., "Cashmere Sweater" or "Silk Blouse")
2. Brand (if visible in the image, otherwise null)
3. Category (one of: tops, bottoms, dresses, outerwear, shoes, accessories)
4. Main color (one of: black, white, gray, beige, brown, navy, blue, red, pink, green, yellow, purple, orange, multicolor)
5. Brief description (material, style, features - 1-2 sentences)`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${imageData.contentType};base64,${imageData.base64}` },
              },
              {
                type: "text",
                text: language === "ru" 
                  ? "Проанализируй эту вещь и заполни данные."
                  : "Analyze this clothing item and fill in the data.",
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "set_clothing_details",
              description: "Set the analyzed clothing details",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Name of the clothing item",
                  },
                  brand: {
                    type: "string",
                    nullable: true,
                    description: "Brand name if visible, null otherwise",
                  },
                  category: {
                    type: "string",
                    enum: ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"],
                    description: "Category of the item",
                  },
                  color: {
                    type: "string",
                    enum: ["black", "white", "gray", "beige", "brown", "navy", "blue", "red", "pink", "green", "yellow", "purple", "orange", "multicolor"],
                    description: "Main color of the item",
                  },
                  description: {
                    type: "string",
                    description: "Brief description of the item",
                  },
                },
                required: ["name", "category", "color"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "set_clothing_details" } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData));

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "set_clothing_details") {
      return new Response(
        JSON.stringify({ error: "AI did not return expected data format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Return the analysis along with the image
    return new Response(
      JSON.stringify({
        success: true,
        imageBase64: `data:${imageData.contentType};base64,${imageData.base64}`,
        analysis: {
          name: analysis.name || "",
          brand: analysis.brand || "",
          category: normalizeCategory(analysis.category || "accessories"),
          color: normalizeColor(analysis.color || "multicolor"),
          description: analysis.description || "",
        },
        sourceUrl: url,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing URL:", error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
