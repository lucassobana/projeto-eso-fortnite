import React, { useState } from "react";
import styles from "./Register.module.css";
import register from "../../assets/register.png";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

export function Register() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            setMessage("❌ As senhas não coincidem.");
            return;
        }

        try {
            const response = await axios.post("http://projeto-eso-fortnite-production.up.railway.app/api/auth/register", {
                email: form.email,
                password: form.password,
            });

            setMessage(`✅ ${response.data.message}`);
            setForm({
                email: "",
                password: "",
                confirmPassword: "",
            });
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            const error = err as AxiosError<{ error?: string }>;

            if (error.response?.data?.error) {
                setMessage(`❌ ${error.response.data.error}`);
            } else {
                setMessage("❌ Erro ao registrar usuário.");
            }
        }
    };

    return (
        <div className={styles.container}>
            <img src={register} alt="background-image" className={styles.registerBg} />

            <div className={styles.card}>
                <h2 className={styles.title}>Cadastrar</h2>
                <p className={styles.subtitle}>
                    Já tem uma conta?{" "}
                    <Link to="/login" className={styles.link}>
                        Faça login
                    </Link>
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className={styles.input}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Senha"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className={styles.input}
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Repetir Senha"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        className={styles.input}
                    />

                    {message && (
                        <p
                            className={
                                message.includes("✅") ? styles.success : styles.error
                            }
                        >
                            {message}
                        </p>
                    )}

                    <button type="submit" className={styles.button}>
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
}
