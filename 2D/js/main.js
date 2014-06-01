(function (window, $, undefined) {
    'use strict';
    String.prototype.format = function () {var args = arguments; return this.replace(/\{(\d+)\}/g, function (m, i) {return args[i]; }); };
    $.extend({CA: function (o) {
        var op = {
                speed: 500,
                stepspeed: 500,
                target: ".ca_container",
                size: {x: 10, y: 7},
                threshold: 5,
                template: {line: "#temp_line", item: "#temp_item"},
                isClose: true,
                noHoldExt: false,
                noColor: false
            },
            container,
            ALL,
            mat = [],
            next = [],
            t_step,
            t_loop,
            cnt_step = 0,
            cnt_loop = 0,
            isLock = false,
            isStep = false,
            isLoop = false,
            run_state = false;
        op = $.extend({}, op, o);
        function deepcopy(obj) {
            var out = [], i, len = obj.length;
            for (i = 0; i < len; i += 1) {
                if (obj[i] instanceof Array) {
                    out[i] = deepcopy(obj[i]);
                } else {
                    out[i] = obj[i];
                }
            }
            return out;
        }
        function randnum(x, y) {
            return parseInt(Math.random() * (x - y + 1) + y, 10);
        }
        function getTemp(temp) {
            var ret = {}, thtml, t;
            for (t in temp) {
                thtml = $(temp[t]).html();
                ret[t] = thtml.substring(6, thtml.length - 3);
            }
            return ret;
        }
        function getM(x, y) {
            return mat[x][y];
        }
        function getNode(x, y) {
            return ALL.eq(y * op.size.x + x);
        }
        function setM(x, y, val, b) {
            mat[x][y] = val;
            var obj = ALL.eq(y * op.size.x + x);
            obj.find("span").text(val);
            if(!op.noColor && !b)transition(obj, undefined, val);
        }
        function transition(obj, obj2, val) {
            if(obj2 === undefined) {
                if(obj.hasClass("act"))
                    obj.attr("class", "act c"+val);
                else obj.attr("class", "c"+val);
            }else{
                var o = getNode(obj, obj2);
                if(o.hasClass("act"))
                    o.attr("class", "act c"+val);
                else o.attr("class", "c"+val);
            }
        }
        function loop() {
            if(isLoop)return;
            isLoop = true;
            var  ret = 0;
            $("#circle").text(++cnt_loop);
            next = deepcopy(mat);
            if(!op.noColor && op.noHoldExt)ALL.removeClass("loop");
            if(!op.noColor)ALL.removeClass("curloop");
            else ALL.attr("class", "");
            for(var i = 0;i<op.size.x;i++) {
                for(var j = 0;j<op.size.y;j++) {
                    if(getM(i, j)<op.threshold)continue;
                    if(i>0)
                        next[i-1][j] += 1 , next[i][j] -= 1;
                    if(j>0)
                        next[i][j-1] += 1 , next[i][j] -= 1;
                    if(i<op.size.x-1)
                        next[i+1][j] += 1 , next[i][j] -= 1;
                    if(j<op.size.y-1)
                        next[i][j+1] += 1 , next[i][j] -= 1;
                }
            }

            for(var i = 0;i<op.size.x;i++) {
                for(var j = 0;j<op.size.y;j++) {
                    if( next[i][j] != getM(i, j) ) {
                        setM(i, j, next[i][j]);
                        if(!op.noColor)getNode(i, j).addClass("loop").addClass("curloop");
                        else getNode(i, j).attr("class", "loop");
                    }
                    ret += (getM(i, j)>= op.threshold);
                }
            }    

            if(ret === 0) {
                isLock = false;
                clearInterval(t_loop);
            }
            isLoop = false;
        }
        return {
            init: function (o) {
                op = $.extend({}, op, o);
                container = $(op.target);
                mat = [];
                for(var i = 0;i<op.size.x;i++) {
                    mat.push(new Array(op.size.y));
                    for(var j = 0;j<op.size.y;j++)
                        mat[i][j] = 0;
                }    
                this.build();
            }, 
            build: function () {
                var html = '', temp = getTemp(op.template), thtml = '';
                for(var j = 0;j<op.size.y;j++) {
                    thtml = '';
                    for(var i = 0;i<op.size.x;i++)
                        thtml += temp.item.format(i, j, 0);
                    html += temp.line.format(j, thtml);
                }
                container.append(html);
                ALL = container.find("li div");
            }, 
            start: function () {
                if(run_state) {return; }
                if(isStep) {return; }
                run_state = true;
                isStep = true;
                
                void function () {
                    isLock = true;
                    isLoop = false;
                    cnt_loop = 0;
                    t_loop = setInterval(loop, op.speed);
                }();
                
                t_step = setInterval(function () {
                    if(isLock)return;
                    $("#times").text(cnt_step++);
                    if(!op.noColor)ALL.removeClass("act");
                    else ALL.attr("class", "");
                    if(!op.noColor && !op.noHoldExt)ALL.removeClass("loop").removeClass("curloop");
                    var r = {x: 0, y: 0} , cur;    r.x = randnum(-1, op.size.x);    r.y = randnum(-1, op.size.y);
                    cur = getNode(r.x, r.y);
                    //container.find("div").css("background-color", "#ccc");
                    setM(r.x, r.y, getM(r.x, r.y)+1);
                    cur.addClass("act");
                    
                    if( getM(r.x, r.y) >= op.threshold )
                    {
                        isLock = true;
                        cnt_loop = 0;
                        isLoop = false;
                        t_loop = setInterval(loop, op.speed); 
                    }
                    else{isLock = false; }
                    isStep = false;
                    if(cnt_loop>1)console.log("step: "+cnt_step+";circle: "+cnt_loop+";");
                }, op.stepspeed);
            }, 
            nextStep: function () {
                this.pause();
                
                isLock = true;
                void function () {
                    isLoop = false;
                    //c = 0;
                    loop();
                }();
                
                void function () {
                    if(isLock)return;
                    $("#times").text(cnt_step++);
                    if(!op.noColor)ALL.removeClass("act");
                    else ALL.attr("class", "");
                    if(!op.noColor && !op.noHoldExt)ALL.removeClass("loop").removeClass("curloop");
                    var r = {x: 0, y: 0} , cur;    r.x = randnum(-1, op.size.x);    r.y = randnum(-1, op.size.y);
                    cur = getNode(r.x, r.y);
                    //container.find("div").css("background-color", "#ccc");
                    setM(r.x, r.y, getM(r.x, r.y)+1);
                    cur.addClass("act");
                    
                    if( getM(r.x, r.y) >= op.threshold )
                    {
                        cnt_loop = 0;
                        isLoop = false;
                        loop(); 
                    }
                    else{isLock = false; }
                }();
            }, 
            pause: function () {
                run_state = false;
                isLock = false;
                isLoop = false;
                isStep = false;
                clearInterval(t_step);
                clearInterval(t_loop);
            }, 
            setV: function (val) {
                var ts;
                if(run_state) {ts = true;run_state = false; }

                for(var i = 0;i<op.size.x;i++)
                for(var j = 0;j<op.size.y;j++)
                setM(i, j, val);
                
                if(ts)run_state = true;
            }, 
            setRandom: function () {
                var ts;
                if(run_state) {ts = true;run_state = false; }
                
                for(var i = 0;i<op.size.x;i++)
                for(var j = 0;j<op.size.y;j++)
                setM(i, j, randnum(-1, 5));
                
                if(ts)run_state = true;
            }, 
            run_state: function () {return run_state; }
        };
    }});
})(window, jQuery);



(function (window, $, undefined) {
    $(document).ready(function () {
        var t = $.CA();
        t.init({speed: 10, stepspeed: 10, size: {x: 20, y: 20}, isClose: true, noHoldExt: false, noColor: false});
        $("#run-check").on("click", function () {
            if(t.run_state() === false)
                t.start(), $(this).val("Stop");
            else
                t.pause(), $(this).val("Start");
        });
        $("#run-next").on("click", function () {
            t.nextStep(), $("#run-check").val("Start");
        });
        $("#set-val-4").on("click", function () {t.setV(4); });
        $("#set-val-3").on("click", function () {t.setV(3); });
        $("#set-val-2").on("click", function () {t.setV(2); });
        $("#set-val-1").on("click", function () {t.setV(1); });
        $("#set-val-rnd").on("click", function () {t.setRandom(); });
    });
})(window, jQuery);