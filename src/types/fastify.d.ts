// import "@fastify/jwt";
// import "fastify";

// declare module "fastify" {
//   interface FastifyReply {
//     jwtSign: (
//       payload: string | object | Buffer,
//       options?: import("@fastify/jwt").FastifyJwtSignOptions
//     ) => Promise<string>;

//     refreshJwt: {
//       sign: (
//         payload: string | object | Buffer,
//         options?: import("@fastify/jwt").FastifyJwtSignOptions
//       ) => Promise<string>;
//     };
//   }

//   interface FastifyRequest {
//     jwtVerify: <T = unknown>() => Promise<T>;
//     refreshJwtVerify: <T = unknown>() => Promise<T>;
//   }
// }
