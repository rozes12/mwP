import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp, setLogLevel } from 'firebase/firestore';

function App() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageData, setImageData] = useState(null);

    const [isFlipped, setIsFlipped] = useState(false);
    const [imageGenPrompt, setImageGenPrompt] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
    const [imageGenLoading, setImageGenLoading] = useState(false);
    const [selectedImagenModel, setSelectedImagenModel] = useState('standard');

    const [selectedModels, setSelectedModels] = useState({
        'gemini-2.5-flash': true,
        'gemini-2.5-pro': true,
        'gemini-1.5-flash': true,
    });

    // Firebase states, now managed directly in App.jsx
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [history, setHistory] = useState([]);

    const BACKEND_BASE_URL = 'https://minwebback-343717256329.us-central1.run.app';

    // Constant for indicating large image data not stored in Firestore
    const IMAGE_TOO_LARGE_PLACEHOLDER = "IMAGE_DATA_TOO_LARGE_FOR_FIRESTORE";


    // Firebase Initialization and Authentication
    useEffect(() => {
        setLogLevel('debug'); // Set Firebase log level for debugging

        // Access global variables provided by the Canvas environment
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);

            setAuth(authInstance);
            setDb(dbInstance);

            // Listen for authentication state changes
            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    console.log("User authenticated:", user.uid);
                } else {
                    // Sign in anonymously if no user is found
                    try {
                        const { user: anonUser } = await signInAnonymously(authInstance);
                        setUserId(anonUser.uid);
                        console.log("Signed in anonymously. User ID:", anonUser.uid);
                    } catch (anonError) {
                        console.error("Anonymous sign-in failed:", anonError);
                    }
                }
                setIsAuthReady(true); // Mark authentication as ready
            });

            // Attempt to sign in with custom token if available (provided by Canvas)
            if (initialAuthToken) {
                signInWithCustomToken(authInstance, initialAuthToken)
                    .then((userCredential) => {
                        console.log("Signed in with custom token. User ID:", userCredential.user.uid);
                    })
                    .catch((error) => {
                        console.error("Custom token sign-in failed:", error);
                        // Fallback to anonymous sign-in if custom token fails
                        signInAnonymously(authInstance)
                            .then(({ user: anonUser }) => {
                                setUserId(anonUser.uid);
                                console.log("Signed in anonymously after custom token failure. User ID:", anonUser.uid);
                            })
                            .catch(anonError => {
                                console.error("Anonymous sign-in failed after custom token failure:", anonError);
                            });
                    });
            } else {
                console.warn("__initial_auth_token not defined. Proceeding with anonymous sign-in or existing session.");
            }

            return () => unsubscribe(); // Cleanup auth listener on component unmount
        } catch (error) {
            console.error("Firebase initialization failed:", error);
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    // Dynamically load Tailwind CSS and Font Awesome to avoid React child errors
    useEffect(() => {
        // Load Tailwind CSS
        const tailwindScript = document.createElement('script');
        tailwindScript.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(tailwindScript);

        // Load Font Awesome CSS
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);

        return () => {
            // Clean up when component unmounts (optional, but good practice)
            document.head.removeChild(tailwindScript);
            document.head.removeChild(fontAwesomeLink);
        };
    }, []);


    // Firestore History Listener
    useEffect(() => {
        if (!db || !userId || !isAuthReady) {
            console.log("Firestore, User ID, or Auth not ready for history listener.");
            return;
        }

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const historyCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/ai_generations`);

        const q = query(historyCollectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedHistory = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                try {
                    if (data.results && typeof data.results === 'string' && data.results.startsWith('{') && data.results.endsWith('}')) {
                        data.results = JSON.parse(data.results);
                    } else if (data.results === null) {
                        data.results = {};
                    }

                    if (data.generatedImageUrl && typeof data.generatedImageUrl === 'string' && data.generatedImageUrl.startsWith('{') && data.generatedImageUrl.endsWith('}')) {
                         data.generatedImageUrl = JSON.parse(data.generatedImageUrl).imageUrl;
                    }

                } catch (e) {
                    console.error("Error parsing history document data:", e, data);
                }
                fetchedHistory.push({ id: doc.id, ...data });
            });
            fetchedHistory.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
            setHistory(fetchedHistory);
            console.log("History loaded:", fetchedHistory.length, "entries.");
        }, (error) => {
            console.error("Error fetching history from Firestore:", error);
        });

        return () => unsubscribe();
    }, [db, userId, isAuthReady]);


    // Helper function to save data to Firestore (now part of App component)
    const saveToFirestore = async (type, prompt, results, generatedImageUrl = null) => {
        if (!db || !userId) {
            console.error("Firestore or User ID not available. Cannot save data.");
            return;
        }
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const historyCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/ai_generations`);

        let imageUrlToStore = generatedImageUrl;
        // Check if the image URL is likely a large Base64 string that will exceed Firestore's limit
        // 1MB = 1048576 bytes. Base64 strings are about 1.33 times larger than binary data.
        // A generous threshold of 100KB for the string length is used to flag it as too large.
        if (type === 'image-generation' && generatedImageUrl && typeof generatedImageUrl === 'string' && generatedImageUrl.length > 100000) {
            console.warn("Detected large Base64 image data for image generation. Storing placeholder instead of full image URL to avoid exceeding Firestore document size limit.");
            imageUrlToStore = IMAGE_TOO_LARGE_PLACEHOLDER;
        }

        const dataToSave = {
            type: type, // e.g., 'text-generation', 'summarization', 'image-generation'
            prompt: prompt,
            timestamp: serverTimestamp(), // Use server timestamp for consistent ordering
            // Stringify complex objects like 'results' before saving
            results: results ? JSON.stringify(results) : null,
            generatedImageUrl: imageUrlToStore, // Will be null or placeholder for large images
            userId: userId, // Store userId for debugging/clarity in Firestore console
        };

        try {
            await addDoc(historyCollectionRef, dataToSave);
            console.log("Data saved to Firestore successfully.");
        } catch (e) {
            console.error("Error adding document to Firestore:", e);
        }
    };


    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleImageGenPromptChange = (e) => {
        setImageGenPrompt(e.target.value);
    };

    const handleModelToggle = (modelName) => {
        setSelectedModels(prev => ({
            ...prev,
            [modelName]: !prev[modelName]
        }));
    };

    const handleImagenModelSelect = (e) => {
        setSelectedImagenModel(e.target.value);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageData(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedImage(null);
            setImageData(null);
        }
    };

    const handleClearAll = () => {
        setPrompt('');
        setResults({});
        setSelectedImage(null);
        setImageData(null);
        setImageGenPrompt('');
        setGeneratedImageUrl(null);
        setImageGenLoading(false);
    };

    const toggleFlip = () => {
        setIsFlipped(prev => !prev);
        handleClearAll();
    };

    const callBackendApi = async (endpoint, payload) => {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Backend HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error calling backend endpoint ${endpoint}:`, error);
            throw new Error(`Failed to communicate with backend: ${error.message}`);
        }
    };

    const runPrompt = async () => {
        if (!prompt.trim()) {
            setResults({ error: 'Please enter a prompt.' });
            return;
        }

        setLoading(true);
        setResults({});

        try {
            const data = await callBackendApi('/generate-responses', { prompt, selectedModels, imageData });
            setResults(data);
            await saveToFirestore('text-generation', prompt, data);
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const summarizeText = async () => {
        if (!prompt.trim()) {
            setResults({ error: 'Please enter text to summarize.' });
            return;
        }
        if (Object.values(selectedModels).every(selected => !selected)) {
            setResults({ error: 'Please select at least one model for summarization.' });
            return;
        }

        setLoading(true);
        setResults({});

        try {
            const genericPrompt = `Summarize the following text: "${prompt}"`;
            const data = await callBackendApi('/generate-responses', { prompt: genericPrompt, selectedModels });
            setResults({ summaries: data });
            await saveToFirestore('summarization', prompt, { summaries: data });
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const expandText = async () => {
        if (!prompt.trim()) {
            setResults({ error: 'Please enter text to expand.' });
            return;
        }
        if (Object.values(selectedModels).every(selected => !selected)) {
            setResults({ error: 'Please select at least one model for expansion.' });
            return;
        }

        setLoading(true);
        setResults({});

        try {
            const genericPrompt = `Expand on the following text: "${prompt}"`;
            const data = await callBackendApi('/generate-responses', { prompt: genericPrompt, selectedModels });
            setResults({ expansions: data });
            await saveToFirestore('expansion', prompt, { expansions: data });
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const extractKeywords = async () => {
        if (!prompt.trim()) {
            setResults({ error: 'Please enter text to extract keywords from.' });
            return;
        }
        if (Object.values(selectedModels).every(selected => !selected)) {
            setResults({ error: 'Please select at least one model for keyword extraction.' });
            return;
        }

        setLoading(true);
        setResults({});

        try {
            const genericPrompt = `Extract keywords from the following text: "${prompt}"`;
            const data = await callBackendApi('/generate-responses', { prompt: genericPrompt, selectedModels });
            setResults({ keywords: data });
            await saveToFirestore('keyword-extraction', prompt, { keywords: data });
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const generateImageViaBackend = async () => {
        if (!imageGenPrompt.trim()) {
            setResults({ error: 'Please enter a prompt for image generation.' });
            return;
        }

        setImageGenLoading(true);
        setGeneratedImageUrl(null);
        setResults({});

        try {
            const data = await callBackendApi('/generate-image', {
                prompt: imageGenPrompt,
                modelType: selectedImagenModel
            });
            setGeneratedImageUrl(data.imageUrl);
            await saveToFirestore('image-generation', imageGenPrompt, null, data.imageUrl);
        } catch (error) {
            console.error('Error during image generation (frontend):', error);
            setResults({ error: `Image generation failed: ${error.message}. Check backend logs.` });
        } finally {
            setImageGenLoading(false);
        }
    };


    return (
        <>
            {/* Tailwind CSS CDN is loaded dynamically via a useEffect hook */}
            {/* FontAwesome CDN is loaded dynamically via a useEffect hook */}
            <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8
                            bg-gray-900 text-gray-100 font-sans overflow-x-hidden">
                <div className="max-w-4xl w-full space-y-8 p-6 bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-600/30 overflow-hidden">

                    <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-cyan-400 mb-8 tracking-wide drop-shadow-lg">
                        {isFlipped ? '🖼️ Imagen Generator 🚀' : '✨ Gemini Fun-House AI ✨'}
                    </h1>

                    {userId && isAuthReady ? (
                        <div className="text-center text-sm text-gray-400 mb-4 p-2 bg-gray-700/50 rounded-lg border border-purple-600/20">
                            Your User ID: <span className="font-mono text-cyan-400 break-all">{userId}</span>
                        </div>
                    ) : (
                        <div className="text-center text-sm text-gray-500 mb-4 p-2 bg-gray-700/50 rounded-lg border border-gray-600">
                            Authenticating...
                        </div>
                    )}


                    <div className="flex justify-center mb-6">
                        <button
                            onClick={toggleFlip}
                            className="py-2 px-4 rounded-lg font-bold text-lg text-white
                                       bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg
                                       hover:from-indigo-600 hover:to-purple-600
                                       transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                        >
                            {isFlipped ? 'Switch to Text AI Tools' : 'Switch to Image Generator'}
                        </button>
                    </div>

                    {/* Flippable Container - Now controlling flip directly on children */}
                    <div className="relative w-full h-auto min-h-[300vh] [transform-style:preserve-3d]">
                        {/* Front Side: Text AI Tools */}
                        <div className={`absolute inset-0 p-6 md:p-8 bg-gray-800/60 rounded-lg shadow-xl border border-pink-500/20 [backface-visibility:hidden] transition-all duration-700 ease-in-out
                            ${isFlipped ? '[transform:rotateY(180deg)] opacity-0 pointer-events-none' : '[transform:rotateY(0deg)] opacity-100 pointer-events-auto'}`}>
                            {!isFlipped && ( // Only render content when this side is "active"
                                <>
                                    <div className="mb-6">
                                        <label htmlFor="prompt-input" className="block text-lg font-medium text-gray-100 mb-2">
                                            Type your wildest ideas:
                                        </label>
                                        <textarea
                                            id="prompt-input"
                                            rows="6"
                                            placeholder="e.g., Describe a futuristic city powered by sentient plants..."
                                            value={prompt}
                                            onChange={handlePromptChange}
                                            className="w-full p-4 border border-purple-500 rounded-lg shadow-inner bg-gray-700/50 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 resize-y"
                                        ></textarea>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="image-upload" className="block text-cyan-400 text-lg font-medium mb-2">
                                            Upload Image (Optional for Text AI):
                                        </label>
                                        <input
                                            type="file"
                                            id="image-upload"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-gray-100
                                                       file:mr-4 file:py-2 file:px-4
                                                       file:rounded-full file:border-0
                                                       file:text-sm file:font-semibold
                                                       file:bg-purple-600 file:text-white
                                                       hover:file:bg-pink-600 hover:file:cursor-pointer
                                                       transition-colors duration-200"
                                        />
                                        {selectedImage && (
                                            <p className="text-sm text-gray-400 mt-2">
                                                Selected: {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-8">
                                        <label className="block text-lg font-medium text-gray-100 mb-3">
                                            Choose your AI companions:
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Object.keys(selectedModels).map(modelName => (
                                                <div key={modelName} className="flex items-center p-3 rounded-md bg-gray-700/70 border border-orange-500/20 shadow-sm cursor-pointer hover:bg-gray-700/90 transition-all duration-200">
                                                    <input
                                                        type="checkbox"
                                                        id={modelName}
                                                        checked={selectedModels[modelName]}
                                                        onChange={() => handleModelToggle(modelName)}
                                                        className="h-5 w-5 text-cyan-400 rounded border-gray-600 focus:ring-cyan-400 bg-gray-700 cursor-pointer"
                                                    />
                                                    <label htmlFor={modelName} className="ml-3 block text-base font-medium text-gray-100 cursor-pointer">
                                                        {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        {selectedModels[modelName] && <span className="ml-1 text-xs text-cyan-400">(Active)</span>}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                        <button
                                            onClick={runPrompt}
                                            disabled={loading || !isAuthReady}
                                            className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
                                                       bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg
                                                       hover:from-pink-500 hover:to-purple-600
                                                       transition-all duration-300 ease-in-out transform hover:-translate-y-1
                                                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {loading ? 'Summoning AIs...' : 'Unleash Multiverse Thoughts'}
                                        </button>
                                        <button
                                            onClick={summarizeText}
                                            disabled={loading || !isAuthReady}
                                            className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
                                                       bg-gradient-to-r from-green-500 to-teal-500 shadow-lg
                                                       hover:from-teal-500 hover:to-green-500
                                                       transition-all duration-300 ease-in-out transform hover:-translate-y-1
                                                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {loading ? 'Digesting...' : '✨ Concise Summary'}
                                        </button>
                                        <button
                                            onClick={expandText}
                                            disabled={loading || !isAuthReady}
                                            className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
                                                       bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg
                                                       hover:from-indigo-500 hover:to-blue-500
                                                       transition-all duration-300 ease-in-out transform hover:-translate-y-1
                                                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {loading ? 'Expanding...' : '✨ Elaborate Further'}
                                        </button>
                                        <button
                                            onClick={extractKeywords}
                                            disabled={loading || !isAuthReady}
                                            className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
                                                       bg-gradient-to-r from-red-500 to-orange-500 shadow-lg
                                                       hover:from-orange-500 hover:to-red-500
                                                       transition-all duration-300 ease-in-out transform hover:-translate-y-1
                                                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {loading ? 'Scanning...' : '✨ Extract Core Concepts'}
                                        </button>
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            onClick={handleClearAll}
                                            className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
                                                       bg-gray-700 shadow-lg border border-gray-600
                                                       hover:bg-gray-600 hover:border-gray-500
                                                       transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                                        >
                                            <i className="fas fa-redo-alt mr-2"></i> Clear All
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Back Side: Imagen Generator */}
                        <div className={`absolute inset-0 p-6 md:p-8 bg-gray-800/60 rounded-lg shadow-xl border border-pink-500/20 [backface-visibility:hidden] transition-all duration-700 ease-in-out
                            ${isFlipped ? '[transform:rotateY(0deg)] opacity-100 pointer-events-auto' : '[transform:rotateY(180deg)] opacity-0 pointer-events-none'}`}>
                            {isFlipped && ( // Only render content when this side is "active"
                                <>
                                    <div className="mb-6">
                                        <label htmlFor="image-gen-prompt-input" className="block text-lg font-medium text-gray-100 mb-2">
                                            Describe the image you want to conjure:
                                        </label>
                                        <textarea
                                            id="image-gen-prompt-input"
                                            rows="6"
                                            placeholder="e.g., A surreal landscape where clocks melt into trees, in the style of Salvador Dalí."
                                            value={imageGenPrompt}
                                            onChange={handleImageGenPromptChange}
                                            className="w-full p-4 border border-purple-500 rounded-lg shadow-inner bg-gray-700/50 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 resize-y"
                                        ></textarea>
                                    </div>

                                    <div className="mb-6">
                                        <label htmlFor="imagen-model-select" className="block text-lg font-medium text-gray-100 mb-2">
                                            Choose Imagen 4.0 Model:
                                        </label>
                                        <select
                                            id="imagen-model-select"
                                            value={selectedImagenModel}
                                            onChange={handleImagenModelSelect}
                                            className="w-full p-3 border border-purple-500 rounded-lg shadow-inner bg-gray-700/50 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                                        >
                                            <option value="standard">Standard</option>
                                            <option value="ultra">Ultra</option>
                                            <option value="fast">Fast</option>
                                        </select>
                                    </div>


                                    <button
                                        onClick={generateImageViaBackend}
                                        disabled={imageGenLoading || !isAuthReady}
                                        className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
                                                   bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg
                                                   hover:from-cyan-500 hover:to-teal-500
                                                   transition-all duration-300 ease-in-out transform hover:-translate-y-1
                                                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
                                    >
                                        {imageGenLoading ? 'Forging Pixels...' : '✨ Generate Image'}
                                    </button>
                                    <div className="mt-6">
                                        <button
                                            onClick={handleClearAll}
                                            className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
                                                       bg-gray-700 shadow-lg border border-gray-600
                                                       hover:bg-gray-600 hover:border-gray-500
                                                       transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                                        >
                                            <i className="fas fa-redo-alt mr-2"></i> Clear All
                                        </button>
                                    </div>
                                    {imageGenLoading && (
                                        <div className="flex flex-col items-center justify-center p-12 bg-gray-700/70 rounded-xl shadow-xl text-cyan-400 mt-8">
                                            <div className="animate-spin-slow border-t-4 border-b-4 border-pink-500 w-16 h-16 rounded-full mb-4"></div>
                                            <p className="text-xl font-semibold animate-pulse">Crafting your masterpiece...</p>
                                        </div>
                                    )}

                                    {generatedImageUrl && (
                                        <div className="mt-8 p-4 bg-gray-800/40 rounded-lg border border-cyan-400/30 shadow-inner flex flex-col items-center">
                                            <h3 className="text-2xl font-bold text-orange-500 mb-4 pb-2 border-b-2 border-orange-500/50 w-full text-center">
                                                Your Creation:
                                            </h3>
                                            <img
                                                src={generatedImageUrl}
                                                alt="Generated by AI"
                                                className="max-w-full h-auto rounded-lg shadow-md border border-gray-600"
                                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x300/FF0000/FFFFFF?text=Image+Load+Error"; }}
                                            />
                                            <p className="text-sm text-gray-400 mt-4 text-center">
                                                Prompt: "{imageGenPrompt}"
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {loading && !isFlipped && (
                        <div className="flex flex-col items-center justify-center p-12 bg-gray-700/70 rounded-xl shadow-xl text-cyan-400">
                            <div className="animate-spin-slow border-t-4 border-b-4 border-pink-500 w-16 h-16 rounded-full mb-4"></div>
                            <p className="text-xl font-semibold animate-pulse">Summoning cosmic wisdom...</p>
                        </div>
                    )}

                    {Object.keys(results).length > 0 && !isFlipped && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {Object.entries(results).map(([key, value]) => {
                                if (key === 'summaries' || key === 'expansions' || key === 'keywords' || key === 'error') {
                                    return null;
                                }
                                const output = value;
                                return (
                                    <div key={key} className="p-6 rounded-lg shadow-xl bg-gray-800/60 border border-cyan-400/20 transform hover:scale-[1.01] transition-transform duration-200">
                                        <h3 className="text-2xl font-bold text-orange-500 mb-4 pb-2 border-b-2 border-orange-500/50">
                                            {key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Says:
                                        </h3>
                                        {output && (output.startsWith('Please enter') || output.startsWith('API Error:') || output.startsWith('Failed to communicate with backend:') || output.startsWith('Error:') || output.startsWith('Model')) ? (
                                            <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {output}</p>
                                        ) : (
                                            <div className="max-h-60 overflow-y-auto p-4 bg-gray-800/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                                                <p className="text-gray-100 text-lg leading-relaxed">
                                                    {output && output.replace(/---/g, '')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {results.summaries && Object.keys(results.summaries).length > 0 && (
                                <>
                                    <h2 className="col-span-full text-3xl font-extrabold text-center text-pink-500 mt-8 mb-4">Summaries</h2>
                                    {Object.entries(results.summaries).map(([modelName, summaryOutput]) => (
                                        <div key={`summary-${modelName}`} className="p-6 rounded-lg shadow-xl bg-gray-800/60 border border-cyan-400/20 transform hover:scale-[1.01] transition-transform duration-200">
                                            <h3 className="text-2xl font-bold text-orange-500 mb-4 pb-2 border-b-2 border-orange-500/50">
                                                {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Summary:
                                            </h3>
                                            {summaryOutput && (summaryOutput.startsWith('Please enter') || summaryOutput.startsWith('API Error:') || summaryOutput.startsWith('Failed to communicate with backend:') || summaryOutput.startsWith('Error:') || summaryOutput.startsWith('Model')) ? (
                                                <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {summaryOutput}</p>
                                            ) : (
                                                <div className="max-h-60 overflow-y-auto p-4 bg-gray-800/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                                                    <p className="text-gray-100 text-lg leading-relaxed">
                                                        {summaryOutput && summaryOutput.replace(/---/g, '')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}

                            {results.expansions && Object.keys(results.expansions).length > 0 && (
                                <>
                                    <h2 className="col-span-full text-3xl font-extrabold text-center text-pink-500 mt-8 mb-4">Expansions</h2>
                                    {Object.entries(results.expansions).map(([modelName, expandedOutput]) => (
                                        <div key={`expansion-${modelName}`} className="p-6 rounded-lg shadow-xl bg-gray-800/60 border border-cyan-400/20 transform hover:scale-[1.01] transition-transform duration-200">
                                            <h3 className="text-2xl font-bold text-orange-500 mb-4 pb-2 border-b-2 border-orange-500/50">
                                                {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Expanded:
                                            </h3>
                                            {expandedOutput && (expandedOutput.startsWith('Please enter') || expandedOutput.startsWith('API Error:') || expandedOutput.startsWith('Failed to communicate with backend:') || expandedOutput.startsWith('Error:') || expandedOutput.startsWith('Model')) ? (
                                                <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {expandedOutput}</p>
                                            ) : (
                                                <div className="max-h-60 overflow-y-auto p-4 bg-gray-800/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                                                    <p className="text-gray-100 text-lg leading-relaxed">
                                                        {expandedOutput && expandedOutput.replace(/---/g, '')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}

                            {results.keywords && Object.keys(results.keywords).length > 0 && (
                                <>
                                    <h2 className="col-span-full text-3xl font-extrabold text-center text-pink-500 mt-8 mb-4">Keywords</h2>
                                    {Object.entries(results.keywords).map(([modelName, keywordsOutput]) => (
                                        <div key={`keywords-${modelName}`} className="p-6 rounded-lg shadow-xl bg-gray-800/60 border border-cyan-400/20 transform hover:scale-[1.01] transition-transform duration-200">
                                            <h3 className="text-2xl font-bold text-orange-500 mb-4 pb-2 border-b-2 border-orange-500/50">
                                                {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Keywords:
                                            </h3>
                                            {keywordsOutput && (keywordsOutput.startsWith('Please enter') || keywordsOutput.startsWith('API Error:') || keywordsOutput.startsWith('Failed to communicate with backend:') || keywordsOutput.startsWith('Error:') || keywordsOutput.startsWith('Model')) ? (
                                                <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {keywordsOutput}</p>
                                            ) : (
                                                <div className="max-h-60 overflow-y-auto p-4 bg-gray-800/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                                                    <p className="text-gray-100 text-lg leading-relaxed">
                                                        {keywordsOutput && keywordsOutput.replace(/---/g, '')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}

                            {results.error && (
                                <div className="col-span-full p-6 rounded-lg shadow-xl bg-red-900/40 border border-red-700 text-red-300 font-medium text-center">
                                    <p>Application Error: {results.error}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-12">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-pink-500 mb-8 tracking-wide drop-shadow-lg">
                            AI Generation History
                        </h2>
                        {!isAuthReady ? (
                            <p className="text-center text-lg text-gray-400">Loading history...</p>
                        ) : history.length === 0 ? (
                            <p className="text-center text-lg text-gray-400">No history yet. Start generating!</p>
                        ) : (
                            <div className="space-y-6">
                                {history.map((entry) => (
                                    <div key={entry.id} className="p-6 bg-gray-800/60 rounded-xl shadow-lg border border-orange-500/20">
                                        <div className="flex justify-between items-center mb-4 border-b-2 border-orange-500/50 pb-2">
                                            <h3 className="text-xl font-bold text-cyan-400">
                                                {entry.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </h3>
                                            <span className="text-sm text-gray-400">
                                                {entry.timestamp ? new Date(entry.timestamp.toDate()).toLocaleString() : 'Loading...'}
                                            </span>
                                        </div>
                                        <p className="text-gray-100 mb-4">
                                            <strong className="text-purple-600">Prompt:</strong> {entry.prompt}
                                        </p>
                                        {entry.generatedImageUrl ? (
                                            entry.generatedImageUrl === IMAGE_TOO_LARGE_PLACEHOLDER ? (
                                                <div className="flex flex-col items-center mt-4 p-3 bg-gray-700/30 rounded-md text-yellow-300 border border-yellow-700">
                                                    <i className="fas fa-exclamation-triangle mr-2 text-xl mb-2"></i>
                                                    <p className="text-center">Generated image data was too large to be stored in history.</p>
                                                    <p className="text-sm text-gray-400">Re-generate this image to see it again.</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center mt-4">
                                                    <h4 className="text-lg font-semibold text-orange-500 mb-2">Generated Image:</h4>
                                                    <img
                                                        src={entry.generatedImageUrl}
                                                        alt="Generated from history"
                                                        className="max-w-full h-auto rounded-lg shadow-md border border-gray-600"
                                                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/200x150/FF0000/FFFFFF?text=Image+Error"; }}
                                                    />
                                                </div>
                                            )
                                        ) : (
                                            <div className="mt-4">
                                                <h4 className="text-lg font-semibold text-orange-500 mb-2">Results:</h4>
                                                <div className="max-h-48 overflow-y-auto p-3 bg-gray-800/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                                                    <p className="text-gray-100 text-lg leading-relaxed">
                                                        {entry.results && Object.entries(entry.results).map(([model, output]) => (
                                                            <div key={model} className="mb-2">
                                                                <strong className="text-pink-500">{model.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {output}
                                                            </div>
                                                        ))}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
