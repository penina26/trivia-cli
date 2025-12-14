import chalk from "chalk";
import { select, input, checkbox } from "@inquirer/prompts";
import { questions } from "./questions.js";

// We store the timer ID globally so we can stop it if the user finishes early
let globalTimer;

export async function startQuiz(state) {
    console.clear();
    console.log(chalk.blue("====================================="));
    console.log(chalk.bold.yellow("🤯  JavaScript Trivia CLI"));
    console.log(chalk.blue("=====================================\n"));

    // --- 1. User Setup ---
    if (!state.userName) {
        const name = await input({ message: "Enter your name player:" });
        state.userName = name.trim() || "Player";
    }

    console.log(chalk.green(`\nWelcome, ${chalk.bold(state.userName)}! Let's get started.`));
    console.log(`You have ${chalk.bold(state.timeLimit)} seconds to complete the quiz.\n`);

    // --- 2. Randomization ---
    const shuffledQuestions = shuffleArray([...questions]);

    // Start the session timer
    state.startTime = Date.now();

    // --- 3. Global Timer Logic ---
    const timeRemainingMs = state.timeLimit * 1000;

    globalTimer = setTimeout(() => {
        console.log(chalk.bold.red("\n\n⏲️  TIME IS UP! ⏲️"));
        console.log(chalk.gray(`Sorry ${state.userName}, you ran out of time.`));
        showSummary(state, shuffledQuestions.length);
    }, timeRemainingMs);

    // --- 4. Main Quiz Loop ---
    for (const [index, q] of shuffledQuestions.entries()) {

        if (isTimeUp(state)) break;

        const secondsLeft = Math.max(0, state.timeLimit - Math.floor((Date.now() - state.startTime) / 1000));
        const timeLabel = chalk.yellow(`(${secondsLeft}s left)`);

        console.log(chalk.cyan(`\nQuestion ${index + 1}/${shuffledQuestions.length} ${timeLabel}`));

        const questionStart = Date.now();
        let answer;

        try {
            //  Instrucions and questions
            if (q.type === 'select') {
                // Single Choice
                answer = await select({
                    message: `${q.question} ${chalk.gray("(Use arrow keys to choose)")}`,
                    choices: q.choices
                });
            } else if (q.type === 'input') {
                // Text Input
                answer = await input({
                    message: `${q.question} ${chalk.gray("(Type your answer)")}`
                });
            } else if (q.type === 'checkbox') {
                // Multiple Choice
                answer = await checkbox({
                    message: `${q.question} ${chalk.gray("(Press <space> to select, <enter> to finish)")}`,
                    choices: q.choices
                });
            }
        } catch (error) {
            break;
        }

        if (isTimeUp(state)) {
            console.log(chalk.red("\nToo slow! Time expired."));
            break;
        }

        const timeTaken = Math.floor((Date.now() - questionStart) / 1000);
        const isCorrect = validateAnswer(q, answer);

        // Immediate Feedback
        if (isCorrect) {
            console.log(chalk.green("✅ Correct!"));
        } else {
            console.log(chalk.red("❌ Incorrect."));
        }

        state.results.push({
            question: q.question,
            userAnswer: answer,
            correctAnswer: q.correctAnswer,
            isCorrect,
            timeTaken
        });
    }

    clearTimeout(globalTimer);
    await showSummary(state, shuffledQuestions.length);
}

// --- Helpers ---

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function isTimeUp(state) {
    if (!state.startTime) return false;
    const elapsed = (Date.now() - state.startTime) / 1000;
    return elapsed >= state.timeLimit;
}

function validateAnswer(q, userAnswer) {
    if (!userAnswer) return false;

    if (Array.isArray(q.correctAnswer)) {
        if (userAnswer.length !== q.correctAnswer.length) return false;
        return q.correctAnswer.every(item => userAnswer.includes(item));
    } else {
        return userAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase();
    }
}

function formatAnswer(ans) {
    if (!ans) return "No Answer";
    return Array.isArray(ans) ? ans.join(", ") : ans;
}

// --- Summary Function ---

async function showSummary(state, totalQuestions) {
    // Filter results to calculate score
    const score = state.results.filter(r => r.isCorrect).length;
    state.score = score;

    const now = Date.now();
    const duration = state.startTime ? Math.floor((now - state.startTime) / 1000) : 0;
    const percent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    console.log(chalk.blue("\n====================================="));
    console.log(chalk.bold(`      📈 Results for ${state.userName}`));
    console.log(chalk.blue("=====================================\n"));

    console.log(chalk.underline("Detailed Report:\n"));

    if (state.results.length > 0) {
        state.results.forEach((r, i) => {
            console.log(`${i + 1}. ${chalk.bold(r.question)}`);

            if (r.isCorrect) {
                console.log(chalk.green(`   ✅ Your Answer: ${formatAnswer(r.userAnswer)}`));
            } else {
                console.log(chalk.red(`   ❌ Your Answer: ${formatAnswer(r.userAnswer)}`));
                console.log(chalk.green(`      Correct Answer: ${formatAnswer(r.correctAnswer)}`));
            }
            console.log(chalk.gray(`      (Time: ${r.timeTaken}s)\n`));
        });
    } else {
        console.log(chalk.gray("No questions were answered."));
    }

    // Final Scores
    console.log(chalk.blue("-------------------------------------"));
    console.log(`Final Score:    ${chalk.yellow(score)} / ${totalQuestions} (${percent}%)`);
    console.log(`Total Time:     ${duration}s\n`);

    if (percent === 100) {
        console.log(chalk.bold.green(`🎉 CONGRATULATIONS, ${state.userName}! You got everything right!`));
    } else if (percent >= 70) {
        console.log(chalk.cyan(`👏 Great job, ${state.userName}! You passed!`));
    } else {
        console.log(chalk.yellow(`📚 Keep studying, ${state.userName}.`));
    }
    console.log(chalk.blue("=====================================\n"));

    // Menu
    const choice = await select({
        message: "What would you like to do next?",
        choices: [
            { name: "🔄 Play Again", value: "play_again" },
            { name: "🚪 Exit", value: "exit" }
        ]
    });

    if (choice === "play_again") {
        state.score = 0;
        state.results = [];
        state.startTime = null;
        await startQuiz(state);
    } else {
        console.log(chalk.bold.white("\nThank you for playing! Goodbye."));
        process.exit(0);
    }
}