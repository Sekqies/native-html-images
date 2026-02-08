    No new features for you! This time developing was dedicated almost entirely to refactoring our render pipeline so it's easier to use. 

    A graphics engine is pretty general-use, for once I have one up and running, I'm free to do essentially whatever I feel like. The problem is the quick graphics system I built yesterday is kind of bad. 
    When I was writing my last devlog, I wanted to make a quick demo scene to show the rendering engine up and running. In doing so, I realized that the way I had structured my data pipeline was kind of all over the place, and required me to keep track of a bunch different buffers, that I was cloning and moving every draw frame. I took a quick look at my performance graph, and found that 6% of usage was in the `rasterize` function, which allocated memory every time a new frame was called.

    We can't be having that. So, I decided to refactor my system to use a `Mesh` structure that holds three distinct buffers: our vertices, those vertices after being transformed, and them after being rasterized. This way, I allocate memory once, and modify these buffers at runtime, whenever needed.
    This required to rewrite _every_ step of my rendering pipeline, including most of our matrix math, to mutate instead of copy and return. This is particularly annoying, because javascript passes object by reference (good!) but you can't reassign them (bad), and it doesn't throw a warning if you try to.

    Anyways, everything is now done! This leaves us free to try to further optimize the `<svg>`, or pivot into actually doing anything with our engine.
    Attached, the new performance results!

    Obs: I thought this would be a quick refactor, and didn't plan ahead. No issues nor modularization of commits in this one :\(

    **Commits**
    [Commit 5d1a342](https://github.com/Sekqies/native-html-images/commit/5d1a34267f30762c0e1550e14240dc450b4d9bc5): Refactor to use mesh system