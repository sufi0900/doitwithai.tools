# LAME / lamejs MP3 encoder

LAME MP3 encoder contributors and Alex Zhukov (lamejs JavaScript port).

Project: https://lame.sourceforge.io/
JavaScript source: https://github.com/zhuker/lamejs
Version: 1.2.1, commit 582bbba6a12f981b984d8fb9e1874499fed85675.

lame.min.js is distributed unmodified and loaded separately using importScripts.
Replace it with a compatible encoder build without recompiling the website.
encode-worker.js is the site's bridge; it is not a modification of lamejs.

- [LGPL version 3](LGPL-3.0.txt)
- [GPL version 3 incorporated by LGPL](GPL-3.0.txt)
- [Original upstream notice](UPSTREAM-NOTICE.txt)
- [Full source archive](source-1.2.1.tar.gz), including src/, pom.xml and the
  upstream distributed JS. The project's Maven configuration describes its
  Java-to-JavaScript build; see the source repository and build files.
