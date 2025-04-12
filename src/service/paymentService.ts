// service/paymentService.ts
import UserRepository from '../repository/userRepository';
import PaymentRepository from '../repository/paymentRepository';

export class PaymentService {
    private userRepository: UserRepository;
    private paymentRepository: PaymentRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.paymentRepository = new PaymentRepository();
    }

    // Verifica el saldo y procesa el pago de un servicio
    async processPayment(userId: string, cardNumber: string, service: string, paymentAmount: number) {
        // Verificar que el usuario tenga el método de pago correcto
        const userPaymentMethod = await this.paymentRepository.getUserPaymentMethod(userId);

        console.log(`User ID: ${userId}, Provided Card Number: ${cardNumber}, Stored Card Number: ${userPaymentMethod}`);

        if (!userPaymentMethod || userPaymentMethod !== cardNumber) {
            throw new Error('Invalid payment method for this user');
        }

        // Verificar que el servicio esté disponible
        const serviceExists = await this.paymentRepository.isServiceAvailable(service);
        if (!serviceExists) {
            throw new Error('Service not found');
        }

        // Verificar el saldo del usuario
        const userBalance = await this.userRepository.getUserBalance(userId);
        if (userBalance < paymentAmount) {
            throw new Error('Insufficient funds');
        }

        // Procesar el pago para el servicio
        const paymentResult = await this.paymentRepository.addServicePayment(userId, service, paymentAmount);

        // Si todo es exitoso, descontamos el monto del saldo del usuario
        await this.userRepository.processPayment(userId, paymentAmount);

        return paymentResult;
    }


    // Otros métodos, como actualización de balance, etc. pueden ir aquí si es necesario
}
