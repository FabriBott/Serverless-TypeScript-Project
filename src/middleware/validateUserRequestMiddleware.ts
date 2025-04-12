
export const validateUserRequestMiddleware = async (event: any, context: any) => {
    
    if (!event.body) {
        throw new Error('No body provided in event');
    }

    const parsed = JSON.parse(event.body);

    // validacion de parametros
    if (!parsed.userId || !parsed.amount) {
        throw new Error('Missing required parameters: userId and amount');
    }

    if (typeof parsed.userId !== 'string' || typeof parsed.amount !== 'number') {
        throw new Error('Invalid data types for userId or amount');
    }

    return parsed;
}; // midleware que verifica si el user tiene id y un amount
