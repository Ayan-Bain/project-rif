type  cycle = 'monthly' | 'yearly' | 'weekly';

interface Subscription {
    id: string;
    name: string;
    price: number;
    date: string;
    cycle: cycle;
    isActive: boolean;
}

export default Subscription;