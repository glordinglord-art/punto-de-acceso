import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Setup Supabase Client for the new project
const newSupabaseUrl = process.env.SUPABASE_URL;
const newSupabaseKey = process.env.SUPABASE_KEY;

if (!newSupabaseUrl || !newSupabaseKey) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_KEY is missing in the .env file.');
  process.exit(1);
}

const newSupabase = createClient(newSupabaseUrl, newSupabaseKey);

// The old project reference we want to migrate away from
const oldProjectRef = 'xyotivugpxjjfzbhpeyr';
const newProjectRef = 'pottwfleugpuaymtlpwk';

// Cache for bucket existence checks to avoid redundant API requests
const checkedBuckets = new Set<string>();

// Helper to extract bucket and path from URL
// Example: https://xyotivugpxjjfzbhpeyr.supabase.co/storage/v1/object/public/meal-images/171562919-pic.jpg
function parseSupabaseUrl(url: string) {
  if (!url || !url.includes(oldProjectRef)) return null;
  
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/storage/v1/object/public/');
    if (pathParts.length < 2) return null;
    
    const relativePath = pathParts[1]; // e.g. "meal-images/171562919-pic.jpg"
    const firstSlash = relativePath.indexOf('/');
    if (firstSlash === -1) return null;
    
    const bucket = relativePath.substring(0, firstSlash);
    const filePath = relativePath.substring(firstSlash + 1);
    
    return { bucket, filePath };
  } catch (err) {
    return null;
  }
}

async function ensureBucketExists(bucketName: string) {
  if (checkedBuckets.has(bucketName)) {
    return true;
  }
  
  console.log(`Checking if bucket "${bucketName}" exists in new Supabase...`);
  const { data: buckets, error: listError } = await newSupabase.storage.listBuckets();
  
  if (listError) {
    console.error(`Error listing buckets: ${listError.message}`);
    return false;
  }
  
  const exists = buckets.some(b => b.name === bucketName);
  if (!exists) {
    console.log(`Bucket "${bucketName}" not found. Creating it as PUBLIC...`);
    const { error: createError } = await newSupabase.storage.createBucket(bucketName, {
      public: true,
    });
    if (createError) {
      console.error(`❌ Failed to create bucket "${bucketName}": ${createError.message}`);
      return false;
    }
    console.log(`✅ Bucket "${bucketName}" created successfully!`);
  } else {
    console.log(`✅ Bucket "${bucketName}" already exists.`);
  }
  
  checkedBuckets.add(bucketName);
  return true;
}

async function migrateFile(oldUrl: string): Promise<string | null> {
  const parsed = parseSupabaseUrl(oldUrl);
  if (!parsed) return null;

  const { bucket, filePath } = parsed;

  // 1. Ensure bucket exists in new project (uses in-memory cache)
  const bucketOk = await ensureBucketExists(bucket);
  if (!bucketOk) return null;

  // 2. Download from old URL (publicly)
  try {
    const res = await fetch(oldUrl);
    if (!res.ok) {
      console.error(`❌ Failed to download from old URL (status: ${res.status}): ${oldUrl}`);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    // 3. Upload to new Supabase project
    const { error: uploadError } = await newSupabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`❌ Upload error for ${filePath}: ${uploadError.message}`);
      return null;
    }

    // 4. Get new public URL
    const { data } = newSupabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err: any) {
    console.error(`❌ Exception migrating file ${filePath}: ${err.message || err}`);
    return null;
  }
}

// Concurrency pool helper
async function runWithConcurrency<T, R>(limit: number, items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: Promise<R>[] = [];
  const executing: Promise<any>[] = [];
  
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    
    if (limit <= items.length) {
      const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

async function main() {
  console.log('🚀 Starting Optimized Image Migration Script...');
  console.log(`Old Project Ref: ${oldProjectRef}`);
  console.log(`New Project Ref: ${newProjectRef}`);

  let mealsMigrated = 0;
  let usersMigrated = 0;

  // --- 1. Migrate Meal images ---
  console.log('\n--- Fetching all meals from database... ---');
  const allMeals = await prisma.meal.findMany();
  
  // Filter meals in memory
  const meals = allMeals.filter(meal => 
    (meal.imageUrl && meal.imageUrl.includes(oldProjectRef)) ||
    (meal.imageUrls && meal.imageUrls.some(url => url.includes(oldProjectRef)))
  );

  console.log(`Found ${meals.length} meals that still have old image references.`);

  if (meals.length > 0) {
    console.log(`Migrating meal images with a concurrency limit of 15...`);
    
    let processed = 0;
    
    await runWithConcurrency(15, meals, async (meal) => {
      let updatedImageUrl = meal.imageUrl;
      let updatedImageUrls = [...meal.imageUrls];
      let needsUpdate = false;

      // Single image
      if (meal.imageUrl && meal.imageUrl.includes(oldProjectRef)) {
        const newUrl = await migrateFile(meal.imageUrl);
        if (newUrl) {
          updatedImageUrl = newUrl;
          needsUpdate = true;
        }
      }

      // Array of images
      for (let i = 0; i < meal.imageUrls.length; i++) {
        const url = meal.imageUrls[i];
        if (url.includes(oldProjectRef)) {
          const newUrl = await migrateFile(url);
          if (newUrl) {
            updatedImageUrls[i] = newUrl;
            needsUpdate = true;
          }
        }
      }

      if (needsUpdate) {
        await prisma.meal.update({
          where: { id: meal.id },
          data: {
            imageUrl: updatedImageUrl,
            imageUrls: updatedImageUrls,
          }
        });
        mealsMigrated++;
      }
      
      processed++;
      if (processed % 20 === 0 || processed === meals.length) {
        console.log(`Progress: ${processed}/${meals.length} meals processed...`);
      }
    });
  }

  // --- 2. Migrate User Avatars ---
  console.log('\n--- Fetching users from database... ---');
  const allUsers = await prisma.user.findMany();
  const users = allUsers.filter(user => user.avatarUrl && user.avatarUrl.includes(oldProjectRef));

  console.log(`Found ${users.length} users with old avatar references.`);

  if (users.length > 0) {
    await runWithConcurrency(10, users, async (user) => {
      if (user.avatarUrl && user.avatarUrl.includes(oldProjectRef)) {
        const newUrl = await migrateFile(user.avatarUrl);
        if (newUrl) {
          await prisma.user.update({
            where: { id: user.id },
            data: { avatarUrl: newUrl }
          });
          usersMigrated++;
        }
      }
    });
  }

  console.log('\n========================================');
  console.log(`🎉 Migration Completed!`);
  console.log(`Meals updated: ${mealsMigrated}`);
  console.log(`Users updated: ${usersMigrated}`);
  console.log('========================================');
}

main()
  .catch(err => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
