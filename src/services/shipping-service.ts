import { api } from '@/lib/axios';
import type { IResponse, IShippingOption } from '@/commons/types';

const calculateShipping = async (cep: string): Promise<IResponse> => {
    let response = {} as IResponse;
    try {
        const apiResponse = await api.get<IShippingOption[]>(`/api/shipping/calculate?cep=${cep}`);
        response = {
            status: 200,
            success: true,
            message: "Frete calculado com sucesso!",
            data: apiResponse.data,
        };
    } catch (err: any) {
        response = {
            status: err.response?.status || 500,
            success: false,
            message: "Falha ao calcular o frete. Verifique o CEP informado.",
            data: err.response?.data,
        };
    }
    return response;
};

const ShippingService = {
    calculateShipping,
};

export default ShippingService;

