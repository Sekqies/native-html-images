Our graphics engine is done!

Or as done as it can be, really. A true graphics engine would have many other things: textures, multicolored meshes, fragment shaders, interpolation and many other things that are a consequence of the literal decades put into developing this area. It is, however, _good enough_, when you take into account the limitations that svg imposes upon us.

First things first, a careful eye might have noticed that the last rendering scene missed a certain 'reflection' you get from illuminating most objects. Think of the litte white spot you see in a billiard ball when it's put against a light source - this is something that emerges naturally whenever you have a reflective surface, because it's just a result of light reflecting on it and going directly to your eyes. 
To make our rendered meshes have the same effect, we implement something called the Phong reflection model, which is the "algorithm" (or, to better put it, formulas) to calculate the light that'll go to our eyes. This is a relatively expensive operation (involves exponentiating by 64), so I left it as an optinal feature, per object.

Second, and the reason that I'm saying that the engine is "complete", is that we can now just read data from an `.obj` file and it will be rendered to the screen (after I wrote the parser for it, of course).
We can render meshes with a surprisingly high number of triangles with this method. I could, (running at around ~3 fps), render a model of the Eiffel Tower with over 400k triangles!
Attached, renders of some more complex 3D models!

**Commits**
[Commit 9b2fdb3](https://github.com/Sekqies/native-html-images/commit/9b2fdb380168e8b45290ce3911ab5e9e0c30f234): Added specular lighting
[Commit e91435b](https://github.com/Sekqies/native-html-images/commit/e91435b7ee373333b1a42de204adcc528b3571d7): Adedd obj parsing