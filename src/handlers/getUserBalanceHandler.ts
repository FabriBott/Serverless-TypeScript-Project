// handler que verifica si se tiene suficiente saldo para hacer cierta tarea
import { Handler } from 'aws-lambda';
import { validateUserRequestMiddleware } from '../middleware/validateUserRequestMiddleware';
import { userService } from '../service/userService';

export const getUserBalanceHandler: Handler = async (event: any) => {
    try {
        // Validamos y procesamos el evento usando el middleware
        const { userId, amount } = await validateUserRequestMiddleware(event, {});

        // Creamos el servicio y procesamos la compra
        const service = new userService();
        const result = await service.processPayment(userId, amount);

        // Retornamos la respuesta exitosa
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Payment successful',
                data: result,
            }),
        };
    } catch (error: unknown) {
        console.error('Error processing event:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Error processing purchase',
                error: error instanceof Error ? error.message : 'Unknown error',
            }),
        };
    }
};
