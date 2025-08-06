
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat as GeminiChat } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, LogOut, Send, User } from 'lucide-react';
import type { UserProfile, Message } from '../types';
import { createNammaiChatSession } from '../services/geminiService';

interface ChatProps {
  user: UserProfile;
  onLogout: () => void;
}

const DEV_IMG_URL = "https://i.postimg.cc/9XZYsf8N/Whats-App-Image-2025-07-12-at-8-53-26-PM.jpg";

// This helper component is defined outside the main Chat component
const MessageContent: React.FC<{ content: string }> = ({ content }) => {
  if (content.includes(DEV_IMG_URL)) {
    const parts = content.split(/<img[^>]*>/);
    return (
      <>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{parts[0]}</ReactMarkdown>
        <img src={DEV_IMG_URL} alt="Sohan A" className="max-w-[200px] rounded-lg mt-2 shadow-lg" />
        {parts[1] && <ReactMarkdown remarkPlugins={[remarkGfm]}>{parts[1]}</ReactMarkdown>}
      </>
    );
  }
  return <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert prose-p:before:content-none prose-p:after:content-none">{content}</ReactMarkdown>;
};


const Chat: React.FC<ChatProps> = ({ user, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSession = useRef<GeminiChat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSession.current = createNammaiChatSession();
    setMessages([
        { role: 'model', content: `Hegidira ${user.name}! Nanna hesaru NammAI. How can I help you today?` }
    ]);
  }, [user.name]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatSession.current) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await chatSession.current.sendMessageStream({ message: userMessage.content });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', content: modelResponse };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'model', content: 'Sikkapatte error bandide! Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <header className="flex items-center justify-between p-4 bg-[#2a2a2a] border-b border-gray-700 shadow-md">
        <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Bot className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">NammAI</h1>
        </div>
        <div className="flex items-center gap-4">
          <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
          <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-600 transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-lg ${msg.role === 'user' ? 'bg-blue-600 rounded-br-none text-white' : 'bg-[#2a2a2a] rounded-bl-none'}`}>
              <MessageContent content={msg.content} />
            </div>
             {msg.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
           <div className="flex items-end gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-lg bg-[#2a2a2a] rounded-bl-none">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
           </div>
        )}
      </main>

      <footer className="p-4 bg-[#1e1e1e] border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="NammAI jothe maathadi..."
            className="flex-1 p-3 bg-[#2a2a2a] rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
            rows={1}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="p-3 rounded-full bg-purple-600 text-white disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors">
            <Send className="w-6 h-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Chat;
