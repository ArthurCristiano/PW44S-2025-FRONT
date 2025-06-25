import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import OrderService from '@/services/order-service';
import type { IOrder, IOrderItem } from '@/commons/types';

export const OrderHistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        const loadUserOrders = async () => {
            setLoading(true);
            const response = await OrderService.findByUser();
            if (response.success && response.data) {
                setOrders(response.data as IOrder[]);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: response.message || 'Falha ao carregar o histórico de pedidos.'
                });
            }
            setLoading(false);
        };

        loadUserOrders();
    }, []);

    // Função para definir a cor da Tag com base no status do pedido
    const getStatusSeverity = (status: string | undefined): 'success' | 'warning' | 'danger' | 'info' => {
        switch (status?.toLowerCase()) {
            case 'pendente':
                return 'warning'; // Amarelo
            case 'concluído':
                return 'success'; // Verde
            case 'cancelado':
                return 'danger';  // Vermelho
            default:
                return 'info';    // Azul para qualquer outro caso
        }
    };

    const calculateOrderTotal = (order: IOrder): number => {
        return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const rowExpansionTemplate = (order: IOrder) => {
        return (
            <div className="p-3">
                <h5>Itens do Pedido Nº {order.id}</h5>
                <DataTable value={order.items}>
                    <Column field="productId" header="ID do Produto" />
                    <Column field="quantity" header="Quantidade" />
                    <Column field="price" header="Preço Unitário" body={(item: IOrderItem) => formatCurrency(item.price)} />
                    <Column header="Subtotal" body={(item: IOrderItem) => formatCurrency(item.price * item.quantity)} />
                </DataTable>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 100px)' }}>
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Card title="Meus Pedidos">
                <DataTable
                    value={orders}
                    rowExpansionTemplate={rowExpansionTemplate}
                    dataKey="id"
                    emptyMessage="Você ainda não fez nenhum pedido."
                >
                    <Column expander style={{ width: '5rem' }} />
                    <Column field="id" header="Nº do Pedido" />
                    <Column field="date" header="Data" body={(order: IOrder) => formatDate(order.date)} />
                    {/* A COLUNA DE STATUS AGORA É DINÂMICA */}
                    <Column
                        header="Status"
                        body={(order: IOrder) => (
                            <Tag
                                value={order.status}
                                severity={getStatusSeverity(order.status)}
                            />
                        )}
                    />
                    <Column header="Total" body={(order: IOrder) => formatCurrency(calculateOrderTotal(order))} />
                </DataTable>
            </Card>
        </div>
    );
};
