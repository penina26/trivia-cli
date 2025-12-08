"use strict";

const readline = require("readline");

// --- CLI setup ---
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// --- Config ---
const TIME_LIMIT_SECONDS = 60; // total time allowed for the whole quiz

/* 
  Questions: mix of types
  - type: "mcq"   → single correct choice
  - type: "text"  → user types the answer
  - type: "multi" → user can select more than one choice (e.g. 1,3,4)
*/
const questions = [
    {
        type: "mcq",
        question: "Which keyword declares a constant in JavaScript?",
        choices: ["var", "let", "const", "static"],
        correctIndex: 2, // "const"
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
        // Correct: number, string, boolean -> indices 0, 2, 3
        correctIndices: [0, 2, 3],
    },
    {
        type: "text",
        question: "Which keyword is used to declare a variable that can change?",
        answer: "let",
    },
];

// --- Game state ---
let currentQuestionIndex = 0;
let score = 0;
let gameOver = false;

// Each result: { question, isCorrect, timeTakenSeconds }
let results = [];

// Timer state
let startTime = null;     // when the whole quiz started
let timerInterval = null; // setInterval handle

// --- Helpers ---

function printHeader() {
    console.log("=====================================");
    console.log("🤯 JavaScript Trivia CLI");
    console.log("=====================================\n");
    console.log(`You have ${TIME_LIMIT_SECONDS} seconds to complete the quiz.`);
    console.log("Question types:");
    console.log(" - Single-choice (MCQ): pick ONE option");
    console.log(" - Text: type your answer");
    console.log(" - Multi-select: pick MORE THAN ONE option (e.g. 1,3,4)\n");
}

// Remaining seconds for global timer
function getRemainingSeconds() {
    if (!startTime) return TIME_LIMIT_SECONDS;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(TIME_LIMIT_SECONDS - elapsed, 0);
}

// Global timer – only watches the time, does NOT overwrite input line
function startGlobalTimer() {
    startTime = Date.now();

    timerInterval = setInterval(() => {
        if (gameOver) return;

        const remaining = getRemainingSeconds();

        if (remaining <= 0) {
            console.log("\n\n⏲️ Time is up for the quiz!");
            endGame();
        }
    }, 500); // check twice a second
}

// Compare two sets of indices for multi-select
function areSameIndexSet(selectedIndices, correctIndices) {
    const uniqueSelected = Array.from(new Set(selectedIndices));

    if (uniqueSelected.length !== correctIndices.length) {
        return false;
    }

    return uniqueSelected.every((idx) => correctIndices.includes(idx));
}

// --- Main function: ask the next question ---
function askNextQuestion() {
    if (gameOver) return;

    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    const q = questions[currentQuestionIndex];

    console.log(`\n\nQuestion ${currentQuestionIndex + 1}/${questions.length}`);
    console.log(q.question);

    // Show right-aligned timer line (so it doesn't touch user input)
    const remaining = getRemainingSeconds();
    const timeLabel = `⏱️ ${remaining}s left`;
    const width = process.stdout.columns || 80;
    console.log(timeLabel.padStart(width));

    if (remaining <= 0) {
        console.log("\n⏲️ Time is up for the quiz!");
        endGame();
        return;
    }

    // Record start time of this question
    const questionStartTime = Date.now();

    if (q.type === "mcq") {
        // MCQ: show choices using forEach
        q.choices.forEach((choice, index) => {
            console.log(`  ${index + 1}. ${choice}`);
        });

        rl.question("\nYour answer (1-" + q.choices.length + "): ", (input) => {
            if (gameOver) return;

            const answerIndex = Number(input.trim()) - 1;
            const timeTakenSeconds = Math.floor(
                (Date.now() - questionStartTime) / 1000
            );

            if (
                Number.isNaN(answerIndex) ||
                answerIndex < 0 ||
                answerIndex >= q.choices.length
            ) {
                console.log("⚠️  Invalid choice. This question will count as incorrect.");
                results.push({
                    question: q.question,
                    isCorrect: false,
                    timeTakenSeconds,
                });
                currentQuestionIndex++;
                askNextQuestion();
                return;
            }

            const isCorrect = answerIndex === q.correctIndex;

            if (isCorrect) {
                console.log("✅ Correct!");
                score++;
            } else {
                console.log(
                    `❌ Incorrect. The correct answer was: ${q.choices[q.correctIndex]}`
                );
            }

            results.push({
                question: q.question,
                isCorrect,
                timeTakenSeconds,
            });

            currentQuestionIndex++;
            askNextQuestion();
        });

    } else if (q.type === "text") {
        rl.question("\nYour answer: ", (input) => {
            if (gameOver) return;

            const userAnswer = input.trim().toLowerCase();
            const correctAnswer = String(q.answer).trim().toLowerCase();
            const timeTakenSeconds = Math.floor(
                (Date.now() - questionStartTime) / 1000
            );

            const isCorrect = userAnswer === correctAnswer;

            if (isCorrect) {
                console.log("✅ Correct!");
                score++;
            } else {
                console.log(`❌ Incorrect. The correct answer was: ${q.answer}`);
            }

            results.push({
                question: q.question,
                isCorrect,
                timeTakenSeconds,
            });

            currentQuestionIndex++;
            askNextQuestion();
        });

    } else if (q.type === "multi") {
        q.choices.forEach((choice, index) => {
            console.log(`  ${index + 1}. ${choice}`);
        });

        console.log("\nYou can choose MORE THAN ONE option. Example: 1,3,4");

        rl.question("Your answer: ", (input) => {
            if (gameOver) return;

            const raw = input.split(",");
            const timeTakenSeconds = Math.floor(
                (Date.now() - questionStartTime) / 1000
            );

            const indices = [];
            let invalid = false;

            for (const part of raw) {
                const trimmed = part.trim();
                if (!trimmed) continue;

                const num = Number(trimmed);
                const idx = num - 1;

                if (
                    Number.isNaN(idx) ||
                    idx < 0 ||
                    idx >= q.choices.length
                ) {
                    invalid = true;
                    break;
                }

                indices.push(idx);
            }

            if (indices.length === 0 || invalid) {
                console.log(
                    "⚠️  Invalid input. This question will count as incorrect."
                );
                results.push({
                    question: q.question,
                    isCorrect: false,
                    timeTakenSeconds,
                });
                currentQuestionIndex++;
                askNextQuestion();
                return;
            }

            const isCorrect = areSameIndexSet(indices, q.correctIndices);

            if (isCorrect) {
                console.log("✅ Correct! You selected all the right options.");
                score++;
            } else {
                const correctLabels = q.correctIndices
                    .map((idx) => q.choices[idx]) // map
                    .join(", ");

                console.log(
                    `❌ Incorrect. The correct answers were: ${correctLabels}`
                );
            }

            results.push({
                question: q.question,
                isCorrect,
                timeTakenSeconds,
            });

            currentQuestionIndex++;
            askNextQuestion();
        });

    } else {
        console.log("⚠️  Unknown question type. Skipping.");
        currentQuestionIndex++;
        askNextQuestion();
    }
}

// --- Summary + end game ---

function showSummary() {
    console.log("\n=====================================");
    console.log("           📈 Quiz Summary");
    console.log("=====================================\n");

    const totalQuestions = questions.length;

    // filter: only correct answers
    const totalCorrect = results.filter((r) => r.isCorrect).length;

    // reduce: sum timeTakenSeconds
    const totalQuestionTime = results.reduce((sum, r) => {
        return sum + r.timeTakenSeconds;
    }, 0);

    const percent =
        totalQuestions === 0
            ? 0
            : Math.round((totalCorrect / totalQuestions) * 100);

    const totalSeconds =
        startTime === null
            ? 0
            : Math.floor((Date.now() - startTime) / 1000);

    const avgTimePerQuestion =
        results.length === 0
            ? 0
            : (totalQuestionTime / results.length).toFixed(1);

    console.log(`Questions attempted: ${results.length}/${totalQuestions}`);
    console.log(`Correct answers:    ${totalCorrect}`);
    console.log(`Score:              ${percent}%`);
    console.log(`Total time used:    ${totalSeconds}s`);
    console.log(`Avg time/question:  ${avgTimePerQuestion}s\n`);

    console.log("Per-question details:");
    results.forEach((r, index) => {
        console.log(
            `${index + 1}. ${r.isCorrect ? "✅" : "❌"} ` +
            `${r.question} (answered in ${r.timeTakenSeconds}s)`
        );
    });

    console.log("\nThanks for playing! ⌛");
}

function endGame() {
    if (gameOver) return;
    gameOver = true;

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    console.log("\n");
    showSummary();
    rl.close();
}

// --- Entry point ---
function startQuiz() {
    printHeader();

    rl.question("Press Enter to start the quiz...", () => {
        startGlobalTimer();
        askNextQuestion();
    });
}

startQuiz();
