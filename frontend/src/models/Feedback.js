export interface Feedback {
    id: string;
    userName: string;
    description: string;
    rating: number;
    image?: string;
    createdAt: Date;
}