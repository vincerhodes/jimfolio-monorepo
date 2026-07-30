// Ported verbatim from /home/vincerhodes/dev/Fibr/src/utils/constants.ts.
export const DEFAULT_FIBER_GOAL_G = 25;

export const FIBER_NUTRIENT_NUMBER = "291";

export const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1";

export const STREAK_MESSAGES = {
  start: "Let's get growing! 🌱",
  short: "Nice streak! Keep it up! 🌿",
  medium: "You're on fire! 🌳",
  long: "Incredible consistency! 🌲✨",
} as const;

export function getStreakMessage(days: number): string {
  if (days <= 0) return STREAK_MESSAGES.start;
  if (days < 3) return STREAK_MESSAGES.short;
  if (days < 7) return STREAK_MESSAGES.medium;
  return STREAK_MESSAGES.long;
}

export interface BuiltinFood {
  name: string;
  fiberPer100g: number;
  emoji: string;
  category: string;
  typicalServingG: number;
}

export const HIGH_FIBER_FOODS: BuiltinFood[] = [
  // Seeds & nuts
  { name: "Chia seeds", fiberPer100g: 34.4, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 15 },
  { name: "Flaxseed", fiberPer100g: 27.3, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 10 },
  { name: "Almonds", fiberPer100g: 12.5, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 30 },
  { name: "Pistachios", fiberPer100g: 10.6, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 30 },
  { name: "Sunflower seeds", fiberPer100g: 8.6, emoji: "🌻", category: "Seeds & Nuts", typicalServingG: 30 },
  { name: "Walnuts", fiberPer100g: 6.7, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 30 },
  { name: "Peanuts", fiberPer100g: 8.5, emoji: "🥜", category: "Seeds & Nuts", typicalServingG: 30 },
  { name: "Pumpkin seeds", fiberPer100g: 6.5, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 30 },
  { name: "Sesame seeds", fiberPer100g: 11.8, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 10 },
  { name: "Cashews", fiberPer100g: 3.3, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 30 },
  { name: "Hazelnuts", fiberPer100g: 9.7, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 30 },
  { name: "Pecans", fiberPer100g: 9.6, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 30 },
  { name: "Brazil nuts", fiberPer100g: 7.5, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 30 },
  { name: "Macadamia nuts", fiberPer100g: 8.6, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 30 },
  { name: "Hemp seeds", fiberPer100g: 4.0, emoji: "🌿", category: "Seeds & Nuts", typicalServingG: 15 },
  { name: "Peanut butter", fiberPer100g: 6.0, emoji: "🥜", category: "Seeds & Nuts", typicalServingG: 32 },
  { name: "Almond butter", fiberPer100g: 10.3, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 32 },
  { name: "Tahini", fiberPer100g: 9.3, emoji: "🌰", category: "Seeds & Nuts", typicalServingG: 15 },

  // Legumes
  { name: "Lentils (cooked)", fiberPer100g: 7.9, emoji: "🫘", category: "Legumes", typicalServingG: 100 },
  { name: "Black beans (cooked)", fiberPer100g: 8.7, emoji: "🫘", category: "Legumes", typicalServingG: 90 },
  { name: "Chickpeas (cooked)", fiberPer100g: 7.6, emoji: "🫘", category: "Legumes", typicalServingG: 82 },
  { name: "Split peas (cooked)", fiberPer100g: 8.3, emoji: "🫛", category: "Legumes", typicalServingG: 100 },
  { name: "Kidney beans (cooked)", fiberPer100g: 6.4, emoji: "🫘", category: "Legumes", typicalServingG: 90 },
  { name: "Navy beans (cooked)", fiberPer100g: 10.5, emoji: "🫘", category: "Legumes", typicalServingG: 90 },
  { name: "Lima beans (cooked)", fiberPer100g: 7.0, emoji: "🫘", category: "Legumes", typicalServingG: 90 },
  { name: "Pinto beans (cooked)", fiberPer100g: 9.0, emoji: "🫘", category: "Legumes", typicalServingG: 90 },
  { name: "Edamame", fiberPer100g: 5.2, emoji: "🫛", category: "Legumes", typicalServingG: 80 },
  { name: "Green peas", fiberPer100g: 5.7, emoji: "🫛", category: "Legumes", typicalServingG: 80 },
  { name: "Black-eyed peas (cooked)", fiberPer100g: 6.5, emoji: "🫘", category: "Legumes", typicalServingG: 85 },
  { name: "Mung beans (cooked)", fiberPer100g: 7.6, emoji: "🫘", category: "Legumes", typicalServingG: 100 },
  { name: "White beans (cooked)", fiberPer100g: 6.3, emoji: "🫘", category: "Legumes", typicalServingG: 90 },
  { name: "Soybeans (cooked)", fiberPer100g: 6.0, emoji: "🫘", category: "Legumes", typicalServingG: 90 },
  { name: "Hummus", fiberPer100g: 4.0, emoji: "🫘", category: "Legumes", typicalServingG: 60 },

  // Grains & cereals
  { name: "Oats", fiberPer100g: 10.1, emoji: "🌾", category: "Grains", typicalServingG: 40 },
  { name: "Quinoa (cooked)", fiberPer100g: 2.8, emoji: "🌾", category: "Grains", typicalServingG: 185 },
  { name: "Barley (cooked)", fiberPer100g: 3.8, emoji: "🌾", category: "Grains", typicalServingG: 160 },
  { name: "Brown rice (cooked)", fiberPer100g: 1.8, emoji: "🍚", category: "Grains", typicalServingG: 195 },
  { name: "White rice (cooked)", fiberPer100g: 0.4, emoji: "🍚", category: "Grains", typicalServingG: 195 },
  { name: "Whole wheat bread", fiberPer100g: 6.8, emoji: "🍞", category: "Grains", typicalServingG: 30 },
  { name: "White bread", fiberPer100g: 2.7, emoji: "🍞", category: "Grains", typicalServingG: 30 },
  { name: "Whole wheat pasta (cooked)", fiberPer100g: 3.9, emoji: "🍝", category: "Grains", typicalServingG: 140 },
  { name: "Regular pasta (cooked)", fiberPer100g: 1.8, emoji: "🍝", category: "Grains", typicalServingG: 140 },
  { name: "Bran flakes", fiberPer100g: 18.3, emoji: "🥣", category: "Grains", typicalServingG: 30 },
  { name: "Muesli", fiberPer100g: 7.3, emoji: "🥣", category: "Grains", typicalServingG: 55 },
  { name: "Granola", fiberPer100g: 5.0, emoji: "🥣", category: "Grains", typicalServingG: 55 },
  { name: "Buckwheat (cooked)", fiberPer100g: 2.7, emoji: "🌾", category: "Grains", typicalServingG: 170 },
  { name: "Bulgur (cooked)", fiberPer100g: 4.5, emoji: "🌾", category: "Grains", typicalServingG: 182 },
  { name: "Couscous (cooked)", fiberPer100g: 1.4, emoji: "🌾", category: "Grains", typicalServingG: 157 },
  { name: "Corn tortilla", fiberPer100g: 5.2, emoji: "🌮", category: "Grains", typicalServingG: 26 },
  { name: "Popcorn (air-popped)", fiberPer100g: 14.5, emoji: "🍿", category: "Grains", typicalServingG: 28 },
  { name: "Wheat bran", fiberPer100g: 42.8, emoji: "🌾", category: "Grains", typicalServingG: 15 },
  { name: "Oat bran", fiberPer100g: 15.4, emoji: "🌾", category: "Grains", typicalServingG: 30 },

  // Fruits
  { name: "Avocado", fiberPer100g: 6.7, emoji: "🥑", category: "Fruits", typicalServingG: 150 },
  { name: "Raspberries", fiberPer100g: 6.5, emoji: "🫐", category: "Fruits", typicalServingG: 123 },
  { name: "Pear", fiberPer100g: 3.1, emoji: "🍐", category: "Fruits", typicalServingG: 178 },
  { name: "Apple (with skin)", fiberPer100g: 2.4, emoji: "🍎", category: "Fruits", typicalServingG: 182 },
  { name: "Banana", fiberPer100g: 2.6, emoji: "🍌", category: "Fruits", typicalServingG: 118 },
  { name: "Orange", fiberPer100g: 2.4, emoji: "🍊", category: "Fruits", typicalServingG: 131 },
  { name: "Strawberries", fiberPer100g: 2.0, emoji: "🍓", category: "Fruits", typicalServingG: 152 },
  { name: "Blueberries", fiberPer100g: 2.4, emoji: "🫐", category: "Fruits", typicalServingG: 148 },
  { name: "Blackberries", fiberPer100g: 5.3, emoji: "🫐", category: "Fruits", typicalServingG: 144 },
  { name: "Mango", fiberPer100g: 1.6, emoji: "🥭", category: "Fruits", typicalServingG: 165 },
  { name: "Kiwi", fiberPer100g: 3.0, emoji: "🥝", category: "Fruits", typicalServingG: 76 },
  { name: "Figs (dried)", fiberPer100g: 9.8, emoji: "🍇", category: "Fruits", typicalServingG: 40 },
  { name: "Dates (dried)", fiberPer100g: 6.7, emoji: "🌴", category: "Fruits", typicalServingG: 40 },
  { name: "Prunes (dried)", fiberPer100g: 7.1, emoji: "🍇", category: "Fruits", typicalServingG: 40 },
  { name: "Coconut (dried)", fiberPer100g: 16.3, emoji: "🥥", category: "Fruits", typicalServingG: 30 },
  { name: "Passion fruit", fiberPer100g: 10.4, emoji: "🍈", category: "Fruits", typicalServingG: 36 },
  { name: "Guava", fiberPer100g: 5.4, emoji: "🍈", category: "Fruits", typicalServingG: 55 },
  { name: "Pomegranate", fiberPer100g: 4.0, emoji: "🍎", category: "Fruits", typicalServingG: 87 },
  { name: "Grapes", fiberPer100g: 0.9, emoji: "🍇", category: "Fruits", typicalServingG: 151 },
  { name: "Watermelon", fiberPer100g: 0.4, emoji: "🍉", category: "Fruits", typicalServingG: 280 },
  { name: "Pineapple", fiberPer100g: 1.4, emoji: "🍍", category: "Fruits", typicalServingG: 165 },
  { name: "Peach", fiberPer100g: 1.5, emoji: "🍑", category: "Fruits", typicalServingG: 150 },
  { name: "Plum", fiberPer100g: 1.4, emoji: "🍑", category: "Fruits", typicalServingG: 66 },
  { name: "Cherries", fiberPer100g: 2.1, emoji: "🍒", category: "Fruits", typicalServingG: 138 },
  { name: "Grapefruit", fiberPer100g: 1.6, emoji: "🍊", category: "Fruits", typicalServingG: 123 },
  { name: "Apricot", fiberPer100g: 2.0, emoji: "🍑", category: "Fruits", typicalServingG: 35 },
  { name: "Cranberries (dried)", fiberPer100g: 5.7, emoji: "🫐", category: "Fruits", typicalServingG: 40 },
  { name: "Raisins", fiberPer100g: 3.7, emoji: "🍇", category: "Fruits", typicalServingG: 40 },

  // Vegetables
  { name: "Artichoke (cooked)", fiberPer100g: 5.4, emoji: "🌿", category: "Vegetables", typicalServingG: 120 },
  { name: "Broccoli (cooked)", fiberPer100g: 3.3, emoji: "🥦", category: "Vegetables", typicalServingG: 156 },
  { name: "Brussels sprouts (cooked)", fiberPer100g: 3.8, emoji: "🥬", category: "Vegetables", typicalServingG: 156 },
  { name: "Sweet potato (cooked)", fiberPer100g: 3.0, emoji: "🍠", category: "Vegetables", typicalServingG: 150 },
  { name: "Carrots", fiberPer100g: 2.8, emoji: "🥕", category: "Vegetables", typicalServingG: 128 },
  { name: "Cauliflower (cooked)", fiberPer100g: 2.0, emoji: "🥦", category: "Vegetables", typicalServingG: 124 },
  { name: "Spinach (cooked)", fiberPer100g: 2.4, emoji: "🥬", category: "Vegetables", typicalServingG: 180 },
  { name: "Kale (cooked)", fiberPer100g: 2.0, emoji: "🥬", category: "Vegetables", typicalServingG: 130 },
  { name: "Beets (cooked)", fiberPer100g: 2.8, emoji: "🟣", category: "Vegetables", typicalServingG: 170 },
  { name: "Green beans (cooked)", fiberPer100g: 3.4, emoji: "🫛", category: "Vegetables", typicalServingG: 125 },
  { name: "Asparagus (cooked)", fiberPer100g: 2.1, emoji: "🌿", category: "Vegetables", typicalServingG: 180 },
  { name: "Zucchini (cooked)", fiberPer100g: 1.0, emoji: "🥒", category: "Vegetables", typicalServingG: 180 },
  { name: "Bell pepper", fiberPer100g: 1.7, emoji: "🫑", category: "Vegetables", typicalServingG: 119 },
  { name: "Tomato", fiberPer100g: 1.2, emoji: "🍅", category: "Vegetables", typicalServingG: 123 },
  { name: "Onion", fiberPer100g: 1.7, emoji: "🧅", category: "Vegetables", typicalServingG: 110 },
  { name: "Potato (baked, with skin)", fiberPer100g: 2.2, emoji: "🥔", category: "Vegetables", typicalServingG: 173 },
  { name: "Corn (cooked)", fiberPer100g: 2.4, emoji: "🌽", category: "Vegetables", typicalServingG: 145 },
  { name: "Eggplant (cooked)", fiberPer100g: 2.5, emoji: "🍆", category: "Vegetables", typicalServingG: 99 },
  { name: "Celery", fiberPer100g: 1.6, emoji: "🥬", category: "Vegetables", typicalServingG: 110 },
  { name: "Cucumber", fiberPer100g: 0.5, emoji: "🥒", category: "Vegetables", typicalServingG: 120 },
  { name: "Mushrooms (cooked)", fiberPer100g: 2.2, emoji: "🍄", category: "Vegetables", typicalServingG: 70 },
  { name: "Cabbage (cooked)", fiberPer100g: 1.8, emoji: "🥬", category: "Vegetables", typicalServingG: 150 },
  { name: "Lettuce (romaine)", fiberPer100g: 2.1, emoji: "🥬", category: "Vegetables", typicalServingG: 85 },
  { name: "Turnip (cooked)", fiberPer100g: 2.0, emoji: "🟣", category: "Vegetables", typicalServingG: 156 },
  { name: "Parsnip (cooked)", fiberPer100g: 3.6, emoji: "🥕", category: "Vegetables", typicalServingG: 160 },
  { name: "Butternut squash (cooked)", fiberPer100g: 2.0, emoji: "🎃", category: "Vegetables", typicalServingG: 205 },
  { name: "Pumpkin (cooked)", fiberPer100g: 1.1, emoji: "🎃", category: "Vegetables", typicalServingG: 245 },
  { name: "Okra (cooked)", fiberPer100g: 3.2, emoji: "🌿", category: "Vegetables", typicalServingG: 80 },

  // Other
  { name: "Dark chocolate (70%+)", fiberPer100g: 10.9, emoji: "🍫", category: "Other", typicalServingG: 30 },
  { name: "Tofu (firm)", fiberPer100g: 0.9, emoji: "🧈", category: "Other", typicalServingG: 126 },
  { name: "Tempeh", fiberPer100g: 9.0, emoji: "🫘", category: "Other", typicalServingG: 84 },
  { name: "Seaweed (dried)", fiberPer100g: 5.0, emoji: "🌊", category: "Other", typicalServingG: 10 },
  { name: "Psyllium husk", fiberPer100g: 80.0, emoji: "🌾", category: "Other", typicalServingG: 5 },
];
