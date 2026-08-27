# 🇮🇳 Sahayak — All-India Civic & Welfare AI Platform

An intelligent, multi-agent civic assistance platform for India. Covers **all 28 States & 8 Union Territories**, supports **14 Indian languages**, and includes a **multi-provider LLM engine with automatic key rotation and rate-limit failover**.

---

## 🌟 Key Features

1. **45+ Citizen Services Directory (Welfare, Identity, RTO, e-Seva, EPFO, Tax, Voter & Grievance)**:
   - **💼 EPFO, Pension & ESIC**: EPF Online Withdrawal & Advance (Form 19, 10C, 31), UAN Activation & Passbook, Jeevan Pramaan Digital Life Certificate (Face RD app), ESIC free medical care & 26-week paid maternity leave.
   - **🧾 Taxes, ITR & GST**: Income Tax Return (ITR-1/4 filing, new tax regime zero tax up to ₹7.75 Lakh, refund tracking), GST Registration & Composition Scheme (1% tax) for small shops and traders.
   - **⚡ Utilities & Municipal Services**: New domestic/commercial electricity meter & solar net-metering (state DISCOMs), Municipal property tax payment, Property Mutation (Namantaran / name transfer), Trade License / Gumasta shop registration.
   - **🪪 Identity & Vital Documents**: Aadhaar (UIDAI update/PVC/biometrics), PAN Card & instant e-PAN, Passport Seva (Tatkaal/Fresh/Renewal), Ration Card (ONORC), Ayushman Card (PM-JAY ₹5L), PM Surya Ghar (Solar Subsidy up to ₹78,000).
   - **🚗 RTO & Transport**: Learner's License (faceless Aadhaar test), Permanent DL, RC Transfer (Form 29/30), Loan Hypothecation removal (Form 35), Traffic e-Challans, HSRP number plates, Inter-state NOC on Parivahan.
   - **📜 e-Seva Kendra & Certificates**: Caste / Non-Creamy Layer / EWS, Domicile / Residence, Income Certificate, Marriage Registration (Hindu & Special Marriage Act), Birth & Death on CRS (crsorgi.gov.in), Land Records (7/12, Patta, Bhulekh, Jamabandi), Legal Heir & Succession.
   - **🌿 Welfare Schemes**: PM-Kisan, Ayushman Bharat, PMAY, Mudra, Ladli / Lakhpati Didi, Old age pensions, e-Shram unorganised labour.
   - **🗳️ Election & Voter**: Form 6 voter ID, electoral roll verification, candidate affidavits & criminal records.
   - **📑 Grievance & RTI**: CPGRAMS, state CM helplines (181, 1076), RTI drafting (₹10 rules) and first/second appeals.

2. **True Multi-Turn Context Memory & Dynamic State Routing**:
   - Maintains full conversation continuity across follow-up queries (e.g. asking *"can I apply from home"* after asking about a *Marriage Certificate*).
   - Automatically detects mentions of all 28 States & 8 UTs to cite accurate state portals (*Aaple Sarkar, e-District, Seva Sindhu, IGR*).

3. **14 Indian Languages Supported (English Default)**:
   - English, Hindi (हिंदी), Bengali (বাংলা), Telugu (తెలుగు), Marathi (मराठी), Tamil (தமிழ்), Gujarati (ગુજરાતી), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Punjabi (ਪੰਜਾਬੀ), Odia (ଓଡ଼ିଆ), Urdu (اردو), Assamese (অসমীया), Maithili (मैथिली).
   - Dynamic language matching — responds in the exact script and language used by the user.

4. **Multi-Provider AI Engine with Auto-Failover & Key Rotation**:
   - **⚡ Groq** (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `deepseek-r1-distill-llama-70b`, `qwen/qwen3.6-27b`)
   - **🟢 NVIDIA NIM** (`meta/llama-3.3-70b-instruct`, `nvidia/llama-3.1-nemotron-70b-instruct`)
   - **🌐 OpenRouter** (`openrouter/free`, `nvidia/nemotron-3.5-lightning:free`)
   - **✨ Google Gemini** (`gemini-2.0-flash`, `gemini-1.5-flash`)
   - **🤖 OpenAI, Anthropic Claude, xAI Grok, DeepSeek**
   - Automatic key rotation and multi-provider failover.

5. **🎙️ Live Voice Agent & Clean Icon UI**:
   - Integrated continuous voice agent `((●))` with "Hi Sahayak" wake phrase and voice stop commands.
   - Silent mode vs Spoken Audio readout toggle `[🔊 / 🔇]`.
   - 1-click **`[📋 Copy]`** button next to **`[🔊 Read Aloud]`** for easy WhatsApp sharing.
   - Fully responsive mobile drawer navigation for phones and tablets.

---

## 🚀 100% Free Deployment Guide (No Domain Needed)

### Method 1: Deploy on Vercel via GitHub (Recommended)

1. **Create a GitHub Repository**:
   - Go to [github.com/new](https://github.com/new) and create a repository named `sahayak` (or any name).
   - Upload the files (`index.html`, `config.js`, `package.json`, `api/chat.js`, `README.md`) to the repository:
     ```bash
     git init
     git add .
     git commit -m "Initial commit of Sahayak"
     git branch -M main
     git remote add origin https://github.com/<your-username>/sahayak.git
     git push -u origin main
     ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
   - Click **"Add New Project"** → Import your `sahayak` repository.
   - Click **"Deploy"**.
   - Vercel will instantly generate a free live URL: `https://sahayak.vercel.app` (or similar).

3. *(Optional)* Add Secret Keys in Vercel Environment Variables:
   - `GROQ_API_KEYS`: `gsk_key1, gsk_key2`
   - `NVIDIA_API_KEYS`: `nvapi-key1`
   - `OPENROUTER_API_KEYS`: `sk-or-key1, sk-or-key2`
   - `GEMINI_API_KEYS`: `AIza_key1`

---

### Method 2: Deploy on GitHub Pages (Zero Server)

1. In your GitHub repository, go to **Settings** → **Pages** (in the left sidebar).
2. Under **Build and deployment** → **Branch**, select `main` (or `master`) and folder `/ (root)`.
3. Click **Save**.
4. In ~30 seconds, your site is live at: `https://<your-username>.github.io/<repo-name>/`!

---

## 🔑 Where to Get 100% Free API Keys

* **Groq (Fast & Free)**: [console.groq.com/keys](https://console.groq.com/keys)
* **NVIDIA NIM (Free)**: [build.nvidia.com](https://build.nvidia.com)
* **OpenRouter (Free Models)**: [openrouter.ai/keys](https://openrouter.ai/keys)
* **Google Gemini (Free Tier)**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## 📂 File Structure

```
├── index.html            # Complete self-contained single-page application
├── config.js             # Free token pool & active model configurations
├── package.json          # Deployment configuration
├── api/
│   └── chat.js           # Serverless proxy with failover (for Vercel)
└── README.md             # Documentation and deployment instructions
```
