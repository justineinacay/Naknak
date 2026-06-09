const SUPABASE_URL = 'https://btungxqqchyhnohtzhgj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_XQJbCrV1uW-NZWjsTTTQAg_PyN_QGoE';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

async function syncAllDataToSupabase() {
  if (!supabase) return;
  for (const col of ['tasks', 'clients', 'timelogs', 'content', 'invoices', 'goals', 'team', 'activities', 'conversations', 'sops']) {
    if (APP.data[col] && APP.data[col].length > 0) {
      // Very basic sync for demo purposes to populate the remote DB initially
      await supabase.from(col).upsert(APP.data[col]);
    }
  }
}

async function fetchAllDataFromSupabase() {
  if (!supabase) return false;
  try {
    for (const col of ['tasks', 'clients', 'timelogs', 'content', 'invoices', 'goals', 'team', 'activities', 'conversations', 'sops']) {
      const { data, error } = await supabase.from(col).select('*');
      if (data && data.length > 0) {
        APP.data[col] = data;
        localStorage.setItem('tjc-'+col, JSON.stringify(data));
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function addDoc(col, doc){
  doc.id = col.charAt(0) + Date.now();
  APP.data[col] = [doc, ...(APP.data[col]||[])];
  lsSave(col, APP.data[col]);
  if(supabase) await supabase.from(col).insert([doc]);
  return doc.id;
}

async function updateDoc(col, id, updates){
  const items = APP.data[col]||[];
  const idx = items.findIndex(x=>x.id===id);
  if(idx > -1){
    items[idx] = { ...items[idx], ...updates };
    lsSave(col, items);
  }
  if(supabase) await supabase.from(col).update(updates).eq('id', id);
}

// Override lsSave to also update remote
const origLsSave = lsSave;
window.lsSave = function(key, data) {
  origLsSave(key, data);
  if(supabase && APP.data[key] && Array.isArray(data) && data.length > 0) {
     // A naive sync for demo
     supabase.from(key).upsert(data).then();
  }
}

// Set up Gemini Integration
async function sendPrompt(promptText) {
  const GEMINI_API_KEY = localStorage.getItem('tjc-gemini-key') || '';
  if(!GEMINI_API_KEY) {
    openModal('Gemini Configuration', `
      <div class="form-group">
        <label class="form-label">Gemini API Key</label>
        <input type="password" id="f-gemini-key" class="form-control" placeholder="AIzaSy...">
        <div class="form-note">Your API key is stored securely in your local browser only.</div>
      </div>
    `, `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="localStorage.setItem('tjc-gemini-key', document.getElementById('f-gemini-key').value); closeModal(); toast('Gemini key saved! Try your prompt again.', 'success');">Save Key</button>`);
    return;
  }

  // Show loading state
  const prevText = document.activeElement.innerText;
  const btn = document.activeElement;
  if(btn && btn.tagName === 'BUTTON') {
      btn.innerText = "Thinking...";
      btn.disabled = true;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Provide some context about the OS state
    const context = `You are a helpful AI assistant built into the TJC Business OS (The Jobs Collective).
    The current active clients are: ${APP.data.clients.map(c=>c.name).join(', ')}.
    There are ${APP.data.tasks.filter(t=>!t.done).length} open tasks.`;

    const body = {
      contents: [{
        parts: [{text: `${context}\n\nUser Prompt: ${promptText}`}]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.error) {
       throw new Error(data.error.message);
    }

    const reply = data.candidates[0].content.parts[0].text;

    openModal('Gemini Intel', `
      <div style="font-size: 14px; line-height: 1.6; color: var(--text2); white-space: pre-wrap">${reply}</div>
    `, `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`);

  } catch(e) {
    toast(`Gemini Error: ${e.message}`, 'error');
  } finally {
    if(btn && btn.tagName === 'BUTTON') {
        btn.innerText = prevText;
        btn.disabled = false;
    }
  }
}
