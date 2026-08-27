import confetti from 'canvas-confetti';
import { audioSpeech } from './audioSpeech';

/**
 * Tự động tung hoa, pháo giấy, trái tim rực rỡ sau khi người dùng tương tác xong trong hộp chatbox
 */
export function triggerInteractionCelebration() {
  audioSpeech.playCelebrationChime();

  // 1. Pháo giấy rực rỡ (Confetti Cannon)
  confetti({
    particleCount: 65,
    spread: 75,
    origin: { y: 0.65 },
    colors: ['#dc2626', '#f59e0b', '#fbbf24', '#e11d48', '#1e3a8a', '#10b981', '#ec4899']
  });

  setTimeout(() => {
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0.05, y: 0.7 },
      colors: ['#f43f5e', '#fbbf24', '#3b82f6', '#ec4899']
    });
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 0.95, y: 0.7 },
      colors: ['#f43f5e', '#fbbf24', '#3b82f6', '#ec4899']
    });
  }, 220);

  // 2. Tung Hoa tươi & Trái tim yêu thương bay nhẹ nhàng trên màn hình (Falling Flowers & Hearts)
  const items = ['🌹', '🌸', '❤️', '💖', '💐', '✨', '🌺', '🥰', '💝', '🎉'];
  const count = 30;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'animate-falling-item';
    el.textContent = items[Math.floor(Math.random() * items.length)];
    el.style.left = `${Math.random() * 94 + 3}vw`;
    el.style.top = `-35px`;
    el.style.fontSize = `${Math.random() * 18 + 22}px`;
    el.style.animationDuration = `${Math.random() * 2.5 + 3.2}s`;
    el.style.animationDelay = `${Math.random() * 1.5}s`;

    document.body.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 6000);
  }
}

export function triggerConfetti() {
  audioSpeech.playCelebrationChime();
  confetti({
    particleCount: 70,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#dc2626', '#f59e0b', '#fbbf24', '#e11d48', '#1e3a8a']
  });
}

export function triggerFloatingRoses() {
  audioSpeech.playCelebrationChime();
  const symbols = ['🌹', '🥀', '💐', '🌺', '🌸'];
  const count = 22;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'animate-falling-item';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = `${Math.random() * 95}vw`;
    el.style.top = `-30px`;
    el.style.fontSize = `${Math.random() * 20 + 22}px`;
    el.style.animationDuration = `${Math.random() * 2.5 + 3.5}s`;
    el.style.animationDelay = `${Math.random() * 1.2}s`;

    document.body.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 6000);
  }
}

export function triggerFloatingHearts() {
  audioSpeech.playCelebrationChime();
  const symbols = ['❤️', '💖', '💝', '✨', '🥰'];
  const count = 24;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'animate-falling-item';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = `${Math.random() * 95}vw`;
    el.style.top = `-30px`;
    el.style.fontSize = `${Math.random() * 20 + 22}px`;
    el.style.animationDuration = `${Math.random() * 2.5 + 3.0}s`;
    el.style.animationDelay = `${Math.random() * 1.0}s`;

    document.body.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 5500);
  }
}

