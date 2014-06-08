(function (window, $, undefined) {
    'use strict';
    String.prototype.format = function () {var args = arguments; return this.replace(/\{(\d+)\}/g, function (m, i) {return args[i]; }); };
    $.extend({CA: function (o) {
        var option = $.extend({}, {
                speed: 500,
                stepspeed: 500,
                target: ".ca_container",
                size: {x: 10, y: 7},
                threshold: 5,
                template: {line: "#temp_line", item: "#temp_item"},
                isClose: true,
                noHoldExt: false,
                noColor: false
            }, o),
            nodesContainer,
            allNodes,
            matArray = [],
            nextArray = [],
            timerStep,
            timerLoop,
            countStep = 0,
            countLoop = 0,
            isLock = false,
            isStep = false,
            isLoop = false,
            runState = false,
			_deepCopy = function (obj) {
				var out = [], i, len = obj.length;
				for (i = 0; i < len; i += 1) {
					if (obj[i] instanceof Array) {
						out[i] = _deepCopy(obj[i]);
					} else {
						out[i] = obj[i];
					}
				}
				return out;
			},
			_randomNum = function (x, y) {
				return parseInt(Math.random() * (x - y + 1) + y, 10);
			},
			_getTemplate = function (temp) {
				var ret = {}, thtml, t;
				for (t in temp) {
					thtml = $(temp[t]).html();
					ret[t] = thtml.substring(6, thtml.length - 3);
				}
				return ret;
			},
			_getMat = function (x, y) {
				return matArray[x][y];
			},
			_getNode = function (x, y) {
				return allNodes.eq(y * option.size.x + x);
			},
			_setMat = function (x, y, val, b) {
				matArray[x][y] = val;
				var obj = allNodes.eq(y * option.size.x + x);
				obj.find("span").text(val);
				if(!option.noColor && !b)_cssTransition(obj, undefined, val);
			},
			_cssTransition = function (obj, obj2, val) {
				if(obj2 === undefined) {
					if(obj.hasClass("act"))
						obj.attr("class", "act c"+val);
					else obj.attr("class", "c"+val);
				}else{
					var o = _getNode(obj, obj2);
					if(o.hasClass("act"))
						o.attr("class", "act c"+val);
					else o.attr("class", "c"+val);
				}
			},
			_loop = function () {
				if(isLoop)return;
				isLoop = true;
				var  ret = 0;
				$("#circle").text(++countLoop);
				nextArray = _deepCopy(matArray);
				if(!option.noColor && option.noHoldExt)allNodes.removeClass("loop");
				if(!option.noColor)allNodes.removeClass("curloop");
				else allNodes.attr("class", "");
				for(var i = 0;i<option.size.x;i++) {
					for(var j = 0;j<option.size.y;j++) {
						if(_getMat(i, j)<option.threshold)continue;
						if(i>0)
							nextArray[i-1][j] += 1 , nextArray[i][j] -= 1;
						else if( !option.isClose ) nextArray[i][j] -= 1;
						if(j>0)
							nextArray[i][j-1] += 1 , nextArray[i][j] -= 1;
						else if( !option.isClose ) nextArray[i][j] -= 1;
						if(i<option.size.x-1)
							nextArray[i+1][j] += 1 , nextArray[i][j] -= 1;
						else if( !option.isClose ) nextArray[i][j] -= 1;
						if(j<option.size.y-1)
							nextArray[i][j+1] += 1 , nextArray[i][j] -= 1;
						else if( !option.isClose ) nextArray[i][j] -= 1;
					}
				}

				for(var i = 0;i<option.size.x;i++) {
					for(var j = 0;j<option.size.y;j++) {
						if( nextArray[i][j] != _getMat(i, j) ) {
							_setMat(i, j, nextArray[i][j]);
							if(!option.noColor)_getNode(i, j).addClass("loop").addClass("curloop");
							else _getNode(i, j).attr("class", "loop");
						}
						ret += (_getMat(i, j)>= option.threshold);
					}
				}    

				if(ret === 0) {
					isLock = false;
					clearInterval(timerLoop);
				}
				isLoop = false;
			};
        return {
            init: function (o) {
                option = $.extend({}, option, o);
                nodesContainer = $(option.target);
                matArray = [];
                for(var i = 0;i<option.size.x;i++) {
                    matArray.push(new Array(option.size.y));
                    for(var j = 0;j<option.size.y;j++)
                        matArray[i][j] = 0;
                }    
                this.build();
            }, 
            build: function () {
                var html = '', temp = _getTemplate(option.template), thtml = '';
                for(var j = 0;j<option.size.y;j++) {
                    thtml = '';
                    for(var i = 0;i<option.size.x;i++)
                        thtml += temp.item.format(i, j, 0);
                    html += temp.line.format(j, thtml);
                }
                nodesContainer.append(html);
                allNodes = nodesContainer.find("li div");
            }, 
            start: function () {
                if(runState) {return; }
                if(isStep) {return; }
                runState = true;
                isStep = true;
                
                void function () {
                    isLock = true;
                    isLoop = false;
                    countLoop = 0;
                    timerLoop = setInterval(_loop, option.speed);
                }();
                
                timerStep = setInterval(function () {
                    if(isLock)return;
                    $("#times").text(countStep++);
                    if(!option.noColor)allNodes.removeClass("act").removeClass("loop").removeClass("curloop");
                    else allNodes.attr("class", "");
                    if(!option.noColor && !option.noHoldExt)allNodes.removeClass("loop").removeClass("curloop");
                    var r = {x: 0, y: 0} , cur;    r.x = _randomNum(-1, option.size.x);    r.y = _randomNum(-1, option.size.y);
                    cur = _getNode(r.x, r.y);
                    _setMat(r.x, r.y, _getMat(r.x, r.y)+1);
                    cur.addClass("act");
                    
                    if( _getMat(r.x, r.y) >= option.threshold )
                    {
                        isLock = true;
                        countLoop = 0;
                        isLoop = false;
                        timerLoop = setInterval(_loop, option.speed); 
                    }
                    else{isLock = false; }
                    isStep = false;
                    if(countLoop>1)console.log("step: "+countStep+";circle: "+countLoop+";");
                }, option.stepspeed);
            }, 
            nextStep: function () {
                this.pause();
                
                isLock = true;
                void function () {
                    isLoop = false;
                    _loop();
                }();
                
                void function () {
                    if(isLock)return;
                    $("#times").text(countStep++);
                    if(!option.noColor)allNodes.removeClass("act");
                    else allNodes.attr("class", "");
                    if(!option.noColor && !option.noHoldExt)allNodes.removeClass("loop").removeClass("curloop");
                    var r = {x: 0, y: 0} , cur;    r.x = _randomNum(-1, option.size.x);    r.y = _randomNum(-1, option.size.y);
                    cur = _getNode(r.x, r.y);
                    _setMat(r.x, r.y, _getMat(r.x, r.y)+1);
                    cur.addClass("act");
                    isLock = false;
                }();
            }, 
            pause: function () {
                runState = false;
                isLock = false;
                isLoop = false;
                isStep = false;
                clearInterval(timerStep);
                clearInterval(timerLoop);
            }, 
            setV: function (val) {
                var ts;
                if(runState) {ts = true;runState = false; }

                for(var i = 0;i<option.size.x;i++)
                for(var j = 0;j<option.size.y;j++)
                _setMat(i, j, val);
                
                if(ts)runState = true;
            }, 
            setRandom: function () {
                var ts;
                if(runState) {ts = true;runState = false; }
                
                for(var i = 0;i<option.size.x;i++)
                for(var j = 0;j<option.size.y;j++)
                _setMat(i, j, _randomNum(-1, 5));
                
                if(ts)runState = true;
            }, 
            runState: function () {return runState; },
			setOption: function (opt,val) {	option[opt] = val ? true : false; },
			getOption: function (opt) {	return option[opt]; }
        };
    }});
})(window, jQuery);



(function (window, $, undefined) {
    $(document).ready(function () {
        var t = $.CA();
        t.init({speed: 10, stepspeed: 10, size: {x: 40, y: 40}, isClose: true, noHoldExt: false, noColor: false});
        $("#run-check").on("click", function () {
            if(t.runState() === false)
                t.start(), $(this).val("Stop");
            else
                t.pause(), $(this).val("Start");
        });
        $("#run-nextArray").on("click", function () {
            t.nextStep(), $("#run-check").val("Start");
        });
		$(".ca_tools .check").each(function () {
			var self = $(this) , val = t.getOption( self.data("fn") );
			val === true ? self.attr("checked","checked") : self.removeAttr("checked");
			
		});
		$(".ca_tools .check").on("click",function () {
			var self = $(this);
			t.setOption( self.data("fn") , self.attr("checked") );
		});
        $("#set-val-4").on("click", function () {t.setV(4); });
        $("#set-val-3").on("click", function () {t.setV(3); });
        $("#set-val-2").on("click", function () {t.setV(2); });
        $("#set-val-1").on("click", function () {t.setV(1); });
        $("#set-val-rnd").on("click", function () {t.setRandom(); });
    });
})(window, jQuery);
