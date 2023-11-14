---
title: Let's Write a MPEG-2 Decoder in Go
pubDate: 2023-11-13
authorDate: 2013-11-05
tags: ["mpeg2", "go"]
---
Looking back over my career so far as a programmer, there have been a lot of things that I'm really proud of working on/figuring out. However, one thing&mdash;to me&mdash;easily stands out above the rest as an "achievement". While it is not the "best" thing I've ever engineered &ndash; hell, if I'm going to be honest, it really wasn't even that *good*, really &ndash; it was one of those projects where when I finally got it working, I felt *amazing*. I wrote a MPEG-2 frame decoder&hellip; in managed C#&hellip; from scratch&hellip;

Now, a lot of people that I tell that to, their first reaction is "&hellip;uhh, why?" If present-me were to interrogate earlier-me, I would probably ask the same question!

A little back-story: It was early in my career, and in some ways I hadn't even figured out what my "career" was yet. I was fresh out of college with a degree in Computer Animation. and  I was struggling to find work as a designer/programmer. I ended up taking a job at a small, but established, local software company. It wasn't the most glamorous work, but it was work and it was better than living hand-to-mouth as a struggling animator.

I was hired on as a graphic designer, but it quickly leaked out that I had some experience writing code and my value to the company as a "resource" sky-rocketed. I was bounced around the company and onto different projects and into different job titles; always into more and more technical roles. It was interesting work and it played to my strong-suit at the time: The quintessential "Cowboy Programmer". I was an ADD kid with a problem with procrastination, bred in a company culture of "get-shit-done". I think if you would have asked me at the time, I would have told you I was happy. But honestly, I was in over my head; over-worked, under-paid, and vastly under-experienced for what I was about to attempt, on a path to a flame-out. But that's an entirely different story.

The project I ended up on needed to browse and extract frames of video from multiple HD video cameras. The cameras were connected to their hosts via firewire and streamed MPEG-2 in a transport stream. The hosts networked together and needed to simultaneously capture, synchronize and edit video from multiple sources. We hand rolled most of our stack, piecing together what we could with duct-tape and spit &ndash; quite literally sometimes &ndash; to try to construct a working prototype. I can't remember *why* exactly, but it was decided that I would write a C# MPEG-2 decoder to grab frames of video out of the streams. I am pretty sure that I said in a meeting one day: "How hard can it be?". I did not know enough to know how much I did not know&hellip;

I spent the next few weeks burying myself in the ISO spec for MPEG-2, trying to comprehend and translate the algorithms and patterns described. I had no formal training in design patterns or even a solid mathematical background &ndash; I was an art student! I poured through every resource I could find, trying to understand and reconstruct just a single frame of from the raw source that came off the camera.

Finally hunched at my laptop in my tiny apartment on one Saturday afternoon, working on a weekend when I probably should have been out living, I compiled and ran my code and out popped an image: It worked! I felt like a god.

In retrospect, the code was hideous, poorly formed and barely readable. But in the process, I had learned about discrete cosine transformations, motion prediction, Huffman codes, bit stream reading, pumps and sinks. I had been introduced to a ton of other interesting concepts and how they applied not to image and video compression, but to software development in general.

I had a crash course in writing high performance C# code and trying to find nasty `unsafe` bugs and memory leaks. But perhaps the more lasting impact to myself as a developer, was introduced to TDD and it started to "make sense". And while it was not until much until much later in my career to be fully on the TDD boat, I can look back at that experience as a huge push in the right direction, away from being a "cowboy" to being a "team member".

I have long since gotten fired from that job, and moved onto other things, honed my craft and become a much better programmer and person than I was back in those days. But that one project has always stuck with me as being pretty massive personal achievement.

However, one thing that stuck me was how *few* resources there were about what I was trying to do. Almost all of the code I found was highly optimized, unreadable, and/or poorly documented. Most resources just talked about passing the stream on to a lower level library or service and relying on the dependency to render, but very few actually explained what was *actually* happening. Which is great if you are trying to watch a movie, but not so great if you want to understand whats going on.

To me, that's a shame, because there are a lot of interesting things going on under the covers when you watch a DVD.

So, in order to rectify that, I'm going to try to present a deep-dive into implementing an MPEG-2 decoder in [golang](http://golang.org). Hopefully, it will be an educational and informative look at video decoding &ndash; not only the "how" but a look at the "why". It is important to note that this is not an implementation that will overly focus on optimizations; the primary goal is to teach and provide a look at the underlying concepts.

I don't have access to the original code I wrote all those years ago, and even if I did I wouldn't *want* to use it. I'm choosing to write this in go because I think go is a really great "low"-ish level language, yet still maintains it readability. I also think that exploring the concurrency model that go provides may be useful in respect to video decompression. So, if you are new to go then this might be a good way to learn a new language. And if you are interested in video decoding, but go isn't your language, then hopefully you will be follow along and get an idea of whats going on.

So let us being! Let's learn how to write an [MPEG-2 decoder](https://github.com/32bitkid/mpeg) from scratch!
