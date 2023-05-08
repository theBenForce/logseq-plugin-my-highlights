
let apiKeyInput: HTMLInputElement;
let serverUrlInput: HTMLInputElement;
let dlgChangesSaved: HTMLDivElement;
let btnCloseChangesSaved: HTMLButtonElement;

document.addEventListener("DOMContentLoaded", async () => {
  apiKeyInput = document.getElementById('api-key-input') as HTMLInputElement;
  serverUrlInput = document.getElementById('server-url-input') as HTMLInputElement;
  dlgChangesSaved = document.getElementById('dlg-changes-saved') as HTMLDivElement;
  btnCloseChangesSaved = document.getElementById('btn-close-changes-saved') as HTMLButtonElement;

  const result = await chrome.storage.sync.get(['apiKey', 'serverUrl']);
  
  apiKeyInput.value = result['apiKey'] ?? '';
  serverUrlInput.value = result['serverUrl'] ?? '';

  document.getElementById('save-button')!.addEventListener('click', onSaveOptions);
  btnCloseChangesSaved.addEventListener('click', () => dlgChangesSaved.classList.remove('modal-open'));
});

async function onSaveOptions() {
  var apiKey = apiKeyInput.value;
  const serverUrl = serverUrlInput.value;

  await chrome.storage.sync.set({ apiKey, serverUrl });
  
  dlgChangesSaved.classList.add('modal-open');
}