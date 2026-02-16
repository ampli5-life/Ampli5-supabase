export interface Video {
  id: string;
  title: string;
  description: string;
  type: "free" | "paid";
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  instructor: string;
  tags: string[];
  youtubeUrl?: string;
  thumbnailUrl: string;
  isFeatured: boolean;
  isPublished: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  category: string;
  isPublished: boolean;
  publishedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: "video" | "blog";
}

export const categories: Category[] = [
  { id: "1", name: "Vinyasa", type: "video" },
  { id: "2", name: "Hatha", type: "video" },
  { id: "3", name: "Yin", type: "video" },
  { id: "4", name: "Restorative", type: "video" },
  { id: "5", name: "Power", type: "video" },
  { id: "6", name: "Meditation", type: "video" },
  { id: "7", name: "Wellness", type: "blog" },
  { id: "8", name: "Mindfulness", type: "blog" },
  { id: "9", name: "Nutrition", type: "blog" },
  { id: "10", name: "Lifestyle", type: "blog" },
];

export const freeVideos: Video[] = [
  {
    id: "v1",
    title: "Morning Sun Salutation Flow",
    description: "Start your day with this energizing 20-minute sun salutation sequence. Perfect for waking up your body and setting a positive intention for the day ahead.",
    type: "free",
    category: "Vinyasa",
    difficulty: "Beginner",
    duration: "20 min",
    instructor: "Sarah Chen",
    tags: ["morning", "energy", "sun salutation"],
    youtubeUrl: "https://www.youtube.com/watch?v=6WJ1bTlWyPA",
    thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
    isFeatured: true,
    isPublished: true,
  },
  {
    id: "v2",
    title: "Gentle Evening Stretch",
    description: "Wind down with this calming 15-minute stretch routine designed to release tension from your day and prepare your body for restful sleep.",
    type: "free",
    category: "Yin",
    difficulty: "Beginner",
    duration: "15 min",
    instructor: "Maya Patel",
    tags: ["evening", "relaxation", "stretch"],
    youtubeUrl: "https://www.youtube.com/watch?v=inpok4MKVLM",
    thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop",
    isFeatured: true,
    isPublished: true,
  },
  {
    id: "v3",
    title: "Core Strength Yoga",
    description: "Build a strong foundation with this intermediate core-focused yoga class. Strengthen your abdominals, obliques, and back muscles through mindful movement.",
    type: "free",
    category: "Power",
    difficulty: "Intermediate",
    duration: "30 min",
    instructor: "Sarah Chen",
    tags: ["core", "strength", "abs"],
    youtubeUrl: "https://www.youtube.com/watch?v=v7SNaFoCnNk",
    thumbnailUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&h=400&fit=crop",
    isFeatured: false,
    isPublished: true,
  },
  {
    id: "v4",
    title: "Deep Hip Openers",
    description: "Release deep tension in your hips with this slow, meditative yin yoga practice. Hold poses for 3-5 minutes to access deeper connective tissues.",
    type: "free",
    category: "Yin",
    difficulty: "Intermediate",
    duration: "40 min",
    instructor: "Liam Brooks",
    tags: ["hips", "flexibility", "yin"],
    youtubeUrl: "https://www.youtube.com/watch?v=l0gDkwTW6ek",
    thumbnailUrl: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=400&fit=crop",
    isFeatured: false,
    isPublished: true,
  },
  {
    id: "v5",
    title: "Guided Meditation for Beginners",
    description: "A gentle introduction to meditation. Learn basic breathing techniques and body scanning to cultivate inner peace and awareness.",
    type: "free",
    category: "Meditation",
    difficulty: "Beginner",
    duration: "10 min",
    instructor: "Maya Patel",
    tags: ["meditation", "breathing", "mindfulness"],
    youtubeUrl: "https://www.youtube.com/watch?v=2CIxM7xWyCs",
    thumbnailUrl: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600&h=400&fit=crop",
    isFeatured: true,
    isPublished: true,
  },
  {
    id: "v6",
    title: "Advanced Arm Balances",
    description: "Challenge yourself with crow pose, side crow, and flying pigeon. This advanced class builds upper body strength and balance.",
    type: "free",
    category: "Power",
    difficulty: "Advanced",
    duration: "45 min",
    instructor: "Liam Brooks",
    tags: ["arm balances", "advanced", "strength"],
    youtubeUrl: "https://www.youtube.com/watch?v=4pKly2JojMw",
    thumbnailUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=400&fit=crop",
    isFeatured: false,
    isPublished: true,
  },
];

export const paidVideos: Video[] = [
  {
    id: "pv1",
    title: "30-Day Yoga Transformation",
    description: "A comprehensive 30-day program designed to transform your practice from the ground up.",
    type: "paid",
    category: "Vinyasa",
    difficulty: "Beginner",
    duration: "30 min",
    instructor: "Sarah Chen",
    tags: ["program", "transformation", "daily"],
    thumbnailUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&h=400&fit=crop",
    isFeatured: true,
    isPublished: true,
  },
  {
    id: "pv2",
    title: "Prenatal Yoga Series",
    description: "Safe and nurturing yoga sequences for each trimester of pregnancy.",
    type: "paid",
    category: "Restorative",
    difficulty: "Beginner",
    duration: "25 min",
    instructor: "Maya Patel",
    tags: ["prenatal", "gentle", "safe"],
    thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop",
    isFeatured: false,
    isPublished: true,
  },
  {
    id: "pv3",
    title: "Yoga for Athletes",
    description: "High-performance yoga designed specifically for athletes looking to improve flexibility and recovery.",
    type: "paid",
    category: "Power",
    difficulty: "Advanced",
    duration: "50 min",
    instructor: "Liam Brooks",
    tags: ["athletes", "performance", "recovery"],
    thumbnailUrl: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?w=600&h=400&fit=crop",
    isFeatured: true,
    isPublished: true,
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    title: "5 Morning Yoga Poses to Start Your Day Right",
    slug: "morning-yoga-poses",
    excerpt: "Discover five simple yet powerful yoga poses that will energize your mornings and set a positive tone for the entire day.",
    content: "Starting your morning with yoga is one of the best gifts you can give yourself...",
    coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=500&fit=crop",
    author: "Sarah Chen",
    tags: ["morning routine", "beginner", "wellness"],
    category: "Wellness",
    isPublished: true,
    publishedAt: "2025-12-15",
  },
  {
    id: "b2",
    title: "The Science Behind Yoga and Stress Relief",
    slug: "yoga-stress-relief-science",
    excerpt: "Explore the scientific research that explains how yoga reduces cortisol levels and activates the parasympathetic nervous system.",
    content: "Stress is a universal experience, but yoga offers a scientifically-backed solution...",
    coverImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop",
    author: "Maya Patel",
    tags: ["science", "stress relief", "mental health"],
    category: "Mindfulness",
    isPublished: true,
    publishedAt: "2025-12-10",
  },
  {
    id: "b3",
    title: "Nourishing Recipes for Yogis",
    slug: "nourishing-recipes-yogis",
    excerpt: "Fuel your practice with these plant-based recipes designed to support flexibility, strength, and recovery.",
    content: "What you eat directly impacts your yoga practice...",
    coverImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop",
    author: "Sarah Chen",
    tags: ["nutrition", "recipes", "plant-based"],
    category: "Nutrition",
    isPublished: true,
    publishedAt: "2025-12-05",
  },
  {
    id: "b4",
    title: "Creating a Home Yoga Space",
    slug: "home-yoga-space",
    excerpt: "Transform any corner of your home into a peaceful yoga sanctuary with these practical tips and inspiration.",
    content: "You don't need a dedicated room to practice yoga at home...",
    coverImage: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=500&fit=crop",
    author: "Liam Brooks",
    tags: ["home practice", "setup", "inspiration"],
    category: "Lifestyle",
    isPublished: true,
    publishedAt: "2025-11-28",
  },
];

export const instructors = [
  {
    name: "Sarah Chen",
    bio: "E-RYT 500 certified with 15 years of teaching experience. Sarah specializes in Vinyasa and power yoga, blending dynamic movement with mindful breathing.",
    imageUrl: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop&crop=face",
    specialties: ["Vinyasa", "Power Yoga", "Meditation"],
  },
  {
    name: "Maya Patel",
    bio: "A trained therapist and yoga instructor, Maya brings a gentle, healing approach to her classes. She specializes in restorative and yin yoga.",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    specialties: ["Yin Yoga", "Restorative", "Prenatal"],
  },
  {
    name: "Liam Brooks",
    bio: "Former professional athlete turned yoga instructor. Liam brings intensity and precision to his advanced classes, focusing on strength and flexibility.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    specialties: ["Power Yoga", "Arm Balances", "Yoga for Athletes"],
  },
];

export const testimonials = [
  {
    name: "Jessica M.",
    quote: "Ampli5 completely transformed my morning routine. The classes are beautifully structured and the instructors are world-class.",
    role: "Member since 2024",
  },
  {
    name: "David K.",
    quote: "As a complete beginner, I was nervous to start. The beginner series made me feel welcome and confident from day one.",
    role: "Lifetime Member",
  },
  {
    name: "Priya S.",
    quote: "The variety of classes keeps me coming back. From power yoga to meditation, there's always something that fits my mood.",
    role: "Annual Member",
  },
];
