#!/usr/bin/env python3
"""Render the static bilingual catalogue from data/products.json. No third-party dependencies."""
from pathlib import Path
import html
import hashlib
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = '/nexrig-pc/'
LIVE = 'https://minixus-collab.github.io' + BASE
PRODUCTS = json.loads((ROOT / 'data/products.json').read_text())
# Content hashes change URLs when the runtime or catalogue changes, avoiding stale Pages caches.
CATALOGUE_VERSION = hashlib.sha256((ROOT / 'data/products.json').read_bytes()).hexdigest()[:12]
SCRIPT_VERSION = hashlib.sha256((ROOT / 'assets/js/shop.js').read_bytes()).hexdigest()[:12]
SHOP_SCRIPT = f'<script src="{BASE}assets/js/shop.js?v={SCRIPT_VERSION}" data-catalogue-url="{BASE}data/products.json?v={CATALOGUE_VERSION}" data-catalogue-count="{len(PRODUCTS)}" defer></script>'
CATEGORY_PATHS = {'fr': {'cpu': 'processeurs/', 'gpu': 'cartes-graphiques/', 'ram': 'ram/'}, 'en': {'cpu': 'en/processors/', 'gpu': 'en/graphics-cards/', 'ram': 'en/ram/'}}
WORDS = {
 'fr': {'home':'Accueil','cpu':'Processeurs','gpu':'Cartes graphiques','cart':'Panier','add':'Ajouter au panier','view':'Voir le produit','demo':'Prix de démonstration — aucune vente','illustration':'Illustration générique — pas une photo du modèle','cpu_alt':'Illustration générique d’un processeur','gpu_alt':'Illustration générique d’une carte graphique','cores':'cœurs','threads':'threads','socket':'Socket','supported_memory':'Mémoire compatible','ram':'Mémoire RAM','ram_alt':'Illustration générique d’une barrette mémoire RAM','integrated':'Graphique intégré','yes':'Oui','no':'Non','memory':'Mémoire vidéo','architecture':'Architecture','search':'Rechercher un modèle','brand':'Marque','all':'Toutes les marques','sort':'Trier par','default':'Ordre du catalogue','low':'Prix démo croissant','high':'Prix démo décroissant','name':'Nom du modèle','reset':'Réinitialiser','empty':'Aucun modèle ne correspond à ces critères.','filters_note':'Les filtres et le panier nécessitent JavaScript. Les produits et leurs fiches restent consultables.','skip':'Aller au contenu','nav':'Navigation principale','bread':'Fil d’Ariane','banner':'Boutique fictive · Prix de démonstration · Aucune vente','about':'Le projet','back':'Retour à la catégorie','specs':'Caractéristiques du modèle','source':'Gamme du fabricant','related':'Autres modèles à découvrir','compat':'Compatibilité à vérifier'},
 'en': {'home':'Home','cpu':'Processors','gpu':'Graphics cards','cart':'Cart','add':'Add to cart','view':'View product','demo':'Demonstration price — no sales','illustration':'Generic illustration — not a photo of this model','cpu_alt':'Generic illustration of a processor','gpu_alt':'Generic illustration of a graphics card','cores':'cores','threads':'threads','socket':'Socket','supported_memory':'Supported memory','ram':'RAM','ram_alt':'Generic illustration of a RAM module','integrated':'Integrated graphics','yes':'Yes','no':'No','memory':'Video memory','architecture':'Architecture','search':'Search models','brand':'Brand','all':'All brands','sort':'Sort by','default':'Catalogue order','low':'Demo price: low to high','high':'Demo price: high to low','name':'Model name','reset':'Reset','empty':'No models match these filters.','filters_note':'Filters and cart require JavaScript. Products and their detail pages remain readable.','skip':'Skip to content','nav':'Main navigation','bread':'Breadcrumb','banner':'Fictional store · Demonstration prices · No sales','about':'The project','back':'Back to category','specs':'Model specifications','source':'Manufacturer product range','related':'More models to explore','compat':'Compatibility to check'}
}

def e(value):
 return html.escape(str(value), quote=True)

def path(p, lang):
 return ('en/products/' if lang == 'en' else 'produits/') + p['id'] + '/'

def money(price, lang):
 return (f'{price:,}'.replace(',', ' ') if lang == 'fr' else f'{price:,}') + ' DH'

def label_specs(p, lang):
 w=WORDS[lang]
 if p['category']=='cpu':
  return [(w['socket'],p['socket']), ('Cœurs / threads' if lang=='fr' else 'Cores / threads',f"{p['cores']} / {p['threads']}"), (w['supported_memory'],p['ram']), (w['integrated'],w['yes'] if p['integrated_graphics'] else w['no'])]
 if p['category']=='ram':
  unit='Go' if lang=='fr' else 'GB'
  return [('Référence fabricant' if lang=='fr' else 'Manufacturer part number',p['sku']), ('Capacité totale' if lang=='fr' else 'Total capacity',f"{p['capacity_gb']} {unit}"), ('Composition' if lang=='fr' else 'Kit configuration',f"{p['modules']} × {p['capacity_gb']//p['modules']} {unit}"), ('Génération' if lang=='fr' else 'Generation',p['memory_generation']), ('Débit annoncé' if lang=='fr' else 'Advertised data rate',f"{p['speed_mts']} MT/s"), ('Format' if lang=='fr' else 'Form factor',p['form_factor'])]
 return [(w['memory'],f"{p['vram_gb']} {'Go' if lang=='fr' else 'GB'} {p['memory_type']}"), (w['architecture'],p['architecture'])]

def summary(p, lang):
 w=WORDS[lang]
 if p['category']=='cpu':return f"{p['cores']} {w['cores']} · {p['threads']} {w['threads']} · {p['socket']} · {p['ram']}"
 if p['category']=='ram':return f"{p['capacity_gb']} {'Go' if lang=='fr' else 'GB'} · {p['modules']} × {p['capacity_gb']//p['modules']} {'Go' if lang=='fr' else 'GB'} · {p['memory_generation']} · {p['speed_mts']} MT/s"
 return f"{p['vram_gb']} {'Go' if lang=='fr' else 'GB'} · {p['memory_type']} · {p['architecture']}"

def card(p, lang):
 w=WORDS[lang]
 return f'''<article class="shop-card" data-product-id="{p['id']}">
  <figure><a href="{BASE+path(p,lang)}" tabindex="-1" aria-hidden="true"><img src="{BASE}assets/images/{p['category']}-illustration.svg" width="480" height="320" loading="lazy" alt=""></a><figcaption class="illustration-label">{w['illustration']}</figcaption></figure>
  <div class="shop-card-body"><span class="shop-brand">{e(p['brand'])}</span><h3><a href="{BASE+path(p,lang)}">{e(p['name'])}</a></h3><p class="shop-specs">{e(summary(p,lang))}</p>
    <div class="shop-price">{money(p['demo_price_mad'],lang)}<small class="shop-disclaimer">{w['demo']}</small></div>
    <div class="shop-actions"><button class="shop-button" type="button" data-add-to-cart="{p['id']}" aria-label="{w['add']} : {e(p['name'])}" disabled>{w['add']}</button><a class="detail-link" href="{BASE+path(p,lang)}">{w['view']}</a></div>
  </div></article>'''

def cartpath(lang):return 'en/cart/' if lang=='en' else 'panier/'
def homedir(lang):return 'en/' if lang=='en' else ''
def cartlink(lang):
 return f'<a class="cart-link" href="{BASE+cartpath(lang)}" data-cart-link>{WORDS[lang]["cart"]} <span class="cart-count" data-cart-count>0</span></a>'
def assets(doc):
 css=f'<link rel="stylesheet" href="{BASE}assets/css/shop.css">'
 if css not in doc:doc=doc.replace('</head>',css+'\n</head>',1)
 doc=re.sub(r'<script\s+[^>]*src="'+re.escape(BASE)+r'assets/js/shop\.js(?:\?[^"]*)?"[^>]*></script>\s*','',doc)
 return doc.replace('</head>',SHOP_SCRIPT+'\n</head>',1)

def addcart(doc,lang):
 if 'data-cart-link' not in doc:
  start=doc.index('<nav',doc.index('<header'));end=doc.index('</nav>',start);doc=doc[:end]+cartlink(lang)+'\n      '+doc[end:]
 return assets(doc)

def filters(products,lang):
 w=WORDS[lang];brands=sorted({p['brand'] for p in products})
 ram_filters=''
 if products and all(p['category']=='ram' for p in products):
  ram_filters=f'''<label for="shop-generation">{'Génération' if lang=='fr' else 'Generation'}<select id="shop-generation" name="generation"><option value="">{'Toutes' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{g}">{g}</option>' for g in sorted({p['memory_generation'] for p in products}))}</select></label>
  <label for="shop-capacity">{'Capacité totale' if lang=='fr' else 'Total capacity'}<select id="shop-capacity" name="capacity"><option value="">{'Toutes' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{c}">{c} {"Go" if lang=="fr" else "GB"}</option>' for c in sorted({p['capacity_gb'] for p in products}))}</select></label>'''
 return f'''<form class="shop-filters" data-shop-filters hidden>
  <label for="shop-search">{w['search']}<input id="shop-search" type="search" name="search" autocomplete="off"></label>
  <label for="shop-brand">{w['brand']}<select id="shop-brand" name="brand"><option value="">{w['all']}</option>{''.join(f'<option value="{b}">{b}</option>' for b in brands)}</select></label>
{ram_filters}
  <label for="shop-sort">{w['sort']}<select id="shop-sort" name="sort"><option value="default">{w['default']}</option><option value="price-low">{w['low']}</option><option value="price-high">{w['high']}</option><option value="name">{w['name']}</option></select></label>
  <button class="shop-button secondary" type="reset">{w['reset']}</button></form>
  <p class="shop-result" id="shop-result" role="status" aria-live="polite">{len(products)} {'modèles' if lang=='fr' else 'models'}</p>
  <p id="shop-empty" hidden>{w['empty']}</p><noscript><p class="shop-noscript">{w['filters_note']}</p></noscript>'''

def schema_text(data):return json.dumps(data,ensure_ascii=False,indent=2).replace('</','<\\/')
def breadcrumbs(names,lang):
 return {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i+1,'name':name,'item':LIVE+url} for i,(name,url) in enumerate(names)]}

def document(title,description,url,alternate,lang,body,bread=None,noindex=False):
 w=WORDS[lang];fr=url if lang=='fr' else alternate;en=url if lang=='en' else alternate
 nav=''.join(f'<a href="{BASE+target}">{label}</a>' for target,label in [(homedir(lang),w['home']),(CATEGORY_PATHS[lang]['gpu'],w['gpu']),(CATEGORY_PATHS[lang]['cpu'],w['cpu']),(CATEGORY_PATHS[lang]['ram'],w['ram'])])
 nav=nav.replace(f'<a href="{BASE+url}">',f'<a href="{BASE+url}" aria-current="page">')
 return f'''<!DOCTYPE html>
<html lang="{lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)}</title><meta name="description" content="{e(description)}"><link rel="canonical" href="{LIVE+url}">
{'<meta name="robots" content="noindex,follow">' if noindex else ''}
<link rel="alternate" hreflang="fr" href="{LIVE+fr}"><link rel="alternate" hreflang="en" href="{LIVE+en}"><link rel="alternate" hreflang="x-default" href="{LIVE+fr}">
<link rel="stylesheet" href="{BASE}assets/css/category.css"><link rel="stylesheet" href="{BASE}assets/css/language.css"><link rel="stylesheet" href="{BASE}assets/css/shop.css">{SHOP_SCRIPT}
{'<script type="application/ld+json">'+schema_text(breadcrumbs(bread,lang))+'</script>' if bread else ''}
</head><body><a class="skip-link" href="#main">{w['skip']}</a><div class="demo-banner">{w['banner']}</div>
<header class="header"><div class="container header-inner"><a class="logo" href="{BASE+homedir(lang)}" aria-label="NEXRIG - {w['home']}">NEX<span>RIG</span></a><a class="language-switch" href="{BASE+alternate}" lang="{'en' if lang=='fr' else 'fr'}" hreflang="{'en' if lang=='fr' else 'fr'}">{'English' if lang=='fr' else 'Français'}</a><nav aria-label="{w['nav']}">{nav}{cartlink(lang)}</nav></div></header>
<main class="container" id="main" tabindex="-1">{('<nav class="breadcrumbs" aria-label="'+w['bread']+'"><ol>'+''.join('<li>'+('<a href="'+BASE+target+'">'+e(name)+'</a>' if i<len(bread)-1 else '<span aria-current="page">'+e(name)+'</span>')+'</li>' for i,(name,target) in enumerate(bread))+'</ol></nav>') if bread else ''}{body}</main>
<footer class="footer"><div class="container footer-inner"><span>© 2026 NEXRIG · {'Boutique fictive' if lang=='fr' else 'Fictional store'}</span><a href="{BASE+homedir(lang)}#about">{w['about']}</a><a href="{BASE+cartpath(lang)}">{w['cart']}</a></div></footer></body></html>\n'''

def product_description(p,lang):
 if lang=='fr':
  return f"Découvrez {p['name']} : {summary(p,lang)}. Caractéristiques et compatibilité dans le catalogue de démonstration NEXRIG au Maroc."
 return f"Explore {p['name']}: {summary(p,lang)}. Specifications and compatibility in NEXRIG’s demonstration catalogue in Morocco."

def build_product(p,lang):
 w=WORDS[lang];category=CATEGORY_PATHS[lang][p['category']];url=path(p,lang);alt=path(p,'en' if lang=='fr' else 'fr')
 if p['category']=='cpu':
  advice=('Vérifiez le socket, la liste de CPU compatibles et le BIOS de votre carte mère. Le type de RAM doit correspondre à la carte mère. Pour Intel, DDR4 et DDR5 dépendent du modèle de carte mère et ne sont pas interchangeables. Vérifiez le refroidisseur, son kit de fixation et le contenu de la boîte.' if lang=='fr' else 'Check the socket, supported CPU list and motherboard BIOS. RAM must match the motherboard. For Intel, DDR4 and DDR5 depend on the motherboard model and are not interchangeable. Check the cooler, its mounting kit and box contents.')
  extra=('Ce processeur possède un circuit graphique intégré ; vérifiez les sorties vidéo de la carte mère. Une carte dédiée reste pertinente pour les jeux exigeants.' if p['integrated_graphics'] else 'Ce processeur ne possède pas de circuit graphique intégré. Une carte graphique séparée est nécessaire.') if lang=='fr' else ('This processor has integrated graphics; check the motherboard’s video outputs. A dedicated card remains relevant for demanding games.' if p['integrated_graphics'] else 'This processor has no integrated graphics. A separate graphics card is required.')
 elif p['category']=='ram':
  advice=('Vérifiez que votre carte mère et votre processeur acceptent cette génération de mémoire. Ces modules UDIMM sont destinés aux PC de bureau : ils ne remplacent pas des SO-DIMM pour ordinateur portable. Vérifiez la capacité maximale, le nombre d’emplacements, la liste QVL et la hauteur sous le refroidisseur.' if lang=='fr' else 'Check that your motherboard and processor support this memory generation. These UDIMM modules are for desktop PCs: they do not replace laptop SO-DIMMs. Check maximum capacity, slot count, the QVL and cooler clearance.')
  extra=('Le débit annoncé est une caractéristique de la référence, pas une vitesse garantie dans chaque PC. Selon le kit, le BIOS et la plateforme, un profil XMP ou EXPO peut être nécessaire pour atteindre ce débit. Vérifiez le profil proposé par le fabricant pour cette référence exacte. Utilisez de préférence les barrettes du même kit et les emplacements recommandés par la carte mère.' if lang=='fr' else 'The advertised data rate is a model specification, not a guaranteed speed in every PC. Depending on the kit, BIOS and platform, an XMP or EXPO profile may be needed to reach it. Check the profile offered for this exact part number. Prefer modules from the same kit and the motherboard’s recommended slots.')
 else:
  advice=('Le modèle présenté désigne le GPU et sa capacité mémoire, pas une référence de carte ASUS, MSI, Sapphire ou d’un autre fabricant partenaire. Dimensions, connecteurs, refroidissement et type de mémoire peuvent varier : vérifiez la référence exacte, l’espace dans le boîtier et l’alimentation recommandée.' if lang=='fr' else 'This model identifies the GPU and memory capacity, not a specific ASUS, MSI, Sapphire or other partner card. Dimensions, connectors, cooling and memory type may vary: check the exact card model, case space and recommended power supply.')
  extra=('Les performances dépendent des jeux, des réglages, de la résolution et du reste du PC. Consultez des tests indépendants correspondant à votre usage.' if lang=='fr' else 'Performance depends on games, settings, resolution and the rest of the PC. Consult independent tests matching your use case.')
 related=[x for x in PRODUCTS if x['category']==p['category'] and x['id']!=p['id']][:4]
 dl=''.join(f'<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k,v in label_specs(p,lang))
 body=f'''<div class="product-layout"><figure><img src="{BASE}assets/images/{p['category']}-illustration.svg" alt="{w[p['category']+'_alt']}" width="480" height="320"><figcaption class="illustration-label">{w['illustration']}</figcaption></figure>
<div class="product-purchase"><span class="eyebrow">{e(p['brand'])} · {w[p['category']]}</span><h1>{e(p['name'])}</h1><p>{e(product_description(p,lang))}</p><div class="shop-price">{money(p['demo_price_mad'],lang)}<small class="shop-disclaimer">{w['demo']}</small></div><dl aria-label="{w['specs']}">{dl}</dl><button class="shop-button" type="button" data-add-to-cart="{p['id']}" disabled>{w['add']}</button><noscript><p class="shop-noscript">{w['filters_note']}</p></noscript><p class="shop-disclaimer">{'Le panier sert uniquement à simuler une sélection. Aucun paiement ni commande réelle.' if lang=='fr' else 'The cart only simulates a selection. No payment or real order.'}</p><a href="{BASE+category}">{w['back']}</a></div></div>
<section><h2>{w['compat']}</h2><p>{advice}</p><p>{extra}</p><p><a href="{e(p['source'])}">{w['source']} : {e(p['brand'])}</a></p></section>
<section><h2>{w['related']}</h2><div class="shop-grid">{''.join(card(x,lang) for x in related)}</div></section>'''
 doc=document(p['name']+(' – Caractéristiques | NEXRIG' if lang=='fr' else ' – Specifications | NEXRIG'),product_description(p,lang),url,alt,lang,body,[(w['home'],homedir(lang)),(w[p['category']],category),(p['name'],url)])
 product={'@context':'https://schema.org','@type':'Product','name':p['name'],'brand':{'@type':'Brand','name':p['brand']},'category':w[p['category']],'description':product_description(p,lang),'url':LIVE+url,'additionalProperty':[{'@type':'PropertyValue','name':k,'value':v} for k,v in label_specs(p,lang)]}
 doc=doc.replace('</head>','<script type="application/ld+json">'+schema_text(product)+'</script>\n</head>',1)
 target=ROOT/url/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(doc)

def build_cart(lang):
 w=WORDS[lang];title='Panier de démonstration' if lang=='fr' else 'Demonstration cart'
 body=f'''<div class="hero"><span class="eyebrow">NEXRIG · {'Démonstration' if lang=='fr' else 'Demonstration'}</span><h1>{title}</h1><p class="intro">{'Votre sélection est enregistrée dans ce navigateur. Les prix sont fictifs ; aucun paiement ni commande réelle ne peut être effectué.' if lang=='fr' else 'Your selection is saved in this browser. Prices are fictional; no payment or real order can be made.'}</p></div>
<p id="cart-loading" role="status">{'Chargement du panier…' if lang=='fr' else 'Loading cart…'}</p><p id="cart-storage-warning" class="note" hidden></p><noscript><p class="shop-noscript">{'Activez JavaScript pour utiliser le panier. Aucune donnée n’est envoyée à un vendeur.' if lang=='fr' else 'Enable JavaScript to use the cart. No data is sent to a seller.'}</p></noscript>
<div class="cart-layout"><div class="cart-items" id="cart-items"></div><aside class="cart-summary" aria-label="{'Résumé du panier' if lang=='fr' else 'Cart summary'}"><h2>{'Total de démonstration' if lang=='fr' else 'Demonstration total'}</h2><div class="cart-total" id="cart-total" aria-live="polite">—</div><p>{w['demo']}</p><p>{'Somme des articles sélectionnés uniquement. Aucun calcul de livraison ou de taxes ; ce montant ne constitue pas un devis.' if lang=='fr' else 'Sum of selected items only. No shipping or tax calculation; this amount is not a quotation.'}</p><button class="shop-button secondary" id="clear-cart" type="button" disabled>{'Vider le panier' if lang=='fr' else 'Clear cart'}</button><a class="shop-button" href="{BASE+CATEGORY_PATHS[lang]['gpu']}">{'Continuer la sélection' if lang=='fr' else 'Continue browsing'}</a><p>{'Aucun passage en caisse : projet fictif.' if lang=='fr' else 'No checkout: fictional project.'}</p></aside></div>'''
 url=cartpath(lang);doc=document(title+' | NEXRIG',title,url,cartpath('en' if lang=='fr' else 'fr'),lang,body,[(w['home'],homedir(lang)),(w['cart'],url)],noindex=True)
 target=ROOT/url/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(doc)

def main():
 assert len({p['id'] for p in PRODUCTS})==len(PRODUCTS),'Duplicate product IDs'
 for p in PRODUCTS:
  assert re.fullmatch('[a-z0-9-]+',p['id'])
  assert isinstance(p['demo_price_mad'],int) and p['demo_price_mad']>0
  assert p['category'] in CATEGORY_PATHS['fr']
 for lang in ['fr','en']:
  for cat,category_path in CATEGORY_PATHS[lang].items():
   target=ROOT/category_path/'index.html';doc=target.read_text();items=[p for p in PRODUCTS if p['category']==cat]
   heading={'fr':{'cpu':'Catalogue de processeurs AMD et Intel','gpu':'Catalogue de cartes graphiques AMD et NVIDIA','ram':'Catalogue RAM DDR4 et DDR5'},'en':{'cpu':'AMD and Intel processor catalogue','gpu':'AMD and NVIDIA graphics card catalogue','ram':'DDR4 and DDR5 RAM catalogue'}}[lang][cat]
   note=('Choisissez parmi ces modèles et simulez votre sélection avec le panier. Tous les prix sont fictifs et indiqués uniquement pour la démonstration.' if lang=='fr' else 'Browse these models and simulate your selection with the cart. All prices are fictional and shown only for demonstration.')
   block=f'<!-- catalogue:start -->\n<section id="modeles" aria-labelledby="modeles-title"><h2 id="modeles-title">{heading}</h2><p class="section-intro">{note}</p>{filters(items,lang)}<div class="shop-grid">'+''.join(card(p,lang) for p in items)+'</div></section>\n<!-- catalogue:end -->\n'
   if '<!-- catalogue:start -->' in doc:doc=re.sub(r'<!-- catalogue:start -->.*?<!-- catalogue:end -->\s*',lambda _:block,doc,flags=re.S)
   else:
    start=doc.index('    <section id="modeles"');end=doc.index('    <section id="comparaison"');doc=doc[:start]+block+doc[end:].lstrip()
   doc=doc.replace('Découvrez deux exemples de GPU NVIDIA GeForce et AMD Radeon','Explorez les modèles NVIDIA GeForce et AMD Radeon').replace('Découvrez trois exemples de CPU AMD Ryzen et Intel Core','Explorez les modèles AMD Ryzen et Intel Core').replace('Explore two NVIDIA GeForce and AMD Radeon GPU examples','Explore NVIDIA GeForce and AMD Radeon models').replace('Explore three AMD Ryzen and Intel Core CPU examples','Explore AMD Ryzen and Intel Core models')
   doc=doc.replace('Il ne propose ni commande, ni stock, ni prix de vente.','Les prix sont des montants de démonstration ; aucune vente ni disponibilité en stock n’est annoncée.').replace('sans commande, stock ni prix de vente.','avec des prix de démonstration, sans commande réelle ni disponibilité en stock annoncée.').replace('It offers no ordering, stock availability or selling prices.','Prices are demonstration amounts; no real ordering or stock availability is offered.').replace('without ordering, stock availability or selling prices.','with demonstration prices, without real ordering or stock availability.')
   doc=doc.replace('Exemples de GPU</a>','Catalogue GPU</a>').replace('Exemples de CPU</a>','Catalogue CPU</a>').replace('GPU examples</a>','GPU catalogue</a>').replace('CPU examples</a>','CPU catalogue</a>')
   doc=addcart(doc,lang)
   if 'class="shop-category"' not in doc:doc=doc.replace('<body>','<body class="shop-category">',1)
   listing={'@context':'https://schema.org','@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':p['name'],'url':LIVE+path(p,lang)} for i,p in enumerate(items)]}
   doc=re.sub(r'<script type="application/ld\+json" id="catalogue-schema">.*?</script>\s*','',doc,flags=re.S)
   doc=doc.replace('</head>','<script type="application/ld+json" id="catalogue-schema">'+schema_text(listing)+'</script>\n</head>',1);target.write_text(doc)
  for p in PRODUCTS:build_product(p,lang)
  build_cart(lang)
  target=ROOT/homedir(lang)/'index.html';doc=target.read_text();featured_ids=['nvidia-geforce-rtx-4060','amd-radeon-rx-7800-xt','amd-ryzen-5-5600','intel-core-i5-12400f'];featured=[next(p for p in PRODUCTS if p['id']==id) for id in featured_ids]
  block='<!-- featured:start -->\n<div class="shop-grid">'+''.join(card(p,lang) for p in featured)+'</div>\n<!-- featured:end -->'
  if '<!-- featured:start -->' in doc:doc=re.sub(r'<!-- featured:start -->.*?<!-- featured:end -->',lambda _:block,doc,flags=re.S)
  else:
   start=doc.index('        <div class="product-grid">');end=doc.index('\n      </div>\n    </section>',start);doc=doc[:start]+block+doc[end:]
  doc=doc.replace('<h2>Exemples de composants</h2>','<h2>Notre sélection de composants</h2>').replace('<h2>Component examples</h2>','<h2>Our component selection</h2>');target.write_text(addcart(doc,lang))
 # Cart is intentionally excluded from the sitemap and marked noindex.
 ET.register_namespace('','http://www.sitemaps.org/schemas/sitemap/0.9');namespace='{http://www.sitemaps.org/schemas/sitemap/0.9}';sitemap=ET.Element(namespace+'urlset')
 urls=[homedir(lang) for lang in ['fr','en']]+[url for lang in ['fr','en'] for url in CATEGORY_PATHS[lang].values()]+[path(p,lang) for lang in ['fr','en'] for p in PRODUCTS]
 for url in urls:ET.SubElement(ET.SubElement(sitemap,namespace+'url'),namespace+'loc').text=LIVE+url
 ET.indent(sitemap);ET.ElementTree(sitemap).write(ROOT/'sitemap.xml',encoding='UTF-8',xml_declaration=True)
 print(f'Rendered {len(PRODUCTS)} products in 2 languages, {2*len(CATEGORY_PATHS['fr'])} catalogues, 2 carts and {len(urls)} sitemap URLs.')

if __name__=='__main__':main()
