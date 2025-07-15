// // frontend/src/App.js
// import React, { useState } from 'react';
// import './index.css'; // Or './App.css', depending on where your Tailwind directives are
// import '@fortawesome/fontawesome-free/css/all.min.css';

// function App() {
//     const [prompt, setPrompt] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [results, setResults] = useState({});
//     const [selectedImage, setSelectedImage] = useState(null); // Stores the File object
//     const [imageData, setImageData] = useState(null);   

//     const [selectedModels, setSelectedModels] = useState({
//         'gemini-2.5-flash': true,
//         'gemini-2.5-pro': true,
//         'gemini-1.5-flash': true,
        
//     });

//     const BACKEND_BASE_URL = 'https://minwebback-343717256329.us-central1.run.app';
    
//     const handlePromptChange = (e) => {
//         setPrompt(e.target.value);
//     };

//     const handleModelToggle = (modelName) => {
//         setSelectedModels(prev => ({
//             ...prev,
//             [modelName]: !prev[modelName]
//         }));
//     };

//     const handleImageChange = (event) => {
//         const file = event.target.files[0]; // Get the first selected file
//         if (file) {
//             setSelectedImage(file); // Store the File object
//             const reader = new FileReader(); // Create a FileReader instance
//             reader.onloadend = () => {
//                 // When the file is read, its result (Base64 string) is set to imageData state
//                 setImageData(reader.result);
//             };
//             reader.readAsDataURL(file); // Read the file as a Data URL (Base64)
//         } else {
//             // If no file is selected or cleared
//             setSelectedImage(null);
//             setImageData(null);
//         }
//     };

//     const handleClearAll = () => {
//         setPrompt('');           // Clear the text prompt
//         setResults({});          // Clear all AI results
//         setSelectedImage(null);  // Clear selected image file
//         setImageData(null);      // Clear image Base64 data

//     };

//     const callBackendApi = async (endpoint, payload) => {
//         try {
//             const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || `Backend HTTP error! Status: ${response.status}`);
//             }
//             return await response.json();
//         } catch (error) {
//             console.error(`Error calling backend endpoint ${endpoint}:`, error);
//             throw new Error(`Failed to communicate with backend: ${error.message}`);
//         }
//     };

//     const runPrompt = async () => {
//         if (!prompt.trim()) {
//             setResults({ error: 'Please enter a prompt.' });
//             return;
//         }

//         setLoading(true);
//         setResults({});

//         try {
//             const data = await callBackendApi('/generate-responses', { prompt, selectedModels, imageData });
//             setResults(data);
//         } catch (error) {
//             setResults({ error: error.message });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const summarizeText = async () => {
//     if (!prompt.trim()) {
//         setResults({ error: 'Please enter text to summarize.' });
//         return;
//     }
//     // Check if at least one model is selected in the 'selectedModels' object
//     if (Object.values(selectedModels).every(selected => !selected)) {
//         setResults({ error: 'Please select at least one model for summarization.' });
//         return;
//     }

//     setLoading(true);
//     setResults({}); // Clear previous results before setting new ones

//     try {
//         const data = await callBackendApi('/summarize', { prompt, selectedModels });
//         // Store the summaries under a specific key, e.g., 'summaries'
//         setResults({ summaries: data }); // 'data' is already the object { model1: summary1, model2: summary2 }
//     } catch (error) {
//         setResults({ error: error.message });
//     } finally {
//         setLoading(false);
//     }
// };

// const expandText = async () => {
//     if (!prompt.trim()) {
//         setResults({ error: 'Please enter text to expand.' });
//         return;
//     }
//     if (Object.values(selectedModels).every(selected => !selected)) {
//         setResults({ error: 'Please select at least one model for expansion.' });
//         return;
//     }

//     setLoading(true);
//     setResults({});

//     try {
//         const data = await callBackendApi('/expand', { prompt, selectedModels }); // Pass selectedModels here too
//         // Store expansions under 'expansions' key
//         setResults({ expansions: data }); // 'data' is already the object { model1: expandedText1, ... }
//     } catch (error) {
//         setResults({ error: error.message });
//     } finally {
//         setLoading(false);
//     }
// };

// const extractKeywords = async () => {
//     if (!prompt.trim()) {
//         setResults({ error: 'Please enter text to extract keywords from.' });
//         return;
//     }
//     if (Object.values(selectedModels).every(selected => !selected)) {
//         setResults({ error: 'Please select at least one model for keyword extraction.' });
//         return;
//     }

//     setLoading(true);
//     setResults({});

//     try {
//         const data = await callBackendApi('/extract-keywords', { prompt, selectedModels, imageData }); // Pass selectedModels here too
//         // Store keywords under 'keywords' key
//         setResults({ keywords: data }); // 'data' is already the object { model1: keywords1, ... }
//     } catch (error) {
//         setResults({ error: error.message });
//     } finally {
//         setLoading(false);
//     }
// };

//     return (
//         // MAIN APP CONTAINER WITH ANIMATED RETRO SWIRL BACKGROUND
//         <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8
//                         bg-retro-swirl-animated bg-repeat bg-fixed bg-cover
//                         text-light-text font-sans">
//             {/* Content Wrapper */}
//             <div className="max-w-4xl w-full space-y-8 p-6 bg-dark-background/80 backdrop-blur-sm rounded-xl shadow-2xl border border-funky-purple/30">

//                 <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-funky-cyan mb-8 tracking-wide drop-shadow-lg">
//                     🔮 Gemini Fun-House AI 🚀
//                 </h1>

//                 {/* Prompt Section Card */}
//                 <div className="p-6 md:p-8 bg-dark-background/60 rounded-lg shadow-xl border border-funky-pink/20">
//                     <div className="mb-6">
//                         <label htmlFor="prompt-input" className="block text-lg font-medium text-light-text mb-2">
//                             Type your wildest ideas:
//                         </label>
//                         <textarea
//                             id="prompt-input"
//                             rows="6"
//                             placeholder="e.g., Describe a futuristic city powered by sentient plants..."
//                             value={prompt}
//                             onChange={handlePromptChange}
//                             className="w-full p-4 border border-funky-purple-300 rounded-lg shadow-inner bg-dark-background/50 text-light-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-funky-cyan transition-all duration-300 resize-y"
//                         ></textarea>
//                     </div>

//                        {/* --- NEW: Image Upload Section --- */}
// {/* small */}
//   <div className="mb-4">
//                         <label htmlFor="image-upload" className="block text-funky-cyan text-lg font-medium mb-2">
//                             Upload Image (Optional):
//                         </label>
//                         <input
//                             type="file"
//                             id="image-upload"
//                             accept="image/*"
//                             onChange={handleImageChange}
//                             className="block w-full text-light-text
//                                        file:mr-4 file:py-2 file:px-4
//                                        file:rounded-full file:border-0
//                                        file:text-sm file:font-semibold
//                                        file:bg-funky-purple file:text-white
//                                        hover:file:bg-funky-pink hover:file:cursor-pointer
//                                        transition-colors duration-200"
//                         />
//                         {selectedImage && (
//                             <p className="text-sm text-gray-400 mt-2">
//                                 Selected: {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
//                             </p>
//                         )}
//                         {/* No image preview, as requested */}
//                     </div>
// {/* small */}
//     {/* <div className="mb-6">
//         <label htmlFor="image-upload" className="block text-lg font-medium text-light-text mb-2">
//             Upload Image (Optional):
//         </label>
//         <input
//             type="file"
//             id="image-upload"
//             accept="image/*" // Restricts file selection to images
//             onChange={handleImageChange}
//             className="w-full p-3 border border-funky-purple-300 rounded-lg shadow-inner bg-dark-background/50 text-light-text focus:outline-none focus:ring-2 focus:ring-funky-cyan transition-all duration-300"
//         />
//         {selectedImage && ( // Display selected image name and a clear button if an image is selected
//             <div className="mt-2 flex items-center text-sm text-gray-400">
//                 <span>Selected: {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)</span>
//                 <button
//                     onClick={() => { setSelectedImage(null); setImageData(null); }}
//                     className="ml-3 text-red-400 hover:text-red-300 transition-colors duration-200"
//                     title="Clear selected image"
//                 >
//                     {/* Make sure you have Font Awesome imported for this icon if you want it */
//                     /* <i className="fas fa-times-circle"></i> Clear
//                 </button>
//             </div>
//         )}
//     </div> */} 

//                     {/* Model Selection */}
//                     <div className="mb-8">
//                         <label className="block text-lg font-medium text-light-text mb-3">
//                             Choose your AI companions:
//                         </label>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                             {Object.keys(selectedModels).map(modelName => (
//                                 <div key={modelName} className="flex items-center p-3 rounded-md bg-dark-background/70 border border-funky-orange/20 shadow-sm cursor-pointer hover:bg-dark-background/90 transition-all duration-200">
//                                     <input
//                                         type="checkbox"
//                                         id={modelName}
//                                         checked={selectedModels[modelName]}
//                                         onChange={() => handleModelToggle(modelName)}
//                                         className="h-5 w-5 text-funky-cyan rounded border-gray-600 focus:ring-funky-cyan bg-gray-700 cursor-pointer"
//                                     />
//                                     <label htmlFor={modelName} className="ml-3 block text-base font-medium text-light-text cursor-pointer">
//                                         {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                                         {selectedModels[modelName] && <span className="ml-1 text-xs text-funky-cyan">(Active)</span>}
//                                     </label>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Buttons */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
//                         <button
//                             onClick={runPrompt}
//                             disabled={loading}
//                             className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
//                                        bg-gradient-to-r from-funky-purple to-funky-pink shadow-lg
//                                        hover:from-funky-pink hover:to-funky-purple
//                                        transition-all duration-300 ease-in-out transform hover:-translate-y-1
//                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                         >
//                             {loading ? 'Summoning AIs...' : 'Unleash Multiverse Thoughts'}
//                         </button>
//                         <button
//                             onClick={summarizeText}
//                             disabled={loading}
//                             className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
//                                        bg-gradient-to-r from-green-500 to-teal-500 shadow-lg
//                                        hover:from-teal-500 hover:to-green-500
//                                        transition-all duration-300 ease-in-out transform hover:-translate-y-1
//                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                         >
//                             {loading ? 'Digesting...' : '✨ Concise Summary'}
//                         </button>
//                         <button
//                             onClick={expandText}
//                             disabled={loading}
//                             className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
//                                        bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg
//                                        hover:from-indigo-500 hover:to-blue-500
//                                        transition-all duration-300 ease-in-out transform hover:-translate-y-1
//                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                         >
//                             {loading ? 'Expanding...' : '✨ Elaborate Further'}
//                         </button>
//                         <button
//                             onClick={extractKeywords}
//                             disabled={loading}
//                             className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
//                                        bg-gradient-to-r from-red-500 to-orange-500 shadow-lg
//                                        hover:from-orange-500 hover:to-red-500
//                                        transition-all duration-300 ease-in-out transform hover:-translate-y-1
//                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                         >
//                             {loading ? 'Scanning...' : '✨ Extract Core Concepts'}
//                         </button>
//                     </div>
//                     {/* --- NEW: Clear All Button --- */}
// <div className="mt-6">
//     <button
//         onClick={handleClearAll}
//         className="w-full py-3 px-6 rounded-lg font-bold text-lg text-white
//                    bg-gray-700 shadow-lg border border-gray-600
//                    hover:bg-gray-600 hover:border-gray-500
//                    transition-all duration-300 ease-in-out transform hover:-translate-y-1"
//     >
//         <i className="fas fa-redo-alt mr-2"></i> Clear All
//     </button>
// </div>
// {/* --- END NEW: Clear All Button --- */}
//                 </div>

//                 {/* Loading Indicator */}
//                 {loading && (
//                     <div className="flex flex-col items-center justify-center p-12 bg-dark-background/70 rounded-xl shadow-xl text-funky-cyan">
//                         <div className="animate-spin-slow border-t-4 border-b-4 border-funky-pink w-16 h-16 rounded-full mb-4"></div>
//                         <p className="text-xl font-semibold animate-pulse">Summoning cosmic wisdom...</p>
//                     </div>
//                 )}


//                 {/* Results Display */}
// {Object.keys(results).length > 0 && (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
//         {/* Display for general /generate-responses outputs */}
//         {Object.entries(results).map(([key, value]) => {
//             // Check if this is a general model output, not a nested summary/expansion/keyword object
//             if (key === 'summaries' || key === 'expansions' || key === 'keywords' || key === 'error') {
//                 return null; // Skip rendering these here
//             }

//             // 'value' should be a string here (the model's response)
//             const output = value;

//             return (
//                 <div key={key} className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20 transform hover:scale-[1.01] transition-transform duration-200">
//                     <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
//                         {key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Says:
//                     </h3>
//                     {output && (output.startsWith('Please enter') || output.startsWith('API Error:') || output.startsWith('Failed to communicate with backend:') || output.startsWith('Error:') || output.startsWith('Model')) ? (
//                         <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {output}</p>
//                     ) : (
//                         <div className="max-h-60 overflow-y-auto p-4 bg-dark-background/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
//                             <p className="text-light-text text-lg leading-relaxed">
//                                 {output && output.replace(/---/g, '')} {/* Add null check for output */}
//                             </p>
//                         </div>
//                     )}
//                 </div>
//             );
//         })}

//         {/* Display for Summaries */}
//         {results.summaries && Object.keys(results.summaries).length > 0 && (
//             <>
//                 <h2 className="col-span-full text-3xl font-extrabold text-center text-funky-pink mt-8 mb-4">Summaries</h2>
//                 {Object.entries(results.summaries).map(([modelName, summaryOutput]) => (
//                     <div key={`summary-${modelName}`} className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20 transform hover:scale-[1.01] transition-transform duration-200">
//                         <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
//                             {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Summary:
//                         </h3>
//                         {summaryOutput && (summaryOutput.startsWith('Please enter') || summaryOutput.startsWith('API Error:') || summaryOutput.startsWith('Failed to communicate with backend:') || summaryOutput.startsWith('Error:') || summaryOutput.startsWith('Model')) ? (
//                             <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {summaryOutput}</p>
//                         ) : (
//                             <div className="max-h-60 overflow-y-auto p-4 bg-dark-background/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
//                                 <p className="text-light-text text-lg leading-relaxed">
//                                     {summaryOutput && summaryOutput.replace(/---/g, '')}
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 ))}
//             </>
//         )}

//         {/* Display for Expansions */}
//         {results.expansions && Object.keys(results.expansions).length > 0 && (
//             <>
//                 <h2 className="col-span-full text-3xl font-extrabold text-center text-funky-pink mt-8 mb-4">Expansions</h2>
//                 {Object.entries(results.expansions).map(([modelName, expandedOutput]) => (
//                     <div key={`expansion-${modelName}`} className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20 transform hover:scale-[1.01] transition-transform duration-200">
//                         <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
//                             {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Expanded:
//                         </h3>
//                         {expandedOutput && (expandedOutput.startsWith('Please enter') || expandedOutput.startsWith('API Error:') || expandedOutput.startsWith('Failed to communicate with backend:') || expandedOutput.startsWith('Error:') || expandedOutput.startsWith('Model')) ? (
//                             <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {expandedOutput}</p>
//                         ) : (
//                             <div className="max-h-60 overflow-y-auto p-4 bg-dark-background/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
//                                 <p className="text-light-text text-lg leading-relaxed">
//                                     {expandedOutput && expandedOutput.replace(/---/g, '')}
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 ))}
//             </>
//         )}

//         {/* Display for Keywords */}
//         {results.keywords && Object.keys(results.keywords).length > 0 && (
//             <>
//                 <h2 className="col-span-full text-3xl font-extrabold text-center text-funky-pink mt-8 mb-4">Keywords</h2>
//                 {Object.entries(results.keywords).map(([modelName, keywordsOutput]) => (
//                     <div key={`keywords-${modelName}`} className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20 transform hover:scale-[1.01] transition-transform duration-200">
//                         <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
//                             {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Keywords:
//                         </h3>
//                         {keywordsOutput && (keywordsOutput.startsWith('Please enter') || keywordsOutput.startsWith('API Error:') || keywordsOutput.startsWith('Failed to communicate with backend:') || keywordsOutput.startsWith('Error:') || keywordsOutput.startsWith('Model')) ? (
//                             <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {keywordsOutput}</p>
//                         ) : (
//                             <div className="max-h-60 overflow-y-auto p-4 bg-dark-background/40 rounded-md border border-gray-700 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
//                                 <p className="text-light-text text-lg leading-relaxed">
//                                     {keywordsOutput && keywordsOutput.replace(/---/g, '')}
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 ))}
//             </>
//         )}

//         {results.error && ( // Display a general error message if one exists
//             <div className="col-span-full p-6 rounded-lg shadow-xl bg-red-900/40 border border-red-700 text-red-300 font-medium text-center">
//                 <p>Application Error: {results.error}</p>
//             </div>
//         )}
//     </div>
// )}
//             </div>
//         </div>
//     );
// }

// export default App;
import React, { useState } from 'react';
import './index.css'; // Or './App.css', depending on where your Tailwind directives are
import '@fortawesome/fontawesome-free/css/all.min.css'; // Make sure Font Awesome is imported

function App() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({});
    const [error, setError] = useState(null); // State for general application errors
    const [selectedImage, setSelectedImage] = useState(null); // Stores the File object
    const [imageData, setImageData] = useState(null);   

    const [selectedModels, setSelectedModels] = useState({
        'gemini-2.5-flash': true,
        'gemini-2.5-pro': true,
        'gemini-1.5-flash': true,
    });

    const [expandedOutputs, setExpandedOutputs] = useState({}); // State to manage which output boxes are expanded

    const BACKEND_BASE_URL = 'https://minwebback-343717256329.us-central1.run.app';
    
    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleModelToggle = (modelName) => {
        setSelectedModels(prev => ({
            ...prev,
            [modelName]: !prev[modelName]
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                // IMPORTANT: Remove the "data:image/jpeg;base64," part as the backend expects just the base64 string
                const base64String = reader.result.split(',')[1];
                setImageData(base64String);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedImage(null);
            setImageData(null);
        }
    };

    const handleClearAll = () => {
        setPrompt('');           // Clear the text prompt
        setResults({});          // Clear all AI results
        setSelectedImage(null);  // Clear selected image file
        setImageData(null);      // Clear image Base64 data
        setError(null);          // Clear any general error messages
        setExpandedOutputs({});  // Clear all expansion states
    };

    const toggleExpansion = (modelName) => {
        setExpandedOutputs(prev => ({
            ...prev,
            [modelName]: !prev[modelName] // Toggle the boolean for the specific model
        }));
    };

    // --- UPDATED: callBackendApi to centralize payload construction ---
    const callBackendApi = async (endpoint, payload) => {
        setLoading(true);
        setError(null); // Clear any previous general error before a new request
        setResults({}); // Clear previous results before new call (important for fresh results)

        const activeModels = Object.keys(selectedModels).filter(model => selectedModels[model]);

        if (activeModels.length === 0) {
            setError("Please select at least one AI model.");
            setLoading(false);
            throw new Error("No model selected."); // Throw to prevent further API call
        }

        try {
            // Start with the base payload (e.g., { prompt: "..." })
            const finalPayload = { ...payload, models: activeModels }; // ALWAYS include active models

            // Conditionally add imageData only for relevant endpoints
            if (endpoint === '/generate-responses' || endpoint === '/extract-keywords') {
                if (imageData) { // Only add if an image is actually selected
                    finalPayload.image = imageData; 
                }
            }

            const response = await fetch(`${BACKEND_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Check if errorData.error exists and is a string, otherwise use a generic message
                const errorMessage = typeof errorData.error === 'string' ? errorData.error : `Backend HTTP error! Status: ${response.status}`;
                throw new Error(errorMessage);
            }
            const data = await response.json();
            setExpandedOutputs({}); // Reset expansion states on successful new results
            return data;
        } catch (err) {
            console.error(`Error calling backend endpoint ${endpoint}:`, err);
            setError(`Failed to communicate with backend: ${err.message}`); // Set global error state
            throw err; // Re-throw to be caught by specific API functions
        } finally {
            setLoading(false);
        }
    };
    // --- END UPDATED ---

    // --- UPDATED: API call functions now only pass 'prompt' to callBackendApi ---
    const runPrompt = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            setResults({}); // Clear any previous results
            return;
        }
        try {
            // callBackendApi will handle adding models and image data
            const data = await callBackendApi('/generate-responses', { prompt });
            setResults(data);
        } catch (err) {
            // Error is already handled by callBackendApi's setError
        }
    };

    const summarizeText = async () => {
        if (!prompt.trim()) {
            setError('Please enter text to summarize.');
            setResults({});
            return;
        }
        try {
            // callBackendApi will handle adding models
            const data = await callBackendApi('/summarize', { prompt });
            setResults({ summaries: data });
        } catch (err) {
            // Error is already handled by callBackendApi's setError
        }
    };

    const expandText = async () => {
        if (!prompt.trim()) {
            setError('Please enter text to expand.');
            setResults({});
            return;
        }
        try {
            // callBackendApi will handle adding models
            const data = await callBackendApi('/expand', { prompt });
            setResults({ expansions: data });
        } catch (err) {
            // Error is already handled by callBackendApi's setError
        }
    };

    const extractKeywords = async () => {
        if (!prompt.trim()) {
            setError('Please enter text to extract keywords from.');
            setResults({});
            return;
        }
        try {
            // callBackendApi will handle adding models and image data
            const data = await callBackendApi('/extract-keywords', { prompt });
            setResults({ keywords: data });
        } catch (err) {
            // Error is already handled by callBackendApi's setError
        }
    };
    // --- END UPDATED ---

    return (
        <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8
                        bg-retro-swirl-animated bg-repeat bg-fixed bg-cover
                        text-light-text font-sans">
            <div className="max-w-4xl w-full space-y-8 p-6 bg-dark-background/80 backdrop-blur-sm rounded-xl shadow-2xl border border-funky-purple/30">

                <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-funky-cyan mb-8 tracking-wide drop-shadow-lg">
                    🔮 Gemini Fun-House AI 🚀
                </h1>

                <div className="p-6 md:p-8 bg-dark-background/60 rounded-lg shadow-xl border border-funky-pink/20">
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
                            Upload Image (Optional):
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
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center p-12 bg-dark-background/70 rounded-xl shadow-xl text-funky-cyan">
                        <div className="animate-spin-slow border-t-4 border-b-4 border-funky-pink w-16 h-16 rounded-full mb-4"></div>
                        <p className="text-xl font-semibold animate-pulse">Summoning cosmic wisdom...</p>
                    </div>
                )}

                {error && ( 
                    <div className="mt-8 p-4 bg-red-900/30 border border-red-700 rounded-lg shadow-md text-red-300 font-medium text-center animate-fade-in">
                        <p className="font-bold text-xl mb-2">Error:</p>
                        <p className="text-lg">{error}</p>
                    </div>
                )}

                {Object.keys(results).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {Object.entries(results).map(([key, value]) => {
                            if (key === 'summaries' || key === 'expansions' || key === 'keywords') {
                                return null;
                            }
                            const output = value && typeof value === 'object' && value.error ? value.error : value;

                            const isCurrentExpanded = expandedOutputs[key];

                            return (
                                <div
                                    key={key}
                                    onClick={() => toggleExpansion(key)}
                                    className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20
                                               transform hover:scale-[1.01] transition-transform duration-200 cursor-pointer
                                               relative"
                                >
                                    <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
                                        {key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Says:
                                        <i className={`fas ${isCurrentExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}
                                                        absolute top-6 right-6 text-funky-pink`}></i>
                                    </h3>
                                    {output && (output.startsWith('Please enter') || output.startsWith('API Error:') || output.startsWith('Failed to communicate with backend:') || output.startsWith('Model returned an error:') || output.startsWith('Error:')) ? (
                                        <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {output}</p>
                                    ) : (
                                        <div className={`${isCurrentExpanded ? '' : 'max-h-60 overflow-y-auto'}
                                                        p-4 bg-dark-background/40 rounded-md border border-gray-700
                                                        text-gray-300 text-base leading-relaxed whitespace-pre-wrap
                                                        transition-all duration-300 ease-in-out`}>
                                            <p className="text-light-text text-lg leading-relaxed">
                                                {output && output.replace(/---/g, '')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {results.summaries && Object.keys(results.summaries).length > 0 && (
                            <>
                                <h2 className="col-span-full text-3xl font-extrabold text-center text-funky-pink mt-8 mb-4">Summaries</h2>
                                {Object.entries(results.summaries).map(([modelName, summaryOutput]) => {
                                    const isCurrentExpanded = expandedOutputs[modelName];
                                    return (
                                        <div
                                            key={`summary-${modelName}`}
                                            onClick={() => toggleExpansion(modelName)}
                                            className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20
                                                       transform hover:scale-[1.01] transition-transform duration-200 cursor-pointer
                                                       relative"
                                        >
                                            <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
                                                {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Summary:
                                                <i className={`fas ${isCurrentExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}
                                                                absolute top-6 right-6 text-funky-pink`}></i>
                                            </h3>
                                            {summaryOutput && (summaryOutput.startsWith('Please enter') || summaryOutput.startsWith('API Error:') || summaryOutput.startsWith('Failed to communicate with backend:') || summaryOutput.startsWith('Model returned an error:') || summaryOutput.startsWith('Error:')) ? (
                                                <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {summaryOutput}</p>
                                            ) : (
                                                <div className={`${isCurrentExpanded ? '' : 'max-h-60 overflow-y-auto'}
                                                                p-4 bg-dark-background/40 rounded-md border border-gray-700
                                                                text-gray-300 text-base leading-relaxed whitespace-pre-wrap
                                                                transition-all duration-300 ease-in-out`}>
                                                    <p className="text-light-text text-lg leading-relaxed">
                                                        {summaryOutput && summaryOutput.replace(/---/g, '')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {results.expansions && Object.keys(results.expansions).length > 0 && (
                            <>
                                <h2 className="col-span-full text-3xl font-extrabold text-center text-funky-pink mt-8 mb-4">Expansions</h2>
                                {Object.entries(results.expansions).map(([modelName, expandedOutput]) => {
                                    const isCurrentExpanded = expandedOutputs[modelName];
                                    return (
                                        <div
                                            key={`expansion-${modelName}`}
                                            onClick={() => toggleExpansion(modelName)}
                                            className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20
                                                       transform hover:scale-[1.01] transition-transform duration-200 cursor-pointer
                                                       relative"
                                        >
                                            <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
                                                {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Expanded:
                                                <i className={`fas ${isCurrentExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}
                                                                absolute top-6 right-6 text-funky-pink`}></i>
                                            </h3>
                                            {expandedOutput && (expandedOutput.startsWith('Please enter') || expandedOutput.startsWith('API Error:') || expandedOutput.startsWith('Failed to communicate with backend:') || expandedOutput.startsWith('Model returned an error:') || expandedOutput.startsWith('Error:')) ? (
                                                <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {expandedOutput}</p>
                                            ) : (
                                                <div className={`${isCurrentExpanded ? '' : 'max-h-60 overflow-y-auto'}
                                                                p-4 bg-dark-background/40 rounded-md border border-gray-700
                                                                text-gray-300 text-base leading-relaxed whitespace-pre-wrap
                                                                transition-all duration-300 ease-in-out`}>
                                                    <p className="text-light-text text-lg leading-relaxed">
                                                        {expandedOutput && expandedOutput.replace(/---/g, '')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {results.keywords && Object.keys(results.keywords).length > 0 && (
                            <>
                                <h2 className="col-span-full text-3xl font-extrabold text-center text-funky-pink mt-8 mb-4">Keywords</h2>
                                {Object.entries(results.keywords).map(([modelName, keywordsOutput]) => {
                                    const isCurrentExpanded = expandedOutputs[modelName];
                                    return (
                                        <div
                                            key={`keywords-${modelName}`}
                                            onClick={() => toggleExpansion(modelName)}
                                            className="p-6 rounded-lg shadow-xl bg-dark-background/60 border border-funky-cyan/20
                                                       transform hover:scale-[1.01] transition-transform duration-200 cursor-pointer
                                                       relative"
                                        >
                                            <h3 className="text-2xl font-bold text-funky-orange mb-4 pb-2 border-b-2 border-funky-orange/50">
                                                {modelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Keywords:
                                                <i className={`fas ${isCurrentExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}
                                                                absolute top-6 right-6 text-funky-pink`}></i>
                                            </h3>
                                            {keywordsOutput && (keywordsOutput.startsWith('Please enter') || keywordsOutput.startsWith('API Error:') || keywordsOutput.startsWith('Failed to communicate with backend:') || keywordsOutput.startsWith('Model returned an error:') || keywordsOutput.startsWith('Error:')) ? (
                                                <p className="text-red-400 font-medium bg-red-900/30 p-4 rounded-md border border-red-700">Error: {keywordsOutput}</p>
                                            ) : (
                                                <div className={`${isCurrentExpanded ? '' : 'max-h-60 overflow-y-auto'}
                                                                p-4 bg-dark-background/40 rounded-md border border-gray-700
                                                                text-gray-300 text-base leading-relaxed whitespace-pre-wrap
                                                                transition-all duration-300 ease-in-out`}>
                                                    <p className="text-light-text text-lg leading-relaxed">
                                                        {keywordsOutput && keywordsOutput.replace(/---/g, '')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;