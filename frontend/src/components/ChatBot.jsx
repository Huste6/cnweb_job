import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertCircle } from 'lucide-react';
import { getChatCompletion } from '../utils/openai';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: 'Xin chào! Tôi là trợ lý AI của JobPortal 👋 Tôi ở đây để hỗ trợ bạn trong hành trình tìm kiếm công việc mơ ước. Bạn cần giúp đỡ về vấn đề gì hôm nay?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const conversationHistory = useRef([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const quickReplies = [
        { id: 1, text: 'Tìm việc làm phù hợp', icon: '✨' },
        { id: 2, text: 'Tư vấn CV và hồ sơ', icon: '💼' },
        { id: 3, text: 'Chuẩn bị phỏng vấn', icon: '🎯' },
        { id: 4, text: 'Theo dõi đơn ứng tuyển', icon: '📝' }
    ];

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);

        // Add to conversation history for OpenAI
        conversationHistory.current.push({
            role: 'user',
            content: inputMessage
        });

        setInputMessage('');
        setIsTyping(true);
        setError(null);

        try {
            // Call OpenAI API
            const botResponse = await getChatCompletion(conversationHistory.current);

            // Add assistant response to conversation history
            conversationHistory.current.push({
                role: 'assistant',
                content: botResponse
            });

            const botMessage = {
                id: messages.length + 2,
                type: 'bot',
                content: botResponse,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            console.error('Chat error:', err);
            setError(err.message);

            const errorMessage = {
                id: messages.length + 2,
                type: 'bot',
                content: err.message || 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau. 🙏',
                timestamp: new Date(),
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickReply = (text) => {
        setInputMessage(text);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-4 shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 z-50 group"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        1
                    </span>
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                        <div className="bg-gray-800 text-white text-sm rounded-lg py-2 px-4 whitespace-nowrap">
                            Cần hỗ trợ? Chat với tôi! 💬
                        </div>
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-slideIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white rounded-full p-2">
                                <Bot className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">JobPortal AI</h3>
                                <p className="text-xs opacity-90">Trợ lý tìm việc của bạn</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                                        }`}
                                >
                                    <div
                                        className={`flex-shrink-0 rounded-full p-2 ${message.type === 'user'
                                            ? 'bg-orange-500'
                                            : message.isError
                                                ? 'bg-red-500'
                                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                            }`}
                                    >
                                        {message.type === 'user' ? (
                                            <User className="w-4 h-4 text-white" />
                                        ) : message.isError ? (
                                            <AlertCircle className="w-4 h-4 text-white" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <div
                                        className={`rounded-2xl p-3 ${message.type === 'user'
                                            ? 'bg-orange-500 text-white'
                                            : message.isError
                                                ? 'bg-red-50 text-red-800 border border-red-200'
                                                : 'bg-white text-gray-800 shadow-md'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-line leading-relaxed">
                                            {message.content}
                                        </p>
                                        <p
                                            className={`text-xs mt-1 ${message.type === 'user' ? 'text-orange-100' : message.isError ? 'text-red-400' : 'text-gray-400'
                                                }`}
                                        >
                                            {message.timestamp.toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex items-start space-x-2">
                                    <div className="flex-shrink-0 rounded-full p-2 bg-gradient-to-r from-blue-500 to-purple-500">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white rounded-2xl p-3 shadow-md">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    {messages.length === 1 && (
                        <div className="px-4 py-2 bg-white border-t">
                            <div className="grid grid-cols-2 gap-2">
                                {quickReplies.map((reply) => (
                                    <button
                                        key={reply.id}
                                        onClick={() => handleQuickReply(reply.text)}
                                        className="text-xs bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-600 rounded-lg py-2 px-3 transition-colors text-left"
                                    >
                                        {reply.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-white border-t">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn của bạn..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
        </>
    );
};

export default ChatBot;
