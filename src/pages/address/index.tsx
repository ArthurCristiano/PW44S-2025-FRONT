import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputMask } from 'primereact/inputmask';
import AddressService from '@/services/address-service';
import type { IAddress } from "@/commons/types";

export const AddressFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, setFocus } = useForm<IAddress>({
        defaultValues: {
            description: '', zipCode: '', street: '', number: '',
            complement: '', neighborhood: '', city: '', state: ''
        }
    });

    const isEditMode = Boolean(id);

    // Carrega dados do endereço para edição
    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            AddressService.findById(Number(id)).then(response => {
                if (response.success && response.data) {
                    reset(response.data as IAddress);
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Endereço não encontrado.' });
                    navigate('/addresses');
                }
                setLoading(false);
            });
        }
    }, [id, isEditMode, navigate, reset]);

    const handleCepBlur = async (cep: string) => {
        const cleanedCep = cep.replace(/\D/g, '');
        if (cleanedCep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setValue('street', data.logradouro);
                setValue('neighborhood', data.bairro);
                setValue('city', data.localidade);
                setValue('state', data.uf);
                setFocus('number'); // Move o foco para o campo "Número"
            }
        } catch (error) {
            console.error("Falha ao buscar CEP", error);
        }
    };

    const onSubmit = async (data: IAddress) => {
        const addressData = isEditMode ? { ...data, id: Number(id) } : data;
        const response = await AddressService.save(addressData);
        if (response.success) {
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: response.message });
            setTimeout(() => navigate('/addresses'), 1500);
        } else {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: response.message || 'Falha ao salvar.' });
        }
    };

    if (loading) return <div className="flex justify-content-center p-4"><ProgressSpinner /></div>;

    const cardTitle = isEditMode ? "Editar Endereço" : "Novo Endereço";

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Card title={cardTitle}>
                <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
                    <div className="field">
                        <label htmlFor="description">Descrição (Ex: Casa, Trabalho)</label>
                        <Controller name="description" control={control} rules={{ required: 'Descrição é obrigatória.' }}
                                    render={({ field, fieldState }) => (
                                        <InputText id={field.name} {...field} autoFocus className={classNames({ 'p-invalid': fieldState.error })} />
                                    )} />
                        {errors.description && <small className="p-error">{errors.description.message}</small>}
                    </div>

                    <div className="formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="zipCode">CEP</label>
                            <Controller name="zipCode" control={control} rules={{ required: 'CEP é obrigatório.' }}
                                        render={({ field, fieldState }) => (
                                            <InputMask id={field.name} {...field} mask="99999-999" onBlur={(e) => handleCepBlur(e.target.value)} className={classNames({ 'p-invalid': fieldState.error })} />
                                        )}/>
                            {errors.zipCode && <small className="p-error">{errors.zipCode.message}</small>}
                        </div>

                        <div className="field col-12 md:col-9">
                            <label htmlFor="street">Rua / Logradouro</label>
                            <Controller name="street" control={control} rules={{ required: 'Rua é obrigatória.' }}
                                        render={({ field, fieldState }) => (
                                            <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                        )}/>
                            {errors.street && <small className="p-error">{errors.street.message}</small>}
                        </div>

                        <div className="field col-12 md:col-3">
                            <label htmlFor="number">Número</label>
                            <Controller name="number" control={control} rules={{ required: 'Número é obrigatório.' }}
                                        render={({ field, fieldState }) => (
                                            <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                        )}/>
                            {errors.number && <small className="p-error">{errors.number.message}</small>}
                        </div>

                        <div className="field col-12 md:col-9">
                            <label htmlFor="complement">Complemento (Opcional)</label>
                            <Controller name="complement" control={control}
                                        render={({ field }) => <InputText id={field.name} {...field} />}/>
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="neighborhood">Bairro</label>
                            <Controller name="neighborhood" control={control} rules={{ required: 'Bairro é obrigatório.' }}
                                        render={({ field, fieldState }) => (
                                            <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                        )}/>
                            {errors.neighborhood && <small className="p-error">{errors.neighborhood.message}</small>}
                        </div>

                        <div className="field col-12 md:col-6">
                            <label htmlFor="city">Cidade</label>
                            <Controller name="city" control={control} rules={{ required: 'Cidade é obrigatória.' }}
                                        render={({ field, fieldState }) => (
                                            <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                        )}/>
                            {errors.city && <small className="p-error">{errors.city.message}</small>}
                        </div>

                        <div className="field col-12 md:col-2">
                            <label htmlFor="state">Estado (UF)</label>
                            <Controller name="state" control={control} rules={{ required: 'Estado é obrigatório.' }}
                                        render={({ field, fieldState }) => (
                                            <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                        )}/>
                            {errors.state && <small className="p-error">{errors.state.message}</small>}
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => navigate('/addresses')} />
                        <Button type="submit" label="Salvar" icon="pi pi-check" loading={isSubmitting} />
                    </div>
                </form>
            </Card>
        </div>
    );
};
