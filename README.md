# My Website

## Overview

This repository houses a personal portfolio website, showcasing my digital board games and coding project work. The site is built using standard HTML, CSS, and JavaScript. 

## Proposed Organization of Folder Structure 

To organize my website in a user-friendly but extensible manner, I'm going with the tree shown below.   
1. Easy navigation: Links between landing page and projects are just relative paths (./projects/project-1/)  
2. Centralized management: One repo to clone, one place to manage issues  
3. Showcases everything: See all my work in one place  
4. Learning-friendly: Easy to see my progression across projects as I learn to develop websites  

```
my-portfolio/
├── assets
│   ├── css
│   │   └── style.css
│   └── images
│       └── favicon.svg
├── CNAME
├── index.html
├── projects
│   ├── project-1
│   │   ├── assets
│   │   │   ├── css
│   │   │   │   └── style.css
│   │   │   └── images
│   │   │       └── BH-Game-Img.png
│   │   ├── black-hole-game
│   │   │   ├── assets
│   │   │   │   ├── css
│   │   │   │   │   └── style.css
│   │   │   │   └── js
│   │   │   │       ├── computer.js
│   │   │   │       ├── config.js
│   │   │   │       ├── firebase.js
│   │   │   │       ├── game.js
│   │   │   │       ├── main.js
│   │   │   │       ├── online.js
│   │   │   │       └── ui.js
│   │   │   └── index_bh.html
│   │   ├── index_pnp.html
│   │   └── mem-game
│   │       ├── assets
│   │       │   ├── css
│   │       │   │   └── style.css
│   │       │   └── images
│   │       └── index_mem_game.html
│   └── project-2
│       ├── assets
│       │   ├── css
│       │   │   └── style.css
│       │   └── images
│       │       └── BH-Game-Img.png
│       ├── index_projs.html
│       └── proj-ISP
│           ├── assets
│           │   ├── css
│           │   │   └── style.css
│           │   └── images
│           │       └── ISPspeeds.png
│           └── index_ISP.html
└── README.md
└── .gitignore
```

From the landing page, connect to various projects as such:  

```
<a href="./projects/project-1/" class="project-link">View Project →</a>
<a href="./projects/project-2/" class="project-link">View Project →</a>
```
