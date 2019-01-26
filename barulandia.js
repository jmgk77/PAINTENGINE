//BARULANDIA - Engine para jogos de pintar
//(c) JMGK 2019

//desenho atual
var current_drawing = 1;
const MAX_DRAWS = 5;
//cor selecionada atual
var current_color = 'ff00ff';

//inicialização
window.onload = function() {
    //carrega desenho
    load_drawing(0);
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

    //handler para desenho anterior
    document.getElementById("prev").onclick = function() { load_drawing(-1); };

    //handler para proximo desenho
    document.getElementById("next").onclick = function() { load_drawing(1); };

    //handler para limpar desenho
    document.getElementById("clean").onclick = function() { load_drawing(0); }
}

//preenche 'tools' com a cor atual
function set_current_color() {
    var canvas = document.getElementById('tools');
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#" + current_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//pega a cor clicada na paleta
function get_current_color(e) {
    var canvas = document.getElementById('palette');
    var ctx = canvas.getContext("2d");
    var imgData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
    current_color = ((((imgData.data[0] << 16) | (imgData.data[1] << 8) | imgData.data[2])).toString(16)).padStart(6, '0');
    set_current_color();
}

//carrega desenho
function load_drawing(i) {
    var canvas = document.getElementById('draw');
    var ctx = canvas.getContext("2d");
    var imageObj = new Image();
    imageObj.onload = function() {
        ctx.drawImage(imageObj, 0, 0);
    };
    current_drawing += i;
    current_drawing = ((current_drawing < 1) ? MAX_DRAWS : ((current_drawing > MAX_DRAWS) ? 1 : current_drawing));
    imageObj.src = 'img/draw' + current_drawing + '.png';
}

//preenche a forma clicada
function fill_shape_under(e) {
    flood_fill(document.getElementById("draw"), e.offsetX, e.offsetY, color_to_rgba(current_color));
}

//https://ben.akrin.com/?p=7888 (method #4)
//http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
function flood_fill(canvas, x, y, color) {
    var ctx = canvas.getContext("2d");

    pixel_stack = [{ x: x, y: y }];
    pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var linear_cords = (y * canvas.width + x) * 4;
    original_color = {
        r: pixels.data[linear_cords],
        g: pixels.data[linear_cords + 1],
        b: pixels.data[linear_cords + 2],
        a: pixels.data[linear_cords + 3]
    };

    //sai se tentar pintar o que ja tem essa mesma cor (fix para hangs)
    if ((color.r === original_color.r) &&
        (color.g === original_color.g) &&
        (color.b === original_color.b)) { return; }
    //sai se tenta pintar 'preto absoluto'
    if ((0 === original_color.r) &&
        (0 === original_color.g) &&
        (0 === original_color.b)) { return; }

    while (pixel_stack.length > 0) {
        new_pixel = pixel_stack.shift();
        x = new_pixel.x;
        y = new_pixel.y;

        //console.log( x + ", " + y ) ;

        linear_cords = (y * canvas.width + x) * 4;
        while (y-- >= 0 &&
            (pixels.data[linear_cords] == original_color.r &&
                pixels.data[linear_cords + 1] == original_color.g &&
                pixels.data[linear_cords + 2] == original_color.b &&
                pixels.data[linear_cords + 3] == original_color.a)) {
            linear_cords -= canvas.width * 4;
        }
        linear_cords += canvas.width * 4;
        y++;

        var reached_left = false;
        var reached_right = false;
        while (y++ < canvas.height &&
            (pixels.data[linear_cords] == original_color.r &&
                pixels.data[linear_cords + 1] == original_color.g &&
                pixels.data[linear_cords + 2] == original_color.b &&
                pixels.data[linear_cords + 3] == original_color.a)) {
            pixels.data[linear_cords] = color.r;
            pixels.data[linear_cords + 1] = color.g;
            pixels.data[linear_cords + 2] = color.b;
            pixels.data[linear_cords + 3] = color.a;

            if (x > 0) {
                if (pixels.data[linear_cords - 4] == original_color.r &&
                    pixels.data[linear_cords - 4 + 1] == original_color.g &&
                    pixels.data[linear_cords - 4 + 2] == original_color.b &&
                    pixels.data[linear_cords - 4 + 3] == original_color.a) {
                    if (!reached_left) {
                        pixel_stack.push({ x: x - 1, y: y });
                        reached_left = true;
                    }
                } else if (reached_left) {
                    reached_left = false;
                }
            }

            if (x < canvas.width - 1) {
                if (pixels.data[linear_cords + 4] == original_color.r &&
                    pixels.data[linear_cords + 4 + 1] == original_color.g &&
                    pixels.data[linear_cords + 4 + 2] == original_color.b &&
                    pixels.data[linear_cords + 4 + 3] == original_color.a) {
                    if (!reached_right) {
                        pixel_stack.push({ x: x + 1, y: y });
                        reached_right = true;
                    }
                } else if (reached_right) {
                    reached_right = false;
                }
            }

            linear_cords += canvas.width * 4;
        }
    }
    ctx.putImageData(pixels, 0, 0);
}

function is_in_pixel_stack(x, y, pixel_stack) {
    for (var i = 0; i < pixel_stack.length; i++) {
        if (pixel_stack[i].x == x && pixel_stack[i].y == y) {
            return true;
        }
    }
    return false;
}

function color_to_rgba(color) {
    var bigint = parseInt(color, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return {
        r: r,
        g: g,
        b: b,
        a: 255
    };

}