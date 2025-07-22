

// // gemini-backend/server.js

// const express = require('express');
// const { VertexAI } = require('@google-cloud/vertexai');
// const { GoogleAuth } = require('google-auth-library'); // Import GoogleAuth
// const { Firestore } = require('@google-cloud/firestore'); 
// const cors = require('cors');
// require('dotenv').config(); // Load environment variables from .env file

// const app = express();
// const port = process.env.PORT || 8080; // Use PORT from environment or default to 8080

// // Initialize Firestore
// const firestore = new Firestore();

// // Initialize Vertex AI with project and location from environment variables
// // IMPORTANT: Using GOOGLE_CLOUD_PROJECT as it's the standard env var for project ID
// const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
// // Ensure this location matches what your models support and what you've tested with curl
// const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// if (!PROJECT_ID) {
//     console.error('GOOGLE_CLOUD_PROJECT environment variable is not set. Please set it to your Google Cloud Project ID.');
//     process.exit(1);
// }

// const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
// const googleAuth = new GoogleAuth(); // Initialize GoogleAuth for token handling

// // Define the generative models available for selection (for text/vision tasks)
// const GENERATIVE_MODELS = {
//     'gemini-2.5-flash': vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' }),
//     'gemini-2.5-pro': vertexAI.getGenerativeModel({ model: 'gemini-2.5-pro' }),
//     'gemini-1.5-flash': vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' }),
// };

// // Define Imagen 4.0 models for the backend API calls
// const IMAGEN_4_MODELS = {
//     'standard': 'imagen-4.0-generate-preview-06-06', // Use the latest preview if available
//     'ultra': 'imagen-4.0-ultra-generate-preview-06-06',
//     'fast': 'imagen-4.0-fast-generate-preview-06-06'
// };

// // --- Helper function for image conversion (for sending images to Gemini) ---
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

// // --- Chat History Routes ---

// // NOTE: For now, we'll use a hardcoded user ID.
// // This will be replaced with real user IDs after we add authentication.
// const TEMP_USER_ID = "temp_user_123";

// // GET all chats for the temporary user
// app.get('/chats', async (req, res) => {
//     try {
//         const chatsRef = firestore.collection('users').doc(TEMP_USER_ID).collection('chats');
//         const snapshot = await chatsRef.orderBy('createdAt', 'desc').get();
//         if (snapshot.empty) {
//             return res.json([]);
//         }
//         const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         res.json(chats);
//     } catch (error) {
//         console.error('Error fetching chats:', error);
//         res.status(500).json({ error: 'Could not fetch chats.' });
//     }
// });

// // POST a new chat
// app.post('/chats', async (req, res) => {
//     try {
//         const { title, prompt, results } = req.body;
//         const chatsRef = firestore.collection('users').doc(TEMP_USER_ID).collection('chats');
//         const newChat = {
//             title: title || prompt.substring(0, 30) || 'New Chat',
//             createdAt: new Date().toISOString(),
//             prompt,
//             results
//         };
//         const docRef = await chatsRef.add(newChat);
//         res.status(201).json({ id: docRef.id, ...newChat });
//     } catch (error) {
//         console.error('Error creating new chat:', error);
//         res.status(500).json({ error: 'Could not create a new chat.' });
//     }
// });

// // GET a single chat's details
// app.get('/chats/:chatId', async (req, res) => {
//     try {
//         const { chatId } = req.params;
//         const docRef = firestore.collection('users').doc(TEMP_USER_ID).collection('chats').doc(chatId);
//         const doc = await docRef.get();
//         if (!doc.exists) {
//             return res.status(404).json({ error: 'Chat not found.' });
//         }
//         res.json({ id: doc.id, ...doc.data() });
//     } catch (error) {
//         console.error('Error fetching chat:', error);
//         res.status(500).json({ error: 'Could not fetch chat details.' });
//     }
// });


// // --- Utility function to call Gemini API (for text/vision) ---
// async function callGeminiApiBackend(modelName, contentParts) {
//     try {
//         const modelInstance = GENERATIVE_MODELS[modelName];
//         if (!modelInstance) {
//             throw new Error(`Model instance for ${modelName} not found.`);
//         }

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

// // Main endpoint to handle requests for multiple text/vision models and image data
// app.post('/generate-responses', async (req, res) => {
//     const { prompt, selectedModels, imageData } = req.body;

//     console.log(`DEBUG: Raw Prompt Value (START):'${prompt}'(END)`);
//     console.log(`DEBUG: Raw ImageData (present): ${!!imageData}`);

//     // Input validation
//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         console.warn('Invalid prompt received for /generate-responses');
//         return res.status(400).json({ error: 'Valid prompt is required.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
//         console.warn('No models selected for /generate-responses');
//         return res.status(400).json({ error: 'Selected models are required.' });
//     }

//     // Construct contentParts with explicit role and nested parts array
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

//     console.log('DEBUG: Constructed contentParts (SIMPLE):', JSON.stringify(contentParts));

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && GENERATIVE_MODELS[modelName]) {
//             promises.push(
//                 callGeminiApiBackend(modelName, contentParts)
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !GENERATIVE_MODELS[modelName]) {
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

// // Endpoint for summarizing text (uses GENERATIVE_MODELS)
// app.post('/summarize', async (req, res) => {
//     const { prompt, selectedModels } = req.body;

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         console.warn('Invalid prompt received for /summarize');
//         return res.status(400).json({ error: 'Valid prompt is required for summarization.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
//         console.warn('No models selected for /summarize');
//         return res.status(400).json({ error: 'Selected models are required for summarization.' });
//     }

//     const contentParts = [{
//         role: 'user',
//         parts: [{ text: prompt }]
//     }];

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && GENERATIVE_MODELS[modelName]) {
//             promises.push(
//                 callGeminiApiBackend(modelName, contentParts)
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !GENERATIVE_MODELS[modelName]) {
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


// // Endpoint for expanding text (uses GENERATIVE_MODELS)
// app.post('/expand', async (req, res) => {
//     const { prompt, selectedModels } = req.body;

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         console.warn('Invalid prompt received for /expand');
//         return res.status(400).json({ error: 'Valid prompt is required for expansion.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
//         console.warn('No models selected for /expand');
//         return res.status(400).json({ error: 'Selected models are required for expansion.' });
//     }

//     const contentParts = [{
//         role: 'user',
//         parts: [{ text: prompt }]
//     }];

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && GENERATIVE_MODELS[modelName]) {
//             promises.push(
//                 callGeminiApiBackend(modelName, contentParts)
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !GENERATIVE_MODELS[modelName]) {
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

// // Endpoint for extracting keywords (uses GENERATIVE_MODELS)
// app.post('/extract-keywords', async (req, res) => {
//     const { prompt, selectedModels } = req.body;

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         console.warn('Invalid prompt received for /extract-keywords');
//         return res.status(400).json({ error: 'Valid prompt is required for keyword extraction.' });
//     }
//     if (!selectedModels || typeof selectedModels !== 'object' || Object.keys(selectedModels).length === 0) {
//         console.warn('No models selected for /extract-keywords');
//         return res.status(400).json({ error: 'Selected models are required for keyword extraction.' });
//     }

//     const contentParts = [{
//         role: 'user',
//         parts: [{ text: prompt }]
//     }];

//     const newResults = {};
//     const promises = [];

//     for (const modelName of Object.keys(selectedModels)) {
//         if (selectedModels[modelName] && GENERATIVE_MODELS[modelName]) {
//             promises.push(
//                 callGeminiApiBackend(modelName, contentParts)
//                     .then(output => newResults[modelName] = output)
//                     .catch(err => newResults[modelName] = `API Error for ${modelName}: ${err.message || 'Unknown error'}`)
//             );
//         } else if (selectedModels[modelName] && !GENERATIVE_MODELS[modelName]) {
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

// // NEW: Endpoint for Imagen 4.0 Image Generation
// app.post('/generate-image', async (req, res) => {
//     const { prompt, modelType = 'standard' } = req.body; // Default to 'standard' if not specified

//     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
//         console.warn('Invalid prompt received for /generate-image');
//         return res.status(400).json({ error: 'Valid prompt is required for image generation.' });
//     }

//     const modelId = IMAGEN_4_MODELS[modelType];
//     if (!modelId) {
//         return res.status(400).json({ error: `Invalid Imagen model type: ${modelType}.` });
//     }

//     console.log(`Attempting to generate image with prompt: "${prompt}" using model: ${modelId}`);

//     try {
//         // Get an access token from GoogleAuth. In Cloud Run, this will use the service account's identity.
//         const accessToken = await googleAuth.getAccessToken();
//         if (!accessToken) {
//             console.error('Failed to obtain Google Cloud access token.');
//             return res.status(500).json({ error: 'Failed to authenticate with Google Cloud.' });
//         }

//         const apiUrl = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${modelId}:predict`;

//         const payload = {
//             instances: [
//                 {
//                     prompt: prompt
//                 }
//             ],
//             parameters: {
//                 sampleCount: 1 // Generate one image per request
//             }
//         };

//         const response = await fetch(apiUrl, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json; charset=utf-8'
//             },
//             body: JSON.stringify(payload)
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             console.error(`Imagen API call failed with status ${response.status}: ${errorText}`);
//             return res.status(response.status).json({ error: `Imagen API error: ${errorText}` });
//         }

//         const result = await response.json();

//         if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
//             const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
//             res.json({ imageUrl: imageUrl });
//         } else {
//             console.warn('Imagen API response did not contain expected image data:', result);
//             res.status(500).json({ error: 'Imagen generation successful, but no image data returned.' });
//         }

//     } catch (error) {
//         console.error('Error during Imagen image generation:', error);
//         res.status(500).json({ error: `Backend error during image generation: ${error.message}` });
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
const { Firestore } = require('@google-cloud/firestore'); 
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 8080; // Use PORT from environment or default to 8080

// Initialize Firestore
const firestore = new Firestore();

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

// --- Chat History Routes ---

// NOTE: For now, we'll use a hardcoded user ID.
// This will be replaced with real user IDs after we add authentication.
const TEMP_USER_ID = "temp_user_123";

// GET all chats for the temporary user
app.get('/chats', async (req, res) => {
    try {
        const chatsRef = firestore.collection('users').doc(TEMP_USER_ID).collection('chats');
        const snapshot = await chatsRef.orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            return res.json([]);
        }
        const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Could not fetch chats.' });
    }
});

// POST a new chat
app.post('/chats', async (req, res) => {
    try {
        const { title, prompt, results } = req.body;
        const chatsRef = firestore.collection('users').doc(TEMP_USER_ID).collection('chats');
        const newChat = {
            title: title || prompt.substring(0, 30) || 'New Chat',
            createdAt: new Date().toISOString(),
            prompt,
            results
        };
        const docRef = await chatsRef.add(newChat);
        res.status(201).json({ id: docRef.id, ...newChat });
    } catch (error) {
        console.error('Error creating new chat:', error);
        res.status(500).json({ error: 'Could not create a new chat.' });
    }
});

// GET a single chat's details
app.get('/chats/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const docRef = firestore.collection('users').doc(TEMP_USER_ID).collection('chats').doc(chatId);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Chat not found.' });
        }
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error('Error fetching chat:', error);
        res.status(500).json({ error: 'Could not fetch chat details.' });
    }
});


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
