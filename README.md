# Interactive 3D Solar System
**Created by:** [vivek yadav]
**Assignment:** Frontend Developer Assignment
## Project Overview
This project is a mobile-responsive, interactive 3D simulation of the solar system built using the **Three.js** JavaScript library. It demonstrates key concepts in 3D rendering, scene creation, object animation, and user interactivity, with a focus on pure JavaScript for all logic and animations.
---
## Features
-   **Full 3D Scene:** The Sun at the center with all 8 planets (Mercury to Neptune) orbiting it.
-   **Real-Time Speed Controls:** A UI panel with sliders to adjust the orbital speed of each planet individually.
-   **Interactive Camera:** Full mouse controls to **Orbit** (left-click + drag), **Zoom** (scroll wheel), and **Pan** (right-click + drag).
-   **Click-to-Focus:** Clicking on any planet triggers a smooth "fly-to" animation to focus on it. A "Reset Camera" button animates the view back to the default position.
-   **Hover Tooltips:** Hovering the mouse over a planet displays its name.
-   **UI Controls:**
    -   **Pause/Resume:** A button to freeze and unfreeze the entire animation.
    -   **Dark/Light Theme:** A toggle to switch between a dark, space-themed UI and a bright, light-themed one.
-   **Performant Animations:** Uses `requestAnimationFrame` and a time-delta based loop for smooth, consistent motion across all devices.
---
## How to Run the Project
This project uses modern JavaScript modules (`import`). For security reasons, browsers do not allow these modules to be loaded from local files directly (`file://` protocol). Therefore, you need to run it through a local web server.
**The easiest way is using the "Live Server" extension in Visual Studio Code.**
1.  **Prerequisites:**
    -   [Visual Studio Code](https://code.visualstudio.com/)
    -   [Live Server Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) installed in VS Code.
2.  **Steps:**
    -   Open the project folder in Visual Studio Code.
    -   In the VS Code explorer panel, right-click on the `index.html` file.
    -   Select **"Open with Live Server"** from the context menu.
    -   A new tab will automatically open in your default browser with the project running.
---
## Core Technical Concepts
A few key architectural decisions were made to ensure the project is both efficient and maintainable.
### 1. The "Orbit Pivot" Trick
To create planetary orbits without complex trigonometry in the animation loop, a scene hierarchy pattern was used:
-   An invisible `Object3D` (acting as a pivot) is placed at the center of the scene.
-   The planet's mesh is added as a child to this pivot, offset by its orbital distance.
-   The animation loop simply rotates the invisible pivot, causing the planet to travel in a perfect circle.
### 2. State Machine for Camera Control
To handle the camera's behavior smoothly, a simple state machine was implemented:
-   A `cameraMode` variable tracks the current state: `FREE_ROAM`, `FOCUSING`, or `RESETTING`.
-   User actions (like clicking a planet or the reset button) only change this state variable.
-   The animation loop reads the state on each frame and executes the appropriate camera animation (`lerp` for smooth transitions), ensuring no conflict between user-controlled and scripted movements.

