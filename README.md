# PAINT ENGINE

**Copyright (c) JMGK All Rights reserved**

_Proprietary and confidential._

PAINT ENGINE - Engine para jogos de pintar

*** CONSTRUCTOR

    new PaintEngine( { arg_obj } ) 

*** COLOR (SETTER)

    PaintEngine.color = {r:,g:,b:a:}

*** { arg_obj }

Requeridos:
- sketch_canvas: main canvas id
- sketch_files: array of sketchs filenames

Opcionais:
- color: color object ({r:,g:,b:,a:})
- aux_canvas: canvas auxiliar para mostrar certas ferramentas
- palette_file: arquivo com a paleta a ser utilizada
- current_color_canvas: mini-canvas para mostrar a cor selecionada

*** Tests

test01.html - testa canvas sozinha
test02.html - testa canvas sozinha, definindo a cor no construtor
test03.html - testa canvas sozinha, definindo a cor no setter
test04.html - testa canvas e palete
test05.html - testa canvas e 'cor atual'
test06.html - testa canvas, palete e 'cor atual'


**Unauthorized copying of any files in this project, via any medium is strictly prohibited.**