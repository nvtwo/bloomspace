# Bloomspace 🌱

**Make room for growth.** A soft, pastel productivity dashboard for daily tasks, habits, and mood check-ins.

## Features

- Daily overview with progress calculations
- Add, complete, and delete tasks
- Add and complete daily habits
- Daily mood check-in
- Search tasks
- Light/dark appearance toggle
- Responsive layout for desktop and mobile
- Browser persistence with `localStorage`
- GitHub Pages deployment using GitHub Actions

## Tech stack

React, Vite, JavaScript, CSS, Lucide React, localStorage, GitHub Pages.

## Run locally

Install Node.js (LTS), then in this folder run:

```bash
npm install
npm run dev
```

Open the local URL Vite prints in your terminal.

## Production build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Create a GitHub repository named `bloomspace`.
2. Push the project files to the `main` branch.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions** as the source.
5. Open the **Actions** tab and wait for **Deploy Bloomspace to GitHub Pages** to finish.
6. Your website URL will appear in **Settings → Pages**.

The included workflow builds the project and publishes the `dist` folder. The Vite config uses a relative base path so it can work as a project site.

## Notes

- The app stores tasks, habits, and the current mood in the browser's localStorage.
- Data is local to the browser/device and is not synchronised between devices.
- The dashboard starts with sample tasks and habits to demonstrate the UI.
- Google Fonts are loaded from an external service; the app still has fallback fonts if unavailable.
