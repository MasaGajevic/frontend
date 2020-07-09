export default interface CartType {
    cartId: number;
    userId: number;
    createdAt: string;
    user: any;
    cartCarpets: {
        cartCarpetId: number;
        carpetId: number;
        quantity: number;
        carpet: {
            carpetId: number;
            name: string;
            category: {
                categoryId: number;
                name: string;
            };
            carpetPrices: {
                carpetPriceId: number;
                createdAt: string;
                price: number;
            }[];
        }
    }[];
}
