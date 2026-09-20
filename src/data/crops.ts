import type { Crop } from "./types";

export const crops: Crop[] = [
  {
    id: "rice",
    emoji: "🌾",
    image:
      "https://images.unsplash.com/photo-1568347355280-d33fdf77d42a?w=800&q=80",
    shortDesc:
      "Staple kharif crop grown across India. Loves water but vulnerable to fungal blast in humid weather.",
    sowingMonths: [6, 7],
    harvestMonths: [10, 11],
    season: "kharif",
  },
  {
    id: "wheat",
    emoji: "🌾",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80",
    shortDesc:
      "Main rabi cereal of north India. Susceptible to rust and Karnal bunt in cool, moist conditions.",
    sowingMonths: [10, 11],
    harvestMonths: [3, 4],
    season: "rabi",
  },
  {
    id: "maize",
    emoji: "🌽",
    image:
      "https://images.unsplash.com/photo-1551810080-3eb3be72d3f4?w=800&q=80",
    shortDesc:
      "Versatile cereal used as food and feed. Fall armyworm is its biggest modern threat.",
    sowingMonths: [6, 7],
    harvestMonths: [9, 10],
    season: "kharif",
  },
  {
    id: "cotton",
    emoji: "🌿",
    image:
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80",
    shortDesc:
      "Long-duration kharif fibre crop. Pink bollworm and boll rot cause heavy losses if unmanaged.",
    sowingMonths: [5, 6],
    harvestMonths: [10, 11, 12],
    season: "kharif",
  },
  {
    id: "sugarcane",
    emoji: "🎋",
    image:
      "https://images.unsplash.com/photo-1775619427924-16ff07cf2f2e?w=800&q=80",
    shortDesc:
      "12-month cash crop. Red rot and top borer are the most damaging Indian sugarcane pests.",
    sowingMonths: [2, 3, 10],
    harvestMonths: [12, 1, 2, 3],
    season: "year-round",
  },
  {
    id: "tomato",
    emoji: "🍅",
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80",
    shortDesc:
      "High-value vegetable grown year-round. Early blight, late blight, and leaf curl virus are major threats.",
    sowingMonths: [6, 7, 1, 2],
    harvestMonths: [9, 10, 4, 5],
    season: "year-round",
  },
  {
    id: "potato",
    emoji: "🥔",
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80",
    shortDesc:
      "Rabi staple in north India. Late blight can destroy a field within a week in cool humid weather.",
    sowingMonths: [10, 11],
    harvestMonths: [2, 3],
    season: "rabi",
  },
  {
    id: "chili",
    emoji: "🌶️",
    image:
      "https://images.unsplash.com/photo-1614796703136-5d26c56f839a?w=800&q=80",
    shortDesc:
      "High-value spice crop. Thrips, fruit rot, and leaf curl are persistent challenges.",
    sowingMonths: [5, 6, 1, 2],
    harvestMonths: [9, 10, 4, 5],
    season: "year-round",
  },
];

export const cropMap: Record<string, Crop> = crops.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<string, Crop>,
);
