import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { enviarMensajeChat } from '../services/api.js';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy AgroBot, tu asistente en AgroManager. Puedo ayudarte con plagas, riego, fertilización, maquinaria, campañas, finanzas y más. ¿En qué te puedo ayudar?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = updated
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-20);

      const data = await enviarMensajeChat({ messages: chatHistory });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data?.answer || 'No se recibió respuesta.' },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Intenta de nuevo.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="chatbot-fab"
          aria-label="Abrir chat"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <Bot size={22} />
              <div>
                <p className="chatbot-header-title">AgroBot</p>
                <p className="chatbot-header-sub">Asistente agrícola</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="chatbot-close"
              aria-label="Cerrar chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-msg ${msg.role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`}
              >
                <div className="chatbot-msg-icon">
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="chatbot-msg-bubble">
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j}>
                      {line.replace(/\*\*(.*?)\*\*/g, (_, t) => t)}
                      {j < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg chatbot-msg-bot">
                <div className="chatbot-msg-icon">
                  <Bot size={16} />
                </div>
                <div className="chatbot-msg-bubble chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              className="chatbot-input"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="chatbot-send"
              aria-label="Enviar mensaje"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
