<?php
$html = new DOMDocument();
$html->loadHTMLFile('https://omni.se/inrikes', LIBXML_NOERROR);

$xsl = new DOMDocument();
$xsl->load('test.xsl', LIBXML_NOERROR);

$processor = new XSLTProcessor();
$processor->importStylesheet($xsl);

echo $processor->transformToXML($html);
?>
