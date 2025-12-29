/**
 * AI Health Assistant - OpenAI Integration
 * Provides intelligent chat support for patients using OpenAI's GPT API
 */

'use strict';

// ============== Configuration ==============
const AI_CONFIG = {
    GEMINI_API_KEY: 'AIzaSyCucnZd57Lht_iZzJp5EeN-JUYSqGo8mOo',
    API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    MODEL: 'gemini-1.5-flash',
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

// ... (renderMessage, formatMessageContent, renderChatHistory, sendMessage functions remain same)

/**
 * Get AI response from OpenAI API
 */
async function getAIResponse(userMessage) {
    isProcessing = true;
    sendBtn.disabled = true;
    showTypingIndicator();

    try {
        const role = window.hospitalAuth ? window.hospitalAuth.getRole() : 'PATIENT';
        const systemPrompt = role === 'DOCTOR' ? AI_CONFIG.DOCTOR_PROMPT : AI_CONFIG.PATIENT_PROMPT;

        // Build conversation history for Gemini
        const conversationHistory = chatHistory.slice(-10)
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

        // Prepare request body for Gemini API
        const requestBody = {
            contents: conversationHistory,
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
                topP: 0.8,
                topK: 10
            }
        };

        const response = await fetch(`${AI_CONFIG.API_ENDPOINT}?key=${AI_CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const aiMessage = data.candidates[0].content.parts[0].text;

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
        console.error('AI Response Error:', error);
        hideTypingIndicator();

        // Show fallback error message
        const errorMsg = {
            role: 'assistant',
            content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact our support team for immediate assistance.",
            timestamp: new Date().toISOString()
        };

        chatHistory.push(errorMsg);
        saveChatHistory();
        renderMessage(errorMsg);
    } finally {
        isProcessing = false;
        sendBtn.disabled = false;
    }
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
