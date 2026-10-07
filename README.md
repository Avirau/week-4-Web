# Vanilla JS Image Slider — Wild Forest Gallery

A dependency-free, infinitely-looping image slider built with plain HTML, CSS and JavaScript.

## Files
- `index.html` — slider markup and the 5 sample slides
- `style.css` — overflow mask, flex sliding track, controls, responsive media queries
- `slider.js` — `ImageSlider` class: clone-based infinite loop, dots, arrows, swipe, autoplay
- `images/` — sample forest images (see note below)

## Run locally
Open `index.html` directly in a browser, or serve the folder with any static file server.

## Note on the images
The five forest images included here are original illustrations generated for this
project (layered tree shapes, gradient skies) — not photographs — since this
environment has no access to external photo sites. Swap them for your own real
forest photos any time: just keep the filenames `forest-1.jpg` … `forest-5.jpg`,
or edit the `<img src>` paths in `index.html` to point at your new files.

## Deploy on GitHub Pages
1. Create a new **public** repository on GitHub.
2. Push `index.html`, `style.css`, `slider.js` and `images/` to the main branch.
3. In the repository, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch** → `main` → `/ (root)`.
5. Open the URL GitHub gives you once Pages finishes building.
