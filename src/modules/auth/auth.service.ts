import { prisma } from "../../db/prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

interface CreateUserInput {
  email: string;
  password: string;
}

interface UserQuery {
    email? : string;
}

const createUserService = async (data: CreateUserInput) => {
  const { email, password } = data;

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const createdUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      wallet: {
        create: {
          balance: 1000000, // fake capital
          lockedBalance: 0,
        },
      },
    },
    select: SAFE_USER_SELECT,
  });

  return createdUser;
};

export {
    createUserService,
} 