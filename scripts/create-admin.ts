import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main() {
  const newPassword = "ChangeMe!2026";

  const hash = await bcrypt.hash(newPassword, 10);

  await db
    .update(usersTable)
    .set({
      passwordHash: hash,
      role: "admin",
    })
    .where(eq(usersTable.username, "admin"));

  console.log("✅ Admin password reset to ChangeMe!2026");
}

main().catch(console.error);