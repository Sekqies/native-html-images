To start, let me explain what this project is about: we want to render images without the `<img>` and `<canvas>` tags, _and_ without CSS. Because it's hilarious to do so.

The immediate idea that came to mind is transforming an W x H image into a correspoding W x H `<table>` element, where each `<td>` is a 1x1 pixel (or larger, if we want to do make-believe responsivity). A little research showed that this was technically possible, and that's good enough.
Basically, we just have to set the `cellpadding` and `cellspacing` properties of the table element to 0, and all of its `td` elements with whatever we want, and boom: we've got an image! 

Now, of course this method will have terrible performance (the DOM wasn't made for rendering thousands of elements, and all drawing is done in the CPU), so we have to do our best to make it usable. My solution, for the time being, is creating the table as a string, and then sending it to the DOM to be parsed and rendered only once. There are alternatives, but we're scraping pennies: actually _drawing_ this to the DOM is the main timesink.

On a sidenote, I forgot how much I disliked doing javascript. Starting out I didn't want to use node or any other "build system", since the project is simple enough, but using raw javascript is a drag (no types, it's hard to link modules to the main file, _lots_ of issue with WebGPU support in vscode, etc). So we're over-engineering this and using node and typescript. I'm all for bad UI, but I'm a little sensitive about my developer experience.

Attached, an [old friend](https://flavortown.hackclub.com/projects/7848), rendered with this method in a 300x300 table.
(Obs: About an hour of work time was lost because I was doing the project in the wrong git repository)

**Commits**
[Commit 49a515b](https://url.jam06452.uk/1jvo9mo): Proof of concept done
[Commit bd885d1](https://url.jam06452.uk/1efmviq): Proof of concept with image data