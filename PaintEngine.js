//PAINTENGINE - Engine para jogos de pintar
//(c) JMGK 2019

function PaintEngine(draw_canvas, toolbar_canvas, palette_canvas, palette_name, drawing_names_array, prev_drawing_id, next_drawing_id, clean_drawing_id) {
    //salva canvas
    this.draw = draw_canvas;
    this.toolbar = toolbar_canvas;
    this.palette = palette_canvas;

    //salva nome do imagem de paleta
    this.palette_name = palette_name;

    //salva array de desenhos
    this.drawings = drawing_names_array;
    this.no_drawings = this.drawings.length - 1;
    this.current_drawing = 0;

    //salva 
    this.previous_draw = prev_drawing_id;
    this.next_draw = next_drawing_id;
    this.clear_draw = clean_drawing_id;

    //cor selecionada atual
    this.current_color = 'ffffff';

    this.init = function() {
        //inicializa desenho
        this.load_drawing(0);

        //inicializa area de ferramentas para cor atual
        this.set_current_color();

        //inicializa paleta
        var ctx = document.getElementById(this.palette).getContext("2d");
        var img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        };
        img.src = this.palette_name;

        //handler para mudar a cor atual nos clicks
        document.getElementById(this.palette).onclick = function(e) { this.get_current_color(e); }.bind(this);

        //handler para preencher com a cor atual os boundaries nos clicks
        document.getElementById(this.draw).onclick = function(e) { this.fill_shape_under(e); }.bind(this);

        //handler para desenho anterior
        document.getElementById(this.previous_draw).onclick = function() { this.load_drawing(-1); }.bind(this);

        //handler para proximo desenho
        document.getElementById(this.next_draw).onclick = function() { this.load_drawing(1); }.bind(this);

        //handler para limpar desenho
        document.getElementById(this.clear_draw).onclick = function() { this.load_drawing(0); }.bind(this);
    };


    //preenche 'tools' com a cor atual
    this.set_current_color = function() {
        var canvas = document.getElementById(this.toolbar);
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#" + this.current_color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    //pega a cor clicada na paleta
    this.get_current_color = function(e) {
        var ctx = document.getElementById(this.palette).getContext("2d");
        var imgData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
        this.current_color = ((((imgData.data[0] << 16) | (imgData.data[1] << 8) | imgData.data[2])).toString(16)).padStart(6, '0');
        this.set_current_color();
    };

    //carrega desenho
    this.load_drawing = function(mod) {
        var ctx = document.getElementById(this.draw).getContext("2d");
        var imageObj = new Image();
        imageObj.onload = function() {
            ctx.drawImage(imageObj, 0, 0);
        };
        this.current_drawing += mod;
        this.current_drawing = ((this.current_drawing < 0) ? this.no_drawings : ((this.current_drawing > this.no_drawings) ? 0 : this.current_drawing));
        imageObj.src = this.drawings[this.current_drawing];
    };

    //preenche a forma clicada
    this.fill_shape_under = function(e) {
        this.flood_fill(document.getElementById(this.draw), e.offsetX, e.offsetY, color_to_rgba(this.current_color));
    };

    //https://ben.akrin.com/?p=7888 (method #4)
    //http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
    this.flood_fill = function(canvas, x, y, color) {
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
    };

    function is_in_pixel_stack(x, y, pixel_stack) {
        for (var i = 0; i < pixel_stack.length; i++) {
            if (pixel_stack[i].x == x && pixel_stack[i].y == y) {
                return true;
            }
        }
        return false;
    };

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

    };
}