"""Validate generated catalogue integrity using the standard library."""
import collections
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unittest
from urllib.parse import urlparse, unquote
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PREFIX = '/nexrig-pc/'
LIVE = 'https://minixus-collab.github.io' + PREFIX

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.ids = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if 'id' in attrs:
            self.ids.append(attrs['id'])

class CatalogueTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.products = json.loads((ROOT / 'data/products.json').read_text())
        cls.pages = [p for p in ROOT.rglob('index.html') if '.git' not in p.parts]

    def test_product_identity_and_demo_prices(self):
        self.assertEqual(len(self.products), 159)
        self.assertEqual(len({p['id'] for p in self.products}), 159)
        self.assertEqual(collections.Counter((p['category'], p['brand']) for p in self.products),
                         {**{('cooling', brand): 4 for brand in ['Noctua','be quiet!','ARCTIC','DeepCool','Cooler Master','Corsair']}, **{('motherboard', brand): 6 for brand in ['ASUS','MSI','Gigabyte','ASRock']}, **{('psu', brand): 4 for brand in ['Corsair','Seasonic','be quiet!','Cooler Master','Thermaltake','EVGA']}, ('cpu', 'AMD'): 8, ('cpu', 'Intel'): 8, ('gpu', 'AMD'): 8, ('gpu', 'NVIDIA'): 8, **{('gpu', brand): 1 for brand in ['ASUS','MSI','Gigabyte','Zotac','Sapphire','PowerColor','XFX']}, **{('ram', brand): 4 for brand in ['Corsair','Kingston','G.Skill','Crucial','TeamGroup','Patriot']}, **{('storage', brand): 4 for brand in ['Samsung','Western Digital','Crucial','Kingston','Seagate','Corsair']}})
        for p in self.products:
            self.assertRegex(p['id'], r'^[a-z0-9-]+$')
            self.assertIs(type(p['demo_price_mad']), int)
            self.assertGreater(p['demo_price_mad'], 0)
            self.assertNotIn('availability', p)
            if p['category'] == 'cpu':
                self.assertIn(p['socket'], ['AM4', 'AM5', 'LGA1700'])
                self.assertGreaterEqual(p['threads'], p['cores'])
                if p['socket'] == 'AM5':
                    self.assertEqual(p['ram'], 'DDR5')

    def test_ram_kit_identity_and_capacity(self):
        ram = [p for p in self.products if p['category'] == 'ram']
        self.assertEqual(len(ram), 24)
        self.assertEqual(len({p['sku'] for p in ram}), 24)
        for p in ram:
            self.assertIn(p['memory_generation'], ['DDR4', 'DDR5'])
            self.assertEqual(p['form_factor'], 'UDIMM')
            self.assertIn(p['modules'], [1, 2])
            self.assertEqual(p['capacity_gb'] % p['modules'], 0)
            self.assertIn(p['capacity_gb'], [16, 32])
            self.assertGreater(p['speed_mts'], 0)
        single = next(p for p in ram if p['id'].endswith('3200-module'))
        kit = next(p for p in ram if p['id'] == 'kingston-fury-beast-16gb-ddr4-3200-kit')
        self.assertEqual(single['capacity_gb'], kit['capacity_gb'])
        self.assertNotEqual(single['modules'], kit['modules'])
        self.assertNotEqual(single['sku'], kit['sku'])

    def test_storage_identity_and_interfaces(self):
        drives = [p for p in self.products if p['category'] == 'storage']
        self.assertEqual(len(drives), 24)
        self.assertEqual(len({p['sku'] for p in drives}), 24)
        self.assertEqual(collections.Counter(p['drive_type'] for p in drives), {'SSD': 19, 'HDD': 5})
        for p in drives:
            self.assertIn(p['capacity_gb'], [480, 500, 1000, 1024, 2000, 4000])
            if p['storage_protocol'] == 'NVMe':
                self.assertEqual(p['form_factor'], 'M.2 2280')
                self.assertEqual(p['drive_type'], 'SSD')
                self.assertIn('PCIe', p['interface'])
            else:
                self.assertEqual(p['storage_protocol'], 'SATA')
                self.assertIn('SATA', p['interface'])
                self.assertEqual(p['form_factor'], '3.5-inch' if p['drive_type'] == 'HDD' else '2.5-inch')
        page = (ROOT / 'en/products/kingston-kc3000-1024gb/index.html').read_text()
        self.assertIn('1024 GB', page)

    def test_psu_identity_and_ratings(self):
        supplies = [p for p in self.products if p['category'] == 'psu']
        self.assertEqual(len(supplies), 24)
        self.assertEqual(len({p['name'] for p in supplies}), 24)
        self.assertEqual(collections.Counter(p['modularity'] for p in supplies), {'non-modular': 9, 'fully-modular': 15})
        for p in supplies:
            self.assertEqual(p['form_factor'], 'ATX')
            self.assertIn(p['wattage'], [450, 500, 550, 600, 650, 700, 750, 850, 1000])
            self.assertNotIn('efficiency', p)
            self.assertNotIn('atx_version', p)
            text = (ROOT / 'en/products' / p['id'] / 'index.html').read_text()
            self.assertIn('Never mix modular cables', text)
            self.assertIn(str(p['wattage']) + ' W', text)

    def test_motherboard_platforms_and_memory(self):
        boards = [p for p in self.products if p['category'] == 'motherboard']
        self.assertEqual(len(boards), 24)
        self.assertEqual(len({p['name'] for p in boards}), 24)
        self.assertEqual(collections.Counter(p['socket'] for p in boards), {'AM4': 8, 'AM5': 8, 'LGA1700': 8})
        self.assertEqual(collections.Counter(p['form_factor'] for p in boards), {'ATX': 12, 'Micro-ATX': 12})
        for p in boards:
            self.assertIn(p['chipset'], ['B550','B650','B660','B760','Z790'])
            if p['socket'] == 'AM4':
                self.assertEqual((p['chipset'],p['memory_generation']), ('B550','DDR4'))
            elif p['socket'] == 'AM5':
                self.assertEqual((p['chipset'],p['memory_generation']), ('B650','DDR5'))
            else:
                self.assertEqual(p['memory_generation'], 'DDR5' if p['chipset']=='Z790' else 'DDR4')
            text = (ROOT / 'en/products' / p['id'] / 'index.html').read_text()
            self.assertIn('The socket alone does not guarantee CPU compatibility', text)
            self.assertIn('minimum BIOS version', text)
            self.assertIn('does not automatically validate a build', text)

    def test_cooling_types_and_nominal_sizes(self):
        coolers = [p for p in self.products if p['category'] == 'cooling']
        self.assertEqual(len(coolers), 24)
        self.assertEqual(len({p['name'] for p in coolers}), 24)
        self.assertEqual(collections.Counter(p['cooler_type'] for p in coolers), {'air': 12, 'aio': 12})
        self.assertEqual(collections.Counter(p['radiator_mm'] for p in coolers if p['cooler_type']=='aio'), {240: 6, 280: 1, 360: 5})
        for p in coolers:
            if p['cooler_type'] == 'air':
                self.assertIsNone(p['radiator_mm'])
            else:
                self.assertIn(p['radiator_mm'], [240,280,360])
            self.assertNotIn('tdp', p)
            self.assertNotIn('sockets', p)
            text = (ROOT / 'en/products' / p['id'] / 'index.html').read_text()
            self.assertIn('Check socket support and the mounting kit', text)
            self.assertIn('Radiator size is nominal' if p['cooler_type']=='aio' else 'check case height clearance', text)

    def test_product_pages_and_truthful_schema(self):
        for lang, folder in [('fr', 'produits'), ('en', 'en/products')]:
            for p in self.products:
                relative = f'{folder}/{p["id"]}/'
                text = (ROOT / relative / 'index.html').read_text()
                page = Page(text)
                self.assertEqual(sum(tag == 'h1' for tag, _ in page.tags), 1)
                self.assertIn(f'<h1>{p["name"]}</h1>', text)
                self.assertIn(f'lang="{lang}"', text)
                self.assertIn(f'rel="canonical" href="{LIVE + relative}"', text)
                schemas = [json.loads(s) for s in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S)]
                product = next(s for s in schemas if s['@type'] == 'Product')
                self.assertEqual(product['name'], p['name'])
                self.assertEqual(product['url'], LIVE + relative)
                for forbidden in ['offers', 'aggregateRating', 'review']:
                    self.assertNotIn(forbidden, product)
                self.assertIn('Prix de démonstration' if lang == 'fr' else 'Demonstration price', text)

    def test_local_links_assets_and_language_pairs(self):
        for file in self.pages:
            page = Page(file.read_text())
            self.assertEqual(len(page.ids), len(set(page.ids)), str(file))
            for tag, attrs in page.tags:
                for name in ['href', 'src']:
                    value = attrs.get(name, '')
                    parsed = urlparse(value)
                    if value.startswith(PREFIX):
                        target = ROOT / unquote(parsed.path.removeprefix(PREFIX))
                        if parsed.path.endswith('/'):
                            target /= 'index.html'
                        self.assertTrue(target.is_file(), f'{file}: {value}')
                        if parsed.fragment and target.suffix == '.html':
                            self.assertIn(unquote(parsed.fragment), Page(target.read_text()).ids, value)
                    elif value.startswith('#'):
                        self.assertIn(unquote(parsed.fragment), page.ids, f'{file}: {value}')
                if tag == 'link' and attrs.get('rel') == 'alternate':
                    target = ROOT / attrs['href'].removeprefix(LIVE) / 'index.html'
                    self.assertTrue(target.is_file(), attrs['href'])
                    if attrs['hreflang'] in ['en', 'fr']:
                        self.assertIn(f'lang="{attrs["hreflang"]}"', target.read_text())

    def test_runtime_and_catalogue_versions(self):
        import hashlib
        script_hash = hashlib.sha256((ROOT / 'assets/js/shop.js').read_bytes()).hexdigest()[:12]
        catalogue_hash = hashlib.sha256((ROOT / 'data/products.json').read_bytes()).hexdigest()[:12]
        for file in self.pages:
            page = Page(file.read_text())
            runtimes = [attrs for tag, attrs in page.tags if tag == 'script' and 'shop.js' in attrs.get('src', '')]
            self.assertEqual(len(runtimes), 1, str(file))
            self.assertEqual(runtimes[0]['src'], PREFIX + 'assets/js/shop.js?v=' + script_hash)
            self.assertEqual(runtimes[0]['data-catalogue-url'], PREFIX + 'data/products.json?v=' + catalogue_hash)
            self.assertEqual(int(runtimes[0]['data-catalogue-count']), len(self.products))

    def test_sitemap_and_cart_indexing(self):
        ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = [loc.text for loc in ET.parse(ROOT / 'sitemap.xml').findall('s:url/s:loc', ns)]
        self.assertEqual(len(urls), 334)
        self.assertEqual(len(set(urls)), 334)
        for url in urls:
            self.assertTrue((ROOT / url.removeprefix(LIVE) / 'index.html').is_file(), url)
        for folder in ['panier/', 'en/cart/']:
            self.assertNotIn(LIVE + folder, urls)
            self.assertIn('name="robots" content="noindex,follow"', (ROOT / folder / 'index.html').read_text())

if __name__ == '__main__':
    unittest.main()
