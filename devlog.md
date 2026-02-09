We got some new optimizations, one of which provides a visual effect. Also, news!

First of all, getting the purely optimizations things out of the way: we're stepping out of manually manipulating strings. I noticed that in my old benchmark, 8.2% of the time was being used in `build_3d_svg`. At first i found this to be weird, since this function is purely string manipulation, but, as it turns out, this is exactly the issue. String reallocation is expensive, and since they aren't mutable in Javascript, I can't just edit a pre-existing string.
The solution to this is representing the strings as what they should be, character arrays. This involved the creation of a new helper class, StringBuffer, that represents strings as an uInt8 typed array, and the necessary helper functions to convert strings and numbers into this byte array method.

Another thing: I thought I wouldn't be able to use the `stroke` and `fill` attributes of svg because i thought this project could also be submitted to the #flavorless challenge. As it turns out, it isn't. So I get this freedom which, in turn, means I'll get to actually _color_ my 3D meshes. 
If you've done 3D rendering in OpenGL before, you'll likely be familiar with the GL_DEPTH_TESTING that you enable so two meshes in different z positions don't merge together. This is a nice bonus that comes pre-made, but, as with everything in our project, we had to implement ourselves through a technique called Painter's Algorithm. Usually, this is done through a technique called z-buffering, but this doesn't work for our svg based project, because it requires you to have pixels (while the only thing we have here are vertices). 

And, one last optimization: backface culling. We simply don't draw vertices facing away from the camera.

**Commits**
[Commit f10e698](https://url.jam06452.uk/u0uj8u): Optimized string writing to use fixed-size buffer
[Commit 07573cd](https://url.jam06452.uk/103qgwe): Depth sorting & Backface culling