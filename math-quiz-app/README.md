# Math Practice Quiz App

A comprehensive math practice application for 6th-grade students, built with React and Tailwind CSS. Features AI-generated questions (via Google Gemini) and automated email reports (via EmailJS).

## Features

- **AI-Powered Questions:** Generates unique math questions based on selected topics using Google Gemini API.
- **Topic Selection:** Choose from Arithmetic, Fractions, Decimals, Geometry, and more.
- **Instant Feedback:** Immediate validation of answers with detailed explanations.
- **Progress Tracking:** Visual progress bar and score tracking.
- **Email Reports:** Automatically sends detailed PDF performance reports to parents/teachers.
- **Responsive Design:** Works beautifully on desktops, tablets, and mobile devices.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation & Setup

1.  **Navigate to the project directory:**
    ```bash
    cd math-quiz-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm start
    ```
    The app will open in your browser at `http://localhost:3000`.

## Configuration (Important!)

To use the AI generation and email features, you need to configure API keys within the app's "Settings" or "API Setup" menu.

1.  **Google Gemini API Key:**
    -   Get a free key from [Google AI Studio](https://ai.google.dev/).
    -   Enter it in the "Google Gemini API Key" field.

2.  **EmailJS Configuration:**
    -   Create an account at [EmailJS](https://www.emailjs.com/).
    -   Create a Service and a Template.
    -   Enter your **Service ID**, **Template ID**, and **Public Key** in the app.

**Note:** All keys are stored locally in your browser's `localStorage` for security and convenience. They are never sent to any other server.

## Troubleshooting

-   **Styling looks wrong?** Ensure you are running the app from the root `math-quiz-app` folder where `tailwind.config.js` is located.
-   **"TextEncoder is not defined" error in tests:** This project uses a polyfill in `src/setupTests.js` to handle this environment issue.

## Built With

-   React
-   Tailwind CSS
-   Lucide React (Icons)
-   jsPDF (PDF Generation)
-   EmailJS (Email Service)
