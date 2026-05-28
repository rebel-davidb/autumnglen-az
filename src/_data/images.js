// ==========================================================================
// Azalea Estates — Image Manifest
// All site imagery sourced from /assets/images/ (community photos).
// Each key is mapped to the photo that best matches its render context.
// ==========================================================================

const img = (file) => `/assets/images/${file}`;

// ── Source photos ──────────────────────────────────────────────────────────
const PHOTO = {
  // Campus — exterior
  exteriorHero:     "exterior-front-view-of-Fayetteville-e1674771244233.jpg", // tight dramatic cupola + red flower bed
  exteriorWide:     "azalea-estates-img.jpeg",                                // wide scenic entrance, Japanese maples
  aerial:           "community-from-above.png",                               // aerial overhead campus shot
  fountain:         "fountain.jpg",                                           // campus fountain + landscape
  sidewalkGarden:   "sidewalk-and-garden-at-azalea.jpg",                      // walking path + garden

  // Campus — interior common spaces
  commonArea:       "common-space.jpg",                                       // warm interior common area
  commonArea2:      "common-space2.jpg",                                      // second common area angle
  insideView:       "inside-view.jpg",                                        // interior overview

  // Private suites
  bedroomSuite:     "bedroom.jpg",                                            // actual private bedroom suite
  livingRoomSuite:  "living-room.jpg",                                        // actual private living room

  // Dining
  formalDining:     "formal-dinning-room-at-azalea.jpg",                      // elegant formal dining room
  largeDining:      "large-dining-room.jpg",                                  // wide dining room, empty
  largeDining2:     "large-dining-room-2.jpg",                                // second dining room angle
  groupDining:      "group-dining.jpg",                                       // residents dining together
  chefPlate:        "az-header-inner-dining.jpg",                             // chef garnishing plated beef

  // Activities — social
  groupPorch:       "group-of-seniors-on-porch.jpg",                          // group gathered on front porch
  womenSmiling:     "group-of-women-smiling.jpg",                             // group of women laughing
  readingChairs:    "two-women-reading-on-chairs.jpg",                        // two women reading comfortably
  twoWomenReading:  "two-women-reading.jpg",                                  // two women reading, alternate

  // Activities — programs
  bingo:            "bingo.jpg",                                              // bingo game in progress
  crossword:        "crossword.jpeg",                                         // crossword puzzle activity
  painting:         "group-painting.jpg",                                     // group painting class
  gardening:        "gardening.jpg",                                          // residents gardening (portrait)
  brainFitness:     "Dakim-Brain-Fitness-5-1-scaled.jpg",                     // Dakim brain-fitness touchscreen

  // Wellness — pool
  poolNew:          "group-pool-activity.jpeg",                               // pool aerobics class, front view
  poolNew2:         "group-pool-2.jpeg",                                      // pool class, second angle
  poolClassBright:  "ae-home-4-1500px.jpg",                                   // marquee aqua-aerobics, 6 women
  poolClassAiry:    "01sa077-scaled.jpeg",                                    // wide bright pool, vaulted ceiling
  poolClassBack:    "01sa051-scaled.jpeg",                                    // aqua class from behind instructor
  poolClassIntimate:"azalea-estates-img-2.jpeg",                              // smaller group + trainer
  poolEmpty:        "img_5534-scaled.jpeg",                                   // architectural empty pool
  poolPhoto:        "pool.jpg",                                               // pool exterior/wide shot

  // Wellness — fitness
  groupFitness:     "group-workout.jpg",                                      // group fitness class
  ptSession:        "personal-training.jpg",                                  // one-on-one personal training
  ptTreadmill:      "personal-training-treadmill.jpg",                        // treadmill coaching session
  chairStrength:    "01sa279-scaled.jpeg",                                    // seated strength class, laughing
  stepperCoaching:  "01sa292-2048x1365.jpeg",                                 // stepper coaching
  treadmillSupport: "01sa308-scaled.jpeg",                                    // treadmill with staff support

  // Legacy / still in use
  rockingChairs:    "az-header-inner-respite.jpg",                            // 3 residents on front porch
  sunroomChat:      "az-header-inner-service-amenities.jpg",                  // 4 ladies chatting, colorful tables
};

module.exports = {
  // ── Hero (home page) ───────────────────────────────────────────────────
  hero:       img(PHOTO.exteriorHero),
  heroPoster: img(PHOTO.exteriorHero),
  heroAlt:    "Azalea Estates of Fayetteville front entrance with spring blooms",

  // ── Campus / exterior ──────────────────────────────────────────────────
  communityExterior: img(PHOTO.exteriorWide),      // wide scenic entrance
  communityAbove:    img(PHOTO.aerial),            // aerial overview of campus
  campusFountain:    img(PHOTO.fountain),           // fountain + landscaping
  communityGarden:   img(PHOTO.sidewalkGarden),    // walking path + garden (was: pool class)

  // ── People / life on campus ────────────────────────────────────────────
  // Upgraded from proxy shots to real community-life photos:
  residentsLaughing:  img(PHOTO.womenSmiling),     // warm group moment (was: sunroom chat)
  residentsGarden:    img(PHOTO.groupPorch),       // group on porch (was: 3 rocking chairs)
  residentsActivity:  img(PHOTO.bingo),            // bingo activity (was: Dakim machine)
  residentsDining:    img(PHOTO.groupDining),      // residents at table together
  residentsReading:   img(PHOTO.readingChairs),    // two women reading in chairs

  // ── Interior living spaces ─────────────────────────────────────────────
  livingRoom: img(PHOTO.livingRoomSuite),          // actual private living room (was: sunroom)
  bedroom:    img(PHOTO.bedroomSuite),             // actual private bedroom suite (was: empty pool)
  commonSpace: img(PHOTO.commonArea),              // interior common area
  insideView:  img(PHOTO.insideView),              // interior overview

  // ── Dining ─────────────────────────────────────────────────────────────
  diningRoom:      img(PHOTO.formalDining),        // elegant dining room — page hero
  diningHall:      img(PHOTO.largeDining),         // wide dining room shot
  diningPlate:     img(PHOTO.chefPlate),           // chef plating — detail / content
  diningChef:      img(PHOTO.chefPlate),           // chef — kept for content splits
  communityDining: img(PHOTO.groupDining),         // social dining moment (was: chef plate)

  // ── Activities ─────────────────────────────────────────────────────────
  activityBingo:    img(PHOTO.bingo),
  activityPainting: img(PHOTO.painting),
  activityCrossword:img(PHOTO.crossword),
  activityGarden:   img(PHOTO.gardening),
  amenitiesLibrary: img(PHOTO.brainFitness),       // Dakim brain fitness (page-specific reference)

  // ── Wellness / pool ─────────────────────────────────────────────────────
  wellnessPool:    img(PHOTO.poolNew),             // pool aerobics class, front (was: marquee shot)
  wellnessFitness: img(PHOTO.ptSession),           // personal training session (was: stepper)
  treadmillSupport: img(PHOTO.treadmillSupport),  // staff guiding resident on treadmill
  wellnessYoga:    img(PHOTO.groupFitness),        // group fitness class (was: seated strength)
  wellnessPoolWide: img(PHOTO.poolClassAiry),      // wide pool with vaulted ceiling

  // ── Amenities ──────────────────────────────────────────────────────────
  amenitiesPorch:  img(PHOTO.groupPorch),          // group on porch (was: 3 rocking chairs)
  amenitiesSalon:  img(PHOTO.commonArea2),         // common area proxy until salon photo exists

  // ── Kitchen (unused but populated for future) ──────────────────────────
  kitchen: img(PHOTO.chefPlate),

  // ── Gallery — expanded from 14 to 28 photos ────────────────────────────
  // Ordered: campus exterior → outdoor spaces → interiors → suites
  //          → dining → social life → activities → wellness/fitness
  gallery: [
    // Campus & outdoor
    { src: img(PHOTO.exteriorHero),     alt: "Azalea Estates of Fayetteville front entrance with seasonal blooms" },
    { src: img(PHOTO.exteriorWide),     alt: "Landscaped drive and entry, with Japanese maples in leaf" },
    { src: img(PHOTO.aerial),           alt: "Aerial view of the Azalea Estates campus in Fayetteville" },
    { src: img(PHOTO.fountain),         alt: "Campus fountain surrounded by landscaped grounds" },
    { src: img(PHOTO.sidewalkGarden),   alt: "Walking path through the community garden at Azalea Estates" },
    { src: img(PHOTO.groupPorch),       alt: "Residents gathering on the front porch on a sunny afternoon" },

    // Interiors & suites
    { src: img(PHOTO.insideView),       alt: "Warm interior view of Azalea Estates common areas" },
    { src: img(PHOTO.commonArea),       alt: "Comfortable common area with seating for residents and visitors" },
    { src: img(PHOTO.commonArea2),      alt: "Bright common area at Azalea Estates" },
    { src: img(PHOTO.livingRoomSuite),  alt: "Private living room in a resident suite at Azalea Estates" },
    { src: img(PHOTO.bedroomSuite),     alt: "Private bedroom in a resident suite — comfortable and well-appointed" },

    // Dining
    { src: img(PHOTO.formalDining),     alt: "Azalea Estates elegant formal dining room, set for service" },
    { src: img(PHOTO.largeDining),      alt: "Our spacious dining room — restaurant-style service, three meals daily" },
    { src: img(PHOTO.groupDining),      alt: "Residents enjoying a meal together in the Azalea Estates dining room" },
    { src: img(PHOTO.chefPlate),        alt: "Chef-prepared, restaurant-style dinner plating" },

    // Social life
    { src: img(PHOTO.womenSmiling),     alt: "Residents sharing a joyful moment together at Azalea Estates" },
    { src: img(PHOTO.readingChairs),    alt: "Two residents relaxing and reading in comfortable chairs" },

    // Activities
    { src: img(PHOTO.bingo),            alt: "Residents enjoying a lively bingo game in the community room" },
    { src: img(PHOTO.crossword),        alt: "A resident working on a crossword puzzle — brain fitness daily" },
    { src: img(PHOTO.painting),         alt: "Residents in an art and painting class together" },
    { src: img(PHOTO.gardening),        alt: "Residents tending the community garden — seasonal planting" },
    { src: img(PHOTO.brainFitness),     alt: "A resident working through a Dakim brain-fitness session" },

    // Pool & aquatics
    { src: img(PHOTO.poolNew),          alt: "Water aerobics class in our heated indoor saltwater pool" },
    { src: img(PHOTO.poolNew2),         alt: "Group aquatic exercise class with licensed fitness instructor" },
    { src: img(PHOTO.poolClassBright),  alt: "Aqua aerobics — six residents and trainer in our indoor pool" },
    { src: img(PHOTO.poolClassAiry),    alt: "Our heated indoor pool under the sunlit vaulted ceiling" },

    // Fitness
    { src: img(PHOTO.groupFitness),     alt: "Group fitness class in our 3,000 sq. ft. wellness center" },
    { src: img(PHOTO.ptSession),        alt: "One-on-one personal training session with our licensed fitness trainer" },
  ],
};
