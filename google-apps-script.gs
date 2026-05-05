const SHEET_NAME = "Cadastros";
const MIN_SUBMIT_DELAY_MS = 5000;
const MAX_SUBMISSIONS_PER_HOUR = 60;
const MAX_FIELD_LENGTHS = {
  "child-name": 120,
  "responsible-name": 120,
  "mother-name": 120,
  cpf: 14,
  rg: 20,
  phone: 20,
  email: 120,
  address: 180,
  notes: 600
};
const ALLOWED_MARITAL_STATUS = [
  "solteiro(a)",
  "casado(a)",
  "uniao-estavel",
  "divorciado(a)",
  "viuvo(a)"
];

const HEADERS = [
  "Data de envio",
  "Nome da criança ou adolescente",
  "Data de nascimento da criança ou adolescente",
  "Nome do responsável familiar",
  "Nome da mãe",
  "CPF",
  "RG",
  "Data de nascimento do responsável",
  "Estado civil",
  "Telefone",
  "E-mail",
  "Endereço",
  "Observações",
  "Consentimento LGPD"
];

function doPost(e) {
  if (!e || !e.parameter) {
    return ContentService
      .createTextOutput(JSON.stringify({
        result: "error",
        message: "Envie dados pelo formulario publicado como Web App ou execute testDoPost para testar manualmente."
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const data = validateAndNormalizePayload(e.parameter);
    const lock = LockService.getScriptLock();
    lock.waitLock(5000);

    try {
      enforceSubmissionLimit();

      const sheet = getOrCreateSheet();
      ensureHeaders(sheet);

      sheet.appendRow([
        data.submittedAt,
        data["child-name"],
        data["child-birth"],
        data["responsible-name"],
        data["mother-name"],
        data.cpf,
        data.rg,
        data["birth-date"],
        data["marital-status"],
        data.phone,
        data.email,
        data.address,
        data.notes,
        data["lgpd-consent"]
      ]);
    } finally {
      lock.releaseLock();
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function enforceSubmissionLimit() {
  const properties = PropertiesService.getScriptProperties();
  const key = "submissions-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMddHH");
  const currentCount = Number(properties.getProperty(key) || 0);

  if (currentCount >= MAX_SUBMISSIONS_PER_HOUR) {
    throw new Error("Limite temporario de envios atingido.");
  }

  properties.setProperty(key, String(currentCount + 1));
}

function testDoPost() {
  return doPost({
    parameter: {
      "submitted-at": new Date().toISOString(),
      "form-started-at": String(Date.now() - 8000),
      website: "",
      "child-name": "Teste de cadastro",
      "child-birth": "2015-01-01",
      "responsible-name": "Responsavel teste",
      "mother-name": "Mae teste",
      cpf: "000.000.000-00",
      rg: "00.000.000-0",
      "birth-date": "1990-01-01",
      "marital-status": "solteiro(a)",
      phone: "(11) 99999-9999",
      email: "teste@email.com",
      address: "Endereco teste",
      notes: "Linha criada pelo teste manual do Apps Script.",
      "lgpd-consent": "Autorizado"
    }
  });
}

function validateAndNormalizePayload(input) {
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

  if (cleanText(input.website, 200)) {
    throw new Error("Spam detectado.");
  }

  requiredFields.forEach(function(fieldName) {
    if (!cleanText(input[fieldName], 600)) {
      throw new Error("Campo obrigatorio ausente: " + fieldName);
    }
  });

  const startedAt = Number(input["form-started-at"] || 0);
  const submittedAt = input["submitted-at"]
    ? new Date(input["submitted-at"])
    : new Date();

  if (!startedAt || Date.now() - startedAt < MIN_SUBMIT_DELAY_MS) {
    throw new Error("Envio rapido demais.");
  }

  const data = {
    submittedAt: submittedAt,
    "child-name": cleanText(input["child-name"], MAX_FIELD_LENGTHS["child-name"]),
    "child-birth": cleanDate(input["child-birth"]),
    "responsible-name": cleanText(input["responsible-name"], MAX_FIELD_LENGTHS["responsible-name"]),
    "mother-name": cleanText(input["mother-name"], MAX_FIELD_LENGTHS["mother-name"]),
    cpf: cleanText(input.cpf, MAX_FIELD_LENGTHS.cpf),
    rg: cleanText(input.rg, MAX_FIELD_LENGTHS.rg),
    "birth-date": cleanDate(input["birth-date"]),
    "marital-status": cleanText(input["marital-status"], 30),
    phone: cleanText(input.phone, MAX_FIELD_LENGTHS.phone),
    email: cleanText(input.email, MAX_FIELD_LENGTHS.email).toLowerCase(),
    address: cleanText(input.address, MAX_FIELD_LENGTHS.address),
    notes: cleanText(input.notes, MAX_FIELD_LENGTHS.notes),
    "lgpd-consent": cleanText(input["lgpd-consent"], 20)
  };

  if (!/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(data.cpf)) {
    throw new Error("CPF invalido.");
  }

  if (!/^[0-9A-Za-z.\- ]{5,20}$/.test(data.rg)) {
    throw new Error("RG invalido.");
  }

  if (!/^[0-9()+.\-\s]{10,20}$/.test(data.phone)) {
    throw new Error("Telefone invalido.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new Error("Email invalido.");
  }

  if (ALLOWED_MARITAL_STATUS.indexOf(data["marital-status"]) === -1) {
    throw new Error("Estado civil invalido.");
  }

  if (data["lgpd-consent"] !== "Autorizado") {
    throw new Error("Consentimento LGPD obrigatorio.");
  }

  return data;
}

function cleanText(value, maxLength) {
  const text = String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length > maxLength) {
    throw new Error("Campo acima do tamanho permitido.");
  }

  if (/^[=+\-@]/.test(text)) {
    return "'" + text;
  }

  return text;
}

function cleanDate(value) {
  const text = cleanText(value, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error("Data invalida.");
  }

  return text;
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = firstRow.some(Boolean);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}
