import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Panel } from 'primereact/panel';
import OrderService from '@/services/order-service';
import AddressService from '@/services/address-service';
import type { IOrder, IOrderItem, IAddress } from '@/commons/types';
import { useCart } from '@/context/hooks/use-cart';

export const CheckoutPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { clearCart } = useCart();

    const [order, setOrder] = useState<IOrder | null>(null);
    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) {
                navigate('/cart');
                return;
            }
            setLoading(true);
            try {
                const [orderResponse, addressResponse] = await Promise.all([
                    OrderService.findById(Number(id)),
                    AddressService.findAll()
                ]);

                if (orderResponse.success && orderResponse.data) {
                    setOrder(orderResponse.data as IOrder);
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Pedido não encontrado.' });
                    navigate('/orders');
                    return;
                }

                if (addressResponse.success && addressResponse.data) {
                    setAddresses(addressResponse.data as IAddress[]);
                } else {
                    toast.current?.show({ severity: 'warn', summary: 'Aviso', detail: 'Nenhum endereço cadastrado.' });
                }

            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar os dados.' });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, navigate]);

    const handleConfirmOrder = async () => {
        if (!selectedAddress) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Por favor, selecione um endereço de entrega.' });
            return;
        }
        if (!order) return;

        setIsSubmitting(true);

        try {
            const addressUpdateResponse = await OrderService.updateOrderAddress(order.id, selectedAddress);

            if (!addressUpdateResponse.success) {
                throw new Error(addressUpdateResponse.message || 'Falha ao atualizar o endereço.');
            }

            const statusUpdateResponse = await OrderService.updateStatus(order.id, 'Concluído');

            if (!statusUpdateResponse.success) {
                throw new Error(statusUpdateResponse.message || 'Falha ao atualizar o status.');
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Pedido concluído com sucesso!'
            });
            clearCart();
            setTimeout(() => {
                navigate('/orders');
            }, 2000);

        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.message || 'Falha ao concluir o pedido.' });
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const addressOptions = addresses.map(addr => ({
        label: `${addr.neighborhood} - ${addr.street}, ${addr.number}`,
        value: addr.id
    }));

    if (loading) {
        return <div className="flex justify-content-center align-items-center" style={{ height: '80vh' }}><ProgressSpinner /></div>;
    }

    if (!order) {
        return <div className="p-4 text-center">Pedido não encontrado.</div>;
    }

    const orderTotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Card title="Finalizar Compra">
                <div className="grid">
                    <div className="col-12 md:col-7">
                        <Panel header={`Itens do Pedido Nº ${order.id}`}>
                            <DataTable value={order.items}>
                                <Column field="productId" header="Produto (ID)" />
                                <Column field="quantity" header="Qtd." />
                                <Column header="Preço" body={(item: IOrderItem) => formatCurrency(item.price)} />
                                <Column header="Subtotal" body={(item: IOrderItem) => formatCurrency(item.price * item.quantity)} />
                            </DataTable>
                            <div className="text-right text-2xl font-bold mt-3">
                                Total: {formatCurrency(orderTotal)}
                            </div>
                        </Panel>
                    </div>

                    <div className="col-12 md:col-5">
                        <Panel header="Entrega e Pagamento">
                            <div className="field">
                                <label htmlFor="address">Selecione o Endereço de Entrega</label>
                                <Dropdown
                                    id="address"
                                    value={selectedAddress}
                                    options={addressOptions}
                                    onChange={(e) => setSelectedAddress(e.value)}
                                    placeholder="Escolha um endereço..."
                                    className="w-full"
                                    disabled={addresses.length === 0}
                                />
                                <Button
                                    label="Cadastrar Novo Endereço"
                                    icon="pi pi-plus"
                                    className="p-button-text mt-2 btnForm"
                                    onClick={() => navigate('/addresses/new')}
                                />
                            </div>

                            <Divider />

                            <div className="flex flex-column gap-2">
                                <p>Clique abaixo para confirmar seu pedido.</p>
                                <Button
                                    label="Concluir Pedido"
                                    icon="pi pi-check"
                                    className="p-button-success w-full btnForm"
                                    onClick={handleConfirmOrder}
                                    disabled={!selectedAddress || isSubmitting}
                                    loading={isSubmitting}
                                />
                            </div>
                        </Panel>
                    </div>
                </div>
            </Card>
        </div>
    );
};