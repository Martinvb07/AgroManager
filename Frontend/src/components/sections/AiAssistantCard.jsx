import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { enviarMensajeChat } from '../../services/api.js';

export default function AiAssistantCard() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy AgroBot. ¿En qué te puedo ayudar hoy?',
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
    } catch (_) {
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
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <div style={styles.botIcon}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <p style={styles.title}>AgroBot</p>
            <p style={styles.subtitle}>Asistente agrícola inteligente</p>
          </div>
        </div>
        <div style={styles.badge}>Chat</div>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.msgRow,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={styles.msgIconBot}>
                <Bot size={14} />
              </div>
            )}
            <div
              style={
                msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot
              }
            >
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>
                  {line}
                  {j < msg.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
            {msg.role === 'user' && (
              <div style={styles.msgIconUser}>
                <User size={14} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.msgRow, justifyContent: 'flex-start' }}>
            <div style={styles.msgIconBot}>
              <Bot size={14} />
            </div>
            <div style={{ ...styles.bubbleBot, ...styles.typing }}>
              <span style={styles.dot} />
              <span style={{ ...styles.dot, animationDelay: '0.16s' }} />
              <span style={{ ...styles.dot, animationDelay: '0.32s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta..."
          style={styles.input}
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            ...styles.sendBtn,
            opacity: loading || !input.trim() ? 0.5 : 1,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#fff',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  botIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    fontSize: '11px',
    opacity: 0.85,
  },
  badge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.2)',
  },
  messagesContainer: {
    height: '340px',
    overflowY: 'auto',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#f8faf9',
  },
  msgRow: {
    display: 'flex',
    gap: '8px',
    maxWidth: '92%',
  },
  msgIconBot: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#dcfce7',
    color: '#16a34a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  msgIconUser: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#e0e7ff',
    color: '#4338ca',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  bubbleBot: {
    padding: '10px 14px',
    borderRadius: '14px',
    borderBottomLeftRadius: '4px',
    fontSize: '13px',
    lineHeight: '1.5',
    background: '#fff',
    color: '#1f2937',
    border: '1px solid #e5e7eb',
    wordBreak: 'break-word',
  },
  bubbleUser: {
    padding: '10px 14px',
    borderRadius: '14px',
    borderBottomRightRadius: '4px',
    fontSize: '13px',
    lineHeight: '1.5',
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#fff',
    wordBreak: 'break-word',
  },
  typing: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 18px',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#9ca3af',
    display: 'inline-block',
    animation: 'agrobot-bounce 1.4s infinite ease-in-out',
  },
  inputArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 14px',
    borderTop: '1px solid #e5e7eb',
    background: '#fff',
  },
  input: {
    flex: 1,
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    outline: 'none',
    background: '#f9fafb',
  },
  sendBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};
