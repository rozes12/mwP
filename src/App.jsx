

import React, { useState } from 'react';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({});
    const [selectedImage, setSelectedImage] = useState(null); // Stores the File object for text/vision models
    const [imageData, setImageData] = useState(null);   // Base64 for text/vision models

    // State for the image generation feature
    const [isFlipped, setIsFlipped] = useState(false); // Controls the flip state of the container
    const [imageGenPrompt, setImageGenPrompt] = useState(''); // Prompt for image generation
    const [generatedImageUrl, setGeneratedImageUrl] = useState(null); // Stores the base64 image URL
    const [imageGenLoading, setImageGenLoading] = useState(false); // Loading state for image generation
    const [selectedImagenModel, setSelectedImagenModel] = useState('standard'); // Default Imagen 4.0 model type

    const [selectedModels, setSelectedModels] = useState({
        'gemini-2.5-flash': true,
        'gemini-2.5-pro': true,
        'gemini-1.5-flash': true,
    });

    const BACKEND_BASE_URL = 'https://minwebback-343717256329.us-central1.run.app';

    // Handler for text prompt changes
    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    // Handler for image generation prompt changes
    const handleImageGenPromptChange = (e) => {
        setImageGenPrompt(e.target.value);
    };

    // Handler to toggle selected AI models
    const handleModelToggle = (modelName) => {
        setSelectedModels(prev => ({
            ...prev,
            [modelName]: !prev[modelName]
        }));
    };

    // Handler for selecting Imagen 4.0 model type
    const handleImagenModelSelect = (e) => {
        setSelectedImagenModel(e.target.value);
    };

    // Handler for uploading images for text/vision models
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

    // Handler to clear all inputs and results
    const handleClearAll = () => {
        setPrompt('');
        setResults({});
        setSelectedImage(null);
        setImageData(null);
        setImageGenPrompt(''); // Clear image generation prompt
        setGeneratedImageUrl(null); // Clear generated image
        setImageGenLoading(false); // Reset image generation loading state
    };

    // Function to toggle the flip state of the container
    const toggleFlip = () => {
        setIsFlipped(prev => !prev);
        handleClearAll(); // Clear states when flipping to a new mode for a clean start
    };

    // Generic function to call the backend API (for text/vision models)
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

    // Function to run the general prompt with selected text/vision models
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
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Function to summarize text
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
            const data = await callBackendApi('/summarize', { prompt, selectedModels });
            setResults({ summaries: data });
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Function to expand text
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
            const data = await callBackendApi('/expand', { prompt, selectedModels });
            setResults({ expansions: data });
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Function to extract keywords
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
            const data = await callBackendApi('/extract-keywords', { prompt, selectedModels });
            setResults({ keywords: data });
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    // UPDATED: Function to generate an image using the Imagen 4.0 model via backend
    const generateImageViaBackend = async () => {
        if (!imageGenPrompt.trim()) {
            setResults({ error: 'Please enter a prompt for image generation.' });
            return;
        }

        setImageGenLoading(true);
        setGeneratedImageUrl(null); // Clear previous image
        setResults({}); // Clear general text results

        try {
            const data = await callBackendApi('/generate-image', {
                prompt: imageGenPrompt,
                modelType: selectedImagenModel // Send selected model type to backend
            });
            setGeneratedImageUrl(data.imageUrl); // Backend now returns { imageUrl: base64string }
        } catch (error) {
            console.error('Error during image generation (frontend):', error);
            setResults({ error: `Image generation failed: ${error.message}. Check backend logs.` });
        } finally {
            setImageGenLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8
                        bg-retro-swirl-animated bg-repeat bg-fixed bg-cover
                        text-light-text font-sans overflow-x-hidden">
            <div className="max-w-4xl w-full space-y-8 p-6 bg-dark-background/80 backdrop-blur-sm rounded-xl shadow-2xl border border-funky-purple/30 overflow-hidden">

                <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-funky-cyan mb-8 tracking-wide drop-shadow-lg">
                    {isFlipped ? '🖼️ Imagen Generator 🚀' : '✨ Gemini Fun-House AI ✨'}
                </h1>

                {/* Flip Button */}
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

                {/* Flippable Container */}
                {/* <div className={`relative w-full h-auto min-h-[80vh] transition-transform duration-700 ease-in-out preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}> */}
                <div className={`relative w-full h-auto min-h-[300vh] transition-transform duration-700 ease-in-out preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front Side: Text AI Tools */}                    {/* Front Side: Text AI Tools */}
                    <div className={`absolute w-full h-full backface-hidden p-6 md:p-8 bg-dark-background/60 rounded-lg shadow-xl border border-funky-pink/20 ${isFlipped ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}`}>
                        {!isFlipped && (
                            <>
                                <div className="mb-6">
                                    <label htmlFor="prompt-input" className="block text-lg font-medium text-light-text mb-2">
                                        Type your wildest ideas:
                                    </label>
                                    <textarea
                                        id="prompt-input"
                                        rows="6"
                                        placeholder="e.g., Describe a futuristic city powered by sentient plants..."
                                        value={prompt}
                                        onChange={handlePromptChange}
                                        className="w-full p-4 border border-funky-purple-300 rounded-lg shadow-inner bg-dark-background/50 text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-funky-cyan transition-all duration-300 resize-y"
                                    ></textarea>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="image-upload" className="block text-funky-cyan text-lg font-medium mb-2">
                                        Upload Image (Optional for Text AI):
                                    </label>
                                    <input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-light-text
                                                   file:mr-4 file:py-2 file:px-4
                                                   file:rounded-full file:border-0
                                                   file:text-sm file:font-semibold
                                                   file:bg-funky-purple file:text-white
                                                   hover:file:bg-funky-pink hover:file:cursor-pointer
                                                   transition-colors duration-200"
                                    />
                                    {selectedImage && (
                                        <p className="text-sm text-gray-400 mt-2">
                                            Selected: {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
                                        </p>
                                    )}
                                </div>

                                {/* Model Selection */}
                                <div className="mb-8">
                                    <label className="block text-lg font-medium text-light-text mb-3">
                                        Choose your AI companions:
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.keys(selectedModels).map(modelName => (
                                            <div key={modelName} className="flex items-center p-3 rounded-md bg-dark-background/70 border border-funky-orange/20 shadow-sm cursor-pointer hover:bg-dark-background/90 transition-all duration-200">
                                                <input
                                                    type="checkbox"
                                                    id={modelName}
                                                    checked={selectedModels[modelName]}
                                                    onChange={() => handleModelToggle(modelName)}
                                                    className="h-5 w-5 text-funky-cyan rounded border-gray-600 focus:ring-funky-cyan bg-gray-700 cursor-pointer"
                                                />
                                                <label htmlFor={modelName} className="ml-3 block text-base font-medium text-light-text cursor-pointer">
                                                    {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    {selectedModels[modelName] && <span className="ml-1 text-xs text-funky-cyan">(Active)</span>}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Buttons for Text AI */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                    <button
                                        onClick={runPrompt}
                                        disabled={loading}
                                        className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
                                                   bg-gradient-to-r from-funky-purple to-funky-pink shadow-lg
                                                   hover:from-funky-pink hover:to-funky-purple
                                                   transition-all duration-300 ease-in-out transform hover:-translate-y-1
                                                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? 'Summoning AIs...' : 'Unleash Multiverse Thoughts'}
                                    </button>
                                    <button
                                        onClick={summarizeText}
                                        disabled={loading}
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
                                        disabled={loading}
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
                                        disabled={loading}
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
                    <div className={`absolute w-full h-full backface-hidden rotate-y-180 p-6 md:p-8 bg-dark-background/60 rounded-lg shadow-xl border border-funky-pink/20 ${!isFlipped ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}`}>
                        {isFlipped && (
                            <>
                                <div className="mb-6">
                                    <label htmlFor="image-gen-prompt-input" className="block text-lg font-medium text-light-text mb-2">
                                        Describe the image you want to conjure:
                                    </label>
                                    <textarea
                                        id="image-gen-prompt-input"
                                        rows="6"
                                        placeholder="e.g., A surreal landscape where clocks melt into trees, in the style of Salvador Dalí."
                                        value={imageGenPrompt}
                                        onChange={handleImageGenPromptChange}
                                        className="w-full p-4 border border-funky-purple-300 rounded-lg shadow-inner bg-dark-background/50 text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-funky-cyan transition-all duration-300 resize-y"
                                    ></textarea>
                                </div>

                                {/* Imagen Model Selection */}
                                <div className="mb-6">
                                    <label htmlFor="imagen-model-select" className="block text-lg font-medium text-light-text mb-2">
                                        Choose Imagen 4.0 Model:
                                    </label>
                                    <select
                                        id="imagen-model-select"
                                        value={selectedImagenModel}
                                        onChange={handleImagenModelSelect}
                                        className="w-full p-3 border border-funky-purple-300 rounded-lg shadow-inner bg-dark-background/50 text-light-text focus:outline-none focus:ring-2 focus:ring-funky-cyan transition-all duration-300"
                                    >
                                        <option value="standard">Standard</option>
                                        <option value="ultra">Ultra</option>
                                        <option value="fast">Fast</option>
                                    </select>
                                </div>


                                <button
                                    onClick={generateImageViaBackend}
                                    disabled={imageGenLoading}
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
                                {/* Image Generation Loading Indicator */}
                                {imageGenLoading && (
                                    <div className="flex flex-col items-center justify-center p-12 bg-dark-background/70 rounded-xl shadow-xl text-funky-cyan mt-8">
                                        <div className="animate-spin-slow border-t-4 border-b-4 border-funky-pink w-16 h-16 rounded-full mb-4"></div>
                                        <p className="text-xl font-semibold animate-pulse">Crafting your masterpiece...</p>
                                    </div>
                                )}

                                {/* Generated Image Display */}
                                {generatedImageUrl && (
                                    <div className="mt-8 p-4 bg-dark-background/40 rounded-lg border border-funky-cyan/30 shadow-inner flex flex-col items-center">
                                        <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50 w-full text-center">
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

                {/* Loading Indicator (for general text AI) */}
                {loading && !isFlipped && (
                    <div className="flex flex-col items-center justify-center p-12 bg-dark-background/70 rounded-xl shadow-xl text-funky-cyan">
                        <div className="animate-spin-slow border-t-4 border-b-4 border-funky-pink w-16 h-16 rounded-full mb-4"></div>
                        <p className="text-xl font-semibold animate-pulse">Summoning cosmic wisdom...</p>
                    </div>
                )}

                {/* Results Display (for text AI) and general errors */}
                {Object.keys(results).length > 0 && !isFlipped && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {Object.entries(results).map(([key, value]) => {
                            if (key === 'summaries' || key === 'expansions' || key === 'keywords' || key === 'error') {
                                return null;
                            }
                            const output = value;
                            return (
                                <div key={key} className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20 transform hover:scale-[1.01] transition-transform duration-200">
                                    <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
                                        {key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Says:
                                    </h3>
                                    {output && (output.startsWith('Please enter') || output.startsWith('API Error:') || output.startsWith('Failed to communicate with backend:') || output.startsWith('Error:') || output.startsWith('Model')) ? (
                                        <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {output}</p>
                                    ) : (
                                        <div className="max-h-60 overflow-y-auto p-4 bg-dark-background/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                                            <p className="text-light-text text-lg leading-relaxed">
                                                {output && output.replace(/---/g, '')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Display for Summaries */}
                        {results.summaries && Object.keys(results.summaries).length > 0 && (
                            <>
                                <h2 className="col-span-full text-3xl font-extrabold text-center text-funky-pink mt-8 mb-4">Summaries</h2>
                                {Object.entries(results.summaries).map(([modelName, summaryOutput]) => (
                                    <div key={`summary-${modelName}`} className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20 transform hover:scale-[1.01] transition-transform duration-200">
                                        <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
                                            {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Summary:
                                        </h3>
                                        {summaryOutput && (summaryOutput.startsWith('Please enter') || summaryOutput.startsWith('API Error:') || summaryOutput.startsWith('Failed to communicate with backend:') || summaryOutput.startsWith('Error:') || summaryOutput.startsWith('Model')) ? (
                                            <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {summaryOutput}</p>
                                        ) : (
                                            <div className="max-h-60 overflow-y-auto p-4 bg-dark-background/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                                                <p className="text-light-text text-lg leading-relaxed">
                                                    {summaryOutput && summaryOutput.replace(/---/g, '')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Display for Expansions */}
                        {results.expansions && Object.keys(results.expansions).length > 0 && (
                            <>
                                <h2 className="col-span-full text-3xl font-extrabold text-center text-funky-pink mt-8 mb-4">Expansions</h2>
                                {Object.entries(results.expansions).map(([modelName, expandedOutput]) => (
                                    <div key={`expansion-${modelName}`} className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20 transform hover:scale-[1.01] transition-transform duration-200">
                                        <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
                                            {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Expanded:
                                        </h3>
                                        {expandedOutput && (expandedOutput.startsWith('Please enter') || expandedOutput.startsWith('API Error:') || expandedOutput.startsWith('Failed to communicate with backend:') || expandedOutput.startsWith('Error:') || expandedOutput.startsWith('Model')) ? (
                                            <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {expandedOutput}</p>
                                        ) : (
                                            <div className="max-h-60 overflow-y-auto p-4 bg-dark-background/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                                                <p className="text-light-text text-lg leading-relaxed">
                                                    {expandedOutput && expandedOutput.replace(/---/g, '')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Display for Keywords */}
                        {results.keywords && Object.keys(results.keywords).length > 0 && (
                            <>
                                <h2 className="col-span-full text-3xl font-extrabold text-center text-funky-pink mt-8 mb-4">Keywords</h2>
                                {Object.entries(results.keywords).map(([modelName, keywordsOutput]) => (
                                    <div key={`keywords-${modelName}`} className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20 transform hover:scale-[1.01] transition-transform duration-200">
                                        <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
                                            {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Keywords:
                                        </h3>
                                        {keywordsOutput && (keywordsOutput.startsWith('Please enter') || keywordsOutput.startsWith('API Error:') || keywordsOutput.startsWith('Failed to communicate with backend:') || keywordsOutput.startsWith('Error:') || keywordsOutput.startsWith('Model')) ? (
                                            <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {keywordsOutput}</p>
                                        ) : (
                                            <div className="max-h-60 overflow-y-auto p-4 bg-dark-background/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                                                <p className="text-light-text text-lg leading-relaxed">
                                                    {keywordsOutput && keywordsOutput.replace(/---/g, '')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {results.error && ( // Display a general error message if one exists
                            <div className="col-span-full p-6 rounded-lg shadow-xl bg-red-900/40 border border-red-700 text-red-300 font-medium text-center">
                                <p>Application Error: {results.error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
