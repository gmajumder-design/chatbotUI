import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Send, Sparkles, Bot, User, MessageSquare,
  Zap, ArrowRight, Shield
} from 'lucide-react';
import GenerativeResponse from './components/generative/GenerativeResponse';
import './App.css';

/* ─── Quick Suggestion Presets ─── */
const INITIAL_SUGGESTIONS = [
  { text: "What are my total bills?", icon: "💰" },
  { text: "When is my next paycheck?", icon: "📅" },
  { text: "What is my TDI?", icon: "📊" },
  { text: "Show me a breakdown of my bills", icon: "📋" },
  { text: "How can I save money?", icon: "💡" },
  { text: "Give me a chart of my expenses", icon: "📈" },
];

function App() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Welcome to your **Financial Command Center**. I can analyze your bills, track your income, visualize spending patterns, and provide personalized financial insights.\n\nWhat would you like to explore?",
      suggestions: INITIAL_SUGGESTIONS,
      chartData: null,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend : inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const CHAT_API_URL = 'https://jqncngtsmd.execute-api.us-east-1.amazonaws.com/prod/chat';

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token') || localStorage.getItem('token');
      // Catch the dynamic ID passed by true-harbor-ui (checking all possible casings/names)
      const userId = urlParams.get('userId') || urlParams.get('user_id') || urlParams.get('employeeId') || localStorage.getItem('user_id');

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text.trim(),
          user_id: userId
        })
      });

      const data = await response.json();

      if (data.status === 'success' || data.bot_response) {
        let rawText = data.bot_response || "I processed your request but didn't receive a formatted response.";
        let extractedChartData = data.chart_data || null;
        
        // --- Generative UI: Clean up LLM hallucinations where JSON leaks into markdown ---
        try {
          // 1. Check for markdown JSON blocks
          const mdRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g;
          let match;
          while ((match = mdRegex.exec(rawText)) !== null) {
            const parsed = JSON.parse(match[1]);
            if (parsed.chart_data) {
              extractedChartData = parsed.chart_data;
              rawText = rawText.replace(match[0], '');
            } else if (parsed.labels && parsed.datasets) {
              extractedChartData = parsed;
              rawText = rawText.replace(match[0], '');
            }
          }
          
          // 2. Check for raw unformatted JSON in the text
          if (!extractedChartData && rawText.includes('"chart_data"')) {
            const startIndex = rawText.indexOf('{');
            const endIndex = rawText.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
              const potentialJson = rawText.substring(startIndex, endIndex + 1);
              try {
                const parsed = JSON.parse(potentialJson);
                if (parsed.chart_data) {
                  extractedChartData = parsed.chart_data;
                  rawText = rawText.replace(potentialJson, '');
                } else if (parsed.labels && parsed.datasets) {
                  extractedChartData = parsed;
                  rawText = rawText.replace(potentialJson, '');
                }
              } catch (e) {
                 // Try a more constrained match if the last '}' was part of text
                 const strictMatch = rawText.match(/\{\s*"chart_data"\s*:[\s\S]*\}\s*\}/);
                 if (strictMatch) {
                    const parsed = JSON.parse(strictMatch[0]);
                    extractedChartData = parsed.chart_data;
                    rawText = rawText.replace(strictMatch[0], '');
                 }
              }
            }
          }
        } catch (e) {}

        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: rawText.trim(),
          suggestions: (data.suggested_questions || []).map(q => ({ text: q, icon: '💬' })),
          chartData: extractedChartData,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        setMessages(prev => [...prev, {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: data.bot_response || "Sorry, I encountered an error. Please try rephrasing your question.",
          suggestions: INITIAL_SUGGESTIONS.slice(0, 3),
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Connection error:', error);
      setMessages(prev => [...prev, {
        id: `bot-fail-${Date.now()}`,
        sender: 'bot',
        text: "I'm having trouble connecting to the server. Please check your connection and try again.",
        suggestions: [],
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app-shell">
      {/* ═══ Background Effects ═══ */}
      <div className="bg-mesh" />
      <div className="bg-grain" />

      <div className="chat-container">
        {/* ═══ Header ═══ */}
        <header className="chat-header" id="chat-header">
          <div className="header-left">
            <div className="header-logo">
              <Sparkles size={20} />
              <div className="header-logo-pulse" />
            </div>
            <div className="header-text">
              <h1 className="header-title">TakeHome Assistant</h1>
              <div className="header-status">
                <div className="status-indicator" />
                <span>Online</span>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="header-badge">
              <Shield size={12} />
              <span>Secure</span>
            </div>
          </div>
        </header>

        {/* ═══ Messages ═══ */}
        <main className="messages-area" id="messages-area">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`msg-row ${msg.sender}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                layout
              >
                {/* Avatar */}
                {msg.sender === 'bot' && (
                  <div className="msg-avatar bot-av">
                    <User size={18} />
                  </div>
                )}

                <div className={`msg-content ${msg.sender}`}>
                  {/* Bubble */}
                  <div className={`msg-bubble ${msg.sender}`}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="md-p">{children}</p>,
                        strong: ({ children }) => <strong className="md-strong">{children}</strong>,
                        ul: ({ children }) => <ul className="md-ul">{children}</ul>,
                        ol: ({ children }) => <ol className="md-ol">{children}</ol>,
                        li: ({ children }) => <li className="md-li">{children}</li>,
                        code: ({ inline, children, ...props }) =>
                          inline
                            ? <code className="md-code-inline" {...props}>{children}</code>
                            : <pre className="md-code-block"><code {...props}>{children}</code></pre>,
                        h1: ({ children }) => <h1 className="md-h">{children}</h1>,
                        h2: ({ children }) => <h2 className="md-h">{children}</h2>,
                        h3: ({ children }) => <h3 className="md-h">{children}</h3>,
                        blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
                        a: ({ href, children }) => <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">{children}</a>,
                        hr: () => <hr className="md-hr" />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {/* ═══ Generative UI Components ═══ */}
                  {msg.sender === 'bot' && (
                    <GenerativeResponse text={msg.text} chartData={msg.chartData} />
                  )}

                  {/* Suggestions */}
                  {msg.sender === 'bot' && msg.suggestions?.length > 0 && (
                    <motion.div
                      className="suggestions-wrap"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {msg.suggestions.map((sug, idx) => (
                        <motion.button
                          key={idx}
                          className="suggestion-chip"
                          onClick={() => sendMessage(sug.text)}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + idx * 0.06 }}
                        >
                          <span className="suggestion-emoji">{sug.icon}</span>
                          <span className="suggestion-text">{sug.text}</span>
                          <ArrowRight size={12} className="suggestion-arrow" />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {/* Timestamp */}
                  <span className="msg-time">
                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* User avatar */}
                {msg.sender === 'user' && (
                  <div className="msg-avatar user-av">
                    <User size={18} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="msg-row bot"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="msg-avatar bot-av">
                  <Bot size={18} />
                </div>
                <div className="msg-content bot">
                  <div className="msg-bubble bot loading-bubble">
                    <div className="thinking-indicator">
                      <Zap size={14} className="thinking-icon" />
                      <span className="thinking-text">Analyzing your finances</span>
                      <div className="thinking-dots">
                        <span /><span /><span />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </main>

        {/* ═══ Input Area ═══ */}
        <footer className="input-footer" id="chat-input">
          <div className="input-container">
            <div className="input-glow" />
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your finances..."
              disabled={isLoading}
              id="chat-input-field"
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={isLoading || !inputText.trim()}
              id="send-button"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="input-disclaimer">
            <Shield size={10} />
            AI-powered responses based on your financial data
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;