
    
    import React, { useState } from 'react';
// Removed all Firebase imports

function App() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({});
    const [selectedModels, setSelectedModels] = useState({
        'gemini-2.5-flash': true, // Directly implementable with current API
        'gemini-2.5-pro': true, // Now active
        'gemini-1.5-flash': true // Placeholder for future integration
    });

    // Define your backend URL.
    // In development, this will be http://localhost:3001 (or whatever port your backend runs on).
    // In production, this will be the URL of your deployed backend service.
    const BACKEND_BASE_URL = 'http://localhost:3001'; // IMPORTANT: Match your backend server's port


    /**
     * Handles changes to the prompt input textarea.
     * @param {Object} e - The event object from the textarea.
     */
    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    /**
     * Toggles the selection state of a given model.
     * @param {string} modelName - The name of the model to toggle.
     */
    const handleModelToggle = (modelName) => {
        setSelectedModels(prev => ({
            ...prev,
            [modelName]: !prev[modelName]
        }));
    };

    /**
     * Generic function to call your backend API.
     * @param {string} endpoint - The backend endpoint (e.g., '/generate-responses', '/summarize').
     * @param {Object} payload - The data to send to the backend.
     * @returns {Promise<Object>} The JSON response from the backend.
     */
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


    /**
     * Runs the prompt against the selected models via the backend.
     * Makes API calls and updates the results state.
     */
    const runPrompt = async () => {
        if (!prompt.trim()) {
            setResults({ error: 'Please enter a prompt.' });
            return;
        }

        setLoading(true);
        setResults({}); // Clear previous results

        try {
            const data = await callBackendApi('/generate-responses', { prompt, selectedModels });
            setResults(data); // Backend directly returns the map of model outputs
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Summarizes the current prompt using Gemini 2.5 Flash via the backend.
     */
    const summarizeText = async () => {
        if (!prompt.trim()) {
            setResults({ error: 'Please enter text to summarize.' });
            return;
        }
        setLoading(true);
        setResults({});
        try {
            const data = await callBackendApi('/summarize', { prompt });
            setResults({ 'Gemini API - Summary': data.summary });
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Expands on the current prompt using Gemini 2.5 Flash via the backend.
     */
    const expandText = async () => {
        if (!prompt.trim()) {
            setResults({ error: 'Please enter text to expand.' });
            return;
        }
        setLoading(true);
        setResults({});
        try {
            const data = await callBackendApi('/expand', { prompt });
            setResults({ 'Gemini API - Expanded Text': data.expandedText });
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Extracts keywords from the current prompt using Gemini 2.5 Flash via the backend.
     */
    const extractKeywords = async () => {
        if (!prompt.trim()) {
            setResults({ error: 'Please enter text to extract keywords from.' });
            return;
        }
        setLoading(true);
        setResults({});
        try {
            const data = await callBackendApi('/extract-keywords', { prompt });
            setResults({ 'Gemini API - Keywords': data.keywords });
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8">
            {/* Main container wrapper for responsive centering */}
            <div className="container">
                <h1>Multi-Model Prompt Runner</h1>

                <div className="input-group">
                    <label htmlFor="prompt-input">
                        Enter your prompt:
                    </label>
                    <textarea
                        id="prompt-input"
                        placeholder="e.g., Explain quantum entanglement in simple terms."
                        value={prompt}
                        onChange={handlePromptChange}
                    ></textarea>
                </div>

                <div className="model-selection">
                    <label>
                        Select Models:
                    </label>
                    <div className="model-options">
                        {Object.keys(selectedModels).map(modelName => (
                            <div key={modelName} className="model-option">
                                <input
                                    type="checkbox"
                                    id={modelName}
                                    checked={selectedModels[modelName]}
                                    onChange={() => handleModelToggle(modelName)}
                                />
                                <label htmlFor={modelName}>
                                    {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    {modelName === 'gemini-2.5-flash' && ' (Active)'}
                                    {modelName === 'gemini-2.5-pro' && ' (Active)'} {/* Label as active */}
                                    {modelName === 'gemini-1.5-flash' && ' (Active)'}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="button-grid">
                    <button
                        onClick={runPrompt}
                        disabled={loading}
                        className="btn btn-blue"
                    >
                        {loading ? 'Running...' : 'Run Prompt'}
                    </button>
                    <button
                        onClick={summarizeText}
                        disabled={loading}
                        className="btn btn-green"
                    >
                        {loading ? 'Summarizing...' : '✨ Summarize Text'}
                    </button>
                    <button
                        onClick={expandText}
                        disabled={loading}
                        className="btn btn-purple"
                    >
                        {loading ? 'Expanding...' : '✨ Expand Text'}
                    </button>
                    <button
                        onClick={extractKeywords}
                        disabled={loading}
                        className="btn btn-yellow"
                    >
                        {loading ? 'Extracting...' : '✨ Extract Keywords'}
                    </button>
                </div>

                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p className="loading-text">Generating responses...</p>
                    </div>
                )}

                {/* Display Results */}
                {Object.keys(results).length > 0 && (
                    <div className="results-grid">
                        {Object.entries(results).map(([modelName, output]) => (
                            <div key={modelName} className="result-card">
                                <h3>
                                    {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Output:
                                </h3>
                                {output.startsWith('Please enter a prompt.') || output.startsWith('API Key not configured.') || output.startsWith('API Error:') || output.startsWith('Failed to communicate with backend:') ? (
                                    <p className="error-message">{output}</p>
                                ) : (
                                    <div className="result-content">
                                        <p>{output}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;