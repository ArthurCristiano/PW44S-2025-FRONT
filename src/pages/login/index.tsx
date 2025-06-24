import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/hooks/use-auth";
import AuthService from "@/services/auth-service";
import type { AuthenticationResponse, IUserLogin } from "@/commons/types";
import { Card } from "primereact/card";

export const LoginPage = () => {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IUserLogin>({ defaultValues: { username: "", password: "" } });

    const { login } = AuthService;
    const { handleLogin } = useAuth();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (userLogin: IUserLogin) => {
        setLoading(true);
        try {
            const response = await login(userLogin);
            if (response.status === 200 && response.data) {
                const authenticationResponse = response.data as AuthenticationResponse;
                handleLogin(authenticationResponse);

                toast.current?.show({
                    severity: "success",
                    summary: "Sucesso",
                    detail: "Login efetuado com sucesso.",
                    life: 3000,
                });

                setTimeout(() => {
                    navigate("/");
                }, 1000);
            } else {
                toast.current?.show({
                    severity: "error",
                    summary: "Erro",
                    detail: "Falha ao efetuar login.",
                    life: 3000,
                });
            }
        } catch {
            toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: "Falha ao efetuar login.",
                life: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="align-items-center">
            <Toast ref={toast} />
            <Card title="Login" className="w-full sm:w-20rem shadow-2">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-column gap-4">
                        <div>
                            <label htmlFor="username" className="form-label text-white">Usuário</label>
                            <Controller
                                name="username"
                                control={control}
                                rules={{ required: "Informe o nome de usuário" }}
                                render={({ field }) => (
                                    <InputText
                                        id="username"
                                        {...field}
                                        className={`form-control w-full ${errors.username ? 'input-error' : ''}`}
                                    />
                                )}
                            />
                            {errors.username && (
                                <span className="error">{errors.username.message}</span>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label text-white">Senha</label>
                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: "Informe a senha" }}
                                render={({ field }) => (
                                    <Password
                                        id="password"
                                        {...field}
                                        toggleMask
                                        feedback={false}
                                        className="w-full"
                                        inputClassName={`form-control w-full ${errors.password ? 'input-error' : ''}`}

                                    />
                                )}
                            />
                            {errors.password && (
                                <span className="error">{errors.password.message}</span>
                            )}
                        </div>

                        <Button
                            type="submit"
                            label="Login"
                            icon="pi pi-sign-in"
                            className="btnForm"
                            loading={loading || isSubmitting}
                            disabled={loading || isSubmitting}
                        />

                        <div className="text-center mt-3">
                            <Link to="/register" className="register-link">
                                Não possui conta? Registre-se
                            </Link>
                        </div>

                    </form>
            </Card>
        </div>
    );
};
