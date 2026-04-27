export type EventTypeBadge = "GI" | "NO-GI" | "GI & NO-GI" | "KIDS" | "MASTER";

export type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
  image: string;
  type: "Gi" | "No-Gi" | "Open";
  badge: EventTypeBadge;
};

export const EVENTS: Event[] = [
  {
    id: "wc25",
    name: "BJJLF World Championship",
    date: "2025-08-22",
    location: "Rio de Janeiro, BR",
    image: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "GI & NO-GI",
  },
  {
    id: "eu25",
    name: "European Open",
    date: "2025-06-14",
    location: "Lisbon, PT",
    image: "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "GI",
  },
  {
    id: "ng25",
    name: "Americas Open",
    date: "2025-05-30",
    location: "San Diego, US",
    image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800",
    type: "No-Gi",
    badge: "NO-GI",
  },
  {
    id: "as25",
    name: "Asian Continental",
    date: "2025-07-05",
    location: "Tokyo, JP",
    image: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=800",
    type: "Open",
    badge: "GI",
  },
  {
    id: "br25",
    name: "Brazilian Nationals",
    date: "2025-09-12",
    location: "São Paulo, BR",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "GI & NO-GI",
  },
  {
    id: "uk25",
    name: "UK Open",
    date: "2025-10-18",
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?auto=format&fit=crop&w=400&h=250",
    type: "No-Gi",
    badge: "MASTER",
  },
  // Additional events to make pagination meaningful. Image URLs intentionally
  // reuse the small set above — the SafeImage fallback handles failures, and
  // browser caching means the page stays snappy across many cards.
  {
    id: "pan25",
    name: "Pan American Championship",
    date: "2025-04-05",
    location: "Kissimmee, US",
    image: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "GI",
  },
  {
    id: "kids25",
    name: "BJJLF Kids Cup",
    date: "2025-05-10",
    location: "Madrid, ES",
    image: "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "KIDS",
  },
  {
    id: "ng-summer25",
    name: "No-Gi Summer Open",
    date: "2025-07-19",
    location: "Miami, US",
    image: "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=400&h=250",
    type: "No-Gi",
    badge: "NO-GI",
  },
  {
    id: "fr25",
    name: "French National Open",
    date: "2025-06-21",
    location: "Paris, FR",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "GI",
  },
  {
    id: "de25",
    name: "Berlin International",
    date: "2025-09-27",
    location: "Berlin, DE",
    image: "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=400&h=250",
    type: "Open",
    badge: "GI & NO-GI",
  },
  {
    id: "master-eu25",
    name: "European Master Championship",
    date: "2025-11-08",
    location: "Rome, IT",
    image: "https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "MASTER",
  },
  {
    id: "kids-br25",
    name: "Copa Kids Brasil",
    date: "2025-08-02",
    location: "Belo Horizonte, BR",
    image: "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "KIDS",
  },
  {
    id: "au25",
    name: "Australian Open",
    date: "2025-10-04",
    location: "Sydney, AU",
    image: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "GI & NO-GI",
  },
  {
    id: "ng-pro25",
    name: "No-Gi Pro Invitational",
    date: "2025-11-22",
    location: "Las Vegas, US",
    image: "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=400&h=250",
    type: "No-Gi",
    badge: "NO-GI",
  },
  {
    id: "ca25",
    name: "Canadian National Open",
    date: "2025-09-06",
    location: "Toronto, CA",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "GI",
  },
  {
    id: "kr25",
    name: "Korean Open",
    date: "2025-10-25",
    location: "Seoul, KR",
    image: "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=400&h=250",
    type: "Open",
    badge: "GI & NO-GI",
  },
  {
    id: "mx25",
    name: "Mexico National Cup",
    date: "2025-07-26",
    location: "Mexico City, MX",
    image: "https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "GI",
  },
  {
    id: "master-br25",
    name: "Brazilian Master Open",
    date: "2025-12-06",
    location: "Recife, BR",
    image: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "MASTER",
  },
  {
    id: "ng-eu25",
    name: "European No-Gi Open",
    date: "2025-11-15",
    location: "Amsterdam, NL",
    image: "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=400&h=250",
    type: "No-Gi",
    badge: "NO-GI",
  },
  {
    id: "kids-us25",
    name: "USA Kids Championship",
    date: "2025-06-07",
    location: "Dallas, US",
    image: "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "KIDS",
  },
  {
    id: "asia-pro25",
    name: "Asian Pro Invitational",
    date: "2025-12-13",
    location: "Abu Dhabi, AE",
    image: "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=400&h=250",
    type: "Open",
    badge: "GI & NO-GI",
  },
  {
    id: "ar25",
    name: "Argentine Open",
    date: "2025-08-30",
    location: "Buenos Aires, AR",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "GI",
  },
  {
    id: "ie25",
    name: "Dublin Open",
    date: "2025-09-20",
    location: "Dublin, IE",
    image: "https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "GI",
  },
  {
    id: "master-us25",
    name: "US Master Open",
    date: "2025-10-11",
    location: "Phoenix, US",
    image: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "MASTER",
  },
  {
    id: "br-rio25",
    name: "Rio Winter Open",
    date: "2025-07-12",
    location: "Rio de Janeiro, BR",
    image: "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=400&h=250",
    type: "No-Gi",
    badge: "NO-GI",
  },
  {
    id: "uk-spring25",
    name: "UK Spring Cup",
    date: "2025-04-26",
    location: "Manchester, UK",
    image: "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=400&h=250",
    type: "Gi",
    badge: "KIDS",
  },
  {
    id: "pt25",
    name: "Portugal National Open",
    date: "2025-05-17",
    location: "Porto, PT",
    image: "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=400&h=250",
    type: "Open",
    badge: "GI & NO-GI",
  },
];

export const EVENT_BADGE_STYLES: Record<EventTypeBadge, { bg: string; color: string }> = {
  "GI": { bg: "#1A6B1A", color: "#FFFFFF" },
  "NO-GI": { bg: "#B8960C", color: "#111111" },
  "GI & NO-GI": { bg: "#C41E3A", color: "#FFFFFF" },
  "KIDS": { bg: "#1565C0", color: "#FFFFFF" },
  "MASTER": { bg: "#6A0DAD", color: "#FFFFFF" },
};

export type Ranked = {
  rank: number;
  athlete: string;
  country: string;
  academy: string;
  points: number;
};

export const RANKINGS: Record<string, Ranked[]> = {
  "male-gi": [
    { rank: 1, athlete: "Carlos Mendes", country: "BR", academy: "Gracie Legacy", points: 4250 },
    { rank: 2, athlete: "James Okafor", country: "US", academy: "Atos San Diego", points: 3980 },
    { rank: 3, athlete: "Rafael Souza", country: "BR", academy: "Nova União BH", points: 3720 },
    { rank: 4, athlete: "Lucas Pereira", country: "BR", academy: "Checkmat HQ", points: 3540 },
    { rank: 5, athlete: "Diego Ramos", country: "MX", academy: "Atos México", points: 3200 },
  ],
  "male-nogi": [
    { rank: 1, athlete: "James Okafor", country: "US", academy: "Atos San Diego", points: 4100 },
    { rank: 2, athlete: "Yuki Tanaka", country: "JP", academy: "Tri-Force Tokyo", points: 3850 },
    { rank: 3, athlete: "Rafael Souza", country: "BR", academy: "Nova União BH", points: 3600 },
    { rank: 4, athlete: "Mark Williams", country: "UK", academy: "Roger Gracie London", points: 3420 },
    { rank: 5, athlete: "Pedro Martins", country: "PT", academy: "Alliance Lisbon", points: 3180 },
  ],
  "female-gi": [
    { rank: 1, athlete: "Ana Paula Silva", country: "BR", academy: "Checkmat HQ", points: 4180 },
    { rank: 2, athlete: "Marina Oliveira", country: "PT", academy: "Alliance Lisbon", points: 3940 },
    { rank: 3, athlete: "Sara Lin", country: "US", academy: "Atos San Diego", points: 3700 },
    { rank: 4, athlete: "Beatriz Costa", country: "BR", academy: "Gracie Barra", points: 3520 },
    { rank: 5, athlete: "Hana Kim", country: "KR", academy: "Seoul BJJ", points: 3200 },
  ],
  "female-nogi": [
    { rank: 1, athlete: "Marina Oliveira", country: "PT", academy: "Alliance Lisbon", points: 4040 },
    { rank: 2, athlete: "Ana Paula Silva", country: "BR", academy: "Checkmat HQ", points: 3880 },
    { rank: 3, athlete: "Sara Lin", country: "US", academy: "Atos San Diego", points: 3620 },
    { rank: 4, athlete: "Hana Kim", country: "KR", academy: "Seoul BJJ", points: 3350 },
    { rank: 5, athlete: "Julia Reyes", country: "MX", academy: "Atos México", points: 3100 },
  ],
};
