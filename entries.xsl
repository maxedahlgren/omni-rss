<?xml version="1.0"?>

<xsl:transform
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:h="http://www.w3.org/1999/xhtml"
  xmlns:date="http://exslt.org/dates-and-times"
  extension-element-prefixes="date"
>
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
      <xsl:for-each select="//div[starts-with(@class, 'TeaserCluster_clusterContainer') and not(contains(@class, 'native')) and not(contains(@class, 'premium'))]">
        <xsl:for-each select=".//article">
          <xsl:variable name="datetime"><xsl:value-of select=".//time/@datetime"/></xsl:variable>
          <xsl:variable name="imgSrc"><xsl:value-of select=".//img/@src"/></xsl:variable>

          <!-- Only sponsored and premium articles lack a datetime value -->
          <xsl:if test="string($datetime)">
            <entry>
            <title><xsl:value-of select="normalize-space(div//h2)"/></title>
            <link>https://omni.se<xsl:value-of select=".//a/@href"/></link>
            <updated><xsl:value-of select="$datetime"/></updated>
            <summary><xsl:value-of select="normalize-space(.//p)"/></summary>
            <xsl:if test="string($imgSrc)">
              <imgSrc><xsl:value-of select="substring-before($imgSrc, '?')"/>?h=180&amp;w=180</imgSrc>
            </xsl:if>
          </entry>
        </xsl:if>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>
</xsl:transform>
