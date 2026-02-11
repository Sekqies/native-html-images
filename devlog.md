We are now doing things with `path` and `fill` (and properly depth sorting)

Since we couldn't draw anything that wasn't either a black silhuette or a wireframe outline, the order in which things are drawn never really mattered. Now, it does.
In the previous devlog, I "fixed" this by sorting triangles in such a way that what is _further_ from the screen is drawn first, and what is closer, last. This way, if everything is behind this object, it will be covered by it. It was to my horror, however, that when I went to try rendering the two rotating spheres, that this _did not work, at all._

This was due to me sorting the triangles in each mesh individually rather than as global "scene" context. In simple terms:
- What we were doing: `[3,1],[5,0] => [1,3],[0,5] => [1,3,0,5]` 
- What we were _supposed_ to do: `[3,1],[5,0] => [3,1,5,0] => [0,1,3,5]`

At a high level, this is an obvious enough fix: just merge all meshes into one huge array, and sort it. But it comes with a huge problem (for a memory nut, like me): we'll be _doubling_ the memory we allocate. 
Thankfully, Javascript kindly provides us with the `subarray` method, that gives us a "view", or a reference, to a memory chunk of a larger array. Consequentially, we can create a large buffer with all the data we'll need, and give each mesh a chunk of it. 
In our program, we call that large buffer a `Scene`.

After doing all of this, I went to render the two overlapping spheres and... it didn't work? I quickly learned that this was due to the way that `<path>` works in SVG: if we want depth, we need different DOM objects, rather than a single, large one. It is bad for performance, but ultimately necessary.

With all this, we got our vertex engine done! Attached, lots of triangles!

**Commits**
[Commit eaaa1ea](https://url.jam06452.uk/1r26kdk): Created Scene object
[Commit 06e157a](https://url.jam06452.uk/vnhdm7): Finished Scene logic
[Commit df1a013](https://url.jam06452.uk/bygzl): Depth working!