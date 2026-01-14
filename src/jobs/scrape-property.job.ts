import puppeteer from "puppeteer";

export async function scrapePropertyList(maxPages = 1) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  let allProperties = [];

  for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
    const url = `https://www.99acres.com/new-launch-projects-in-india-ffid-page-${currentPage}`;
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector(".NPSRP__contentWrap", {
      timeout: 10000,
    });

    const properties = await page.evaluate(() => {
      const cards = document.querySelectorAll(
        ".NPSRP__npsrpTuplesContainer > div"
      );

      return Array.from(cards).map((card) => {
        const getText = (sel: any) =>
          card.querySelector(sel)?.textContent?.trim() || "";

        return {
          title: getText(".NpsrpTuple__npsrpHead"),
          amminities: getText(".NpsrpTuple__subHead"),
          price: getText(".NpsrpTuple__dispPrice"),
          decscription: getText(".NpsrpTuple__bDesc"),
          link: card.querySelector("a")?.href || "",
          image: (() => {
            const box = card.querySelector(".NpsrpTuple__npsrpImgBox");
            if (!box) return "";

            const source = box.querySelector("source");
            if (source?.getAttribute("srcset")) {
              return source.getAttribute("srcset");
            }

            const lazyImg = box.querySelector("img");

            if (lazyImg) {
              return (
                lazyImg.getAttribute("data-src") ||
                lazyImg.getAttribute("data-original") ||
                lazyImg.getAttribute("src") ||
                ""
              );
            }

            return "";
          })(),
        };
      });
    });

    allProperties.push(...properties);
  }

  await browser.close();

  return allProperties;
}
