import { useState, useEffect } from "react";
import { Modal } from "@bip-games/ui";
import "./App.css";
import dataEN from "./ladders_en.json";
import dataTR from "./ladders_tr.json";

function App() {
  const [language, setLanguage] = useState("en"); // 'en' veya 'tr'
  const data = language === "en" ? dataEN : dataTR;

  const [gameState, setGameState] = useState({
    words: [],
    originalOrder: [], // Doğru sıralama referansı
    currentWordIndex: 1, // Ortadaki 5'ten başla
    revealedLetters: {}, // { wordIndex: [0, 1, 2, 3, 4, 5] }
    guessedLetters: 0, // Toplam tahmin edilen harf sayısı
    startTime: null,
    endTime: null,
    isGameComplete: false,
    middleWordsSorted: false, // Ortadaki 5 kelime doğru sıralandı mı?
    timerStarted: false, // Timer başladı mı?
    wordLength: 5, // Mevcut ladder'ın kelime uzunluğu
    sortingMessageShown: false, // Sıralama mesajı gösterildi mi?
  });

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const showModal = (title: string, message: string) => {
    setModalState({ isOpen: true, title, message });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, title: "", message: "" });
  };

  // Timer için interval
  useEffect(() => {
    let interval = null;

    if (gameState.timerStarted && !gameState.isGameComplete) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - gameState.startTime) / 1000));
      }, 1000);
    } else if (gameState.isGameComplete) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [gameState.timerStarted, gameState.isGameComplete, gameState.startTime]);

  // Oyunu başlat
  const startGame = () => {
    // Rastgele bir ladder seç
    const randomLadder = data[Math.floor(Math.random() * data.length)];

    // İlk ve son kelimeyi ayır
    const firstWord = randomLadder.ladder[0];
    const lastWord = randomLadder.ladder[6];
    const middleWords = randomLadder.ladder.slice(1, 6);

    // Ortadaki 5 kelimeyi karıştır
    const shuffledMiddle = [...middleWords].sort(() => Math.random() - 0.5);

    // Kelimeleri birleştir
    const allWords = [
      { ...firstWord, locked: true, revealed: false, userInput: null }, // İlk kelime kapalı ve kilitli
      ...shuffledMiddle.map((w) => ({
        ...w,
        locked: false,
        revealed: false,
        userInput: null,
      })),
      { ...lastWord, locked: true, revealed: false, userInput: null }, // Son kelime kapalı ve kilitli
    ];

    setGameState({
      words: allWords,
      originalOrder: randomLadder.ladder.map((w) => w.word), // Doğru sırayı sakla
      currentWordIndex: 1,
      revealedLetters: {},
      guessedLetters: 0,
      startTime: null,
      endTime: null,
      isGameComplete: false,
      middleWordsSorted: false,
      timerStarted: false,
      wordLength: randomLadder.wordLength, // Kelime uzunluğunu sakla
      sortingMessageShown: false,
    });

    setElapsedTime(0);
  };

  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]); // Dil değiştiğinde oyunu yeniden başlat

  // İpucu - 1 harf aç
  const handleRevealHint = () => {
    const currentWord = gameState.words[gameState.currentWordIndex];
    if (currentWord.revealed) return;

    const wordIndex = gameState.currentWordIndex;
    const currentRevealed = gameState.revealedLetters[wordIndex] || [];
    const userInput =
      currentWord.userInput || Array(gameState.wordLength).fill("");

    // Henüz açılmamış VE kullanıcı tarafından doldurulmamış harfleri bul
    const wordLen = gameState.wordLength;
    const unrevealedIndices = Array.from(
      { length: wordLen },
      (_, i) => i
    ).filter((i) => !currentRevealed.includes(i) && !userInput[i]);

    if (unrevealedIndices.length > 0) {
      const randomIndex =
        unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];

      const newRevealedLetters = [...currentRevealed, randomIndex];

      // Eğer bu son harf ise, kelimeyi tamamen revealed olarak işaretle
      if (newRevealedLetters.length === wordLen) {
        const newWords = [...gameState.words];
        newWords[wordIndex].revealed = true;

        // Sonraki adımı belirle (handleRevealRow ile aynı mantık)
        let nextIndex = wordIndex;
        let newMiddleSorted = gameState.middleWordsSorted;

        if (wordIndex >= 1 && wordIndex <= 5) {
          const allMiddleRevealed = newWords
            .slice(1, 6)
            .every((w) => w.revealed);

          if (allMiddleRevealed && !gameState.middleWordsSorted) {
            const isSorted = checkMiddleWordsSorted(newWords);

            if (isSorted) {
              showModal(
                "🎉 Harika!",
                "Ortadaki kelimeler doğru sıralandı! Şimdi en üstteki kelimeyi tahmin edin."
              );
              newWords[0].locked = false;
              nextIndex = 0;
              newMiddleSorted = true;
            } else {
              // İlk kez mi gösteriyoruz yoksa kullanıcı mesajı gördükten sonra mı?
              if (!gameState.sortingMessageShown) {
                // İlk kez - bilgilendirme mesajı
                showModal(
                  "ℹ️ Sıralama Gerekli",
                  "Tüm kelimeler açıldı! Şimdi yeşil kutuları sürükleyerek doğru sıralayın."
                );
              } else {
                // Mesaj zaten gösterilmişti - hata mesajı
                showModal(
                  "❌ Yanlış Sıralama",
                  "Kelimeler doğru sıralanmamış! Lütfen sıralamayı düzeltin."
                );
              }
              setGameState({
                ...gameState,
                words: newWords,
                guessedLetters: gameState.guessedLetters + 1,
                startTime: gameState.timerStarted
                  ? gameState.startTime
                  : Date.now(),
                timerStarted: true,
                sortingMessageShown: true, // Mesajı gösterdik
              });
              return;
            }
          } else {
            nextIndex = wordIndex + 1;
          }
        } else if (wordIndex === 0) {
          newWords[6].locked = false;
          nextIndex = 6;
        } else if (wordIndex === 6) {
          setGameState({
            ...gameState,
            words: newWords,
            endTime: Date.now(),
            isGameComplete: true,
            guessedLetters: gameState.guessedLetters + 1,
          });

          const finalTime = Math.floor(
            (Date.now() - gameState.startTime) / 1000
          );
          setTimeout(() => {
            showModal(
              "🎉 Tebrikler!",
              `Oyunu başarıyla tamamladınız!\n\nSüre: ${finalTime} saniye\nToplam Harf: ${
                gameState.guessedLetters + 1
              }`
            );
          }, 100);
          return;
        }

        setGameState({
          ...gameState,
          words: newWords,
          currentWordIndex: nextIndex,
          middleWordsSorted: newMiddleSorted,
          guessedLetters: gameState.guessedLetters + 1,
          startTime: gameState.timerStarted ? gameState.startTime : Date.now(),
          timerStarted: true,
        });
      } else {
        // Henüz tüm harfler açılmadı, sadece ipucu güncelle
        setGameState({
          ...gameState,
          revealedLetters: {
            ...gameState.revealedLetters,
            [wordIndex]: newRevealedLetters,
          },
          guessedLetters: gameState.guessedLetters + 1,
          startTime: gameState.timerStarted ? gameState.startTime : Date.now(),
          timerStarted: true,
        });
      }
    }
  };

  // Satırı göster - Tüm kelimeyi aç (dinamik harf sayısı)
  const handleRevealRow = () => {
    const currentWord = gameState.words[gameState.currentWordIndex];
    if (currentWord.revealed) return;

    const newWords = [...gameState.words];
    newWords[gameState.currentWordIndex].revealed = true;

    const wordLen = gameState.wordLength; // Dinamik harf sayısı

    // Sonraki adımı belirle (handleGuess ile aynı mantık)
    let nextIndex = gameState.currentWordIndex;
    let newMiddleSorted = gameState.middleWordsSorted;

    // Ortadaki 5 kelime tamamlandı mı kontrol et (index 1-5)
    if (gameState.currentWordIndex >= 1 && gameState.currentWordIndex <= 5) {
      const allMiddleRevealed = newWords.slice(1, 6).every((w) => w.revealed);

      if (allMiddleRevealed && !gameState.middleWordsSorted) {
        // Ortadaki 5 kelime tamamlandı, sıralama kontrolü yap
        const isSorted = checkMiddleWordsSorted(newWords);

        if (isSorted) {
          // Doğru sıralandı - İlk kelimeye (index 0) geç
          showModal(
            "🎉 Harika!",
            "Ortadaki kelimeler doğru sıralandı! Şimdi en üstteki kelimeyi tahmin edin."
          );
          newWords[0].locked = false; // İlk kelimenin kilidini aç
          nextIndex = 0;
          newMiddleSorted = true;
        } else {
          // Yanlış sıralanmış
          // İlk kez mi gösteriyoruz yoksa kullanıcı mesajı gördükten sonra mı?
          if (!gameState.sortingMessageShown) {
            // İlk kez - bilgilendirme mesajı
            showModal(
              "ℹ️ Sıralama Gerekli",
              "Tüm kelimeler açıldı! Şimdi yeşil kutuları sürükleyerek doğru sıralayın."
            );
          } else {
            // Mesaj zaten gösterilmişti - hata mesajı
            showModal(
              "❌ Yanlış Sıralama",
              "Kelimeler doğru sıralanmamış! Lütfen sıralamayı düzeltin."
            );
          }
          setGameState({
            ...gameState,
            guessedLetters: gameState.guessedLetters + wordLen,
            startTime: gameState.timerStarted
              ? gameState.startTime
              : Date.now(),
            timerStarted: true,
            sortingMessageShown: true, // Mesajı gösterdik
          });
          return;
        }
      } else {
        // Ortadaki kelimeler henüz bitmedi, devam et
        nextIndex = gameState.currentWordIndex + 1;
      }
    } else if (gameState.currentWordIndex === 0) {
      // İlk kelime açıldı, son kelimeye (index 6) geç
      newWords[6].locked = false; // Son kelimenin kilidini aç
      nextIndex = 6;
    } else if (gameState.currentWordIndex === 6) {
      // Son kelime - Oyun bitti
      setGameState({
        ...gameState,
        words: newWords,
        endTime: Date.now(),
        isGameComplete: true,
        guessedLetters: gameState.guessedLetters + wordLen,
      });

      // Sonuç alert
      const finalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
      setTimeout(() => {
        showModal(
          "🎉 Tebrikler!",
          `Oyunu başarıyla tamamladınız!\n\nSüre: ${finalTime} saniye\nToplam Harf: ${
            gameState.guessedLetters + wordLen
          }`
        );
      }, 100);
      return;
    }

    setGameState({
      ...gameState,
      words: newWords,
      currentWordIndex: nextIndex,
      middleWordsSorted: newMiddleSorted,
      guessedLetters: gameState.guessedLetters + wordLen,
      // Timer'ı başlat (ilk buton)
      startTime: gameState.timerStarted ? gameState.startTime : Date.now(),
      timerStarted: true,
    });
  };

  // Drag & Drop işlemleri - Artık sadece tüm kelimeler açıldıktan sonra sıralama için
  const handleDragStart = (index) => {
    // Sadece ortadaki kelimeler açılıp tamamlandıysa drag'e izin ver
    if (gameState.words[index].locked || !gameState.words[index].revealed)
      return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (gameState.words[index].locked || !gameState.words[index].revealed)
      return;
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (
      draggedIndex === null ||
      gameState.words[dropIndex].locked ||
      !gameState.words[dropIndex].revealed
    )
      return;

    const newWords = [...gameState.words];
    const draggedWord = newWords[draggedIndex];
    newWords.splice(draggedIndex, 1);
    newWords.splice(dropIndex, 0, draggedWord);

    // Ortadaki 5 kelime tamamlandıysa ve henüz sıralama kontrolü yapılmadıysa kontrol et
    if (!gameState.middleWordsSorted) {
      const allMiddleRevealed = newWords.slice(1, 6).every((w) => w.revealed);

      if (allMiddleRevealed) {
        // Tüm ortadaki kelimeler açıldı, sıralama kontrolü yap
        const middleSorted = checkMiddleWordsSorted(newWords);

        if (middleSorted) {
          // İlk kez doğru sıralandı - ilk kelimeyi aktif et
          newWords[0].locked = false; // İlk kelimenin kilidini aç
          showModal(
            "🎉 Harika!",
            "Ortadaki kelimeler doğru sıralandı! Şimdi en üstteki kelimeyi tahmin edin."
          );
          setGameState({
            ...gameState,
            words: newWords,
            middleWordsSorted: true,
            currentWordIndex: 0, // İlk kelimeye geç
          });
        } else {
          // Henüz doğru sıralanmamış
          setGameState({
            ...gameState,
            words: newWords,
          });
        }
      } else {
        // Henüz tamamlanmadı
        setGameState({
          ...gameState,
          words: newWords,
        });
      }
    } else {
      // Sıralama zaten yapılmış, sadece güncelle
      setGameState({
        ...gameState,
        words: newWords,
      });
    }
    setDraggedIndex(null);
  };

  // Ortadaki 5 kelimenin doğru sırada olup olmadığını kontrol et
  const checkMiddleWordsSorted = (words) => {
    for (let i = 1; i <= 5; i++) {
      if (words[i].word !== gameState.originalOrder[i]) {
        return false;
      }
    }
    return true;
  };

  // Harf inputu değiştiğinde
  const handleLetterInput = (wordIndex, letterIndex, value) => {
    if (gameState.words[wordIndex].locked) return;

    // Timer'ı başlat
    if (!gameState.timerStarted && value) {
      setGameState((prev) => ({
        ...prev,
        startTime: Date.now(),
        timerStarted: true,
      }));
    }

    // Sadece tek harf kabul et ve BÜYÜK HARFE ÇEVİR
    const letter = value.toUpperCase().slice(-1);

    // Mevcut kelime inputunu güncelle
    const newWords = [...gameState.words];
    if (!newWords[wordIndex].userInput) {
      newWords[wordIndex].userInput = Array(gameState.wordLength).fill("");
    }
    newWords[wordIndex].userInput[letterIndex] = letter;

    setGameState((prev) => ({
      ...prev,
      words: newWords,
    }));

    // Eğer harf girilmişse ve son harf değilse, bir sonraki inputa geç
    if (letter && letterIndex < gameState.wordLength - 1) {
      const nextInput = document.getElementById(
        `letter-${wordIndex}-${letterIndex + 1}`
      );
      if (nextInput) nextInput.focus();
    }

    // Tüm harfler girildiyse otomatik kontrol et (revealed harfler dahil)
    const revealedIndices = gameState.revealedLetters[wordIndex] || [];
    const userInput = newWords[wordIndex].userInput || [];
    const word = newWords[wordIndex].word;

    // Her pozisyon için ya revealed ya da user input olmalı
    let completeWord = "";
    let isComplete = true;

    for (let i = 0; i < gameState.wordLength; i++) {
      if (revealedIndices.includes(i)) {
        // Bu harf revealed
        completeWord += word[i];
      } else if (userInput[i]) {
        // Bu harf user tarafından girilmiş
        completeWord += userInput[i];
      } else {
        // Bu harf boş
        isComplete = false;
        break;
      }
    }

    // Tüm harfler dolu mu kontrol et
    if (isComplete && completeWord.length === gameState.wordLength) {
      // Kelime tamam, kontrol et
      setTimeout(() => checkWordGuess(wordIndex, completeWord, newWords), 100);
    }
  };

  // Backspace ve Tab tuşları için özel işlem
  const handleKeyDown = (wordIndex, letterIndex, e) => {
    if (e.key === "Backspace") {
      const currentInput = e.target.value;

      // Eğer şu anki input boşsa, bir önceki inputa git
      if (!currentInput && letterIndex > 0) {
        e.preventDefault();
        const prevInput = document.getElementById(
          `letter-${wordIndex}-${letterIndex - 1}`
        ) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          prevInput.select();
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();

      // Tab: sonraki input'a geç
      if (!e.shiftKey) {
        // Normal Tab - sonraki harf
        if (letterIndex < gameState.wordLength - 1) {
          const nextInput = document.getElementById(
            `letter-${wordIndex}-${letterIndex + 1}`
          ) as HTMLInputElement;
          if (nextInput && !nextInput.disabled) {
            nextInput.focus();
            nextInput.select();
          }
        } else if (wordIndex < gameState.words.length - 1) {
          // Bir sonraki kelimeye geç
          const nextWordFirstInput = document.getElementById(
            `letter-${wordIndex + 1}-0`
          ) as HTMLInputElement;
          if (nextWordFirstInput && !nextWordFirstInput.disabled) {
            nextWordFirstInput.focus();
            nextWordFirstInput.select();
          }
        }
      } else {
        // Shift+Tab - önceki harf
        if (letterIndex > 0) {
          const prevInput = document.getElementById(
            `letter-${wordIndex}-${letterIndex - 1}`
          ) as HTMLInputElement;
          if (prevInput && !prevInput.disabled) {
            prevInput.focus();
            prevInput.select();
          }
        } else if (wordIndex > 0) {
          // Bir önceki kelimenin son harfine geç
          const prevWordLastInput = document.getElementById(
            `letter-${wordIndex - 1}-${gameState.wordLength - 1}`
          ) as HTMLInputElement;
          if (prevWordLastInput && !prevWordLastInput.disabled) {
            prevWordLastInput.focus();
            prevWordLastInput.select();
          }
        }
      }
    }
  };

  // Kelime tahminini kontrol et
  const checkWordGuess = (wordIndex, userWord, words) => {
    const currentWord = words[wordIndex];

    if (userWord === currentWord.word) {
      // Doğru tahmin
      const newWords = [...words];
      newWords[wordIndex].revealed = true;
      newWords[wordIndex].userInput = null;

      // Sonraki adımı belirle
      let nextIndex = wordIndex;
      let newMiddleSorted = gameState.middleWordsSorted;

      // Ortadaki 5 kelime tamamlandı mı kontrol et (index 1-5)
      if (wordIndex >= 1 && wordIndex <= 5) {
        // Bir sonraki kelimeye geç (ortadaki 5 içinde)
        if (wordIndex < 5) {
          nextIndex = wordIndex + 1;
        } else {
          // 5. kelime bitti, tüm ortadakiler tamamlandı
          const allMiddleRevealed = newWords
            .slice(1, 6)
            .every((w) => w.revealed);

          if (allMiddleRevealed) {
            // Tüm ortadaki kelimeler açıldı, sıralama kontrolü yap
            const middleSorted = checkMiddleWordsSorted(newWords);

            if (middleSorted) {
              // Doğru sıralandı - ilk kelimeyi aktif et
              newWords[0].locked = false;
              showModal(
                "🎉 Mükemmel!",
                "Tüm kelimeler doğru sıralandı! Şimdi en üstteki kelimeyi tahmin edin."
              );
              newMiddleSorted = true;
              nextIndex = 0;
            } else {
              // Yanlış sıralanmış - kullanıcı drag-drop ile düzeltsin
              showModal(
                "ℹ️ Sıralama Gerekli",
                "Tüm kelimeler doğru! Şimdi yeşil kutuları sürükleyerek doğru sıralayın."
              );
              // nextIndex'i 5'te bırak (son kelimede kal), böylece currentWordIndex değişmez
              // Ama state'i güncelle ki revealed true olsun
              newMiddleSorted = false;
              nextIndex = 5; // 5. kelimede kal
            }
          }
        }
      } else if (wordIndex === 0) {
        // İlk kelime tamamlandı, son kelimeyi aktif et
        newWords[6].locked = false;
        showModal("✅ Harika!", "İlk kelime doğru! Son kelimeyi tahmin edin.");
        nextIndex = 6;
      } else if (wordIndex === 6) {
        // Son kelime - oyun bitti!
        const endTime = Date.now();
        const timeTaken = Math.floor((endTime - gameState.startTime) / 1000);
        showModal(
          "🎉 Tebrikler!",
          `Oyunu ${timeTaken} saniyede ve ${gameState.guessedLetters} harf ile tamamladınız!`
        );
        setGameState({
          ...gameState,
          words: newWords,
          endTime,
          isGameComplete: true,
        });
        return;
      }

      setGameState({
        ...gameState,
        words: newWords,
        currentWordIndex: nextIndex,
        middleWordsSorted: newMiddleSorted,
        guessedLetters: gameState.guessedLetters + gameState.wordLength,
        sortingMessageShown: newMiddleSorted ? false : true, // Eğer sıralama doğruysa reset, değilse mesaj gösterildi
      });
    } else {
      // Yanlış tahmin - word-box'ı kırmızı yap, temizle ve ilk harfe dön
      const wordBoxElement = document.querySelector(
        `.word-box[data-word-index="${wordIndex}"]`
      );

      if (wordBoxElement) {
        // Kırmızı background ekle
        wordBoxElement.classList.add("wrong-answer");

        // 1 saniye sonra kırmızıyı kaldır ve inputları temizle
        setTimeout(() => {
          wordBoxElement.classList.remove("wrong-answer");

          // Inputları temizle
          const newWords = [...gameState.words];
          newWords[wordIndex].userInput = Array(gameState.wordLength).fill("");
          setGameState((prev) => ({
            ...prev,
            words: newWords,
          }));

          // İmleci ilk harfe al
          const firstInput = document.getElementById(`letter-${wordIndex}-0`);
          if (firstInput) firstInput.focus();
        }, 1000);
      }
    }
  };

  // Kelime görüntüsü - harf inputları ile
  const renderWord = (word, index) => {
    // Eğer kelime açıldıysa (revealed), yeşil kutular göster
    if (word.revealed) {
      return (
        <div className="letters-container">
          {word.word.split("").map((letter, i) => (
            <div key={i} className="letter-box revealed">
              {letter}
            </div>
          ))}
        </div>
      );
    }

    // Ortadaki 5 kelime için (index 1-5) sadece aktif olanı göster
    const isMiddleWord = index >= 1 && index <= 5;
    const isActive = index === gameState.currentWordIndex;

    // Eğer ortadaki kelimelerden biri ama aktif değilse, kapalı göster
    if (isMiddleWord && !isActive && !gameState.middleWordsSorted) {
      return (
        <div className="letters-container">
          {Array(gameState.wordLength)
            .fill("_")
            .map((_, i) => (
              <div key={i} className="letter-box hidden">
                _
              </div>
            ))}
        </div>
      );
    }

    // Aktif kelime veya üst/alt kelimeler için inputları göster
    const revealedIndices = gameState.revealedLetters[index] || [];
    const userInput = word.userInput || Array(gameState.wordLength).fill("");

    return (
      <div className="letters-container">
        {word.word.split("").map((letter, i) => {
          const isRevealed = revealedIndices.includes(i);
          const userLetter = userInput[i] || "";

          return (
            <input
              key={i}
              id={`letter-${index}-${i}`}
              type="text"
              className={`letter-input ${isRevealed ? "revealed" : ""}`}
              value={isRevealed ? letter : userLetter}
              onChange={(e) =>
                !isRevealed && handleLetterInput(index, i, e.target.value)
              }
              onKeyDown={(e) => !isRevealed && handleKeyDown(index, i, e)}
              disabled={word.locked || isRevealed}
              maxLength={1}
              autoComplete="off"
            />
          );
        })}
      </div>
    );
  };

  const currentHint = gameState.words[gameState.currentWordIndex]?.hint || "";

  return (
    <div className="App">
      <header>
        <h1>CrossClimb</h1>
        <button
          className="help-button"
          onClick={() => setIsHelpModalOpen(true)}
          title="Nasıl Oynanır?"
        >
          ?
        </button>
      </header>

      <main>
        <div className="game-controls">
          <div className="language-dropdown-wrapper">
            <select
              className="language-dropdown"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="tr">🇹🇷 Türkçe Kelimeler</option>
              <option value="en">🇬🇧 İngilizce Kelimeler</option>
            </select>
          </div>
          <div className="stats">
            <span>⏱️ {elapsedTime}s</span>
            <span>📝 {gameState.guessedLetters}</span>
          </div>
        </div>

        <div className="words-container">
          {gameState.words.map((item, index) => {
            // Sadece açılmış kelimeler drag edilebilir (sıralama için)
            const isDraggable =
              item.revealed && !item.locked && index >= 1 && index <= 5;

            return (
              <div
                key={index}
                className={`word-box ${item.locked ? "locked" : ""} ${
                  index === gameState.currentWordIndex ? "active" : ""
                } ${isDraggable ? "has-drag-handle" : ""}`}
                data-word-index={index}
                draggable={isDraggable}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                {isDraggable && (
                  <span className="drag-handle" title="Sürükleyerek taşıyın">
                    ⠿
                  </span>
                )}
                {renderWord(item, index)}
              </div>
            );
          })}
        </div>

        <div className="hint-display">
          <p>{currentHint}</p>
        </div>

        <div className="controls">
          <button
            className="control-btn reveal-row-btn"
            onClick={handleRevealRow}
          >
            Satırı Göster
          </button>
          <button className="control-btn hint-btn" onClick={handleRevealHint}>
            İpucu
          </button>
        </div>
      </main>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
      >
        <p style={{ whiteSpace: "pre-line" }}>{modalState.message}</p>
      </Modal>

      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="📖 Nasıl Oynanır?"
      >
        <div style={{ textAlign: "left", lineHeight: "1.6" }}>
          <p>
            <strong>Oyunun Amacı:</strong> Verilen ipuçlarını kullanarak 7
            kelimelik merdiveni tamamlayın. Her kelime bir önceki kelimeden
            sadece bir harfi farklıdır.
          </p>
          <p>
            <strong>Oynanış:</strong>
          </p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Ortadaki 5 kelimeyi ipuçlarına bakarak tahmin edin</li>
            <li>
              Kelimeleri doğru sıraya koymak için yeşil kutuları sürükleyin
            </li>
            <li>En üstteki ve en alttaki kelimeleri tahmin edin</li>
          </ul>
          <p>
            <strong>Butonlar:</strong>
          </p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>
              <strong>İpucu:</strong> Aktif kelimeden rastgele bir harf açar
            </li>
            <li>
              <strong>Satırı Göster:</strong> Aktif kelimenin tamamını açar
            </li>
          </ul>
          <p>
            <strong>İpucu:</strong> Her kelime bir öncekinden sadece bir harfi
            farklıdır. İpuçlarını dikkatlice okuyun!
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default App;
