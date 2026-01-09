<?php
// don't print errors to stdout
ini_set('display_errors', 'stderr');

use Dom\HTMLDocument;

$links = array(
  "https://omni.se/ekonomi",
  "https://omni.se/inrikes",
  "https://omni.se/noje-kultur",
  "https://omni.se/opinion",
  "https://omni.se/politik",
  "https://omni.se/sport",
  "https://omni.se/tech",
  "https://omni.se/utrikes",
);

$entries = '';

$entries_xsl = new DOMDocument();
$entries_xsl->load('entries.xsl', LIBXML_NOERROR);

$entries_processor = new XSLTProcessor();
$entries_processor->importStylesheet($entries_xsl);

// Currently generates feed so long as one link is successful which is ok
// since some data is better than no data
foreach ($links as $link) {
  $html = new DOMDocument();
  $html->loadHTMLFile($link, LIBXML_NOERROR);
  $entries = $entries . $entries_processor->transformToXML($html);
  if (empty($entries)) {
    throw new Exception("Failed to retrieve any entries");
  }
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
