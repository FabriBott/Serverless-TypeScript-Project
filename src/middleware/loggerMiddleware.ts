import { APIGatewayProxyEvent } from 'aws-lambda';
import { iMiddleware } from './iMiddleware';

export class loggerMiddleware implements iMiddleware {
    async execute(event: APIGatewayProxyEvent): Promise<void> {
        console.log('Incoming request:', {
            path: event.path,
            method: event.httpMethod,
            headers: event.headers,
        });
    }
}
