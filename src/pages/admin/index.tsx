import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { TabView, TabPanel } from 'primereact/tabview';
import { useNavigate } from 'react-router-dom';
import OrderService from '@/services/order-service';
import UserService from '@/services/user-service';
import type { IOrder } from '@/commons/types';

interface IUser {
    id: number;
    name: string;
    username: string;
    email: string;
    authorities: { authority: string }[];
}

export const AdminPage: React.FC = () => {
    // --- ESTADOS ---
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const navigate = useNavigate();

    // --- OPÇÕES ---
    const statusOptions = [
        { label: 'AGUARDANDO PAGAMENTO', value: 'AGUARDANDO_PAGAMENTO' },
        { label: 'PAGO', value: 'PAGO' },
        { label: 'CANCELADO', value: 'CANCELADO' },
        { label: 'EM TRANSPORTE', value: 'EM_TRANSPORTE' },
        { label: 'CONCLUÍDO', value: 'ENTREGUE' }
    ];

    const roleOptions = [
        { label: 'Administrador', value: 'ROLE_ADMIN' },
        { label: 'Usuário', value: 'ROLE_USER' }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([loadAllOrders(), loadAllUsers()]);
        setLoading(false);
    };

    const loadAllOrders = async () => {
        const response = await OrderService.findAll();
        if (response.success && response.data) {
            setOrders(response.data as IOrder[]);
        }
    };

    const loadAllUsers = async () => {
        const response = await UserService.findAll();
        if (response.success && response.data) {
            setUsers(response.data as IUser[]);
        }
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const calculateOrderTotal = (order: IOrder): number => {
        return order.items ? order.items.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;
    };

    const onStatusChange = (orderId: number, newStatus: string) => {
        const updatedOrders = orders.map(order => {
            if (order.id === orderId) return { ...order, status: newStatus };
            return order;
        });
        setOrders(updatedOrders);
    };

    const handleSaveStatus = async (order: IOrder) => {
        try {
            const response = await OrderService.updateStatus(order.id, order.status);
            if (response.success) {
                toast.current?.show({ severity: 'success', summary: 'Salvo', detail: `Pedido #${order.id} atualizado!` });
            } else {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: response.message });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro de conexão.' });
        }
    };

    const onAuthoritiesChange = (userId: number, newAuthorities: string[]) => {

        const updatedUsers = users.map(user => {
            if (user.id === userId) {
                const authObjects = newAuthorities.map(a => ({ authority: a }));
                return { ...user, authorities: authObjects };
            }
            return user;
        });
        setUsers(updatedUsers);
    };

    const handleSaveUserAuthorities = async (user: IUser) => {
        try {
            const authoritiesList = user.authorities.map(a => a.authority);
            const response = await UserService.updateAuthorities(user.id, authoritiesList);

            if (response.success) {
                toast.current?.show({ severity: 'success', summary: 'Salvo', detail: `Permissões de ${user.username} atualizadas!` });
            } else {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: response.message });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro de conexão.' });
        }
    };

    const statusBodyTemplate = (rowData: IOrder) => {
        return (
            <Dropdown
                value={rowData.status}
                options={statusOptions}
                onChange={(e) => onStatusChange(rowData.id, e.value)}
                placeholder="Selecione"
                className="w-full"
            />
        );
    };

    const orderActionTemplate = (order: IOrder) => {
        return (
            <div className="flex justify-content-center gap-2">
                <Button icon="pi pi-save" className="p-button-rounded p-button-success p-button-text" tooltip="Salvar Status" onClick={() => handleSaveStatus(order)} />
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-text" tooltip="Ver Detalhes" onClick={() => navigate(`/admin/orders/${order.id}`)} />
            </div>
        );
    };

    const authoritiesBodyTemplate = (rowData: IUser) => {
        const selectedRoles = rowData.authorities.map(a => a.authority);

        return (
            <MultiSelect
                value={selectedRoles}
                options={roleOptions}
                onChange={(e) => onAuthoritiesChange(rowData.id, e.value)}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione Permissões"
                display="chip"
                className="w-full"
            />
        );
    };

    const userActionTemplate = (user: IUser) => {
        return (
            <div className="flex justify-content-center">
                <Button icon="pi pi-save" className="p-button-rounded p-button-success p-button-text" tooltip="Salvar Permissões" onClick={() => handleSaveUserAuthorities(user)} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Painel Administrativo</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} placeholder="Buscar..." />
            </IconField>
        </div>
    );

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Card title={header}>
                <TabView>
                    {/* --- PEDIDOS --- */}
                    <TabPanel header="Gerenciar Pedidos" leftIcon="pi pi-shopping-cart">
                        <DataTable value={orders} dataKey="id" paginator rows={10} loading={loading} globalFilter={globalFilter} emptyMessage="Nenhum pedido encontrado." sortField="date" sortOrder={-1}>
                            <Column field="id" header="ID" sortable style={{ width: '5rem' }} />
                            <Column field="user.name" header="Cliente" sortable body={(rowData) => rowData.user?.username || 'N/A'} />
                            <Column field="date" header="Data" sortable body={(order: IOrder) => formatDate(order.date)} />
                            <Column field="status" header="Status" body={statusBodyTemplate} style={{ minWidth: '200px' }} />
                            <Column header="Total" body={(order: IOrder) => formatCurrency(calculateOrderTotal(order))} />
                            <Column header="Ações" body={orderActionTemplate} style={{ width: '10rem', textAlign: 'center' }} />
                        </DataTable>
                    </TabPanel>

                    {/* --- USUÁRIOS --- */}
                    <TabPanel header="Gerenciar Usuários" leftIcon="pi pi-users">
                        <DataTable value={users} dataKey="id" paginator rows={10} loading={loading} globalFilter={globalFilter} emptyMessage="Nenhum usuário encontrado.">
                            <Column field="id" header="ID" sortable style={{ width: '5rem' }} />
                            <Column field="name" header="Nome" sortable />
                            <Column field="username" header="Username" sortable />
                            <Column field="email" header="E-mail" sortable />
                            <Column header="Permissões" body={authoritiesBodyTemplate} style={{ minWidth: '250px' }} />
                            <Column header="Ações" body={userActionTemplate} style={{ width: '6rem', textAlign: 'center' }} />
                        </DataTable>
                    </TabPanel>
                </TabView>
            </Card>
        </div>
    );
};