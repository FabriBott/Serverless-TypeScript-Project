// service/exampleService.ts
import userRepository from '../repository/userRepository';

export class userService {
    private repository: userRepository;

    constructor() {
        this.repository = new userRepository();
    }

    // data verification to process a purchase 
    async processPayment(userId: string, amount: number) {
        // balance verification
        const userBalance = await this.repository.getUserBalance(userId);

        if (userBalance < amount) {
            const error = new Error('Insufficient funds');
            (error as any).code = 'INSUFFICIENT_FUNDS';
            throw error;
        }

        // if the balance is enough process purchase
        const paymentResult = await this.repository.processPayment(userId, amount);

        return paymentResult;
    }

    // Método para verificar si el usuario existe
    async userExists(userId: string): Promise<boolean> {
        const user = await this.repository.getUserById(userId);
        return user !== null;
    }
}
