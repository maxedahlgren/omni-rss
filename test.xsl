<?xml version="1.0"?>

<xsl:transform
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:date="http://exslt.org/dates-and-times"
  extension-element-prefixes="date"
>

<xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title>Omni inrikes flöde</title>
        <link href="http://omni.se"/>
        <updated><xsl:value-of select="date:date-time()"/></updated>
        <author>
          <name>Omni.se</name>
        </author>
        <id>http://omni.se</id>

        <xsl:for-each select="//div[starts-with(@class, 'TeaserCluster_clusterContainer') and not(contains(@class, 'native')) and not(contains(@class, 'premium'))]">
          <xsl:for-each select=".//article">
            <xsl:variable name="link">https://omni.se<xsl:value-of select=".//a/@href"/></xsl:variable>
            <entry>
              <title><xsl:value-of select="normalize-space(div//h2)"/></title>
              <id><xsl:value-of select="$link"/></id>
              <link href="{$link}"/>
              <updated><xsl:value-of select=".//time/@datetime"/></updated>
              <summary><xsl:value-of select="normalize-space(.//p)"/></summary>
              <!-- TODO: image -->
            </entry>

          </xsl:for-each>
        </xsl:for-each>

      </feed>

  </xsl:template>
</xsl:transform>
