import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import { useTranslation } from "./LanguageContext";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const auth = getAuth(app);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || (mode === "login" ? "Login failed" : "Sign up failed"));
    }
  };

  React.useEffect(() => {
    const modal = document.getElementById("loginModal");
    if (modal && modal instanceof HTMLDialogElement) {
      if (open) modal.showModal();
      else modal.close();
    }
  }, [open]);

  return (
    <dialog id="loginModal" style={{ textAlign: "center", alignItems: "center" }}>
      <form className="loginForm" id="loginForm" onSubmit={handleSubmit}>
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
              onClick={onClose}
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
        <h1 style={{ padding: 20 }}>
          {mode === "login" ? t("start_loginWelcome1") : t("start_signupWelcome1") || "Welcome"}
        </h1>
        <h4>
          {mode === "login" ? t("start_loginWelcome2") : t("start_signupWelcome2") || ""}
        </h4>
        <div className="loginCard">
          <div className="formFieldContainer">
            <input
              name="UserName"
              type="email"
              placeholder={t("start_UsernameEmail") + "*"}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="formFieldContainer">
            <input
              name="UserPassword"
              type="password"
              placeholder={t("start_Password") + "*"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <button
            type="submit"
            id="logINBtn"
            className="loginButton"
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
            {mode === "login" ? t("start_continue") : t("start_signup") || "Sign Up"}
          </button>
          <div style={{ marginTop: 16 }}>
            {mode === "login" ? (
              <span>
                {t("start_noAccount") || "No account?"}{" "}
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    setMode("signup");
                    setError(null);
                  }}
                >
                  {t("start_signup") || "Sign up"}
                </a>
              </span>
            ) : (
              <span>
                {t("start_haveAccount") || "Already have an account?"}{" "}
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    setMode("login");
                    setError(null);
                  }}
                >
                  {t("start_continue") || "Log in"}
                </a>
              </span>
            )}
          </div>
        </div>
      </form>
    </dialog>
  );
};

export default LoginModal;