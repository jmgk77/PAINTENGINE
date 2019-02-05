# PAINT ENGINE

**Copyright (c) JMGK All Rights reserved**

PAINT ENGINE - Engine para jogos de pintar



***CONSTRUCTOR***

    new PaintEngine( { arg_obj } ) 



***COLOR (SETTER)***

    PaintEngine.color = {r:,g:,b:a:}



***RUN***

    PaintEngine.run()



***{ arg_obj }***

Requeridos:
- sketch_canvas: main canvas id
- sketch_files: array of sketchs filenames

Opcionais:
- color: color object ({r:,g:,b:,a:})
- palette_file: arquivo com a paleta a ser utilizada (tem que ter o tamanho de palette_canvas)
- palette_canvas: canvas auxiliar para mostrar a paletter
- current_color_canvas: mini-canvas para mostrar a cor selecionada

- css_class_border: nome da classe css para bordas de botões

- prev_btn_id: id do botão para navegar ao desenho anterior de sketch_files[]
- reload_btn_id: id do botão para recarregar o desenho atual de sketch_files[]
- next_btn_id: id do botão para navegar ao proximo desenho de sketch_files[]

- undo_btn_id: id of botão undo
- redo_btn_id: id of botão redo

- paint_btn_id: id of botão pintar
- erase_btn_id: id of botão apagar
- eyedrop_btn_id: id do botão eyedrop

- sticker_btn_id: id do botão sticker
- sticker_file: arquivo com a spritesheet dos stickers (tem que ter o tamanho de sticker_canvas)
- sticker_canvas: canvas auxiliar para mostrar os stickers
- sticker_x: numero x de stickers
- sticker_y: numero y de stickers
- current_sticker_canvas: mini-canvas para mostrar sticker selecionado



***TESTES***

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
test13.html - testa pintar, eyedrop, palete, canvas 'cor atual' e 'css border'
test14.html - testa sticker
test15.html - testa sticker e canvas 'sticker atual'
test16.html - testa canvas, palete, canvas 'cor atual', navegação, undo e redo, apagar , eyedrop, stickers, canvas 'sticker atual' e 'css border'
test17.html - igual que acima, palette_canvas/sticker_canvas e current_color_canvas/current_color_canvas compartilhado



_Proprietary and confidential._

**Unauthorized copying of any files in this project, via any medium is strictly prohibited.**