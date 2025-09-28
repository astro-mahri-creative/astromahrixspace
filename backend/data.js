import bcrypt from "bcryptjs";

const data = {
  users: [
    {
      name: "Astro Mahri",
      email: "admin@astromahri.space",
      password: bcrypt.hashSync("cosmicadmin2024"),
      isAdmin: true,
    },
    {
      name: "Earl Out Of This World",
      email: "earl@astromahri.space",
      password: bcrypt.hashSync("virdcast2121"),
      isAdmin: false,
    },
  ],
  products: [
    {
      _id: "1",
      name: "UNBOXXXED: Alpha EP",
      slug: "unboxxxed-alpha-ep",
      category: "Music",
      image: "/images/unboxxxed-alpha.jpg",
      price: 12,
      countInStock: 999,
      brand: "Astro Mahri",
      rating: 5,
      numReviews: 0,
      description:
        'The audition begins. Six tracks of cosmic hip-hop exploring themes of belonging, nervousness, and intergalactic confidence. Features the singles "Yo Favorite" and more cerebral bangers.',
      longDescription:
        "UNBOXXXED: Alpha represents the beginning of Astro Mahri's cosmic journey. This EP captures the nervous energy of seeking approval while maintaining the technical prowess that defines quality hip-hop. Gaming metaphors, anime references, and space pilot aesthetics create a unique sonic landscape.",
      features: [
        "Six original tracks",
        "High-quality 320kbps MP3 downloads",
        "Digital booklet with lyrics and artwork",
        "Exclusive Earl Out Of This World analysis bonus track",
      ],
      unlockRequirement: "free",
      streamUrl: "https://soundcloud.com/astromahri/sets/unboxxxed-alpha",
      contentType: "music",
      tags: ["hip-hop", "cosmic", "nerd-culture", "space"],
    },
    {
      _id: "2",
      name: "Earl's Extragalactic Analysis Collection",
      slug: "earl-analysis-collection",
      category: "Exclusive Content",
      image: "/images/earl-collection.jpg",
      price: 15,
      countInStock: 999,
      brand: "Earl Out Of This World",
      rating: 5,
      numReviews: 0,
      description:
        "Unreleased episodes of Earl's virdcast from 2121, featuring deep analysis of tracks that won't be created until 2087. Includes commentary on preservation techniques and future hip-hop movements.",
      longDescription:
        "Earl Out Of This World broadcasts from 2121, preserving hip-hop culture for all possible futures. This collection includes analysis episodes that were too advanced for standard preservation protocols, plus Earl's personal commentary on the Cultural Convergence Period.",
      features: [
        "Five unreleased Earl analysis episodes",
        "Extended commentary tracks",
        "Future slang glossary",
        "Digital preservation techniques guide",
        "Exclusive insight into the Recursive Authenticity Movement",
      ],
      unlockRequirement: "game",
      gameScoreRequired: 150,
      streamUrl: null,
      contentType: "content",
      tags: ["analysis", "exclusive", "future", "preservation"],
    },
  ],
};

export default data;
