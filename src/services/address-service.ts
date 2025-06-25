import type { IAddress, IResponse } from "@/commons/types";
import { api } from "@/lib/axios";

const addressURL = "/address";

const save = async (address: IAddress): Promise<IResponse> => {
    const method = address.id ? 'put' : 'post';
    const url = address.id ? `${addressURL}/${address.id}` : addressURL;

    let response = {} as IResponse;
    try {
        const apiResponse = await api[method](url, address);
        response = {
            status: apiResponse.status,
            success: true,
            message: "Endereço salvo com sucesso!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: "Falha ao salvar endereço.",
            data: err.response?.data,
        };
    }
    return response;
};

const findAll = async (): Promise<IResponse> => {
    let response = {} as IResponse;
    try {
        const apiResponse = await api.get(addressURL);
        response = {
            status: 200,
            success: true,
            message: "Endereços carregados com sucesso!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: "Falha ao carregar endereços.",
            data: err.response?.data,
        };
    }
    return response;
};

const findById = async (id: number): Promise<IResponse> => {
    let response = {} as IResponse;
    try {
        const apiResponse = await api.get(`${addressURL}/${id}`);
        response = {
            status: 200,
            success: true,
            message: "Endereço carregado com sucesso!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: "Falha ao carregar endereço.",
            data: err.response?.data,
        };
    }
    return response;
};

const remove = async (id: number): Promise<IResponse> => {
    let response = {} as IResponse;
    try {
        const apiResponse = await api.delete(`${addressURL}/${id}`);
        response = {
            status: apiResponse.status,
            success: true,
            message: "Endereço removido com sucesso!",
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: "Falha ao remover endereço.",
            data: err.response?.data,
        };
    }
    return response;
};


const AddressService = {
    save,
    findAll,
    findById,
    remove,
};

export default AddressService;