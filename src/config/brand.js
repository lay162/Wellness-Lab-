export const brand = {
  name: 'Wellness Lab',
  siteUrl: 'https://thewellnesslab.uk',
  tagline: 'Exploring wellness through peptide research 🧪🧬🇬🇧',
  description: 'Science-based info & studies.',
  descriptionNote: 'For educational & research purposes only.',
  /** Combined line for meta tags / SEO */
  get fullDescription() {
    return `${this.description} ${this.descriptionNote}`
  },
  disclaimer:
    'All content is for general educational and research purposes only. It does not constitute medical advice.',

  logo: '/logo.png',
  favicon: '/favicon.png',
  appIcon192: '/app-icon-192.png',
  appIcon512: '/app-icon-512.png',
  appleTouchIcon: '/apple-touch-icon.png',

  colors: {
    primary: '#1E6B5C',
    primaryLight: '#2A9D8F',
    primaryDark: '#145A4A',
    secondary: '#7CB342',
    accent: '#E8F5E9',
    background: '#F8FAF9',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    error: '#DC2626',
    warning: '#D97706',
    success: '#059669',
  },

  gradients: {
    hero: 'linear-gradient(135deg, #145A4A 0%, #1E6B5C 40%, #2A9D8F 75%, #7CB342 100%)',
    card: 'linear-gradient(145deg, #FFFFFF 0%, #E8F5E9 100%)',
    button: 'linear-gradient(135deg, #1E6B5C 0%, #2A9D8F 100%)',
  },

  contact: {
    email: 'hello@wellnesslab.example',
    phone: '+44 7863 004468',
    whatsapp: '+447863004468',
    whatsappUrl: 'https://wa.me/447863004468',
    address: 'Wellness Lab, United Kingdom',
    hours: 'Mon–Fri, 9am–5pm',
  },

  social: {
    tiktok: 'https://www.tiktok.com/@wellnesslab00',
    facebook: 'https://www.facebook.com/',
  },
}

export default brand
