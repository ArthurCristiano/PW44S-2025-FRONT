import type { IResponse, CartItem, IOrder } from "@/commons/types";
import { api } from "@/lib/axios";

const orderURL = "/orders";

interface CreateOrderDTO {
    items: {
        productId: number;
        price: number;
        quantity: number;
    }[];
    addressId?: number;
}

const createOrder = async (cartItems: CartItem[], addressId?: number): Promise<IResponse> => {
    const orderToCreate: CreateOrderDTO = {
        items: cartItems.map(item => ({
            productId: item.id!,
            price: item.price,
            quantity: item.quantity,
        })),
        addressId: addressId,
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

const updateOrderAddress = async (orderId: number, addressId: number): Promise<IResponse> => {
    let response = {} as IResponse;
    try {
        const apiResponse = await api.put<IOrder>(`${orderURL}/${orderId}/address/${addressId}`);
        response = {
            status: 200,
            success: true,
            message: "Endereço do pedido atualizado!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: "Falha ao atualizar o endereço do pedido.",
            data: err.response?.data,
        };
    }
    return response;
};

const findAll = async (): Promise<IResponse> => {
    let response = {} as IResponse;
    try {

        const apiResponse = await api.get<IOrder[]>(orderURL);
        response = {
            status: 200,
            success: true,
            message: "Lista de pedidos carregada com sucesso!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: err.response?.data?.message || "Falha ao carregar a lista de pedidos.",
            data: err.response?.data,
        };
    }
    return response;
};

const uploadAttachment = async (orderId: number, file: File): Promise<IResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    let response = {} as IResponse;
    try {
        await api.post(`${orderURL}/${orderId}/attachments`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        response = { success: true, message: "Upload realizado!" };
    } catch (err: any) {
        response = { success: false, message: "Erro no upload." };
    }
    return response;
};

const getAttachments = async (orderId: number): Promise<any> => {
    try {
        const res = await api.get(`${orderURL}/${orderId}/attachments`);
        return { success: true, data: res.data };
    } catch (err) {
        return { success: false, data: [] };
    }
};

const downloadAttachment = async (attachmentId: number, fileName: string) => {
    try {
        const response = await api.get(`${orderURL}/attachments/${attachmentId}/download`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Erro ao baixar", error);
    }
};

const viewAttachment = async (attachmentId: number, fileType: string) => {
    try {
        const response = await api.get(`${orderURL}/attachments/${attachmentId}/download`, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: fileType });

        const url = window.URL.createObjectURL(blob);

        window.open(url, '_blank');

    } catch (error) {
        console.error("Erro ao abrir arquivo", error);
    }
};

const OrderService = {
    createOrder,
    findByUser,
    findById,
    updateStatus,
    updateOrderAddress,
    findAll,
    uploadAttachment,
    getAttachments,
    downloadAttachment,
    viewAttachment
};

export default OrderService;