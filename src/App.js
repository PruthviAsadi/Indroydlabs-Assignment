import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import questionsData from './questions.json'; // Assume this file contains your questions
import './App.css';

const App = () => {
  const [players, setPlayers] = useState([]); // List of players
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Current question index
  const [playerAnswers, setPlayerAnswers] = useState({}); // Store player answers
  const [showQuestion, setShowQuestion] = useState(false); // Control question display
  const [correctPlayer, setCorrectPlayer] = useState(null); // Store the correct player's name

  // Load questions from JSON
  const questions = questionsData;

  // Function to add a new player by name
  const handleJoin = (name) => {
    if (name && !players.some(player => player.name === name)) { // Prevent duplicate players
      setPlayers([...players, { name, score: 0 }]);
      setShowQuestion(true); // Show questions after joining
    }
  };

  // Function to move to the next question
  const handleNextQuestion = () => {
    setCorrectPlayer(null); // Reset the correct player
    setPlayerAnswers({}); // Clear previous answers
    setCurrentQuestionIndex(currentQuestionIndex + 1); // Go to the next question
  };

  // Function to handle answer submission from players
  const handleAnswer = (player, answer) => {
    const isCorrect = answer === questions[currentQuestionIndex].correct;

    if (isCorrect) {
      setCorrectPlayer(player); // Set the correct player's name
      setTimeout(() => {
        handleNextQuestion(); // Move to the next question after 2 seconds
      }, 2000);
    } else {
      setPlayerAnswers({ ...playerAnswers, [player]: "Wrong" }); // Mark the answer as wrong
    }
  };

  return (
    <div className="App">
      <h1>KBC Quiz Game</h1>
      <div className="main-screen">
        <h2>Current Players</h2>
        <ul>
          {players.map((player, idx) => (
            <li key={idx}>{player.name}</li>
          ))}
        </ul>

        {/* QR Code for players to join */}
        {!showQuestion && (
          <div>
            <h2>Scan to Join</h2>
            <QRCode value={`http://${window.location.hostname}:3000`} />
          </div>
        )}

        {/* Display the current question */}
        {showQuestion && currentQuestionIndex < questions.length && (
          <QuestionSection 
            question={questions[currentQuestionIndex]} 
            onAnswer={handleAnswer} 
            correctPlayer={correctPlayer} 
          />
        )}

        {/* Display the winner if a player answers correctly */}
        {correctPlayer && (
          <div className="winner">
            <h2>Congratulations, {correctPlayer}!</h2>
          </div>
        )}

        {/* End of game */}
        {currentQuestionIndex >= questions.length && <h2>Game Over!</h2>}
      </div>

      {/* Mobile view for players */}
      <MobileView
        onJoin={handleJoin}
        currentQuestion={showQuestion && currentQuestionIndex < questions.length ? questions[currentQuestionIndex] : null}
        playerAnswers={playerAnswers}
        setShowQuestion={setShowQuestion}
        players={players}
        handleAnswer={handleAnswer}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
      />
    </div>
  );
};

// Question Section Component
const QuestionSection = ({ question, onAnswer }) => (
  <div className="question-section">
    <h2>{question.question}</h2>
    <ul>
      {question.options.map((option, idx) => (
        <li key={idx} onClick={() => onAnswer(option.charAt(0))}>
          {option}
        </li>
      ))}
    </ul>
  </div>
);

// Mobile View Component
const MobileView = ({ onJoin, currentQuestion, playerAnswers, setShowQuestion, players, handleAnswer }) => {
  const [name, setName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const joinGame = () => {
    if (name) {
      onJoin(name); // Add the player
      setHasJoined(true);
      setShowQuestion(true); // Show the question once the player joins
    }
  };

  const submitAnswer = () => {
    if (selectedAnswer) {
      handleAnswer(name, selectedAnswer); // Submit the player's answer
      setSelectedAnswer(''); // Reset selected answer after submission
    }
  };

  return (
    <div className="mobile-container">
      {/* Allow players to join the game */}
      {!hasJoined && (
        <div>
          <h2>Enter your name to join:</h2>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} // Update state on change
            placeholder="Your name" // Add placeholder for clarity
            autoFocus // Automatically focus on input for better UX
          />
          <button onClick={joinGame}>Join</button>
        </div>
      )}

      {/* Once joined, display the question */}
      {hasJoined && currentQuestion && (
        <div>
          <h2>{currentQuestion.question}</h2>
          {currentQuestion.options.map((option, idx) => (
            <div key={idx}>
              <input 
                type="radio" 
                value={option.charAt(0)} 
                name="answer" 
                checked={selectedAnswer === option.charAt(0)} // Maintain selected answer
                onChange={(e) => setSelectedAnswer(e.target.value)} 
              />
              {option}
            </div>
          ))}
          <button onClick={submitAnswer}>Submit Answer</button>

          {/* Display wrong answer message if the answer is wrong */}
          {playerAnswers[name] === "Wrong" && (
            <div className="error-message">
              <p>Wrong Answer! Try again.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
