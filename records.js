const loginForm = document.querySelector(".records-login");
const note = document.querySelector(".records-login .form-note");
const tableWrap = document.querySelector(".records-table-wrap");
const tableBody = document.querySelector(".records-table tbody");
const refreshButton = document.querySelector("#refresh-records");

let savedPassword = "";

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ms-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderRecords(records) {
  tableBody.innerHTML = "";

  if (!records.length) {
    tableBody.innerHTML = '<tr><td colspan="6">Belum ada enquiry.</td></tr>';
    return;
  }

  for (const record of records) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDate(record.createdAt)}</td>
      <td>${record.name || ""}</td>
      <td><a href="https://wa.me/${String(record.contact || "").replace(/\D/g, "")}" target="_blank" rel="noreferrer">${record.contact || ""}</a></td>
      <td>${record.type || ""}</td>
      <td>${record.message || ""}</td>
      <td>${record.status || "Baru"}</td>
    `;
    tableBody.append(row);
  }
}

async function loadRecords() {
  note.textContent = "Sedang ambil rekod...";

  const response = await fetch(`/api/enquiries?password=${encodeURIComponent(savedPassword)}`);
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Tidak dapat ambil rekod.");
  }

  renderRecords(data.records);
  tableWrap.hidden = false;
  note.textContent = `${data.records.length} enquiry ditemui.`;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  savedPassword = new FormData(loginForm).get("password");

  try {
    await loadRecords();
  } catch (error) {
    note.textContent = error.message;
  }
});

refreshButton.addEventListener("click", async () => {
  try {
    await loadRecords();
  } catch (error) {
    note.textContent = error.message;
  }
});
