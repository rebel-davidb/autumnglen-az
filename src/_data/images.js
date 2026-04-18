// ==========================================================================
// Azalea Estates — Image Manifest
// All site imagery now sourced from /assets/images/ (community photos).
// Each key below is mapped to the photo that best matches the context
// where it's rendered, as determined by a visual review of the photo set.
// ==========================================================================

const img = (file) => `/assets/images/${file}`;

// Source photos, named to make reassignments readable.
const PHOTO = {
  exteriorHero:     "exterior-front-view-of-Fayetteville-e1674771244233.jpg", // tight dramatic cupola + red flower bed
  exteriorWide:     "azalea-estates-img.jpeg",                                // wide scenic entrance, Japanese maples
  poolClassBright:  "ae-home-4-1500px.jpg",                                   // marquee aqua-aerobics, 6 women + trainer
  poolClassAiry:    "01sa077-scaled.jpeg",                                    // wide bright pool w/ vaulted ceiling
  poolClassBack:    "01sa051-scaled.jpeg",                                    // aqua class from behind instructor
  poolClassIntimate:"azalea-estates-img-2.jpeg",                              // smaller group + trainer
  poolEmpty:        "img_5534-scaled.jpeg",                                   // architectural empty pool
  rockingChairs:    "az-header-inner-respite.jpg",                            // 3 residents on the front porch
  sunroomChat:      "az-header-inner-service-amenities.jpg",                  // 4 ladies chatting, colorful tables
  chefPlate:        "az-header-inner-dining.jpg",                             // chef garnishing plated beef
  brainFitness:     "Dakim-Brain-Fitness-5-1-scaled.jpg",                     // resident at Dakim touchscreen
  chairStrength:    "01sa279-scaled.jpeg",                                    // 3 seniors laughing in seated weights class
  stepperCoaching:  "01sa292-2048x1365.jpeg",                                 // woman + staff at stepper
  treadmillSupport: "01sa308-scaled.jpeg",                                    // man + staff at treadmill
};

module.exports = {
  // ---- Hero (home page) ---------------------------------------------------
  hero:       img(PHOTO.exteriorHero),   // used as OG/social + JSON-LD image
  heroPoster: img(PHOTO.exteriorHero),   // shown while the hero <video> buffers
  heroAlt:    "Azalea Estates of Fayetteville front entrance with spring blooms",

  // ---- Architectural exteriors --------------------------------------------
  // Used as page heroes on /about/, /accessibility/, and the "Assisted Living"
  // feature card on /. Wide scenic shot reads best under the dark gradient.
  communityExterior: img(PHOTO.exteriorWide),

  // Used on /privacy/, /gallery/, and the "Respite Care" feature card.
  // Intimate pool reads as warm + healing — a fit for respite/rehab.
  communityGarden: img(PHOTO.poolClassIntimate),

  // ---- People / life on campus --------------------------------------------
  // Home page intro-split ("warm moment together") — active conversation.
  residentsLaughing: img(PHOTO.sunroomChat),

  // Home feature #1 + living-options card #1 — "Independent Living".
  // The rocking-chair porch is the most iconic independent-living shot.
  residentsGarden: img(PHOTO.rockingChairs),

  // /about/ page — "residents engaged in a creative activity".
  residentsActivity: img(PHOTO.brainFitness),

  // ---- Interior living spaces ---------------------------------------------
  // /floor-plans/ and /living-options/ page heroes. Sunroom reads as home.
  livingRoom: img(PHOTO.sunroomChat),

  // /living-options/ respite card. No bedroom photo available;
  // the empty pool is the calmest "facility" stand-in until a real private
  // suite photo is taken. TODO: replace when a bedroom/suite photo is captured.
  bedroom: img(PHOTO.poolEmpty),

  // Not currently referenced, but kept populated for future use.
  kitchen:         img(PHOTO.chefPlate),
  communityDining: img(PHOTO.chefPlate),

  // ---- Wellness / fitness -------------------------------------------------
  wellnessPool:    img(PHOTO.poolClassBright),   // /amenities/ hero + card #1
  wellnessFitness: img(PHOTO.stepperCoaching),   // /amenities/ card #2
  wellnessYoga:    img(PHOTO.chairStrength),     // /amenities/ card #3 (gentle movement)

  // ---- Dining -------------------------------------------------------------
  diningPlate: img(PHOTO.chefPlate),
  diningChef:  img(PHOTO.chefPlate),

  // ---- Amenities tiles ----------------------------------------------------
  amenitiesLibrary: img(PHOTO.brainFitness),     // "computer room / library" proxy
  amenitiesSalon:   img(PHOTO.sunroomChat),      // placeholder — no salon photo on file
  amenitiesPorch:   img(PHOTO.rockingChairs),    // /contact/ page hero

  // ---- Gallery ------------------------------------------------------------
  // Ordered to move from outside → inside → activity → amenities.
  gallery: [
    { src: img(PHOTO.exteriorHero),      alt: "Azalea Estates front entrance with seasonal blooms" },
    { src: img(PHOTO.exteriorWide),      alt: "Landscaped drive and entry, with Japanese maples in leaf" },
    { src: img(PHOTO.rockingChairs),     alt: "Residents visiting on our front porch rockers" },
    { src: img(PHOTO.sunroomChat),       alt: "Afternoon conversation in the sunroom" },
    { src: img(PHOTO.brainFitness),      alt: "A resident working through a Dakim brain-fitness session" },
    { src: img(PHOTO.chefPlate),         alt: "Chef-prepared, restaurant-style dinner plating" },
    { src: img(PHOTO.poolClassBright),   alt: "Water aerobics class in our heated indoor pool" },
    { src: img(PHOTO.poolClassAiry),     alt: "Group aqua class under our sunlit vaulted ceiling" },
    { src: img(PHOTO.poolClassBack),     alt: "Aqua aerobics with our licensed fitness trainer" },
    { src: img(PHOTO.poolClassIntimate), alt: "Smaller pool group working with a trainer" },
    { src: img(PHOTO.poolEmpty),         alt: "Our heated indoor saltwater pool, pre-class" },
    { src: img(PHOTO.treadmillSupport),  alt: "Treadmill session with staff guidance" },
    { src: img(PHOTO.stepperCoaching),   alt: "One-on-one coaching on our cardio equipment" },
    { src: img(PHOTO.chairStrength),     alt: "Seated strength and mobility class — laughing together" },
  ],
};
