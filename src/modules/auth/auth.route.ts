import { FastifyInstance } from "fastify";
import { createUser, loginUser } from './auth.controller.js'


export async function authRoutes(app: FastifyInstance) {
    app.post("/signup", {
        schema: {
            description: 'Register a new user account',
            tags: ['Authentication'],
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'User email address'
                    },
                    password: {
                        type: 'string',
                        minLength: 6,
                        description: 'User password (minimum 6 characters)'
                    }
                }
            },
            response: {
                201: {
                    description: 'User created successfully',
                    type: 'object',
                    properties: {
                        statusCode: { type: 'number' },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        email: { type: 'string' },
                                        createdAt: { type: 'string', format: 'date-time' },
                                        updatedAt: { type: 'string', format: 'date-time' }
                                    }
                                },
                                accessToken: { type: 'string' }
                            }
                        },
                        message: { type: 'string' },
                        success: { type: 'boolean' }
                    }
                },
                400: {
                    description: 'Invalid request body format',
                    type: 'object',
                    properties: {
                        statusCode: { type: 'number' },
                        message: { type: 'string' },
                        success: { type: 'boolean' },
                        errors: { type: 'object' }
                    }
                },
                409: {
                    description: 'User already exists',
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, createUser);
    
    app.post("/login", {
        schema: {
            description: 'Authenticate user and login',
            tags: ['Authentication'],
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'User email address'
                    },
                    password: {
                        type: 'string',
                        minLength: 6,
                        description: 'User password'
                    }
                }
            },
            response: {
                200: {
                    description: 'Login successful',
                    type: 'object',
                    properties: {
                        statusCode: { type: 'number' },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        email: { type: 'string' },
                                        createdAt: { type: 'string', format: 'date-time' },
                                        updatedAt: { type: 'string', format: 'date-time' }
                                    }
                                },
                                accessToken: { type: 'string' }
                            }
                        },
                        message: { type: 'string' },
                        success: { type: 'boolean' }
                    }
                },
                400: {
                    description: 'Invalid credentials or format',
                    type: 'object',
                    properties: {
                        statusCode: { type: 'number' },
                        message: { type: 'string' },
                        success: { type: 'boolean' }
                    }
                },
                500: {
                    description: 'Internal server error',
                    type: 'object',
                    properties: {
                        statusCode: { type: 'number' },
                        message: { type: 'string' },
                        success: { type: 'boolean' }
                    }
                }
            }
        }
    }, loginUser);
}

export default authRoutes