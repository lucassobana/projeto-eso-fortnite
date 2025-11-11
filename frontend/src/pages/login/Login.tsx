import React, { useState } from "react";
import styles from "./Login.module.css";
import login from "../../assets/login.png"; // ajuste o caminho conforme seu projeto
import { Link } from "react-router-dom";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ email, password, remember });
    };

    return (
        <div className={styles.container}>
            <img src={login} alt="background-image" className={styles.loginBg} />

            <div className={styles.card}>
                <h2 className={styles.title}>Login</h2>
                <p className={styles.subtitle}>
                    Ainda não tem uma conta? <Link to="/register" className={styles.link}>Cadastre-se aqui</Link>
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
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
