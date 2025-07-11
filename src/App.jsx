


    // import React, { useState, useEffect } from 'react';
    // // Removed all Firebase imports

    // function App() {
    //     const [prompt, setPrompt] = useState('');
    //     const [loading, setLoading] = useState(false);
    //     const [results, setResults] = useState({});
    //     const [selectedModels, setSelectedModels] = useState({
    //         'gemini-2.5-flash-preview-04-17': true, // Directly implementable with current API
    //         'gemini-pro': false, // Placeholder for future integration
    //         'other-gemini-model': false // Placeholder for future integration
    //     });
    //     // Removed authReady state
    //     // Removed userId state

    //     // Removed Firebase Init and Auth Listener useEffect

    //     /**
    //      * Handles changes to the prompt input textarea.
    //      * @param {Object} e - The event object from the textarea.
    //      */
    //     const handlePromptChange = (e) => {
    //         setPrompt(e.target.value);
    //     };

    //     /**
    //      * Toggles the selection state of a given model.
    //      * @param {string} modelName - The name of the model to toggle.
    //      */
    //     const handleModelToggle = (modelName) => {
    //         setSelectedModels(prev => ({
    //             ...prev,
    //             [modelName]: !prev[modelName]
    //         }));
    //     };

    //     /**
    //      * Generic function to call the Gemini API.
    //      * @param {string} model - The model to use (e.g., 'gemini-2.5-flash-preview-04-17').
    //      * @param {string} textPrompt - The prompt text for the LLM.
    //      * @returns {Promise<string>} The generated text or an error message.
    //      */
    //     const callGeminiApi = async (model, textPrompt) => {
    //         const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    //         if (!apiKey) {
    //             return 'API Key not configured. Please set VITE_GEMINI_API_KEY in your .env file.';
    //         }

    //         try {
    //             const chatHistory = [{ role: "user", parts: [{ text: textPrompt }] }];
    //             const payload = { contents: chatHistory };
    //             const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    //             const response = await fetch(apiUrl, {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify(payload)
    //             });
    //             const result = await response.json();

    //             if (result.candidates && result.candidates.length > 0 &&
    //                 result.candidates[0].content && result.candidates[0].content.parts &&
    //                 result.candidates[0].content.parts.length > 0) {
    //                 return result.candidates[0].content.parts[0].text;
    //             } else {
    //                 console.error(`Gemini API response error for ${model}:`, result);
    //                 return 'No response or unexpected format.';
    //             }
    //         } catch (error) {
    //             console.error(`Error calling Gemini API for ${model}:`, error);
    //             return `Error: ${error.message}`;
    //         }
    //     };


    //     /**
    //      * Runs the prompt against the selected models.
    //      * Makes API calls and updates the results state.
    //      */
    //     const runPrompt = async () => {
    //         if (!prompt.trim()) {
    //             setResults({ error: 'Please enter a prompt.' });
    //             return;
    //         }

    //         // Removed authReady check

    //         setLoading(true);
    //         setResults({}); // Clear previous results

    //         const newResults = {};

    //         // Model: Gemini 2.5 Flash
    //         if (selectedModels['gemini-2.5-flash-preview-04-17']) {
    //             const output = await callGeminiApi('gemini-2.5-flash-preview-04-17', prompt);
    //             newResults['gemini-2.5-flash-preview-04-17'] = output;
    //         }

    //         // Placeholder for Gemini Pro
    //         if (selectedModels['gemini-pro']) {
    //             newResults['gemini-pro'] = 'Gemini Pro API integration not yet available in this demo. (Requires specific API endpoint/SDK)';
    //         }

    //         // Placeholder for Other Gemini Model
    //         if (selectedModels['other-gemini-model']) {
    //             newResults['other-gemini-model'] = 'Other Gemini Model API integration not yet available in this demo. (Requires specific API endpoint/SDK)';
    //         }

    //         setResults(newResults);
    //         setLoading(false);
    //     };

    //     /**
    //      * Summarizes the current prompt using Gemini 2.5 Flash.
    //      */
    //     const summarizeText = async () => {
    //         if (!prompt.trim()) {
    //             setResults({ error: 'Please enter text to summarize.' });
    //             return;
    //         }
    //         setLoading(true);
    //         setResults({});
    //         const promptForSummary = `Summarize the following text concisely and accurately:\n\n${prompt}`;
    //         const output = await callGeminiApi('gemini-2.5-flash-preview-04-17', promptForSummary);
    //         setResults({ 'Gemini API - Summary': output });
    //         setLoading(false);
    //     };

    //     /**
    //      * Expands on the current prompt using Gemini 2.5 Flash.
    //      */
    //     const expandText = async () => {
    //         if (!prompt.trim()) {
    //             setResults({ error: 'Please enter text to expand.' });
    //             return;
    //         }
    //         setLoading(true);
    //         setResults({});
    //         const promptForExpansion = `Continue writing the following text, expanding on the ideas present. Make it at least 200 words long and maintain the original style and tone:\n\n${prompt}`;
    //         const output = await callGeminiApi('gemini-2.5-flash-preview-04-17', promptForExpansion);
    //         setResults({ 'Gemini API - Expanded Text': output });
    //         setLoading(false);
    //     };

    //     /**
    //      * Extracts keywords from the current prompt using Gemini 2.5 Flash.
    //      */
    //     const extractKeywords = async () => {
    //         if (!prompt.trim()) {
    //             setResults({ error: 'Please enter text to extract keywords from.' });
    //             return;
    //         }
    //         setLoading(true);
    //         setResults({});
    //         const promptForKeywords = `Extract the most important keywords and phrases from the following text. List them as comma-separated values, without additional sentences or explanations:\n\n${prompt}`;
    //         const output = await callGeminiApi('gemini-2.5-flash-preview-04-17', promptForKeywords);
    //         setResults({ 'Gemini API - Keywords': output });
    //         setLoading(false);
    //     };


    //     return (
    //         <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8">
    //             {/* Main container wrapper for responsive centering */}
    //             <div className="container">
    //                 <h1>Multi-Model Prompt Runner</h1>

    //                 {/* Removed User ID display */}

    //                 <div className="input-group">
    //                     <label htmlFor="prompt-input">
    //                         Enter your prompt:
    //                     </label>
    //                     <textarea
    //                         id="prompt-input"
    //                         placeholder="e.g., Explain quantum entanglement in simple terms."
    //                         value={prompt}
    //                         onChange={handlePromptChange}
    //                     ></textarea>
    //                 </div>

    //                 <div className="model-selection">
    //                     <label>
    //                         Select Models:
    //                     </label>
    //                     <div className="model-options">
    //                         {Object.keys(selectedModels).map(modelName => (
    //                             <div key={modelName} className="model-option">
    //                                 <input
    //                                     type="checkbox"
    //                                     id={modelName}
    //                                     checked={selectedModels[modelName]}
    //                                     onChange={() => handleModelToggle(modelName)}
    //                                 />
    //                                 <label htmlFor={modelName}>
    //                                     {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    //                                     {modelName === 'gemini-2.5-flash-preview-04-17' && ' (Active)'}
    //                                     {(modelName === 'gemini-pro' || modelName === 'other-gemini-model') && ' (Placeholder)'}
    //                                 </label>
    //                             </div>
    //                         ))}
    //                     </div>
    //                 </div>

    //                 <div className="button-grid">
    //                     <button
    //                         onClick={runPrompt}
    //                         disabled={loading} // authReady check removed
    //                         className="btn btn-blue"
    //                     >
    //                         {loading ? 'Running...' : 'Run Prompt'}
    //                     </button>
    //                     <button
    //                         onClick={summarizeText}
    //                         disabled={loading} // authReady check removed
    //                         className="btn btn-green"
    //                     >
    //                         {loading ? 'Summarizing...' : '✨ Summarize Text'}
    //                     </button>
    //                     <button
    //                         onClick={expandText}
    //                         disabled={loading} // authReady check removed
    //                         className="btn btn-purple"
    //                     >
    //                         {loading ? 'Expanding...' : '✨ Expand Text'}
    //                     </button>
    //                     <button
    //                         onClick={extractKeywords}
    //                         disabled={loading} // authReady check removed
    //                         className="btn btn-yellow"
    //                     >
    //                         {loading ? 'Extracting...' : '✨ Extract Keywords'}
    //                     </button>
    //                 </div>


    //                 {loading && (
    //                     <div className="loading-container">
    //                         <div className="spinner"></div>
    //                         <p className="loading-text">Generating responses...</p>
    //                     </div>
    //                 )}

    //                 {/* Display Results */}
    //                 {Object.keys(results).length > 0 && (
    //                     <div className="results-grid">
    //                         {Object.entries(results).map(([modelName, output]) => (
    //                             <div key={modelName} className="result-card">
    //                                 <h3>
    //                                     {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Output:
    //                                 </h3>
    //                                 {output.startsWith('Please enter a prompt.') || output.startsWith('API Key not configured.') ? ( // Removed authReady check from error display
    //                                     <p className="error-message">{output}</p>
    //                                 ) : (
    //                                     <div className="result-content">
    //                                         <p>{output}</p>
    //                                     </div>
    //                                 )}
    //                             </div>
    //                         ))}
    //                     </div>
    //                 )}
    //             </div>
    //         </div>
    //     );
    // }

    // export default App;
    

        import React, { useState, useEffect } from 'react';
    // Removed all Firebase imports

    function App() {
        const [prompt, setPrompt] = useState('');
        const [loading, setLoading] = useState(false);
        const [results, setResults] = useState({});
        const [selectedModels, setSelectedModels] = useState({
            'gemini-2.5-flash-preview-04-17': true, // Directly implementable with current API
            'gemini-pro': false, // Now active
            'other-gemini-model': false // Placeholder for future integration
        });

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
         * Generic function to call the Gemini API.
         * @param {string} model - The model to use (e.g., 'gemini-2.5-flash-preview-04-17', 'gemini-pro').
         * @param {string} textPrompt - The prompt text for the LLM.
         * @returns {Promise<string>} The generated text or an error message.
         */
        const callGeminiApi = async (model, textPrompt) => {
            // Use the single Gemini API key for all Gemini models
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                return 'API Key not configured. Please set VITE_GEMINI_API_KEY in your .env file.';
            }

            try {
                const chatHistory = [{ role: "user", parts: [{ text: textPrompt }] }];
                const payload = { contents: chatHistory };
                // Construct the API URL using the provided model name
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    return result.candidates[0].content.parts[0].text;
                } else {
                    console.error(`Gemini API response error for ${model}:`, result);
                    // Provide a more informative error if possible
                    if (result.error && result.error.message) {
                        return `API Error: ${result.error.message}`;
                    }
                    return 'No response or unexpected format.';
                }
            } catch (error) {
                console.error(`Error calling Gemini API for ${model}:`, error);
                return `Error: ${error.message}`;
            }
        };


        /**
         * Runs the prompt against the selected models.
         * Makes API calls and updates the results state.
         */
        const runPrompt = async () => {
            if (!prompt.trim()) {
                setResults({ error: 'Please enter a prompt.' });
                return;
            }

            setLoading(true);
            setResults({}); // Clear previous results

            const newResults = {};
            const promises = [];

            // Model: Gemini 2.5 Flash
            if (selectedModels['gemini-2.5-flash-preview-04-17']) {
                promises.push(
                    callGeminiApi('gemini-2.5-flash-preview-04-17', prompt)
                        .then(output => newResults['gemini-2.5-flash-preview-04-17'] = output)
                );
            }

            // Model: Gemini Pro (now active)
            if (selectedModels['gemini-pro']) {
                promises.push(
                    callGeminiApi('gemini-pro', prompt) // Call API with 'gemini-pro' model string
                        .then(output => newResults['gemini-pro'] = output)
                );
            }

            // Placeholder for Other Gemini Model
            if (selectedModels['other-gemini-model']) {
                // If you have another specific Gemini model like 'gemini-some-other-version',
                // you would replace the string below with its actual model identifier.
                // For now, it remains a placeholder.
                newResults['other-gemini-model'] = 'Other Gemini Model API integration not yet available in this demo. (Requires specific API endpoint/SDK)';
            }

            // Wait for all selected API calls to complete
            await Promise.allSettled(promises);

            setResults(newResults);
            setLoading(false);
        };

        /**
         * Summarizes the current prompt using Gemini 2.5 Flash.
         */
        const summarizeText = async () => {
            if (!prompt.trim()) {
                setResults({ error: 'Please enter text to summarize.' });
                return;
            }
            setLoading(true);
            setResults({});
            const promptForSummary = `Summarize the following text concisely and accurately:\n\n${prompt}`;
            const output = await callGeminiApi('gemini-2.5-flash-preview-04-17', promptForSummary);
            setResults({ 'Gemini API - Summary': output });
            setLoading(false);
        };

        /**
         * Expands on the current prompt using Gemini 2.5 Flash.
         */
        const expandText = async () => {
            if (!prompt.trim()) {
                setResults({ error: 'Please enter text to expand.' });
                return;
            }
            setLoading(true);
            setResults({});
            const promptForExpansion = `Continue writing the following text, expanding on the ideas present. Make it at least 200 words long and maintain the original style and tone:\n\n${prompt}`;
            const output = await callGeminiApi('gemini-2.5-flash-preview-04-17', promptForExpansion);
            setResults({ 'Gemini API - Expanded Text': output });
            setLoading(false);
        };

        /**
         * Extracts keywords from the current prompt using Gemini 2.5 Flash.
         */
        const extractKeywords = async () => {
            if (!prompt.trim()) {
                setResults({ error: 'Please enter text to extract keywords from.' });
                return;
            }
            setLoading(true);
            setResults({});
            const promptForKeywords = `Extract the most important keywords and phrases from the following text. List them as comma-separated values, without additional sentences or explanations:\n\n${prompt}`;
            const output = await callGeminiApi('gemini-2.5-flash-preview-04-17', promptForKeywords);
            setResults({ 'Gemini API - Keywords': output });
            setLoading(false);
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
                                        {modelName === 'gemini-2.5-flash-preview-04-17' && ' (Active)'}
                                        {modelName === 'gemini-pro' && ' (Active)'} {/* Label as active */}
                                        {modelName === 'other-gemini-model' && ' (Placeholder)'}
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
                                    {output.startsWith('Please enter a prompt.') || output.startsWith('API Key not configured.') || output.startsWith('API Error:') ? (
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
    