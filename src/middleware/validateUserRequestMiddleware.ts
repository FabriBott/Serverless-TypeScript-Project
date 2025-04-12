import { APIGatewayProxyEvent } from 'aws-lambda';
import { iMiddleware } from './iMiddleware';
import { Logger } from '../service/logger';
import { userService } from '../service/userService';

export class validateUserRequestMiddleware implements iMiddleware {
    private logger: Logger;
    private service: userService;

    constructor(logger: Logger, service: userService) {
        this.logger = logger;
        this.service = service;
    }

    async execute(event: APIGatewayProxyEvent): Promise<void> {
        if (!event.body) {
            this.logger.log('Request body is missing');
            throw new Error('No body provided in event');
        }

        let parsed;
        try {
            parsed = JSON.parse(event.body);
        } catch (error) {
            this.logger.log('Invalid JSON in request body');
            throw new Error('Invalid JSON in request body');
        }

        const { userId, amount } = parsed;

        // Validación de existencia
        if (!userId || !amount) {
            this.logger.log('Missing required parameters: userId and amount');
            throw new Error('Missing required parameters: userId and amount');
        }

        // Validación de tipos
        if (typeof userId !== 'string' || typeof amount !== 'number') {
            this.logger.log('Invalid data types for userId or amount');
            throw new Error('Invalid data types for userId or amount');
        }

        // Validación lógica (opcional)
        const exists = await this.service.userExists(userId);
        if (!exists) {
            this.logger.log(`User ${userId} does not exist`);
            throw new Error(`User ${userId} does not exist`);
        }

        this.logger.log(`Request validated for user ${userId}`);
    }
}
