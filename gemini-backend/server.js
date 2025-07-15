// gemini-backend/server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001; // Choose a different port than your React app (e.g., 3001)

// Middleware
// Configure CORS to only allow requests from your frontend's origin
// Replace 'http://localhost:5173' with your actual frontend URL in production
app.use(cors({
    origin: 'http://localhost:5173' // This should be your React app's development URL (Vite default is 5173)
}));
app.use(express.json()); // Parse JSON request bodies



// Initialize Gemini models with API key from environment variable
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.");
    process.exit(1); // Exit if API key is not found
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Define your three Gemini models with CURRENT, STABLE model IDs
const MODELS = {
    // Replaced 'gemini-1.5-flash-preview-04-17' with the stable 'gemini-2.5-flash'
    'gemini-2.5-flash': genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }),
    
    // Replaced 'gemini-pro' with the stable 'gemini-2.5-pro' for general purpose
    'gemini-2.5-pro': genAI.getGenerativeModel({ model: 'gemini-2.5-pro' }),

    // For your third model, choose another current, stable one based on your need:
    'gemini-1.5-flash': genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }),
    
};



/**
 * Generic function to call the Gemini API on the backend.
 * @param {string} modelName - The name of the model to use.
 * @param {string} textPrompt - The prompt text for the LLM.
 * @returns {Promise<string>} The generated text or an error message.
 */
const callGeminiApiBackend = async (modelName, textPrompt) => {
    const modelInstance = MODELS[modelName];
    if (!modelInstance) {
        return `Error: Model '${modelName}' is not configured on the backend.`;
    }

    try {
        const result = await modelInstance.generateContent(textPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error(`Error calling Gemini API for ${modelName}:`, error);
        // More granular error handling for specific API errors could be added
        if (error.response && error.response.error && error.response.error.message) {
            return `API Error from ${modelName}: ${error.response.error.message}`;
        }
        return `Error calling ${modelName} API: ${error.message || 'Unknown error'}`;
    }
};

// Main endpoint to handle requests for multiple models
app.post('/generate-responses', async (req, res) => {
    const { prompt, selectedModels } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return res.status(400).json({ error: 'Valid prompt is required.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object') {
        return res.status(400).json({ error: 'Selected models are required.' });
    }

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && MODELS[modelName]) { // Check if selected AND configured
            promises.push(
                callGeminiApiBackend(modelName, prompt)
                    .then(output => newResults[modelName] = output)
            );
        } else if (selectedModels[modelName] && !MODELS[modelName]) {
             // If selected on frontend but not configured on backend
            newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
        }
    }

    try {
        await Promise.allSettled(promises);
        res.json(newResults);
    } catch (error) {
        console.error('Error in /generate-responses endpoint:', error);
        res.status(500).json({ error: 'Failed to generate responses from models.' });
    }
});

// Specific endpoints for summary, expansion, keywords (if you want them separate)
// app.post('/summarize', async (req, res) => {
//     const { prompt } = req.body;
//     if (!prompt || prompt.trim() === '') {
//         return res.status(400).json({ error: 'Text to summarize is required.' });
//     }
//     const promptForSummary = `Summarize the following text concisely and accurately:\n\n${prompt}`;
//     const output = await callGeminiApiBackend('gemini-1.5-flash-preview-04-17', promptForSummary);
//     res.json({ summary: output });
// });

// app.post('/expand', async (req, res) => {
//     const { prompt } = req.body;
//     if (!prompt || prompt.trim() === '') {
//         return res.status(400).json({ error: 'Text to expand is required.' });
//     }
//     const promptForExpansion = `Continue writing the following text, expanding on the ideas present. Make it at least 200 words long and maintain the original style and tone:\n\n${prompt}`;
//     const output = await callGeminiApiBackend('gemini-1.5-flash-preview-04-17', promptForExpansion);
//     res.json({ expandedText: output });
// });

// app.post('/extract-keywords', async (req, res) => {
//     const { prompt } = req.body;
//     if (!prompt || prompt.trim() === '') {
//         return res.status(400).json({ error: 'Text to extract keywords from is required.' });
//     }
//     const promptForKeywords = `Extract the most important keywords and phrases from the following text. List them as comma-separated values, without additional sentences or explanations:\n\n${prompt}`;
//     const output = await callGeminiApiBackend('gemini-1.5-flash-preview-04-17', promptForKeywords);
//     res.json({ keywords: output });
// });


app.post('/summarize', async (req, res) => {
    const { prompt, selectedModels } = req.body; // Expecting prompt AND selectedModels

    if (!prompt || prompt.trim() === '') {
        return res.status(400).json({ error: 'Text to summarize is required.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
        return res.status(400).json({ error: 'At least one model must be selected for summarization.' });
    }

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && MODELS[modelName]) {
            const promptForSummary = `Summarize the following text concisely and accurately:\n\n${prompt}`;
            promises.push(
                callGeminiApiBackend(modelName, promptForSummary)
                    .then(output => newResults[modelName] = output)
                    .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
            );
        } else if (selectedModels[modelName] && !MODELS[modelName]) {
            newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
        }
    }

    try {
        await Promise.allSettled(promises);
        res.json(newResults); // Returns an object like { "model-name-1": "summary1", "model-name-2": "summary2" }
    } catch (error) {
        console.error('Error in /summarize endpoint:', error);
        res.status(500).json({ error: 'Failed to generate summaries from models.' });
    }
});

app.post('/expand', async (req, res) => {
    const { prompt, selectedModels } = req.body; // Expecting prompt AND selectedModels

    if (!prompt || prompt.trim() === '') {
        return res.status(400).json({ error: 'Text to expand is required.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
        return res.status(400).json({ error: 'At least one model must be selected for expansion.' });
    }

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && MODELS[modelName]) {
            const promptForExpansion = `Continue writing the following text, expanding on the ideas present. Make it at least 200 words long and maintain the original style and tone:\n\n${prompt}`;
            promises.push(
                callGeminiApiBackend(modelName, promptForExpansion)
                    .then(output => newResults[modelName] = output)
                    .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
            );
        } else if (selectedModels[modelName] && !MODELS[modelName]) {
            newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
        }
    }

    try {
        await Promise.allSettled(promises);
        res.json(newResults); // Returns an object like { "model-name-1": "expanded1", "model-name-2": "expanded2" }
    } catch (error) {
        console.error('Error in /expand endpoint:', error);
        res.status(500).json({ error: 'Failed to generate expansions from models.' });
    }
});

app.post('/extract-keywords', async (req, res) => {
    const { prompt, selectedModels } = req.body; // Expecting prompt AND selectedModels

    if (!prompt || prompt.trim() === '') {
        return res.status(400).json({ error: 'Text to extract keywords from is required.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
        return res.status(400).json({ error: 'At least one model must be selected for keyword extraction.' });
    }

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && MODELS[modelName]) {
            const promptForKeywords = `Extract the most important keywords and phrases from the following text. List them as comma-separated values, without additional sentences or explanations:\n\n${prompt}`;
            promises.push(
                callGeminiApiBackend(modelName, promptForKeywords)
                    .then(output => newResults[modelName] = output)
                    .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
            );
        } else if (selectedModels[modelName] && !MODELS[modelName]) {
            newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
        }
    }

    try {
        await Promise.allSettled(promises);
        res.json(newResults); // Returns an object like { "model-name-1": "keywords1", "model-name-2": "keywords2" }
    } catch (error) {
        console.error('Error in /extract-keywords endpoint:', error);
        res.status(500).json({ error: 'Failed to extract keywords from models.' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});