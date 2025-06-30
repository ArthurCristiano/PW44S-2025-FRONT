import { useForm, Controller } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Link, useNavigate } from "react-router-dom";
import { classNames } from "primereact/utils";
import { useRef, useState } from "react";
import type { IUserRegister } from "@/commons/types";
import AuthService from "@/services/auth-service";
import { Toast } from "primereact/toast";

export const RegisterPage = () => {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IUserRegister>({
        defaultValues: { name: "", username: "", email: "", password: "" },
    });

    const { signup } = AuthService;
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    const onSubmit = async (data: IUserRegister) => {
        setLoading(true);
        try {
            const response = await signup(data);
            if ((response.status === 200 || response.status === 201) && response.data) {
                toast.current?.show({
                    severity: "success",
                    summary: "Sucesso",
                    detail: "Usuário cadastrado com sucesso. Você será redirecionado.",
                    life: 3000,
                });
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                const errorMessage = response.message || "Falha ao cadastrar usuário.";
                toast.current?.show({
                    severity: "error",
                    summary: "Erro",
                    detail: errorMessage,
                    life: 3000,
                });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Ocorreu um erro inesperado.";
            toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: errorMessage,
                life: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="align-items-center">
        <Toast ref={toast} />
            <Card title="Criar Conta" className="w-full sm:w-25rem shadow-2">
                <form onSubmit={handleSubmit(onSubmit)} className="p-fluid flex flex-column gap-3">

                    <div>
                        <label htmlFor="name" className="form-label text-white">Nome Completo</label>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: "O nome completo é obrigatório." }}
                            render={({ field, fieldState }) => (
                                <InputText
                                    id="name"
                                    {...field}
                                    className={classNames("form-control", { "p-invalid": fieldState.invalid })}
                                    placeholder="Ex: Levi Ackerman"
                                />
                            )}
                        />
                        {errors.name && (
                            <small className="p-error">{errors.name.message}</small>
                        )}
                    </div>

                    <div>
                        <label htmlFor="username" className="form-label text-white">Nome de Usuário</label>
                        <Controller
                            name="username"
                            control={control}
                            rules={{ required: "O nome de usuário é obrigatório." }}
                            render={({ field, fieldState }) => (
                                <InputText
                                    id="username"
                                    {...field}
                                    className={classNames("form-control", { "p-invalid": fieldState.invalid })}
                                    placeholder="Ex: levi"
                                />
                            )}
                        />
                        {errors.username && (
                            <small className="p-error">{errors.username.message}</small>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="form-label text-white">Email</label>
                        <Controller
                            name="email"
                            control={control}
                            rules={{
                                required: "O email é obrigatório.",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                    message: "Endereço de email inválido"
                                }
                            }}
                            render={({ field, fieldState }) => (
                                <InputText
                                    id="email"
                                    type="email"
                                    {...field}
                                    className={classNames("form-control", { "p-invalid": fieldState.invalid })}
                                    placeholder="seu@email.com"
                                />
                            )}
                        />
                        {errors.email && (
                            <small className="p-error">{errors.email.message}</small>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="form-label text-white">Senha</label>
                        <Controller
                            name="password"
                            control={control}
                            rules={{
                                required: "A senha é obrigatória.",
                                minLength: { value: 6, message: "A senha deve ter no mínimo 6 caracteres." },
                            }}
                            render={({ field, fieldState }) => (
                                <Password
                                    id="password"
                                    {...field}
                                    toggleMask
                                    feedback={false}
                                    className={classNames({ 'p-invalid': fieldState.invalid })}
                                    inputClassName="form-control"
                                    placeholder="••••••"
                                />
                            )}
                        />
                        {errors.password && (
                            <small className="p-error">{errors.password.message}</small>
                        )}
                    </div>

                    <Button
                        type="submit"
                        label="Registrar"
                        icon="pi pi-user-plus"
                        className="btnForm"
                        loading={loading || isSubmitting}
                        disabled={loading || isSubmitting}
                    />

                    <div className="text-center">
                        <Link to="/login" className="register-link">
                            Já possui conta? Faça o Login
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    );
};