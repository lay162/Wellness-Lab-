import brand from '../config/brand'

/** Default page hero / section copy — used until saved in Supabase */
export const SEED_SITE_PAGES = {
  home: {
    page_key: 'home',
    badge_text: brand.tagline,
    hero_title: 'Your journey to better wellness starts here',
    hero_subtitle: brand.description,
    section_title: `Why Choose ${brand.name}?`,
    section_subtitle: 'We combine expertise, compassion, and compliance to deliver exceptional wellness support.',
    extra_title: 'Download our app',
    extra_subtitle: `Install the ${brand.name} app on your phone, create a free account, and shop from anywhere.`,
    cta_title: 'Ready to begin your wellness journey?',
    cta_subtitle: 'Get in touch with our team to learn more about how we can support you.',
  },
  about: {
    page_key: 'about',
    hero_title: `About ${brand.name}`,
    hero_subtitle: brand.tagline,
    section_title: 'Our Story',
    body_html: `<p>${brand.name} was founded with a simple belief: everyone deserves access to thoughtful, professional wellness support. What began as a passion for holistic wellbeing has grown into a trusted platform serving clients across the United Kingdom.</p><p>We combine evidence-informed practices with a deeply personal approach, ensuring every client feels heard, supported, and empowered on their wellness journey.</p>`,
  },
  wellness: {
    page_key: 'wellness',
    hero_title: 'Wellness Education',
    hero_subtitle: 'General wellness information to support your health journey. For educational purposes only.',
    note_html: '<strong>Disclaimer:</strong> The information on this page is for general educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before making changes to your health regimen.',
  },
  'how-it-works': {
    page_key: 'how-it-works',
    hero_title: 'How It Works',
    hero_subtitle: 'A simple, transparent process designed to put your wellness first.',
  },
  faqs: {
    page_key: 'faqs',
    hero_title: 'Frequently Asked Questions',
    hero_subtitle: 'Find answers to common questions about our services.',
  },
  contact: {
    page_key: 'contact',
    hero_title: 'Contact Us',
    hero_subtitle: 'Get in touch via WhatsApp or send us a message. We respond promptly.',
  },
  blog: {
    page_key: 'blog',
    hero_title: 'Wellness Blog',
    hero_subtitle: 'Insights, tips, and educational articles for your wellbeing.',
  },
  aftercare: {
    page_key: 'aftercare',
    hero_title: 'Aftercare Guidance',
    hero_subtitle: 'General aftercare information and educational guidance.',
    note_html: '<strong>Note:</strong> This content is for general educational purposes. For personalised aftercare guidance, please contact our team directly.',
  },
}

export const SEED_SITE_CARDS = [
  // Home features
  { id: 'seed-home-f1', page_key: 'home', card_group: 'features', title: 'Holistic Wellness', description: 'Evidence-informed guidance for your wellbeing journey.', icon: 'Leaf', sort_order: 1, is_published: true },
  { id: 'seed-home-f2', page_key: 'home', card_group: 'features', title: 'Trusted & Compliant', description: 'Fully compliant operations with transparent practices.', icon: 'Shield', sort_order: 2, is_published: true },
  { id: 'seed-home-f3', page_key: 'home', card_group: 'features', title: 'Personalised Care', description: 'Tailored support designed around your unique needs.', icon: 'Heart', sort_order: 3, is_published: true },
  { id: 'seed-home-f4', page_key: 'home', card_group: 'features', title: 'Expert Team', description: 'Dedicated professionals committed to your success.', icon: 'Users', sort_order: 4, is_published: true },
  // Home trust badges
  { id: 'seed-home-t1', page_key: 'home', card_group: 'trust', title: 'Premium Quality', description: '', icon: 'Award', sort_order: 1, is_published: true },
  { id: 'seed-home-t2', page_key: 'home', card_group: 'trust', title: 'Fully Compliant', description: '', icon: 'Shield', sort_order: 2, is_published: true },
  { id: 'seed-home-t3', page_key: 'home', card_group: 'trust', title: 'Trusted Partner', description: '', icon: 'CheckCircle2', sort_order: 3, is_published: true },
  // About mission / vision / values
  { id: 'seed-about-1', page_key: 'about', card_group: 'values', title: 'Our Mission', description: 'To provide accessible, premium wellness support that empowers individuals to achieve their health and wellbeing goals.', icon: 'Target', sort_order: 1, is_published: true },
  { id: 'seed-about-2', page_key: 'about', card_group: 'values', title: 'Our Vision', description: 'A world where quality wellness guidance is available to everyone who seeks it, delivered with integrity and care.', icon: 'Eye', sort_order: 2, is_published: true },
  { id: 'seed-about-3', page_key: 'about', card_group: 'values', title: 'Our Values', description: 'Integrity, compassion, compliance, and excellence guide everything we do — from first contact to ongoing support.', icon: 'Heart', sort_order: 3, is_published: true },
  // How it works steps
  { id: 'seed-hiw-1', page_key: 'how-it-works', card_group: 'steps', title: 'Get in Touch', description: 'Reach out via our contact form to express your interest and learn more about our services.', icon: 'MessageCircle', step_label: '01', sort_order: 1, is_published: true },
  { id: 'seed-hiw-2', page_key: 'how-it-works', card_group: 'steps', title: 'Consultation', description: 'We discuss your wellness goals and determine how we can best support your journey.', icon: 'ClipboardCheck', step_label: '02', sort_order: 2, is_published: true },
  { id: 'seed-hiw-3', page_key: 'how-it-works', card_group: 'steps', title: 'Personalised Plan', description: 'Receive tailored guidance and support designed around your unique needs and preferences.', icon: 'HeartHandshake', step_label: '03', sort_order: 3, is_published: true },
  { id: 'seed-hiw-4', page_key: 'how-it-works', card_group: 'steps', title: 'Ongoing Support', description: 'Benefit from continuous aftercare, educational content, and dedicated client support.', icon: 'Sparkles', step_label: '04', sort_order: 4, is_published: true },
  // Wellness topics
  { id: 'seed-well-1', page_key: 'wellness', card_group: 'topics', title: 'Nutrition & Balance', description: 'Understanding how balanced nutrition supports overall wellbeing, energy levels, and long-term health outcomes.', icon: 'Leaf', sort_order: 1, is_published: true },
  { id: 'seed-well-2', page_key: 'wellness', card_group: 'topics', title: 'Mental Wellness', description: 'Practical strategies for managing stress, building resilience, and maintaining mental clarity in daily life.', icon: 'Brain', sort_order: 2, is_published: true },
  { id: 'seed-well-3', page_key: 'wellness', card_group: 'topics', title: 'Rest & Recovery', description: 'The importance of quality sleep and recovery in supporting physical and mental health.', icon: 'Moon', sort_order: 3, is_published: true },
  { id: 'seed-well-4', page_key: 'wellness', card_group: 'topics', title: 'Hydration & Vitality', description: 'How proper hydration and lifestyle habits contribute to sustained energy and vitality.', icon: 'Droplets', sort_order: 4, is_published: true },
]

export const SEED_FAQS = [
  { id: 'seed-faq-1', question: 'What services does Wellness Lab provide?', answer: 'We provide wellness education, guidance, and personalised support for approved clients. Our public website offers general wellness information and educational content.', sort_order: 1, is_published: true },
  { id: 'seed-faq-2', question: 'How do I get started?', answer: 'Begin by exploring our website and contacting us through the contact form. Our team will guide you through the next steps based on your needs.', sort_order: 2, is_published: true },
  { id: 'seed-faq-3', question: 'Is the information on this website medical advice?', answer: 'No. All content on this website is for general educational and informational purposes only. It does not constitute medical advice. Always consult a qualified healthcare professional.', sort_order: 3, is_published: true },
  { id: 'seed-faq-4', question: 'How can I contact the team?', answer: 'You can reach us via the contact form on our website, by email, or by phone during business hours. Details are available on the Contact page.', sort_order: 4, is_published: true },
  { id: 'seed-faq-5', question: 'What are your business hours?', answer: 'Our team is available Monday to Friday, 9am to 5pm. We aim to respond to all enquiries within 24–48 business hours.', sort_order: 5, is_published: true },
  { id: 'seed-faq-6', question: 'Do you operate across the UK?', answer: 'Yes, we serve clients across the United Kingdom with a commitment to compliance and quality in all our operations.', sort_order: 6, is_published: true },
]
