And let there be light!

Simulating light is the single thing that graphics programming (and hardware!) has been developing towards in the past few decades or so. This is because, in the real world, light behaves in a very complicated manner, of which only the great GPU that runs the universe can render, so we can only ever approximate how it truly behaves. You may have heard the terms _raytracing_ or _raymarching_ before, and those are just that: approximations of how light behaves.

For our (very limited) graphics engine though, we have to do just the basics: get the color of vertex after being under the effect of multiple punctual lights. This is a task with many steps: 

First, we have to figure out where each one of our vertices are pointing. This is called a _normal_, and we use to find what the intensity of the light shining on a face will have. Logically this is a factor: if you hold your phone against the sun, the side facing it will be bright, and the one facing _you_ won't.
Then, we have to figure out the resulting light on a vertex. This is **additive**: we just have to sum all the incoming lights and intensities into one. Then, we have to take into account the object's original color for the resulting color: this is **multiplicative**
The final step is drawing these colors into the screen. Usually, we'd take the colored vertices for each triangle and interpolate them, but this is impossible in svg: we have to assign each face a single color. We do this by taking the average of each vertex.

This implies more memory usage to store everything needed: meshes, colors, lights, etc. So, as usual, a complete refactor of `Scene` to make it easier to use. 
Attached: the lights!

**Commits**
[795addc](https://url.jam06452.uk/1dmb9jx): Added lighting
[b7ce605](https://url.jam06452.uk/1dsik8b): Added normals
[1c48364](https://url.jam06452.uk/i83mp3): Lighting almost finished
[0324cd9](https://url.jam06452.uk/rstls4): Lighting working!