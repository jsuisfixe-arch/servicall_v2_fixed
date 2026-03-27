/**
 * leadExtractionService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Service d'extraction de leads depuis 3 fournisseurs :
 *
 *  1. OpenStreetMap / Overpass API  — 100% gratuit, zéro clé requise
 *  2. Google Maps Places API        — BYOK (clé stockée en BYOK chiffrée)
 *  3. Pages Jaunes API              — BYOK (clé stockée en BYOK chiffrée)
 *
 * Architecture :
 *  - searchBusinesses(params)       → appelle le bon provider
 *  - geocodeLocation(location)      → résout "Paris" → {lat, lng} via OSM Nominatim
 *  - chaque provider retourne []Business normalisé
 *  - importBusinessesAsProspects()  → insère dans prospects (dédup par phone)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { logger } from "../infrastructure/logger";
import { getAPIKey } from "./byokService";
import { db } from "../db";
import { prospects, leadExtractions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Business {
  _source: "osm" | "google" | "pagesjaunes";
  _externalId: string;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  phone?: string;
  website?: string;
  email?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  lat?: number;
  lng?: number;
  openingHours?: string[];
  description?: string;
}

export interface SearchParams {
  query: string;
  location: string;
  radius: number;          // en mètres
  maxResults: number;
  provider: "osm" | "google" | "pagesjaunes" | "auto";
  tenantId: number;
}

export interface SearchResult {
  businesses: Business[];
  total: number;
  provider: string;
  extractionId?: number;
  error?: string;
}

// ── Géocodage via OSM Nominatim (gratuit) ─────────────────────────────────────

export async function geocodeLocation(
  location: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", location);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Servicall-CRM/3.3 (contact@servicall.com)",
        "Accept-Language": "fr,en",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      logger.warn("[LeadExtraction] Nominatim geocoding failed", { status: res.status, location });
      return null;
    }

    const results = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (!results.length) return null;

    return {
      lat: parseFloat(results[0]!.lat),
      lng: parseFloat(results[0]!.lon),
      displayName: results[0]!.display_name,
    };
  } catch (err) {
    logger.error("[LeadExtraction] Geocoding error", { err, location });
    return null;
  }
}

// ── Provider 1 : OpenStreetMap via Overpass API ───────────────────────────────
// Overpass API : requête QL pour trouver des entreprises par type/nom

function buildOverpassQuery(
  query: string,
  lat: number,
  lng: number,
  radius: number,
  limit: number
): string {
  // Normaliser le terme de recherche pour Overpass
  // amenityMap : catégories OSM de type amenity=
  const amenityMap: Record<string, string> = {
    restaurant: "restaurant",
    "hôtel": "hotel",
    hotel: "hotel",
    pharmacie: "pharmacy",
    pharmacy: "pharmacy",
    "médecin": "doctors",
    medecin: "doctors",
    "généraliste": "doctors",
    generaliste: "doctors",
    dentiste: "dentist",
    banque: "bank",
    bank: "bank",
    "école": "school",
    ecole: "school",
    bar: "bar",
    "café": "cafe",
    cafe: "cafe",
    "cinéma": "cinema",
    cinema: "cinema",
    "théâtre": "theatre",
    theatre: "theatre",
    "hôpital": "hospital",
    hopital: "hospital",
    hospital: "hospital",
    parking: "parking",
    poste: "post_office",
    mairie: "townhall",
    "bibliothèque": "library",
    bibliotheque: "library",
    fast_food: "fast_food",
    fastfood: "fast_food",
    "restauration rapide": "fast_food",
    pizzeria: "restaurant",
    brasserie: "restaurant",
    kebab: "fast_food",
    bureau: "office",
    clinique: "clinic",
    kiosque: "kiosk",
    "bureau de poste": "post_office",
    notaire: "office",
    avocat: "office",
    comptable: "office",
    expert: "office",
  };

  // shopMap : catégories OSM de type shop= (commerces)
  const shopMap: Record<string, string> = {
    boulangerie: "bakery",
    bakery: "bakery",
    coiffeur: "hairdresser",
    hairdresser: "hairdresser",
    coiffeuse: "hairdresser",
    barbier: "barber",
    garage: "car_repair",
    car_repair: "car_repair",
    "garagiste": "car_repair",
    "super marché": "supermarket",
    "supermarché": "supermarket",
    supermarche: "supermarket",
    supermarket: "supermarket",
    "épicerie": "convenience",
    epicerie: "convenience",
    fleuriste: "florist",
    florist: "florist",
    librairie: "books",
    books: "books",
    boucherie: "butcher",
    butcher: "butcher",
    poissonnerie: "seafood",
    fromagerie: "cheese",
    "pâtisserie": "pastry",
    patisserie: "pastry",
    confiserie: "confectionery",
    bijouterie: "jewelry",
    jewelry: "jewelry",
    "vêtements": "clothes",
    vetements: "clothes",
    clothes: "clothes",
    chaussures: "shoes",
    shoes: "shoes",
    "électronique": "electronics",
    electronique: "electronics",
    electronics: "electronics",
    informatique: "computer",
    computer: "computer",
    bricolage: "doityourself",
    jardinage: "garden_centre",
    opticien: "optician",
    optician: "optician",
    pharmacien: "pharmacy",
    pressing: "dry_cleaning",
    nettoyage: "dry_cleaning",
    laverie: "laundry",
    traiteur: "deli",
    cave: "wine",
    vin: "wine",
    tabac: "tobacco",
    presse: "newsagent",
    jouet: "toys",
    sport: "sports",
    "articles de sport": "sports",
    meuble: "furniture",
    "meubles": "furniture",
    immobilier: "estate_agent",
    "agence immobilière": "estate_agent",
    agence: "estate_agent",
    voyages: "travel_agency",
    "agence de voyage": "travel_agency",
    photo: "photo",
    photographe: "photo",
  };

  // craftMap : catégories OSM de type craft= (artisans / métiers)
  const craftMap: Record<string, string> = {
    plombier: "plumber",
    plumber: "plumber",
    plomberie: "plumber",
    "électricien": "electrician",
    electricien: "electrician",
    electricite: "electrician",
    "électricité": "electrician",
    menuisier: "joiner",
    menuiserie: "joiner",
    joiner: "joiner",
    charpentier: "carpenter",
    carpenter: "carpenter",
    peintre: "painter",
    painter: "painter",
    "maçon": "mason",
    macon: "mason",
    mason: "mason",
    maçonnerie: "mason",
    carreleur: "tiler",
    tiler: "tiler",
    "couvreur": "roofer",
    roofer: "roofer",
    isolation: "insulation",
    vitrier: "glaziery",
    serrurier: "locksmith",
    locksmith: "locksmith",
    serrurerie: "locksmith",
    chauffagiste: "hvac",
    climatisation: "hvac",
    hvac: "hvac",
    plaquiste: "drywall",
    parqueteur: "floorer",
    carrossier: "car_painter",
    "mécanicien": "mechanic",
    mecanique: "mechanic",
    boulanger: "bakery",
    boucher: "butcher",
    patissier: "pastry",
    traiteur: "confectionery",
    couturier: "tailor",
    tailleur: "tailor",
    cordonnier: "shoemaker",
    horloger: "watchmaker",
    bijoutier: "jeweller",
    tapissier: "upholsterer",
    forgeron: "blacksmith",
    blacksmith: "blacksmith",
    imprimeur: "printer",
    printer: "printer",
    "photographe": "photographer",
  };

  const q = query.toLowerCase().trim();
  const amenity = amenityMap[q];
  const shop = shopMap[q];
  const craft = craftMap[q];

  // Surround in Overpass bbox area
  const around = `(around:${radius},${lat},${lng})`;

  let nodeQuery = "";
  if (amenity) {
    nodeQuery = `
      node["amenity"="${amenity}"]${around};
      way["amenity"="${amenity}"]${around};
      relation["amenity"="${amenity}"]${around};
    `;
  } else if (shop) {
    nodeQuery = `
      node["shop"="${shop}"]${around};
      way["shop"="${shop}"]${around};
    `;
  } else if (craft) {
    nodeQuery = `
      node["craft"="${craft}"]${around};
      way["craft"="${craft}"]${around};
      node["shop"="${craft}"]${around};
      way["shop"="${craft}"]${around};
    `;
  } else {
    // Recherche générique : chercher dans name ET dans les tags métier
    // On utilise plusieurs filtres pour maximiser les résultats
    const escaped = query.replace(/"/g, '\\"');
    // Optimisation de la recherche générique pour éviter les timeouts Overpass
    nodeQuery = `
      node["name"~"${escaped}",i]${around};
      node["shop"~"${escaped}",i]${around};
      node["amenity"~"${escaped}",i]${around};
      way["name"~"${escaped}",i]${around};
      way["shop"~"${escaped}",i]${around};
      way["amenity"~"${escaped}",i]${around};
    `;
  }

  return `
    [out:json][timeout:30];
    (
      ${nodeQuery}
    );
    out center ${limit} qt;
  `;
}

function normalizeOSMResult(element: Record<string, unknown>, idx: number): Business | null {
  const tags = (element.tags as Record<string, string>) || {};

  // Extraire lat/lng (node direct ou centroïde d'un way)
  let lat: number | undefined;
  let lng: number | undefined;

  if (typeof element.lat === "number") {
    lat = element.lat;
    lng = element.lon as number;
  } else if (element.center && typeof (element.center as Record<string, unknown>)["lat"] === "number") {
    const center = element.center as { lat: number; lon: number };
    lat = center.lat;
    lng = center.lon;
  }

  const name = tags.name || tags["name:fr"] || tags["name:en"] || "";
  if (!name) return null;

  // Adresse
  const houseNumber = tags["addr:housenumber"] || "";
  const street = tags["addr:street"] || "";
  const city = tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "";
  const postalCode = tags["addr:postcode"] || undefined;
  const country = tags["addr:country"] || "FR";
  const address = [houseNumber, street].filter(Boolean).join(" ") || "—";

  // Catégorie
  const category =
    tags.amenity || tags.shop || tags.craft || tags.tourism || tags.leisure || tags.office || undefined;

  // Horaires
  const openingHours = tags.opening_hours
    ? tags.opening_hours.split(";").map((s) => s.trim())
    : undefined;

  const externalId = `osm-${element.type ?? "node"}-${element.id ?? idx}`;

  return {
    _source: "osm",
    _externalId: externalId,
    name,
    address,
    city,
    postalCode,
    country,
    phone: tags.phone || tags["contact:phone"] || undefined,
    website: tags.website || tags["contact:website"] || undefined,
    email: tags.email || tags["contact:email"] || undefined,
    category,
    lat,
    lng,
    openingHours,
    description: tags.description || undefined,
  };
}

export async function searchOSM(
  query: string,
  lat: number,
  lng: number,
  radius: number,
  maxResults: number
): Promise<Business[]> {
  try {
    const overpassQuery = buildOverpassQuery(query, lat, lng, radius, maxResults * 2);
    const encodedQuery = encodeURIComponent(overpassQuery);

    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodedQuery}`,
      {
        headers: { "User-Agent": "Servicall-CRM/3.3" },
        signal: AbortSignal.timeout(60_000), // Augmenté à 60s pour les recherches complexes
      }
    );

    if (!res.ok) {
      // Fallback sur overpass.kumi.systems si le serveur principal est surchargé
      logger.warn("[LeadExtraction] Overpass main server busy, trying fallback...");
      const fallback = await fetch(
        `https://overpass.kumi.systems/api/interpreter?data=${encodedQuery}`,
        {
          headers: { "User-Agent": "Servicall-CRM/3.3" },
          signal: AbortSignal.timeout(30_000),
        }
      );
      if (!fallback.ok) throw new Error(`Overpass API error: ${res.status}`);
      const data = (await fallback.json()) as { elements: Record<string, unknown>[] };
      return (data.elements || [])
        .map((el, i) => normalizeOSMResult(el, i))
        .filter((b): b is Business => b !== null)
        .slice(0, maxResults);
    }

    const data = (await res.json()) as { elements: Record<string, unknown>[] };
    return (data.elements || [])
      .map((el, i) => normalizeOSMResult(el, i))
      .filter((b): b is Business => b !== null)
      .slice(0, maxResults);
  } catch (err) {
    logger.error("[LeadExtraction] OSM search error", { err });
    throw err;
  }
}

// ── Provider 2 : Google Maps Places API ──────────────────────────────────────

export async function searchGoogle(
  query: string,
  lat: number,
  lng: number,
  radius: number,
  maxResults: number,
  apiKey: string
): Promise<Business[]> {
  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", query);
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(Math.min(radius, 50000)));
    url.searchParams.set("language", "fr");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`Google Places API error: ${res.status}`);

    const data = (await res.json()) as {
      status: string;
      error_message?: string;
      results: Array<{
        place_id: string;
        name: string;
        formatted_address: string;
        geometry: { location: { lat: number; lng: number } };
        rating?: number;
        user_ratings_total?: number;
        types?: string[];
        business_status?: string;
      }>;
    };

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places: ${data.status} — ${data.error_message ?? ""}`);
    }

    const results = (data.results || []).slice(0, maxResults);

    // Pour chaque résultat, on pourrait aller chercher les détails (phone, website)
    // mais cela multiplierait les appels. On le fait pour les 5 premiers seulement.
    const enriched = await Promise.all(
      results.map(async (place, idx) => {
        let phone: string | undefined;
        let website: string | undefined;

        if (idx < 5) {
          try {
            const detailUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
            detailUrl.searchParams.set("place_id", place.place_id);
            detailUrl.searchParams.set("fields", "formatted_phone_number,website,opening_hours");
            detailUrl.searchParams.set("key", apiKey);
            const detailRes = await fetch(detailUrl.toString(), { signal: AbortSignal.timeout(8_000) });
            if (detailRes.ok) {
              const detail = (await detailRes.json()) as {
                result?: { formatted_phone_number?: string; website?: string };
              };
              phone = detail.result?.formatted_phone_number;
              website = detail.result?.website;
            }
          } catch {
            // détails non critiques, on ignore
          }
        }

        // Parse adresse
        const addressParts = place.formatted_address.split(",");
        const city = addressParts[addressParts.length - 2]?.trim() || "";
        const country = addressParts[addressParts.length - 1]?.trim() || "France";
        const address = addressParts.slice(0, -2).join(",").trim() || place.formatted_address;

        return {
          _source: "google" as const,
          _externalId: `google-${place.place_id}`,
          name: place.name,
          address,
          city,
          country,
          phone,
          website,
          category: place.types?.[0]?.replace(/_/g, " "),
          rating: place.rating,
          reviewCount: place.user_ratings_total,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        } satisfies Business;
      })
    );

    return enriched;
  } catch (err) {
    logger.error("[LeadExtraction] Google Places error", { err });
    throw err;
  }
}

// ── Provider 3 : Pages Jaunes ─────────────────────────────────────────────────
// L'API Pages Jaunes officielle (developer.pagesjaunes.fr) suit ce schéma.
// En l'absence de clé valide, on renvoie un tableau vide avec message d'erreur.

export async function searchPagesJaunes(
  query: string,
  location: string,
  maxResults: number,
  apiKey: string
): Promise<Business[]> {
  try {
    // API Pages Jaunes Pro
    const url = new URL("https://api.pagesjaunes.fr/v1/pros");
    url.searchParams.set("what", query);
    url.searchParams.set("where", location);
    url.searchParams.set("count", String(Math.min(maxResults, 50)));

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error("Clé Pages Jaunes invalide ou expirée");
    }
    if (!res.ok) throw new Error(`Pages Jaunes API error: ${res.status}`);

    const data = (await res.json()) as {
      search_results?: {
        listings?: Array<{
          id: string;
          name: string;
          address: {
            street?: string;
            city?: string;
            zipcode?: string;
          };
          phones?: Array<{ number: string }>;
          urls?: Array<{ href: string }>;
          activity?: { label: string };
        }>;
      };
    };

    const listings = data.search_results?.listings || [];

    return listings.map((item): Business => ({
      _source: "pagesjaunes",
      _externalId: `pj-${item.id}`,
      name: item.name,
      address: item.address?.street || "—",
      city: item.address?.city || "",
      postalCode: item.address?.zipcode,
      country: "France",
      phone: item.phones?.[0]?.number,
      website: item.urls?.[0]?.href,
      category: item.activity?.label,
    }));
  } catch (err) {
    logger.error("[LeadExtraction] Pages Jaunes error", { err });
    throw err;
  }
}

// ── Sélection automatique du provider ─────────────────────────────────────────

async function resolveProvider(
  requested: SearchParams["provider"],
  tenantId: number
): Promise<"osm" | "google" | "pagesjaunes"> {
  if (requested !== "auto") return requested;

  // Auto : Google si clé dispo, sinon OSM
  const googleKey = await getAPIKey(tenantId, "google_maps").catch(() => null);
  if (googleKey) return "google";
  return "osm";
}

// ── Point d'entrée principal ──────────────────────────────────────────────────

export async function searchBusinesses(params: SearchParams): Promise<SearchResult> {
  const { query, location, radius, maxResults, tenantId } = params;

  // 1. Géocoder la localisation
  const geo = await geocodeLocation(location);
  if (!geo) {
    return {
      businesses: [],
      total: 0,
      provider: "osm",
      error: `Impossible de localiser "${location}". Essayez une ville plus précise.`,
    };
  }

  const provider = await resolveProvider(params.provider, tenantId);
  let businesses: Business[] = [];
  let errorMsg: string | undefined;

  try {
    if (provider === "osm") {
      businesses = await searchOSM(query, geo.lat, geo.lng, radius, maxResults);
    } else if (provider === "google") {
      const apiKey = await getAPIKey(tenantId, "google_maps");
      if (!apiKey) throw new Error("Clé Google Maps non configurée. Ajoutez-la dans Clés API.");
      businesses = await searchGoogle(query, geo.lat, geo.lng, radius, maxResults, apiKey);
    } else if (provider === "pagesjaunes") {
      const apiKey = await getAPIKey(tenantId, "pages_jaunes");
      if (!apiKey) throw new Error("Clé Pages Jaunes non configurée. Ajoutez-la dans Clés API.");
      businesses = await searchPagesJaunes(query, location, maxResults, apiKey);
    }
  } catch (err) {
    logger.error("[LeadExtraction] Search error", { err, provider, query, location });
    errorMsg = err instanceof Error ? err.message : String(err);

    // Fallback automatique sur OSM si le provider payant échoue
    if (provider !== "osm") {
      logger.info("[LeadExtraction] Falling back to OSM");
      try {
        businesses = await searchOSM(query, geo.lat, geo.lng, radius, maxResults);
        errorMsg = `${provider} indisponible (${errorMsg}). Résultats OSM affichés.`;
      } catch {
        businesses = [];
      }
    }
  }

  // 2. Enregistrer l'extraction dans l'historique
  let extractionId: number | undefined;
  try {
    const [inserted] = await db
      .insert(leadExtractions)
      .values({
        tenantId,
        query,
        location,
        provider: businesses.length > 0 ? (businesses[0]?._source ?? provider) : provider,
        radius,
        resultsCount: businesses.length,
        importedCount: 0,
        status: errorMsg && businesses.length === 0 ? "error" : "done",
        errorMessage: errorMsg,
        resultsSnapshot: businesses as unknown as Record<string, unknown>[],
      })
      .returning({ id: leadExtractions.id });
    extractionId = inserted?.id;
  } catch (err) {
    logger.warn("[LeadExtraction] Could not save extraction history", { err });
  }

  return {
    businesses,
    total: businesses.length,
    provider: businesses[0]?._source ?? provider,
    extractionId,
    error: errorMsg,
  };
}

// ── Import dans les prospects CRM ─────────────────────────────────────────────

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
}

export async function importBusinessesAsProspects(
  businesses: Business[],
  tenantId: number,
  extractionId?: number
): Promise<ImportResult> {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const biz of businesses) {
    try {
      // Déduplication par téléphone (si dispo)
      if (biz.phone) {
        const existing = await db
          .select({ id: prospects.id })
          .from(prospects)
          .where(and(eq(prospects.tenantId, tenantId), eq(prospects.phone, biz.phone)))
          .limit(1);

        if (existing.length > 0) {
          skipped++;
          continue;
        }
      }

      // Diviser name en firstName/lastName (pour les businesses, on met le nom complet en company)
      const nameParts = biz.name.split(" ");
      const firstName = nameParts[0] ?? biz.name;
      const lastName = nameParts.slice(1).join(" ") || undefined;

      await db.insert(prospects).values({
        tenantId,
        firstName,
        lastName,
        company: biz.name,
        phone: biz.phone,
        email: biz.email,
        source: `lead-extraction-${biz._source}`,
        notes: [
          biz.address && biz.city ? `📍 ${biz.address}, ${biz.city}` : null,
          biz.category ? `🏷️ ${biz.category}` : null,
          biz.website ? `🌐 ${biz.website}` : null,
          biz.rating != null ? `⭐ ${biz.rating.toFixed(1)}${biz.reviewCount ? ` (${biz.reviewCount} avis)` : ""}` : null,
          biz.openingHours?.length ? `🕒 ${biz.openingHours[0]}` : null,
        ].filter(Boolean).join("\n") || undefined,
        metadata: {
          leadSource: biz._source,
          externalId: biz._externalId,
          extractionId,
          lat: biz.lat,
          lng: biz.lng,
          postalCode: biz.postalCode,
          country: biz.country,
          openingHours: biz.openingHours,
          rating: biz.rating,
          reviewCount: biz.reviewCount,
        },
        status: "new",
        priority: "medium",
      });

      imported++;
    } catch (err) {
      logger.error("[LeadExtraction] Import error for business", { err, biz: biz.name });
      errors++;
    }
  }

  // Mettre à jour le compteur importedCount dans l'historique
  if (extractionId && imported > 0) {
    try {
      await db
        .update(leadExtractions)
        .set({ importedCount: imported, updatedAt: new Date().toISOString() as any })
        .where(eq(leadExtractions.id, extractionId));
    } catch { /* non critique */ }
  }

  return { imported, skipped, errors };
}
