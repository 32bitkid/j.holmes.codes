---
layout: "@layouts/blog.astro"
title: React-like DOM construction in 8 lines.
notes: >-
  I think this should get reworked into a helper that can generate
---

## TL;DR

{% code Ugly as balls DOM construction. lang:js %}
var $text = document.createTextNode.bind(document);
var $comment = document.createComment.bind(document);
var $el = function(tag, attrs, c) {
  var el = document.createElement(tag), key, i, len = c && c.length;
  for (key in attrs) if(attrs.hasOwnProperty(key)) el.setAttribute(key, attrs[key]);
  for (i=0; i<len; i++) el.appendChild(c[i]);
  return el;
};
{% endcode %}

## Usage

A lot of people recommend using [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) when creating [React](https://facebook.github.io/react/) components. I think thats a good recommendation, especially if you have designers mucking around in your components. However, I find the declative syntax of [`React.createElement`](https://facebook.github.io/react/docs/top-level-api.html#react.createelement) to be quite pleasant to work with.

This is a minimalistic implementation of similar syntax; simple, terse DOM construction in JavaScript.

{% code See what I mean? lang:js %}
var el = $el('div', {'class': 'foo bar'}, [
  $el('h1', null, [ $text('Hello World') ]),
  $text('Lorem ipsum dolor sit amet!')
]);

document.body.appendChild(el);
{% endcode %}

Will create the following DOM:

{% code The resulting DOM. lang:html %}
<div class='foo bar'>
  <h1>Hello World</h1>
  Lorem ipsum dolor sit amet!
</div>
{% endcode %}

It makes simple work of transforming lists into DOM using `.map()`.

{% code It's just JS code. lang:js %}
var data = [...];

function renderItem(item) {
  return $el('div', { 'id': item.id }, [$text(item.name)])
};

var elements = data.map(renderItem);
var results = $el('div', { 'class': 'result' }, elements);
{% endcode %}

## Good for what?

Mostly, I've used this when I need to quickly generate some dynamic DOM where a full-fleged templating engine feels like overkill.

I've used this little function in a few [CodePen](http://codepen.io) prototypes and sketches. Most recently, I've used it for defining [Knockout Components](http://knockoutjs.com/documentation/component-registration.html). <q class='aside'>`Ko` component templates can be document fragments or array of DOM nodes.</q> It's worked pretty smoothly so far; but will eventually be replaced with a proper templating engine.

Lastly, sometimes `string` concatting and finally injecting/parsing--like [Handlebars](http://handlebarsjs.com/)--feels a little obtuse for the type of transformations I want to do.

## Enhancements

If we aren't worried about code golf, there are a few enhancement that I normally use

### Assume text-like

### Supporting Namespaces (XML)
