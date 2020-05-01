# Prerequisite: 'pip install fonttools brotli'

FONTS_DIR=$(dirname "$0")/../public/static/fonts

# Subset Inter
# --unicodes: ASCII, nbsp, nice quotes, arrows, double arrows, some math symbols
# --text: some extra unicode characters (listed)

pyftsubset $FONTS_DIR/Inter-roman.var.woff2 \
  --unicodes="U+0020-007E,U+00A0,U+2018-201D,U+2190-2195,U+21D0-21D5,U+2260-2265" \
  --text="©°•⌘✓✗" \
  --layout-features="kern","ccmp","calt","tnum","case","ss03" \
  --flavor="woff2" \
  --output-file=$FONTS_DIR/Inter-Variable-Subset.woff2


# Subset Manrope
# --unicodes: ASCII, nbsp, nice quotes, some math symbols
# --text: some extra unicode characters (listed)

pyftsubset $FONTS_DIR/Manrope-Variable.woff2 \
  --unicodes="U+0020-007E,U+00A0,U+2018-201D,U+2260-2265" \
  --text="©°•" \
  --layout-features="kern","liga","ccmp","calt","tnum","case" \
  --flavor="woff2" \
  --output-file=$FONTS_DIR/Manrope-Variable-Subset.woff2
