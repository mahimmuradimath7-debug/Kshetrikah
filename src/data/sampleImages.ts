import type { CropId, PlantPart, SymptomType, Condition, WeatherId } from './types';

export interface PresetSample {
  id: string;
  name: string;
  nameMr: string;
  crop: CropId;
  expectedDiseaseId: string;
  diseaseName: string;
  imageUrl: string;
  thumbnailUrl: string;
  affectedParts: PlantPart[];
  symptoms: SymptomType[];
  conditions: Condition[];
  suggestedWeather: WeatherId;
  aiConfidence: number;
  highlightBox: {
    x: number; // %
    y: number; // %
    width: number; // %
    height: number; // %
    label: string;
  };
  sampleNotes: string;
}

export const presetSamples: PresetSample[] = [
  {
    id: 'sample-cotton-pbw',
    name: 'Cotton — Pink Bollworm Damage',
    nameMr: 'कापूस — गुलाबी बोंडअळी प्रादुर्भाव',
    crop: 'cotton',
    expectedDiseaseId: 'cotton-pink-bollworm',
    diseaseName: 'Pink Bollworm (गुलाबी बोंडअळी)',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=200&q=70',
    affectedParts: ['fruit', 'flower'],
    symptoms: ['pest', 'rot', 'deformity'],
    conditions: ['pestsNearby', 'monoculture'],
    suggestedWeather: 'humid',
    aiConfidence: 0.94,
    highlightBox: {
      x: 32,
      y: 38,
      width: 36,
      height: 34,
      label: 'Rosette Bloom & Bore Hole',
    },
    sampleNotes: 'Field photo from Wadki, Yavatmal. Square flare and bore entrance holes with dark frass.',
  },
  {
    id: 'sample-tomato-blight',
    name: 'Tomato — Late Blight Leaf Lesions',
    nameMr: 'टोमॅटो — लेट ब्लाइट (करपा) प्रादुर्भाव',
    crop: 'tomato',
    expectedDiseaseId: 'tomato-late-blight',
    diseaseName: 'Late Blight (Phytophthora)',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=70',
    affectedParts: ['leaves', 'fruit'],
    symptoms: ['spots', 'blight', 'rot'],
    conditions: ['wet', 'cold', 'poorDrainage'],
    suggestedWeather: 'humid',
    aiConfidence: 0.96,
    highlightBox: {
      x: 22,
      y: 28,
      width: 52,
      height: 48,
      label: 'Water-soaked necrosis with pale ring',
    },
    sampleNotes: 'Field specimen from Dindori, Nashik. Irregular greasy brown necrotic blotches under high fog.',
  },
  {
    id: 'sample-sugarcane-redrot',
    name: 'Sugarcane — Red Rot Internal Tissue',
    nameMr: 'ऊस — लाल सड (तांबेरा) प्रादुर्भाव',
    crop: 'sugarcane',
    expectedDiseaseId: 'sugarcane-red-rot',
    diseaseName: 'Red Rot (Colletotrichum falcatum)',
    imageUrl: 'https://images.unsplash.com/photo-1775619427924-16ff07cf2f2e?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1775619427924-16ff07cf2f2e?w=200&q=70',
    affectedParts: ['stem', 'leaves'],
    symptoms: ['rot', 'wilting', 'spots'],
    conditions: ['wet', 'poorDrainage', 'monoculture'],
    suggestedWeather: 'rainy',
    aiConfidence: 0.91,
    highlightBox: {
      x: 28,
      y: 20,
      width: 44,
      height: 60,
      label: 'Internal red pith & white cross-bands',
    },
    sampleNotes: 'Specimen from Shirol, Kolhapur. Discolored stem pith with characteristic alcoholic fermentation smell.',
  },
  {
    id: 'sample-chili-leafcurl',
    name: 'Chili — Leaf Curl Virus & Thrips Stunting',
    nameMr: 'मिरची — बोकड्या / पर्णगुच्छ रोग',
    crop: 'chili',
    expectedDiseaseId: 'chili-leaf-curl',
    diseaseName: 'Chili Leaf Curl (ChiLCV)',
    imageUrl: 'https://images.unsplash.com/photo-1614796703136-5d26c56f839a?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614796703136-5d26c56f839a?w=200&q=70',
    affectedParts: ['leaves', 'flower', 'whole'],
    symptoms: ['deformity', 'yellowing', 'pest'],
    conditions: ['dry', 'pestsNearby'],
    suggestedWeather: 'hot_dry',
    aiConfidence: 0.89,
    highlightBox: {
      x: 25,
      y: 25,
      width: 50,
      height: 50,
      label: 'Upward cupping & vein enation',
    },
    sampleNotes: 'Field photo from Raver, Jalgaon. Boat-shaped upward leaf curling accompanied by vector thrips.',
  },
  {
    id: 'sample-rice-blast',
    name: 'Rice — Diamond Spindle Leaf Blast',
    nameMr: 'भात — पानांवरील करपा (Leaf Blast)',
    crop: 'rice',
    expectedDiseaseId: 'rice-blast',
    diseaseName: 'Rice Blast (Magnaporthe oryzae)',
    imageUrl: 'https://images.unsplash.com/photo-1568347355280-d33fdf77d42a?w=800&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1568347355280-d33fdf77d42a?w=200&q=70',
    affectedParts: ['leaves', 'stem'],
    symptoms: ['spots', 'blight'],
    conditions: ['wet', 'cold'],
    suggestedWeather: 'humid',
    aiConfidence: 0.93,
    highlightBox: {
      x: 30,
      y: 35,
      width: 40,
      height: 35,
      label: 'Spindle-shaped lesion with grey center',
    },
    sampleNotes: 'Specimen from Chiplun, Ratnagiri. Diamond-shaped spots with dark reddish-brown margins.',
  },
];
