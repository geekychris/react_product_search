const fs = require('fs');
const path = require('path');

// Product categories and their subcategories
const CATEGORIES = {
  "Electronics": {
    subcategories: ["Laptops", "Smartphones", "Tablets", "Smart Watches", "Headphones", "Speakers", "Cameras", "Gaming Devices"],
    brands: ["Apple", "Samsung", "Sony", "Dell", "HP", "Lenovo", "ASUS", "Microsoft", "Google", "OnePlus", "Xiaomi", "Huawei"]
  },
  "Computer Components": {
    subcategories: ["Processors", "Graphics Cards", "Memory", "Storage", "Motherboards", "Power Supplies", "Cases", "Cooling"],
    brands: ["Intel", "AMD", "NVIDIA", "Corsair", "ASUS", "MSI", "Gigabyte", "Seagate", "Western Digital", "Samsung"]
  },
  "Home & Garden": {
    subcategories: ["Kitchen Appliances", "Furniture", "Decor", "Tools", "Outdoor", "Cleaning", "Storage", "Lighting"],
    brands: ["KitchenAid", "Cuisinart", "IKEA", "Whirlpool", "Black+Decker", "Dyson", "Philips", "GE", "Bosch"]
  },
  "Fashion": {
    subcategories: ["Men's Clothing", "Women's Clothing", "Shoes", "Accessories", "Jewelry", "Bags", "Watches", "Sunglasses"],
    brands: ["Nike", "Adidas", "Levi's", "Calvin Klein", "Ralph Lauren", "Zara", "H&M", "Gucci", "Prada", "Rolex"]
  },
  "Sports & Outdoors": {
    subcategories: ["Fitness Equipment", "Athletic Wear", "Outdoor Gear", "Cycling", "Swimming", "Team Sports", "Winter Sports", "Water Sports"],
    brands: ["Nike", "Adidas", "Under Armour", "Patagonia", "The North Face", "REI", "Specialized", "Trek", "Garmin"]
  },
  "Books & Media": {
    subcategories: ["Fiction", "Non-Fiction", "Textbooks", "Children's Books", "Comics", "Magazines", "DVDs", "Video Games"],
    brands: ["Penguin", "Random House", "Marvel", "DC Comics", "PlayStation", "Xbox", "Nintendo", "Steam"]
  },
  "Health & Beauty": {
    subcategories: ["Skincare", "Makeup", "Hair Care", "Supplements", "Personal Care", "Medical Devices", "Fitness", "Wellness"],
    brands: ["L'Oreal", "Clinique", "Neutrogena", "Olay", "Revlon", "Maybelline", "CeraVe", "Dove", "Johnson & Johnson"]
  },
  "Automotive": {
    subcategories: ["Parts", "Accessories", "Tools", "Electronics", "Maintenance", "Interior", "Exterior", "Performance"],
    brands: ["Bosch", "Michelin", "Castrol", "3M", "Pioneer", "Garmin", "WeatherTech", "K&N", "Mobil 1"]
  },
  "Toys & Games": {
    subcategories: ["Action Figures", "Board Games", "Educational Toys", "Electronic Toys", "Outdoor Toys", "Puzzles", "Dolls", "Building Sets"],
    brands: ["LEGO", "Mattel", "Hasbro", "Fisher-Price", "Nerf", "Barbie", "Hot Wheels", "Monopoly", "Scrabble"]
  },
  "Pet Supplies": {
    subcategories: ["Dog Supplies", "Cat Supplies", "Bird Supplies", "Fish Supplies", "Small Animals", "Pet Food", "Toys", "Health"],
    brands: ["Purina", "Hill's", "Royal Canin", "Blue Buffalo", "KONG", "Petco", "PetSmart", "Whiskas", "Pedigree"]
  }
};

// Availability options
const AVAILABILITY_OPTIONS = ["In Stock", "Limited Stock", "Out of Stock", "Pre-order", "Backorder"];

// Generate random number within range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// Generate random element from array
const randomChoice = (array) => array[randomInt(0, array.length - 1)];

// Generate realistic product names based on category
const generateProductName = (category, subcategory, brand) => {
  const productTypes = {
    "Electronics": {
      "Laptops": ["Pro", "Air", "Gaming", "Business", "Ultrabook", "Notebook", "Workstation"],
      "Smartphones": ["Pro", "Plus", "Max", "Mini", "Edge", "Note", "Pixel", "Galaxy"],
      "Tablets": ["Pro", "Air", "Mini", "Plus", "Tab", "Surface", "iPad"],
      "Smart Watches": ["Watch", "Fit", "Active", "Sport", "Classic", "Pro"],
      "Headphones": ["Studio", "Pro", "Max", "Buds", "Wireless", "Gaming", "Sport"],
      "Speakers": ["Studio", "Portable", "Smart", "Pro", "Mini", "Max", "Boom"],
      "Cameras": ["DSLR", "Mirrorless", "Action", "Instant", "Digital", "Pro"],
      "Gaming Devices": ["Console", "Handheld", "Controller", "VR", "Gaming"]
    },
    "Computer Components": {
      "Processors": ["Core", "Ryzen", "Xeon", "Threadripper", "Celeron", "Athlon"],
      "Graphics Cards": ["GeForce", "Radeon", "RTX", "GTX", "RX", "Pro"],
      "Memory": ["Vengeance", "Ripjaws", "Trident", "Fury", "Elite", "Pro"],
      "Storage": ["SSD", "HDD", "NVMe", "M.2", "Portable", "External"],
      "Motherboards": ["Prime", "ROG", "Gaming", "Pro", "Elite", "Master"],
      "Power Supplies": ["Modular", "Gold", "Platinum", "Bronze", "Titanium"],
      "Cases": ["Mid Tower", "Full Tower", "Mini ITX", "Gaming", "Silent"],
      "Cooling": ["AIO", "Air Cooler", "Liquid", "Fan", "Thermal"]
    },
    "Home & Garden": {
      "Kitchen Appliances": ["Stand Mixer", "Blender", "Coffee Maker", "Toaster", "Microwave", "Food Processor"],
      "Furniture": ["Sofa", "Chair", "Table", "Bed", "Desk", "Cabinet", "Bookshelf"],
      "Decor": ["Lamp", "Vase", "Picture Frame", "Mirror", "Curtains", "Rug"],
      "Tools": ["Drill", "Saw", "Hammer", "Screwdriver", "Tool Set", "Wrench"],
      "Outdoor": ["Grill", "Patio Set", "Garden Tools", "Hose", "Planter"],
      "Cleaning": ["Vacuum", "Steam Cleaner", "Mop", "Cleaning Kit"],
      "Storage": ["Storage Box", "Organizer", "Shelf", "Cabinet", "Basket"],
      "Lighting": ["LED Light", "Chandelier", "Floor Lamp", "Table Lamp", "Smart Light"]
    }
  };

  const types = productTypes[category]?.[subcategory] || ["Pro", "Plus", "Standard", "Elite", "Premium"];
  const type = randomChoice(types);
  const model = randomChoice(["X", "S", "Pro", "Max", "Ultra", "Plus", "Mini", "Lite"]);
  const version = randomInt(1, 20);
  
  return `${brand} ${type} ${model} ${version}`;
};

// Generate product description
const generateDescription = (category, subcategory, productName) => {
  const descriptions = [
    `Premium ${subcategory.toLowerCase()} designed for professional use with cutting-edge technology and exceptional performance.`,
    `High-quality ${subcategory.toLowerCase()} featuring advanced functionality and reliable performance for everyday use.`,
    `Innovative ${subcategory.toLowerCase()} that combines style, performance, and durability in one exceptional package.`,
    `Professional-grade ${subcategory.toLowerCase()} engineered for demanding applications with superior build quality.`,
    `State-of-the-art ${subcategory.toLowerCase()} offering unmatched performance and user-friendly features.`,
    `Award-winning ${subcategory.toLowerCase()} known for its reliability, efficiency, and outstanding value.`,
    `Next-generation ${subcategory.toLowerCase()} that delivers exceptional results with innovative design.`,
    `Top-rated ${subcategory.toLowerCase()} trusted by professionals worldwide for its superior quality and performance.`
  ];
  
  return randomChoice(descriptions);
};

// Generate realistic specifications based on category
const generateSpecifications = (category, subcategory) => {
  const specs = {
    "Electronics": {
      "Laptops": () => ({
        processor: randomChoice(["Intel Core i7", "Intel Core i5", "AMD Ryzen 7", "AMD Ryzen 5", "Apple M3", "Apple M2"]),
        memory: randomChoice(["8GB", "16GB", "32GB", "64GB"]),
        storage: randomChoice(["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"]),
        display: `${randomFloat(13, 17, 1)}-inch ${randomChoice(["FHD", "4K", "Retina", "OLED"])}`,
        weight: `${randomFloat(2, 5, 1)} lbs`,
        battery_life: `${randomInt(8, 20)} hours`
      }),
      "Smartphones": () => ({
        processor: randomChoice(["Snapdragon 8 Gen 3", "A17 Pro", "Exynos 2400", "MediaTek Dimensity"]),
        memory: randomChoice(["6GB", "8GB", "12GB", "16GB"]),
        storage: randomChoice(["128GB", "256GB", "512GB", "1TB"]),
        display: `${randomFloat(5.5, 7, 1)}-inch ${randomChoice(["OLED", "AMOLED", "LCD", "Super Retina"])}`,
        camera: `${randomInt(12, 200)}MP Main Camera`,
        battery: `${randomInt(3000, 5500)}mAh`,
        connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3"
      }),
      "Headphones": () => ({
        type: randomChoice(["Over-ear", "On-ear", "In-ear", "True Wireless"]),
        connectivity: randomChoice(["Bluetooth 5.0", "Bluetooth 5.2", "Wireless", "Wired"]),
        battery_life: `${randomInt(6, 40)} hours`,
        drivers: `${randomInt(20, 50)}mm`,
        weight: `${randomFloat(150, 400)} grams`,
        frequency_response: `${randomInt(4, 20)}Hz-${randomInt(20000, 50000)}Hz`
      })
    },
    "Computer Components": {
      "Graphics Cards": () => ({
        memory: `${randomChoice([4, 6, 8, 12, 16, 24])}GB ${randomChoice(["GDDR6", "GDDR6X"])}`,
        base_clock: `${randomInt(1200, 2500)} MHz`,
        boost_clock: `${randomInt(1500, 2800)} MHz`,
        cuda_cores: randomInt(1024, 16384),
        power_consumption: `${randomInt(150, 500)}W`,
        memory_interface: `${randomChoice([128, 192, 256, 384])}-bit`
      }),
      "Processors": () => ({
        cores: randomInt(4, 32),
        threads: randomInt(4, 64),
        base_frequency: `${randomFloat(2.0, 4.0)} GHz`,
        boost_frequency: `${randomFloat(3.0, 5.5)} GHz`,
        cache: `${randomInt(8, 128)}MB`,
        tdp: `${randomInt(35, 300)}W`
      })
    },
    "Home & Garden": {
      "Kitchen Appliances": () => ({
        capacity: `${randomFloat(1, 10)} ${randomChoice(["quarts", "liters", "cups"])}`,
        power: `${randomInt(300, 2000)} watts`,
        dimensions: `${randomFloat(10, 30, 1)} x ${randomFloat(8, 25, 1)} x ${randomFloat(8, 20, 1)} inches`,
        weight: `${randomFloat(3, 50, 1)} lbs`,
        warranty: `${randomInt(1, 5)} years`
      })
    }
  };

  const categorySpecs = specs[category];
  if (categorySpecs && categorySpecs[subcategory]) {
    return categorySpecs[subcategory]();
  }
  
  // Default specifications
  return {
    dimensions: `${randomFloat(5, 50, 1)} x ${randomFloat(3, 30, 1)} x ${randomFloat(2, 20, 1)} inches`,
    weight: `${randomFloat(0.5, 25, 1)} lbs`,
    material: randomChoice(["Aluminum", "Plastic", "Steel", "Glass", "Carbon Fiber", "Wood"]),
    color: randomChoice(["Black", "White", "Silver", "Gray", "Blue", "Red"])
  };
};

// Generate realistic tags
const generateTags = (category, subcategory, brand) => {
  const baseTags = [category.toLowerCase(), subcategory.toLowerCase().replace(/\s+/g, '-'), brand.toLowerCase()];
  
  const additionalTags = {
    "Electronics": ["tech", "digital", "wireless", "smart", "portable", "premium", "innovative"],
    "Computer Components": ["gaming", "performance", "high-end", "professional", "overclocking", "rgb"],
    "Home & Garden": ["home", "kitchen", "furniture", "decor", "appliance", "household"],
    "Fashion": ["style", "trendy", "comfortable", "fashionable", "designer", "casual"],
    "Sports & Outdoors": ["fitness", "outdoor", "athletic", "exercise", "adventure", "durable"],
    "Books & Media": ["entertainment", "educational", "bestseller", "classic", "popular"],
    "Health & Beauty": ["beauty", "skincare", "wellness", "organic", "natural", "dermatologist"],
    "Automotive": ["car", "vehicle", "auto", "maintenance", "performance", "safety"],
    "Toys & Games": ["fun", "educational", "kids", "family", "creative", "interactive"],
    "Pet Supplies": ["pet", "animal", "care", "healthy", "natural", "veterinarian"]
  };

  const categoryTags = additionalTags[category] || ["quality", "reliable", "popular"];
  const selectedTags = [...baseTags];
  
  // Add 2-4 additional tags
  const numAdditionalTags = randomInt(2, 4);
  const availableTags = [...categoryTags];
  
  for (let i = 0; i < numAdditionalTags && availableTags.length > 0; i++) {
    const index = randomInt(0, availableTags.length - 1);
    selectedTags.push(availableTags.splice(index, 1)[0]);
  }
  
  return selectedTags;
};

// Generate a single product
const generateProduct = (id) => {
  // Select category and subcategory
  const categories = Object.keys(CATEGORIES);
  const category = randomChoice(categories);
  const subcategories = CATEGORIES[category].subcategories;
  const subcategory = randomChoice(subcategories);
  const brands = CATEGORIES[category].brands;
  const brand = randomChoice(brands);
  
  // Generate product details
  const name = generateProductName(category, subcategory, brand);
  const description = generateDescription(category, subcategory, name);
  const specifications = generateSpecifications(category, subcategory);
  const tags = generateTags(category, subcategory, brand);
  
  // Generate price based on category
  const priceRanges = {
    "Electronics": [99, 3999],
    "Computer Components": [49, 2499],
    "Home & Garden": [19, 1999],
    "Fashion": [15, 899],
    "Sports & Outdoors": [25, 1299],
    "Books & Media": [5, 199],
    "Health & Beauty": [8, 299],
    "Automotive": [15, 999],
    "Toys & Games": [10, 399],
    "Pet Supplies": [5, 199]
  };
  
  const [minPrice, maxPrice] = priceRanges[category] || [10, 500];
  const price = randomFloat(minPrice, maxPrice);
  
  return {
    id: id.toString(),
    name,
    description,
    category,
    subcategory,
    brand,
    price,
    currency: "USD",
    rating: randomFloat(3.0, 5.0, 1),
    reviews_count: randomInt(1, 10000),
    availability: randomChoice(AVAILABILITY_OPTIONS),
    specifications,
    tags,
    image_url: `https://example.com/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`
  };
};

// Generate the complete catalog
const generateCatalog = (count = 1000) => {
  console.log(`🏭 Generating ${count} product entries...`);
  
  const products = [];
  const startTime = Date.now();
  
  for (let i = 1; i <= count; i++) {
    products.push(generateProduct(i));
    
    if (i % 100 === 0) {
      console.log(`📦 Generated ${i}/${count} products...`);
    }
  }
  
  const endTime = Date.now();
  console.log(`✅ Generated ${count} products in ${endTime - startTime}ms`);
  
  return products;
};

// Main execution
const main = () => {
  console.log('🚀 Starting Product Catalog Generation');
  console.log('======================================');
  
  const targetCount = process.argv[2] ? parseInt(process.argv[2]) : 1000;
  console.log(`📊 Target: ${targetCount} products`);
  console.log('');
  
  // Generate products
  const products = generateCatalog(targetCount);
  
  // Write to file
  const outputPath = path.join(__dirname, '..', 'data', 'products.json');
  console.log(`💾 Writing to ${outputPath}...`);
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
    console.log('✅ Catalog generated successfully!');
    
    // Display statistics
    console.log('');
    console.log('📊 Catalog Statistics:');
    console.log('======================');
    
    const stats = {
      categories: {},
      brands: {},
      availability: {},
      priceRanges: { under100: 0, under500: 0, under1000: 0, over1000: 0 }
    };
    
    products.forEach(product => {
      // Category stats
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
      
      // Brand stats (top brands only)
      stats.brands[product.brand] = (stats.brands[product.brand] || 0) + 1;
      
      // Availability stats
      stats.availability[product.availability] = (stats.availability[product.availability] || 0) + 1;
      
      // Price range stats
      if (product.price < 100) stats.priceRanges.under100++;
      else if (product.price < 500) stats.priceRanges.under500++;
      else if (product.price < 1000) stats.priceRanges.under1000++;
      else stats.priceRanges.over1000++;
    });
    
    console.log('📈 Categories:');
    Object.entries(stats.categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} products`);
      });
    
    console.log('');
    console.log('🏭 Top Brands:');
    Object.entries(stats.brands)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([brand, count]) => {
        console.log(`   ${brand}: ${count} products`);
      });
    
    console.log('');
    console.log('📦 Availability:');
    Object.entries(stats.availability).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} products`);
    });
    
    console.log('');
    console.log('💰 Price Ranges:');
    console.log(`   Under $100: ${stats.priceRanges.under100} products`);
    console.log(`   $100-$500: ${stats.priceRanges.under500} products`);
    console.log(`   $500-$1000: ${stats.priceRanges.under1000} products`);
    console.log(`   Over $1000: ${stats.priceRanges.over1000} products`);
    
    console.log('');
    console.log('🎉 Ready to index! Run: npm run index-data');
    
  } catch (error) {
    console.error('❌ Error writing catalog:', error.message);
    process.exit(1);
  }
};

// Run the generator
main();
