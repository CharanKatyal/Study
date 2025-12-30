
# Kids Study App Blueprint

## Overview

A simple and engaging web application for kids to access study materials for different classes. The app features a modern, responsive UI and a hidden admin panel for content management.

## Design & Features

### General

*   **Responsive Design:** The application is fully responsive and works on all devices.
*   **Modern Aesthetics:** Clean and modern design with a vibrant color palette, custom fonts, and subtle animations.
*   **Interactive Elements:** Hover effects and transitions to enhance user experience.

### Main App (`index.html`, `style.css`, `main.js`)

*   **Class Selection:**
    *   A grid of interactive cards representing different classes.
    *   Each card has a unique icon and a smooth hover effect.
    *   The layout adjusts automatically to the screen size.
*   **Header:**
    *   A clean header with the app title.
    *   The admin panel link is hidden from the main view.

### Admin Panel (`admin.html`, `admin.css`, `admin.js`)

*   **Content Management:**
    *   A form to add new study content, including class, subject, and the content itself.
    *   A list to display existing content.
*   **Modern UI:**
    *   A user-friendly interface with a professional look and feel.
    *   The layout is responsive and easy to use on any device.
*   **Functionality:**
    *   The form currently logs the new content to the console and adds it to the sample data.

## Current Plan

*   The immediate next step is to replace the sample data with a persistent storage solution, such as Firebase Firestore, to make the content management functional.
