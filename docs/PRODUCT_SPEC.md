# STYLEAI — PRODUCTION V1 MASTER BUILD SPECIFICATION

## ROLE

You are the lead staff engineer, product architect, security engineer, AI systems engineer, and DevOps engineer responsible for building **StyleAI**, a production-ready consumer AI styling and shopping SaaS.

This is NOT a prototype.

This is NOT a demo.

This is NOT a fake SaaS with hardcoded responses.

This is NOT a UI mockup.

The objective is to create a real, deployable V1 whose core user workflow genuinely works end-to-end.

The application must have:

* Real authentication
* Real persistent database
* Real user accounts
* Real image uploads
* Real wardrobe persistence
* Real AI analysis
* Real outfit generation
* Real product discovery
* Real product links
* Real subscription/entitlement architecture
* Real usage tracking
* Real error handling
* Real security
* Real server-side API protection
* Real testing
* Real deployment configuration
* No fake demo mode
* No hardcoded fake AI responses
* No fake product data presented as real
* No exposed API secrets
* Full source-code ownership by the repository owner

The application should be architected so that individual AI providers, product providers, payment providers, and infrastructure services can be replaced without rewriting the entire application.

Do not optimize for speed at the expense of architecture.

Do not build unnecessary complexity.

Build a small but complete production system.

---

# 1. PRODUCT VISION

StyleAI is a consumer AI personal styling and shopping assistant.

The core promise:

> Upload yourself and your wardrobe. Tell StyleAI what you're dressing for. StyleAI builds outfits from what you already own, identifies missing pieces when useful, finds real products that complete the outfit, and gives you actual purchase links.

The product should save users:

* Time
* Decision fatigue
* Money
* Research effort

The product should NOT merely generate generic AI fashion advice.

The central intelligence loop is:

USER
↓
PERSONAL STYLE PROFILE
↓
WARDROBE
↓
OCCASION / CONSTRAINTS
↓
OUTFIT REQUIREMENTS
↓
WARDROBE RETRIEVAL
↓
OUTFIT CONSTRUCTION
↓
MISSING-ITEM DETECTION
↓
REAL PRODUCT SEARCH
↓
PRODUCT NORMALIZATION
↓
PRODUCT RANKING
↓
FINAL OUTFIT
↓
SAVE / SHOP / REGENERATE

---

# 2. PRIMARY V1 USER EXPERIENCE

A new user should be able to:

1. Open the application.
2. Create an account.
3. Sign in with email/password OR Google.
4. Complete a basic onboarding flow.
5. Upload a photo of themselves.
6. Create their digital wardrobe.
7. Upload individual clothing photos.
8. Optionally upload a photograph containing multiple clothing items.
9. Have clothing items analyzed by the AI.
10. Review and correct the AI's classification.
11. Save those items to their wardrobe.
12. Tell StyleAI what they need an outfit for.
13. Specify optional constraints:

    * Budget
    * Weather/temperature
    * Formality
    * Preferred colors
    * Brands
    * Items they do/don't want
14. Generate an outfit.
15. Have the system prioritize existing wardrobe items.
16. Identify missing items when appropriate.
17. Search real product inventory.
18. Display actual products.
19. Display retailer/product/price information when available.
20. Provide a real external product URL.
21. Save the outfit.
22. Regenerate alternatives.
23. Modify constraints.
24. Manage their profile.
25. Manage their wardrobe.
26. Manage their subscription.
27. Delete their account and associated data.

This entire workflow must work with real backend services.

---

# 3. PLATFORM STRATEGY

Build one universal application using:

* React Native
* Expo
* Expo Router
* TypeScript

Target:

* iOS
* Android
* Web

The codebase should use shared components and business logic wherever practical.

Do not create completely separate iOS, Android, and web applications.

Use platform-specific implementations only when technically necessary.

The application should be responsive on web and appropriately native on mobile.

The App Store experience is a first-class requirement.

The web application is also a first-class product surface.

---

# 4. REPOSITORY ARCHITECTURE

Use a clean monorepo architecture.

Recommended structure:

/apps
/mobile
/web

/packages
/ui
/types
/config
/api
/ai
/products
/database
/auth
/analytics
/billing
/validation
/utils

/docs

/scripts

/tests

Use the simplest architecture that preserves separation of concerns.

If Expo universal routing makes separate /apps/mobile and /apps/web unnecessary, you may instead use:

/apps/app

with universal Expo Router routes.

Choose the architecture that gives the cleanest long-term developer experience.

Document the decision in:

/docs/ARCHITECTURE.md

Do not create unnecessary abstraction layers.

---

# 5. CORE TECHNOLOGY PRINCIPLES

Use:

* TypeScript with strict mode
* ESLint
* Prettier
* Zod or equivalent runtime schema validation
* PostgreSQL through Supabase
* Supabase Auth
* Supabase Storage
* Server-side API routes/functions for protected operations
* Secure environment variables
* Structured logging
* Automated tests
* CI validation

Avoid:

* JavaScript where TypeScript is appropriate
* any types unless absolutely unavoidable
* duplicated business logic
* hardcoded secrets
* client-side privileged API calls
* direct database access that bypasses security rules
* fake data in production paths
* giant monolithic files
* magic strings scattered through the codebase

---

# 6. SECURITY REQUIREMENTS

Security is a production requirement.

Implement:

* Row Level Security in Supabase
* User ownership checks
* Server-side authorization
* Input validation
* Output validation
* Rate limiting where appropriate
* Secure image upload handling
* File-type validation
* File-size validation
* Secure API key storage
* No secret keys in client bundles
* No service-role keys exposed to clients
* Protection against unauthorized wardrobe access
* Protection against unauthorized outfit access
* Protection against unauthorized profile access
* Account deletion
* Data deletion workflows
* Safe external URL handling
* Logging without leaking sensitive information

Every database table containing user-owned data must have appropriate RLS policies.

Test those policies.

A user must never be able to query another user's:

* Profile
* Photos
* Wardrobe
* Outfits
* Preferences
* Usage
* Billing metadata

---

# 7. AUTHENTICATION

Implement:

### Email/password

* Sign up
* Login
* Logout
* Password reset
* Email verification if supported/configured
* Session persistence

### Google

Implement Google OAuth through the chosen auth provider.

Authentication must be real.

No fake accounts.

No development bypass.

No "skip authentication" production mode.

Create a clean auth abstraction so the underlying provider can be changed later.

---

# 8. USER PROFILE

Create a structured user profile.

Suggested fields:

* id
* display_name
* profile_photo_id
* preferred_styles
* disliked_styles
* preferred_colors
* disliked_colors
* preferred_brands
* disliked_brands
* typical_budget
* size information
* fit preferences
* style goals
* onboarding_completed
* created_at
* updated_at

Do not infer sensitive personal characteristics from images.

Only collect information necessary for styling.

The user must be able to edit their profile.

---

# 9. IMAGE HANDLING

Users need to upload:

1. Profile/self photo
2. Individual clothing photos
3. Optional multi-item wardrobe photos

Implement:

* Image picker
* Camera support where platform permits
* Image upload
* Compression/resizing
* Validation
* Storage
* Metadata
* Secure access
* Deletion
* Retry behavior

Never upload unlimited-resolution images unnecessarily.

Optimize images for AI processing and storage.

Originals may be retained only where product functionality requires them.

Use secure storage patterns.

---

# 10. DIGITAL WARDROBE

Create a real digital wardrobe.

Each wardrobe item should have structured data.

Suggested schema:

WardrobeItem:

* id
* user_id
* image_id
* category
* subcategory
* color
* secondary_colors
* pattern
* material
* fit
* formality
* seasonality
* weather_suitability
* style_tags
* brand
* estimated_price
* user_notes
* ai_confidence
* user_verified
* created_at
* updated_at

The exact schema can evolve if justified.

Supported initial categories should include:

* Tops
* Bottoms
* Outerwear
* Shoes
* Accessories

Subcategories should cover common clothing types.

Do not attempt to model every fashion category in V1.

---

# 11. CLOTHING ANALYSIS

When a user uploads an item:

1. Validate image.
2. Store image.
3. Send image to the selected vision-capable AI service.
4. Request structured classification.
5. Validate the response against a schema.
6. Store structured attributes.
7. Present results to the user.
8. Allow user correction.
9. Mark whether attributes are AI-generated or user-confirmed.

The AI must return structured JSON matching a strict schema.

Do not store raw AI prose as the canonical clothing representation.

Example:

{
"category": "top",
"subcategory": "oxford_shirt",
"primaryColor": "white",
"pattern": "solid",
"formality": "smart_casual",
"seasonality": ["spring", "summer", "fall"],
"styleTags": ["classic", "minimal"],
"confidence": 0.94
}

The exact schema should be implemented with runtime validation.

If AI output fails validation:

* Retry once if appropriate.
* Otherwise surface a recoverable error.
* Never silently save malformed data.

---

# 12. WHOLE-CLOSET PHOTO PROCESSING

Support a multi-item image flow.

The AI should identify likely individual garments.

However:

Do NOT assume perfect segmentation.

If multiple garments are detected:

1. Show detected items.
2. Let the user review them.
3. Let the user discard incorrect detections.
4. Let the user edit classifications.
5. Save only confirmed items.

This is preferable to silently polluting the wardrobe with bad data.

---

# 13. STYLE PROFILE ENGINE

Create a structured representation of the user's style preferences.

It should combine:

* Explicit user preferences
* Confirmed wardrobe attributes
* User feedback on outfits
* Saved outfits
* Disliked outfits
* Future behavioral signals

Do not make the initial V1 excessively complex.

The style profile should be extensible.

The goal is to eventually allow:

> "StyleAI learns what I actually like."

But V1 should not pretend to have sophisticated long-term personalization until sufficient data exists.

---

# 14. OUTFIT GENERATION ENGINE

This is the core intelligence system.

Do not make one giant LLM prompt responsible for everything.

Separate the pipeline.

## Stage 1 — Parse user request

Convert:

> "I need something for a nice dinner Friday, under $100."

into structured constraints.

Example:

{
"occasion": "dinner",
"formality": "smart_casual",
"budget": 100,
"weather": null,
"preferred_colors": [],
"excluded_items": []
}

Validate the output.

## Stage 2 — Retrieve wardrobe

Retrieve relevant wardrobe items.

Do not send the entire wardrobe blindly to the model if unnecessary.

Use structured filtering first.

## Stage 3 — Construct outfit requirements

Determine:

* Required categories
* Formality
* Color compatibility
* Seasonal suitability
* Weather suitability
* User preferences
* Budget

## Stage 4 — Construct candidate outfits

Generate multiple candidate combinations from existing wardrobe.

## Stage 5 — Evaluate candidates

Score candidates using deterministic rules plus AI reasoning.

Consider:

* Compatibility
* Occasion fit
* Formality
* Color harmony
* Weather
* User preferences
* Wardrobe utilization

## Stage 6 — Identify gaps

Only identify missing pieces when necessary.

Do not recommend buying something merely because it could make the outfit slightly better.

Prioritize:

> Use what the user already owns.

## Stage 7 — Search real products

Search the product provider for missing items.

## Stage 8 — Rank products

Rank by:

* Outfit compatibility
* User preferences
* Price
* Brand preferences
* Color
* Category
* Availability where available
* Product quality signals where available
* Retailer reliability
* Match confidence

## Stage 9 — Final response

Return a structured outfit.

---

# 15. REAL PRODUCT SEARCH

This is a critical system.

Do not hallucinate products.

Do not generate fake URLs.

Do not invent prices.

Do not use placeholder products in production.

Create a provider interface:

ProductProvider

with methods conceptually equivalent to:

* searchProducts()
* getProduct()
* normalizeProduct()
* getProductAvailability() where supported
* getRetailer()
* generateTrackingUrl() where supported

The rest of the application must depend on the interface, not a specific provider.

For V1:

* Start with a small number of legitimate product data sources.
* Use real products.
* Store normalized product records/cached results where appropriate.
* Preserve source attribution.
* Preserve retailer URL.
* Preserve affiliate URL separately when available.

The system must be designed so additional retailers/providers can be added without rewriting outfit generation.

Before implementing a paid product API:

STOP.

Tell the user:

1. Provider name
2. What it provides
3. Why we need it
4. Free-tier limitations
5. Exact expected development cost
6. Expected production cost drivers
7. Alternatives considered

Do not purchase or activate paid services automatically.

---

# 16. PRODUCT NORMALIZATION

Different retailers will have different schemas.

Normalize them into a common structure:

Product:

* id
* provider
* provider_product_id
* title
* brand
* category
* subcategory
* description
* price
* currency
* original_price
* image_url
* product_url
* affiliate_url
* colors
* sizes
* material
* attributes
* availability
* retailer
* fetched_at
* expires_at

Never overwrite provider data in a way that prevents debugging.

---

# 17. PRODUCT FRESHNESS

Product information becomes stale.

Implement timestamps and freshness logic.

Do not treat cached product information as permanently accurate.

If a product is too old:

* Refresh it
* Remove it from recommendations
* Or mark it stale

The exact TTL should depend on provider behavior.

---

# 18. AFFILIATE ARCHITECTURE

Design for affiliate monetization from the beginning.

Product records should distinguish:

product_url

from:

affiliate_url

The user should be transparently informed when a product link may generate a commission, according to applicable requirements.

Do not manipulate product rankings solely because an affiliate commission is higher.

User trust is more important than short-term affiliate revenue.

---

# 19. OUTFIT RESULT

An outfit should have a structured representation.

Example:

Outfit:

* id
* user_id
* title
* occasion
* constraints
* wardrobe_item_ids
* recommended_product_ids
* reasoning
* score
* saved
* created_at

The UI should be able to render:

Existing items:

[User's Shirt]
[User's Pants]
[User's Shoes]

Recommended:

[Real Product]
Price
Retailer
Why it fits
Purchase link

The product should clearly distinguish:

"Already in your wardrobe"

from:

"Recommended purchase"

---

# 20. OUTFIT REGENERATION

Users should be able to:

* Generate another outfit
* Keep specific items
* Exclude specific items
* Increase/decrease formality
* Increase/decrease budget
* Change color preferences

Do not regenerate the same outfit repeatedly.

Maintain enough context to produce meaningful alternatives.

---

# 21. SAVED OUTFITS

Implement:

* Save
* Unsave
* Rename
* Delete
* View
* Regenerate

Saved outfits must persist across sessions/devices.

---

# 22. SUBSCRIPTIONS / MONETIZATION

The application is a SaaS.

Do not build it as completely free.

However, the initial pricing strategy should be conservative.

Architect for:

### Free tier

Limited usage.

Potentially:

* Limited wardrobe size
* Limited outfit generations
* Limited product recommendations

### Pro tier

Higher/unlimited usage subject to fair-use/cost controls.

Potentially:

* Larger wardrobe
* More generations
* Advanced constraints
* Personalized recommendations
* More saved outfits
* Future premium features

Do not hardcode final prices.

Store plans/configuration centrally.

Use a subscription/entitlement abstraction.

For mobile purchases, use the platform-compliant IAP architecture.

Use RevenueCat or another appropriate subscription abstraction if justified.

For web, support an appropriate web payment flow.

The same user must have consistent entitlement status across platforms.

The billing architecture must support:

* Trial if later desired
* Subscription
* Cancellation
* Expiration
* Restoration
* Cross-platform entitlement
* Webhook processing
* Grace periods where supported
* Billing failure
* Account deletion

Never grant premium access based solely on a client-side boolean.

---

# 23. USAGE METERING

Track meaningful AI/product usage.

Examples:

* wardrobe_analysis
* outfit_generation
* product_search
* image_generation
* profile_analysis

Create a usage ledger or equivalent.

Track:

* user_id
* operation
* provider
* model
* timestamp
* status
* estimated/actual cost when available
* request metadata
* response metadata where safe

This is essential for SaaS economics.

---

# 24. COST CONTROL

The system must be designed to minimize unnecessary AI calls.

Examples:

BAD:

User views same wardrobe item
→ AI analyzes it again.

GOOD:

Upload
→ AI analyzes once
→ structured attributes stored
→ reused.

BAD:

Every screen load calls AI.

GOOD:

Persist and cache results.

Implement appropriate caching.

Do not cache user-specific data in a way that can leak across users.

---

# 25. AI PROVIDER ABSTRACTION

Do not hard-code the entire application to one AI company.

Create interfaces such as:

VisionProvider

ReasoningProvider

ImageGenerationProvider

EmbeddingProvider if later required

The initial implementation may use one provider for multiple capabilities.

However, business logic must depend on interfaces.

Provider configuration should live in one place.

Each AI request must have:

* Model
* Task
* Input schema
* Output schema
* Timeout
* Retry policy
* Error handling

Never blindly trust model output.

Validate every structured AI response.

---

# 26. IMAGE GENERATION / VIRTUAL TRY-ON

Do NOT make virtual try-on a dependency of V1.

Architect a future interface such as:

VirtualTryOnProvider

But do not block the product from functioning without it.

V1 must be fully valuable without generated images of the user wearing clothes.

The system may display:

* User wardrobe item images
* Product images
* Outfit composition
* Structured outfit presentation

A future provider can be plugged into the architecture later.

---

# 27. UI / UX FOUNDATION

The UI does not need to be the final brand design.

However, it must already look like a legitimate consumer SaaS.

Do NOT create:

* developer-looking dashboards
* raw HTML forms
* ugly default components
* excessive text
* placeholder lorem ipsum
* obvious template UI

The foundation should have:

* coherent spacing
* typography hierarchy
* reusable components
* responsive layouts
* polished states
* loading states
* empty states
* error states
* skeleton states
* accessible controls
* mobile-first interaction patterns

Do not spend weeks polishing colors or branding.

Use a clean neutral design system that can later be replaced through Figma-driven implementation.

Create reusable tokens for:

* spacing
* typography
* radius
* shadows
* elevation
* layout
* motion
* component states

Do not scatter styling constants everywhere.

---

# 28. CORE SCREENS

Implement functional versions of:

## Public

* Landing
* Sign up
* Login
* Forgot password
* Privacy policy
* Terms
* Pricing

## Authenticated

* Home
* Onboarding
* My Style
* Wardrobe
* Add Clothing
* Clothing Item Detail/Edit
* Create Outfit
* Outfit Results
* Saved Outfits
* Product Detail
* Profile
* Settings
* Subscription/Billing
* Account deletion

## Future-ready

* Virtual Try-On
* Style history
* Recommendations
* Notifications

Do not implement future features as fake buttons.

If a future feature is not implemented, either omit it or clearly keep it out of the production navigation.

---

# 29. ONBOARDING

Onboarding should quickly establish:

1. Who the user is
2. Their style preferences
3. What they typically wear
4. Budget
5. Favorite/disliked styles
6. Profile photo
7. Initial wardrobe

Do not make onboarding excessively long.

Users should reach the first meaningful outfit result quickly.

---

# 30. HOME SCREEN

The home screen should answer:

> "What can StyleAI do for me right now?"

Possible primary actions:

* Create an outfit
* Add clothes
* View wardrobe
* Saved outfits

The primary CTA should be outfit creation.

---

# 31. DATABASE

Design a normalized PostgreSQL schema.

Likely entities:

users
profiles
user_preferences
media_assets
wardrobe_items
wardrobe_item_attributes
outfits
outfit_items
products
product_sources
product_searches
affiliate_clicks
subscriptions
entitlements
usage_events
ai_requests
feedback
saved_outfits
audit_events

Do not create every table just because it appears on this list.

Use judgment.

Avoid premature over-normalization.

Every table must have clear ownership and RLS policies.

Create migration files.

Never rely on manually edited production database state.

---

# 32. FEEDBACK SYSTEM

Users should be able to indicate:

* Like outfit
* Dislike outfit
* Not my style
* Too expensive
* Don't own this item
* Product irrelevant
* Product unavailable
* Wrong item classification

Store structured feedback.

This becomes the foundation for personalization.

---

# 33. ANALYTICS

Implement privacy-conscious product analytics.

Track events such as:

* sign_up
* onboarding_completed
* wardrobe_item_added
* wardrobe_item_verified
* outfit_generated
* outfit_saved
* outfit_liked
* outfit_disliked
* product_viewed
* product_clicked
* subscription_started
* subscription_cancelled

Do not collect unnecessary personal data.

---

# 34. ERROR HANDLING

Every external service can fail.

Handle:

* AI timeout
* AI malformed response
* AI rate limit
* Product provider timeout
* Product provider unavailable
* Image upload failure
* Database failure
* Auth failure
* Billing failure
* Network failure

User-facing errors should be understandable.

Developer-facing logs should contain enough diagnostic information.

Never expose:

* API keys
* stack traces
* database internals
* sensitive provider details

to ordinary users.

---

# 35. OBSERVABILITY

Create structured logs.

Track:

* request ID
* user ID where appropriate
* operation
* provider
* model
* duration
* status
* error class

Do not log sensitive image contents.

Do not log secrets.

Create a basic admin/observability mechanism sufficient to answer:

> "Why did this user's outfit generation fail?"

---

# 36. ADMIN ACCESS

Create a secure administrative architecture.

Do not create a hidden client-side admin password.

Admin authorization must be server-side.

Admin capabilities may eventually include:

* User count
* Active users
* Outfit generation count
* AI errors
* Product search errors
* Usage
* Subscription metrics
* Feedback

Keep V1 admin functionality minimal.

---

# 37. RATE LIMITING

Implement sensible limits for:

* Authentication attempts
* AI generation
* Image analysis
* Product search
* Account creation
* Password reset

Do not let a single user generate unlimited expensive requests.

Limits should be configurable.

---

# 38. TESTING REQUIREMENTS

Testing is mandatory.

Implement:

### Unit tests

For:

* Outfit scoring
* Constraint parsing
* Product normalization
* Budget logic
* Wardrobe filtering
* Ranking
* Validation

### Integration tests

For:

* Auth
* Database
* Wardrobe creation
* Outfit generation pipeline
* Product provider
* Subscription entitlement logic

### End-to-end tests

At minimum test:

1. Sign up
2. Complete onboarding
3. Upload clothing
4. Analyze clothing
5. Verify clothing
6. Create outfit
7. Receive outfit
8. Search products
9. Save outfit
10. Retrieve saved outfit
11. Logout
12. Login again
13. Verify persistence

Tests must use controlled test fixtures.

Do not use production user data.

---

# 39. ACCEPTANCE CRITERIA

A feature is NOT complete because:

* It compiles.
* The screen renders.
* The button exists.
* Cursor says it works.
* A mock response appears.

A feature is complete only when the actual workflow works end-to-end.

For the core workflow:

A user must be able to:

1. Create an account.
2. Upload themselves.
3. Upload clothing.
4. Have the clothing analyzed by a real AI provider.
5. Correct the result.
6. Persist the clothing.
7. Request an outfit.
8. Have the system retrieve wardrobe items.
9. Construct an outfit.
10. Determine whether something is missing.
11. Query real product data.
12. Return real products.
13. Return valid external URLs.
14. Save the outfit.
15. Retrieve it later.

No fake fallback responses.

If an external provider is unavailable, show an actual error/retry state.

---

# 40. DEVELOPMENT MODE VS PRODUCTION

You may use local development infrastructure.

You may use test fixtures and mocks inside automated tests.

However:

DO NOT create a "demo mode" that can accidentally become production.

Do not use fake AI responses in the actual production path.

Do not use fake product records in the production path.

Use explicit dependency injection for testing.

---

# 41. ENVIRONMENT MANAGEMENT

Create:

.env.example

Never commit:

.env

or secrets.

Document every environment variable.

Separate:

development
staging
production

where practical.

The application must fail clearly if a required production secret is missing.

Do not silently substitute fake values.

---

# 42. GIT REQUIREMENTS

Initialize a Git repository.

Create a clean .gitignore.

Make logical commits as development progresses.

Do not commit:

* API keys
* credentials
* .env files
* private certificates
* production secrets
* unnecessary build artifacts

Create:

README.md

with setup instructions.

Create:

docs/ARCHITECTURE.md

docs/ENVIRONMENT.md

docs/DEPLOYMENT.md

docs/AI_SYSTEM.md

docs/PRODUCT_DATA.md

docs/BILLING.md

docs/SECURITY.md

docs/TESTING.md

---

# 43. DEPLOYMENT

Prepare production deployment for:

### Web

Use a production-compatible Expo web deployment.

### Mobile

Prepare EAS build configuration for:

* iOS
* Android

The project must be capable of producing production builds.

Do not submit anything to an app store automatically.

Do not create paid developer accounts automatically.

Do not spend money automatically.

---

# 44. PAYMENT / PAID SERVICE SAFETY RULE

This rule overrides convenience.

If implementation requires:

* Paid API
* Paid hosting
* Paid database
* Paid product API
* Paid AI provider
* Apple developer fee
* Google developer fee
* RevenueCat paid feature
* Domain purchase
* Any other monetary commitment

STOP before activating it.

Tell the user:

## COST CHECK

Service:
Purpose:
Why needed:
Free option:
Expected development cost:
Expected monthly production cost:
Expected usage-based cost:
Alternative:
Recommendation:

Wait for explicit user approval before proceeding.

Never assume approval.

---

# 45. PROVIDER SELECTION

Do not blindly choose an AI provider because it is familiar.

Before integrating a production AI provider, evaluate candidates on:

* Vision quality
* Structured JSON reliability
* Reasoning quality
* Image understanding
* Latency
* Cost
* Rate limits
* SDK quality
* Commercial usage
* Reliability
* Ease of replacement

Choose objectively.

Document the decision.

Use a provider abstraction so replacement remains possible.

---

# 46. PRODUCT PROVIDER SELECTION

Evaluate product providers based on:

* Real inventory
* Product images
* Price
* Retailer coverage
* Product attributes
* Direct URLs
* Availability
* API stability
* Terms of use
* Affiliate compatibility
* Cost

Start with a smaller reliable provider set.

Architect the system so the provider layer can eventually aggregate many retailers.

Do not scrape retailers in ways that violate their terms.

Do not build an illegal or fragile scraping architecture.

---

# 47. PRODUCT SEARCH FALLBACK

The system should support multiple product providers eventually.

Create a provider registry:

ProductProviderRegistry

Conceptually:

Provider A
Provider B
Provider C
...

The outfit engine should not know which provider supplied a product.

It should only receive normalized Product objects.

---

# 48. AI OUTPUT CONTRACTS

Every AI operation must have a schema.

Examples:

ClothingAnalysisSchema

StyleProfileSchema

OutfitRequestSchema

OutfitPlanSchema

ProductSearchIntentSchema

ProductRankingSchema

Do not allow arbitrary AI text to directly control database writes.

Flow:

AI
→ Parse
→ Validate
→ Business rules
→ Persist

not:

AI
→ Database

---

# 49. BUSINESS LOGIC MUST NOT LIVE INSIDE UI COMPONENTS

UI components should not contain:

* AI prompts
* product ranking logic
* database authorization
* subscription entitlement logic
* pricing calculations

Those belong in services/domain modules.

This is essential for future mobile/web parity.

---

# 50. AI PROMPT MANAGEMENT

Centralize AI prompts.

Do not scatter giant prompt strings throughout the application.

Each AI task should have:

* system instructions
* input schema
* output schema
* model configuration
* version identifier

Track prompt versions.

This will allow future A/B testing and improvement.

---

# 51. AI COST TRACKING

For every AI request, record where possible:

* Provider
* Model
* Input token estimate
* Output token estimate
* Image count
* Operation
* Duration
* Success/failure
* Estimated cost

The objective is eventually to answer:

> "How much does one average outfit generation cost us?"

This is critical for subscription pricing.

---

# 52. PRIVACY

The product processes personal photographs.

Treat uploaded images as sensitive user content.

Implement:

* Private storage
* Access control
* User deletion
* Clear privacy documentation
* Minimal retention
* No public image URLs unless explicitly necessary
* No use of user photos for model training unless explicitly consented to and legally appropriate

Do not sell user data.

---

# 53. ACCOUNT DELETION

A user must be able to delete their account.

Deletion must cascade appropriately across:

* Profile
* Wardrobe
* Images
* Outfits
* Preferences
* Feedback
* Usage data where legally/operationally appropriate
* Other user-owned content

Be careful with billing records and legally required records.

Document retention behavior.

---

# 54. ACCESSIBILITY

Implement reasonable accessibility from V1:

* Semantic labels
* Sufficient contrast
* Keyboard navigation on web
* Screen-reader labels
* Touch targets
* Focus states
* Error messages
* Loading state announcements where appropriate

Do not treat accessibility as a later rewrite.

---

# 55. PERFORMANCE

Optimize:

* Image loading
* Image compression
* Database queries
* AI requests
* Product searches
* List rendering
* Caching

Do not fetch entire wardrobes/products unnecessarily.

Use pagination for large collections.

---

# 56. MOBILE REQUIREMENTS

The mobile experience must feel like a real app.

Support:

* Camera
* Photo library
* Upload progress
* Pull-to-refresh where appropriate
* Native navigation
* Safe areas
* Keyboard handling
* Offline-aware error states
* Deep links

Do not simply make the web UI appear inside a mobile shell.

---

# 57. WEB REQUIREMENTS

The web version should:

* Be responsive
* Support desktop layouts
* Support mobile browser
* Have accessible URLs
* Support deep linking
* Have appropriate metadata
* Have a public landing page
* Have authentication
* Have the same core product capabilities

---

# 58. FUTURE ARCHITECTURE

The following should be possible later without major rewrites:

* More retailers
* More affiliate networks
* More AI providers
* Virtual try-on
* AI-generated outfit visualization
* Weather integration
* Calendar integration
* Travel packing
* Style learning
* Personalized shopping feed
* Price tracking
* Product alerts
* Social sharing
* Referral system
* Push notifications
* More subscription tiers

Do NOT build all of these now.

Build the architecture so they are possible.

---

# 59. DO NOT OVERENGINEER

This is extremely important.

Do not create:

* Kubernetes
* Microservices
* Complex event buses
* Dozens of databases
* Custom ML models
* Custom vector infrastructure
* Complex recommendation infrastructure
* Massive admin systems

unless there is a concrete V1 requirement.

A well-structured modular monolith is preferred.

The system should be easy for one developer to understand.

---

# 60. DEVELOPMENT PROCESS

Work in phases.

## PHASE 0 — DISCOVERY

Before writing substantial code:

1. Inspect repository.
2. Determine whether this is an empty/new repo.
3. Review current official documentation for selected frameworks/providers.
4. Produce a concise implementation plan.
5. Identify dependencies.
6. Identify anything that could cost money.
7. STOP for approval if money is required.

Do not spend money.

Do not create paid accounts.

---

## PHASE 1 — FOUNDATION

Implement:

* Monorepo/project structure
* Expo
* Expo Router
* TypeScript
* UI foundation
* Supabase integration
* Environment configuration
* Authentication
* Database
* Storage
* RLS
* Error handling
* Logging
* Testing foundation

Verify everything.

---

## PHASE 2 — PROFILE + WARDROBE

Implement:

* Onboarding
* Profile
* Profile photo
* Clothing uploads
* AI clothing analysis
* Wardrobe
* Editing
* Persistence
* Whole-closet photo workflow

Test thoroughly.

---

## PHASE 3 — OUTFIT ENGINE

Implement:

* Outfit request
* Constraints
* Wardrobe retrieval
* Candidate generation
* Scoring
* Missing-item detection
* Structured outfit result
* Save/regenerate
* Feedback

This is the heart of the product.

---

## PHASE 4 — PRODUCT ENGINE

Implement:

* Product provider abstraction
* Initial real provider
* Search
* Normalization
* Ranking
* Product display
* External links
* Affiliate-ready architecture
* Caching
* Freshness

If provider requires payment, STOP and request approval.

---

## PHASE 5 — MONETIZATION

Implement:

* Free plan
* Pro entitlement
* Usage limits
* Billing abstraction
* Subscription UI
* Entitlement checks
* Webhooks
* Cross-platform account identity

Do not finalize pricing without documenting the economics.

---

## PHASE 6 — HARDENING

Perform:

* Security review
* RLS review
* API review
* Error handling review
* Performance review
* Mobile review
* Web review
* Accessibility review
* Test coverage review
* Dependency audit

---

## PHASE 7 — DEPLOYMENT

Prepare:

* Production environment
* Web deployment
* iOS build
* Android build
* App icons
* Splash configuration
* Environment configuration
* Privacy policy integration
* Terms integration
* Store metadata placeholders
* EAS configuration

Do not publish automatically.

---

# 61. AGENT BEHAVIOR

You are operating as an engineering agent.

Rules:

### Rule 1

Do not blindly execute instructions that create unnecessary complexity.

### Rule 2

Before major architectural decisions, explain the tradeoff briefly.

### Rule 3

If a requirement conflicts with another requirement, identify the conflict.

### Rule 4

Never hide incomplete functionality.

### Rule 5

Never fabricate external API results.

### Rule 6

Never fabricate successful payments.

### Rule 7

Never expose secrets.

### Rule 8

Never activate paid services without user approval.

### Rule 9

If an external API is unavailable, implement a clean provider interface and report the blocker rather than creating fake production behavior.

### Rule 10

Use current official documentation when integrating external services.

### Rule 11

After implementing a major subsystem, test it before moving on.

### Rule 12

If a test fails, fix the root cause rather than weakening the test.

### Rule 13

Do not mark the project "production-ready" until the acceptance criteria have actually been tested.

---

# 62. CODE QUALITY STANDARD

Code should be:

* Readable
* Typed
* Modular
* Testable
* Documented where necessary
* Consistent

Prefer simple code over clever code.

Avoid premature abstractions.

Avoid duplicated logic.

Avoid giant files.

Avoid hidden side effects.

Use meaningful names.

---

# 63. DOCUMENTATION STANDARD

Every major subsystem should have documentation explaining:

* Purpose
* Inputs
* Outputs
* Dependencies
* Failure modes
* Security considerations
* Replacement strategy

The repository should be understandable by another engineer without asking the original developer what everything does.

---

# 64. FINAL PRODUCTION CHECKLIST

Before declaring V1 complete, verify:

## Authentication

* [ ] Email signup works
* [ ] Email login works
* [ ] Google login works
* [ ] Logout works
* [ ] Password reset works
* [ ] Sessions persist
* [ ] Unauthorized access is blocked

## Profile

* [ ] Profile creation works
* [ ] Profile editing works
* [ ] Photo upload works
* [ ] Data persists

## Wardrobe

* [ ] Clothing upload works
* [ ] AI analysis works
* [ ] Structured data validates
* [ ] User correction works
* [ ] Items persist
* [ ] Items can be deleted
* [ ] Whole-closet flow works

## Outfit engine

* [ ] User can request outfit
* [ ] Constraints work
* [ ] Wardrobe retrieval works
* [ ] Outfit generation works
* [ ] Existing clothes are prioritized
* [ ] Missing pieces are identified appropriately
* [ ] Alternatives work
* [ ] Feedback works
* [ ] Saving works

## Product engine

* [ ] Real product search works
* [ ] Products are normalized
* [ ] URLs are real
* [ ] Prices are sourced
* [ ] Retailer information is sourced
* [ ] Product freshness is handled
* [ ] Provider failures are handled
* [ ] No fake products appear in production

## Monetization

* [ ] Free tier works
* [ ] Pro entitlement works
* [ ] Usage limits work
* [ ] Subscription state is server-verified
* [ ] Restore works
* [ ] Cancellation works
* [ ] Cross-platform entitlement works where configured

## Security

* [ ] RLS enabled
* [ ] Authorization tested
* [ ] Secrets protected
* [ ] Uploads protected
* [ ] Rate limiting implemented
* [ ] Account deletion works
* [ ] No sensitive logging

## Quality

* [ ] Unit tests pass
* [ ] Integration tests pass
* [ ] E2E tests pass
* [ ] TypeScript passes
* [ ] Lint passes
* [ ] Production build succeeds
* [ ] Mobile build succeeds
* [ ] Web build succeeds

---

# 65. START NOW

Begin with PHASE 0.

Do NOT immediately generate hundreds of files.

First:

1. Inspect the repository.
2. Determine the current state.
3. Research current official documentation for the required technology choices.
4. Propose the concrete architecture.
5. List every external service you expect to require.
6. Categorize each dependency:

   * Free
   * Potentially paid
   * Definitely paid
7. Estimate development-time costs.
8. Identify any blockers.
9. Identify any decisions that require the user's approval.
10. Do not activate or purchase anything.

Then present:

## STYLEAI V1 IMPLEMENTATION PLAN

with:

* Architecture
* Tech stack
* Repository structure
* Database architecture
* AI architecture
* Product-search architecture
* Billing architecture
* Authentication architecture
* Deployment architecture
* Security model
* Testing strategy
* Development phases
* External dependencies
* Cost warnings

Only after the user approves the plan should substantial implementation begin.

The goal is not to produce the most code.

The goal is to produce the **smallest genuinely production-capable foundation for StyleAI** that can become a real consumer SaaS.

Do not build a demo.

Build the company foundation.
