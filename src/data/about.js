import siteDefaults from './data.json'

/** @typedef {typeof siteDefaults.about} AboutContent */

export const DEFAULT_ABOUT_CONTENT = siteDefaults.about

export function cloneAboutContent(content = siteDefaults.about) {
  return structuredClone(content)
}

export function cloneSiteData(data = siteDefaults) {
  return structuredClone(data)
}

export const ABOUT_EN = {
  meta: {
    title: 'About · TEKUEI',
    description: 'TEKUEI is a personal brand system. Combining engineering thinking with curatorial aesthetics, we help creators move from a vague persona to a clear, authentic brand presence.',
  },
  hero: {
    pre: 'A B O U T',
    title: 'TEKUEI',
    subtitle: '',
    tagline: 'Personal Brand Architect',
    belief: {
      parts: [
        { t: 'Making ' },
        { t: 'the worthy', accent: true },
        { t: ' visible' },
        { t: ' to the world', accent: true },
        { t: '.' },
      ],
    },
  },
  intro: {
    label: 'W H O   W E   A R E',
    title: [
      'Not packaging you —',
      {
        parts: [
          { t: 'letting the world see' },
          { t: ' who you already are', accent: true },
        ],
      },
    ],
    paragraphs: [
      {
        parts: [
          { t: 'TEKUEI is a ' },
          { t: 'personal brand system', accent: true },
          { t: '. We believe that a truly premium brand is not a carefully crafted persona — it is a person\'s ' },
          { t: 'most authentic story', accent: true },
          { t: ', values, aesthetic, and life experience, extracted and presented through a meticulous system.' },
        ],
      },
      {
        parts: [
          { t: 'Most people have never truly understood themselves. When you begin to see your own ' },
          { t: 'inner core', accent: true },
          { t: ', the world starts to ' },
          { t: 'see your light', accent: true },
          { t: '. That is why TEKUEI exists.' },
        ],
      },
    ],
  },
  founder: {
    label: 'F O U N D E R',
    title: 'Why me',
    name: 'WADE',
    role: 'Brand Curator · TEKUEI',
    image: { slot: 'founder', url: '' },
    signature: { slot: 'founder-signature', url: '' },
    paragraphs: [
      'I am a software engineer with 10 years of coding experience, and within 2 years I built a curation collective from scratch — producing more than 10 exhibitions of all scales.',
      {
        parts: [
          { t: 'During those years in curation, I was surrounded by talented creators whose work was extraordinary — yet they spent most of their energy on the question of "how to be seen." The work had depth and warmth, yet it remained ' },
          { t: 'unseen', accent: true },
          { t: ', because the problem was never in the work itself.' },
        ],
      },
      {
        parts: [
          { t: 'I carry both an engineer\'s ' },
          { t: 'systems thinking', accent: true },
          { t: ' and a curator\'s ' },
          { t: 'aesthetic language', accent: true },
          { t: '. Coding taught me that a great product isn\'t just functional — it makes people want to use it. Curating taught me that great work isn\'t just well-made — it makes people want to walk in and stay.' },
        ],
      },
      {
        parts: [
          { t: 'So TEKUEI was born: to convert the energy of "making" into the power of "' },
          { t: 'being seen', accent: true },
          { t: '" — giving everyone who speaks through their work a place that speaks for them 24 hours a day.' },
        ],
      },
    ],
    traits: [
      'Software Engineering · 10 years',
      'Curation · 10+ exhibitions',
      'Systems Thinking × Aesthetic Language',
    ],
  },
  approach: {
    label: 'A P P R O A C H',
    title: [
      {
        parts: [
          { t: 'From blur to' },
          { t: ' clarity', accent: true },
          { t: '' },
        ],
      },
      {
        parts: [
          { t: 'From creation to' },
          { t: ' commerce', accent: true },
          { t: '' },
        ],
      },
    ],
    items: [
      {
        num: '01',
        title: '人格挖掘',
        en: 'Identity Discovery',
        desc: 'A deep interview to surface your core beliefs, worldview, and narrative arc — so you clearly see what makes you distinctly you.',
      },
      {
        num: '02',
        title: '品牌建構',
        en: 'Brand Architecture',
        desc: 'From your character, we extract a brand manual, visual language, and copywriting style — every detail an extension of who you are.',
      },
      {
        num: '03',
        title: '系統延伸',
        en: 'System Extension',
        desc: 'Social, website, imagery — every external interface flows from one source, holding one consistent presence.',
      },
    ],
  },
  beliefs: {
    label: 'W H A T   W E   B E L I E V E',
    items: [
      {
        num: '01',
        title: 'A brand is a manifestation of character',
        desc: {
          parts: [
            { t: 'A persona can be designed. ' },
            { t: 'Character', accent: true },
            { t: ' cannot be copied. Our goal is to help you become yourself — not what others expect you to be.' },
          ],
        },
      },
      {
        num: '02',
        title: 'Premium comes from consistency',
        desc: 'Visuals, copy, interaction, response — all are part of the brand. Even what isn\'t seen should be designed.',
      },
      {
        num: '03',
        title: 'Become a person of power',
        desc: {
          parts: [
            { t: 'When you truly live from your core, attraction happens naturally. A brand is not just your calling card — it is the reason people ' },
            { t: 'want to come closer', accent: true },
            { t: '.' },
          ],
        },
      },
    ],
  },
  quote: {
    lines: [
      {
        parts: [
          { t: 'When you become' },
          { t: ' a person of true strength', accent: true },
          { t: ',' },
        ],
      },
      'ten thousand people in the world',
      'will want to carry that same energy.',
    ],
    en: 'Let your strength be a light to others.',
  },
  services: [
    'Personal Brand Discovery',
    'Brand Manual',
    'Social Visual Extension',
    'Website Design',
  ],
  cta: {
    label: 'S T A R T   Y O U R   B R A N D',
    title: [
      'If you are ready',
      {
        parts: [
          { t: 'to be' },
          { t: ' truly seen', accent: true },
          { t: ' by the world' },
        ],
      },
    ],
    email: 'tekuei.xx@gmail.com',
  },
}

/** Overlay CMS images onto the EN static content */
export function mergeAboutImages(enContent, cmsContent) {
  if (!cmsContent) return enContent
  return {
    ...enContent,
    founder: {
      ...enContent.founder,
      image: cmsContent.founder?.image ?? enContent.founder.image,
      signature: cmsContent.founder?.signature ?? enContent.founder.signature,
    },
  }
}
