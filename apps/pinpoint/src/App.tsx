import { useState, useEffect } from "react";
import { Modal, Results, type GameResultData } from "@bip-games/ui";
import "./App.css";
import data from "./data.json";

function App() {
  const [currentCategory, setCurrentCategory] = useState("");
  const [acceptedAnswers, setAcceptedAnswers] = useState([]);
  const [hints, setHints] = useState([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gameResult, setGameResult] = useState<{
    isWin: boolean;
    attempts: number;
    hintsUsed: number;
    category: string;
  } | null>(null);
  const [resultModal, setResultModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // Türkçe karakter desteği için normalizasyon fonksiyonu
  const normalizeTurkish = (str) => {
    return str
      .toLocaleLowerCase("tr-TR")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/ı/g, "i")
      .replace(/i̇/g, "i")
      .trim();
  };

  // Diziyi rastgele sıralama fonksiyonu
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startGame = () => {
    const randomIndex = Math.floor(Math.random() * data.length);
    const selectedCategory = data[randomIndex];

    setCurrentCategory(selectedCategory.category);
    setAcceptedAnswers(
      selectedCategory.acceptedAnswers || [selectedCategory.category]
    );
    setHints(shuffleArray(selectedCategory.hints)); // Hint'leri rastgele sırala
    setCurrentHintIndex(0);
    setAttempts(0);
    setShowResults(false);
    setGameResult(null);
  };

  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkGuess = (userGuess) => {
    setAttempts(attempts + 1);

    // Input'u temizle
    const input = document.querySelector(".guess-input") as HTMLInputElement;
    if (input) input.value = "";

    // Kullanıcının cevabını normalize et
    const normalizedGuess = normalizeTurkish(userGuess);

    // Kabul edilen cevaplardan herhangi birini normalize ederek kontrol et
    const isCorrect = acceptedAnswers.some(
      (answer) => normalizeTurkish(answer) === normalizedGuess
    );

    if (isCorrect) {
      setGameResult({
        isWin: true,
        attempts: attempts + 1,
        hintsUsed: currentHintIndex + 1,
        category: currentCategory,
      });
      setTimeout(() => setShowResults(true), 500);
    } else {
      if (currentHintIndex < hints.length - 1) {
        setCurrentHintIndex(currentHintIndex + 1);
      } else {
        setGameResult({
          isWin: false,
          attempts: attempts + 1,
          hintsUsed: hints.length,
          category: currentCategory,
        });
        setTimeout(() => setShowResults(true), 500);
      }
    }
  };

  // Results verilerini hazırla
  const resultData: GameResultData | null = gameResult
    ? {
        gameName: "Pinpoint",
        gameIcon: "📍",
        isWin: gameResult.isWin,
        celebrationMessage: gameResult.isWin
          ? "🎉 Harika Tahmin!"
          : "😔 Bir Sonraki Sefer!",
        message: `Kategori: ${gameResult.category}`,
        metrics: [
          {
            label: "Tahmin Sayısı",
            value: gameResult.attempts,
            icon: "🎲",
          },
          {
            label: "Kullanılan İpucu",
            value: `${gameResult.hintsUsed}/5`,
            icon: "💡",
          },
          {
            label: "Sonuç",
            value: gameResult.isWin ? "Doğru!" : "Yanlış",
            icon: gameResult.isWin ? "✅" : "❌",
          },
        ],
      }
    : null;

  // Results gösteriliyorsa onu render et
  if (showResults && resultData) {
    return (
      <Results
        resultData={resultData}
        onPlayAgain={() => {
          setShowResults(false);
          startGame();
        }}
        onShare={() => {
          const message = `📍 Pinpoint'te kategoriyi ${
            resultData.isWin ? "buldum" : "bulamadım"
          }!\n\n� Tahmin: ${gameResult?.attempts}\n💡 İpucu: ${
            gameResult?.hintsUsed
          }/5\n\nSen de oyna: https://bip-pinpoint.netlify.app/`;
          // BiP deep link
          window.location.href = `bip://share?text=${encodeURIComponent(
            message
          )}`;
        }}
        onShareStatus={() => {
          const statusText = `📍 Pinpoint'te kategoriyi ${
            resultData.isWin ? "buldum" : "bulamadım"
          }!`;
          // BiP status deep link
          window.location.href = `bip://status?text=${encodeURIComponent(
            statusText
          )}`;
        }}
        activeGame="Pinpoint"
      />
    );
  }

  return (
    <div className="App">
      <header>
        <h1>Pinpoint</h1>
        <button
          className="help-button"
          onClick={() => setIsHelpModalOpen(true)}
        >
          ?
        </button>
      </header>
      <main>
        <ul className="hints">
          {hints.map((hint, index) => (
            <li key={index} className="hint">
              {index === 0 || index < currentHintIndex + 1
                ? hint
                : `İpucu ${index + 1}`}
            </li>
          ))}
        </ul>
        <p className="instructions">
          5 ipucunun hepsi ortak bir kategoriye ait. Kategoriyi mümkün olduğunca
          az ipucu ile tahmin edin.
        </p>
        <div className="guess-section">
          <input
            type="text"
            className="guess-input"
            placeholder="Kategoriyi tahmin edin..."
            onKeyDown={(e) => {
              if (e.key === "Enter")
                checkGuess((e.target as HTMLInputElement).value);
            }}
          />
          <button
            className="guess-button"
            onClick={() => {
              const input = document.querySelector(
                ".guess-input"
              ) as HTMLInputElement;
              checkGuess(input.value);
            }}
          >
            Tahmin et
          </button>
        </div>
      </main>

      {/* Help Modal */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Pinpoint nasıl oynanır?"
      >
        <p>
          Tahtada gizlenmiş 5 ipucu var. 5 ipucunun tümü ortak bir kategoriye
          ait. Amacınız mümkün olduğunca az ipucu ortaya çıkararak kategoriyi
          tahmin etmek.
        </p>
        <p>Yaptığınız her yanlış tahmin bir sonraki ipucunu ortaya çıkarır.</p>
        <p>
          <strong>Önemli:</strong> Kategori tahmini yaparken çoğul kullanmayı
          unutmayın! Örneğin "Film" değil, "Film Türleri" veya "Filmler"
          yazmalısınız.
        </p>
        <p>
          <strong>Bazı örnekler:</strong>
        </p>
        <ul>
          <li>
            Gerilim, Aksiyon, Korku, Komedi, Drama →{" "}
            <strong>Film Türleri</strong>
          </li>
          <li>
            Elma, Muz, Portakal, Üzüm, Mango → <strong>Meyveler</strong>
          </li>
          <li>
            Köpek, Kedi, Fil, Aslan, Kaplan → <strong>Hayvanlar</strong>
          </li>
        </ul>
      </Modal>

      {/* Result Modal */}
      <Modal
        isOpen={resultModal.isOpen}
        onClose={() => setResultModal({ ...resultModal, isOpen: false })}
        title={resultModal.title}
      >
        <p style={{ whiteSpace: "pre-line" }}>{resultModal.message}</p>
      </Modal>
    </div>
  );
}

export default App;
