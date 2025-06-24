import React, { useEffect, useState } from "react";
import { Menubar } from "primereact/menubar";
import  type { MenuItem } from "primereact/menuitem";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/hooks/use-auth.ts";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import logoSrc from "@/assets/images/logo.png";
import { useCart } from "@/context/hooks/use-cart";
import { Badge } from 'primereact/badge';

const TopMenu: React.FC = () => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        return localStorage.getItem("theme") === "dark";
    });
    const { authenticated, handleLogout } = useAuth();
    const { cartCount } = useCart();

    useEffect(() => {
        const themeLink = document.getElementById("theme-link") as HTMLLinkElement;
        if (themeLink) {
            themeLink.href = darkMode
                ? "https://unpkg.com/primereact/resources/themes/lara-dark-blue/theme.css"
                : "https://unpkg.com/primereact/resources/themes/lara-light-blue/theme.css";
        }
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const handleLogoutClick = () => {
        handleLogout();
        navigate("/login");
    };

    // CORREÇÃO: Todos os links de navegação foram unificados no Menubar
    const menuItems: MenuItem[] = authenticated
        ? [
            { label: "Home", icon: "pi pi-home", command: () => navigate("/home") },
            {
                label: "Categorias",
                icon: "pi pi-box",
                items: [
                    { label: "Listar", icon: "pi pi-list", command: () => navigate("/categories") },
                    { label: "Nova", icon: "pi pi-plus", command: () => navigate("/categories/new") },
                ]
            },
            { label: "Produtos", icon: "pi pi-shopping-bag", command: () => navigate("/products") },
            {
                label: "Carrinho",
                icon: "pi pi-shopping-cart",
                command: () => navigate("/cart"),
                template: (item, options) => (
                    <a onClick={options.onClick} className={options.className} role="menuitem">
                        <span className={options.iconClassName}></span>
                        <span className={options.labelClassName}>{item.label}</span>
                        {cartCount > 0 && <Badge value={cartCount} severity="danger" className="ml-2"></Badge>}
                    </a>
                )
            },
            { label: "Pedidos", icon: "pi pi-receipt", command: () => navigate("/orders") },
        ]
        : [];

    const logo = (
        <div
            className="flex align-items-center gap-2 cursor-pointer mr-4"
            onClick={() => navigate("/")}
        >
            <img
                src={logoSrc}
                alt="Logo"
                height={40}
                style={{ objectFit: "contain" }}
            />
        </div>
    );

    const controls = (
        <div className="flex align-items-center gap-3">
            <div className="flex align-items-center gap-2">
                <i className={`pi pi-sun ${!darkMode && "text-yellow-500"}`} />
                <InputSwitch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.value ?? false)}
                />
                <i className={`pi pi-moon ${darkMode && "text-blue-300"}`} />
            </div>

            {authenticated && (
                <>
                    <Button
                        icon="pi pi-sign-out"
                        className="p-button-text p-button-secondary"
                        tooltip="Sair"
                        onClick={handleLogoutClick}
                    />
                </>
            )}
        </div>
    );

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
            }}
            className="w-full"
        >
            <div className="flex align-items-center p-3 surface-card shadow-2">
                {/* CORREÇÃO: O Menubar agora controla toda a navegação principal */}
                <div className="flex align-items-center">
                    {logo}
                    <Menubar model={menuItems} className="border-none p-0 bg-transparent" />
                </div>

                <div className="flex-grow-1 flex justify-content-center px-4">
                    <span className="w-full" style={{ maxWidth: '500px' }}>
                        <InputText placeholder="Pesquisar produtos..." className="w-full" />
                    </span>
                </div>

                <div className="flex align-items-center">
                    {controls}
                </div>
            </div>
        </header>
    );
};

export default TopMenu;