/**
 * AI Health Assistant - OpenAI Integration
 * Provides intelligent chat support for patients using OpenAI's GPT API
 */

'use strict';

// ============== Configuration ==============
const AI_CONFIG = {
    // Backend endpoint for secure AI communication
    BACKEND_API_URL: 'http://localhost:8080/api/ai',

    // Fallback to direct OpenAI API (not recommended for production)
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
    API_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
    MODEL: 'gpt-3.5-turbo',
    USE_BACKEND: true,  // ENABLED: Secure communication via backend
    FALLBACK_MODE: true,  // Enable fallback responses if API fails
    PATIENT_PROMPT: `You are MediMate AI, a helpful medical assistant for a hospital management system. 
Your role is to:
- Help patients with appointment booking and inquiries
- Provide general health information (NOT medical diagnosis)
- Answer questions about hospital services, departments, and procedures
- Assist with navigating the patient portal
- Provide billing and insurance information

Important guidelines:
- Be empathetic, professional, and clear
- For medical emergencies, immediately advise calling emergency services
- Do not provide medical diagnoses - always recommend consulting with a doctor
- Keep responses concise (2-3 sentences when possible)
- Be friendly and supportive

Remember: You're assisting with hospital administration and general health information, not providing medical advice.`,
    DOCTOR_PROMPT: `You are MediMate AI, a clinical decision support assistant for doctors.
Your role is to:
- Assist doctors with differential diagnoses based on symptoms
- Provide information on drug interactions, side effects, and dosage
- Summarize medical guidelines and recent research
- Assist with interpreting lab results
- Suggest treatment plans based on standard protocols

Important guidelines:
- Maintain a professional, clinical tone.
- Always state that your output is a suggestion and not a definitive medical order.
- Prioritize patient safety and evidence-based medicine.
- Be concise and structured (use bullet points).`
};

// ============== State Management ==============
let chatHistory = [];
let isProcessing = false;

// ============== DOM Elements ==============
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const suggestedQuestions = document.getElementById('suggestedQuestions');

// ============== Initialization ==============
document.addEventListener('DOMContentLoaded', () => {
    initializeChat();
});

/**
 * Initialize the chat interface
 */
function initializeChat() {
    // Load chat history from localStorage
    loadChatHistory();

    // If no history, show welcome message
    if (chatHistory.length === 0) {
        addWelcomeMessage();
    } else {
        renderChatHistory();
    }

    // Auto-resize textarea
    if (chatInput) {
        chatInput.addEventListener('input', autoResizeTextarea);
    }
}

/**
 * Add welcome message from AI
 */
function addWelcomeMessage() {
    const role = window.hospitalAuth ? window.hospitalAuth.getRole() : 'PATIENT';
    let content = '';

    if (role === 'DOCTOR') {
        content = `Hello Dr. ${window.hospitalAuth.getUsername()}! 👋 I'm **MediMate AI**, your clinical assistant.\n\nI can help you with:\n• Drug interactions & dosage\n• Differential diagnosis\n• Treatment guidelines\n• Lab result interpretation\n\nHow can I assist you with your patients today?`;
    } else {
        content = `Hello! 👋 I'm **MediMate AI**, your intelligent health companion.\n\nI can help you with:\n• Booking and managing appointments\n• Understanding hospital services\n• General health questions\n• Navigating your patient portal\n\nHow can I assist you today?`;
    }

    const welcomeMsg = {
        role: 'assistant',
        content: content,
        timestamp: new Date().toISOString()
    };

    chatHistory.push(welcomeMsg);
    saveChatHistory();
    renderMessage(welcomeMsg);
}

/**
 * Send user message and get AI response
 */
function sendMessage() {
    if (!chatInput || isProcessing) return;

    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Add user message to chat
    const userMsg = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
    };

    chatHistory.push(userMsg);
    saveChatHistory();
    renderMessage(userMsg);

    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Hide suggested questions after first message
    if (suggestedQuestions && chatHistory.length > 1) {
        suggestedQuestions.style.display = 'none';
    }

    // Get AI response
    getAIResponse(userMessage);
}

/**
 * Render a single message in the chat
 */
function renderMessage(message) {
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.role === 'assistant' ? 'assistant' : 'user'}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessageContent(message.content);

    messageDiv.appendChild(contentDiv);

    if (message.role === 'assistant') {
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timestampDiv.textContent = time;
        messageDiv.appendChild(timestampDiv);
    }

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

/**
 * Format message content (support for markdown-like formatting)
 */
function formatMessageContent(content) {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/• /g, '• ');
}

/**
 * Render entire chat history
 */
function renderChatHistory() {
    if (!chatMessages) return;

    chatMessages.innerHTML = '';
    chatHistory.forEach(msg => {
        renderMessage(msg);
    });
}

/**
 * Get AI response from Gemini API
 */
async function getAIResponse(userMessage) {
    isProcessing = true;
    sendBtn.disabled = true;
    showTypingIndicator();

    try {
        const role = window.hospitalAuth ? window.hospitalAuth.getRole() : 'PATIENT';

        if (AI_CONFIG.USE_BACKEND) {
            // Use secure backend endpoint (RECOMMENDED)
            await getAIResponseViaBackend(role, userMessage);
        } else {
            // Direct Gemini API call (fallback)
            await getAIResponseDirect(role, userMessage);
        }

    } catch (error) {
        console.error('AI Response Error:', error);
        hideTypingIndicator();
        handleAIError(error);
    } finally {
        isProcessing = false;
        sendBtn.disabled = false;
    }
}

/**
 * Get AI response via secure backend endpoint
 */
async function getAIResponseViaBackend(role, userMessage) {
    try {
        // Get conversation history (last 10 messages)
        const conversationHistory = chatHistory.slice(-10)
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role,
                content: msg.content
            }));

        // Call backend AI endpoint
        const response = await fetch(`${AI_CONFIG.BACKEND_API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                message: userMessage,
                role: role,
                conversationHistory: conversationHistory
            })
        });

        if (!response.ok) {
            const apiResponse = await response.json();
            const err = apiResponse.data || apiResponse;
            throw new Error(err.message || err.error || `API Error: ${response.status}`);
        }

        const apiResponse = await response.json();
        const data = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse);
        const aiMessage = data.message || data; // Support both wrapped message and raw string

        // Add AI response to chat
        const assistantMsg = {
            role: 'assistant',
            content: aiMessage,
            timestamp: new Date().toISOString()
        };

        chatHistory.push(assistantMsg);
        saveChatHistory();

        hideTypingIndicator();
        renderMessage(assistantMsg);

    } catch (error) {
        console.error('Backend AI Error:', error);
        throw error;
    }
}

/**
 * Get AI response directly from Gemini API (fallback)
 */
async function getAIResponseDirect(role, userMessage) {
    try {
        const systemPrompt = role === 'DOCTOR' ? AI_CONFIG.DOCTOR_PROMPT : AI_CONFIG.PATIENT_PROMPT;

        // Build conversation history for OpenAI
        const conversationHistory = chatHistory.slice(-10)
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            }));
            
        // Prepend system instruction
        conversationHistory.unshift({
            role: 'system',
            content: systemPrompt
        });

        // Prepare request body for OpenAI API
        const requestBody = {
            model: AI_CONFIG.MODEL,
            messages: conversationHistory,
            temperature: 0.7,
            max_tokens: 500
        };

        const response = await fetch(AI_CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;

        // Add AI response to chat
        const assistantMsg = {
            role: 'assistant',
            content: aiMessage,
            timestamp: new Date().toISOString()
        };

        chatHistory.push(assistantMsg);
        saveChatHistory();

        hideTypingIndicator();
        renderMessage(assistantMsg);

    } catch (error) {
        console.error('Direct Gemini API Error:', error);
        throw error;
    }
}

/**
 * Handle AI errors with appropriate messages
 */
function handleAIError(error) {
    console.error('AI Error Details:', error);
    
    let message = "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    
    if (error.message.includes('403') || error.message.includes('Invalid')) {
        message = "⚠️ **API Configuration Issue**\n\nThe AI service is not properly configured. Please contact the administrator.";
    } else if (error.message.includes('503')) {
        message = "The AI service is currently overloaded. Please try again in a few seconds.";
    } else if (error.message.includes('401')) {
        message = "Your session has expired. Please log in again to use the AI assistant.";
    }

    const errorMsg = {
        role: 'assistant',
        content: message,
        timestamp: new Date().toISOString()
    };
    
    chatHistory.push(errorMsg);
    saveChatHistory();
    renderMessage(errorMsg);
}

/**
 * Get authentication token if available
 */
function getAuthToken() {
    // Try window.hospitalAuth first
    if (window.hospitalAuth && window.hospitalAuth.getToken) {
        return window.hospitalAuth.getToken();
    }
    // Fallback to direct localStorage
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
}

/**
 * Handle suggested question click
 */
function sendSuggestedQuestion(button) {
    const questionText = button.textContent.trim();
    chatInput.value = questionText;
    sendMessage();
}

/**
 * Handle Enter key press in chat input
 */
function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

/**
 * Auto-resize textarea as user types
 */
function autoResizeTextarea() {
    if (!chatInput) return;

    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
        scrollToBottom();
    }
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    if (chatMessages) {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
}

/**
 * Save chat history to localStorage
 */
function saveChatHistory() {
    try {
        localStorage.setItem('ai_chat_history', JSON.stringify(chatHistory));
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}

/**
 * Load chat history from localStorage
 */
function loadChatHistory() {
    try {
        const saved = localStorage.getItem('ai_chat_history');
        if (saved) {
            chatHistory = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
        chatHistory = [];
    }
}

/**
 * Clear chat history
 */
function clearChatHistory() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        chatHistory = [];
        saveChatHistory();
        chatMessages.innerHTML = '';
        addWelcomeMessage();

        // Show suggested questions again
        if (suggestedQuestions) {
            suggestedQuestions.style.display = 'block';
        }
    }
}

// Export functions to global scope
window.sendMessage = sendMessage;
window.sendSuggestedQuestion = sendSuggestedQuestion;
window.handleChatKeyPress = handleChatKeyPress;
window.clearChatHistory = clearChatHistory;
