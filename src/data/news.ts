export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  category: "Tournaments" | "Promotions" | "Athletes" | "Federation";
  image: string;
  date: string;
  author: string;
  featured?: boolean;
};

const NEWS_IMG = "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600&h=350&fit=crop&q=80";
const cover = (_q: string) => NEWS_IMG;

export const NEWS: NewsItem[] = [
  {
    id: "1",
    title: "BJJLF World Championship 2025 — Registration Opens",
    excerpt: "Athletes from over 60 countries will battle for the most prestigious title in modern jiu-jitsu. Early registration begins this Friday.",
    category: "Tournaments",
    image: NEWS_IMG,
    date: "2025-04-10",
    author: "BJJLF Editorial",
    featured: true,
  },
  {
    id: "2",
    title: "Carlos Mendes Promoted to 3rd Degree Black Belt",
    excerpt: "Celebrating two decades on the mat, Mestre Mendes receives his third stripe in front of his students in Rio.",
    category: "Promotions",
    image: NEWS_IMG,
    date: "2025-04-02",
    author: "Bruno Aragão",
  },
  {
    id: "3",
    title: "European Open Returns to Lisbon This Summer",
    excerpt: "After a record-breaking edition in Madrid, the BJJLF European Open will be hosted at MEO Arena.",
    category: "Tournaments",
    image: NEWS_IMG,
    date: "2025-03-28",
    author: "Maria Lopes",
  },
  {
    id: "4",
    title: "Ana Paula Silva Headlines New Athlete Council",
    excerpt: "The federation announces a new five-member athlete council to represent competitor interests.",
    category: "Federation",
    image: cover("photo-1594737625785-a6cbdabd333c"),
    date: "2025-03-20",
    author: "BJJLF Editorial",
  },
  {
    id: "5",
    title: "No-Gi Pan-American Recap: Champions Crowned",
    excerpt: "Brazil topped the medal table, with surprise gold for Japan in the lightweight division.",
    category: "Tournaments",
    image: cover("photo-1546484959-f9a381d1330d"),
    date: "2025-03-12",
    author: "Felipe Costa",
  },
  {
    id: "6",
    title: "New Anti-Doping Protocol Effective May 1st",
    excerpt: "The federation aligns its testing program with WADA standards across all sanctioned events.",
    category: "Federation",
    image: cover("photo-1518611012118-696072aa579a"),
    date: "2025-03-05",
    author: "BJJLF Compliance",
  },
  {
    id: "7",
    title: "Athlete Spotlight: Yuki Tanaka",
    excerpt: "The Tokyo-based competitor talks training, travel, and the global growth of jiu-jitsu in Asia.",
    category: "Athletes",
    image: cover("photo-1583473848882-f9a5bc7fd2ee"),
    date: "2025-02-28",
    author: "BJJLF Editorial",
  },
];
