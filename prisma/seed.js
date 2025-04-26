// File: prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  // Create dummy products
  await prisma.product.createMany({
    data: [
      {
        name: 'Smartphone X',
        description: 'The latest smartphone with amazing features.',
        price: 1999000,
        imageUrl: 'https://via.placeholder.com/300',
      },
      {
        name: 'Wireless Earbuds',
        description: 'Premium wireless earbuds with noise cancellation.',
        price: 899000,
        imageUrl: 'https://via.placeholder.com/300',
      },
      {
        name: 'Smart Watch',
        description: 'Track your fitness and stay connected.',
        price: 1299000,
        imageUrl: 'https://via.placeholder.com/300',
      },
    ],
  });

  console.log('Database seeded successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
