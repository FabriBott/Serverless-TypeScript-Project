import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context
} from 'aws-lambda';

import { withMiddleware } from '../middleware/middlewareManager';
import { validateUserRequestMiddleware } from '../middleware/validateUserRequestMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { loggerMiddleware } from '../middleware/loggerMiddleware';
import { userService } from '../service/userService';
import { CloudWatchLogger, ConsoleLogger, Logger } from '../service/logger';

// Inicializamos el logger según entorno
let logger: Logger;
if (process.env.NODE_ENV === 'production') {
    logger = new CloudWatchLogger();
} else {
    logger = new ConsoleLogger();
}

// Instanciamos el servicio
const service = new userService();

// Raw handler principal
const rawHandler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    logger.log('Starting getUserBalance handler');

    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { userId, amount } = body;

        if (!userId || !amount) {
            logger.log('Missing userId or amount');
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing userId or amount',
                })
            };
        }

        const result = await service.processPayment(userId, amount);

        if (!result) {
            logger.log(`User not found for userId: ${userId}`);
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'User not found',
                })
            };
        }

        logger.log(`Payment successful for user ${userId} with amount ${amount}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Payment successful',
                data: result
            })
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.log(`Error processing purchase: ${errorMessage}`);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing purchase',
                error: errorMessage
            })
        };
    }
};

// Exportamos el handler con middlewares
export const getUserBalanceHandler = withMiddleware(
    rawHandler,
    [new loggerMiddleware()],
    [new authMiddleware(), new validateUserRequestMiddleware(logger, service)]
);
