import React, { useState } from "react";
import styles from "./Register.module.css";
import register from "../../assets/register.png";
import { Link } from "react-router-dom";

export function Register() {
    const [form, setForm] = useState({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(form);
    };

    return (
        <div className={styles.container}>
            <img src={register} alt="background-image" className={styles.registerBg} />

            <div className={styles.card}>
                <h2 className={styles.title}>Cadastrar</h2>
                <p className={styles.subtitle}>
                    Já tem uma conta? <Link to="/login" className={styles.link}>Faça login</Link>
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
                        type="text"
                        name="name"
                        placeholder="Nome"
                        value={form.name}
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

                    <button type="submit" className={styles.button}>
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
}
