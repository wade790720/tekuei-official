// Tiptap extensions for the journal editor. The node names and attributes match src/lib/postDoc.js,
// which documents the stored format, and PostDoc.jsx, which renders it on the site.
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import { Placeholder } from '@tiptap/extensions'
import { mergeAttributes, Node, ReactNodeViewRenderer } from '@tiptap/react' // re-exports @tiptap/core
import StarterKit from '@tiptap/starter-kit'
import { CodeBlockView, ImageCardView, QuoteView, VideoCardView } from './nodeViews.jsx'

const attr = (name, fallback = '') => ({
  [name]: {
    default: fallback,
    parseHTML: (el) => el.getAttribute(`data-${name}`) ?? fallback,
    renderHTML: (attrs) => ({ [`data-${name}`]: attrs[name] }),
  },
})

/** The opening paragraph of a post, set larger. */
const Lead = Node.create({
  name: 'lead',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p.lead' }],
  renderHTML: ({ HTMLAttributes }) => ['p', mergeAttributes(HTMLAttributes, { class: 'lead' }), 0],
  addCommands() {
    return { setLead: () => ({ commands }) => commands.setNode(this.name) }
  },
})

/** A quote with an optional source line. */
const Quote = Blockquote.extend({
  addAttributes: () => attr('cite'),
  addNodeView: () => ReactNodeViewRenderer(QuoteView),
})

/** A code card: language and an optional file name in its header. */
const CodeCardBlock = CodeBlock.extend({
  addAttributes() {
    return { ...this.parent?.(), ...attr('filename') }
  },
  addNodeView: () => ReactNodeViewRenderer(CodeBlockView),
}).configure({ defaultLanguage: 'ts' })

function card(name, attrs, view) {
  return Node.create({
    name,
    group: 'block',
    atom: true,
    draggable: true,
    addOptions: () => ({ upload: null }),
    addAttributes: () => Object.assign({}, ...Object.entries(attrs).map(([k, v]) => attr(k, v))),
    parseHTML: () => [{ tag: `div[data-type="${name}"]` }],
    renderHTML: ({ HTMLAttributes }) => ['div', mergeAttributes(HTMLAttributes, { 'data-type': name })],
    addNodeView: () => ReactNodeViewRenderer(view),
  })
}

const ImageCard = card('imageCard', { src: '', alt: '', caption: '', frame: false }, ImageCardView)
const VideoCard = card('videoCard', { src: '', poster: '', caption: '', loop: false }, VideoCardView)

/**
 * @param {{ upload: (file: File) => Promise<string>, placeholder: string }} opts
 *   upload stores an image and returns its URL.
 */
export function journalExtensions({ upload, placeholder }) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      blockquote: false,
      codeBlock: false,
      link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
    }),
    Lead,
    Quote,
    CodeCardBlock,
    ImageCard.configure({ upload }),
    VideoCard,
    Placeholder.configure({ placeholder }),
  ]
}
