/* ==========================================================================
   Sample Curated Data — Meridian Stays
   8 Destinations (min 6), 12 Hotels (min 10), 4 Offers (min 3), 6 Testimonials (min 6)
   ========================================================================== */

window.MeridianData = {
  destinations: [
    {
      id: "santorini",
      name: "Santorini",
      country: "Greece",
      region: "Europe",
      staysCount: 42,
      startingPrice: 290,
      tagline: "Whitewashed cliffside villages overlooking the cobalt Aegean caldera.",
      image: "assets/images/destinations/santorini.webp",
      alt: "Oia Santorini whitewashed cliffside homes and blue domes at golden hour"
    },
    {
      id: "kyoto",
      name: "Kyoto",
      country: "Japan",
      region: "Asia",
      staysCount: 38,
      startingPrice: 240,
      tagline: "Lantern-lit wooden machiya lanes, cedar ryokans, and tranquil moss gardens.",
      image: "assets/images/destinations/kyoto.webp",
      alt: "Historic Kyoto wooden street and glowing lanterns at dusk"
    },
    {
      id: "bali",
      name: "Bali",
      country: "Indonesia",
      region: "Asia",
      staysCount: 56,
      startingPrice: 175,
      tagline: "Emerald highland rice terraces, oceanfront cliffs, and bamboo sanctuaries.",
      image: "assets/images/destinations/bali.webp",
      alt: "Lush emerald rice terraces in Ubud Bali during morning mist"
    },
    {
      id: "amalfi",
      name: "Amalfi Coast",
      country: "Italy",
      region: "Europe",
      staysCount: 31,
      startingPrice: 340,
      tagline: "Sun-drenched lemon groves, pastel cliffside villages, and coastal palazzos.",
      image: "assets/images/destinations/amalfi.webp",
      alt: "Positano colorful cliffside homes along the Amalfi Coast sea"
    },
    {
      id: "zermatt",
      name: "Zermatt",
      country: "Switzerland",
      region: "Europe",
      staysCount: 24,
      startingPrice: 380,
      tagline: "Car-free alpine village framed by snow-dusted peaks and timber chalets.",
      image: "assets/images/destinations/zermatt.webp",
      alt: "Wooden alpine chalets in Zermatt beneath the snow-capped Matterhorn"
    },
    {
      id: "marrakech",
      name: "Marrakech",
      country: "Morocco",
      region: "Africa & Americas",
      staysCount: 29,
      startingPrice: 160,
      tagline: "Terracotta courtyard riads, citrus trees, and Atlas Mountain sunsets.",
      image: "assets/images/destinations/marrakech.webp",
      alt: "Marrakech serene tiled riad courtyard with plunge pool and palm trees"
    },
    {
      id: "maldives",
      name: "Maldives",
      country: "Baa Atoll",
      region: "Islands",
      staysCount: 18,
      startingPrice: 520,
      tagline: "Crystalline turquoise lagoons, coral reefs, and private overwater decks.",
      image: "assets/images/destinations/maldives.webp",
      alt: "Turquoise Maldives lagoon with overwater villas above clear coral water"
    },
    {
      id: "patagonia",
      name: "Patagonia",
      country: "Chile",
      region: "Africa & Americas",
      staysCount: 15,
      startingPrice: 310,
      tagline: "Dramatic granite towers, glacial lakes, and warm architectural eco-lodges.",
      image: "assets/images/destinations/patagonia.webp",
      alt: "Torres del Paine granite peaks reflecting in a clear Patagonian glacial lake"
    }
  ],

  hotels: [
    {
      id: "hotel-01",
      name: "Canaves Cliff Suites",
      destinationId: "santorini",
      destinationLabel: "Santorini, Greece",
      type: "Cave Suite",
      pricePerNight: 430,
      rating: 4.94,
      reviews: 318,
      image: "assets/images/hotels/hotel-01.webp",
      alt: "Whitewashed Santorini cave suite terrace with plunge pool facing the caldera",
      highlightTag: "Best Seller",
      freeCancellation: true,
      amenities: ["Caldera Plunge Pool", "Breakfast Included", "Sunset Terrace"],
      categories: ["Pool & Spa", "Breakfast Included", "Beachfront"],
      featuredOrder: 1,
      description: "Carved into volcanic cliffs in Oia with heated infinity plunge pools and private sunset dining."
    },
    {
      id: "hotel-02",
      name: "Aman Kyoto Garden Pavilion",
      destinationId: "kyoto",
      destinationLabel: "Kyoto, Japan",
      type: "Pavilion",
      pricePerNight: 590,
      rating: 4.97,
      reviews: 214,
      image: "assets/images/hotels/hotel-02.webp",
      alt: "Minimalist luxury Kyoto pavilion nestled beside maple trees and stone pond",
      highlightTag: "Iconic Stay",
      freeCancellation: true,
      amenities: ["Private Onsen", "Tea Ceremony", "Forest Trails"],
      categories: ["Pool & Spa", "Nature & Mountain"],
      featuredOrder: 2,
      description: "Secluded timber pavilions set within a secret 80-acre moss garden and natural hot spring."
    },
    {
      id: "hotel-03",
      name: "Sayan Valley Sanctuary",
      destinationId: "bali",
      destinationLabel: "Bali, Indonesia",
      type: "Pool Villa",
      pricePerNight: 245,
      rating: 4.86,
      reviews: 412,
      image: "assets/images/hotels/hotel-03.webp",
      alt: "Open-air Balinese bamboo luxury villa with infinity pool overlooking river valley",
      highlightTag: "Value Pick",
      freeCancellation: true,
      amenities: ["Valley Infinity Pool", "Breakfast Included", "Yoga Shala"],
      categories: ["Pool & Spa", "Breakfast Included", "Nature & Mountain"],
      featuredOrder: 3,
      description: "Open-air teak and bamboo villas suspended above the Ayung river gorge in central Ubud."
    },
    {
      id: "hotel-04",
      name: "Palazzo Ravello Terrace",
      destinationId: "amalfi",
      destinationLabel: "Amalfi Coast, Italy",
      type: "Historic Palazzo",
      pricePerNight: 485,
      rating: 4.91,
      reviews: 267,
      image: "assets/images/hotels/hotel-04.webp",
      alt: "Historic Italian Amalfi palazzo terrace framed by stone arches and lemon trees",
      highlightTag: "Guest Favorite",
      freeCancellation: true,
      amenities: ["Sea Panorama", "Breakfast Included", "Lemon Gardens"],
      categories: ["Breakfast Included", "Beachfront"],
      featuredOrder: 4,
      description: "Restored 13th-century cliffside residence offering terraced lemon orchards and Tyrrhenian views."
    },
    {
      id: "hotel-05",
      name: "Matterhorn Chalet Grand",
      destinationId: "zermatt",
      destinationLabel: "Zermatt, Switzerland",
      type: "Alpine Chalet",
      pricePerNight: 520,
      rating: 4.89,
      reviews: 189,
      image: "assets/images/hotels/hotel-05.webp",
      alt: "Warm Swiss alpine timber and glass chalet suite with fireplace and mountain view",
      highlightTag: "Alpine Escape",
      freeCancellation: true,
      amenities: ["Thermal Spa", "Ski-in Access", "Hearth Lounge"],
      categories: ["Pool & Spa", "Nature & Mountain"],
      featuredOrder: 5,
      description: "Floor-to-ceiling alpine timber suites featuring private fireplaces and heated outdoor vitality pools."
    },
    {
      id: "hotel-06",
      name: "Riad Jasmine Courtyard",
      destinationId: "marrakech",
      destinationLabel: "Marrakech, Morocco",
      type: "Boutique Riad",
      pricePerNight: 185,
      rating: 4.82,
      reviews: 356,
      image: "assets/images/hotels/hotel-06.webp",
      alt: "Moroccan luxury riad courtyard with turquoise tiled pool and arched colonnade",
      highlightTag: "Hidden Gem",
      freeCancellation: true,
      amenities: ["Courtyard Pool", "Breakfast Included", "Rooftop Hammam"],
      categories: ["Pool & Spa", "Breakfast Included"],
      featuredOrder: 6,
      description: "Intimate Medina sanctuary centered around fragrant orange blossom trees and hand-cut zellige tilework."
    },
    {
      id: "hotel-07",
      name: "Lagoon Overwater Villa",
      destinationId: "maldives",
      destinationLabel: "Maldives, Baa Atoll",
      type: "Overwater Villa",
      pricePerNight: 760,
      rating: 4.96,
      reviews: 164,
      image: "assets/images/hotels/hotel-07.webp",
      alt: "Maldives overwater villa deck with private pool steps into turquoise lagoon",
      highlightTag: "Ultra Luxe",
      freeCancellation: false,
      amenities: ["Lagoon Access", "Private Pool", "Reef Snorkeling"],
      categories: ["Pool & Spa", "Beachfront"],
      featuredOrder: 7,
      description: "Stand-alone ocean residence with glass-floor lounge, private lap pool, and coral house reef."
    },
    {
      id: "hotel-08",
      name: "Aegean Caldera Retreat",
      destinationId: "santorini",
      destinationLabel: "Santorini, Greece",
      type: "Boutique Hotel",
      pricePerNight: 315,
      rating: 4.78,
      reviews: 289,
      image: "assets/images/hotels/hotel-08.webp",
      alt: "Cycladic vaulted stone hotel lounge opening onto sunset Aegean terrace",
      highlightTag: "Great Value",
      freeCancellation: true,
      amenities: ["Cliffside Pool", "Wine Cellar", "Airport Shuttle"],
      categories: ["Pool & Spa", "Beachfront"],
      featuredOrder: 8,
      description: "Minimalist Cycladic suites in Imerovigli crafted with hand-troweled lime plaster and linen interiors."
    },
    {
      id: "hotel-09",
      name: "Gion Cedar Ryokan",
      destinationId: "kyoto",
      destinationLabel: "Kyoto, Japan",
      type: "Heritage Ryokan",
      pricePerNight: 275,
      rating: 4.84,
      reviews: 241,
      image: "assets/images/hotels/hotel-09.webp",
      alt: "Traditional Kyoto cedar wood ryokan room with tatami flooring and zen garden",
      highlightTag: "Cultural Stay",
      freeCancellation: true,
      amenities: ["Kaiseki Dining", "Breakfast Included", "Hinoki Bath"],
      categories: ["Breakfast Included", "Nature & Mountain"],
      featuredOrder: 9,
      description: "Quiet Gion guesthouse blending fragrant Japanese cypress soaking tubs with seasonal morning meals."
    },
    {
      id: "hotel-10",
      name: "Uluwatu Cliffside Resort",
      destinationId: "bali",
      destinationLabel: "Bali, Indonesia",
      type: "Ocean Resort",
      pricePerNight: 340,
      rating: 4.88,
      reviews: 305,
      image: "assets/images/hotels/hotel-10.webp",
      alt: "Uluwatu cliffside resort infinity pool overlooking glowing ocean sunset",
      highlightTag: "Sunset Views",
      freeCancellation: true,
      amenities: ["Beach Club", "Cliff Infinity Pool", "Ayurvedic Spa"],
      categories: ["Pool & Spa", "Beachfront"],
      featuredOrder: 10,
      description: "Dramatic limestone cliff retreat perched 70 meters above Indian Ocean surf breaks."
    },
    {
      id: "hotel-11",
      name: "Positano Seafront Villa",
      destinationId: "amalfi",
      destinationLabel: "Amalfi Coast, Italy",
      type: "Coastal Villa",
      pricePerNight: 410,
      rating: 4.73,
      reviews: 198,
      image: "assets/images/hotels/hotel-11.webp",
      alt: "Positano coastal boutique hotel balcony dining overlooking sparkling sea",
      highlightTag: "Romantic",
      freeCancellation: true,
      amenities: ["Private Boat Pier", "Breakfast Included", "Sea Balcony"],
      categories: ["Breakfast Included", "Beachfront"],
      featuredOrder: 11,
      description: "Sun-washed terracotta suites steps from Spiaggia Grande with private Riva boat charters."
    },
    {
      id: "hotel-12",
      name: "Patagonia Glacier Lodge",
      destinationId: "patagonia",
      destinationLabel: "Patagonia, Chile",
      type: "Eco-Lodge",
      pricePerNight: 365,
      rating: 4.91,
      reviews: 152,
      image: "assets/images/hotels/hotel-12.webp",
      alt: "Architectural timber and glass Patagonia wilderness lodge facing snow peaks",
      highlightTag: "Wilderness",
      freeCancellation: true,
      amenities: ["Guided Treks", "Breakfast Included", "Wood-Fired Sauna"],
      categories: ["Breakfast Included", "Nature & Mountain"],
      featuredOrder: 12,
      description: "Low-impact timber and glass sanctuary anchored along turquoise glacial shores in Torres del Paine."
    }
  ],

  offers: [
    {
      id: "offer-solstice",
      code: "SOLSTICE20",
      badge: "20% Off",
      theme: "terracotta",
      title: "Mediterranean & Island Escape",
      description: "Save 20% on stays of 3 nights or longer across Santorini, Amalfi Coast, and Maldives retreats.",
      expiry: "Valid through Dec 2026",
      type: "percent",
      value: 20,
      minNights: 3,
      minSubtotal: 0,
      eligibleDestinations: ["santorini", "amalfi", "maldives"]
    },
    {
      id: "offer-earlybird",
      code: "EARLYBIRD15",
      badge: "15% Off",
      theme: "teal",
      title: "Early Planner Privilege",
      description: "Enjoy 15% instant savings on all destinations when reserving 2 or more nights ahead.",
      expiry: "Sitewide · Min 2 nights",
      type: "percent",
      value: 15,
      minNights: 2,
      minSubtotal: 0,
      eligibleDestinations: []
    },
    {
      id: "offer-longstay",
      code: "LONGSTAY25",
      badge: "25% Off",
      theme: "terracotta",
      title: "Extended Slow-Travel Retreat",
      description: "Take 25% off room rates automatically whenever you book 5 or more consecutive nights.",
      expiry: "Sitewide · Min 5 nights",
      type: "percent",
      value: 25,
      minNights: 5,
      minSubtotal: 0,
      eligibleDestinations: []
    },
    {
      id: "offer-welcome",
      code: "WELCOME100",
      badge: "$100 Credit",
      theme: "teal",
      title: "First Booking Welcome Credit",
      description: "Apply a flat $100 credit toward any stay subtotal of $500 or more across our global collection.",
      expiry: "Min $500 stay subtotal",
      type: "fixed",
      value: 100,
      minNights: 1,
      minSubtotal: 500,
      eligibleDestinations: []
    }
  ],

  whyChooseUs: [
    {
      title: "Transparent Price Estimator",
      description: "See exact stay totals—including extra guest adjustments, promo codes, and taxes—before you ever commit.",
      icon: "calculator"
    },
    {
      title: "Personally Vetted Properties",
      description: "Fewer than 6% of reviewed hotels make our list. Every suite is evaluated for light, craft, and serenity.",
      icon: "shield"
    },
    {
      title: "Flexible Free Cancellation",
      description: "Plans shift. Most stays include complimentary modification or cancellation up to 48 hours prior to arrival.",
      icon: "calendar"
    },
    {
      title: "24/7 Local Concierge",
      description: "From private airport transfers to sunset boat charters, reach real regional specialists day or night.",
      icon: "compass"
    }
  ],

  testimonials: [
    {
      id: "test-1",
      name: "Clara Lindqvist",
      location: "Stockholm, Sweden",
      stayedAt: "Canaves Cliff Suites · Santorini",
      tripDate: "September 2026",
      rating: 5,
      quote: "Knowing the exact after-tax estimate with our SOLSTICE20 promo upfront made booking effortless. The sunset plunge pool looked even better in person.",
      avatar: "assets/images/avatars/avatar-1.webp"
    },
    {
      id: "test-2",
      name: "Kenji Takahashi",
      location: "Singapore",
      stayedAt: "Aman Kyoto Garden Pavilion · Kyoto",
      tripDate: "October 2026",
      rating: 5,
      quote: "The curated Kyoto selection is unmatched. Our cedar pavilion bordered a moss brook, and the 24/7 concierge arranged private morning temple entry.",
      avatar: "assets/images/avatars/avatar-2.webp"
    },
    {
      id: "test-3",
      name: "Ananya Deshmukh",
      location: "Mumbai, India",
      stayedAt: "Sayan Valley Sanctuary · Bali",
      tripDate: "August 2026",
      rating: 5,
      quote: "Used the wishlist drawer to compare three Ubud villas with my partner over a week. The LONGSTAY25 rate saved us nearly $370 for six nights.",
      avatar: "assets/images/avatars/avatar-3.webp"
    },
    {
      id: "test-4",
      name: "Matteo Rossi",
      location: "Milan, Italy",
      stayedAt: "Palazzo Ravello Terrace · Amalfi Coast",
      tripDate: "July 2026",
      rating: 5,
      quote: "Zero surprise resort fees at checkout. Everything in the price estimator matched our final hotel invoice down to the dollar.",
      avatar: "assets/images/avatars/avatar-4.webp"
    },
    {
      id: "test-5",
      name: "Elena Bennett",
      location: "London, UK",
      stayedAt: "Riad Jasmine Courtyard · Marrakech",
      tripDate: "October 2026",
      rating: 5,
      quote: "Riad Jasmine felt like a private oasis inside the Medina. Morning mint tea under the orange trees was the highlight of our autumn.",
      avatar: "assets/images/avatars/avatar-5.webp"
    },
    {
      id: "test-6",
      name: "Mateo Alvarez",
      location: "Buenos Aires, Argentina",
      stayedAt: "Patagonia Glacier Lodge · Chile",
      tripDate: "November 2026",
      rating: 5,
      quote: "Booking two rooms for four hikers was straightforward with the guest selector, and the wood-fired sauna after trekking the towers was unforgettable.",
      avatar: "assets/images/avatars/avatar-6.webp"
    }
  ],

  experiences: [
    {
      id: "exp-coastal",
      title: "Coastal & Island Hopping",
      subtitle: "Sun-bleached cliffs, turquoise reefs & private coves",
      staysCount: "6 stays",
      filterTag: "Beachfront",
      image: "assets/images/hotels/hotel-07.webp",
      alt: "Maldives overwater villa deck above clear turquoise ocean"
    },
    {
      id: "exp-wellness",
      title: "Wellness & Spa Sanctuaries",
      subtitle: "Geothermal onsens, courtyard hammams & infinity pools",
      staysCount: "8 stays",
      filterTag: "Pool & Spa",
      image: "assets/images/hotels/hotel-03.webp",
      alt: "Bali river valley infinity pool surrounded by tropical forest"
    },
    {
      id: "exp-culinary",
      title: "Mornings & Culinary Heritage",
      subtitle: "Artisan breakfasts, kaiseki dining & vineyard terraces",
      staysCount: "8 stays",
      filterTag: "Breakfast Included",
      image: "assets/images/hotels/hotel-09.webp",
      alt: "Traditional Kyoto tatami dining pavilion opening onto zen garden"
    },
    {
      id: "exp-alpine",
      title: "Alpine & Wilderness Trails",
      subtitle: "Snow-dusted timber chalets & Patagonian glacier lakes",
      staysCount: "5 stays",
      filterTag: "Nature & Mountain",
      image: "assets/images/destinations/zermatt.webp",
      alt: "Zermatt timber chalets nestled under the Matterhorn at sunset"
    }
  ],

  packages: [
    {
      id: "pkg-mediterranean",
      badge: "Save $380",
      duration: "7 Nights · 2 Guests",
      title: "Aegean & Amalfi Sunlit Odyssey",
      route: "Santorini (4n) + Amalfi Coast (3n)",
      hotelId: "hotel-01",
      suggestedNights: 7,
      pricePerGuest: 1890,
      image: "assets/images/destinations/amalfi.webp",
      alt: "Positano coastal cliffside village overlooking turquoise sea",
      inclusions: [
        "Private island port & coastal transfers",
        "Daily Mediterranean cliffside breakfast",
        "Sunset caldera catamaran excursion"
      ]
    },
    {
      id: "pkg-zen",
      badge: "Most Popular",
      duration: "6 Nights · 2 Guests",
      title: "Kyoto & Bali Serenity Circuit",
      route: "Kyoto Ryokan (3n) + Ubud Valley (3n)",
      hotelId: "hotel-02",
      suggestedNights: 6,
      pricePerGuest: 1640,
      image: "assets/images/destinations/kyoto.webp",
      alt: "Lantern-lit historic street in Kyoto at twilight",
      inclusions: [
        "Private tea ceremony & temple early access",
        "Two holistic Balinese spa sessions",
        "Chauffeured airport arrival & departure"
      ]
    },
    {
      id: "pkg-alpine",
      badge: "Wilderness Duo",
      duration: "5 Nights · 2 Guests",
      title: "Glaciers & High Peaks Retreat",
      route: "Zermatt Chalet or Patagonia Eco-Lodge",
      hotelId: "hotel-12",
      suggestedNights: 5,
      pricePerGuest: 1520,
      image: "assets/images/destinations/patagonia.webp",
      alt: "Torres del Paine granite peaks reflected in glacial lake",
      inclusions: [
        "Guided private mountain & glacier trekking",
        "Evening thermal spa & wood-fired sauna",
        "Daily alpine breakfast & chef dinners"
      ]
    }
  ],

  journalArticles: [
    {
      id: "journal-santorini",
      category: "Coastal Guide",
      readTime: "4 min read",
      date: "October 2026",
      title: "72 Hours Along the Santorini Caldera Beyond the Crowds",
      excerpt: "Timing cliffside walks at dawn, finding family-run volcanic vineyards in Megalochori, and choosing quiet Imerovigli terraces.",
      image: "assets/images/destinations/santorini.webp",
      alt: "Whitewashed Oia Santorini cliffside architecture in golden light",
      destinationId: "santorini",
      body: [
        "Arrive on the northern rim just before 7:00 AM when marble footpaths glisten from morning sea mist and bakeries pull warm sesame koulouri straight from wood ovens.",
        "Instead of staying solely on the busiest main promenade, consider quieter caldera ledges in Imerovigli or carved volcanic cave suites where private plunge pools frame unobstructed sunset horizons.",
        "Spend your second afternoon exploring volcanic Assyrtiko vineyards inland near Megalochori, followed by a small-boat sail past the crimson cliffs of Red Beach."
      ]
    },
    {
      id: "journal-kyoto",
      category: "Cultural Etiquette",
      readTime: "5 min read",
      date: "October 2026",
      title: "The Art of Staying in a Traditional Kyoto Cedar Ryokan",
      excerpt: "From removing shoes at the genkan threshold to soaking in hinoki cypress baths before multi-course seasonal kaiseki.",
      image: "assets/images/hotels/hotel-02.webp",
      alt: "Minimalist wooden Kyoto pavilion nestled beside maple trees",
      destinationId: "kyoto",
      body: [
        "A stay inside a Kyoto ryokan moves to a slower cadence shaped by seasonal flowers in the tokonoma alcove and the aroma of tatami rush grass.",
        "Upon arrival, slip into indoor house slippers at the genkan entrance, step barefoot onto woven tatami rooms, and enjoy roasted hojicha tea overlooking moss gardens.",
        "Book early-morning temple visits through your concierge before 8:00 AM, then return for an unhurried soak in a fragrant hinoki cypress bath."
      ]
    },
    {
      id: "journal-bali",
      category: "Slow Travel",
      readTime: "4 min read",
      date: "September 2026",
      title: "Splitting Your Bali Escape Between Ubud Jungles and Uluwatu Cliffs",
      excerpt: "Why pairing three misty mornings above the Ayung river gorge with three dramatic ocean sunsets creates the ideal island rhythm.",
      image: "assets/images/destinations/bali.webp",
      alt: "Emerald rice terraces in Ubud Bali during golden sunrise mist",
      destinationId: "bali",
      body: [
        "Bali rewards travelers who resist rushing between regions. Begin in the cool highlands of Ubud, waking to mist rising over terraced valleys and morning yoga pavilions.",
        "After three unhurried days of gallery walks and waterfall trails, head south to the limestone headlands of Uluwatu where open-air cliff resorts hover 70 meters above Indian Ocean swells.",
        "Tip: Use our LONGSTAY25 code when combining 5 or more consecutive nights to unlock 25% off base suite rates across Bali."
      ]
    }
  ],

  faqs: [
    {
      id: "faq-1",
      question: "How is the dynamic booking price estimate calculated?",
      answer: "Every card and estimator modal calculates your live stay total using: (Base Nightly Rate × Nights × Rooms) + Extra Adult Fees ($35/night per adult above 2 adults per room) + Selected Add-ons − Active Promo Discount + 12% Taxes & Hospitality Fees."
    },
    {
      id: "faq-2",
      question: "Which promotional coupon codes can I apply and copy?",
      answer: "You can copy or apply SOLSTICE20 (20% off 3+ nights in Santorini, Amalfi Coast, or Maldives), EARLYBIRD15 (15% off 2+ nights sitewide), LONGSTAY25 (25% off 5+ nights sitewide), or WELCOME100 ($100 off stays with a $500+ subtotal)."
    },
    {
      id: "faq-3",
      question: "Does my wishlist and trip estimate persist if I refresh the browser?",
      answer: "Yes. Stackly stores your saved wishlist stays, last searched destination, check-in/check-out dates, guest/room counts, active coupon code, newsletter registration, and saved trip estimates locally in your browser via LocalStorage."
    },
    {
      id: "faq-4",
      question: "What happens if I select an invalid check-in or check-out date?",
      answer: "The date validator prevents past check-in dates, ensures your check-out date is at least 1 night after check-in, and caps online estimates at 30 nights while displaying clear inline guidance."
    },
    {
      id: "faq-5",
      question: "Are extra guests or multiple rooms factored into hotel prices automatically?",
      answer: "Yes. Each standard room covers up to 2 adults. If your party has more than 2 adults per room, or if you increase the room count in the Guest & Rooms selector, every hotel card updates its total stay estimate instantly."
    },
    {
      id: "faq-6",
      question: "Do properties offer free cancellation?",
      answer: "Most properties in the Stackly collection include complimentary date changes or free cancellation up to 48 hours prior to arrival—look for the Free Cancellation pill on each hotel card."
    }
  ]
};
