const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");


async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUserByEmailAndPassword({name, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 12);
  return await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
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