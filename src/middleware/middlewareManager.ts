import {
    APIGatewayProxyEvent,
    Context,
    APIGatewayProxyResult
} from 'aws-lambda';
import { iMiddleware } from './iMiddleware';

export const withMiddleware = (
    handler: (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult>,
    optionalMiddlewares: iMiddleware[] = [],
    mandatoryMiddlewares: iMiddleware[]
): (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult> => {
    return async (
        event: APIGatewayProxyEvent,
        context: Context
    ): Promise<APIGatewayProxyResult> => {
        for (const middleware of [...mandatoryMiddlewares, ...optionalMiddlewares]) {
            await middleware.execute(event);
        }

        return await handler(event, context);
    };
};
