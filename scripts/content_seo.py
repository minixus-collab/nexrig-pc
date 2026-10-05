"""Editorial keyword mapping. Preserve URLs, layout and demonstration labels."""
import html
import re

COPY = {
 ('components','fr'):('Composants PC Maroc : catégories et compatibilité | NEXRIG','Comparez les composants PC au Maroc : GPU, CPU, RAM, SSD, cartes mères et alimentations. Caractéristiques et prix fictifs de démonstration.','Composants PC au Maroc : préparez votre configuration','Explorez les composants PC par catégorie et comparez les fiches avant de préparer votre configuration. Tous les prix sont des montants de démonstration.'),
 ('components','en'):('PC components in Morocco: categories and compatibility | NEXRIG','Compare PC components in Morocco: GPUs, CPUs, RAM, SSDs, motherboards and power supplies. Specifications and fictional demonstration prices.','PC components in Morocco: plan your configuration','Explore PC components by category and compare product details before planning your build. All prices are demonstration amounts.'),
 ('laptop','fr'):('PC portable gamer Maroc : modèles et caractéristiques | NEXRIG','Comparez les PC portables gamer au Maroc : ASUS, Lenovo, MSI et Acer. Vérifiez les configurations exactes ; prix fictifs de démonstration.','PC portable gamer au Maroc : comparez les modèles','Comparez 12 modèles ASUS, Lenovo, MSI et Acer. Consultez les exemples de configuration et vérifiez chaque référence et les prix de démonstration.'),
 ('laptop','en'):('Gaming laptops in Morocco: models and specifications | NEXRIG','Compare gaming laptops in Morocco from ASUS, Lenovo, MSI and Acer. Verify exact configurations; fictional demonstration prices.','Gaming laptops in Morocco: compare models','Compare 12 ASUS, Lenovo, MSI and Acer models. View example configurations and verify each exact reference and view demonstration prices.'),
 ('gpu','fr'):('Carte graphique Maroc : AMD et NVIDIA | NEXRIG','Comparez les cartes graphiques au Maroc : AMD Radeon, NVIDIA GeForce, VRAM et modèles partenaires. Prix de démonstration, aucune vente réelle.','Carte graphique au Maroc : comparez AMD et NVIDIA','Comparez 23 modèles Radeon et GeForce selon vos jeux, votre écran et la mémoire vidéo. Consultez les fiches et les prix fictifs de démonstration.'),
 ('gpu','en'):('Graphics cards in Morocco: AMD and NVIDIA | NEXRIG','Compare AMD Radeon and NVIDIA GeForce graphics cards in Morocco, VRAM and partner models. Demonstration prices only; no real sales.','Graphics cards in Morocco: compare AMD and NVIDIA','Compare 23 Radeon and GeForce models for your games, monitor and video memory needs. View specifications and fictional demonstration prices.'),
 ('storage','fr'):('SSD prix Maroc : NVMe, SATA et stockage PC | NEXRIG','Comparez les SSD NVMe et SATA au Maroc : capacité, interface et prix fictifs de démonstration. Découvrez aussi les HDD ; aucun prix de marché annoncé.','SSD au Maroc : NVMe, SATA et disques durs','Comparez les SSD par capacité, protocole et interface, ou filtrez les disques durs séparément. Les prix sont fictifs et ne représentent pas le marché marocain.'),
 ('storage','en'):('SSD prices in Morocco: NVMe, SATA and PC storage | NEXRIG','Compare NVMe and SATA SSD capacity, interfaces and fictional demonstration prices in Morocco. HDDs are listed separately; these are not market prices.','SSDs in Morocco: NVMe, SATA and hard drives','Compare SSD capacity, protocol and interface, or filter hard drives separately. Prices are fictional and do not represent the Moroccan market.'),
 ('rtx3060','fr'):('RTX 3060 prix Maroc : 12 Go, prix démo | NEXRIG','RTX 3060 12 Go au Maroc : caractéristiques, compatibilité et prix fictif de démonstration. Ce montant ne représente pas un prix de marché.',None,None),
 ('rtx3060','en'):('RTX 3060 12 GB in Morocco: demo price and specs | NEXRIG','Explore RTX 3060 12 GB specifications, compatibility and a fictional demonstration price in Morocco. This is not a market quotation.',None,None)
}

def optimize(doc,key,lang):
 if (key,lang) not in COPY:return doc
 title,description,h1,intro=COPY[key,lang]
 doc=re.sub(r'<title>.*?</title>','<title>'+html.escape(title)+'</title>',doc,count=1)
 doc=re.sub(r'<meta name="description" content="[^"]*"','<meta name="description" content="'+html.escape(description,quote=True)+'"',doc,count=1)
 if h1:doc=re.sub(r'<h1>.*?</h1>','<h1>'+html.escape(h1)+'</h1>',doc,count=1,flags=re.S)
 if intro:doc=re.sub(r'(<div class="hero">.*?<p class="intro">).*?</p>',lambda m:m[1]+intro+'</p>',doc,count=1,flags=re.S)
 fr=lang=='fr';base='/nexrig-pc/'
 def link(frpath,enpath,frlabel,enlabel):return '<a href="'+base+(frpath if fr else enpath)+'">'+(frlabel if fr else enlabel)+'</a>'
 if key=='components':
  heading='Choisir des composants PC compatibles' if fr else 'Choosing compatible PC components'
  text='Commencez par la plateforme CPU et carte mère, puis vérifiez la génération de RAM. Comparez le GPU selon vos jeux et votre écran. Contrôlez ensuite stockage, dimensions, refroidissement et connecteurs de l’alimentation dans les fiches exactes.' if fr else 'Start with the CPU and motherboard platform, then check RAM generation. Compare the GPU for your games and screen. Verify storage, dimensions, cooling and power connectors against exact specifications.'
  links=link('configurateur/','en/pc-builder/','Organiser mes composants dans le configurateur','Organize parts in the PC builder')+' · '+link('blog/quelle-carte-graphique-choisir/','en/blog/how-to-choose-a-graphics-card/','Choisir une carte graphique','Choose a graphics card')
 elif key=='laptop':
  heading='Comment choisir un PC portable gamer ?' if fr else 'How to choose a gaming laptop'
  text='Comparez la référence complète, le CPU, le GPU mobile, la RAM, le SSD et l’écran. Le nom de famille ne garantit pas une configuration identique : les configurations affichées sont des exemples fournis, sans vérification du SKU exact. Vérifiez le SKU exact auprès du fabricant avant de comparer performances ou prix réels. Un GPU mobile n’est pas automatiquement équivalent à une carte de bureau portant un nom proche.' if fr else 'Compare the complete reference, CPU, mobile GPU, RAM, SSD and screen. A family name does not guarantee identical specifications: displayed configurations are supplied examples, not verified against exact SKUs. Check the exact manufacturer SKU before comparing performance or real prices. A mobile GPU is not automatically equivalent to a similarly named desktop card.'
  links=link('pc-gamer/','en/gaming-pcs/','Comparer aussi les PC gamer fixes','Compare gaming desktops too')
 elif key=='storage':
  heading='SSD : prix au Maroc et critères de comparaison' if fr else 'SSD prices in Morocco: what to compare'
  text='Comparez la capacité, le protocole NVMe ou SATA, le format et les ports disponibles sur votre carte mère. Utilisez le filtre de type pour séparer SSD et HDD. Pour un prix réel au Maroc, vérifiez la référence exacte et les conditions du vendeur : les montants de NEXRIG servent uniquement à tester le panier.' if fr else 'Compare capacity, NVMe or SATA protocol, form factor and available motherboard connections. Use the type filter to separate SSDs from HDDs. For a real price in Morocco, check the exact reference and seller terms: NEXRIG amounts only demonstrate the cart.'
  links=link('cartes-meres/','en/motherboards/','Comparer les plateformes de cartes mères','Compare motherboard platforms')
 elif key=='rtx3060':
  heading='RTX 3060 : prix au Maroc et référence à vérifier' if fr else 'RTX 3060 prices in Morocco: check the exact reference'
  text='Cette fiche concerne la GeForce RTX 3060 12 Go, pas une version 8 Go ni une RTX 3060 Ti. Le montant affiché est fictif. Pour comparer une offre réelle au Maroc, vérifiez le fabricant partenaire, la référence, l’état, les accessoires et les conditions de garantie auprès du vendeur.' if fr else 'This page covers the GeForce RTX 3060 12 GB, not an 8 GB version or the RTX 3060 Ti. The displayed amount is fictional. When comparing a real offer in Morocco, check the partner manufacturer, exact reference, condition, included items and seller warranty terms.'
  links=link('blog/vram-carte-graphique/','en/blog/what-is-vram/','Comprendre la mémoire vidéo','Understand video memory')
 else:
  heading='Choisir une carte graphique pour ses jeux' if fr else 'Choosing a graphics card for your games'
  text='Comparez des tests réalisés à la résolution et aux réglages souhaités. La VRAM seule ne classe pas les performances. Vérifiez la référence partenaire, les dimensions et l’alimentation ; les photos de variantes ne changent pas les spécifications de la puce listée.' if fr else 'Compare benchmarks at your intended resolution and settings. VRAM alone does not rank performance. Check the partner reference, dimensions and power supply; example card photos do not change the listed chip specifications.'
  links=link('blog/quelle-carte-graphique-choisir/','en/blog/how-to-choose-a-graphics-card/','Lire le guide de choix GPU','Read the GPU buying guide')+' · '+link('produits/nvidia-geforce-rtx-3060/','en/products/nvidia-geforce-rtx-3060/','RTX 3060 12 Go : fiche et prix de démonstration','RTX 3060 12 GB: specifications and demo price')
 block='<!-- keyword-guidance:start --><section><h2>'+heading+'</h2><p>'+text+'</p><p>'+links+'</p></section><!-- keyword-guidance:end -->'
 if '<!-- keyword-guidance:start -->' in doc:doc=re.sub(r'<!-- keyword-guidance:start -->.*?<!-- keyword-guidance:end -->',lambda _:block,doc,flags=re.S)
 else:doc=doc.replace('</main>',block+'</main>',1)
 return doc
