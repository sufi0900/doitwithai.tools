# eSpeak NG JavaScript speech engine

Copyright eSpeak NG contributors, Eitan Isaacson and Alberto Pettarin.
Distributed under GNU GPL version 3; see [LICENSE](LICENSE).

The unmodified worker and data are from
https://github.com/pettarin/espeakng.js-cdn at commit
c023eaca5609b4523613f674d0ee67bd761502f1 (release 1.49.1).

- espeakng.worker.js Git blob: 3996ba9e59054ae0de6bf1604058991a94cddbe4
- espeakng.worker.data Git blob: 6ccd2f8055e559549165e5fccd6439eb0471177c

[Download source and build scripts for eSpeak NG 1.49.1](source-1.49.1.tar.gz).
Source: https://github.com/espeak-ng/espeak-ng at tag 1.49.1, commit
999ac6743337e484bf0a1631b0885d3a8bb9114d. The archive includes language data,
emscripten glue, pre/post worker sources, and emscripten/Makefile and README.md.
The upstream CDN does not record its exact Emscripten SDK version; no claim of a
byte-identical rebuild is made. The published worker/data are unchanged.

Build overview from the included emscripten/README.md:
1. Install and activate the compatible Emscripten SDK and native build dependencies.
2. Run ./autogen.sh and configure without async, mbrola or sonic, then make.
3. Use emconfigure with the same configuration and emmake make src/libespeak-ng.la.
4. Run emmake in emscripten/ to generate the worker and preload package.

The worker is loaded as a separate same-origin Web Worker. Its asset files can
be replaced with a compatible build without recompiling the website.

Project: https://github.com/espeak-ng/espeak-ng
JavaScript distribution: https://github.com/pettarin/espeakng.js-cdn
