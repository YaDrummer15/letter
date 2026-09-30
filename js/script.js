(function() {
  'use strict';

  // ===== ТЕКСТ ПИСЬМА =====
  const PARAGRAPHS = [
    "Я хочу начать с того, что мне очень жаль за то, как я себя вел в последнее время. Понимаю, что своими действиями я порчу тебе настроение и разочаровываю тебя, и за это я глубоко извиняюсь.",
    "Я осознал свои ошибки и обещаю работать над собой, чтобы стать лучшим человеком для тебя.",
    "Я очень ценю нашу дружбу и всё, что мы прошли вместе. Мне невероятно важно наше общение, и я сделаю всё возможное, чтобы мы были счастливы вместе.",
    "Спасибо, что уделила время этому письму. Я очень ценю нашу дружбу и надеюсь на её сохранение."
  ];

  // ===== НАСТРОЙКИ ПЕЧАТИ =====
  const BASE_SPEED = 26;
  const SPEED_VARIATION = 24;
  const PAUSE_AFTER_SENTENCE = 180;
  const PAUSE_AFTER_COMMA = 80;
  const PAUSE_BETWEEN_PARAGRAPHS = 800;
  const START_DELAY = 2400;

  // ===== DOM-ЭЛЕМЕНТЫ =====
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const letter = document.getElementById('letter');
  const letterBody = document.getElementById('letterBody');
  const openBtn = document.getElementById('openBtn');
  const closeBtn = document.getElementById('closeBtn');
  const scene = document.getElementById('scene');

  // ===== СОСТОЯНИЕ =====
  let isOpen = false;
  let typingTimers = [];
  let isTyping = false;
  let fullText = '';
  let paragraphsMeta = [];

  /**
   * Очищает все таймеры печати
   */
  function clearTypingTimers() {
    typingTimers.forEach(timer => clearTimeout(timer));
    typingTimers = [];
    isTyping = false;
  }

  /**
   * Готовит структуру письма: собирает полный текст
   * и создаёт один <p> с текстовым узлом + курсор.
   * Такой подход позволяет браузеру естественно переносить строки.
   */
  function buildLetterContent() {
    fullText = '';
    paragraphsMeta = [];

    PARAGRAPHS.forEach((paragraph, index) => {
      const start = fullText.length;
      fullText += paragraph;
      const end = fullText.length;
      paragraphsMeta.push({ start, end, index });

      if (index < PARAGRAPHS.length - 1) {
        fullText += '\n\n';
      }
    });

    letterBody.innerHTML = '';
    const p = document.createElement('p');
    p.id = 'typingParagraph';
    letterBody.appendChild(p);

    // Пустой текстовый узел перед курсором
    const textNode = document.createTextNode('');
    p.appendChild(textNode);

    // Курсор-каретка
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.id = 'typingCursor';
    cursor.style.display = 'none';
    p.appendChild(cursor);
  }

  /**
   * Дополнительная задержка в зависимости от символа
   */
  function getCharDelay(char) {
    const base = BASE_SPEED + Math.random() * SPEED_VARIATION;
    if ('.!?'.includes(char)) return base + PAUSE_AFTER_SENTENCE;
    if (',;:'.includes(char)) return base + PAUSE_AFTER_COMMA;
    return base;
  }

  /**
   * Посимвольная печать: символы добавляются в текстовый узел перед курсором.
   * Браузер сам переносит строки — не нужно оборачивать символы в span.
   */
  function startTyping() {
    clearTypingTimers();
    isTyping = true;

    const p = document.getElementById('typingParagraph');
    const cursor = document.getElementById('typingCursor');
    if (!p || !cursor) return;

    cursor.style.display = 'inline-block';

    // Текстовый узел — первый ребёнок абзаца
    const textNode = p.firstChild;

    let charIndex = 0;

    function typeNextChar() {
      if (charIndex >= fullText.length) {
        // Конец текста — прячем каретку
        const endTimer = setTimeout(() => {
          cursor.style.display = 'none';
          isTyping = false;
        }, 500);
        typingTimers.push(endTimer);
        return;
      }

      const char = fullText[charIndex];
      textNode.textContent += char;

      // Проверяем, не закончился ли абзац
      const isParagraphEnd = paragraphsMeta.some(
        meta => meta.end === charIndex + 1 && meta.index < PARAGRAPHS.length - 1
      );

      let delay = getCharDelay(char);
      if (isParagraphEnd) {
        delay += PAUSE_BETWEEN_PARAGRAPHS;
      }

      charIndex++;

      const timer = setTimeout(typeNextChar, delay);
      typingTimers.push(timer);
    }

    // Запускаем печать с небольшой задержкой
    const startTimer = setTimeout(typeNextChar, 100);
    typingTimers.push(startTimer);
  }

  /**
   * Мгновенно показывает весь текст
   */
  function finishTyping() {
    clearTypingTimers();
    const p = document.getElementById('typingParagraph');
    const cursor = document.getElementById('typingCursor');
    if (p && cursor) {
      const textNode = p.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = fullText;
      }
      cursor.style.display = 'none';
    }
    isTyping = false;
  }

  /**
   * Сбрасывает состояние печати
   */
  function resetTyping() {
    clearTypingTimers();
    const p = document.getElementById('typingParagraph');
    const cursor = document.getElementById('typingCursor');
    if (p && cursor) {
      const textNode = p.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = '';
      }
      cursor.style.display = 'none';
    }
  }

  /**
   * Открывает конверт с полной хореографией
   */
  function openEnvelope() {
    if (isOpen) return;
    isOpen = true;

    resetTyping();

    envelopeWrapper.classList.add('opened');
    letter.classList.add('visible');

    const startTimer = setTimeout(() => {
      startTyping();
    }, START_DELAY);
    typingTimers.push(startTimer);

    openBtn.style.display = 'none';
    closeBtn.classList.add('visible');
  }

  /**
   * Закрывает письмо
   */
  function closeEnvelope() {
    if (!isOpen) return;
    isOpen = false;

    clearTypingTimers();
    envelopeWrapper.classList.remove('opened');
    letter.classList.remove('visible');

    const resetTimer = setTimeout(() => {
      resetTyping();
    }, 1500);
    typingTimers.push(resetTimer);

    openBtn.style.display = 'block';
    closeBtn.classList.remove('visible');
  }

  // ===== ИНИЦИАЛИЗАЦИЯ =====
  buildLetterContent();

  // ===== ОБРАБОТЧИКИ =====
  openBtn.addEventListener('click', e => {
    e.stopPropagation();
    openEnvelope();
  });

  closeBtn.addEventListener('click', e => {
    e.stopPropagation();
    closeEnvelope();
  });

  scene.addEventListener('click', e => {
    if (e.target === scene && isOpen) closeEnvelope();
  });

  letter.addEventListener('click', e => e.stopPropagation());
  envelopeWrapper.addEventListener('click', e => e.stopPropagation());

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeEnvelope();
  });

  // Двойной клик — мгновенно показать весь текст
  letter.addEventListener('dblclick', () => {
    if (isOpen && isTyping) finishTyping();
  });

})();