/**
 * ============================================
 * auth.js
 * Authentication & account claiming
 * ============================================
 */

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginBtn");

const loginHint = document.getElementById("loginHint");

const confirmGroup =
    document.getElementById("confirmPasswordGroup");

loginForm.addEventListener(
    "submit",
    handleLogin
);

async function handleLogin(event) {

    event.preventDefault();

    const username =
        document.getElementById("loginUser").value.trim();

    const password =
        document.getElementById("loginPass").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (!username) return;

    if (
        AppState.claimMode &&
        password !== confirmPassword
    ) {

        loginHint.textContent =
            "Passwords do not match.";

        return;

    }

    showLoading(
        loginButton,
        AppState.claimMode
            ? "SETTING PASSWORD..."
            : "AUTHENTICATING..."
    );

    loginHint.textContent = "";

    try {

        let response;

        if (AppState.claimMode) {

            response =
                await API.claimAccount(
                    username,
                    password
                );

        }

        else {

            response =
                await API.login(
                    username,
                    password
                );

        }

        stopLoading(loginButton);

        switch (response.status) {

            case "unclaimed":

                AppState.claimMode = true;

                confirmGroup.style.display = "block";

                loginButton.textContent =
                    "SET PASSWORD & CONTINUE";

                loginHint.textContent =
                    "This account has not been claimed. Choose a password to continue.";

                break;

            case "success":

                AppState.claimMode = false;

                confirmGroup.style.display = "none";

                onLoginSuccess(
                    response,
                    username,
                    password
                );

                break;

            default:

                loginButton.textContent =
                    AppState.claimMode
                        ? "SET PASSWORD & CONTINUE"
                        : "ACCESS DATABASE";

                loginHint.textContent =
                    response.message ||
                    "Authentication failed.";

        }

    }

    catch (error) {

        stopLoading(loginButton);

        loginButton.textContent =
            AppState.claimMode
                ? "SET PASSWORD & CONTINUE"
                : "ACCESS DATABASE";

        loginHint.textContent =
            error.message ||
            "Unable to reach the server.";

    }

}

/**
 * Reset authentication UI.
 * Called from app.js during logout.
 */
function onLogout() {

    AppState.claimMode = false;

    confirmGroup.style.display = "none";

    loginHint.textContent = "";

    loginButton.textContent =
        "ACCESS DATABASE";

}
