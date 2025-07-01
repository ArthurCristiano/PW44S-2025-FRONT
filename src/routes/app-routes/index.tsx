import { Route, Routes } from "react-router-dom";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { HomePage } from "@/pages/home";
import { RequireAuth } from "@/components/require-auth";
import { Layout } from "@/components/layout";
import { CartPage } from "@/pages/cart";
import { OrderHistoryPage } from "@/pages/orders";
import { AddressFormPage  } from "@/pages/address/index.tsx";
import { AddressListPage } from "@/pages/address/AddressListPage.tsx";
import { CheckoutPage } from "@/pages/checkout/index.tsx";

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                {/* protected routes */}
                <Route element={<RequireAuth />}>
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/orders" element={<OrderHistoryPage />} />
                    <Route path="/addresses" element={<AddressListPage />} />
                    <Route path="/addresses/new" element={<AddressFormPage />} />
                    <Route path="/addresses/edit/:id" element={<AddressFormPage />} />
                    <Route path="/checkout/:id?" element={<CheckoutPage />} />
                </Route>
            </Route>
        </Routes>
    );
}