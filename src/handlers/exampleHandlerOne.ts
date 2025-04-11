import { Handler } from 'aws-lambda';
import { exampleMiddleware } from '../middleware/exampleMiddleware';  // Middleware para procesar el evento
import ExampleRepository from "../repository/exampleRepository";

export const exampleHandlerOne: Handler = async (event: any) => {
    try {
        // Process the request using the middleware
        const processedEvent = await exampleMiddleware(event, {}); // Pasar el evento al middleware

        // Create an instance of the repository
        const repository = new ExampleRepository();

        // Perform an operation, e.g., saving data
        const result = await repository.saveData(processedEvent);

        // Retunr de la respuesta
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Data saved successfully',
                data: result,
            }),
        };
    } catch (error: unknown) {
        // Verificar si el error es una instancia de Error
        if (error instanceof Error) {
            // Acceder a las propiedades del error
            console.error('Error processing event:', error.message);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Internal server error',
                    error: error.message,
                }),
            };
        } else {
            // En caso de que el error no sea una instancia de Error
            console.error('Unknown error occurred:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Internal server error',
                    error: 'Unknown error',
                }),
            };
        }
    }
};
