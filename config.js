// Everything personal lives here. For a new client: copy the folder, edit this file.
window.REVIEW_CONFIG = {
  name: "Precious",
  fullName: "Precious Omotosho",
  pronoun: { subj: "she", obj: "her", poss: "her" },

  // Paste the Google Apps Script web-app URL here (ends in /exec).
  // While empty, submissions are only saved in the browser (demo mode).
  endpoint:
    "https://script.google.com/macros/s/AKfycbw_J4A9sLLzxRP8GlPMIFNmni_pT9GPC6eZ2aSL3nP-gJt2golTAUQSk5li4_bMUmY/exec",

  // Firebase (main database). Paste the web-app config from the Firebase console.
  // While projectId is empty, answers go to the Google Sheet only.
  firebase: {
    apiKey: "AIzaSyC8CGJgXpw_U2d_NkhOFnfNB4LKrusjjhs",
    authDomain: "curo-precious.firebaseapp.com",
    projectId: "curo-precious",
    appId: "1:85583271165:web:db892e8e5ceb4c41959a94",
  },
  // Precious's login for /wrapped: this email + the passcode she types.
  ownerEmail: "precious@curo.events",
  giftFrom: "your developer",
  wrappedYear: 2026,

  site: "precious.curo.events",
  brand: "curo.events",
  requestUrl: "https://curo.events", // where "Get your own link" goes
  price: "₦100,000",

  photos: {
    hero: "assets/img/hero.jpg",
    smile: "assets/img/smile.jpg",
    power: "assets/img/power.jpg",
    extra: "assets/img/extra.jpg",
  },

  // `role` fills {{role}} in questions, e.g. "as your friend".
  relationships: [
    { id: "best", label: "Best friend", emoji: "👯‍♀️", role: "best friend" },
    { id: "close", label: "Close friend", emoji: "🤞", role: "friend" },
    { id: "casual", label: "Casual friend", emoji: "👋", role: "friend" },
    { id: "family", label: "Family", emoji: "🏡", role: "family" },
    { id: "partner", label: "Partner / bae", emoji: "💘", role: "partner" },
    {
      id: "work",
      label: "Colleague / business",
      emoji: "💼",
      role: "colleague",
    },
    {
      id: "community",
      label: "Church / community",
      emoji: "🙏",
      role: "friend",
    },
  ],

  // type: rating | text | short
  // section: warm (cream) | deep (black) | spicy (terracotta)
  questions: [
    {
      id: "place",
      type: "place",
      section: "intro",
      q: "Where in the world are you <em>writing from?</em> 🌍",
    },
    {
      id: "met",
      type: "met",
      section: "intro",
      q: "What year did you meet {{name}}, and <em>how?</em>",
      placeholder: "Church camp, uni, she sat next to me in JSS1…",
    },

    {
      id: "kind",
      type: "rating",
      section: "warm",
      q: "On a scale of 1 to 10, how <em>kind</em> is {{name}}?",
    },
    {
      id: "loving",
      type: "rating",
      section: "warm",
      q: "How <em>loving</em> is {{obj}}… really?",
    },
    {
      id: "available",
      type: "rating",
      section: "warm",
      q: "How <em>available</em> is {{subj}} when you need {{obj}}?",
    },
    {
      id: "fun",
      type: "rating",
      section: "warm",
      q: "How <em>fun</em> is {{subj}} to be around?",
    },

    {
      id: "words",
      type: "short",
      section: "deep",
      q: "Describe {{name}} in <em>three words</em>.",
      placeholder: "Driven, loud, golden…",
    },
    {
      id: "strength",
      type: "text",
      section: "deep",
      q: "What's {{poss}} biggest <em>strength</em>?",
      placeholder: "The thing everyone notices…",
    },
    {
      id: "love",
      type: "text",
      section: "deep",
      q: "What do you <em>love</em> most about {{obj}}?",
      placeholder: "Go on, make {{obj}} cry on camera.",
    },
    {
      id: "improve",
      type: "text",
      section: "deep",
      q: "One thing {{subj}} could <em>improve</em> on?",
      placeholder: "Kindly. But honestly.",
    },
    {
      id: "showup",
      type: "text",
      section: "deep",
      q: "How would you like {{name}} to <em>show up for you</em> better this new year, as a friend / sister <small>(as the case may be)</small>?",
      placeholder: "Call more? Visit more? Pray with you?",
    },

    {
      id: "single",
      type: "text",
      section: "spicy",
      skippable: true,
      q: "Why do you think {{name}} is <em>still single?</em> 👀",
      placeholder: "No pressure. Lots of pressure.",
    },
    {
      id: "valueadd",
      type: "text",
      section: "spicy",
      skippable: true,
      q: "Be honest: is {{subj}} a <em>value-add</em>, or a little too dependent on you?",
      placeholder: "Speak your truth.",
    },
    {
      id: "meal",
      type: "text",
      section: "spicy",
      skippable: true,
      q: "If {{name}} were a <em>meal</em>, what would {{subj}} be, and <em>why?</em>",
      placeholder: "Party jollof, because she's the life of every gathering…",
    },
    {
      id: "memory",
      type: "text",
      section: "spicy",
      skippable: true,
      q: "A <em>memory</em> {{subj}}'d be shocked you still remember.",
      placeholder: "Spill it.",
    },

    {
      id: "note",
      type: "text",
      section: "warm",
      q: "Last one. Leave {{obj}} a <em>note or a prayer</em> 🙏",
      placeholder: "Dear {{name}}…",
    },
  ],
};
