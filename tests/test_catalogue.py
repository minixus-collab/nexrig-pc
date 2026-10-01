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
        self.assertEqual(len(self.products), 32)
        self.assertEqual(len({p['id'] for p in self.products}), 32)
        self.assertEqual(collections.Counter((p['category'], p['brand']) for p in self.products),
                         {('cpu', 'AMD'): 8, ('cpu', 'Intel'): 8, ('gpu', 'AMD'): 8, ('gpu', 'NVIDIA'): 8})
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

    def test_sitemap_and_cart_indexing(self):
        ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = [loc.text for loc in ET.parse(ROOT / 'sitemap.xml').findall('s:url/s:loc', ns)]
        self.assertEqual(len(urls), 70)
        self.assertEqual(len(set(urls)), 70)
        for url in urls:
            self.assertTrue((ROOT / url.removeprefix(LIVE) / 'index.html').is_file(), url)
        for folder in ['panier/', 'en/cart/']:
            self.assertNotIn(LIVE + folder, urls)
            self.assertIn('name="robots" content="noindex,follow"', (ROOT / folder / 'index.html').read_text())

if __name__ == '__main__':
    unittest.main()
