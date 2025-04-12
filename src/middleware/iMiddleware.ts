import { APIGatewayProxyEvent } from 'aws-lambda';

// base interface for middleware
export interface iMiddleware {
    execute(event: APIGatewayProxyEvent): Promise<void>;
}
