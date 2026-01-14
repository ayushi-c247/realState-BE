import cron from "node-cron";
import { scrapePropertyList } from "./scrape-property.job";
import { fetchPropertyDetails } from "./scrape-property-detail.job";
import { savePropertyList } from "./savePropertyList";

export function registerCrons() {
  // every 10 minutes, on the :00, :10, :20, :30, :40, :50 marks
  cron.schedule(
    "*/20 * * * *",
    async () => {
      try {
        const allProperties = await scrapePropertyList(1);
        if (allProperties.length > 0) {
          await savePropertyList(allProperties);
          await fetchPropertyDetails();
        }
      } catch (err) {
        console.error("[CRON] completeEndedEvents failed:", err);
      }
    },
    { timezone: "UTC" }
  );

  console.log("[CRON] registered: completeEndedEvents */10 * * * * (UTC)");
}
