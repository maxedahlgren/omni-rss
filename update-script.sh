#!/bin/sh

php generate-feed.php > atom.xml && \
scp atom.xml maxeda@maxedah.com:/public_html/rss/omni.xml
