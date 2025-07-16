


// // gemini-backend/server.js
// require('dotenv').config(); // Load environment variables from .env file
// const express = require('express');
// const cors = require('cors');
// const { GoogleGenerativeAI } = require('@google/generative-ai');  // Imports the necessary class from the Google Generative AI client library for Node.js, which allows interaction with Gemini models.

// const app = express();
// const port = process.env.PORT || 8080; // Changed to 8080 for Cloud Run compatibility

// // Middleware
// // Configure CORS to only allow requests from your frontend's origin
// app.use(cors({
//     origin: 'https://minwebfront-343717256329.us-central1.run.app'
     
// }));
// // --- MODIFIED: Increase JSON body limit for image data ---
// app.use(express.json({ limit: '50mb' })); // Allows larger request bodies for Base64 images
// // --- END MODIFIED ---


// // Initialize Gemini models with API key from environment variable
// const API_KEY = process.env.GEMINI_API_KEY;
// if (!API_KEY) {
//     console.error("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.");
//     process.exit(1); // Exit if API key is not found
// }

// const genAI = new GoogleGenerativeAI(API_KEY); //entry point for interacting with the gemini api

// // Define your three Gemini models with CURRENT, STABLE model IDs
// const MODELS = {
//     'gemini-2.5-flash': genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }),
//     'gemini-2.5-pro': genAI.getGenerativeModel({ model: 'gemini-2.5-pro' }),
//     'gemini-1.5-flash': genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }),
// };

// // --- NEW HELPER FUNCTION FOR IMAGE PROCESSING ---
// /**
//  * Converts a Base64 data URL string into a Gemini GenerativeContentPart for image data.
//  * Expected format: "data:image/jpeg;base64,..."
//  * @param {string} imageData The Base64 data URL string from the frontend.
//  * @returns {object} A GenerativeContentPart object for an image, or null if input is invalid.
//  */
// function fileToGenerativePart(imageData) {
//     if (!imageData || typeof imageData !== 'string') {
//         return null; // No valid image data provided
//     }

//     // Split the data URL to get mimeType and base64Data
//     const parts = imageData.split(',');
//     if (parts.length !== 2) {
//         console.warn('Invalid image data format. Expected a data URL with a comma.');
//         return null; // Or throw an error if you want stricter validation
//     }

//     const mimeTypePart = parts[0]; // e.g., "data:image/png;base64"
//     const base64Data = parts[1];   // e.g., "iVBORw0KGgoAAAANSUhEU..."

//     const mimeMatch = mimeTypePart.match(/^data:(.*?);base64$/);
//     if (!mimeMatch || mimeMatch.length < 2) {
//         console.warn('Could not extract MIME type from image data.');
//         return null; // Or throw an error
//     }
//     const mimeType = mimeMatch[1]; // e.g., "image/png"

//     return {
//         inlineData: {
//             data: base64Data,
//             mimeType: mimeType,
//         },
//     };
// }
// // --- END NEW HELPER ---


// /**
//  * Generic function to call the Gemini API on the backend.
//  * Now accepts an array of content parts (text and/or image).
//  * @param {string} modelName - The name of the model to use.
//  * @param {Array<object>} contentParts - An array of content parts (e.g., [{ text: "prompt" }, { inlineData: ... }]).
//  * @returns {Promise<string>} The generated text or an error message.
//  */
// // --- MODIFIED: callGeminiApiBackend now takes an array of contentParts ---
// const callGeminiApiBackend = async (modelName, contentParts) => {
//     const modelInstance = MODELS[modelName];
//     if (!modelInstance) {
//         return `Error: Model '${modelName}' is not configured on the backend.`;
//     }

//     try {
//         // --- MODIFIED: Pass the contentParts array directly ---
//         // const result = await modelInstance.generateContent({ contents: contentParts });
//          const result = await modelInstance.generateContent(contentParts);
//         // --- END MODIFIED ---
//         const response = await result.response;
//         return response.text();
//     } catch (error) {
//         console.error(`Error calling Gemini API for ${modelName}:`, error);
//         if (error.response && error.response.error && error.response.error.message) {
//             return `API Error from ${modelName}: ${error.response.error.message}`;
//         }
//         return `Error calling ${modelName} API: ${error.message || 'Unknown error'}`;
//     }
// };

// // Main endpoint to handle requests for multiple models
// app.post('/generate-responses', async (req, res) => {
//     // --- MODIFIED: Get imageData from req.body ---
//     const { prompt, selectedModels, imageData } = req.body;
//     // --- END MODIFIED ---

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         return res.status(400).json({ error: 'Valid prompt is required.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object') {
//         return res.status(400).json({ error: 'Selected models are required.' });
//     }

//     // --- NEW: Construct contentParts array ---
//     const contentParts = [{ text: prompt }];
//     if (imageData) {
//         const imagePart = fileToGenerativePart(imageData);
//         if (imagePart) {
//             contentParts.unshift(imagePart); // Add image part at the beginning
//         } else {
//             // Optionally handle invalid image data more strictly here if fileToGenerativePart returns null on error
//             return res.status(400).json({ error: 'Invalid image data provided.' });
//         }
//     }
//     // --- END NEW ---

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && MODELS[modelName]) {
//             promises.push(
//                 // --- MODIFIED: Pass contentParts to callGeminiApiBackend ---
//                 callGeminiApiBackend(modelName, contentParts)
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !MODELS[modelName]) {
//             newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
//         }
//     }

//     try {
//         await Promise.allSettled(promises);
//         res.json(newResults);
//     } catch (error) {
//         console.error('Error in /generate-responses endpoint:', error);
//         res.status(500).json({ error: 'Failed to generate responses from models.' });
//     }
// });


// app.post('/summarize', async (req, res) => {
//     // --- MODIFIED: Get imageData from req.body ---
//     const { prompt, selectedModels, imageData } = req.body;
//     // --- END MODIFIED ---

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         return res.status(400).json({ error: 'Valid prompt is required.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object') {
//         return res.status(400).json({ error: 'Selected models are required.' });
//     }

//     // --- NEW: Construct contentParts array ---
//     // Ensure the prompt clearly instructs the model to use the image for summarization
//     const promptForSummary = `Summarize the following text (and/or content of the image if provided) concisely and accurately:\n\n${prompt}`;
//     const contentParts = [{ text: promptForSummary }];
//     if (imageData) {
//         const imagePart = fileToGenerativePart(imageData);
//         if (imagePart) {
//             contentParts.unshift(imagePart);
//         } else {
//             return res.status(400).json({ error: 'Invalid image data provided.' });
//         }
//     }
//     // --- END NEW ---

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && MODELS[modelName]) {
//             promises.push(
//                 // --- MODIFIED: Pass contentParts to callGeminiApiBackend ---
//                 callGeminiApiBackend(modelName, contentParts)
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !MODELS[modelName]) {
//             newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
//         }
//     }

//     try {
//         await Promise.allSettled(promises);
//         res.json(newResults);
//     } catch (error) {
//         console.error('Error in /summarize endpoint:', error); // Specific endpoint error log
//         res.status(500).json({ error: 'Failed to generate summaries from models.' });
//     }
// });


// app.post('/expand', async (req, res) => {
//     // --- MODIFIED: Get imageData from req.body ---
//     const { prompt, selectedModels, imageData } = req.body;
//     // --- END MODIFIED ---

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         return res.status(400).json({ error: 'Valid prompt is required.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object') {
//         return res.status(400).json({ error: 'Selected models are required.' });
//     }

//     // --- NEW: Construct contentParts array ---
//     const promptForExpansion = `Continue writing the following text (and/or based on the image if provided), expanding on the ideas present. Make it at least 200 words long and maintain the original style and tone:\n\n${prompt}`;
//     const contentParts = [{ text: promptForExpansion }];
//     if (imageData) {
//         const imagePart = fileToGenerativePart(imageData);
//         if (imagePart) {
//             contentParts.unshift(imagePart);
//         } else {
//             return res.status(400).json({ error: 'Invalid image data provided.' });
//         }
//     }
//     // --- END NEW ---

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && MODELS[modelName]) {
//             promises.push(
//                 // --- MODIFIED: Pass contentParts to callGeminiApiBackend ---
//                 callGeminiApiBackend(modelName, contentParts)
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !MODELS[modelName]) {
//             newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
//         }
//     }

//     try {
//         await Promise.allSettled(promises);
//         res.json(newResults);
//     } catch (error) {
//         console.error('Error in /expand endpoint:', error); // Specific endpoint error log
//         res.status(500).json({ error: 'Failed to generate expansions from models.' });
//     }
// });

// app.post('/extract-keywords', async (req, res) => {
//     // --- MODIFIED: Get imageData from req.body ---
//     const { prompt, selectedModels, imageData } = req.body;
//     // --- END MODIFIED ---

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         return res.status(400).json({ error: 'Text to extract keywords from is required.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
//         return res.status(400).json({ error: 'At least one model must be selected for keyword extraction.' });
//     }

//     // --- NEW: Construct contentParts array ---
//     const promptForKeywords = `Extract the most important keywords and phrases from the following text (and/or image content if provided). List them as comma-separated values, without additional sentences or explanations:\n\n${prompt}`;
//     const contentParts = [{ text: promptForKeywords }];
//     if (imageData) {
//         const imagePart = fileToGenerativePart(imageData);
//         if (imagePart) {
//             contentParts.unshift(imagePart);
//         } else {
//             return res.status(400).json({ error: 'Invalid image data provided.' });
//         }
//     }
//     // --- END NEW ---

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && MODELS[modelName]) {
//             promises.push(
//                 // --- MODIFIED: Pass contentParts to callGeminiApiBackend ---
//                 callGeminiApiBackend(modelName, promptForKeywords) // This was the old way, ensure it's contentParts
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !MODELS[modelName]) {
//             newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
//         }
//     }

//     try {
//         await Promise.allSettled(promises);
//         res.json(newResults);
//     } catch (error) {
//         console.error('Error in /extract-keywords endpoint:', error);
//         res.status(500).json({ error: 'Failed to extract keywords from models.' });
//     }
// });

// // Start the server
// app.listen(port, () => {
//     console.log(`Backend server listening at http://localhost:${port}`);
// });



// require('dotenv').config(); // Load environment variables from .env file
// const express = require('express');
// const cors = require('cors');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// // --- NEW: Import Vertex AI client for Imagen 3.0 ---
// const { PredictionServiceClient } = require('@google-cloud/aiplatform');
// // Removed: const { helpers } = require('@google-cloud/aiplatform/build/protos/google/cloud/aiplatform/v1beta1/PredictionService');
// // --- END NEW ---

// const app = express();
// const port = process.env.PORT || 8080;

// // Middleware
// // Configure CORS to only allow requests from your frontend's origin
// app.use(cors({
//     origin: 'https://minwebfront-343717256329.us-central1.run.app'
// }));
// // --- MODIFIED: Increase JSON body limit for image data ---
// app.use(express.json({ limit: '50mb' })); // Allows larger request bodies for Base64 images
// // --- END MODIFIED ---

// // Initialize AI models with API key from environment variable
// const API_KEY = process.env.GEMINI_API_KEY;
// // --- NEW: Add GOOGLE_CLOUD_PROJECT_ID for Imagen ---
// const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID; // Your Google Cloud Project ID
// // --- END NEW ---

// if (!API_KEY) {
//     console.error("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.");
//     process.exit(1); // Exit if API key is not found
// }
// // --- NEW: Check for PROJECT_ID ---
// if (!PROJECT_ID) {
//     console.error("GOOGLE_CLOUD_PROJECT_ID not found in environment variables. Please set it in your .env file.");
//     process.exit(1); // Exit if Project ID is not found
// }
// // --- END NEW ---

// const genAI = new GoogleGenerativeAI(API_KEY); // Entry point for interacting with the Gemini API

// // Define your Gemini (text/multimodal) models with CURRENT, STABLE model IDs
// const MODELS = {
//     'gemini-2.5-flash': genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }),
//     'gemini-2.5-pro': genAI.getGenerativeModel({ model: 'gemini-2.5-pro' }),
//     'gemini-1.5-flash': genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }),
// };

// // --- MODIFIED: Initialize Imagen (image generation) model using Vertex AI SDK ---
// const clientOptions = {
//     apiEndpoint: 'us-central1-aiplatform.googleapis.com', // Use the correct region endpoint if different
// };
// const predictionClient = new PredictionServiceClient(clientOptions);
// // --- END MODIFIED ---

// // --- NEW HELPER FUNCTION FOR IMAGE PROCESSING ---
// /**
//  * Converts a Base64 data URL string into a Gemini GenerativeContentPart for image data.
//  * Expected format: "data:image/jpeg;base64,..."
//  * @param {string} imageData The Base64 data URL string from the frontend.
//  * @returns {object} A GenerativeContentPart object for an image, or null if input is invalid.
//  */
// function fileToGenerativePart(imageData) {
//     if (!imageData || typeof imageData !== 'string') {
//         return null; // No valid image data provided
//     }

//     // Split the data URL to get mimeType and base64Data
//     const parts = imageData.split(',');
//     if (parts.length !== 2) {
//         console.warn('Invalid image data format. Expected a data URL with a comma.');
//         return null;
//     }

//     const mimeTypePart = parts[0]; // e.g., "data:image/png;base64"
//     const base64Data = parts[1];   // e.g., "iVBORw0KGgoAAAANSUhEU..."

//     const mimeMatch = mimeTypePart.match(/^data:(.*?);base64$/);
//     if (!mimeMatch || mimeMatch.length < 2) {
//         console.warn('Could not extract MIME type from image data.');
//         return null;
//     }
//     const mimeType = mimeMatch[1]; // e.g., "image/png"

//     return {
//         inlineData: {
//             data: base64Data,
//             mimeType: mimeType,
//         },
//     };
// }
// // --- END NEW HELPER ---


// /**
//  * Generic function to call the Gemini API on the backend.
//  * Now accepts an array of content parts (text and/or image).
//  * @param {string} modelName - The name of the model to use.
//  * @param {Array<object>} contentParts - An array of content parts (e.g., [{ text: "prompt" }, { inlineData: ... }]).
//  * @returns {Promise<string>} The generated text or an error message.
//  */
// const callGeminiApiBackend = async (modelName, contentParts) => {
//     const modelInstance = MODELS[modelName];
//     if (!modelInstance) {
//         return `Error: Model '${modelName}' is not configured on the backend.`;
//     }

//     try {
//         const result = await modelInstance.generateContent(contentParts);
//         const response = await result.response;
//         return response.text();
//     } catch (error) {
//         console.error(`Error calling Gemini API for ${modelName}:`, error);
//         if (error.response && error.response.error && error.response.error.message) {
//             return `API Error from ${modelName}: ${error.response.error.message}`;
//         }
//         return `Error calling ${modelName} API: ${error.message || 'Unknown error'}`;
//     }
// };

// // Main endpoint to handle requests for multiple text/multimodal models
// app.post('/generate-responses', async (req, res) => {
//     const { prompt, selectedModels, imageData } = req.body;

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         return res.status(400).json({ error: 'Valid prompt is required.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object') {
//         return res.status(400).json({ error: 'Selected models are required.' });
//     }

//     const contentParts = [{ text: prompt }];
//     if (imageData) {
//         const imagePart = fileToGenerativePart(imageData);
//         if (imagePart) {
//             contentParts.unshift(imagePart); // Add image part at the beginning
//         } else {
//             return res.status(400).json({ error: 'Invalid image data provided.' });
//         }
//     }

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && MODELS[modelName]) {
//             promises.push(
//                 callGeminiApiBackend(modelName, contentParts)
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !MODELS[modelName]) {
//             newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
//         }
//     }

//     try {
//         await Promise.allSettled(promises);
//         res.json(newResults);
//     } catch (error) {
//         console.error('Error in /generate-responses endpoint:', error);
//         res.status(500).json({ error: 'Failed to generate responses from models.' });
//     }
// });


// app.post('/summarize', async (req, res) => {
//     const { prompt, selectedModels, imageData } = req.body;

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         return res.status(400).json({ error: 'Valid prompt is required.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object') {
//         return res.status(400).json({ error: 'Selected models are required.' });
//     }

//     const promptForSummary = `Summarize the following text (and/or content of the image if provided) concisely and accurately:\n\n${prompt}`;
//     const contentParts = [{ text: promptForSummary }];
//     if (imageData) {
//         const imagePart = fileToGenerativePart(imageData);
//         if (imagePart) {
//             contentParts.unshift(imagePart);
//         } else {
//             return res.status(400).json({ error: 'Invalid image data provided.' });
//         }
//     }

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && MODELS[modelName]) {
//             promises.push(
//                 callGeminiApiBackend(modelName, contentParts)
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !MODELS[modelName]) {
//             newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
//         }
//     }

//     try {
//         await Promise.allSettled(promises);
//         res.json(newResults);
//     } catch (error) {
//         console.error('Error in /summarize endpoint:', error); // Specific endpoint error log
//         res.status(500).json({ error: 'Failed to generate summaries from models.' });
//     }
// });


// app.post('/expand', async (req, res) => {
//     const { prompt, selectedModels, imageData } = req.body;

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         return res.status(400).json({ error: 'Valid prompt is required.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object') {
//         return res.status(400).json({ error: 'Selected models are required.' });
//     }

//     const promptForExpansion = `Continue writing the following text (and/or based on the image if provided), expanding on the ideas present. Make it at least 200 words long and maintain the original style and tone:\n\n${prompt}`;
//     const contentParts = [{ text: promptForExpansion }];
//     if (imageData) {
//         const imagePart = fileToGenerativePart(imageData);
//         if (imagePart) {
//             contentParts.unshift(imagePart);
//         } else {
//             return res.status(400).json({ error: 'Invalid image data provided.' });
//         }
//     }

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && MODELS[modelName]) {
//             promises.push(
//                 callGeminiApiBackend(modelName, contentParts)
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !MODELS[modelName]) {
//             newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
//         }
//     }

//     try {
//         await Promise.allSettled(promises);
//         res.json(newResults);
//     } catch (error) {
//         console.error('Error in /expand endpoint:', error); // Specific endpoint error log
//         res.status(500).json({ error: 'Failed to generate expansions from models.' });
//     }
// });

// app.post('/extract-keywords', async (req, res) => {
//     const { prompt, selectedModels, imageData } = req.body;

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         return res.status(400).json({ error: 'Text to extract keywords from is required.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
//         return res.status(400).json({ error: 'At least one model must be selected for keyword extraction.' });
//     }

//     const promptForKeywords = `Extract the most important keywords and phrases from the following text (and/or image content if provided). List them as comma-separated values, without additional sentences or explanations:\n\n${prompt}`;
//     const contentParts = [{ text: promptForKeywords }];
//     if (imageData) {
//         const imagePart = fileToGenerativePart(imageData);
//         if (imagePart) {
//             contentParts.unshift(imagePart);
//         } else {
//             return res.status(400).json({ error: 'Invalid image data provided.' });
//         }
//     }

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && MODELS[modelName]) {
//             promises.push(
//                 // --- FIX: Ensure contentParts is passed, not just prompt string ---
//                 callGeminiApiBackend(modelName, contentParts)
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !MODELS[modelName]) {
//             newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
//         }
//     }

//     try {
//         await Promise.allSettled(promises);
//         res.json(newResults);
//     } catch (error) {
//         console.error('Error in /extract-keywords endpoint:', error);
//         res.status(500).json({ error: 'Failed to extract keywords from models.' });
//     }
// });

// // --- NEW ENDPOINT: Image Generation with Imagen 3.0 ---
// app.post('/generate-image', async (req, res) => {
//     const { prompt } = req.body;

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         return res.status(400).json({ error: 'A prompt is required for image generation.' });
//     }

//     // Define Imagen model details
//     const location = 'us-central1'; // Or your deployed region
//     const publisher = 'google';
//     const modelId = 'imagen-3.0-generate-002';
//     const endpoint = `projects/${PROJECT_ID}/locations/${location}/publishers/${publisher}/models/${modelId}`;

//     // Request payload for Imagen 3.0 via Vertex AI SDK
//     // The client library handles conversion of plain JS objects to protobuf Value.
//     const instance = { prompt: prompt };
//     const parameters = { sampleCount: 1 }; // Requesting one image

//     try {
//         console.log(`Attempting to generate image for prompt: "${prompt}"`);
//         // Call the Vertex AI Prediction Service Client
//         const [response] = await predictionClient.predict({
//             endpoint,
//             instances: [instance],
//             parameters,
//         });

//         if (response && response.predictions && response.predictions.length > 0) {
//             // The client library usually returns a plain JS object from the protobuf Value.
//             // Access bytesBase64Encoded directly from the prediction.
//             const predictionValue = response.predictions[0];

//             if (predictionValue && predictionValue.bytesBase64Encoded) {
//                 const base64Data = predictionValue.bytesBase64Encoded;
//                 // Construct the data URL to send back to the frontend (assuming PNG output)
//                 const imageUrl = `data:image/png;base64,${base64Data}`;
//                 console.log('Image generated successfully.');
//                 res.json({ imageUrl: imageUrl });
//             } else {
//                 console.error('Imagen API response did not contain expected image data:', predictionValue);
//                 res.status(500).json({ error: 'Image generation failed: No image data returned.' });
//             }
//         } else {
//             console.error('Imagen API response did not contain predictions:', response);
//             res.status(500).json({ error: 'Image generation failed: No predictions returned.' });
//         }
//     } catch (error) {
//         console.error('Error generating image with Imagen API:', error);
//         let errorMessage = 'Failed to generate image.';
//         if (error.details) { // Vertex AI client errors often provide 'details'
//             errorMessage = `Imagen API Error: ${error.details}`;
//         } else if (error.message) {
//             errorMessage = `Error: ${error.message}`;
//         }
//         res.status(500).json({ error: errorMessage });
//     }
// });
// // --- END NEW ENDPOINT ---

// // Start the server
// app.listen(port, () => {
//     console.log(`Backend server listening at http://localhost:${port}`);
// });


require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// --- NEW: Import Vertex AI client for Imagen 3.0 ---
const { PredictionServiceClient } = require('@google-cloud/aiplatform');
// --- END NEW ---

const app = express();
const port = process.env.PORT || 8080;

// Middleware
// Configure CORS to only allow requests from your frontend's origin
app.use(cors({
    origin: 'https://minwebfront-343717256329.us-central1.run.app'
}));
// --- MODIFIED: Increase JSON body limit for image data ---
app.use(express.json({ limit: '50mb' })); // Allows larger request bodies for Base64 images
// --- END MODIFIED ---

// Initialize AI models with API key from environment variable
const API_KEY = process.env.GEMINI_API_KEY;
// --- NEW: Add GOOGLE_CLOUD_PROJECT_ID for Imagen ---
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID; // Your Google Cloud Project ID
// --- END NEW ---

if (!API_KEY) {
    console.error("GEMINI_API_KEY not found in environment variables. Please set it in your .env file.");
    process.exit(1); // Exit if API key is not found
}
// --- NEW: Check for PROJECT_ID ---
if (!PROJECT_ID) {
    console.error("GOOGLE_CLOUD_PROJECT_ID not found in environment variables. Please set it in your .env file.");
    process.exit(1); // Exit if Project ID is not found
}
// --- END NEW ---

const genAI = new GoogleGenerativeAI(API_KEY); // Entry point for interacting with the Gemini API

// Define your Gemini (text/multimodal) models with CURRENT, STABLE model IDs
const MODELS = {
    'gemini-2.5-flash': genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }),
    'gemini-2.5-pro': genAI.getGenerativeModel({ model: 'gemini-2.5-pro' }),
    'gemini-1.5-flash': genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }),
};

// --- MODIFIED: Initialize Imagen (image generation) model using Vertex AI SDK ---
const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com', // Use the correct region endpoint if different
};
const predictionClient = new PredictionServiceClient(clientOptions);
// --- END MODIFIED ---

// --- NEW HELPER FUNCTION FOR IMAGE PROCESSING ---
/**
 * Converts a Base64 data URL string into a Gemini GenerativeContentPart for image data.
 * Expected format: "data:image/jpeg;base64,..."
 * @param {string} imageData The Base64 data URL string from the frontend.
 * @returns {object} A GenerativeContentPart object for an image, or null if input is invalid.
 */
function fileToGenerativePart(imageData) {
    if (!imageData || typeof imageData !== 'string') {
        return null; // No valid image data provided
    }

    // Split the data URL to get mimeType and base64Data
    const parts = imageData.split(',');
    if (parts.length !== 2) {
        console.warn('Invalid image data format. Expected a data URL with a comma.');
        return null;
    }

    const mimeTypePart = parts[0]; // e.g., "data:image/png;base64"
    const base64Data = parts[1];   // e.g., "iVBORw0KGgoAAAANSUhEU..."

    const mimeMatch = mimeTypePart.match(/^data:(.*?);base64$/);
    if (!mimeMatch || mimeMatch.length < 2) {
        console.warn('Could not extract MIME type from image data.');
        return null;
    }
    const mimeType = mimeMatch[1]; // e.g., "image/png"

    return {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
}
// --- END NEW HELPER ---


/**
 * Generic function to call the Gemini API on the backend.
 * Now accepts an array of content parts (text and/or image).
 * @param {string} modelName - The name of the model to use.
 * @param {Array<object>} contentParts - An array of content parts (e.g., [{ text: "prompt" }, { inlineData: ... }]).
 * @returns {Promise<string>} The generated text or an error message.
 */
const callGeminiApiBackend = async (modelName, contentParts) => {
    const modelInstance = MODELS[modelName];
    if (!modelInstance) {
        return `Error: Model '${modelName}' is not configured on the backend.`;
    }

    try {
        const result = await modelInstance.generateContent(contentParts);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error(`Error calling Gemini API for ${modelName}:`, error);
        if (error.response && error.response.error && error.response.error.message) {
            return `API Error from ${modelName}: ${error.response.error.message}`;
        }
        return `Error calling ${modelName} API: ${error.message || 'Unknown error'}`;
    }
};

// Main endpoint to handle requests for multiple text/multimodal models
app.post('/generate-responses', async (req, res) => {
    const { prompt, selectedModels, imageData } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return res.status(400).json({ error: 'Valid prompt is required.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object') {
        return res.status(400).json({ error: 'Selected models are required.' });
    }

    const contentParts = [{ text: prompt }];
    if (imageData) {
        const imagePart = fileToGenerativePart(imageData);
        if (imagePart) {
            contentParts.unshift(imagePart); // Add image part at the beginning
        } else {
            return res.status(400).json({ error: 'Invalid image data provided.' });
        }
    }

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && MODELS[modelName]) {
            promises.push(
                callGeminiApiBackend(modelName, contentParts)
                    .then(output => newResults[modelName] = output)
                    .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
            );
        } else if (selectedModels[modelName] && !MODELS[modelName]) {
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


app.post('/summarize', async (req, res) => {
    const { prompt, selectedModels, imageData } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return res.status(400).json({ error: 'Valid prompt is required.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object') {
        return res.status(400).json({ error: 'Selected models are required.' });
    }

    const promptForSummary = `Summarize the following text (and/or content of the image if provided) concisely and accurately:\n\n${prompt}`;
    const contentParts = [{ text: promptForSummary }];
    if (imageData) {
        const imagePart = fileToGenerativePart(imageData);
        if (imagePart) {
            contentParts.unshift(imagePart);
        } else {
            return res.status(400).json({ error: 'Invalid image data provided.' });
        }
    }

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && MODELS[modelName]) {
            promises.push(
                callGeminiApiBackend(modelName, contentParts)
                    .then(output => newResults[modelName] = output)
                    .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
            );
        } else if (selectedModels[modelName] && !MODELS[modelName]) {
            newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
        }
    }

    try {
        await Promise.allSettled(promises);
        res.json(newResults);
    } catch (error) {
        console.error('Error in /summarize endpoint:', error); // Specific endpoint error log
        res.status(500).json({ error: 'Failed to generate summaries from models.' });
    }
});


app.post('/expand', async (req, res) => {
    const { prompt, selectedModels, imageData } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return res.status(400).json({ error: 'Valid prompt is required.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object') {
        return res.status(400).json({ error: 'Selected models are required.' });
    }

    const promptForExpansion = `Continue writing the following text (and/or based on the image if provided), expanding on the ideas present. Make it at least 200 words long and maintain the original style and tone:\n\n${prompt}`;
    const contentParts = [{ text: promptForExpansion }];
    if (imageData) {
        const imagePart = fileToGenerativePart(imageData);
        if (imagePart) {
            contentParts.unshift(imagePart);
        } else {
            return res.status(400).json({ error: 'Invalid image data provided.' });
        }
    }

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && MODELS[modelName]) {
            promises.push(
                callGeminiApiBackend(modelName, contentParts)
                    .then(output => newResults[modelName] = output)
                    .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
            );
        } else if (selectedModels[modelName] && !MODELS[modelName]) {
            newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
        }
    }

    try {
        await Promise.allSettled(promises);
        res.json(newResults);
    } catch (error) {
        console.error('Error in /expand endpoint:', error); // Specific endpoint error log
        res.status(500).json({ error: 'Failed to generate expansions from models.' });
    }
});

app.post('/extract-keywords', async (req, res) => {
    const { prompt, selectedModels, imageData } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return res.status(400).json({ error: 'Text to extract keywords from is required.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
        return res.status(400).json({ error: 'At least one model must be selected for keyword extraction.' });
    }

    const promptForKeywords = `Extract the most important keywords and phrases from the following text (and/or image content if provided). List them as comma-separated values, without additional sentences or explanations:\n\n${prompt}`;
    const contentParts = [{ text: promptForKeywords }];
    if (imageData) {
        const imagePart = fileToGenerativePart(imageData);
        if (imagePart) {
            contentParts.unshift(imagePart);
        } else {
            return res.status(400).json({ error: 'Invalid image data provided.' });
        }
    }

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && MODELS[modelName]) {
            promises.push(
                // --- FIX: Ensure contentParts is passed, not just prompt string ---
                callGeminiApiBackend(modelName, contentParts)
                    .then(output => newResults[modelName] = output)
                    .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
            );
        } else if (selectedModels[modelName] && !MODELS[modelName]) {
            newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
        }
    }

    try {
        await Promise.allSettled(promises);
        res.json(newResults);
    } catch (error) {
        console.error('Error in /extract-keywords endpoint:', error);
        res.status(500).json({ error: 'Failed to extract keywords from models.' });
    }
});

// --- NEW ENDPOINT: Image Generation with Imagen 3.0 ---
app.post('/generate-image', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return res.status(400).json({ error: 'A prompt is required for image generation.' });
    }

    // Define Imagen model details
    const location = 'us-central1'; // Or your deployed region
    const publisher = 'google';
    const modelId = 'imagen-3.0-generate-002';
    const endpoint = `projects/${PROJECT_ID}/locations/${location}/publishers/${publisher}/models/${modelId}`;

    // Request payload for Imagen 3.0 via Vertex AI SDK
    // The client library handles conversion of plain JS objects to protobuf Value.
    const instance = { prompt: prompt };
    const parameters = { sampleCount: 1 }; // Requesting one image

    try {
        console.log(`Attempting to generate image for prompt: "${prompt}"`);
        // Call the Vertex AI Prediction Service Client
        const [response] = await predictionClient.predict({
            endpoint,
            instances: [instance],
            parameters,
        });

        if (response && response.predictions && response.predictions.length > 0) {
            // The client library usually returns a plain JS object from the protobuf Value.
            // Access bytesBase64Encoded directly from the prediction.
            const predictionValue = response.predictions[0];

            if (predictionValue && predictionValue.bytesBase64Encoded) {
                const base64Data = predictionValue.bytesBase64Encoded;
                // Construct the data URL to send back to the frontend (assuming PNG output)
                const imageUrl = `data:image/png;base64,${base64Data}`;
                console.log('Image generated successfully.');
                res.json({ imageUrl: imageUrl });
            } else {
                console.error('Imagen API response did not contain expected image data:', predictionValue);
                res.status(500).json({ error: 'Image generation failed: No image data returned.' });
            }
        } else {
            console.error('Imagen API response did not contain predictions:', response);
            res.status(500).json({ error: 'Image generation failed: No predictions returned.' });
        }
    } catch (error) {
        console.error('Error generating image with Imagen API:', error);
        let errorMessage = 'Failed to generate image.';
        if (error.details) { // Vertex AI client errors often provide 'details'
            errorMessage = `Imagen API Error: ${error.details}`;
        } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
        }
        // --- NEW: Log the full error object for detailed debugging ---
        console.error('Full Imagen API error object:', JSON.stringify(error, null, 2));
        // --- END NEW ---
        res.status(500).json({ error: errorMessage });
    }
});
// --- END NEW ENDPOINT ---

// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
