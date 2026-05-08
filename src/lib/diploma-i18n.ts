import type { BeltKey } from "./diploma-pricing";

export type Locale = "pt" | "en" | "es" | "it" | "de";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

type Dict = {
  pageTitle: string;
  subtitle: string;
  priceTableTitle: string;
  groupPreta: string;
  groupMarromRoxa: string;
  groupAzulVerde: string;
  groupAteLaranja: string;
  sectionContact: string;
  sectionPersonal: string;
  sectionJiuJitsu: string;
  email: string;
  whatsapp: string;
  affiliateCode: string;
  affiliateHelp: string;
  firstName: string;
  lastName: string;
  dob: string;
  documentNumber: string;
  sex: string;
  male: string;
  female: string;
  fatherName: string;
  motherName: string;
  optional: string;
  martialArt: string;
  belt: string;
  currency: string;
  selectedBeltLabel: string;
  payNow: string;
  fillRequired: string;
  privacyNote: string;
  successTitle: string;
  successBody: string;
  belts: Record<BeltKey, string>;
};

const beltsBase = (
  white: string,
  grey: string,
  yellow: string,
  orange: string,
  blue: string,
  green: string,
  purple: string,
  brown: string,
  blackPattern: (n: number) => string,
  vermelhaPretaLabel: string,
  vermelhaBrancaLabel: string,
  vermelhaLabel: string,
): Record<BeltKey, string> => ({
  white,
  grey,
  yellow,
  orange,
  blue,
  green,
  purple,
  brown,
  black1: blackPattern(1),
  black2: blackPattern(2),
  black3: blackPattern(3),
  black4: blackPattern(4),
  black5: blackPattern(5),
  black6: blackPattern(6),
  black7: blackPattern(7),
  vermelha_e_preta7: vermelhaPretaLabel,
  vermelha_e_branca8: vermelhaBrancaLabel,
  red9: vermelhaLabel,
});

export const I18N: Record<Locale, Dict> = {
  pt: {
    pageTitle: "Formulário de Solicitação de Diploma",
    subtitle: "Mestre Sergio Malibu · Faixa Vermelha e Branca · 8º Grau",
    priceTableTitle: "Tabela de preços",
    groupPreta: "Faixa Preta / Vermelha e Preta / Vermelha e Branca / Vermelha",
    groupMarromRoxa: "Marrom / Roxa",
    groupAzulVerde: "Azul / Verde",
    groupAteLaranja: "Até Laranja (Branca, Cinza, Amarela, Laranja)",
    sectionContact: "Contato",
    sectionPersonal: "Dados Pessoais",
    sectionJiuJitsu: "Jiu-Jitsu",
    email: "E-mail",
    whatsapp: "WhatsApp (com código do país)",
    affiliateCode: "Código de Afiliado BJJLF",
    affiliateHelp: "Código da academia afiliada à BJJLF",
    firstName: "Nome",
    lastName: "Sobrenome",
    dob: "Data de Nascimento",
    documentNumber: "Número do Documento",
    sex: "Sexo",
    male: "Masculino",
    female: "Feminino",
    fatherName: "Nome do Pai",
    motherName: "Nome da Mãe",
    optional: "(opcional)",
    martialArt: "Arte Marcial",
    belt: "Faixa / Grau",
    currency: "Moeda do Pagamento",
    selectedBeltLabel: "Faixa selecionada",
    payNow: "Pagar com PayPal",
    fillRequired: "Preencha todos os campos obrigatórios para liberar o pagamento.",
    privacyNote:
      "Os dados informados serão usados exclusivamente para a emissão do diploma BJJLF.",
    successTitle: "Solicitação registrada!",
    successBody:
      "Recebemos sua solicitação e o pagamento foi confirmado. Nossa equipe vai processar seu diploma e enviar a confirmação para o e-mail informado.",
    belts: beltsBase(
      "Branca",
      "Cinza",
      "Amarela",
      "Laranja",
      "Azul",
      "Verde",
      "Roxa",
      "Marrom",
      (n: number) => `Preta ${n}º Grau`,
      "Vermelha e Preta · 7º Grau",
      "Vermelha e Branca · 8º Grau",
      "Vermelha · 9º Grau",
    ),
  },
  en: {
    pageTitle: "Diploma Request Form",
    subtitle: "Mestre Sergio Malibu · Red and White Belt · 8th Degree",
    priceTableTitle: "Price table",
    groupPreta: "Black / Red-Black / Red-White / Red",
    groupMarromRoxa: "Brown / Purple",
    groupAzulVerde: "Blue / Green",
    groupAteLaranja: "Up to Orange (White, Grey, Yellow, Orange)",
    sectionContact: "Contact",
    sectionPersonal: "Personal Information",
    sectionJiuJitsu: "Jiu-Jitsu",
    email: "Email",
    whatsapp: "WhatsApp (with country code)",
    affiliateCode: "BJJLF Affiliate Code",
    affiliateHelp: "Code of your BJJLF-affiliated academy",
    firstName: "First Name",
    lastName: "Last Name",
    dob: "Date of Birth",
    documentNumber: "ID Document Number",
    sex: "Sex",
    male: "Male",
    female: "Female",
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    optional: "(optional)",
    martialArt: "Martial Art",
    belt: "Belt / Grade",
    currency: "Payment Currency",
    selectedBeltLabel: "Selected belt",
    payNow: "Pay with PayPal",
    fillRequired: "Fill in all required fields to enable payment.",
    privacyNote:
      "Your data will be used exclusively to issue your BJJLF diploma.",
    successTitle: "Request received!",
    successBody:
      "We have received your request and your payment is confirmed. Our team will process your diploma and send confirmation to your email.",
    belts: beltsBase(
      "White",
      "Grey",
      "Yellow",
      "Orange",
      "Blue",
      "Green",
      "Purple",
      "Brown",
      (n: number) => `Black ${n}${ordEn(n)} degree`,
      "Red and Black · 7th degree",
      "Red and White · 8th degree",
      "Red · 9th degree",
    ),
  },
  es: {
    pageTitle: "Formulario de Solicitud de Diploma",
    subtitle: "Mestre Sergio Malibu · Cinturón Rojo y Blanco · 8º Grado",
    priceTableTitle: "Tabla de precios",
    groupPreta: "Negra / Roja y Negra / Roja y Blanca / Roja",
    groupMarromRoxa: "Marrón / Morada",
    groupAzulVerde: "Azul / Verde",
    groupAteLaranja: "Hasta Naranja (Blanca, Gris, Amarilla, Naranja)",
    sectionContact: "Contacto",
    sectionPersonal: "Datos Personales",
    sectionJiuJitsu: "Jiu-Jitsu",
    email: "Correo electrónico",
    whatsapp: "WhatsApp (con código de país)",
    affiliateCode: "Código de Afiliado BJJLF",
    affiliateHelp: "Código de la academia afiliada a BJJLF",
    firstName: "Nombre",
    lastName: "Apellido",
    dob: "Fecha de Nacimiento",
    documentNumber: "Número de Documento",
    sex: "Sexo",
    male: "Masculino",
    female: "Femenino",
    fatherName: "Nombre del Padre",
    motherName: "Nombre de la Madre",
    optional: "(opcional)",
    martialArt: "Arte Marcial",
    belt: "Cinturón / Grado",
    currency: "Moneda de Pago",
    selectedBeltLabel: "Cinturón seleccionado",
    payNow: "Pagar con PayPal",
    fillRequired: "Complete todos los campos obligatorios para habilitar el pago.",
    privacyNote:
      "Los datos serán utilizados exclusivamente para emitir el diploma BJJLF.",
    successTitle: "¡Solicitud registrada!",
    successBody:
      "Hemos recibido su solicitud y el pago está confirmado. Nuestro equipo procesará el diploma y enviará la confirmación a su correo.",
    belts: beltsBase(
      "Blanca",
      "Gris",
      "Amarilla",
      "Naranja",
      "Azul",
      "Verde",
      "Morada",
      "Marrón",
      (n: number) => `Negra ${n}° grado`,
      "Roja y Negra · 7° grado",
      "Roja y Blanca · 8° grado",
      "Roja · 9° grado",
    ),
  },
  it: {
    pageTitle: "Modulo di Richiesta Diploma",
    subtitle: "Mestre Sergio Malibu · Cintura Rosso-Bianca · 8° grado",
    priceTableTitle: "Tabella prezzi",
    groupPreta: "Nera / Rosso-Nera / Rosso-Bianca / Rossa",
    groupMarromRoxa: "Marrone / Viola",
    groupAzulVerde: "Blu / Verde",
    groupAteLaranja: "Fino a Arancione (Bianca, Grigia, Gialla, Arancione)",
    sectionContact: "Contatto",
    sectionPersonal: "Dati Personali",
    sectionJiuJitsu: "Jiu-Jitsu",
    email: "Email",
    whatsapp: "WhatsApp (con prefisso internazionale)",
    affiliateCode: "Codice Affiliato BJJLF",
    affiliateHelp: "Codice dell'accademia affiliata BJJLF",
    firstName: "Nome",
    lastName: "Cognome",
    dob: "Data di Nascita",
    documentNumber: "Numero Documento",
    sex: "Sesso",
    male: "Maschio",
    female: "Femmina",
    fatherName: "Nome del Padre",
    motherName: "Nome della Madre",
    optional: "(facoltativo)",
    martialArt: "Arte Marziale",
    belt: "Cintura / Grado",
    currency: "Valuta di Pagamento",
    selectedBeltLabel: "Cintura selezionata",
    payNow: "Paga con PayPal",
    fillRequired: "Compila tutti i campi obbligatori per abilitare il pagamento.",
    privacyNote:
      "I dati saranno utilizzati esclusivamente per l'emissione del diploma BJJLF.",
    successTitle: "Richiesta registrata!",
    successBody:
      "Abbiamo ricevuto la tua richiesta e il pagamento è confermato. Il nostro team elaborerà il diploma e invierà la conferma alla tua email.",
    belts: beltsBase(
      "Bianca",
      "Grigia",
      "Gialla",
      "Arancione",
      "Blu",
      "Verde",
      "Viola",
      "Marrone",
      (n: number) => `Nera ${n}° grado`,
      "Rosso-Nera · 7° grado",
      "Rosso-Bianca · 8° grado",
      "Rossa · 9° grado",
    ),
  },
  de: {
    pageTitle: "Diplomantragsformular",
    subtitle: "Mestre Sergio Malibu · Rot-Weiß-Gürtel · 8. Grad",
    priceTableTitle: "Preisliste",
    groupPreta: "Schwarz / Rot-Schwarz / Rot-Weiß / Rot",
    groupMarromRoxa: "Braun / Lila",
    groupAzulVerde: "Blau / Grün",
    groupAteLaranja: "Bis Orange (Weiß, Grau, Gelb, Orange)",
    sectionContact: "Kontakt",
    sectionPersonal: "Persönliche Daten",
    sectionJiuJitsu: "Jiu-Jitsu",
    email: "E-Mail",
    whatsapp: "WhatsApp (mit Ländervorwahl)",
    affiliateCode: "BJJLF Partner-Code",
    affiliateHelp: "Code der BJJLF-Partnerakademie",
    firstName: "Vorname",
    lastName: "Nachname",
    dob: "Geburtsdatum",
    documentNumber: "Ausweisnummer",
    sex: "Geschlecht",
    male: "Männlich",
    female: "Weiblich",
    fatherName: "Name des Vaters",
    motherName: "Name der Mutter",
    optional: "(optional)",
    martialArt: "Kampfkunst",
    belt: "Gürtel / Grad",
    currency: "Zahlungswährung",
    selectedBeltLabel: "Ausgewählter Gürtel",
    payNow: "Mit PayPal bezahlen",
    fillRequired: "Bitte alle Pflichtfelder ausfüllen, um die Zahlung zu aktivieren.",
    privacyNote:
      "Die Daten werden ausschließlich zur Ausstellung des BJJLF-Diploms verwendet.",
    successTitle: "Antrag eingegangen!",
    successBody:
      "Wir haben Ihren Antrag erhalten und die Zahlung ist bestätigt. Unser Team bearbeitet Ihr Diplom und sendet die Bestätigung an Ihre E-Mail.",
    belts: beltsBase(
      "Weiß",
      "Grau",
      "Gelb",
      "Orange",
      "Blau",
      "Grün",
      "Lila",
      "Braun",
      (n: number) => `Schwarz ${n}. Grad`,
      "Rot-Schwarz · 7. Grad",
      "Rot-Weiß · 8. Grad",
      "Rot · 9. Grad",
    ),
  },
};

function ordEn(n: number): string {
  if (n === 1) return "st";
  if (n === 2) return "nd";
  if (n === 3) return "rd";
  return "th";
}
