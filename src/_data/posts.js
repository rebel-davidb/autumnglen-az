// ==========================================================================
// Azalea Estates — Blog Posts (PLACEHOLDER CONTENT)
// --------------------------------------------------------------------------
// 12 placeholder articles to build out and validate the blog design.
// REPLACE the `categories` list and each post's content with the real
// articles when provided. The data shape each post needs:
//
//   slug      – URL-safe id  ->  /blog/<slug>/
//   title     – Headline
//   excerpt   – 1–2 sentence summary (cards, meta description, listing)
//   category  – Must match one of CATEGORIES below
//   author    – Display name
//   authorRole– Short role/title (optional)
//   date      – ISO "YYYY-MM-DD"
//   readTime  – Minutes (number)
//   image     – Hero/card image path
//   imageAlt  – Alt text
//   featured  – true to surface in the listing's featured slot (first true wins)
//   body      – HTML string (headings, paragraphs, lists)
//
// `tags` / `category` drive the on-page category filter. Search runs over
// title + excerpt + category + body text (client-side in main.js).
// ==========================================================================

const img = (file) => `/assets/images/${file}`;

// --------------------------------------------------------------------------
// PLACEHOLDER CATEGORIES — replace with the real list later.
// Order here = order of the filter chips on /blog/.
// --------------------------------------------------------------------------
const CATEGORIES = [
  "Assisted Living",
  "Healthy Aging",
  "Caregiver Resources",
  "Activities & Events",
  "Dining & Nutrition",
  "Community Life",
];

// A small library of reusable placeholder paragraphs so each article reads
// like a real post without hand-writing 12 unique essays. Swap for real copy.
const P = {
  intro:
    "<p>Choosing the right path for senior living is one of the most meaningful decisions a family can make together. At Azalea Estates of Fayetteville, we believe that decision should be grounded in clear information, genuine warmth, and a real sense of what daily life can look like.</p>",
  body1:
    "<p>For more than thirty years, our community has welcomed residents who want to keep living the life they love while having support close at hand. That balance — independence with reassurance — shapes everything from how our apartments are designed to how our dining room feels at lunchtime.</p>",
  h2_a: "<h2>What this means day to day</h2>",
  body2:
    "<p>The best way to understand a community is to picture an ordinary Tuesday. A morning walk through the garden, coffee with a neighbor, an afternoon wellness class in the pool, and a chef-prepared dinner shared with friends. None of it is rushed, and none of it has to be done alone.</p>",
  list:
    "<ul><li>Maintenance-free living, so time goes to the things that matter</li><li>On-site licensed nursing for peace of mind</li><li>A full calendar of social, creative, and wellness activities</li><li>Restaurant-style dining with three meals served daily</li></ul>",
  h2_b: "<h2>Questions worth asking</h2>",
  body3:
    "<p>Whether you are exploring options for yourself or for a parent, it helps to write down what matters most. Proximity to family, level of care available now and later, the feel of the community, and of course cost and what it includes. Our admissions team is glad to walk through each of these without any pressure.</p>",
  body4:
    "<p>If you have questions about anything you read here, the easiest next step is a conversation. Call us at (762) 572-5194, or schedule a private tour and stay for a complimentary lunch. Seeing the community in person tells you more than any article ever could.</p>",
  outro:
    "<p>This article is part of our ongoing series on senior living, healthy aging, and life at Azalea Estates. Check back regularly for new posts, or reach out any time with a topic you would like us to cover.</p>",
};

const fullBody = [
  P.intro, P.body1, P.h2_a, P.body2, P.list, P.h2_b, P.body3, P.body4, P.outro,
].join("\n");

const posts = [
  {
    slug: "understanding-assisted-living-vs-independent-living",
    title: "Assisted Living vs. Independent Living: How to Know Which Fits",
    excerpt:
      "The difference isn't always obvious. Here's a clear, jargon-free way to tell which level of care actually fits your situation today — and as needs change.",
    category: "Assisted Living",
    author: "Mirna Coeur",
    authorRole: "Admissions Director",
    date: "2026-06-10",
    readTime: 6,
    image: img("common-space.jpg"),
    imageAlt: "Comfortable common area where residents gather at Azalea Estates",
    featured: true,
    body: fullBody,
  },
  {
    slug: "5-signs-it-may-be-time-for-assisted-living",
    title: "5 Signs It May Be Time to Consider Assisted Living",
    excerpt:
      "Recognizing the right moment is rarely a single event. These five gentle signs can help families talk about the next step with clarity and compassion.",
    category: "Caregiver Resources",
    author: "Asha Faison",
    authorRole: "Resident Care",
    date: "2026-06-03",
    readTime: 5,
    image: img("group-of-seniors-on-porch.jpg"),
    imageAlt: "Residents enjoying conversation on the front porch",
    featured: false,
    body: fullBody,
  },
  {
    slug: "staying-active-after-70-wellness-that-works",
    title: "Staying Active After 70: Wellness That Actually Works",
    excerpt:
      "Movement at any age pays dividends. A look at how low-impact, social, and water-based exercise keeps our residents strong, steady, and engaged.",
    category: "Healthy Aging",
    author: "Harold Hardaway",
    authorRole: "Wellness Coordinator",
    date: "2026-05-27",
    readTime: 7,
    image: img("group-pool-activity.jpeg"),
    imageAlt: "Water aerobics class in the heated indoor saltwater pool",
    featured: false,
    body: fullBody,
  },
  {
    slug: "what-to-look-for-on-a-community-tour",
    title: "What to Look For When You Tour a Senior Community",
    excerpt:
      "A tour can feel overwhelming. Bring this checklist so you notice the details that really reveal what living there would be like.",
    category: "Assisted Living",
    author: "Mirna Coeur",
    authorRole: "Admissions Director",
    date: "2026-05-20",
    readTime: 6,
    image: img("inside-view.jpg"),
    imageAlt: "Warm interior view of common areas at Azalea Estates",
    featured: false,
    body: fullBody,
  },
  {
    slug: "the-truth-about-senior-living-costs",
    title: "The Truth About Senior Living Costs (and What's Included)",
    excerpt:
      "Sticker prices rarely tell the whole story. We break down what a monthly rate typically covers and how it compares to staying home.",
    category: "Caregiver Resources",
    author: "Marty Schilling",
    authorRole: "Business Office",
    date: "2026-05-13",
    readTime: 8,
    image: img("formal-dinning-room-at-azalea.jpg"),
    imageAlt: "Elegant formal dining room set for service",
    featured: false,
    body: fullBody,
  },
  {
    slug: "eating-well-nutrition-for-older-adults",
    title: "Eating Well: Nutrition That Supports Aging Bodies",
    excerpt:
      "Appetites and needs shift with age. Our culinary team shares how thoughtful, flavorful menus keep residents nourished and looking forward to mealtimes.",
    category: "Dining & Nutrition",
    author: "Tony Hardy",
    authorRole: "Culinary Lead",
    date: "2026-05-06",
    readTime: 5,
    image: img("group-dining.jpg"),
    imageAlt: "Residents enjoying a meal together in the dining room",
    featured: false,
    body: fullBody,
  },
  {
    slug: "making-the-move-easier-for-a-parent",
    title: "Making the Move Easier for a Parent",
    excerpt:
      "Transitions are emotional for everyone. Practical, kind strategies for helping a loved one feel at home in a new community from day one.",
    category: "Caregiver Resources",
    author: "Sandra Zabala",
    authorRole: "Family Liaison",
    date: "2026-04-29",
    readTime: 7,
    image: img("two-women-reading-on-chairs.jpg"),
    imageAlt: "Two residents relaxing and reading in comfortable chairs",
    featured: false,
    body: fullBody,
  },
  {
    slug: "a-day-in-the-life-at-azalea-estates",
    title: "A Day in the Life at Azalea Estates",
    excerpt:
      "From morning coffee to evening socials — a walk through an ordinary, wonderful day in our community, hour by hour.",
    category: "Community Life",
    author: "Holly Woods",
    authorRole: "Life Enrichment",
    date: "2026-04-22",
    readTime: 6,
    image: img("group-of-women-smiling.jpg"),
    imageAlt: "Residents sharing a joyful moment together",
    featured: false,
    body: fullBody,
  },
  {
    slug: "keeping-the-mind-sharp-brain-health",
    title: "Keeping the Mind Sharp: Everyday Brain Health",
    excerpt:
      "Cognitive wellness isn't about crosswords alone. How conversation, learning, and routine all play a part in keeping the mind engaged.",
    category: "Healthy Aging",
    author: "Bobbie Barczynski",
    authorRole: "Activities",
    date: "2026-04-15",
    readTime: 5,
    image: img("crossword.jpeg"),
    imageAlt: "A resident working on a crossword puzzle",
    featured: false,
    body: fullBody,
  },
  {
    slug: "why-community-matters-loneliness-and-aging",
    title: "Why Community Matters: Loneliness and Aging",
    excerpt:
      "Social connection is one of the strongest predictors of healthy aging. A look at how community living quietly transforms wellbeing.",
    category: "Community Life",
    author: "Stacey Kennedy",
    authorRole: "Resident Relations",
    date: "2026-04-08",
    readTime: 6,
    image: img("bingo.jpg"),
    imageAlt: "Residents enjoying a lively bingo game in the community room",
    featured: false,
    body: fullBody,
  },
  {
    slug: "seasonal-activities-spring-and-summer",
    title: "Seasonal Activities: Making the Most of Spring and Summer",
    excerpt:
      "Longer days open up the calendar. Gardening, outdoor concerts, pool time, and the simple joy of an afternoon on the porch.",
    category: "Activities & Events",
    author: "Holly Woods",
    authorRole: "Life Enrichment",
    date: "2026-04-01",
    readTime: 4,
    image: img("gardening.jpg"),
    imageAlt: "Residents tending the community garden",
    featured: false,
    body: fullBody,
  },
  {
    slug: "respite-care-a-short-stay-that-helps-everyone",
    title: "Respite Care: A Short Stay That Helps Everyone",
    excerpt:
      "Recovering from surgery or giving a caregiver a break — respite care offers full support for a short stay, with all the comforts of community life.",
    category: "Assisted Living",
    author: "Mirna Coeur",
    authorRole: "Admissions Director",
    date: "2026-03-25",
    readTime: 5,
    image: img("az-header-inner-respite.jpg"),
    imageAlt: "Residents relaxing on the front porch",
    featured: false,
    body: fullBody,
  },
];

module.exports = {
  categories: CATEGORIES,
  all: posts,
};
