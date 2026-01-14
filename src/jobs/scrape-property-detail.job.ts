import puppeteer from "puppeteer";

import { PrismaClient, PropertyListStatus } from "@prisma/client"; // enum for status

const prisma = new PrismaClient();
/**
 * Fetch full property details and store in DB
 * @param pendingProperties Array of properties from property_list table
 */
export async function fetchPropertyDetails() {
  const pendingProperties = await prisma.propertyList.findMany({
    where: { scrape_status: PropertyListStatus.PENDING },
    take: 10, // batch size
  });

  if (pendingProperties.length === 0) {
    console.log("No pending properties found");
    return;
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  for (const property of pendingProperties) {
    if (!property.link) {
      continue;
    }

    try {
      await page.goto(property.link, { waitUntil: "networkidle2" });
      await page.waitForSelector(".NLStyle__newLaunchTopWrapper", {
        timeout: 12000,
      });

      const details = await page.evaluate(() => {
        const descriptionContainer = document.querySelector(
          ".MoreAboutProject___99aboutProjCont"
        );

        let description = "";

        if (descriptionContainer) {
          const visible =
            descriptionContainer
              .querySelector("span > p")
              ?.textContent?.trim() || "";

          const hidden =
            descriptionContainer
              .querySelector(".ReadMoreLess__hide")
              ?.textContent?.trim() || "";

          description = (visible + " " + hidden)
            .replace(/\s+/g, " ")
            .replace(/more$/i, "")
            .trim();
        }

        const typeElement = document.querySelector(
          ".NLProjectInfoStyle__genralInfoWrap [qa-id='xidSabConfigLabel']"
        );
        const propertyType = typeElement?.textContent?.trim() || "";

        // Get price (e.g., "₹3.75 Cr")
        const priceElement = document.querySelector(
          ".NLProjectInfoStyle__genralInfoWrap [qa-id='xidSabPriceLabel']"
        );
        const rawPrice =
          priceElement?.textContent?.replace(/\s+/g, "").trim() || "";

        // --- Process price ---
        let priceMin: number | null = null;
        let priceMax: number | null = null;

        if (rawPrice) {
          // Remove currency symbol
          const cleaned = rawPrice.replace(/₹/g, "");

          // Check if it's a range
          if (cleaned.includes("-")) {
            const [minStr, maxStr] = cleaned.split("-");
            priceMin = parseFloat(minStr.replace(/Cr/gi, ""));
            priceMax = parseFloat(maxStr.replace(/Cr/gi, ""));
          } else {
            // Single value
            const value = parseFloat(cleaned.replace(/Cr/gi, ""));
            priceMin = value;
            priceMax = value;
          }
        }
        const amenities = Array.from(
          document.querySelectorAll(
            ".UniquesFacilities__xidFacilitiesCard div > div"
          )
        ).map((el) => el.textContent.trim());
        const images = Array.from(
          document.querySelectorAll(
            '[qa-id="xidSabMedia"] img[qa-id="xidSabMediaImg"]'
          )
        ).map((img) => img.getAttribute("src"));
        const titleElement = document.querySelector("h1.ProjectInfo__imgBox1");
        const title = titleElement?.childNodes[0]?.textContent?.trim() || "";
        const location =
          titleElement?.querySelector("span")?.textContent?.trim() || "";
        const titleUrl =
          document
            .querySelector(".ProjectInfo__imgBox img")
            ?.getAttribute("src")
            ?.trim() || "";
        let landmarks = "";

        const container = document.querySelector(
          ".UniquesFacilities__facilitiesDescTop .descHolder__descText"
        );

        if (container) {
          // visible part
          const visible =
            container.querySelector("span > p")?.textContent?.trim() || "";

          // hidden … content
          const hidden1 =
            container
              .querySelector(".ReadMoreLess__hide")
              ?.nextSibling?.textContent?.trim() || "";

          // remaining span text content
          const remaining =
            container.lastElementChild?.textContent?.trim() || "";

          landmarks = [visible, hidden1, remaining]
            .join(" ")
            .replace(/\s+/g, " ")
            .replace(/\.\s*\./g, ".") // fix ".."
            .trim();
        }
        const amenitiesContainer = document.querySelector(
          ".UniquesFacilities__facilitiesDescTop .descHolder__descText"
        );
        let amenitiesDescription = "";
        if (amenitiesContainer) {
          const fullText = Array.from(
            amenitiesContainer.querySelectorAll("span, p")
          )
            .map((el) => el.textContent?.trim() || "")
            .join(" ");
          amenitiesDescription = fullText
            .replace(/\s+/g, " ")
            .replace(/Read more|more$/gi, "")
            .trim();
        }
        return {
          description,
          amenities,
          images,
          price: rawPrice,
          priceMax,
          priceMin,
          propertyType,
          title,
          titleUrl,
          location,
          landmarks,
          amenitiesDescription,
        };
      });

      // save details table
      await prisma.propertySpecification.create({
        data: {
          property_id: property.id,
          property_type: details.propertyType,
          title: details.title,
          location: details.location,
          landmarks: details.landmarks,
          amenities: JSON.stringify(details.amenities), // or store as Json
          price_min: details.priceMin,
          price_max: details.priceMax,
          title_image: details.titleUrl,
          description: details.description,
          amenities_description: details.amenitiesDescription,
          images: details.images,
        },
      });

      // mark processed
      await prisma.propertyList.update({
        where: { id: property.id },
        data: {
          scrape_status: PropertyListStatus.PROCESSED,
          retry_count: 0,
        },
      });

      console.log("✔processed:", property.id);
    } catch (err) {
      console.error("failed:", property.id, property.link);
      // increase retry count and set FAILED
      await prisma.propertyList.update({
        where: { id: property.id },
        data: {
          retry_count: { increment: 1 },
        },
      });
    }
  }

  await browser.close();
}
