import { LOGO_SECRET_KEY, BRANDFETCH_API_KEY } from "@env";
interface props  {
    category?: string;
    logo?: string;
}


export const getBrandMetadata = async (name: string): Promise<props> => {
  try {
    // 1. Fetch domain from Logo.dev Search API
    const logoResponse = await fetch(`https://api.logo.dev/search?q=${name}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${LOGO_SECRET_KEY}` }
    });
    const logoResults = await logoResponse.json();
    console.log('====================================');
    console.log("Received logo Results");
    console.log('====================================');
    const domain = logoResults[0]?.domain;
    if (!domain) return { category: 'Other', logo: null };

    const brandResponse = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${BRANDFETCH_API_KEY}` }
    });
    const brandData = await brandResponse.json();
    console.log('====================================');
    console.log("Received brand full data");
    console.log('====================================');
    return {
      category: brandData.company.industries?.[0]?.slug || 'other',
      logo: brandData.logos?.[0]?.formats?.[0]?.src || null
    };
  } catch (err) {
    console.error("Categorization Error:", err);
    return { category: 'Other', logo: null };
  }
};