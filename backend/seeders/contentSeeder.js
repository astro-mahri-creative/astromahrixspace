import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import Artist from "../models/contentModels/ArtistModel.js";
import EnhancedProduct from "../models/contentModels/EnhancedProductModel.js";
import MediaItem from "../models/contentModels/MediaItemModel.js";

dotenv.config();

const mongoUri =
  process.env.MONGODB_URL ||
  process.env.MONGODB_URI ||
  "mongodb://localhost/astromahrixspace";

async function seedContent() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Find admin user for createdBy/updatedBy references
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error(
        "No admin user found. Run the main seeder first: npm run data:import"
      );
      process.exit(1);
    }
    console.log(`Using admin user: ${adminUser.name} (${adminUser.email})`);

    // ========================================================================
    // SEED ARTIST
    // ========================================================================
    let artist = await Artist.findOne({ slug: "astro-mahri" });
    if (!artist) {
      artist = new Artist({
        name: "Astro Mahri",
        slug: "astro-mahri",
        bio: "Alternative hip hop artist broadcasting from the cosmic frequencies. Blending nerd culture, anime references, and space pilot aesthetics into a unique sonic landscape that bridges past, present, and future hip-hop.",
        avatar: {
          url: "https://astromahri.space/uploads/astro-mahri-avatar.jpg",
          alt: "Astro Mahri",
        },
        coverImage: {
          url: "https://astromahri.space/uploads/astro-mahri-cover.jpg",
          alt: "Astro Mahri Cover",
        },
        socialLinks: {
          website: "https://astromahri.space",
          instagram: "https://www.instagram.com/astromahri",
          soundcloud: "https://www.soundcloud.com/astromahri",
          youtube: "https://www.youtube.com/astromahri",
        },
        seller: {
          name: "Astro Mahri",
          description: "Independent alternative hip hop artist",
          rating: 5,
          numReviews: 0,
        },
        isActive: true,
        meta: {
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
          status: "published",
          tags: [
            "hip-hop",
            "alternative",
            "cosmic",
            "nerd-culture",
            "independent",
          ],
        },
      });
      await artist.save();
      console.log(`Created artist: ${artist.name}`);
    } else {
      console.log(`Artist already exists: ${artist.name}`);
    }

    // ========================================================================
    // SEED ENHANCED PRODUCT - UNBOXXXED
    // ========================================================================
    let unboxxxed = await EnhancedProduct.findOne({ slug: "unboxxxed-ep" });
    if (!unboxxxed) {
      unboxxxed = new EnhancedProduct({
        name: "UNBOXXXED",
        slug: "unboxxxed-ep",
        artist: artist._id,
        image: {
          url: "https://astromahri.space/uploads/unboxxxed-cover.jpg",
          alt: "UNBOXXXED by Astro Mahri - Cover Art",
          title: "UNBOXXXED Cover Art",
          width: 1080,
          height: 1080,
          mimeType: "image/jpeg",
        },
        gallery: [
          {
            url: "https://astromahri.space/uploads/unboxxxed-cover.jpg",
            alt: "UNBOXXXED Cover Art",
            title: "Cover Art",
            width: 1080,
            height: 1080,
            mimeType: "image/jpeg",
          },
        ],
        category: "Music",
        contentType: "music",
        description:
          'Cosmic hip-hop EP exploring themes of belonging, nervousness, and intergalactic confidence. "My life would be trash without art" — press play on your favorite song.',
        longDescription:
          "UNBOXXXED represents Astro Mahri's cosmic journey through sound. This EP captures the nervous energy of seeking approval while maintaining the technical prowess that defines quality hip-hop. Gaming metaphors, anime references, and space pilot aesthetics create a unique sonic landscape. Featuring custom hand-painted sneaker artwork with messages that define the Astro Mahri ethos.",
        features: [
          "Original tracks of cosmic alternative hip-hop",
          "High-quality 320kbps MP3 downloads",
          "Digital booklet with lyrics and artwork",
          "Custom sneaker cover art by Astro Mahri",
          "Press play on your favorite song",
        ],
        pricing: {
          basePrice: 9.99,
          currency: "USD",
          isOnSale: false,
        },
        inventory: {
          countInStock: 999,
          trackInventory: false,
          allowBackorder: true,
        },
        unlockConfig: {
          requirement: "free",
          gameScoreRequired: 0,
        },
        streamUrl:
          "https://soundcloud.com/astromahri/sets/unboxxxed",
        tags: [
          "hip-hop",
          "cosmic",
          "nerd-culture",
          "space",
          "unboxxxed",
          "alternative",
          "ep",
        ],
        seo: {
          title: "UNBOXXXED - Astro Mahri",
          description:
            "Cosmic hip-hop EP by Astro Mahri. Press play on your favorite song.",
          keywords: [
            "astro mahri",
            "unboxxxed",
            "hip-hop",
            "cosmic",
            "alternative",
          ],
        },
        isActive: true,
        publishDate: new Date(),
        analytics: {
          views: 42,
          purchases: 7,
        },
        meta: {
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
          status: "published",
          priority: 8,
          featured: true,
        },
      });
      await unboxxxed.save();
      console.log(`Created product: ${unboxxxed.name}`);
    } else {
      console.log(`Product already exists: ${unboxxxed.name}`);
    }

    // ========================================================================
    // SEED MEDIA ITEMS
    // ========================================================================

    // Video - Astro Mahri @ Incendia, Love Burn 2026
    let videoMedia = await MediaItem.findOne({
      slug: "astro-mahri-incendia-love-burn-2026",
    });
    if (!videoMedia) {
      videoMedia = new MediaItem({
        title: "Astro Mahri @ Incendia, Love Burn 2026",
        slug: "astro-mahri-incendia-love-burn-2026",
        mediaType: "video",
        category: "performance",
        description:
          "Live performance footage of Astro Mahri at Incendia during Love Burn 2026. Raw energy and cosmic vibes under the desert sky.",
        longDescription:
          "Captured on February 12, 2026, this video documents Astro Mahri's electrifying performance at the Incendia stage during Love Burn. The regional Burning Man event provided the perfect backdrop for Astro Mahri's cosmic sound, blending alternative hip-hop with the fire art and community spirit of the burn.",
        thumbnail: {
          url: "https://astromahri.space/uploads/incendia-love-burn-thumb.jpg",
          alt: "Astro Mahri performing at Incendia, Love Burn 2026",
          title: "Love Burn 2026 Performance",
          mimeType: "image/jpeg",
        },
        mediaFile: {
          url: "https://astromahri.space/uploads/astro-mahri-incendia-love-burn-2026.mp4",
          alt: "Astro Mahri @ Incendia, Love Burn 2026",
          title: "Love Burn 2026 Performance Video",
          mimeType: "video/mp4",
        },
        artist: artist._id,
        relatedProducts: [unboxxxed._id],
        duration: 180,
        quality: {
          video: {
            resolution: "1080p",
            framerate: 30,
            codec: "h264",
          },
        },
        unlockConfig: {
          requirement: "free",
        },
        tags: [
          "live",
          "performance",
          "love-burn",
          "incendia",
          "2026",
          "burning-man",
          "desert",
        ],
        seo: {
          title: "Astro Mahri @ Incendia, Love Burn 2026",
          description:
            "Live performance video from Astro Mahri at Love Burn 2026.",
          keywords: ["astro mahri", "love burn", "incendia", "live", "2026"],
        },
        isActive: true,
        isFeatured: true,
        publishDate: new Date("2026-02-12"),
        analytics: {
          views: 128,
          plays: 85,
          likes: 34,
        },
        meta: {
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
          status: "published",
          priority: 7,
          notes: "Source: VID_20260212_191914 omari.mp4",
        },
      });
      await videoMedia.save();
      console.log(`Created media: ${videoMedia.title}`);
    } else {
      console.log(`Media already exists: ${videoMedia.title}`);
    }

    // Audio - Catfish (Collab with Cheech Beats / Defacto)
    let audioMedia = await MediaItem.findOne({ slug: "catfish-cheech-beats" });
    if (!audioMedia) {
      audioMedia = new MediaItem({
        title: "Catfish (prod. Cheech Beats)",
        slug: "catfish-cheech-beats",
        mediaType: "audio",
        category: "studio",
        description:
          "Collaborative track with Cheech Beats from the Defacto crew. 103 BPM studio session blending Astro Mahri's cosmic bars with gritty production.",
        longDescription:
          "This collaboration with Cheech Beats (Defacto) showcases Astro Mahri's versatility over a 103 BPM instrumental. The track merges alternative hip-hop lyricism with Cheech Beats' signature production style, creating a raw and authentic sonic experience straight from the studio.",
        thumbnail: {
          url: "https://astromahri.space/uploads/catfish-cheech-beats-thumb.jpg",
          alt: "Catfish - Astro Mahri x Cheech Beats",
          title: "Catfish Cover",
          mimeType: "image/jpeg",
        },
        mediaFile: {
          url: "https://astromahri.space/uploads/catfish-103bpm.mp3",
          alt: "Catfish - Astro Mahri x Cheech Beats",
          title: "Catfish (prod. Cheech Beats)",
          mimeType: "audio/mpeg",
        },
        artist: artist._id,
        duration: 210,
        quality: {
          audio: {
            bitrate: 320,
            format: "mp3",
          },
        },
        unlockConfig: {
          requirement: "free",
        },
        tags: [
          "collab",
          "cheech-beats",
          "defacto",
          "studio",
          "103bpm",
          "hip-hop",
        ],
        seo: {
          title: "Catfish - Astro Mahri x Cheech Beats",
          description:
            "Collaborative track between Astro Mahri and Cheech Beats (Defacto).",
          keywords: [
            "astro mahri",
            "cheech beats",
            "defacto",
            "catfish",
            "collab",
          ],
        },
        isActive: true,
        isFeatured: false,
        publishDate: new Date(),
        analytics: {
          views: 56,
          plays: 43,
          likes: 18,
        },
        meta: {
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
          status: "published",
          priority: 5,
          notes: "Source: catfish 103bpm.mp3 from Defacto/Cheech Beats collab folder",
        },
      });
      await audioMedia.save();
      console.log(`Created media: ${audioMedia.title}`);
    } else {
      console.log(`Media already exists: ${audioMedia.title}`);
    }

    console.log("\n--- Content Seed Summary ---");
    const counts = await Promise.all([
      Artist.countDocuments(),
      EnhancedProduct.countDocuments(),
      MediaItem.countDocuments(),
    ]);
    console.log(`Artists: ${counts[0]}`);
    console.log(`Enhanced Products: ${counts[1]}`);
    console.log(`Media Items: ${counts[2]}`);
    console.log("Content seeding complete!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Content seeding failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedContent();
