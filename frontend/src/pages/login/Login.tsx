import React, { useState } from "react";
import styles from "./Login.module.css";
import login from "../../assets/login.png";
import { Link, useNavigate } from "react-router-dom";

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:4000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Erro ao fazer login.");
                return;
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Erro de conexão com o servidor.");
        }
    };

    return (
        <div className={styles.container}>
            <img src={login} alt="background-image" className={styles.loginBg} />

            <div className={styles.card}>
                <h2 className={styles.title}>Login</h2>
                <p className={styles.subtitle}>
                    Ainda não tem uma conta?{" "}
                    <Link to="/register" className={styles.link}>
                        Cadastre-se aqui
                    </Link>
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <p className={styles.error}>{error}</p>}

                    <label className={styles.label}>
                        Email
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </label>

                    <label className={styles.label}>
                        Senha
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </label>

                    <a href="#" className={styles.forgot}>
                        Esqueci a senha
                    </a>

                    <div className={styles.rememberRow}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={() => setRemember(!remember)}
                                className={styles.checkbox}
                            />
                            <span>Lembrar senha</span>
                        </label>

                        <button type="submit" className={styles.button}>
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
