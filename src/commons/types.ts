export interface IUserRegister {
    name: string;
    username: string;
    password: string;
    email: string;
}

export interface IResponse {
    status?: number;
    success?: boolean;
    message?: string;
    data?: object
}

export interface IUserLogin {
    username: string;
    password: string;
}

export interface Authorities {
    authority: string;
}

export interface AuthenticatedUser {
    displayName: string;
    username: string;
    authorities: Authorities[];
}

export interface AuthenticationResponse {
    token: string;
    user: AuthenticatedUser;
}

export  interface  ICategory {
    id?:  number;
    name:  string;
}

export interface IProduct {
    id?: number;
    name: string;
    description: string;
    price: number;
    urlImage?: string;
    category: ICategory;
}

export interface CartItem extends IProduct {
    quantity: number;
}

export interface IOrderItem {
    productId: number;
    price: number;
    quantity: number;
}

export interface IOrder {
    id: number;
    date: string;
    status: string;
    userId: number;
    addressId: number;
    items: IOrderItem[];
}

export interface IAddress {
    id?: number;
    description: string;
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
}

export interface IShippingOption {
    id: number;
    name: string;
    price: number;
    delivery_time: number;
}