import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaCircle } from 'react-icons/fa';
import api from '../services/api';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your Academic Assistant. I can help you with general queries. How can I assist you today?", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Call Backend API
            const { data } = await api.post('/chat', {
                message: input,
                history: messages
            });

            setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage = error.response?.data?.message || "I'm having trouble connecting right now. Please try again later.";
            setMessages(prev => [...prev, { text: errorMessage, isBot: true }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-8 right-8 z-[100]">
                {!isOpen ? (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-indigo-500/30 ring-4 ring-indigo-500/20 active:scale-95 flex items-center justify-center w-16 h-16"
                    >
                        <FaRobot size={28} />
                    </button>
                ) : (
                    <div className="bg-white dark:bg-[#0f172a] w-96 h-[32rem] rounded-[2.5rem] shadow-2xl shadow-slate-300/50 dark:shadow-none flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-3xl"></div>
                            <div className="flex items-center space-x-3 relative z-10">
                                <span className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                    <FaRobot size={18} />
                                </span>
                                <div>
                                    <span className="font-black tracking-tight block leading-none">AI Assistant</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors relative z-10"><FaTimes /></button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50 scroll-smooth">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${m.isBot ? 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-bl-sm border border-slate-100 dark:border-slate-700' : 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-200 dark:shadow-none'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700 shadow-sm flex space-x-1 items-center h-10 w-16 justify-center">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-slate-800 flex space-x-3">
                            <input
                                type="text"
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-3 text-xs font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800"
                                placeholder="Ask anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                disabled={isTyping}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isTyping || !input.trim()}
                                className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all text-sm w-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isTyping ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaPaperPlane />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Chatbot;
