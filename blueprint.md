# Kids Study App Blueprint

## Overview

A simple and engaging web application for kids to access study materials for different classes. The app features a modern, responsive UI and a hidden admin panel for content management.

## Design & Features

### General

*   **Responsive Design:** The application is fully responsive and works on all devices.
*   **Modern Aesthetics:** Clean and modern design with a vibrant color palette, custom fonts, and subtle animations.
*   **Interactive Elements:** Hover effects and transitions to enhance user experience.
*   **Accessibility:** The app is designed to be accessible to all users.

### Main App (`index.html`, `style.css`, `main.js`)

*   **Class Selection:**
    *   A grid of interactive cards representing different classes.
    *   Each card has a unique icon and a smooth hover effect.
    *   The layout adjusts automatically to the screen size.
*   **Header:**
    *   A clean header with the app title.
*   **Content Display:**
    *   When a class is selected, the app will display the relevant study materials in a clear and organized manner.

### Admin Panel (`admin.php`, `admin.css`, `admin.js`) - **Phase 1 Complete**

*   **Offline First:** All libraries are localized for offline access.
*   **File-Based CMS:** A complete file explorer, editor, and publisher that allows an administrator to manage the content of the `Content` directory.
*   **Dynamic Content Loading:** The admin panel dynamically loads and saves content, which is then published to a `content-data.js` file for the main app to consume.

## Current Plan: Build the Main User Interface

1.  **Create the main page (`index.html`):** Design a welcoming and intuitive page that invites students to select their class. This will feature a responsive grid of "class cards."
2.  **Style the application (`style.css`):** Implement a modern and visually appealing design using advanced CSS features like container queries, custom properties, and modern color spaces for a vibrant look and feel.
3.  **Add interactivity (`main.js`):** Use modern JavaScript (ES Modules, async/await) to handle class selection and dynamically display the study content fetched from the `content-data.js` file.
