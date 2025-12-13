export const questions = [
    {
        type: "select",
        question: "Which keyword declares a constant in JavaScript?",
        choices: [
            { name: "var", value: "var" },
            { name: "let", value: "let" },
            { name: "const", value: "const" },
            { name: "static", value: "static" },
        ],
        correctAnswer: "const",
    },
    {
        type: "input",
        question: "What is the strict equality operator in JavaScript?",
        correctAnswer: "===",
    },
    {
        type: "checkbox",
        question: "Which of the following are JavaScript primitive types?",
        choices: [
            { name: "number", value: "number" },
            { name: "object", value: "object" },
            { name: "string", value: "string" },
            { name: "boolean", value: "boolean" },
            { name: "Array", value: "Array" },
        ],
        correctAnswer: ["number", "string", "boolean"],
    },
    {
        type: "input",
        question: "Which keyword is used to declare a variable that can change?",
        correctAnswer: "let",
    },

    {
        type: "select",
        question: "Which method is commonly used to filter elements in an array?",
        choices: [
            { name: "map()", value: "map" },
            { name: "filter()", value: "filter" },
            { name: "reduce()", value: "reduce" },
            { name: "forEach()", value: "forEach" },
        ],
        correctAnswer: "filter",
    },
];
