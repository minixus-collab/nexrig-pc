<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9" exclude-result-prefixes="s">
<xsl:output method="html" encoding="UTF-8"/>
<xsl:template match="/">
<html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Plan de site XML | NEXRIG</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#fff;color:#293548;font:16px/1.6 Arial,sans-serif}header{background:#416ff2;color:#fff;padding:32px max(20px,calc((100vw - 1160px)/2))}h1{font-size:30px;margin:0 0 16px}header p{margin:0;max-width:1100px}main{max-width:1200px;margin:auto;padding:30px 20px}a{color:#007baf;overflow-wrap:anywhere}header a{color:white}.table-wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;text-align:left}th{background:#416ff2;color:white;padding:16px}td{padding:14px;border-bottom:1px solid #ddd}tbody tr:nth-child(even){background:#f5f6f8}.note{color:#526076;font-size:.9rem}footer{margin-top:24px}a:focus-visible{outline:3px solid #18876c;outline-offset:3px}
</style></head><body><header><h1>Plan de site XML · NEXRIG</h1><p>Ce fichier aide les moteurs de recherche à découvrir les pages du site. Cette présentation facilite sa lecture ; les moteurs utilisent les données XML.</p><p lang="en">XML sitemap: search engines use the underlying XML to discover pages.</p></header><main>
<xsl:choose><xsl:when test="s:sitemapindex">
<p>Cet index contient <strong><xsl:value-of select="count(s:sitemapindex/s:sitemap)"/> plans de site</strong> : pages, catégories et produits.</p>
<div class="table-wrap"><table><thead><tr><th scope="col">Plan de site / Sitemap</th></tr></thead><tbody><xsl:for-each select="s:sitemapindex/s:sitemap"><tr><td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td></tr></xsl:for-each></tbody></table></div>
</xsl:when><xsl:otherwise>
<p>Ce plan de site contient <strong><xsl:value-of select="count(s:urlset/s:url)"/> URL</strong>.</p><p><a href="sitemap.xml">← Index des plans de site / Sitemap index</a></p>
<div class="table-wrap"><table><thead><tr><th scope="col">URL</th></tr></thead><tbody><xsl:for-each select="s:urlset/s:url"><tr><td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td></tr></xsl:for-each></tbody></table></div>
</xsl:otherwise></xsl:choose>
<footer><p class="note">Les versions françaises et anglaises sont incluses. Les pages de panier ne sont pas indexables et restent exclues. Aucune date de modification n’est inventée.</p><a href="/nexrig-pc/">Retour à NEXRIG</a></footer></main></body></html>
</xsl:template></xsl:stylesheet>
