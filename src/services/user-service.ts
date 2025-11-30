import { api } from "@/lib/axios";
import type { IResponse } from "@/commons/types";

const userURL = "/users";

const findAll = async (): Promise<IResponse> => {
    let response = {} as IResponse;
    try {
        const apiResponse = await api.get(userURL);
        response = {
            status: 200,
            success: true,
            message: "Usuários carregados com sucesso!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: "Falha ao carregar usuários.",
            data: err.response?.data,
        };
    }
    return response;
};

const updateAuthorities = async (userId: number, authorities: string[]): Promise<IResponse> => {
    let response = {} as IResponse;
    try {
        const authoritiesPayload = authorities.map(auth => ({ authority: auth }));

        const apiResponse = await api.put(`${userURL}/${userId}/authorities`, authoritiesPayload);
        response = {
            status: 200,
            success: true,
            message: "Permissões atualizadas!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: "Falha ao atualizar permissões.",
            data: err.response?.data,
        };
    }
    return response;
};

const UserService = {
    findAll,
    updateAuthorities
};

export default UserService;