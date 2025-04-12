import { APIGatewayProxyHandler } from 'aws-lambda';

// middleware para la autenticacion de peticiones, obligatorio
export class authMiddleware {
    // Token hardcoded
    private readonly validToken = 'my-hardcoded-token'; // token fijo validacion

    async execute(event: any): Promise<void> {
        // se obtiene el token del header de la peticion
        const token = event.headers['Authorization']?.replace('Bearer ', '');

        // si no se recibio un token
        if (!token) {
            throw new Error('Unauthorized: Missing token');
        }

        // verifica si es valido
        if (token !== this.validToken) {
            throw new Error('Unauthorized: Invalid token');
        }

        // si es valido, continua con la ejecucion
        console.log('Token validated successfully');
    }
}
