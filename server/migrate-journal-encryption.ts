import { db } from "./db";
import { journalEntries } from "@shared/schema";
import { encrypt, isEncrypted } from "./encryption";
import { eq } from "drizzle-orm";

async function migrateJournalEntries() {
  console.log("Starting journal entries encryption migration...");
  
  const entries = await db.select().from(journalEntries);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const entry of entries) {
    if (isEncrypted(entry.content)) {
      console.log(`Skipping already encrypted entry: ${entry.id}`);
      skipped++;
      continue;
    }
    
    try {
      const encryptedContent = encrypt(entry.content);
      
      await db
        .update(journalEntries)
        .set({ content: encryptedContent, updatedAt: new Date() })
        .where(eq(journalEntries.id, entry.id));
      
      console.log(`Migrated entry: ${entry.id}`);
      migrated++;
    } catch (error) {
      console.error(`Failed to migrate entry ${entry.id}:`, error);
    }
  }
  
  console.log(`\nMigration complete!`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Skipped (already encrypted): ${skipped}`);
  console.log(`  Total entries: ${entries.length}`);
  
  process.exit(0);
}

migrateJournalEntries().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
