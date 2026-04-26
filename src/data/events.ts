export type Event = {
  id: string;
  name: string;
  date: string;
  location: string;
  image: string;
  type: "Gi" | "No-Gi" | "Open";
};

const EVENT_IMG = "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400&h=250&fit=crop&q=80";

export const EVENTS: Event[] = [
  { id: "wc25", name: "BJJLF World Championship", date: "2025-08-22", location: "Rio de Janeiro, BR", image: EVENT_IMG, type: "Gi" },
  { id: "eu25", name: "European Open", date: "2025-06-14", location: "Lisbon, PT", image: EVENT_IMG, type: "Gi" },
  { id: "ng25", name: "Americas Open", date: "2025-05-30", location: "San Diego, US", image: EVENT_IMG, type: "No-Gi" },
  { id: "as25", name: "Asian Continental", date: "2025-07-05", location: "Tokyo, JP", image: EVENT_IMG, type: "Open" },
  { id: "br25", name: "Brazilian Nationals", date: "2025-09-12", location: "São Paulo, BR", image: EVENT_IMG, type: "Gi" },
  { id: "uk25", name: "UK Open", date: "2025-10-18", location: "London, UK", image: EVENT_IMG, type: "No-Gi" },
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
