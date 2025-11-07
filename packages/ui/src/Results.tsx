import type React from "react";
import { useEffect, useState } from "react";
import "./Results.css";

// ============ Tüm BiP Oyunları ============

/**
 * Merkezi oyun listesi - tüm BiP oyunları
 */
const ALL_GAMES: GameLink[] = [
  {
    name: "Hangman",
    icon: "🎯",
    url: "https://bip-hangman.netlify.app/",
    color: "#03A9F4",
  },
  {
    name: "Pinpoint",
    icon: "📍",
    url: "https://bip-pinpoint.netlify.app/",
    color: "#DF0080",
  },
  {
    name: "CrossClimb",
    icon: "⛰️",
    url: "https://bip-crossclimb.netlify.app/",
    color: "#32C671",
  },
  {
    name: "Sudoku",
    icon: "🔢",
    url: "https://bip-sudoku.netlify.app/",
    color: "#7E57C2",
  },
  {
    name: "XOX",
    icon: "❌⭕",
    url: "https://bip-xox-game.netlify.app/",
    color: "#FF8A34",
  },
  {
    name: "Zip",
    icon: "🧩",
    url: "https://bip-zip.netlify.app/",
    color: "#FFC400",
  },
  {
    name: "Wordle",
    icon: "📝",
    url: "https://bip-wordle.netlify.app/",
    color: "#32C671",
  },
];

// ============ TypeScript Interfaces ============

/**
 * Ortak metrik arayüzü - her oyunun göstereceği metrikler
 */
export interface GameMetric {
  label: string;
  value: string | number;
  icon?: string; // emoji olarak
  highlight?: boolean; // önemli metrikleri vurgulamak için
}

/**
 * Her oyun için sonuç verileri
 */
export interface GameResultData {
  gameName: string; // "Hangman", "CrossClimb", "Pinpoint", etc.
  gameIcon?: string; // Oyun ikonu (emoji)
  isWin: boolean; // Kazandı mı?
  celebrationMessage: string; // "Harika!", "Tebrikler!", "Maalesef!"
  message?: string; // Ek açıklama mesajı
  metrics: GameMetric[]; // Gösterilecek metrikler
}

/**
 * Diğer oyunlar için link bilgisi
 */
export interface GameLink {
  name: string;
  icon: string; // emoji
  url: string;
  color: string; // hex color code
}

/**
 * Results component props
 */
export interface ResultsProps {
  resultData: GameResultData;
  onPlayAgain: () => void;
  onShare?: () => void; // "Mesaj olarak gönder" için
  onShareStatus?: () => void; // "Durum olarak paylaş" için
  activeGame?: string; // Aktif oyun adı - bu oyun listeden filtrelenir
  showConfetti?: boolean; // Konfeti göster/gizle
}

// ============ Konfeti Animasyonu ============

interface ConfettiOverlayProps {
  show: boolean;
}

const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ show }) => {
  if (!show) return null;

  // Kutlama emojileri
  const emojis = ["🎉", "🎊", "✨", "💥", "🌟", "🏆", "🎯", "⭐"];
  const particles = Array.from({ length: 30 }).map((_, idx) => {
    const left = Math.random() * 90; // yüzde
    const delay = Math.random() * 0.5; // s
    const duration = 3 + Math.random() * 2; // 3–5 saniye arası
    const size = 18 + Math.random() * 14; // px
    const emoji = emojis[idx % emojis.length];
    return { left, delay, duration, size, emoji, key: idx };
  });

  return (
    <div className="results-confetti-overlay" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.key}
          className="results-confetti-particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
};

// ============ Results Component ============

export const Results: React.FC<ResultsProps> = ({
  resultData,
  onPlayAgain,
  onShare,
  onShareStatus,
  activeGame,
  showConfetti = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Aktif oyunu filtrele
  const otherGames = ALL_GAMES.filter(
    (game) => game.name !== activeGame && game.name !== resultData.gameName
  );

  // Açılış animasyonu
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    const confettiTimer = setTimeout(() => {
      if (showConfetti && resultData.isWin) {
        setShowAnimation(true);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [showConfetti, resultData.isWin]);

  return (
    <div className={`results-container ${isVisible ? "results-visible" : ""}`}>
      {/* Konfeti Animasyonu - sadece kazanınca */}
      {resultData.isWin && <ConfettiOverlay show={showAnimation} />}

      {/* Ana İçerik */}
      <div className="results-content">
        {/* 1. Bölüm: Tebrik Mesajı ve Skorlar */}
        <section className="results-section results-score-section">
          <div className="results-header">
            {resultData.gameIcon && (
              <span className="results-game-icon">{resultData.gameIcon}</span>
            )}
            <h2 className="results-title">{resultData.celebrationMessage}</h2>
          </div>

          {resultData.message && (
            <p className="results-subtitle">{resultData.message}</p>
          )}

          {/* Metrikler Grid */}
          <div className="results-metrics">
            {resultData.metrics.map((metric, idx) => (
              <div
                key={idx}
                className={`results-metric ${
                  metric.highlight ? "results-metric-highlight" : ""
                }`}
              >
                {metric.icon && (
                  <span className="results-metric-icon">{metric.icon}</span>
                )}
                <div className="results-metric-content">
                  <span className="results-metric-label">{metric.label}</span>
                  <span className="results-metric-value">{metric.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Paylaşım Butonları */}
          <div className="results-share-actions">
            {onShare && (
              <button
                type="button"
                className="results-btn results-btn-share"
                onClick={onShare}
              >
                💬 Mesaj Olarak Gönder
              </button>
            )}
            {onShareStatus && (
              <button
                type="button"
                className="results-btn results-btn-status"
                onClick={onShareStatus}
              >
                📤 Durum Olarak Paylaş
              </button>
            )}
          </div>
        </section>

        {/* 2. Bölüm: Tekrar Oyna ve Diğer Oyunlar */}
        <section className="results-section results-actions-section">
          {/* Tekrar Oyna - Öne Çıkan Buton */}
          <button
            type="button"
            className="results-btn results-btn-primary"
            onClick={onPlayAgain}
          >
            🔄 Tekrar Oyna
          </button>

          {/* Diğer Oyunlar */}
          {otherGames.length > 0 && (
            <div className="results-other-games">
              <h3 className="results-other-games-title">
                🎮 Başka Bir Oyun Oynayın
              </h3>
              <div className="results-games-grid">
                {otherGames.map((game, idx) => (
                  <a
                    key={idx}
                    href={game.url}
                    className="results-game-card"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="results-game-card-icon">{game.icon}</span>
                    <span className="results-game-card-name">{game.name}</span>
                    <span className="results-game-card-cta">Oyna</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
