# sitesentry
Time Tracker – Chrome Extension

A simple Chrome extension that tracks how much time you spend on each website. It records time in the background and displays it clearly inside a popup.

Features

Tracks time spent on each website automatically

Updates in real time while the popup is open

Saves data using Chrome Storage

Displays total time and per-site breakdown

Allows clearing all tracked data with one click

Project Structure

TimeTracker/
│── manifest.json
│── background.js
│── popup.html
│── popup.js
│── popup.css
│── style.css
│── icon16.png
│── icon48.png
│── icon128.png
│── package.json
│── package-lock.json

How to Install (Developer Mode)

Open Chrome and go to: chrome://extensions

Enable Developer Mode

Click "Load Unpacked"

Select the project folder

The extension will now appear in your browser.

Permissions Used

tabs – to detect the active website

storage – to save time spent data
