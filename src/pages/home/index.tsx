import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import ProductService from '@/services/product-service';
import type { IProduct } from '@/commons/types';
import { useCart } from '@/context/hooks/use-cart'

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/hooks/use-auth';

export const HomePage: React.FC = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const { findAll } = ProductService;
    const toast = useRef<Toast>(null);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const { authenticated  } = useAuth();

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

    const handleAddToCart = (e: React.MouseEvent, product: IProduct) => {
        e.stopPropagation();
        if (authenticated) {
            addToCart(product);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: `${product.name} adicionado ao carrinho!`,
                life: 2000
            });
        } else {
            toast.current?.show({
                severity: 'info',
                summary: 'Login Necessário',
                detail: 'Faça login para adicionar produtos ao carrinho.',
                life: 3000
            });

            setTimeout(() => {
                navigate('/login');
            }, 1000);
        }
    };

    const cardHeader = (product: IProduct) => {
        const imageUrl = `/images/products/${product.id}.png`;
        const placeholderUrl = `https://placehold.co/600x400/EEE/31343C?text=${product.name.replace(/\s/g, '+')}`;

        return (
            <div className="overflow-hidden border-round-top">
                <img
                    alt={product.name}
                    src={imageUrl}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = placeholderUrl;
                    }}
                    className="w-full h-15rem object-cover transform hover:scale-110 transition-duration-300"
                />
            </div>
        );
    };

    const cardFooter = (product: IProduct) => (
        <div className="pt-2">
            <Button
                label="Adicionar ao Carrinho"
                icon="pi pi-shopping-cart"
                className="w-full btnForm"
                onClick={(e) => handleAddToCart(e, product)}
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
        <div className="surface-section px-4 py-8 md:px-6 lg:px-8">
            <Toast ref={toast} />
            <div className="text-center font-bold text-4xl mb-6">
                <span className="text-900">Nossos </span>
                <span className="text-blue-600">Produtos</span>
            </div>

            <div className="grid -m-2">
                {products.map(product => (
                    <div key={product.id} className="col-12 md:col-6 lg:col-4 p-2">
                        <div
                            className="p-4 border-1 surface-border surface-card border-round h-full flex flex-column cursor-pointer hover:shadow-4 transition-duration-200"
                            onClick={() => navigate(`/products/details/${product.id}`)}
                        >
                            {cardHeader(product)}
                            <div className="flex-1 flex flex-column justify-content-between py-3">
                                <div>
                                    <Tag value={product.category.name} className="mr-2" />
                                    <div className="text-xl font-bold text-900 mt-2 truncate">
                                        {product.name}
                                    </div>
                                    <p className="mt-2 mb-3 text-color-secondary" style={{ height: '3em', overflow: 'hidden' }}>
                                        {product.description}
                                    </p>
                                </div>
                                <div className="text-2xl font-semibold">
                                    {formatCurrency(product.price)}
                                </div>
                            </div>
                            {cardFooter(product)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};