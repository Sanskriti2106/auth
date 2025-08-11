const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");
async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUserByEmailAndPassword({ name, email, passwordHash, passwordSalt }) {
  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      passwordSalt,
    },
  });
}

async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

module.exports = {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
};