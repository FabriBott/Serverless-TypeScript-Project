// handlers/paymentHandler.ts
import { Handler } from 'aws-lambda';
import { PaymentService } from '../service/paymentService';

const paymentService = new PaymentService();

export const paymentHandler = async (event: any) => {
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        const { userId, cardNumber, service, paymentAmount, paymentFrequency, startDate } = body;

        const result = await paymentService.processPayment(userId, cardNumber, service, paymentAmount);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Payment processed successfully', result }),
        };
    } catch (error: any) {
        console.error('Error processing event:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing purchase', error: error.message }),
        };
    }
};
