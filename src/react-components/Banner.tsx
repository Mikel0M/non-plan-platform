import * as React from "react";
import { translations } from "../text/Language"// Assuming translations are imported
import { useLanguage, useTranslation } from "../context/LanguageContext";

export function Banner({ customStyle }: { customStyle?: React.CSSProperties }) {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();

    const onLoginClick = () => {
        const modal = document.getElementById("loginModal");
        if (!(modal && modal instanceof HTMLDialogElement)) {
            return;
        }
        modal.showModal(); // Show the modal dialog
    };

    const onLoginCloseClick = () => {
        const modal = document.getElementById("loginModal");
        if (!(modal && modal instanceof HTMLDialogElement)) {
            return;
        }
        modal.close(); // Hides the modal dialog
    };

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
                    <dialog
                        id="loginModal"
                        style={{ textAlign: "center", alignItems: "center" }}
                    >
                        <form className="loginForm" id="loginForm">
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <h2 style={{ paddingLeft: 30 }} />
                                <div className="cancelAccept">
                                    <button
                                        type="button"
                                        onClick={onLoginCloseClick}
                                        className="buttonSecondary"
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
                            <img
                                id="non-plan-logo"
                                src="./assets/non-plan-logo.svg"
                                alt="non-plan"
                                style={{ paddingTop: 20, transform: "scale(0.8)" }}
                            />
                            <h1 style={{ padding: 20 }}>{t("start_loginWelcome1")}</h1>
                            <h4>{t("start_loginWelcome2")}</h4>
                            <div className="loginCard">
                                <div className="formFieldContainer">
                                    <input
                                        name="UserName"
                                        type="string"
                                        placeholder={t("start_UsernameEmail") + "*"}
                                    />
                                </div>
                                <div className="formFieldContainer">
                                    <input
                                        name="UserPassword"
                                        type="string"
                                        placeholder={t("start_Password") + "*"}
                                    />
                                </div>
                                <button
                                    id="forgotPassword"
                                    className="buttonTextBlue"
                                    onClick={onLoginCloseClick}
                                    style={{
                                        fontSize: "var(--fontSizeSmall)",
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "start",
                                        borderRadius: 45,
                                        width: 400,
                                        height: 45,
                                        justifyContent: "left",
                                    }}
                                >
                                    {t("start_forgotPassword")}
                                </button>
                                <button
                                    type="button"
                                    id="logINBtn"
                                    className="loginButton"
                                    onClick={onLoginCloseClick}
                                    style={{
                                        width: 400,
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        textAlign: "center",
                                        borderRadius: 45,
                                        height: 45,
                                        justifyContent: "center",
                                    }}
                                >
                                    {t("start_continue")}
                                </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "row", paddingLeft: 20 }}>
                                <h5
                                    style={{ display: "flex", width: 300 }}
                                >
                                    {t("start_newAccount")}
                                </h5>
                                <button
                                    id="newAccountBtn"
                                    className="buttonTextBlue"
                                    type="button"
                                    onClick={onLoginCloseClick}
                                    style={{
                                        fontSize: "var(--fontSizeMedium)",
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "start",
                                        borderRadius: 45,
                                        width: 400,
                                        height: 45,
                                        justifyContent: "left",
                                    }}
                                >
                                    Sign in
                                </button>
                            </div>
                        </form>
                    </dialog>
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
                </div>
            </header>
        </div>
    );
}
