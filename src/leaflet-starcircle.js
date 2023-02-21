/*
 * @example
 *
 * ```js
 * L.Circle([50.5, 30.5], {radius: 200, star: 5}).addTo(map);
 * L.CircleMarker([50.5, 30.5], {radius: 200, star: 5}).addTo(map);
 * ```
 */

L.CircleMarker.include({
  initialize: function (latlng, options) {
    L.Util.setOptions(this, options);
    this._latlng = L.latLng(latlng);
    this._radius = this.options.radius;
    this._star = this.options.star;
  },

  // @method setStar(star: Number): this
  // Sets the n-star of a star-marker.
  setStar: function (star) {
    this._star = star;
    return this.redraw();
  },

  // @method getStar(): Number
  // Returns the current n-star of a star-marker.
  getStar: function () {
    return this._star;
  },

  setStyle: function (options) {
    var radius = (options && options.radius) || this._radius;
    var star = (options && options.star) || this._star;
    L.Path.prototype.setStyle.call(this, options);
    this.setRadius(radius);
    this.setStar(star);
    return this;
  },
});

L.Circle.include({
  initialize: function (latlng, options, legacyOptions) {
    if (typeof options === "number") {
      // Backwards compatibility with 0.7.x factory (latlng, radius, options?)
      options = L.Util.extend({}, legacyOptions, { radius: options });
    }
    L.Util.setOptions(this, options);
    this._latlng = L.latLng(latlng);

    if (isNaN(this.options.radius)) {
      throw new Error("Circle radius cannot be NaN");
    }

    // @section
    // @aka Circle options
    // @option radius: Number; Radius of the circle, in meters.
    this._mRadius = this.options.radius;
    this._star = this.options.star;
  },

  // @method setStar(star: Number): this
  // Sets the n-star of a star-marker.
  setStar: function (star) {
    this._star = star;
    return this.redraw();
  },

  // @method getStar(): Number
  // Returns the current n-star of a star-marker.
  getStar: function () {
    return this._star;
  },

  setStyle: L.CircleMarker.prototype.setStyle,
});

function polarPoint(x, y, rad, r) {
  return { x: x + Math.cos(rad) * r, y: y + Math.sin(rad) * r };
}

function createStar(n, x, y, radius, radOffset = 0) {
  var verts = [];
  if (n > 2) {
    if (n < 5) {
      for (var k = 0; k < n; k++) {
        verts.push(polarPoint(x, y, (2 * k * Math.PI) / n + radOffset, radius));
      }
    } else {
      var lineN = Math.round(0.375 * n); // draw line1 gap lineN corners                                                 Math.round((3 / 8) * n)
      var rad1 = Math.PI / 2 - (lineN / n) * Math.PI; // intersect angle's rad between line1 & radius                    (Math.PI - (lineN / n) * (2 * Math.PI)) / 2
      var rad2 = Math.PI / n; // intersect angle's rad between line2 (connect center & line-intersect point) & radius    2 * Math.PI / (2 * n)
      var rad3 = Math.PI - rad1 - rad2;
      var radius2 = (Math.sin(rad1) * radius) / Math.sin(rad3); // law of sines                                          (Math.sin(rad1) * radius) / Math.sin(rad3)
      for (var j = 0; j < 2 * n; j++) {
        verts.push(polarPoint(x, y, (j * Math.PI) / n + radOffset, j % 2 === 0 ? radius : radius2));
      }
    }
  }
  return verts;
}

L.SVG.include({
  _updateDonut: function (layer) {
    var p = layer._point,
      r = Math.max(Math.round(layer._radius), 1),
      r2 = Math.max(Math.round(layer._radiusY), 1) || r,
      arc = "a" + r + "," + r2 + " 0 1,0 ";

    var innerP = layer._innerPoint,
      innerR = Math.max(Math.round(layer._innerRadius), 1),
      innerR2 = Math.max(Math.round(layer._innerRadiusY), 1) || innerR,
      innerArc = "a" + innerR + "," + innerR2 + " 0 1,0 ";

    // drawing a circle with hole with two half-arcs
    var d;
    if (layer._empty()) {
      d = "M0 0";
    } else {
      d = "M" + (p.x - r) + "," + p.y + arc + r * 2 + ",0 " + arc + -r * 2 + ",0 ";
      d += "M" + (innerP.x - innerR) + "," + innerP.y + innerArc + innerR * 2 + ",0 " + innerArc + -innerR * 2 + ",0 ";
    }
    this._setPath(layer, d);
  },
});

L.Canvas.include({
  _updateCircle: function (layer) {
    if (!this._drawing || layer._empty()) {
      return;
    }

    var p = layer._point,
      ctx = this._ctx;
    ctx.beginPath();

    if (layer._star > 2) {
      var verts = createStar(layer._star, layer._point.x, layer._point.y, layer._radius),
        j;
      for (j = 0; j < verts.length; j++) {
        p = verts[j];
        ctx[j ? "lineTo" : "moveTo"](p.x, p.y);
      }
      ctx.closePath();
    } else {
      var r = Math.max(Math.round(layer._radius), 1),
        s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

      if (s !== 1) {
        ctx.save();
        ctx.scale(1, s);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

      if (s !== 1) {
        ctx.restore();
      }
    }
    this._fillStroke(ctx, layer);
  },
});

L.SVG.include({
  _updateCircle: function (layer) {
    var p = layer._point,
      r = Math.max(Math.round(layer._radius), 1);
    if (layer._star > 2) {
      this._setPath(layer, L.SVG.pointsToPath([createStar(layer._star, layer._point.x, layer._point.y, r)], true));
    } else {
      var r2 = Math.max(Math.round(layer._radiusY), 1) || r,
        arc = "a" + r + "," + r2 + " 0 1,0 ";

      // drawing a circle with two half-arcs
      var d = layer._empty() ? "M0 0" : "M" + (p.x - r) + "," + p.y + arc + r * 2 + ",0 " + arc + -r * 2 + ",0 ";

      this._setPath(layer, d);
    }
  },
});
