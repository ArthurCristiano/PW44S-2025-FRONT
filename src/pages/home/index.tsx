import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import ProductService from '@/services/product-service';
import type { IProduct } from '@/commons/types';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/hooks/use-cart'

export const HomePage: React.FC = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const { findAll } = ProductService;
    const toast = useRef<Toast>(null);
    const { addToCart } = useCart();

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const response = await findAll();
                if (response.status === 200 && response.data) {
                    setProducts(Array.isArray(response.data) ? response.data : []);
                } else {
                    toast.current?.show({
                        severity: "error",
                        summary: "Erro",
                        detail: response.message || "Não foi possível carregar os produtos.",
                        life: 3000,
                    });
                }
            } catch (error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Erro de Conexão",
                    detail: "Não foi possível conectar à API para carregar os produtos.",
                    life: 3000,
                });
            }
            setLoading(false);
        };
        loadProducts();
    }, [findAll]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleAddToCart = (product: IProduct) => {
        addToCart(product);
        toast.current?.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: `${product.name} adicionado ao carrinho!`,
            life: 2000
        });
    };

    const cardHeader = (product: IProduct) => {
        const imageUrl = `"@/assets/images/products/${product.id}.png`;
        const placeholderUrl = `https://placehold.co/600x400/EEE/31343C?text=${product.name.replace(/\s/g, '+')}`;

        return (
            <img
                alt={product.name}
                src={imageUrl}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = placeholderUrl;
                }}
                className="w-full h-15rem object-cover"
            />
        );
    };

    const cardFooter = (product: IProduct) => (
        <div className="flex justify-content-end">
            <Button
                label="Adicionar ao Carrinho"
                icon="pi pi-shopping-cart"
                onClick={() => handleAddToCart(product)}
            />
        </div>
    );

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
            <h1 className="text-3xl font-bold mb-4">Nossos Produtos</h1>

            <div className="grid">
                {products.map(product => (
                    <div key={product.id} className="col-12 md:col-6 lg:col-4 xl:col-3 p-2">
                        <Card
                            title={product.name}
                            subTitle={<Tag value={product.category.name} />}
                            header={() => cardHeader(product)}
                            footer={() => cardFooter(product)}
                            className="shadow-2 h-full flex flex-column"
                        >
                            <div className="flex flex-column justify-content-between flex-grow-1">
                                <div>
                                    <p className="m-0 text-xl font-semibold">
                                        {formatCurrency(product.price)}
                                    </p>
                                    <p className="mt-2 mb-0 text-color-secondary">
                                        {product.description}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};
