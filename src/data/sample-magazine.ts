import type { Magazine } from '../types/magazine';

/**
 * Sample issue — MERIDIAN 07, "The Craft Issue".
 *
 * Everything the reader shows is data. Replace this module with a CMS, API or
 * PDF-derived source (see `src/data/providers`) and the reader keeps working
 * unchanged.
 */

/** Deterministic editorial photography (swap for your CDN uploads in production). */
const photo = (seed: string, w: number, h: number, mono = false): string =>
  `https://picsum.photos/seed/${seed}/${w}/${h}${mono ? '?grayscale' : ''}`;

const MASTHEAD = [
  { role: 'Editor-in-Chief', name: 'Ines Marchetti' },
  { role: 'Creative Director', name: 'Tobias Lund' },
  { role: 'Photography', name: 'Ana Reyes Solis' },
  { role: 'Features', name: 'Kwame Boateng' },
  { role: 'Design', name: 'Studio Kōan' },
];

export const sampleMagazine: Magazine = {
  id: 'meridian-07',
  title: 'MERIDIAN',
  tagline: 'A journal of design, craft and slow culture',
  issue: '07',
  issueLabel: 'Issue 07',
  date: 'Autumn / Winter 2026',
  price: '£14 · $18 · €16',
  accent: '#a8452f',
  credits: MASTHEAD,

  cover: {
    image: photo('meridian-cover-07', 1200, 1600),
    badges: ['Issue 07', 'Autumn / Winter 2026'],
    lines: [
      { title: 'The Slow Craft', note: 'Why hands still matter in a machine age' },
      { title: 'Inside Studio Kōan', note: 'Twelve makers, one courtyard, Kyoto' },
      { title: 'The New Analog', note: 'Tools that refuse to be smart' },
      { title: 'Machines That Draw', note: 'On generative line and the human hand' },
    ],
  },

  pages: [
    /* ── 01 ─────────────────────────────────────────────── front cover */
    {
      id: 1,
      type: 'cover',
      title: 'The Slow Craft',
      subtitle: 'Why hands still matter in a machine age',
      image: photo('meridian-cover-07', 1200, 1600),
      content:
        'MERIDIAN Issue 07 — The Craft Issue. Cover story: The Slow Craft, why hands still matter in a machine age.',
      tone: 'paper',
    },

    /* ── 02 ─────────────────────────────────────────────── contents */
    {
      id: 2,
      type: 'contents',
      kicker: 'In this issue',
      title: 'Contents',
      runningHead: 'MERIDIAN · Issue 07',
      tocLabel: 'Contents',
      content:
        'Contents of Issue 07: Editor’s Note, The Slow Craft, Inside Studio Kōan, In Conversation with Ayako Mori, The Ritual of Morning, Machines That Draw, The Silent City, and What We Keep.',
      blocks: [
        {
          kind: 'list',
          items: [
            { primary: 'Editor’s Note', secondary: 'On making things slowly', tertiary: '03' },
            { primary: 'The Slow Craft', secondary: 'Why hands still matter', tertiary: '04' },
            { primary: 'Plate I', secondary: 'The potter’s hands', tertiary: '06' },
            { primary: 'Inside Studio Kōan', secondary: 'Twelve makers, one courtyard', tertiary: '07' },
            { primary: 'In Conversation', secondary: 'Ayako Mori on the long apprenticeship', tertiary: '09' },
            { primary: 'The Ritual of Morning', secondary: 'Lifestyle', tertiary: '10' },
            { primary: 'Machines That Draw', secondary: 'Technology', tertiary: '11' },
            { primary: 'Plate II', secondary: 'Salt air, Setouchi', tertiary: '12' },
            { primary: 'The Silent City', secondary: 'Manga by Kenji Sato', tertiary: '15' },
            { primary: 'What We Keep', secondary: 'Final thoughts', tertiary: '17' },
          ],
        },
        { kind: 'rule', label: 'Also in this issue' },
        {
          kind: 'text',
          columns: 2,
          body: [
            'A studio visit in Kyoto, a week of salt air in the Setouchi islands, and a long argument about what a machine is allowed to make.',
            'Plus: the return of the mechanical pencil, a reading list from the archive, and eleven objects our editors refused to give back.',
          ],
        },
        {
          kind: 'meta',
          title: 'Masthead',
          columns: 2,
          items: MASTHEAD.map(({ role, name }) => ({ label: role, value: name })),
        },
      ],
    },

    /* ── 03 ─────────────────────────────────────────────── editor's note */
    {
      id: 3,
      type: 'editorial',
      kicker: 'Editor’s Note',
      title: 'On Making Things Slowly',
      byline: 'Ines Marchetti · Editor-in-Chief',
      runningHead: 'Editor’s Note',
      tocLabel: 'Editor’s Note',
      content:
        'An editor’s note on slowness, patience and the economics of taking a long time over something small.',
      blocks: [
        {
          kind: 'text',
          columns: 2,
          dropCap: true,
          lead: true,
          body: [
            'There is a moment, somewhere in the third hour of watching a bowl come up out of a lump of clay, when the room goes quiet and the work becomes legible. Nothing is added. Nothing is announced. The shape simply arrives, the way a sentence arrives when you stop forcing it.',
            'We built this issue around that moment. Not because slowness is virtuous — it is often simply expensive — but because it is where quality is decided. Every object in these pages was made by someone who could have stopped earlier and chose not to.',
            'Our cover story follows three workshops through a single season. Ayako Mori, whom we interviewed on page nine, has spent twenty-two years learning to make one kind of lid. She is not nostalgic about it. She is exact.',
            'The technology we cover this month is not the kind that replaces hands. It is the kind that argues with them — drawing machines that make drafts you have to answer, tools that refuse to be smart, software that shows its seams.',
            'Print the pages if you like. Dog-ear them. The whole point of this issue is that things you can hold tend to be handled with more care.',
          ],
        },
        {
          kind: 'quote',
          text: 'The shape simply arrives, the way a sentence arrives when you stop forcing it.',
        },
        { kind: 'rule' },
        {
          kind: 'note',
          label: 'Subscriptions',
          text: 'Four issues a year, printed on 120gsm uncoated stock. Readers in 41 countries.',
        },
      ],
    },

    /* ── 04 ─────────────────────────────────────────────── main feature opener */
    {
      id: 4,
      type: 'feature',
      kicker: 'Cover story',
      title: 'The Slow Craft',
      standfirst:
        'Three workshops, one season, and a stubborn argument about time: why the most advanced thing in the room is still a pair of trained hands.',
      byline: 'Words by Kwame Boateng · Photographs by Ana Reyes Solis',
      image: photo('meridian-feature-slow-craft', 1400, 1750),
      imageCredit: 'Ana Reyes Solis',
      runningHead: 'The Slow Craft',
      tocLabel: 'The Slow Craft',
      tone: 'ink',
      content:
        'Cover story on three workshops — a Kyoto ceramics studio, a Lisbon bindery and a Devon toolmaker — and the economics of taking a long time over something small.',
      blocks: [
        {
          kind: 'figure',
          image: photo('meridian-feature-slow-craft', 1400, 1750),
          bleed: true,
          tone: 'duotone',
          caption: 'Morning light in the throwing room, Kyoto. The kiln has not been switched off since 1994.',
          credit: 'Ana Reyes Solis',
        },
      ],
    },

    /* ── 05 ─────────────────────────────────────────────── feature continuation */
    {
      id: 5,
      type: 'article',
      kicker: 'The Slow Craft · Part II',
      title: 'The Economics of Patience',
      runningHead: 'The Slow Craft',
      content:
        'Feature continuation: how three workshops price their time, and why a longer process can be the cheaper one.',
      blocks: [
        {
          kind: 'text',
          columns: 3,
          dropCap: true,
          lead: true,
          body: [
            'A workshop is a machine for converting patience into objects, and like any machine it has a rate. Ask a maker what something costs and you will usually get a story about time: the drying, the waiting, the second attempt.',
            'In Kyoto, the studio keeps two kilns and one rule — nothing leaves the courtyard until it has sat for a fortnight. “If I look at it every day, I stop seeing it,” says the studio’s founder. “Two weeks makes me a stranger again.”',
            'In Lisbon, a bindery folds every signature by hand before it touches a machine. It is slower. It is also more accurate, because the paper tells you where it wants to go before the machine insists.',
            'In Devon, a toolmaker spends eleven hours on a single plane iron. He is not competing with a factory; he is competing with the version of himself who would have stopped at hour seven.',
          ],
        },
        {
          kind: 'quote',
          text: 'If I look at it every day, I stop seeing it. Two weeks makes me a stranger again.',
          attribution: 'Studio Kōan',
          role: 'Kyoto, est. 1971',
        },
        {
          kind: 'figure',
          image: photo('meridian-feature-hands', 1100, 780),
          tone: 'mono',
          caption: 'Left: burnishing a lid rim. Above: the second attempt, which is almost always the one that stays.',
          credit: 'Ana Reyes Solis',
        },
        {
          kind: 'text',
          columns: 2,
          body: [
            'None of this is romantic, and none of it is cheap. The honest version of the slow argument is an accounting one: you are buying fewer, better decisions, made by someone who was not in a hurry to be finished.',
            'Which is why the most interesting number in this issue is not a price. It is twenty-two years — the time Ayako Mori has spent learning one lid, and the reason it closes with a sound like a held breath.',
          ],
        },
      ],
    },

    /* ── 06 ─────────────────────────────────────────────── full-page photograph */
    {
      id: 6,
      type: 'photography',
      kicker: 'Plate I',
      title: 'The Potter’s Hands',
      image: photo('meridian-plate-hands', 1300, 1700, true),
      imageCredit: 'Ana Reyes Solis',
      caption: 'Kōan studio, north light, 07:40. Hand-built stoneware, unglazed.',
      runningHead: 'Plate I',
      tone: 'ink',
      tocLabel: 'Plate I — The Potter’s Hands',
      content: 'Plate I: black-and-white photograph of a potter’s hands at work in Kyoto.',
      blocks: [
        {
          kind: 'figure',
          image: photo('meridian-plate-hands', 1300, 1700, true),
          bleed: true,
          tone: 'mono',
          caption: 'Kōan studio, north light, 07:40. Hand-built stoneware, unglazed.',
          credit: 'Ana Reyes Solis',
        },
      ],
    },

    /* ── 07 ─────────────────────────────────────────────── spread · left half */
    {
      id: 7,
      type: 'spread',
      kicker: 'Studio visit',
      title: 'Inside Studio Kōan',
      image: photo('meridian-spread-koan', 1500, 1900, true),
      imageCredit: 'Ana Reyes Solis',
      runningHead: 'Inside Studio Kōan',
      tocLabel: 'Inside Studio Kōan',
      tone: 'ink',
      content: 'Studio visit: twelve makers share one courtyard in northern Kyoto.',
      blocks: [
        {
          kind: 'figure',
          image: photo('meridian-spread-koan', 1500, 1900, true),
          bleed: true,
          tone: 'mono',
          caption: 'The courtyard at first light. Kiln two on the left, drying shelves behind.',
          credit: 'Ana Reyes Solis',
        },
      ],
    },

    /* ── 08 ─────────────────────────────────────────────── spread · right half */
    {
      id: 8,
      type: 'spread',
      kicker: 'Studio visit',
      title: 'Twelve Makers, One Courtyard',
      byline: 'Words by Kwame Boateng',
      runningHead: 'Inside Studio Kōan',
      content:
        'Twelve makers share one courtyard in northern Kyoto: how a shared workshop keeps a craft honest.',
      blocks: [
        {
          kind: 'text',
          columns: 2,
          dropCap: true,
          lead: true,
          body: [
            'The courtyard is twenty-two steps across, and on any given morning it holds four conversations about clay, one about lunch and one about whether the second kiln is running hot again.',
            'Studio Kōan was founded in 1971 by a man who disliked meetings and liked shelves. The shelves are still there, numbered, and each of the twelve makers has one. What goes on a shelf is finished. What is on the bench is not.',
            'There is no apprenticeship contract. There is a bench, a key, and the assumption that you will be there on the days that are not interesting.',
          ],
        },
        {
          kind: 'meta',
          title: 'Studio file',
          columns: 2,
          items: [
            { label: 'Founded', value: '1971, Kyoto' },
            { label: 'Makers', value: '12 resident' },
            { label: 'Kilns', value: '2 wood, 1 electric' },
            { label: 'Glaze', value: 'Field ash, no lead' },
            { label: 'Output', value: '~400 pieces a year' },
            { label: 'Waitlist', value: '19 months' },
          ],
        },
        {
          kind: 'text',
          columns: 1,
          body: [
            'Nothing here is scaled. That is the design: a workshop small enough that everyone can see the whole object at every stage, and slow enough that the mistakes stay instructive.',
          ],
        },
      ],
    },

    /* ── 09 ─────────────────────────────────────────────── interview */
    {
      id: 9,
      type: 'interview',
      kicker: 'In Conversation',
      title: 'Ayako Mori',
      standfirst: 'Twenty-two years, one lid, and a quiet war on the word “content”.',
      byline: 'Interview by Ines Marchetti · Portrait by Ana Reyes Solis',
      image: photo('meridian-portrait-ayako', 1000, 1250, true),
      imageCredit: 'Ana Reyes Solis',
      runningHead: 'In Conversation: Ayako Mori',
      tocLabel: 'In Conversation: Ayako Mori',
      content: 'Interview with ceramicist Ayako Mori on apprenticeship, repetition and finishing well.',
      blocks: [
        {
          kind: 'figure',
          image: photo('meridian-portrait-ayako', 1000, 1250, true),
          tone: 'mono',
          caption: 'Ayako Mori in the glaze room. The apron is older than the studio’s youngest maker.',
          credit: 'Ana Reyes Solis',
        },
        {
          kind: 'qa',
          items: [
            {
              q: 'Twenty-two years on one object. What changes?',
              a: 'Everything, and nothing you could photograph. The first five years I was making a shape. The next ten I was making a wall thickness. Now I am making the sound it makes when it closes.',
            },
            {
              q: 'Is repetition boring?',
              a: 'Repetition is only boring if you are repeating. I am not repeating. I am measuring.',
            },
            {
              q: 'You dislike the word “content”.',
              a: 'It describes something that fills a space until the real thing arrives. I make objects. They take up room on purpose.',
            },
            {
              q: 'What do you want from a student?',
              a: 'That they can be bored in a useful way. Everyone can be interested. Being bored, and staying, is a skill.',
            },
            {
              q: 'And the lid?',
              a: 'The lid is finished. In March I will start the next one, which will be worse, and then better.',
            },
          ],
        },
      ],
    },

    /* ── 10 ─────────────────────────────────────────────── lifestyle */
    {
      id: 10,
      type: 'lifestyle',
      kicker: 'Lifestyle',
      title: 'The Ritual of Morning',
      standfirst: 'Four slow minutes before the day gets its hands on you.',
      byline: 'Words by Mira Halvorsen',
      runningHead: 'The Ritual of Morning',
      tocLabel: 'The Ritual of Morning',
      content:
        'Lifestyle: a short essay on the four minutes of the morning that belong to nobody else.',
      blocks: [
        {
          kind: 'text',
          columns: 2,
          dropCap: true,
          lead: true,
          body: [
            'The kettle takes three minutes and forty seconds to come up to temperature on a cold morning, which is the only interval in the day that nobody has asked you about anything.',
            'We have collected morning rituals from nine people who make things for a living. None of them mentioned productivity. Most of them mentioned a specific object: a cup with a chip in the rim, a knife that only cuts bread, a chair that creaks in exactly one place.',
          ],
        },
        {
          kind: 'figure',
          image: photo('meridian-lifestyle-morning', 1100, 800),
          caption: 'Stoneware cup, third attempt. The chip arrived in 2019 and has been forgiven.',
        },
        {
          kind: 'list',
          title: 'Three things our editors keep',
          items: [
            { primary: 'A mechanical pencil', secondary: 'Rotring 600, 0.5mm, brass body', tertiary: '£38' },
            { primary: 'An uncoated notebook', secondary: '120gsm, stitched spine, no ruling', tertiary: '£12' },
            { primary: 'A hand plane', secondary: 'Bronze body, 11 hours of finishing', tertiary: '£410' },
          ],
        },
        {
          kind: 'text',
          columns: 1,
          body: [
            'The argument is not that objects will save you. It is that a small daily ritual with a well-made thing is the cheapest form of attention we have left.',
          ],
        },
      ],
    },

    /* ── 11 ─────────────────────────────────────────────── technology */
    {
      id: 11,
      type: 'technology',
      kicker: 'Technology',
      title: 'Machines That Draw',
      standfirst:
        'A plotter in Rotterdam, a pen plotter in Osaka, and a quiet question about who gets credit for the line.',
      byline: 'Words by Tobias Lund',
      runningHead: 'Machines That Draw',
      tocLabel: 'Machines That Draw',
      content:
        'Technology feature: pen plotters, generative line work, and the argument for tools that show their seams.',
      blocks: [
        {
          kind: 'text',
          columns: 2,
          lead: true,
          dropCap: true,
          body: [
            'The plotter is a 1986 model with a broken lid and a pen carriage that has been repaired twice with parts from a printer nobody remembers. It draws for eleven hours a day, and everything it makes is one continuous line.',
            'Its owner does not call it artificial intelligence. She calls it a collaborator with poor judgement and excellent patience — which, she notes, is also how she describes her first studio assistant.',
          ],
        },
        {
          kind: 'stats',
          title: 'By the numbers',
          items: [
            { label: 'Line length per drawing', display: '2.4 km', value: 0.86 },
            { label: 'Hours per plate', display: '11 h', value: 0.62 },
            { label: 'Pen changes', display: '34', value: 0.44 },
            { label: 'Drawings kept', display: '1 in 9', value: 0.22 },
          ],
        },
        {
          kind: 'figure',
          image: photo('meridian-tech-plotter', 1200, 800),
          tone: 'duotone',
          caption: 'Plate 44 of 120. The wobble at the lower left is the carriage, not the algorithm.',
        },
        {
          kind: 'text',
          columns: 2,
          body: [
            'What makes the work legible is not the code. It is the paper, the ink, the humidity and the fact that the machine is allowed to fail in public.',
            '“A tool that hides its seams is asking me to trust it,” she says. “I would rather see the seam and decide.”',
          ],
        },
        {
          kind: 'note',
          label: 'Read more',
          text: 'The full interview with the plotter’s owner runs in our next issue, alongside a fold-out of Plate 44.',
        },
      ],
    },

    /* ── 12 ─────────────────────────────────────────────── photography */
    {
      id: 12,
      type: 'photography',
      kicker: 'Plate II',
      title: 'Salt Air, Setouchi',
      image: photo('meridian-plate-setouchi', 1400, 1800, true),
      imageCredit: 'Ana Reyes Solis',
      caption: 'Inland sea, 05:52. Six frames, one long exposure, no filtration.',
      runningHead: 'Plate II',
      tone: 'ink',
      tocLabel: 'Plate II — Salt Air',
      content: 'Plate II: black-and-white photograph of the Setouchi inland sea at dawn.',
      blocks: [
        {
          kind: 'figure',
          image: photo('meridian-plate-setouchi', 1400, 1800, true),
          bleed: true,
          tone: 'mono',
          caption: 'Inland sea, 05:52. Six frames, one long exposure, no filtration.',
          credit: 'Ana Reyes Solis',
        },
      ],
    },

    /* ── 13 ─────────────────────────────────────────────── quote page */
    {
      id: 13,
      type: 'quote',
      kicker: 'A word',
      title: 'On Finishing',
      runningHead: 'A Word',
      content:
        'A single quotation: “The work is finished when nothing else can be taken away from it.”',
      blocks: [
        {
          kind: 'quote',
          text: 'The work is finished when nothing else can be taken away from it.',
          attribution: 'Studio Kōan',
          role: 'Founding note, 1971',
        },
        { kind: 'rule' },
        {
          kind: 'text',
          columns: 1,
          body: [
            'Printed on the wall above the second kiln, in pencil, in a hand nobody has claimed.',
          ],
        },
      ],
    },

    /* ── 14 ─────────────────────────────────────────────── advertisement */
    {
      id: 14,
      type: 'advertisement',
      kicker: 'Advertisement',
      title: 'ALTA',
      runningHead: 'ALTA',
      content: 'Advertisement for ALTA chronograph no. 7.',
      blocks: [
        {
          kind: 'ad',
          brand: 'ALTA',
          tagline: 'Chronograph No. 7',
          body: 'Hand-wound. 38mm steel, brushed by hand for forty minutes. One hundred and forty pieces a year, and never more.',
          image: photo('meridian-ad-alta', 1100, 1400),
          cta: 'alta-instruments.com',
          finePrint:
            'Movement: in-house calibre A7, 62-hour reserve. Dial: fired enamel. Made in the Jura valley by nine people.',
        },
      ],
    },

    /* ── 15 ─────────────────────────────────────────────── manga page 1 */
    {
      id: 15,
      type: 'article',
      kicker: 'Manga',
      title: 'The Silent City',
      standfirst: 'A short story told in shadows and ink.',
      byline: 'Story and Art by Kenji Sato',
      runningHead: 'The Silent City',
      tocLabel: 'The Silent City',
      tone: 'paper',
      content: 'A manga story about a silent city.',
      blocks: [
        {
          kind: 'figure',
          image: photo('manga-panel-1', 1200, 800, true),
          tone: 'mono',
          caption: 'The streets were empty. Not even the stray cats remained.',
        },
        {
          kind: 'figure',
          image: photo('manga-panel-2', 1200, 600, true),
          tone: 'mono',
          caption: 'I checked my watch. 3:00 AM. Time had stopped.',
        },
      ],
    },

    /* ── 16 ─────────────────────────────────────────────── manga page 2 */
    {
      id: 16,
      type: 'photography',
      kicker: 'Manga',
      title: 'The Silent City (Conclusion)',
      image: photo('manga-full-page', 1400, 1800, true),
      imageCredit: 'Kenji Sato',
      caption: 'Only the wind remembered.',
      runningHead: 'The Silent City',
      tone: 'ink',
      tocLabel: 'The Silent City (Conclusion)',
      content: 'Conclusion of the manga story.',
      blocks: [
        {
          kind: 'figure',
          image: photo('manga-full-page', 1400, 1800, true),
          bleed: true,
          tone: 'mono',
          caption: 'Only the wind remembered.',
          credit: 'Kenji Sato',
        },
      ],
    },

    /* ── 17 ─────────────────────────────────────────────── final article */
    {
      id: 17,
      type: 'article',
      kicker: 'Final Thoughts',
      title: 'What We Keep',
      standfirst: 'A closing essay on shelves, inheritance and the objects that survive us.',
      byline: 'Words by Ines Marchetti',
      runningHead: 'What We Keep',
      tocLabel: 'What We Keep',
      content:
        'Closing essay on inheritance, shelves, and which objects earn a place in the next house.',
      blocks: [
        {
          kind: 'text',
          columns: 3,
          dropCap: true,
          lead: true,
          body: [
            'Every move is an edit. You put thirty years of objects on a table, and the table makes the argument for you: keep, mend, give away, or carry.',
            'The things that survive are rarely the expensive ones. They are the ones with a repair in them, a visible decision made by someone who wanted the object to continue.',
            'We asked eleven makers which object in their home they would carry out first. Nobody named anything they had bought that year.',
          ],
        },
        {
          kind: 'quote',
          text: 'The things that survive are the ones with a repair in them.',
        },
        { kind: 'rule', label: 'Colophon' },
        {
          kind: 'meta',
          columns: 2,
          items: [
            { label: 'Paper', value: '120gsm uncoated, FSC' },
            { label: 'Typefaces', value: 'Playfair Display, Inter' },
            { label: 'Printed by', value: 'Van der Meer, Ghent' },
            { label: 'Cover stock', value: '300gsm, matt laminate' },
            { label: 'Binding', value: 'Sewn, 8 signatures' },
            { label: 'ISSN', value: '2514-0773' },
          ],
        },
      ],
    },

    /* ── 18 ─────────────────────────────────────────────── back cover */
    {
      id: 18,
      type: 'back-cover',
      kicker: 'Next issue',
      title: 'The Water Issue',
      subtitle: 'On rivers, reservoirs and the design of thirst.',
      runningHead: 'MERIDIAN',
      tone: 'ink',
      content: 'Back cover: Issue 08, The Water Issue — on sale Spring 2026.',
      blocks: [
        {
          kind: 'headline',
          text: 'MERIDIAN',
          level: 'display',
          align: 'left',
        },
        {
          kind: 'text',
          columns: 1,
          body: [
            'A journal of design, craft and slow culture. Published four times a year in Ghent and Kyoto.',
          ],
        },
        { kind: 'rule' },
        {
          kind: 'meta',
          columns: 2,
          items: [
            { label: 'Issue 08', value: 'The Water Issue' },
            { label: 'On sale', value: 'Spring 2026' },
            { label: 'Subscriptions', value: 'meridian.press' },
            { label: 'Price', value: '£14 · $18 · €16' },
          ],
        },
      ],
    },
  ],
};
