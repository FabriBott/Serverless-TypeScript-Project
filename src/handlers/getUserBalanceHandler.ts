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

        const result = await service.processPayment(userId, amount);

        logger.log(`Payment successful for user ${userId} with amount ${amount}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Payment successful',
                data: result
            })
        };
    } catch (error: unknown) {
        logger.log(`Error processing event: ${error instanceof Error ? error.message : 'Unknown error'}`);

        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Error processing purchase',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};

// Exportamos el handler ya envuelto en middlewares
export const getUserBalanceHandler = withMiddleware(
    rawHandler,
    [new loggerMiddleware()],
    [new authMiddleware(), new validateUserRequestMiddleware(logger, service)]
);
