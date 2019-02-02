# PAINT ENGINE

**Copyright (c) JMGK All Rights reserved**

_Proprietary and confidential._

PAINT ENGINE - Engine para jogos de pintar

*** CONSTRUCTOR

    new PaintEngine( { arg_obj } ) 

*** COLOR (SETTER)

    PaintEngine.color = {r:,g:,b:a:}

*** RUN

    PaintEngine.run()

*** { arg_obj }

Requeridos:
- sketch_canvas: main canvas id
- sketch_files: array of sketchs filenames

Opcionais:
- color: color object ({r:,g:,b:,a:})
- aux_canvas: canvas auxiliar para mostrar certas ferramentas
- palette_file: arquivo com a paleta a ser utilizada
- current_color_canvas: mini-canvas para mostrar a cor selecionada
- prev_btn_id: id do botão para navegar ao desenho anterior de sketch_files[]
- reload_btn_id: id do botão para recarregar o desenho atual de sketch_files[]
- next_btn_id: id do botão para navegar ao proximo desenho de sketch_files[]
- undo_btn_id: id of botão undo
- redo_btn_id: id of botão redo
- paint_btn_id: id of botão pintar
- erase_btn_id: id of botão apagar
- css_class_border: nome da classe css para bordas de botões

*** Tests

test01.html - testa canvas sozinha
test02.html - testa canvas, definindo a cor no construtor
test03.html - testa canvas, definindo a cor no setter
test04.html - testa palete
test05.html - testa canvas 'cor atual'
test06.html - testa canvas, palete e canvas 'cor atual'
test07.html - testa navegação
test08.html - testa canvas, palete, canvas 'cor atual' e navegação
test09.html - testa undo e redo
test10.html - testa pintar e apagar
test11.html - testa pintar, apagar e canvas 'cor atual'
test12.html - testa pintar, apagar e 'css border'


**Unauthorized copying of any files in this project, via any medium is strictly prohibited.**