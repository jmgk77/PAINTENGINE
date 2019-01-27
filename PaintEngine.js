'use strict';

//PAINT_ENGINE - Engine para jogos de pintar
//(c) JMGK 2019

function PaintEngine(draw_canvas, cur_color_canvas, palette_canvas,
    palette_file, drawing_files,
    prev_btn_id, next_btn_id,
    clear_btn_id, back_btn_id,
    paint_btn_id, erase_btn_id) {

    //salva canvas
    this.draw_cvs = draw_canvas;
    this.color_cvs = cur_color_canvas;
    this.palette_cvs = palette_canvas;

    //salva nome do imagem de paleta
    this.palette_fname = palette_file;

    //salva array de desenhos
    this.drawing_fnames_a = drawing_files;
    this.max_drawings = this.drawing_fnames_a.length - 1;
    this.cur_drawing = 0;

    //salva ids das ferramentas
    this.prev_id = prev_btn_id;
    this.next_id = next_btn_id;
    this.clear_id = clear_btn_id;
    this.back_id = back_btn_id;
    this.paint_id = paint_btn_id;
    this.erase_id = erase_btn_id;

    //cor selecionada atual
    this.cur_color = '8000ff';

    this.history_a = [];

    //inicializa tudo
    this.init = function() {
        //inicializa desenho
        this.load_drawing(0);

        //inicializa area de ferramentas para cor atual
        this.set_cur_color();

        //inicializa paleta
        var ctx = document.getElementById(this.palette_cvs).getContext("2d");
        var img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        };
        img.src = this.palette_fname;

        //handler para mudar a cor atual nos clicks
        document.getElementById(this.palette_cvs).onclick = function(e) { this.get_cur_color(e); }.bind(this);
        //handler para preencher com a cor atual os boundaries nos clicks
        document.getElementById(this.draw_cvs).onclick = function(e) { this.bucket_tool(e); }.bind(this);
        //handler para desenho anterior
        document.getElementById(this.prev_id).onclick = function() { this.load_drawing(-1); }.bind(this);
        //handler para proximo desenho
        document.getElementById(this.next_id).onclick = function() { this.load_drawing(1); }.bind(this);
        //handler para limpar desenho
        document.getElementById(this.clear_id).onclick = function() { this.load_drawing(0); }.bind(this);
        //handler para voltar o ultimo movimento
        document.getElementById(this.back_id).onclick = function() { this.back_history(); }.bind(this);
        //handler para ferramenta 'pintar' (unica disponivel, não faz nada)
        document.getElementById(this.paint_id).onclick = function() { this.paint(); }.bind(this);
        //handler para ferramenta 'apagar' (pintar com branco, so seta cor)
        document.getElementById(this.erase_id).onclick = function() { this.erase(); }.bind(this);

        //ferramenta default
        this.paint();
    };

    //volta um passo na history
    this.back_history = function() {
        if (this.history_a.length) {
            var ctx = document.getElementById(this.draw_cvs).getContext("2d");
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
            img.src = this.history_a.pop();
        }
    }

    //salva desenho atual no history
    this.save_history = function() {
        this.history_a.push(document.getElementById(this.draw_cvs).toDataURL("image/png"));
    }

    //esconde borda css
    this.hide_border = function(id) {
        document.getElementById(id).classList.remove("tool_selected");
    }

    //mostra borda css
    this.show_border = function(id) {
        document.getElementById(id).classList.add("tool_selected");
    }

    //erase tool (pinta com branco)
    this.erase = function() {
        this.hide_border(this.paint_id);
        this.show_border(this.erase_id);
        //apagar é pintar com branco
        this.cur_color = 'ffffff';
        this.set_cur_color();
    }

    //paint tool (faz nada)
    this.paint = function() {
        this.hide_border(this.erase_id);
        this.show_border(this.paint_id);
        //unica tool
    }

    //preenche 'tools' com a cor atual
    this.set_cur_color = function() {
        var canvas = document.getElementById(this.color_cvs);
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#" + this.cur_color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    //pega a cor clicada na paleta
    this.get_cur_color = function(e) {
        //para por a borda na unica ferramenta
        this.paint();
        //pega cor clicada pelo mouse
        var ctx = document.getElementById(this.palette_cvs).getContext("2d");
        var imgData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
        this.cur_color = ((((imgData.data[0] << 16) | (imgData.data[1] << 8) | imgData.data[2])).toString(16)).padStart(6, '0');
        this.set_cur_color();
    };

    //carrega desenho
    this.load_drawing = function(mod) {
        var ctx = document.getElementById(this.draw_cvs).getContext("2d");
        var imageObj = new Image();
        imageObj.onload = function() {
            ctx.drawImage(imageObj, 0, 0);
        };
        this.cur_drawing += mod;
        this.cur_drawing = ((this.cur_drawing < 0) ? this.max_drawings : ((this.cur_drawing > this.max_drawings) ? 0 : this.cur_drawing));
        imageObj.src = this.drawing_fnames_a[this.cur_drawing];

        //esvazia history quando muda de desenho
        this.history_a.length = 0;
    };

    //preenche a forma clicada
    this.bucket_tool = function(e) {
        //salva desenho atual no history
        this.save_history();
        //pinta
        this.flood_fill(document.getElementById(this.draw_cvs), e.offsetX, e.offsetY, colour_to_rgba(this.cur_color));
    };

    //https://ben.akrin.com/?p=7888 (method #4)
    //http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
    this.flood_fill = function(canvas, x, y, colour) {
        var ctx = canvas.getContext("2d");

        var pixel_stack = [{ x: x, y: y }];
        var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var linear_cords = (y * canvas.width + x) * 4;
        var original_colour = {
            r: pixels.data[linear_cords],
            g: pixels.data[linear_cords + 1],
            b: pixels.data[linear_cords + 2],
            a: pixels.data[linear_cords + 3]
        };

        //sai se tentar pintar o que ja tem essa mesma cor (fix para hangs)
        if ((colour.r === original_colour.r) &&
            (colour.g === original_colour.g) &&
            (colour.b === original_colour.b)) { return; }
        //sai se tenta pintar 'preto absoluto'
        if ((0 === original_colour.r) &&
            (0 === original_colour.g) &&
            (0 === original_colour.b)) { return; }

        while (pixel_stack.length > 0) {
            var new_pixel = pixel_stack.shift();
            x = new_pixel.x;
            y = new_pixel.y;

            //console.log( x + ", " + y ) ;

            linear_cords = (y * canvas.width + x) * 4;
            while (y-- >= 0 &&
                (pixels.data[linear_cords] == original_colour.r &&
                    pixels.data[linear_cords + 1] == original_colour.g &&
                    pixels.data[linear_cords + 2] == original_colour.b &&
                    pixels.data[linear_cords + 3] == original_colour.a)) {
                linear_cords -= canvas.width * 4;
            }
            linear_cords += canvas.width * 4;
            y++;

            var reached_left = false;
            var reached_right = false;
            while (y++ < canvas.height &&
                (pixels.data[linear_cords] == original_colour.r &&
                    pixels.data[linear_cords + 1] == original_colour.g &&
                    pixels.data[linear_cords + 2] == original_colour.b &&
                    pixels.data[linear_cords + 3] == original_colour.a)) {
                pixels.data[linear_cords] = colour.r;
                pixels.data[linear_cords + 1] = colour.g;
                pixels.data[linear_cords + 2] = colour.b;
                pixels.data[linear_cords + 3] = colour.a;

                if (x > 0) {
                    if (pixels.data[linear_cords - 4] == original_colour.r &&
                        pixels.data[linear_cords - 4 + 1] == original_colour.g &&
                        pixels.data[linear_cords - 4 + 2] == original_colour.b &&
                        pixels.data[linear_cords - 4 + 3] == original_colour.a) {
                        if (!reached_left) {
                            pixel_stack.push({ x: x - 1, y: y });
                            reached_left = true;
                        }
                    } else if (reached_left) {
                        reached_left = false;
                    }
                }

                if (x < canvas.width - 1) {
                    if (pixels.data[linear_cords + 4] == original_colour.r &&
                        pixels.data[linear_cords + 4 + 1] == original_colour.g &&
                        pixels.data[linear_cords + 4 + 2] == original_colour.b &&
                        pixels.data[linear_cords + 4 + 3] == original_colour.a) {
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

    function colour_to_rgba(colour) {
        var bigint = parseInt(colour, 16);
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