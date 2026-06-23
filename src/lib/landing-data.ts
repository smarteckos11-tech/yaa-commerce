// Centralized landing page data — YAA SaaS

export const IMAGES = {
  // Hero / people — real photos from OSS-hosted search results
  womanBoutique:
    "https://sfile.chatglm.cn/images-ppt/9296d2f50e90.jpg", // portrait, fashion boutique owner
  womanSmartphone:
    "https://sfile.chatglm.cn/images-ppt/c22625222b8f.jpg", // woman using smartphone in shop
  entrepreneurMan:
    "https://sfile.chatglm.cn/images-ppt/367e17328004.jpg", // smiling man portrait
  entrepreneurWoman:
    "https://sfile.chatglm.cn/images-ppt/63e7dbe8b857.jpg", // confident woman entrepreneur
  deliveryMan:
    "https://sfile.chatglm.cn/images-ppt/093cf8295f04.jpg", // delivery man smiling
  customerPackage:
    "https://sfile.chatglm.cn/images-ppt/aaecca6e6619.jpg", // customer receiving package
  womanAlt:
    "https://sfile.chatglm.cn/images-ppt/ba321a546aac.jpg", // woman entrepreneur alt
  // Carousel scenario-specific photos
  womanSmartphoneSmile:
    "https://sfile.chatglm.cn/images-ppt/fb0c7c1ffd23.jpg", // woman small business owner smartphone smiling
  deliveryDriver:
    "https://sfile.chatglm.cn/images-ppt/927079e06014.jpg", // courier delivery driver with package
  entrepreneurTablet:
    "https://sfile.chatglm.cn/images-ppt/9d45d2bfdfeb.jpg", // african business man using tablet
};

// ---------- HERO CAROUSEL SLIDES ----------
export type Slide = {
  id: string;
  badge: string;
  // Title pieces — for color highlighting
  titleLines: { text: string; highlight?: "orange" | "green" }[];
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  trustPoints: string[];
};

export const SLIDES: Slide[] = [
  {
    id: "ambitions",
    badge: "Déjà plus de 10 000 marchands conquis en Afrique",
    titleLines: [
      { text: "L'Afrique avance," },
      { text: "vos ", },
      { text: "ambitions", highlight: "orange" },
      { text: " prennent vie avec " },
      { text: "YAA", highlight: "green" },
      { text: "." },
    ],
    subtitle:
      "De la première vente à l'expansion internationale, YAA accompagne chaque étape de votre réussite. Boutique en ligne, paiements Mobile Money, livraison, WhatsApp Business — tout, réunifié dans une seule plateforme premium.",
    primaryCta: { label: "Créer ma boutique gratuitement", href: "#tarifs" },
    secondaryCta: { label: "Voir une démo", href: "#dashboard" },
    trustPoints: [
      "0 FCFA pour démarrer",
      "Sans engagement",
      "Configuration en 5 minutes",
    ],
  },
  {
    id: "whatsapp",
    badge: "WhatsApp Business intégré nativement",
    titleLines: [
      { text: "Transformez chaque " },
      { text: "conversation", highlight: "green" },
      { text: " " },
      { text: "WhatsApp", highlight: "orange" },
      { text: " en vente." },
    ],
    subtitle:
      "Catalogue partagé, commandes automatiques, paiements Mobile Money en un clic. Vos clients commandent en deux messages, vous encaissez instantanément. Le commerce devient aussi simple qu'une discussion.",
    primaryCta: { label: "Connecter mon WhatsApp", href: "#tarifs" },
    secondaryCta: { label: "Voir un exemple", href: "#fonctionnalites" },
    trustPoints: [
      "Réponses automatiques",
      "Catalogue synchronisé",
      "Paiement dans le chat",
    ],
  },
  {
    id: "livraison",
    badge: "Réseau logistique intégré dans 15+ pays",
    titleLines: [
      { text: "De " },
      { text: "Dakar", highlight: "orange" },
      { text: " à " },
      { text: "Lagos", highlight: "green" },
      { text: ", vos colis livrés en " },
      { text: "24h", highlight: "orange" },
      { text: "." },
    ],
    subtitle:
      "Yango, DHL, transporteurs locaux — YAA choisit le meilleur itinéraire, calcule les frais, imprime les étiquettes et suit chaque colis en temps réel. Vos clients savent toujours où est leur commande.",
    primaryCta: { label: "Démarrer la livraison", href: "#tarifs" },
    secondaryCta: { label: "Voir les pays couverts", href: "#fonctionnalites" },
    trustPoints: [
      "Suivi temps réel",
      "Frais calculés auto",
      "Livraison express disponible",
    ],
  },
  {
    id: "ia",
    badge: "IA générative intégrée à votre tableau de bord",
    titleLines: [
      { text: "Pilotez votre " },
      { text: "croissance", highlight: "green" },
      { text: " avec " },
      { text: "l'IA YAA", highlight: "orange" },
      { text: "." },
    ],
    subtitle:
      "Descriptions produits, posts réseaux sociaux, scripts WhatsApp, prévisions de ventes. L'IA YAA génère votre contenu marketing et anticipe vos ruptures de stock. Décidez avec des données, pas avec des intuitions.",
    primaryCta: { label: "Activer l'IA YAA", href: "#tarifs" },
    secondaryCta: { label: "Voir le dashboard", href: "#dashboard" },
    trustPoints: [
      "Descriptions auto générées",
      "Prévisions de ventes",
      "Alertes de stock intelligentes",
    ],
  },
];

export type Testimonial = {
  name: string;
  city: string;
  country: string;
  flag: string; // emoji flag
  result: string;
  quote: string;
  photo: string;
  business: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Fatu Sow",
    city: "Dakar",
    country: "Sénégal",
    flag: "🇸🇳",
    result: "+300% de ventes en 6 mois",
    quote:
      "YAA a transformé mon petit atelier en une véritable boutique en ligne. Je vends maintenant dans tout le Sénégal sans quitter Dakar.",
    photo: IMAGES.womanBoutique,
    business: "Fatu Couture",
  },
  {
    name: "Koffi Brou",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    flag: "🇨🇮",
    result: "+5 000 commandes en 1 an",
    quote:
      "L'intégration WhatsApp + Mobile Money a changé ma vie. Mes clients commandent en 2 messages, je reçois l'argent instantanément.",
    photo: IMAGES.entrepreneurMan,
    business: "Koffi Electronics",
  },
  {
    name: "Amina Talla",
    city: "Yaoundé",
    country: "Cameroun",
    flag: "🇨🇲",
    result: "De 0 à 1M FCFA en 1 an",
    quote:
      "Je suis partie de zéro. Aujourd'hui j'emploie 4 personnes et j'exporte vers le Gabon. YAA, c'est mon partenaire de croissance.",
    photo: IMAGES.womanAlt,
    business: "Amina Beauty",
  },
  {
    name: "Kwame Asante",
    city: "Accra",
    country: "Ghana",
    flag: "🇬🇭",
    result: "Livraison dans +10 pays",
    quote:
      "Avec Yango intégré, mes colis partent d'Accra le matin et arrivent à Lagos le soir. Mes clients adorent la rapidité.",
    photo: IMAGES.deliveryMan,
    business: "Kwame Foods",
  },
];

export type Feature = {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  accent: "green" | "orange";
  illustration: string;
};

export const FEATURES: Feature[] = [
  {
    id: "boutique",
    title: "Création de boutique en 5 minutes",
    description:
      "Lancez votre boutique en ligne sans une ligne de code. Choisissez votre thème, ajoutez vos produits, et commencez à vendre immédiatement.",
    icon: "Store",
    accent: "green",
    illustration: "store",
  },
  {
    id: "paiements",
    title: "Paiements Mobile Money unifiés",
    description:
      "Acceptez Wave, Orange Money, MTN, Moov, cartes bancaires et CinetPay. Un seul tableau de bord, toutes vos transactions en temps réel.",
    icon: "Wallet",
    accent: "orange",
    illustration: "wallet",
  },
  {
    id: "whatsapp",
    title: "WhatsApp Business intégré",
    description:
      "Transformez chaque conversation en vente. Commandes automatiques, catalogues partagés, suivi client en un clic.",
    icon: "MessageCircle",
    accent: "green",
    illustration: "whatsapp",
  },
  {
    id: "livraison",
    title: "Livraison dans toute l'Afrique",
    description:
      "Yango, DHL, locaux. Calculez automatiquement les frais, imprimez les étiquettes, suivez chaque colis en temps réel.",
    icon: "Truck",
    accent: "orange",
    illustration: "delivery",
  },
  {
    id: "ia",
    title: "IA marketing & recommandations",
    description:
      "Descriptions produits, posts réseaux sociaux, scripts WhatsApp. Notre IA génère votre contenu en quelques secondes.",
    icon: "Sparkles",
    accent: "green",
    illustration: "ai",
  },
  {
    id: "marketing",
    title: "Marketing automatisé",
    description:
      "Campagnes SMS, email et WhatsApp programmées. Promotions flash, codes promo, programmes de fidélité prêts à l'emploi.",
    icon: "Megaphone",
    accent: "orange",
    illustration: "marketing",
  },
  {
    id: "analytics",
    title: "Analytics en temps réel",
    description:
      "Tableaux de bord premium : ventes, panier moyen, taux de conversion, meilleurs produits. Décidez avec des données fiables.",
    icon: "BarChart3",
    accent: "green",
    illustration: "analytics",
  },
  {
    id: "stock",
    title: "Gestion de stock intelligente",
    description:
      "Suivi automatique, alertes de rupture, prévisions de réapprovisionnement par IA. Ne soyez plus jamais en rupture.",
    icon: "Boxes",
    accent: "orange",
    illustration: "stock",
  },
];

export type PricingPlan = {
  id: string;
  name: string;
  price: number; // FCFA / month
  tagline: string;
  highlight: boolean;
  badge?: string;
  cta: string;
  features: string[];
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "decouverte",
    name: "Découverte",
    price: 2900,
    tagline: "Pour lancer votre première boutique en ligne",
    highlight: false,
    cta: "Commencer gratuitement",
    features: [
      "Boutique en ligne illimitée",
      "Jusqu'à 50 produits",
      "1 canal de paiement Mobile Money",
      "WhatsApp Business de base",
      "Suivi de commandes",
      "Support communautaire",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 4900,
    tagline: "Pour les marchands en pleine croissance",
    highlight: true,
    badge: "Le plus populaire",
    cta: "Démarrer l'essai de 14 jours",
    features: [
      "Produits illimités",
      "Tous les paiements Mobile Money + cartes",
      "WhatsApp Business avancé",
      "Livraison Yango & DHL intégrée",
      "Marketing automatisé (SMS + WhatsApp)",
      "Analytics avancés en temps réel",
      "Support prioritaire 7j/7",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 9900,
    tagline: "Pour les marques en expansion internationale",
    highlight: false,
    cta: "Parler à un expert",
    features: [
      "Tout du plan Business, plus :",
      "Multi-boutiques & multi-devises",
      "IA marketing & descriptions produits",
      "API & Webhooks personnalisés",
      "Gestionnaire de compte dédié",
      "SLA 99,9% garanti",
      "Formation équipe sur-mesure",
    ],
  },
];

export type Partner = {
  name: string;
  type: "mobile-money" | "delivery" | "messaging";
};

export const PARTNERS: Partner[] = [
  { name: "Wave", type: "mobile-money" },
  { name: "Orange Money", type: "mobile-money" },
  { name: "MTN Mobile Money", type: "mobile-money" },
  { name: "Moov Money", type: "mobile-money" },
  { name: "CinetPay", type: "mobile-money" },
  { name: "WhatsApp Business", type: "messaging" },
  { name: "Yango", type: "delivery" },
];

export type Stat = {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  accent: "green" | "orange" | "dark" | "purple" | "gold";
};

export const STATS: Stat[] = [
  { value: 250000, suffix: "+", prefix: "", label: "Commandes traitées chaque mois", accent: "green" },
  { value: 10000, suffix: "+", prefix: "", label: "Marchands actifs et satisfaits", accent: "orange" },
  { value: 15, suffix: "+", prefix: "", label: "Pays couverts en Afrique", accent: "dark" },
  { value: 99.9, suffix: "%", prefix: "", label: "Disponibilité de la plateforme", accent: "purple" },
  { value: 5, suffix: "/5", prefix: "", label: "Satisfaction marchands", accent: "gold" },
];

export const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "Témoignages", href: "#temoignages" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Contact", href: "#contact" },
];
