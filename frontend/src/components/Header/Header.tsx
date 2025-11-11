import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import vbucks from "../../assets/vbucks.svg";
import user from "../../assets/user.svg";
import styles from "./Header.module.css";

interface UserData {
    id: string;
    email: string;
    vbucks: number;
}

export function Header() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUserData(null);
        navigate("/login");
    };

    return (
        <header className={styles.header}>
            <h1 className={styles.text}>Fortnite cosmetics</h1>

            <div className={styles.vbucks}>
                <img src={vbucks} alt="logo-vbuck" />
                <span className={styles.value}>
                    {userData ? userData.vbucks.toLocaleString() : "0"}
                </span>

                <div className={styles.userMenuContainer} ref={menuRef}>
                    <img
                        src={user}
                        alt="user"
                        className={styles.userImage}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{ cursor: "pointer" }}
                    />

                    <div
                        className={`${styles.dropdownMenu} ${isMenuOpen ? styles.open : styles.closed}`}>
                        {userData ? (
                            <>
                                <button onClick={() => navigate("/meus-itens")}>
                                    <Icon icon="mdi:bag-personal" className={styles.icon} />
                                    Meus itens
                                </button>

                                <button onClick={() => navigate("/historico")}>
                                    <Icon icon="mdi:history" className={styles.icon} />
                                    Histórico de compras
                                </button>

                                <button className={styles.logout} onClick={handleLogout}>
                                    <Icon icon="mdi:logout" className={styles.icon} />
                                    Sair da conta
                                </button>
                            </>
                        ) : (
                            <button
                                className={styles.loginButton}
                                onClick={() => navigate("/login")}
                            >
                                <Icon icon="mdi:login" className={styles.icon} />
                                Fazer login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
