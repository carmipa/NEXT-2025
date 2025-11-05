// Tipos de exceção personalizadas do backend
export interface ApiErrorResponse {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path?: string;
    validationErrors?: Record<string, string>;
    errorType?: string;
    suggestion?: string;
}

// Classes de exceção personalizadas
export class ApiException extends Error {
    constructor(
        public status: number,
        public error: string,
        message: string,
        public response?: ApiErrorResponse
    ) {
        super(message);
        this.name = 'ApiException';
    }
}

export class ResourceNotFoundException extends ApiException {
    constructor(message: string, response?: ApiErrorResponse) {
        super(404, 'Não Encontrado', message, response);
        this.name = 'ResourceNotFoundException';
    }
}

export class DuplicatedResourceException extends ApiException {
    constructor(message: string, response?: ApiErrorResponse) {
        super(409, 'Conflito de Dados', message, response);
        this.name = 'DuplicatedResourceException';
    }
}

export class InvalidInputException extends ApiException {
    constructor(message: string, response?: ApiErrorResponse) {
        super(400, 'Requisição Inválida', message, response);
        this.name = 'InvalidInputException';
    }
}

export class ResourceInUseException extends ApiException {
    constructor(message: string, response?: ApiErrorResponse) {
        super(409, 'Recurso em Uso', message, response);
        this.name = 'ResourceInUseException';
    }
}

export class OperationNotAllowedException extends ApiException {
    constructor(message: string, response?: ApiErrorResponse) {
        super(403, 'Operação Não Permitida', message, response);
        this.name = 'OperationNotAllowedException';
    }
}

export class ValidationException extends ApiException {
    constructor(
        message: string,
        public validationErrors?: Record<string, string>,
        response?: ApiErrorResponse
    ) {
        super(400, 'Dados Inválidos', message, response);
        this.name = 'ValidationException';
    }
}

// Função helper para criar exceção baseada na resposta da API
export function createExceptionFromResponse(error: any): ApiException {
    const response: ApiErrorResponse = error.response?.data || {};
    const status = error.response?.status || 500;
    const message = response.message || error.message || 'Erro desconhecido';
    const errorType = response.error || 'Erro';

    switch (status) {
        case 404:
            return new ResourceNotFoundException(message, response);
        case 409:
            if (errorType.includes('em Uso') || errorType.includes('Recurso em Uso')) {
                return new ResourceInUseException(message, response);
            }
            return new DuplicatedResourceException(message, response);
        case 400:
            if (response.validationErrors) {
                return new ValidationException(message, response.validationErrors, response);
            }
            return new InvalidInputException(message, response);
        case 403:
            return new OperationNotAllowedException(message, response);
        default:
            return new ApiException(status, errorType, message, response);
    }
}



