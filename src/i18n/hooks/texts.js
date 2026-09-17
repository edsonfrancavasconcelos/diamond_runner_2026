

export const welcomeTexts = {
  BR: { loginButton: 'Sou Diamond Runner', registerButton: 'Quero ser Diamond Runner', changeCountryButton: 'Mudar País', back: 'Voltar' },
  ES: { loginButton: 'Soy Diamond Runner', registerButton: 'Quiero ser Diamond Runner', changeCountryButton: 'Cambiar País', back: 'Volver' },
  EN: { loginButton: 'I am Diamond Runner', registerButton: 'I want to be Diamond Runner', changeCountryButton: 'Change Country', back: 'Back' },
};

export const loginTexts = {
  BR: { title: 'Portal Diamond', subtitle: 'Acesse sua conta para gerenciar seus ativos.', login: 'ID_DR ou E-mail', password: 'Senha', enterButton: 'Entrar', forgotPassword: 'Esqueceu a senha?', firstAccess: 'Primeiro acesso', alertInvalid: 'Credenciais inválidas' },
  EN: { title: 'Diamond Portal', subtitle: 'Access your account to manage your assets.', login: 'ID_DR or Email', password: 'Password', enterButton: 'Login', forgotPassword: 'Forgot password?', firstAccess: 'First access', alertInvalid: 'Invalid credentials' },
  ES: { title: 'Portal Diamond', subtitle: 'Acceda a su cuenta para gestionar sus activos.', login: 'ID_DR o Correo', password: 'Contraseña', enterButton: 'Entrar', forgotPassword: '¿Olvidó su contraseña?', firstAccess: 'Primer acceso', alertInvalid: 'Credenciales inválidas' }
};
export const runnerRegisterTexts = {
  BR: {
    title: "Cadastro Executivo",
    subtitle: "Preencha seus dados oficiais para emissão da licença.",
    referredBy: "INDICADO POR",
    system: "SISTEMA",
    labelName: "NOME COMPLETO",
    labelEmail: "E-MAIL INSTITUCIONAL",
    labelBirth: "NASCIMENTO",
    labelDoc: "DOCUMENTO",
    labelPhone: "TELEFONE / WHATSAPP",
    name: "Digite seu nome",
    email: "exemplo@email.com",
    document: "CPF ou ID",
    phone: "+55 00 00000-0000",
    continue: "Continuar para pagamento",
    securityNote: "Seus dados estão protegidos com criptografia SSL 256-bit.",
  },
  EN: {
    title: "Executive Registration",
    subtitle: "Fill in your official details for license issuance.",
    referredBy: "REFERRED BY",
    system: "SYSTEM",
    labelName: "FULL NAME",
    labelEmail: "INSTITUTIONAL EMAIL",
    labelBirth: "BIRTH DATE",
    labelDoc: "DOCUMENT / ID",
    labelPhone: "PHONE / WHATSAPP",
    name: "Enter your full name",
    email: "example@email.com",
    document: "ID or Passport",
    phone: "+1 000 000-0000",
    continue: "Continue to payment",
    securityNote: "Your data is protected with SSL 256-bit encryption.",
  },
  ES: {
    title: "Registro Ejecutivo",
    subtitle: "Complete sus datos oficiales para la emisión de la licencia.",
    referredBy: "REFERIDO POR",
    system: "SISTEMA",
    labelName: "NOMBRE COMPLETO",
    labelEmail: "CORREO INSTITUCIONAL",
    labelBirth: "FECHA DE NACIMIENTO",
    labelDoc: "DOCUMENTO / DNI",
    labelPhone: "TELÉFONO / WHATSAPP",
    name: "Nombre completo",
    email: "ejemplo@correo.com",
    document: "DNI o Pasaporte",
    phone: "+34 000 000 000",
    continue: "Continuar al pago",
    securityNote: "Sus datos están protegidos con cifrado SSL 256-bit.",
  }
};


export const firstAccessTexts = {
  BR: { 
    title: 'ATIVAR ACESSO', idLabel: 'IDENTIFICADOR ATIVO', passLabel: 'NOVA SENHA EXECUTIVA', confirmLabel: 'CONFIRMAR SENHA', button: 'CONCLUIR ATIVAÇÃO',
    errorTitle: 'Erro', fillAllFields: 'Preencha todos os campos', passwordMin: 'A senha deve ter no mínimo 6 caracteres', passwordMismatch: 'As senhas não coincidem', 
    successTitle: 'ATIVAÇÃO CONCLUÍDA', successMessage: 'Sua chave executiva foi configurada. Bem-vindo!', enterButton: 'ENTRAR NO OFFICE', securityAuth: 'SISTEMA PROTEGIDO POR SUPABASE AUTH'
  },
  EN: { 
    title: 'ACTIVATE ACCESS', idLabel: 'ACTIVE IDENTIFIER', passLabel: 'NEW EXECUTIVE PASSWORD', confirmLabel: 'CONFIRM PASSWORD', button: 'COMPLETE ACTIVATION',
    errorTitle: 'Error', fillAllFields: 'Fill in all fields', passwordMin: 'Password must be at least 6 characters', passwordMismatch: 'Passwords do not match', 
    successTitle: 'ACTIVATION COMPLETED', successMessage: 'Your executive key has been configured. Welcome!', enterButton: 'ENTER OFFICE', securityAuth: 'SYSTEM PROTECTED BY SUPABASE AUTH'
  },
  ES: { 
    title: 'ACTIVAR ACCESO', idLabel: 'ACTIVADOR ACTIVO', passLabel: 'NUEVA CONTRASEÑA EJECUTIVA', confirmLabel: 'CONFIRMAR CONTRASEÑA', button: 'CONCLUIR ACTIVACIÓN',
    errorTitle: 'Error', fillAllFields: 'Complete todos los campos', passwordMin: 'La contraseña debe tener al menos 6 caracteres', passwordMismatch: 'Las contraseñas no coinciden', 
    successTitle: 'ACTIVACIÓN COMPLETADA', successMessage: 'Su clave ejecutiva ha sido configurada. ¡Bienvenido!', enterButton: 'ENTRAR AL OFFICE', securityAuth: 'SISTEMA PROTEGIDO POR SUPABASE AUTH'
  },
};

export const chooseSponsorTexts = {
  BR: { tagline: 'Etapa de Admissão', title: 'Escolher Patrocinador', subtitle: 'Selecione sua forma de entrada no ecossistema Diamond.', hasSponsor: 'Já tenho patrocinador', noSponsor: 'Não tenho patrocinador', selectedCountry: 'País selecionado', back: 'Voltar', footer: 'Protocolos de Afiliação Ativos 2026' },
  ES: { tagline: 'Etapa de Admisión', title: 'Elegir Patrocinador', subtitle: 'Selecciona tu forma de entrar en el ecosistema Diamond.', hasSponsor: 'Ya tengo patrocinador', noSponsor: 'No tengo patrocinador', selectedCountry: 'País seleccionado', back: 'Volver', footer: 'Protocolos de Afiliación Ativos 2026' },
  EN: { tagline: 'Admission Step', title: 'Choose Sponsor', subtitle: 'Select your way to enter the Diamond ecosystem.', hasSponsor: 'I already have a sponsor', noSponsor: "I don't have a sponsor", selectedCountry: 'Selected country', back: 'Back', footer: 'Active Affiliation Protocols 2026' },
};

export const hasSponsorTexts = {
  BR: { headerTag: 'VALIDAÇÃO', title: 'QUEM INDICOU VOCÊ?', subtitle: 'Insira as credenciais do seu patrocinador.', labelId: 'ID DO PATROCINADOR', sponsorId: 'ID_DR do patrocinador', labelName: 'NOME DO PATROCINADOR', sponsorName: 'Nome completo', continue: 'Continuar', infoNote: 'O código de indicação é obrigatório.' },
  EN: { headerTag: 'VALIDATION', title: 'WHO REFERRED YOU?', subtitle: 'Enter your sponsor credentials to proceed.', labelId: 'SPONSOR ID', sponsorId: 'Sponsor ID_DR', labelName: 'SPONSOR NAME', sponsorName: 'Full name', continue: 'Continue', infoNote: 'Referral code is mandatory.' },
  ES: { headerTag: 'VALIDACIÓN', title: '¿QUIÉN TE RECOMIENDA?', subtitle: 'Ingrese las credenciales de su patrocinador.', labelId: 'ID PATROCINADOR', sponsorId: 'ID_DR del patrocinador', labelName: 'NOMBRE PATROCINADOR', sponsorName: 'Nombre completo', continue: 'Continuar', infoNote: 'El código es obligatorio.' },
};

export const findSponsorTexts = {
  BR: { title: "Encontrar Patrocinador", introTitle: "Precisa de um Patrocinador?", introSubtitle1: "Para ser um Distribuidor e acessar o plano binário, você precisa estar vinculado a um líder.", introSubtitle2: "Nossa central indicará o melhor patrocinador para sua região.", dataLabel: "DADOS NECESSÁRIOS:", fields: ["Nome Completo", "Cidade/Estado", "Telefone de Contato"], info: "Ao clicar, você será redirecionado para o suporte oficial.", openEmail: "Solicitar por E-mail", openWhatsApp: "Chamar no WhatsApp", back: "Voltar para Perfis" },
  EN: { title: "Find a Sponsor", introTitle: "Need a Sponsor?", introSubtitle1: "To be a Distributor and access the binary plan, you need to be linked to a leader.", introSubtitle2: "Our center will indicate the best sponsor for your region.", dataLabel: "REQUIRED DATA:", fields: ["Full Name", "City/State", "Contact Phone"], info: "By clicking, you will be redirected to official support.", openEmail: "Request by Email", openWhatsApp: "Call on WhatsApp", back: "Back to Profiles" }
};



export const profileTexts = {
  BR: {
    welcome: "SEJA BEM-VINDO",
    flow: "ESCOLHA SEU PERFIL DE ACESSO",
    pricing: {
      yearly: "/ano",
      starting: "A partir de",
    },
    types: {
    
      afiliado: "AFILIADO",
      afiliadoDesc: "Indique e ganhe bônus diretos na rede.",
      distribuidor: "DISTRIBUIDOR",
      distribuidorDesc: "Plano completo com binário e liderança."
    },
    action: "PRECISA DE UM CONVITE?",
    localization: {
      locale: "pt-BR",
      currency: "BRL",
      symbol: "R$",
      rateToBRL: 1,
    },
  },
  EN: {
    welcome: "WELCOME",
    flow: "CHOOSE YOUR ACCESS PROFILE",
    pricing: {
      yearly: "/year",
      starting: "Starting at",
    },
    types: {
     
      afiliado: "AFFILIATE",
      afiliadoDesc: "Refer and earn direct network bonuses.",
      distribuidor: "DISTRIBUTOR",
      distribuidorDesc: "Full plan with binary and leadership bonuses."
    },
    action: "INVITATION REQUIRED?",
    localization: { 
      locale: "en-US",
      currency: "USD",
      symbol: "$",
      rateToBRL: 0.18, // 39.00 * 0.18 = 7.02 USD
    },
  },
  ES: {
    welcome: "BIENVENIDO",
    flow: "ELIGE TU PERFIL DE ACCESO",
    pricing: {
      yearly: "/año",
      starting: "A partir de",
    },
    types: {
      
      afiliado: "AFILIADO",
      afiliadoDesc: "Refiera y gane bonos directos en la red.",
      distribuidor: "DISTRIBUIDOR",
      distribuidorDesc: "Plan completo con binario y liderazgo."
    },
    action: "¿NECESITA UMA INVITACIÓN?",
    localization: { 
      locale: "es-ES", 
      currency: "USD",
      symbol: "$",   
      rateToBRL: 0.18, 
    },
  },
};

export const packagesTexts = {
 BR: { 
    title: "PACOTES E UPGRADES 2026", subtitle: "Escolha seu nível de negócio ou evolução", select: "SELECIONAR", upgrade: "UPGRADE PARA", builderName: "PACOTE BUILDER", primeName: "PACOTE PRIME", eliteName: "PACOTE ELITE", vouchers: "Vouchers de Aplicativos", pontosBase: "Pontos Base",
    btnAdesao: "ADQUIRIR ADESÃO R$ ", btnEliteUpgrade: "UPGRADE PRIME PARA ELITE R$ ", btnBuilderElite: "UPGRADE BUILDER PARA ELITE R$ ",
    geraPontos: "Gera +", rede: "Pontos na Rede", footer: "* Todos os botões redirecionam para o checkout oficial 2026.", benefits: { points: "Pontos", binary: "Teto Binário", direct: "Indicação", store: "Loja Ativa" } 
  },
  EN: { 
    title: "DIAMOND PACKS 2026", subtitle: "Choose your business level or evolution", select: "SELECT", upgrade: "UPGRADE TO", builderName: "BUILDER PACK", primeName: "PRIME PACK", eliteName: "ELITE PACK", vouchers: "App Vouchers", pontosBase: "Base Points",
    btnAdesao: "ACQUIRE MEMBERSHIP $", btnEliteUpgrade: "UPGRADE PRIME TO ELITE $", btnBuilderElite: "UPGRADE BUILDER TO ELITE $",
    geraPontos: "Generates +", rede: "Network Points", footer: "* All buttons redirect to the official 2026 checkout.", benefits: { points: "Points", binary: "Binary Limit", direct: "Referral", store: "Active Store" } 
  },
   ES: { 
    title: "PAQUETES DIAMOND 2026", subtitle: "Elija su nivel de negocio o evolución", select: "SELECCIONAR", upgrade: "UPGRADE PARA", builderName: "PAQUETE BUILDER", primeName: "PAQUETE PRIME", eliteName: "PAQUETE ELITE", vouchers: "Vouchers de Aplicaciones", pontosBase: "Puntos Base",
    btnAdesao: "ADQUIRIR AFILIACIÓN €", btnEliteUpgrade: "UPGRADE PRIME PARA ELITE €", btnBuilderElite: "UPGRADE BUILDER PARA ELITE €",
    geraPontos: "Genera +", rede: "Puntos en Red", footer: "* Todos los botones redirigen al checkout oficial 2026.", benefits: { points: "Puntos", binary: "Techo Binario", direct: "Referencia", store: "Tienda Activa" } 
  }
};

export const officeTexts = {
  BR: {
    dashboard: "PAINEL",
    network: "MINHA REDE",
    earnings: "GANHOS",
    withdraw: "SAQUES",
    packages: "PACOTES",
    marketingPlan: "PLANO DE CARREIRA",
    gps: "GPS",
    progress: "PROGRESSO",
    proway: "PROWAY",
    news: "NOTÍCIAS",
    viewProfile: "VER PERFIL",
    personalData: "DADOS PESSOAIS",
    logout: "SAIR",
    confirmLogout: "DESEJA REALMENTE SAIR?",
    balanceLabel: "SALDO DISPONÍVEL",
    requestWithdraw: "SOLICITAR SAQUE",
    confirm: "CONFIRMAR",
    withdrawInfo: "* Processamento oficial Diamond 2026.",
    verifiedStatus: "APROVADO",
    pendingStatus: "PENDENTE",
    attention: "ATENÇÃO",
    permissionRequired: "Preencha todos os campos.",
  },

  EN: {
    dashboard: "DASHBOARD",
    network: "MY NETWORK",
    earnings: "EARNINGS",
    withdraw: "WITHDRAW",
    packages: "PACKAGES",
    marketingPlan: "MARKETING PLAN",
    gps: "GPS",
    progress: "PROGRESS",
    proway: "PROWAY",
    news: "NEWS",
    viewProfile: "VIEW PROFILE",
    personalData: "PERSONAL DATA",
    logout: "LOGOUT",
    confirmLogout: "DO YOU REALLY WANT TO LOGOUT?",
    balanceLabel: "AVAILABLE BALANCE",
    requestWithdraw: "REQUEST WITHDRAWAL",
    confirm: "CONFIRM",
    withdrawInfo: "* Official Diamond 2026 processing.",
    verifiedStatus: "APPROVED",
    pendingStatus: "PENDING",
    attention: "ATTENTION",
    permissionRequired: "Fill in all fields.",
  },

  ES: {
    dashboard: "PANEL",
    network: "MI RED",
    earnings: "GANANCIAS",
    withdraw: "RETIROS",
    packages: "PAQUETES",
    marketingPlan: "PLAN DE NEGOCIOS",
    gps: "GPS",
    progress: "PROGRESO",
    proway: "PROWAY",
    news: "NOTICIAS",
    viewProfile: "VER PERFIL",
    personalData: "DATOS PERSONALES",
    logout: "SALIR",
    confirmLogout: "¿REALMENTE DESEA SALIR?",
    balanceLabel: "SALDO DISPONIBLE",
    requestWithdraw: "SOLICITAR RETIRO",
    confirm: "CONFIRMAR",
    withdrawInfo: "* Procesamiento oficial Diamond 2026.",
    verifiedStatus: "APROBADO",
    pendingStatus: "PENDIENTE",
    attention: "ATENCIÓN",
    permissionRequired: "Complete todos los campos.",
  },
};

export const dashboardTexts = {
  BR: {
    balanceLabel: 'SALDO DISPONÍVEL',
    network: 'MINHA REDE',
    progress: 'PROGRESSO',
    pendingPayment: 'PAGAMENTO PENDENTE',
    waitingActivation: 'AGUARDANDO ATIVAÇÃO',
    newExecutive: 'NOVO EXECUTIVO',
    currency: 'BRL',
    locale: 'pt-BR'
  },
  US: {
    balanceLabel: 'AVAILABLE BALANCE',
    network: 'MY NETWORK',
    progress: 'PROGRESS',
    pendingPayment: 'PENDING PAYMENT',
    waitingActivation: 'WAITING ACTIVATION',
    newExecutive: 'NEW EXECUTIVE',
    currency: 'USD',
    locale: 'en-US'
  },
  ES: {
    balanceLabel: 'SALDO DISPONIBLE',
    network: 'MI RED',
    progress: 'PROGRESO',
    pendingPayment: 'PAGO PENDIENTE',
    waitingActivation: 'ESPERANDO ACTIVACIÓN',
    newExecutive: 'NUEVO EJECUTIVO',
    currency: 'USD',
    locale: 'es-ES'
  }
};
export const networkTexts = {
  BR: {
    network: "Minha Rede",
    pointsLeft: "Esquerda",
    pointsRight: "Direita",
    pointsLabel: "Pontos",
    spilloverSide: "Lado de Transbordo",
    activeStatus: "Ativo",
    pendingStatus: "Pendente",
    contactUnavailable: "Contato indisponível",
    whatsappError: "WhatsApp não instalado",
    spilloverEsq: "ESQ",
    spilloverDir: "DIR",
    spilloverAuto: "AUTO",
  },
  EN: {
    network: "My Network",
    pointsLeft: "Left",
    pointsRight: "Right",
    pointsLabel: "Points",
    spilloverSide: "Spillover Side",
    activeStatus: "Active",
    pendingStatus: "Pending",
    contactUnavailable: "Contact unavailable",
    whatsappError: "WhatsApp not installed",
    spilloverEsq: "LEFT",
    spilloverDir: "RIGHT",
    spilloverAuto: "AUTO",
  },
  ES: {
    network: "Mi Red",
    pointsLeft: "Izquierda",
    pointsRight: "Derecha",
    pointsLabel: "Puntos",
    spilloverSide: "Lado de Derrame",
    activeStatus: "Activo",
    pendingStatus: "Pendiente",
    contactUnavailable: "Contacto no disponible",
    whatsappError: "WhatsApp no instalado",
    spilloverEsq: "IZQ",
    spilloverDir: "DER",
    spilloverAuto: "AUTO",
  }
};
export const newsTexts = {
  BR: {
    title: "Comunicados e Notícias",
    noNews: "Nenhuma novidade no momento.",
    readMore: "Ler mais",
    lastUpdate: "Última atualização:",
    important: "IMPORTANTE",
  },
  EN: {
    title: "News and Updates",
    noNews: "No updates at the moment.",
    readMore: "Read more",
    lastUpdate: "Last update:",
    important: "IMPORTANT",
  },
  ES: {
    title: "Comunicados y Noticias",
    noNews: "No hay novedades en este momento.",
    readMore: "Leer más",
    lastUpdate: "Última actualización:",
    important: "IMPORTANTE",
  }
};
export const progressTexts = {
  BR: {
    title: "Meu Progresso",
    graduation: "Graduação",
    goal: "Meta",
    requirements: "Requisitos",
    active: "Ativo",
    completed: "Concluído",
    missing: "Faltam",
    pointsSuffix: "PV (Pontos)",
    ranks: ["EXECUTIVO", "BRONZE", "PRATA", "OURO", "RUBI", "DIAMANTE"],
    diamondVolume: "Volume de Diamante"
  },
  EN: {
    title: "My Progress",
    graduation: "Rank",
    goal: "Goal",
    requirements: "Requirements",
    active: "Active",
    completed: "Completed",
    missing: "Missing",
    pointsSuffix: "PV (Points)",
    ranks: ["EXECUTIVE", "BRONZE", "SILVER", "GOLD", "RUBY", "DIAMOND"],
    diamondVolume: "Diamond Volume"
  },
  ES: {
    title: "Mi Progreso",
    graduation: "Graduación",
    goal: "Meta",
    requirements: "Requisitos",
    active: "Activo",
    completed: "Completado",
    missing: "Faltan",
    pointsSuffix: "PV (Puntos)",
    ranks: ["EJECUTIVO", "BRONZE", "PLATA", "ORO", "RUBÍ", "DIAMANTE"],
    diamondVolume: "Volumen de Diamante"
  }
};
export const prowayTexts = {
  BR: {
    academy: "ProWay Academy",
    trainings: "Treinamentos",
    completed: "Concluído",
    watchNow: "Assistir Agora",
    cancel: "Cancelar",
    reminder: "Lembrete",
    setReminder: "DEFINIR LEMBRETE",
    liveTitle: "MASTERCLASS 2026",
    liveDesc: "Treinamento especial para níveis Executivos.",
    course1: "Mindset Diamante 2026",
    course2: "Estratégia de Vendas 2.0",
    course3: "Liderança Global",
  },
  EN: {
    academy: "ProWay Academy",
    trainings: "Trainings",
    completed: "Completed",
    watchNow: "Watch Now",
    cancel: "Cancel",
    reminder: "Reminder",
    setReminder: "SET REMINDER",
    liveTitle: "MASTERCLASS 2026",
    liveDesc: "Special training for Executive ranks.",
    course1: "Diamond Mindset 2026",
    course2: "Sales Strategy 2.0",
    course3: "Global Leadership",
  },
  ES: {
    academy: "ProWay Academy",
    trainings: "Entrenamientos",
    completed: "Completado",
    watchNow: "Ver Ahora",
    cancel: "Cancelar",
    reminder: "Recordatorio",
    setReminder: "DEFINIR RECORDATORIO",
    liveTitle: "MASTERCLASS 2026",
    liveDesc: "Entrenamiento especial para rangos Ejecutivos.",
    course1: "Mentalidad Diamante 2026",
    course2: "Estrategia de Ventas 2.0",
    course3: "Liderazgo Global",
  }
};


export const earningsTexts = {
  BR: { title: 'FINANCEIRO', available: 'SALDO DISPONÍVEL', directs: 'DIRETOS', leadershipBonus: 'BÔNUS LIDERANÇA', history: 'HISTÓRICO', network: 'EQUIPE', locale: 'pt-BR', currency: 'BRL' },
  EN: { title: 'FINANCIAL', available: 'AVAILABLE BALANCE', directs: 'DIRECTS', leadershipBonus: 'LEADERSHIP BONUS', history: 'HISTORY', network: 'TEAM', locale: 'en-US', currency: 'USD' },
  ES: { title: 'FINANCIERO', available: 'SALDO DISPONIBLE', directs: 'DIRECTOS', leadershipBonus: 'BONO LIDERAZGO', history: 'HISTORIAL', network: 'EQUIPO', locale: 'es-ES', currency: 'USD' }
};
export const marketingTexts = {
  BR: {
    locale: "pt-BR",
    currency: "R$",
    rateToBRL: 1, 
    title: "PLANO DE MARKETING OFICIAL 2026",
    resaleBonus: "Bônus de Revenda (Base)",
    valueApp: "por app",
    unlimitedEarnings: "Ganhos Ilimitados | Pagamento Imediato",
    directReferral: "Indicação Direta",
    level: "Nível",
    binaryBonus: "Bônus Binário",
    calculatedOnSmallerLeg: "Calculado sobre o volume da perna menor. Pagamento semanal.",
    entryPackages: "Pacotes de Entrada",
    registrationTypes: "Tipos de Cadastro",
    clientTitle: "+ CLIENTE (Grátis)",
    clientInfo: "Compra Apps a",
    noCommission: "Sem comissão",
    affiliateTitle: "+ AFILIADO",
    uniqueFee: "Taxa Única",
    affiliateInfo: "Loja Online | 30% comissão fixa | S/ Rede",
    touchHint: "Clique em um pacote para adquirir ou fazer upgrade:",
    vouchers: "Vouchers",
    upgradeTitle: "Upgrades e Pontuação",
    upgradeValues: "VALORES (DIFERENÇA):",
    pointsGenerated: "PUNTOS GERADOS:",
    pointsSuffix: "pts",
    careerTitle: "Níveis de Carreira",
    generalRules: "Regras Gerais",
    rulePoint: "1 Ponto =",
    ruleActiveApp: "App Ativo = 10 pontos / mês",
    ruleActivation: "Ativação: 5 apps ativos ou 5 novos clientes",
    arrow: "➔",
    // ✅ Ranks e Pacotes (Novos)
    rankRunner: "RUNNER",
    rankBronze: "BRONZE",
    rankSilver: "SILVER",
    rankGold: "GOLD",
    rankDiamond: "DIAMOND",
    pkgBuilder: "BUILDER",
    pkgPrime: "PRIME",
    pkgElite: "ELITE",
    pts2000: "2.000 pts",
    pts5000: "5.000 pts",
    pts15000: "15.000 pts",
    pts50000: "50.000 pts",
    pts160000: "160.000 pts",
    ranks: {
      runner: "Ativo + 1 Direto Ativo",
      bronze: "Ativo + 4 Diretos + 1 Runner",
      silver: "Ativo + 9 Diretos + 2 Bronze",
      gold: "Ativo + 30 Diretos + 2 Silver",
      diamond: "Ativo + 2 Gold"
    }
  },
  EN: {
     locale: "en-US",
    currency: "$",
    rateToBRL: 0.18,
    title: "OFFICIAL MARKETING PLAN 2026",
    resaleBonus: "Resale Bonus (Base)",
    valueApp: "per app",
    unlimitedEarnings: "Unlimited Earnings | Immediate Payment",
    directReferral: "Direct Referral",
    level: "Level",
    binaryBonus: "Binary Bonus",
    calculatedOnSmallerLeg: "Calculated on smaller leg volume. Weekly payment.",
    entryPackages: "Entry Packages",
    registrationTypes: "Registration Types",
    clientTitle: "+ CUSTOMER (Free)",
    clientInfo: "Buy Apps at",
    noCommission: "No commission",
    affiliateTitle: "+ AFFILIATE",
    uniqueFee: "One-time Fee",
    affiliateInfo: "Online Store | 30% fixed commission | No Network",
    touchHint: "Click on a package to purchase or upgrade:",
    vouchers: "Vouchers",
    upgradeTitle: "Upgrades and Scoring",
    upgradeValues: "VALUES (DIFFERENCE):",
    pointsGenerated: "GENERATED POINTS:",
    pointsSuffix: "pts",
    careerTitle: "Career Levels",
    generalRules: "General Rules",
    rulePoint: "1 Point =",
    ruleActiveApp: "Active App = 10 points / month",
    ruleActivation: "Activation: 5 active apps or 5 new customers",
    arrow: "➔",
    rankRunner: "RUNNER",
    rankBronze: "BRONZE",
    rankSilver: "SILVER",
    rankGold: "GOLD",
    rankDiamond: "DIAMOND",
    pkgBuilder: "BUILDER",
    pkgPrime: "PRIME",
    pkgElite: "ELITE",
    pts2000: "2,000 pts",
    pts5000: "5,000 pts",
    pts15000: "15,000 pts",
    pts50000: "50,000 pts",
    pts160000: "160,000 pts",
    ranks: {
      runner: "Active + 1 Active Direct",
      bronze: "Active + 4 Directs + 1 Runner",
      silver: "Active + 9 Directs + 2 Bronze",
      gold: "Active + 30 Directs + 2 Silver",
      diamond: "Active + 2 Gold"
    }
  },
  ES: {
     locale: "en-US",
    currency: "$",
    rateToBRL: 0.18,
    title: "PLAN DE MARKETING OFICIAL 2026",
    resaleBonus: "Bono de Reventa (Base)",
    valueApp: "por app",
    unlimitedEarnings: "Ganancias Ilimitadas | Pago Inmediato",
    directReferral: "Referido Directo",
    level: "Nivel",
    binaryBonus: "Bono Binario",
    calculatedOnSmallerLeg: "Calculado sobre el volumen de la pierna menor. Pago semanal.",
    entryPackages: "Paquetes de Entrada",
    registrationTypes: "Tipos de Registro",
    clientTitle: "+ CLIENTE (Gratis)",
    clientInfo: "Compra Apps a",
    noCommission: "Sin comisión",
    affiliateTitle: "+ AFILIADO",
    uniqueFee: "Tasa Única",
    affiliateInfo: "Tienda Online | 30% comisión fija | Sin Red",
    touchHint: "Haga clic en un paquete para comprar o mejorar:",
    vouchers: "Vouchers",
    upgradeTitle: "Mejoras y Puntuación",
    upgradeValues: "VALORES (DIFERENCIA):",
    pointsGenerated: "PUNTOS GENERADOS:",
    pointsSuffix: "pts",
    careerTitle: "Niveles de Carrera",
    generalRules: "Reglas Generales",
    rulePoint: "1 Punto =",
    ruleActiveApp: "App Activo = 10 puntos / mes",
    ruleActivation: "Activación: 5 apps activas o 5 nuevos clientes",
    arrow: "➔",
    rankRunner: "RUNNER",
    rankBronze: "BRONZE",
    rankSilver: "SILVER",
    rankGold: "GOLD",
    rankDiamond: "DIAMOND",
    pkgBuilder: "BUILDER",
    pkgPrime: "PRIME",
    pkgElite: "ELITE",
    pts2000: "2.000 pts",
    pts5000: "5.000 pts",
    pts15000: "15.000 pts",
    pts50000: "50.000 pts",
    pts160000: "160.000 pts",
    ranks: {
      runner: "Activo + 1 Directo Activo",
      bronze: "Activo + 4 Directos + 1 Runner",
      silver: "Activo + 9 Directos + 2 Bronze",
      gold: "Activo + 30 Directos + 2 Silver",
      diamond: "Activo + 2 Gold"
    }
  }
};

export const paymentTexts = {
  BR: {
    // Textos de UI
    tagline: "ATIVAÇÃO EXECUTIVA",
    title: "PAGAMENTO DE ADESÃO",
    planClient: "PLANO CLIENTE", // Adicionado
    planExecutive: "PLANO EXECUTIVO", // Adicionado
    payNow: "PAGAR AGORA", // Adicionado
    price: "299",
    benefit1: "Acesso total ao Escritório Virtual",
    pay: "Confirmar Pagamento",
    alertSuccessTitle: "Sucesso",
    alertSuccessBody: "Seu ID Diamond Runner: ",
    btnNext: "Continuar",
    processing: "PROCESSANDO...",
    errorTitle: "Erro no Pagamento",
    errorBody: "Ocorreu um erro. Tente novamente.",
    upgradeTitle: "UPGRADE DE PLANO",
    pointsText: "Pontuação",

    locale: "pt-BR",
    currency: "R$", 
    symbol: "R$",
    rateToBRL: 1, 
   
  },
  EN: {
    // Textos de UI
    tagline: "EXECUTIVE ACTIVATION",
    title: "MEMBERSHIP PAYMENT",
    planClient: "CLIENT PLAN", 
    planExecutive: "EXECUTIVE PLAN", 
    payNow: "PAY NOW",
    price: "299",
    benefit1: "Full access to Virtual Office",
    pay: "Confirm Payment",
    alertSuccessTitle: "Success",
    alertSuccessBody: "Your Diamond Runner ID: ",
    btnNext: "Continue",
    processing: "PROCESSING...",
    errorTitle: "Payment Error",
    errorBody: "An error occurred. Please try again.",
    upgradeTitle: "PLAN UPGRADE",
    pointsText: "Points",

    locale: "en-US",
    currency: "USD",
    symbol: "$",
    rateToBRL: 0.18, 
   
  },
  ES: {
    tagline: "ACTIVACIÓN EJECUTIVA",
    title: "PAGO DE ADHESIÓN",
    planClient: "PLAN CLIENTE", 
    planExecutive: "PLAN EJECUTIVO", 
    payNow: "PAGAR AHORA",
    price: "299",
    benefit1: "Acceso total a la Oficina Virtual",
    pay: "Confirmar Pago",
    alertSuccessTitle: "Éxito",
    alertSuccessBody: "Su ID Diamond Runner: ",
    btnNext: "Continuar",
    processing: "PROCESANDO...",
    errorTitle: "Error de Pago",
    errorBody: "Ocurrió un error. Inténtalo de nuevo.",
    upgradeTitle: "ACTUALIZACIÓN DE PLAN",
    pointsText: "Puntos",

    locale: "es-ES", 
    currency: "USD", 
    symbol: "$", 
    rateToBRL: 0.18, 
  }
};




