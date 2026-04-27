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
    image: "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&w=400&h=250",
    type: "No-Gi",
    badge: "NO-GI",
  },
  {
    id: "as25",
    name: "Asian Continental",
    date: "2025-07-05",
    location: "Tokyo, JP",
    image: "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=400&h=250",
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
