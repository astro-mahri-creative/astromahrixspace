export { default as SiteConfig, siteConfigSchema } from "./SiteConfig.js";
export {
  default as LandingSection,
  landingSectionSchema,
} from "./LandingSection.js";
export { default as Navigation, navigationSchema } from "./Navigation.js";

// Convenience object matching the old CMS export pattern
import SiteConfig from "./SiteConfig.js";
import LandingSection from "./LandingSection.js";
import Navigation from "./Navigation.js";

export const CMS = {
  SiteConfig,
  LandingSection,
  Navigation,
};

export default CMS;
