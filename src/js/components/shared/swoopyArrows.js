// https://github.com/bizweekgraphics/swoopyarrows

var d3 = require("d3");

function swoopyArrow() {

  var angle = Math.PI,
      clockwise = true,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; };

  function render(data) {

    data = data.map(function(d, i) {
      return [xValue.call(data, d, i), yValue.call(data, d, i)];
    });

    // get the chord length ("height" {h}) between points
    var h = hypotenuse(data[1][0]-data[0][0], data[1][1]-data[0][1])

    // get the distance at which chord of height h subtends {angle} radians
    var d = h / ( 2 * Math.tan(angle / 2) );

    // get the radius {r} of the circumscribed circle
    var r = hypotenuse(d, h/2)

    /*
    SECOND, compose the corresponding SVG arc.
      read up: http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
      example: <path d = "M 200,50 a 50,50 0 0,1 100,0"/>
                          M 200,50                          Moves pen to (200,50);
                                   a                        draws elliptical arc;
                                     50,50                  following a degenerate ellipse, r1 == r2 == 50;
                                                            i.e. a circle of radius 50;
                                           0                with no x-axis-rotation (irrelevant for circles);
                                             0,1            with large-axis-flag=0 and sweep-flag=1 (clockwise);
                                                 100,0      to a point +100 in x and +0 in y, i.e. (300,50).
    */
    var path =  "M " + data[0][0] + "," + data[0][1]
         + " a " + r + "," + r
         + " 0 0," + (clockwise ? "1" : "0") + " "
         + (data[1][0]-data[0][0]) + "," + (data[1][1]-data[0][1]);

    return path
  }

  function hypotenuse(a, b) {
    return Math.sqrt( Math.pow(a,2) + Math.pow(b,2) );
  }

  render.angle = function(_) {
    if (!arguments.length) return angle;
    angle = Math.min(Math.max(_, 1e-6), Math.PI-1e-6);
    return render;
  };

  render.clockwise = function(_) {
    if (!arguments.length) return clockwise;
    clockwise = !!_;
    return render;
  };

  render.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return render;
  };

  render.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return render;
  };

  return render;
}
function loopyArrow() {

  var steps = 30,
      radius = 20,
      interpolate = 'basis',
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; };

  function render(data) {

    if(data.length < 2) return;

    data = data.map(function(d, i) {
      return [xValue.call(data, d, i), yValue.call(data, d, i)];
    });

    var line = d3.svg.line().interpolate(interpolate);

    var points = [];

    points.push(data[0]);
    data.slice(1).forEach(function(d1,i) {
      var d0 = data[i];
      d3.range(steps).slice(1).forEach(function(numerator) {
        var cx = d0[0] + (numerator/steps) * (d1[0]-d0[0]);
        var cy = d0[1] + (numerator/steps) * (d1[1]-d0[1]);

        if(numerator < steps-1) {
          cx += radius * Math.sin(numerator);
          cy += radius * Math.cos(numerator);
        }

        points.push([cx, cy]);
      });
    });
    points.push(data[data.length-1]);

    return line(points);

  }

  render.steps = function(_) {
    if (!arguments.length) return steps;
    steps = _;
    return render;
  }

  render.radius = function(_) {
    if (!arguments.length) return radius;
    radius = _;
    return render;
  }

  render.interpolate = function(_) {
    if (!arguments.length) return interpolate;
    interpolate = _;
    return render;
  }

  render.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return render;
  };

  render.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return render;
  };

  return render;

}
function kookyArrow() {

  var steps = 5,
      mean = 0,
      deviation = 100,
      interpolate = 'basis',
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; };

  function render(data) {

    if(data.length < 2) return;

    data = data.map(function(d, i) {
      return [xValue.call(data, d, i), yValue.call(data, d, i)];
    });

    var rng = d3.random.normal(mean, deviation);
    var line = d3.svg.line().interpolate(interpolate);

    var points = [];

    points.push(data[0]);
    data.slice(1).forEach(function(d1,i) {
      var d0 = data[i];
      d3.range(steps).slice(1).forEach(function(numerator) {
        var cx = d0[0] + (numerator/steps) * (d1[0]-d0[0]);
        var cy = d0[1] + (numerator/steps) * (d1[1]-d0[1]);

        if(numerator < steps-1) {
          cx += rng();
          cy += rng();
        }

        points.push([cx, cy])
      })
    });
    points.push(data[data.length-1]);

    return line(points);

  }

  render.steps = function(_) {
    if (!arguments.length) return steps;
    steps = _;
    return render;
  }

  render.deviation = function(_) {
    if (!arguments.length) return deviation;
    deviation = _;
    return render;
  }

  render.interpolate = function(_) {
    if (!arguments.length) return interpolate;
    interpolate = _;
    return render;
  }

  render.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return render;
  };

  render.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return render;
  };

  return render;

}

module.exports = {
  swoopy: swoopyArrow,
  kooky: kookyArrow,
  loopy: loopyArrow
}