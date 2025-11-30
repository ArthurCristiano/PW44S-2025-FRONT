import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import OrderService from '@/services/order-service';
import type { IOrder } from '@/commons/types';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

export const OrderHistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast>(null);
    const navigate = useNavigate();

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

    const getStatusSeverity = (status: string | undefined): 'success' | 'warning' | 'danger' | 'info' | null => {
        switch (status) {
            case 'AGUARDANDO_PAGAMENTO': return 'warning';
            case 'PAGO': return 'success';
            case 'EM_TRANSPORTE': return 'info';
            case 'ENTREGUE': return 'success';
            case 'CANCELADO': return 'danger';
            default: return 'info';
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

    const actionBodyTemplate = (order: IOrder) => {
        return (
            <div className="flex">
                {order.status?.toLowerCase() === 'pendente' && (
                    <Button
                        icon="pi pi-credit-card"
                        className="p-button-rounded p-button-success p-button-text"
                        tooltip="Finalizar Compra"
                        onClick={() => navigate(`/checkout/${order.id}`)}
                    />
                )}
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
                    dataKey="id"
                    emptyMessage="Você ainda não fez nenhum pedido."
                >
                    <Column field="id" header="Nº do Pedido" />
                    <Column field="date" header="Data" body={(order: IOrder) => formatDate(order.date)} />
                    <Column header="Status" body={(order: IOrder) => <Tag value={order.status} severity={getStatusSeverity(order.status)} />} />
                    <Column header="Total" body={(order: IOrder) => formatCurrency(calculateOrderTotal(order))} />
                    <Column header="Ações" body={actionBodyTemplate} style={{ width: '8rem', textAlign: 'center' }} />
                </DataTable>
            </Card>
        </div>
    );
};
