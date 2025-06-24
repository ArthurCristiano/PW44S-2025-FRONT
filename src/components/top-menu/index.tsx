import React, { useEffect, useState } from "react";
import { Menubar } from "primereact/menubar";
import  type { MenuItem } from "primereact/menuitem";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/hooks/use-auth.ts";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import logoSrc from "@/assets/images/logo.png";

const TopMenu: React.FC = () => {

    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        return localStorage.getItem("theme") === "dark";
    });
    const { authenticated, handleLogout } = useAuth();

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

    const menuItems: MenuItem[] = authenticated
        ? [{ label: "Home", icon: "pi pi-home", command: () => navigate("/") }]
        : [];

    const categoryOptions = [
        { label: "Listar Categorias", value: "/categories" },
        { label: "Nova Categoria", value: "/categories/new" },
    ];

    const productOptions = [
        { label: "Listar Produtos", value: "/products" },
        { label: "Novo Produto", value: "/products/new" },
    ];

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
            {/*<span className="font-bold text-lg hidden sm:block">PW44S</span>*/}
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

                <div className="flex align-items-center">
                    {logo}
                    <Menubar model={menuItems} className="border-none p-0 bg-transparent" />

                    {authenticated && (
                        <div className="flex align-items-center">
                            <Dropdown
                                value={null}
                                options={categoryOptions}
                                onChange={(e) => { if (e.value) navigate(e.value); }}
                                placeholder="Categorias"
                                className="border-none shadow-none bg-transparent text-color"
                                style={{ "width": "160px" }}
                            />
                            <Dropdown
                                value={null}
                                options={productOptions}
                                onChange={(e) => { if (e.value) navigate(e.value); }}
                                placeholder="Produtos"
                                className="border-none shadow-none bg-transparent text-color"
                                style={{ "width": "150px" }}
                            />
                        </div>
                    )}
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