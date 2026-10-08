export interface SubCategory {
  id: string;
  label: string;
}

export interface CategoryDefinition {
  id: string;
  label: string;
  iconName: string;
  description: string;
  subcategories: SubCategory[];
}

export const RESOURCE_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'backpacks',
    label: 'Backpacks',
    iconName: 'Backpack',
    description: 'Solid color, clear transparent, and grade-band tailored backpacks.',
    subcategories: [
      { id: 'solid-color', label: 'Solid Color (15" / 17")' },
      { id: 'clear-transparent', label: 'Clear Transparent (17")' },
      { id: 'k-2nd', label: 'Kindergarten – 2nd Grade' },
      { id: '3rd-5th', label: '3rd – 5th Grade' },
      { id: '6th-8th', label: 'Middle School (6th – 8th)' },
      { id: 'high-school', label: 'High School (9th – 12th)' },
    ]
  },
  {
    id: 'school-supplies',
    label: 'School Supplies',
    iconName: 'Package',
    description: 'Pre-packaged student kits, notebooks, writing utensils, and classroom tools.',
    subcategories: [
      { id: 'packaged-kits', label: 'Individually Packaged Kits' },
      { id: 'notebooks', label: 'Spiral Notebooks & Composition' },
      { id: 'writing', label: 'Pencils (12-pk), Pens & Erasers' },
      { id: 'coloring', label: 'Crayons (24-pk) & Washable Markers' },
      { id: 'glue-adhesives', label: 'Glue Sticks & Scissors' },
      { id: 'headphones', label: 'Student Over-Ear Headphones' },
      { id: 'folders-binders', label: 'Heavy Duty Folders & Rulers' },
    ]
  },
  {
    id: 'hygiene',
    label: 'Hygiene & Personal Care',
    iconName: 'Sparkles',
    description: 'Essential wellness products, deodorants, menstrual kits, and dental care.',
    subcategories: [
      { id: 'deodorant', label: 'Deodorant (Stick / Spray)' },
      { id: 'menstrual-care', label: 'Menstrual Care Kits (Pads/Tampons)' },
      { id: 'dental-kits', label: 'Toothbrush & Toothpaste Kits' },
      { id: 'hand-sanitizer', label: 'Pocket Hand Sanitizers' },
      { id: 'facial-tissues', label: 'Pocket Facial Tissue Packs' },
      { id: 'lip-balm', label: 'Lip Balm & Gentle Lotions' },
    ]
  },
  {
    id: 'food',
    label: 'Food & Nutrition',
    iconName: 'Utensils',
    description: 'Weekend student snack bags, shelf-stable pantry items, and breakfast essentials.',
    subcategories: [
      { id: 'weekend-snack-packs', label: 'Weekend Student Snack Packs' },
      { id: 'granola-crackers', label: 'Granola Bars & Goldfish Crackers' },
      { id: 'canned-soups', label: 'Shelf-Stable Canned Soups & Meals' },
      { id: 'mac-cheese', label: 'Microwaveable Mac & Cheese Cups' },
      { id: 'fruit-pouches', label: 'Fruit Cups & Pouches' },
      { id: 'breakfast-oatmeal', label: 'Instant Oatmeal & Breakfast Cereals' },
    ]
  },
  {
    id: 'clothing',
    label: 'Clothing & Apparel',
    iconName: 'Shirt',
    description: 'Warm winter coats, uniform tops, hoodies, socks, and athletic shoes.',
    subcategories: [
      { id: 'winter-coats', label: 'Winter Coats & Outerwear' },
      { id: 'hoodies-sweaters', label: 'Hoodies & Fleece Sweatshirts' },
      { id: 'uniform-tees', label: 'Standard Uniform T-Shirts' },
      { id: 'socks-basics', label: 'New Socks & Undergarments' },
      { id: 'shoes-sneakers', label: 'Youth & Adult Athletic Shoes' },
    ]
  },
  {
    id: 'technology',
    label: 'Technology & Devices',
    iconName: 'Laptop',
    description: 'Student Chromebooks, laptops, power adapters, and protective cases.',
    subcategories: [
      { id: 'chromebooks', label: 'Chromebooks & Student Laptops' },
      { id: 'chargers', label: 'Device Power Chargers & Cables' },
      { id: 'tablets', label: 'Touchscreen Learning Tablets' },
      { id: 'protective-cases', label: 'Padded Device Carrying Sleeves' },
    ]
  },
  {
    id: 'books',
    label: 'Books & Literacy',
    iconName: 'Book',
    description: 'Classroom libraries, leveled readers, textbooks, and STEM reading materials.',
    subcategories: [
      { id: 'early-readers', label: 'Leveled Early Readers (K–2)' },
      { id: 'chapter-books', label: 'Chapter Books & Fiction (3–5)' },
      { id: 'ya-novels', label: 'Middle & High School Novels' },
      { id: 'stem-books', label: 'Science, Math & STEM Books' },
      { id: 'textbooks', label: 'Classroom Curriculum Textbooks' },
    ]
  },
  {
    id: 'cleaning',
    label: 'Cleaning & Sanitation',
    iconName: 'Home',
    description: 'Disinfecting surface wipes, paper towel multipacks, and hand sanitizer jugs.',
    subcategories: [
      { id: 'disinfectant-wipes', label: 'Disinfecting Surface Wipes' },
      { id: 'paper-towels', label: 'Paper Towel Multipacks' },
      { id: 'sanitizer-jugs', label: 'Classroom Sanitizer Pump Jugs' },
      { id: 'surface-spray', label: 'Disinfecting Multi-Surface Spray' },
    ]
  },
  {
    id: 'stem',
    label: 'STEM & Enrichment',
    iconName: 'Palette',
    description: 'Hands-on experiment kits, Time for Kids subscriptions, and art materials.',
    subcategories: [
      { id: 'stem-kits', label: 'Hands-On STEM Experiment Kits' },
      { id: 'time-for-kids', label: 'Time for Kids Subscriptions' },
      { id: 'workshops', label: '"What Sparks You" Workshops' },
      { id: 'art-materials', label: 'Art & Craft Supply Packs' },
    ]
  }
];
