import { db } from "../server/db";
import { incidents } from "../shared/schema";
import { eq } from "drizzle-orm";
import { storage } from "../server/storage";

async function populateIncidents() {
  console.log("Starting to populate incidents...");

  try {
    // Sample incidents across Nigeria with geographic coordinates
    const sampleIncidents = [
      {
        title: "Farmer-Herder Clash in Benue",
        description: "Violent clash between farming communities and herders leading to destruction of crops and livestock",
        location: "Makurdi, Benue State",
        region: "North Central",
        severity: "high",
        status: "active",
        reportedBy: 1, // Admin user
        category: "conflict",
        reportedAt: new Date(),
        coordinates: JSON.stringify({
          lat: 7.7322,
          lng: 8.5391,
          address: "Makurdi, Benue State"
        }),
        impactedPopulation: 1200,
        mediaUrls: [],
        verificationStatus: "verified"
      },
      {
        title: "Flooding in Lagos",
        description: "Heavy rainfall has caused severe flooding in several neighborhoods, displacing hundreds of families",
        location: "Lekki, Lagos State",
        region: "South West",
        severity: "high",
        status: "active",
        reportedBy: 1,
        category: "natural_disaster",
        reportedAt: new Date(),
        coordinates: JSON.stringify({
          lat: 6.4552,
          lng: 3.4248,
          address: "Lekki, Lagos State"
        }),
        impactedPopulation: 5000,
        mediaUrls: [],
        verificationStatus: "verified"
      },
      {
        title: "Market Dispute in Kano",
        description: "Tension in Sabon Gari market following disagreement between trader groups over space allocation",
        location: "Sabon Gari, Kano",
        region: "North West",
        severity: "medium",
        status: "monitoring",
        reportedBy: 1,
        category: "economic",
        reportedAt: new Date(),
        coordinates: JSON.stringify({
          lat: 12.0022,
          lng: 8.5920,
          address: "Sabon Gari, Kano"
        }),
        impactedPopulation: 300,
        mediaUrls: [],
        verificationStatus: "verified"
      },
      {
        title: "Political Rally Clash in Enugu",
        description: "Supporters of opposing political parties clashed during campaign rallies, resulting in injuries",
        location: "Enugu Urban",
        region: "South East",
        severity: "medium",
        status: "active",
        reportedBy: 1,
        category: "political",
        reportedAt: new Date(),
        coordinates: JSON.stringify({
          lat: 6.4390,
          lng: 7.5010,
          address: "Enugu Urban"
        }),
        impactedPopulation: 450,
        mediaUrls: [],
        verificationStatus: "verified"
      },
      {
        title: "Oil Spill in Rivers",
        description: "Pipeline vandalism has resulted in oil spillage affecting farmlands and fishing waters",
        location: "Ogoni, Rivers State",
        region: "South South",
        severity: "critical",
        status: "active",
        reportedBy: 1,
        category: "environment",
        reportedAt: new Date(),
        coordinates: JSON.stringify({
          lat: 4.7500,
          lng: 7.0134,
          address: "Ogoni, Rivers State"
        }),
        impactedPopulation: 3200,
        mediaUrls: [],
        verificationStatus: "verified"
      },
      {
        title: "Displacement due to Insurgency",
        description: "Hundreds of families displaced following insurgent attacks on border communities",
        location: "Maiduguri, Borno State",
        region: "North East",
        severity: "critical",
        status: "active",
        reportedBy: 1,
        category: "conflict",
        reportedAt: new Date(),
        coordinates: JSON.stringify({
          lat: 11.8311,
          lng: 13.1510,
          address: "Maiduguri, Borno State"
        }),
        impactedPopulation: 8500,
        mediaUrls: [],
        verificationStatus: "verified"
      },
      {
        title: "Religious Tension in Kaduna",
        description: "Rising tensions between religious groups following controversial statements by a local leader",
        location: "Kaduna Central",
        region: "North West",
        severity: "high",
        status: "monitoring",
        reportedBy: 1,
        category: "conflict",
        reportedAt: new Date(),
        coordinates: JSON.stringify({
          lat: 10.5222,
          lng: 7.4178,
          address: "Kaduna Central"
        }),
        impactedPopulation: 2000,
        mediaUrls: [],
        verificationStatus: "verified"
      },
      {
        title: "Youth Protest in Abuja",
        description: "Peaceful protest by youth groups demanding economic reforms and good governance",
        location: "Central Business District, Abuja",
        region: "Federal Capital Territory",
        severity: "low",
        status: "monitoring",
        reportedBy: 1,
        category: "political",
        reportedAt: new Date(),
        coordinates: JSON.stringify({
          lat: 9.0579,
          lng: 7.4951,
          address: "Central Business District, Abuja"
        }),
        impactedPopulation: 1500,
        mediaUrls: [],
        verificationStatus: "verified"
      },
      {
        title: "Communal Land Dispute in Oyo",
        description: "Long-standing land dispute between neighboring communities escalated to violent confrontation",
        location: "Ibadan, Oyo State",
        region: "South West",
        severity: "medium",
        status: "active",
        reportedBy: 1,
        category: "conflict",
        reportedAt: new Date(),
        coordinates: JSON.stringify({
          lat: 7.3775,
          lng: 3.9470,
          address: "Ibadan, Oyo State"
        }),
        impactedPopulation: 750,
        mediaUrls: [],
        verificationStatus: "verified"
      },
      {
        title: "School Security Threat in Sokoto",
        description: "Anonymous threats made against educational institutions leading to temporary closures",
        location: "Sokoto Metropolis",
        region: "North West",
        severity: "medium",
        status: "active",
        reportedBy: 1,
        category: "security",
        reportedAt: new Date(),
        coordinates: JSON.stringify({
          lat: 13.0622,
          lng: 5.2339,
          address: "Sokoto Metropolis"
        }),
        impactedPopulation: 3000,
        mediaUrls: [],
        verificationStatus: "verified"
      }
    ];

    // Insert the sample incidents
    let addedCount = 0;
    for (const incident of sampleIncidents) {
      try {
        // Use the storage method instead of direct database access
        // Use a simpler check to avoid db.eq error
        const existingIncidents = await storage.getIncidentsByTitle(incident.title);
        
        if (existingIncidents.length === 0) {
          await storage.createIncident(incident);
          console.log(`Added incident: ${incident.title}`);
          addedCount++;
        } else {
          console.log(`Incident already exists: ${incident.title}`);
        }
      } catch (error) {
        console.error(`Error adding incident ${incident.title}:`, error);
      }
    }
    
    console.log(`Successfully populated ${addedCount} incidents!`);
  } catch (error) {
    console.error("Error populating incidents:", error);
  }
}

populateIncidents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to run script:", error);
    process.exit(1);
  });