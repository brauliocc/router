# Router - Daily Routine Tracker

## Overview
A daily routine tracking app that helps users manage tasks that must be completed at the end of the day or week. Features include streaks, task swapping/alternatives, and a light-hearted pastel color theme.

## Features
- **Daily Tasks**: Tasks that reset daily with streak tracking
- **Weekly Tasks**: Tasks with weekly progression that reset each week
- **Task Swapping**: Swap tasks with predefined alternatives (e.g., swap "Cardio" for "Tennis")
- **Streak Tracking**: Visual fire emoji streak counter for daily tasks
- **Add/Delete Tasks**: Create custom tasks with alternatives
- **Persistent Storage**: Uses localStorage to save progress

## Tech Stack
- React 18
- Vite 5
- CSS3 with pastel color variables

## Project Structure
```
/
├── src/
│   ├── App.jsx       # Main application component
│   ├── App.css       # Component styles
│   ├── main.jsx      # React entry point
│   └── index.css     # Global styles and CSS variables
├── public/
│   └── vite.svg      # App icon
├── index.html        # HTML template
├── vite.config.js    # Vite configuration
└── package.json      # Dependencies
```

## Running the App
- Development: `npm run dev` (runs on port 5000)
- Build: `npm run build`
- Preview: `npm run preview`

## User Preferences
- Pastel color theme (baby pink, blue, yellow, green)
- Light-hearted, friendly UI
- Mobile responsive design
