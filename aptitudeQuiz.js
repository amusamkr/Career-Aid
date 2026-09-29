// config/aptitudeQuiz.js
const quizQuestions = [
  {
    questionNumber: 1,
    questionText: "When solving a problem, you prefer to...",
    options: [
      { key: "A", text: "Break it down logically, step by step", category: "Analytical" },
      { key: "B", text: "Think of an original, unconventional solution", category: "Creative" },
      { key: "C", text: "Build or test something hands-on", category: "Practical" },
      { key: "D", text: "Discuss it with others to find the best way", category: "Social" },
    ],
  },
  {
    questionNumber: 2,
    questionText: "Which activity sounds most enjoyable?",
    options: [
      { key: "A", text: "Analyzing data or numbers", category: "Analytical" },
      { key: "B", text: "Designing or creating something new", category: "Creative" },
      { key: "C", text: "Fixing or building a physical object", category: "Practical" },
      { key: "D", text: "Helping or teaching someone", category: "Social" },
    ],
  },
  {
    questionNumber: 3,
    questionText: "In a group project, you naturally take the role of...",
    options: [
      { key: "A", text: "The planner who organizes the logic/strategy", category: "Analytical" },
      { key: "B", text: "The idea generator", category: "Creative" },
      { key: "C", text: "The one who actually builds/executes the work", category: "Practical" },
      { key: "D", text: "The communicator who keeps everyone aligned", category: "Social" },
    ],
  },
  {
    questionNumber: 4,
    questionText: "You're most proud when you...",
    options: [
      { key: "A", text: "Solve a complex puzzle correctly", category: "Analytical" },
      { key: "B", text: "Make something original and expressive", category: "Creative" },
      { key: "C", text: "Successfully build/repair something", category: "Practical" },
      { key: "D", text: "Make a real difference in someone's life", category: "Social" },
    ],
  },
  {
    questionNumber: 5,
    questionText: "Your ideal subject/class would involve...",
    options: [
      { key: "A", text: "Mathematics, coding, or data", category: "Analytical" },
      { key: "B", text: "Art, design, or writing", category: "Creative" },
      { key: "C", text: "Engineering, workshop, or technical labs", category: "Practical" },
      { key: "D", text: "Psychology, counselling, or public service", category: "Social" },
    ],
  },
];

module.exports = quizQuestions;