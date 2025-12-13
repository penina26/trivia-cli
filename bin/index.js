#!/usr/bin/env node

import { program } from "commander";
import quizState from "../src/lib/state.js";
import { startQuiz } from "../src/lib/gameLogic.js";

// Clear screen
console.clear();

// Run
startQuiz(quizState);

program.parse(process.argv);