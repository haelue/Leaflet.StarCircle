# L.StarCircle

Makes it possible to draw n-corner-star (including triangle, square) with `L.CircleMarker` & `L.Circle` on Leaflet maps. 

It modified `L.CircleMarker` & `L.Circle` with an option [star: number].

The reason WHY I modify it instead of extend it, is because my project need to edit these elements by L.Editable, and that troubles me. if you want extend it, just type base on my code.

![star-circle](./star-circle.png)


```js
var mapCenter = map.getCenter();
var star1 = L.circleMarker(mapCenter,{
    radius: 50,
    star: 3,
}).addTo(map);

var star2 = L.circle(L.latLng(mapCenter.lat, mapCenter.lng - 0.05), {
    radius: 500,
    star: 4,
}).addTo(map);

var star3 = L.circleMarker(L.latLng(mapCenter.lat, mapCenter.lng + 0.05), {
    radius: 60,
    star: 5,
}).addTo(map);
```

## Installation

Download **leaflet-starcircle.js** and include them in your project.

With script node:
```html
<script src="./leaflet-starcircle.js"></script>
```

With esm import:
```js
import "./leaflet-starcircle.js"
```

## Options:

| Option                              | Description                                                                               |
| :---------------------------------- | :---------------------------------------------------------------------------------------- |
| star                                | number of star corners. (<3: normal circle, 3: triangle, 4: square, >4:n-corner-star)     |