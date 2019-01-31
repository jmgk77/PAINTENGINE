//PAINT_ENGINE - Engine para jogos de pintar
//(c) JMGK 2019

'use strict';

class PaintEngine {

    //init
    constructor(draw_canvas, aux_canvas,
        sketch_files,
        prev_btn_id, reload_btn_id, next_btn_id,
        back_btn_id,
        paint_btn_id, cur_color_canvas, palette_file,
        erase_btn_id,
        eyedrop_btn_id) {

        //salva canvas
        this.draw_cvs = draw_canvas;
        this.aux_cvs = aux_canvas;

        //salva array de desenhos
        this.sketch_fnames_a = sketch_files;
        this.max_sketchs = this.sketch_fnames_a.length - 1;
        this.cur_sketch = 0;

        //salva ids dos botões anterior, recarregar e proximo
        this.prev_id = prev_btn_id;
        this.reload_id = reload_btn_id;
        this.next_id = next_btn_id;

        //salva id do botão ctrl+z
        this.back_id = back_btn_id;

        //salva id do botão pintar, canvas para mostrar a cor atual e nome do imagem de paleta
        this.paint_id = paint_btn_id;
        this.color_cvs = cur_color_canvas;
        this.palette_fname = palette_file;

        //salva id do botão da ferramenta apagar (que usa cur_color_canvas se disponivel)
        this.erase_id = erase_btn_id;

        //salva id do botão da ferramenta conta-gotas
        this.eyedrop_id = eyedrop_btn_id;

        //cor default
        this.paint_color = this.cur_color = {
            r: 0x80,
            g: 0x00,
            b: 0xff,
            a: 255
        };

        //array do history dos desenhos
        this.history_a = [];

        //ptr para ferramenta selecionada atualmente
        this.tool = null;
    }

    //roda a bagaça
    run() {
        //handler para usar a ferramenta atual no desenho
        document.getElementById(this.draw_cvs).onclick = function(e) {
            this.tool(e);
        }.bind(this);

        //handler para ir para esenho anterior
        if (this.prev_id) {
            document.getElementById(this.prev_id).onclick = function() {
                this.load_sketch(-1);
            }.bind(this);
        }
        //handler para ir para proximo desenho
        if (this.next_id) {
            document.getElementById(this.next_id).onclick = function() {
                this.load_sketch(1);
            }.bind(this);
        }
        //handler para limpar desenho
        if (this.reload_id) {
            document.getElementById(this.reload_id).onclick = function() {
                this.load_sketch(0);
            }.bind(this);
        }
        //handler para voltar o ultimo comando
        if (this.back_id) {
            document.getElementById(this.back_id).onclick = function() {
                this.back_history();
            }.bind(this);
        }
        //handler para ferramenta 'pintar' (preencher)
        if (this.paint_id) {
            document.getElementById(this.paint_id).onclick = function() {
                this.paint();
            }.bind(this);
        }
        //handler para ferramenta 'apagar' (pintar com branco)
        if (this.erase_id) {
            document.getElementById(this.erase_id).onclick = function() {
                this.erase();
            }.bind(this);
        }
        //handler para ferramenta 'eyedrop' (pegar cor)
        if (this.eyedrop_id) {
            document.getElementById(this.eyedrop_id).onclick = function() {
                this.eyedrop();
            }.bind(this);
        }

        //carrega desenho
        this.load_sketch(0);

        //simula escolha da ferramenta default
        this.paint();
    }

    //carrega desenho
    load_sketch(mod) {
        var ctx = document.getElementById(this.draw_cvs).getContext("2d");
        var imageObj = new Image();
        imageObj.onload = function() {
            ctx.drawImage(imageObj, 0, 0);
        };
        this.cur_sketch += mod;
        this.cur_sketch = ((this.cur_sketch < 0) ? this.max_sketchs : ((this.cur_sketch > this.max_sketchs) ? 0 : this.cur_sketch));
        imageObj.src = this.sketch_fnames_a[this.cur_sketch];

        //esvazia history quando muda de desenho
        this.history_a.length = 0;
    }

    //volta um passo na history
    back_history() {
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
    _save_history() {
        this.history_a.push(document.getElementById(this.draw_cvs).toDataURL("image/png"));
    }

    //preenche mostruario com a cor atual
    _show_current_color() {
        if (this.color_cvs) {
            var canvas = document.getElementById(this.color_cvs);
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = 'rgba(' + this.cur_color.r + ',' + this.cur_color.g + ',' + this.cur_color.b + ',' + this.cur_color.a + ')';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    //mostra borda css (escondendo a dos outros)
    _show_border(id) {
        //esconde dos outros
        document.getElementById(this.erase_id).classList.remove("tool_selected");
        document.getElementById(this.paint_id).classList.remove("tool_selected");
        document.getElementById(this.eyedrop_id).classList.remove("tool_selected");
        //mostra nossa
        document.getElementById(id).classList.add("tool_selected");
    }

    //erase tool (pinta com branco)
    erase() {
        //tira bordinha dos outros e bota na gente
        this._show_border(this.erase_id);
        //seta ferramenta atual para bucket_tool
        this.tool = this.bucket_tool;

        //apagar é pintar com branco (nao mexe na .paint_color)
        this.cur_color = {
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
        this._show_border(this.eyedrop_id);
        //seta ferramenta atual para bucket_tool
        this.tool = this.eyedropper_tool;
    }

    //pega a cor clicada no desenho
    eyedropper_tool(e) {
        //pega cor clicada pelo mouse
        var ctx = document.getElementById(this.draw_cvs).getContext("2d");
        var imgData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
        this.paint_color = this.cur_color = {
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
        this._show_border(this.paint_id);
        //seta ferramenta atual para bucket_tool
        this.tool = this.bucket_tool;

        //retorna a cor escolhida por color_picker()
        this.cur_color = this.paint_color;
        this._show_current_color();

        //carrega paleta na canvas auxiliar
        var ctx = document.getElementById(this.aux_cvs).getContext("2d");
        var img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        };
        img.src = this.palette_fname;

        //handler para escolha de cor na paleta ao clicar na paleta auxiliar
        document.getElementById(this.aux_cvs).onclick = function(e) {
            this.color_picker(e);
        }.bind(this);
    }

    //pega a cor clicada na paleta
    color_picker(e) {
        //pega cor clicada pelo mouse
        var ctx = document.getElementById(this.aux_cvs).getContext("2d");
        var imgData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
        this.paint_color = this.cur_color = {
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
        //salva desenho atual no history
        this._save_history();

        //pinta
        var canvas = document.getElementById(this.draw_cvs);
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
        if ((this.cur_color.r === o_colour.r) &&
            (this.cur_color.g === o_colour.g) &&
            (this.cur_color.b === o_colour.b)) return;
        //sai se tenta pintar 'preto absoluto' (cor reservada para as bordas dos desenhos)
        if ((0 === o_colour.r) &&
            (0 === o_colour.g) &&
            (0 === o_colour.b)) return;
        //função-ajudante
        var match_colour = function(mod) {
            return (pixels.data[coords + 0 + mod] == o_colour.r &&
                pixels.data[coords + 1 + mod] == o_colour.g &&
                pixels.data[coords + 2 + mod] == o_colour.b &&
                pixels.data[coords + 3 + mod] == o_colour.a);
        }

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
                pixels.data[coords] = this.cur_color.r;
                pixels.data[coords + 1] = this.cur_color.g;
                pixels.data[coords + 2] = this.cur_color.b;
                pixels.data[coords + 3] = this.cur_color.a;

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


}