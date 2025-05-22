console.log("index.js script started!");

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Ensure this points to the renamed App.js

const rootElement = document.getElementById('root');
if (!rootElement) {
 console.error("Could not find root element to mount to");
} else {
 console.log("Root element found:", rootElement);
 const root = ReactDOM.createRoot(rootElement);
 root.render(
   // <React.StrictMode> // StrictMode can sometimes cause double renders/effects in dev, let's simplify for now
     <App />
   // </React.StrictMode>
 );
 console.log("React app rendering initiated.");
}

console.log("index.js script finished.");