//BARULANDIA - Engine para jogos de pintar
//(c) JMGK 2019

//desenho atual
var current_drawing = 'img/sample01.png';
//cor selecionada atual
var current_color = '#ff00ff';

//inicialização
window.onload = function() {
    //carrega desenho
    load_drawing();
    //e coloca um evento para preencher com a cor atual os boundaries nos clicks
    document.getElementById('draw').onclick = fill_shape_under;

    //inicializa area de ferramentas para cor atual
    set_current_color();

    //inicializa area de paleta para gradiente
    var canvas = document.getElementById('palette');
    var ctx = canvas.getContext("2d");
    var imageObj = new Image();
    imageObj.onload = function() {
        ctx.drawImage(imageObj, 0, 0);
    };
    imageObj.src = 'img/palette.png';
    //e coloca um evento para mudar a cor atual nos clicks
    canvas.onclick = get_current_color;
}

//preenche 'tools' com a cor atual
function set_current_color() {
    var canvas = document.getElementById('tools');
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = current_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//pega a cor clicada na paleta
function get_current_color(e) {
    var canvas = document.getElementById('palette');
    var ctx = canvas.getContext("2d");
    var imgData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
    current_color = "#" + ((imgData.data[0] << 16) | (imgData.data[1] << 8) | imgData.data[2]).toString(16);
    set_current_color();
}

//carrega desenho
function load_drawing() {
    var canvas = document.getElementById('draw');
    var ctx = canvas.getContext("2d");
    var imageObj = new Image();
    imageObj.onload = function() {
        ctx.drawImage(imageObj, 0, 0);
    };
    imageObj.src = current_drawing;
}

//preenche a forma clicada
function fill_shape_under(e) {
    var canvas = document.getElementById('draw');
    var ctx = canvas.getContext("2d");
    console.log(e.offsetX + " " + e.offsetY);
}