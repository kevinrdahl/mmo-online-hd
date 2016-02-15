#MMO Online HD
MMO Online HD is basically a browser MMO, targeting up to date versions of Chrome and Firefox. If you have a bug in one of those browsers, tell me. If you're running something else, don't. So far, Edge seems to work as well. I'll try to continue supporting it.

This is nowhere near done, so pay it no mind.

---
###Round Two 
MMO Online was a learning experience. I learned a *lot* about JavaScript, got to make skellingtons, and basically made a lot of my own nifty tech. It's also a mess. MMO Online HD aims to be much better organized, in part by pulling in a bunch of other, more established tech.
#####pixi.js
Super fast 2D WebGL engine, with gobs of features. It has a canvas fallback too, not that target users will need that.
#####CreateJS
SoundJS lets me play sound on pretty much anything, but Firefox seems to dislike volume control. Between pixi.js and SoundJS, asset loading is covered.
#####Improved Latency Compensation
The old system was modelled somewhat after TCP's "ramp up, fall back" mechanism. This meant that hiccups were guaranteed at semiregular intervals, and it was hard to make it behave exactly the way I wanted it to. The new model uses a weighted moving average, with a configurable aggressiveness. Neat.
#####Better Practices
As it turns out, pretty much all the "nice" parts of JavaScript (callbacks, closures, dynamic objects, etc) make your codebase awful. I've been striving to treat it like any other OO language most of the time, and this has made the design aspect a lot more friendly. To this end, I'm using jsface to provide some semblance of Class functionality.

---
###Misc Learning
* Drastically reducing code clarity for minor speed improvements: NOT worth it.
* Wherever possible, avoid adding properties to objects, or deleting existing ones. This changes their "hidden class", undoing any optimizations the JavaScript engine has done.
* Similarly, always try to pass the same types of variables to a function. This lets the engine optimize better.
* Disposable objects are actually pretty expensive compared to other OO languages. Internal messages, requests, events, etc should be minimized or recycled. Async I/O makes this a little easier.
* Use native functions whenever possible. They're WAY faster.
* Do NOT use array.sort() for insertion sort. Most implementations barely benefit from mostly-sorted data.
