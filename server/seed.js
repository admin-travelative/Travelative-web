const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Package = require('./models/Package');
const Admin = require('./models/Admin');

const packages = [
    {
        title: 'Maldives Luxury Escape',
        slug: 'maldives-luxury-escape',
        price: 89999,
        originalPrice: 110000,
        duration: '6 Days / 5 Nights',
        description: 'Escape to paradise with our exclusive Maldives package. Stay in stunning overwater villas, snorkel in crystal-clear lagoons, and enjoy world-class dining with your feet in the sand. This is the ultimate romantic luxury retreat.',
        shortDescription: 'Overwater villas, pristine beaches & world-class dining in paradise.',
        images: [
            'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200',
            'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200',
            'https://images.unsplash.com/photo-1540202404-a2f29564651f?w=1200',
        ],
        category: 'Honeymoon',
        isFeatured: true,
        isTrending: true,
        isLimitedSlots: true,
        slotsLeft: 5,
        location: 'Maldives',
        country: 'Maldives',
        rating: 4.9,
        reviewCount: 128,
        hotels: [
            { name: 'Soneva Fushi Resort', stars: 5, location: 'Baa Atoll, Maldives', amenities: ['Overwater Villa', 'Private Pool', 'Butler Service', 'Spa'] },
        ],
        itinerary: [
            { day: 1, title: 'Arrival & Welcome', description: 'Arrive at Malé International Airport and transfer by seaplane to your resort.', activities: ['Seaplane transfer', 'Welcome drink', 'Resort orientation'] },
            { day: 2, title: 'Snorkeling & Water Sports', description: 'Explore the stunning house reef and enjoy world-class snorkeling.', activities: ['Guided snorkeling', 'Kayaking', 'Stand-up paddleboarding'] },
            { day: 3, title: 'Dolphin Cruise & Sunset Dining', description: 'Embark on a sunset dolphin-watching cruise followed by a private beach dinner.', activities: ['Dolphin cruise', 'Private beach dinner', 'Stargazing'] },
            { day: 4, title: 'Spa Day & Island Exploration', description: 'Indulge in rejuvenating spa treatments and explore local islands.', activities: ['Couples spa treatment', 'Local island tour', 'Fishing trip'] },
            { day: 5, title: 'Free Day & Water Villas', description: 'Spend your last full day relaxing in your villa and the azure waters.', activities: ['Underwater restaurant lunch', 'Sunset cocktails', 'Live music'] },
            { day: 6, title: 'Farewell & Departure', description: 'Bid farewell to paradise and transfer back to Malé for your flight home.', activities: ['Farewell breakfast', 'Seaplane transfer', 'Departure'] },
        ],
        inclusions: ['Return seaplane transfers', '5 nights overwater villa accommodation', 'Daily breakfast & dinner', 'Snorkeling equipment', 'Sunset dolphin cruise'],
        exclusions: ['International flights', 'Personal expenses', 'Alcohol', 'Travel insurance'],
    },
    {
        title: 'Bali Adventure & Temples',
        slug: 'bali-adventure-temples',
        price: 42999,
        originalPrice: 55000,
        duration: '7 Days / 6 Nights',
        description: "Dive deep into Bali's magical culture: hike the iconic Mount Batur volcano at sunrise, explore ancient Hindu temples, cycle through emerald rice terraces, and enjoy rejuvenating Balinese spa treatments.",
        shortDescription: 'Volcano treks, ancient temples & lush rice terraces in the Island of Gods.',
        images: [
            'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=1200',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
            'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200',
        ],
        category: 'Adventure',
        isFeatured: true,
        isTrending: true,
        isLimitedSlots: false,
        location: 'Bali',
        country: 'Indonesia',
        rating: 4.8,
        reviewCount: 204,
        hotels: [
            { name: 'Alaya Resort Ubud', stars: 5, location: 'Ubud, Bali', amenities: ['Infinity Pool', 'Jungle View', 'Spa', 'Yoga Classes'] },
            { name: 'Seminyak Beach Resort', stars: 4, location: 'Seminyak, Bali', amenities: ['Beachfront', 'Pool', 'Restaurant', 'Bar'] },
        ],
        itinerary: [
            { day: 1, title: 'Arrival in Bali', description: 'Land at Ngurah Rai International Airport; transfer to Ubud.', activities: ['Airport pickup', 'Hotel check-in', 'Welcome Balinese dinner'] },
            { day: 2, title: 'Mount Batur Sunrise Trek', description: 'Predawn trek to Mount Batur summit to witness a spectacular sunrise.', activities: ['4AM departure', 'Volcano summit (1717m)', 'Breakfast at summit', 'Hot spring visit'] },
            { day: 3, title: 'Ubud Cultural Tour', description: 'Explore the spiritual heart of Bali with temple visits and cultural experiences.', activities: ['Tanah Lot Temple', 'Tegalalang Rice Terraces', 'Wood carving village', 'Kecak fire dance'] },
            { day: 4, title: 'Cycling & Waterfall', description: 'Downhill cycling through villages and waterfall exploraton.', activities: ['Downhill cycling tour', 'Tegenungan Waterfall', 'Balinese cooking class'] },
            { day: 5, title: 'Move to Seminyak', description: 'Transfer to Seminyak and beach relaxation.', activities: ['Spa & massage', 'Seminyak Beach', 'Sunset at Ku De Ta'] },
            { day: 6, title: 'Water Sports & Shopping', description: 'Thrilling water sports and last-minute shopping at local markets.', activities: ['Surfing lesson', 'Jet skiing', 'Kuta market shopping'] },
            { day: 7, title: 'Departure', description: 'Transfer to airport for your flight home.', activities: ['Farewell breakfast', 'Airport transfer', 'Departure'] },
        ],
        inclusions: ['6 nights hotel accommodation', 'Daily breakfast', 'Mount Batur trek with guide', 'Cultural tour with guide', 'All transfers'],
        exclusions: ['International flights', 'Lunch & dinner', 'Personal expenses', 'Travel insurance'],
    },
    {
        title: 'Rajasthan Royal Heritage',
        slug: 'rajasthan-royal-heritage',
        price: 28999,
        originalPrice: 38000,
        duration: '8 Days / 7 Nights',
        description: 'Travel through the land of kings and experience the timeless grandeur of Rajasthan. Stay in heritage palace hotels, explore majestic forts, ride camels at sunset in the Thar Desert, and witness vibrant culture.',
        shortDescription: 'Palace hotels, desert safari & ancient forts on a royal Indian journey.',
        images: [
            'https://images.unsplash.com/photo-1477587458883-47145ed31bfa?w=1200',
            'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200',
            'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=1200',
        ],
        category: 'Family',
        isFeatured: true,
        isTrending: false,
        isLimitedSlots: false,
        location: 'Rajasthan',
        country: 'India',
        rating: 4.7,
        reviewCount: 312,
        hotels: [
            { name: 'Taj Lake Palace', stars: 5, location: 'Udaipur, Rajasthan', amenities: ['Lake Views', 'Pool', 'Spa', 'Fine Dining'] },
            { name: 'Umaid Bhawan Palace', stars: 5, location: 'Jodhpur, Rajasthan', amenities: ['Heritage Property', 'Pool', 'Museum', 'Spa'] },
        ],
        itinerary: [
            { day: 1, title: 'Arrive in Jaipur – Pink City', description: 'Welcome to the Pink City of Rajasthan.', activities: ['Airport transfer', 'Hawa Mahal', 'City Palace', 'Welcome dinner'] },
            { day: 2, title: 'Amber Fort & Jaipur Sightseeing', description: 'Explore the magnificent Amber Fort by elephant.', activities: ['Elephant ride at Amber Fort', 'Jantar Mantar', 'Local bazaars'] },
            { day: 3, title: 'Jaipur to Jodhpur – Blue City', description: 'Drive to the Blue City of Jodhpur.', activities: ['Mehrangarh Fort', 'Jaswant Thada', 'Clock Tower market'] },
            { day: 4, title: 'Jodhpur Local Exploration', description: 'Fascinating village tours and fort exploration.', activities: ['Stepwell tour', 'Local village visit', 'Traditional puppet show'] },
            { day: 5, title: 'Jaisalmer – Golden Fort', description: 'Visit the golden sandstone city.', activities: ['Jaisalmer Fort (living fort)', 'Patwon ki Haveli', 'Sunset at Sam Dunes'] },
            { day: 6, title: 'Desert Safari', description: 'Camel back ride through the Thar Desert at sunset.', activities: ['Camel safari', 'Desert camping', 'Folk music & bonfire'] },
            { day: 7, title: 'Udaipur – City of Lakes', description: 'Arrive in romantic Udaipur.', activities: ['Lake Pichola boat ride', 'City Palace', 'Bagore Ki Haveli'] },
            { day: 8, title: 'Departure from Udaipur', description: 'Bid farewell to royal Rajasthan.', activities: ['Sahelion ki Bari', 'Airport transfer', 'Departure'] },
        ],
        inclusions: ['7 nights heritage hotel accommodation', 'Daily breakfast', 'All inter-city transfers by AC vehicle', 'All monument entry fees', 'Camel safari'],
        exclusions: ['Flights to/from Jaipur/Udaipur', 'Lunch & dinner', 'Personal expenses', 'Camera fees'],
    },
    {
        title: 'Santorini & Greek Islands',
        slug: 'santorini-greek-islands',
        price: 125999,
        originalPrice: 150000,
        duration: '9 Days / 8 Nights',
        description: 'Sail through the azure Aegean Sea and discover the iconic whitewashed beauty of Santorini, the party island of Mykonos, and the ancient ruins of Athens. A dreamy Mediterranean escape for couples.',
        shortDescription: 'Iconic white domes, sunsets & azure waters of the Greek paradise.',
        images: [
            'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200',
            'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200',
            'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200',
        ],
        category: 'Honeymoon',
        isFeatured: true,
        isTrending: true,
        isLimitedSlots: true,
        slotsLeft: 3,
        location: 'Santorini',
        country: 'Greece',
        rating: 4.9,
        reviewCount: 87,
        hotels: [
            { name: 'Canaves Oia Suites', stars: 5, location: 'Oia, Santorini', amenities: ['Caldera View', 'Infinity Pool', 'Butler Service', 'Gourmet Restaurant'] },
            { name: 'Mykonos Grand Hotel', stars: 5, location: 'Mykonos Town', amenities: ['Sea View', 'Pool', 'Beach Access', 'Spa'] },
        ],
        itinerary: [
            { day: 1, title: 'Arrival in Athens', description: 'Land in Athens and explore the ancient capital.', activities: ['Hotel check-in', 'Acropolis visit', 'Plaka district dinner'] },
            { day: 2, title: 'Athens Sightseeing', description: 'Immerse yourself in ancient Greek history.', activities: ['Parthenon', 'National Archaeological Museum', 'Monastiraki flea market'] },
            { day: 3, title: 'Ferry to Santorini', description: 'Scenic ferry ride to the most beautiful island in Greece.', activities: ['Morning ferry', 'Hotel check-in', 'Fira town walk', 'Sunset cocktails'] },
            { day: 4, title: 'Santorini Highlights', description: 'Experience iconic Oia and its legendary sunset.', activities: ['Oia village', 'Caldera walk', 'Wine tasting tour', 'Sunset at Castle Oia'] },
            { day: 5, title: 'Santorini Beach Day', description: 'Relax on Santorini\'s unique volcanic beaches.', activities: ['Red Beach', 'Black Beach', 'Boat tour of caldera', 'Sea cave swimming'] },
            { day: 6, title: 'Ferry to Mykonos', description: 'Journey to the island of the winds.', activities: ['Ferry to Mykonos', 'Little Venice', 'Windmills', 'Beach clubs'] },
            { day: 7, title: 'Mykonos Adventure', description: 'Explore the vibrant party island by day.', activities: ['Paradise Beach', 'Delos day trip', 'Local taverna dinner'] },
            { day: 8, title: 'Mykonos to Athens', description: 'Return flight to Athens for final night.', activities: ['Shopping in Mykonos town', 'Flight to Athens', 'Farewell dinner'] },
            { day: 9, title: 'Departure', description: 'Transfer to Athens airport for your flight home.', activities: ['Souvenir shopping', 'Airport transfer', 'Departure'] },
        ],
        inclusions: ['8 nights luxury hotel/boutique accommodation', 'Daily breakfast', 'Ferry tickets (Athens-Santorini-Mykonos-Athens)', 'All airport/port transfers', 'Wine tasting in Santorini'],
        exclusions: ['International flights to/from Athens', 'Lunch & dinner', 'Personal expenses', 'Travel insurance'],
    },
    {
        title: 'Kerala Backwaters Retreat',
        slug: 'kerala-backwaters-retreat',
        price: 18999,
        originalPrice: 26000,
        duration: '5 Days / 4 Nights',
        description: "Float through Kerala's famous backwaters on a private houseboat, surrounded by coconut palms and emerald waters. Visit spice plantations, elephant sanctuaries, and pristine beaches on God's Own Country.",
        shortDescription: 'Private houseboat, spice trails & serene backwaters in God\'s Own Country.',
        images: [
            'https://images.unsplash.com/photo-1622308644420-b20142dc993c?w=1200',
            'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200',
            'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=1200',
        ],
        category: 'Relax',
        isFeatured: false,
        isTrending: false,
        isLimitedSlots: false,
        location: 'Kerala',
        country: 'India',
        rating: 4.6,
        reviewCount: 418,
        hotels: [
            { name: 'Luxury Houseboat', stars: 4, location: 'Alleppey Backwaters', amenities: ['Private Deck', 'AC Bedroom', 'Chef on Board', 'Fishing Gear'] },
            { name: 'Spice Village Resort', stars: 4, location: 'Thekkady, Kerala', amenities: ['Nature Trails', 'Ayurvedic Spa', 'Organic Restaurant', 'Wildlife Spotting'] },
        ],
        itinerary: [
            { day: 1, title: 'Arrive in Kochi', description: 'Land in Kochi and explore the vibrant port city.', activities: ['Fort Kochi walk', 'Chinese fishing nets', 'Kathakali dance show', 'Seafood dinner'] },
            { day: 2, title: 'Thekkady – Spice Country', description: 'Drive to Thekkady and explore spice plantations.', activities: ['Spice plantation tour', 'Periyar Wildlife Sanctuary', 'Elephant ride', 'Cardamom tea tasting'] },
            { day: 3, title: 'Houseboat Day 1 – Alleppey', description: 'Board your private luxury houseboat in Alleppey.', activities: ['Boarding ceremony', 'Backwater cruise', 'Village walk', 'Sunset on deck'] },
            { day: 4, title: 'Houseboat Day 2 – Kumarakom', description: 'Continue cruising through Kumarakom bird sanctuary.', activities: ['Bird watching', 'Village market visit', 'Traditional Kerala meals', 'Evening on deck'] },
            { day: 5, title: 'Kovalam Beach & Departure', description: 'Transfer to Kovalam beach town before your flight.', activities: ['Hammock time at lighthouse beach', 'Ayurvedic massage', 'Airport transfer'] },
        ],
        inclusions: ['4 nights accommodation (resort + houseboat)', 'Daily breakfast & dinner', 'Houseboat with chef', 'Spice plantation tour', 'Wildlife sanctuary entry'],
        exclusions: ['Flights to/from Kochi', 'Lunch', 'Personal expenses', 'Kathakali show tickets'],
    },
    {
        title: 'Swiss Alps Family Adventure',
        slug: 'swiss-alps-family-adventure',
        price: 198999,
        originalPrice: 240000,
        duration: '8 Days / 7 Nights',
        description: 'Create unforgettable family memories in the Swiss Alps. Ride iconic trains through snow-capped mountains, experience the magic of Jungfraujoch (Top of Europe), explore charming Swiss villages, and enjoy world-famous chocolate.',
        shortDescription: 'Scenic train rides, Jungfraujoch summit & chocolate trails for the whole family.',
        images: [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
            'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200',
            'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200',
        ],
        category: 'Family',
        isFeatured: true,
        isTrending: false,
        isLimitedSlots: true,
        slotsLeft: 8,
        location: 'Zurich, Interlaken, Lucerne',
        country: 'Switzerland',
        rating: 4.8,
        reviewCount: 156,
        hotels: [
            { name: 'Victoria-Jungfrau Grand Hotel', stars: 5, location: 'Interlaken, Switzerland', amenities: ['Mountain Views', 'Spa', 'Pools', 'Kids Club'] },
            { name: 'Palace Hotel Lucerne', stars: 5, location: 'Lucerne, Switzerland', amenities: ['Lake Views', 'Fine Dining', 'Concierge', 'Boat Access'] },
        ],
        itinerary: [
            { day: 1, title: 'Arrive in Zurich', description: 'Land in Zurich, the gateway to Switzerland.', activities: ['Hotel check-in', 'Old Town Zurich walk', 'Lake Zurich boat ride', 'Swiss chocolate welcome gift'] },
            { day: 2, title: 'Rhine Falls & Lucerne', description: 'Visit Europe\'s largest waterfall and fairy-tale Lucerne.', activities: ['Rhine Falls', 'Chapel Bridge', 'Lion Monument', 'Lake cruise'] },
            { day: 3, title: 'Mount Pilatus – Dragon Country', description: "Take the world's steepest cogwheel railway to Mount Pilatus.", activities: ['Cogwheel train to summit', 'Panoramic views', 'Toboggan run', 'Cable car descent'] },
            { day: 4, title: 'Travel to Interlaken', description: 'Scenic Golden Pass train ride to Interlaken.', activities: ['Golden Pass panoramic train', 'Interlaken city tour', 'Paragliding (adults)', 'River rafting'] },
            { day: 5, title: 'Jungfraujoch – Top of Europe', description: 'Ascend to Jungfraujoch at 3454m above sea level.', activities: ['Jungfraujoch train', 'Sphinx Observatory', 'Aletsch Glacier walk', 'Ice Palace'] },
            { day: 6, title: 'Grindelwald & Lauterbrunnen', description: 'Explore the Twin Lakes and picturesque waterfalls.', activities: ['Grindelwald gondola', 'Trümmelbach Falls', 'Wengen village hike', 'Cheese factory tour'] },
            { day: 7, title: 'Geneva – City of Peace', description: 'Day trip to international Geneva.', activities: ['Jet d\'Eau fountain', 'UN Building tour', 'Lake Geneva walk', 'Chocolate workshop'] },
            { day: 8, title: 'Departure', description: 'Transfer from Zurich for your flight home with beautiful memories.', activities: ['Airport shopping', 'Swiss souvenir shopping', 'Departure'] },
        ],
        inclusions: ['7 nights 5-star hotel accommodation', 'Daily breakfast', 'Swiss Travel Pass (8 days)', 'Jungfraujoch tickets', 'Mount Pilatus cogwheel train', 'All guided tours'],
        exclusions: ['International flights', 'Lunch & dinner', 'Personal expenses', 'Adventure sports (optional)'],
    },
];

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Package.deleteMany({});
    await Admin.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert packages
    await Package.insertMany(packages);
    console.log(`📦 Inserted ${packages.length} packages`);

    // Create default admin
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'travelative@admin123', 12);
    await Admin.create({ username: process.env.ADMIN_USERNAME || 'admin', passwordHash });
    console.log('👤 Created admin user: admin / travelative@admin123');

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
