<?php
$links = array(
  "https://omni.se/inrikes",
   "https://omni.se/utrikes",
   "https://omni.se/ekonomi",
   "https://omni.se/politik",
   "https://omni.se/opinion",
   "https://omni.se/sport",
   "https://omni.se/noje-kultur",
   "https://omni.se/tech",
);

$entries = '';

$entries_xsl = new DOMDocument();
$entries_xsl->load('entries.xsl', LIBXML_NOERROR);

$entries_processor = new XSLTProcessor();
$entries_processor->importStylesheet($entries_xsl);

foreach ($links as $link) {
  $html = new DOMDocument();
  $html->loadHTMLFile($link, LIBXML_NOERROR);
  $entries = $entries . $entries_processor->transformToXML($html);
}

// Remove all xml version tags since they are duplicated for each link
$entries = preg_replace('/<\?xml version="1\.0"\?>/', '', $entries);

// Add xml version and enclosing <entries> tag
$entries = '<?xml version="1.0"?>' . "\n" . '<entries>' . $entries . '</entries>';

$combine_xsl = new DOMDocument();
$combine_xsl->load('combine.xsl', LIBXML_NOERROR);

$combine_processor = new XSLTProcessor();
$combine_processor->importStylesheet($combine_xsl);

$xml = new DOMDocument();
$xml->loadXML($entries, LIBXML_NOERROR);

echo $combine_processor->transformToXML($xml);
?>
