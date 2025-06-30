import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import AddressService from '@/services/address-service';
import type { IAddress } from "@/commons/types";

export const AddressListPage: React.FC = () => {
    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    // Efeito para carregar os endereços do usuário ao montar o componente
    useEffect(() => {
        const loadAddresses = async () => {
            setLoading(true);
            const response = await AddressService.findAll();
            if (response.success && response.data) {
                setAddresses(response.data as IAddress[]);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: response.message || 'Falha ao carregar endereços.' });
            }
            setLoading(false);
        };
        loadAddresses();
    }, []);

    const handleDelete = (address: IAddress) => {
        confirmDialog({
            message: `Tem certeza que deseja excluir o endereço "${address.description}"?`,
            header: 'Confirmação de Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: async () => {
                if (address.id) {
                    const response = await AddressService.remove(address.id);
                    if (response.success) {
                        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: response.message });
                        setAddresses(prev => prev.filter(addr => addr.id !== address.id));
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Erro', detail: response.message || 'Falha ao excluir endereço.' });
                    }
                }
            }
        });
    };

    // Template para a coluna de ações (botões de editar e excluir)
    const actionBodyTemplate = (rowData: IAddress) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-success p-button-text"
                    onClick={() => navigate(`/addresses/edit/${rowData.id}`)}
                    tooltip="Editar"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-text"
                    onClick={() => handleDelete(rowData)}
                    tooltip="Excluir"
                />
            </div>
        );
    };

    const toolbarContent = (
        <React.Fragment>
            <Button
                label="Novo Endereço"
                icon="pi pi-plus"
                className="p-button-success btnForm"
                onClick={() => navigate('/addresses/new')}
            />
        </React.Fragment>
    );

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <ConfirmDialog />
            <Card title="Meus Endereços">
                <Toolbar className="mb-4" start={toolbarContent}></Toolbar>
                <DataTable value={addresses} loading={loading} paginator rows={10} dataKey="id"
                           emptyMessage="Nenhum endereço cadastrado.">
                    <Column field="complement" header="Descrição" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="street" header="Rua / Logradouro" sortable style={{ minWidth: '15rem' }}></Column>
                    <Column field="city" header="Cidade" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="state" header="Estado" sortable style={{ width: '8rem' }}></Column>
                    <Column body={actionBodyTemplate} header="Ações" style={{ width: '10rem', textAlign: 'center' }}></Column>
                </DataTable>
            </Card>
        </div>
    );
};
