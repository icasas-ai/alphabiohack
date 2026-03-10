import { main as seedMain } from "./seeds/seed";

seedMain()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error durante el seed:", error);
    process.exit(1);
  });
