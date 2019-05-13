---
title: Typographic Unicode
date: 2015-08-09 13:55:45
tags:
  - typography
  - css
  - html
---

Often, I find myself skipping over typography when writing content in HTML. It's even harder, sometimes, when dealing with CSS. Here is a quick reference some common typographical characters, and how to express them in both HTML and CSS.

<!-- more -->
***

## White space

First, it's easy to forget that white space can be more expressive than the standard space character you get when pressing the <kbd>Space Bar</kbd>. Let's look closer at some common white space characters.

[[figure | Common HTML White space]]
| || HTML Number | HTML Name | CSS
| |-:|:-:|:-:|:-:
| | Regular<mark>&#x0020;</mark>Space | `&#x20;` | | `\0020`
| | Non&#x2011;breaking<mark>&nbsp;</mark>Space | `&#xA0;` | `&nbsp;` | `\00A0`
| | Figure<mark>&#x2007;</mark>Space | `&#x2007;` | | `\2007`
| | <mark style="white-space:pre;">&#x0009;</mark>Tab | `&#x0009;` | `&tab;` | `\0009`

But, even that is not it! There are a *whole range* of typographical spaces that can&mdash;and *should*&mdash;be used in specific circumstances.

[[figure | Less Common HTML Whitespace ]]
| || HTML Number  | HTML Name | CSS
| |-:|:-:|:-:|:-:
| | Em<mark>&#x2003;</mark>Space | `&#x2003;` | `&emsp;` | `\2003`
| | En<mark>&#x2002;</mark>Space | `&#x2002;` | `&ensp;` | `\2002`
| | &#x2153;&nbsp;Em<mark>&#x2004;</mark>Space | `&#x2004;` | `&emsp13;` | `\2004`
| | &frac14;&nbsp;Em<mark>&#x2005;</mark>Space | `&#x2005;` | `&emsp14;` | `\2005`
| | &#x2159;&nbsp;Em<mark>&#x2006;</mark>Space | `&#x2006;` | | `\2006`
| | Thin<mark>&#x2009;</mark>Space | `&#x2009;` | `&thinsp;` | `\2009`
| | Hair<mark>&#x200A;</mark>Space | `&#x200a;` | `&hairsp;` | `\200a`

Lastly, there is a *zero&#8209;width space*, for those times when you want a space but don't want a space. But seriously, a zero&#8209;width space provides a wrapping opportunity within a long word without introducing a visible space. Also see the *soft hyphen* below.

[[figure | White-less whitespace ]]
| || HTML Number  | HTML Element | CSS
| |-:|:-:|:-:|:-:
| | Z<wbr>e<wbr>r<wbr>o&#8209;width space | `&#x200b;` | `<wbr>` | `\200b`

## Hyphens and Dashes

Remember, there is [a difference](http://practicaltypography.com/hyphens-and-dashes.html) between hyphens and dashes; use the right symbol for the *right task*.

[[figure | Hyphens and dashes ]]
| || HTML Number  | HTML Name | CSS
| |-:|:-:|:-:|:-:
| | Hy<mark>-</mark>phen | `&#x2d;` | | `\002d`
| | En<mark>&ndash;</mark>Dash | `&#x2013;` | `&ndash;` | `\2013`
| | Em<mark>&mdash;</mark>Dash | `&#x2014;` | `&mdash;` | `\2014`

There are two other special-case hyphens that might be useful in some cases. The non-breaking hyphen is great for a hyphenated word that makes no sense when it gets split up. The soft hyphen is great for hinting long words, so the browser can break appropriately.

[[figure | Special-case hyphens ]]
| || HTML Number  | HTML Name | CSS
| |-:|:-:|:-:|:-:
| | Non<mark>&#x2011;</mark>breaking hyphen | `&#x2011;` | | `\2011`
| | Soft hy&shy;phen         | `&#xad;` | `&shy;` | `\00ad`

## Quotes

[[figure | Better than finger-quotes. ]]
| || HTML Number  | HTML Name | CSS
| |-:|:-:|:-:|:-:
| | <mark>&#x0027;</mark>straight single<mark>&#x0027;</mark> | `&#x27;` | | `\0027` |
| | <mark>&#x0022;</mark>straight double<mark>&#x0022;</mark>  | `&#x22;` | | `\0022` |
| | <mark>&lsquo;</mark>curly single open&rsquo; | `&#x2018;` | `&lsquot;` | `\2018` |
| | &lsquo;curly single close<mark>&rsquo;</mark> | `&#x2019;` | `&rsquot;` | `\2019` |
| | <mark>&ldquo;</mark>curly double open&rdquo; | `&#x201c;` | `&ldquot;` | `\201c` |
| | &ldquo;curly double close<mark>&rdquo;</mark> | `&#x201d;` | `&rdquot;` | `\201d` |

Advanced stylists, pair the CSS property [`quotes`](https://developer.mozilla.org/en-US/docs/Web/CSS/quotes) with the [`<q>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/q) HTML element to markup and style quotations.

## Math

Best to avoid using a <q>-</q> when you really mean <q>&minus;</q>, and don't use an <q>x</q> when you mean
<q>&times;</q>.

[[figure | <q>Ah, what a fine day for science!</q> ]]
| || HTML Number  | HTML Name | CSS
| |-:|:-:|:-:|:-:
| | Plus <mark>+</mark> | `&#x2b;` | | `\002b` |
| | Minus <mark>&minus;</mark> | `&#x2212;` | `&minus;` | `\2212` |
| | Times <mark>&times;</mark> | `&#xd7;` | `&times;` | `\00d7` |
| | Divide <mark>&divide;</mark> | `&#xf7;` | `&divide;` | `\00f7` |
| | Prime<mark>&prime;</mark> | `&#x2032;` | `&prime;` | `\2032` |
| | Double Prime<mark>&Prime;</mark> | `&#x2033;` | `&Prime;` | `\2033` |
| | Triple Prime<mark>&#x2034;</mark> | `&#x2034;` | | `\2034` |

## Legal

[[figure | Legally Typographic ]]
| || HTML Number  | HTML Name | CSS
| |-:|:-:|:-:|:-:
| | Copyright<mark>&copy;</mark> | `&#xa9;` | `&copy;` | `\00a9`
| | Trademark<mark>&trade;</mark> | `&#x2122;` | `&trade;` | `\2122`
| | Registered Trademark<mark>&reg;</mark> | `&#xae;` | `&reg;` | `\00ae`
| | Service Mark<mark>&#x2120;</mark> | `&#x2120;` | | `\2120`
| | Sound Copyright<mark>&#x2117;</mark> | `&#x2117;` | | `\2117`

Remember to always consult a lawyer before you start slapping symbols around willy-nilly.

## The Next Level

Are you are ready to take your typography to the next level? Feel free to consult this list and seriously ~~confuse~~<ins>bedazzle</ins> your average reader.

[[figure | Taking it to the *max!* ]]
| || HTML Number  | HTML Name | CSS
| |-:|:-:|:-:|:-:
| | Ellipsis<mark>&hellip;</mark> | `&#x2026;` | `&hellip;` | `\2026`
| | Paragraph <mark>&para;</mark> | `&#x00b6;` | `&para;` | `\00b6`
| | Section <mark>&sect;</mark> | `&#x00a7;` | `&sect;` | `\00a7`
| | Interrobang<mark>&#x203d;</mark> | `&#x203d;` | | `\203d`

## Is that it? Are they any more?

I'll say! The complete Unicode range comprises of a whopping total of 1,114,112 code points... There are a lot more interesting characters to find; however, finding a typeface that supports them is another matter entirely.
