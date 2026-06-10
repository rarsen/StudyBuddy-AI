// Centralized UI copy for MindSpark in English and Ukrainian.
//
// Lookups are dot-paths (e.g. "nav.dashboard"). Values may be strings,
// arrays, or objects — `translate` interpolates {placeholders} for strings
// and `translatePlural` selects the grammatically correct plural form.

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'uk', label: 'Українська', short: 'УК' },
]

export const DEFAULT_LANGUAGE = 'en'

const en = {
  common: {
    cancel: 'Cancel',
    save: 'Save changes',
    saving: 'Saving…',
    loading: 'Loading…',
  },

  nav: {
    dashboard: 'Dashboard',
    newChat: 'New chat',
    materials: 'Materials',
    newSession: 'New session',
    profile: 'Profile',
    logout: 'Log out',
    signedInAs: 'Signed in as',
    toggleMenu: 'Toggle menu',
  },

  prefs: {
    title: 'Preferences',
    subtitle: 'Personalize how MindSpark looks and speaks to you.',
    theme: 'Theme',
    themeHint: 'Switch between a light and dark interface.',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    languageHint: 'Choose the language for the interface.',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
    selectLanguage: 'Select language',
  },

  subjects: {
    mathematics: 'Mathematics',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    computer_science: 'Computer Science',
    history: 'History',
    literature: 'Literature',
    language: 'Language',
    economics: 'Economics',
    other: 'Other',
  },

  landing: {
    nav: {
      features: 'Features',
      how: 'How it works',
      subjects: 'Subjects',
      faq: 'FAQ',
      signIn: 'Sign in',
      getStarted: 'Get started',
      openDashboard: 'Open dashboard',
    },
    hero: {
      badge: 'AI-powered learning, built for students',
      titleLine1: 'Your personal AI tutor',
      titleLine2: 'that actually explains things.',
      subtitle:
        'MindSpark helps you understand tough topics, prepare for exams, and keep your study sessions organized — across math, physics, history, languages and more. Ask anything, any time, and get clear step-by-step explanations.',
      ctaPrimary: 'Start learning free',
      ctaSecondary: 'I already have an account',
      noCard: 'No credit card needed',
      freeStudents: 'Free for students',
    },
    mock: {
      user: 'Can you explain how photosynthesis actually works?',
      aiIntro:
        "Of course! Photosynthesis is how plants turn sunlight into food. Here's the short version:",
      bullet1: 'Leaves absorb light with chlorophyll',
      bullet2: 'Roots pull up water, pores take in CO₂',
      bullet3: 'The plant makes glucose and releases oxygen',
      aiFollowup: 'Want me to go deeper on the Calvin cycle?',
      placeholder: 'Ask anything about your studies…',
    },
    stats: {
      subjects: 'Subjects supported',
      available: 'Always available',
      questions: 'Unlimited questions',
      response: 'Typical response',
    },
    features: {
      badge: 'Why MindSpark',
      headingA: 'Built to help you ',
      headingHighlight: 'actually learn',
      headingB: ', not just copy answers.',
      subtitle:
        'MindSpark is designed as a tutor — it explains reasoning, adapts to your level, and keeps track of everything you study so you can come back and pick up where you left off.',
      items: [
        {
          title: 'Step-by-step explanations',
          desc: 'Ask for the answer and get the reasoning too — broken down in clear, numbered steps you can follow.',
        },
        {
          title: 'Organized study sessions',
          desc: 'Every conversation is saved and tagged by subject, so you can rebuild your notes any time.',
        },
        {
          title: 'Works across subjects',
          desc: 'Math, physics, chemistry, biology, CS, history, languages, economics and more — one tutor for everything.',
        },
        {
          title: 'Exam-ready practice',
          desc: 'Ask for practice questions, worked examples, or flash-card-style quick reviews before a test.',
        },
        {
          title: 'Remembers context',
          desc: 'Each session remembers what you were discussing — follow-ups make sense instead of starting from zero.',
        },
        {
          title: 'Private by default',
          desc: 'Your account is yours. Chats are stored under your profile so only you can see your study history.',
        },
      ],
    },
    how: {
      badge: 'How it works',
      heading: 'Three steps to a smarter study session',
      steps: [
        {
          title: 'Create your account',
          desc: 'Sign up in seconds with email and password. Your profile keeps your sessions in one place.',
        },
        {
          title: 'Start a study session',
          desc: "Ask a question — anything from 'help me understand integrals' to 'quiz me on the French Revolution'.",
        },
        {
          title: 'Learn, review, revisit',
          desc: 'Every chat is saved, searchable and organized by subject, so revision is just one click away.',
        },
      ],
    },
    subjectsSection: {
      badge: 'Subjects',
      headingA: 'One tutor. ',
      headingHighlight: 'Every subject.',
      paragraph:
        "Whether you're stuck on calculus homework, writing an essay on WWII, debugging a Python program, or trying to memorize Spanish verbs — MindSpark adapts to the subject and meets you at your level.",
      tryAsking: 'Try asking:',
      cards: [
        { t: "Explain like I'm 12", s: 'Any topic, plain language.' },
        { t: 'Solve with steps', s: 'Never just the final answer.' },
        { t: 'Quiz me', s: 'Practice questions on demand.' },
        { t: 'Summarize', s: 'Turn a chapter into notes.' },
      ],
    },
    faq: {
      badge: 'FAQ',
      heading: 'Questions we hear a lot',
      items: [
        {
          q: 'Is MindSpark free?',
          a: 'Yes — creating an account and using MindSpark for your studies is free. No credit card required.',
        },
        {
          q: 'What can I ask it?',
          a: 'Anything in the subjects we support: explanations, worked examples, summaries, practice questions, definitions, essay outlines, code help, and more.',
        },
        {
          q: 'Will it just give me the answer?',
          a: "MindSpark is designed as a tutor, so it prefers to walk you through reasoning step by step. You'll actually learn, not just copy.",
        },
        {
          q: 'Are my conversations private?',
          a: 'Your sessions are stored under your account and only visible to you. You can delete any session from your dashboard.',
        },
      ],
    },
    cta: {
      heading: 'Ready to study smarter?',
      subtitle: 'Create a free account and start your first session in under a minute.',
      primary: 'Create free account',
      secondary: 'Sign in instead',
    },
    footer: {
      tagline: 'Educational project',
      features: 'Features',
      faq: 'FAQ',
      signIn: 'Sign in',
    },
  },

  auth: {
    backToHome: 'Back to home',
    brandFooter: 'Educational project · Made for students',
    login: {
      brandTitle: 'Welcome back.',
      brandSubtitle: 'Pick up your study session right where you left off.',
      brandHighlights: [
        'All your past chats waiting for you',
        'Continue any subject in one click',
        'Fast, private, and always on',
      ],
      title: 'Sign in to MindSpark',
      subtitle: "Welcome back — let's keep learning.",
      identifier: 'Email or username',
      password: 'Password',
      show: 'Show',
      hide: 'Hide',
      submit: 'Sign in',
      submitting: 'Signing in…',
      noAccount: 'New to MindSpark?',
      createAccount: 'Create an account',
      failed: 'Login failed. Please try again.',
    },
    register: {
      brandTitle: 'Start learning smarter.',
      brandSubtitle:
        'Create your free account and unlock your personal AI tutor across every subject.',
      brandHighlights: [
        'Unlimited questions, 24/7',
        'Sessions saved and searchable',
        'Works for homework, revision, and exams',
      ],
      title: 'Create your account',
      subtitle: 'Takes less than a minute.',
      email: 'Email',
      username: 'Username',
      fullName: 'Full name',
      fullNamePlaceholder: 'Optional',
      password: 'Password',
      passwordPlaceholder: 'At least 8 characters',
      show: 'Show',
      hide: 'Hide',
      strengthPrefix: 'Strength:',
      strength: ['Too short', 'Weak', 'Okay', 'Good', 'Strong', 'Excellent'],
      submit: 'Create free account',
      submitting: 'Creating account…',
      terms: 'By signing up, you agree to our educational use terms.',
      haveAccount: 'Already have an account?',
      signIn: 'Sign in',
      pwTooShort: 'Password must be at least 8 characters long',
      failed: 'Registration failed. Please try again.',
    },
  },

  dashboard: {
    badge: 'Ready when you are',
    welcomeNamed: 'Welcome back, {name}.',
    welcome: 'Welcome back.',
    subtitle: 'Pick up a past session or start something new — MindSpark is ready to help.',
    startNew: 'Start new session',
    statSessions: 'Study sessions',
    statMessages: 'Messages',
    statSubjects: 'Subjects',
    heading: 'Your study sessions',
    searchPlaceholder: 'Search sessions…',
    allSubjects: 'All subjects',
    emptyTitle: 'No study sessions yet',
    emptyDesc:
      'Start your first session — ask anything from a homework problem to "explain quantum tunneling".',
    emptyCta: 'Create your first session',
    noMatch: 'No sessions match your filters.',
    messagesCount: { one: '{count} message', other: '{count} messages' },
  },

  chat: {
    newSession: 'New study session',
    askToStart: 'Ask anything to start',
    groundedOn: 'Grounded on {title}',
    groundedTitle: 'Answers will cite "{title}"',
    backAria: 'Back to dashboard',
    emptyTitle: "Let's start learning",
    emptySubtitle: 'Ask anything — or pick a prompt below to get going.',
    uploadCta: 'Upload your notes to get cited answers',
    suggestions: [
      'Explain photosynthesis in simple terms',
      'Help me understand quadratic equations',
      'What are the causes of World War I?',
      'Walk me through recursion with an example',
      'What is the difference between acids and bases?',
      'Quiz me on Spanish verb conjugation',
    ],
    placeholder: 'Ask anything about your studies…',
    sendAria: 'Send',
    tokens: '{count} tokens',
    enterHint1: 'to send',
    enterHint2: 'for new line',
    failed: 'Failed to send message. Please try again.',
  },

  citations: {
    sources: { one: '{count} source', other: '{count} sources' },
    documentFallback: 'Document #{id}',
    similarity: 'similarity {score}',
    sourceTitle: 'Source [{n}] — open sources below',
  },

  documents: {
    heading: 'Your materials',
    subtitle: 'Upload notes, textbooks, or papers. MindSpark will cite them inline when answering.',
    statReady: 'Ready',
    statIndexing: 'Indexing',
    statChunks: 'Chunks',
    dropTitle: 'Drop a study document',
    dropDesc: 'PDF, TXT, or Markdown · up to 15 MB. Your files stay in your account.',
    chooseFile: 'Choose a file',
    library: 'Library',
    empty: 'No documents yet. Drop one above to get started.',
    chatAbout: 'Chat about this',
    previewTitle: 'Preview chunks',
    deleteTitle: 'Delete',
    chunksCount: { one: '{count} chunk', other: '{count} chunks' },
    status: {
      pending: 'pending',
      processing: 'processing',
      ready: 'ready',
      failed: 'failed',
    },
    uploadTitle: 'Upload document',
    titleLabel: 'Title',
    titlePlaceholder: 'e.g. Calculus II lecture notes',
    subjectLabel: 'Subject',
    uploading: 'Uploading… {progress}%',
    processing: 'Processing & embedding…',
    upload: 'Upload',
    uploadFailed: 'Upload failed. Please try again.',
    firstChunks: 'First {count} chunks',
    noChunks: 'No chunks available yet.',
    charsCount: '{count}k chars',
    tokShort: '{count} tok',
    pagePrefix: 'page {page} · ',
    pageShort: 'p. {page}',
    deleteConfirm: 'Delete "{title}" and all its embeddings?',
    deleteFailed: 'Delete failed',
    couldNotStart: 'Could not start session',
    chatTitlePrefix: 'Chat about {title}',
  },

  profile: {
    active: 'Active',
    inactive: 'Inactive',
    accountInfo: 'Account information',
    accountInfoSub: 'Update your personal details',
    editProfile: 'Edit profile',
    email: 'Email',
    username: 'Username',
    fullName: 'Full name',
    notProvided: 'Not provided',
    newPassword: 'New password',
    pwPlaceholder: 'Leave empty to keep current password',
    pwHint: 'Minimum 8 characters. Leave empty to keep current password.',
    accountDetails: 'Account details',
    status: 'Status',
    role: 'Role',
    memberSince: 'Member since',
    lastLogin: 'Last login',
    na: 'N/A',
    success: 'Profile updated successfully!',
    pwShort: 'Password must be at least 8 characters',
    noChanges: 'No changes to save',
    updateFailed: 'Failed to update profile',
  },
}

const uk = {
  common: {
    cancel: 'Скасувати',
    save: 'Зберегти зміни',
    saving: 'Збереження…',
    loading: 'Завантаження…',
  },

  nav: {
    dashboard: 'Панель',
    newChat: 'Новий чат',
    materials: 'Матеріали',
    newSession: 'Нова сесія',
    profile: 'Профіль',
    logout: 'Вийти',
    signedInAs: 'Ви увійшли як',
    toggleMenu: 'Перемкнути меню',
  },

  prefs: {
    title: 'Налаштування',
    subtitle: 'Налаштуйте, як MindSpark виглядає та якою мовою спілкується.',
    theme: 'Тема',
    themeHint: 'Перемикайтеся між світлим і темним інтерфейсом.',
    light: 'Світла',
    dark: 'Темна',
    language: 'Мова',
    languageHint: 'Оберіть мову інтерфейсу.',
    switchToDark: 'Увімкнути темну тему',
    switchToLight: 'Увімкнути світлу тему',
    selectLanguage: 'Обрати мову',
  },

  subjects: {
    mathematics: 'Математика',
    physics: 'Фізика',
    chemistry: 'Хімія',
    biology: 'Біологія',
    computer_science: "Інформатика",
    history: 'Історія',
    literature: 'Література',
    language: 'Мови',
    economics: 'Економіка',
    other: 'Інше',
  },

  landing: {
    nav: {
      features: 'Можливості',
      how: 'Як це працює',
      subjects: 'Предмети',
      faq: 'Питання',
      signIn: 'Увійти',
      getStarted: 'Почати',
      openDashboard: 'Відкрити панель',
    },
    hero: {
      badge: 'Навчання на основі ШІ, створене для студентів',
      titleLine1: 'Ваш персональний ШІ-репетитор,',
      titleLine2: 'який справді все пояснює.',
      subtitle:
        'MindSpark допомагає зрозуміти складні теми, підготуватися до іспитів і тримати ваші навчальні сесії впорядкованими — з математики, фізики, історії, мов та інших предметів. Запитуйте будь-що й будь-коли та отримуйте чіткі покрокові пояснення.',
      ctaPrimary: 'Почати навчання безкоштовно',
      ctaSecondary: 'У мене вже є акаунт',
      noCard: 'Картка не потрібна',
      freeStudents: 'Безкоштовно для студентів',
    },
    mock: {
      user: 'Можеш пояснити, як насправді працює фотосинтез?',
      aiIntro:
        'Звісно! Фотосинтез — це те, як рослини перетворюють сонячне світло на їжу. Коротко:',
      bullet1: 'Листя поглинає світло за допомогою хлорофілу',
      bullet2: 'Коріння вбирає воду, продихи поглинають CO₂',
      bullet3: 'Рослина утворює глюкозу й виділяє кисень',
      aiFollowup: 'Хочеш, щоб я детальніше розповів про цикл Кальвіна?',
      placeholder: 'Запитайте будь-що про ваше навчання…',
    },
    stats: {
      subjects: 'Підтримуваних предметів',
      available: 'Завжди доступний',
      questions: 'Необмежено запитань',
      response: 'Типова відповідь',
    },
    features: {
      badge: 'Чому MindSpark',
      headingA: 'Створено, щоб ви ',
      headingHighlight: 'справді навчалися',
      headingB: ', а не просто копіювали відповіді.',
      subtitle:
        'MindSpark створений як репетитор — він пояснює хід міркувань, підлаштовується під ваш рівень і зберігає все, що ви вивчаєте, щоб ви могли повернутися й продовжити з того місця, де зупинилися.',
      items: [
        {
          title: 'Покрокові пояснення',
          desc: 'Запитайте відповідь — і отримайте також міркування, розкладені на чіткі, пронумеровані кроки.',
        },
        {
          title: 'Упорядковані навчальні сесії',
          desc: 'Кожна розмова зберігається й позначається за предметом, тож ви будь-коли можете відновити свої нотатки.',
        },
        {
          title: 'Працює з усіма предметами',
          desc: 'Математика, фізика, хімія, біологія, інформатика, історія, мови, економіка та інше — один репетитор для всього.',
        },
        {
          title: 'Підготовка до іспитів',
          desc: 'Попросіть практичні завдання, розв’язані приклади або швидке повторення у форматі карток перед тестом.',
        },
        {
          title: 'Пам’ятає контекст',
          desc: 'Кожна сесія пам’ятає, про що ви говорили, — уточнення мають сенс, а не починаються з нуля.',
        },
        {
          title: 'Приватність за замовчуванням',
          desc: 'Ваш акаунт — ваш. Чати зберігаються у вашому профілі, тож історію навчання бачите лише ви.',
        },
      ],
    },
    how: {
      badge: 'Як це працює',
      heading: 'Три кроки до розумнішої навчальної сесії',
      steps: [
        {
          title: 'Створіть акаунт',
          desc: 'Зареєструйтеся за секунди за допомогою email і пароля. Ваш профіль зберігає всі сесії в одному місці.',
        },
        {
          title: 'Розпочніть навчальну сесію',
          desc: 'Поставте запитання — від «допоможи зрозуміти інтеграли» до «влаштуй мені тест із Французької революції».',
        },
        {
          title: 'Навчайтеся, повторюйте, повертайтеся',
          desc: 'Кожен чат зберігається, доступний для пошуку й упорядкований за предметом, тож повторення — за один клік.',
        },
      ],
    },
    subjectsSection: {
      badge: 'Предмети',
      headingA: 'Один репетитор. ',
      headingHighlight: 'Усі предмети.',
      paragraph:
        'Чи застрягли ви над домашкою з математики, пишете есе про Другу світову, налагоджуєте програму на Python чи вчите іспанські дієслова — MindSpark підлаштовується під предмет і ваш рівень.',
      tryAsking: 'Спробуйте запитати:',
      cards: [
        { t: 'Поясни, як 12-річному', s: 'Будь-яка тема простою мовою.' },
        { t: 'Розв’яжи з кроками', s: 'Ніколи лише фінальна відповідь.' },
        { t: 'Влаштуй мені тест', s: 'Практичні запитання за запитом.' },
        { t: 'Підсумуй', s: 'Перетвори розділ на нотатки.' },
      ],
    },
    faq: {
      badge: 'Питання',
      heading: 'Питання, які ми чуємо найчастіше',
      items: [
        {
          q: 'MindSpark безкоштовний?',
          a: 'Так — створення акаунта й користування MindSpark для навчання безкоштовне. Картка не потрібна.',
        },
        {
          q: 'Що я можу запитувати?',
          a: 'Будь-що з підтримуваних предметів: пояснення, розв’язані приклади, підсумки, практичні запитання, визначення, плани есе, допомогу з кодом тощо.',
        },
        {
          q: 'Він просто дасть мені відповідь?',
          a: 'MindSpark створений як репетитор, тож він радше проведе вас через міркування крок за кроком. Ви справді навчатиметеся, а не просто копіюватимете.',
        },
        {
          q: 'Чи приватні мої розмови?',
          a: 'Ваші сесії зберігаються у вашому акаунті й видимі лише вам. Будь-яку сесію можна видалити з панелі.',
        },
      ],
    },
    cta: {
      heading: 'Готові навчатися розумніше?',
      subtitle: 'Створіть безкоштовний акаунт і почніть першу сесію менш ніж за хвилину.',
      primary: 'Створити безкоштовний акаунт',
      secondary: 'Натомість увійти',
    },
    footer: {
      tagline: 'Навчальний проєкт',
      features: 'Можливості',
      faq: 'Питання',
      signIn: 'Увійти',
    },
  },

  auth: {
    backToHome: 'На головну',
    brandFooter: 'Навчальний проєкт · Створено для студентів',
    login: {
      brandTitle: 'З поверненням.',
      brandSubtitle: 'Продовжте навчальну сесію саме там, де зупинилися.',
      brandHighlights: [
        'Усі ваші минулі чати чекають на вас',
        'Продовжуйте будь-який предмет в один клік',
        'Швидко, приватно й завжди на зв’язку',
      ],
      title: 'Увійти до MindSpark',
      subtitle: 'З поверненням — продовжуймо навчання.',
      identifier: 'Email або імʼя користувача',
      password: 'Пароль',
      show: 'Показати',
      hide: 'Сховати',
      submit: 'Увійти',
      submitting: 'Вхід…',
      noAccount: 'Уперше в MindSpark?',
      createAccount: 'Створити акаунт',
      failed: 'Не вдалося увійти. Спробуйте ще раз.',
    },
    register: {
      brandTitle: 'Починайте навчатися розумніше.',
      brandSubtitle:
        'Створіть безкоштовний акаунт і відкрийте персонального ШІ-репетитора з усіх предметів.',
      brandHighlights: [
        'Необмежено запитань, цілодобово',
        'Сесії зберігаються й доступні для пошуку',
        'Підходить для домашки, повторення й іспитів',
      ],
      title: 'Створіть акаунт',
      subtitle: 'Це займе менше хвилини.',
      email: 'Email',
      username: 'Імʼя користувача',
      fullName: 'Повне імʼя',
      fullNamePlaceholder: 'Необовʼязково',
      password: 'Пароль',
      passwordPlaceholder: 'Щонайменше 8 символів',
      show: 'Показати',
      hide: 'Сховати',
      strengthPrefix: 'Надійність:',
      strength: ['Закоротко', 'Слабкий', 'Помірний', 'Добрий', 'Надійний', 'Відмінний'],
      submit: 'Створити безкоштовний акаунт',
      submitting: 'Створення акаунта…',
      terms: 'Реєструючись, ви погоджуєтеся з умовами навчального використання.',
      haveAccount: 'Уже маєте акаунт?',
      signIn: 'Увійти',
      pwTooShort: 'Пароль має містити щонайменше 8 символів',
      failed: 'Не вдалося зареєструватися. Спробуйте ще раз.',
    },
  },

  dashboard: {
    badge: 'Готові, коли ви готові',
    welcomeNamed: 'З поверненням, {name}.',
    welcome: 'З поверненням.',
    subtitle: 'Продовжте минулу сесію або почніть нову — MindSpark готовий допомогти.',
    startNew: 'Почати нову сесію',
    statSessions: 'Навчальні сесії',
    statMessages: 'Повідомлення',
    statSubjects: 'Предмети',
    heading: 'Ваші навчальні сесії',
    searchPlaceholder: 'Пошук сесій…',
    allSubjects: 'Усі предмети',
    emptyTitle: 'Поки що немає навчальних сесій',
    emptyDesc:
      'Почніть першу сесію — запитайте будь-що: від задачі з домашки до «поясни квантове тунелювання».',
    emptyCta: 'Створити першу сесію',
    noMatch: 'Немає сесій за вашими фільтрами.',
    messagesCount: {
      one: '{count} повідомлення',
      few: '{count} повідомлення',
      many: '{count} повідомлень',
    },
  },

  chat: {
    newSession: 'Нова навчальна сесія',
    askToStart: 'Запитайте будь-що, щоб почати',
    groundedOn: 'На основі {title}',
    groundedTitle: 'Відповіді цитуватимуть «{title}»',
    backAria: 'Назад до панелі',
    emptyTitle: 'Почнімо навчання',
    emptySubtitle: 'Запитайте будь-що — або оберіть підказку нижче, щоб почати.',
    uploadCta: 'Завантажте свої нотатки, щоб отримувати відповіді з цитуванням',
    suggestions: [
      'Поясни фотосинтез простими словами',
      'Допоможи зрозуміти квадратні рівняння',
      'Які причини Першої світової війни?',
      'Проведи мене через рекурсію на прикладі',
      'Яка різниця між кислотами й основами?',
      'Влаштуй мені тест зі іспанських дієслів',
    ],
    placeholder: 'Запитайте будь-що про ваше навчання…',
    sendAria: 'Надіслати',
    tokens: '{count} токенів',
    enterHint1: 'щоб надіслати',
    enterHint2: 'новий рядок',
    failed: 'Не вдалося надіслати повідомлення. Спробуйте ще раз.',
  },

  citations: {
    sources: {
      one: '{count} джерело',
      few: '{count} джерела',
      many: '{count} джерел',
    },
    documentFallback: 'Документ #{id}',
    similarity: 'схожість {score}',
    sourceTitle: 'Джерело [{n}] — відкрити джерела нижче',
  },

  documents: {
    heading: 'Ваші матеріали',
    subtitle:
      'Завантажуйте нотатки, підручники чи статті. MindSpark цитуватиме їх прямо у відповідях.',
    statReady: 'Готові',
    statIndexing: 'Індексація',
    statChunks: 'Фрагменти',
    dropTitle: 'Перетягніть навчальний документ',
    dropDesc: 'PDF, TXT або Markdown · до 15 МБ. Ваші файли залишаються у вашому акаунті.',
    chooseFile: 'Обрати файл',
    library: 'Бібліотека',
    empty: 'Поки що немає документів. Перетягніть один вище, щоб почати.',
    chatAbout: 'Обговорити це',
    previewTitle: 'Переглянути фрагменти',
    deleteTitle: 'Видалити',
    chunksCount: {
      one: '{count} фрагмент',
      few: '{count} фрагменти',
      many: '{count} фрагментів',
    },
    status: {
      pending: 'очікує',
      processing: 'обробка',
      ready: 'готово',
      failed: 'помилка',
    },
    uploadTitle: 'Завантажити документ',
    titleLabel: 'Назва',
    titlePlaceholder: 'напр. Конспект з аналізу II',
    subjectLabel: 'Предмет',
    uploading: 'Завантаження… {progress}%',
    processing: 'Обробка та індексація…',
    upload: 'Завантажити',
    uploadFailed: 'Не вдалося завантажити. Спробуйте ще раз.',
    firstChunks: 'Перші {count} фрагментів',
    noChunks: 'Фрагментів поки немає.',
    charsCount: '{count}тис. символів',
    tokShort: '{count} ток.',
    pagePrefix: 'стор. {page} · ',
    pageShort: 'стор. {page}',
    deleteConfirm: 'Видалити «{title}» та всі його ембединги?',
    deleteFailed: 'Не вдалося видалити',
    couldNotStart: 'Не вдалося розпочати сесію',
    chatTitlePrefix: 'Обговорення: {title}',
  },

  profile: {
    active: 'Активний',
    inactive: 'Неактивний',
    accountInfo: 'Інформація акаунта',
    accountInfoSub: 'Оновіть свої особисті дані',
    editProfile: 'Редагувати профіль',
    email: 'Email',
    username: 'Імʼя користувача',
    fullName: 'Повне імʼя',
    notProvided: 'Не вказано',
    newPassword: 'Новий пароль',
    pwPlaceholder: 'Залиште порожнім, щоб зберегти поточний пароль',
    pwHint: 'Щонайменше 8 символів. Залиште порожнім, щоб зберегти поточний пароль.',
    accountDetails: 'Деталі акаунта',
    status: 'Статус',
    role: 'Роль',
    memberSince: 'З нами від',
    lastLogin: 'Останній вхід',
    na: 'Н/Д',
    success: 'Профіль успішно оновлено!',
    pwShort: 'Пароль має містити щонайменше 8 символів',
    noChanges: 'Немає змін для збереження',
    updateFailed: 'Не вдалося оновити профіль',
  },
}

export const translations = { en, uk }

function resolve(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

function interpolate(str, vars) {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (match, key) =>
    vars[key] != null ? String(vars[key]) : match,
  )
}

// Resolve a dot-path, falling back to English then to the raw key.
export function translate(lang, path, vars) {
  let value = resolve(translations[lang], path)
  if (value === undefined) value = resolve(translations.en, path)
  if (value === undefined) return path
  return typeof value === 'string' ? interpolate(value, vars) : value
}

// Slavic plural rule for Ukrainian; English collapses to one/other.
function pluralCategory(lang, n) {
  const count = Math.abs(n)
  if (lang === 'uk') {
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 === 1 && mod100 !== 11) return 'one'
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few'
    return 'many'
  }
  return count === 1 ? 'one' : 'other'
}

export function translatePlural(lang, path, count, vars) {
  const forms = resolve(translations[lang], path) || resolve(translations.en, path)
  if (!forms || typeof forms !== 'object') return String(count)
  const category = pluralCategory(lang, count)
  const template = forms[category] || forms.other || forms.many || forms.one || ''
  return interpolate(template, { count, ...vars })
}
