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

import "fastify";


declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: any, reply: any) => Promise<void>;
  }

  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
    };
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      userId: string;
      email: string;
    };
    user: {
      userId: string;
      email: string;
    };
  }
}