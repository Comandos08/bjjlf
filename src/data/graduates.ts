export type Graduate = {
  id: string;
  name: string;
  photo: string;
  belt: "black";
  beltGrade: string; // e.g. "1st Degree"
  country: string;
  countryCode: string;
  state: string;
  academy: string;
  professor: string;
  graduationDate: string;
  certificateNo: string;
  history: { year: number; belt: string; promotedBy: string }[];
};

export const GRADUATES: Graduate[] = [
  {
    id: "carlos-mendes",
    name: "Carlos Mendes",
    photo: "https://i.pravatar.cc/400?img=12",
    belt: "black",
    beltGrade: "3rd Degree",
    country: "Brazil",
    countryCode: "BR",
    state: "RJ",
    academy: "Gracie Legacy — Rio",
    professor: "Mestre Roberto Nogueira",
    graduationDate: "2014-06-10",
    certificateNo: "BJJLF-2014-0421",
    history: [
      { year: 2008, belt: "Brown", promotedBy: "Mestre Roberto Nogueira" },
      { year: 2014, belt: "Black", promotedBy: "Mestre Roberto Nogueira" },
      { year: 2018, belt: "Black 1st Degree", promotedBy: "Mestre Roberto Nogueira" },
      { year: 2024, belt: "Black 3rd Degree", promotedBy: "BJJLF Council" },
    ],
  },
  {
    id: "ana-paula-silva",
    name: "Ana Paula Silva",
    photo: "https://i.pravatar.cc/400?img=47",
    belt: "black",
    beltGrade: "2nd Degree",
    country: "Brazil",
    countryCode: "BR",
    state: "SP",
    academy: "Checkmat HQ",
    professor: "Mestre Leandro Costa",
    graduationDate: "2016-11-20",
    certificateNo: "BJJLF-2016-1102",
    history: [
      { year: 2010, belt: "Brown", promotedBy: "Mestre Leandro Costa" },
      { year: 2016, belt: "Black", promotedBy: "Mestre Leandro Costa" },
      { year: 2022, belt: "Black 2nd Degree", promotedBy: "BJJLF Council" },
    ],
  },
  {
    id: "james-okafor",
    name: "James Okafor",
    photo: "https://i.pravatar.cc/400?img=33",
    belt: "black",
    beltGrade: "1st Degree",
    country: "United States",
    countryCode: "US",
    state: "CA",
    academy: "Atos San Diego",
    professor: "Prof. André Galvão",
    graduationDate: "2019-03-15",
    certificateNo: "BJJLF-2019-0315",
    history: [
      { year: 2013, belt: "Brown", promotedBy: "Prof. André Galvão" },
      { year: 2019, belt: "Black", promotedBy: "Prof. André Galvão" },
      { year: 2024, belt: "Black 1st Degree", promotedBy: "Prof. André Galvão" },
    ],
  },
  {
    id: "marina-oliveira",
    name: "Marina Oliveira",
    photo: "https://i.pravatar.cc/400?img=23",
    belt: "black",
    beltGrade: "1st Degree",
    country: "Portugal",
    countryCode: "PT",
    state: "Lisboa",
    academy: "Alliance Lisbon",
    professor: "Prof. Tiago Barros",
    graduationDate: "2020-09-05",
    certificateNo: "BJJLF-2020-0905",
    history: [
      { year: 2014, belt: "Brown", promotedBy: "Prof. Tiago Barros" },
      { year: 2020, belt: "Black", promotedBy: "Prof. Tiago Barros" },
    ],
  },
  {
    id: "yuki-tanaka",
    name: "Yuki Tanaka",
    photo: "https://i.pravatar.cc/400?img=15",
    belt: "black",
    beltGrade: "2nd Degree",
    country: "Japan",
    countryCode: "JP",
    state: "Tokyo",
    academy: "Tri-Force Tokyo",
    professor: "Prof. Hiroyuki Abe",
    graduationDate: "2017-04-22",
    certificateNo: "BJJLF-2017-0422",
    history: [
      { year: 2011, belt: "Brown", promotedBy: "Prof. Hiroyuki Abe" },
      { year: 2017, belt: "Black", promotedBy: "Prof. Hiroyuki Abe" },
      { year: 2023, belt: "Black 2nd Degree", promotedBy: "BJJLF Council" },
    ],
  },
  {
    id: "rafael-souza",
    name: "Rafael Souza",
    photo: "https://i.pravatar.cc/400?img=51",
    belt: "black",
    beltGrade: "4th Degree",
    country: "Brazil",
    countryCode: "BR",
    state: "MG",
    academy: "Nova União BH",
    professor: "Mestre André Pederneiras",
    graduationDate: "2010-12-01",
    certificateNo: "BJJLF-2010-1201",
    history: [
      { year: 2004, belt: "Brown", promotedBy: "Mestre André Pederneiras" },
      { year: 2010, belt: "Black", promotedBy: "Mestre André Pederneiras" },
      { year: 2024, belt: "Black 4th Degree", promotedBy: "BJJLF Council" },
    ],
  },
];
