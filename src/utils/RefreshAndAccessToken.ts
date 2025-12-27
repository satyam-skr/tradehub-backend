import { FastifyReply } from "fastify";

export const createAccessToken = async (
  reply: FastifyReply,
  payload: any
) => {

  const accessToken = await reply.jwtSign(payload);
  reply.setCookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return accessToken;
}

// export const createRefreshToken = async (
//   reply: FastifyReply,
//   payload: object
// ) =>
//   await reply.refreshJwt.sign(payload);
