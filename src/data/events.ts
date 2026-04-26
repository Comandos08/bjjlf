export type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
  image: string;
  type: "Gi" | "No-Gi" | "Open";
};

const cover = (q: string) => `https://images.unsplash.com/${q}?auto=format&fit=crop&w=900&q=70`;

export const EVENTS: Event[] = [
  { id: "wc25", name: "BJJLF World Championship", date: "2025-08-22", location: "Rio de Janeiro, BR", image: cover("photo-1551698618-1dfe5d97d256"), type: "Gi" },
  { id: "eu25", name: "European Open", date: "2025-06-14", location: "Lisbon, PT", image: cover("photo-1517649763962-0c623066013b"), type: "Gi" },
  { id: "ng25", name: "No-Gi Pan-American", date: "2025-05-30", location: "San Diego, US", image: cover("photo-1599050751795-6cdaafbc2319"), type: "No-Gi" },
  { id: "as25", name: "Asian Continental", date: "2025-07-05", location: "Tokyo, JP", image: cover("photo-1554482585-c2e0b6c2cf80"), type: "Open" },
  { id: "br25", name: "Brazilian Nationals", date: "2025-09-12", location: "São Paulo, BR", image: cover("photo-1571019613454-1cb2f99b2d8b"), type: "Gi" },
  { id: "uk25", name: "UK Open", date: "2025-10-18", location: "London, UK", image: cover("photo-1546484959-f9a381d1330d"), type: "No-Gi" },
];

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
