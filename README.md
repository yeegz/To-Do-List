# Task Board

A browser-based Kanban board built with HTML, CSS and JavaScript. Organise tasks into columns, assign priorities and due dates, and group work with coloured tags.

## Explore locally

From the repository root:

```sh
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000). The app has no package installation or build step.

## How it works

- Start with To Do, In Progress and Done, or add your own columns.
- Add tasks with a due date and priority.
- Create and assign coloured tags.
- The board state is stored locally in the browser using `localStorage`.

## Source

`index.html` defines the interface, `style.css` its presentation, and `script.js` the task state, rendering and interactions. This is a standalone frontend project; browser state is local to that browser.

[More work by Yousof Selim](https://yeegz.github.io)
