const drop = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const form = document.getElementById('uploadForm');
const status = document.getElementById('status');
const gitBtn = document.getElementById('gitBtn');

function setStatus(text, ok=true){
  status.textContent = text;
  status.style.color = ok ? '#064e3b' : '#7f1d1d';
}

drop.addEventListener('click', ()=> fileInput.click());
drop.addEventListener('dragover', (e)=>{ e.preventDefault(); drop.classList.add('hover'); });
drop.addEventListener('dragleave', ()=> drop.classList.remove('hover'));
drop.addEventListener('drop', (e)=>{
  e.preventDefault(); drop.classList.remove('hover');
  if(e.dataTransfer.files && e.dataTransfer.files.length){
    fileInput.files = e.dataTransfer.files;
    drop.textContent = e.dataTransfer.files[0].name;
  }
});

form.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(form);
  const file = fileInput.files[0];
  if(!file){ setStatus('Please select an image file', false); return; }
  fd.set('file', file);
  setStatus('Uploading...', true);
  try{
    const res = await fetch('/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if(data.ok){
      setStatus('Upload successful — entry added');
      form.reset(); drop.textContent = 'Drag & drop image here or click to choose';
    } else {
      setStatus('Upload failed: ' + (data.error || 'unknown'), false);
    }
  }catch(err){ setStatus('Upload error: '+err.message, false); }
});

gitBtn.addEventListener('click', async ()=>{
  setStatus('Running git add/commit/push — may ask for credentials in terminal', true);
  try{
    const res = await fetch('/git-push', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({}) });
    const data = await res.json();
    if(data.ok) setStatus('Git push completed'); else setStatus('Git push failed: ' + (data.error||'unknown'), false);
  }catch(err){ setStatus('Git push error: '+err.message, false); }
});
