type  cycle = 'monthly' | 'yearly' | 'weekly';

interface Subscription {
    id: string;
    name: string;
    price: number;
    renewalDate: Date;
    cycle: cycle;
    isActive: boolean;
}

export default Subscription;