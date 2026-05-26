import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const usersCount = await prisma.user.count();
  const mealsCount = await prisma.meal.count();
  const routinesCount = await prisma.routine.count();
  
  console.log('Database verification:');
  console.log(`- Users count: ${usersCount}`);
  console.log(`- Meals count: ${mealsCount}`);
  console.log(`- Routines count: ${routinesCount}`);
  
  if (mealsCount > 0) {
    const sampleMeals = await prisma.meal.findMany({
      take: 5,
      select: {
        imageUrl: true,
        imageUrls: true,
      }
    });
    console.log('\nSample meals imageUrls:', JSON.stringify(sampleMeals, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
