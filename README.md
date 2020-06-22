# PAINT ENGINE

PAINT ENGINE - A JS engine for painting games



***CONSTRUCTOR***

    new PaintEngine( { arg_obj } ) 

Create a new PaintEngine object. 



***COLOR (SETTER)***

    PaintEngine.color = {r:,g:,b:a:}

Set the current painting color.



***RUN***

    PaintEngine.run()

Run the engine.



***{ arg_obj }***

Required:

    sketch_canvas: main canvas id
    sketch_files: array of sketchs filenames (can be one)

Options:

    color: default color object ({r:, g:, b:, a:})

Palette related:

    palette_file: file with the palette to be used (must be the size of palette_canvas)

    palette_canvas: auxiliary canvas to show the paletter

    current_color_canvas: mini-canvas to show the selected color

Navigate sketchs:

    prev_btn_id: button id to navigate to the previous sketch_files drawing []

    reload_btn_id: button id to reload the current sketch_files drawing []

    next_btn_id: button id to navigate to the next sketch_files drawing []

Undo/redo:

    undo_btn_id: id of undo button

    redo_btn_id: id of redo button

Painting tools:

    paint_btn_id: id of paint button

    erase_btn_id: id of erase button

    eyedrop_btn_id: eyedrop button id

Stickers related:

    sticker_btn_id: sticker button id

    sticker_file: file with the stickers spritesheet (must be the size of sticker_canvas)

    sticker_canvas: auxiliary canvas to show the stickers

    sticker_x: x number of stickers

    sticker_y: y number of stickers

    current_sticker_canvas: mini-canvas to show selected sticker

Color related:

    color_blocklist: array of color object [{r:, g:, b:, a:}] where the tools don't work

    color_transparency: array of color object [{r:, g:, b:, a:}] transparent in stickers

Misc:

    css_class_border: css class name for button borders



***GAMES***

* [Barulandia](https://play.google.com/store/apps/details?id=barulandia.br.com.jmgk)- Paint the drawing of the book [Barulandia](http://barulandia.net/)



***DEMOS***

* [Unhas](https://github.com/jmgk77/UNHAS-APK) - a simple nail painting game



***TESTES***

* [test01](http://paintengine.jmgk.com.br/t/test01.html) - test canvas alone
* [test02](http://paintengine.jmgk.com.br/t/test02.html) - test canvas, construtor defined color
* [test03](http://paintengine.jmgk.com.br/t/test03.html) - test canvas, setter defined color
* [test04](http://paintengine.jmgk.com.br/t/test04.html) - test palette
* [test05](http://paintengine.jmgk.com.br/t/test05.html) - test canvas, 'current color' canvas
* [test06](http://paintengine.jmgk.com.br/t/test06.html) - test canvas, palette and 'current color' canvas
* [test07](http://paintengine.jmgk.com.br/t/test07.html) - test sketch navigation
* [test08](http://paintengine.jmgk.com.br/t/test08.html) - test canvas, palette, 'current color' canvas and sketch navigation
* [test09](http://paintengine.jmgk.com.br/t/test09.html) - test undo and redo
* [test10](http://paintengine.jmgk.com.br/t/test10.html) - test paint and erase
* [test11](http://paintengine.jmgk.com.br/t/test11.html) - test paint, erase and 'current color' canvas
* [test12](http://paintengine.jmgk.com.br/t/test12.html) - test paint, erase and 'css border'
* [test13](http://paintengine.jmgk.com.br/t/test13.html) - test paint, eyedrop, palette, 'current color' canvas and 'css border'
* [test14](http://paintengine.jmgk.com.br/t/test14.html) - test sticker
* [test15](http://paintengine.jmgk.com.br/t/test15.html) - test sticker and 'current sticker' canvas
* [test16](http://paintengine.jmgk.com.br/t/test16.html) - test canvas, palette, 'current color' canvas, navigation, undo and redo, erase, eyedrop, stickers, 'current sticker' canvas and 'css border'
* [test17](http://paintengine.jmgk.com.br/t/test17.html) - as above, palette/sticker canvas and 'current color' canvas/'current sticker' canvas shared
* [test18](http://paintengine.jmgk.com.br/t/test18.html) - as above, using color_blocklist
* [test19](http://paintengine.jmgk.com.br/t/test19.html) - test sticker and color_transparency

