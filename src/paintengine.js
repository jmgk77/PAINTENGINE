//PAINT_ENGINE - Engine para jogos de pintar
//(c) JMGK 2019

'use strict';

/*
sketch_canvas, sketch_files, color, palette_canvas, palette_file, current_color_canvas,
prev_btn_id, reload_btn_id, next_btn_id,undo_btn_id, redo_btn_id, paint_btn_id, erase_btn_id,
css_class_border, eyedrop_btn_id, sticker_btn_id, sticker_file, sticker_x, sticker_y, 
current_sticker_canvas, color_blacklist, color_transparency
*/

class PaintEngine {

    //init
    constructor(arg_obj) {
        //copy user params
        this.user = arg_obj;

        //checa parametros essenciais
        if (!this.user.sketch_canvas)
            throw "PaintEngine::constructor(): <sketch_canvas> must be defined";
        if (!this.user.sketch_files)
            throw "PaintEngine::constructor(): <sketch_files> must be defined";
        if (!this.user.sketch_files.length)
            throw "PaintEngine::constructor(): <sketch_files> must be have at least 1 element";

        //salva tamanho do array de desenhos e qual é o atual
        this.max_sketchs = this.user.sketch_files.length - 1;
        this.cur_sketch = 0;

        //se user não definiu uma cor, usa cor default
        if (!this.user.color) {
            this.user.color = { r: 0x80, g: 0x00, b: 0x80, a: 0xff };
        }

        //se user não definiu as cores proibidas, permitidas, e de transparencia, usa defaults
        //cores sob as quais as ferramentas NÃO FUNCIONAM
        if (!this.user.color_blacklist) {
            //'preto absoluto' é reservado para linhas
            this.user.color_blacklist = [{ r: 0x00, g: 0x00, b: 0x00, a: 0xff }];
        }
        //cores sob as quais é aplicada transparencia
        if (!this.user.color_transparency) {
            //'branco absoluto' é o fundo dos stickers
            this.user.color_transparency = [{ r: 0xff, g: 0xff, b: 0xff, a: 0xff }];
        }

        //escala sticker escolhido em relação ao mini-canvas
        if ((this.user.sticker_canvas) && (this.user.current_sticker_canvas)) {
            var c = document.getElementById(this.user.current_sticker_canvas);
            var c2 = document.getElementById(this.user.sticker_canvas);
            this.sticker_scale_x = c.width / (c2.width / this.user.sticker_x);
            this.sticker_scale_y = c.height / (c2.height / this.user.sticker_y);
        }

        //array do history dos desenhos
        this.history_a = [];
        this.history_ptr = 0;

        //ptr para ferramenta selecionada atualmente
        this.tool = null;
    }

    //setter para cor atual
    set color(c) {
        this.user.color = c;
    }

    //roda a bagaça
    run() {
        //handler para usar a ferramenta atual no desenho
        document.getElementById(this.user.sketch_canvas).onclick = function(e) {
            this.tool(e);
        }.bind(this);

        //handler para ir para esenho anterior
        if (this.user.prev_btn_id) {
            document.getElementById(this.user.prev_btn_id).onclick = function() {
                this.load_sketch(-1);
            }.bind(this);
        }
        //handler para ir para proximo desenho
        if (this.user.next_btn_id) {
            document.getElementById(this.user.next_btn_id).onclick = function() {
                this.load_sketch(1);
            }.bind(this);
        }
        //handler para limpar desenho
        if (this.user.reload_btn_id) {
            document.getElementById(this.user.reload_btn_id).onclick = function() {
                this.load_sketch(0);
            }.bind(this);
        }
        //handler para voltar o ultimo comando
        if (this.user.undo_btn_id) {
            document.getElementById(this.user.undo_btn_id).onclick = function() {
                this.back_history();
            }.bind(this);
        }
        //handler para refazer o ultimo comando
        if (this.user.redo_btn_id) {
            document.getElementById(this.user.redo_btn_id).onclick = function() {
                this.redo_history();
            }.bind(this);
        }
        //handler para ferramenta 'pintar' (preencher)
        if (this.user.paint_btn_id) {
            document.getElementById(this.user.paint_btn_id).onclick = function() {
                this.paint();
            }.bind(this);
        }
        //handler para ferramenta 'apagar' (pintar com branco)
        if (this.user.erase_btn_id) {
            document.getElementById(this.user.erase_btn_id).onclick = function() {
                this.erase();
            }.bind(this);
        }
        //handler para ferramenta 'eyedrop' (pegar cor)
        if (this.user.eyedrop_btn_id) {
            document.getElementById(this.user.eyedrop_btn_id).onclick = function() {
                this.eyedrop();
            }.bind(this);
        }
        //handler para ferramenta 'sticker' (adiciona figurinhas duma spritesheet)
        if (this.user.sticker_btn_id) {
            document.getElementById(this.user.sticker_btn_id).onclick = function() {
                this.sticker();
            }.bind(this);
        }

        //carrega desenho
        this.load_sketch(0);

        //simula escolha da ferramenta default
        this.paint_color = this.user.color;
        this.paint();
    }

    //carrega desenho
    load_sketch(mod) {
        var ctx = document.getElementById(this.user.sketch_canvas).getContext("2d");
        var imageObj = new Image();
        imageObj.onload = function() {
            ctx.drawImage(imageObj, 0, 0);
        };
        this.cur_sketch += mod;
        this.cur_sketch = ((this.cur_sketch < 0) ? this.max_sketchs : ((this.cur_sketch > this.max_sketchs) ? 0 : this.cur_sketch));
        imageObj.src = this.user.sketch_files[this.cur_sketch];

        //esvazia history quando muda de desenho
        this.history_a.length = 0;
    }

    //volta um passo na history
    back_history() {
        //temos uma history e não estamos no começo dela
        if ((this.history_a.length) && (this.history_ptr > 0)) {
            //salva tela atual no history, para poder voltar pra ela, se estivermos nos final da lista
            if (this.history_a.length == this.history_ptr) {
                this.history_a[this.history_ptr] = (document.getElementById(this.user.sketch_canvas).toDataURL("image/png"));
            }
            //ajusta ponteiro para entrada anterior do history
            this.history_ptr--;
            //copia history na canvas
            this._canvas_history_update();
        }
    }

    //refazer um passo na history
    redo_history() {
        //temos uma history e não estamos no começo dela
        if ((this.history_a.length) && (this.history_ptr < this.history_a.length)) {
            //ajusta ponteiro para proxima entrada do history
            this.history_ptr++;
            //copia history na canvas
            this._canvas_history_update();
        }
    }

    //copia history na canvas
    _canvas_history_update() {
        var ctx = document.getElementById(this.user.sketch_canvas).getContext("2d");
        var img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        };
        img.src = this.history_a[this.history_ptr];
    }

    //salva desenho atual no history
    _save_history() {
        //adiciona modificações 
        this.history_a[this.history_ptr] = (document.getElementById(this.user.sketch_canvas).toDataURL("image/png"));
        //ajusta ponteiro para proxima entrada do history e passo atual vira o ultimo
        this.history_a.length = ++this.history_ptr;
    }

    //preenche mostruario com a cor atual
    _show_current_color() {
        if (this.user.current_color_canvas) {
            var canvas = document.getElementById(this.user.current_color_canvas);
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = 'rgba(' + this.user.color.r + ',' + this.user.color.g + ',' + this.user.color.b + ',' + this.user.color.a + ')';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    //mostra borda css (escondendo a dos outros)
    _show_border(id) {
        if (this.user.css_class_border) {
            //esconde dos outros
            if (this.user.erase_btn_id)
                document.getElementById(this.user.erase_btn_id).classList.remove(this.user.css_class_border);
            if (this.user.paint_btn_id)
                document.getElementById(this.user.paint_btn_id).classList.remove(this.user.css_class_border);
            if (this.user.eyedrop_btn_id)
                document.getElementById(this.user.eyedrop_btn_id).classList.remove(this.user.css_class_border);
            if (this.user.sticker_btn_id)
                document.getElementById(this.user.sticker_btn_id).classList.remove(this.user.css_class_border);
            //mostra nossa
            if (id) document.getElementById(id).classList.add(this.user.css_class_border);
        }
    }

    //erase tool (pinta com branco)
    erase() {
        //tira bordinha dos outros e bota na gente
        this._show_border(this.user.erase_btn_id);
        //seta ferramenta atual para bucket_tool
        this.tool = this.bucket_tool;

        //apagar é pintar com branco (nao mexe na .paint_color)
        this.user.color = {
            r: 255,
            g: 255,
            b: 255,
            a: 255
        };
        this._show_current_color();
    }

    //eyedrop tool
    eyedrop() {
        //tira bordinha dos outros e bota na gente
        this._show_border(this.user.eyedrop_btn_id);
        //seta ferramenta atual para bucket_tool
        this.tool = this.eyedropper_tool;
    }

    //pega a cor clicada no desenho
    eyedropper_tool(e) {
        this._get_color_xy(this.user.sketch_canvas, e);
    }

    //pega a cor na posição xy do canvas
    _get_color_xy(canvas, e) {
        //pega cor clicada pelo mouse
        var ctx = document.getElementById(canvas).getContext("2d");
        var imgData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
        //checa se a cor clicada é permitida
        var c = {
            r: imgData.data[0],
            g: imgData.data[1],
            b: imgData.data[2],
            a: imgData.data[3]
        }
        if (!this._check_color_in_list(c, this.user.color_blacklist)) {
            //escolhe essa cor
            this.paint_color = this.user.color = c;
            //se escolheu cor é pq quer pintar (???)
            this.paint();
        }
    }

    //checa se a cor não está em color_blacklist 
    _check_color_in_list(c, list) {
        //console.log(c.r + ',' + c.g + ',' + c.b + ',' + c.a);
        for (var i = 0; i < list.length; i++) {
            if ((c.r === list[i].r) &&
                (c.g === list[i].g) &&
                (c.b === list[i].b)) return true;
        };
        return false;
    }

    //paint tool
    paint() {
        //tira bordinha dos outros e bota na gente
        this._show_border(this.user.paint_btn_id);
        //seta ferramenta atual para bucket_tool
        this.tool = this.bucket_tool;

        //retorna a cor escolhida por color_picker()
        this.user.color = this.paint_color;
        this._show_current_color();

        //carrega paleta na canvas auxiliar
        if ((this.user.palette_canvas) && (this.user.palette_file)) {
            var ctx = document.getElementById(this.user.palette_canvas).getContext("2d");
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
            img.src = this.user.palette_file;

            //handler para escolha de cor na paleta ao clicar na paleta auxiliar
            document.getElementById(this.user.palette_canvas).onclick = function(e) {
                this.color_picker(e);
            }.bind(this);
        }
    }

    //pega a cor clicada na paleta
    color_picker(e) {
        this._get_color_xy(this.user.palette_canvas, e);
    }

    //preenche a forma clicada
    bucket_tool(e) {
        //pinta
        var canvas = document.getElementById(this.user.sketch_canvas);
        var ctx = canvas.getContext("2d");

        //https://ben.akrin.com/?p=7888 (method #4)
        var pixel_stack = [{ x: e.offsetX, y: e.offsetY }];
        var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var coords = (e.offsetY * canvas.width + e.offsetX) * 4;
        var o_colour = {
            r: pixels.data[coords],
            g: pixels.data[coords + 1],
            b: pixels.data[coords + 2],
            a: pixels.data[coords + 3]
        };

        //adiciona a cor atual na lista proibida (para evitar pintar o que ja tem a mesma cor - hang)
        var l = [...this.user.color_blacklist, this.user.color];
        //e sai se tenta pintar cor reservada 
        if (this._check_color_in_list(o_colour, l)) return;

        //função-ajudante
        var match_colour = function(mod) {
            return (pixels.data[coords + 0 + mod] == o_colour.r &&
                pixels.data[coords + 1 + mod] == o_colour.g &&
                pixels.data[coords + 2 + mod] == o_colour.b &&
                pixels.data[coords + 3 + mod] == o_colour.a);
        }

        //salva desenho atual no history
        this._save_history();

        while (pixel_stack.length > 0) {
            var new_pixel = pixel_stack.pop();
            var x = new_pixel.x;
            var y = new_pixel.y;

            coords = (y * canvas.width + x) * 4;
            while ((y-- >= 0) && match_colour(0)) {
                coords -= canvas.width * 4;
            }
            coords += canvas.width * 4;
            y++;

            var reached_left = false;
            var reached_right = false;
            while ((y++ < canvas.height) && match_colour(0)) {
                pixels.data[coords] = this.user.color.r;
                pixels.data[coords + 1] = this.user.color.g;
                pixels.data[coords + 2] = this.user.color.b;
                pixels.data[coords + 3] = this.user.color.a;

                if (x > 0) {
                    if (match_colour(-4)) {
                        if (!reached_left) {
                            pixel_stack.push({ x: x - 1, y: y });
                            reached_left = true;
                        }
                    } else if (reached_left) {
                        reached_left = false;
                    }
                }

                if (x < canvas.width - 1) {
                    if (match_colour(4)) {
                        if (!reached_right) {
                            pixel_stack.push({ x: x + 1, y: y });
                            reached_right = true;
                        }
                    } else if (reached_right) {
                        reached_right = false;
                    }
                }

                coords += canvas.width * 4;
            }
        }
        ctx.putImageData(pixels, 0, 0);
    }

    //sticker tool
    sticker() {
        if ((this.user.sticker_canvas) &&
            (this.user.sticker_file) &&
            (this.user.sticker_x) &&
            (this.user.sticker_y)) {

            //tira bordinha dos outros e bota na gente
            this._show_border(this.user.sticker_btn_id);
            //seta ferramenta atual para bucket_tool
            this.tool = this.sticker_tool;

            //se ja temos um sticker escolhido, mostra
            this._show_sticker();

            //carrega spritesheet na canvas auxiliar
            var canvas = document.getElementById(this.user.sticker_canvas);
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
            img.src = this.user.sticker_file;

            //calcula tamanho X e Y de cada sticker
            this.sticker_size_x = canvas.width / this.user.sticker_x;
            this.sticker_size_y = canvas.height / this.user.sticker_y;

            //handler para escolha de sprite na spritesheet ao clicar na canvas auxiliar
            document.getElementById(this.user.sticker_canvas).onclick = function(e) {
                this.sticker_picker(e);
            }.bind(this);
        }
    }

    //larga current sticker em x,y
    sticker_tool(e) {
        if (this.temp_sticker_canvas) {
            var canvas = document.getElementById(this.user.sketch_canvas);
            var ctx = canvas.getContext("2d");
            //pega cor do destino
            var p = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var c = {
                r: p.data[((e.offsetY * canvas.width + e.offsetX) * 4)],
                g: p.data[((e.offsetY * canvas.width + e.offsetX) * 4) + 1],
                b: p.data[((e.offsetY * canvas.width + e.offsetX) * 4) + 2],
                a: p.data[((e.offsetY * canvas.width + e.offsetX) * 4) + 3]
            };
            //e somente bota sticker se a cor não é reservada 
            if (!this._check_color_in_list(c, this.user.color_blacklist)) {
                //salva desenho atual no history
                this._save_history();
                //printa sticker 
                ctx.drawImage(this.temp_sticker_canvas, e.offsetX - (this.sticker_size_x / 2), e.offsetY - (this.sticker_size_y / 2));
            }
        }
    }

    _show_sticker() {
        //mostra current icon no sticker_cvs
        if (this.user.current_sticker_canvas) {
            var canvas = document.getElementById(this.user.current_sticker_canvas);
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (this.temp_sticker_canvas) {
                //desenha ampliado
                ctx.save();
                if ((this.sticker_scale_x != 1) && (this.sticker_scale_y != 1)) {
                    ctx.scale(this.sticker_scale_x, this.sticker_scale_y);
                }
                ctx.drawImage(this.temp_sticker_canvas, 0, 0);
                ctx.restore();
            }
        }
    }

    //pega sprite clicado na canvas auxiliar
    sticker_picker(e) {
        //calcula inicio x y do sticker clicado 
        var sticker_x = Math.floor(e.offsetX / this.sticker_size_x) * this.sticker_size_x;
        var sticker_y = Math.floor(e.offsetY / this.sticker_size_y) * this.sticker_size_y;

        //pega sticker da canvas auxiliar
        var ctx = document.getElementById(this.user.sticker_canvas).getContext("2d");
        var cur_sticker = ctx.getImageData(sticker_x, sticker_y, this.sticker_size_x, this.sticker_size_y);

        //cria canvas temporario para apenas esse sticker
        this.temp_sticker_canvas = document.createElement('canvas');
        this.temp_sticker_canvas.width = cur_sticker.width;
        this.temp_sticker_canvas.height = cur_sticker.height;

        //deixa transparente
        var imageData = cur_sticker.data;
        for (var i = 0; i < imageData.length; i += 4) {
            //pega cor atual
            var c = {
                r: imageData[i + 0],
                g: imageData[i + 1],
                b: imageData[i + 2],
                a: imageData[i + 3]
            }
            //checa se essa cor deve ficar transparente
            if (this._check_color_in_list(c, this.user.color_transparency)) {
                imageData[i + 3] = 0;
            }
        }
        //e coloca o sticker na canvas
        this.temp_sticker_canvas.getContext("2d").putImageData(cur_sticker, 0, 0);
        //se escolheu sticker é pq quer stickar? (???)
        this.sticker();
    }

}