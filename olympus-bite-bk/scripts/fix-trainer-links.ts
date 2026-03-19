/**
 * fix-trainer-links.ts
 *
 * Fixes clients whose trainer_id is NULL by looking up their invitation code.
 *
 * Usage:
 *   DRY RUN (safe, no changes):  npx ts-node scripts/fix-trainer-links.ts
 *   APPLY changes:               npx ts-node scripts/fix-trainer-links.ts --apply
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log(APPLY ? '⚠️  MODE: APPLY (making real changes)' : '🔍 MODE: DRY RUN (no changes will be made)');
  console.log('═'.repeat(60) + '\n');

  // 1. Find all clients with trainer_id = null
  const orphanClients = await prisma.user.findMany({
    where: {
      role: 'client',
      trainerId: null,
    },
    select: { id: true, name: true, email: true },
  });

  if (orphanClients.length === 0) {
    console.log('✅ No clients with trainer_id = null found. Nothing to fix.');
    return;
  }

  console.log(`Found ${orphanClients.length} client(s) with trainer_id = null:\n`);

  const fixes: { clientId: string; clientName: string; clientEmail: string; trainerId: string; trainerName: string }[] = [];
  const noCode: typeof orphanClients = [];

  for (const client of orphanClients) {
    // Find the invitation code they used
    const code = await prisma.invitationCode.findFirst({
      where: { usedByUserId: client.id, isUsed: true },
      include: { trainer: { select: { id: true, name: true, email: true } } },
    });

    if (!code) {
      noCode.push(client);
      console.log(`  ❓ ${client.name} (${client.email}) — No invitation code found`);
    } else {
      fixes.push({
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        trainerId: code.trainer.id,
        trainerName: code.trainer.name,
      });
      console.log(`  🔗 ${client.name} (${client.email})`);
      console.log(`     → trainer: ${code.trainer.name} (${code.trainer.email})`);
    }
  }

  console.log();

  if (fixes.length === 0) {
    console.log('⚠️  No fixable clients found (no matching invitation codes).');
    return;
  }

  if (!APPLY) {
    console.log(`\n📋 WOULD UPDATE ${fixes.length} client(s) as shown above.`);
    console.log('\nTo apply: npx ts-node scripts/fix-trainer-links.ts --apply\n');
    return;
  }

  // APPLY changes in a transaction
  console.log(`Applying ${fixes.length} updates...\n`);

  await prisma.$transaction(async (tx) => {
    for (const fix of fixes) {
      await tx.user.update({
        where: { id: fix.clientId },
        data: { trainerId: fix.trainerId },
      });
      console.log(`  ✅ Updated: ${fix.clientName} → ${fix.trainerName}`);
    }
  });

  console.log('\n✅ All updates applied successfully!\n');

  if (noCode.length > 0) {
    console.log(`⚠️  ${noCode.length} client(s) could NOT be fixed (no invitation code record):`);
    noCode.forEach((c) => console.log(`  - ${c.name} (${c.email})`));
    console.log('\nThese clients need to be fixed manually.');
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
