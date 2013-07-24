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
 * version: 0.64 (2012-10-06)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Acknowledgements:
 * This plugin was originally designed to assist in parsing CSV files loaded
 * from client-side javascript. It's influenced by jQuery.json and the original
 *
 * The original core RegEx comes directly from the following answer posted by a
 * StackOverflow.com user named Ridgerunner.
 * Source:
 * - http://stackoverflow.com/q/8493195/290340
 *
 * A special thanks goes out to rwk@acm.org for providing a lot of valuable
 * feedback to the project including the core for the new FSM
 * (Finite State Machine) parser. If you're looking for a stable TSV parser
 * take a look at jquery-tsv (http://code.google.com/p/jquery-tsv/).
 *
 * Experimental:
 * A new line splitting function has been added that can properly handle values
 * that contain newlines. To enable it, set the experimental parameter to true
 * in the options.

 * For legal purposes I'll include the "NO WARRANTY EXPRESSED OR IMPLIED.
 * USE AT YOUR OWN RISK.". Which, in 'layman's terms' means, by using this
 * library you are accepting responsibility if it breaks your code.
 *
 * Legal jargon aside, I will do my best to provide a useful and stable core
 * that can effectively be built on.
 *
 * Copyrighted 2012 by Evan Plaice.
 */

RegExp.escape=function(d){return d.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")};
(function(d){d.csv={defaults:{separator:",",delimiter:'"',escaper:'"',skip:0,headerLine:1,dataLine:2},hooks:{castToScalar:function(e){var a=/^[\d\.]+$/,c=/\./;if(e.length)if(isNaN(e))return e;else if(a.test(e))return c.test(e)?parseFloat(e):parseInt(e)}},splitLines:function(e){function a(){g.push(b);b="";c=0}var c=0,b="",g=[];e.replace(/(\"|\n|\r|[^\"\r\n]+)/gm,function(f){switch(c){case 0:if(f==='"')c=1;else if(f==="\n")a();else if(!/^\r$/.test(f)){if(b)throw Error("Illegal initial state");b=f;c=
3}break;case 1:if(f==='"')c=2;else{b+=f;c=1}break;case 2:if(f==='"'&&b.substr(b.length-1)==='"'){b+=f;c=1}else if(f===","){b+=f;c=0}else if(f==="\n")a();else if(f!=="\r")throw Error("Illegal state");break;case 3:if(m1==='"')throw Error("Unquoted delimiter found in string");else if(f==="\n")a();else if(f!=="\r")throw Error("Two values, no separator?");break;default:throw Error("Unknown state");}return""});c!=0&&a();return g},toArray:function(e,a,c){a=a!==undefined?a:{};var b={};b.callback=c!==undefined&&
typeof c==="function"?c:false;b.separator="separator"in a?RegExp.escape(a.separator):d.csv.defaults.separator;b.delimiter="delimiter"in a?RegExp.escape(a.delimiter):d.csv.defaults.delimiter;b.escaper="escaper"in a?RegExp.escape(a.escaper):d.csv.defaults.escaper;if(a.reValue===undefined){c=/(?!\s*$)\s*(?:Y([^YZ]*(?:ZY[^YZ]*)*)Y|([^XYZ\s]*(?:\s+[^XYZ\s]+)*))\s*(?:X|$)/;c=c.source;c=c.replace(/X/g,b.separator);c=c.replace(/Y/g,b.delimiter);c=c.replace(/Z/g,b.escaper);a.reValue=RegExp(c,"g")}if(a.reUnescape===
undefined){var g=/ED/;c=g.source;c=c.replace(/E/,b.escaper);c=c.replace(/D/,b.delimiter);a.reUnescape=RegExp(c,"g")}if(a.reEmptyLast===undefined){var f=/S\s*$/;a.reEmptyLast=RegExp(f.source.replace(/S/,b.separator))}if(e==="")if(b.callback)b.callback("",h);else return h;c=a.reValue;g=a.reUnescape;f=a.reEmptyLast;var h=[];e.replace(c,function(j,k,l){if(typeof k==="string"&&k.length){j=k.replace(g,b.delimiter);a.onParseValue===undefined?h.push(j):h.push(a.onParseValue(j))}else if(typeof k==="string"&&
k.length===0){j="";a.onParseValue===undefined?h.push(j):h.push(a.onParseValue(j))}else if(l!==undefined){j=l;a.onParseValue===undefined?h.push(j):h.push(a.onParseValue(j))}return""});f.test(e)&&h.push("");if(b.callback)b.callback("",h);else return h},toArrays:function(e,a,c){a=a!==undefined?a:{};var b={};b.callback=c!==undefined&&typeof c==="function"?c:false;b.separator="separator"in a?a.separator:d.csv.defaults.separator;b.delimiter="delimiter"in a?a.delimiter:d.csv.defaults.delimiter;b.escaper=
"escaper"in a?a.escaper:d.csv.defaults.escaper;b.skip="skip"in a?a.skip:d.csv.defaults.skip;b.experimental="experimental"in a?a.experimental:false;c=[];var g=[];a={delimiter:b.delimiter,separator:b.separator,escaper:b.escaper,onParseValue:a.onParseValue};c=b.experimental?d.csv.splitLines(e,b.delimiter):e.split(/\r\n|\r|\n/g);for(var f in c)if(!(f<b.skip)){e=d.csv.toArray(c[f],a);g.push(e)}if(b.callback)b.callback("",g);else return g},toObjects:function(e,a,c){a=a!==undefined?a:{};var b={};b.callback=
c!==undefined&&typeof c==="function"?c:false;b.separator="separator"in a?a.separator:d.csv.defaults.separator;b.delimiter="delimiter"in a?a.delimiter:d.csv.defaults.delimiter;b.escaper="escaper"in a?a.escaper:d.csv.defaults.escaper;b.headerLine="headerLine"in a?a.headerLine:d.csv.defaults.headerLine;b.dataLine="dataLine"in a?a.dataLine:d.csv.defaults.dataLine;b.experimental="experimental"in a?a.experimental:false;c=[];var g=[];a={delimiter:b.delimiter,separator:b.separator,escaper:b.escaper,onParseValue:a.onParseValue};
c=b.experimental?this.splitLines(e,b.delimiter):e.split(/\r\n|\r|\n/g);e=d.csv.toArray(c[b.headerLine-1]);for(var f in c)if(!(f<b.dataLine-1)){var h=d.csv.toArray(c[f],a),j={},k;for(k in e)j[e[k]]=h[k];g.push(j)}if(b.callback)b.callback("",g);else return g},fromArrays:function(e,a,c){a=a!==undefined?a:{};var b={};b.callback=c!==undefined&&typeof c==="function"?c:false;b.separator="separator"in a?a.separator:d.csv.defaults.separator;b.delimiter="delimiter"in a?a.delimiter:d.csv.defaults.delimiter;
b.escaper="escaper"in a?a.escaper:d.csv.defaults.escaper;b.experimental="experimental"in a?a.experimental:false;if(!b.experimental)throw Error("not implemented");a=[];for(i in e)a.push(e[i]);if(b.callback)b.callback("",a);else return a},fromObjects2CSV:function(e,a,c){a=a!==undefined?a:{};var b={};b.callback=c!==undefined&&typeof c==="function"?c:false;b.separator="separator"in a?a.separator:d.csv.defaults.separator;b.delimiter="delimiter"in a?a.delimiter:d.csv.defaults.delimiter;b.escaper="escaper"in
a?a.escaper:d.csv.defaults.escaper;b.experimental="experimental"in a?a.experimental:false;if(!b.experimental)throw Error("not implemented");a=[];for(i in e)a.push(arrays[i]);if(b.callback)b.callback("",a);else return a}};d.csvEntry2Array=d.csv.toArray;d.csv2Array=d.csv.toArrays;d.csv2Dictionary=d.csv.toObjects})(jQuery);


