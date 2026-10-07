# Original blog illustrations

These seven NEXRIG illustrations are original project assets. The SVG files are the editable sources; the matching 800 × 450 WebP covers are served locally in blog cards, French/English articles and BlogPosting JSON-LD. They depict generic hardware or an abstract skyline, not official product or game artwork.

The WebP exports use quality 88 and are under 10 KB each. Card covers are decorative duplicates of their adjacent linked titles and keep empty alt text; article illustrations have descriptive localized alt text and an original-illustration caption.

To re-export, render each SVG on an 800 × 450 canvas with background #11151d, preserving aspect ratio, then encode the raster image as WebP. Update cover paths in scripts/build_catalogue.py and figure paths in content/blog together, then regenerate and run the SEO audit.
