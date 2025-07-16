


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


///new works except image

// gemini-backend/server.js

// const express = require('express');
// const { VertexAI } = require('@google-cloud/vertexai');
// const cors = require('cors');
// require('dotenv').config(); // Load environment variables from .env file

// const app = express();
// const port = process.env.PORT || 8080; // Use PORT from environment or default to 8080

// // Initialize Vertex AI with project and location from environment variables
// const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
// // Ensure this location matches what your models support and what you've tested with curl
// const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// if (!PROJECT_ID) {
//     console.error('GOOGLE_CLOUD_PROJECT_ID environment variable is not set.');
//     process.exit(1);
// }

// const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

// // Define the generative models available for selection
// const MODELS = {
//     // These are the GA models. Using base names should get the latest auto-updated versions.
//     'gemini-2.5-flash': vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' }),
//     'gemini-2.5-pro': vertexAI.getGenerativeModel({ model: 'gemini-2.5-pro' }),
//     'gemini-1.5-flash': vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' }),
//     // You can add more models here if needed, e.g., 'gemini-1.0-pro'
// };

// // --- Helper function for image conversion ---
// function fileToGenerativePart(base64EncodedImage, mimeType = 'image/jpeg') {
//     if (!base64EncodedImage) {
//         console.warn("No base64EncodedImage provided to fileToGenerativePart.");
//         return null;
//     }
//     // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
//     const base64Data = base64EncodedImage.split(',')[1] || base64EncodedImage;
//     return {
//         inlineData: {
//             data: base64Data,
//             mimeType: mimeType, // Default to JPEG, but allow override
//         },
//     };
// }

// // --- Middleware ---
// app.use(cors()); // Enable CORS for all origins (adjust for production)
// app.use(express.json({ limit: '50mb' })); // Parse JSON bodies, increased limit for images

// // --- Utility function to call Gemini API ---
// async function callGeminiApiBackend(modelName, contentParts) {
//     try {
//         const modelInstance = MODELS[modelName];
//         if (!modelInstance) {
//             throw new Error(`Model instance for ${modelName} not found.`);
//         }

//         // DEBUG: Logging the contentParts just before calling the API.
//         // Simplified JSON.stringify for cleaner logs, avoiding truncation issues.
//         console.log(`DEBUG: Calling ${modelName}.generateContent with contentParts: ${JSON.stringify(contentParts)}`);

//         const result = await modelInstance.generateContent({ contents: contentParts });
//         const response = await result.response;

//         if (response && response.candidates && response.candidates.length > 0) {
//             const firstCandidate = response.candidates[0];
//             if (firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
//                 // Return only the text from the first part of the first candidate
//                 return firstCandidate.content.parts[0].text;
//             }
//         }
//         return 'No content generated.';
//     } catch (error) {
//         console.error(`Error calling Gemini API for ${modelName}:`, error);
//         // Provide more detailed error if possible
//         if (error.code === 400 && error.message.includes("contents field is required")) {
//             throw new Error(`ClientError: [VertexAI.ClientError]: Invalid input content. Please check your prompt and image data. Original error: ${error.message}`);
//         } else if (error.code === 404 && error.message.includes("Publisher Model")) {
//             throw new Error(`ClientError: [VertexAI.ClientError]: Model ${modelName} not found or project lacks access. Check model ID and permissions. Original error: ${error.message}`);
//         }
//         throw new Error(`ClientError: [VertexAI.ClientError]: ${error.message || 'Unknown error'}`);
//     }
// }

// // --- Routes ---

// // Main endpoint to handle requests for multiple models and image data
// app.post('/generate-responses', async (req, res) => {
//     const { prompt, selectedModels, imageData } = req.body;

//     // --- START: DETAILED DEBUG LOGS FOR PROMPT & IMAGE ---
//     console.log(`DEBUG: Type of req.body: ${typeof req.body}`);
//     console.log(`DEBUG: Is req.body null?: ${req.body === null}`);
//     console.log(`DEBUG: Is req.body empty object?: ${Object.keys(req.body).length === 0}`);
//     console.log(`DEBUG: Raw Prompt Value (START):'${prompt}'(END)`);
//     console.log(`DEBUG: Raw Prompt Type: ${typeof prompt}`);
//     if (typeof prompt === 'string') {
//         console.log(`DEBUG: Raw Prompt Length: ${prompt.length}`);
//         if (prompt.length > 0) {
//             console.log(`DEBUG: Raw Prompt Last CharCode: ${prompt.charCodeAt(prompt.length - 1)}`);
//         }
//         console.log(`DEBUG: Raw Prompt JSON.stringify: ${JSON.stringify(prompt)}`);
//     }
//     console.log(`DEBUG: Raw ImageData (present): ${!!imageData}`);
//     if (typeof imageData === 'string') {
//         console.log(`DEBUG: ImageData MimeType Prefix: ${imageData.substring(0, 30)}...`);
//     } else {
//         console.log(`DEBUG: Raw ImageData Type: ${typeof imageData}`);
//     }
//     // --- END: DETAILED DEBUG LOGS ---

//     // Input validation
//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         console.warn('Invalid prompt received for /generate-responses');
//         return res.status(400).json({ error: 'Valid prompt is required.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
//         console.warn('No models selected for /generate-responses');
//         return res.status(400).json({ error: 'Selected models are required.' });
//     }

//     // --- CRITICAL CORRECTION: Construct contentParts with explicit role and nested parts array ---
//     const contentParts = [{
//         role: 'user', // Explicitly define the role for the user's content
//         parts: [{ text: prompt }] // Wrap the text part in an array of 'parts'
//     }];

//     if (imageData) {
//         const imagePart = fileToGenerativePart(imageData);
//         if (imagePart) {
//             contentParts[0].parts.unshift(imagePart); // Add image to the BEGINNING of the SAME 'parts' array
//         } else {
//             console.error('Invalid image data provided for /generate-responses after fileToGenerativePart');
//             return res.status(400).json({ error: 'Invalid image data provided.' });
//         }
//     }

//     // Debug log for the final contentParts structure (simplified for cleaner logs)
//     console.log('DEBUG: Constructed contentParts (SIMPLE):', JSON.stringify(contentParts));


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
//         console.error('Error in /generate-responses endpoint during Promise.allSettled:', error);
//         res.status(500).json({ error: 'Failed to generate responses from models.' });
//     }
// });


// // Endpoint for summarizing text
// app.post('/summarize', async (req, res) => {
//     const { prompt, selectedModels } = req.body; // ImageData not used for summarize

//     // --- START: DETAILED DEBUG LOGS FOR PROMPT ---
//     console.log(`DEBUG: Type of req.body: ${typeof req.body}`);
//     console.log(`DEBUG: Is req.body null?: ${req.body === null}`);
//     console.log(`DEBUG: Is req.body empty object?: ${Object.keys(req.body).length === 0}`);
//     console.log(`DEBUG: Raw Prompt Value (START):'${prompt}'(END)`);
//     console.log(`DEBUG: Raw Prompt Type: ${typeof prompt}`);
//     if (typeof prompt === 'string') {
//         console.log(`DEBUG: Raw Prompt Length: ${prompt.length}`);
//         if (prompt.length > 0) {
//             console.log(`DEBUG: Raw Prompt Last CharCode: ${prompt.charCodeAt(prompt.length - 1)}`);
//         }
//         console.log(`DEBUG: Raw Prompt JSON.stringify: ${JSON.stringify(prompt)}`);
//     }
//     console.log(`DEBUG: Raw ImageData (present): false`); // Assuming summarize doesn't use images
//     console.log(`DEBUG: Raw ImageData Type: object`);
//     // --- END: DETAILED DEBUG LOGS ---

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         console.warn('Invalid prompt received for /summarize');
//         return res.status(400).json({ error: 'Valid prompt is required for summarization.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
//         console.warn('No models selected for /summarize');
//         return res.status(400).json({ error: 'Selected models are required for summarization.' });
//     }

//     // --- CRITICAL CORRECTION: Construct contentParts with explicit role and nested parts array ---
//     const contentParts = [{
//         role: 'user',
//         parts: [{ text: prompt }]
//     }];
//     // Debug log for the final contentParts structure (simplified for cleaner logs)
//     console.log('DEBUG: Constructed contentParts (SIMPLE):', JSON.stringify(contentParts));


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
//         console.error('Error in /summarize endpoint during Promise.allSettled:', error);
//         res.status(500).json({ error: 'Failed to summarize text.' });
//     }
// });


// // Endpoint for expanding text
// app.post('/expand', async (req, res) => {
//     const { prompt, selectedModels } = req.body; // ImageData not used for expand

//     // --- START: DETAILED DEBUG LOGS FOR PROMPT ---
//     console.log(`DEBUG: Type of req.body: ${typeof req.body}`);
//     console.log(`DEBUG: Is req.body null?: ${req.body === null}`);
//     console.log(`DEBUG: Is req.body empty object?: ${Object.keys(req.body).length === 0}`);
//     console.log(`DEBUG: Raw Prompt Value (START):'${prompt}'(END)`);
//     console.log(`DEBUG: Raw Prompt Type: ${typeof prompt}`);
//     if (typeof prompt === 'string') {
//         console.log(`DEBUG: Raw Prompt Length: ${prompt.length}`);
//         if (prompt.length > 0) {
//             console.log(`DEBUG: Raw Prompt Last CharCode: ${prompt.charCodeAt(prompt.length - 1)}`);
//         }
//         console.log(`DEBUG: Raw Prompt JSON.stringify: ${JSON.stringify(prompt)}`);
//     }
//     console.log(`DEBUG: Raw ImageData (present): false`); // Assuming expand doesn't use images
//     console.log(`DEBUG: Raw ImageData Type: object`);
//     // --- END: DETAILED DEBUG LOGS ---

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         console.warn('Invalid prompt received for /expand');
//         return res.status(400).json({ error: 'Valid prompt is required for expansion.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
//         console.warn('No models selected for /expand');
//         return res.status(400).json({ error: 'Selected models are required for expansion.' });
//     }

//     // --- CRITICAL CORRECTION: Construct contentParts with explicit role and nested parts array ---
//     const contentParts = [{
//         role: 'user',
//         parts: [{ text: prompt }]
//     }];
//     // Debug log for the final contentParts structure (simplified for cleaner logs)
//     console.log('DEBUG: Constructed contentParts (SIMPLE):', JSON.stringify(contentParts));


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
//         console.error('Error in /expand endpoint during Promise.allSettled:', error);
//         res.status(500).json({ error: 'Failed to expand text.' });
//     }
// });

// // Endpoint for extracting keywords
// app.post('/extract-keywords', async (req, res) => {
//     const { prompt, selectedModels } = req.body; // ImageData not used for keywords

//     // --- START: DETAILED DEBUG LOGS FOR PROMPT ---
//     console.log(`DEBUG: Type of req.body: ${typeof req.body}`);
//     console.log(`DEBUG: Is req.body null?: ${req.body === null}`);
//     console.log(`DEBUG: Is req.body empty object?: ${Object.keys(req.body).length === 0}`);
//     console.log(`DEBUG: Raw Prompt Value (START):'${prompt}'(END)`);
//     console.log(`DEBUG: Raw Prompt Type: ${typeof prompt}`);
//     if (typeof prompt === 'string') {
//         console.log(`DEBUG: Raw Prompt Length: ${prompt.length}`);
//         if (prompt.length > 0) {
//             console.log(`DEBUG: Raw Prompt Last CharCode: ${prompt.charCodeAt(prompt.length - 1)}`);
//         }
//         console.log(`DEBUG: Raw Prompt JSON.stringify: ${JSON.stringify(prompt)}`);
//     }
//     console.log(`DEBUG: Raw ImageData (present): false`); // Assuming keywords doesn't use images
//     console.log(`DEBUG: Raw ImageData Type: object`);
//     // --- END: DETAILED DEBUG LOGS ---

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         console.warn('Invalid prompt received for /extract-keywords');
//         return res.status(400).json({ error: 'Valid prompt is required for keyword extraction.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
//         console.warn('No models selected for /extract-keywords');
//         return res.status(400).json({ error: 'Selected models are required for keyword extraction.' });
//     }

//     // --- CRITICAL CORRECTION: Construct contentParts with explicit role and nested parts array ---
//     const contentParts = [{
//         role: 'user',
//         parts: [{ text: prompt }]
//     }];
//     // Debug log for the final contentParts structure (simplified for cleaner logs)
//     console.log('DEBUG: Constructed contentParts (SIMPLE):', JSON.stringify(contentParts));


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
//         console.error('Error in /extract-keywords endpoint during Promise.allSettled:', error);
//         res.status(500).json({ error: 'Failed to extract keywords.' });
//     }
// });


// // Start the server
// app.listen(port, () => {
//     console.log(`Backend server listening at http://localhost:${port}`);
// });



// gemini-backend/server.js

const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const { GoogleAuth } = require('google-auth-library'); // Import GoogleAuth
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 8080; // Use PORT from environment or default to 8080

// Initialize Vertex AI with project and location from environment variables
// IMPORTANT: Using GOOGLE_CLOUD_PROJECT as it's the standard env var for project ID
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
// Ensure this location matches what your models support and what you've tested with curl
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

if (!PROJECT_ID) {
    console.error('GOOGLE_CLOUD_PROJECT environment variable is not set. Please set it to your Google Cloud Project ID.');
    process.exit(1);
}

const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const googleAuth = new GoogleAuth(); // Initialize GoogleAuth for token handling

// Define the generative models available for selection (for text/vision tasks)
const GENERATIVE_MODELS = {
    'gemini-2.5-flash': vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' }),
    'gemini-2.5-pro': vertexAI.getGenerativeModel({ model: 'gemini-2.5-pro' }),
    'gemini-1.5-flash': vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' }),
};

// Define Imagen 4.0 models for the backend API calls
const IMAGEN_4_MODELS = {
    'standard': 'imagen-4.0-generate-preview-06-06', // Use the latest preview if available
    'ultra': 'imagen-4.0-ultra-generate-preview-06-06',
    'fast': 'imagen-4.0-fast-generate-preview-06-06'
};

// --- Helper function for image conversion (for sending images to Gemini) ---
function fileToGenerativePart(base64EncodedImage, mimeType = 'image/jpeg') {
    if (!base64EncodedImage) {
        console.warn("No base64EncodedImage provided to fileToGenerativePart.");
        return null;
    }
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64EncodedImage.split(',')[1] || base64EncodedImage;
    return {
        inlineData: {
            data: base64Data,
            mimeType: mimeType, // Default to JPEG, but allow override
        },
    };
}

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies, increased limit for images

// --- Utility function to call Gemini API (for text/vision) ---
async function callGeminiApiBackend(modelName, contentParts) {
    try {
        const modelInstance = GENERATIVE_MODELS[modelName];
        if (!modelInstance) {
            throw new Error(`Model instance for ${modelName} not found.`);
        }

        console.log(`DEBUG: Calling ${modelName}.generateContent with contentParts: ${JSON.stringify(contentParts)}`);

        const result = await modelInstance.generateContent({ contents: contentParts });
        const response = await result.response;

        if (response && response.candidates && response.candidates.length > 0) {
            const firstCandidate = response.candidates[0];
            if (firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
                // Return only the text from the first part of the first candidate
                return firstCandidate.content.parts[0].text;
            }
        }
        return 'No content generated.';
    } catch (error) {
        console.error(`Error calling Gemini API for ${modelName}:`, error);
        // Provide more detailed error if possible
        if (error.code === 400 && error.message.includes("contents field is required")) {
            throw new Error(`ClientError: [VertexAI.ClientError]: Invalid input content. Please check your prompt and image data. Original error: ${error.message}`);
        } else if (error.code === 404 && error.message.includes("Publisher Model")) {
            throw new Error(`ClientError: [VertexAI.ClientError]: Model ${modelName} not found or project lacks access. Check model ID and permissions. Original error: ${error.message}`);
        }
        throw new Error(`ClientError: [VertexAI.ClientError]: ${error.message || 'Unknown error'}`);
    }
}

// --- Routes ---

// Main endpoint to handle requests for multiple text/vision models and image data
app.post('/generate-responses', async (req, res) => {
    const { prompt, selectedModels, imageData } = req.body;

    console.log(`DEBUG: Raw Prompt Value (START):'${prompt}'(END)`);
    console.log(`DEBUG: Raw ImageData (present): ${!!imageData}`);

    // Input validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        console.warn('Invalid prompt received for /generate-responses');
        return res.status(400).json({ error: 'Valid prompt is required.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
        console.warn('No models selected for /generate-responses');
        return res.status(400).json({ error: 'Selected models are required.' });
    }

    // Construct contentParts with explicit role and nested parts array
    const contentParts = [{
        role: 'user', // Explicitly define the role for the user's content
        parts: [{ text: prompt }] // Wrap the text part in an array of 'parts'
    }];

    if (imageData) {
        const imagePart = fileToGenerativePart(imageData);
        if (imagePart) {
            contentParts[0].parts.unshift(imagePart); // Add image to the BEGINNING of the SAME 'parts' array
        } else {
            console.error('Invalid image data provided for /generate-responses after fileToGenerativePart');
            return res.status(400).json({ error: 'Invalid image data provided.' });
        }
    }

    console.log('DEBUG: Constructed contentParts (SIMPLE):', JSON.stringify(contentParts));

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && GENERATIVE_MODELS[modelName]) {
            promises.push(
                callGeminiApiBackend(modelName, contentParts)
                    .then(output => newResults[modelName] = output)
                    .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
            );
        } else if (selectedModels[modelName] && !GENERATIVE_MODELS[modelName]) {
            newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
        }
    }

    try {
        await Promise.allSettled(promises);
        res.json(newResults);
    } catch (error) {
        console.error('Error in /generate-responses endpoint during Promise.allSettled:', error);
        res.status(500).json({ error: 'Failed to generate responses from models.' });
    }
});

// Endpoint for summarizing text (uses GENERATIVE_MODELS)
app.post('/summarize', async (req, res) => {
    const { prompt, selectedModels } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        console.warn('Invalid prompt received for /summarize');
        return res.status(400).json({ error: 'Valid prompt is required for summarization.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
        console.warn('No models selected for /summarize');
        return res.status(400).json({ error: 'Selected models are required for summarization.' });
    }

    const contentParts = [{
        role: 'user',
        parts: [{ text: prompt }]
    }];

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && GENERATIVE_MODELS[modelName]) {
            promises.push(
                callGeminiApiBackend(modelName, contentParts)
                    .then(output => newResults[modelName] = output)
                    .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
            );
        } else if (selectedModels[modelName] && !GENERATIVE_MODELS[modelName]) {
            newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
        }
    }

    try {
        await Promise.allSettled(promises);
        res.json(newResults);
    } catch (error) {
        console.error('Error in /summarize endpoint during Promise.allSettled:', error);
        res.status(500).json({ error: 'Failed to summarize text.' });
    }
});


// Endpoint for expanding text (uses GENERATIVE_MODELS)
app.post('/expand', async (req, res) => {
    const { prompt, selectedModels } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        console.warn('Invalid prompt received for /expand');
        return res.status(400).json({ error: 'Valid prompt is required for expansion.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
        console.warn('No models selected for /expand');
        return res.status(400).json({ error: 'Selected models are required for expansion.' });
    }

    const contentParts = [{
        role: 'user',
        parts: [{ text: prompt }]
    }];

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && GENERATIVE_MODELS[modelName]) {
            promises.push(
                callGeminiApiBackend(modelName, contentParts)
                    .then(output => newResults[modelName] = output)
                    .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
            );
        } else if (selectedModels[modelName] && !GENERATIVE_MODELS[modelName]) {
            newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
        }
    }

    try {
        await Promise.allSettled(promises);
        res.json(newResults);
    } catch (error) {
        console.error('Error in /expand endpoint during Promise.allSettled:', error);
        res.status(500).json({ error: 'Failed to expand text.' });
    }
});

// Endpoint for extracting keywords (uses GENERATIVE_MODELS)
app.post('/extract-keywords', async (req, res) => {
    const { prompt, selectedModels } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        console.warn('Invalid prompt received for /extract-keywords');
        return res.status(400).json({ error: 'Valid prompt is required for keyword extraction.' });
    }
    if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
        console.warn('No models selected for /extract-keywords');
        return res.status(400).json({ error: 'Selected models are required for keyword extraction.' });
    }

    const contentParts = [{
        role: 'user',
        parts: [{ text: prompt }]
    }];

    const newResults = {};
    const promises = [];

    for (const modelName of Object.keys(selectedModels)) {
        if (selectedModels[modelName] && GENERATIVE_MODELS[modelName]) {
            promises.push(
                callGeminiApiBackend(modelName, contentParts)
                    .then(output => newResults[modelName] = output)
                    .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
            );
        } else if (selectedModels[modelName] && !GENERATIVE_MODELS[modelName]) {
            newResults[modelName] = `Model '${modelName}' selected on frontend but not configured on backend.`;
        }
    }

    try {
        await Promise.allSettled(promises);
        res.json(newResults);
    } catch (error) {
        console.error('Error in /extract-keywords endpoint during Promise.allSettled:', error);
        res.status(500).json({ error: 'Failed to extract keywords.' });
    }
});

// NEW: Endpoint for Imagen 4.0 Image Generation
app.post('/generate-image', async (req, res) => {
    const { prompt, modelType = 'standard' } = req.body; // Default to 'standard' if not specified

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        console.warn('Invalid prompt received for /generate-image');
        return res.status(400).json({ error: 'Valid prompt is required for image generation.' });
    }

    const modelId = IMAGEN_4_MODELS[modelType];
    if (!modelId) {
        return res.status(400).json({ error: `Invalid Imagen model type: ${modelType}.` });
    }

    console.log(`Attempting to generate image with prompt: "${prompt}" using model: ${modelId}`);

    try {
        // Get an access token from GoogleAuth. In Cloud Run, this will use the service account's identity.
        const accessToken = await googleAuth.getAccessToken();
        if (!accessToken) {
            console.error('Failed to obtain Google Cloud access token.');
            return res.status(500).json({ error: 'Failed to authenticate with Google Cloud.' });
        }

        const apiUrl = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${modelId}:predict`;

        const payload = {
            instances: [
                {
                    prompt: prompt
                }
            ],
            parameters: {
                sampleCount: 1 // Generate one image per request
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Imagen API call failed with status ${response.status}: ${errorText}`);
            return res.status(response.status).json({ error: `Imagen API error: ${errorText}` });
        }

        const result = await response.json();

        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
            res.json({ imageUrl: imageUrl });
        } else {
            console.warn('Imagen API response did not contain expected image data:', result);
            res.status(500).json({ error: 'Imagen generation successful, but no image data returned.' });
        }

    } catch (error) {
        console.error('Error during Imagen image generation:', error);
        res.status(500).json({ error: `Backend error during image generation: ${error.message}` });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
