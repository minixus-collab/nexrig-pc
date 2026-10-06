# NEXRIG catalogue conventions

NEXRIG is a fictional Moroccan PC store and SEO learning project. Continue this approach when adding RAM, storage, motherboards or other categories:

- Lead category pages with browsable product cards, search, brand filters, sorting and product-detail links. Put educational guidance below the catalogue.
- Maintain French and English pages with matching language switches, self-referencing canonicals and reciprocal hreflang. Preserve existing URLs.
- Reuse the shared cart, card styles and product data instead of creating a separate cart for each category.
- Use real, accurately named models and supported specifications. Check manufacturer documentation before adding detailed specifications or performance claims. Current external manufacturer links could not be verified from the restricted setup environment.
- Never invent reviews, stock, delivery guarantees, company credentials or real selling prices. `demo_price_mad` is a fictional amount for testing; show a demonstration-price label beside every price and total.
- The cart stores product IDs and integer quantities locally in the browser. It is a demonstration, with no payment, checkout, personal-data collection or real order submission.
- The current SVGs are original generic illustrations, explicitly labeled as illustrations rather than model photographs. Replace them only with appropriately licensed, accurate images; do not present a generic illustration as a product photo.
- Do not add fictional offers, availability or ratings to structured data. Cart pages use `noindex,follow` and are excluded from the sitemap.

## Content and generation

`data/products.json` is the shared source for CPU/GPU/RAM/storage/PSU/motherboard/cooling/monitor cards, product details, demonstration prices and cart calculations. IDs are stable URL slugs and cart identifiers. Do not rename existing IDs casually.

Run from the repository root:

```sh
python3 scripts/build_catalogue.py
```

This uses only Python's standard library. It generates product pages and cart pages, refreshes catalogue blocks and homepage selections, and updates the sitemap. The surrounding category buying guides remain hand-written and are preserved by the marked catalogue blocks. Category openings use a short browsing introduction; original introductory paragraphs and guide jump links are preserved in `#category-overview` after the catalogue and guides. The renderer applies this migration once and preserves it on subsequent runs. Shared compact catalogue styles also apply to the unified shop. Product and cart HTML is generated: edit the data or renderer, then regenerate rather than editing these generated pages directly.

For a new category, extend `CATEGORY_PATHS`, translated labels, specification rendering and product templates in the renderer; create its bilingual guide pages with a catalogue section; add its data; update navigation and the sitemap's category list. The cart uses stable product IDs and the existing shared data automatically. Add a clearly labeled original illustration or licensed model image and extend the image rendering if needed.

Test filters, product links, language switches, cart additions from every entry point, quantity changes, removal, clearing, persistence, mobile layouts and metadata before publishing. Hosting remains plain static GitHub Pages with no production package dependencies.

## Validation

Run the catalogue integrity checks with `python3 -m unittest discover -s tests -v`.

Run `node tests/browser-smoke.cjs` for cart and responsive-browser checks in an environment with the Playwright Node package and Chromium installed. This test starts and stops its own Python HTTP server on port 8765, uses temporary files, and exercises filtering, quantities, computed totals, persistence, failure states and both languages. In the current cloud environment it uses system Chromium at `/usr/lib/chromium/chromium`; adjust that executable path for another machine. No browser test dependencies are shipped to the website.

## RAM catalogue

RAM pages are `/ram/` and `/en/ram/`. Entries carry an exact manufacturer part number (`sku`), total kit capacity, module count, DDR generation, UDIMM form factor and advertised data rate in MT/s. A kit of 2 × 16 GB is 32 GB in total. Do not claim the rated speed is automatic or universally guaranteed: profiles, BIOS, CPU and motherboard compatibility matter. Search includes the part number; RAM-only generation and capacity filters extend the shared brand/search/sort controls. The existing cart and storage key are unchanged, so older CPU/GPU selections survive.

## Cached deployments

The renderer embeds content-hashed URLs for `shop.js` and `products.json`. Regenerate pages after changing either file, and publish those files and generated pages together. The runtime revalidates catalogue responses and checks their product count before initializing filters or reading the saved cart; an incomplete response leaves the existing saved selection untouched. Browser regression tests simulate returning visitors with old unversioned assets.

## Storage catalogue

Storage pages are `/stockage/` and `/en/storage/`. The 24 entries cover NVMe SSDs, 2.5-inch SATA SSDs and 3.5-inch SATA hard drives from six brands. Each entry includes an exact SKU, advertised capacity in GB, drive type, protocol, interface and form factor. Preserve manufacturer capacity labels: 1024 GB should not be rewritten as 1 TB. Storage-specific type, protocol and capacity filters reuse the shared search, brand, sort and cart controls. Explain M.2 protocol/length compatibility, PCIe generation, SATA cabling, drive bays and cooling without promising measured performance or endurance. Product photography remains postponed.

## CPU and GPU brands

CPU manufacturers are AMD and Intel. GPU cards distinguish the card brand (`brand`) from the chip designer (`chip_brand`, falling back to the original AMD/NVIDIA brand). Seven specific partner models supplement the original generic GPU entries; preserve the original IDs and cart selections. Chip and card-brand filters can be combined. Partner cards use only chip-level memory and architecture information; do not infer clocks, dimensions, connectors or cooling specifications from a generic GPU. Manufacturer range links are references, not confirmed model-page verification.

## Power supplies

PSU categories are `/alimentations/` and `/en/power-supplies/`, with 24 models across six brands. Store rated wattage, physical ATX form factor and cable modularity; filters use exact wattage and modularity alongside brand/search/sort. Year labels distinguish selected product revisions. Do not infer ATX electrical revision, GPU connectors, supplied cable counts, efficiency certification, dimensions or warranties from wattage or range names. Manufacturer pages remain inaccessible in the cloud environment; detailed specifications need verification before expansion. Explain whole-system sizing, case clearance, connector checks and why modular PSU cables are not universally interchangeable. Reuse stable cart IDs and the versioned catalogue deployment.

## Motherboards

Categories are `/cartes-meres/` and `/en/motherboards/`, with 24 boards from ASUS, MSI, Gigabyte and ASRock. Store socket, chipset, memory generation and physical form factor; filter by brand, socket, DDR generation and ATX/Micro-ATX size. Use exact model names to distinguish DDR4/DDR5 variants. Hardware revisions may alter features or BIOS support: check the model/revision-specific CPU list and minimum BIOS before claiming compatibility. Do not infer port counts, wireless versions, maximum RAM capacity or supported memory speeds from a chipset or family name. Manufacturer pages remain blocked in this environment. The shared cart is a selection simulator, not an automatic compatibility checker. Explain CPU support, BIOS, QVL, case mounting, power connectors, integrated graphics and storage lane sharing without claiming a verified build.

## Cooling

Categories are `/refroidissement/` and `/en/cooling/`, with 24 CPU coolers from six brands: 12 air coolers and 12 sealed-loop AIOs. Store `cooler_type` and nominal `radiator_mm` (null for air coolers); filter by brand, type and radiator size. Nominal radiator class is not an exact physical length. Do not infer socket support, included mounting hardware, dimensions, temperature, noise or TDP capacity without verifying the exact reference and package revision. Manufacturer documentation remains inaccessible here. Explain case and RAM clearance, mounting kits, pump/fan connections, RGB voltage differences and checking installation instructions. NH-L9a-AM5 is the AM5 variant, not a universal cooler. Use labeled original illustrations and the existing cart; selections are not automatically validated builds.

## Monitors

Categories are `/ecrans/` and `/en/monitors/`, with 24 monitors from ASUS, LG, Samsung, AOC, MSI and Gigabyte. Store model-specific diagonal size, native resolution, nominal (non-overclock) refresh rate and panel type. Keep revision identifiers, including Gigabyte M27Q rev. 2.0; similar models may differ. Filter by brand, resolution, refresh rate and IPS/VA panel. A listed refresh rate is not a guarantee for every input or cable and does not guarantee game FPS. Manufacturer documentation remains inaccessible; verify response times, HDR, VRR, port capabilities, speakers, supplied accessories and mounting features before adding claims. Explain GPU/port/cable modes and system settings. Generic images and demo prices are labeled, and the cart does not validate display compatibility automatically.

## Cases, laptops and accessories

Five categories add 12 entries each: `/boitiers/` / `/en/cases/`, `/ordinateurs-portables/` / `/en/laptops/`, `/claviers/` / `/en/keyboards/`, `/souris/` / `/en/mice/`, and `/chaises-gaming/` / `/en/gaming-chairs/`. Shared expansion definitions in the renderer supply translated specifications, filters and compatibility advice. Preserve revisions and named upholstery variants. Generic original SVGs are illustrations, not model photos.

Case format is the primary format, not an exhaustive mounting specification. Verify GPU/cooler/PSU/radiator clearance separately. Laptop entries explicitly describe model families (`catalogue_scope: model-family`), with nominal screen size only; do not invent CPU/GPU/RAM/storage configurations. Exact retail SKUs and regional variants need verification before adding configuration specifications. Laptop cards and detail pages now include a native expandable configuration panel listing CPU, GPU, RAM, SSD, display resolution/refresh rate and operating system as explicitly unconfirmed. These pending fields are presentation only, not product data or Product structured-data properties. Populate actual values only after checking an exact SKU; manufacturer access was blocked during this update.

Keyboard `switch_technology` separates conventional contact-based mechanical switches from magnetic Hall-effect sensing. Compact/TKL/full-size is not AZERTY/QWERTY or ISO/ANSI layout. Hall-effect features and key coverage depend on model/firmware; some Apex Pro models combine technologies. Do not imply universal hot-swap or Rapid Trigger support. Mice use primary wired/wireless connection; wireless does not automatically imply Bluetooth. Chair upholstery is fabric or synthetic, not a medical or comfort claim. Consult manufacturer dimensions and limits for the exact size and material variant.

No new categories change the saved cart key. Always regenerate content-hashed assets and every affected page together after changing shared data/runtime. Test filters, all category entry points, mixed-category totals, persistence, language switches and no-JavaScript access before publication.

## Audio

`/audio/` and `/en/audio/` contain 30 models: six each of IEMs, headphones/headsets, speakers, microphones and DAC/amplifier devices. Filter `audio_type` and `signal_path` alongside the shared brand/search/sort controls. Signal path describes primary audio support, not every port. USB power is not USB audio: Creative Pebble V2 has analog audio. Headphones may lack microphones; wireless does not imply Bluetooth. XLR microphones need an appropriate interface/preamp and model-specific phantom-power guidance. DAC-only and amp-only models carry explicit `conversion_role`; SMSL SU-1 is not a headphone amp and Schiit Magni+ is not a DAC. Keep revisions/variants explicit. No subjective ratings, latency claims, measured audio performance or automatically guaranteed improvements. Source links are references and may be manufacturer or distributor pages; exact specifications and included cables need verification before expansion. Original illustrations and demonstration prices remain labeled.

## Unified shop and proposed gaming PCs

`/boutique/` and `/en/shop/` render the full catalogue with category, brand, search and sort controls. PC component names are searchable through `search_terms`. `/pc-gamer/` and `/en/gaming-pcs/` contain six fictional NEXRIG configurations. Each holds eight existing component IDs in `components`; its demo price is their sum and the complete bill links to those detail pages. CPU socket and RAM generation must match the selected board in the data. This limited check is not physical/BIOS certification. Clearly state that these are proposed demo configurations, not assembled or tested machines. No operating system licence, assembly service, shipping or peripherals are included. A PC is a single cart item; its parts are not automatically added separately. Preserve the homepage `#builder` anchor when refreshing PC selections. Regenerate the entire site when component data/prices change; keep PC totals in sync with their components.

## Grouped navigation

The shared renderer groups hardware (including monitors and cases) under Components and keyboards, mice, chairs and audio under Accessories. Native details/summary controls work with keyboard and without JavaScript. Laptops and gaming PCs remain separate links. The shared cart link is outside navigation, before the homepage hamburger; existing homepage dismissal and focus handling remains in place. Headers on category, shop, product and cart pages use the same groups. Preserve all category URLs and the cart storage key.

## Component selector

`/configurateur/` and `/en/pc-builder/` are generated bilingual selectors for CPU, GPU, motherboard, RAM, storage, cooling, PSU and case. Demo totals come from catalogue prices. CPU/board socket and CPU/board RAM generation mismatches block cart additions. Other compatibility points remain explicitly unchecked; do not infer PSU sizing, BIOS certification or physical clearance from these checks. The selector saves only validated part IDs under `nexrig.demo-build.v1`; its add-build event lets the shared cart validate all eight IDs and increment them atomically, respecting its quantity limit. No FPS estimation or real checkout is included. Homepage `#builder` remains intact with a link to the selector. Run `node tests/builder-smoke.cjs` for totals, conflict blocking, persistence, responsive widths and shared-cart integration.

## Game benchmark interface

The builder includes nine game/edition choices, three resolutions and game-specific presets. `assets/js/fps.js` looks up exact CPU/GPU/RAM-kit matches in `data/benchmarks.json`; the dataset is deliberately empty until sourced benchmarks are reviewed. No guessed averages, percentage bottlenecks, invented ranges or resolution scaling. Native rendering only, ray tracing/upscaling/frame generation off; Fortnite presets distinguish Performance Mode and DirectX 12 with Nanite/Lumen off. GTA V Legacy and Enhanced are separate choices. Records require hardware IDs, game ID, resolution, preset, native rendering flags, measured average, optional 1% low, source name/URL, test date, game version and test conditions. Selecting a game does not imply benchmark coverage. Hardware/settings changes clear prior results. The interface uses measured published results rather than testing the visitor’s machine. Regenerate both pages after data changes.

## Sitemap index and display

The submitted `/sitemap.xml` remains the main address and now uses `sitemapindex`. It lists `pages-sitemap.xml` (6 URLs), `categories-sitemap.xml` (30 URLs) and `products-sitemap.xml` (558 URLs). All four XML files reference the relative `sitemap.xsl` for a readable bilingual table in browsers supporting XSLT; crawlers use the underlying XML. Cart pages remain excluded. Do not invent lastmod dates. Regenerate the index and all three children together. The sitemap integrity test follows the index and checks unique aggregate coverage.

## Game requirements finder (replaces FPS lookup)

The builder now starts with `#game-finder`. `data/game-requirements.json` stores reference hardware summaries, publisher links and explicit curated candidate build IDs. Fortnite and Valorant use recommended hardware references; CS2 is explicitly minimum-only. Current publisher pages have not been live-verified in this restricted environment; check the linked sources for version, OS, security and storage updates. Suggestions use reviewed CPU/GPU candidates plus RAM/storage checks, never core-count performance scores or invented FPS. Same baseline matches may be suggested for multiple games. An optional fictional-budget cap filters builds; the three cheapest appear with details and customization buttons. Customization loads all eight components into the existing builder and shared cart flow. No complete performance guarantee or OS licence is supplied. `fps.js` and the empty benchmark dataset are removed; historical FPS interface notes above describe the previous version.

## Part-by-part game suggestions

The game finder no longer displays ready-built PC cards. Curated component ID pools replace candidate PC IDs in `game-requirements.json`. The selector chooses the least costly eligible CPU/board/RAM combination (matching socket and memory), then eligible GPU, storage and curated supporting parts. This is a limited baseline suggestion, not a full compatibility certification. Applying suggestions fills all eight existing editable selectors; subsequent swaps update totals, compatibility and baseline-game/budget notes. Unknown CPU/GPU comparisons are flagged as unassessed, not given an invented score. A budget with no eligible selection preserves existing choices. Suggestions are applied only on explicit submission, preserving saved selections on page load. Shared cart and product URLs remain unchanged.

## Expanded game selection

The game finder lists 11 games/editions: eight reference profiles with suggestions (Fortnite, Valorant, CS2, Overwatch 2, GTA V Legacy/Enhanced, Apex Legends, Rocket League), and three pending profiles (Rust, ARC Raiders, Rainbow Six Siege/Siege X). Pending profiles link to the official store and preserve current components; they contain no invented requirement values or hardware suggestions. Added active profiles are reference summaries, not a live audit of current publisher requirements. Keep minimum/recommended labels explicit, verify current editions/requirements before making stronger claims, and distinguish a required SSD from specifically required NVMe. Tests exercise all active and pending choices in both languages.

## Hover navigation

Homepage hamburger and shared component/accessory groups open on fine-pointer mouse hover. A 200 ms delayed close permits movement into links; focused submenu links keep the menu open. Clicking after hover keeps the menu open on the first click; subsequent clicks toggle normally. Coarse/touch input uses click/tap, and native summary keyboard operation plus homepage Escape/focus handling remain intact. Run `node tests/menu-hover.cjs` alongside the browser smoke checks when changing navigation.

## Controllers

Only controllers were added: `/manettes/` and `/en/controllers/`, with 12 Microsoft, Sony, 8BitDo, GameSir and Logitech models. The category appears in Accessories and the unified shop; details and both sitemaps are generated. Primary wired/wireless filtering does not list every supported connection; detail pages include connection modes. Avoid universal game/console/OS compatibility claims, undocumented included receivers/cables, polling rates, latency, Hall-effect claims or shared DualSense feature guarantees. Verify revisions and firmware against the manufacturer reference. Demo prices and original generic SVG remain labeled. Total catalogue: 291 products, 32 bilingual category pages, 620 sitemap URLs. Run `node tests/controllers-smoke.cjs` for filters, category/detail additions and bilingual saved-cart persistence.

## Components and Accessories overview pages

`/composants-pc/` / `/en/components/` and `/accessoires/` / `/en/accessories/` contain three existing products from each menu group category, favoring different brands. Menu heading text links to the overview while native summary keyboard/arrow interaction and hover retain category dropdowns. Full category/product URLs and shared cart IDs remain stable. Monitors stays outside Components. `pages-sitemap.xml` includes these four URLs (624 aggregate URLs). Run `node tests/hubs-smoke.cjs` for coverage, heading navigation and cart additions in both languages.

## Blog guides

`content/blog/quelle-carte-graphique-choisir.fr.html` and its `.en.html` counterpart hold the first editorial guide. `build_blog` in the renderer creates bilingual blog indexes and article pages using the shared header, footer and styles. Edit these content files, then regenerate. Category guidance links to the article; the article links to existing categories, product references and the PC builder. Keep informational targets separate from commercial category targets. The article makes no numerical benchmark or real market-price claims. Both indexes and articles are included in `pages-sitemap.xml` (634 total URLs).

The VRAM guide uses `content/blog/vram-carte-graphique.fr.html` and `.en.html`, published at `/blog/vram-carte-graphique/` and `/en/blog/what-is-vram/`. `BLOG_ARTICLES` holds bilingual metadata and stable paths for both articles. Add future entries here; generation updates blog indexes and sitemap coverage automatically.

GPU temperature guide: `content/blog/temperature-carte-graphique.fr.html` and `.en.html`, with `/blog/temperature-carte-graphique/` and `/en/blog/gpu-temperature/`. Distinguish sensors, avoid universal thermal thresholds, and keep CPU cooler links explicitly separate from GPU cooling compatibility.

Blog indexes use `.blog-grid` cards with decorative original SVG covers in `assets/images/blog/`, translated topic badges, excerpts and article links. Layout is three columns on desktop, two on tablet and one on mobile. The shared navigation includes the existing bilingual blog index. No invented bylines or dates are displayed.

Blog source HTML carries `noindex,follow` because GitHub Pages can expose repository source paths. The renderer strips this source-only directive when generating the indexable article. Source files and carts stay outside the sitemap.

GTA 6 article: `/blog/gta-6-pc/` and `/en/blog/gta-6-pc/`, with original decorative skyline cover. Console schedule supplied by the user points to Rockstar VI; live verification was blocked by network policy. PC release timing and GPU/resolution pairings are not presented as confirmed requirements. Recheck official announcements before updating time-sensitive facts.

## Product image overrides

Optional `image_url`, bilingual `image_alt` and `image_caption` fields override category illustrations through `product_image`. Cart thumbnails use the same URL. The first four generic Radeon entries use user-supplied external image URLs; specific partner-card photos are labeled as examples and do not change the product identity or specifications. External image availability and exact visual matches have not been verified in this restricted environment. Regenerate after data/image changes so catalogue hashes remain synchronized.

## Researched content keywords

`scripts/content_seo.py` maintains the approved keyword map for Components, laptops, graphics cards, storage and the RTX 3060 12 GB product. The renderer applies metadata, short category headings/intros and idempotent guidance below product listings in both languages. French targets: composants PC / composants PC Maroc; PC portable gamer Maroc; carte graphique Maroc; SSD prix Maroc; RTX 3060 prix Maroc. English counterparts use natural translated intent, not assumed Ahrefs volumes. Price queries explicitly distinguish demonstration amounts from market prices. Homepage keyword targeting, canonicals, URLs and product identities remain intact.

Laptop `example_configuration` fields hold user-supplied CPU, mobile GPU, RAM, storage and display details. These are family examples without verified retail SKUs or source links. Bilingual expandable panels label that scope; operating systems remain unspecified, and Nitro 5 refresh rate preserves the supplied alternatives. Example details are not added as verified Product structured-data properties.

Navigation groups now use independent hub anchors and adjacent real buttons, instead of links nested inside summary controls. Buttons expose translated labels, `aria-expanded` and `aria-controls`; submenus are hidden when closed. Mobile buttons are 56 × 56 px, with a gap from full-height links. Navigation owns hover, click, keyboard and drawer state. Retest PageSpeed touch-target findings on deployment; local browser tests do not establish a Lighthouse pass.

## Header product search

The bilingual header search opens a labeled field and submits `q` to the existing shop URL. Shared catalogue filters initialize their search input from that query, matching product names, SKUs and search terms across all categories. Search results retain the shop's canonical URL. Escape restores focus to the trigger; clicking outside closes the field. Without JavaScript the form stays available, but catalogue filtering still requires JavaScript. Run `node tests/header-search.cjs` for bilingual searches, empty results, focus/Escape and 320/390/1440 px layouts.

GPU troubleshooting guide: `content/blog/probleme-carte-graphique.fr.html` and `.en.html`, published at `/blog/probleme-carte-graphique/` and `/en/blog/graphics-card-problems/`. Targets the researched informational query « problème carte graphique ». Covers display-path checks, artifacts, crashes, drivers and performance without diagnosing every symptom as GPU failure. Links to temperature, VRAM and buying guides; the temperature guide links back. Cover uses the user-supplied Make Tech Easier image URL on both articles and blog cards; the original SVG remains available. External image availability is not verified. Five bilingual articles, 636 aggregate sitemap URLs. Official support links are starting points, not claims of live source verification.

SSD buying guide: `content/blog/ssd-maroc.fr.html` and `.en.html`, published at `/blog/ssd-maroc/` and `/en/blog/ssd-buying-guide-morocco/`. Explains SATA/NVMe/M.2 compatibility, capacity, workload-dependent performance, endurance, backup and comparing dated seller offers. No actual market-price ranges or invented benchmarks. NEXRIG prices remain explicitly fictional. Storage category guidance links to the guide in both languages. User-supplied Future CDN cover on both articles and blog cards; external image availability is not verified. Six bilingual articles and 638 aggregate sitemap URLs.

RAM buying guide: `content/blog/choisir-ram.fr.html` and `.en.html`, published at `/blog/choisir-ram/` and `/en/blog/how-to-choose-ram/`. Covers workload-dependent capacity, DDR generation/form factors, motherboard QVL, MT/s/timings, XMP/EXPO and matching kits. No invented benchmark gains or researched RAM search-volume claims. Links to RAM, motherboards, builder, VRAM and SSD guide; RAM catalogue links back below product listings. User-supplied Future CDN cover on both articles and blog cards; external image availability is not verified. Seven bilingual articles and 640 aggregate sitemap URLs.

## GPU comparison

`initComparison` in shared `assets/js/shop.js` adds comparison controls to rendered GPU cards after the catalogue loads. It works on the GPU category, shop and other existing listings with GPU cards; no new page or URL is created. The comparison panel sits at the bottom of main content, below the product listings, to keep products visible sooner. Select up to three GPU IDs, then show a comparison of brand, GPU chip brand, VRAM, memory type, architecture and fictional demonstration price. Missing fields are labeled, not inferred; no FPS or performance rankings. Filters preserve selections. Removal/clear remain available when cards are hidden. Validated selections persist in sessionStorage (`nexrig.gpu-comparison.v1`) across reloads and languages in the current tab, independently of the cart; storage failure does not prevent use. Comparison stays unavailable on failed catalogue fetch and without JavaScript. Mobile tables scroll inside their own focusable region. Run `node tests/gpu-comparison.cjs` and the existing browser smoke suite for limits, values, persistence, invalid storage, filters, mixed shop entry points and cart isolation.

Game-finder explanations: the successful suggestion displays a collapsible bilingual section with eight current-part explanations and exact product links. CPU/GPU reasons refer to curated game-reference choices, not benchmarks. RAM/storage explanations compare published reference values; support parts describe their role without asserting thermal, power or dimensional certification. Selecting another part refreshes the text; pending games, failed-budget suggestions and resets do not retain a stale game justification. A method note describes choosing the lowest fictional total from the curated options and limited checks. Auto-add-to-cart behavior remains unchanged. Builder smoke checks cover explanations, edits, pending games and the original compatibility/cart workflow.

A small fixed comparison shortcut appears once a GPU is selected and the bottom panel is outside the viewport. It shows the selected count, moves keyboard focus to the panel for one GPU, or opens/focuses the comparison table for two or three GPUs. IntersectionObserver hides it while the panel is visible; clearing selections hides it as well. It creates no space above products and uses the existing dark/purple theme.
