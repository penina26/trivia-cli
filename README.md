# 🧠 JavaScript Trivia CLI – Summative Lab

This project is a command-line trivia game built with Node.js and vanilla JavaScript.  
It was developed as a summative lab to practice handling user input, managing program flow, working with arrays and objects, and using asynchronous JavaScript with timers.

---

## 🎯 Lab Goals

The CLI quiz is designed to meet these lab objectives:

- Allow users to:
  - Start a quiz game
  - View questions sequentially
  - Select answers (single choice and multi-select)
  - Type free-text answers
  - Receive instant feedback after each question
  - See a final summary when the quiz ends
- Implement:
  - A **global timer** limiting the total time for the quiz
  - **Per-question timing** (how long each question took)
  - Core JavaScript features: functions, arrays, objects, loops, and array methods
  - A user-friendly terminal interface

---

## ✨ Features

- **Mixed question types**
  - `mcq` – single-choice multiple-choice questions  
  - `text` – open-ended questions where the user types the answer  
  - `multi` – multi-select questions (e.g. `1,3,4`)

- **Global quiz timer**
  - A single time limit for the whole quiz (configurable, e.g. `60` seconds)
  - Timer runs in the background and ends the game when time is up
  - Remaining time is shown whenever each new question is displayed

- **Per-question timing**
  - Measures how many seconds the user spent on each question
  - Summary includes per-question time and average time per question

- **Immediate feedback**
  - Shows whether each answer is correct or incorrect
  - Displays the correct answer(s) when the user is wrong

- **Final summary**
  - Number of questions attempted
  - Number of correct answers
  - Percentage score
  - Total time used
  - Average time per question
  - Per-question breakdown (correct/incorrect + time taken)

---

## 🧩 Question Structure

Questions are stored in an array of objects with a `type` field:

```js
const questions = [
  {
    type: "mcq",
    question: "Which keyword declares a constant in JavaScript?",
    choices: ["var", "let", "const", "static"],
    correctIndex: 2,
  },
  {
    type: "text",
    question: "What is the strict equality operator in JavaScript?",
    answer: "===",
  },
  {
    type: "multi",
    question: "Which of the following are JavaScript primitive types?",
    choices: ["number", "object", "string", "boolean", "Array"],
    correctIndices: [0, 2, 3],
  },
];
