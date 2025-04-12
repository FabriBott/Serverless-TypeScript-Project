import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context
} from 'aws-lambda';

import { PaymentService } from '../service/paymentService';
import { CloudWatchLogger, ConsoleLogger, Logger } from '../service/logger';
import { withMiddleware } from '../middleware/middlewareManager';
import { loggerMiddleware } from '../middleware/loggerMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

let logger: Logger;

if (process.env.NODE_ENV === 'production') {
    logger = new CloudWatchLogger();
} else {
    logger = new ConsoleLogger();
}

const paymentService = new PaymentService();

const rawHandler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    logger.log('Starting paymentHandler');

    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const {
            userId,
            cardNumber,
            service,
            paymentAmount,
            paymentFrequency,
            startDate
        } = body;

        const result = await paymentService.processPayment(
            userId,
            cardNumber,
            service,
            paymentAmount
        );

        logger.log(`Payment processed successfully for userId: ${userId}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Payment processed successfully',
                result
            })
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.log(`Error processing payment: ${errorMessage}`);

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
export const paymentHandler = withMiddleware(
    rawHandler,
    [new loggerMiddleware()],
    [new authMiddleware()]
);
