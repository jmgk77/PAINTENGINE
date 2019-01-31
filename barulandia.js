//BARULANDIA - Engine para jogos de pintar
//(c) JMGK 2019

//inicialização
window.onload = function() {
    /*    constructor(draw_canvas, aux_canvas,
            sketch_files,
            prev_btn_id, reload_btn_id, next_btn_id,
            back_btn_id, redo_bnt_id,
            paint_btn_id, cur_color_canvas, palette_file,
            erase_btn_id,
            eyedrop_btn_id)
            sticker_btn_id, cur_sticker_canvas, sticker_file, sticker_x, sticker_y) */

    var paint_engine = new PaintEngine('draw', 'palette',
        ['img/draw1.png', 'img/draw2.png', 'img/draw3.png', 'img/draw4.png', 'img/draw5.png'],
        'prev', 'clean', 'next',
        'back', 'redo',
        'paint', 'color', 'img/palette.png',
        'erase',
        'eyedrop',
        'sticker', 'color', 'img/stickers.png', 10, 3);
    paint_engine.run();
}