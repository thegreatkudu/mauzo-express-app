/**
 * B2B Demo Data — Mauzo Ordering App
 *
 * All types match src/types/index.ts exactly. Referenced by src/api/mock.ts.
 * IDs are range-partitioned by entity: suppliers 1-8, products 101-803, etc.
 */

import type {
  Category, Supplier, Product, Brand, Unit,
  CartItem, Order, OrderItem, Quotation,
  Notification, SubscriptionPlan,
} from '@/types'

// ─── Shared brand catalogue ───────────────────────────────────────────────────

const B: Record<string, Brand> = {
  azam:      { id: 1,  name: 'Azam' },
  pembe:     { id: 2,  name: 'Pembe' },
  tanganda:  { id: 3,  name: 'Tanganda' },
  samsung:   { id: 4,  name: 'Samsung' },
  philips:   { id: 5,  name: 'Philips' },
  generic:   { id: 6,  name: 'Unbranded' },
  dettol:    { id: 7,  name: 'Dettol' },
  johnsons:  { id: 8,  name: "Johnson's" },
  omo:       { id: 9,  name: 'Omo' },
  jik:       { id: 10, name: 'Jik' },
  simba:     { id: 11, name: 'Simba' },
  hp:        { id: 12, name: 'HP' },
  fortune:   { id: 13, name: 'Fortune' },
  yara:      { id: 14, name: 'Yara' },
  pioneer:   { id: 15, name: 'Pioneer' },
  syinix:    { id: 16, name: 'Syinix' },
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: Category[] = [
  { id: 1,  name: 'Food & Beverages' },
  { id: 2,  name: 'Groceries' },
  { id: 3,  name: 'Electronics' },
  { id: 4,  name: 'Household Items' },
  { id: 5,  name: 'Office Supplies' },
  { id: 6,  name: 'Health & Beauty' },
  { id: 7,  name: 'Agricultural Products' },
  { id: 8,  name: 'Cleaning Supplies' },
  { id: 9,  name: 'Building Materials' },
  { id: 10, name: 'Stationery' },
]

const cat = (id: number) => MOCK_CATEGORIES.find(c => c.id === id)!

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 1, business_name: 'Jambo Foods Ltd',           location: 'Dar es Salaam', category: cat(1), product_count: 5  },
  { id: 2, business_name: 'Karibu Electronics',         location: 'Arusha',        category: cat(3), product_count: 5  },
  { id: 3, business_name: 'Safari Groceries Co.',       location: 'Mwanza',        category: cat(2), product_count: 5  },
  { id: 4, business_name: 'Msaidizi Office Supplies',   location: 'Dodoma',        category: cat(5), product_count: 4  },
  { id: 5, business_name: 'Afya Health & Beauty',       location: 'Dar es Salaam', category: cat(6), product_count: 4  },
  { id: 6, business_name: 'Kilimo Agricultural Inputs', location: 'Morogoro',      category: cat(7), product_count: 4  },
  { id: 7, business_name: 'Nyumbani Household Goods',   location: 'Tanga',         category: cat(4), product_count: 4  },
  { id: 8, business_name: 'Usafi Cleaning Supplies',    location: 'Zanzibar',      category: cat(8), product_count: 3  },
]

const sup = (id: number) => MOCK_SUPPLIERS.find(s => s.id === id)!

// ─── Products (keyed by supplier ID) ─────────────────────────────────────────

export const MOCK_SUPPLIER_PRODUCTS: Record<number, Product[]> = {

  // ── Supplier 1: Jambo Foods Ltd ──────────────────────────────────────────
  1: [
    {
      id: 101,
      name: 'Unga wa Ngano (Wheat Flour)',
      description: 'Premium-grade wheat flour suitable for bread, chapati, mandazi, and pastries. Sourced from certified mills with consistent protein content.',
      image_url: null,
      base_price: 5500,
      min_order_quantity: 2,
      is_available: true,
      stock_quantity: 450,
      brands: [B.azam, B.pembe],
      units: [
        { id: 1001, name: 'Bag (5 kg)',  price: 13500 },
        { id: 1002, name: 'Bag (25 kg)', price: 62000 },
        { id: 1003, name: 'Bag (50 kg)', price: 118000 },
      ],
    },
    {
      id: 102,
      name: 'Sukari (White Sugar)',
      description: 'Refined white sugar, ideal for beverages, baking, and food processing. Available in bulk for commercial buyers.',
      image_url: null,
      base_price: 3200,
      min_order_quantity: 5,
      is_available: true,
      stock_quantity: 300,
      brands: [B.tanganda, B.generic],
      units: [
        { id: 1004, name: 'Bag (1 kg)',  price: 3200  },
        { id: 1005, name: 'Bag (5 kg)',  price: 15500 },
        { id: 1006, name: 'Bag (25 kg)', price: 74000 },
      ],
    },
    {
      id: 103,
      name: 'Mafuta ya Kupikia (Cooking Oil)',
      description: 'Refined sunflower cooking oil with a high smoke point — ideal for frying, sautéing, and general cooking use.',
      image_url: null,
      base_price: 5500,
      min_order_quantity: 3,
      is_available: true,
      stock_quantity: 200,
      brands: [B.azam, B.fortune],
      units: [
        { id: 1007, name: '1 L Bottle',    price: 5500  },
        { id: 1008, name: '5 L Jerrican',  price: 25000 },
        { id: 1009, name: '20 L Jerrican', price: 92000 },
      ],
    },
    {
      id: 104,
      name: 'Chumvi (Table Salt)',
      description: 'Iodised table salt meeting Tanzania Bureau of Standards specifications. Suitable for food production and household use.',
      image_url: null,
      base_price: 900,
      min_order_quantity: 10,
      is_available: true,
      stock_quantity: 1000,
      brands: [B.generic],
      units: [
        { id: 1010, name: 'Packet (500 g)', price: 900   },
        { id: 1011, name: 'Bag (5 kg)',     price: 7800  },
        { id: 1012, name: 'Bag (25 kg)',    price: 36000 },
      ],
    },
    {
      id: 105,
      name: 'Uji wa Mahindi (Maize Flour)',
      description: 'Finely milled maize flour for ugali, porridge, and commercial food production. Available in different grades.',
      image_url: null,
      base_price: 2800,
      min_order_quantity: 4,
      is_available: true,
      stock_quantity: 350,
      brands: [B.pembe, B.generic],
      units: [
        { id: 1013, name: 'Bag (2 kg)',  price: 2800  },
        { id: 1014, name: 'Bag (10 kg)', price: 13500 },
        { id: 1015, name: 'Bag (50 kg)', price: 62000 },
      ],
    },
  ],

  // ── Supplier 2: Karibu Electronics ──────────────────────────────────────
  2: [
    {
      id: 201,
      name: 'Taa ya LED (LED Bulb 20W)',
      description: 'Energy-efficient 20W LED bulbs with 2,000-hour lifespan. Compatible with standard E27 sockets. Ideal for offices, shops, and warehouses.',
      image_url: null,
      base_price: 4500,
      min_order_quantity: 5,
      is_available: true,
      stock_quantity: 800,
      brands: [B.samsung, B.philips, B.syinix],
      units: [
        { id: 2001, name: 'Per Piece',   price: 4500   },
        { id: 2002, name: 'Box of 10',   price: 42000  },
        { id: 2003, name: 'Box of 50',   price: 195000 },
      ],
    },
    {
      id: 202,
      name: 'Kamba ya Umeme (Extension Cable 5 m)',
      description: '5-metre 4-way power extension cable with surge protection and individual switches per socket. 13A rating.',
      image_url: null,
      base_price: 8500,
      min_order_quantity: 3,
      is_available: true,
      stock_quantity: 120,
      brands: [B.philips, B.generic],
      units: [
        { id: 2004, name: 'Per Piece', price: 8500  },
        { id: 2005, name: 'Box of 10', price: 80000 },
      ],
    },
    {
      id: 203,
      name: 'Solar Panel (100 W Monocrystalline)',
      description: 'Grade-A monocrystalline 100W solar panel with aluminium frame and IP65 junction box. 25-year power output warranty.',
      image_url: null,
      base_price: 85000,
      min_order_quantity: 1,
      is_available: true,
      stock_quantity: 40,
      brands: [B.syinix, B.generic],
      units: [
        { id: 2006, name: 'Per Panel',  price: 85000  },
        { id: 2007, name: 'Pack of 5',  price: 400000 },
      ],
    },
    {
      id: 204,
      name: 'Redio ya FM/AM (Radio Receiver)',
      description: 'Portable FM/AM radio receiver with USB playback, Bluetooth, and built-in rechargeable battery. Great for field use.',
      image_url: null,
      base_price: 18000,
      min_order_quantity: 2,
      is_available: true,
      stock_quantity: 60,
      brands: [B.syinix],
      units: [
        { id: 2008, name: 'Per Unit', price: 18000  },
        { id: 2009, name: 'Box of 6', price: 100000 },
      ],
    },
    {
      id: 205,
      name: 'Charger ya USB-C (Fast Charger 65W)',
      description: '65W GaN USB-C fast charger with PD 3.0 support. Compatible with laptops, tablets, and smartphones.',
      image_url: null,
      base_price: 6500,
      min_order_quantity: 5,
      is_available: true,
      stock_quantity: 250,
      brands: [B.samsung, B.generic],
      units: [
        { id: 2010, name: 'Per Piece', price: 6500   },
        { id: 2011, name: 'Box of 20', price: 120000 },
      ],
    },
  ],

  // ── Supplier 3: Safari Groceries Co. ────────────────────────────────────
  3: [
    {
      id: 301,
      name: 'Maharage (Red Kidney Beans)',
      description: 'Locally sourced red kidney beans, clean and sun-dried. High protein content — ideal for retail and food service.',
      image_url: null,
      base_price: 3500,
      min_order_quantity: 5,
      is_available: true,
      stock_quantity: 400,
      brands: [B.generic],
      units: [
        { id: 3001, name: '1 kg',       price: 3500  },
        { id: 3002, name: 'Bag (5 kg)', price: 16500 },
        { id: 3003, name: 'Bag (25 kg)',price: 78000 },
      ],
    },
    {
      id: 302,
      name: 'Mchele (Long-Grain White Rice)',
      description: 'Premium long-grain white rice with low moisture content. Polished and sorted for consistent quality.',
      image_url: null,
      base_price: 3000,
      min_order_quantity: 3,
      is_available: true,
      stock_quantity: 280,
      brands: [B.generic],
      units: [
        { id: 3004, name: 'Bag (5 kg)',  price: 14500  },
        { id: 3005, name: 'Bag (25 kg)', price: 68000  },
        { id: 3006, name: 'Bag (50 kg)', price: 130000 },
      ],
    },
    {
      id: 303,
      name: 'Nyanya za Makopo (Canned Tomatoes)',
      description: 'Whole peeled canned tomatoes in natural juice, 400g per can. Ideal for restaurants, hotels, and retail outlets.',
      image_url: null,
      base_price: 2200,
      min_order_quantity: 12,
      is_available: true,
      stock_quantity: 600,
      brands: [B.tanganda, B.generic],
      units: [
        { id: 3007, name: 'Per Can (400 g)',     price: 2200  },
        { id: 3008, name: 'Carton (24 Cans)', price: 48000 },
      ],
    },
    {
      id: 304,
      name: 'Pilipili Hoho (Green Bell Pepper)',
      description: 'Fresh green bell peppers sourced from Kilimanjaro region farms. Consistent sizing and vibrant colour.',
      image_url: null,
      base_price: 5000,
      min_order_quantity: 2,
      is_available: false,
      stock_quantity: 0,
      brands: [B.generic],
      units: [
        { id: 3009, name: '1 kg',  price: 5000  },
        { id: 3010, name: '5 kg',  price: 23000 },
      ],
    },
    {
      id: 305,
      name: 'Samaki wa Makopo (Canned Sardines)',
      description: 'Sardines in tomato sauce, 155g cans. High omega-3 content. Widely distributed in Tanzania retail chains.',
      image_url: null,
      base_price: 2500,
      min_order_quantity: 24,
      is_available: true,
      stock_quantity: 480,
      brands: [B.tanganda, B.generic],
      units: [
        { id: 3011, name: 'Per Can (155 g)',    price: 2500   },
        { id: 3012, name: 'Carton (48 Cans)', price: 110000 },
      ],
    },
  ],

  // ── Supplier 4: Msaidizi Office Supplies ────────────────────────────────
  4: [
    {
      id: 401,
      name: 'Karatasi A4 (A4 Printing Paper 80 gsm)',
      description: '80gsm A4 multi-purpose paper suitable for laser and inkjet printers. Acid-free for archiving. 500 sheets per ream.',
      image_url: null,
      base_price: 12000,
      min_order_quantity: 2,
      is_available: true,
      stock_quantity: 200,
      brands: [B.simba, B.hp],
      units: [
        { id: 4001, name: 'Per Ream (500 sheets)', price: 12000  },
        { id: 4002, name: 'Box (5 Reams)',          price: 55000  },
        { id: 4003, name: 'Carton (10 Reams)',      price: 105000 },
      ],
    },
    {
      id: 402,
      name: 'Kalamu za Bolpoint (Ballpoint Pens)',
      description: 'Smooth-writing ballpoint pens in blue, black, and red. 0.7mm tip. Preferred by schools, offices, and government institutions.',
      image_url: null,
      base_price: 18000,
      min_order_quantity: 3,
      is_available: true,
      stock_quantity: 500,
      brands: [B.simba, B.generic],
      units: [
        { id: 4004, name: 'Box of 50',        price: 18000  },
        { id: 4005, name: 'Carton (10 Boxes)', price: 165000 },
      ],
    },
    {
      id: 403,
      name: 'Staple Machine (Heavy-Duty Stapler)',
      description: 'Heavy-duty desktop stapler with 20-sheet capacity. Compatible with standard 26/6 staples. Anti-jam mechanism.',
      image_url: null,
      base_price: 8500,
      min_order_quantity: 2,
      is_available: true,
      stock_quantity: 80,
      brands: [B.simba],
      units: [
        { id: 4006, name: 'Per Unit', price: 8500  },
        { id: 4007, name: 'Box of 12',price: 95000 },
      ],
    },
    {
      id: 404,
      name: 'Wino wa Printa (HP Printer Ink Cartridge)',
      description: 'OEM HP ink cartridges for DeskJet and OfficeJet series. High-yield variant delivering 300+ pages per cartridge.',
      image_url: null,
      base_price: 25000,
      min_order_quantity: 1,
      is_available: true,
      stock_quantity: 45,
      brands: [B.hp],
      units: [
        { id: 4008, name: 'Per Cartridge', price: 25000 },
        { id: 4009, name: 'Pack of 4',     price: 92000 },
      ],
    },
  ],

  // ── Supplier 5: Afya Health & Beauty ────────────────────────────────────
  5: [
    {
      id: 501,
      name: 'Kisanitaiza cha Mikono (Hand Sanitizer)',
      description: '70% alcohol-based hand sanitizer with moisturising aloe vera. WHO-formulation compliant. Ideal for offices, clinics, and schools.',
      image_url: null,
      base_price: 3500,
      min_order_quantity: 6,
      is_available: true,
      stock_quantity: 350,
      brands: [B.dettol, B.generic],
      units: [
        { id: 5001, name: '500 ml Bottle',      price: 3500  },
        { id: 5002, name: '1 L Bottle',         price: 6500  },
        { id: 5003, name: 'Carton (24 × 500ml)',price: 78000 },
      ],
    },
    {
      id: 502,
      name: 'Loshen ya Mwili (Body Lotion)',
      description: 'Daily moisturising body lotion enriched with shea butter and vitamin E. Suitable for all skin types.',
      image_url: null,
      base_price: 7500,
      min_order_quantity: 6,
      is_available: true,
      stock_quantity: 200,
      brands: [B.johnsons, B.generic],
      units: [
        { id: 5004, name: '400 ml Bottle',      price: 7500  },
        { id: 5005, name: 'Carton (12 Bottles)',price: 82000 },
      ],
    },
    {
      id: 503,
      name: 'Shampoo (Anti-Dandruff)',
      description: 'Anti-dandruff shampoo with zinc pyrithione formula. Suitable for frequent use on all hair types.',
      image_url: null,
      base_price: 5500,
      min_order_quantity: 6,
      is_available: true,
      stock_quantity: 150,
      brands: [B.johnsons],
      units: [
        { id: 5006, name: '400 ml Bottle',      price: 5500   },
        { id: 5007, name: 'Carton (24 Bottles)',price: 120000 },
      ],
    },
    {
      id: 504,
      name: 'Poda ya Mtoto (Baby Powder)',
      description: 'Gentle talcum-free baby powder with soothing cornstarch formula. Fragrance-light and dermatologist tested.',
      image_url: null,
      base_price: 4000,
      min_order_quantity: 12,
      is_available: true,
      stock_quantity: 180,
      brands: [B.johnsons, B.generic],
      units: [
        { id: 5008, name: '200 g',               price: 4000  },
        { id: 5009, name: 'Carton (24 Units)',   price: 88000 },
      ],
    },
  ],

  // ── Supplier 6: Kilimo Agricultural Inputs ──────────────────────────────
  6: [
    {
      id: 601,
      name: 'Mbolea ya NPK (NPK 17-17-17 Fertilizer)',
      description: 'Balanced NPK fertilizer (17-17-17) suitable for maize, rice, vegetables, and most crops. Fast-release granular formula.',
      image_url: null,
      base_price: 85000,
      min_order_quantity: 2,
      is_available: true,
      stock_quantity: 120,
      brands: [B.yara, B.pioneer],
      units: [
        { id: 6001, name: 'Bag (25 kg)', price: 85000  },
        { id: 6002, name: 'Bag (50 kg)', price: 160000 },
      ],
    },
    {
      id: 602,
      name: 'Dawa ya Wadudu (Broad-Spectrum Pesticide)',
      description: 'Contact and systemic broad-spectrum insecticide effective against aphids, thrips, whiteflies, and caterpillars.',
      image_url: null,
      base_price: 28000,
      min_order_quantity: 2,
      is_available: true,
      stock_quantity: 80,
      brands: [B.yara, B.generic],
      units: [
        { id: 6003, name: '1 L Bottle',   price: 28000  },
        { id: 6004, name: '5 L Jerrican', price: 130000 },
      ],
    },
    {
      id: 603,
      name: 'Mbegu za Nyanya (F1 Tomato Seeds)',
      description: 'Disease-resistant F1 hybrid tomato seeds with high yield potential. Suitable for open-field and greenhouse cultivation.',
      image_url: null,
      base_price: 12000,
      min_order_quantity: 5,
      is_available: true,
      stock_quantity: 300,
      brands: [B.pioneer, B.generic],
      units: [
        { id: 6005, name: '100 g Packet', price: 12000 },
        { id: 6006, name: '500 g Packet', price: 55000 },
      ],
    },
    {
      id: 604,
      name: 'Hose ya Umwagiliaji (Drip Irrigation Hose)',
      description: 'UV-resistant drip irrigation hose with 20 cm emitter spacing. Flow rate 2 L/h at 1 bar pressure.',
      image_url: null,
      base_price: 35000,
      min_order_quantity: 2,
      is_available: true,
      stock_quantity: 50,
      brands: [B.generic],
      units: [
        { id: 6007, name: '50 m Roll',  price: 35000 },
        { id: 6008, name: '100 m Roll', price: 65000 },
      ],
    },
  ],

  // ── Supplier 7: Nyumbani Household Goods ────────────────────────────────
  7: [
    {
      id: 701,
      name: 'Sufuria (Aluminium Cooking Pot Set)',
      description: 'Heavy-gauge aluminium cooking pots with tight-fitting lids. Available as 3-piece (3L, 5L, 8L) or 5-piece sets.',
      image_url: null,
      base_price: 45000,
      min_order_quantity: 2,
      is_available: true,
      stock_quantity: 60,
      brands: [B.generic],
      units: [
        { id: 7001, name: 'Set of 3 (3L, 5L, 8L)',     price: 45000 },
        { id: 7002, name: 'Set of 5 (2L–12L)',          price: 75000 },
      ],
    },
    {
      id: 702,
      name: 'Fagio na Pishi (Broom & Dustpan Set)',
      description: 'Ergonomic broom with fine polypropylene bristles paired with a matching dustpan. Snap-together storage design.',
      image_url: null,
      base_price: 12000,
      min_order_quantity: 3,
      is_available: true,
      stock_quantity: 150,
      brands: [B.generic],
      units: [
        { id: 7003, name: 'Per Set',     price: 12000 },
        { id: 7004, name: 'Box of 6',    price: 65000 },
      ],
    },
    {
      id: 703,
      name: 'Viti vya Plastik (Plastic Stacking Chairs)',
      description: 'Heavy-duty polypropylene stacking chairs rated for 150 kg. UV-stabilised for outdoor use. Available in white and blue.',
      image_url: null,
      base_price: 18000,
      min_order_quantity: 4,
      is_available: true,
      stock_quantity: 200,
      brands: [B.generic],
      units: [
        { id: 7005, name: 'Per Chair',  price: 18000  },
        { id: 7006, name: 'Set of 4',   price: 68000  },
        { id: 7007, name: 'Set of 10',  price: 160000 },
      ],
    },
    {
      id: 704,
      name: 'Godoro (Foam Mattress — Single)',
      description: 'High-resilience foam mattress, single size (190 × 90 cm). Anti-bacterial fabric cover with zip for easy washing.',
      image_url: null,
      base_price: 75000,
      min_order_quantity: 2,
      is_available: true,
      stock_quantity: 30,
      brands: [B.generic],
      units: [
        { id: 7008, name: 'Single 3.5″', price: 75000  },
        { id: 7009, name: 'Single 6″',   price: 120000 },
      ],
    },
  ],

  // ── Supplier 8: Usafi Cleaning Supplies ─────────────────────────────────
  8: [
    {
      id: 801,
      name: 'Unga wa Sabuni (Detergent Powder)',
      description: 'Heavy-duty laundry detergent powder with stain-lifting enzymes and fresh floral fragrance. Effective in cold water.',
      image_url: null,
      base_price: 8500,
      min_order_quantity: 6,
      is_available: true,
      stock_quantity: 400,
      brands: [B.omo, B.generic],
      units: [
        { id: 8001, name: '1 kg Box',          price: 8500  },
        { id: 8002, name: '5 kg Box',          price: 38000 },
        { id: 8003, name: 'Carton (10 × 1 kg)',price: 78000 },
      ],
    },
    {
      id: 802,
      name: 'Bleach (Sodium Hypochlorite 5%)',
      description: 'Hospital-grade 5% sodium hypochlorite bleach for disinfecting surfaces, laundry whitening, and water treatment.',
      image_url: null,
      base_price: 4500,
      min_order_quantity: 12,
      is_available: true,
      stock_quantity: 500,
      brands: [B.jik, B.generic],
      units: [
        { id: 8004, name: '1 L Bottle',       price: 4500  },
        { id: 8005, name: '5 L Jerrican',     price: 20000 },
        { id: 8006, name: 'Carton (12 × 1 L)',price: 50000 },
      ],
    },
    {
      id: 803,
      name: 'Mop na Ndoo (Mop & Bucket Set)',
      description: 'Professional mop and wringer bucket set with microfibre mop head. Wringer system reduces hand contact for hygiene.',
      image_url: null,
      base_price: 22000,
      min_order_quantity: 2,
      is_available: true,
      stock_quantity: 45,
      brands: [B.generic],
      units: [
        { id: 8007, name: 'Per Set',    price: 22000 },
        { id: 8008, name: 'Box of 4',   price: 80000 },
      ],
    },
  ],
}

// ─── Flat product lookup (used by mock API internals) ─────────────────────────

export const ALL_PRODUCTS = new Map<number, Product>()
Object.values(MOCK_SUPPLIER_PRODUCTS).forEach(prods =>
  prods.forEach(p => ALL_PRODUCTS.set(p.id, p)),
)

// ─── Initial cart (pre-populated for demo) ────────────────────────────────────

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 1001,
    product:  MOCK_SUPPLIER_PRODUCTS[1][0],   // Wheat Flour
    brand:    B.azam,
    unit:     { id: 1002, name: 'Bag (25 kg)', price: 62000 },
    quantity: 5,
    supplier: sup(1),
    subtotal: 310000,
  },
  {
    id: 1002,
    product:  MOCK_SUPPLIER_PRODUCTS[1][2],   // Cooking Oil
    brand:    B.azam,
    unit:     { id: 1008, name: '5 L Jerrican', price: 25000 },
    quantity: 8,
    supplier: sup(1),
    subtotal: 200000,
  },
  {
    id: 1003,
    product:  MOCK_SUPPLIER_PRODUCTS[2][0],   // LED Bulb
    brand:    B.samsung,
    unit:     { id: 2002, name: 'Box of 10', price: 42000 },
    quantity: 3,
    supplier: sup(2),
    subtotal: 126000,
  },
  {
    id: 1004,
    product:  MOCK_SUPPLIER_PRODUCTS[2][1],   // Extension Cable
    brand:    null,
    unit:     { id: 2004, name: 'Per Piece', price: 8500 },
    quantity: 10,
    supplier: sup(2),
    subtotal: 85000,
  },
]

// ─── Orders ───────────────────────────────────────────────────────────────────

function oi(id: number, product: Product, brand: Brand | null, unit: Unit, qty: number): OrderItem {
  return { id, product, brand, unit, quantity: qty }
}
function q(id: number, itemId: number, price: number, qty: number, status: Quotation['status'], delivery: string | null = null, rejection: string | null = null): Quotation {
  return { id, order_item_id: itemId, price, quantity: qty, status, delivery_status: delivery, rejection_reason: rejection }
}

export const MOCK_ORDERS: Order[] = [
  // ── 1. Delivered ─────────────────────────────────────────────────────────
  {
    order_id:   'ORD-2026-0001',
    created_at: '2026-06-01T09:20:00.000Z',
    supplier:   sup(1),
    items: [
      oi(10011, MOCK_SUPPLIER_PRODUCTS[1][0], B.azam,     { id: 1002, name: 'Bag (25 kg)', price: 62000 }, 10),
      oi(10012, MOCK_SUPPLIER_PRODUCTS[1][1], B.tanganda, { id: 1006, name: 'Bag (25 kg)', price: 74000 }, 5),
    ],
    quotations: [
      q(20011, 10011, 620000, 10, 'CLOSED', 'Delivered on June 4', null),
      q(20012, 10012, 370000, 5,  'CLOSED', 'Delivered on June 4', null),
    ],
    total_quoted_amount: 990000,
    status: 'delivered',
  },

  // ── 2. Quote received (pending buyer review) ─────────────────────────────
  {
    order_id:   'ORD-2026-0002',
    created_at: '2026-06-10T14:05:00.000Z',
    supplier:   sup(2),
    items: [
      oi(20021, MOCK_SUPPLIER_PRODUCTS[2][0], B.samsung, { id: 2002, name: 'Box of 10', price: 42000 }, 10),
      oi(20022, MOCK_SUPPLIER_PRODUCTS[2][4], B.samsung, { id: 2011, name: 'Box of 20', price: 120000 }, 2),
    ],
    quotations: [
      q(30021, 20021, 420000, 10, 'SUBMITTED', null, null),
      q(30022, 20022, 240000, 2,  'SUBMITTED', null, null),
    ],
    total_quoted_amount: 660000,
    status: 'quote_received',
  },

  // ── 3. Awaiting quote ────────────────────────────────────────────────────
  {
    order_id:   'ORD-2026-0003',
    created_at: '2026-06-14T11:30:00.000Z',
    supplier:   sup(3),
    items: [
      oi(30031, MOCK_SUPPLIER_PRODUCTS[3][1], null, { id: 3005, name: 'Bag (25 kg)', price: 68000 }, 8),
      oi(30032, MOCK_SUPPLIER_PRODUCTS[3][0], null, { id: 3002, name: 'Bag (5 kg)',  price: 16500 }, 10),
      oi(30033, MOCK_SUPPLIER_PRODUCTS[3][2], B.tanganda, { id: 3008, name: 'Carton (24 Cans)', price: 48000 }, 5),
    ],
    quotations: [],
    total_quoted_amount: null,
    status: 'awaiting_quote',
  },

  // ── 4. Accepted (awaiting dispatch) ─────────────────────────────────────
  {
    order_id:   'ORD-2026-0004',
    created_at: '2026-06-08T08:45:00.000Z',
    supplier:   sup(4),
    items: [
      oi(40041, MOCK_SUPPLIER_PRODUCTS[4][0], B.simba, { id: 4003, name: 'Carton (10 Reams)', price: 105000 }, 5),
      oi(40042, MOCK_SUPPLIER_PRODUCTS[4][1], B.simba, { id: 4004, name: 'Box of 50',         price: 18000  }, 10),
    ],
    quotations: [
      q(50041, 40041, 525000, 5,  'ACCEPTED', null, null),
      q(50042, 40042, 180000, 10, 'ACCEPTED', null, null),
    ],
    total_quoted_amount: 705000,
    status: 'accepted',
  },

  // ── 5. Rejected by buyer ─────────────────────────────────────────────────
  {
    order_id:   'ORD-2026-0005',
    created_at: '2026-06-05T16:10:00.000Z',
    supplier:   sup(5),
    items: [
      oi(50051, MOCK_SUPPLIER_PRODUCTS[5][0], B.dettol, { id: 5003, name: 'Carton (24 × 500ml)', price: 78000 }, 5),
    ],
    quotations: [
      q(60051, 50051, 390000, 5, 'SUBMITTED', null, 'Quoted price exceeds our procurement budget. Please revise.'),
    ],
    total_quoted_amount: null,
    status: 'rejected',
  },

  // ── 6. Dispatched ────────────────────────────────────────────────────────
  {
    order_id:   'ORD-2026-0006',
    created_at: '2026-06-12T10:00:00.000Z',
    supplier:   sup(7),
    items: [
      oi(60061, MOCK_SUPPLIER_PRODUCTS[7][0], null, { id: 7001, name: 'Set of 3 (3L, 5L, 8L)', price: 45000 }, 4),
      oi(60062, MOCK_SUPPLIER_PRODUCTS[7][2], null, { id: 7006, name: 'Set of 4',               price: 68000 }, 10),
    ],
    quotations: [
      q(70061, 60061, 180000, 4,  'ACCEPTED', 'Dispatched — ETA June 18, 2026', null),
      q(70062, 60062, 680000, 10, 'ACCEPTED', 'Dispatched — ETA June 18, 2026', null),
    ],
    total_quoted_amount: 860000,
    status: 'dispatched',
  },

  // ── 7. Cancelled ─────────────────────────────────────────────────────────
  {
    order_id:   'ORD-2026-0007',
    created_at: '2026-06-03T07:55:00.000Z',
    supplier:   sup(8),
    items: [
      oi(70071, MOCK_SUPPLIER_PRODUCTS[8][0], B.omo, { id: 8003, name: 'Carton (10 × 1 kg)', price: 78000 }, 10),
    ],
    quotations: [],
    total_quoted_amount: null,
    status: 'cancelled',
  },

  // ── 8. Closed ────────────────────────────────────────────────────────────
  {
    order_id:   'ORD-2026-0008',
    created_at: '2026-05-28T13:40:00.000Z',
    supplier:   sup(1),
    items: [
      oi(80081, MOCK_SUPPLIER_PRODUCTS[1][3], null,    { id: 1012, name: 'Bag (25 kg)', price: 36000 }, 20),
      oi(80082, MOCK_SUPPLIER_PRODUCTS[1][4], B.pembe, { id: 1015, name: 'Bag (50 kg)', price: 62000 }, 5),
    ],
    quotations: [
      q(90081, 80081, 720000, 20, 'CLOSED', 'Delivered on June 1', null),
      q(90082, 80082, 310000, 5,  'CLOSED', 'Delivered on June 1', null),
    ],
    total_quoted_amount: 1030000,
    status: 'closed',
  },
]

// ─── Notifications ────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'quotation',
    message: 'Karibu Electronics has submitted a quotation for order ORD-2026-0002 — TZS 660,000. Please review and respond.',
    is_read: false,
    created_at: '2026-06-11T08:30:00.000Z',
    reference_id: null,
  },
  {
    id: 2,
    type: 'order',
    message: 'Your order ORD-2026-0006 has been dispatched by Nyumbani Household Goods. Estimated delivery: June 18, 2026.',
    is_read: false,
    created_at: '2026-06-13T14:20:00.000Z',
    reference_id: null,
  },
  {
    id: 3,
    type: 'subscription',
    message: 'Your free trial expires in 30 days. Upgrade to a paid plan to continue placing orders without interruption.',
    is_read: false,
    created_at: '2026-06-17T06:00:00.000Z',
    reference_id: null,
  },
  {
    id: 4,
    type: 'order',
    message: 'Msaidizi Office Supplies has accepted your order ORD-2026-0004 — TZS 705,000. Awaiting dispatch.',
    is_read: false,
    created_at: '2026-06-09T10:15:00.000Z',
    reference_id: null,
  },
  {
    id: 5,
    type: 'quotation',
    message: 'You rejected the quotation for order ORD-2026-0005. Reason: Price exceeds procurement budget.',
    is_read: true,
    created_at: '2026-06-06T16:45:00.000Z',
    reference_id: null,
  },
  {
    id: 6,
    type: 'order',
    message: 'Order ORD-2026-0001 has been delivered successfully. Thank you for ordering through Mauzo!',
    is_read: true,
    created_at: '2026-06-04T09:00:00.000Z',
    reference_id: null,
  },
  {
    id: 7,
    type: 'order',
    message: 'Order ORD-2026-0008 is now closed. Delivery confirmed and payment received by Jambo Foods Ltd.',
    is_read: true,
    created_at: '2026-06-01T11:30:00.000Z',
    reference_id: null,
  },
  {
    id: 8,
    type: 'subscription',
    message: 'Welcome to Mauzo! Your 30-day free trial has started. Browse suppliers and place your first order.',
    is_read: true,
    created_at: '2026-05-18T07:00:00.000Z',
    reference_id: null,
  },
  {
    id: 9,
    type: 'quotation',
    message: 'Jambo Foods Ltd has submitted a quotation for your order ORD-2026-0001 — TZS 990,000.',
    is_read: true,
    created_at: '2026-05-30T13:15:00.000Z',
    reference_id: null,
  },
  {
    id: 10,
    type: 'order',
    message: 'Order ORD-2026-0003 placed with Safari Groceries Co. Awaiting quotation.',
    is_read: true,
    created_at: '2026-06-14T15:00:00.000Z',
    reference_id: null,
  },
  {
    id: 11,
    type: 'subscription',
    message: 'Your Mauzo account has been verified. You can now browse suppliers and place bulk orders.',
    is_read: true,
    created_at: '2026-05-18T07:05:00.000Z',
    reference_id: null,
  },
  {
    id: 12,
    type: 'quotation',
    message: 'Reminder: You have a pending quotation for ORD-2026-0002. Please respond within 48 hours.',
    is_read: false,
    created_at: '2026-06-16T08:00:00.000Z',
    reference_id: null,
  },
]

// ─── Subscription plans ───────────────────────────────────────────────────────

export const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 1, name: 'Monthly',     duration_months: 1,  price: 15000  },
  { id: 2, name: 'Quarterly',   duration_months: 3,  price: 40000  },
  { id: 3, name: 'Semi-Annual', duration_months: 6,  price: 70000  },
  { id: 4, name: 'Annual',      duration_months: 12, price: 120000 },
]
