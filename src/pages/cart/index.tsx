import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { useCart } from '@/context/hooks/use-cart';
import OrderService from '../../services/order-service';
import type { CartItem } from '@/commons/types.ts';

export const CartPage: React.FC = () => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        clearCart,
    } = useCart();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Seu carrinho está vazio.' });
            return;
        }

        const response = await OrderService.createOrder(cartItems);

        if (response.success) {
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Pedido realizado com sucesso! Redirecionando...' });
            clearCart();
            setTimeout(() => navigate('/orders'), 2000);
        } else {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: response.message || 'Falha ao finalizar o pedido.' });
        }
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const productBodyTemplate = (item: CartItem) => {
        const imageUrl = `/images/products/${item.id}.png`;
        const placeholderUrl = `https://placehold.co/64x64/EEE/31343C?text=${item.name.charAt(0)}`;

        return (
            <div className="flex align-items-center gap-3">
                <img
                    src={imageUrl}
                    alt={item.name}
                    width="64"
                    className="shadow-1"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = placeholderUrl;
                    }}
                />
                <span className="font-semibold">{item.name}</span>
            </div>
        );
    };

    // AJUSTE: Controlando o tamanho do campo de input para diminuir o componente
    const quantityBodyTemplate = (item: CartItem) => {
        return (
            <InputNumber
                value={item.quantity}
                onValueChange={(e) => updateQuantity(item.id!, e.value ?? 0)}
                showButtons
                buttonLayout="horizontal"
                min={0}
                step={1}
                decrementButtonClassName="p-button-secondary"
                incrementButtonClassName="p-button-secondary"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                // Ajustando o estilo do campo de texto interno
                inputStyle={{width: '3rem', textAlign: 'center'}}
            />
        );
    };

    const subtotalBodyTemplate = (item: CartItem) => {
        const subtotal = item.price * item.quantity;
        return formatCurrency(subtotal);
    };

    const removeBodyTemplate = (item: CartItem) => {
        return (
            <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger p-button-text"
                onClick={() => removeFromCart(item.id!)}
            />
        );
    };

    const cartTotal = getCartTotal();

    const footer = (
        <div className="text-right text-2xl font-bold p-3">
            Total: {formatCurrency(cartTotal)}
        </div>
    );

    const tableHeader = (
        <div className="flex justify-content-between align-items-center">
            <h2 className="m-0">Itens no Carrinho</h2>
            <Button
                label="Limpar Carrinho"
                icon="pi pi-trash"
                className="p-button-text p-button-danger"
                onClick={clearCart}
                disabled={cartItems.length === 0}
            />
        </div>
    );

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Card>
                <DataTable value={cartItems} header={tableHeader} footer={footer} emptyMessage="Seu carrinho está vazio." responsiveLayout="scroll">
                    <Column header="Produto" body={productBodyTemplate} style={{ minWidth: '20rem' }}/>
                    <Column header="Preço Unitário" body={(item: CartItem) => formatCurrency(item.price)} style={{ width: '12rem', textAlign: 'right' }} headerStyle={{textAlign: 'right'}} />
                    <Column header="Quantidade" body={quantityBodyTemplate} style={{ width: '10rem', textAlign: 'center' }}/>
                    <Column header="Subtotal" body={subtotalBodyTemplate} style={{ width: '12rem', textAlign: 'right' }} headerStyle={{textAlign: 'right'}} />
                    <Column body={removeBodyTemplate} style={{ width: '6rem', textAlign: 'center' }} />
                </DataTable>

                <div className="flex justify-content-end mt-4">
                    <Button
                        label="Finalizar Compra"
                        icon="pi pi-check"
                        className="p-button-lg"
                        disabled={cartItems.length === 0}
                        onClick={handleCheckout}
                    />
                </div>
            </Card>
        </div>
    );
};