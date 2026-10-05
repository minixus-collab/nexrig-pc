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
NAV_SCRIPT = f'<script src="{BASE}assets/js/navigation.js?v={hashlib.sha256((ROOT / "assets/js/navigation.js").read_bytes()).hexdigest()[:12]}" defer></script>'
CATEGORY_PATHS = {'fr': {'cpu': 'processeurs/', 'gpu': 'cartes-graphiques/', 'ram': 'ram/', 'storage': 'stockage/', 'psu': 'alimentations/', 'motherboard': 'cartes-meres/', 'cooling': 'refroidissement/', 'monitor': 'ecrans/'}, 'en': {'cpu': 'en/processors/', 'gpu': 'en/graphics-cards/', 'ram': 'en/ram/', 'storage': 'en/storage/', 'psu': 'en/power-supplies/', 'motherboard': 'en/motherboards/', 'cooling': 'en/cooling/', 'monitor': 'en/monitors/'}}
WORDS = {
 'fr': {'home':'Accueil','cpu':'Processeurs','gpu':'Cartes graphiques','cart':'Panier','add':'Ajouter au panier','view':'Voir le produit','demo':'Prix de démonstration — aucune vente','illustration':'Illustration générique — pas une photo du modèle','cpu_alt':'Illustration générique d’un processeur','gpu_alt':'Illustration générique d’une carte graphique','cores':'cœurs','threads':'threads','socket':'Socket','supported_memory':'Mémoire compatible','ram':'Mémoire RAM','ram_alt':'Illustration générique d’une barrette mémoire RAM','monitor':'Écrans','monitor_alt':'Illustration générique d’un écran PC','cooling':'Refroidissement','cooling_alt':'Illustration générique de refroidisseurs CPU','motherboard':'Cartes mères','motherboard_alt':'Illustration générique d’une carte mère','psu':'Alimentations','psu_alt':'Illustration générique d’une alimentation PC','storage':'Stockage','storage_alt':'Illustration générique de supports de stockage','integrated':'Graphique intégré','yes':'Oui','no':'Non','memory':'Mémoire vidéo','architecture':'Architecture','search':'Rechercher un modèle','brand':'Marque','all':'Toutes les marques','sort':'Trier par','default':'Ordre du catalogue','low':'Prix démo croissant','high':'Prix démo décroissant','name':'Nom du modèle','reset':'Réinitialiser','empty':'Aucun modèle ne correspond à ces critères.','filters_note':'Les filtres et le panier nécessitent JavaScript. Les produits et leurs fiches restent consultables.','skip':'Aller au contenu','nav':'Navigation principale','bread':'Fil d’Ariane','banner':'Boutique fictive · Prix de démonstration · Aucune vente','about':'Le projet','back':'Retour à la catégorie','specs':'Caractéristiques du modèle','source':'Gamme du fabricant','related':'Autres modèles à découvrir','compat':'Compatibilité à vérifier'},
 'en': {'home':'Home','cpu':'Processors','gpu':'Graphics cards','cart':'Cart','add':'Add to cart','view':'View product','demo':'Demonstration price — no sales','illustration':'Generic illustration — not a photo of this model','cpu_alt':'Generic illustration of a processor','gpu_alt':'Generic illustration of a graphics card','cores':'cores','threads':'threads','socket':'Socket','supported_memory':'Supported memory','ram':'RAM','ram_alt':'Generic illustration of a RAM module','monitor':'Monitors','monitor_alt':'Generic illustration of a PC monitor','cooling':'Cooling','cooling_alt':'Generic illustration of CPU coolers','motherboard':'Motherboards','motherboard_alt':'Generic illustration of a motherboard','psu':'Power supplies','psu_alt':'Generic illustration of a PC power supply','storage':'Storage','storage_alt':'Generic illustration of storage drives','integrated':'Integrated graphics','yes':'Yes','no':'No','memory':'Video memory','architecture':'Architecture','search':'Search models','brand':'Brand','all':'All brands','sort':'Sort by','default':'Catalogue order','low':'Demo price: low to high','high':'Demo price: high to low','name':'Model name','reset':'Reset','empty':'No models match these filters.','filters_note':'Filters and cart require JavaScript. Products and their detail pages remain readable.','skip':'Skip to content','nav':'Main navigation','bread':'Breadcrumb','banner':'Fictional store · Demonstration prices · No sales','about':'The project','back':'Back to category','specs':'Model specifications','source':'Manufacturer product range','related':'More models to explore','compat':'Compatibility to check'}
}

# Additional storefront categories share translated specifications and filter definitions.
EXPANSION_PATHS = {
 'controller':('manettes/','en/controllers/'),
 'case':('boitiers/','en/cases/'), 'laptop':('ordinateurs-portables/','en/laptops/'),
 'keyboard':('claviers/','en/keyboards/'), 'mouse':('souris/','en/mice/'), 'chair':('chaises-gaming/','en/gaming-chairs/'), 'audio':('audio/','en/audio/'), 'pc':('pc-gamer/','en/gaming-pcs/')}
EXPANSION_LABELS = {'fr':{'controller':'Manettes','pc':'PC gamer assemblés','audio':'Audio','case':'Boîtiers PC','laptop':'Ordinateurs portables','keyboard':'Claviers','mouse':'Souris','chair':'Chaises gaming'},'en':{'controller':'Controllers','pc':'Gaming PCs','audio':'Audio','case':'PC cases','laptop':'Laptops','keyboard':'Keyboards','mouse':'Mice','chair':'Gaming chairs'}}
EXPANSION_FIELDS = {
 'controller':[('connection_type','Connexion principale','Primary connection')],
 'pc':[('cpu_platform','Plateforme CPU','CPU platform'),('memory_generation','Mémoire','Memory')],
 'audio':[('audio_type','Type audio','Audio type'),('signal_path','Signal principal','Primary signal')],
 'case':[('case_format','Format principal','Primary form factor')],
 'laptop':[('screen_inches','Diagonale nominale','Nominal screen size')],
 'keyboard':[('switch_technology','Technologie de touches','Switch technology'),('keyboard_size','Format','Form factor')],
 'mouse':[('connection_type','Connexion principale','Primary connection')],
 'chair':[('upholstery','Revêtement','Upholstery')]}
EXPANSION_VALUES = {
 'fr':{'iem':'IEM / intra-auriculaires','headphones':'Casques et micro-casques','speakers':'Enceintes','microphone':'Microphones','dac-amp':'DAC et amplificateurs','analog':'Audio analogique','usb':'Audio USB','usb-analog':'Audio USB et analogique','xlr':'Micro XLR','dac-only':'DAC seul','amp-only':'Amplificateur seul','dac-and-amp':'DAC et amplificateur','mechanical':'Mécanique conventionnel','magnetic':'Magnétique Hall-effect','compact':'Compact','full-size':'Complet','TKL':'TKL (sans pavé numérique)','wired':'Filaire','wireless':'Sans fil','fabric':'Tissu','synthetic':'Revêtement synthétique'},
 'en':{'iem':'IEMs / in-ear monitors','headphones':'Headphones and headsets','speakers':'Speakers','microphone':'Microphones','dac-amp':'DACs and amplifiers','analog':'Analog audio','usb':'USB audio','usb-analog':'USB and analog audio','xlr':'XLR microphone','dac-only':'DAC only','amp-only':'Amplifier only','dac-and-amp':'DAC and amplifier','mechanical':'Conventional mechanical','magnetic':'Magnetic Hall-effect','compact':'Compact','full-size':'Full-size','TKL':'TKL (no number pad)','wired':'Wired','wireless':'Wireless','fabric':'Fabric','synthetic':'Synthetic upholstery'}}
for language,index in [('fr',0),('en',1)]:
 CATEGORY_PATHS[language].update({key:paths[index] for key,paths in EXPANSION_PATHS.items()})
 WORDS[language].update(EXPANSION_LABELS[language])
 WORDS[language].update({key+'_alt':('Illustration générique : ' if language=='fr' else 'Generic illustration: ')+label for key,label in EXPANSION_LABELS[language].items()})

def expansion_value(key,value,lang):
 if key=='screen_inches':return screen_size(value,lang)
 return EXPANSION_VALUES[lang].get(value,str(value))

EXPANSION_ADVICE = {
 'controller':('Vérifiez le support Windows, les pilotes, le firmware et les modes XInput/DirectInput ou Steam Input du jeu. Bluetooth n’est pas une connexion Xbox Wireless. Les fonctions avancées DualSense dépendent du jeu et peuvent demander une connexion USB. Vérifiez si le câble, le récepteur ou l’adaptateur requis est inclus ; aucune compatibilité universelle n’est garantie.','Check Windows support, drivers, firmware and the game’s XInput/DirectInput or Steam Input modes. Bluetooth is not Xbox Wireless. Advanced DualSense features depend on the game and may require USB. Check whether the required cable, receiver or adapter is included; universal compatibility is not guaranteed.'),
 'pc':('Configuration complète proposée pour la démonstration, pas un PC physiquement assemblé ou testé. Le socket et la génération mémoire correspondent dans les données, mais il reste à vérifier BIOS, liste CPU, profil RAM, dimensions GPU/ventirad, câblage et kit de montage exacts.','A complete proposed demonstration configuration, not a physically assembled or tested PC. Socket and memory generation match in the data, but BIOS, CPU support, memory profiles, GPU/cooler clearance, cables and exact mounting kits still need verification.'),
 'audio':('Vérifiez le signal audio, les connecteurs et les câbles de la référence exacte. USB peut alimenter un appareil sans transporter le son : les Creative Pebble V2 utilisent une entrée audio analogique. Un microphone XLR nécessite une interface ou un préampli adapté ; un adaptateur passif XLR-vers-USB ne suffit pas. Un DAC seul ne remplace pas un amplificateur de casque.','Check audio signal, connectors and cables for the exact model. USB can provide power without carrying sound: Creative Pebble V2 uses an analog audio input. An XLR microphone needs a suitable interface or preamp; a passive XLR-to-USB adapter is not enough. A standalone DAC does not replace a headphone amplifier.'),
 'case':('Vérifiez les dimensions exactes et la révision : format de carte mère, longueur GPU, hauteur du ventirad, baie PSU et radiateurs avec ventilateurs. Le format principal ne décrit pas toutes les possibilités de montage.','Check exact dimensions and revision: motherboard format, GPU length, cooler height, PSU bay and radiators with fans. The primary form factor does not describe every mounting option.'),
 'laptop':('Cette fiche présente une famille de modèles, pas une configuration commerciale précise. CPU, GPU, RAM, SSD, écran et système peuvent varier selon le SKU et la région. Le prix est uniquement une démonstration pour cette famille.','This page describes a model family, not an exact retail configuration. CPU, GPU, RAM, SSD, display and operating system can vary by SKU and region. The price is only a demonstration for this family.'),
 'keyboard':('Vérifiez la disposition AZERTY/QWERTY, la variante ISO/ANSI et les touches réellement fournies. Les claviers magnétiques utilisent des capteurs Hall-effect ; leurs fonctions, zones de touches et réglages varient selon le modèle et le firmware.','Check AZERTY/QWERTY layout, ISO/ANSI variant and supplied keycaps. Magnetic keyboards use Hall-effect sensing; features, affected keys and settings vary by model and firmware.'),
 'mouse':('Vérifiez la taille, la forme, votre prise en main et la compatibilité système. Sans fil ne signifie pas automatiquement Bluetooth : consultez les modes exacts, le récepteur inclus et les possibilités de recharge.','Check size, shape, grip and operating-system compatibility. Wireless does not automatically mean Bluetooth: check exact connection modes, supplied receiver and charging options.'),
 'chair':('Comparez les dimensions de l’assise, les réglages et les limites indiquées par le fabricant pour la taille et le revêtement exacts. Un nom gaming ne garantit ni confort universel ni bénéfice médical.','Compare seat dimensions, adjustments and manufacturer limits for the exact size and upholstery variant. A gaming label guarantees neither universal comfort nor medical benefits.')}

def e(value):
 return html.escape(str(value), quote=True)

def path(p, lang):
 return ('en/products/' if lang == 'en' else 'produits/') + p['id'] + '/'

def money(price, lang):
 return (f'{price:,}'.replace(',', ' ') if lang == 'fr' else f'{price:,}') + ' DH'

def storage_capacity(capacity, lang):
 if capacity >= 1000 and capacity % 1000 == 0:return f"{capacity//1000} {'To' if lang=='fr' else 'TB'}"
 return f"{capacity} {'Go' if lang=='fr' else 'GB'}"

def storage_form(form,lang):
 return form.replace('2.5-inch','2,5 pouces').replace('3.5-inch','3,5 pouces') if lang=='fr' else form

def modularity_label(value,lang):
 return {'fr':{'non-modular':'Non modulaire','fully-modular':'Entièrement modulaire'},'en':{'non-modular':'Non-modular','fully-modular':'Fully modular'}}[lang][value]

def cooling_label(value,lang):
 return {'fr':{'air':'Ventirad','aio':'Liquide AIO'},'en':{'air':'Air cooler','aio':'Liquid AIO'}}[lang][value]

def screen_size(value,lang):
 return str(value).replace('.',',')+' pouces' if lang=='fr' else str(value)+' inches'

def resolution_label(value):
 return {'1920x1080':'Full HD · 1920 × 1080','2560x1440':'QHD · 2560 × 1440','3840x2160':'4K UHD · 3840 × 2160'}[value]

def label_specs(p, lang):
 w=WORDS[lang]
 if p['category']=='controller':
  return [(w['brand'],p['brand']),('Connexion principale' if lang=='fr' else 'Primary connection',expansion_value('connection_type',p['connection_type'],lang)),('Modes de connexion' if lang=='fr' else 'Connection modes',p['connection_modes'])]
 if p['category'] in EXPANSION_FIELDS:
  return [(w['brand'],p['brand'])]+[(fr if lang=='fr' else en,expansion_value(key,p[key],lang)) for key,fr,en in EXPANSION_FIELDS[p['category']]]+([('Fonction' if lang=='fr' else 'Function',expansion_value('conversion_role',p['conversion_role'],lang))] if 'conversion_role' in p else [])
 if p['category']=='monitor':
  return [(w['brand'],p['brand']), ('Diagonale' if lang=='fr' else 'Diagonal size',screen_size(p['size_inches'],lang)), ('Résolution native' if lang=='fr' else 'Native resolution',resolution_label(p['resolution'])), ('Fréquence nominale' if lang=='fr' else 'Nominal refresh rate',f"{p['refresh_hz']} Hz"), ('Dalle' if lang=='fr' else 'Panel',p['panel_type'])]
 if p['category']=='cooling':
  return [(w['brand'],p['brand']), ('Type',cooling_label(p['cooler_type'],lang))] + ([('Radiateur nominal' if lang=='fr' else 'Nominal radiator size',f"{p['radiator_mm']} mm")] if p['cooler_type']=='aio' else [])
 if p['category']=='motherboard':
  return [(w['brand'],p['brand']), (w['socket'],p['socket']), ('Chipset',p['chipset']), (w['supported_memory'],p['memory_generation']), ('Format' if lang=='fr' else 'Form factor',p['form_factor'])]
 if p['category']=='psu':
  return [(w['brand'],p['brand']), ('Puissance nominale' if lang=='fr' else 'Rated power',f"{p['wattage']} W"), ('Câblage' if lang=='fr' else 'Cabling',modularity_label(p['modularity'],lang)), ('Format' if lang=='fr' else 'Form factor',p['form_factor'])]
 if p['category']=='cpu':
  return [(w['brand'],p['brand']), (w['socket'],p['socket']), ('Cœurs / threads' if lang=='fr' else 'Cores / threads',f"{p['cores']} / {p['threads']}"), (w['supported_memory'],p['ram']), (w['integrated'],w['yes'] if p['integrated_graphics'] else w['no'])]
 if p['category']=='ram':
  unit='Go' if lang=='fr' else 'GB'
  return [('Référence fabricant' if lang=='fr' else 'Manufacturer part number',p['sku']), ('Capacité totale' if lang=='fr' else 'Total capacity',f"{p['capacity_gb']} {unit}"), ('Composition' if lang=='fr' else 'Kit configuration',f"{p['modules']} × {p['capacity_gb']//p['modules']} {unit}"), ('Génération' if lang=='fr' else 'Generation',p['memory_generation']), ('Débit annoncé' if lang=='fr' else 'Advertised data rate',f"{p['speed_mts']} MT/s"), ('Format' if lang=='fr' else 'Form factor',p['form_factor'])]
 if p['category']=='storage':
  return [('Référence fabricant' if lang=='fr' else 'Manufacturer part number',p['sku']), ('Capacité annoncée' if lang=='fr' else 'Advertised capacity',storage_capacity(p['capacity_gb'],lang)), ('Type',p['drive_type']), ('Protocole' if lang=='fr' else 'Protocol',p['storage_protocol']), ('Interface',p['interface']), ('Format' if lang=='fr' else 'Form factor',storage_form(p['form_factor'],lang))]
 return [(w['brand'],p['brand']), ('Puce graphique' if lang=='fr' else 'GPU chip brand',p.get('chip_brand',p['brand'])), (w['memory'],f"{p['vram_gb']} {'Go' if lang=='fr' else 'GB'} {p['memory_type']}"), (w['architecture'],p['architecture'])]

def summary(p, lang):
 w=WORDS[lang]
 if p['category']=='pc':
  parts={key:next(x for x in PRODUCTS if x['id']==value) for key,value in p['components'].items()}
  return f"{parts['cpu']['name']} · {parts['gpu']['name']} · {parts['ram']['capacity_gb']} {'Go' if lang=='fr' else 'GB'} {p['memory_generation']}"
 if p['category'] in EXPANSION_FIELDS:
  values=' · '.join(expansion_value(key,p[key],lang) for key,_,_ in EXPANSION_FIELDS[p['category']])
  if 'conversion_role' in p:values+=' · '+expansion_value('conversion_role',p['conversion_role'],lang)
  return values+(' · Famille de modèles' if lang=='fr' else ' · Model family') if p['category']=='laptop' else values
 if p['category']=='monitor':return f"{screen_size(p['size_inches'],lang)} · {resolution_label(p['resolution'])} · {p['refresh_hz']} Hz · {p['panel_type']}"
 if p['category']=='cooling':return cooling_label(p['cooler_type'],lang)+(f" · {p['radiator_mm']} mm" if p['cooler_type']=='aio' else '')
 if p['category']=='motherboard':return f"{p['socket']} · {p['chipset']} · {p['memory_generation']} · {p['form_factor']}"
 if p['category']=='psu':return f"{p['wattage']} W · {p['form_factor']} · {modularity_label(p['modularity'],lang)}"
 if p['category']=='cpu':return f"{p['cores']} {w['cores']} · {p['threads']} {w['threads']} · {p['socket']} · {p['ram']}"
 if p['category']=='ram':return f"{p['capacity_gb']} {'Go' if lang=='fr' else 'GB'} · {p['modules']} × {p['capacity_gb']//p['modules']} {'Go' if lang=='fr' else 'GB'} · {p['memory_generation']} · {p['speed_mts']} MT/s"
 if p['category']=='storage':return f"{storage_capacity(p['capacity_gb'],lang)} · {p['drive_type']} · {p['storage_protocol']} · {storage_form(p['form_factor'],lang)}"
 return f"{p['vram_gb']} {'Go' if lang=='fr' else 'GB'} · {p['memory_type']} · {p['architecture']}"

def laptop_configuration_panel(p, lang):
 if p['category']!='laptop':return ''
 labels=(['Processeur (CPU)', 'Carte graphique (GPU)', 'Mémoire RAM', 'Stockage SSD', 'Résolution / fréquence', 'Système d’exploitation'] if lang=='fr' else ['Processor (CPU)', 'Graphics (GPU)', 'RAM', 'SSD storage', 'Resolution / refresh rate', 'Operating system'])
 pending='À confirmer selon la référence exacte' if lang=='fr' else 'To confirm for the exact SKU'
 title='Configuration à préciser' if lang=='fr' else 'Configuration to confirm'
 note=('La diagonale ci-dessus décrit la famille. Les composants et capacités ci-dessous ne sont pas encore renseignés pour une référence commerciale précise.' if lang=='fr' else 'The screen size above describes the model family. Components and capacities below have not yet been specified for an exact retail SKU.')
 rows=''.join(f'<div><dt>{e(label)}</dt><dd>{pending}</dd></div>' for label in labels)
 return f'<details class="laptop-configuration"><summary>{title}</summary><p class="shop-specs">{note}</p><dl>{rows}</dl></details>'

def card(p, lang):
 w=WORDS[lang]
 return f'''<article class="shop-card" data-product-id="{p['id']}">
  <figure><a href="{BASE+path(p,lang)}" tabindex="-1" aria-hidden="true"><img src="{BASE}assets/images/{p['category']}-illustration.svg" width="480" height="320" loading="lazy" alt=""></a><figcaption class="illustration-label">{w['illustration']}</figcaption></figure>
  <div class="shop-card-body"><span class="shop-brand">{e(p['brand'])}</span><h3><a href="{BASE+path(p,lang)}">{e(p['name'])}</a></h3><p class="shop-specs">{e(summary(p,lang))}</p>{laptop_configuration_panel(p,lang)}
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
 doc=re.sub(r'<script\s+[^>]*src="'+re.escape(BASE)+r'assets/js/navigation\.js(?:\?[^"]*)?"[^>]*></script>\s*','',doc)
 return doc.replace('</head>',SHOP_SCRIPT+'\n'+NAV_SCRIPT+'\n</head>',1)

HUB_GROUPS = {'components':['gpu','cpu','ram','storage','psu','motherboard','cooling','case'],'accessories':['keyboard','mouse','chair','audio','controller']}
HUB_PATHS = {'fr':{'components':'composants-pc/','accessories':'accessoires/'},'en':{'components':'en/components/','accessories':'en/accessories/'}}

def hub_label(group,lang):
 return {'fr':{'components':'Composants','accessories':'Accessoires'},'en':{'components':'Components','accessories':'Accessories'}}[lang][group]

def grouped_navigation(lang):
 w=WORDS[lang]
 def link(cat):return f'<a href="{BASE+CATEGORY_PATHS[lang][cat]}">{w[cat]}</a>'
 groups=''
 for group,cats in HUB_GROUPS.items():
  title=hub_label(group,lang)
  groups+=f'<details class="nav-group"><summary><a class="nav-hub-link" href="{BASE+HUB_PATHS[lang][group]}">{title}</a></summary><div class="nav-group-links">'+''.join(link(cat) for cat in cats)+(f'<a href="{BASE+homedir(lang)}#components">'+('Tous les composants' if lang=='fr' else 'All components')+'</a>' if group=='components' else '')+'</div></details>'
 return f'<a href="{BASE+homedir(lang)}">{w["home"]}</a><a href="{BASE+("boutique/" if lang=="fr" else "en/shop/")}">'+('Boutique' if lang=='fr' else 'Shop')+'</a>'+groups+link('monitor')+link('laptop')+link('pc')+f'<a href="{BASE+("configurateur/" if lang=="fr" else "en/pc-builder/")}">'+('Configuration PC' if lang=='fr' else 'PC configuration')+f'</a><a href="{BASE+homedir(lang)}#about">{w["about"]}</a>'

def organize_header(doc,lang):
 start=doc.index('<header');end=doc.index('</header>',start)
 header=doc[start:end]
 header=re.sub(r'<a class="cart-link".*?</a>\s*','',header,flags=re.S)
 header=re.sub(r'(<nav\b[^>]*>).*?</nav>',lambda m:m.group(1)+grouped_navigation(lang)+'</nav>',header, count=1,flags=re.S)
 if 'class="menu"' in header:header=header.replace(f'href="{BASE+homedir(lang)}#components"','href="#components"')
 if 'class="menu"' in header:header=header.replace('<button class="menu"',cartlink(lang)+'<button class="menu"',1)
 else:header=header.replace('<nav',cartlink(lang)+'<nav',1)
 return doc[:start]+header+doc[end:]

def addcart(doc,lang):
 return assets(organize_header(doc,lang))

def filters(products,lang):
 w=WORDS[lang];brands=sorted({p['brand'] for p in products})
 category_filters=''
 if len({p['category'] for p in products})>1:
  category_filters=f'<label for="shop-category">'+('Catégorie' if lang=='fr' else 'Category')+'<select id="shop-category" name="category"><option value="">'+('Toutes' if lang=='fr' else 'All')+'</option>'+''.join(f'<option value="{cat}">{e(w[cat])}</option>' for cat in CATEGORY_PATHS[lang] if any(p['category']==cat for p in products))+'</select></label>'
 if products and products[0]['category'] in EXPANSION_FIELDS and all(p['category']==products[0]['category'] for p in products):
  cat=products[0]['category']
  category_filters=''.join(f'<label for="shop-{key}">{fr if lang=="fr" else en}<select id="shop-{key}" name="{key}"><option value="">'+('Tous' if lang=='fr' else 'All')+'</option>'+''.join(f'<option value="{e(value)}">{e(expansion_value(key,value,lang))}</option>' for value in sorted({p[key] for p in products}))+'</select></label>' for key,fr,en in EXPANSION_FIELDS[cat])
 if products and all(p['category']=='gpu' for p in products):
  category_filters=f'''<label for="shop-chip-brand">{'Puce graphique' if lang=='fr' else 'GPU chip brand'}<select id="shop-chip-brand" name="chip_brand"><option value="">{'Toutes' if lang=='fr' else 'All'}</option><option value="AMD">AMD</option><option value="NVIDIA">NVIDIA</option></select></label>'''
 if products and all(p['category']=='monitor' for p in products):
  category_filters=f'''<label for="shop-resolution">{'Résolution' if lang=='fr' else 'Resolution'}<select id="shop-resolution" name="resolution"><option value="">{'Toutes' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{v}">{resolution_label(v)}</option>' for v in sorted({p['resolution'] for p in products}))}</select></label>
  <label for="shop-refresh">{'Fréquence' if lang=='fr' else 'Refresh rate'}<select id="shop-refresh" name="refresh"><option value="">{'Toutes' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{v}">{v} Hz</option>' for v in sorted({p['refresh_hz'] for p in products}))}</select></label>
  <label for="shop-panel">{'Dalle' if lang=='fr' else 'Panel'}<select id="shop-panel" name="panel"><option value="">{'Toutes' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{v}">{v}</option>' for v in sorted({p['panel_type'] for p in products}))}</select></label>'''
 if products and all(p['category']=='cooling' for p in products):
  category_filters=f'''<label for="shop-cooler-type">Type<select id="shop-cooler-type" name="cooler_type"><option value="">{'Tous' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{v}">{cooling_label(v,lang)}</option>' for v in ['air','aio'])}</select></label>
  <label for="shop-radiator">{'Radiateur nominal' if lang=='fr' else 'Nominal radiator'}<select id="shop-radiator" name="radiator"><option value="">{'Tous' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{v}">{v} mm</option>' for v in sorted({p['radiator_mm'] for p in products if p['radiator_mm']}))}</select></label>'''
 if products and all(p['category']=='motherboard' for p in products):
  category_filters=f'''<label for="shop-socket">Socket<select id="shop-socket" name="socket"><option value="">{'Tous' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{v}">{v}</option>' for v in sorted({p['socket'] for p in products}))}</select></label>
  <label for="shop-generation">{'Mémoire' if lang=='fr' else 'Memory'}<select id="shop-generation" name="generation"><option value="">{'Toutes' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{v}">{v}</option>' for v in sorted({p['memory_generation'] for p in products}))}</select></label>
  <label for="shop-form-factor">{'Format' if lang=='fr' else 'Form factor'}<select id="shop-form-factor" name="form_factor"><option value="">{'Tous' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{v}">{v}</option>' for v in sorted({p['form_factor'] for p in products}))}</select></label>'''
 if products and all(p['category']=='psu' for p in products):
  category_filters=f'''<label for="shop-wattage">{'Puissance' if lang=='fr' else 'Wattage'}<select id="shop-wattage" name="wattage"><option value="">{'Toutes' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{v}">{v} W</option>' for v in sorted({p['wattage'] for p in products}))}</select></label>
  <label for="shop-modularity">{'Câblage' if lang=='fr' else 'Cabling'}<select id="shop-modularity" name="modularity"><option value="">{'Tous' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{v}">{modularity_label(v,lang)}</option>' for v in sorted({p['modularity'] for p in products}))}</select></label>'''
 if products and all(p['category']=='ram' for p in products):
  category_filters=f'''<label for="shop-generation">{'Génération' if lang=='fr' else 'Generation'}<select id="shop-generation" name="generation"><option value="">{'Toutes' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{g}">{g}</option>' for g in sorted({p['memory_generation'] for p in products}))}</select></label>
  <label for="shop-capacity">{'Capacité totale' if lang=='fr' else 'Total capacity'}<select id="shop-capacity" name="capacity"><option value="">{'Toutes' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{c}">{c} {"Go" if lang=="fr" else "GB"}</option>' for c in sorted({p['capacity_gb'] for p in products}))}</select></label>'''
 if products and all(p['category']=='storage' for p in products):
  category_filters=f'''<label for="shop-drive-type">{'Type de disque' if lang=='fr' else 'Drive type'}<select id="shop-drive-type" name="drive_type"><option value="">{'Tous' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{kind}">{kind}</option>' for kind in sorted({p['drive_type'] for p in products}))}</select></label>
  <label for="shop-protocol">{'Protocole' if lang=='fr' else 'Protocol'}<select id="shop-protocol" name="storage_protocol"><option value="">{'Tous' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{protocol}">{protocol}</option>' for protocol in sorted({p['storage_protocol'] for p in products}))}</select></label>
  <label for="shop-capacity">{'Capacité annoncée' if lang=='fr' else 'Advertised capacity'}<select id="shop-capacity" name="capacity"><option value="">{'Toutes' if lang=='fr' else 'All'}</option>{''.join(f'<option value="{cap}">{storage_capacity(cap,lang)}</option>' for cap in sorted({p['capacity_gb'] for p in products}))}</select></label>'''
 return f'''<form class="shop-filters" data-shop-filters hidden>
  <label for="shop-search">{w['search']}<input id="shop-search" type="search" name="search" autocomplete="off"></label>
  <label for="shop-brand">{w['brand']}<select id="shop-brand" name="brand"><option value="">{w['all']}</option>{''.join(f'<option value="{b}">{b}</option>' for b in brands)}</select></label>
{category_filters}
  <label for="shop-sort">{w['sort']}<select id="shop-sort" name="sort"><option value="default">{w['default']}</option><option value="price-low">{w['low']}</option><option value="price-high">{w['high']}</option><option value="name">{w['name']}</option></select></label>
  <button class="shop-button secondary" type="reset">{w['reset']}</button></form>
  <p class="shop-result" id="shop-result" role="status" aria-live="polite">{len(products)} {'modèles' if lang=='fr' else 'models'}</p>
  <p id="shop-empty" hidden>{w['empty']}</p><noscript><p class="shop-noscript">{w['filters_note']}</p></noscript>'''

def schema_text(data):return json.dumps(data,ensure_ascii=False,indent=2).replace('</','<\\/')
def breadcrumbs(names,lang):
 return {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i+1,'name':name,'item':LIVE+url} for i,(name,url) in enumerate(names)]}

def document(title,description,url,alternate,lang,body,bread=None,noindex=False):
 w=WORDS[lang];fr=url if lang=='fr' else alternate;en=url if lang=='en' else alternate
 nav=''.join(f'<a href="{BASE+target}">{label}</a>' for target,label in [(homedir(lang),w['home']),('boutique/' if lang=='fr' else 'en/shop/','Boutique' if lang=='fr' else 'Shop')]+[(CATEGORY_PATHS[lang][cat],w[cat]) for cat in ['gpu','cpu']+[key for key in CATEGORY_PATHS[lang] if key not in ['gpu','cpu']]])
 nav=nav.replace(f'<a href="{BASE+url}">',f'<a href="{BASE+url}" aria-current="page">')
 return organize_header(f'''<!DOCTYPE html>
<html lang="{lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)}</title><meta name="description" content="{e(description)}"><link rel="canonical" href="{LIVE+url}">
{'<meta name="robots" content="noindex,follow">' if noindex else ''}
<link rel="alternate" hreflang="fr" href="{LIVE+fr}"><link rel="alternate" hreflang="en" href="{LIVE+en}"><link rel="alternate" hreflang="x-default" href="{LIVE+fr}">
<link rel="stylesheet" href="{BASE}assets/css/category.css"><link rel="stylesheet" href="{BASE}assets/css/language.css"><link rel="stylesheet" href="{BASE}assets/css/shop.css">{SHOP_SCRIPT}{NAV_SCRIPT}
{'<script type="application/ld+json">'+schema_text(breadcrumbs(bread,lang))+'</script>' if bread else ''}
</head><body><a class="skip-link" href="#main">{w['skip']}</a><div class="demo-banner">{w['banner']}</div>
<header class="header"><div class="container header-inner"><a class="logo" href="{BASE+homedir(lang)}" aria-label="NEXRIG - {w['home']}">NEX<span>RIG</span></a><a class="language-switch" href="{BASE+alternate}" lang="{'en' if lang=='fr' else 'fr'}" hreflang="{'en' if lang=='fr' else 'fr'}">{'English' if lang=='fr' else 'Français'}</a><nav aria-label="{w['nav']}">{nav}</nav></div></header>
<main class="container" id="main" tabindex="-1">{('<nav class="breadcrumbs" aria-label="'+w['bread']+'"><ol>'+''.join('<li>'+('<a href="'+BASE+target+'">'+e(name)+'</a>' if i<len(bread)-1 else '<span aria-current="page">'+e(name)+'</span>')+'</li>' for i,(name,target) in enumerate(bread))+'</ol></nav>') if bread else ''}{body}</main>
<footer class="footer"><div class="container footer-inner"><span>© 2026 NEXRIG · {'Boutique fictive' if lang=='fr' else 'Fictional store'}</span><a href="{BASE+homedir(lang)}#about">{w['about']}</a><a href="{BASE+cartpath(lang)}">{w['cart']}</a></div></footer></body></html>\n''',lang)

def product_description(p,lang):
 if lang=='fr':
  return f"Découvrez {p['name']} : {summary(p,lang)}. Caractéristiques et compatibilité dans le catalogue de démonstration NEXRIG au Maroc."
 return f"Explore {p['name']}: {summary(p,lang)}. Specifications and compatibility in NEXRIG’s demonstration catalogue in Morocco."

def build_product(p,lang):
 w=WORDS[lang];category=CATEGORY_PATHS[lang][p['category']];url=path(p,lang);alt=path(p,'en' if lang=='fr' else 'fr')
 if p['category'] in EXPANSION_ADVICE:
  advice=EXPANSION_ADVICE[p['category']][0 if lang=='fr' else 1]
  extra=('Consultez la documentation de la référence exacte et les accessoires inclus. Le panier simule une sélection sans valider automatiquement la compatibilité. Aucun stock, livraison ou garantie commerciale n’est annoncé.' if lang=='fr' else 'Consult documentation for the exact model and included accessories. The cart simulates a selection without automatically validating compatibility. No stock, delivery or commercial warranty is claimed.')
 elif p['category']=='cpu':
  advice=('Vérifiez le socket, la liste de CPU compatibles et le BIOS de votre carte mère. Le type de RAM doit correspondre à la carte mère. Pour Intel, DDR4 et DDR5 dépendent du modèle de carte mère et ne sont pas interchangeables. Vérifiez le refroidisseur, son kit de fixation et le contenu de la boîte.' if lang=='fr' else 'Check the socket, supported CPU list and motherboard BIOS. RAM must match the motherboard. For Intel, DDR4 and DDR5 depend on the motherboard model and are not interchangeable. Check the cooler, its mounting kit and box contents.')
  extra=('Ce processeur possède un circuit graphique intégré ; vérifiez les sorties vidéo de la carte mère. Une carte dédiée reste pertinente pour les jeux exigeants.' if p['integrated_graphics'] else 'Ce processeur ne possède pas de circuit graphique intégré. Une carte graphique séparée est nécessaire.') if lang=='fr' else ('This processor has integrated graphics; check the motherboard’s video outputs. A dedicated card remains relevant for demanding games.' if p['integrated_graphics'] else 'This processor has no integrated graphics. A separate graphics card is required.')
 elif p['category']=='monitor':
  advice=('Vérifiez les modes de résolution et de fréquence acceptés par chaque entrée vidéo, la sortie de votre GPU et le câble utilisé. La fréquence nominale indiquée ne garantit pas le même mode sur tous les ports. Des modèles proposent un mode overclock distinct, non repris ici. Activez la fréquence souhaitée dans les paramètres du système.' if lang=='fr' else 'Check resolution and refresh modes supported by each video input, your GPU output and the cable used. The nominal refresh rate shown does not guarantee the same mode on every port. Some models offer a separate overclock mode, which is not listed here. Select the desired refresh rate in system settings.')
  extra=('La fréquence de l’écran ne garantit pas le nombre d’images par seconde produit par le PC. Consultez les tests pour la réactivité, les couleurs et le contraste. Vérifiez séparément le VRR, le HDR, la connectique, le support VESA et les réglages du pied pour la référence exacte. Aucun résultat de performance n’est garanti et le panier ne valide pas automatiquement la compatibilité.' if lang=='fr' else 'Monitor refresh rate does not guarantee the frame rate produced by your PC. Consult tests for motion handling, colour and contrast. Separately check VRR, HDR, connections, VESA mounting and stand adjustment for the exact model. No performance result is guaranteed and the cart does not automatically validate compatibility.')
 elif p['category']=='cooling':
  advice=('Vérifiez la liste de sockets et le kit de montage pour la référence et la révision exactes. Un kit AM4, AM5 ou LGA1700 peut être inclus, séparé ou incompatible selon le produit et son emballage. Ne supposez pas qu’un refroidisseur convient à tous les sockets. Consultez les instructions de montage et le dégagement autour du socket.' if lang=='fr' else 'Check socket support and the mounting kit for the exact model and revision. An AM4, AM5 or LGA1700 kit may be included, separate or incompatible depending on the product and package. Do not assume a cooler fits every socket. Consult installation instructions and socket-area clearance.')
  extra=(('Pour ce ventirad, vérifiez la hauteur acceptée par le boîtier, le dégagement RAM et la compatibilité avec les dissipateurs de la carte mère. Comparez des tests adaptés au CPU et à votre charge ; aucune température ou capacité TDP n’est garantie ici.' if lang=='fr' else 'For this air cooler, check case height clearance, RAM clearance and motherboard heatsink compatibility. Compare tests matching your CPU and workload; no temperature or TDP capacity is guaranteed here.') if p['cooler_type']=='air' else ('La taille du radiateur est nominale : vérifiez ses dimensions réelles, son épaisseur avec les ventilateurs, la longueur des tuyaux et les emplacements du boîtier. Suivez le manuel pour la pompe, les ventilateurs, le RGB et l’orientation. N’ouvrez pas le circuit scellé.' if lang=='fr' else 'Radiator size is nominal: check actual dimensions, thickness with fans, tube length and case mounting locations. Follow the manual for pump, fan and RGB connections and installation orientation. Do not open the sealed loop.'))
 elif p['category']=='motherboard':
  advice=('Le socket seul ne garantit pas la compatibilité CPU. Consultez la liste de processeurs pris en charge et la version minimale du BIOS pour le modèle et la révision exacts. Les cartes AM4 de ce catalogue utilisent la DDR4, les cartes AM5 la DDR5. Pour LGA1700, choisissez la génération de RAM indiquée pour cette carte : DDR4 et DDR5 ne sont pas interchangeables.' if lang=='fr' else 'The socket alone does not guarantee CPU compatibility. Check the supported CPU list and minimum BIOS version for the exact model and hardware revision. The AM4 boards here use DDR4, while AM5 boards use DDR5. For LGA1700, use the memory generation specified for this board: DDR4 and DDR5 are not interchangeable.')
  extra=('Vérifiez le format accepté par le boîtier, les entretoises, les prises CPU EPS et les connecteurs de façade. Consultez le manuel pour les emplacements RAM, les profils mémoire, les ports M.2/SATA et le partage de lignes. Les sorties vidéo dépendent aussi du processeur. Aucune configuration ajoutée au panier n’est automatiquement validée.' if lang=='fr' else 'Check case form-factor support, standoffs, CPU EPS power and front-panel connectors. Consult the manual for RAM slots, memory profiles, M.2/SATA ports and lane sharing. Video outputs also depend on the processor. Adding parts to the cart does not automatically validate a build.')
 elif p['category']=='psu':
  advice=('Dimensionnez l’alimentation pour la configuration entière, en suivant les recommandations du fabricant de la carte graphique et en prévoyant une marge. Vérifiez la longueur du bloc ATX, les connecteurs CPU et GPU et les câbles fournis pour la référence exacte.' if lang=='fr' else 'Size the power supply for the whole system, follow the graphics card manufacturer’s recommendation and allow headroom. Check ATX unit length, CPU and GPU connectors and included cables for the exact model.')
  extra=('Ne mélangez jamais des câbles modulaires sans confirmation explicite de compatibilité par le fabricant. Les connecteurs côté alimentation ne sont pas universels. Vérifiez séparément les révisions ATX, les connecteurs GPU récents et les certifications : ils ne sont pas déduits du nom ou de la puissance. N’ouvrez pas le bloc d’alimentation.' if lang=='fr' else 'Never mix modular cables without explicit manufacturer confirmation of compatibility. PSU-side connectors are not universal. Check ATX revisions, newer GPU connectors and certifications separately: they are not inferred from the name or wattage. Do not open the power supply unit.')
 elif p['category']=='storage':
  if p['storage_protocol']=='NVMe':
   advice=('Ce SSD NVMe nécessite un emplacement M.2 acceptant le protocole NVMe et la longueur 2280 (22 × 80 mm). Vérifiez la génération et le nombre de lignes PCIe du port. Un emplacement M.2 limité au SATA ne convient pas. Une liaison PCIe plus ancienne peut limiter le débit ; consultez le manuel et la prise en charge du démarrage NVMe.' if lang=='fr' else 'This NVMe SSD needs an M.2 slot supporting NVMe and the 2280 length (22 × 80 mm). Check the slot’s PCIe generation and lane count. A SATA-only M.2 slot is not suitable. An older PCIe connection can limit throughput; consult the manual and NVMe boot support.')
  else:
   advice=('Ce disque SATA nécessite un câble de données vers un port SATA, un connecteur d’alimentation SATA et une baie adaptée à son format. Vérifiez les fixations et l’espace dans le boîtier. Certains emplacements M.2 partagent des ressources avec des ports SATA : consultez le manuel de la carte mère.' if lang=='fr' else 'This SATA drive needs a data cable to a SATA port, a SATA power connector and a bay matching its form factor. Check mounting and case space. Some M.2 slots share resources with SATA ports: consult the motherboard manual.')
  extra=('La capacité annoncée par le fabricant et celle affichée par le système peuvent différer en raison des unités et du formatage. Vérifiez le dissipateur ou le refroidissement requis pour la référence exacte. Ce catalogue n’annonce pas de débits mesurés ni d’endurance garantie. Gardez une sauvegarde indépendante de vos fichiers importants.' if lang=='fr' else 'Manufacturer-advertised and system-reported capacity can differ because of units and formatting. Check heatsink or cooling requirements for the exact model. This catalogue makes no measured speed or guaranteed endurance claims. Keep an independent backup of important files.')
 elif p['category']=='ram':
  advice=('Vérifiez que votre carte mère et votre processeur acceptent cette génération de mémoire. Ces modules UDIMM sont destinés aux PC de bureau : ils ne remplacent pas des SO-DIMM pour ordinateur portable. Vérifiez la capacité maximale, le nombre d’emplacements, la liste QVL et la hauteur sous le refroidisseur.' if lang=='fr' else 'Check that your motherboard and processor support this memory generation. These UDIMM modules are for desktop PCs: they do not replace laptop SO-DIMMs. Check maximum capacity, slot count, the QVL and cooler clearance.')
  extra=('Le débit annoncé est une caractéristique de la référence, pas une vitesse garantie dans chaque PC. Selon le kit, le BIOS et la plateforme, un profil XMP ou EXPO peut être nécessaire pour atteindre ce débit. Vérifiez le profil proposé par le fabricant pour cette référence exacte. Utilisez de préférence les barrettes du même kit et les emplacements recommandés par la carte mère.' if lang=='fr' else 'The advertised data rate is a model specification, not a guaranteed speed in every PC. Depending on the kit, BIOS and platform, an XMP or EXPO profile may be needed to reach it. Check the profile offered for this exact part number. Prefer modules from the same kit and the motherboard’s recommended slots.')
 else:
  advice=('Le modèle présenté désigne le GPU et sa capacité mémoire, pas une référence de carte ASUS, MSI, Sapphire ou d’un autre fabricant partenaire. Dimensions, connecteurs, refroidissement et type de mémoire peuvent varier : vérifiez la référence exacte, l’espace dans le boîtier et l’alimentation recommandée.' if lang=='fr' else 'This model identifies the GPU and memory capacity, not a specific ASUS, MSI, Sapphire or other partner card. Dimensions, connectors, cooling and memory type may vary: check the exact card model, case space and recommended power supply.')
  extra=('Les performances dépendent des jeux, des réglages, de la résolution et du reste du PC. Consultez des tests indépendants correspondant à votre usage.' if lang=='fr' else 'Performance depends on games, settings, resolution and the rest of the PC. Consult independent tests matching your use case.')
 related=[x for x in PRODUCTS if x['category']==p['category'] and x['id']!=p['id']][:4]
 dl=''.join(f'<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k,v in label_specs(p,lang))
 body=f'''<div class="product-layout"><figure><img src="{BASE}assets/images/{p['category']}-illustration.svg" alt="{w[p['category']+'_alt']}" width="480" height="320"><figcaption class="illustration-label">{w['illustration']}</figcaption></figure>
<div class="product-purchase"><span class="eyebrow">{e(p['brand'])} · {w[p['category']]}</span><h1>{e(p['name'])}</h1><p>{e(product_description(p,lang))}</p><div class="shop-price">{money(p['demo_price_mad'],lang)}<small class="shop-disclaimer">{w['demo']}</small></div><dl aria-label="{w['specs']}">{dl}</dl>{laptop_configuration_panel(p,lang)}<button class="shop-button" type="button" data-add-to-cart="{p['id']}" disabled>{w['add']}</button><noscript><p class="shop-noscript">{w['filters_note']}</p></noscript><p class="shop-disclaimer">{'Le panier sert uniquement à simuler une sélection. Aucun paiement ni commande réelle.' if lang=='fr' else 'The cart only simulates a selection. No payment or real order.'}</p><a href="{BASE+category}">{w['back']}</a></div></div>
<section><h2>{w['compat']}</h2><p>{advice}</p><p>{extra}</p><p><a href="{e(p['source'])}">{('Référence externe' if lang=='fr' else 'External reference') if p['category'] in ['audio','pc'] else w['source']} : {e(p['brand'])}</a></p></section>
<section><h2>{w['related']}</h2><div class="shop-grid">{''.join(card(x,lang) for x in related)}</div></section>'''
 if p['category']=='pc':
  components={key:next(x for x in PRODUCTS if x['id']==id) for key,id in p['components'].items()}
  rows=''.join(f'<div><dt>{w[key]}</dt><dd><a href="{BASE+path(item,lang)}">{e(item["name"])}</a></dd></div>' for key,item in components.items())
  body+=f'<section class="product-purchase"><h2>'+('Composition complète' if lang=='fr' else 'Complete component list')+f'</h2><dl>{rows}</dl><p>'+('Le prix de démonstration est la somme de ces huit composants, sans frais d’assemblage, système d’exploitation, périphériques, livraison ni taxes supplémentaires. Aucun service réel ni licence Windows n’est inclus.' if lang=='fr' else 'The demonstration price is the sum of these eight components, with no assembly fee, operating system, peripherals, delivery or additional taxes. No real service or Windows licence is included.')+'</p></section>'
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

def build_hub(group,lang):
 fr=lang=='fr';url=HUB_PATHS[lang][group];alt=HUB_PATHS['en' if fr else 'fr'][group]
 title=('Composants PC au Maroc' if group=='components' else 'Accessoires gaming au Maroc') if fr else ('PC components in Morocco' if group=='components' else 'Gaming accessories in Morocco')
 intro=('Découvrez une sélection par catégorie, comparez les fiches et ajoutez des produits au panier de démonstration.' if fr else 'Explore a selection from each category, compare product details and add items to the demonstration cart.')
 body=f'<div class="hero"><h1>{title}</h1><p class="intro">{intro}</p><p class="shop-disclaimer">{WORDS[lang]["demo"]}</p></div>'
 chosen=[]
 for cat in HUB_GROUPS[group]:
  items=[p for p in PRODUCTS if p['category']==cat]
  # Show different brands where possible; keep stable catalogue order.
  selection=[];brands=set()
  for p in items:
   if p['brand'] not in brands:selection.append(p);brands.add(p['brand'])
   if len(selection)==3:break
  if len(selection)<3:selection+=[p for p in items if p not in selection][:3-len(selection)]
  chosen+=selection
  body+=f'<section id="selection-{cat}"><h2><a href="{BASE+CATEGORY_PATHS[lang][cat]}">{WORDS[lang][cat]}</a></h2><div class="shop-grid">'+''.join(card(p,lang) for p in selection)+f'</div><p class="hub-category-link"><a href="{BASE+CATEGORY_PATHS[lang][cat]}">'+('Voir toute la catégorie' if fr else 'View the full category')+' →</a></p></section>'
 doc=document(title+' | NEXRIG',intro,url,alt,lang,body,[(WORDS[lang]['home'],homedir(lang)),(hub_label(group,lang),url)])
 listing={'@context':'https://schema.org','@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':p['name'],'url':LIVE+path(p,lang)} for i,p in enumerate(chosen)]}
 doc=doc.replace('<body>','<body class="shop-category">',1).replace('</head>','<script type="application/ld+json">'+schema_text(listing)+'</script></head>',1)
 target=ROOT/url/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(doc)

def game_finder_panel(lang):
 fr=lang=='fr';games=json.loads((ROOT/'data/game-requirements.json').read_text())
 options=''.join(f'<option value="{g["id"]}">{e(g["name"])}</option>' for g in games['games'])
 content='<section id="game-finder"><h2>'+('Trouvez un PC pour vos jeux' if fr else 'Find a PC for your games')+'</h2><p>'+('Choisissez un jeu pour recevoir une suggestion de composants, puis personnalisez chaque pièce.' if fr else 'Choose a game for suggested components, then customize each part.')+'</p><form id="game-finder-form" class="fps-controls"><label for="finder-game">'+('Jeu' if fr else 'Game')+f'<select id="finder-game">{options}</select></label><label for="finder-budget">'+('Budget de démonstration maximum (DH)' if fr else 'Maximum demonstration budget (DH)')+'<input id="finder-budget" type="number" min="0" step="1" placeholder="'+('Sans limite' if fr else 'No limit')+'"></label><button class="shop-button">'+('Suggérer des composants' if fr else 'Suggest components')+'</button></form><div id="finder-result" class="fps-result" aria-live="polite"></div><p class="shop-disclaimer">'+('Comparaison indicative avec les exigences publiées, sans test de performance. Vérifiez la version actuelle, Windows, les pilotes et les exigences de sécurité sur la source officielle. Aucun FPS, réglage ou fluidité n’est garanti. Les prix sont fictifs.' if fr else 'Indicative comparison against published requirements, without performance testing. Check the current version, Windows, drivers and security requirements at the official source. No FPS, settings or smoothness is guaranteed. Prices are fictional.')+'</p></section>'
 return content+'<script type="application/json" id="finder-data">'+schema_text({'games':games['games'],'products':PRODUCTS})+'</script><script src="'+BASE+'assets/js/game-finder.js?v='+hashlib.sha256((ROOT/'assets/js/game-finder.js').read_bytes()).hexdigest()[:12]+'" defer></script>'

def build_selector(lang):
 w=WORDS[lang];fr=lang=='fr';url='configurateur/' if fr else 'en/pc-builder/';alt='en/pc-builder/' if fr else 'configurateur/'
 title='Construisez votre PC' if fr else 'Build your PC'
 cats=['cpu','gpu','motherboard','ram','storage','cooling','psu','case']
 fields=''
 for cat in cats:
  options=''.join(f'<option value="{p["id"]}">{e(p["name"])} — {money(p["demo_price_mad"],lang)}</option>' for p in PRODUCTS if p['category']==cat)
  fields+=f'<div class="builder-field"><label for="build-{cat}">{w[cat]}</label><select id="build-{cat}" name="{cat}" required><option value="">'+('Choisir…' if fr else 'Choose…')+f'</option>{options}</select><p data-build-detail="{cat}"></p></div>'
 note=('Vérifications limitées au socket CPU/carte mère et au type de RAM. BIOS, dimensions, fixations du refroidisseur, ports de stockage, connecteurs et puissance de l’alimentation restent à vérifier dans les fiches exactes. Aucun FPS ni compatibilité complète ne sont garantis.' if fr else 'Checks cover CPU/motherboard socket and RAM type only. BIOS, dimensions, cooler mounting, storage ports, power connectors and PSU capacity still need checking against exact specifications. No FPS or complete compatibility is guaranteed.')
 body=f'<div class="hero"><h1>{title}</h1><p class="intro">'+('Choisissez huit composants et comparez leur total de démonstration.' if fr else 'Choose eight components and compare their demonstration total.')+'</p></div><form id="pc-selector" class="pc-selector"><div class="builder-fields">'+fields+'</div><aside class="builder-summary"><h2>'+('Votre configuration' if fr else 'Your configuration')+'</h2><p id="build-progress"></p><div id="build-total" class="cart-total" aria-live="polite"></div><p class="shop-disclaimer">'+w['demo']+'</p><ul id="build-checks" aria-live="polite"></ul><p>'+note+'</p><button id="build-add" class="shop-button" disabled>'+('Ajouter les composants au panier' if fr else 'Add components to cart')+'</button><button type="reset" class="shop-button secondary">'+('Réinitialiser' if fr else 'Reset')+'</button><p id="build-status" role="status"></p><a href="'+BASE+cartpath(lang)+'">'+w['cart']+'</a></aside></form><noscript><p class="note">'+('Activez JavaScript pour calculer le total et utiliser le configurateur.' if fr else 'Enable JavaScript to calculate totals and use the builder.')+'</p></noscript><script type="application/json" id="builder-products">'+schema_text([p for p in PRODUCTS if p['category'] in cats])+'</script><script src="'+BASE+'assets/js/builder.js?v='+hashlib.sha256((ROOT/'assets/js/builder.js').read_bytes()).hexdigest()[:12]+'" defer></script>'
 body=game_finder_panel(lang)+body
 doc=document(title+' | NEXRIG',title+' — NEXRIG '+w['demo'],url,alt,lang,body,[(w['home'],homedir(lang)),(title,url)])
 target=ROOT/url/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(doc)

def compact_category_intro(doc, cat, lang, count):
 # Keep the original introduction and guide navigation below the product grid.
 if 'id="category-overview"' in doc:return doc
 start=doc.index('<div class="hero">')
 end=doc.index('<!-- catalogue:start -->',start)
 original=doc[start:end]
 heading=re.search(r'<h1>.*?</h1>',original,re.S).group(0)
 paragraphs=re.findall(r'<p\b[^>]*>.*?</p>',original,re.S)
 navigation=re.search(r'<(?:nav|div) class="jump-links".*?</(?:nav|div)>',original,re.S)
 intro=(f'Comparez {count} modèles, consultez leurs fiches et ajoutez votre sélection au panier de démonstration.' if lang=='fr' else f'Compare {count} models, view their details and add your selection to the demonstration cart.')
 if cat=='pc':intro=('Comparez six configurations proposées avec leur composition détaillée et des prix de démonstration.' if lang=='fr' else 'Compare six proposed configurations with full component lists and demonstration prices.')
 compact=f'<div class="hero">{heading}<p class="intro">{intro}</p></div>\n'
 overview='<section id="category-overview"><h2>'+('À propos de ce catalogue' if lang=='fr' else 'About this catalogue')+'</h2>'+''.join(paragraphs)+(navigation.group(0) if navigation else '')+'</section>\n'
 doc=doc[:start]+compact+doc[end:]
 return doc.replace('</main>',overview+'</main>',1)

BLOG_PATHS = {'fr': 'blog/quelle-carte-graphique-choisir/', 'en': 'en/blog/how-to-choose-a-graphics-card/'}

def build_blog(lang):
 index='blog/' if lang=='fr' else 'en/blog/'
 other='en' if lang=='fr' else 'fr'
 title='Quelle carte graphique choisir pour son PC gamer ?' if lang=='fr' else 'How to choose a graphics card for your gaming PC'
 description=('Quelle carte graphique choisir ? Comparez jeux, résolution, VRAM et compatibilité pour sélectionner un GPU adapté à votre PC gamer.' if lang=='fr' else 'Learn how to choose a graphics card for your gaming PC: compare games, resolution, VRAM, benchmarks, compatibility and your whole-system budget.')
 article=(ROOT/'content/blog'/('quelle-carte-graphique-choisir.'+lang+'.html')).read_text()
 bread=[(WORDS[lang]['home'],homedir(lang)),('Blog',index),(title,BLOG_PATHS[lang])]
 doc=document(title+' | NEXRIG',description,BLOG_PATHS[lang],BLOG_PATHS[other],lang,article,bread)
 schema={'@context':'https://schema.org','@type':'BlogPosting','headline':title,'description':description,'inLanguage':lang,'mainEntityOfPage':LIVE+BLOG_PATHS[lang]}
 doc=doc.replace('</head>','<script type="application/ld+json">'+schema_text(schema)+'</script></head>')
 target=ROOT/BLOG_PATHS[lang]/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(doc)
 intro='Des guides pratiques pour comprendre le matériel et préparer votre configuration.' if lang=='fr' else 'Practical guides to understand hardware and plan your configuration.'
 body='<div class="hero"><span class="eyebrow">NEXRIG</span><h1>'+('Blog : guides pour votre PC gamer' if lang=='fr' else 'Blog: guides for your gaming PC')+'</h1><p class="intro">'+intro+'</p></div><section><h2>'+('Choisir ses composants' if lang=='fr' else 'Choosing components')+'</h2><div class="guide-grid"><article class="guide-card"><h3><a href="'+BASE+BLOG_PATHS[lang]+'">'+title+'</a></h3><p>'+description+'</p></article></div></section>'
 target=ROOT/index/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(document('Blog PC gamer : guides matériels | NEXRIG' if lang=='fr' else 'Gaming PC blog: hardware guides | NEXRIG',intro,index,'en/blog/' if lang=='fr' else 'blog/',lang,body,[(WORDS[lang]['home'],homedir(lang)),('Blog',index)]))

def main():
 assert len({p['id'] for p in PRODUCTS})==len(PRODUCTS),'Duplicate product IDs'
 for p in PRODUCTS:
  assert re.fullmatch('[a-z0-9-]+',p['id'])
  assert isinstance(p['demo_price_mad'],int) and p['demo_price_mad']>0
  assert p['category'] in CATEGORY_PATHS['fr']
 for lang in ['fr','en']:
  for cat,category_path in CATEGORY_PATHS[lang].items():
   target=ROOT/category_path/'index.html';doc=target.read_text();items=[p for p in PRODUCTS if p['category']==cat]
   heading=(EXPANSION_LABELS[lang][cat]+(' : catalogue' if lang=='fr' else ' catalogue')) if cat in EXPANSION_PATHS else {'fr':{'cpu':'Catalogue de processeurs AMD et Intel','gpu':'Catalogue de cartes graphiques AMD et NVIDIA','ram':'Catalogue RAM DDR4 et DDR5','storage':'Catalogue SSD et disques durs','psu':'Catalogue d’alimentations PC','motherboard':'Catalogue de cartes mères AMD et Intel','cooling':'Catalogue de ventirads et refroidisseurs liquides AIO','monitor':'Catalogue d’écrans PC Full HD, QHD et 4K'},'en':{'cpu':'AMD and Intel processor catalogue','gpu':'AMD and NVIDIA graphics card catalogue','ram':'DDR4 and DDR5 RAM catalogue','storage':'SSD and hard drive catalogue','psu':'PC power supply catalogue','motherboard':'AMD and Intel motherboard catalogue','cooling':'Air cooler and liquid AIO catalogue','monitor':'Full HD, QHD and 4K monitor catalogue'}}[lang][cat]
   note=('Prix fictifs · panier de démonstration · aucune vente réelle.' if lang=='fr' else 'Fictional prices · demonstration cart · no real sales.')
   block=f'<!-- catalogue:start -->\n<section id="modeles" aria-labelledby="modeles-title"><h2 id="modeles-title">{heading}</h2><p class="section-intro">{note}</p>{filters(items,lang)}<div class="shop-grid">'+''.join(card(p,lang) for p in items)+'</div></section>\n<!-- catalogue:end -->\n'
   if '<!-- catalogue:start -->' in doc:doc=re.sub(r'<!-- catalogue:start -->.*?<!-- catalogue:end -->\s*',lambda _:block,doc,flags=re.S)
   else:
    start=doc.index('    <section id="modeles"');end=doc.index('    <section id="comparaison"');doc=doc[:start]+block+doc[end:].lstrip()
   doc=doc.replace('Découvrez deux exemples de GPU NVIDIA GeForce et AMD Radeon','Explorez les modèles NVIDIA GeForce et AMD Radeon').replace('Découvrez trois exemples de CPU AMD Ryzen et Intel Core','Explorez les modèles AMD Ryzen et Intel Core').replace('Explore two NVIDIA GeForce and AMD Radeon GPU examples','Explore NVIDIA GeForce and AMD Radeon models').replace('Explore three AMD Ryzen and Intel Core CPU examples','Explore AMD Ryzen and Intel Core models')
   doc=doc.replace('Il ne propose ni commande, ni stock, ni prix de vente.','Les prix sont des montants de démonstration ; aucune vente ni disponibilité en stock n’est annoncée.').replace('sans commande, stock ni prix de vente.','avec des prix de démonstration, sans commande réelle ni disponibilité en stock annoncée.').replace('It offers no ordering, stock availability or selling prices.','Prices are demonstration amounts; no real ordering or stock availability is offered.').replace('without ordering, stock availability or selling prices.','with demonstration prices, without real ordering or stock availability.')
   doc=doc.replace('Exemples de GPU</a>','Catalogue GPU</a>').replace('Exemples de CPU</a>','Catalogue CPU</a>').replace('GPU examples</a>','GPU catalogue</a>').replace('CPU examples</a>','CPU catalogue</a>')
   doc=compact_category_intro(doc,cat,lang,len(items))
   doc=addcart(doc,lang)
   if 'class="shop-category"' not in doc:doc=doc.replace('<body>','<body class="shop-category">',1)
   listing={'@context':'https://schema.org','@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':p['name'],'url':LIVE+path(p,lang)} for i,p in enumerate(items)]}
   doc=re.sub(r'<script type="application/ld\+json" id="catalogue-schema">.*?</script>\s*','',doc,flags=re.S)
   doc=doc.replace('</head>','<script type="application/ld+json" id="catalogue-schema">'+schema_text(listing)+'</script>\n</head>',1);target.write_text(doc)
  shopurl='boutique/' if lang=='fr' else 'en/shop/'
  shopalt='en/shop/' if lang=='fr' else 'boutique/'
  title='Boutique PC au Maroc' if lang=='fr' else 'PC shop in Morocco'
  description='Comparez les composants, périphériques et PC gamer de démonstration NEXRIG.' if lang=='fr' else 'Browse NEXRIG demonstration components, peripherals and gaming PCs.'
  body=f'<div class="hero"><h1>{title}</h1><p class="intro">{description}</p></div><section id="modeles"><h2>'+('Tous les produits' if lang=='fr' else 'All products')+'</h2><p>'+('Prix fictifs et panier de démonstration. Les PC sont des configurations proposées, pas des machines assemblées ou testées.' if lang=='fr' else 'Fictional prices and a demonstration cart. PCs are proposed configurations, not assembled or tested machines.')+f'</p>{filters(PRODUCTS,lang)}<div class="shop-grid">'+''.join(card(p,lang) for p in PRODUCTS)+'</div></section>'
  shop=document(title+' | NEXRIG',description,shopurl,shopalt,lang,body,[(WORDS[lang]['home'],homedir(lang)),(title,shopurl)])
  listing={'@context':'https://schema.org','@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':p['name'],'url':LIVE+path(p,lang)} for i,p in enumerate(PRODUCTS)]}
  shop=shop.replace('<body>','<body class="shop-category">',1)
  shop=shop.replace('</head>','<script type="application/ld+json">'+schema_text(listing)+'</script></head>',1)
  target=ROOT/shopurl/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(shop)
  for p in PRODUCTS:build_product(p,lang)
  build_blog(lang)
  build_selector(lang)
  for group in HUB_GROUPS:build_hub(group,lang)
  build_cart(lang)
  target=ROOT/homedir(lang)/'index.html';doc=target.read_text();featured_ids=['nvidia-geforce-rtx-4060','amd-radeon-rx-7800-xt','amd-ryzen-5-5600','intel-core-i5-12400f'];featured=[next(p for p in PRODUCTS if p['id']==id) for id in featured_ids]
  block='<!-- featured:start -->\n<div class="shop-grid">'+''.join(card(p,lang) for p in featured)+'</div>\n<!-- featured:end -->'
  if '<!-- featured:start -->' in doc:doc=re.sub(r'<!-- featured:start -->.*?<!-- featured:end -->',lambda _:block,doc,flags=re.S)
  else:
   start=doc.index('        <div class="product-grid">');end=doc.index('\n      </div>\n    </section>',start);doc=doc[:start]+block+doc[end:]
  pcs=[p for p in PRODUCTS if p['category']=='pc']
  pcurl=CATEGORY_PATHS[lang]['pc']
  builder=f'<section class="section builder" id="builder"><div class="container"><div class="section-head"><div><span class="eyebrow">NEXRIG</span><h2>'+('Des configurations PC gamer à comparer' if lang=='fr' else 'Gaming PC configurations to compare')+f'</h2></div><a class="text-link" href="{BASE+pcurl}">'+('Voir les 6 PC →' if lang=='fr' else 'View all 6 PCs →')+'</a></div><p><a class="shop-button" href="'+BASE+('configurateur/' if lang=='fr' else 'en/pc-builder/')+'">'+('Construire mon PC' if lang=='fr' else 'Build my PC')+'</a></p><p class="intro">'+('Comparez les plateformes AMD et Intel, la carte graphique, la RAM et le stockage. Chaque fiche détaille une configuration complète proposée pour la démonstration, pas une machine assemblée ou testée.' if lang=='fr' else 'Compare AMD and Intel platforms, graphics, RAM and storage. Each page details a complete proposed demonstration configuration, not an assembled or tested machine.')+'</p><div class="shop-grid">'+''.join(card(p,lang) for p in pcs[:3])+'</div></div></section>'
  prices=[p['demo_price_mad'] for p in pcs]
  budget_intro=('Les six configurations du catalogue vont de '+money(min(prices),lang)+' à '+money(max(prices),lang)+'. Ce sont des montants fictifs calculés à partir des huit composants, pas des prix du marché ni des devis. Aucun montage, système d’exploitation, périphérique ou service de livraison n’est inclus.' if lang=='fr' else 'The six catalogue configurations range from '+money(min(prices),lang)+' to '+money(max(prices),lang)+'. These are fictional totals calculated from eight components, not market prices or quotations. No assembly, operating system, peripherals or delivery service is included.')
  budget_links=('Comparez le '+f'<a href="{BASE+path(pcs[0],lang)}">NEXRIG Atlas</a>, le <a href="{BASE+path(pcs[1],lang)}">NEXRIG Pulse</a> et le <a href="{BASE+path(pcs[2],lang)}">NEXRIG Vector</a> : GPU, mémoire et plateforme diffèrent. Réservez aussi un budget à l’écran et aux accessoires si vous en avez besoin.' if lang=='fr' else 'Compare '+f'<a href="{BASE+path(pcs[0],lang)}">NEXRIG Atlas</a>, <a href="{BASE+path(pcs[1],lang)}">NEXRIG Pulse</a> and <a href="{BASE+path(pcs[2],lang)}">NEXRIG Vector</a>: graphics, memory and platform differ. Also allow for a monitor and accessories if needed.')
  builder=builder.replace('</div></div></section>','</div><div id="budget"><h2>'+('Quel prix pour un PC gamer au Maroc ?' if lang=='fr' else 'What budget should you plan for a gaming PC in Morocco?')+'</h2><p>'+budget_intro+'</p><p>'+budget_links+'</p><p><a class="text-link" href="'+BASE+CATEGORY_PATHS[lang]['monitor']+'">'+('Comparer les écrans' if lang=='fr' else 'Compare monitors')+' →</a></p></div></div></section>')
  doc=re.sub(r'<section class="section builder" id="builder">.*?</section>',lambda _:builder,doc,flags=re.S)
  doc=doc.replace('<h2>Exemples de composants</h2>','<h2>Notre sélection de composants</h2>').replace('<h2>Component examples</h2>','<h2>Our component selection</h2>');target.write_text(addcart(doc,lang))
 # Preserve the submitted address as an index; exclude noindex cart pages.
 ET.register_namespace('','http://www.sitemaps.org/schemas/sitemap/0.9');namespace='{http://www.sitemaps.org/schemas/sitemap/0.9}'
 groups={
  'pages-sitemap.xml':[u for paths in HUB_PATHS.values() for u in paths.values()]+['blog/','en/blog/']+list(BLOG_PATHS.values())+['configurateur/','en/pc-builder/','boutique/','en/shop/']+[homedir(lang) for lang in ['fr','en']],
  'categories-sitemap.xml':[url for lang in ['fr','en'] for url in CATEGORY_PATHS[lang].values()],
  'products-sitemap.xml':[path(p,lang) for lang in ['fr','en'] for p in PRODUCTS]
 }
 def write_sitemap(filename,tree):
  ET.indent(tree)
  content=ET.tostring(tree,encoding='unicode')
  (ROOT/filename).write_text('<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n'+content+'\n',encoding='utf-8')
 index=ET.Element(namespace+'sitemapindex')
 for filename,entries in groups.items():
  sitemap=ET.Element(namespace+'urlset')
  for url in entries:ET.SubElement(ET.SubElement(sitemap,namespace+'url'),namespace+'loc').text=LIVE+url
  write_sitemap(filename,sitemap)
  ET.SubElement(ET.SubElement(index,namespace+'sitemap'),namespace+'loc').text=LIVE+filename
 write_sitemap('sitemap.xml',index)
 urls=[url for entries in groups.values() for url in entries]

 print(f'Rendered {len(PRODUCTS)} products in 2 languages, {2*len(CATEGORY_PATHS['fr'])} catalogues, 2 carts and {len(urls)} sitemap URLs.')

if __name__=='__main__':main()
