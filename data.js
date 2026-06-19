/* =============================================================
   Dreamy Doorsteps — data
   All catalogues, character lists, town buildings, quizzes.
   Editable; the app reads from these constants on load.
   ============================================================= */

const CHARACTERS = [
  { id: 'frilly_dress',   name: 'Pastel Frilly Dress',   img: 'assets/characters/frilly_dress.png' },
  { id: 'graphic_tee',    name: 'Graphic Tee & Skirt',   img: 'assets/characters/graphic_tee.png' },
  { id: 'streetwear',     name: 'Pastel Streetwear',     img: 'assets/characters/streetwear.png' },
  { id: 'casual_graphic', name: 'Casual Graphic',        img: 'assets/characters/casual_graphic.png' },
  { id: 'denim_overalls', name: 'Denim Overalls',        img: 'assets/characters/denim_overalls.png' }
];

const HOMES_STARTER = {
  rose:     { name: 'Rose Cottage',     wallColor: '#F4D6E0', floorColor: '#D4B895' },
  mint:     { name: 'Mint Cottage',     wallColor: '#D2EBE0', floorColor: '#C4A878' },
  lavender: { name: 'Lavender Cottage', wallColor: '#DCCEF0', floorColor: '#C8AC85' }
};

const BUILDINGS = [
  { id: 'arcade',     name: 'Arcade',           emoji: '🎮', cost: 0,     screen: 'screen-arcade',    starter: true,  desc: 'Play to earn Dreamies.' },
  { id: 'home',       name: 'Your Home',        emoji: '🏠', cost: 0,     screen: 'screen-home',      starter: true,  desc: 'Where you live.' },
  { id: 'furniture',  name: 'Furniture Store',  emoji: '🛋️', cost: 500,   screen: 'screen-shop',      shop: 'furniture',  desc: 'Sofas, tables, beds.' },
  { id: 'boutique',   name: 'Clothing Boutique', emoji: '👗', cost: 1000,  screen: 'screen-shop',      shop: 'boutique',   desc: 'New outfits.' },
  { id: 'petshop',    name: 'Pet Shop',         emoji: '🐾', cost: 2000,  screen: 'screen-shop',      shop: 'petshop',    desc: 'Adopt a little friend.' },
  { id: 'bakery',     name: 'Bakery',           emoji: '🧁', cost: 3000,  screen: 'screen-shop',      shop: 'bakery',     desc: 'Food and treats.' },
  { id: 'garden',     name: 'Garden Center',    emoji: '🌿', cost: 4000,  screen: 'screen-shop',      shop: 'garden',     desc: 'Plants and decor.' },
  { id: 'beach',      name: 'Beach House',      emoji: '🏖️', cost: 6000,  screen: 'screen-home',      home: 'beach',      desc: 'A second home by the sea.' },
  { id: 'library',    name: 'Library',          emoji: '📚', cost: 8000,  screen: 'screen-library',                       desc: 'Learn and earn.' },
  { id: 'treehouse',  name: 'Treehouse',        emoji: '🌳', cost: 10000, screen: 'screen-home',      home: 'treehouse',  desc: 'Up in the leaves.' },
  { id: 'cafe',       name: 'Café',             emoji: '☕', cost: 15000, screen: 'screen-shop',      shop: 'cafe',       desc: 'Cozy hangouts.' },
  { id: 'castle',     name: 'Castle',           emoji: '🏰', cost: 25000, screen: 'screen-home',      home: 'castle',     desc: 'The endgame home.' }
];

const SHOP_ITEMS = {
  furniture: [
    { id: 'bed_pink',    name: 'Pink Bed',     emoji: '🛏️', cost: 80,  category: 'furniture' },
    { id: 'sofa_mint',   name: 'Mint Sofa',    emoji: '🛋️', cost: 100, category: 'furniture' },
    { id: 'table_wood',  name: 'Wood Table',   emoji: '🪑', cost: 60,  category: 'furniture' },
    { id: 'lamp_gold',   name: 'Gold Lamp',    emoji: '💡', cost: 40,  category: 'furniture' },
    { id: 'mirror',      name: 'Round Mirror', emoji: '🪞', cost: 70,  category: 'furniture' },
    { id: 'clock',       name: 'Wall Clock',   emoji: '🕰️', cost: 50,  category: 'furniture' },
    { id: 'tv',          name: 'TV',           emoji: '📺', cost: 200, category: 'furniture' },
    { id: 'bookshelf',   name: 'Bookshelf',    emoji: '📚', cost: 110, category: 'furniture' },
    { id: 'rug',         name: 'Soft Rug',     emoji: '🟪', cost: 55,  category: 'furniture' },
    { id: 'piano',       name: 'Piano',        emoji: '🎹', cost: 300, category: 'furniture' },
    { id: 'fireplace',   name: 'Fireplace',    emoji: '🔥', cost: 250, category: 'furniture' },
    { id: 'plant_pot',   name: 'Plant Pot',    emoji: '🪴', cost: 35,  category: 'furniture' }
  ],
  boutique: [
    { id: 'frilly_dress',   name: 'Frilly Dress',    emoji: '👗', cost: 300, category: 'outfits', outfitId: 'frilly_dress' },
    { id: 'graphic_tee',    name: 'Graphic Tee',     emoji: '👕', cost: 300, category: 'outfits', outfitId: 'graphic_tee' },
    { id: 'streetwear',     name: 'Streetwear',      emoji: '🩱', cost: 300, category: 'outfits', outfitId: 'streetwear' },
    { id: 'casual_graphic', name: 'Casual Graphic',  emoji: '👚', cost: 300, category: 'outfits', outfitId: 'casual_graphic' },
    { id: 'denim_overalls', name: 'Denim Overalls',  emoji: '👖', cost: 300, category: 'outfits', outfitId: 'denim_overalls' }
  ],
  petshop: [
    { id: 'pet_cat',     name: 'Kitten',     emoji: '🐱', cost: 500, category: 'pet' },
    { id: 'pet_dog',     name: 'Puppy',      emoji: '🐶', cost: 500, category: 'pet' },
    { id: 'pet_bunny',   name: 'Bunny',      emoji: '🐰', cost: 450, category: 'pet' },
    { id: 'pet_fox',     name: 'Fox Pup',    emoji: '🦊', cost: 700, category: 'pet' },
    { id: 'pet_panda',   name: 'Panda',      emoji: '🐼', cost: 900, category: 'pet' },
    { id: 'pet_unicorn', name: 'Unicorn',    emoji: '🦄', cost: 1500, category: 'pet' }
  ],
  bakery: [
    { id: 'cupcake',     name: 'Cupcake',     emoji: '🧁', cost: 20, category: 'food' },
    { id: 'donut',       name: 'Donut',       emoji: '🍩', cost: 20, category: 'food' },
    { id: 'cookie',      name: 'Cookie',      emoji: '🍪', cost: 15, category: 'food' },
    { id: 'cake',        name: 'Cake',        emoji: '🎂', cost: 80, category: 'food' },
    { id: 'icecream',    name: 'Ice Cream',   emoji: '🍦', cost: 25, category: 'food' },
    { id: 'strawberry',  name: 'Strawberry',  emoji: '🍓', cost: 10, category: 'food' },
    { id: 'pancakes',    name: 'Pancakes',    emoji: '🥞', cost: 35, category: 'food' },
    { id: 'lollipop',    name: 'Lollipop',    emoji: '🍭', cost: 12, category: 'food' }
  ],
  garden: [
    { id: 'rose',        name: 'Rose',        emoji: '🌹', cost: 25, category: 'plant' },
    { id: 'tulip',       name: 'Tulip',       emoji: '🌷', cost: 25, category: 'plant' },
    { id: 'sunflower',   name: 'Sunflower',   emoji: '🌻', cost: 30, category: 'plant' },
    { id: 'cactus',      name: 'Cactus',      emoji: '🌵', cost: 40, category: 'plant' },
    { id: 'cherry_tree', name: 'Cherry Tree', emoji: '🌸', cost: 120, category: 'plant' },
    { id: 'bonsai',      name: 'Bonsai',      emoji: '🪴', cost: 90, category: 'plant' },
    { id: 'mushroom',    name: 'Mushroom',    emoji: '🍄', cost: 35, category: 'plant' }
  ],
  cafe: [
    { id: 'coffee',      name: 'Coffee Cup',  emoji: '☕', cost: 30, category: 'food' },
    { id: 'tea',         name: 'Tea',         emoji: '🍵', cost: 25, category: 'food' },
    { id: 'cafe_chair',  name: 'Café Chair',  emoji: '🪑', cost: 90, category: 'furniture' },
    { id: 'cafe_table',  name: 'Bistro Table',emoji: '🍽️',cost: 110,category: 'furniture' },
    { id: 'pastry',      name: 'Pastry',      emoji: '🥐', cost: 30, category: 'food' }
  ]
};

const WALL_OPTIONS = [
  { id: 'rose',     color: '#F4D6E0', label: 'Rose' },
  { id: 'mint',     color: '#D2EBE0', label: 'Mint' },
  { id: 'lavender', color: '#DCCEF0', label: 'Lavender' },
  { id: 'cream',    color: '#FFF1DC', label: 'Cream' },
  { id: 'sky',      color: '#D2E6F4', label: 'Sky' },
  { id: 'peach',    color: '#FFD9C7', label: 'Peach' }
];

const FLOOR_OPTIONS = [
  { id: 'wood',     color: '#D4B895', label: 'Wood' },
  { id: 'walnut',   color: '#A88562', label: 'Walnut' },
  { id: 'tile',     color: '#E0E0E8', label: 'Tile' },
  { id: 'pink_tile',color: '#F5C8D2', label: 'Pink Tile' },
  { id: 'grass',    color: '#A5D4A0', label: 'Grass' },
  { id: 'marble',   color: '#F0EDE5', label: 'Marble' }
];

const QUIZ_QUESTIONS = [
  // Maths
  { subject: 'Maths', q: 'What is 12 + 8?', options: ['18', '20', '22', '24'], answer: 1 },
  { subject: 'Maths', q: 'What is 7 × 6?', options: ['36', '40', '42', '48'], answer: 2 },
  { subject: 'Maths', q: 'Which is the largest? ½, ¼, ⅓, ⅛', options: ['½', '¼', '⅓', '⅛'], answer: 0 },
  { subject: 'Maths', q: 'What is 100 − 37?', options: ['53', '63', '73', '67'], answer: 1 },
  { subject: 'Maths', q: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], answer: 1 },
  { subject: 'Maths', q: 'What is 9 × 9?', options: ['72', '81', '89', '99'], answer: 1 },
  { subject: 'Maths', q: 'What is half of 50?', options: ['20', '25', '30', '15'], answer: 1 },
  // Spelling
  { subject: 'Spelling', q: 'Which is spelled correctly?', options: ['recieve', 'receive', 'receeve', 'recceive'], answer: 1 },
  { subject: 'Spelling', q: 'Which is spelled correctly?', options: ['friend', 'freind', 'frend', 'freand'], answer: 0 },
  { subject: 'Spelling', q: 'Which is spelled correctly?', options: ['beautyful', 'beutiful', 'beautiful', 'beautifull'], answer: 2 },
  { subject: 'Spelling', q: 'Which is spelled correctly?', options: ['necessary', 'neccessary', 'necesary', 'neccesary'], answer: 0 },
  { subject: 'Spelling', q: 'Which word is a noun?', options: ['quickly', 'cottage', 'happy', 'jump'], answer: 1 },
  { subject: 'Spelling', q: 'Which is the plural of "mouse"?', options: ['mouses', 'mice', 'mousen', 'meese'], answer: 1 },
  // General knowledge
  { subject: 'General', q: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], answer: 2 },
  { subject: 'General', q: 'Which planet is closest to the Sun?', options: ['Earth', 'Venus', 'Mars', 'Mercury'], answer: 3 },
  { subject: 'General', q: 'How many continents are there?', options: ['5', '6', '7', '8'], answer: 2 },
  { subject: 'General', q: 'What do bees collect?', options: ['Milk', 'Nectar', 'Wood', 'Rain'], answer: 1 },
  { subject: 'General', q: 'Which is the largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], answer: 3 },
  { subject: 'General', q: 'What colour do you get by mixing blue and yellow?', options: ['Green', 'Purple', 'Orange', 'Pink'], answer: 0 },
  { subject: 'General', q: 'How many legs does a spider have?', options: ['6', '8', '10', '4'], answer: 1 },
  { subject: 'General', q: 'What is the largest mammal?', options: ['Elephant', 'Blue whale', 'Giraffe', 'Hippo'], answer: 1 }
];

// Daily quest pool — 3 random ones picked each day
const QUEST_POOL = [
  { id: 'play_3',      desc: 'Play 3 minigame rounds', target: 3,  type: 'play_count',  reward: 75 },
  { id: 'earn_200',    desc: 'Earn 200 Dreamies',     target: 200, type: 'earned',      reward: 80 },
  { id: 'shop_buy',    desc: 'Buy 2 items at any shop',target: 2,   type: 'purchases',   reward: 90 },
  { id: 'quiz_3',      desc: 'Answer 3 quiz questions correctly', target: 3, type: 'quiz_correct', reward: 100 },
  { id: 'place_1',     desc: 'Decorate your room with 1 item',    target: 1, type: 'placed',  reward: 70 },
  { id: 'bubble_score',desc: 'Score 30+ in Bubble Pop', target: 30, type: 'score_bubble', reward: 100 },
  { id: 'snake_score', desc: 'Score 10+ in Snake Garden', target: 10, type: 'score_snake', reward: 100 },
  { id: 'stack_score', desc: 'Stack 8+ cupcakes', target: 8, type: 'score_stack', reward: 100 }
];
