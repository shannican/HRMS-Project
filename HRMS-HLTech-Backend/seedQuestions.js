const mongoose = require("mongoose");
const Question = require("./models/AssessmentQuestions");
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, './.env') });
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const questions = [
  // MCQ 1
  {
    type: "mcq",
    text: "What does MERN stand for?",
    options: [
      "MongoDB, Express.js, React.js, Node.js",
      "MySQL, Express.js, React.js, Node.js",
      "MongoDB, Ember.js, React.js, Node.js",
      "MongoDB, Express.js, Redux.js, Node.js"
    ],
    correctAnswer: "MongoDB, Express.js, React.js, Node.js",
    order: 1
  },
  // MCQ 2
  {
    type: "mcq",
    text: "Which of the following is a NoSQL database?",
    options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
    correctAnswer: "MongoDB",
    order: 2
  },
  // MCQ 3
  {
    type: "mcq",
    text: "What is the role of Express.js in the MERN stack?",
    options: [
      "Frontend library",
      "Server-side framework",
      "Database",
      "Styling library"
    ],
    correctAnswer: "Server-side framework",
    order: 3
  },
  // MCQ 4
  {
    type: "mcq",
    text: "Which hook is used to manage component lifecycle in functional React components?",
    options: ["useState", "useRef", "useEffect", "useContext"],
    correctAnswer: "useEffect",
    order: 4
  },
  // MCQ 5
  {
    type: "mcq",
    text: "How do you connect MongoDB to Node.js?",
    options: [
      "Using react-mongo",
      "Using mongoose",
      "Using mongo-express",
      "Using node-connect"
    ],
    correctAnswer: "Using mongoose",
    order: 5
  },
  // MCQ 6
  {
    type: "mcq",
    text: "Which command is used to create a new React app?",
    options: [
      "npm create-react-app",
      "npx create-react-app myapp",
      "react-create-app",
      "create-react myapp"
    ],
    correctAnswer: "npx create-react-app myapp",
    order: 6
  },
  // MCQ 7
  {
    type: "mcq",
    text: "In Express.js, what does app.use() typically do?",
    options: [
      "Starts the server",
      "Registers middleware",
      "Defines routes",
      "Sends a response"
    ],
    correctAnswer: "Registers middleware",
    order: 7
  },
  // MCQ 8
  {
    type: "mcq",
    text: "How is data passed between components in React?",
    options: ["Using state", "Using props", "Using hooks", "Using Redux"],
    correctAnswer: "Using props",
    order: 8
  },
  // MCQ 9
  {
    type: "mcq",
    text: "Which of the following is true about JSX?",
    options: [
      "It's a CSS library",
      "It's a backend language",
      "It's a syntax extension for JavaScript",
      "It's used in Node.js only"
    ],
    correctAnswer: "It's a syntax extension for JavaScript",
    order: 9
  },
  // MCQ 10
  {
    type: "mcq",
    text: "What HTTP method is commonly used to create a resource?",
    options: ["GET", "POST", "PUT", "DELETE"],
    correctAnswer: "POST",
    order: 10
  },
  // MCQ 11
  {
    type: "mcq",
    text: "What does res.send() do in Express?",
    options: [
      "Fetches data",
      "Sends response to client",
      "Updates a document",
      "Logs errors"
    ],
    correctAnswer: "Sends response to client",
    order: 11
  },
  // MCQ 12
  {
    type: "mcq",
    text: "Which port does React run on by default?",
    options: ["8080", "5000", "3000", "27017"],
    correctAnswer: "3000",
    order: 12
  },
  // MCQ 13
  {
    type: "mcq",
    text: "What is used to manage application state globally in React apps?",
    options: ["Hooks", "Redux", "useState", "Context API only"],
    correctAnswer: "Redux",
    order: 13
  },
  // MCQ 14
  {
    type: "mcq",
    text: "Which method is used to fetch data in React?",
    options: ["window.fetch", "fetch() or Axios", "getData()", "ajax()"],
    correctAnswer: "fetch() or Axios",
    order: 14
  },
  // MCQ 15
  {
    type: "mcq",
    text: "How does MongoDB store data?",
    options: ["Tables", "CSV files", "JSON-like documents (BSON)", "Arrays"],
    correctAnswer: "JSON-like documents (BSON)",
    order: 15
  },
  // MCQ 16
  {
    type: "mcq",
    text: "In Node.js, which module is used to create a server?",
    options: ["fs", "net", "http", "events"],
    correctAnswer: "http",
    order: 16
  },
  // MCQ 17
  {
    type: "mcq",
    text: "What does npm start do in a React project?",
    options: [
      "Installs dependencies",
      "Starts the frontend dev server",
      "Builds the project",
      "Opens MongoDB"
    ],
    correctAnswer: "Starts the frontend dev server",
    order: 17
  },
  // MCQ 18
  {
    type: "mcq",
    text: "Which of these is used for routing in React?",
    options: ["react-router", "react-router-dom", "redux-router", "route-dom"],
    correctAnswer: "react-router-dom",
    order: 18
  },
  // MCQ 19
  {
    type: "mcq",
    text: "What is the default port for MongoDB?",
    options: ["27017", "3000", "8000", "5000"],
    correctAnswer: "27017",
    order: 19
  },
  // MCQ 20
  {
    type: "mcq",
    text: "Which statement is true about Node.js?",
    options: [
      "It is a frontend library",
      "It runs only on Windows",
      "It uses an event-driven, non-blocking I/O model",
      "It requires Apache to run"
    ],
    correctAnswer: "It uses an event-driven, non-blocking I/O model",
    order: 20
  },
  // Coding Question 1
  {
    type: "coding",
    text: "Complete the backend and frontend to add a new product with name and price using Node.js (Express), MongoDB, and React.js.",
    codingProblem: {
      description: "Implement a form to add a product with name and price. The backend should save the product to MongoDB, and the frontend should send a POST request.",
      languages: ["javascript"],
      testCases: [] // No test cases for this as it's a full-stack implementation
    },
    order: 21
  },
  // Coding Question 2
  {
    type: "coding",
    text: "Write a function to return the first non-repeating character in a string. If all characters repeat, return null.",
    codingProblem: {
      description: "Write a function that takes a string and returns the first character that appears exactly once. Return null if no such character exists. Example: Input: 'aabbccdeff' Output: 'd'",
      languages: ["javascript", "java", "python", "cpp"],
      testCases: [
        { input: "aabbccdeff", output: "d", hidden: true },
        { input: "aabbcc", output: null, hidden: true },
        { input: "abcd", output: "a", hidden: false }
      ]
    },
    order: 22
  }
];

async function seed() {
  await Question.deleteMany({});
  await Question.insertMany(questions);
  console.log("Questions seeded");
  mongoose.connection.close();
}

seed();