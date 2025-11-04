import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import{A as F}from"./config-DYgyTMIf.js";const j=F,q={async request(t,e={}){try{const s=e.body instanceof FormData,o={...e.headers};s||(o.Accept="application/json");const a=await fetch(`${j}${t}`,{...e,headers:o});if(!a.ok){const n=await a.json();throw new Error(n.message||"Erro na requisição")}return a.json()}catch(s){throw console.error("Erro na API:",s),s}}};class N{constructor(){this.baseUrl="http://localhost:3000/gemini"}async analyzeSubmission(e,s={}){try{const o=await this.prepareFilesContent(e);return await this.callBackendAPI(o,s)}catch(o){return console.error("Erro ao analisar submissão com Gemini:",o),{success:!1,error:o.message,timestamp:new Date().toISOString()}}}async prepareFilesContent(e){const s=[];for(const o of e)try{if(o.content)s.push({name:o.name,type:o.type||this.getFileType(o.name),size:o.size,content:o.content});else{const a=await this.readFileContent(o);s.push({name:o.name,type:this.getFileType(o.name),size:o.size,content:a})}}catch(a){console.warn(`Erro ao ler arquivo ${o.name}:`,a),s.push({name:o.name,type:o.type||this.getFileType(o.name),size:o.size||0,content:"[Erro ao ler arquivo]",error:a.message})}return s}readFileContent(e){return new Promise((s,o)=>{const a=new FileReader;a.onload=n=>{s(n.target.result)},a.onerror=n=>{o(new Error("Erro ao ler arquivo"))},this.isTextFile(e.name)?a.readAsText(e):s(`[Arquivo binário: ${e.name}, Tamanho: ${e.size} bytes]`)})}async callBackendAPI(e,s){const o=localStorage.getItem("token");console.log(`
📞 [FRONTEND] Chamando API do Gemini...`),console.log("   - Arquivos:",e.length),console.log("   - Missão:",s.title||"N/A"),console.log("   - URL:",`${this.baseUrl}/analyze`);try{const a=await fetch(`${this.baseUrl}/analyze`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`},body:JSON.stringify({files:e,missionContext:s})});if(!a.ok){const r=await a.json().catch(()=>({}));if(console.log(`
⚠️ [FRONTEND] Backend retornou erro:`),console.log("   - Status:",a.status),console.log("   - Error:",r.error),console.log("   - useFallback:",r.useFallback),console.log("   - Message:",r.message),r.useFallback||r.error==="API_KEY_NOT_CONFIGURED"||a.status===404||a.status===500||a.status===503)return console.warn("⚠️ [FALLBACK ATIVADO] Motivo:",r.error||`Status ${a.status}`),console.warn("   ➡️ Usando feedback de demonstração"),this.generateFallbackFeedback(e,s);throw new Error(r.error||`Erro HTTP: ${a.status}`)}const n=await a.json();return console.log(`
✅ [FRONTEND] Resposta bem-sucedida do Gemini!`),console.log("   - Modelo:",n.model),console.log("   - Feedback:",n.feedback?`${n.feedback.length} chars`:"vazio"),console.log("   - isDemoFeedback:",n.isDemoFeedback||!1),n}catch(a){if(a.name==="TypeError"||a.message.includes("Failed to fetch"))return console.error(`
❌ [FRONTEND] Erro de conexão com backend:`,a.message),console.warn("   ➡️ Usando feedback de demonstração (backend offline?)"),this.generateFallbackFeedback(e,s);throw a}}generateFallbackFeedback(e,s){const o=s.title||"Missão",a=e.length;return console.log(`
🎭 [FALLBACK] Gerando feedback de demonstração...`),console.log("   - Missão:",o),console.log("   - Arquivos:",a),{success:!0,feedback:`
# 📊 **Pontuação Geral**: 85/100

## ✅ **Pontos Positivos**
- Código bem estruturado e organizado
- Bom uso de comentários para explicar a lógica
- Implementação funcional das funcionalidades principais
- ${a>1?"Boa separação de responsabilidades entre arquivos":"Código concentrado e focado"}

## ⚠️ **Áreas de Melhoria**
- Considere adicionar validação de entrada mais robusta
- Algumas funções poderiam ser quebradas em partes menores
- Adicione tratamento de erros mais específico
- Considere usar const/let em vez de var quando aplicável

## 💡 **Sugestões Detalhadas**
- **Validação**: Implemente verificações para entradas inválidas
- **Modularização**: Divida funções grandes em funções menores e mais específicas
- **Documentação**: Adicione JSDoc para funções principais
- **Testes**: Considere escrever testes unitários para suas funções

## 🎯 **Cumprimento dos Objetivos**
Sua submissão para "${o}" demonstra compreensão sólida dos conceitos fundamentais. Os objetivos principais foram alcançados com implementação funcional.

## 📚 **Recursos Recomendados**
- [MDN Web Docs](https://developer.mozilla.org/) - Documentação completa sobre JavaScript
- [JavaScript.info](https://javascript.info/) - Tutorial interativo de JavaScript
- [Clean Code Principles](https://blog.cleancoder.com/) - Boas práticas de programação

---

## � **Como ativar análise com IA personalizada:**

**Este é um feedback de demonstração.** Para análise inteligente e personalizada com Google Gemini AI:

1. **Obtenha uma API Key gratuita:** https://makersuite.google.com/app/apikey
2. **Configure no backend:** Edite o arquivo \`backend/.env\`
3. **Adicione sua chave:** \`GEMINI_API_KEY=SUA_CHAVE_AQUI\`
4. **Reinicie o servidor:** \`cd backend && node server.js\`

📖 **Guia completo:** Leia o arquivo \`GEMINI_SETUP.md\` na raiz do projeto

Após configurar, você terá análises inteligentes e específicas para cada código! 🚀
            `,timestamp:new Date().toISOString(),isDemoFeedback:!0}}getFileType(e){const s=e.split(".").pop().toLowerCase();return{js:"javascript",jsx:"javascript",ts:"typescript",tsx:"typescript",py:"python",java:"java",cpp:"cpp",c:"c",cs:"csharp",php:"php",rb:"ruby",go:"go",rs:"rust",html:"html",css:"css",scss:"scss",sass:"sass",json:"json",xml:"xml",md:"markdown",txt:"text",sql:"sql"}[s]||"text"}isTextFile(e){const s=["js","jsx","ts","tsx","py","java","cpp","c","cs","php","rb","go","rs","html","css","scss","sass","json","xml","md","txt","sql","yml","yaml","ini","conf","config","log","csv","sh","bat","ps1"],o=e.split(".").pop().toLowerCase();return s.includes(o)}}const C=new N;class R{constructor(){this.modal=null,this.isOpen=!1}show(e,s={}){this.create(e,s),this.open()}create(e,s){this.destroy(),this.modal=document.createElement("div"),this.modal.className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 feedback-modal-overlay",this.modal.onclick=a=>{a.target===this.modal&&this.close()};const o=document.createElement("div");o.className=`
            bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] 
            overflow-hidden flex flex-col transform transition-all duration-300 scale-95 opacity-0
            border border-gray-200 dark:border-gray-700 feedback-modal-content
        `,o.innerHTML=this.buildModalHTML(e,s),this.modal.appendChild(o),this.addEventListeners(),document.body.appendChild(this.modal),setTimeout(()=>{o.classList.remove("scale-95","opacity-0"),o.classList.add("scale-100","opacity-100")},10)}buildModalHTML(e,s){const o=s.missionTitle||"Missão",a=s.files||[],n=new Date(e.timestamp||Date.now()).toLocaleString("pt-BR");let r="";return e.success?r=this.formatFeedback(e.feedback):r=`
                <div class="p-6 text-center">
                    <div class="mb-4">
                        <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Erro ao Gerar Feedback
                    </h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">
                        Não foi possível gerar o feedback automático neste momento.
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-500">
                        Erro: ${e.error||"Erro desconhecido"}
                    </p>
                </div>
            `,`
            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white shadow-md feedback-modal-header">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <i class="fas fa-robot text-lg"></i>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold">🤖 Feedback Automático IA</h2>
                            <p class="text-blue-100 text-sm">Análise inteligente da sua submissão</p>
                        </div>
                    </div>
                    <button 
                        id="close-feedback-modal" 
                        class="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors"
                        title="Fechar"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Informações da Submissão -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span class="font-medium text-gray-600 dark:text-gray-300">Missão:</span>
                        <p class="text-gray-800 dark:text-gray-200 font-semibold">${o}</p>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600 dark:text-gray-300">Arquivos:</span>
                        <p class="text-gray-800 dark:text-gray-200">${a.length} arquivo(s)</p>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600 dark:text-gray-300">Analisado em:</span>
                        <p class="text-gray-800 dark:text-gray-200">${n}</p>
                    </div>
                </div>
                
                ${a.length>0?`
                    <div class="mt-3">
                        <span class="font-medium text-gray-600 dark:text-gray-300">Arquivos analisados:</span>
                        <div class="flex flex-wrap gap-2 mt-1">
                            ${a.map(c=>`
                                <span class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                                    <i class="fas fa-file-code mr-1"></i>${c.name||c}
                                </span>
                            `).join("")}
                        </div>
                    </div>
                `:""}
            </div>

            <!-- Conteúdo do Feedback -->
            <div class="feedback-modal-body overflow-y-auto flex-1" style="background: #ffffff; color: #1a202c;">
            <div class="flex-1 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                ${r}
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                        <i class="fas fa-lightbulb text-yellow-500 mr-1"></i>
                        ${e.isDemoFeedback?"Este é um feedback de demonstração. Configure a API do Gemini para análise personalizada.":"Este feedback foi gerado automaticamente pela IA e pode conter sugestões para melhoria."}
                    </div>
                    <div class="flex space-x-2">
                        <button 
                            id="copy-feedback-btn" 
                            class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                        >
                            <i class="fas fa-copy mr-1"></i>Copiar
                        </button>
                        <button 
                            id="close-feedback-btn" 
                            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                            <i class="fas fa-check mr-1"></i>Entendi
                        </button>
                    </div>
                </div>
            </div>
        `}formatFeedback(e){let s=e.replace(/### (.*)/g,'<h3 class="text-lg font-semibold mb-3 mt-6 flex items-center" style="color: #1a202c;"><span class="mr-2">$1</span></h3>').replace(/## (.*)/g,'<h2 class="text-xl font-bold mb-4 mt-6" style="color: #1a202c;">$1</h2>').replace(/# (.*)/g,'<h1 class="text-2xl font-bold mb-4" style="color: #1a202c;">$1</h1>').replace(/\*\*(.*?)\*\*/g,'<strong class="font-semibold" style="color: #1a202c;">$1</strong>').replace(/^- (.*)/gm,'<li class="ml-4 mb-2" style="color: #374151;">• $1</li>').replace(/```(\w+)?\n([\s\S]*?)```/g,`<pre class="p-4 rounded-lg overflow-x-auto my-4" style="background: #f3f4f6; border: 1px solid #d1d5db;"><code class="text-sm" style="color: #1f2937; font-family: 'Courier New', monospace;">$2</code></pre>`).replace(/`([^`]+)`/g,`<code class="px-2 py-1 rounded text-sm" style="background: #f3f4f6; color: #1f2937; font-family: 'Courier New', monospace;">$1</code>`).replace(/\n\n/g,'</p><p class="mb-4" style="color: #374151;">').replace(/\n/g,"<br>");return s.startsWith("<")||(s='<p class="mb-4" style="color: #374151;">'+s+"</p>"),`<div class="p-6 prose prose-sm max-w-none" style="color: #1a202c;">${s}</div>`}addEventListeners(){const e=this.modal.querySelector("#close-feedback-modal");e&&(e.onclick=()=>this.close());const s=this.modal.querySelector("#close-feedback-btn");s&&(s.onclick=()=>this.close());const o=this.modal.querySelector("#copy-feedback-btn");o&&(o.onclick=()=>this.copyFeedback()),this.handleEscape=a=>{a.key==="Escape"&&this.isOpen&&this.close()},document.addEventListener("keydown",this.handleEscape)}async copyFeedback(){try{const e=this.modal.querySelector(".prose");if(e){const s=e.textContent||e.innerText;await navigator.clipboard.writeText(s);const o=this.modal.querySelector("#copy-feedback-btn");if(o){const a=o.innerHTML;o.innerHTML='<i class="fas fa-check mr-1"></i>Copiado!',o.classList.add("bg-green-600","text-white"),o.classList.remove("bg-gray-200","dark:bg-gray-600","text-gray-700","dark:text-gray-300"),setTimeout(()=>{o.innerHTML=a,o.classList.remove("bg-green-600","text-white"),o.classList.add("bg-gray-200","dark:bg-gray-600","text-gray-700","dark:text-gray-300")},2e3)}}}catch(e){console.error("Erro ao copiar feedback:",e)}}open(){this.isOpen=!0,document.body.style.overflow="hidden"}close(){if(!this.modal)return;const e=this.modal.querySelector("div");e&&(e.classList.add("scale-95","opacity-0"),e.classList.remove("scale-100","opacity-100")),setTimeout(()=>{this.destroy()},300)}destroy(){this.modal&&(document.body.removeChild(this.modal),this.modal=null),this.handleEscape&&document.removeEventListener("keydown",this.handleEscape),this.isOpen=!1,document.body.style.overflow=""}}const T=new R;(function(){const t=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",t)})();const L={data:{},set(t,e){this.data[t]=e},get(t){return this.data[t]}};function I(t){return t?t instanceof Date?t:typeof t=="string"?new Date(t):t.seconds!==void 0?new Date(t.seconds*1e3):t._seconds!==void 0?new Date(t._seconds*1e3):new Date(t):new Date}const p={container:null,init(){this.container||(this.container=document.createElement("div"),this.container.id="toast-container",this.container.className="fixed top-4 right-4 z-50 space-y-2",document.body.appendChild(this.container))},show(t,e="info"){this.init();const s={error:{class:"bg-red-500",icon:"exclamation-triangle"},success:{class:"bg-green-500",icon:"check-circle"},warning:{class:"bg-yellow-500",icon:"exclamation-circle"},info:{class:"bg-blue-500",icon:"info-circle"}},o=s[e]||s.info,a=document.createElement("div");a.className=`${o.class} text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`,a.innerHTML=`
      <div class="flex items-center">
        <i class="fas fa-${o.icon} mr-2"></i>
        <span>${t}</span>
      </div>
    `,this.container.appendChild(a),requestAnimationFrame(()=>{a.classList.remove("translate-x-full","opacity-0")}),setTimeout(()=>{a.classList.add("translate-x-full","opacity-0"),setTimeout(()=>{a.parentNode&&a.parentNode.removeChild(a)},300)},3e3)}},z="http://localhost:3000";async function S(t,e={}){const s=localStorage.getItem("token");if(!s)throw window.location.href="/",new Error("Token não encontrado");const o=z+t,a={headers:{"Content-Type":"application/json",Authorization:`Bearer ${s}`}};try{const n=await fetch(o,{...a,...e});if(!n.ok){if(n.status===401)throw localStorage.removeItem("token"),window.location.href="/",new Error("Sessão expirada. Por favor, faça login novamente.");const c=await n.text();throw new Error(`Erro na requisição: ${n.status} - ${c}`)}return await n.json()}catch(n){throw n}}const O={XP_LEVELS:[{level:1,minXP:0},{level:2,minXP:100},{level:3,minXP:250},{level:4,minXP:450},{level:5,minXP:700},{level:6,minXP:1e3},{level:7,minXP:1400},{level:8,minXP:2e3},{level:9,minXP:3e3},{level:10,minXP:5e3}],calculateLevel(t){let e=1;for(let c=this.XP_LEVELS.length-1;c>=0;c--)if(t>=this.XP_LEVELS[c].minXP){e=this.XP_LEVELS[c].level;break}const s=this.XP_LEVELS.find(c=>c.level===e+1),o=this.XP_LEVELS.find(c=>c.level===e);let a=null,n=0,r=0;return s?(a=s.minXP,r=s.minXP-o.minXP,n=t-o.minXP):(n=t-o.minXP,r=0),{currentLevel:e,totalXP:t,currentXP:n,nextLevelXP:r,xpForNextLevel:a,progressPercentage:r>0?Math.round(n/r*100):100,isMaxLevel:e===10,level:e,xpProgressInCurrentLevel:n,xpNeededForCurrentLevel:r}}};function P(t){return t>=8?"Senior":t>=4?"Pleno":"Junior"}async function U(){if(console.log("🔵 [DEBUG] ========== INICIANDO APLICAÇÃO =========="),_(),!!X())try{const[t,e,s,o]=await Promise.all([V(),J(),B(),M()]);console.log("🔵 [DEBUG] Dados carregados:",{userData:t,missionsCount:e?.length,submissionsCount:s?.length,completedMissionsCount:o?.length}),L.set("user",t),L.set("missions",e),L.set("submissions",s),L.set("completedMissions",o),K(t),D(e,o,s),$(s),W(),H()}catch{p.show("Erro ao carregar os dados. Por favor, recarregue a página.","error")}}function H(){const t=document.querySelectorAll(".tab-button"),e=document.querySelectorAll(".tab-content");t.forEach(s=>{s.addEventListener("click",o=>{o.preventDefault();const a=s.id.replace("tab-","")+"-tab";t.forEach(r=>{r.classList.remove("active","text-blue-600","border-blue-600"),r.classList.add("text-gray-500","border-transparent")}),s.classList.add("active","text-blue-600","border-blue-600"),s.classList.remove("text-gray-500","border-transparent"),e.forEach(r=>{r.classList.add("hidden")});const n=document.getElementById(a);n&&(n.classList.remove("hidden"),a==="history-tab"&&G())})})}async function G(){try{const t=await B();$(t)}catch{p.show("Erro ao carregar histórico de submissões","error")}}function X(){return localStorage.getItem("token")?!0:(window.location.href="/",!1)}function _(){const t=document.getElementById("logout-btn");t&&t.addEventListener("click",()=>{localStorage.removeItem("token"),localStorage.removeItem("username"),p.show("Logout realizado com sucesso!","success");const e=window.location.hostname.includes("github.io")?"/RPG":"";setTimeout(()=>{window.location.href=`${e}/`},1e3)})}async function V(){try{return await S("/usuarios/me")}catch(t){throw p.show("Erro ao carregar seu perfil: "+t.message,"error"),t}}async function J(){try{return await S("/missoes")}catch(t){throw p.show("Erro ao carregar missões: "+t.message,"error"),t}}async function B(){try{const[t,e]=await Promise.all([S("/submissoes/my-submissions"),S("/usuarios/my-penalties-rewards").catch(()=>[])]),s=[...t];return e&&e.length>0&&e.forEach(o=>{s.push({...o,isPenaltyReward:!0,submittedAt:o.createdAt||o.date,missionTitle:o.type==="penalty"?"Penalidade Aplicada":"Recompensa Concedida"})}),s.sort((o,a)=>new Date(a.submittedAt)-new Date(o.submittedAt)),s}catch(t){throw p.show("Erro ao carregar submissões: "+t.message,"error"),t}}async function M(){try{const t=await S("/missoes/all");return(await S("/submissoes/my-submissions")).filter(a=>a.status==="approved").map(a=>{const n=t.find(r=>r.id===a.missionId);return{...n,...a,completedAt:a.submittedAt,earnedXP:a.xp||n?.xp||0}})}catch{return[]}}function K(t){console.log("🔵 [DEBUG] updateUserInterface chamada com:",t);let e,s;t.levelInfo?(e=t.levelInfo,s=t.rank||P(e.currentLevel),console.log("🔵 [DEBUG] Usando levelInfo do backend")):(e=O.calculateLevel(t.xp||0),s=P(e.level||e.currentLevel),console.log("🔵 [DEBUG] Calculando levelInfo localmente")),console.log("🔵 [DEBUG] XP Info:",e),console.log("🔵 [DEBUG] Rank:",s);const o={"Arqueiro do JavaScript":"fab fa-js-square","Cafeicultor do Java":"fab fa-java","Mago do CSS":"fab fa-css3-alt","Paladino do HTML":"fab fa-html5","Bárbaro do Back-end":"fas fa-server","Domador de Dados":"fas fa-chart-bar","Elfo do Front-end":"fas fa-paint-brush","Caçador de Bugs":"fas fa-bug"},a={"Arqueiro do JavaScript":"bg-yellow-100 text-yellow-600","Cafeicultor do Java":"bg-orange-100 text-orange-600","Mago do CSS":"bg-blue-100 text-blue-600","Paladino do HTML":"bg-red-100 text-red-600","Bárbaro do Back-end":"bg-gray-100 text-gray-600","Domador de Dados":"bg-green-100 text-green-600","Elfo do Front-end":"bg-purple-100 text-purple-600","Caçador de Bugs":"bg-pink-100 text-pink-600"},n=document.getElementById("student-name");n&&(n.textContent=t.username||"Aluno");const r=document.getElementById("student-class-icon"),c=document.getElementById("student-class-circle");if(r&&t.class){const y=o[t.class]||"fas fa-user",w=a[t.class]||"bg-gray-200 text-gray-600";r.className=`${y}`,c&&(c.className=`w-8 h-8 ${w} rounded-full flex items-center justify-center transition-all duration-300`)}const d=e.level||e.currentLevel,u=e.isMaxLevel?0:e.nextLevelXP-e.currentXP,E={"student-level":`Nível ${d} — ${s}`,"student-class":t.class||"Não definida","total-xp":e.totalXP,"current-xp":e.currentXP,"remaining-for-next":u,"student-year":`${t.year||1}º ano`,"remaining-xp":u};Object.entries(E).forEach(([y,w])=>{const f=document.getElementById(y);console.log(`🔵 [DEBUG] Atualizando elemento ${y}:`,{element:!!f,value:w}),f&&(f.textContent=w,f.classList.add("value-loaded"))});const k=e.progressPercentage,x=document.getElementById("xp-bar"),v=document.getElementById("progress-percentage");console.log("🔵 [DEBUG] Atualizando barra de progresso:",{progress:k,progressBar:!!x,progressPercentage:!!v}),x&&(x.style.width=`${k}%`),v&&(v.textContent=`${k}%`,v.classList.add("value-loaded"))}function D(t,e=[],s=[]){const o=document.getElementById("missions");if(!o)return;o.innerHTML="";const a=new Set;s.forEach(i=>{!i.isPenaltyReward&&(i.status==="pending"||i.status==="approved")&&a.add(i.missionId)}),console.log("IDs de missões submetidas:",Array.from(a));const n=new Set;s.forEach(i=>{!i.isPenaltyReward&&i.status==="pending"&&n.add(i.missionId)}),console.log("IDs de missões pendentes:",Array.from(n));const r=new Set;s.forEach(i=>{!i.isPenaltyReward&&i.status==="approved"&&r.add(i.missionId)}),console.log("IDs de missões concluídas:",Array.from(r));const c=t.filter(i=>!a.has(i.id));c.sort((i,g)=>{const l=I(i.createdAt);return I(g.createdAt)-l});const d=t.filter(i=>n.has(i.id));d.forEach(i=>{const g=s.find(l=>l.missionId===i.id&&l.status==="pending");g&&(i.submission=g)}),d.sort((i,g)=>{const l=i.submission?I(i.submission.submittedAt):new Date(0);return(g.submission?I(g.submission.submittedAt):new Date(0))-l}),console.log("Missões disponíveis:",c.length),console.log("Missões pendentes:",d.length),console.log("Missões concluídas:",e.length),t.length,e.length,d.length;const u=document.getElementById("available-count"),E=document.getElementById("pending-count"),k=document.getElementById("completed-count");u&&(u.textContent=c.length),E&&(E.textContent=d.length),k&&(k.textContent=e.length);const x=document.createElement("div");x.className="missions-container",o.appendChild(x);const v=document.createElement("div");if(v.id="pending-missions-section",v.className="missions-section hidden",v.innerHTML=`
        <div class="mb-6 flex items-center justify-between">
            <h3 class="text-2xl font-bold text-yellow-700 dark:text-yellow-400 flex items-center">
                <div class="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                    <i class="fas fa-clock text-white"></i>
                </div>
                Missões Pendentes de Avaliação
            </h3>
            <span class="bg-yellow-500 dark:bg-yellow-900 text-white dark:text-yellow-200 px-4 py-2 rounded-full font-bold text-sm">
                ${d.length}
            </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="pending-missions-list"></div>
    `,x.appendChild(v),d.length>0){const i=document.getElementById("pending-missions-list");d.forEach(g=>{const l=s.find(b=>b.missionId===g.id&&b.status==="pending"),m=document.createElement("div");m.className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-l-4 border-yellow-500",m.innerHTML=`
                <div class="p-6">
                    <!-- Header com título e XP -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1 pr-2">
                            <h4 class="mission-card-title text-lg font-bold mb-1 line-clamp-2">
                                ${g.titulo||g.title||"Missão sem título"}
                            </h4>
                            <span class="inline-flex items-center text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                                <i class="fas fa-hourglass-half mr-1"></i>
                                Aguardando avaliação
                            </span>
                        </div>
                        <div class="flex-shrink-0">
                            <div class="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md flex items-center">
                                <i class="fas fa-star mr-1"></i>
                                ${g.xp||0}
                            </div>
                        </div>
                    </div>

                    <!-- Submissão -->
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        <i class="fas fa-paper-plane mr-1"></i>
                        Enviado em: ${I(l?.submittedAt).toLocaleString("pt-BR")}
                    </p>
                    
                    <!-- Arquivos enviados -->
                    ${l?.fileUrls&&l.fileUrls.length?`
                        <div class="mt-3">
                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Arquivos enviados:</p>
                            <div class="space-y-1">
                                ${l.fileUrls.map(b=>`
                                    <div class="flex items-center text-xs text-gray-700 dark:text-gray-300">
                                        <i class="fas fa-file-code mr-2"></i>
                                        <span class="truncate max-w-[200px]">${b.name}</span>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    `:""}

                    <!-- Divisor -->
                    <div class="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                    <!-- Status -->
                    <div class="flex justify-between items-center">
                        <span class="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                            <i class="fas fa-clock mr-1"></i>
                            Aguardando mestre
                        </span>
                    </div>
                </div>
            `,i.appendChild(m)})}if(e.length>0){const i=document.createElement("div");i.id="completed-missions-section",i.className="missions-section hidden mb-8 col-span-full",i.innerHTML=`
            <div class="mb-6 flex items-center justify-between">
                <h3 class="text-2xl font-bold text-green-700 dark:text-green-400 flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                        <i class="fas fa-trophy text-white"></i>
                    </div>
                    Missões Concluídas
                </h3>
                <span class="bg-green-600 dark:bg-green-900 text-white dark:text-green-200 px-4 py-2 rounded-full font-bold text-sm">
                    ${e.length}
                </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="completed-missions-list"></div>
        `,o.appendChild(i),e.sort((l,m)=>{const b=I(l.completedAt||l.submittedAt);return I(m.completedAt||m.submittedAt)-b});const g=document.getElementById("completed-missions-list");e.forEach(l=>{const m=document.createElement("div");m.className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-green-500 transform hover:-translate-y-1",m.innerHTML=`
                <div class="p-6">
                    <!-- Header com título e XP -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1 pr-2">
                            <h4 class="mission-card-title text-lg font-bold mb-1 line-clamp-2">
                                ${l.titulo||l.title||"Missão sem título"}
                            </h4>
                            <span class="inline-flex items-center text-xs text-green-600 dark:text-green-400 font-semibold">
                                <i class="fas fa-check-circle mr-1"></i>
                                Concluída
                            </span>
                        </div>
                        <div class="flex-shrink-0">
                            <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md flex items-center">
                                <i class="fas fa-star mr-1"></i>
                                +${l.earnedXP||l.xp}
                            </div>
                        </div>
                    </div>

                    <!-- Descrição -->
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        ${l.descricao||l.description||"Sem descrição"}
                    </p>

                    <!-- Divisor -->
                    <div class="border-t border-gray-200 dark:border-gray-700 mb-4"></div>

                    <!-- Metadados -->
                    <div class="flex justify-between items-center text-xs">
                        <div class="flex items-center text-gray-500 dark:text-gray-400">
                            <i class="fas fa-calendar-alt mr-2"></i>
                            <span>${new Date(l.completedAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <span class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
                                <i class="fas fa-users mr-1"></i>
                                ${l.targetClass||"Geral"}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Barra de progresso decorativa -->
                <div class="h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"></div>
            `,g.appendChild(m)})}if(c.length>0){const i=document.createElement("div");i.id="available-missions-section",i.className="missions-section col-span-full",i.innerHTML=`
            <div class="mb-6 flex items-center justify-between">
                <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-400 flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                        <i class="fas fa-scroll text-white"></i>
                    </div>
                    Missões Disponíveis
                </h2>
                <span class="bg-blue-500 dark:bg-blue-900 text-white dark:text-blue-200 px-4 py-2 rounded-full font-bold text-sm">
                    ${c.length}
                </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="available-missions-list"></div>
        `,o.appendChild(i);const g=document.getElementById("available-missions-list");c.forEach(l=>{const m=document.createElement("div");m.className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-blue-500 transform hover:-translate-y-1 cursor-pointer",m.dataset.missionId=l.id,m.addEventListener("click",function(){const b=document.getElementById("mission-select");b&&(b.value=l.id,b.dispatchEvent(new Event("change"))),document.querySelector("#submit-code-btn").scrollIntoView({behavior:"smooth"});const A=document.querySelector("#submit-code-btn").closest(".bg-white");A.classList.add("highlight-pulse"),setTimeout(()=>{A.classList.remove("highlight-pulse")},2e3)}),m.innerHTML=`
                <div class="p-6">
                    <!-- Header com título e XP -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1 pr-2">
                            <h4 class="mission-card-title text-lg font-bold mb-2 line-clamp-2">
                                ${l.titulo||l.title||"Missão sem título"}
                            </h4>
                            <span class="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                <i class="fas fa-bolt mr-1"></i>
                                Disponível
                            </span>
                        </div>
                        <div class="flex-shrink-0">
                            <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md flex items-center">
                                <i class="fas fa-star mr-1"></i>
                                ${l.xp||0}
                            </div>
                        </div>
                    </div>

                    <!-- Descrição -->
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        ${l.descricao||l.description||"Sem descrição"}
                    </p>

                    <!-- Divisor -->
                    <div class="border-t border-gray-200 dark:border-gray-700 mb-4"></div>

                    <!-- Metadados -->
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-2">
                            <span class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                                <i class="fas fa-users mr-1"></i>
                                ${l.targetClass||"Geral"}
                            </span>
                            ${l.turma?`
                                <span class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
                                    <i class="fas fa-graduation-cap mr-1"></i>
                                    ${l.turma}
                                </span>
                            `:""}
                        </div>
                    </div>
                </div>

            `,g.appendChild(m)})}else e.length===0&&(o.innerHTML=`
            <div class="text-center py-16 px-4">
                <div class="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                    <i class="fas fa-scroll text-gray-400 dark:text-gray-600 text-5xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Nenhuma missão disponível
                </h3>
                <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Aguarde! Seu mestre em breve publicará novas missões para você conquistar.
                </p>
            </div>
        `);function y(i){document.querySelectorAll(".missions-section").forEach(b=>{b.classList.add("hidden")});const g=document.getElementById(i);g&&g.classList.remove("hidden"),document.querySelectorAll(".section-button").forEach(b=>{b.classList.remove("active"),b.classList.remove("ring-2","ring-offset-2")});let l;switch(i){case"available-missions-section":l="show-available-missions";break;case"pending-missions-section":l="show-pending-missions";break;case"completed-missions-section":l="show-completed-missions";break}const m=document.getElementById(l);m&&(m.classList.add("active"),m.classList.add("ring-2","ring-offset-2"))}const w=document.getElementById("filter-available"),f=document.getElementById("filter-pending"),h=document.getElementById("filter-completed");w&&w.addEventListener("click",()=>{document.querySelectorAll(".mission-filter-btn").forEach(i=>{i.classList.remove("active")}),w.classList.add("active"),y("available-missions-section")}),f&&f.addEventListener("click",()=>{document.querySelectorAll(".mission-filter-btn").forEach(i=>{i.classList.remove("active")}),f.classList.add("active"),y("pending-missions-section")}),h&&h.addEventListener("click",()=>{document.querySelectorAll(".mission-filter-btn").forEach(i=>{i.classList.remove("active")}),h.classList.add("active"),y("completed-missions-section")}),y("available-missions-section"),Y(c)}function W(){const t=document.getElementById("mission-select"),e=document.getElementById("code-upload"),s=document.getElementById("submit-code-btn");!t||!e||!s||s.addEventListener("click",async o=>{if(o.preventDefault(),!t.value){p.show("Selecione uma missão para enviar","warning");return}if(!e.files||e.files.length===0){p.show("Selecione pelo menos um arquivo para enviar","warning");return}const a=t.value,n=t.options[t.selectedIndex].text,r=Array.from(e.files),c=new FormData;if(c.append("missionId",a),r.length>0)console.log("🔄 Enviando arquivo para diagnóstico:",r[0].name),console.log("📊 Detalhes do arquivo:",{name:r[0].name,size:r[0].size,type:r[0].type}),c.append("code",r[0]);else return console.log("⚠️ Nenhum arquivo para enviar"),p.show("❌ Selecione um arquivo antes de enviar","error");console.log("📋 FormData preparada com campos:",Array.from(c.keys())),s.disabled=!0,s.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';try{console.log("🔄 Iniciando upload de arquivo(s)..."),console.log("🔄 Número de arquivos:",r.length),console.log("🔄 Missão ID:",a);const d=localStorage.getItem("token");if(!d)throw new Error("Token não encontrado. Faça login novamente.");s.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Enviando (0%)...',console.log("📤 Iniciando requisição POST para /submissoes/submit");const u=await fetch("http://localhost:3000/submissoes/submit",{method:"POST",body:c,headers:{Authorization:`Bearer ${d}`}});if(console.log("✅ Resposta recebida do servidor:",u.status),!u.ok){let f="Erro desconhecido no servidor";try{const h=await u.json();throw console.error("❌ Erro na resposta:",h),f=h.error||h.details||h.message||"Falha no servidor",new Error(f)}catch(h){throw console.error("❌ Erro ao processar resposta de erro:",h),new Error(`Erro ${u.status}: ${u.statusText}`)}}let E;try{E=await u.json(),console.log("✅ Upload concluído com sucesso:",E)}catch(f){console.error("❌ Erro ao processar resposta JSON:",f)}p.show("Missão enviada com sucesso! Status: Pendente - aguardando aprovação do mestre.","success");const k={id:"temp-"+Date.now(),missionTitle:n,status:"pending",submittedAt:new Date().toISOString(),filePaths:r.map(f=>f.name),xp:null,feedback:null},x=L.get("submissions")||[];x.unshift(k),L.set("submissions",x),$(x),await ee(r,{id:a,title:n,description:`Submissão para a missão: ${n}`}),t.value="",e.value="";const v=await B();L.set("submissions",v),$(v);const y=await q.request("/missoes",{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}}),w=await M();L.set("submissions",v),L.set("missions",y),L.set("completedMissions",w),D(y,w,v),setTimeout(()=>{const f=document.getElementById("show-pending-missions");f&&f.click(),p.show('📋 Sua submissão está pendente! Agora você pode vê-la na seção "Missões Pendentes".',"info")},1e3)}catch(d){console.error("❌ Erro durante o processo de submissão:",d);let u=d.message||"Erro desconhecido";u.includes("NetworkError")||u.includes("Failed to fetch")?u="Erro de conexão com o servidor. Verifique se o servidor está rodando.":(u.includes("413")||u.includes("too large"))&&(u="O arquivo é muito grande. Limite máximo: 50MB."),p.show("Erro ao enviar missão: "+u,"error")}finally{s.disabled=!1,s.innerHTML='<i class="fas fa-paper-plane mr-2"></i>Enviar Código'}})}function Y(t){const e=document.getElementById("mission-select");e&&(e.innerHTML='<option value="">Selecione uma missão para enviar</option>',t.forEach(s=>{const o=s.titulo||s.title||"Missão sem título",a=s.xp||0;e.innerHTML+=`
            <option value="${s.id}">${o} (${a} XP)</option>
        `}))}function $(t){const e=document.getElementById("submission-history");if(!e)return;if(e.innerHTML="",t.length===0){e.innerHTML=`
            <div class="text-center py-12">
                <i class="fas fa-history text-gray-400 text-4xl mb-4"></i>
                <p class="text-gray-500">Nenhuma submissão encontrada.</p>
                <p class="text-sm text-gray-400 mt-2">Suas submissões aparecerão aqui após enviar uma missão.</p>
            </div>
        `;return}t.forEach(o=>{o.isPenaltyReward?Q(o,e):Z(o,e)});const s=t.filter(o=>!o.isPenaltyReward&&o.status==="pending").length;if(s>0){const o=document.createElement("div");o.className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6",o.innerHTML=`
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <i class="fas fa-clock text-yellow-600 text-xl"></i>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-yellow-800">
                        Você tem ${s} submissão${s>1?"ões":""} pendente${s>1?"s":""}
                    </h3>
                    <p class="text-sm text-yellow-700 mt-1">
                        Suas submissões estão aguardando revisão do mestre. Você será notificado quando forem aprovadas ou rejeitadas.
                    </p>
                </div>
            </div>
        `,e.insertBefore(o,e.firstChild)}}function Q(t,e){const s=t.type==="penalty",o=document.createElement("div");o.className=`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border-l-4 ${s?"border-red-500":"border-green-500"}`,o.innerHTML=`
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold ${s?"text-red-800":"text-green-800"} flex items-center">
                    <i class="fas ${s?"fa-exclamation-triangle":"fa-gift"} mr-2"></i>
                    ${t.missionTitle}
                </h3>
                <p class="text-sm text-gray-500">
                    <i class="fas fa-calendar-alt mr-1"></i>
                    ${new Date(t.submittedAt).toLocaleString()}
                </p>
                <p class="text-sm ${s?"text-red-600":"text-green-600"} mt-1 font-semibold">
                    <i class="fas fa-star mr-1"></i>
                    ${s?"-":"+"}${Math.abs(t.xp||0)} XP
                </p>
            </div>
            <span class="${s?"bg-red-100 text-red-800":"bg-green-100 text-green-800"} px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <i class="fas ${s?"fa-minus-circle":"fa-plus-circle"} mr-1"></i>
                ${s?"Penalidade":"Recompensa"}
            </span>
        </div>
        ${t.reason?`
            <div class="mt-4 p-4 ${s?"bg-red-50":"bg-green-50"} rounded-lg">
                <h4 class="text-sm font-semibold ${s?"text-red-700":"text-green-700"} mb-2 flex items-center">
                    <i class="fas fa-comment-alt mr-2"></i>
                    Motivo:
                </h4>
                <p class="${s?"text-red-600":"text-green-600"}">${t.reason}</p>
            </div>
        `:""}
    `,e.appendChild(o)}function Z(t,e){const s={pending:"bg-yellow-100 text-yellow-800 border-yellow-300",approved:"bg-green-100 text-green-800 border-green-300",rejected:"bg-red-100 text-red-800 border-red-300"},o={pending:"Pendente - Aguardando Aprovação",approved:"Aprovada",rejected:"Rejeitada"},a={pending:"fas fa-clock",approved:"fas fa-check-circle",rejected:"fas fa-times-circle"},n=t.status==="pending",r=new Date-new Date(t.submittedAt)<6e4,c=document.createElement("div");let d="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300";n&&(d+=" border-l-4 border-yellow-400",r&&(d+=" ring-2 ring-yellow-300 ring-opacity-50")),c.className=d,c.innerHTML=`
        <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-lg font-semibold text-gray-800">${t.missionTitle}</h3>
                    ${r&&n?'<span class="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">NOVA</span>':""}
                </div>
                <p class="text-sm text-gray-500">
                    <i class="fas fa-calendar-alt mr-1"></i>
                    Enviado em ${new Date(t.submittedAt).toLocaleString()}
                </p>
                ${t.xp?`
                    <p class="text-sm text-blue-600 mt-1">
                        <i class="fas fa-star mr-1"></i>
                        ${t.xp} XP
                    </p>
                `:""}
            </div>
            <span class="${s[t.status||"pending"]} px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <i class="${a[t.status||"pending"]} mr-1"></i>
                ${o[t.status||"pending"]}
            </span>
        </div>
        ${t.feedback?`
            <div class="mt-4 p-4 ${t.status==="rejected"?"bg-red-50 border-l-4 border-red-400":"bg-blue-50 border-l-4 border-blue-400"} rounded-r-lg">
                <h4 class="text-sm font-semibold ${t.status==="rejected"?"text-red-700":"text-blue-700"} mb-2 flex items-center">
                    <i class="fas fa-comment-alt mr-2"></i>
                    Feedback do Mestre:
                </h4>
                <p class="${t.status==="rejected"?"text-red-600":"text-blue-600"}">${t.feedback}</p>
            </div>
        `:""}
        ${t.filePaths&&t.filePaths.length>0?`
            <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <i class="fas fa-paperclip mr-2"></i>
                    Arquivos enviados:
                </h4>
                <div class="space-y-1">
                    ${t.filePaths.map(u=>`<span class="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">${u.split("/").pop()||u.split("\\").pop()}</span>`).join(" ")}
                </div>
                
                <!-- Botão para Feedback Automático -->
                <div class="mt-3 pt-3 border-t border-gray-200">
                    <button 
                        onclick="requestFeedbackForSubmission(${t.id}, '${t.missionTitle}', ${JSON.stringify(t.filePaths).replace(/"/g,"&quot;")})"
                        class="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
                        title="Gerar feedback automático com IA"
                    >
                        <i class="fas fa-robot mr-2"></i>
                        Solicitar Feedback IA
                    </button>
                    <span class="ml-2 text-xs text-gray-500">
                        Análise automática do seu código
                    </span>
                </div>
            </div>
        `:""}
    `,e.appendChild(c)}async function ee(t,e){try{console.log("🔄 Gerando feedback automático..."),console.log("   - Arquivos:",t),console.log("   - Contexto da missão:",e),p.show("🤖 Gerando feedback automático com IA...","info");const s=await C.analyzeSubmission(t,e);console.log("✅ Feedback recebido:",s);const o={missionTitle:e.title,files:t.map(a=>({name:a.name,size:a.size})),timestamp:new Date().toISOString()};console.log("📋 Informações da submissão:",o),T.show(s,o),s.success?s.isDemoFeedback?p.show("📚 Feedback de demonstração gerado! Configure Gemini para IA personalizada.","info"):p.show("✨ Feedback automático gerado com sucesso!","success"):p.show("⚠️ Erro ao gerar feedback automático","warning")}catch(s){console.error("❌ Erro ao gerar feedback:",s),p.show("Erro ao gerar feedback automático. Tente novamente.","error")}}async function te(t,e,s){try{p.show("🤖 Preparando análise automática...","info");const o=s.map(c=>{const d=c.split("/").pop()||c.split("\\").pop();return{name:d,type:"text",size:0,content:`// Arquivo: ${d}
// Esta é uma análise baseada no histórico de submissão.
// Para uma análise mais detalhada, reenvie o arquivo.`}}),a={id:t,title:e,description:`Análise de submissão histórica para: ${e}`},n=await C.analyzeSubmission(o,a),r={missionTitle:e,files:s.map(c=>({name:c.split("/").pop()||c.split("\\").pop(),size:"N/A"})),timestamp:new Date().toISOString(),isHistorical:!0};T.show(n,r),n.success?p.show("✨ Análise automática concluída!","success"):p.show("⚠️ Erro ao gerar análise automática","warning")}catch{p.show("Erro ao gerar análise. Tente novamente.","error")}}window.requestFeedbackForSubmission=te;document.addEventListener("DOMContentLoaded",U);document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){const t=document.getElementById("theme-toggle");t&&!t.hasAttribute("data-backup-configured")&&(t.setAttribute("data-backup-configured","true"),t.addEventListener("click",function(n){n.preventDefault();const r=document.documentElement,c=document.getElementById("theme-icon");(r.getAttribute("data-theme")||"light")==="dark"?(r.setAttribute("data-theme","light"),c.className="fas fa-moon theme-icon-moon",localStorage.setItem("theme","light")):(r.setAttribute("data-theme","dark"),c.className="fas fa-sun theme-icon-sun",localStorage.setItem("theme","dark"))}));const e=localStorage.getItem("theme"),s=window.matchMedia("(prefers-color-scheme: dark)").matches,o=e||(s?"dark":"light");document.documentElement.setAttribute("data-theme",o);const a=document.getElementById("theme-icon");a&&(o==="dark"?a.className="fas fa-sun theme-icon-sun":a.className="fas fa-moon theme-icon-moon"),se()},100)});function se(){const t=document.getElementById("bug-report-btn"),e=document.getElementById("bug-report-modal"),s=document.getElementById("close-bug-modal"),o=document.getElementById("cancel-bug-report"),a=document.getElementById("bug-report-form");t&&t.addEventListener("click",()=>{e.classList.remove("hidden"),document.body.style.overflow="hidden"});function n(){e.classList.add("hidden"),document.body.style.overflow="auto",a.reset()}s&&s.addEventListener("click",n),o&&o.addEventListener("click",n),e.addEventListener("click",r=>{r.target===e&&n()}),a&&a.addEventListener("submit",oe)}async function oe(t){t.preventDefault();const e=document.getElementById("submit-bug-report"),s=e.innerHTML;try{e.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...',e.disabled=!0;const o=new FormData(t.target),a=localStorage.getItem("username")||"Usuário Desconhecido",n=localStorage.getItem("email")||"email@desconhecido.com",r=o.get("title"),c=o.get("description"),d=o.get("screenshot");let u="";d&&d.size>0&&(console.log("[BUG REPORT] Tamanho original:",(d.size/1024).toFixed(2),"KB"),u=await new Promise((v,y)=>{const w=new FileReader;w.onload=f=>{const h=new Image;h.onload=()=>{const i=document.createElement("canvas"),g=i.getContext("2d");let l=h.width,m=h.height;const b=1200;l>b&&(m=m*b/l,l=b),i.width=l,i.height=m,g.drawImage(h,0,0,l,m);const A=i.toDataURL("image/jpeg",.7);console.log("[BUG REPORT] Comprimida para:",(A.length/1024).toFixed(2),"KB"),v(A)},h.onerror=y,h.src=f.target.result},w.onerror=y,w.readAsDataURL(d)}));const E={title:r,description:c,userName:a,userEmail:n,url:window.location.href,screenshot:u||null};console.log("[BUG REPORT] Enviando para o backend...");const k=await fetch("http://localhost:3000/api/bug-report",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(E)}),x=await k.json();if(console.log("[BUG REPORT] Resposta:",x),k.ok&&x.success)p.show("✅ Bug reportado com sucesso! 📧 Email enviado para pulppor@gmail.com","success"),document.getElementById("bug-report-modal").classList.add("hidden"),document.body.style.overflow="auto",t.target.reset();else throw new Error(x.message||"Erro ao enviar bug report")}catch(o){console.error("[BUG REPORT] Erro:",o),p.show("❌ Erro ao enviar bug report. Tente novamente.","error")}finally{e.innerHTML=s,e.disabled=!1}}
