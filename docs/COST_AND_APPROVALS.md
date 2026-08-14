# Cost warnings and required approvals

**Rule:** Do not purchase, subscribe, or activate paid services without explicit owner approval. This document is the stop point.

Development-time cost means "money the owner must spend for an engineer to finish that phase against real services." It is not a calendar estimate.

Prices below were checked against official pages on 2026-08-14. Recheck before paying.

---

## Approval matrix

| ID | Item | Phase blocked | Cost class | Ask |
| --- | --- | --- | --- | --- |
| A0 | This implementation plan | 1 | Free | Approve architecture |
| A1 | Create Supabase project | 1 live auth | Free (dev) | Owner creates project, pastes URL + anon key + service role into GitHub/EAS secrets — **not into git** |
| A2 | Google Cloud OAuth clients | Google login | Free | Owner creates Web/iOS/Android client IDs |
| A3 | Expo account | 7 builds | Free | Owner logs into EAS |
| A4 | OpenAI API | 2 live analysis | **Paid usage** | Approved with **$20 development cap**. Stop and re-ask before exceeding. |
| A5 | eBay developer app | 4 live products | Free | Owner registers at developer.ebay.com |
| A6 | Supabase Pro | Production uptime | **$25/mo** | **Do not upgrade automatically.** Free plan for development. Idle pause is acceptable. |
| A7 | EAS Starter | Custom domain / heavier hosting | **$19/mo** optional | Only if Free hosting is insufficient |
| A8 | Apple Developer | iOS ship + IAP | **$99/year** | Phase 7 / 5 |
| A9 | Google Play Console | Android ship + Play Billing | **$25 once** | Phase 7 / 5 |
| A10 | Stripe account | Web checkout | Fees on charges | Phase 5 |
| A11 | RevenueCat account | Cross-platform entitlements | Free until $2.5k MTR | Phase 5 |
| A12 | Custom domain | Branded web | Domain registrar | Optional |
| A13 | Gemini, SerpAPI, Amazon, others | Not in V1 default | Paid / restricted | Do not activate |

---

## COST CHECK — OpenAI API

- **Service:** OpenAI API  
- **Purpose:** Vision clothing classification and structured outfit-request parsing  
- **Why needed:** V1 requires real AI analysis and schema-valid JSON. OpenAI structured outputs enforce the schema. API inputs/outputs are not used for training by default.  
- **Free option:** None for production API (new accounts may have a small credit). Gemini Free exists but **uses content to improve Google's products** — unacceptable for personal photos.  
- **Expected development cost:** $5–30 of usage to iterate on prompts and fixtures. Set a billing hard cap in the OpenAI dashboard.  
- **Expected monthly production cost:** Usage-based. `gpt-4.1-mini` is $0.40 / 1M input tokens and $1.60 / 1M output tokens (official model card, 2026).  
- **Expected usage-based cost:** Unknown until measured. Do **not** treat $0.02–$0.09 as guaranteed. Ledger `ai_requests` is the source of truth.  
- **Alternative:** Paid Gemini (content not used to improve products) — cheaper, slightly weaker guaranteed JSON. Anthropic Claude — strong vision, higher price, structured output via tools.  
- **Recommendation:** OpenAI approved with a **$20 development cap**. Stop and request approval before exceeding it. Do not use Gemini Free.

---

## COST CHECK — Supabase

- **Service:** Supabase (Postgres, Auth, Storage)  
- **Purpose:** Real accounts, RLS, private image storage  
- **Why needed:** Specified data layer. Avoids running a separate auth + DB + object store.  
- **Free option:** Free plan: 2 projects, 500 MB DB, 1 GB files, 50k MAU. **Pauses after 1 week idle. No backups.**  
- **Expected development cost:** $0  
- **Expected monthly production cost:** Pro **$25/mo** (includes Micro compute credit) for no pausing, backups, 8 GB disk, 100 GB storage.  
- **Expected usage-based cost:** Storage and egress beyond plan. Images are the driver. Compress before upload.  
- **Alternative:** Self-host Supabase (ops cost) or Postgres + Auth0 + S3 (more moving parts).  
- **Recommendation:** Stay on Free during development. Do **not** upgrade to Pro automatically. Idle pause after one week is acceptable in development. Ask before upgrading for production.

---

## COST CHECK — Expo EAS

- **Service:** EAS Build + EAS Hosting  
- **Purpose:** iOS/Android binaries and hosting for web + API routes  
- **Why needed:** Official path for Expo production builds and API-route hosting.  
- **Free option:** 15 iOS + 15 Android builds/month; Hosting 100k requests, 1 GB storage, **10 CPU-ms/request**, 10 subrequests.  
- **Expected development cost:** $0 if we stay on Free quotas  
- **Expected monthly production cost:** $0 until quotas break. Starter is **$19/mo** (custom domain, 30,000 CPU-ms/request, 1,000 subrequests).  
- **Expected usage-based cost:** Extra builds $1–4 each; hosting $2 / 1M requests after included.  
- **Alternative:** Local/dev-client builds; web on another Node host using `expo-server` adapters.  
- **Recommendation:** Start Free. Revisit Starter in Phase 7 if API routes need more CPU/subrequests.

---

## COST CHECK — eBay Browse API

- **Service:** eBay Buy Browse API  
- **Purpose:** Real clothing/product search with official item URLs and prices  
- **Why needed:** Production must not hallucinate products.  
- **Free option:** Developer program is free. Default ~5,000 calls/day per app. Sandbox + production keys. Growth Check for higher limits.  
- **Expected development cost:** $0  
- **Expected monthly production cost:** $0 at V1 volume if we cache aggressively  
- **Expected usage-based cost:** Opportunity cost of quota. Cache TTL 24h. One search per missing slot, not per screen load.  
- **Alternative:** Etsy Open API (narrower catalog). Amazon Creators API (Associates + sales required). Paid Google Shopping SERP APIs (scraping-adjacent, $25+/mo).  
- **Recommendation:** Approve. Owner creates the eBay developer app. No purchase.

---

## COST CHECK — Apple Developer Program

- **Service:** Apple Developer Program  
- **Purpose:** Ship on the App Store and sell iOS subscriptions (IAP required)  
- **Why needed:** First-class iOS.  
- **Free option:** Simulator and Expo Go for development. TestFlight/IAP need the program.  
- **Expected development cost:** **$99/year**  
- **Expected monthly production cost:** $99/year amortized; Apple takes 15–30% of IAP.  
- **Expected usage-based cost:** None from Apple beyond commission.  
- **Alternative:** Web-only V1 (conflicts with "App Store is first-class").  
- **Recommendation:** Delay until Phase 7. Do not buy now.

---

## COST CHECK — Google Play Console

- **Service:** Google Play developer account  
- **Purpose:** Ship Android and Play Billing  
- **Why needed:** First-class Android.  
- **Free option:** Emulator / Expo Go.  
- **Expected development cost:** **$25 one-time**  
- **Expected monthly production cost:** Play commission 15–30% of IAP.  
- **Expected usage-based cost:** None beyond commission.  
- **Alternative:** Web-only.  
- **Recommendation:** Delay until Phase 7. Do not buy now.

---

## COST CHECK — RevenueCat

- **Service:** RevenueCat  
- **Purpose:** Normalize IAP + web billing into one entitlement  
- **Why needed:** Same user on iOS, Android, and web must share Pro.  
- **Free option:** Free until $2,500 monthly tracked revenue, then 1%.  
- **Expected development cost:** $0  
- **Expected monthly production cost:** $0 until $2.5k MTR  
- **Expected usage-based cost:** 1% of MTR after threshold; plus Apple/Google/Stripe fees  
- **Alternative:** Direct StoreKit + Play Billing + Stripe (more code, easy to desync).  
- **Recommendation:** Create a free account in Phase 5. Do not put a credit card unless they require one for Web Billing/Stripe linking.

---

## COST CHECK — Stripe

- **Service:** Stripe (via RevenueCat Web Billing)  
- **Purpose:** Web subscriptions  
- **Why needed:** Web cannot use IAP.  
- **Free option:** Test mode is free. Live charges: US cards typically 2.9% + $0.30.  
- **Expected development cost:** $0 (test mode)  
- **Expected monthly production cost:** Processing fees only  
- **Expected usage-based cost:** Per successful charge  
- **Alternative:** Paddle, Lemon Squeezy.  
- **Recommendation:** Test mode in Phase 5. Live keys only after owner approval.

---

## COST CHECK — Gemini (not selected)

- **Service:** Google Gemini API  
- **Purpose:** Cheaper vision  
- **Why needed:** Not needed if OpenAI is approved  
- **Free option:** Yes, but **content is used to improve Google products**  
- **Expected development cost:** $0 on Free (privacy-incompatible)  
- **Expected monthly production cost:** Paid Flash is low (e.g. Gemini 2.5 Flash historically cents per million tokens; 3.7 Flash paid ~$0.75–$1.50 / 1M input as of this writing)  
- **Expected usage-based cost:** Lower than OpenAI  
- **Alternative:** OpenAI  
- **Recommendation:** Do **not** use Free. Optionally add a paid Gemini adapter later. Not V1 default.

---

## COST CHECK — Paid product search (not selected)

- **Service:** SerpAPI / similar Google Shopping APIs  
- **Purpose:** Broader retailer coverage  
- **Why needed:** Not needed if eBay is accepted for V1  
- **Free option:** Tiny trial credits  
- **Expected development cost:** ~$25+ for a starter month  
- **Expected monthly production cost:** Subscription or per-search  
- **Expected usage-based cost:** Per outfit gap search  
- **Alternative:** eBay Browse (official, free)  
- **Recommendation:** Do not purchase. Architecture supports adding a second provider later.

---

## What this agent will never do without approval

- Create paid cloud subscriptions
- Attach payment methods
- Submit to App Store or Play Store
- Buy a domain
- Enable Gemini Free on user photos
- Turn on live Stripe charges
- Scrape retailers
