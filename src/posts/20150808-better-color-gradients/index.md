---
title: Better Color Gradients with HSLuv
date: 2015-08-08 19:23:18
tags:
  - css
  - color-theory
---
Color is tricky! It's often more complicated than I expect; when I underestimate it, I usually end up taking a dive down into some serious color theory and math. Let's take a closer look at an interesting challenge when generating color ramps and gradients.

<!-- more -->
***

CSS3 introduced the [`linear-gradient()`](https://drafts.csswg.org/css-images-3/#linear-gradients) function that lets you create a smooth transition between multiple colors. It makes it easy to pop a gradient here and there in CSS. For example:

[[figure|A simple gradient from yellow to red.]]
| ```css
| .el { background-image: linear-gradient(90deg, yellow, red); }
| ```

[[figure|The resulting gradient rendered by your browser.]]
| <div class="gradient gradient--simple"></div>

A simple gradient from yellow to red. Neat! And it's all <span class="sic">grape</span>!

## Except&hellip;

The `linear-gradient()` function uses a simple [RGB](https://en.wikipedia.org/wiki/RGB_color_space) interpolation to blend between colors. It's super fast, but it can create less than ideal mix of colors. Especially when the two colors are on the *opposite side* of the color wheel from each other. Consider:

[[figure|A simple gradient from yellow to red.]]
| ```css
| .el { background-image: linear-gradient(90deg, yellow, blue); }
| ```

Which looks a little like this:

[[figure|Yikes, that's a gradient alright!]]
| <div class="gradient gradient--rgb"></div>

This might *not* be what you expect. Depending on what you are doing, you might be asking yourself, <q>What's up with that weird color in the middle?!</q>

Let's take a closer look at the math that causes this.

## Mixing in RGB space

The color mixing algorithm breaks down the start and end color into its red, green and blue color components and mixes them.

First let's break down the colors:

[[figure|Color Breakdown class:text-table]]
| | CSS Color | Hex | Red | Green | Blue |
| |-:|:-:|:-:|:-:|:-:|
| | `yellow` | `#FFFF00` | 255 | 255 | 0 |
| | `blue` | `#0000FF` | 0 | 0 | 255 |

Then, we can define a simple linear tween:

[[figure|A simple linear tween generator]]
| ```js
| const linearTween = (start, stop) => (i) => (stop-start) * i + start;
| ```

Now, look what happens when we get to the halfway point:

[[figure|What happens at 50%?]]
| ```js
| var red = linearTween(255, 0);
| var green = linearTween(255, 0);
| var blue = linearTween(0, 255);
|
| red(0.5)   | 0;  // 127
| green(0.5) | 0;  // 127
| blue(0.5)  | 0;  // 127
| ```

We get a nice middle gray. Yummy&hellip;

## So, how can we fix it?

While there is no way define a different color interpolation algorithm for `linear-gradient()`, but we can come with bit of a compromise.

Instead of using linear RGB component tweens, we can use another color space. Then sample the output of this other algorithm, and feed *that* into our RGB tween and get similar results.

Let's try [HSL](https://en.wikipedia.org/wiki/HSL_and_HSV). HSL is a cylindrical-coordinate system for defining color. It's composed of three parts:

* Hue
* Saturation
* and Lightness.

Hue is usually represented as degrees; Saturation and Lightness as percentages. Let's turn our target colors into HSL rather than RGB:

[[figure|Converting our colors to HSL. class:text-table]]
| | CSS Color | Hue | Saturation | Lightness |
| |-:|:-:|:-:|:-:|
| | `yellow` | 60&deg; | 100% | 50% |
| | `blue` | 240&deg; | 100% | 50% |

Now, to interpolate between those two color, we need to make a new kind of tween. We need a *circular tween*:

[[figure|A circular tween in degrees. Takes the shortest path between two angles.]]
| ```js
| var circularTween = (function() {
|   var dtor = (d) => d * Math.PI / 180; // degrees => radians
|   var rtod = (r) => r * 180 / Math.PI; // radians => degrees
|
|   return (start, stop) => {
|     start = dtor(start);
|     stop = dtor(stop);
|     var delta = Math.atan2(Math.sin(stop - start), Math.cos(stop - start));
|     return (i) => (rtod(start + delta * i) + 360) % 360;
|   };
| })();
| ```

Now, let's tween it up. I'm going to generate seven stops in my tween, and use [tinycolor.js](http://bgrins.github.io/TinyColor/) to convert from HSL back into hex colors:

[[figure|Tween between yellow and blue, using HSL]]
| ```js
| var h = circularTween(60, 240);
| var s = linearTween(1, 1);
| var l = linearTween(0.5, 0.5);
|
| for(var i = 0; i < 7 ; i++) {
|     console.log(tinycolor({
|         h: h(i/6),
|         s: s(i/6),
|         l: l(i/6)
|     }).toHexString());
| }
| ```

And here is what we get out:

[[figure|The resulting generated colors.]]
| ```text
| > #ffff00
| > #ff7f00
| > #ff0000
| > #ff0080
| > #ff00ff
| > #7f00ff
| > #0000ff
| ```

Now, let's plug those into a `linear-gradient()`; this will linearly interpolate between the stops, but will be closer to a *true* HSL interpolation.

[[figure|An approximation of a HSL gradient using multiple color stops.]]
| ```css
| .el {
|   background: linear-gradient(
|     90deg,
|     #ffff00, #ff7f00, #ff0000, #ff0080, #ff00ff, #7f00ff, #0000ff
|   );
| }
| ```
|
| <div class="gradient gradient--hsl"></div>

Well, we don't get that weird gray anymore, but it's a little &hellip; colorful.

---

## But, we can do even better!

You may be tempted to stop here and move on, after all you can define [`hsl()` colors](https://drafts.csswg.org/css-color-3/#hsl-color) directly in CSS. But there is still some room for improvement.

HSL doesn't take into account the perceptual brightness of a color. Greens *look* brighter than blues, even though they have the same Saturation and Lightness. [Other](https://en.wikipedia.org/wiki/Lab_color_space) [color](https://en.wikipedia.org/wiki/CIE_1931_color_space) [spaces](https://en.wikipedia.org/wiki/CIELUV) have attempted to account for human perception in their color model. But they are complicated&hellip; But let's use [HSLuv](http://www.hsluv.org/) instead!

HSLuv is a self described as <q cite="http://www.hsluv.org/">&hellip;a human-friendly alternative to HSL.</q>

It does a better job of maintaining perceptual brightness between relative hues&hellip; Let's rerun our tween, but instead of HSL we'll use HSLuv.

[[figure|Tween between yellow and blue, using HSLuv. No cheating this time.]]
| ```js
| var start = hexToHsluv("#FFFF00");
| var end = hexToHsluv("#0000FF");
|
| var h = circularTween(start[0], end[0]);
| var s = linearTween(start[1], end[1]);
| var l = linearTween(start[2], end[2]);
|
| for(var i = 0; i < 7 ; i++) {
|     console.log(hsluvToHex(h(i/6), s(i/6), l(i/6)));
| }
| ```

And here is what we get out:

[[figure|The resulting generated colors.]]
| ```text
| > #ffff00
| > #8df100
| > #00d48a
| > #00b09f
| > #008f9b
| > #006d97
| > #0000ff
| ```

Quick, let's make a gradient!

[[figure|An approximation of a HSLuv gradient using multiple color stops.]]
| ```css
| .el {
|   background: linear-gradient(
|     90deg,
|     #ffff00, #8df100, #00d48a, #00b09f, #008f9b, #006d97, #0000ff
|   );
| }
| ```
|
| <div class="gradient gradient--hsluv"></div>

A little smoother; and doesn't have a bright peak at cyan! I'm going to call that a win!

## Wrapping up

Remember, a simple linear color gradient might not be the best choice for what you are trying to make.

[[figure|Let's compare: RGB, HSL, HSLuv.]]
| <div class="gradient gradient--rgb gradient--summary">RGB gradient</div>
| <div class="gradient gradient--hsl gradient--summary">HSL gradient</div>
| <div class="gradient gradient--hsluv gradient--summary">HSLuv gradient</div>

<style>
  .gradient {
    height: 4rem;
    box-sizing: border-box;
  }
  .gradient--simple { background-image: linear-gradient(90deg, yellow, red); }
  .gradient--rgb { background-image: linear-gradient(90deg, yellow, blue); }
  .gradient--hsl { background: linear-gradient(90deg, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #007fff, #0000ff); }
  .gradient--hsluv { background: linear-gradient(90deg, #ffff00, #8df100, #00d48a, #00b09f, #008f9b, #006d97, #0000ff); }
  .gradient--summary { padding: 0.5rem 1rem; color: rgba(0, 0, 0, 0.5); }
</style>
