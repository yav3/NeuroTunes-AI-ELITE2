import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface APIError extends Error {
  statusCode?: number;
  code?: string;
  context?: any;
}

export class ValidationError extends Error {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  code = 'NOT_FOUND';
  
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  statusCode = 500;
  code = 'DATABASE_ERROR';
  
  constructor(message: string, public operation?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class AudioProcessingError extends Error {
  statusCode = 422;
  code = 'AUDIO_PROCESSING_ERROR';
  
  constructor(message: string, public trackId?: number) {
    super(message);
    this.name = 'AudioProcessingError';
  }
}

export class RateLimitError extends Error {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';
  
  constructor() {
    super('Rate limit exceeded. Please try again later.');
    this.name = 'RateLimitError';
  }
}

// Error response interface
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    timestamp: string;
    requestId: string;
  };
  context?: any;
}

// Generate request ID for tracking
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Add request ID to all requests
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  req.requestId = generateRequestId();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

// Log all requests
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = (req as any).user?.id;
    
    if (res.statusCode >= 400) {
      logger.apiError(
        req.method,
        req.path,
        new Error(`HTTP ${res.statusCode}`),
        userId
      );
    } else {
      logger.apiRequest(req.method, req.path, userId, duration);
    }
  });
  
  next();
}

// Main error handler
export function errorHandler(
  error: APIError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Determine status code
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  
  // Log the error
  const userId = (req as any).user?.id;
  logger.apiError(req.method, req.path, error, userId);
  
  // Prepare error response
  const errorResponse: ErrorResponse = {
    error: {
      message: statusCode >= 500 ? 'Internal server error' : error.message,
      code,
      timestamp: new Date().toISOString(),
      requestId: req.requestId || 'unknown'
    }
  };

  // Include context in development
  if (process.env.NODE_ENV === 'development' && error.context) {
    errorResponse.context = error.context;
  }

  // Include stack trace in development for 500 errors
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    errorResponse.error.message = error.message;
    (errorResponse as any).stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 handler
export function notFoundHandler(req: Request, res: Response) {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  logger.warn(`404 Not Found: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  res.status(404).json({
    error: {
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      requestId: req.requestId || 'unknown'
    }
  });
}

// Health check with error reporting
export function healthCheck(req: Request, res: Response) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      errors: logger.getErrorSummary()
    };

    // Check if there are critical errors
    if (health.errors.total > 100) {
      health.status = 'degraded';
      logger.systemHealth('api', 'degraded', { errorCount: health.errors.total });
    }

    res.json(health);
  } catch (error) {
    logger.systemHealth('api', 'down', { error: (error as Error).message });
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}