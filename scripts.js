const form = document.getElementById("association-form");
const feedback = document.getElementById("form-feedback");
const googleScriptUrl = form?.dataset.googleScriptUrl?.trim();
const formStartedAt = Date.now();
const minimumSubmitDelay = 5000;
const submitCooldown = 30000;

const fieldRules = {
    "child-name": { max: 120 },
    "responsible-name": { max: 120 },
    "mother-name": { max: 120 },
    cpf: { pattern: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/ },
    rg: { max: 20, pattern: /^[0-9A-Za-z.\- ]{5,20}$/ },
    phone: { max: 20, pattern: /^[0-9()+.\-\s]{10,20}$/ },
    email: { max: 120, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    address: { max: 180 },
    notes: { max: 600 }
};

const setFeedback = (message, color = "#a63f1e") => {
    feedback.textContent = message;
    feedback.style.color = color;
};

if (form) {
    const startedAtField = document.getElementById("form-started-at");
    if (startedAtField) {
        startedAtField.value = String(formStartedAt);
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            setFeedback("Revise os campos destacados antes de enviar.");
            return;
        }

        const honeypot = document.getElementById("website");
        if (honeypot?.value.trim()) {
            setFeedback("Não foi possível enviar agora. Tente novamente em alguns instantes.");
            return;
        }

        if (Date.now() - formStartedAt < minimumSubmitDelay) {
            setFeedback("Aguarde alguns segundos antes de enviar o cadastro.");
            return;
        }

        const lastSubmit = Number(localStorage.getItem("last-association-form-submit") || 0);
        if (Date.now() - lastSubmit < submitCooldown) {
            setFeedback("Aguarde um pouco antes de enviar outro cadastro.");
            return;
        }

        const requiredFields = [
            "child-name",
            "child-birth",
            "responsible-name",
            "mother-name",
            "cpf",
            "rg",
            "birth-date",
            "marital-status",
            "phone",
            "email",
            "lgpd-consent"
        ];

        const missingField = requiredFields.find((fieldId) => {
            const field = document.getElementById(fieldId);
            if (!field) {
                return true;
            }

            if (field.type === "checkbox") {
                return !field.checked;
            }

            return !field.value.trim();
        });

        if (missingField) {
            setFeedback("Preencha todos os campos obrigatórios para concluir o cadastro.");
            return;
        }

        const invalidField = Object.entries(fieldRules).find(([fieldId, rule]) => {
            const field = document.getElementById(fieldId);
            const value = field?.value.trim() || "";

            if (!value) {
                return false;
            }

            if (rule.max && value.length > rule.max) {
                return true;
            }

            return rule.pattern && !rule.pattern.test(value);
        });

        if (invalidField) {
            setFeedback("Revise os dados informados. Há campos com formato inválido.");
            return;
        }

        if (!googleScriptUrl || googleScriptUrl === "COLE_AQUI_A_URL_DO_APPS_SCRIPT") {
            setFeedback("Defina a URL do Google Apps Script no atributo data-google-script-url do formulário.");
            return;
        }

        if (googleScriptUrl.endsWith("/dev")) {
            setFeedback("Use a URL publicada do Apps Script, que termina com /exec. A URL de teste /dev exige login e bloqueia o envio.");
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        formData.append("submitted-at", new Date().toISOString());

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Enviando...";
        }

        setFeedback("Enviando cadastro...", "#174f44");

        try {
            await fetch(googleScriptUrl, {
                method: "POST",
                mode: "no-cors",
                body: formData
            });

            localStorage.setItem("last-association-form-submit", String(Date.now()));
            setFeedback("Cadastro enviado com sucesso. Os dados foram encaminhados para a planilha da associação.", "#174f44");
            form.reset();
            if (startedAtField) {
                startedAtField.value = String(Date.now());
            }
        } catch (error) {
            setFeedback("Não foi possível enviar agora. Tente novamente em alguns instantes.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Enviar cadastro";
            }
        }
    });
}
