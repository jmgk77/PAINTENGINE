//BARULANDIA - Engine para jogos de pintar
//(c) JMGK 2019

//inicialização
window.onload = function() {
    /*function PaintEngine(draw_canvas, cur_color_canvas, palette_canvas,
        palette_file, drawing_files,
        prev_btn_id, next_btn_id,
        clear_btn_id, back_btn_id,
        paint_btn_id, erase_btn_id, eyedrop_btn_id)*/
    var paint_engine = new PaintEngine('draw',
        'color',
        'palette',
        'img/palette.png',
        ['img/draw1.png', 'img/draw2.png', 'img/draw3.png', 'img/draw4.png', 'img/draw5.png'],
        'prev',
        'next',
        'clean',
        'back',
        'paint',
        'erase',
        'eyedrop');
    paint_engine.run();
}