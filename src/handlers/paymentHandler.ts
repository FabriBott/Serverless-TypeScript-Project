// src/handlers/paymentHandler.ts
import { Handler } from 'aws-lambda';
import { PaymentService } from '../service/paymentService';
import { CloudWatchLogger, ConsoleLogger, Logger } from '../service/logger';

let logger: Logger;

if (process.env.NODE_ENV === 'production') {
    logger = new CloudWatchLogger();
} else {
    logger = new ConsoleLogger();
}

const paymentService = new PaymentService();

export const paymentHandler: Handler = async (event: any) => {
    logger.log('Starting paymentHandler');

    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        const { userId, cardNumber, service, paymentAmount, paymentFrequency, startDate } = body;

        const result = await paymentService.processPayment(userId, cardNumber, service, paymentAmount);

        logger.log(`Payment processed successfully for userId: ${userId}`);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Payment processed successfully', result }),
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.log(`Error processing payment: ${errorMessage}`);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing purchase', error: errorMessage }),
        };
    }
};
