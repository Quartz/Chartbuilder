// Avoid `console` errors in browsers that lack a console.
if (!(window.console && console.log)) {
    (function() {
        var noop = function() {};
        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
        var length = methods.length;
        var console = window.console = {};
        while (length--) {
            console[methods[length]] = noop;
        }
    }());
}

/**
 * Really Simple Color Picker in jQuery
 *
 * Licensed under the MIT (MIT-LICENSE.txt) licenses.
 *
 * Copyright (c) 2008-2012
 * Lakshan Perera (www.laktek.com) & Daniel Lacy (daniellacy.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */(function(a){var b,c,d=0,e={control:a('<div class="colorPicker-picker">&nbsp;</div>'),palette:a('<div id="colorPicker_palette" class="colorPicker-palette" />'),swatch:a('<div class="colorPicker-swatch">&nbsp;</div>'),hexLabel:a('<label for="colorPicker_hex">Hex</label>'),hexField:a('<input type="text" id="colorPicker_hex" />')},f="transparent",g;a.fn.colorPicker=function(b){return this.each(function(){var c=a(this),g=a.extend({},a.fn.colorPicker.defaults,b),h=a.fn.colorPicker.toHex(c.val().length>0?c.val():g.pickerDefault),i=e.control.clone(),j=e.palette.clone().attr("id","colorPicker_palette-"+d),k=e.hexLabel.clone(),l=e.hexField.clone(),m=j[0].id,n;a.each(g.colors,function(b){n=e.swatch.clone(),g.colors[b]===f?(n.addClass(f).text("X"),a.fn.colorPicker.bindPalette(l,n,f)):(n.css("background-color","#"+this),a.fn.colorPicker.bindPalette(l,n)),n.appendTo(j)}),k.attr("for","colorPicker_hex-"+d),l.attr({id:"colorPicker_hex-"+d,value:h}),l.bind("keydown",function(b){if(b.keyCode===13){var d=a.fn.colorPicker.toHex(a(this).val());a.fn.colorPicker.changeColor(d?d:c.val())}b.keyCode===27&&a.fn.colorPicker.hidePalette()}),l.bind("keyup",function(b){var d=a.fn.colorPicker.toHex(a(b.target).val());a.fn.colorPicker.previewColor(d?d:c.val())}),a('<div class="colorPicker_hexWrap" />').append(k).appendTo(j),j.find(".colorPicker_hexWrap").append(l),a("body").append(j),j.hide(),i.css("background-color",h),i.bind("click",function(){c.is(":not(:disabled)")&&a.fn.colorPicker.togglePalette(a("#"+m),a(this))}),b&&b.onColorChange?i.data("onColorChange",b.onColorChange):i.data("onColorChange",function(){}),c.after(i),c.bind("change",function(){c.next(".colorPicker-picker").css("background-color",a.fn.colorPicker.toHex(a(this).val()))}),c.val(h).hide(),d++})},a.extend(!0,a.fn.colorPicker,{toHex:function(a){if(a.match(/[0-9A-F]{6}|[0-9A-F]{3}$/i))return a.charAt(0)==="#"?a:"#"+a;if(!a.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/))return!1;var b=[parseInt(RegExp.$1,10),parseInt(RegExp.$2,10),parseInt(RegExp.$3,10)],c=function(a){if(a.length<2)for(var b=0,c=2-a.length;b<c;b++)a="0"+a;return a};if(b.length===3){var d=c(b[0].toString(16)),e=c(b[1].toString(16)),f=c(b[2].toString(16));return"#"+d+e+f}},checkMouse:function(d,e){var f=c,g=a(d.target).parents("#"+f.attr("id")).length;if(d.target===a(f)[0]||d.target===b[0]||g>0)return;a.fn.colorPicker.hidePalette()},hidePalette:function(){a(document).unbind("mousedown",a.fn.colorPicker.checkMouse),a(".colorPicker-palette").hide()},showPalette:function(c){var d=b.prev("input").val();c.css({top:b.offset().top+b.outerHeight(),left:b.offset().left}),a("#color_value").val(d),c.show(),a(document).bind("mousedown",a.fn.colorPicker.checkMouse)},togglePalette:function(d,e){e&&(b=e),c=d,c.is(":visible")?a.fn.colorPicker.hidePalette():a.fn.colorPicker.showPalette(d)},changeColor:function(c){b.css("background-color",c),b.prev("input").val(c).change(),a.fn.colorPicker.hidePalette(),b.data("onColorChange").call(b,a(b).prev("input").attr("id"),c)},previewColor:function(a){b.css("background-color",a)},bindPalette:function(c,d,e){e=e?e:a.fn.colorPicker.toHex(d.css("background-color")),d.bind({click:function(b){g=e,a.fn.colorPicker.changeColor(e)},mouseover:function(b){g=c.val(),a(this).css("border-color","#598FEF"),c.val(e),a.fn.colorPicker.previewColor(e)},mouseout:function(d){a(this).css("border-color","#000"),c.val(b.css("background-color")),c.val(g),a.fn.colorPicker.previewColor(g)}})}}),a.fn.colorPicker.defaults={pickerDefault:"FFFFFF",colors:["000000","993300","333300","000080","333399","333333","800000","FF6600","808000","008000","008080","0000FF","666699","808080","FF0000","FF9900","99CC00","339966","33CCCC","3366FF","800080","999999","FF00FF","FFCC00","FFFF00","00FF00","00FFFF","00CCFF","993366","C0C0C0","FF99CC","FFCC99","FFFF99","CCFFFF","99CCFF","FFFFFF"],addColors:[]}})(jQuery);


/**
 * jQuery-csv (jQuery Plugin)
 * version: 0.71 (2012-11-19)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Acknowledgements:
 * The original design and influence to implement this library as a jquery
 * plugin is influenced by jquery-json (http://code.google.com/p/jquery-json/).
 * If you're looking to use native JSON.Stringify but want additional backwards
 * compatibility for browsers that don't support it, I highly recommend you
 * check it out.
 *
 * A special thanks goes out to rwk@acm.org for providing a lot of valuable
 * feedback to the project including the core for the new FSM
 * (Finite State Machine) parsers. If you're looking for a stable TSV parser
 * be sure to take a look at jquery-tsv (http://code.google.com/p/jquery-tsv/).
 
 * For legal purposes I'll include the "NO WARRANTY EXPRESSED OR IMPLIED.
 * USE AT YOUR OWN RISK.". Which, in 'layman's terms' means, by using this
 * library you are accepting responsibility if it breaks your code.
 *
 * Legal jargon aside, I will do my best to provide a useful and stable core
 * that can effectively be built on.
 *
 * Copyrighted 2012 by Evan Plaice.
 */

RegExp.escape=function(b){return b.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")};
(function(b){b.csv={defaults:{separator:",",delimiter:'"',headers:!0},hooks:{castToScalar:function(f,a){if(isNaN(f))return f;if(/\./.test(f))return parseFloat(f);var e=parseInt(f);return isNaN(e)?null:e}},parsers:{parse:function(f,a){function e(){m=0;h="";if(a.start&&a.state.rowNum<a.start)d=[];else{if(void 0===a.onParseEntry)g.push(d);else{var c=a.onParseEntry(d,a.state);!1!==c&&g.push(c)}d=[];a.end&&a.state.rowNum>=a.end&&(p=!0)}a.state.rowNum++;a.state.colNum=1}function c(){if(void 0===a.onParseValue)d.push(h);
else{var c=a.onParseValue(h,a.state);!1!==c&&d.push(c)}h="";m=0;a.state.colNum++}var b=a.separator,l=a.delimiter;a.state.rowNum||(a.state.rowNum=1);a.state.colNum||(a.state.colNum=1);var g=[],d=[],m=0,h="",p=!1,n=RegExp.escape(b),r=RegExp.escape(l),q=/(D|S|\n|\r|[^DS\r\n]+)/,q=q.source,q=q.replace(/S/g,n),q=q.replace(/D/g,r),q=RegExp(q,"gm");f.replace(q,function(d){if(!p)switch(m){case 0:if(d===b){h+="";c();break}if(d===l){m=1;break}if("\n"===d){c();e();break}if(/^\r$/.test(d))break;h+=d;m=3;break;
case 1:if(d===l){m=2;break}h+=d;m=1;break;case 2:if(d===l){h+=d;m=1;break}if(d===b){c();break}if("\n"===d){c();e();break}if(/^\r$/.test(d))break;throw Error("CSVDataError: Illegal State [Row:"+a.state.rowNum+"][Col:"+a.state.colNum+"]");case 3:if(d===b){c();break}if("\n"===d){c();e();break}if(/^\r$/.test(d))break;if(d===l)throw Error("CSVDataError: Illegal Quote [Row:"+a.state.rowNum+"][Col:"+a.state.colNum+"]");throw Error("CSVDataError: Illegal Data [Row:"+a.state.rowNum+"][Col:"+a.state.colNum+
"]");default:throw Error("CSVDataError: Unknown State [Row:"+a.state.rowNum+"][Col:"+a.state.colNum+"]");}});0!==d.length&&(c(),e());return g},splitLines:function(b,a){function e(){g=0;if(a.start&&a.state.rowNum<a.start)d="";else{if(void 0===a.onParseEntry)l.push(d);else{var c=a.onParseEntry(d,a.state);!1!==c&&l.push(c)}d="";a.end&&a.state.rowNum>=a.end&&(m=!0)}a.state.rowNum++}var c=a.separator,k=a.delimiter;a.state.rowNum||(a.state.rowNum=1);var l=[],g=0,d="",m=!1,h=RegExp.escape(c),p=RegExp.escape(k),
n=/(D|S|\n|\r|[^DS\r\n]+)/,n=n.source,n=n.replace(/S/g,h),n=n.replace(/D/g,p),n=RegExp(n,"gm");b.replace(n,function(b){if(!m)switch(g){case 0:if(b===c){d+=b;g=0;break}if(b===k){d+=b;g=1;break}if("\n"===b){e();break}if(/^\r$/.test(b))break;d+=b;g=3;break;case 1:if(b===k){d+=b;g=2;break}d+=b;g=1;break;case 2:var n=d.substr(d.length-1);if(b===k&&n===k){d+=b;g=1;break}if(b===c){d+=b;g=0;break}if("\n"===b){e();break}if("\r"===b)break;throw Error("CSVDataError: Illegal state [Row:"+a.state.rowNum+"]");
case 3:if(b===c){d+=b;g=0;break}if("\n"===b){e();break}if("\r"===b)break;if(b===k)throw Error("CSVDataError: Illegal quote [Row:"+a.state.rowNum+"]");throw Error("CSVDataError: Illegal state [Row:"+a.state.rowNum+"]");default:throw Error("CSVDataError: Unknown state [Row:"+a.state.rowNum+"]");}});""!==d&&e();return l},parseEntry:function(b,a){function e(){if(void 0===a.onParseValue)l.push(d);else{var c=a.onParseValue(d,a.state);!1!==c&&l.push(c)}d="";g=0;a.state.colNum++}var c=a.separator,k=a.delimiter;
a.state.rowNum||(a.state.rowNum=1);a.state.colNum||(a.state.colNum=1);var l=[],g=0,d="";if(!a.match){var m=RegExp.escape(c),h=RegExp.escape(k),p=/(D|S|\n|\r|[^DS\r\n]+)/.source,p=p.replace(/S/g,m),p=p.replace(/D/g,h);a.match=RegExp(p,"gm")}b.replace(a.match,function(b){switch(g){case 0:if(b===c){d+="";e();break}if(b===k){g=1;break}if("\n"===b||"\r"===b)break;d+=b;g=3;break;case 1:if(b===k){g=2;break}d+=b;g=1;break;case 2:if(b===k){d+=b;g=1;break}if(b===c){e();break}if("\n"===b||"\r"===b)break;throw Error("CSVDataError: Illegal State [Row:"+
a.state.rowNum+"][Col:"+a.state.colNum+"]");case 3:if(b===c){e();break}if("\n"===b||"\r"===b)break;if(b===k)throw Error("CSVDataError: Illegal Quote [Row:"+a.state.rowNum+"][Col:"+a.state.colNum+"]");throw Error("CSVDataError: Illegal Data [Row:"+a.state.rowNum+"][Col:"+a.state.colNum+"]");default:throw Error("CSVDataError: Unknown State [Row:"+a.state.rowNum+"][Col:"+a.state.colNum+"]");}});e();return l}},toArray:function(f,a,e){a=void 0!==a?a:{};var c={};c.callback=void 0!==e&&"function"===typeof e?
e:!1;c.separator="separator"in a?a.separator:b.csv.defaults.separator;c.delimiter="delimiter"in a?a.delimiter:b.csv.defaults.delimiter;a={delimiter:c.delimiter,separator:c.separator,onParseEntry:a.onParseEntry,onParseValue:a.onParseValue,state:void 0!==a.state?a.state:{}};f=b.csv.parsers.parseEntry(f,a);if(c.callback)c.callback("",f);else return f},toArrays:function(f,a,e){a=void 0!==a?a:{};var c={};c.callback=void 0!==e&&"function"===typeof e?e:!1;c.separator="separator"in a?a.separator:b.csv.defaults.separator;
c.delimiter="delimiter"in a?a.delimiter:b.csv.defaults.delimiter;e=[];a={delimiter:c.delimiter,separator:c.separator,onParseEntry:a.onParseEntry,onParseValue:a.onParseValue,start:a.start,end:a.end,state:{rowNum:1,colNum:1}};e=b.csv.parsers.parse(f,a);if(c.callback)c.callback("",e);else return e},toObjects:function(f,a,e){a=void 0!==a?a:{};var c={};c.callback=void 0!==e&&"function"===typeof e?e:!1;c.separator="separator"in a?a.separator:b.csv.defaults.separator;c.delimiter="delimiter"in a?a.delimiter:
b.csv.defaults.delimiter;c.headers="headers"in a?a.headers:b.csv.defaults.headers;a.start="start"in a?a.start:1;c.headers&&a.start++;a.end&&c.headers&&a.end++;var k=[];e=[];a={delimiter:c.delimiter,separator:c.separator,onParseEntry:a.onParseEntry,onParseValue:a.onParseValue,start:a.start,end:a.end,state:{rowNum:1,colNum:1},match:!1};var k=b.csv.parsers.splitLines(f,{delimiter:c.delimiter,separator:c.separator,start:1,end:1,state:{rowNum:1,colNum:1}}),l=b.csv.toArray(k[0],a),k=b.csv.parsers.splitLines(f,
a);a.state.colNum=1;a.state.rowNum=l?2:1;f=0;for(var g=k.length;f<g;f++){var d=b.csv.toArray(k[f],a),m={},h;for(h in l)m[l[h]]=d[h];e.push(m);a.state.rowNum++}if(c.callback)c.callback("",e);else return e},fromArrays:function(f,a,e){a=void 0!==a?a:{};var c={};c.callback=void 0!==e&&"function"===typeof e?e:!1;c.separator="separator"in a?a.separator:b.csv.defaults.separator;c.delimiter="delimiter"in a?a.delimiter:b.csv.defaults.delimiter;c.escaper="escaper"in a?a.escaper:b.csv.defaults.escaper;c.experimental=
"experimental"in a?a.experimental:!1;if(!c.experimental)throw Error("not implemented");a=[];for(i in f)a.push(f[i]);if(c.callback)c.callback("",a);else return a},fromObjects2CSV:function(f,a,e){a=void 0!==a?a:{};var c={};c.callback=void 0!==e&&"function"===typeof e?e:!1;c.separator="separator"in a?a.separator:b.csv.defaults.separator;c.delimiter="delimiter"in a?a.delimiter:b.csv.defaults.delimiter;c.experimental="experimental"in a?a.experimental:!1;if(!c.experimental)throw Error("not implemented");
a=[];for(i in f)a.push(arrays[i]);if(c.callback)c.callback("",a);else return a}};b.csvEntry2Array=b.csv.toArray;b.csv2Array=b.csv.toArrays;b.csv2Dictionary=b.csv.toObjects})(jQuery);