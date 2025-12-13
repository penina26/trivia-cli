const quizState = {
    score: 0,
    results: [], // Stores { question, isCorrect, timeTaken }
    startTime: null,
    timeLimit: 60, // Seconds
};

export default quizState;