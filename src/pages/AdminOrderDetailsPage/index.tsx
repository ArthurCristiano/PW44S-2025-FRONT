import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { FileUpload, type FileUploadHandlerEvent } from 'primereact/fileupload';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Panel } from 'primereact/panel';
import OrderService from '@/services/order-service';
import type { IOrder } from '@/commons/types';

interface IAttachment {
    id: number;
    fileName: string;
    fileType: string;
}

export const AdminOrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<IOrder | null>(null);
    const [attachments, setAttachments] = useState<IAttachment[]>([]);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        loadOrderData();
    }, [id]);

    const loadOrderData = async () => {
        if (!id) return;
        const orderRes = await OrderService.findById(Number(id));
        if (orderRes.success) setOrder(orderRes.data as IOrder);

        loadAttachments();
    };

    const loadAttachments = async () => {
        if (!id) return;
        const attachRes = await OrderService.getAttachments(Number(id));
        if (attachRes.success) setAttachments(attachRes.data);
    };

    const handleUpload = async (event: FileUploadHandlerEvent) => {
        const file = event.files[0];
        const response = await OrderService.uploadAttachment(Number(id), file);

        if (response.success) {
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Arquivo enviado!' });
            event.options.clear();
            loadAttachments();
        } else {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha no envio.' });
        }
    };

    const handleView = (rowData: IAttachment) => {
        OrderService.viewAttachment(rowData.id, rowData.fileType);
    };

    const actionTemplate = (rowData: IAttachment) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-text"
                    onClick={() => handleView(rowData)}
                    tooltip="Visualizar"
                />

                <Button
                    icon="pi pi-download"
                    className="p-button-rounded p-button-secondary p-button-text"
                    onClick={() => OrderService.downloadAttachment(rowData.id, rowData.fileName)}
                    tooltip="Baixar"
                />
            </div>
        );
    };

    if (!order) return <div>Carregando...</div>;

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Button label="Voltar" icon="pi pi-arrow-left" className="mb-3 p-button-text" onClick={() => navigate('/admin/dashboard')} />

            <div className="grid">
                <div className="col-12 md:col-6">
                    <Card title={`Pedido #${order.id}`}>
                        <p><strong>Status:</strong> {order.status}</p>
                        <p><strong>Data:</strong> {new Date(order.date).toLocaleDateString()}</p>

                        <DataTable value={order.items} header="Itens do Pedido" className="mt-3">
                            <Column field="product.name" header="Produto" body={(item) => item.product?.name || item.productId} />
                            <Column field="quantity" header="Qtd" />
                            <Column field="price" header="Preço Unit." body={(item) => item.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} />
                        </DataTable>
                    </Card>
                </div>

                <div className="col-12 md:col-6">
                    <Panel header="Anexos (Notas, Comprovantes)">

                        {/* Upload */}
                        <div className="mb-4">
                            <FileUpload
                                mode="basic"
                                name="file"
                                customUpload
                                uploadHandler={handleUpload}
                                accept="image/*,application/pdf"
                                maxFileSize={10000000}
                                chooseLabel="Anexar Arquivo"
                                auto
                                className="w-full"
                            />
                        </div>

                        <DataTable value={attachments} emptyMessage="Nenhum anexo.">
                            <Column field="fileName" header="Nome do Arquivo" style={{wordBreak: 'break-all'}} />
                            <Column body={actionTemplate} style={{width: '4rem'}} />
                        </DataTable>
                    </Panel>
                </div>
            </div>
        </div>
    );
};