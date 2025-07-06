
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
    primary: 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800',
    secondary: 'bg-gradient-to-r from-green-600 via-green-700 to-green-800',
    accent: 'bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800',
    surface: 'bg-gradient-to-br from-gray-50 to-gray-100',
    card: 'bg-gradient-to-br from-white to-gray-50'
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    premium: 'shadow-2xl shadow-blue-500/10'
  },
  borders: {
    light: 'border-gray-200',
    medium: 'border-gray-300',
    dark: 'border-gray-400',
    primary: 'border-blue-200',
    secondary: 'border-green-200'
  }
};

export const premiumClasses = {
  button: {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-500',
    secondary: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-green-500',
    outline: 'border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg transition-all duration-200',
    ghost: 'text-gray-700 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg transition-all duration-200'
  },
  card: {
    default: 'bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 p-6',
    elevated: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 p-6',
    premium: 'bg-white border-2 border-blue-100 rounded-xl shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 p-6'
  },
  input: {
    default: 'border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 font-medium transition-all duration-200',
    premium: 'border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 font-medium bg-white shadow-sm transition-all duration-200'
  },
  tab: {
    active: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg border border-blue-500',
    inactive: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-lg transition-all duration-200 border border-gray-200'
  },
  badge: {
    primary: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm border border-blue-300',
    secondary: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full font-semibold text-sm border border-green-300',
    accent: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full font-semibold text-sm border border-purple-300'
  }
};
