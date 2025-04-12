import { paymentHandler } from '../../src/handlers/paymentHandler';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

const mockContext = {} as Context; // Simulación del context vacío

// Caso de prueba para un pago válido
const mockEvent = {
    headers: {
        Authorization: 'Bearer my-hardcoded-token',  // Cabecera de autorización
    },
    body: JSON.stringify({
        userId: 'user1',
        cardNumber: '123456789123',
        service: 'Netflix',
        paymentAmount: 10,
        paymentFrequency: 'monthly',
        startDate: '2025-04-10',
    }),
} as unknown as APIGatewayProxyEvent;

// Test suite para paymentHandler
describe('paymentHandler', () => {
    it('should return a 200 status code when payment is successful', async () => {
        const result = await paymentHandler(mockEvent, mockContext);

        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body);
        expect(body.message).toBe('Payment processed successfully');
        expect(body.result).toContain('Payment of');
    });

    it('should return 500 if service is missing or invalid', async () => {
        const invalidEvent = {
            headers: {
                Authorization: 'Bearer my-hardcoded-token',
            },
            body: JSON.stringify({
                userId: 'user1',
                cardNumber: '123456789123',
                // missing the service field
                paymentAmount: 10,
            }),
        } as unknown as APIGatewayProxyEvent;

        const result = await paymentHandler(invalidEvent, mockContext);

        expect(result.statusCode).toBe(500);
        const body = JSON.parse(result.body);
        expect(body.message).toBe('Error processing purchase');
    });

    it('should return 500 if paymentAmount is invalid', async () => {
        const invalidPaymentEvent = {
            headers: {
                Authorization: 'Bearer my-hardcoded-token',
            },
            body: JSON.stringify({
                userId: 'user1',
                cardNumber: '123456789123',
                service: 'Netflix',
                paymentAmount: -10, // invalid amount
                paymentFrequency: 'monthly',
                startDate: '2025-04-10',
            }),
        } as unknown as APIGatewayProxyEvent;

        const result = await paymentHandler(invalidPaymentEvent, mockContext);

        expect(result.statusCode).toBe(500);
        const body = JSON.parse(result.body);
        expect(body.message).toBe('Error processing purchase');
    });
});
