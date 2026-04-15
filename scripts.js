const form = document.getElementById("association-form");
const feedback = document.getElementById("form-feedback");

if (form) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();

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
            "email"
        ];

        const missingField = requiredFields.find((fieldId) => {
            const field = document.getElementById(fieldId);
            return !field || !field.value.trim();
        });

        if (missingField) {
            feedback.textContent = "Preencha todos os campos obrigatórios para concluir o cadastro.";
            feedback.style.color = "#a63f1e";
            return;
        }

        feedback.textContent = "Cadastro enviado com sucesso. Em breve entraremos em contato.";
        feedback.style.color = "#174f44";
        form.reset();
    });
}
