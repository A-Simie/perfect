# Perfect Corp API integration plan

Verified against the Perfect Corp YouCam API documentation on 2026-08-15.

## Product objective

Perfection is a personal styling and beauty product. It should create a coordinated beauty profile and let the user preview makeup, clothing, shoes, and one high-impact jewelry category. It is not a skincare diagnosis or treatment product.

The current AI Skin Analysis endpoint is not part of the target product flow. Its acne, pore, wrinkle, redness, and skin-age outputs do not support Perfection's core promise.

## Selected API set

| Product area | Selected Perfect Corp API | Primary endpoint | Why this is the first-release choice |
| --- | --- | --- | --- |
| Face and color profile | AI Facial Color Tones Analyzer | `POST /s2s/v2.0/task/skin-tone-analysis` | Returns skin, eye, eyebrow, lip, and hair colors. This is the best base for coordinating makeup and clothing colors. |
| Body and clothing | AI Clothes Virtual Try-On v4 | `POST /s2s/v2.0/task/cloth-v4` | Applies a reference garment or outfit to a full-body user image and supports `full_body`, `lower_body`, `upper_body`, `outer`, `shoes`, and `auto` garment categories. |
| Legs and footwear | AI Shoes Virtual Try-On | `POST /s2s/v2.0/task/shoes` | Produces a footwear try-on using a user image and a shoe reference image. It also accepts gender and an optional visual style. |
| Jewelry | AI Necklace Virtual Try-On | `POST /s2s/v2.0/task/2d-vto/necklace` | Necklace is the best single jewelry category for the first release because it is visible in portrait and outfit views and materially changes the overall look. |
| Makeup try-on | AI Look Virtual Try-On | `POST /s2s/v2.0/task/look-vto` | Applies an expert-designed makeup template using one `template_id`. It is faster to integrate than constructing individual Makeup VTO effects. |

All five task APIs are asynchronous. Each POST returns a `task_id`, and each feature has a corresponding GET endpoint ending in `/{task_id}`.

## Product flow

1. The user uploads one clear portrait selfie.
2. Perfection calls Facial Color Tones Analyzer with `face_angle_strictness_level: "flexible"`.
3. Perfection converts the returned colors into an internal beauty palette.
4. The user selects a full-body image for clothing and footwear try-on.
5. Perfection selects catalog references that match the beauty palette and requested occasion.
6. Clothes, shoes, necklace, and makeup look tasks run independently.
7. Perfection assembles the completed outputs into one coordinated look card.

Perfect Corp does not provide one API that combines makeup, clothing, shoes, and jewelry into a single final render. The first release should show coordinated outputs as sections of one look card. It must not imply that they came from one composite provider image.

## User-friendly reference strategy

Users should never be asked to upload a second shoe, garment, or jewelry reference image. The reference requirement is an integration concern, not a user workflow.

Perfection owns a curated catalog of provider-ready reference assets. The user supplies a portrait, a full-body image when needed, an occasion, and preferences. Perfection selects a catalog item, then sends its stored `ref_file_url` or `ref_file_id` to Perfect Corp behind the scenes.

This gives the product a simple flow:

```text
user photo + occasion + preferences
  -> Perfection recommendation engine
  -> selected catalog item
  -> Perfect Corp VTO task with hidden reference image
  -> rendered look card
```

This is the only reliable way to avoid reference uploads while retaining control over what Perfect Corp renders. A provider-ready reference image is still required for Clothes VTO v4, Shoes VTO, and Necklace VTO; the requirement cannot be removed from those task contracts. Prefer a stable product URL from Supabase Storage or a CDN for catalog assets. Use a short-lived signed URL only when the asset must remain private.

Provider templates can reduce this work for Look VTO because the API supplies `template_id` values. They should not be assumed to cover the clothing, shoe, or jewelry catalog.

## Shared provider workflow

Every feature uses the same server-side sequence:

1. Reserve an upload with `POST /s2s/v2.0/file`.
2. Upload the binary file to the returned pre-signed `requests.url`.
3. Start the selected AI task with the returned `file_id`.
4. Poll the feature-specific GET endpoint until `task_status` is `success` or `error`.
5. Normalize the provider result into a Perfection-owned response type.
6. Copy result images that must persist into application-owned storage because provider URLs are temporary.

The API key must remain server-only in `YOUCAM_API_KEY`. Browser code calls Perfection route handlers, never Perfect Corp directly.

## API contracts

### 1. Face and color profile

Official reference: [AI Facial Color Tones Analyzer](https://docs.perfectcorp.com/reference/ai_skin_tone_analysis)

```http
POST /s2s/v2.0/task/skin-tone-analysis
GET  /s2s/v2.0/task/skin-tone-analysis/{task_id}
```

Recommended task input:

```json
{
  "src_file_id": "provider-file-id",
  "face_angle_strictness_level": "flexible"
}
```

Relevant result fields:

```json
{
  "skin_color": "#b9947c",
  "eye_color": "#293F9B",
  "eye_color_name": "Blue",
  "lip_color": "#D23245",
  "eyebrow_color": "#5B2B31",
  "hair_color": "#a0a0a0",
  "hair_color_name": "Auburn"
}
```

Perfection derives palette labels and catalog matches from these colors. Perfect Corp detects the colors; it does not decide which clothes or makeup products suit the user.

### 2. Body and clothing

Official reference: [AI Clothes Virtual Try-On](https://docs.perfectcorp.com/reference/ai_clothes)

```http
POST /s2s/v2.0/task/cloth-v4
GET  /s2s/v2.0/task/cloth-v4/{task_id}
```

Minimum task data:

```json
{
  "src_file_id": "full-body-user-file-id",
  "ref_file_id": "garment-reference-file-id",
  "garment_category": "auto"
}
```

Use `auto` initially. Store an explicit category in the product catalog later when the source garment is known to be `full_body`, `lower_body`, `upper_body`, `outer`, or `shoes`.

### 3. Legs and footwear

Official reference: [AI Shoes Virtual Try-On](https://docs.perfectcorp.com/reference/ai_shoes)

```http
POST /s2s/v2.0/task/shoes
GET  /s2s/v2.0/task/shoes/{task_id}
```

Minimum task data:

```json
{
  "src_file_id": "full-body-user-file-id",
  "ref_file_id": "shoe-reference-file-id",
  "gender": "provider-supported-value",
  "style": "style_minimalist"
}
```

Supported documented styles include `random`, `style_minimalist`, `style_bohemian`, `style_cottagecore`, `style_french_elegance`, and `style_retro_fashion`. Keep the source photo full-body even though the provider documentation uses the word selfie.

### 4. Jewelry

Official reference: [AI Necklace Virtual Try-On](https://docs.perfectcorp.com/reference/ai_necklace)

```http
POST /s2s/v2.0/task/2d-vto/necklace
GET  /s2s/v2.0/task/2d-vto/necklace/{task_id}
```

Minimum task data:

```json
{
  "src_file_id": "portrait-or-upper-body-file-id",
  "ref_file_ids": ["necklace-reference-file-id"]
}
```

The neck and clavicle must be visible. Product references should be front-facing necklace images with the background removed. Ring, watch, bracelet, and earrings have separate APIs and are deferred until necklace is stable.

### 5. Makeup look try-on

Official reference: [AI Look Virtual Try-On](https://docs.perfectcorp.com/reference/ai_look_vto)

```http
GET  /s2s/v2.0/task/template/look-vto
POST /s2s/v2.0/task/look-vto
GET  /s2s/v2.0/task/look-vto/{task_id}
```

Task input:

```json
{
  "src_file_id": "portrait-user-file-id",
  "template_id": "selected-look-template-id"
}
```

Cache the template catalog and map templates to Perfection palette tags such as `warm`, `cool`, `neutral`, `soft`, `high-contrast`, `day`, and `evening`.

## Perfection-owned data contracts

```ts
type BeautyColorProfile = {
  skinColor: string;
  eyeColor: string;
  eyeColorName: string;
  lipColor: string;
  eyebrowColor: string;
  hairColor: string;
  hairColorName: string;
  paletteTags: string[];
};

type CoordinatedLook = {
  colorProfile: BeautyColorProfile;
  makeup: { templateId: string; resultUrl: string | null };
  clothing: { catalogItemId: string; resultUrl: string | null };
  shoes: { catalogItemId: string; resultUrl: string | null };
  necklace: { catalogItemId: string; resultUrl: string | null };
  status: "draft" | "processing" | "ready" | "partial" | "failed";
};

type CatalogItem = {
  id: string;
  category: "clothing" | "shoes" | "necklace" | "makeup-look";
  providerReferenceFileId?: string;
  providerReferenceUrl?: string;
  providerTemplateId?: string;
  paletteTags: string[];
  occasionTags: string[];
  styleTags: string[];
  genderTags?: string[];
  active: boolean;
};
```

`partial` is a valid state. A failed necklace render must not discard successful clothing, shoes, and makeup results.

## Recommendation intelligence

Perfect Corp supplies image analysis and rendering. It does not decide which outfit, shoe, necklace, or makeup look best matches the user's colors and occasion. That decision belongs to Perfection.

### First release: deterministic rules

Do not add an LLM for the first release. Use a versioned, deterministic recommender so the same input produces the same catalog choice:

1. Hard-filter inactive items and items without a valid provider reference or template.
2. Filter by requested category, occasion, gender where applicable, and user exclusions.
3. Score remaining items against `paletteTags`, `styleTags`, and `occasionTags`.
4. Select the highest-scoring item and retain the score inputs with the look record.

The rules should be versioned, for example `palette-rules-v1`. This makes results testable, explainable, and consistent regardless of which model implements the application.

### Optional later: constrained LLM

An LLM is useful only when the user gives free-form direction such as "make it more romantic but still work-appropriate." It should rank a small server-generated candidate list, not invent product IDs or call Perfect Corp directly.

Required safeguards for that later path:

- pass only catalog candidates and structured user preferences;
- require strict JSON containing existing catalog IDs;
- validate every ID and category on the server;
- use a low-temperature or deterministic model setting;
- fall back to `palette-rules-v1` on invalid or unavailable LLM output;
- store the catalog version, rules version, and prompt/model version with the recommendation.

The LLM can explain a decision. The rules and catalog remain the source of truth for what is actually rendered.

## Application architecture

Keep one reusable Perfect Corp client for authentication, upload reservation, binary upload, task start, polling, timeouts, and provider error normalization. Add one small adapter per selected feature for request and response schemas.

Recommended server routes:

```text
POST /api/beauty-profile/color-analysis
POST /api/try-on/look
POST /api/try-on/clothes
POST /api/try-on/shoes
POST /api/try-on/necklace
GET  /api/perfect-corp/tasks/{feature}/{taskId}
```

Each route must authenticate the current user, validate ownership of uploaded files and task tokens, apply timeouts, and return a stable application error shape. Do not expose provider task IDs without a user-bound poll token or persisted ownership record.

## Catalog requirements

Virtual try-on APIs require reference assets. Before the try-on experience can be complete, Perfection needs a small catalog containing:

- clothing reference images and garment categories;
- shoe reference images and supported style tags;
- front-facing transparent necklace references;
- cached Look VTO template IDs and thumbnails;
- color tags used to match catalog items to `BeautyColorProfile`.

Each catalog item must be prepared once and reused. The provider renders selected items. Perfection owns item selection and coordination.

Reference preparation is part of catalog administration, not the end-user flow. Each asset should be checked for the provider's required view, background, dimensions, transparency, and category metadata before it is activated.

## Implementation order

1. Replace Skin Analysis with Facial Color Tones Analyzer and a Beauty Palette result.
2. Integrate Look VTO because it reuses the portrait and has the smallest task payload.
3. Add the full-body photo flow and Clothes VTO v4.
4. Reuse the full-body image for Shoes VTO.
5. Add Necklace VTO using the portrait or an upper-body crop.
6. Assemble all successful results into the final Coordinated Look card.

The first implementation should seed a small catalog, not attempt an open marketplace. Ten to twenty provider-ready items per category is enough to validate the recommendation and rendering loop.

## Deferred APIs

- AI Skin Analysis: wrong product domain.
- AI Face Attributes & Ratio Analyzer: useful later for neckline, glasses, and hairstyle recommendations, but not required for the first color-driven release.
- AI Makeup Virtual Try-On: more flexible than Look VTO but requires detailed effect payloads; defer until users need product-level customization.
- AI Makeup Transfer: requires a second reference-face image and is less predictable for a curated product experience.
- Earrings, ring, bracelet, and watch VTO: each is a separate integration; defer until necklace proves the jewelry workflow.
- Hair and nail VTO: separate future categories.

## Operational rules

- Respect Perfect Corp's documented limit of 250 requests per 300 seconds per IP and per access token.
- Poll conservatively: approximately 2.5 seconds for the first checks, then 5 seconds while still running.
- Retry only transient network failures and `429` responses with backoff. Do not retry invalid images or invalid parameters automatically.
- Treat provider output URLs as temporary.
- Never log API keys, pre-signed upload URLs, source images, or full provider payloads containing sensitive identifiers.
- Track units by feature so a partial coordinated look has a visible cost breakdown.

## Sources

- [Perfect Corp API catalog](https://docs.perfectcorp.com/llms.txt)
- [Quick Start Guide](https://docs.perfectcorp.com/develop/quick_start_guide)
- [Rate Limit](https://docs.perfectcorp.com/develop/rate_limit)
- [File Management](https://docs.perfectcorp.com/reference/file)
- [Facial Color Tones Analyzer](https://docs.perfectcorp.com/reference/ai_skin_tone_analysis)
- [Clothes Virtual Try-On](https://docs.perfectcorp.com/reference/ai_clothes)
- [Shoes Virtual Try-On](https://docs.perfectcorp.com/reference/ai_shoes)
- [Necklace Virtual Try-On](https://docs.perfectcorp.com/reference/ai_necklace)
- [Look Virtual Try-On](https://docs.perfectcorp.com/reference/ai_look_vto)
