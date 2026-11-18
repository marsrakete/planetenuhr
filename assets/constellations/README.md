# Stellarium Modern constellation illustrations

Original artwork: Stellarium's team, Modern sky culture.

Source: https://github.com/Stellarium/stellarium/tree/daace2add6a1bf886e8ee1934f51e9c69f818d18/skycultures/modern/illustrations

The 47 originals are preserved in `original/`. The upstream attribution and licence declaration are preserved in `STELLARIUM-SOURCE.md`.

The illustrations and adapted PNGs are distributed under the **Free Art License 1.3**, with its text in `LICENSE-Free-Art-1.3.html`: https://artlibre.org/licence/lal/en/ . This artwork licence is separate from the application code and CC BY-SA star/line data.

Changes by Planetenuhr (2026): projective reprojection using the three original pixel/HIP anchors and HYG v4.1 J2000 coordinates; conversion of the black background to transparency; resampling to 640×640 PNGs. Pixels at most 8/255 intensity are omitted. Artwork and stars are fitted together. Colours are unpremultiplied before writing alpha. Display opacity is reduced further.

Transformation matrices, anchor residuals and original file hashes are in `projection-manifest.json` and `../../docs/stellarium-illustrationen-pruefung.json`. HYG coordinates are credited there and in About help.

Regenerate: `node scripts/build-constellation-illustrations.cjs <original-audit-cache>`. Set `PLANETENUHR_SHARP` to the Sharp module path if needed. The generator verifies source hashes and all three anchors for each image. It does not fetch network resources. Schlangenkopf and Schlangenschwanz intentionally have no artwork.
