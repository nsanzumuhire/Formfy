import { db } from "../server/db";
import { forms } from "@shared/schema";
import { createHash } from "crypto";

function generateFormChecksum(formData: { name: string; description?: string | null; schema: any }): string {
  const checksumData = {
    name: formData.name,
    description: formData.description || '',
    schema: JSON.stringify(formData.schema, Object.keys(formData.schema).sort())
  };
  
  const dataString = JSON.stringify(checksumData, Object.keys(checksumData).sort());
  return createHash('sha256').update(dataString).digest('hex');
}

async function addChecksumColumn() {
  try {
    console.log('Starting checksum migration...');
    
    // First add the column with default value
    await db.execute(`ALTER TABLE forms ADD COLUMN IF NOT EXISTS checksum VARCHAR(64) DEFAULT ''`);
    console.log('Added checksum column');
    
    // Get all existing forms
    const existingForms = await db.select().from(forms);
    console.log(`Found ${existingForms.length} existing forms to update`);
    
    // Update each form with its checksum
    for (const form of existingForms) {
      const checksum = generateFormChecksum({
        name: form.name,
        description: form.description,
        schema: form.schema
      });
      
      await db.execute(`UPDATE forms SET checksum = '${checksum}' WHERE id = '${form.id}'`);
      console.log(`Updated checksum for form: ${form.name}`);
    }
    
    // Now make the column NOT NULL
    await db.execute(`ALTER TABLE forms ALTER COLUMN checksum SET NOT NULL`);
    console.log('Made checksum column NOT NULL');
    
    console.log('✅ Checksum migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

addChecksumColumn().catch(console.error);