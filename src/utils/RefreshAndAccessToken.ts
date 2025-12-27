import { FastifyReply } from "fastify";

export const createAccessToken = async (
  reply: FastifyReply,
  payload: object
) =>
  await reply.jwtSign(payload);

// export const createRefreshToken = async (
//   reply: FastifyReply,
//   payload: object
// ) =>
//   await reply.refreshJwt.sign(payload);
