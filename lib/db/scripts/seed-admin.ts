import bcrypt from "bcryptjs";
import { db, usersTable } from "../src/index";
import { eq } from "drizzle-orm";

async function seed() {
  const username = "admin";

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("ChangeMe!2026", 10);

  await db.insert(usersTable).values({
    username,
    passwordHash,
    role: "admin",
  });

  console.log("Admin created");
  process.exit(0);
}

seed();