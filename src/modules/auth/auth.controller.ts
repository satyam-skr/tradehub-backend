import { FastifyRequest, FastifyReply } from "fastify";
import { signupSchema, SignupBody, LoginType, loginSchema } from "../../validators/auth.schema";
import { createUserService, loginUserService } from "./auth.service";
import { createAccessToken } from "../../utils/RefreshAndAccessToken";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { prisma } from "../../db/prisma";


const createUser = async (
  req: FastifyRequest<{ Body: SignupBody }>,
  reply: FastifyReply
) => {
  const parsed = signupSchema.safeParse(req.body);

  if (!parsed.success) {
    return reply
      .status(400)
      .send(new ApiError(
        400,
        "wrong format| expected email:string, password:string",
        parsed.error.flatten().fieldErrors
      ));
  }

  const { email, password } = parsed.data;

  // check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return reply.status(409).send({
      success: false,
      message: "User already exists",
    });
  }

  const user = await createUserService({ email, password });

  const tokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = await createAccessToken(reply, tokenPayload);

  return reply
    .status(201)
    .send(new ApiResponse(
      201,
      {
        user,
        accessToken
      },
      "signup successful"
    ))
};

const loginUser = async (
  req: FastifyRequest<{ Body: LoginType }>,
  reply: FastifyReply
) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return reply
      .status(400)
      .send(new ApiError(
        400,
        "wrong format| expected email:string, password:string",
        parsed.error.flatten().fieldErrors
      ));
  }
  const data = parsed.data;
  const user = await loginUserService(data);
  if(!user){
    throw new ApiError(
      500,
      "internal server error"
    )
  }
  const tokenPayload = {
    userId: user.id,
    email: user.email,
  };
  const accessToken = await createAccessToken(reply, tokenPayload );

  return reply
    .status(200)
    .send(new ApiResponse(
      201,
      {
        user,
        accessToken
      },
      "login successful"
    ))
}

export {
  createUser,
  loginUser
};