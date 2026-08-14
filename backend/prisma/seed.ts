import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const services = [
    { name: "Haircut", duration: 45 },
    { name: "Hair Coloring", duration: 120 },
    { name: "Manicure", duration: 60 },
    { name: "Pedicure", duration: 60 },
    { name: "Facial Treatment", duration: 90 },
  ];

  const existing = await prisma.service.count();

  if (existing === 0) {
    await prisma.service.createMany({ data: services });
    console.log(`Seeded ${services.length} services.`);
  } else {
    console.log(`Skipped seeding: ${existing} services already exist.`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
