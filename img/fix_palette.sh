#!/bin/sh

#muda, na paleta, para 'visualmente preto' (5,5,5) a cor 'preto absoluto' (0,0,0) - reservada para a borda dos desenhos de pintar

cp palette.png palette.png.bak
convert palette.png.bak -fill "rgb(5,5,5)" -opaque "rgb(0,0,0)" palette.png
rm palette.png.bak
