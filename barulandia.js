//BARULANDIA - Engine para jogos de pintar
//(c) JMGK 2019

//inicialização
window.onload = function() {
    //function PaintEngine(draw_canvas, toolbar_canvas, palette_canvas, palette_name, drawing_names_array, prev_drawing_id, next_drawing_id, clean_drawing_id)
    var paint_engine = new PaintEngine('draw',
        'tools',
        'palette',
        'img/palette.png',
        ['img/draw1.png', 'img/draw2.png', 'img/draw3.png', 'img/draw4.png', 'img/draw5.png'],
        'prev',
        'next',
        'clean');
    paint_engine.init();
}