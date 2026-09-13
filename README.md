# Code Arena ⚔️

> Real-time competitive coding platform with multiplayer rooms, live countdown battles, AI algorithmic evaluation, and instant accuracy scoring.

![Code Arena](https://img.shields.io/badge/Status-Active-emerald)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange)

---

## 🚀 Features

- **Multiplayer Arena Rooms**:
  - Create or join rooms with unique 6-character room codes (e.g. `BATTLE-7X9`).
  - Configurable room capacity (from 2 up to 6 contenders: 1v1 Duels, 3-Way, Squads, or 6-Player Arenas).
  - Add or remove AI Bot contenders with simulated typing waves and organic submissions.
- **AI-Powered Code Arena Problems**:
  - Dynamic algorithmic challenge generation and search powered by **Google Gemini 2.5 Flash**.
  - Built-in curated classics bank (Two Sum, Valid Parentheses, Best Time to Buy and Sell Stock, Container With Most Water, Maximum Subarray, etc.).
  - Synchronized challenge specifications, test cases, and multi-language boilerplates across all room participants.
- **Battle Mechanics & Live Monitoring**:
  - Synchronized live countdown timer.
  - Real-time typing indicators and roster status (`Coding`, `Submitted`, `Ready`).
  - **Strict Code Editor Lock**: Monaco editor strictly enters `readOnly` mode once the timer expires (`00:00`) or after submission.
- **Multi-Language Support**:
  - Freely switch between **Python**, **C++**, **Java**, and **C** during active coding without restrictions.
  - Multi-language boilerplate and starter code preservation.
- **AI Evaluation & Accuracy Scoring**:
  - Automated evaluation via Gemini 2.5 Flash.
  - Comprehensive report: **Accuracy Score (%)**, Code Quality Score (0–100), Big-O Time & Space Complexity, Verdict (`Accepted`, `Wrong Answer`), and actionable hints.
  - **Fair Winner Rule**: The official winner must finish intime with an accepted solution (`is_correct: true`), ranked by fastest completion time, with ties broken by accuracy score.

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, Socket.io, Google Gen AI SDK (`@google/genai`).
- **Code Execution Engine**: Judge0 CE Public Sandbox & Piston API.

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key (get one at [Google AI Studio](https://aistudio.google.com/))

### 2. Backend Setup
```bash
cd server
cp .env.example .env
# Edit server/.env and add your GEMINI_API_KEY
npm install
node server.js
```
The server will run on `http://localhost:5000`.

### 3. Frontend Setup
```bash
# In project root
npm install
npm run dev
```
Open `http://localhost:5174` in your browser.

---

## 📜 License
MIT License
