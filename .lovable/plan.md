

# Smart Wardrobe Analytics and Shopping Assistant

## Concept

A comprehensive analytics and intelligent shopping module that transforms the app from a "what to wear today" tool into a full wardrobe management platform. Users gain deep insights into their clothing habits, spending, and gaps -- and receive AI-powered purchase recommendations.

## Feature Blocks

### 1. Outfit Calendar (Daily Logging)

Users mark what they wore each day (from AI suggestions or manually). This creates the data foundation for all analytics.

- Calendar view on Dashboard or dedicated page `/app/calendar`
- Quick-log: tap a day, select items from wardrobe
- Auto-log from accepted AI suggestions
- Photo of the day (optional selfie)

**Database: `outfit_logs` table**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| date | date | Wear date |
| wardrobe_item_ids | uuid[] | Items worn |
| photo_url | text | Optional outfit photo |
| occasion | text | casual, work, event... |
| weather_snapshot | jsonb | Weather on that day |
| from_ai_suggestion | boolean | Was it an AI pick? |
| created_at | timestamptz | Timestamp |

### 2. Wardrobe Analytics Dashboard

A new page `/app/analytics` with visual charts and insights:

- **Cost-per-wear**: item price / times worn (highlights best and worst investments)
- **Wear frequency**: most and least worn items (identify "forgotten" clothes)
- **Category balance**: pie chart of wardrobe composition vs ideal ratios
- **Color palette analysis**: dominant colors in wardrobe, missing color groups
- **Seasonal readiness**: % of wardrobe suitable for upcoming season
- **Monthly/yearly spending**: how much added to wardrobe over time
- **"Dead wardrobe" alert**: items not worn in 60+ days

Uses `recharts` (already installed) for all visualizations.

### 3. AI Shopping Assistant

Based on analytics, the AI identifies wardrobe gaps and suggests what to buy:

- "You have 12 tops but only 2 bottoms -- consider adding pants"
- "Your wardrobe lacks warm outerwear for winter"
- "You wear navy often but have no matching accessories"
- Budget-aware suggestions based on user profile preferences
- Links to save suggestions as "saved" items in wardrobe wishlist

**Edge function: `ai-shopping-advisor`** -- analyzes full wardrobe composition, wear history, user style profile, and upcoming season to generate personalized recommendations.

### 4. Wardrobe Value Tracker

- Total wardrobe value (sum of prices)
- Value by category
- Average item cost
- "Investment pieces" vs "basics" breakdown
- Export wardrobe report (for insurance, moving, etc.)

## Technical Architecture

### New Database Tables

```
outfit_logs
  - id, user_id, date, wardrobe_item_ids, photo_url, occasion, weather_snapshot, from_ai_suggestion, created_at

wardrobe_analytics_cache (optional, for performance)
  - id, user_id, computed_at, analytics_data (jsonb)
```

### New / Modified Files

| File | Purpose |
|------|---------|
| `src/pages/platform/Calendar.tsx` | Outfit calendar page |
| `src/pages/platform/Analytics.tsx` | Analytics dashboard |
| `src/components/analytics/WearFrequencyChart.tsx` | Bar chart of item wear counts |
| `src/components/analytics/CostPerWearTable.tsx` | Table with cost/wear metrics |
| `src/components/analytics/CategoryPieChart.tsx` | Wardrobe composition pie chart |
| `src/components/analytics/ColorPaletteView.tsx` | Visual color distribution |
| `src/components/analytics/SeasonReadiness.tsx` | Seasonal coverage indicator |
| `src/components/analytics/DeadWardrobeAlert.tsx` | Unused items warning |
| `src/components/calendar/OutfitLogDialog.tsx` | Dialog to log daily outfit |
| `src/components/calendar/CalendarGrid.tsx` | Monthly calendar with outfit previews |
| `supabase/functions/ai-shopping-advisor/index.ts` | AI wardrobe gap analysis |
| `src/components/dashboard/ShoppingAdvice.tsx` | Shopping suggestions widget on dashboard |
| `src/App.tsx` | Add new routes |
| `src/components/layout/PlatformSidebar.tsx` | Add navigation items |
| `src/components/layout/PlatformMobileNav.tsx` | Add mobile nav items |

### New Edge Function: `ai-shopping-advisor`

Accepts user's wardrobe summary (category counts, color distribution, season coverage, wear stats) and style profile. Returns structured recommendations using Gemini Flash with function calling.

### Navigation Updates

Add two new items to sidebar and mobile nav:
- Calendar (CalendarDays icon)
- Analytics (BarChart3 icon)

## Implementation Order

1. Database migration: create `outfit_logs` table with RLS
2. Calendar page with outfit logging
3. Analytics page with charts (recharts)
4. Auto-logging from AI stylist suggestions
5. AI Shopping Advisor edge function
6. Shopping advice widget on Dashboard
7. Navigation updates

## Why This Matters for 2026

- **Data moat**: the more users log, the smarter recommendations get
- **Retention driver**: daily logging habit keeps users coming back
- **Monetization angle**: shopping recommendations can integrate affiliate links
- **Unique differentiator**: most wardrobe apps lack analytics depth
- **Sustainability angle**: "wear what you have" resonates with conscious consumers

