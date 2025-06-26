import type { IResponse, CartItem, IOrder } from "@/commons/types";
import { api } from "@/lib/axios";

const orderURL = "/orders";

interface CreateOrderDTO {
    items: {
        productId: number;
        price: number;
        quantity: number;
    }[];
}

const createOrder = async (cartItems: CartItem[]): Promise<IResponse> => {
    const orderToCreate: CreateOrderDTO = {
        items: cartItems.map(item => ({
            productId: item.id!,
            price: item.price,
            quantity: item.quantity,
        })),
    };

    let response = {} as IResponse;
    try {
        const apiResponse = await api.post<IOrder>(orderURL, orderToCreate);
        response = {
            status: 201,
            success: true,
            message: "Pedido criado com sucesso!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: err.response?.data?.message || "Falha ao criar o pedido.",
            data: err.response?.data,
        };
    }
    return response;
};

const findByUser = async (): Promise<IResponse> => {
    let response = {} as IResponse;
    try {
        const apiResponse = await api.get<IOrder[]>(`${orderURL}/my-orders`);
        response = {
            status: 200,
            success: true,
            message: "Histórico de pedidos carregado com sucesso!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: err.response?.data?.message || "Falha ao buscar o histórico de pedidos.",
            data: err.response?.data,
        };
    }
    return response;
};

const findById = async (id: number): Promise<IResponse> => {
    let response = {} as IResponse;
    try {
        const apiResponse = await api.get<IOrder>(`${orderURL}/${id}`);
        response = {
            status: 200,
            success: true,
            message: "Pedido carregado com sucesso!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: "Falha ao carregar o pedido.",
            data: err.response?.data,
        };
    }
    return response;
};

const updateStatus = async (orderId: number, status: string): Promise<IResponse> => {
    let response = {} as IResponse;
    try {
        const apiResponse = await api.put<IOrder>(`${orderURL}/${orderId}/status`, `"${status}"`, {
            headers: { 'Content-Type': 'application/json' }
        });
        response = {
            status: 200,
            success: true,
            message: "Status do pedido atualizado!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: "Falha ao atualizar o status do pedido.",
            data: err.response?.data,
        };
    }
    return response;
};

const OrderService = {
    createOrder,
    findByUser,
    findById,
    updateStatus,
};

export default OrderService;