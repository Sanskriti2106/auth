const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { salt, hash };
}

async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUserByEmailAndPassword({ name, email, password }) {
  const { salt, hash } = hashPassword(password);
  await prisma.user.create({
    data: {
      name,
      email,
      salt,
      password: hash
    }
  });
}

async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

module.exports = {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById
};