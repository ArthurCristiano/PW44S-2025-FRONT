import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable, type DataTableFilterMeta } from 'primereact/datatable';
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
import { FilterMatchMode } from 'primereact/api';
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

    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        id: { value: null, matchMode: FilterMatchMode.EQUALS },
        'user.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
        'user.username': { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');

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
        initFilters(); // Inicializa filtros
    }, []);

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            id: { value: null, matchMode: FilterMatchMode.EQUALS },
            'user.username': { value: null, matchMode: FilterMatchMode.CONTAINS }
        });
        setGlobalFilterValue('');
    };

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

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };

        // @ts-ignore
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const onColumnFilterChange = (field: string, value: any) => {
        let _filters = { ...filters };
        // @ts-ignore
        _filters[field].value = value;
        setFilters(_filters);
    };

    const clearFilters = () => {
        initFilters();
    };

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : '-';
    const calculateOrderTotal = (order: IOrder) => order.items ? order.items.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;

    const onStatusChange = (orderId: number, newStatus: string) => {
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);
    };

    const handleSaveStatus = async (order: IOrder) => {
        try {
            const response = await OrderService.updateStatus(order.id, order.status);
            if (response.success) toast.current?.show({ severity: 'success', summary: 'Salvo', detail: `Pedido #${order.id} atualizado!` });
            else toast.current?.show({ severity: 'error', summary: 'Erro', detail: response.message });
        } catch { toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro de conexão.' }); }
    };

    const onAuthoritiesChange = (userId: number, newAuthorities: string[]) => {
        const updatedUsers = users.map(u => u.id === userId ? { ...u, authorities: newAuthorities.map(a => ({ authority: a })) } : u);
        setUsers(updatedUsers);
    };

    const handleSaveUserAuthorities = async (user: IUser) => {
        try {
            const response = await UserService.updateAuthorities(user.id, user.authorities.map(a => a.authority));
            if (response.success) toast.current?.show({ severity: 'success', summary: 'Salvo', detail: `Permissões de ${user.username} atualizadas!` });
            else toast.current?.show({ severity: 'error', summary: 'Erro', detail: response.message });
        } catch { toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro de conexão.' }); }
    };

    const statusBodyTemplate = (rowData: IOrder) => (
        <Dropdown value={rowData.status} options={statusOptions} onChange={(e) => onStatusChange(rowData.id, e.value)} placeholder="Selecione" className="w-full" />
    );

    const orderActionTemplate = (order: IOrder) => (
        <div className="flex justify-content-center gap-2">
            <Button icon="pi pi-save" className="p-button-rounded p-button-success p-button-text" tooltip="Salvar Status" onClick={() => handleSaveStatus(order)} />
            <Button icon="pi pi-pencil" className="p-button-rounded p-button-info p-button-text" tooltip="Ver Detalhes" onClick={() => navigate(`/admin/orders/${order.id}`)} />
        </div>
    );

    const authoritiesBodyTemplate = (rowData: IUser) => (
        <MultiSelect value={rowData.authorities.map(a => a.authority)} options={roleOptions} onChange={(e) => onAuthoritiesChange(rowData.id, e.value)} optionLabel="label" optionValue="value" placeholder="Selecione" display="chip" className="w-full" />
    );

    const userActionTemplate = (user: IUser) => (
        <div className="flex justify-content-center">
            <Button icon="pi pi-save" className="p-button-rounded p-button-success p-button-text" tooltip="Salvar Permissões" onClick={() => handleSaveUserAuthorities(user)} />
        </div>
    );

    const renderHeader = () => {
        return (
            <div className="flex flex-column md:flex-row md:justify-content-between gap-3 align-items-center">
                <div className="flex align-items-center gap-2">
                    <h4 className="m-0">Painel Administrativo</h4>
                    <Button type="button" icon="pi pi-filter-slash" label="Limpar" outlined size="small" onClick={clearFilters} />
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="p-input-icon-left">
                        <InputText
                            placeholder="ID do Pedido"
                            // @ts-ignore
                            value={filters['id']?.value || ''}
                            onChange={(e) => onColumnFilterChange('id', e.target.value)}
                            className="w-8rem"
                        />
                    </span>

                    <span className="p-input-icon-left">
                        <InputText
                            placeholder="Nome do Cliente"
                            // @ts-ignore
                            value={filters['user.username']?.value || ''}
                            onChange={(e) => onColumnFilterChange('user.username', e.target.value)}
                            className="w-12rem"
                        />
                    </span>

                </div>
            </div>
        );
    };

    const header = renderHeader();

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Card title={header}>
                <TabView>
                    <TabPanel header="Gerenciar Pedidos" leftIcon="pi pi-shopping-cart">
                        <DataTable
                            value={orders}
                            dataKey="id"
                            paginator
                            rows={10}
                            loading={loading}

                            filters={filters}
                            globalFilterFields={['id', 'user.name', 'user.username', 'status']}

                            emptyMessage="Nenhum pedido encontrado."
                            sortField="date"
                            sortOrder={-1}
                        >
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
                        <DataTable value={users} dataKey="id" paginator rows={10} loading={loading} filters={filters} globalFilterFields={['name', 'username', 'email']} emptyMessage="Nenhum usuário encontrado.">
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