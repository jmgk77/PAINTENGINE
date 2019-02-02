//PAINT_ENGINE - Engine para jogos de pintar
//(c) JMGK 2019

'use strict';

/*
sketch_canvas, sketch_files, color, aux_canvas, palette_file, current_color_canvas,
prev_btn_id, reload_btn_id, next_btn_id,undo_btn_id, redo_btn_id, paint_btn_id, erase_btn_id,
css_class_border, eyedrop_btn_id,
*/

/*        
        sticker_btn_id, cur_sticker_canvas, sticker_file, sticker_x, sticker_y
*/

class PaintEngine {

    //init
    constructor(arg_obj) {
        //copy user params
        this.conf = arg_obj;

        //checa parametros essenciais
        if (!this.conf.sketch_canvas)
            throw "PaintEngine::constructor(): <sketch_canvas> must be defined";
        if (!this.conf.sketch_files)
            throw "PaintEngine::constructor(): <sketch_files> must be defined";
        if (!this.conf.sketch_files.length)
            throw "PaintEngine::constructor(): <sketch_files> must be have at least 1 element";

        //salva tamanho do array de desenhos e qual é o atual
        this.max_sketchs = this.conf.sketch_files.length - 1;
        this.cur_sketch = 0;

        //se user não definiu uma cor, usa cor default
        if (!this.conf.color) {
            this.conf.color = { r: 0x80, g: 0x00, b: 0x80, a: 0xff };
        }

        //array do history dos desenhos
        this.history_a = [];
        this.history_ptr = 0;

        //ptr para ferramenta selecionada atualmente
        this.tool = null;
    }

    //setter para cor atual
    set color(c) {
        this.conf.color = c;
    }

    //roda a bagaça
    run() {
        //handler para usar a ferramenta atual no desenho
        document.getElementById(this.conf.sketch_canvas).onclick = function(e) {
            this.tool(e);
        }.bind(this);

        //handler para ir para esenho anterior
        if (this.conf.prev_btn_id) {
            document.getElementById(this.conf.prev_btn_id).onclick = function() {
                this.load_sketch(-1);
            }.bind(this);
        }
        //handler para ir para proximo desenho
        if (this.conf.next_btn_id) {
            document.getElementById(this.conf.next_btn_id).onclick = function() {
                this.load_sketch(1);
            }.bind(this);
        }
        //handler para limpar desenho
        if (this.conf.reload_btn_id) {
            document.getElementById(this.conf.reload_btn_id).onclick = function() {
                this.load_sketch(0);
            }.bind(this);
        }
        //handler para voltar o ultimo comando
        if (this.conf.undo_btn_id) {
            document.getElementById(this.conf.undo_btn_id).onclick = function() {
                this.back_history();
            }.bind(this);
        }
        //handler para refazer o ultimo comando
        if (this.conf.redo_btn_id) {
            document.getElementById(this.conf.redo_btn_id).onclick = function() {
                this.redo_history();
            }.bind(this);
        }
        //handler para ferramenta 'pintar' (preencher)
        if (this.conf.paint_btn_id) {
            document.getElementById(this.conf.paint_btn_id).onclick = function() {
                this.paint();
            }.bind(this);
        }
        //handler para ferramenta 'apagar' (pintar com branco)
        if (this.conf.erase_btn_id) {
            document.getElementById(this.conf.erase_btn_id).onclick = function() {
                this.erase();
            }.bind(this);
        }
        //handler para ferramenta 'eyedrop' (pegar cor)
        if (this.conf.eyedrop_btn_id) {
            document.getElementById(this.conf.eyedrop_btn_id).onclick = function() {
                this.eyedrop();
            }.bind(this);
        }
        //handler para ferramenta 'sticker' (adiciona figurinhas duma spritesheet)
        if (this.conf.sticker_btn_id) {
            document.getElementById(this.conf.sticker_btn_id).onclick = function() {
                this.sticker();
            }.bind(this);
        }

        //carrega desenho
        this.load_sketch(0);

        //simula escolha da ferramenta default
        this.paint_color = this.conf.color;
        this.paint();
    }

    //carrega desenho
    load_sketch(mod) {
        var ctx = document.getElementById(this.conf.sketch_canvas).getContext("2d");
        var imageObj = new Image();
        imageObj.onload = function() {
            ctx.drawImage(imageObj, 0, 0);
        };
        this.cur_sketch += mod;
        this.cur_sketch = ((this.cur_sketch < 0) ? this.max_sketchs : ((this.cur_sketch > this.max_sketchs) ? 0 : this.cur_sketch));
        imageObj.src = this.conf.sketch_files[this.cur_sketch];

        //esvazia history quando muda de desenho
        this.history_a.length = 0;
    }

    //volta um passo na history
    back_history() {
        //temos uma history e não estamos no começo dela
        if ((this.history_a.length) && (this.history_ptr > 0)) {
            //salva tela atual no history, para poder voltar pra ela, se estivermos nos final da lista
            if (this.history_a.length == this.history_ptr) {
                this.history_a[this.history_ptr] = (document.getElementById(this.conf.sketch_canvas).toDataURL("image/png"));
            }
            //ajusta ponteiro para entrada anterior do history
            this.history_ptr--;
            //copia history na canvas
            this._canvas_history_update();
        }
    }

    //refazer um passo na history (###não ta refazendo ultimo passo)
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
        var ctx = document.getElementById(this.conf.sketch_canvas).getContext("2d");
        var img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        };
        img.src = this.history_a[this.history_ptr];
    }

    //salva desenho atual no history
    _save_history() {
        //adiciona modificações 
        this.history_a[this.history_ptr] = (document.getElementById(this.conf.sketch_canvas).toDataURL("image/png"));
        //ajusta ponteiro para proxima entrada do history e passo atual vira o ultimo
        this.history_a.length = ++this.history_ptr;
    }

    //preenche mostruario com a cor atual
    _show_current_color() {
        if (this.conf.current_color_canvas) {
            var canvas = document.getElementById(this.conf.current_color_canvas);
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = 'rgba(' + this.conf.color.r + ',' + this.conf.color.g + ',' + this.conf.color.b + ',' + this.conf.color.a + ')';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    //mostra borda css (escondendo a dos outros)
    _show_border(id) {
        if (this.conf.css_class_border) {
            //esconde dos outros
            if (this.conf.erase_btn_id) document.getElementById(this.conf.erase_btn_id).classList.remove(this.conf.css_class_border);
            if (this.conf.paint_btn_id) document.getElementById(this.conf.paint_btn_id).classList.remove(this.conf.css_class_border);
            if (this.conf.eyedrop_btn_id) document.getElementById(this.conf.eyedrop_btn_id).classList.remove(this.conf.css_class_border);
            if (this.conf.sticker_btn_id) document.getElementById(this.conf.sticker_btn_id).classList.remove(this.conf.css_class_border);
            //mostra nossa
            if (id) document.getElementById(id).classList.add(this.conf.css_class_border);
        }
    }

    //erase tool (pinta com branco)
    erase() {
        //tira bordinha dos outros e bota na gente
        this._show_border(this.conf.erase_btn_id);
        //seta ferramenta atual para bucket_tool
        this.tool = this.bucket_tool;

        //apagar é pintar com branco (nao mexe na .paint_color)
        this.conf.color = {
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
        this._show_border(this.conf.eyedrop_btn_id);
        //seta ferramenta atual para bucket_tool
        this.tool = this.eyedropper_tool;
    }

    //pega a cor clicada no desenho
    eyedropper_tool(e) {
        //pega cor clicada pelo mouse
        var ctx = document.getElementById(this.conf.sketch_canvas).getContext("2d");
        var imgData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
        this.paint_color = this.conf.color = {
            r: imgData.data[0],
            g: imgData.data[1],
            b: imgData.data[2],
            a: 255
        };
        //se escolheu cor é pq quer pintar (???)
        this.paint();
    }

    //paint tool
    paint() {
        //tira bordinha dos outros e bota na gente
        this._show_border(this.conf.paint_btn_id);
        //seta ferramenta atual para bucket_tool
        this.tool = this.bucket_tool;

        //retorna a cor escolhida por color_picker()
        this.conf.color = this.paint_color;
        this._show_current_color();

        //carrega paleta na canvas auxiliar
        if ((this.conf.aux_canvas) && (this.conf.palette_file)) {
            var ctx = document.getElementById(this.conf.aux_canvas).getContext("2d");
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
            };
            img.src = this.conf.palette_file;

            //handler para escolha de cor na paleta ao clicar na paleta auxiliar
            document.getElementById(this.conf.aux_canvas).onclick = function(e) {
                this.color_picker(e);
            }.bind(this);
        }
    }

    //pega a cor clicada na paleta
    color_picker(e) {
        //pega cor clicada pelo mouse
        var ctx = document.getElementById(this.conf.aux_canvas).getContext("2d");
        var imgData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
        this.paint_color = this.conf.color = {
            r: imgData.data[0],
            g: imgData.data[1],
            b: imgData.data[2],
            a: 255
        };
        //se escolheu cor é pq quer pintar (???)
        this.paint();
    }

    //preenche a forma clicada
    bucket_tool(e) {
        //pinta
        var canvas = document.getElementById(this.conf.sketch_canvas);
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

        //sai se tentar pintar o que ja tem essa mesma cor (fix para hangs)
        if ((this.conf.color.r === o_colour.r) &&
            (this.conf.color.g === o_colour.g) &&
            (this.conf.color.b === o_colour.b)) return;
        //sai se tenta pintar 'preto absoluto' (cor reservada para as bordas dos desenhos)
        if ((0 === o_colour.r) &&
            (0 === o_colour.g) &&
            (0 === o_colour.b)) return;
        //muda 'preto absoluto' levmente para preservar linhas de contorno
        if ((this.conf.color.r === 0) &&
            (this.conf.color.g === 0) &&
            (this.conf.color.b === 0)) {
            this.conf.color.r = 1;
            this.conf.color.g = 1;
            this.conf.color.b = 1;
        }
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
                pixels.data[coords] = this.conf.color.r;
                pixels.data[coords + 1] = this.conf.color.g;
                pixels.data[coords + 2] = this.conf.color.b;
                pixels.data[coords + 3] = this.conf.color.a;

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
        //tira bordinha dos outros e bota na gente
        this._show_border(this.conf.sticker_btn_id);
        //seta ferramenta atual para bucket_tool
        this.tool = this.sticker_tool;

        //se ja temos um sticker escolhido, mostra
        this._show_sticker();

        //carrega spritesheet na canvas auxiliar
        //### check this.conf.aux_canvas
        var canvas = document.getElementById(this.conf.aux_canvas);
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        };
        img.src = this.conf.sticker_file;

        //calcula tamanho X e Y de cada sticker
        this.sticker_size_x = canvas.width / this.conf.sticker_x;
        this.sticker_size_y = canvas.height / this.conf.sticker_y;

        //handler para escolha de sprite na spritesheet ao clicar na canvas auxiliar
        document.getElementById(this.conf.aux_canvas).onclick = function(e) {
            this.sticker_picker(e);
        }.bind(this);
    }

    //larga current sticker em x,y
    sticker_tool(e) {
        //salva desenho atual no history
        this._save_history();

        //printa sticker 
        var ctx = document.getElementById(this.conf.sketch_canvas).getContext("2d");
        ctx.drawImage(this.cur_sticker_cvs, e.offsetX - (this.sticker_size_x / 2), e.offsetY - (this.sticker_size_y / 2));
    }

    _show_sticker() {
        //mostra current icon no sticker_cvs
        var canvas = document.getElementById(this.conf.cur_sticker_canvas);
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (this.cur_sticker_cvs) {
            //desenha ampliado
            ctx.save();
            ctx.scale(3.5, 3.5);
            ctx.drawImage(this.cur_sticker_cvs, 0, 0);
            ctx.restore();
        }
    }

    //pega sprite clicado na canvas auxiliar
    sticker_picker(e) {
        //calcula inicio x y do sticker clicado 
        var sticker_x = Math.floor(e.offsetX / this.sticker_size_x) * this.sticker_size_x;
        var sticker_y = Math.floor(e.offsetY / this.sticker_size_y) * this.sticker_size_y;

        //pega sticker da canvas auxiliar
        var ctx = document.getElementById(this.conf.aux_canvas).getContext("2d");
        var cur_sticker = ctx.getImageData(sticker_x, sticker_y, this.sticker_size_x, this.sticker_size_y);

        //cria canvas para apenas esse sticker
        this.cur_sticker_cvs = document.createElement('canvas');
        this.cur_sticker_cvs.width = cur_sticker.width;
        this.cur_sticker_cvs.height = cur_sticker.height;

        //deixa transparente
        var imageData = cur_sticker.data;
        for (var i = 0; i < imageData.length; i += 4) {
            if (imageData[i]) {
                imageData[i + 3] = 0;
            }
        }
        //e coloca o sticker na canvas
        this.cur_sticker_cvs.getContext("2d").putImageData(cur_sticker, 0, 0);

        //se escolheu sticker é pq quer stickar? (???)
        this.sticker();
    }

}