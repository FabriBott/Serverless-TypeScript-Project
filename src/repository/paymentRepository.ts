interface PaymentMethod {
    userId: string;
    cardNumber: string;
}

interface Service {
    name: string;
    price: number;
}

class PaymentRepository {
    private paymentMethods: PaymentMethod[] = [
        { userId: 'user1', cardNumber: '123456789123' },
        { userId: 'user2', cardNumber: '987654321987' },
        { userId: 'user3', cardNumber: '112233445566' },
    ];

    private services: Service[] = [
        { name: 'Netflix', price: 10 },
        { name: 'Scotiabank', price: 15 },
        { name: 'Amazon Prime', price: 12 },
    ];

    // gets the user paying method
    async getUserPaymentMethod(userId: string): Promise<string | null> {
        const method = this.paymentMethods.find((method) => method.userId === userId);
        return method ? method.cardNumber : null;
    }

    // verifies if user exists
    async isServiceAvailable(serviceName: string): Promise<boolean> {
        return this.services.some(service => service.name === serviceName);
    }

    // gets the price of the service
    async getServicePrice(serviceName: string): Promise<number | null> {
        const service = this.services.find(service => service.name === serviceName);
        return service ? service.price : null;
    }

    // add the service payment
    async addServicePayment(userId: string, serviceName: string, amount: number): Promise<string> {
        const serviceExists = await this.isServiceAvailable(serviceName);

        if (!serviceExists) {
            throw new Error('Service not found');
        }

        const servicePrice = await this.getServicePrice(serviceName);
        if (amount < servicePrice!) {
            throw new Error('Insufficient payment for this service');
        }

        // Aquí podríamos agregar la lógica de guardar el pago, por ahora devolvemos un mensaje de éxito
        return `Payment of ${amount}$ processed successfully for ${serviceName}`;
    }
}
export default PaymentRepository;
