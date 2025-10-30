import { useState } from "react";
import axios from "axios";

interface Country {
  name: { common: string };
  flags: { png: string };
}

const App = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [options, setOptions] = useState<Country[]>([]);
  const [correctCountry, setCorrectCountry] = useState<Country | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCountries = async () => {
    if (countries.length) {
      nextRound();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        "https://restcountries.com/v3.1/all?fields=name,flags"
      );
      const data = res.data;
      setCountries(data);
      nextRound(data);
    } catch {
      setError("❌ Could not load countries.");
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = (data: Country[] = countries) => {
    if (!data.length) return;

    const getRandomCountries = (data: Country[], count: number) => {
      const shuffled = [...data];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, count);
    };

    const randomCountries = getRandomCountries(data, 4);

    const correct = randomCountries[Math.floor(Math.random() * 4)];

    setOptions(randomCountries);
    setCorrectCountry(correct);
    setSelectedAnswer(null);
  };

  const nextRound = (data: Country[] = countries) => {
    if (round >= 10) {
      setGameOver(true);
      setCorrectCountry(null);
      return;
    }

    createQuestion(data);
    setRound((prev) => prev + 1);
  };

  const handleAnswer = (countryName: string) => {
    setSelectedAnswer(countryName);
    if (countryName === correctCountry?.name.common) {
      setScore((prev) => prev + 10);
    }
  };

  const restartGame = () => {
    setGameOver(false);
    setRound(0);
    setScore(0);
    createQuestion(countries);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-blue-950/80 flex flex-col space-y-6 text-white rounded-2xl shadow-lg p-6 sm:p-8 w-full sm:w-[90%] md:max-w-lg text-center">
        {!gameOver ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Guess the Country Flag
            </h1>

            {correctCountry ? (
              <div className="mt-6 sm:mt-8 space-y-6">
                <img
                  src={correctCountry.flags.png}
                  alt={`Flag of ${correctCountry.name.common}`}
                  className="w-32 sm:w-40 h-auto mx-auto rounded"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-sm sm:text-base">
                  {options.map((country) => (
                    <button
                      key={country.name.common}
                      onClick={() => handleAnswer(country.name.common)}
                      disabled={!!selectedAnswer}
                      className={`p-3 rounded-lg font-medium transition ${
                        selectedAnswer
                          ? country.name.common === correctCountry.name.common
                            ? "bg-green-600"
                            : country.name.common === selectedAnswer
                            ? "bg-red-600"
                            : "bg-blue-700"
                          : "bg-blue-800 hover:bg-blue-700"
                      }`}
                    >
                      {country.name.common}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-lg gap-2">
                  <p>Score: {score}</p>
                  <p className="text-sm text-gray-300 mb-1 sm:mb-0">
                    Round {round} / 10
                  </p>
                </div>

                <button
                  onClick={fetchCountries}
                  disabled={loading}
                  className="bg-[#5761ff] hover:bg-[#4752f5] text-white font-bold py-2 px-8 rounded transition mx-auto mt-3"
                >
                  {loading ? "Loading..." : selectedAnswer ? "Next" : "Skip"}
                </button>
              </div>
            ) : (
              <>
                {error ? (
                  <p className="text-red-400 text-center">{error}</p>
                ) : (
                  <p className="text-sm text-gray-300 mb-4">
                    Click “Start” to begin your flag challenge!
                  </p>
                )}
                <button
                  onClick={fetchCountries}
                  disabled={loading}
                  className="bg-[#5761ff] hover:bg-[#4752f5] text-white font-bold py-2 px-8 rounded transition mx-auto"
                >
                  {loading ? "Loading..." : "Start"}
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400">
              🏁 Game Over!
            </h1>
            <p className="text-lg sm:text-xl">
              Your final score: <span className="font-bold">{score}</span>/100
            </p>
            <button
              onClick={restartGame}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 rounded transition"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
