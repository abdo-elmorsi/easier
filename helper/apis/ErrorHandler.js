class ErrorHandler extends Error {
	constructor(message, statusCode = 500, details = {}, errorCode = null) {
		super(message);
		this.message = message; // Error message
		this.statusCode = statusCode; // HTTP status code
		this.name = this.constructor.name;
		this.details = details; // Additional context for the error
		this.errorCode = errorCode; // Optional error code for specific identification
		Error.captureStackTrace(this, this.constructor); // Captures the stack trace
	}

	// Static methods for common HTTP errors
	static notFound(message = "Resource not found", details = {}, errorCode = "RESOURCE_NOT_FOUND") {
		return new ErrorHandler(message, 404, details, errorCode);
	}

	static badRequest(message = "Bad request", details = {}, errorCode = "BAD_REQUEST") {
		return new ErrorHandler(message, 400, details, errorCode);
	}

	static conflict(message = "Conflict", details = {}, errorCode = "CONFLICT") {
		return new ErrorHandler(message, 409, details, errorCode);
	}

	static internalError(error, details = {}, errorCode = "INTERNAL_SERVER_ERROR") {
		// Check if the passed error is already an instance of ErrorHandler
		if (this.isErrorHandler(error)) {
			return error; // Return the existing ErrorHandler instance
		}
		return new ErrorHandler(error.message || "Internal server error", 500, details, errorCode);
	}

	static unauthorized(message = "Unauthorized", details = {}, errorCode = "UNAUTHORIZED") {
		return new ErrorHandler(message, 401, details, errorCode);
	}

	static forbidden(message = "Forbidden", details = {}, errorCode = "FORBIDDEN") {
		return new ErrorHandler(message, 403, details, errorCode);
	}

	static methodNotAllowed(message = "Method not allowed", details = {}, errorCode = "METHOD_NOT_ALLOWED") {
		return new ErrorHandler(message, 405, details, errorCode);
	}

	static unprocessableEntity(message = "Unprocessable entity", details = {}, errorCode = "UNPROCESSABLE_ENTITY") {
		return new ErrorHandler(message, 422, details, errorCode);
	}

	static serviceUnavailable(message = "Service unavailable", details = {}, errorCode = "SERVICE_UNAVAILABLE") {
		return new ErrorHandler(message, 503, details, errorCode);
	}
	// New static method for validation errors
	static validationError(message = "Validation error", details = {}, errorCode = "VALIDATION_ERROR") {
		return new ErrorHandler(message, 400, details, errorCode);
	}
	static isErrorHandler(error) {
		return error instanceof ErrorHandler; // Checks if the error is an instance of ErrorHandler
	}

	log() {
		// Simple logging mechanism
		console.error({
			message: this.message,
			statusCode: this.statusCode,
			details: this.details,
			errorCode: this.errorCode,
			stack: this.stack,
		});
	}
}

export default ErrorHandler;