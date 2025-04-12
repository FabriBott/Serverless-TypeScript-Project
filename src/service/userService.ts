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
            throw new Error('Insufficient funds');
        }

        // if the balance is enough process purchase
        const paymentResult = await this.repository.processPayment(userId, amount);

        return paymentResult;
    }
}
