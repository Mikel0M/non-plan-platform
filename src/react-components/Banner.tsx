import * as React from "react";
import { translations } from "../text/Language"// Assuming translations are imported
import { useLanguage, useTranslation } from "./LanguageContext";
import LoginModal from "./LoginModal";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../firebase";

export function Banner({ customStyle }: { customStyle?: React.CSSProperties }) {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();
    const [loginModalOpen, setLoginModalOpen] = React.useState(false);

    const onLoginClick = () => setLoginModalOpen(true);
    const onLoginCloseClick = () => setLoginModalOpen(false);

    const toggleLanguageMenu = () => {
        const menu = document.getElementById("languageMenu");
        if (!menu) {
            return;
        }
        menu.classList.toggle("hidden");
    };

    const selectLanguage = (lang: string) => {
        setLanguage(lang);
        const menu = document.getElementById("languageMenu");
        if (menu) {
            menu.classList.add("hidden"); // Hide the menu
        }
    };

    const auth = getAuth(app);
    const user = auth.currentUser;

    return (
        <div id="banner" style={{ display: "flex", flexDirection: "column" }}>
            <header id="navigationHeader" style={{ position: "fixed" }}>
                <img
                    id="non-plan-logo"
                    src="./assets/non-plan-logo.svg"
                    alt="non-plan"
                    style={{ transform: "scale(0.8)", marginLeft: 0 }}
                />
                <div style={{ display: "flex", flexDirection: "row", columnGap: 10 }}>
                    <div className="language-selector">
                        <button
                            onClick={toggleLanguageMenu}
                            className="languageButton"
                            id="languageButton"
                            style={{
                                fontSize: "var(--fontSizeMedium)",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: 45,
                                width: 100,
                                height: 45,
                                justifyContent: "center",
                                position: "relative",
                                left: "-50px",
                            }}
                        >
                            <span className="material-icons-round">language</span> ▼
                        </button>
                        <ul
                            id="languageMenu"
                            className="hidden"
                        >
                            <li
                                onClick={() => selectLanguage("en")}
                                data-lang="en"
                                style={{
                                    padding: "5px 10px",
                                    cursor: "pointer",
                                }}
                            >
                                EN
                            </li>
                            <li
                                onClick={() => selectLanguage("de")}
                                data-lang="de"
                                style={{
                                    padding: "5px 10px",
                                    cursor: "pointer",
                                }}
                            >
                                DE
                            </li>
                            <li
                                onClick={() => selectLanguage("es")}
                                data-lang="es"
                                style={{
                                    padding: "5px 10px",
                                    cursor: "pointer",
                                }}
                            >
                                ES
                            </li>
                        </ul>
                    </div>
                    <dialog id="newAccountModal">
                        <form className="infoForm" id="newAccountForm">
                            <div className="infoCard">
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <h2 style={{ paddingLeft: 30 }}>non-plan Platform</h2>
                                    <h2 style={{ paddingLeft: 30 }}>{t("start_npInfoSoon")}</h2>
                                    <div className="cancelAccept">
                                        <button
                                            type="button"
                                            className="buttonSecondary"
                                            onClick={onLoginCloseClick}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <span className="material-icons-round" style={{ fontSize: 24 }}>
                                                close
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </dialog>
                    <LoginModal open={loginModalOpen} onClose={onLoginCloseClick} />
                    <button
                        id="infoLogINBtn"
                        onClick={onLoginClick}
                        className="buttonTertiary"
                        style={{
                            fontSize: "var(--fontSizeMedium)",
                            display: "flex",
                            alignItems: "center",
                            borderRadius: 45,
                            width: 100,
                            height: 45,
                            justifyContent: "center",
                            position: "relative",
                            left: "-50px",
                        }}
                    >
                        LOG IN
                    </button>
                    {user && (
                        <button
                            onClick={() => signOut(auth)}
                            className="buttonTertiary"
                            style={{
                                fontSize: "var(--fontSizeMedium)",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: 45,
                                width: 100,
                                height: 45,
                                justifyContent: "center",
                                position: "relative",
                                left: "-50px",
                                marginLeft: 8,
                            }}
                        >
                            LOG OUT
                        </button>
                    )}
                </div>
            </header>
        </div>
    );
}
