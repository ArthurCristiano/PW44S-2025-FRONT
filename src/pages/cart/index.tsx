import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { useCart } from '@/context/hooks/use-cart';
import OrderService from '@/services/order-service';
import type { CartItem, IShippingOption, IOrder } from '@/commons/types.ts';
import { Divider } from 'primereact/divider';
import { RadioButton } from 'primereact/radiobutton';
import {InputText} from "primereact/inputtext";
import ShippingService from '@/services/shipping-service.ts';

export const CartPage: React.FC = () => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        clearCart,
        selectedShipping,
        selectShippingOption,
    } = useCart();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    const [cep, setCep] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const [shippingOptions, setShippingOptions] = useState<IShippingOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCalculateShipping = async () => {
        if (!cep.trim() || cep.replace(/\D/g, '').length !== 8) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Por favor, insira um CEP válido.' });
            return;
        }
        setIsCalculating(true);
        selectShippingOption(null);
        const response = await ShippingService.calculateShipping(cep);

        if (response.success && Array.isArray(response.data)) {
            setShippingOptions(response.data);
            if(response.data.length === 0) {
                toast.current?.show({ severity: 'warn', summary: 'Aviso', detail: 'Nenhuma opção de frete encontrada para este CEP.' });
            }
        } else {
            toast.current?.show({ severity: 'error', summary: 'Erro de Frete', detail: response.message });
            setShippingOptions([]);
        }
        setIsCalculating(false);
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Seu carrinho está vazio.' });
            return;
        }

        setIsSubmitting(true);
        const response = await OrderService.createOrder(cartItems);

        if (response.success && response.data) {
            const newOrder = response.data as IOrder;
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Seu pedido foi iniciado! Selecione o endereço para finalizar.' });

            setTimeout(() => navigate(`/checkout/${newOrder.id}`), 1500);
        } else {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: response.message || 'Falha ao iniciar o pedido.' });
        }
        setIsSubmitting(false);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const productBodyTemplate = (item: CartItem) => {
        const imageUrl = `/images/products/${item.id}.png`;
        const placeholderUrl = `https://placehold.co/64x64/EEE/31343C?text=${item.name.charAt(0)}`;
        return (
            <div className="flex align-items-center gap-3">
                <img src={imageUrl} alt={item.name} width="64" className="shadow-1" onError={(e) => { (e.target as HTMLImageElement).src = placeholderUrl; }}/>
                <span className="font-semibold">{item.name}</span>
            </div>
        );
    };

    const quantityBodyTemplate = (item: CartItem) => (
        <InputNumber value={item.quantity} onValueChange={(e) => updateQuantity(item.id!, e.value ?? 0)} showButtons buttonLayout="horizontal" min={0} step={1} decrementButtonClassName="p-button-secondary p-button-sm" incrementButtonClassName="p-button-secondary p-button-sm" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" inputStyle={{width: '3rem', textAlign: 'center'}} />
    );

    const subtotalBodyTemplate = (item: CartItem) => formatCurrency(item.price * item.quantity);
    const removeBodyTemplate = (item: CartItem) => <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" onClick={() => removeFromCart(item.id!)} />;

    const subtotal = getCartTotal();
    const finalTotal = subtotal + (selectedShipping?.price || 0);

    const tableHeader = (
        <div className="flex justify-content-between align-items-center">
            <h2 className="m-0">Itens no Carrinho</h2>
            <Button label="Limpar Carrinho" icon="pi pi-trash" className="p-button-text p-button-danger" onClick={clearCart} disabled={cartItems.length === 0} />
        </div>
    );

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Card>
                <DataTable value={cartItems} header={tableHeader} emptyMessage="Seu carrinho está vazio." responsiveLayout="scroll">
                    <Column header="Produto" body={productBodyTemplate} style={{ minWidth: '20rem' }}/>
                    <Column header="Preço Unitário" body={(item: CartItem) => formatCurrency(item.price)} style={{ width: '12rem', textAlign: 'right' }} headerStyle={{textAlign: 'right'}} />
                    <Column header="Quantidade" body={quantityBodyTemplate} style={{ width: '10rem', textAlign: 'center' }}/>
                    <Column header="Subtotal" body={subtotalBodyTemplate} style={{ width: '12rem', textAlign: 'right' }} headerStyle={{textAlign: 'right'}} />
                    <Column body={removeBodyTemplate} style={{ width: '6rem', textAlign: 'center' }} />
                </DataTable>

                <div className="grid mt-4">
                    <div className="col-12 md:col-6">
                        <div className="p-fluid">
                            <label htmlFor="cep" className="font-bold block mb-2">Calcular Frete</label>
                            <div className="p-inputgroup">
                                <InputText id="cep" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="Digite seu CEP" />
                                <Button label="Calcular" icon="pi pi-send" onClick={handleCalculateShipping} loading={isCalculating} />
                            </div>
                        </div>
                        {shippingOptions.length > 0 && (
                            <div className="mt-3 flex flex-column gap-3">
                                {shippingOptions.map((option) => (
                                    <div key={option.id} className="flex align-items-center">
                                        <RadioButton inputId={String(option.id)} name="shippingOption" value={option} onChange={(e) => selectShippingOption(e.value)} checked={selectedShipping?.id === option.id} />
                                        <label htmlFor={String(option.id)} className="ml-2 cursor-pointer">
                                            {option.name} - <strong>{formatCurrency(option.price)}</strong> (Prazo: {option.delivery_time} dias)
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="surface-100 p-3 border-round">
                            <h3 className="mt-0">Resumo do Pedido</h3>
                            <Divider />
                            <div className="flex justify-content-between mb-2">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span>Frete</span>
                                <span>{selectedShipping ? formatCurrency(selectedShipping.price) : 'A calcular'}</span>
                            </div>
                            <Divider />
                            <div className="flex justify-content-between text-xl font-bold">
                                <span>Total</span>
                                <span>{formatCurrency(finalTotal)}</span>
                            </div>
                            <Button
                                label="Finalizar Compra"
                                icon="pi pi-check"
                                className="p-button-lg w-full mt-3 btnForm"
                                disabled={cartItems.length === 0}
                                onClick={handleCheckout}
                                loading={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};