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

    // Função para finalizar a compra
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Seu carrinho está vazio.' });
            return;
        }

        const response = await OrderService.createOrder(cartItems);

        if (response.success) {
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Pedido realizado com sucesso!' });
            clearCart(); // Limpa o carrinho local
            setTimeout(() => navigate('/orders'), 2000); // Redireciona para a página de pedidos (a ser criada)
        } else {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: response.message || 'Falha ao finalizar o pedido.' });
        }
    };

    // Template para a coluna de quantidade (InputNumber)
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
                style={{ width: '8rem' }}
            />
        );
    };

    // Template para o subtotal de cada item
    const subtotalBodyTemplate = (item: CartItem) => {
        const subtotal = item.price * item.quantity;
        return subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Template para o botão de remover item
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
        <div className="text-right text-2xl font-bold">
            Total: {cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
    );

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Card title="Meu Carrinho de Compras">
                <DataTable value={cartItems} footer={footer} emptyMessage="Seu carrinho está vazio.">
                    <Column field="name" header="Produto" />
                    <Column header="Preço Unitário" body={(item: CartItem) => item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <Column header="Quantidade" body={quantityBodyTemplate} />
                    <Column header="Subtotal" body={subtotalBodyTemplate} />
                    <Column body={removeBodyTemplate} style={{ width: '5rem', textAlign: 'center' }} />
                </DataTable>

                <div className="flex justify-content-end mt-4">
                    <Button
                        label="Finalizar Compra"
                        icon="pi pi-check"
                        disabled={cartItems.length === 0}
                        onClick={handleCheckout}
                    />
                </div>
            </Card>
        </div>
    );
};
