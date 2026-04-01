import { prisma } from "../../db/prisma.js";
import bcrypt from "bcrypt";
import { CreateUserInput, LoginType } from "../../validators/auth.schema.js";
import { ApiError } from "../../utils/ApiError.js";

const SALT_ROUNDS = 10;

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

const initialMockStocks = [
  {
    symbol: "AAPL",
    quantity: 10
  },
  {
    symbol: "GOOGL",
    quantity: 10
  },
  {
    symbol: "TSLA",
    quantity: 10
  },
  {
    symbol: "AMZN",
    quantity: 10
  },
  {
    symbol: "MSFT",
    quantity: 10
  },
  {
    symbol: "NVDA",
    quantity: 10
  },
  {
    symbol: "META",
    quantity: 10
  },
];


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
      stockHoldings: {
        createMany: {
          data: initialMockStocks
        }
      }
    },
    select: SAFE_USER_SELECT,
  });

  return createdUser;
};

const getUserByEmailService = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: { email },
    select: SAFE_USER_SELECT
  });
  if (!user) throw new ApiError(
    400,
    "user not found"
  );

  return user;
}

const loginUserService = async (data: LoginType) => {
  const { email, password } = data;
  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user) throw new ApiError(
    404,
    "user not found :/"
  );

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  )

  if (!isPasswordCorrect) {
    throw new ApiError(
      400,
      "wrong password >_<"
    )
  }

  return {
    id: user.id,
    email: user.email
  }
}

export {
  createUserService,
  getUserByEmailService,
  loginUserService
} 