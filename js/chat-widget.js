/**
 * Hope Station — Chat Widget
 * Self-contained floating chat bubble with FAQ-based responses
 * Configured for Hope Station brand and venue info
 */

(function () {
  'use strict';

  const CONFIG = {
    brandName: 'Hope Station',
    brandColor: '#305040',
    brandColorLight: '#90B090',
    greeting: 'Hi there! I\'m the Hope Station assistant. How can I help you today?',
    placeholder: 'Ask about our venue...',
    quickReplies: [
      'What events do you host?',
      'How many guests?',
      'Where are you located?',
      'Is catering available?',
    ],
  };

  // Knowledge base
  const KB = [
    { keywords: ['event', 'host', 'offer', 'service', 'type', 'what do you'], answer: 'We host corporate retreats, wellness events, training workshops, guest speaker events, private gatherings, and custom experiences. Our venue combines indoor boardroom space with beautiful garden and mountain settings.' },
    { keywords: ['capacity', 'guest', 'people', 'how many', 'seat', 'accommodate'], answer: 'Our boardroom seats up to 20 guests. For larger events using the gardens and breakout areas, we can accommodate up to 40 guests comfortably.' },
    { keywords: ['location', 'where', 'address', 'direction', 'find', 'george', 'airport'], answer: 'We\'re located just outside George in the Western Cape, at the foot of the Outeniqua mountains. We\'re minutes from the N2 highway and George Airport (GRJ). We provide detailed directions and a GPS pin when you book.' },
    { keywords: ['cater', 'food', 'drink', 'tea', 'coffee', 'lunch', 'meal', 'dietary'], answer: 'Yes! We offer tea and coffee, morning and afternoon refreshments, light lunches, and full-day catering packages. Dietary requirements are accommodated with advance notice.' },
    { keywords: ['equipment', 'projector', 'wifi', 'wi-fi', 'screen', 'whiteboard', 'sound'], answer: 'All bookings include Wi-Fi, projector and screen, whiteboard, flip chart, and a sound system. Tables and chairs can be configured in boardroom, classroom, U-shape, or theatre style.' },
    { keywords: ['price', 'cost', 'rate', 'fee', 'how much', 'pricing', 'charge', 'quote'], answer: 'Pricing depends on the type of event, duration, and catering requirements. We\'d love to put together a custom quote for you. Please use the contact form or reach out to us directly.' },
    { keywords: ['book', 'reserve', 'availability', 'available', 'date'], answer: 'To check availability or make a booking, please fill out the enquiry form on our website or email us at info@hopestation.co.za. We respond within 24 hours.' },
    { keywords: ['visit', 'tour', 'view', 'see the venue', 'come look'], answer: 'Absolutely! We encourage site visits so you can experience the space firsthand. Contact us to arrange a viewing at a time that suits you.' },
    { keywords: ['parking', 'security', 'safe', 'secure', 'car'], answer: 'Yes, we have a gated property with dedicated secure parking for all guests.' },
    { keywords: ['corporate', 'team build', 'strategy', 'offsite', 'retreat'], answer: 'Our venue is perfect for corporate strategy days, team building, and planning sessions. The focused, nature-filled environment helps teams think clearly and connect meaningfully. Boardroom and breakout spaces available.' },
    { keywords: ['wellness', 'yoga', 'meditation', 'healing', 'mindful'], answer: 'We\'re a popular choice for wellness practitioners hosting yoga retreats, healing workshops, and mindfulness sessions. The peaceful gardens, birdsong, and mountain views create the ideal atmosphere.' },
    { keywords: ['wedding', 'birthday', 'celebration', 'party', 'anniversary'], answer: 'We host intimate private celebrations including milestone gatherings and special occasions. Our garden setting with mountain views provides a beautiful, natural backdrop. Contact us to discuss your event.' },
    { keywords: ['mountain', 'outeniqua', 'view', 'scenery', 'nature'], answer: 'Hope Station sits at the foot of the Outeniqua mountains with panoramic views. The property features manicured gardens, outdoor pathways, and a peaceful natural setting that inspires clear thinking and connection.' },
    { keywords: ['hour', 'open', 'time', 'when'], answer: 'We\'re open Monday to Friday from 08:00 to 21:00, and Saturday to Sunday from 08:00 to 18:00. We can accommodate special timing requests for events.' },
    { keywords: ['contact', 'email', 'phone', 'reach', 'get in touch'], answer: 'You can reach us via the contact form on our website, or email us at info@hopestation.co.za. We aim to respond within 24 hours.' },
    { keywords: ['hello', 'hi', 'hey', 'morning', 'afternoon', 'evening'], answer: 'Hello! Welcome to Hope Station. How can I help you today? You can ask about our venue, events, availability, or anything else.' },
  ];

  function findAnswer(query) {
    const q = query.toLowerCase();
    let best = null;
    let bestScore = 0;

    for (const item of KB) {
      let score = 0;
      for (const kw of item.keywords) {
        if (q.includes(kw)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }

    return best
      ? best.answer
      : 'I\'m not sure about that, but I\'d love to help! Please use our contact form below or email info@hopestation.co.za and we\'ll get back to you within 24 hours.';
  }

  // Build widget DOM
  function init() {
    const style = document.createElement('style');
    style.textContent = `
      .chat-widget { position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: 'Inter', system-ui, sans-serif; }
      .chat-bubble { width: 56px; height: 56px; border-radius: 50%; background: ${CONFIG.brandColor}; color: #fff; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; transition: transform 200ms ease, box-shadow 200ms ease; }
      .chat-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,0,0,0.2); }
      .chat-bubble svg { width: 24px; height: 24px; }
      .chat-panel { position: absolute; bottom: 68px; right: 0; width: 360px; max-width: calc(100vw - 32px); background: #fff; border-radius: 16px; box-shadow: 0 12px 48px rgba(0,0,0,0.15); overflow: hidden; transform: scale(0.9) translateY(10px); opacity: 0; pointer-events: none; transition: transform 300ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease; }
      .chat-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: auto; }
      .chat-header { background: ${CONFIG.brandColor}; color: #fff; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
      .chat-header h3 { font-size: 15px; font-weight: 600; margin: 0; }
      .chat-header button { background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; padding: 4px; font-size: 18px; line-height: 1; }
      .chat-header button:hover { color: #fff; }
      .chat-messages { height: 300px; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
      .chat-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; word-wrap: break-word; }
      .chat-msg.bot { background: #f0f5f0; color: #1a2e22; align-self: flex-start; border-bottom-left-radius: 4px; }
      .chat-msg.user { background: ${CONFIG.brandColor}; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
      .chat-quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px; }
      .chat-quick button { background: #f0f5f0; border: 1px solid #d0e0d0; color: ${CONFIG.brandColor}; font-size: 12px; padding: 6px 12px; border-radius: 20px; cursor: pointer; transition: background 150ms ease; }
      .chat-quick button:hover { background: #d0e0d0; }
      .chat-input-wrap { display: flex; border-top: 1px solid #e8ede8; }
      .chat-input-wrap input { flex: 1; border: none; padding: 14px 16px; font-size: 13px; outline: none; background: transparent; }
      .chat-input-wrap button { background: none; border: none; color: ${CONFIG.brandColor}; padding: 14px 16px; cursor: pointer; font-weight: 600; font-size: 13px; }
      .chat-input-wrap button:hover { color: ${CONFIG.brandColorLight}; }
      @media (max-width: 420px) { .chat-panel { width: calc(100vw - 16px); right: -8px; bottom: 64px; } }
    `;
    document.head.appendChild(style);

    const widget = document.createElement('div');
    widget.className = 'chat-widget';
    widget.innerHTML = `
      <div class="chat-panel" id="chat-panel">
        <div class="chat-header">
          <h3>${CONFIG.brandName} Assistant</h3>
          <button id="chat-close" aria-label="Close chat">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-quick" id="chat-quick"></div>
        <div class="chat-input-wrap">
          <input type="text" id="chat-input" placeholder="${CONFIG.placeholder}" autocomplete="off">
          <button id="chat-send">Send</button>
        </div>
      </div>
      <button class="chat-bubble" id="chat-toggle" aria-label="Open chat">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
      </button>
    `;
    document.body.appendChild(widget);

    const panel = document.getElementById('chat-panel');
    const messages = document.getElementById('chat-messages');
    const quickWrap = document.getElementById('chat-quick');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const toggleBtn = document.getElementById('chat-toggle');
    const closeBtn = document.getElementById('chat-close');

    let isOpen = false;
    let hasGreeted = false;

    function toggle() {
      isOpen = !isOpen;
      panel.classList.toggle('open', isOpen);
      if (isOpen && !hasGreeted) {
        addMsg(CONFIG.greeting, 'bot');
        showQuickReplies();
        hasGreeted = true;
      }
      if (isOpen) input.focus();
    }

    function addMsg(text, type) {
      const div = document.createElement('div');
      div.className = `chat-msg ${type}`;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function showQuickReplies() {
      quickWrap.innerHTML = '';
      CONFIG.quickReplies.forEach((q) => {
        const btn = document.createElement('button');
        btn.textContent = q;
        btn.addEventListener('click', () => handleSend(q));
        quickWrap.appendChild(btn);
      });
    }

    function handleSend(text) {
      const msg = text || input.value.trim();
      if (!msg) return;
      input.value = '';
      quickWrap.innerHTML = '';
      addMsg(msg, 'user');

      // Typing indicator
      const typing = document.createElement('div');
      typing.className = 'chat-msg bot';
      typing.textContent = '...';
      typing.style.opacity = '0.5';
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;

      setTimeout(() => {
        typing.remove();
        addMsg(findAnswer(msg), 'bot');
      }, 600 + Math.random() * 400);
    }

    toggleBtn.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);
    sendBtn.addEventListener('click', () => handleSend());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
