
export const premiumTheme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16'
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e'
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a'
    }
  },
  gradients: {
    primary: 'bg-gradient-to-r from-blue-800 via-blue-900 to-slate-900',
    secondary: 'bg-gradient-to-r from-green-800 via-green-900 to-slate-900',
    accent: 'bg-gradient-to-r from-purple-800 via-purple-900 to-slate-900',
    surface: 'bg-white',
    card: 'bg-white border-2 border-gray-800'
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg shadow-gray-800/20',
    xl: 'shadow-xl shadow-gray-800/30',
    premium: 'shadow-2xl shadow-gray-900/40'
  },
  borders: {
    light: 'border-gray-800',
    medium: 'border-gray-900',
    dark: 'border-black',
    primary: 'border-blue-800',
    secondary: 'border-green-800'
  }
};

export const premiumClasses = {
  button: {
    primary: 'bg-gradient-to-r from-blue-800 via-blue-900 to-slate-900 hover:from-blue-900 hover:via-slate-900 hover:to-black text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-800',
    secondary: 'bg-gradient-to-r from-green-800 via-green-900 to-slate-900 hover:from-green-900 hover:via-slate-900 hover:to-black text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-green-800',
    outline: 'border-3 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold px-6 py-3 rounded-lg transition-all duration-200',
    ghost: 'text-gray-900 hover:bg-gray-900 hover:text-white font-bold px-4 py-2 rounded-lg transition-all duration-200'
  },
  card: {
    default: 'bg-white border-3 border-gray-900 rounded-xl shadow-xl shadow-gray-900/30 hover:shadow-2xl hover:shadow-gray-900/40 transition-all duration-200 p-6',
    elevated: 'bg-white border-3 border-gray-900 rounded-xl shadow-2xl shadow-gray-900/40 hover:shadow-2xl hover:shadow-gray-900/50 transition-all duration-200 p-6',
    premium: 'bg-white border-4 border-blue-900 rounded-xl shadow-2xl shadow-blue-900/40 hover:shadow-blue-900/50 transition-all duration-200 p-6'
  },
  input: {
    default: 'border-3 border-gray-900 focus:border-blue-900 focus:ring-4 focus:ring-blue-200 rounded-lg px-4 py-3 font-bold transition-all duration-200 bg-white',
    premium: 'border-3 border-gray-900 focus:border-blue-900 focus:ring-4 focus:ring-blue-200 rounded-lg px-4 py-3 font-bold bg-white shadow-lg transition-all duration-200'
  },
  tab: {
    active: 'bg-gradient-to-r from-blue-800 via-blue-900 to-slate-900 text-white font-bold px-6 py-3 rounded-lg shadow-lg border-2 border-blue-800',
    inactive: 'text-gray-900 hover:text-white hover:bg-gray-900 font-bold px-6 py-3 rounded-lg transition-all duration-200 border-2 border-gray-900'
  },
  badge: {
    primary: 'bg-gradient-to-r from-blue-800 to-blue-900 text-white px-4 py-2 rounded-full font-bold text-sm border-2 border-blue-800',
    secondary: 'bg-gradient-to-r from-green-800 to-green-900 text-white px-4 py-2 rounded-full font-bold text-sm border-2 border-green-800',
    accent: 'bg-gradient-to-r from-purple-800 to-purple-900 text-white px-4 py-2 rounded-full font-bold text-sm border-2 border-purple-800'
  },
  text: {
    primary: 'text-gray-900 font-bold',
    secondary: 'text-gray-800 font-semibold',
    muted: 'text-gray-700 font-medium'
  }
};
