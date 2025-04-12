// repository/exampleRepository.ts

interface User {
    id: string;
    balance: number;
}

class UserRepository {
    private dataStore: User[] = [
        { id: 'user1', balance: 100 },
        { id: 'user2', balance: 50 },
        { id: 'user3', balance: 200 },
    ];

    // Obtiene el saldo del usuario
    async getUserBalance(userId: string): Promise<number> {
        // Buscamos el usuario en el 'dataStore'
        const user = this.dataStore.find((user) => user.id === userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user.balance;
    }

    // Procesa la compra de un usuario
    async processPayment(userId: string, amount: number): Promise<string> {
        const user = this.dataStore.find((user) => user.id === userId);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.balance < amount) {
            throw new Error('Insufficient funds');
        }

        // Descontamos el saldo del usuario
        user.balance -= amount;

        return `Payment of ${amount}$ processed successfully for ${userId}`;
    }

    getData(): any[] {
        return this.dataStore;
    }

    saveData(data: any): void {
        this.dataStore.push(data);
    }
}

export default UserRepository;
