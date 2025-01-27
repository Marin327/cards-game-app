import React, { useEffect, useState } from 'react';
import './App.css';

// Компонент за картите
const Card = ({ id, image, flipped, matched, onClick }) => (
  <div
    className={`card ${flipped ? 'flipped' : ''} ${matched ? 'matched' : ''}`}
    onClick={() => onClick(id)}
  >
    {flipped || matched ? image : '❓'}
  </div>
);

// Компонент за игралната дъска
const Board = ({ deck, onCardClick }) => (
  <div className="board">
    {deck.map((card) => (
      <Card
        key={card.id}
        id={card.id}
        image={card.image}
        flipped={card.flipped}
        matched={card.matched}
        onClick={onCardClick}
      />
    ))}
  </div>
);

// Таймер за играта
const Timer = ({ time }) => <p>Време: {time} сек.</p>;

// Резултат на играча
const Score = ({ moves }) => <p>Движения: {moves}</p>;

// Бутон за рестартиране на играта
const RestartButton = ({ onRestart }) => (
  <button onClick={onRestart} className="btn restart-btn">Рестартирай</button>
);

// Бутон за включване и изключване на звука
const SoundButton = ({ onToggleSound }) => (
  <button onClick={onToggleSound} className="btn sound-btn">Звук</button>
);

// Инструкции за играта
const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="modal">
      <h3>Как да играем:</h3>
      <p>Целта на играта е да съвпаднеш всички карти. Кликни върху две карти, за да ги обърнеш. Ако те съвпадат, те ще останат обърнати. Ако не съвпадат, те ще се обърнат обратно след малко.</p>
      <button onClick={onClose} className="btn close-btn">Затвори</button>
    </div>
  );
};

// Избор на трудност
const DifficultySelect = ({ onDifficultyChange }) => (
  <select onChange={e => onDifficultyChange(e.target.value)} className="difficulty-select">
    <option value="easy">Лесно</option>
    <option value="medium">Средно</option>
    <option value="hard">Трудно</option>
  </select>
);

// Състояние на играта
const GameStatus = ({ isGameOver, moves, time }) => (
  isGameOver ? <h2>Играта приключи! Завърши с {moves} движения и {time} секунди.</h2> : null
);

// Най-добри резултати
const Leaderboard = ({ bestScore }) => (
  <div className="leaderboard">
    <h3>Най-добри резултати:</h3>
    <p>Рекорд: {bestScore} движения</p>
  </div>
);

const generateShuffledDeck = () => {
  const cardImages = [
    '🍎', '🍎',
    '🍌', '🍌',
    '🍇', '🍇',
    '🍊', '🍊',
    '🍉', '🍉',
    '🍓', '🍓',
    '🍒', '🍒'
  ];

  const shuffledDeck = [...cardImages].sort(() => Math.random() - 0.5);
  return shuffledDeck.map((card, index) => ({
    id: index,
    image: card,
    flipped: false,
    matched: false,
  }));
};

const App = () => {
  const [deck, setDeck] = useState(generateShuffledDeck());
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(localStorage.getItem('bestScore') || 0);
  const [difficulty, setDifficulty] = useState('medium');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Управление на картите
  const handleCardClick = (index) => {
    if (flippedIndices.length === 2 || deck[index].flipped || deck[index].matched) return;

    const newDeck = [...deck];
    newDeck[index].flipped = true;
    setDeck(newDeck);

    setFlippedIndices((prev) => [...prev, index]);
  };

  // Проверка за съвпадение
  useEffect(() => {
    if (flippedIndices.length === 2) {
      setMoves(moves + 1);
      const [firstIndex, secondIndex] = flippedIndices;
      const newDeck = [...deck];

      if (newDeck[firstIndex].image === newDeck[secondIndex].image) {
        newDeck[firstIndex].matched = true;
        newDeck[secondIndex].matched = true;
        setMatchedCount(matchedCount + 2);
      } else {
        setTimeout(() => {
          newDeck[firstIndex].flipped = false;
          newDeck[secondIndex].flipped = false;
          setDeck(newDeck);
        }, 1000);
      }

      setFlippedIndices([]);
    }
  }, [flippedIndices, deck, moves, matchedCount]);

  // Таймер
  useEffect(() => {
    const interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Проверка дали играта е завършена
  useEffect(() => {
    if (matchedCount === deck.length) {
      setIsGameOver(true);
      if (moves < bestScore || !bestScore) {
        setBestScore(moves);
        localStorage.setItem('bestScore', moves);
      }
    }
  }, [matchedCount, deck, moves, bestScore]);

  // Промяна на трудност
  useEffect(() => {
    if (difficulty === 'easy') {
      setDeck(generateShuffledDeck().slice(0, 12)); // Лесно - 6 карти
    } else if (difficulty === 'medium') {
      setDeck(generateShuffledDeck().slice(0, 16)); // Средно - 8 карти
    } else if (difficulty === 'hard') {
      setDeck(generateShuffledDeck()); // Трудно - 12 карти
    }
    setMatchedCount(0);
    setMoves(0);
    setIsGameOver(false);
  }, [difficulty]);

  const toggleSound = () => setIsSoundOn(!isSoundOn);

  const restartGame = () => {
    setDeck(generateShuffledDeck());
    setMatchedCount(0);
    setMoves(0);
    setIsGameOver(false);
    setTimer(0);
    setFlippedIndices([]);
  };

  return (
    <div className="App">
      <h1>Игра за памет</h1>

      <Score moves={moves} />
      <Timer time={timer} />
      <Leaderboard bestScore={bestScore} />
      <GameStatus isGameOver={isGameOver} moves={moves} time={timer} />
      <RestartButton onRestart={restartGame} />
      <SoundButton onToggleSound={toggleSound} />
      <DifficultySelect onDifficultyChange={setDifficulty} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <Board deck={deck} onCardClick={handleCardClick} />

      <button onClick={() => setIsHelpOpen(true)} className="btn help-btn">Помощ</button>
    </div>
  );
};

export default App;
