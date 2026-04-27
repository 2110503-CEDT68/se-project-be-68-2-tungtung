const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Rental Car Booking System API',
    version: '1.0.0',
    description:
      'OpenAPI documentation for authentication, providers, bookings, reviews, and chat endpoints.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and user profile endpoints' },
    { name: 'Providers', description: 'Car provider management endpoints' },
    { name: 'Bookings', description: 'Booking management endpoints' },
    { name: 'Reviews', description: 'Provider review endpoints' },
    { name: 'Chat', description: 'Chat and messaging endpoints' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Operation failed' },
          msg: { type: 'string', example: 'Operation failed' },
        },
      },
      TokenResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '680d2ac9f9f9f9f9f9f9f9f9' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          telephone: { type: 'string', example: '123-456-7890' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'telephone', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          telephone: { type: 'string', example: '123-456-7890' },
          password: { type: 'string', minLength: 6, example: 'password123' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      AuthMeResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/User' },
        },
      },
      Provider: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '680d2c47f9f9f9f9f9f9f9f9' },
          name: { type: 'string', example: 'Bangkok Car Rentals' },
          address: { type: 'string', example: '123 Main Rd, Bangkok' },
          tel: { type: 'string', example: '02-123-4567' },
          averageRating: { type: 'number', format: 'float', example: 4.5 },
          reviewCount: { type: 'integer', example: 12 },
        },
      },
      ProviderInput: {
        type: 'object',
        required: ['name', 'address'],
        properties: {
          name: { type: 'string', example: 'Bangkok Car Rentals' },
          address: { type: 'string', example: '123 Main Rd, Bangkok' },
          tel: { type: 'string', example: '02-123-4567' },
        },
      },
      ProvidersListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          count: { type: 'integer', example: 2 },
          pagination: {
            type: 'object',
            additionalProperties: true,
            example: {
              next: { page: 2, limit: 25 },
            },
          },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Provider' },
          },
        },
      },
      ProviderResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Provider' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '680d2d73f9f9f9f9f9f9f9f9' },
          rentalDate: { type: 'string', format: 'date-time', example: '2026-05-01T00:00:00.000Z' },
          user: {
            oneOf: [
              { type: 'string', example: '680d2ac9f9f9f9f9f9f9f9f9' },
              {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  tel: { type: 'string' },
                },
              },
            ],
          },
          provider: {
            oneOf: [
              { type: 'string', example: '680d2c47f9f9f9f9f9f9f9f9' },
              {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  address: { type: 'string' },
                  tel: { type: 'string' },
                },
              },
            ],
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      BookingCreateRequest: {
        type: 'object',
        required: ['rentalDate'],
        properties: {
          rentalDate: { type: 'string', format: 'date-time', example: '2026-05-01T00:00:00.000Z' },
        },
      },
      BookingUpdateRequest: {
        type: 'object',
        properties: {
          rentalDate: { type: 'string', format: 'date-time', example: '2026-05-02T00:00:00.000Z' },
        },
      },
      BookingsListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          count: { type: 'integer', example: 1 },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Booking' },
          },
        },
      },
      BookingResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Booking' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '680d2f36f9f9f9f9f9f9f9f9' },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          comment: { type: 'string', example: 'Great service!' },
          user: {
            oneOf: [
              { type: 'string', example: '680d2ac9f9f9f9f9f9f9f9f9' },
              {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            ],
          },
          provider: {
            oneOf: [
              { type: 'string', example: '680d2c47f9f9f9f9f9f9f9f9' },
              {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            ],
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ReviewCreateRequest: {
        type: 'object',
        required: ['rating', 'comment'],
        properties: {
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          comment: { type: 'string', minLength: 1, maxLength: 1000, example: 'Great service!' },
        },
      },
      ReviewUpdateRequest: {
        type: 'object',
        properties: {
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          comment: { type: 'string', minLength: 1, maxLength: 1000, example: 'Updated comment' },
        },
      },
      ReviewsListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          count: { type: 'integer', example: 1 },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Review' },
          },
        },
      },
      ReviewResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Review' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '680d30b3f9f9f9f9f9f9f9f9' },
          room: { type: 'string', example: '680d2ac9f9f9f9f9f9f9f9f9' },
          sender: { type: 'string', example: '680d2ac9f9f9f9f9f9f9f9f9' },
          senderName: { type: 'string', example: 'John Doe' },
          senderRole: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          content: { type: 'string', example: 'Hello, I need support.' },
          status: { type: 'string', enum: ['sent', 'read'], example: 'sent' },
          timestamp: { type: 'string', format: 'date-time' },
          isDeleted: { type: 'boolean', example: false },
        },
      },
      ChatRoom: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '680d2ac9f9f9f9f9f9f9f9f9' },
          lastMessage: { type: 'string', example: 'Hello, I need support.' },
          lastTimestamp: { type: 'string', format: 'date-time' },
          unreadCount: { type: 'integer', example: 2 },
          userName: { type: 'string', example: 'John Doe' },
        },
      },
      ChatRoomsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          count: { type: 'integer', example: 1 },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/ChatRoom' },
          },
        },
      },
      ChatHistoryResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          count: { type: 'integer', example: 10 },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Message' },
          },
        },
      },
      ChatSendRequest: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 1000, example: 'Hello admin' },
          room: {
            type: 'string',
            description: 'Required only for admin sender',
            example: '680d2ac9f9f9f9f9f9f9f9f9',
          },
        },
      },
      ChatUpdateRequest: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 1000, example: 'Edited message' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
        },
      },
    },
  },
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TokenResponse' },
              },
            },
          },
          400: {
            description: 'Validation or duplicate user error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and get JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TokenResponse' },
              },
            },
          },
          400: {
            description: 'Missing credentials or invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current logged-in user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthMeResponse' },
              },
            },
          },
          401: {
            description: 'Not authorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/logout': {
      get: {
        tags: ['Auth'],
        summary: 'Clear auth cookie and logout',
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    msg: { type: 'string', example: 'Logged out successfully' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/providers': {
      get: {
        tags: ['Providers'],
        summary: 'Get all providers',
        parameters: [
          {
            in: 'query',
            name: 'select',
            schema: { type: 'string' },
            description: 'Comma-separated fields to include',
            example: 'name,address,tel',
          },
          {
            in: 'query',
            name: 'sort',
            schema: { type: 'string' },
            description: 'Comma-separated sort fields',
            example: 'name,-averageRating',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1 },
            example: 1,
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1 },
            example: 25,
          },
          {
            in: 'query',
            name: 'averageRating[gte]',
            schema: { type: 'number' },
            description: 'Filter with operator query syntax',
            example: 4,
          },
        ],
        responses: {
          200: {
            description: 'Providers list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProvidersListResponse' },
              },
            },
          },
          400: {
            description: 'Invalid query',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Providers'],
        summary: 'Create provider (admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProviderInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Provider created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProviderResponse' },
              },
            },
          },
          401: {
            description: 'Not authorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (non-admin role)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/providers/{id}': {
      get: {
        tags: ['Providers'],
        summary: 'Get provider by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Provider detail',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProviderResponse' },
              },
            },
          },
          400: {
            description: 'Provider not found or invalid id',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Providers'],
        summary: 'Update provider (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProviderInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Provider updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProviderResponse' },
              },
            },
          },
          400: {
            description: 'Invalid payload or provider id',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Not authorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (non-admin role)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Providers'],
        summary: 'Delete provider (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Provider deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', example: {} },
                  },
                },
              },
            },
          },
          404: {
            description: 'Provider not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          400: {
            description: 'Invalid id',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Not authorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (non-admin role)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'Get bookings (own bookings for user, all for admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Bookings list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BookingsListResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/providers/{providerId}/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'Get bookings for a provider',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'providerId',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Provider bookings',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BookingsListResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create booking for provider (user or admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'providerId',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookingCreateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Booking created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BookingResponse' },
              },
            },
          },
          400: {
            description: 'Booking limit reached',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Provider not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get booking by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Booking detail',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BookingResponse' },
              },
            },
          },
          404: {
            description: 'Booking not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Bookings'],
        summary: 'Update booking (owner or admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookingUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Booking updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BookingResponse' },
              },
            },
          },
          401: {
            description: 'Not authorized to update booking',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Booking not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Bookings'],
        summary: 'Delete booking (owner or admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Booking deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', example: {} },
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authorized to delete booking',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Booking not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'Get all reviews',
        responses: {
          200: {
            description: 'Reviews list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewsListResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/providers/{providerId}/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'Get reviews for a provider',
        parameters: [
          {
            in: 'path',
            name: 'providerId',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Provider reviews',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewsListResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Reviews'],
        summary: 'Create review for provider (user or admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'providerId',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewCreateRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Review created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewResponse' },
              },
            },
          },
          400: {
            description: 'Validation error or duplicate review',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'User has not booked this provider',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Provider not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/reviews/{id}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get review by id',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Review detail',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewResponse' },
              },
            },
          },
          404: {
            description: 'Review not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Reviews'],
        summary: 'Update review (owner or admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Review updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewResponse' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Not authorized to update this review',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Review not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Reviews'],
        summary: 'Delete review (owner or admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Review deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', example: {} },
                  },
                },
              },
            },
          },
          403: {
            description: 'Not authorized to delete this review',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Review not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/chat': {
      get: {
        tags: ['Chat'],
        summary: 'Get all chat rooms (admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Chat rooms list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatRoomsResponse' },
              },
            },
          },
          401: {
            description: 'Not authorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (non-admin role)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/chat/send': {
      post: {
        tags: ['Chat'],
        summary: 'Send message via REST fallback',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatSendRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Message sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Message' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid message content or room is required for admin',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/chat/{roomId}/read': {
      put: {
        tags: ['Chat'],
        summary: 'Mark all messages in room as read',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'roomId',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Messages marked as read',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          403: {
            description: 'Not authorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/chat/{id}': {
      get: {
        tags: ['Chat'],
        summary: 'Get chat history by user room id',
        description: 'For this GET operation, id refers to user room id.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Chat history',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatHistoryResponse' },
              },
            },
          },
          403: {
            description: 'Not authorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Chat'],
        summary: 'Update message by message id',
        description: 'For this PUT operation, id refers to message id.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatUpdateRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Message updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Message' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Content cannot be empty',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Not authorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Message not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Chat'],
        summary: 'Delete message by message id',
        description: 'For this DELETE operation, id refers to message id.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Message deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          403: {
            description: 'Not authorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Message not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
