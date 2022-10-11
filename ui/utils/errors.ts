import { NextApiResponse } from 'next'

export class HttpException extends Error {
    status: number

    constructor(status: number, message: string) {
        super(message)

        this.status = status
    }

    toJson() {
        return {
            status: this.status,
            error: this.message,
        }
    }
}

export class BadRequestException extends HttpException {
    constructor(message: string = 'Bad Request') {
        super(400, message)
    }
}

export class NotFoundException extends HttpException {
    constructor(message: string = 'Not Found') {
        super(404, message)
    }
}

/**
 * converts errors to a JSON api response
 * To prevent leaking implementation details to an end-user, if the error isn't an instance of HttpException, only return a generic error.
 */
export function apiError(response: NextApiResponse, error: Error | HttpException) {
    if (error instanceof HttpException) {
        response.status(error.status).json(error.toJson())
    } else {
        response.status(500).json({
            status: 500,
            error: 'Bad Request',
        })
    }
}
