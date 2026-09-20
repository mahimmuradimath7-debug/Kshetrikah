import type { Disease } from './types';

export const diseases: Disease[] = [
  // ───── RICE ─────
  {
    id: 'rice-blast',
    name: 'Rice Blast',
    crop: 'rice',
    pathogen: 'Fungal (Magnaporthe oryzae)',
    severity: 'severe',
    bestSeason: 'kharif',
    affectedParts: ['leaves', 'stem', 'whole'],
    symptomTypes: ['spots', 'blight'],
    conditions: ['wet', 'cold', 'monoculture'],
    symptoms: [
      'Diamond- or eye-shaped grey-green lesions on leaves',
      'Lesions turn white or grey in the centre with dark borders',
      'Neck of the panicle turns black and breaks (neck blast)',
      'Severe infection kills entire seedlings in the nursery',
    ],
    causes:
      'The fungus survives in infected stubble and seeds. Spores spread by wind in cool, humid weather with leaf wetness from dew or rain.',
    organicTreatment: [
      'Spray Pseudomonas fluorescens @ 10 g/L as a biocontrol at booting stage',
      'Apply neem cake @ 2.5 q/ha at transplanting to suppress the fungus',
      'Foliar spray of 1% Bordeaux mixture at disease appearance',
    ],
    chemicalTreatment: [
      'Tricyclazole 75% WP @ 0.6 g/L — most effective for blast',
      'Or Isoprothiolane 40% EC @ 1.5 ml/L',
      'Repeat after 10–12 days if humidity persists. Use 200 L spray solution per acre.',
    ],
    prevention: [
      'Use certified disease-free seed and resistant varieties (IR 64, Improved Samba Mahsuri)',
      'Avoid excess nitrogen; split nitrogen application into 3 doses',
      'Maintain proper plant spacing (20 × 15 cm) for air circulation',
      'Burn or plough under infected stubble after harvest',
    ],
    shortDesc:
      'Most destructive fungal disease of rice. Spreads fast in cool, humid weather.',
  },
  {
    id: 'rice-bacterial-blight',
    name: 'Bacterial Leaf Blight',
    crop: 'rice',
    pathogen: 'Bacterial (Xanthomonas oryzae)',
    severity: 'severe',
    bestSeason: 'kharif',
    affectedParts: ['leaves', 'whole'],
    symptomTypes: ['yellowing', 'blight', 'wilting'],
    conditions: ['wet', 'monoculture'],
    symptoms: [
      'Yellow to white lesions starting from leaf tip and margins',
      'Lesions advance downward along the veins',
      'Milky or yellow bacterial ooze in the morning',
      'Severely infected plants wilt and dry up (kresek)',
    ],
    causes:
      'Caused by Xanthomonas bacteria surviving in seed and infected debris. Spreads through wind-driven rain, irrigation water, and contaminated tools.',
    organicTreatment: [
      'Spray fresh cow-dung extract (20 g/L) twice at 10-day interval',
      'Apply Pseudomonas fluorescens as seed treatment (10 g/kg seed) and foliar spray',
    ],
    chemicalTreatment: [
      'Streptocycline 100 ppm + Copper oxychloride 0.3% combination spray',
      'Repeat after 7–10 days. Avoid spraying during hot afternoon hours.',
    ],
    prevention: [
      'Use resistant varieties (IR 20, Ajaya, IR 36)',
      'Treat seeds with hot water (52 °C for 30 min) before sowing',
      'Drain fields during severe infection and avoid flood irrigation',
      'Balanced fertilisation — avoid excess nitrogen',
    ],
    shortDesc:
      'Bacterial disease causing yellow lesions from leaf tips. Severe in kharif with heavy rain.',
  },
  {
    id: 'rice-shekhar-rot',
    name: 'Sheath Blight',
    crop: 'rice',
    pathogen: 'Fungal (Rhizoctonia solani)',
    severity: 'high',
    bestSeason: 'kharif',
    affectedParts: ['leaves', 'stem'],
    symptomTypes: ['spots', 'blight'],
    conditions: ['wet', 'monoculture'],
    symptoms: [
      'Water-soaked oval lesions on leaf sheaths near water line',
      'Greyish-white mycelium visible on humid mornings',
      'Lesions merge and turn the whole sheath grey-white',
      'Affected tillers die, reducing grain fill',
    ],
    causes:
      'Soil-borne fungus surviving in sclerotia for years. Thrives in dense canopies, high humidity (above 90%) and 28–32 °C temperature.',
    organicTreatment: [
      'Spray Trichoderma viride @ 5 g/L at booting stage',
      'Pseudomonas fluorescens foliar spray at tillering',
    ],
    chemicalTreatment: [
      'Validamycin 3% L @ 2 ml/L — systemic and effective',
      'Or Hexaconazole 5% EC @ 2 ml/L',
      'Apply twice: at booting and 15 days later',
    ],
    prevention: [
      'Maintain wider spacing (25 × 20 cm) for air movement',
      'Avoid late top-dressing of nitrogen',
      'Burn infected stubble and rotate with non-grass crops',
    ],
    shortDesc:
      'Fungal sheath disease. Spreads fast in dense, humid canopies during kharif.',
  },
  {
    id: 'rice-brown-plant-hopper',
    name: 'Brown Plant Hopper',
    crop: 'rice',
    pathogen: 'Insect (Nilaparvata lugens)',
    severity: 'severe',
    bestSeason: 'kharif',
    affectedParts: ['stem', 'whole'],
    symptomTypes: ['wilting', 'pest'],
    conditions: ['wet', 'monoculture'],
    symptoms: [
      'Hoppers visible at the base of plants, especially during morning',
      'Plants dry out in circular patches — “hopperburn”',
      'Yellowing then drying of tillers',
      'Sticky honeydew and sooty mould on lower leaves',
    ],
    causes:
      'A planthopper that multiplies explosively in continuous flooded rice with high nitrogen. Migrates long distances during monsoon.',
    organicTreatment: [
      'Drain the field for 2–3 days to disrupt the pest',
      'Conserve spiders and mirid bugs — avoid broad-spectrum insecticides',
      'Spray neem oil 0.5% with sticker',
    ],
    chemicalTreatment: [
      'Imidacloprid 17.8% SL @ 0.3 ml/L',
      'Or Pymetrozine 50% WG @ 0.6 g/L',
      'Spray at the base of plants; avoid hitting the canopy',
    ],
    prevention: [
      'Avoid continuous flooding — adopt intermittent irrigation',
      'Use resistant varieties (MTU 7029, IR 64)',
      'Do not apply excess nitrogen beyond recommended dose',
      'Rotate with pulses or oilseeds',
    ],
    shortDesc:
      'Sap-sucking planthopper that causes “hopperburn”. Major threat in monsoon rice.',
  },

  // ───── WHEAT ─────
  {
    id: 'wheat-yellow-rust',
    name: 'Yellow Rust (Stripe Rust)',
    crop: 'wheat',
    pathogen: 'Fungal (Puccinia striiformis)',
    severity: 'severe',
    bestSeason: 'rabi',
    affectedParts: ['leaves'],
    symptomTypes: ['spots', 'powder'],
    conditions: ['wet', 'cold', 'monoculture'],
    symptoms: [
      'Yellow-orange powdery stripes of pustules between leaf veins',
      'Pustules arranged in linear rows along the leaf',
      'Heavily infected leaves dry prematurely',
      'Disease appears first on lower leaves then spreads up',
    ],
    causes:
      'Cool-loving fungus (10–20 °C). Spores travel on wind from hills to plains during November–February.',
    organicTreatment: [
      'Foliar spray of neem oil 0.5% at first appearance',
      'Cow urine 10% + neem oil 0.5% mix as preventive',
    ],
    chemicalTreatment: [
      'Propiconazole 25% EC @ 1 ml/L',
      'Or Tebuconazole 250 EC @ 1 ml/L',
      'Spray at first pustule appearance; repeat after 15 days if needed',
    ],
    prevention: [
      'Plant resistant varieties (HD 3086, DBW 187, PBW 725)',
      'Sow at the recommended time (early November in north India)',
      'Destroy volunteer wheat plants and alternate host grasses',
    ],
    shortDesc:
      'Yellow-stripe rust appearing in cool, humid rabi weather. Highly destructive if untreated.',
  },
  {
    id: 'wheat-brown-rust',
    name: 'Brown / Leaf Rust',
    crop: 'wheat',
    pathogen: 'Fungal (Puccinia triticina)',
    severity: 'high',
    bestSeason: 'rabi',
    affectedParts: ['leaves'],
    symptomTypes: ['spots', 'powder'],
    conditions: ['wet', 'monoculture'],
    symptoms: [
      'Round orange-brown pustules scattered on leaves',
      'Pustules mainly on upper leaf surface',
      'Severe infection causes leaf drying and chaffy grains',
    ],
    causes:
      'Wind-borne fungal spores. Favours 15–25 °C temperature with dew or light rain.',
    organicTreatment: [
      'Spray fresh cow-dung extract 10% at tillering stage',
    ],
    chemicalTreatment: [
      'Propiconazole 25% EC @ 1 ml/L at first pustule appearance',
      'Repeat after 15 days if disease pressure continues',
    ],
    prevention: [
      'Grow resistant cultivars (HD 2967, HD 3086)',
      'Destroy volunteer wheat and grassy weeds',
    ],
    shortDesc:
      'Common rust causing round orange pustules. Reduces grain weight significantly.',
  },
  {
    id: 'wheat-loose-smut',
    name: 'Loose Smut',
    crop: 'wheat',
    pathogen: 'Fungal (Ustilago tritici)',
    severity: 'moderate',
    bestSeason: 'rabi',
    affectedParts: ['flower', 'whole'],
    symptomTypes: ['deformity', 'powder'],
    conditions: ['wet'],
    symptoms: [
      'Ear heads emerge covered in black powdery mass',
      'No grains form in infected ear',
      'Black spores blow away, leaving only rachis',
    ],
    causes:
      'Seed-borne fungus. Spores from infected flowers land on healthy flowers at anthesis and infect the seed embryo.',
    organicTreatment: [
      'Solar energy treatment of seeds — expose to strong sun for 4–5 hours',
      'Hot water treatment: 52 °C for 10 minutes (carefully done)',
    ],
    chemicalTreatment: [
      'Carboxin 75% WP @ 2 g/kg seed as seed treatment',
      'Or Tebuconazole 2% DS @ 1 g/kg seed',
    ],
    prevention: [
      'Always use certified, treated seed',
      'Avoid saving seed from infected fields',
    ],
    shortDesc:
      'Seed-borne smut that destroys entire ear heads. Easily prevented by seed treatment.',
  },
  {
    id: 'wheat-karnal-bunt',
    name: 'Karnal Bunt',
    crop: 'wheat',
    pathogen: 'Fungal (Tilletia indica)',
    severity: 'high',
    bestSeason: 'rabi',
    affectedParts: ['flower'],
    symptomTypes: ['deformity', 'powder'],
    conditions: ['wet', 'cold'],
    symptoms: [
      'Only a few grains per ear are infected',
      'Infected grains turn black, give a fishy smell',
      'Black powder (teliospores) released when grain is crushed',
    ],
    causes:
      'Soil and seed-borne fungus. Spores germinate during flowering under high humidity and cool temperatures.',
    organicTreatment: [
      'Treat seed with Trichoderma viride @ 4 g/kg',
    ],
    chemicalTreatment: [
      'Propiconazole 25% EC @ 1 ml/L at boot stage as protective spray',
    ],
    prevention: [
      'Use certified disease-free seed',
      'Adjust sowing so flowering does not coincide with cool, humid weather',
      'Deep ploughing to bury spores',
    ],
    shortDesc:
      'Quarantine-significant disease — produces fishy smell and black spore masses in grains.',
  },

  // ───── MAIZE ─────
  {
    id: 'maize-fall-armyworm',
    name: 'Fall Armyworm',
    crop: 'maize',
    pathogen: 'Insect (Spodoptera frugiperda)',
    severity: 'severe',
    bestSeason: 'kharif',
    affectedParts: ['leaves', 'whole'],
    symptomTypes: ['pest', 'blight'],
    conditions: ['wet', 'monoculture'],
    symptoms: [
      'Ragged holes and “window pane” feeding on whorl leaves',
      'Fresh faecal pellets visible inside the whorl',
      'Larvae with inverted-Y marking on head and four dark spots on last segment',
      'Severe attack destroys the whorl and tassel',
    ],
    causes:
      'Invasive moth whose larvae feed inside the whorl. Spreads fast in continuous maize with staggered plantings.',
    organicTreatment: [
      'Apply sand + lime mixture (9:1) into the whorl to kill larvae',
      'Spray Bacillus thuringiensis (Bt) @ 1 g/L on young larvae',
      'Release Trichogramma pretiosum egg parasitoids @ 1 lakh/ha weekly',
    ],
    chemicalTreatment: [
      'Emamectin benzoate 5% SG @ 0.4 g/L into the whorl',
      'Or Spinetoram 11.7% SC @ 0.5 ml/L',
      'Treat when 5–10% plants show damage; spot-application is enough',
    ],
    prevention: [
      'Avoid staggered sowing across large areas',
      'Plant border rows of Napier grass as trap crop',
      'Rotate maize with legumes',
    ],
    shortDesc:
      'Invasive pest that destroys whorl leaves. Major threat since 2018 in India.',
  },
  {
    id: 'maize-turcicum-leaf-blight',
    name: 'Turcicum Leaf Blight',
    crop: 'maize',
    pathogen: 'Fungal (Exserohilum turcicum)',
    severity: 'high',
    bestSeason: 'kharif',
    affectedParts: ['leaves'],
    symptomTypes: ['spots', 'blight'],
    conditions: ['wet', 'monoculture'],
    symptoms: [
      'Long cigar-shaped grey-green lesions on leaves',
      'Lesions 2–15 cm long, parallel to veins',
      'Severe infection causes complete leaf death',
    ],
    causes:
      'Wind-borne fungus surviving in infected debris. Favoured by moderate temperatures (18–27 °C) and high humidity.',
    organicTreatment: [
      'Spray Trichoderma viride @ 5 g/L at first appearance',
    ],
    chemicalTreatment: [
      'Mancozeb 75% WP @ 2.5 g/L',
      'Or Propiconazole 25% EC @ 1 ml/L',
      'Repeat after 10 days if humidity continues',
    ],
    prevention: [
      'Use resistant hybrids (NK 6240, DKC 9108)',
      'Crop rotation with soybean or pulses',
      'Destroy infected debris after harvest',
    ],
    shortDesc:
      'Long cigar-shaped lesions on maize leaves. Reduces yield if it reaches the ear leaf.',
  },
  {
    id: 'maize-stalk-rot',
    name: 'Stalk Rot',
    crop: 'maize',
    pathogen: 'Fungal complex (Fusarium, Macrophomina)',
    severity: 'high',
    bestSeason: 'kharif',
    affectedParts: ['stem', 'root'],
    symptomTypes: ['rot', 'wilting'],
    conditions: ['wet', 'poorDrainage'],
    symptoms: [
      'Stalk softens and lodges before harvest',
      'Pith disintegrates and turns pinkish or brown',
      'Black microsclerotia visible inside the stalk',
      'Plants wilt suddenly even with green leaves',
    ],
    causes:
      'Multiple fungi attacking senescing stalks. Worsened by drought stress, waterlogging, and excess nitrogen.',
    organicTreatment: [
      'Apply Trichoderma harzianum @ 2.5 kg/ha mixed in FYM at sowing',
    ],
    chemicalTreatment: [
      'Carbendazim 50% WP @ 1 g/L spray at silking stage as preventive',
    ],
    prevention: [
      'Balanced nutrition — avoid excess N, ensure adequate K',
      'Maintain proper drainage',
      'Harvest at correct maturity to avoid late-season stress',
    ],
    shortDesc:
      'Stalk rots and lodging before harvest. Often a season-end problem in drought-stressed maize.',
  },

  // ───── COTTON ─────
  {
    id: 'cotton-pink-bollworm',
    name: 'Pink Bollworm',
    crop: 'cotton',
    pathogen: 'Insect (Pectinophora gossypiella)',
    severity: 'severe',
    bestSeason: 'kharif',
    affectedParts: ['flower', 'fruit'],
    symptomTypes: ['pest', 'deformity', 'rot'],
    conditions: ['dry', 'monoculture'],
    symptoms: [
      'Rosetted flowers that fail to open properly',
      'Pink larvae inside bolls with black heads',
      'Premature boll opening and stained lint',
      'Exit holes with frass on bolls',
    ],
    causes:
      'Larvae bore into bolls and feed on developing seeds. Survives in cotton stalks and soil as diapausing larvae.',
    organicTreatment: [
      'Release Trichogramma bactrae @ 1.5 lakh/ha weekly from square formation',
      'Pheromone traps @ 5/ha to monitor and mass-trick males',
      'Spray Bt formulation @ 1 kg/ha at peak flowering',
    ],
    chemicalTreatment: [
      'Emamectin benzoate 5% SG @ 0.4 g/L',
      'Or Profenofos 50% EC @ 2 ml/L',
      'Spray at peak flowering when ETL of 5 rosetted flowers/100 plants is crossed',
    ],
    prevention: [
      'Adopt mandatory crop termination date — remove last-year stalks by January',
      'Avoid ratoon and late-season cotton',
      'Install pheromone traps from square formation stage',
      'Use Bt cotton only with refugia (non-Bt 5 rows for every 25 Bt rows)',
    ],
    shortDesc:
      'Most destructive bollworm of Indian cotton. Larvae inside bolls are protected from sprays.',
  },
  {
    id: 'cotton-boll-rot',
    name: 'Boll Rot',
    crop: 'cotton',
    pathogen: 'Fungal complex (Aspergillus, Fusarium, Rhizopus)',
    severity: 'high',
    bestSeason: 'kharif',
    affectedParts: ['fruit', 'flower'],
    symptomTypes: ['rot', 'spots'],
    conditions: ['wet', 'monoculture'],
    symptoms: [
      'Bolls turn brown to black and soft',
      'White, pink, or black fungal growth on boll surface',
      'Lint inside discolours and loses value',
      'Bad smell from rotten bolls',
    ],
    causes:
      'Multiple fungi attacking damaged or insect-infested bolls. Worsened by humid weather and dense canopies.',
    organicTreatment: [
      'Spray Trichoderma viride @ 5 g/L during boll formation',
    ],
    chemicalTreatment: [
      'Carbendazim 50% WP @ 1 g/L + Mancozeb 75% WP @ 2 g/L combination spray',
      'Or Copper oxychloride 0.3% spray',
    ],
    prevention: [
      'Manage pink and American bollworm to prevent entry points',
      'Maintain plant spacing for air circulation',
      'Avoid late-season nitrogen',
      'Harvest timely — do not allow over-mature bolls',
    ],
    shortDesc:
      'Fungal boll rot worsened by insect damage and humid weather. Reduces lint quality.',
  },
  {
    id: 'cotton-leaf-curl-virus',
    name: 'Cotton Leaf Curl Virus',
    crop: 'cotton',
    pathogen: 'Viral (Begomovirus)',
    severity: 'severe',
    bestSeason: 'kharif',
    affectedParts: ['leaves', 'whole'],
    symptomTypes: ['deformity', 'yellowing'],
    conditions: ['dry', 'pestsNearby'],
    symptoms: [
      'Upward curling and cupping of young leaves',
      'Thick, dark green veins on the underside',
      'Stunted plants with reduced boll formation',
      'Whitefly colonies on lower leaf surface',
    ],
    causes:
      'Transmitted by the whitefly Bemisia tabaci. Virus persists in weeds like Sida and Abutilon.',
    organicTreatment: [
      'Manage whitefly with neem oil 0.5% spray',
      'Remove and destroy infected plants in early stages',
      'Yellow sticky traps @ 12/ha to monitor whiteflies',
    ],
    chemicalTreatment: [
      'Manage whitefly: Diafenthiuron 50% WP @ 1.2 g/L',
      'Or Pyriproxyfen 10% EC @ 1 ml/L',
      'No direct cure for the virus — control the vector',
    ],
    prevention: [
      'Plant resistant varieties (recommended Bt hybrids with CLCuV tolerance)',
      'Use only certified seed',
      'Destroy weed hosts around the field',
      'Border cropping with sorghum to reduce whitefly influx',
    ],
    shortDesc:
      'Whitefly-transmitted virus causing leaf curl. Severe in north India during dry spells.',
  },

  // ───── SUGARCANE ─────
  {
    id: 'sugarcane-red-rot',
    name: 'Red Rot',
    crop: 'sugarcane',
    pathogen: 'Fungal (Colletotrichum falcatum)',
    severity: 'severe',
    bestSeason: 'kharif',
    affectedParts: ['stem', 'whole'],
    symptomTypes: ['rot', 'wilting'],
    conditions: ['wet', 'monoculture'],
    symptoms: [
      'Reddening of internodes with white spots in the centre',
      'Pith turns red and then dark brown with alcoholic smell',
      'Leaves dry from tip downwards, especially in upper canes',
      'Stalk split open reveals red discoloration',
    ],
    causes:
      'Soil and sett-borne fungus. Spreads through infected seed cane, irrigation water, and rain splash.',
    organicTreatment: [
      'Sett treatment with Trichoderma viride @ 5 g/L for 30 minutes before planting',
      'Apply neem cake @ 2.5 q/ha at planting',
    ],
    chemicalTreatment: [
      'Carbendazim 50% WP sett treatment @ 0.5 g/L for 30 min',
      'Foliar spray not effective — disease is internal',
    ],
    prevention: [
      'Use only disease-free seed cane from disease-free nurseries',
      'Plant resistant varieties (Co 0238, Co 0118, Co 8021)',
      'Crop rotation with non-grass crops for at least one season',
      'Destroy infected clumps immediately',
    ],
    shortDesc:
      'Most damaging sugarcane disease. Spreads through infected seed cane.',
  },
  {
    id: 'sugarcane-top-borer',
    name: 'Top Borer',
    crop: 'sugarcane',
    pathogen: 'Insect (Scirpophaga excerpta)',
    severity: 'high',
    bestSeason: 'kharif',
    affectedParts: ['stem', 'leaves'],
    symptomTypes: ['pest', 'deformity'],
    conditions: ['wet'],
    symptoms: [
      'Dead-heart in young shoots',
      'Cluster of tillers from a single base (bunchy top)',
      'Holes and frass visible on top portion of canes',
      'Cane growth stunted; sugar content drops',
    ],
    causes:
      'Larvae bore into the growing top of the cane. Active during monsoon months.',
    organicTreatment: [
      'Release Trichogramma japonicum @ 50,000/ha weekly during July–August',
      'Remove and destroy dead-hearts',
    ],
    chemicalTreatment: [
      'Chlorantraniliprole 18.5% SC @ 0.4 ml/L spray on shoots',
      'Apply during early tillering when first dead-hearts appear',
    ],
    prevention: [
      'Use healthy, treated seed cane',
      'Earthing up in early growth to discourage egg-laying',
      'Trash mulching reduces egg-laying on soil',
    ],
    shortDesc:
      'Borer that kills growing tops and reduces cane height. Major in monsoon.',
  },
  {
    id: 'sugarcane-pyrilla',
    name: 'Pyrilla (Sugarcane Leafhopper)',
    crop: 'sugarcane',
    pathogen: 'Insect (Pyrilla perpusilla)',
    severity: 'moderate',
    bestSeason: 'kharif',
    affectedParts: ['leaves'],
    symptomTypes: ['pest', 'yellowing'],
    conditions: ['dry', 'monoculture'],
    symptoms: [
      'Yellowish planthoppers visible on lower leaf surface',
      'Copious honeydew leading to sooty mould on leaves',
      'Leaves turn yellow and dry up',
      'Reduced juice quality',
    ],
    causes:
      'Sap-sucking planthopper multiplying in dry weather. Outbreaks common in irrigated sugarcane.',
    organicTreatment: [
      'Conserve egg parasitoid Epiricania melanoleuca — avoid broad-spectrum sprays',
      'Release Epiricania @ 4000 cocoons/ha if available locally',
    ],
    chemicalTreatment: [
      'Imidacloprid 17.8% SL @ 0.3 ml/L',
      'Or Quinalphos 25% EC @ 2 ml/L',
      'Spray on lower leaf surface',
    ],
    prevention: [
      'Avoid late-season water stress',
      'Detrash the crop in July to reduce pest harbourage',
    ],
    shortDesc:
      'Sap-sucking planthopper causing honeydew and sooty mould. Outbreaks in dry years.',
  },

  // ───── TOMATO ─────
  {
    id: 'tomato-early-blight',
    name: 'Early Blight',
    crop: 'tomato',
    pathogen: 'Fungal (Alternaria solani)',
    severity: 'high',
    bestSeason: 'kharif',
    affectedParts: ['leaves', 'stem', 'fruit'],
    symptomTypes: ['spots', 'blight'],
    conditions: ['wet', 'monoculture'],
    symptoms: [
      'Dark brown spots with concentric rings (“target” pattern)',
      'Yellow halo around spots',
      'Spots start on lower leaves and progress upward',
      'Fruit may develop leathery dark spots near stem end',
    ],
    causes:
      'Soil and seed-borne fungus. Spores spread by wind and rain splash. Favoured by warm humid weather.',
    organicTreatment: [
      'Spray Trichoderma viride @ 5 g/L as preventive at 15-day intervals',
      'Bordeaux mixture 1% at first symptom',
    ],
    chemicalTreatment: [
      'Mancozeb 75% WP @ 2.5 g/L',
      'Or Chlorothalonil 75% WP @ 2 g/L',
      'Or Azoxystrobin 23% SC @ 1 ml/L — alternate with contact fungicides',
    ],
    prevention: [
      'Stake plants and prune lower leaves for air circulation',
      'Mulch to prevent soil splash',
      'Crop rotation — avoid potato, brinjal, chilli',
      'Remove infected debris immediately',
    ],
    shortDesc:
      'Target-spot disease of tomato. Common in warm humid weather and old plantings.',
  },
  {
    id: 'tomato-late-blight',
    name: 'Late Blight',
    crop: 'tomato',
    pathogen: 'Oomycete (Phytophthora infestans)',
    severity: 'severe',
    bestSeason: 'rabi',
    affectedParts: ['leaves', 'stem', 'fruit'],
    symptomTypes: ['spots', 'blight', 'rot'],
    conditions: ['wet', 'cold'],
    symptoms: [
      'Water-soaked grey-green lesions on leaves and stems',
      'White fungal growth on underside of leaves in humid mornings',
      'Fruits turn brown, leathery, and rot',
      'Entire field can collapse within a week',
    ],
    causes:
      'Same pathogen as potato late blight. Thrives in 10–20 °C with high humidity and leaf wetness.',
    organicTreatment: [
      'Bordeaux mixture 1% spray at first appearance',
      'Remove and destroy infected plants immediately',
    ],
    chemicalTreatment: [
      'Metalaxyl + Mancozeb 72% WP @ 2.5 g/L — most effective',
      'Or Cymoxanil + Mancozeb @ 3 g/L',
      'Spray every 5–7 days during humid weather',
    ],
    prevention: [
      'Plant resistant hybrids (Seminis, Syngenta resistant lines)',
      'Avoid overhead irrigation — use drip',
      'Wide spacing and staking',
      'Do not plant near potato fields',
    ],
    shortDesc:
      'Devastating disease that can collapse an entire field in a week. Same pathogen as potato late blight.',
  },
  {
    id: 'tomato-leaf-curl-virus',
    name: 'Tomato Leaf Curl Virus',
    crop: 'tomato',
    pathogen: 'Viral (Begomovirus)',
    severity: 'severe',
    bestSeason: 'year-round',
    affectedParts: ['leaves', 'whole'],
    symptomTypes: ['deformity', 'yellowing'],
    conditions: ['dry', 'pestsNearby'],
    symptoms: [
      'Severe upward curling, puckering of young leaves',
      'Stunted plants with shortened internodes',
      'Flowers drop, fruit set very poor',
      'Whiteflies visible on lower leaf surface',
    ],
    causes:
      'Transmitted by whitefly Bemisia tabaci. Virus persists in weeds like Parthenium and Croton.',
    organicTreatment: [
      'Neem oil 0.5% spray weekly to suppress whitefly',
      'Yellow sticky traps for monitoring',
    ],
    chemicalTreatment: [
      'Manage whitefly: Diafenthiuron 50% WP @ 1.2 g/L',
      'Or Spiromesifen 22.9% SC @ 1 ml/L',
      'No chemical cure for virus once plant is infected',
    ],
    prevention: [
      'Use resistant hybrids (check seed company catalogue)',
      'Plant only during low whitefly periods if possible',
      'Cover nursery with 50-mesh nylon net',
      'Remove and destroy infected seedlings early',
    ],
    shortDesc:
      'Whitefly-transmitted virus — the most damaging viral disease of tomato in India.',
  },
  {
    id: 'tomato-fruit-borer',
    name: 'Tomato Fruit Borer',
    crop: 'tomato',
    pathogen: 'Insect (Helicoverpa armigera)',
    severity: 'severe',
    bestSeason: 'year-round',
    affectedParts: ['fruit', 'flower'],
    symptomTypes: ['pest'],
    conditions: ['dry', 'monoculture'],
    symptoms: [
      'Circular bore holes on fruits',
      'Larvae inside fruits with faecal matter',
      'Damaged fruits rot quickly',
      'Damaged flower buds and shoots',
    ],
    causes:
      'Polyphagous moth whose larvae bore into fruits. One larva can damage several fruits.',
    organicTreatment: [
      'Pheromone traps @ 5/ha for monitoring and mass trapping',
      'Bt @ 1 g/L on young larvae',
      'Release Trichogramma pretiosum @ 1 lakh/ha weekly',
      'Helicoverpa NPV @ 250 LE/ha at flowering',
    ],
    chemicalTreatment: [
      'Emamectin benzoate 5% SG @ 0.4 g/L',
      'Or Chlorantraniliprole 18.5% SC @ 0.4 ml/L',
      'Spray during evening hours; rotate IRAC groups',
    ],
    prevention: [
      'Avoid staggered planting',
      'Deep summer ploughing to kill pupae',
      'Hand-pick larvae in small plantings',
      'Install bird perches in the field',
    ],
    shortDesc:
      'Polyphagous borer that makes fruits unmarketable. Most damaging insect pest of tomato.',
  },

  // ───── POTATO ─────
  {
    id: 'potato-late-blight',
    name: 'Late Blight',
    crop: 'potato',
    pathogen: 'Oomycete (Phytophthora infestans)',
    severity: 'severe',
    bestSeason: 'rabi',
    affectedParts: ['leaves', 'stem', 'whole'],
    symptomTypes: ['spots', 'blight', 'rot'],
    conditions: ['wet', 'cold'],
    symptoms: [
      'Water-soaked dark lesions on leaf tips and margins',
      'White mildew growth on underside of leaves in humid mornings',
      'Stems turn brown and collapse',
      'Tuber rot with reddish-brown granular rot extending into flesh',
    ],
    causes:
      'Air-borne oomycete that thrives in cool (10–20 °C) humid weather. Famous for causing the Irish potato famine.',
    organicTreatment: [
      'Bordeaux mixture 1% spray weekly during humid weather',
      'Destroy volunteer potato plants and cull piles',
    ],
    chemicalTreatment: [
      'Metalaxyl + Mancozeb 72% WP @ 2.5 g/L',
      'Or Mandipropamid 23.4% SC @ 0.8 ml/L',
      'Spray on a 5–7 day schedule during blight-favourable weather',
    ],
    prevention: [
      'Use certified disease-free seed tubers',
      'Plant resistant varieties (Kufri Jyoti, Kufri Pukhraj)',
      'Destroy infected haulms before harvest to protect tubers',
      'Avoid overhead irrigation; ridge well to protect tubers',
    ],
    shortDesc:
      'Most destructive potato disease globally. Can destroy crop in 1–2 weeks under favourable weather.',
  },
  {
    id: 'potato-early-blight',
    name: 'Early Blight',
    crop: 'potato',
    pathogen: 'Fungal (Alternaria solani)',
    severity: 'high',
    bestSeason: 'rabi',
    affectedParts: ['leaves'],
    symptomTypes: ['spots', 'blight'],
    conditions: ['wet', 'monoculture'],
    symptoms: [
      'Dark brown spots with concentric rings (“bull’s eye”)',
      'Lower leaves affected first',
      'Severe defoliation by mid-season',
      'Smaller tuber size due to loss of leaf area',
    ],
    causes:
      'Soil and debris-borne fungus. Worsened by plant stress (water/nutrient deficiency) and warm humid weather.',
    organicTreatment: [
      'Trichoderma viride @ 5 g/L spray at 15-day interval',
      'Bordeaux mixture 1% spray',
    ],
    chemicalTreatment: [
      'Mancozeb 75% WP @ 2.5 g/L',
      'Or Azoxystrobin 23% SC @ 1 ml/L',
    ],
    prevention: [
      'Balanced fertilization — avoid potassium deficiency',
      'Crop rotation with non-solanaceous crops',
      'Adequate irrigation — avoid stress',
    ],
    shortDesc:
      'Concentric-ring leaf spots causing defoliation. Reduces tuber size significantly.',
  },
  {
    id: 'potato-black-scurf',
    name: 'Black Scurf',
    crop: 'potato',
    pathogen: 'Fungal (Rhizoctonia solani)',
    severity: 'moderate',
    bestSeason: 'rabi',
    affectedParts: ['stem', 'root'],
    symptomTypes: ['spots', 'deformity'],
    conditions: ['wet', 'cold'],
    symptoms: [
      'Black scurf-like sclerotia stuck on tuber surface',
      'Stolon pruning — few or no tubers on some stems',
      'Green or aerial tubers on stems above ground',
      'White mycelium at stem base of young plants',
    ],
    causes:
      'Soil-borne fungus. Sclerotia on seed tubers and in soil cause primary infection.',
    organicTreatment: [
      'Seed treatment with Trichoderma viride @ 5 g/kg seed',
    ],
    chemicalTreatment: [
      'Treat seed tubers with Captan 75% WP @ 2 g/L for 30 min',
      'Or Carboxin 75% WP @ 2 g/kg seed',
    ],
    prevention: [
      'Use certified, disease-free seed tubers',
      'Rotate with cereals for 2–3 years',
      'Harvest tubers only after skin is mature',
    ],
    shortDesc:
      'Black scurf on tubers and stem canker in soil. Affects marketability of tubers.',
  },

  // ───── CHILI ─────
  {
    id: 'chili-thrips',
    name: 'Chili Thrips',
    crop: 'chili',
    pathogen: 'Insect (Scirtothrips dorsalis)',
    severity: 'severe',
    bestSeason: 'year-round',
    affectedParts: ['leaves', 'flower', 'fruit'],
    symptomTypes: ['deformity', 'pest'],
    conditions: ['dry'],
    symptoms: [
      'Upward curling and crinkling of young leaves',
      'Silver streaks on leaves from feeding scars',
      'Stunted growth and flower drop',
      'Scarring on fruits reducing market value',
    ],
    causes:
      'Tiny slender insects feeding on young tissues. Multiply rapidly in dry weather.',
    organicTreatment: [
      'Blue sticky traps @ 12/ha for monitoring and mass trapping',
      'Spray neem oil 0.5% or neem + soap mixture',
      'Release predatory mites (Amblyseius spp.) if available',
    ],
    chemicalTreatment: [
      'Fipronil 5% SC @ 1.5 ml/L',
      'Or Spinetoram 11.7% SC @ 0.5 ml/L',
      'Or Spinosad 45% SC @ 0.3 ml/L — softer on beneficials',
    ],
    prevention: [
      'Avoid dry stress — mulch to conserve soil moisture',
      'Remove and destroy severely infested shoots',
      'Install yellow and blue sticky traps early',
    ],
    shortDesc:
      'Microscopic pest causing leaf curl and silver streaks. Major yield robber in dry spells.',
  },
  {
    id: 'chili-fruit-rot',
    name: 'Anthracnose / Fruit Rot',
    crop: 'chili',
    pathogen: 'Fungal (Colletotrichum acutatum, C. capsici)',
    severity: 'severe',
    bestSeason: 'kharif',
    affectedParts: ['fruit'],
    symptomTypes: ['spots', 'rot'],
    conditions: ['wet', 'monoculture'],
    symptoms: [
      'Sunken brown spots on ripening fruits',
      'Concentric rings of black acervuli on spots',
      'Fruits shrivel and dry up (die-back)',
      'White to pink spore masses under humid conditions',
    ],
    causes:
      'Seed-borne and air-borne fungus. Spores splash from infected fruits to healthy ones.',
    organicTreatment: [
      'Trichoderma viride @ 5 g/L as foliar spray at flowering',
      'Bordeaux mixture 1% at first fruit set',
    ],
    chemicalTreatment: [
      'Carbendazim 50% WP @ 1 g/L + Mancozeb 75% WP @ 2 g/L',
      'Or Azoxystrobin 23% SC @ 1 ml/L',
      'Spray at flowering and repeat at fruit set',
    ],
    prevention: [
      'Use certified disease-free seed',
      'Crop rotation with non-solanaceous crops',
      'Avoid working in the field when plants are wet',
      'Destroy infected fruits — do not compost',
    ],
    shortDesc:
      'Anthracnose on ripening chilli fruits. Severe losses during humid weather.',
  },
  {
    id: 'chili-leaf-curl-virus',
    name: 'Chilli Leaf Curl Virus',
    crop: 'chili',
    pathogen: 'Viral (Begomovirus)',
    severity: 'severe',
    bestSeason: 'year-round',
    affectedParts: ['leaves', 'whole'],
    symptomTypes: ['deformity', 'yellowing'],
    conditions: ['dry', 'pestsNearby'],
    symptoms: [
      'Severe curling, crinkling and yellowing of leaves',
      'Stunted plants with bushy appearance',
      'Flowers drop; very few fruits set',
      'Whitefly colonies visible on lower leaf surface',
    ],
    causes:
      'Whitefly-transmitted begomovirus. Same vector as tomato and cotton leaf curl viruses.',
    organicTreatment: [
      'Neem oil 0.5% weekly to manage whitefly',
      'Remove and destroy infected plants early',
    ],
    chemicalTreatment: [
      'Manage whitefly: Diafenthiuron 50% WP @ 1.2 g/L',
      'Or Pyriproxyfen 10% EC @ 1 ml/L',
      'No direct virus cure — control the vector',
    ],
    prevention: [
      'Plant during low whitefly periods',
      'Cover nursery with 50-mesh net for first 30 days',
      'Border crop with tall crops like maize to reduce whitefly influx',
      'Remove weed hosts (Hibiscus, Croton)',
    ],
    shortDesc:
      'Whitefly-transmitted virus causing leaf curl. Major limiting factor in chilli cultivation.',
  },
];

export const diseaseMap: Record<string, Disease> = diseases.reduce(
  (acc, d) => ({ ...acc, [d.id]: d }),
  {} as Record<string, Disease>
);
