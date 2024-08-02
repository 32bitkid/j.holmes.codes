---
title: React-like DOM construction in 8 lines.
authorDate: 2014-06-08
published: true
summary: >-
  Declarative, terse DOM construction; if you are a madman.
---

## TL;DR

```js
var $text = document.createTextNode.bind(document);
var $comment = document.createComment.bind(document);
var $html = function (tag, attrs, c) {
  var el = document.createElement(tag);
  for (var k in attrs) attrs.hasOwnProperty(k) && el.setAttribute(k, attrs[k]);
  for (var i = 0; i < (c ? c.length : 0); i++) el.appendChild(c[i]);
  return el;
};
```

## Usage

A lot of people recommend using [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) when creating [React](https://facebook.github.io/react/) components. I think that's a good recommendation, especially if you have designers mucking around in your components. However, I find the declarative syntax of [`React.createElement`](https://facebook.github.io/react/docs/top-level-api.html#react.createelement) to be quite pleasant to work with.

This is a minimalistic implementation of similar syntax; simple, terse DOM construction in JavaScript.

```js
var el = $html('div', { class: 'foo bar' }, [
  $html('h1', null, [$text('Hello World')]),
  $text('Lorem ipsum dolor sit amet!'),
]);

document.body.appendChild(el);
```

Will create the following DOM:

```html
<div class="foo bar">
  <h1>Hello World</h1>
  Lorem ipsum dolor sit amet!
</div>
```

It makes simple work of transforming lists into DOM using `.map()`.

```js
var data = [
  /*...*/
];

function renderItem(item) {
  return $html('div', { id: item.id }, [$text(item.name)]);
}

var results = $html('div', { class: 'result' }, elements);
```

## Good for what?

Mostly, I've used this when I need to quickly generate some dynamic DOM where a full-fleged templating engine feels like overkill.

I've used this little function in a few [CodePen](http://codepen.io) prototypes and sketches. Most recently, I've used it for defining [Knockout Components](http://knockoutjs.com/documentation/component-registration.html). <q class='aside'>`Ko` component templates can be document fragments or array of DOM nodes.</q> It's worked pretty smoothly so far; but will eventually be replaced with a proper templating engine.

Lastly, sometimes `string` concat-ing and finally injecting/parsing--like [Handlebars](http://handlebarsjs.com/)--feels a little obtuse for the type of transformations I want to do.
