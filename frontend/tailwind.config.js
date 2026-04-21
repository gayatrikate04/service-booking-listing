// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     './src/pages/**/*.{js,jsx}',
//     './src/components/**/*.{js,jsx}',
//     './src/app/**/*.{js,jsx}',
//   ],
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
//       },
//       colors: {
//         primary: {
//           50:  '#eff6ff',
//           100: '#dbeafe',
//           500: '#3b82f6',
//           600: '#2563eb',
//           700: '#1d4ed8',
//         },
//       },
//       boxShadow: {
//         card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
//         'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.12)',
//       },
//     },
//   },
//   plugins: [],
// };

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.12)',
      },
    },
  },
  plugins: [],
};