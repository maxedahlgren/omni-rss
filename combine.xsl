<?xml version="1.0"?>

<xsl:transform
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:date="http://exslt.org/dates-and-times"
  xmlns:media="http://search.yahoo.com/mrss/"
  extension-element-prefixes="date"
>
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="entries">
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>Omni</title>
      <link href="http://omni.se"/>
      <updated><xsl:value-of select="date:date-time()"/></updated>
      <author>
        <name>Omni.se</name>
      </author>
      <id>http://omni.se</id>

      <xsl:for-each select="//entry">
        <xsl:sort select="updated" order="descending"/>
        <entry>
        <title><xsl:value-of select="title"/></title>
        <id><xsl:value-of select="link"/></id>
        <link href="{link}"/>
        <updated><xsl:value-of select="updated"/></updated>
        <summary><xsl:value-of select="summary"/></summary>
        <xsl:if test="imgSrc">
            <media:thumbnail url="{imgSrc}" width="180" height="180"/>
        </xsl:if>
      </entry>
    </xsl:for-each>

    </feed>
  </xsl:template>
</xsl:transform>
