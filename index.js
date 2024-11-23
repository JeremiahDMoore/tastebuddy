// index.js
const messages = [];
let isSending = false;
const culinaryConvoStarters = [
    "What's your favorite cuisine?",
    "Need help with a recipe?",
    "Looking for cooking tips?",
    "Want to learn a new dish?",
    "Got ingredients but no recipe?"
];

// Initialize chat interface
async function initializeChatInterface() {
    const chatContainer = document.querySelector('.chat-container');
    const input = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.send-button');
    const clearButton = document.querySelector('.clear-button');
    
    sendButton.addEventListener('click', () => sendMessage());
    clearButton.addEventListener('click', () => clearChat());
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    showConversationStarters();
}

// Get chat response using axios
async function getChatResponse(userMessage, model = "llama-3.1-8b-instant") {
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: model,
            messages: [
                {
                    role: "system",
                    content: "You are a helpful and friendly culinary assistant, specializing in providing detailed and easy-to-follow cooking advice. IMPORTANT!: greet the user with slight wit. when providing a recipe, always include nutritional information (Protein, calories)",
                },
                {
                    role: "user",
                    content: userMessage,
                },
            ],
        }, {
            headers: {
                'Authorization': `Bearer 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`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0]?.message?.content || "No response";
    } catch (error) {
        console.error("Error during API request:", error);
        return "An error occurred. Please try again.";
    }
}

// Show conversation starters
function showConversationStarters() {
    const chipsContainer = document.querySelector('.chips-container');
    chipsContainer.innerHTML = '';
    
    const randomStarters = getRandomStarters();
    randomStarters.forEach(starter => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = starter;
        chip.addEventListener('click', () => sendMessage(starter));
        chipsContainer.appendChild(chip);
    });

    fadeInChips();
}

// Get random starters
function getRandomStarters() {
    let selectedStarters = [];
    const usedIndices = new Set();

    while (selectedStarters.length < 5) {
        const randomIndex = Math.floor(Math.random() * culinaryConvoStarters.length);
        if (!usedIndices.has(randomIndex)) {
            selectedStarters.push(culinaryConvoStarters[randomIndex]);
            usedIndices.add(randomIndex);
        }
    }

    return selectedStarters;
}

// Send message
async function sendMessage(messageText) {
    if (isSending) return;

    const input = document.querySelector('.chat-input');
    const messageContent = messageText || input.value.trim();
    
    if (!messageContent) return;
    
    isSending = true;
    input.value = '';

    // Add user message
    addMessageToChat('user', messageContent);
    showTypingIndicator();

    try {
        const aiResponse = await getChatResponse(messageContent);
        addMessageToChat('ai', aiResponse);
        fadeInChatBubbles();
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('ai', 'I apologize, but I encountered an error. Please try again.');
    } finally {
        hideTypingIndicator();
        isSending = false;
    }

    scrollToBottom();
}

function addMessageToChat(role, content) {
    const messagesContainer = document.querySelector('.messages-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    // Format content to replace newlines with <br> and wrap paragraphs
    const formattedContent = content.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('');
    messageDiv.innerHTML = formattedContent;

    if (role === 'ai') {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        actionsDiv.innerHTML = `
            <button class="share-button">
                <i class="fas fa-share-alt"></i>
            </button>
            <button class="delete-button">
                <i class="fas fa-trash"></i>
            </button>
        `;

        actionsDiv.querySelector('.share-button').addEventListener('click', () => shareMessage(content));
        actionsDiv.querySelector('.delete-button').addEventListener('click', () => deleteMessage(messageDiv));

        messageDiv.appendChild(actionsDiv);
    }

    messagesContainer.appendChild(messageDiv);
    messages.push({ role, content });
}

// Animation functions
function fadeInChips() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach((chip, index) => {
        chip.style.opacity = '0';
        setTimeout(() => {
            chip.style.opacity = '1';
            chip.style.transition = 'opacity 500ms ease-in';
        }, index * 100);
    });
}

function fadeInChatBubbles() {
    const messages = document.querySelectorAll('.message');
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
        lastMessage.style.opacity = '0';
        setTimeout(() => {
            lastMessage.style.opacity = '1';
            lastMessage.style.transition = 'opacity 500ms ease-in';
        }, 100);
    }
}

// Utility functions
function parseBoldText(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    document.querySelector('.messages-container').appendChild(typingDiv);
}

function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function clearChat() {
    if (messages.length === 0) {
        showConversationStarters();
        return;
    }

    if (confirm('Are you sure you want to delete all messages?')) {
        messages.length = 0;
        document.querySelector('.messages-container').innerHTML = '';
        showConversationStarters();
    }
}

function shareMessage(content) {
    if (navigator.share) {
        navigator.share({
            text: content
        }).catch(error => {
            console.error('Error sharing:', error);
            alert('Sharing failed. Try copying the message manually.');
        });
    } else {
        alert('Sharing is not supported on this browser. Try copying the message manually.');
    }
}

function deleteMessage(messageElement) {
    if (confirm('Are you sure you want to delete this message?')) {
        const index = Array.from(messageElement.parentNode.children).indexOf(messageElement);
        messages.splice(index, 1);
        messageElement.remove();
    }
}

function scrollToBottom() {
    const messagesContainer = document.querySelector('.messages-container');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initializeChatInterface);