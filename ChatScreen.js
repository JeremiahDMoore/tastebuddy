import React, { useState, useEffect } from 'react';
import { getChatResponse } from '../chatbotService';
import Header from './Header';
import GroqChatbot from './GroqChatbot'; // Importing the GROQ chatbot component
import './ChatScreen.css'; // Importing CSS for styling

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [starters, setStarters] = useState([]);
    const [isSending, setIsSending] = useState(false);

    const culinaryConvoStarters = require('../culinary_convo_starters.json');

    const parseBoldText = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            } else {
                return <span key={index}>{part}</span>;
            }
        });
    };

    const getRandomStarters = () => {
        let selectedStarters = [];
        const usedIndices = new Set();

        while (selectedStarters.length < 5) {
            const randomIndex = Math.floor(Math.random() * culinaryConvoStarters.length);
            if (!usedIndices.has(randomIndex)) {
                selectedStarters.push(culinaryConvoStarters[randomIndex]);
                usedIndices.add(randomIndex);
            }
        }

        setStarters(selectedStarters);
    };

    const sendMessage = async (messageText) => {
        if (isSending) return;

        const userMessage = { role: 'user', content: messageText || input };
        if (messageText || input.trim().length > 0) {
            setIsSending(true);
            const newMessages = [...messages, userMessage];
            setMessages(newMessages);

            try {
                const aiMessage = await getChatResponse(userMessage.content);
                setMessages([...newMessages, { role: 'ai', content: aiMessage }]);
            } catch (error) {
                console.error("Error fetching AI response:", error);
            } finally {
                setIsSending(false);
            }

            setInput('');
        }
    };

    useEffect(() => {
        if (messages.length === 0) {
            getRandomStarters();
        }
    }, [messages]);

    const clearChat = () => {
        setMessages([]);
        getRandomStarters();
    };

    const renderItem = (item, index) => (
        <div className={`message-container ${item.role}`}>
            <span>{parseBoldText(item.content)}</span>
            {item.role === 'ai' && (
                <div className="button-container">
                    <button onClick={() => shareMessage(item.content)}>Share</button>
                    <button onClick={() => deleteMessage(index)}>Delete</button>
                </div>
            )}
        </div>
    );

    return (
        <div className="chat-screen">
            <Header />
            <div className="chat-container">
                {messages.length === 0 && (
                    <div className="chips-container">
                        {starters.map((starter, index) => (
                            <button key={`${starter}-${index}`} onClick={() => sendMessage(starter)}>
                                {starter}
                            </button>
                        ))}
                    </div>
                )}
                <div className="messages">
                    {messages.map((item, index) => renderItem(item, index))}
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Chat with Chef"
                    />
                    <button onClick={() => sendMessage(input)} disabled={isSending}>Send</button>
                    <button onClick={clearChat} disabled={isSending}>Clear</button>
                </div>
            </div>
            <GroqChatbot /> {/* Integrating the GROQ chatbot component here */}
        </div>
    );
};

export default ChatScreen;
