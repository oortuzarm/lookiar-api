import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Plans
  const plans = [
    {
      name: 'Free',
      slug: 'free',
      units: 1,
      maxViews: 100,
      priceUsd: 0,
      priceClp: 0,
      priceEur: 0,
      interval: 'monthly',
      domainCapacity: 0,
    },
    {
      name: 'Starter',
      slug: 'starter',
      units: 5,
      maxViews: 1000,
      priceUsd: 29,
      priceClp: 27900,
      priceEur: 27,
      interval: 'monthly',
      domainCapacity: 0,
    },
    {
      name: 'Pro',
      slug: 'pro',
      units: 20,
      maxViews: 10000,
      priceUsd: 79,
      priceClp: 75000,
      priceEur: 73,
      interval: 'monthly',
      domainCapacity: 1,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      units: 100,
      maxViews: 100000,
      priceUsd: 249,
      priceClp: 235000,
      priceEur: 229,
      interval: 'monthly',
      domainCapacity: 5,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    });
  }
  console.log(`  ✓ ${plans.length} plans`);

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@lookiar.com' },
    update: {},
    create: {
      email: 'admin@lookiar.com',
      passwordHash: adminHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('  ✓ admin user (admin@lookiar.com / admin123)');

  // HDR environment presets
  const hdrPresets = [
    'Neutral',
    'Studio',
    'City',
    'Sunset',
    'Outdoor',
    'Park',
    'Warehouse',
    'Forest',
    'Beach',
  ];

  for (const name of hdrPresets) {
    const existing = await prisma.environmentHdr.findFirst({
      where: { name, isPreset: true },
    });
    if (!existing) {
      await prisma.environmentHdr.create({
        data: {
          name,
          assetPath: `${name.toLowerCase()}.hdr`,
          isPreset: true,
        },
      });
    }
  }
  console.log(`  ✓ ${hdrPresets.length} HDR presets`);

  console.log('\nSeed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
