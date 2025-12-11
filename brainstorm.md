# **Idea:**
My overall goal is to build a simple top-down exploration game using HTML, CSS, and JavaScript.You basiaclly have to move around different areas, meet NPCs, pick up items, and explore a small open world. The focus is on exploring a world that feels connected and interesting, with a slight emphasis on combat or complex mechanics.
ddd

# **What I'm Planning on  Including:**
- A main character (player)
- Movement for the character
- Basic collision detection
- A pretty basic map/world (still stuck on the theme tho)
    - Also idk if I want to do a tile map or basic image
- NPCs to interact with
- Treasures to interact with across the map
- Each NPC takes you to their "world"
dfgsdg

# **Map:**
I'm still thinking about how to make the map work. I can either just have a background image or I can make a 2D array. The second is probably better. 

The 2D Array would be like a tilemap


4. World Structure

You’ll build several small zones instead of one giant map. Examples:

Forest Entrance

Deep Forest

Village Center

Mountain Path

At specific boundaries or “portal” tiles, the game switches to another map.

# **Code and Logic:**
These are some code things I know I will need:

- I'll need to create a game loop
- I need to update player movement and redraw to the canvas
- Collision detection, so I'll need to assign hitboxes
