// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

// // tailwind.config.js
// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}", // THIS LINE IS IMPORTANT!
//   ],
//   theme: {
//     extend: {
//       // Your custom colors, gradients, animations go here
//       colors: {
//         'funky-purple': '#8A2BE2', // Blue Violet
//         'funky-pink': '#FF1493',   // Deep Pink
//         'funky-cyan': '#00FFFF',   // Cyan
//         'funky-orange': '#FFA500', // Orange
//         'dark-background': '#1A1A2E', // A dark base for contrast
//         'light-text': '#EAEAEA',
//       },
//       backgroundImage: {
//         'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
//         'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
//         'funky-rainbow': 'linear-gradient(to right, #8A2BE2, #FF1493, #00FFFF, #FFA500)',
//         'swirling-nebula': 'radial-gradient(circle at 10% 20%, #4B0082, #8A2BE2, #00BFFF)',
//       },
//       keyframes: {
//         'gradient-shift': {
//           '0%': { backgroundPosition: '0% 50%' },
//           '50%': { backgroundPosition: '100% 50%' },
//           '100%': { backgroundPosition: '0% 50%' },
//         },
//          'spin-slow': { // Custom keyframe for a slower spin
//             'from': { transform: 'rotate(0deg)' },
//             'to': { transform: 'rotate(360deg)' },
//         },
//     },
//       animation: {
//         'gradient-flow': 'gradient-shift 15s ease infinite alternate',
//         'swirling-bg': 'swirl 30s linear infinite', // Define if you want to use it
//          'spin-slow': 'spin-slow 2s linear infinite', // Use your custom keyframe
//       },
//     },
//   },
//   plugins: [],
// };



// // frontend/tailwind.config.js// moving box
// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         'funky-purple': '#8A2BE2',   // Blue Violet
//         'funky-pink': '#FF1493',     // Deep Pink
//         'funky-cyan': '#00FFFF',     // Cyan
//         'funky-orange': '#FFA500',   // Orange
//         'dark-background': '#1A1A2E', // A dark base for contrast
//         'light-text': '#EAEAEA',
//         'candy-red': '#FF004F',
//         'candy-white': '#FFFFFF',
//         'candy-blue': '#007FFF',
//         'candy-green': '#00FF7F',

//         // --- NEW 70s RETRO COLORS ---
//         'retro-orange': '#FF8C00',   // DarkOrange
//         'retro-brown': '#A0522D',    // Sienna
//         'retro-gold': '#FFD700',     // Gold
//         'retro-green': '#6B8E23',    // OliveDrab
//         'retro-pink': '#C71585',     // MediumVioletRed
//         'retro-blue': '#4169E1',     // RoyalBlue
//       },
//       backgroundImage: {
//         'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
//         'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
//         'funky-rainbow': 'linear-gradient(to right, #8A2BE2, #FF1493, #00FFFF, #FFA500)',
//         'swirling-nebula': 'radial-gradient(circle at 10% 20%, #4B0082, #8A2BE2, #00BFFF)',
//         'candy-cane-stripes': 'linear-gradient(45deg, var(--tw-gradient-stops))',

//         // --- NEW RETRO 70s PATTERN (SVG) ---
//         // This is a simple wavy pattern. For more complex, consider an SVG file.
//         // We encode the SVG directly into the CSS background-image URL.
//         'retro-swirl': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23${'FF8C00'.replace('#', '')}'/%3E%3Cstop offset='50%25' stop-color='%23${'C71585'.replace('#', '')}'/%3E%3Cstop offset='100%25' stop-color='%23${'4169E1'.replace('#', '')}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23a)' d='M0 0h100v100H0z'/%3E%3Cpath fill='%23${'FFD700'.replace('#', '')}' d='M0 0c25 0 50 10 50 25S75 50 100 50v50H0z' opacity='0.7'/%3E%3Cpath fill='%23${'6B8E23'.replace('#', '')}' d='M0 0c25 0 50 20 50 40S75 80 100 80v20H0z' opacity='0.5'/%3E%3C/svg%3E")`,

//         // Alternative more complex retro swirl (using multiple shapes/paths)
//         // 'retro-lava-lamp': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cfilter id='a' filterUnits='userSpaceOnUse' x='0' y='0' width='200' height='200'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='3' seed='0'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='50'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='200' height='200' fill='%23${'FF8C00'.replace('#', '')}'/%3E%3Ccircle cx='100' cy='50' r='30' fill='%23${'C71585'.replace('#', '')}' filter='url(%23a)'%3E%3Canimate attributeName='cx' dur='10s' values='100;150;100;50;100' repeatCount='indefinite'/%3E%3Canimate attributeName='cy' dur='12s' values='50;100;150;100;50' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='50' cy='150' r='40' fill='%23${'4169E1'.replace('#', '')}' filter='url(%23a)'%3E%3Canimate attributeName='cx' dur='11s' values='50;0;100;150;50' repeatCount='indefinite'/%3E%3Canimate attributeName='cy' dur='9s' values='150;100;50;100;150' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E")`,

//       },
//       keyframes: {
//         'gradient-shift': {
//           '0%': { backgroundPosition: '0% 50%' },
//           '50%': { backgroundPosition: '100% 50%' },
//           '100%': { backgroundPosition: '0% 50%' },
//         },
//         'swirl': {
//           '0%': { transform: 'rotate(0deg) scale(1)' },
//           '100%': { transform: 'rotate(360deg) scale(1.1)' },
//         },
//         'spin-slow': {
//            'from': { transform: 'rotate(0deg)' },
//            'to': { transform: 'rotate(360deg)' },
//         },
//         'move-stripes': {
//           '0%': { backgroundPosition: '0% 0%' },
//           '100%': { backgroundPosition: '100% 100%' },
//         },
//         // --- NEW KEYFRAME FOR RETRO PATTERN MOVEMENT ---
//         'flow-pattern': {
//           '0%': { backgroundPosition: '0% 0%' },
//           '100%': { backgroundPosition: '100% 100%' }, // Adjust based on pattern direction
//         },
//         // Another example for vertical flow
//         'flow-vertical': {
//           '0%': { backgroundPosition: '0% 0%' },
//           '100%': { backgroundPosition: '0% 100%' },
//         },
//       },
//       animation: {
//         'gradient-flow': 'gradient-shift 15s ease infinite alternate',
//         'swirling-bg': 'swirl 30s linear infinite',
//         'spin-slow': 'spin-slow 2s linear infinite',
//         'candy-cane-animate': 'move-stripes 8s linear infinite',

//         // --- NEW ANIMATION FOR RETRO PATTERN ---
//         'retro-flow': 'flow-pattern 20s linear infinite', // Adjust speed (e.g., 10s, 30s)
//         'retro-vertical-flow': 'flow-vertical 15s linear infinite', // For vertical moving patterns
//       },
//     },
//   },
//   plugins: [],
// }



// // frontend/tailwind.config.js
// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         'funky-purple': '#8A2BE2',
//         'funky-pink': '#FF1493',
//         'funky-cyan': '#00FFFF',
//         'funky-orange': '#FFA500',
//         'dark-background': '#1A1A2E',
//         'light-text': '#EAEAEA',
//         'candy-red': '#FF004F',
//         'candy-white': '#FFFFFF',
//         'candy-blue': '#007FFF',
//         'candy-green': '#00FF7F',

//         'retro-orange': '#FF8C00',   // DarkOrange
//         'retro-brown': '#A0522D',    // Sienna
//         'retro-gold': '#FFD700',     // Gold
//         'retro-green': '#6B8E23',    // OliveDrab
//         'retro-pink': '#C71585',     // MediumVioletRed
//         'retro-blue': '#4169E1',     // RoyalBlue
//         'retro-teal': '#008080',     // Teal
//         'retro-yellow': '#FFC300',   // Amber
//       },
//       backgroundImage: {
//         'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
//         'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
//         'funky-rainbow': 'linear-gradient(to right, #8A2BE2, #FF1493, #00FFFF, #FFA500)',
//         'swirling-nebula': 'radial-gradient(circle at 10% 20%, #4B0082, #8A2BE2, #00BFFF)',
//         'candy-cane-stripes': 'linear-gradient(45deg, var(--tw-gradient-stops))',
//         'retro-swirl': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23${'FF8C00'.replace('#', '')}'/%3E%3Cstop offset='50%25' stop-color='%23${'C71585'.replace('#', '')}'/%3E%3Cstop offset='100%25' stop-color='%23${'4169E1'.replace('#', '')}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23a)'/%3E%3Cpath fill='%23${'FFD700'.replace('#', '')}' d='M0 0c25 0 50 10 50 25S75 50 100 50v50H0z' opacity='0.7'/%3E%3Cpath fill='%23${'6B8E23'.replace('#', '')}' d='M0 0c25 0 50 20 50 40S75 80 100 80v20H0z' opacity='0.5'/%3E%3C/svg%3E")`,
//         'retro-lava-lamp': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cfilter id='a' filterUnits='userSpaceOnUse' x='0' y='0' width='200' height='200'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='3' seed='0'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='50'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='200' height='200' fill='%23${'FF8C00'.replace('#', '')}'/%3E%3Ccircle cx='100' cy='50' r='30' fill='%23${'C71585'.replace('#', '')}' filter='url(%23a)'%3E%3Canimate attributeName='cx' dur='10s' values='100;150;100;50;100' repeatCount='indefinite'/%3E%3Canimate attributeName='cy' dur='12s' values='50;100;150;100;50' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='50' cy='150' r='40' fill='%23${'4169E1'.replace('#', '')}' filter='url(%23a)'%3E%3Canimate attributeName='cx' dur='11s' values='50;0;100;150;50' repeatCount='indefinite'/%3E%3Canimate attributeName='cy' dur='9s' values='150;100;50;100;150' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E")`,
//         'retro-wave-animate': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3Cpath id='wavePath1' d='M0 50 C 50 10 100 90 150 50 C 200 10 250 90 300 50 V 150 H 0 Z'/%3E%3Cpath id='wavePath2' d='M0 70 C 50 30 100 110 150 70 C 200 30 250 110 300 70 V 150 H 0 Z'/%3E%3C/defs%3E%3Crect width='200' height='150' fill='%23${'dark-background'.replace('#', '')}'/%3E%3Cuse href='%23wavePath1' fill='%23${'retro-pink'.replace('#', '')}'%3E%3Canimate attributeName='fill' values='%23${'retro-pink'.replace('#', '')}%;%23${'retro-gold'.replace('#', '')}%;%23${'retro-blue'.replace('#', '')}%;%23${'retro-pink'.replace('#', '')}%' dur='15s' repeatCount='indefinite'/%3E%3C/use%3E%3Cuse href='%23wavePath2' fill='%23${'retro-blue'.replace('#', '')}'%3E%3Canimate attributeName='fill' values='%23${'retro-blue'.replace('#', '')}%;%23${'retro-teal'.replace('#', '')}%;%23${'retro-orange'.replace('#', '')}%;%23${'retro-blue'.replace('#', '')}%' dur='18s' repeatCount='indefinite' begin='3s'/%3E%3C/use%3E%3C/svg%3E")`,

//         // --- UPDATED: Animated Retro Swirl (colors changing AND shapes rotating internally) ---
//         'retro-swirl-animated': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23${'retro-orange'.replace('#', '')}'%3E%3Canimate attributeName='stop-color' values='%23${'retro-orange'.replace('#', '')}%;%23${'retro-pink'.replace('#', '')}%;%23${'retro-gold'.replace('#', '')}%;%23${'retro-orange'.replace('#', '')}%' dur='20s' repeatCount='indefinite'/%3E%3C/stop%3E%3Cstop offset='50%25' stop-color='%23${'C71585'.replace('#', '')}'%3E%3Canimate attributeName='stop-color' values='%23${'C71585'.replace('#', '')}%;%23${'4169E1'.replace('#', '')}%;%23${'6B8E23'.replace('#', '')}%;%23${'C71585'.replace('#', '')}%' dur='25s' repeatCount='indefinite' begin='5s'/%3E%3C/stop%3E%3Cstop offset='100%25' stop-color='%23${'4169E1'.replace('#', '')}'%3E%3Canimate attributeName='stop-color' values='%23${'4169E1'.replace('#', '')}%;%23${'FF8C00'.replace('#', '')}%;%23${'C71585'.replace('#', '')}%;%23${'4169E1'.replace('#', '')}%' dur='18s' repeatCount='indefinite' begin='2s'/%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23a)'/%3E%3Cpath id='swirl1' fill='%23${'FFD700'.replace('#', '')}' d='M0 0c25 0 50 10 50 25S75 50 100 50v50H0z' opacity='0.7'%3E%3Canimate attributeName='fill' values='%23${'FFD700'.replace('#', '')}%;%23${'C71585'.replace('#', '')}%;%23${'6B8E23'.replace('#', '')}%;%23${'FFD700'.replace('#', '')}%' dur='12s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' attributeType='XML' type='rotate' from='0 50 50' to='360 50 50' dur='30s' repeatCount='indefinite'/%3E%3C/path%3E%3Cpath id='swirl2' fill='%23${'6B8E23'.replace('#', '')}' d='M0 0c25 0 50 20 50 40S75 80 100 80v20H0z' opacity='0.5'%3E%3Canimate attributeName='fill' values='%23${'6B8E23'.replace('#', '')}%;%23${'FF8C00'.replace('#', '')}%;%23${'4169E1'.replace('#', '')}%;%23${'6B8E23'.replace('#', '')}%' dur='10s' repeatCount='indefinite' begin='4s'/%3E%3CanimateTransform attributeName='transform' attributeType='XML' type='rotate' from='0 50 50' to='-360 50 50' dur='25s' repeatCount='indefinite' begin='10s'/%3E%3C/path%3E%3C/svg%3E")`,
//       },
//       keyframes: {
//         'gradient-shift': { '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
//         'swirl': { '0%': { transform: 'rotate(0deg) scale(1)' }, '100%': { transform: 'rotate(360deg) scale(1.1)' } },
//         'spin-slow': { 'from': { transform: 'rotate(0deg)' }, 'to': { transform: '360deg)' } },
//         'move-stripes': { '0%': { backgroundPosition: '0% 0%' }, '100%': { backgroundPosition: '100% 100%' } },
//         'flow-pattern': { '0%': { backgroundPosition: '0% 0%' }, '100%': { backgroundPosition: '100% 100%' } },
//         'flow-vertical': { '0%': { backgroundPosition: '0% 0%' }, '100%': { backgroundPosition: '0% 100%' } },
//       },
//       animation: {
//         'gradient-flow': 'gradient-shift 15s ease infinite alternate',
//         'swirling-bg': 'swirl 30s linear infinite',
//         'spin-slow': 'spin-slow 2s linear infinite',
//         'candy-cane-animate': 'move-stripes 8s linear infinite',
//         'retro-flow': 'flow-pattern 20s linear infinite',
//         'retro-vertical-flow': 'flow-vertical 15s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// }



// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'funky-purple': '#8A2BE2',
        'funky-pink': '#FF1493',
        'funky-cyan': '#00FFFF',
        'funky-orange': '#FFA500',
        'dark-background': '#1A1A2E',
        'light-text': '#EAEAEA',
        'candy-red': '#FF004F',
        'candy-white': '#FFFFFF',
        'candy-blue': '#007FFF',
        'candy-green': '#00FF7F',

        'retro-orange': '#FF8C00',   // DarkOrange
        'retro-brown': '#A0522D',    // Sienna
        'retro-gold': '#FFD700',     // Gold
        'retro-green': '#6B8E23',    // OliveDrab
        'retro-pink': '#C71585',     // MediumVioletRed
        'retro-blue': '#4169E1',     // RoyalBlue
        'retro-teal': '#008080',     // Teal
        'retro-yellow': '#FFC300',   // Amber
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'funky-rainbow': 'linear-gradient(to right, #8A2BE2, #FF1493, #00FFFF, #FFA500)',
        'swirling-nebula': 'radial-gradient(circle at 10% 20%, #4B0082, #8A2BE2, #00BFFF)',
        'candy-cane-stripes': 'linear-gradient(45deg, var(--tw-gradient-stops))',
        'retro-swirl': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23FF8C00'/%3E%3Cstop offset='50%25' stop-color='%23C71585'/%3E%3Cstop offset='100%25' stop-color='%234169E1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23a)' d='M0 0h100v100H0z'/%3E%3Cpath fill='%23FFD700' d='M0 0c25 0 50 10 50 25S75 50 100 50v50H0z' opacity='0.7'/%3E%3Cpath fill='%236B8E23' d='M0 0c25 0 50 20 50 40S75 80 100 80v20H0z' opacity='0.5'/%3E%3C/svg%3E")`,
        'retro-lava-lamp': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3Cfilter id='a' filterUnits='userSpaceOnUse' x='0' y='0' width='200' height='200'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='3' seed='0'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='50'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='200' height='200' fill='%23FF8C00'/%3E%3Ccircle cx='100' cy='50' r='30' fill='%23C71585' filter='url(%23a)'%3E%3Canimate attributeName='cx' dur='10s' values='100;150;100;50;100' repeatCount='indefinite'/%3E%3Canimate attributeName='cy' dur='12s' values='50;100;150;100;50' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='50' cy='150' r='40' fill='%234169E1' filter='url(%23a)'%3E%3Canimate attributeName='cx' dur='11s' values='50;0;100;150;50' repeatCount='indefinite'/%3E%3Canimate attributeName='cy' dur='9s' values='150;100;50;100;150' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E")`,
        'retro-wave-animate': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Cdefs%3E%3Cpath id='wavePath1' d='M0 50 C 50 10 100 90 150 50 C 200 10 250 90 300 50 V 150 H 0 Z'/%3E%3Cpath id='wavePath2' d='M0 70 C 50 30 100 110 150 70 C 200 30 250 110 300 70 V 150 H 0 Z'/%3E%3C/defs%3E%3Crect width='200' height='150' fill='%231A1A2E'/%3E%3Cuse href='%23wavePath1' fill='%23C71585'%3E%3Canimate attributeName='fill' values='%23C71585;%23FFD700;%234169E1;%23C71585' dur='15s' repeatCount='indefinite'/%3E%3C/use%3E%3Cuse href='%23wavePath2' fill='%234169E1'%3E%3Canimate attributeName='fill' values='%234169E1;%23008080;%23FF8C00;%234169E1' dur='18s' repeatCount='indefinite' begin='3s'/%3E%3C/use%3E%3C/svg%3E")`,

        // --- CORRECTED & ROBUSTLY ENCODED: Animated Retro Swirl (colors changing AND shapes rotating internally) ---
        'retro-swirl-animated': `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22a%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%2525%22%20stop-color%3D%22%23FF8C00%22%3E%3Canimate%20attributeName%3D%22stop-color%22%20values%3D%22%23FF8C00%3B%23FF1493%3B%23FFD700%3B%23FF8C00%22%20dur%3D%2220s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2250%2525%22%20stop-color%3D%22%23C71585%22%3E%3Canimate%20attributeName%3D%22stop-color%22%20values%3D%22%23C71585%3B%234169E1%3B%236B8E23%3B%23C71585%22%20dur%3D%2225s%22%20repeatCount%3D%22indefinite%22%20begin%3D%225s%22%2F%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%2525%22%20stop-color%3D%22%234169E1%22%3E%3Canimate%20attributeName%3D%22stop-color%22%20values%3D%22%234169E1%3B%23FF8C00%3B%23C71585%3B%234169E1%22%20dur%3D%2218s%22%20repeatCount%3D%22indefinite%22%20begin%3D%222s%22%2F%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22url%28%23a%29%22%2F%3E%3Cpath%20id%3D%22swirl1%22%20fill%3D%22%23FFD700%22%20d%3D%22M0%200c25%200%2050%2010%2050%2025S75%2050%20100%2050v50H0z%22%20opacity%3D%220.7%22%3E%3Canimate%20attributeName%3D%22fill%22%20values%3D%22%23FFD700%3B%23C71585%3B%236B8E23%3B%23FFD700%22%20dur%3D%2212s%22%20repeatCount%3D%22indefinite%22%2F%3E%3CanimateTransform%20attributeName%3D%22transform%22%20attributeType%3D%22XML%22%20type%3D%22rotate%22%20from%3D%220%2050%2050%22%20to%3D%22360%2050%2050%22%20dur%3D%2230s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Fpath%3E%3Cpath%20id%3D%22swirl2%22%20fill%3D%22%236B8E23%22%20d%3D%22M0%200c25%200%2050%2020%2050%2040S75%2080%20100%2080v20H0z%22%20opacity%3D%220.5%22%3E%3Canimate%20attributeName%3D%22fill%22%20values%3D%22%236B8E23%3B%23FF8C00%3B%234169E1%3B%236B8E23%22%20dur%3D%2210s%22%20repeatCount%3D%22indefinite%22%20begin%3D%224s%22%2F%3E%3CanimateTransform%20attributeName%3D%22transform%22%20attributeType%3D%22XML%22%20type%3D%22rotate%22%20from%3D%220%2050%2050%22%20to%3D%22-360%2050%2050%22%20dur%3D%2225s%22%20repeatCount%3D%22indefinite%22%20begin%3D%2210s%22%2F%3E%3C%2Fpath%3E%3C%2Fsvg%3E")`,
      },
      keyframes: {
        'gradient-shift': { '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
        'swirl': { '0%': { transform: 'rotate(0deg) scale(1)' }, '100%': { transform: 'rotate(360deg) scale(1.1)' } },
        'spin-slow': { 'from': { transform: 'rotate(0deg)' }, 'to': { transform: '360deg)' } },
        'move-stripes': { '0%': { backgroundPosition: '0% 0%' }, '100%': { backgroundPosition: '100% 100%' } },
        'flow-pattern': { '0%': { backgroundPosition: '0% 0%' }, '100%': { backgroundPosition: '100% 100%' } },
        'flow-vertical': { '0%': { backgroundPosition: '0% 0%' }, '100%': { backgroundPosition: '0% 100%' } },
      },
      animation: {
        'gradient-flow': 'gradient-shift 15s ease infinite alternate',
        'swirling-bg': 'swirl 30s linear infinite',
        'spin-slow': 'spin-slow 2s linear infinite',
        'candy-cane-animate': 'move-stripes 8s linear infinite',
        'retro-flow': 'flow-pattern 20s linear infinite',
        'retro-vertical-flow': 'flow-vertical 15s linear infinite',
      },
    },
  },
  plugins: [],
}