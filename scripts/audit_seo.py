#!/usr/bin/env python3
"""Read-only static SEO audit; run from any directory. No network requests."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from collections import Counter,defaultdict
import json
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
BASE='https://minixus-collab.github.io/nexrig-pc/'
PREFIX='/nexrig-pc/'
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.tags=[];self.ids=[];self.title='';self.in_title=False;self.in_schema=False;self.schemas=[];self.schema='';self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append((tag,a))
  if 'id' in a:self.ids.append(a['id'])
  if tag=='title':self.in_title=True
  if tag=='script' and a.get('type')=='application/ld+json':self.in_schema=True;self.schema=''
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='script' and self.in_schema:self.schemas.append(self.schema);self.in_schema=False
 def handle_data(self,data):
  if self.in_title:self.title+=data
  if self.in_schema:self.schema+=data
 def attrs(self,tag):return [a for t,a in self.tags if t==tag]
 def noindex(self):return any('noindex' in a.get('content','').lower() for a in self.attrs('meta') if a.get('name','').lower() in ['robots','googlebot'])

def audit():
 files=sorted(ROOT.rglob('index.html'));pages={p:Page(p.read_text()) for p in files if '.git' not in p.parts};issues=[];warnings=[];titles=defaultdict(list);descs=defaultdict(list)
 def issue(p,msg):issues.append({'page':str(p.relative_to(ROOT)),'issue':msg})
 ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
 index=ET.parse(ROOT/'sitemap.xml');children=[x.text for x in index.findall('s:sitemap/s:loc',ns)];urls=[]
 for child in children:
  assert child.startswith(BASE),child
  urls += [x.text for x in ET.parse(ROOT/child.removeprefix(BASE)).findall('s:url/s:loc',ns)]
 for url,count in Counter(urls).items():
  if count!=1:issue(ROOT/'sitemap.xml','Duplicate URL: '+url)
 sitemap=set(urls);external=Counter();images=Counter();schema_types=Counter()
 for p,page in pages.items():
  url=BASE+str(p.parent.relative_to(ROOT)).replace('\\','/').removeprefix('.')
  if not url.endswith('/'):url+='/'
  if len(page.ids)!=len(set(page.ids)):issue(p,'Duplicate HTML IDs')
  if not page.title.strip():issue(p,'Missing title')
  titles[page.title.strip()].append(str(p.relative_to(ROOT)))
  description=[a.get('content','') for a in page.attrs('meta') if a.get('name')=='description']
  if len(description)!=1 or not description[0].strip():issue(p,'Missing/duplicate meta description')
  else:descs[description[0]].append(str(p.relative_to(ROOT)))
  if sum(t=='h1' for t,a in page.tags)!=1:issue(p,'H1 count is not 1')
  canonical=[a.get('href') for a in page.attrs('link') if a.get('rel')=='canonical']
  if canonical!=[url]:issue(p,'Canonical is not unique/self-referencing: '+str(canonical))
  if page.noindex() and url in sitemap:issue(p,'Noindex URL in sitemap')
  if not page.noindex() and url not in sitemap:issue(p,'Indexable page absent from sitemap')
  alternates={a.get('hreflang'):a.get('href') for a in page.attrs('link') if a.get('rel')=='alternate'}
  lang=next((a.get('lang') for a in page.attrs('html')),None)
  if set(alternates)!= {'fr','en','x-default'}:issue(p,'Missing expected language alternates')
  for language,alternate in alternates.items():
   if not alternate.startswith(BASE):issue(p,'Alternate outside expected site');continue
   target=ROOT/alternate.removeprefix(BASE)/'index.html'
   if target not in pages:issue(p,'Missing alternate page');continue
   other=pages[target]
   if language in ['fr','en']:
    if next((a.get('lang') for a in other.attrs('html')),None)!=language:issue(p,'Alternate language mismatch')
    if not any(a.get('hreflang')==lang and a.get('href')==url for a in other.attrs('link')):issue(p,'Nonreciprocal language alternate')
  for tag,a in page.tags:
   for key in ['href','src']:
    value=a.get(key,'');u=urlsplit(value)
    local=u.path.removeprefix(PREFIX) if value.startswith(PREFIX) else u.path.removeprefix('/nexrig-pc/') if value.startswith(BASE) else None
    if local is not None:
     target=ROOT/unquote(local)
     if u.path.endswith('/'):target/='index.html'
     if not target.is_file():issue(p,'Broken local resource: '+value)
     elif u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:issue(p,'Missing destination fragment: '+value)
    elif value.startswith('#') and unquote(u.fragment) not in page.ids:issue(p,'Missing page fragment: '+value)
    elif u.scheme in ['https','http']:external[u.hostname]+=1
   if tag=='img':
    if 'alt' not in a:issue(p,'Image missing alt attribute')
    if 'width' not in a or 'height' not in a:images['missing_dimensions']+=1
    if a.get('src','').startswith('https://'):images['external_images']+=1
  for raw in page.schemas:
   try:schema=json.loads(raw)
   except json.JSONDecodeError:issue(p,'Invalid JSON-LD');continue
   schema_types[schema.get('@type','unknown')]+=1
   if schema.get('@type')=='Product' and any(k in schema for k in ['offers','review','aggregateRating']):issue(p,'Unsupported commercial/review schema')
 for name,groups in [('title',titles),('description',descs)]:
  for value,items in groups.items():
   if len(items)>1:warnings.append({'issue':'Duplicate '+name,'value':value,'pages':items})
 for url in sitemap:
  target=ROOT/url.removeprefix(BASE)/'index.html'
  if target not in pages:issue(ROOT/'sitemap.xml','Missing sitemap destination: '+url)
 source_files=list((ROOT/'content/blog').glob('*.html'))
 for p in source_files:
  if not Page(p.read_text()).noindex():issue(p,'Exposed blog source missing noindex')
 report={'pages_checked':len(pages),'sitemap_urls':len(sitemap),'noindex_pages':sum(p.noindex() for p in pages.values()),'source_copies_checked':len(source_files),'schema_types':dict(schema_types),'image_observations':dict(images),'external_hosts_unverified':dict(external),'errors':issues,'warnings':warnings}
 return report
if __name__=='__main__':
 result=audit();print(json.dumps(result,ensure_ascii=False,indent=2))
 raise SystemExit(bool(result['errors']))
