import { getUserBalanceHandler } from '../../src/handlers/getUserBalanceHandler';

describe('getUserBalanceHandler', () => {
    const mockContext = {} as any; // mock of empty context

    // base case, everything works
    it('should return 200 and user balance when user exists and token is valid', async () => {
        const event = {
            headers: {
                Authorization: 'Bearer my-hardcoded-token',
            },
            body: JSON.stringify({
                userId: 'user2',
                amount: 26,
            }),
        };

        const result = await getUserBalanceHandler(event as any, mockContext);

        expect(result.statusCode).toBe(200);
        expect(result.body).toContain('Payment successful');
    });

    // case where funds are not enough
    it('should return 500 when insufficient funds', async () => {
        const event = {
            headers: {
                Authorization: 'Bearer my-hardcoded-token',
            },
            body: JSON.stringify({
                userId: 'user2',
                amount: 2500,
            }),
        };

        const result = await getUserBalanceHandler(event as any, mockContext);

        expect(result.statusCode).toBe(500); 
        expect(result.body).toContain('Error processing purchase');  
    });
});
