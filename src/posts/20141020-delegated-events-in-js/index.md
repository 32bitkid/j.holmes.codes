---
title: "Understanding Delegated JavaScript Events"
date: 2014-10-20 00:00:00
tags:
  - js
  - DOM
---

Have you ever been curious how delegated events _work_ in JavaScript? How they can be implemented? Let's take a look...

<!-- more -->

***

While I ended up using a CSS-only implementation for [this pen](http://codepen.io/32bitkid/pen/qJEoC), I started by writing it mostly using classes and JavaScript.

However, I had a conflict. I wanted to use [Delegated Events](http://api.jquery.com/on/#direct-and-delegated-events) but I also wanted to minimize the dependencies I wanted to inject. I didn't want to have to import _all_ of jQuery for this little test, just to be able to use delegated events one bit.

Let's take a closer look at what exactly delegated events are, how they work, and various ways to implement them.

## Ok, so what's the issue?

Let's look at a simplified example:

Let's say that I had a list of buttons and each time I clicked on one, then I want to mark that button as "active". If I click it again, then deactivate it.

So let's start with some HTML:

[[figure| Example Markup. ]]
| ```html
| <ul class="toolbar">
|   <li><button class="btn">Pencil</button></li>
|   <li><button class="btn">Pen</button></li>
|   <li><button class="btn">Eraser</button></li>
| </ul>
| ```

I could use standard JavaScript event handler by doing something like this:

[[figure|Using direct event handlers.]]
| ```js
| var buttons = document.querySelectorAll(".toolbar .btn");
|
| for(var i = 0; i < buttons.length; i++) {
|   var button = buttons[i];
|   button.addEventListener("click", function() {
|     if(!button.classList.contains("active"))
|       button.classList.add("active");
|     else
|       button.classList.remove("active");
|   });
| }
| ```

And this looks good... But it will not work; at least not the way one might expect it to.

## Bitten by closures

For those of you that have been doing functional JavaScript for a while, the problem mat be obvious.

For the uninitiated, however, the handler function closes over the `button` variable. However, there is only _one_ of them; it gets reassigned by each iteration of the loop.

The first time though the loop, it points at the first button. The next time, the second button. And so on... However, by the time that you *actually click* one of the elements and trigger the handler, the loop has completed and the `button` variable will point at the _last_ element iterated over.

 Not good.

What we really need is a stable scope for each function; let's refactor an extract a handler generator to give us a stable scope...

[[figure|Using a closure.]]
| ```js
| var buttons = document.querySelectorAll(".toolbar button");
| var createToolbarButtonHandler = function(button) {
|   return function() {
|     if(!button.classList.contains("active"))
|       button.classList.add("active");
|     else
|       button.classList.remove("active");
|   };
| };
|
| for(var i = 0; i < buttons.length; i++) {
|   buttons[i].addEventListener("click", createToolBarButtonHandler(buttons[i]));
| }
| ```

Better!

Now it actually works. We are using a function to create us a stable scope for `button`. This ensures the `button` variable in the handler will always point at the element that we think it will.

This seems good; it will work. However, we can still do better.

## So, what the problem?

First, we are making a lot of handlers.

For each element that matches `.toolbar button` we create a function and attach it as an event listener. With the three buttons we have right now the allocations are negligible.

However, consider this:

[[figure|Tons of DOM]]
| ```js
| <ul class="toolbar">
|   <li><button id="button_0001">Foo</button></li>
|   <li><button id="button_0002">Bar</button></li>
|   // ... 997 more elements ...
|   <li><button id="button_1000">baz</button></li>
| </ul>
| ```

It won't blow up, but it is far from ideal. We are allocating a bunch of function that we don't _have_ to. Let's try to refactor so that we can _share_ a single function that is attached _multiple times_.

---

Rather than closing over the `button` variable to keep track of which button we clicked on, instead we can use `event` object.

The `event` object is the first argument provided to a handler when the event is dispatched. It contains some metadata about the event. Among other things, we are interested in the `currentTarget` property. With it, we will get a reference to the element that was _actually clicked on_.

[[figure|First look at the <code>currentTarget</code> property]]
| ```js
| var buttons = document.querySelectorAll(".toolbar button");
|
| var toolbarButtonHandler = function(e) {
|   var button = e.currentTarget;
|   if(!button.classList.contains("active"))
|     button.classList.add("active");
|   else
|     button.classList.remove("active");
| };
|
| for(var i = 0; i < buttons.length; i++) {
|   button.addEventListener("click", toolbarButtonHandler);
| }
| ```

Great!

Not only did this refactor reduce the number of required handlers down to single function, it also made the code more readable by factoring out our generator function.

However, we can _still_ do better.

## But, why?

Let's say we have some dynamic buttons that are added and removed dynamically through JavaScript.

Based on our current implementation, we would also need to remember to wire up the event listeners directly to those dynamic elements. That means we would also have to hold onto a reference to that handler, reference from more places, and make sure to remove remove it from elements before we tear them off of the DOM.

That doesn't sound like fun. But, perhaps there is a different approach.

Let's start by getting a better understanding of how events work and how they move through the DOM.

## Okay, how do events work?

When the user clicks on an element, an event gets generated to notify the application of the user's intent. Events get dispatched in three phases:

* Capturing
* Target
* Bubbling

[[aside]]
| Not _all_ events bubble/capture. Instead, a few are dispatched directly on the target, _e.g._ 
| `focus` and `blur` events don't bubble. However, *most* other event types do.


For most event types, the event starts outside the document and then descends though the DOM hierarchy to the `target` of the event. Once the event reaches it's target, it then turns around and heads back out the same way, until it exits the DOM.

Here is a full HTML example:

[[figure| Example DOM to demonstrate event bubbling. ]]
| ```html
| <html>
| <body>
|   <ul>
|     <li id="li_1"><button id="button_1">Button A</button></li>
|     <li id="li_2"><button id="button_2">Button B</button></li>
|     <li id="li_3"><button id="button_3">Button C</button></li>
|   </ul>
| </body>
| </html>
| ```

Pretend the user clicks on `Button A`, then the `event` would travel like this like this:

[[figure|Crude illustration of the event life-cycle.]]
| <svg xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;" width="62%" viewBox="0 0 372 326"><path d="M1.45 113.092h1.687v-6.058l-2.02.972v-1.042l2.009-.956h1.085v7.084h1.665V114H1.45zM23.143 119.873v3.013H24.4q.752 0 1.173-.398.422-.397.422-1.112 0-.714-.419-1.109-.419-.394-1.176-.394zm-1.085-.892H24.4q1.343 0 2.036.61.692.61.692 1.785 0 1.187-.69 1.794t-2.038.607h-1.257V127h-1.085z" fill="#0095FF"/><path d="M20.893 228.336v-.924h6.837v.924z"/><path d="M93.879 247.32V233.3h.86v14.02z" fill="#4E8F00"/><path d="M93.879 254.336V246.3h.86v7.111h2.991v.924zM121.45 273.32V259.3h1.718v14.02z" fill="#4E8F00"/><path d="M121.45 280.798V272.3h1.718v6.65h2.562v1.847z" fill="#4E8F00"/><path d="M156.003 308.087h3.685V309h-4.872v-.913q1.005-1.058 1.757-1.87.752-.81 1.036-1.143.537-.656.725-1.061.188-.406.188-.83 0-.671-.394-1.053-.395-.381-1.083-.381-.488 0-1.025.177-.538.178-1.14.537v-1.095q.554-.264 1.089-.398.534-.134 1.055-.134 1.176 0 1.893.626.717.625.717 1.64 0 .516-.239 1.032-.239.515-.776 1.138-.3.35-.873.967-.572.618-1.743 1.848zM170.143 314.873v3.013h1.257q.752 0 1.173-.398.422-.397.422-1.112 0-.714-.419-1.109-.419-.394-1.176-.394zm-1.085-.892h2.342q1.343 0 2.036.61.692.61.692 1.785 0 1.187-.69 1.794t-2.038.607h-1.257V322h-1.085zM175.736 313.981h1.09v3.072h2.97v-3.072h1.09V322h-1.09v-4.034h-2.97V322h-1.09zM185.309 314.937l-1.144 4.104h2.288zm-.656-.956h1.316l2.455 8.019H187.3l-.59-2.09h-2.81l-.58 2.09H182.2zM194.436 314.255v1.101q-.495-.317-.991-.478-.497-.161-1.002-.161-.768 0-1.214.357-.446.357-.446.964 0 .532.293.811.293.28 1.093.467l.57.13q1.127.262 1.643.826.515.564.515 1.537 0 1.144-.709 1.745-.709.602-2.062.602-.564 0-1.133-.121-.57-.12-1.144-.363v-1.154q.617.392 1.168.574.55.183 1.109.183.822 0 1.278-.368.457-.368.457-1.029 0-.601-.314-.918-.315-.317-1.093-.489l-.58-.134q-1.118-.253-1.623-.763-.504-.51-.504-1.37 0-1.074.722-1.72.722-.648 1.92-.648.462 0 .972.105.51.104 1.075.314zM197.058 313.981h4.759v.913h-3.674v2.16h3.513v.912h-3.513v3.12h3.776V322h-4.86zM163.09 306.83h1.89V309h-1.89zM168.252 300.981h6.118v.913h-2.508V309h-1.09v-7.106h-2.52zM178.309 301.937l-1.144 4.104h2.288zm-.656-.956h1.316l2.455 8.019H180.3l-.59-2.09h-2.81l-.58 2.09H175.2zM186.082 305.213q.419.108.714.406.296.298.736 1.19l1.09 2.191h-1.165l-.956-2.025q-.414-.865-.744-1.114-.33-.25-.862-.25h-1.037V309h-1.09v-8.019h2.234q1.322 0 2.025.596.704.596.704 1.724 0 .795-.432 1.297-.433.503-1.217.615zm-2.224-3.34v2.846h1.187q.78 0 1.16-.349.382-.349.382-1.069 0-.693-.406-1.06-.405-.368-1.179-.368zM194.93 308.34q-.435.402-.98.609-.546.207-1.18.207-1.525 0-2.374-1.093-.848-1.093-.848-3.064 0-1.966.86-3.065.859-1.098 2.39-1.098.504 0 .966.142.462.143.892.433v1.111q-.435-.413-.892-.61-.456-.195-.967-.195-1.058 0-1.587.819-.529.819-.529 2.463 0 1.67.513 2.473.513.803 1.577.803.36 0 .63-.083.272-.084.492-.26v-2.155h-1.165v-.891h2.202zM197.058 300.981h4.759v.913h-3.674v2.16h3.513v.912h-3.513v3.12h3.776V309h-4.86zM203.252 300.981h6.118v.913h-2.508V309h-1.09v-7.106h-2.52z" fill="#4D8E00"/><path d="M125.893 280.798v-1.848h6.837v1.848zM132.893 280.798v-1.848h6.837v1.848zM139.893 280.798v-1.848h6.837v1.848zM146.893 280.798v-1.848h6.837v1.848zM153.893 280.798v-1.848h6.837v1.848zM160.893 280.798v-1.848h6.837v1.848zM167.893 280.798v-1.848h6.837v1.848zM174.893 280.798v-1.848h6.837v1.848zM181.893 280.798v-1.848h6.837v1.848zM188.893 280.798v-1.848h6.837v1.848zM195.893 280.798v-1.848h6.837v1.848zM202.893 280.798v-1.848h6.837v1.848zM209.893 280.798v-1.848h6.837v1.848zM216.893 280.798v-1.848h6.837v1.848zM223.893 280.798v-1.848h6.837v1.848zM230.893 280.798v-1.848h6.837v1.848zM237.893 280.798v-1.848h6.837v1.848zM244.893 280.798v-1.848h2.556v-6.65h1.719v8.498z" fill="#4E8F00"/><path d="M247.45 273.32V259.3h1.718v14.02zM251.893 267.336v-.924h6.837v.924zM258.893 267.336v-.924h6.837v.924zM265.893 267.336v-.924h6.837v.924zM272.893 267.336v-.924h2.986v-7.111h.86v8.035zM97.893 254.336v-.924h6.837v.924zM104.893 254.336v-.924h6.837v.924zM112.032 257.419v-6.553l6.558 3.277zM121.45 260.32V246.3h1.718v14.02z" fill="#4E8F00"/><path d="M247.45 260.32V246.3h1.718v14.02zM275.879 260.32V246.3h.86v14.02zM121.45 247.32v-7.37h4.28v1.848h-2.562v5.521zM125.893 241.798v-1.848h6.837v1.848zM137.93 240.998q0-1.15-.365-1.735-.365-.586-1.08-.586-.719 0-1.09.588-.37.589-.37 1.733 0 1.138.37 1.73.371.59 1.09.59.715 0 1.08-.586.366-.585.366-1.734zm-2.905-2.246q.236-.44.652-.676.417-.237.965-.237 1.085 0 1.708.836.623.835.623 2.301 0 1.488-.626 2.334-.626.846-1.716.846-.537 0-.948-.234-.411-.234-.658-.68V244h-.988v-8.357h.988zM141.047 241.723v-3.728h.989v3.728q0 .81.287 1.192.287.381.889.381.698 0 1.069-.491.37-.492.37-1.41v-3.4h.994V244h-.994v-.902q-.263.52-.717.79-.454.268-1.06.268-.924 0-1.375-.604-.452-.605-.452-1.83zM150.298 236.276v1.708h2.245v.768h-2.245v3.266q0 .666.252.93.253.262.881.262h1.112v.79h-1.209q-1.111 0-1.568-.446-.456-.446-.456-1.536v-3.266h-1.606v-.768h1.606v-1.708zM157.298 236.276v1.708h2.245v.768h-2.245v3.266q0 .666.252.93.253.262.881.262h1.112v.79h-1.209q-1.111 0-1.568-.446-.456-.446-.456-1.536v-3.266h-1.606v-.768h1.606v-1.708zM164.309 238.677q-.752 0-1.14.586-.386.585-.386 1.735 0 1.144.387 1.732.387.588 1.139.588.757 0 1.144-.588.386-.588.386-1.732 0-1.15-.386-1.735-.387-.586-1.144-.586zm0-.838q1.251 0 1.914.811.664.811.664 2.348 0 1.541-.66 2.35-.662.808-1.918.808-1.252 0-1.913-.809-.66-.808-.66-2.35 0-1.536.66-2.347.661-.81 1.913-.81zM173.645 240.272V244h-.994v-3.728q0-.81-.284-1.192-.285-.381-.892-.381-.693 0-1.066.491-.373.492-.373 1.41v3.4h-.989v-6.016h.989v.903q.263-.516.714-.782.451-.266 1.069-.266.918 0 1.372.605.454.604.454 1.828zM178.674 236.131l-.484 1.902h1.316l.49-1.902h.858l-.488 1.902h1.31v.821h-1.509l-.526 2.111h1.342v.822h-1.552l-.558 2.213h-.86l.564-2.213h-1.321l-.564 2.213h-.854l.558-2.213h-1.385v-.822h1.595l.526-2.11h-1.428v-.822h1.627l.483-1.902zm.634 2.723h-1.316l-.527 2.111h1.322zM186.93 240.998q0-1.15-.365-1.735-.365-.586-1.08-.586-.719 0-1.09.588-.37.589-.37 1.733 0 1.138.37 1.73.371.59 1.09.59.715 0 1.08-.586.366-.585.366-1.734zm-2.905-2.246q.236-.44.652-.676.417-.237.965-.237 1.085 0 1.708.836.623.835.623 2.301 0 1.488-.626 2.334-.626.846-1.716.846-.537 0-.948-.234-.411-.234-.658-.68V244h-.988v-8.357h.988zM190.047 241.723v-3.728h.989v3.728q0 .81.287 1.192.287.381.889.381.698 0 1.069-.491.37-.492.37-1.41v-3.4h.994V244h-.994v-.902q-.263.52-.717.79-.454.268-1.06.268-.924 0-1.375-.604-.452-.605-.452-1.83zM199.298 236.276v1.708h2.245v.768h-2.245v3.266q0 .666.252.93.253.262.881.262h1.112v.79h-1.209q-1.111 0-1.568-.446-.456-.446-.456-1.536v-3.266h-1.606v-.768h1.606v-1.708zM206.298 236.276v1.708h2.245v.768h-2.245v3.266q0 .666.252.93.253.262.881.262h1.112v.79h-1.209q-1.111 0-1.568-.446-.456-.446-.456-1.536v-3.266h-1.606v-.768h1.606v-1.708zM213.309 238.677q-.752 0-1.14.586-.386.585-.386 1.735 0 1.144.387 1.732.387.588 1.139.588.757 0 1.144-.588.386-.588.386-1.732 0-1.15-.386-1.735-.387-.586-1.144-.586zm0-.838q1.251 0 1.914.811.664.811.664 2.348 0 1.541-.66 2.35-.662.808-1.918.808-1.252 0-1.913-.809-.66-.808-.66-2.35 0-1.536.66-2.347.661-.81 1.913-.81zM222.645 240.272V244h-.994v-3.728q0-.81-.284-1.192-.285-.381-.892-.381-.693 0-1.066.491-.373.492-.373 1.41v3.4h-.989v-6.016h.989v.903q.263-.516.714-.782.451-.266 1.069-.266.918 0 1.372.605.454.604.454 1.828zM230.574 245.02v.914H224v-.913zM232.45 243.092h1.687v-6.058l-2.02.972v-1.042l2.009-.956h1.085v7.084h1.665V244h-4.426zM237.893 241.798v-1.848h6.837v1.848z" fill="#4E8F00"/><path d="M247.45 247.32v-5.522h-2.557v-1.848h4.275v7.37zM275.879 247.32V233.3h.86v14.02z" fill="#4E8F00"/><path d="M34.893 228.336v-.924h6.837v.924zM48.893 228.336v-.924h6.837v.924zM62.893 228.336v-.924h6.837v.924zM76.893 228.336v-.924h6.837v.924z"/><path d="M94.738 228.336v5.983h-.86v-5.983h-2.985v-.924h2.986v-7.111h.86v7.111h2.991v.924z" fill="#4E8F00"/><path d="M104.893 228.336v-.924h6.837v.924zM118.893 228.336v-.924h6.837v.924zM132.893 228.336v-.924h6.837v.924zM146.893 228.336v-.924h6.837v.924zM160.893 228.336v-.924h6.837v.924zM174.893 228.336v-.924h6.837v.924zM188.893 228.336v-.924h6.837v.924zM202.893 228.336v-.924h6.837v.924zM216.893 228.336v-.924h6.837v.924zM230.893 228.336v-.924h6.837v.924zM244.893 228.336v-.924h6.837v.924zM258.893 228.336v-.924h6.837v.924z"/><path d="M276.738 228.336v5.983h-.86v-5.983h-2.985v-.924h2.986v-7.111h.86v7.111h2.991v.924z" fill="#4E8F00"/><path d="M286.893 228.336v-.924h6.837v.924zM300.893 228.336v-.924h6.837v.924zM314.893 228.336v-.924h6.837v.924zM328.893 228.336v-.924h6.837v.924zM342.893 228.336v-.924h6.837v.924z"/><path d="M93.879 137.336V129.3h.86v7.111h2.991v.924zM93.879 156.32v-6.908h3.851v.924h-2.992v5.983z" fill="#0096FF"/><path d="M93.879 169.32V155.3h.86v14.02z" fill="#0096FF"/><path d="M93.879 182.32V168.3h.86v14.02z" fill="#0096FF"/><path d="M93.879 189.336V181.3h.86v7.111h2.991v.924z" fill="#0096FF"/><path d="M93.879 208.32v-6.908h3.851v.924h-2.992v5.983z" fill="#4E8F00"/><path d="M93.879 221.32V207.3h.86v14.02z" fill="#4E8F00"/><path d="M128.879 215.336V207.3h.86v7.111h2.991v.924zM132.893 215.336v-.924h6.837v.924zM139.893 215.336v-.924h6.837v.924zM146.893 215.336v-.924h6.837v.924zM153.893 215.336v-.924h6.837v.924zM160.893 215.336v-.924h6.837v.924zM167.893 215.336v-.924h6.837v.924zM174.893 215.336v-.924h6.837v.924zM181.893 215.336v-.924h6.837v.924zM188.893 215.336v-.924h6.837v.924zM195.893 215.336v-.924h6.837v.924zM202.893 215.336v-.924h6.837v.924zM209.893 215.336v-.924h6.837v.924zM216.893 215.336v-.924h6.837v.924zM223.893 215.336v-.924h6.837v.924zM230.893 215.336v-.924h6.837v.924zM237.893 215.336v-.924h2.986v-7.111h.86v8.035z"/><path d="M275.879 221.32V207.3h.86v14.02zM97.893 202.336v-.924h6.837v.924zM104.893 202.336v-.924h6.837v.924zM111.893 202.336v-.924h6.837v.924zM118.893 202.336v-.924h6.837v.924z" fill="#4E8F00"/><path d="M128.879 208.32V194.3h.86v14.02zM240.879 208.32V194.3h.86v14.02z"/><path d="M245.032 202.143l6.558-3.277v6.553zM251.893 202.336v-.924h6.837v.924zM258.893 202.336v-.924h6.837v.924zM265.893 202.336v-.924h6.837v.924zM275.879 208.32v-5.984h-2.986v-.924h3.845v6.907z" fill="#4E8F00"/><path d="M97.893 189.336v-.924h6.837v.924zM104.893 189.336v-.924h6.837v.924zM111.893 189.336v-.924h6.837v.924zM119.032 192.419v-6.553l6.558 3.277z" fill="#0096FF"/><path d="M128.879 195.32V181.3h.86v14.02zM240.879 195.32V181.3h.86v14.02z"/><path d="M244.893 189.336v-.924h6.837v.924zM251.893 189.336v-.924h6.837v.924zM258.893 189.336v-.924h6.837v.924zM265.893 189.336v-.924h6.837v.924zM272.893 189.336v-.924h2.986v-7.111h.86v8.035z" fill="#FF9300"/><path d="M128.879 163.336V155.3h.86v7.111h2.991v.924zM128.879 182.32v-6.908h3.851v.924h-2.992v5.983zM132.893 176.336v-.924h6.837v.924zM143.862 176.825q0 .666.244 1.004.245.338.723.338h1.154V179h-1.251q-.886 0-1.372-.567-.486-.566-.486-1.608v-5.441h-1.585v-.774h2.573zM148.697 173.006h2.53v5.226h1.96V179h-4.909v-.768h1.96v-4.458h-1.54zm1.542-2.337h.988v1.247h-.988zM157.674 171.131l-.484 1.902h1.316l.49-1.902h.858l-.488 1.902h1.31v.821h-1.509l-.526 2.111h1.342v.822h-1.552l-.558 2.213h-.86l.564-2.213h-1.321l-.564 2.213h-.854l.558-2.213h-1.385v-.822h1.595l.526-2.11h-1.428v-.822h1.627l.483-1.902zm.634 2.723h-1.316l-.527 2.111h1.322zM164.862 176.825q0 .666.244 1.004.245.338.723.338h1.154V179h-1.251q-.886 0-1.372-.567-.486-.566-.486-1.608v-5.441h-1.585v-.774h2.573zM169.697 173.006h2.53v5.226h1.96V179h-4.909v-.768h1.96v-4.458h-1.54zm1.542-2.337h.988v1.247h-.988zM181.574 180.02v.914H175v-.913zM183.45 178.092h1.687v-6.058l-2.02.972v-1.042l2.009-.956h1.085v7.084h1.665V179h-4.426zM188.893 176.336v-.924h6.837v.924zM195.893 176.336v-.924h6.837v.924zM202.893 176.336v-.924h6.837v.924zM209.893 176.336v-.924h6.837v.924zM216.893 176.336v-.924h6.837v.924zM223.893 176.336v-.924h6.837v.924zM230.893 176.336v-.924h6.837v.924zM240.879 182.32v-5.984h-2.986v-.924h3.845v6.907z"/><path d="M275.879 182.32V168.3h.86v14.02z" fill="#FF9300"/><path d="M132.893 163.336v-.924h6.837v.924zM139.893 163.336v-.924h6.837v.924zM146.893 163.336v-.924h6.837v.924zM153.893 163.336v-.924h6.837v.924zM160.893 163.336v-.924h6.837v.924zM167.893 163.336v-.924h6.837v.924zM174.893 163.336v-.924h6.837v.924zM181.893 163.336v-.924h6.837v.924zM188.893 163.336v-.924h6.837v.924zM195.893 163.336v-.924h6.837v.924zM202.893 163.336v-.924h6.837v.924zM209.893 163.336v-.924h6.837v.924zM216.893 163.336v-.924h6.837v.924zM223.893 163.336v-.924h6.837v.924zM230.893 163.336v-.924h6.837v.924zM237.893 163.336v-.924h2.986v-7.111h.86v8.035z"/><path d="M275.879 169.32V155.3h.86v14.02z" fill="#FF9300"/><path d="M97.893 150.336v-.924h6.837v.924zM104.893 150.336v-.924h6.837v.924zM111.893 150.336v-.924h6.837v.924zM118.893 150.336v-.924h6.837v.924z" fill="#0096FF"/><path d="M128.879 156.32V142.3h.86v14.02zM240.879 156.32V142.3h.86v14.02z"/><path d="M245.032 150.143l6.558-3.277v6.553zM251.893 150.336v-.924h6.837v.924zM258.893 150.336v-.924h6.837v.924zM265.893 150.336v-.924h6.837v.924zM275.879 156.32v-5.984h-2.986v-.924h3.845v6.907z" fill="#FF9300"/><path d="M97.893 137.336v-.924h6.837v.924zM104.893 137.336v-.924h6.837v.924zM111.893 137.336v-.924h6.837v.924zM119.032 140.419v-6.553l6.558 3.277z" fill="#0096FF"/><path d="M128.879 143.32V129.3h.86v14.02zM240.879 143.32V129.3h.86v14.02z"/><path d="M244.893 137.336v-.924h6.837v.924zM251.893 137.336v-.924h6.837v.924zM258.893 137.336v-.924h6.837v.924zM265.893 137.336v-.924h6.837v.924zM272.893 137.336v-.924h2.986v-7.111h.86v8.035z" fill="#FF9300"/><path d="M28.736 118.981h1.09v3.072h2.97v-3.072h1.09V127h-1.09v-4.034h-2.97V127h-1.09zM38.309 119.937l-1.144 4.104h2.288zm-.656-.956h1.316L41.424 127H40.3l-.59-2.09H36.9l-.58 2.09H35.2zM47.436 119.255v1.101q-.495-.317-.991-.478-.497-.161-1.002-.161-.768 0-1.214.357-.446.357-.446.964 0 .532.293.811.293.28 1.093.467l.57.13q1.127.262 1.643.826.515.564.515 1.537 0 1.144-.709 1.745-.709.602-2.062.602-.564 0-1.133-.121-.57-.12-1.144-.363v-1.154q.617.392 1.168.574.55.183 1.109.183.822 0 1.278-.368.457-.368.457-1.029 0-.601-.314-.918-.315-.317-1.093-.489l-.58-.134q-1.118-.253-1.623-.763-.504-.51-.504-1.37 0-1.074.722-1.72.722-.648 1.92-.648.462 0 .972.105.51.104 1.075.314zM50.058 118.981h4.759v.913h-3.674v2.16h3.513v.912h-3.513v3.12h3.776V127h-4.86z" fill="#0095FF"/><path d="M93.879 130.32V116.3h.86v14.02z" fill="#0096FF"/><path d="M128.879 130.32v-6.908h3.851v.924h-2.992v5.983zM132.893 124.336v-.924h6.837v.924zM141.047 124.723v-3.728h.989v3.728q0 .81.287 1.192.287.381.889.381.698 0 1.069-.491.37-.492.37-1.41v-3.4h.994V127h-.994v-.902q-.263.52-.717.79-.454.268-1.06.268-.924 0-1.375-.604-.452-.605-.452-1.83zM150.862 124.825q0 .666.244 1.004.245.338.723.338h1.154V127h-1.251q-.886 0-1.372-.567-.486-.566-.486-1.608v-5.441h-1.585v-.774h2.573zM153.893 124.336v-.924h6.837v.924zM160.893 124.336v-.924h6.837v.924zM167.893 124.336v-.924h6.837v.924zM174.893 124.336v-.924h6.837v.924zM181.893 124.336v-.924h6.837v.924zM188.893 124.336v-.924h6.837v.924zM195.893 124.336v-.924h6.837v.924zM202.893 124.336v-.924h6.837v.924zM209.893 124.336v-.924h6.837v.924zM216.893 124.336v-.924h6.837v.924zM223.893 124.336v-.924h6.837v.924zM230.893 124.336v-.924h6.837v.924zM240.879 130.32v-5.984h-2.986v-.924h3.845v6.907z"/><path d="M275.879 130.32V116.3h.86v14.02z" fill="#FF9300"/><path d="M317.143 119.873v3.013h1.257q.752 0 1.173-.398.422-.397.422-1.112 0-.714-.419-1.109-.419-.394-1.176-.394zm-1.085-.892h2.342q1.343 0 2.036.61.692.61.692 1.785 0 1.187-.69 1.794t-2.038.607h-1.257V127h-1.085zM322.736 118.981h1.09v3.072h2.97v-3.072h1.09V127h-1.09v-4.034h-2.97V127h-1.09zM332.309 119.937l-1.144 4.104h2.288zm-.656-.956h1.316l2.455 8.019H334.3l-.59-2.09h-2.81l-.58 2.09H329.2zM341.436 119.255v1.101q-.495-.317-.991-.478-.497-.161-1.002-.161-.768 0-1.214.357-.446.357-.446.964 0 .532.293.811.293.28 1.093.467l.57.13q1.127.262 1.643.826.515.564.515 1.537 0 1.144-.709 1.745-.709.602-2.062.602-.564 0-1.133-.121-.57-.12-1.144-.363v-1.154q.617.392 1.168.574.55.183 1.109.183.822 0 1.278-.368.457-.368.457-1.029 0-.601-.314-.918-.315-.317-1.093-.489l-.58-.134q-1.118-.253-1.623-.763-.504-.51-.504-1.37 0-1.074.722-1.72.722-.648 1.92-.648.462 0 .972.105.51.104 1.075.314zM344.058 118.981h4.759v.913h-3.674v2.16h3.513v.912h-3.513v3.12h3.776V127h-4.86z" fill="#FF9200"/><path d="M9.09 111.83h1.89V114H9.09zM26.763 113.715q-.413.22-.848.33-.436.11-.924.11-1.542 0-2.393-1.09-.851-1.09-.851-3.066 0-1.966.856-3.065.857-1.098 2.388-1.098.488 0 .924.11.435.11.848.33v1.112q-.397-.327-.854-.5-.456-.171-.918-.171-1.058 0-1.585.816-.526.817-.526 2.466 0 1.643.526 2.46.527.816 1.585.816.472 0 .926-.172.454-.172.846-.5zM31.309 106.937l-1.144 4.104h2.288zm-.656-.956h1.316L34.424 114H33.3l-.59-2.09H29.9l-.58 2.09H28.2zM37.143 106.873v3.013H38.4q.752 0 1.173-.398.422-.397.422-1.112 0-.714-.419-1.109-.419-.394-1.176-.394zm-1.085-.892H38.4q1.343 0 2.036.61.692.61.692 1.785 0 1.187-.69 1.794t-2.038.607h-1.257V114h-1.085zM42.252 105.981h6.118v.913h-2.508V114h-1.09v-7.106h-2.52zM49.79 110.922v-4.941h1.09v5.436q0 .585.032.835t.113.384q.172.317.497.478.325.16.787.16.467 0 .79-.16.321-.161.499-.478.08-.135.112-.382.033-.247.033-.827v-5.446h1.085v4.941q0 1.23-.153 1.749-.154.518-.53.856-.354.317-.81.473-.457.156-1.026.156-.564 0-1.02-.156-.457-.156-.817-.473-.37-.333-.527-.862-.155-.529-.155-1.743zM60.082 110.213q.419.108.714.406.296.298.736 1.19l1.09 2.191h-1.165l-.956-2.025q-.414-.865-.744-1.114-.33-.25-.862-.25h-1.037V114h-1.09v-8.019h2.234q1.322 0 2.025.596.704.596.704 1.724 0 .795-.432 1.297-.433.503-1.217.615zm-2.224-3.34v2.846h1.187q.78 0 1.16-.349.382-.349.382-1.069 0-.693-.406-1.06-.405-.368-1.179-.368zM64.058 105.981h4.759v.913h-3.674v2.16h3.513v.912h-3.513v3.12h3.776V114h-4.86z" fill="#0095FF"/><path d="M93.879 117.32V103.3h.86v14.02z" fill="#0096FF"/><path d="M128.879 111.336V103.3h.86v7.111h2.991v.924zM132.893 111.336v-.924h6.837v.924zM139.893 111.336v-.924h6.837v.924zM146.893 111.336v-.924h6.837v.924zM153.893 111.336v-.924h6.837v.924zM160.893 111.336v-.924h6.837v.924zM167.893 111.336v-.924h6.837v.924zM174.893 111.336v-.924h6.837v.924zM181.893 111.336v-.924h6.837v.924zM188.893 111.336v-.924h6.837v.924zM195.893 111.336v-.924h6.837v.924zM202.893 111.336v-.924h6.837v.924zM209.893 111.336v-.924h6.837v.924zM216.893 111.336v-.924h6.837v.924zM223.893 111.336v-.924h6.837v.924zM230.893 111.336v-.924h6.837v.924zM237.893 111.336v-.924h2.986v-7.111h.86v8.035z"/><path d="M275.879 117.32V103.3h.86v14.02z" fill="#FF9300"/><path d="M298.168 109.708q.79.21 1.208.744.42.535.42 1.335 0 1.107-.744 1.738-.744.63-2.06.63-.554 0-1.128-.101-.575-.102-1.128-.296v-1.08q.548.285 1.08.425.531.14 1.058.14.891 0 1.37-.403.477-.403.477-1.16 0-.699-.478-1.11-.478-.41-1.294-.41h-.827v-.892h.827q.746 0 1.165-.328.42-.327.42-.913 0-.617-.39-.948-.39-.33-1.11-.33-.477 0-.988.107-.51.108-1.068.323v-1q.65-.171 1.157-.257.508-.086.9-.086 1.17 0 1.871.588.701.588.701 1.56 0 .661-.367 1.101-.368.44-1.072.623zM303.09 111.83h1.89V114h-1.89zM316.982 109.956v3.152h1.284q.945 0 1.348-.33.403-.33.403-1.088 0-.999-.425-1.367-.424-.367-1.326-.367zm0-3.083v2.202h1.262q.784 0 1.136-.301.352-.3.352-.757 0-.607-.347-.876-.346-.268-1.14-.268zm-1.09-.892h2.374q1.23 0 1.896.532.666.531.666 1.504 0 .52-.352.945-.352.424-1.056.532.79.118 1.238.674.449.556.449 1.63 0 1.09-.714 1.646-.715.556-2.127.556h-2.374zM322.79 110.922v-4.941h1.09v5.436q0 .585.032.835t.113.384q.172.317.497.478.325.16.787.16.467 0 .79-.16.321-.161.499-.478.08-.135.112-.382.033-.247.033-.827v-5.446h1.085v4.941q0 1.23-.153 1.749-.154.518-.53.856-.354.317-.81.473-.457.156-1.026.156-.564 0-1.02-.156-.457-.156-.817-.473-.37-.333-.527-.862-.155-.529-.155-1.743zM330.982 109.956v3.152h1.284q.945 0 1.348-.33.403-.33.403-1.088 0-.999-.425-1.367-.424-.367-1.326-.367zm0-3.083v2.202h1.262q.784 0 1.136-.301.352-.3.352-.757 0-.607-.347-.876-.346-.268-1.14-.268zm-1.09-.892h2.374q1.23 0 1.896.532.666.531.666 1.504 0 .52-.352.945-.352.424-1.056.532.79.118 1.238.674.449.556.449 1.63 0 1.09-.714 1.646-.715.556-2.127.556h-2.374zM337.982 109.956v3.152h1.284q.945 0 1.348-.33.403-.33.403-1.088 0-.999-.425-1.367-.424-.367-1.326-.367zm0-3.083v2.202h1.262q.784 0 1.136-.301.352-.3.352-.757 0-.607-.347-.876-.346-.268-1.14-.268zm-1.09-.892h2.374q1.23 0 1.896.532.666.531.666 1.504 0 .52-.352.945-.352.424-1.056.532.79.118 1.238.674.449.556.449 1.63 0 1.09-.714 1.646-.715.556-2.127.556h-2.374zM344.155 105.981h1.09v7.106h3.873V114h-4.963zM351.08 105.981h4.452v.913h-1.68v6.193h1.68V114h-4.452v-.913h1.68v-6.193h-1.68zM357.102 106.008h1.482l3.137 6.58v-6.58h1.155V114h-1.482l-3.137-6.58V114h-1.155zM369.93 113.34q-.435.402-.98.609-.546.207-1.18.207-1.525 0-2.374-1.093-.848-1.093-.848-3.064 0-1.966.86-3.065.859-1.098 2.39-1.098.504 0 .966.142.462.143.892.433v1.111q-.435-.413-.892-.61-.456-.195-.967-.195-1.058 0-1.587.819-.529.819-.529 2.463 0 1.67.513 2.473.513.803 1.577.803.36 0 .63-.083.272-.084.492-.26v-2.155h-1.165v-.891h2.202z" fill="#FF9200"/><path d="M93.879 13.32V-.7h.86v14.02z" fill="#0096FF"/><path d="M93.879 26.32V12.3h.86v14.02z" fill="#0096FF"/><path d="M93.879 33.336V25.3h.86v7.111h2.991v.924zM93.879 52.32v-6.908h3.851v.924h-2.992v5.983z" fill="#0096FF"/><path d="M93.879 65.32V51.3h.86v14.02z" fill="#0096FF"/><path d="M93.879 78.32V64.3h.86v14.02z" fill="#0096FF"/><path d="M93.879 85.336V77.3h.86v7.111h2.991v.924zM93.879 104.32v-6.908h3.851v.924h-2.992v5.983zM97.893 98.336v-.924h6.837v.924zM104.893 98.336v-.924h6.837v.924zM111.893 98.336v-.924h6.837v.924zM118.893 98.336v-.924h6.837v.924z" fill="#0096FF"/><path d="M128.879 104.32V90.3h.86v14.02zM240.879 104.32V90.3h.86v14.02z"/><path d="M245.032 98.143l6.558-3.277v6.553zM251.893 98.336v-.924h6.837v.924zM258.893 98.336v-.924h6.837v.924zM265.893 98.336v-.924h6.837v.924zM275.879 104.32v-5.984h-2.986v-.924h3.845v6.907z" fill="#FF9300"/><path d="M97.893 85.336v-.924h6.837v.924zM104.893 85.336v-.924h6.837v.924zM111.893 85.336v-.924h6.837v.924zM119.032 88.419v-6.553l6.558 3.277z" fill="#0096FF"/><path d="M128.879 91.32V77.3h.86v14.02zM240.879 91.32V77.3h.86v14.02z"/><path d="M244.893 85.336v-.924h6.837v.924zM251.893 85.336v-.924h6.837v.924zM258.893 85.336v-.924h6.837v.924zM265.893 85.336v-.924h6.837v.924zM272.893 85.336v-.924h2.986v-7.111h.86v8.035z" fill="#FF9300"/><path d="M128.879 59.336V51.3h.86v7.111h2.991v.924zM128.879 78.32v-6.908h3.851v.924h-2.992v5.983zM132.893 72.336v-.924h6.837v.924zM144.93 71.998q0-1.15-.365-1.735-.365-.586-1.08-.586-.719 0-1.09.588-.37.589-.37 1.733 0 1.138.37 1.73.371.59 1.09.59.715 0 1.08-.586.366-.585.366-1.734zm-2.905-2.246q.236-.44.652-.676.417-.237.965-.237 1.085 0 1.708.836.623.835.623 2.301 0 1.488-.626 2.334-.626.846-1.716.846-.537 0-.948-.234-.411-.234-.658-.68V75h-.988v-8.357h.988zM150.309 69.677q-.752 0-1.14.586-.386.585-.386 1.735 0 1.144.387 1.732.387.588 1.139.588.757 0 1.144-.588.386-.588.386-1.732 0-1.15-.386-1.735-.387-.586-1.144-.586zm0-.838q1.251 0 1.914.811.664.811.664 2.348 0 1.541-.66 2.35-.662.808-1.918.808-1.252 0-1.913-.809-.66-.808-.66-2.35 0-1.536.66-2.347.661-.81 1.913-.81zM158.608 69.752v-3.11h.989V75h-.989v-.757q-.247.445-.658.68-.41.233-.948.233-1.09 0-1.716-.846-.625-.846-.625-2.334 0-1.466.628-2.301.628-.836 1.713-.836.543 0 .956.234.414.234.65.68zm-2.905 2.246q0 1.149.365 1.734.365.586 1.08.586.714 0 1.087-.59.373-.592.373-1.73 0-1.144-.373-1.733-.373-.588-1.088-.588-.714 0-1.08.586-.364.585-.364 1.735zM165.608 73.066q-.247.629-.628 1.655-.532 1.418-.714 1.73-.247.418-.618.628-.37.21-.865.21h-.795v-.828h.586q.435 0 .682-.253.247-.252.628-1.305l-2.325-5.919h1.047l1.783 4.705 1.757-4.705h1.047zM167.893 72.336v-.924h6.837v.924zM174.893 72.336v-.924h6.837v.924zM181.893 72.336v-.924h6.837v.924zM188.893 72.336v-.924h6.837v.924zM195.893 72.336v-.924h6.837v.924zM202.893 72.336v-.924h6.837v.924zM209.893 72.336v-.924h6.837v.924zM216.893 72.336v-.924h6.837v.924zM223.893 72.336v-.924h6.837v.924zM230.893 72.336v-.924h6.837v.924zM240.879 78.32v-5.984h-2.986v-.924h3.845v6.907z"/><path d="M275.879 78.32V64.3h.86v14.02z" fill="#FF9300"/><path d="M132.893 59.336v-.924h6.837v.924zM139.893 59.336v-.924h6.837v.924zM146.893 59.336v-.924h6.837v.924zM153.893 59.336v-.924h6.837v.924zM160.893 59.336v-.924h6.837v.924zM167.893 59.336v-.924h6.837v.924zM174.893 59.336v-.924h6.837v.924zM181.893 59.336v-.924h6.837v.924zM188.893 59.336v-.924h6.837v.924zM195.893 59.336v-.924h6.837v.924zM202.893 59.336v-.924h6.837v.924zM209.893 59.336v-.924h6.837v.924zM216.893 59.336v-.924h6.837v.924zM223.893 59.336v-.924h6.837v.924zM230.893 59.336v-.924h6.837v.924zM237.893 59.336v-.924h2.986v-7.111h.86v8.035z"/><path d="M275.879 65.32V51.3h.86v14.02z" fill="#FF9300"/><path d="M97.893 46.336v-.924h6.837v.924zM104.893 46.336v-.924h6.837v.924zM111.893 46.336v-.924h6.837v.924zM118.893 46.336v-.924h6.837v.924z" fill="#0096FF"/><path d="M128.879 52.32V38.3h.86v14.02zM240.879 52.32V38.3h.86v14.02z"/><path d="M245.032 46.143l6.558-3.277v6.553zM251.893 46.336v-.924h6.837v.924zM258.893 46.336v-.924h6.837v.924zM265.893 46.336v-.924h6.837v.924zM275.879 52.32v-5.984h-2.986v-.924h3.845v6.907z" fill="#FF9300"/><path d="M97.893 33.336v-.924h6.837v.924zM104.893 33.336v-.924h6.837v.924zM111.893 33.336v-.924h6.837v.924zM119.032 36.419v-6.553l6.558 3.277z" fill="#0096FF"/><path d="M128.879 39.32V25.3h.86v14.02zM240.879 39.32V25.3h.86v14.02z"/><path d="M244.893 33.336v-.924h6.837v.924zM251.893 33.336v-.924h6.837v.924zM258.893 33.336v-.924h6.837v.924zM265.893 33.336v-.924h6.837v.924zM272.893 33.336v-.924h2.986v-7.111h.86v8.035z" fill="#FF9300"/><path d="M128.879 26.32v-6.908h3.851v.924h-2.992v5.983zM132.893 20.336v-.924h6.837v.924zM145.645 19.272V23h-.994v-3.728q0-.81-.284-1.192-.285-.381-.892-.381-.693 0-1.066.491-.373.492-.373 1.41V23h-.989v-8.357h.989v3.244q.263-.516.714-.782.451-.266 1.069-.266.918 0 1.372.605.454.604.454 1.828zM150.298 15.276v1.708h2.245v.768h-2.245v3.266q0 .666.252.93.253.262.881.262h1.112V23h-1.209q-1.111 0-1.568-.446-.456-.446-.456-1.536v-3.266h-1.606v-.768h1.606v-1.708zM157.63 17.597q.183-.387.465-.572.282-.186.68-.186.725 0 1.023.562.298.56.298 2.113V23h-.902v-3.443q0-1.273-.142-1.582-.143-.308-.519-.308-.43 0-.588.33-.158.33-.158 1.56V23h-.903v-3.443q0-1.289-.153-1.59-.153-.3-.55-.3-.392 0-.546.33-.153.33-.153 1.56V23h-.897v-6.016h.897v.516q.178-.322.444-.491.265-.17.604-.17.408 0 .68.188.27.188.42.57zM164.862 20.825q0 .666.244 1.004.245.338.723.338h1.154V23h-1.251q-.886 0-1.372-.567-.486-.566-.486-1.608v-5.441h-1.585v-.774h2.573zM167.893 20.336v-.924h6.837v.924zM174.893 20.336v-.924h6.837v.924zM181.893 20.336v-.924h6.837v.924zM188.893 20.336v-.924h6.837v.924zM195.893 20.336v-.924h6.837v.924zM202.893 20.336v-.924h6.837v.924zM209.893 20.336v-.924h6.837v.924zM216.893 20.336v-.924h6.837v.924zM223.893 20.336v-.924h6.837v.924zM230.893 20.336v-.924h6.837v.924zM240.879 26.32v-5.984h-2.986v-.924h3.845v6.907z"/><path d="M275.879 26.32V12.3h.86v14.02zM273.032 10.419l3.277-6.553 3.281 6.553z" fill="#FF9300"/></svg>


Notice that you can follow the path the event takes down to the element that received the click.

For any button we click on in our DOM, we can be sure that the event will bubble back out through our parent `ul` element. We can exploit this feature of the event dispatcher, combined with our defined hierarchy to simplify our implementation and implement Delegated Events.

## Delegated Events

Delegated events are events that are attached to a parent element, but only get executed when the target of the event matches some criteria.

Let's look at a concrete example and switch back to our toolbar example DOM from before:

[[figure| Our example Markup again. ]]
| ```html
| <ul class="toolbar">
|   <li><button class="btn">Pencil</button></li>
|   <li><button class="btn">Pen</button></li>
|   <li><button class="btn">Eraser</button></li>
| </ul>
| ```

So, since we know that any clicks on the button elements will get bubbled through the `UL.toolbar` element, let's put the event handler _there_ instead. We'll have to adjust our handler a little bit from before:

[[figure|Using a delegated event.]]
| ```js
| var toolbar = document.querySelector(".toolbar");
| toolbar.addEventListener("click", function(e) {
|   var button = e.target;
|   if(!button.classList.contains("active"))
|     button.classList.add("active");
|   else
|     button.classList.remove("active");
| });
| ```

That cleaned up a lot of code, and we have no more loops! Notice that we use `e.target` instead of `e.currentTarget` as we did before. That is because we are listening for the event at a different level.

* `e.target` is _actual_ target of the event. Where the event is trying to get to, or where it came from, in the DOM.
* `e.currentTarget` is the current element that is handling the event.

In our case `e.currentTarget` will be the `UL.toolbar`.

## More Robust Delegated Events

Right now, we handle any click on any element that bubbles though `UL.toolbar`, but our matching strategy is a little too simple. What if we had more complicated DOM that included icons and items that were supposed to be non-clickable

[[figure| A more complex markup example. ]]
| ```html
| <ul class="toolbar">
|   <li>
|     <button class="btn">
|     <i class="fa fa-pencil"></i>
|     Pencil
|     </button>
|   </li>
|   <li>
|     <button class="btn">
|       <i class="fa fa-paint-brush"></i>
|       Pen
|     </button>
|   </li>
|   <li class="separator"></li>
|   <li>
|     <button class="btn">
|       <i class="fa fa-eraser"></i>
|       Eraser
|     </button>
|   </li>
| </ul>
| ```

_\*OOPS!\*_

Now, when we click on the `LI.separator` or the icons, we add the `active` class to _that_ element. That's not cool. We need a way to filter our events so we only react to elements we care about, or if our `target` element is contained by an element we care about.

Let's make a little helper to handle that:

[[figure|A higher-order function to help simplify event delegation.]]
| ```js
| var delegate = function(criteria, listener) {
|   return function(e) {
|     var el = e.target;
|     do {
|       if (!criteria(el)) continue;
|       e.delegateTarget = el;
|       listener.apply(this, arguments);
|       return;
|     } while( (el = el.parentNode) );
|   };
| };
| ```

This helper does two things, first it walks though each element and their parents to see if it matches a criteria function. If it does, then it adds a property to the event object called `delegateTarget`, which is the element that matched our filtering criteria. And then invokes the listener. If nothing matches, the no handlers are fired.

We can use it like this:

[[figure|Using the helper...]]
| ```js
| var toolbar = document.querySelector(".toolbar");
|
| var buttonsFilter = function(elem) {
|   return elem.classList && elem.classList.contains("btn");
| };
|
| var buttonHandler = function(e) {
|   var button = e.delegateTarget;
|   if(!button.classList.contains("active"))
|     button.classList.add("active");
|   else
|     button.classList.remove("active");
| };
|
| var delegatedHandler = delegate(buttonsFilter, buttonHandler);
| toolbar.addEventListener("click", delegatedHandler);
| ```

Now, that's what I'm talking about: A single event handler, attached to a single element that does all the work, but only does it on the elements that we care about and will react nicely to elements added or removed from the DOM dynamically.

## Wrapping up

We've looked at the basics of how to implement event delegation in pure JavaScript in order to reduce the number of event handlers we need to generate or attach.

There are a few things I would do, if I were going to abstract this into a library, or use it for production level code:

* Create helper functions to handle criteria matching in a unified functional way. Perhaps something like:

  [[figure|Criteria helpers...]]
  | ```js
  | var criteria = {
  |   isElement: function(e) { return e instanceof HTMLElement; },
  |   hasClass: function(cls) {
  |     return function(e) {
  |       return criteria.isElement(e) && e.classList.contains(cls);
  |     }
  |   }
  |   // More criteria matchers
  | };
  | ```

* A partial application helper would also be nice:
  [[figure|A partial application of delegate.]]
  | ```js
  | var partialDelgate = function(criteria) {
  |   return function(handler) {
  |     return delgate(criteria, handler);
  |   }
  | };
  | ```

If you have any suggestions or improvements, send me a message! Happy coding!