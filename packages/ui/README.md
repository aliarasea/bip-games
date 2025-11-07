# @bip-games/ui

BiP Games için paylaşımlı UI bileşenleri paketi.

## Bileşenler

### Results - Oyun Sonuç Ekranı

Tüm BiP oyunları için kullanılabilecek, modern ve etkileşimli sonuç ekranı bileşeni.

#### Özellikler

- 🎉 Kazanma animasyonu (konfeti)
- 📊 Esnek metrik gösterimi
- 🔄 Tekrar oyna butonu
- 💬 BiP paylaşım entegrasyonu (mesaj & durum)
- 🎮 Diğer oyunlara yönlendirme
- 🌙 Dark mode desteği
- 📱 Responsive tasarım

#### Kullanım

```tsx
import { Results, type GameResultData, type GameLink } from '@bip-games/ui';

// Oyun sonuç verileri
const resultData: GameResultData = {
  gameName: "Hangman",
  gameIcon: "🎯",
  isWin: true,
  celebrationMessage: "Tebrikler!",
  message: "Kelimeyi başarıyla buldunuz!",
  metrics: [
    { label: "Süre", value: "45s", icon: "⏱️", highlight: true },
    { label: "Tahmin", value: "12", icon: "🔤" },
    { label: "Doğruluk", value: "85%", icon: "🎯" },
  ],
};

// Diğer oyunlar
const otherGames: GameLink[] = [
  { name: "Sudoku", icon: "🔢", url: "https://sudoku.example.com", color: "#03A9F4" },
  { name: "Pinpoint", icon: "📍", url: "https://pinpoint.example.com", color: "#DF0080" },
];

// Component kullanımı
<Results
  resultData={resultData}
  onPlayAgain={() => console.log("Yeni oyun başlat")}
  onShare={() => console.log("BiP'te mesaj olarak paylaş")}
  onShareStatus={() => console.log("BiP durumunda paylaş")}
  otherGames={otherGames}
  showConfetti={true}
/>
```

---

## Oyunlara Özel Örnekler

### 1. Hangman (Adam Asmaca)

```tsx
const hangmanResult: GameResultData = {
  gameName: "Hangman",
  gameIcon: "🎯",
  isWin: gameState.gameStatus === 'won',
  celebrationMessage: gameState.gameStatus === 'won' ? "Harika! 🎉" : "Maalesef! 😔",
  message: gameState.gameStatus === 'won' 
    ? `"${gameState.currentWord}" kelimesini buldunuz!`
    : `Doğru kelime: "${gameState.currentWord}"`,
  metrics: [
    { 
      label: "Yanlış Tahmin", 
      value: gameState.wrongGuesses.length,
      icon: "❌",
      highlight: false
    },
    { 
      label: "Toplam Harf", 
      value: gameState.guessedLetters.size,
      icon: "🔤" 
    },
    { 
      label: "Durum", 
      value: gameState.gameStatus === 'won' ? "Kazandınız!" : "Kaybettiniz",
      icon: gameState.gameStatus === 'won' ? "✅" : "💔",
      highlight: true
    },
  ],
};
```

### 2. CrossClimb (Kelime Merdiveni)

```tsx
const crossClimbResult: GameResultData = {
  gameName: "CrossClimb",
  gameIcon: "⛰️",
  isWin: gameState.isGameComplete,
  celebrationMessage: "Mükemmel! 🎊",
  message: "Tüm merdiveni tamamladınız!",
  metrics: [
    { 
      label: "Süre", 
      value: `${elapsedTime}s`,
      icon: "⏱️",
      highlight: true
    },
    { 
      label: "Tahmin Edilen Harf", 
      value: gameState.guessedLetters,
      icon: "🔤" 
    },
    { 
      label: "Kelime Uzunluğu", 
      value: gameState.wordLength,
      icon: "📏" 
    },
  ],
};
```

### 3. Pinpoint (Kategori Tahmin)

```tsx
const pinpointResult: GameResultData = {
  gameName: "Pinpoint",
  gameIcon: "📍",
  isWin: isCorrect,
  celebrationMessage: isCorrect ? "Harika Tahmin! 🎯" : "Bir Sonraki Sefer! 💪",
  message: `Kategori: ${currentCategory}`,
  metrics: [
    { 
      label: "Tahmin Sayısı", 
      value: attempts,
      icon: "🎲",
      highlight: true
    },
    { 
      label: "Kullanılan İpucu", 
      value: `${currentHintIndex + 1}/5`,
      icon: "💡" 
    },
    { 
      label: "Başarı", 
      value: isCorrect ? "Doğru!" : "Yanlış",
      icon: isCorrect ? "✅" : "❌",
      highlight: false
    },
  ],
};
```

### 4. Sudoku

```tsx
const sudokuResult: GameResultData = {
  gameName: "Sudoku",
  gameIcon: "🔢",
  isWin: completed,
  celebrationMessage: "Tebrikler! 🏆",
  message: "Sudoku'yu tamamladınız!",
  metrics: [
    { 
      label: "Süre", 
      value: `${Math.floor(elapsedMs / 1000)}s`,
      icon: "⏱️",
      highlight: true
    },
    { 
      label: "Zorluk", 
      value: difficulty,
      icon: "🎚️" 
    },
    { 
      label: "Hata", 
      value: conflicts.size,
      icon: "❌",
      highlight: false
    },
  ],
};
```

### 5. XOX (Tic-Tac-Toe)

```tsx
const xoxResult: GameResultData = {
  gameName: "XOX",
  gameIcon: "❌⭕",
  isWin: winner === 'X', // Varsayalım ki kullanıcı X
  celebrationMessage: winner === 'X' ? "Kazandınız! 🎉" : 
                      winner === 'O' ? "Kaybettiniz! 😔" : 
                      "Berabere! 🤝",
  message: gameMode === '1P' 
    ? `${botDifficulty === 'hard' ? 'Zor' : botDifficulty === 'medium' ? 'Orta' : 'Kolay'} seviyeye karşı oynadınız`
    : "İki oyunculu mod",
  metrics: [
    { 
      label: "Kazanan", 
      value: winner || "Berabere",
      icon: winner === 'X' ? "❌" : winner === 'O' ? "⭕" : "🤝",
      highlight: true
    },
    { 
      label: "Mod", 
      value: gameMode === '1P' ? "Bot'a Karşı" : "İki Oyuncu",
      icon: "🎮" 
    },
    ...(gameMode === '1P' ? [{
      label: "Zorluk", 
      value: botDifficulty,
      icon: "🤖"
    }] : []),
  ],
};
```

### 6. Zip Puzzle

```tsx
const zipResult: GameResultData = {
  gameName: "Zip Puzzle",
  gameIcon: "🧩",
  isWin: isCompleted,
  celebrationMessage: "Harika! 🌟",
  message: "Bulmacayı çözdünüz!",
  metrics: [
    { 
      label: "Süre", 
      value: `${Math.floor((endTime - startTime) / 1000)}s`,
      icon: "⏱️",
      highlight: true
    },
    { 
      label: "Grid Boyutu", 
      value: `${gridSize}×${gridSize}`,
      icon: "📐" 
    },
    { 
      label: "Toplam Hücre", 
      value: gridSize * gridSize,
      icon: "🔢",
      highlight: false
    },
  ],
};
```

---

## Diğer Oyunlar Listesi - Örnek

```tsx
const ALL_GAMES: GameLink[] = [
  {
    name: "Hangman",
    icon: "🎯",
    url: "https://hangman.bipgames.com",
    color: "#03A9F4" // Mavi
  },
  {
    name: "CrossClimb",
    icon: "⛰️",
    url: "https://crossclimb.bipgames.com",
    color: "#32C671" // Yeşil
  },
  {
    name: "Pinpoint",
    icon: "📍",
    url: "https://pinpoint.bipgames.com",
    color: "#DF0080" // Pembe
  },
  {
    name: "Sudoku",
    icon: "🔢",
    url: "https://sudoku.bipgames.com",
    color: "#7E57C2" // Mor
  },
  {
    name: "XOX",
    icon: "❌⭕",
    url: "https://xox.bipgames.com",
    color: "#FF8A34" // Turuncu
  },
  {
    name: "Zip",
    icon: "🧩",
    url: "https://zip.bipgames.com",
    color: "#FFC400" // Sarı
  },
];

// Mevcut oyunu hariç tut
const otherGames = ALL_GAMES.filter(game => game.name !== "Hangman");
```

---

## TypeScript Tipleri

```typescript
export interface GameMetric {
  label: string;
  value: string | number;
  icon?: string;
  highlight?: boolean;
}

export interface GameResultData {
  gameName: string;
  gameIcon?: string;
  isWin: boolean;
  celebrationMessage: string;
  message?: string;
  metrics: GameMetric[];
}

export interface GameLink {
  name: string;
  icon: string;
  url: string;
  color: string;
}

export interface ResultsProps {
  resultData: GameResultData;
  onPlayAgain: () => void;
  onShare?: () => void;
  onShareStatus?: () => void;
  otherGames?: GameLink[];
  showConfetti?: boolean;
}
```

---

## BiP Paylaşım Fonksiyonları (Örnek)

```typescript
// Mesaj olarak paylaş
const handleBipShare = () => {
  const message = `${resultData.celebrationMessage}\n\n` +
    `${resultData.metrics.map(m => `${m.icon} ${m.label}: ${m.value}`).join('\n')}\n\n` +
    `BiP'te oyna: ${window.location.href}`;
  
  // BiP deep link
  window.location.href = `bip://share?text=${encodeURIComponent(message)}`;
};

// Durum olarak paylaş
const handleBipStatusShare = () => {
  const statusText = `${resultData.celebrationMessage} - ${resultData.gameName}`;
  
  // BiP status deep link
  window.location.href = `bip://status?text=${encodeURIComponent(statusText)}`;
};
```

---

## Styling

Results component, BiP'in renk paletini kullanır:

- **Mavi**: `#03A9F4` - Birincil renk
- **Sarı**: `#FFD826` - Vurgu rengi
- **Pembe**: `#DF0080` - Paylaşım butonları
- **Mor**: `#990DC6` - Durum paylaşım
- **Koyu**: `#002231` - Metin rengi
- **Açık Mavi**: `#E8F6FD` - Arka plan

Dark mode otomatik olarak desteklenmektedir.
