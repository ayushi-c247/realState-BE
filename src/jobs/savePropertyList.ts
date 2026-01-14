import {
  PrismaClient,
  PropertyListStatus,
  VisibilityStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

export async function savePropertyList(properties: any[]) {
  const validProperties = properties.filter(
    (pro) => pro.title && pro.title.trim() !== ""
  );

  for (const prop of validProperties) {
    try {
      await prisma.propertyList.upsert({
        where: { title: prop.title }, // unique key
        update: {
          price: prop?.price,
          link: prop?.link,
          image: prop?.image,
          description: prop?.decscription,
          updated_at: new Date(),
        },
        create: {
          title: prop.title,
          price: prop?.price,
          link: prop?.link,
          image: prop?.image,
          description: prop?.decscription,
          scrape_status: PropertyListStatus.PENDING,
          visibility_status: VisibilityStatus.ACTIVE,
        },
      });
    } catch (err) {
      console.error("Error upserting property:", prop.title, err);
    }
  }
}
