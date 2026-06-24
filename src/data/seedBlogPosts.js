function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
}

const DISCLAIMER = '<p><em>For educational and research purposes only. Not medical advice. Always consult a qualified professional.</em></p>'

function weeksAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n * 7)
  return d.toISOString()
}

function article(intro, sections) {
  const body = sections.map(s => `<h2>${s.h}</h2><p>${s.p}</p>`).join('')
  return `<p>${intro}</p>${body}${DISCLAIMER}`
}

const TOPICS = [
  {
    title: 'GLP-1 & GLP-1/GIP: Metabolic Research for UK Gym & Wellness Communities',
    category: 'Metabolic',
    excerpt: 'Understanding GLP-1 research, metabolic health, and why UK gyms and wellness professionals are exploring peptide education.',
    sections: [
      { h: 'What gym owners should know', p: 'GLP-1 pathways are among the most discussed topics in UK metabolic research. For gym owners, personal trainers, and wellness coaches, education — not hype — helps members make informed decisions alongside nutrition and training.' },
      { h: 'UK-wide relevance', p: 'From London to Manchester, Birmingham to Glasgow, clients ask about weight management, inflammation, and longevity. Research-led content supports trust and positions your facility as a serious wellness partner.' },
    ],
  },
  {
    title: 'Sermorelin & Sleep: Recovery Research for Athletes and Bodybuilders',
    category: 'Hormone & Growth',
    excerpt: 'How sermorelin appears in hormone and sleep research — and why recovery matters for UK athletes, bodybuilders, and busy professionals.',
    sections: [
      { h: 'Sleep and performance', p: 'Poor sleep undermines muscle repair, hormone balance, and gym progress. Sermorelin is studied in growth-hormone signalling contexts — relevant for athletes mapping recovery protocols.' },
      { h: 'Practical wellness framing', p: 'Combine sleep hygiene, nutrition, and structured training before exploring any research compound. Wellness Lab provides educational resources for informed conversations.' },
    ],
  },
  {
    title: 'Glutathione: Immune & Cellular Research in Modern UK Wellness',
    category: 'Immune Support',
    excerpt: 'Glutathione in immune support, skin health, and oxidative stress research — a guide for UK wellness journeys.',
    sections: [
      { h: 'Why it matters', p: 'Glutathione is often discussed for inflammation, cellular repair, and immune resilience — topics that resonate with health-conscious clients nationwide.' },
      { h: 'Who asks about it', p: 'Gym members, aesthetic practitioners, and longevity-focused individuals across the UK seek clear, compliant education on glutathione research formats including injectables.' },
    ],
  },
  {
    title: 'BPC-157 & TB-500: Recovery Peptides for Training & Joint Health',
    category: 'Recovery & Repair',
    excerpt: 'Educational overview of BPC-157 and TB-500 in recovery research — for bodybuilders, runners, and UK sports communities.',
    sections: [
      { h: 'Recovery-first mindset', p: 'Tissue repair, gut health, and joint support are central to sustainable training. These peptides appear frequently in sports recovery literature and gym-adjacent wellness discussions.' },
      { h: 'Building a protocol', p: 'Recovery peptides are one piece of a broader plan: deload weeks, protein intake, mobility work, and professional guidance when injured.' },
    ],
  },
  {
    title: 'GHK-Cu & Anti-Aging Beauty Research in the UK',
    category: 'Anti-Aging & Beauty',
    excerpt: 'GHK-Cu in skin, hair, and anti-aging research — what UK wellness and aesthetic clients are reading about.',
    sections: [
      { h: 'Beauty meets science', p: 'GHK-Cu is linked to collagen synthesis and skin health in research contexts. UK clients increasingly want evidence-based beauty wellness, not quick fixes.' },
      { h: 'Topical vs injectable formats', p: 'Understanding delivery formats helps clients compare serums, injectables, and combination approaches discussed in research.' },
    ],
  },
  {
    title: 'Methylene Blue: Cognitive & Mitochondrial Research Explained',
    category: 'Cognitive',
    excerpt: 'Methylene blue in cognitive health and mitochondrial function research — for professionals and UK biohackers.',
    sections: [
      { h: 'Mental clarity demand', p: 'Busy gym owners, traders, and athletes ask about focus, oxidative stress, and brain health. Methylene blue appears in niche cognitive research conversations.' },
      { h: 'Stay compliant', p: 'Educational content must emphasise research use and professional oversight — core to Wellness Lab\'s UK approach.' },
    ],
  },
  {
    title: 'MOTS-C: Metabolic Peptide Research for Fat Loss & Energy',
    category: 'Metabolic',
    excerpt: 'MOTS-C in mitochondrial and metabolic research — relevant for UK body composition and wellness goals.',
    sections: [
      { h: 'Mitochondrial angle', p: 'MOTS-C is studied for metabolic regulation, mental clarity, and blood sugar balance — keywords that drive search interest from gym and wellness audiences.' },
      { h: 'Nationwide interest', p: 'Clients from Bristol to Leeds search for metabolic peptide education. Clear articles improve discoverability and trust.' },
    ],
  },
  {
    title: 'DSIP Peptide & Sleep Quality: Stress Recovery for UK Lifestyles',
    category: 'Recovery & Repair',
    excerpt: 'DSIP in sleep and cortisol research — supporting recovery for high-stress UK professionals and athletes.',
    sections: [
      { h: 'Stress and sleep', p: 'Chronic stress blocks gym gains. DSIP appears in literature around sleep architecture and recovery — topics personal trainers can discuss educationally.' },
      { h: 'Holistic recovery', p: 'Combine breathwork, sleep schedules, and nutrition before advanced research topics.' },
    ],
  },
  {
    title: 'NAD+ for Energy, Longevity & Gym Performance in the UK',
    category: 'Energy & Vitamins',
    excerpt: 'NAD+ research for cellular energy, anti-aging, and athletic recovery — a UK wellness guide.',
    sections: [
      { h: 'Energy demand', p: 'NAD+ is among the most searched longevity compounds in the UK. Gym members and executives alike want to understand cellular repair and fatigue.' },
      { h: 'Delivery options', p: 'Injectable and spray formats are discussed in research — compare options with qualified guidance.' },
    ],
  },
  {
    title: 'Tesamorelin & Ipamorelin: Body Composition Research for Athletes',
    category: 'Hormone & Growth',
    excerpt: 'How tesamorelin and ipamorelin appear in fat-burning and muscle-growth research — for UK bodybuilding communities.',
    sections: [
      { h: 'Body composition goals', p: 'These peptides feature in hormone and growth research relevant to bodybuilders and physique athletes seeking structured education.' },
      { h: 'Train smart', p: 'No peptide replaces progressive overload, adequate protein, and recovery sleep.' },
    ],
  },
  {
    title: 'Synapsin & Cognitive Spray Research: Focus for Busy UK Professionals',
    category: 'Cognitive',
    excerpt: 'Synapsin in cognitive support and memory research — educational guide for UK wellness audiences.',
    sections: [
      { h: 'Focus economy', p: 'Spray-format cognitive research appeals to professionals who want convenient wellness options alongside gym routines.' },
      { h: 'Evidence-led content', p: 'Wellness Lab publishes research summaries so clients can discuss options with qualified advisors.' },
    ],
  },
  {
    title: 'Vitamin B12 Injectables: Energy & Brain Health for UK Gyms',
    category: 'Energy & Vitamins',
    excerpt: 'B12 in energy, hair, and neurological wellness research — popular with UK gym and wellness clients.',
    sections: [
      { h: 'Why gyms offer B12 education', p: 'Many UK fitness businesses field questions about fatigue and micronutrients. B12 injectables are a common wellness topic.' },
      { h: 'Testing first', p: 'Encourage appropriate testing and professional review before any supplementation protocol.' },
    ],
  },
  {
    title: 'PT-141 & Intimacy Wellness: UK Research Overview',
    category: 'Intimacy & Wellness',
    excerpt: 'PT-141 in libido and blood-flow research — sensitive, educational content for UK wellness practitioners.',
    sections: [
      { h: 'Whole-person wellness', p: 'Intimacy health connects to stress, sleep, and cardiovascular wellness — topics UK clients want discussed professionally.' },
      { h: 'Privacy and compliance', p: 'Educational framing protects clients and businesses alike.' },
    ],
  },
  {
    title: 'Thymosin Alpha-1: Immune Research for UK Wellness Clinics',
    category: 'Immune Support',
    excerpt: 'Thymosin Alpha-1 in immune modulation and recovery research — for UK wellness and gym-adjacent services.',
    sections: [
      { h: 'Immune resilience', p: 'Post-illness recovery and inflammatory balance drive interest in thymosin research among health-focused UK audiences.' },
      { h: 'Professional networks', p: 'Gyms partnering with wellness clinics benefit from shared educational content.' },
    ],
  },
  {
    title: 'Peptides for Gym Owners: Building a UK Wellness Revenue Stream',
    category: 'Wellness Business',
    excerpt: 'How UK gyms, PT studios, and wellness brands can educate members on peptide research responsibly.',
    sections: [
      { h: 'Education sells trust', p: 'Members buy from brands that explain research clearly. Blog content, shop access, and aftercare differentiate serious operators.' },
      { h: 'Referral partnerships', p: 'Connect members to compliant suppliers and educational resources like Wellness Lab.' },
    ],
  },
  {
    title: 'Bodybuilding Recovery in the UK: Peptides, Sleep & Nutrition',
    category: 'Recovery & Repair',
    excerpt: 'A practical recovery framework for UK bodybuilders exploring peptide research alongside training.',
    sections: [
      { h: 'Periodisation', p: 'Match recovery tools to training blocks — hypertrophy, cut, and maintenance phases need different emphasis.' },
      { h: 'Peptide literacy', p: 'Understanding BPC-157, TB-500, and NAD+ research helps athletes ask better questions.' },
    ],
  },
  {
    title: 'Injectable vs Oral Peptides: UK Research Formats Compared',
    category: 'Education',
    excerpt: 'Compare injectable, oral, spray, and topical peptide research formats for UK clients.',
    sections: [
      { h: 'Bioavailability basics', p: 'Delivery route affects research discussions on absorption and convenience — key for shop and consultation conversations.' },
      { h: 'Shop by category', p: 'Wellness Lab organises products by metabolic, recovery, cognitive, and immune categories for easier browsing.' },
    ],
  },
  {
    title: 'Peptide Compliance & Safety in the United Kingdom',
    category: 'Compliance',
    excerpt: 'How UK businesses discuss peptides legally — research use, disclaimers, and customer education.',
    sections: [
      { h: 'Compliance-first', p: 'Wellness Lab emphasises educational and research purposes. Clear disclaimers protect your brand and your clients.' },
      { h: 'Nationwide standards', p: 'Whether you operate in England, Scotland, or Wales, consistent messaging builds long-term trust.' },
    ],
  },
  {
    title: 'GLP-1 Questions Your Gym Members Are Googling (UK 2026)',
    category: 'Metabolic',
    excerpt: 'Top GLP-1 search queries from UK gym members — and how to answer them with research-led content.',
    sections: [
      { h: 'SEO for gyms', p: 'Publishing answers to real search queries brings local and national traffic to your site and partner resources.' },
      { h: 'Link to education', p: 'Point members to Wellness Lab blog and shop for deeper reading.' },
    ],
  },
  {
    title: 'Sleep Peptides: DSIP & Sermorelin for UK Shift Workers & Athletes',
    category: 'Recovery & Repair',
    excerpt: 'Sleep peptide research for UK shift workers, nurses, and athletes with irregular schedules.',
    sections: [
      { h: 'Sleep debt epidemic', p: 'Poor sleep drives weight gain and injury. Shift workers are a growing UK wellness demographic.' },
      { h: 'Stack with habits', p: 'Dark rooms, consistent wind-down, and caffeine curfews remain foundational.' },
    ],
  },
  {
    title: 'Anti-Aging Peptides UK: GHK-Cu, NAD+ & Longevity Trends',
    category: 'Anti-Aging & Beauty',
    excerpt: 'Longevity and anti-aging peptide research trends across the UK wellness market.',
    sections: [
      { h: 'Longevity mainstream', p: 'Anti-aging is no longer niche — gyms and spas field NAD+ and GHK-Cu questions weekly.' },
      { h: 'Content marketing', p: 'Regular blog posts improve Google visibility for longevity keywords nationwide.' },
    ],
  },
  {
    title: 'Liporelin & KPV: Visceral Fat & Gut Health Research',
    category: 'Metabolic',
    excerpt: 'Liporelin and KPV in body composition, gut health, and inflammation research — UK guide.',
    sections: [
      { h: 'Gut-body connection', p: 'UK clients increasingly link digestive health to fat loss and cognition — KPV appears in that conversation.' },
      { h: 'Metabolic category', p: 'Browse Wellness Lab metabolic products for related research topics.' },
    ],
  },
  {
    title: 'How to Start a Peptide-Informed Wellness Journey in the UK',
    category: 'Getting Started',
    excerpt: 'Step-by-step educational path for UK individuals exploring peptide research with Wellness Lab.',
    sections: [
      { h: 'Start with education', p: 'Read blog articles, browse shop categories, and create a free account for shop access.' },
      { h: 'Contact the team', p: 'WhatsApp and contact forms connect you with UK-based support for next steps.' },
    ],
  },
  {
    title: 'Wellness Lab Shop Guide: Categories, Prices & Ordering UK-Wide',
    category: 'Shop',
    excerpt: 'Complete guide to browsing Wellness Lab shop categories — metabolic, recovery, hormone, immune, and more.',
    sections: [
      { h: 'Browse by category', p: 'Filter injectables, metabolic, recovery, and cognitive products to find research topics relevant to your goals.' },
      { h: 'UK-wide delivery', p: 'Create an account, add to cart, and submit an order request — our team supports customers across the United Kingdom.' },
    ],
  },
]

export const SEED_BLOG_POSTS = TOPICS.map((t, i) => {
  const slug = slugify(t.title)
  const index = i + 1
  return {
    id: `seed-blog-${index}`,
    slug,
    title: t.title,
    excerpt: t.excerpt,
    content: article(t.excerpt, t.sections),
    category: t.category,
    cover_image: `content/blog/blog-${String(index).padStart(2, '0')}.jpg`,
    is_published: true,
    featured: i < 4,
    is_seed: true,
    created_at: weeksAgo(26 - i),
    updated_at: weeksAgo(26 - i),
  }
})

export function getSeedBlogPost(slug) {
  return SEED_BLOG_POSTS.find(p => p.slug === slug) ?? null
}

export function isSeedBlogSlug(slug) {
  return SEED_BLOG_POSTS.some(p => p.slug === slug)
}
