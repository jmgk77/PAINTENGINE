#!/bin/sh

#converte imagens para 800 x 600, 1-bit grayscale, non-interlaced

convert draw1.png -resize 800x600\! -colorspace gray +dither -colors 2 -type bilevel draw1.png
convert draw2.png -resize 800x600\! -colorspace gray +dither -colors 2 -type bilevel draw2.png
convert draw3.png -resize 800x600\! -colorspace gray +dither -colors 2 -type bilevel draw3.png
convert draw4.png -resize 800x600\! -colorspace gray +dither -colors 2 -type bilevel draw4.png
convert draw5.png -resize 800x600\! -colorspace gray +dither -colors 2 -type bilevel draw5.png
