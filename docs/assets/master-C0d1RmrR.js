import{A as R}from"./config-C8MW31Vj.js";import{b as Ne,c as p,d as se,e as x,s as F}from"./mode-DIhV9zwq.js";/* empty css               */function qe(){const e=localStorage.getItem("token");if(!e)return!1;try{const t=e.split(".");if(t.length!==3)return!1;const a=JSON.parse(atob(t[1]));return!(a.exp&&new Date>new Date(a.exp*1e3))}catch{return!1}}function Ue(){if(new URLSearchParams(window.location.search).get("debug")==="true")return localStorage.setItem("token","debug-token"),localStorage.setItem("isMaster","true"),localStorage.setItem("username","debug-master"),Ne("Modo debug ativado - autenticação simulada"),!0;const t=localStorage.getItem("token"),a=localStorage.getItem("isMaster");return!t||a!=="true"||!qe()?(p("Acesso negado. Faça login como Mestre."),setTimeout(()=>{window.location.href="/"},2e3),!1):!0}async function w(e,t={}){const a=localStorage.getItem("token");if(!a)throw console.error("[API REQUEST] Token não encontrado no localStorage"),new Error("Token não fornecido");const s={...t,headers:{"Content-Type":"application/json",Authorization:`Bearer ${a}`,...t.headers||{}}};console.log("[API REQUEST]",{endpoint:e,method:s.method||"GET",hasToken:!!a,headers:s.headers});const o=await fetch(`${R}${e}`,s);if(!o.ok){const n=await o.json().catch(()=>({error:o.statusText}));throw new Error(n.error||`HTTP ${o.status}`)}return o.json()}const J=new Map;function k(e,t){J.has(e)&&document.removeEventListener("click",J.get(e));const a=s=>{s.target.closest(e)&&t(s)};J.set(e,a),document.addEventListener("click",a)}function He(){const e=document.getElementById("logout-btn");e&&e.addEventListener("click",()=>{localStorage.removeItem("token"),localStorage.removeItem("isMaster"),localStorage.removeItem("username");const t=window.location.hostname.includes("github.io")?"/RPG":"";window.location.href=`${t}/`})}async function Z(e,t){return new Promise(a=>{const s=e==="reward",o=s?"Aplicar Recompensa":"Aplicar Penalidade",n=s?"fas fa-gift":"fas fa-exclamation-triangle",r=s?"bg-gradient-to-br from-green-400 to-emerald-600":"bg-gradient-to-br from-red-400 to-rose-600",i=s?"emerald":"red",c=s?"adicionar":"remover",u=s?"Reconheça o excelente trabalho do aluno com XP extra":"Aplique uma correção educativa removendo XP",l=document.createElement("div");l.className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4",l.style.position="fixed",l.style.top="0",l.style.left="0",l.style.width="100vw",l.style.height="100vh",l.style.zIndex="9999",l.innerHTML=`
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transform transition-all animate-modal-enter">
        <!-- Header com gradiente -->
        <div class="${s?"bg-gradient-to-r from-green-500 to-emerald-600":"bg-gradient-to-r from-red-500 to-rose-600"} px-6 py-4 text-white">
          <div class="flex items-center space-x-3">
            <div class="${r} p-3 rounded-full shadow-lg">
              <i class="${n} text-xl text-white"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold">${o}</h3>
              <p class="text-white text-opacity-90 text-sm">${u}</p>
            </div>
          </div>
        </div>
        
        <!-- Conteúdo -->
        <div class="p-6">
          <!-- Informações do aluno -->
          <div class="bg-gray-50 rounded-xl p-4 mb-6">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <i class="fas fa-user-graduate text-white"></i>
              </div>
              <div>
                <p class="text-sm text-gray-600">Aplicar para:</p>
                <p class="font-semibold text-gray-800">${t}</p>
              </div>
            </div>
          </div>
          
          <!-- Formulário -->
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <i class="fas fa-star text-yellow-500 mr-2"></i>
                XP a ${c}
                <span class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <input 
                  type="number" 
                  id="xp-amount" 
                  class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-${i}-500 focus:border-${i}-500 transition-all duration-200 text-lg font-semibold" 
                  placeholder="Digite a quantidade de XP"
                  min="1" max="1000" step="1"
                />
                <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                  XP
                </div>
              </div>
              <div class="mt-2 flex justify-between text-xs text-gray-500">
                <span>Mínimo: 1 XP</span>
                <span>Máximo: 1000 XP</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <i class="fas fa-comment-alt text-blue-500 mr-2"></i>
                Motivo da ${s?"recompensa":"penalidade"}
                <span class="text-red-500 ml-1">*</span>
              </label>
              <textarea 
                id="reason-text" 
                class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-${i}-500 focus:border-${i}-500 transition-all duration-200 resize-none" 
                placeholder="${s?"Ex: Excelente criatividade na solução apresentada...":"Ex: Código não seguiu as especificações solicitadas..."}"
                rows="4" maxlength="200"
              ></textarea>
              <div class="flex justify-between items-center mt-2">
                <span class="text-xs text-gray-500">Mínimo 3 caracteres</span>
                <div class="text-xs font-medium" id="char-count">0/200</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer com botões -->
        <div class="bg-gray-50 px-6 py-4">
          <div class="flex space-x-3">
            <button id="cancel-btn" class="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium">
              <i class="fas fa-times mr-2"></i>Cancelar
            </button>
            <button id="confirm-btn" class="flex-1 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed font-medium transition-all duration-200" disabled>
              <i class="${s?"fas fa-gift":"fas fa-exclamation-triangle"} mr-2"></i>
              ${s?"Aplicar Recompensa":"Aplicar Penalidade"}
            </button>
          </div>
        </div>
      </div>
    `;const d=document.createElement("style");d.textContent=`
          @keyframes modal-enter {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .animate-modal-enter {
            animation: modal-enter 0.3s ease-out;
          }
        `,document.head.appendChild(d),document.body.appendChild(l);const m=l.querySelector("#xp-amount"),f=l.querySelector("#reason-text"),y=l.querySelector("#char-count"),g=l.querySelector("#confirm-btn"),v=l.querySelector("#cancel-btn"),E=document.documentElement.getAttribute("data-theme")==="dark";E&&v&&(v.style.backgroundColor="rgba(55, 65, 81, 0.9)",v.style.borderColor="rgba(156, 163, 175, 0.5)",v.style.color="#f3f4f6",v.addEventListener("mouseenter",()=>{v.style.backgroundColor="rgba(75, 85, 99, 0.9)",v.style.borderColor="rgba(156, 163, 175, 0.7)",v.style.color="#ffffff"}),v.addEventListener("mouseleave",()=>{v.style.backgroundColor="rgba(55, 65, 81, 0.9)",v.style.borderColor="rgba(156, 163, 175, 0.5)",v.style.color="#f3f4f6"})),m.focus();const B=()=>{const h=m.value.trim(),I=f.value.trim(),$=h&&!isNaN(h)&&parseInt(h)>0&&parseInt(h)<=1e3,A=I.length>=3,D=$&&A;h&&!$?(m.className=m.className.replace("border-gray-200","border-red-300"),m.className=m.className.replace(`border-${i}-500`,"border-red-500")):(m.className=m.className.replace("border-red-300","border-gray-200"),m.className=m.className.replace("border-red-500",`border-${i}-500`)),I&&!A?(f.className=f.className.replace("border-gray-200","border-red-300"),f.className=f.className.replace(`border-${i}-500`,"border-red-500")):(f.className=f.className.replace("border-red-300","border-gray-200"),f.className=f.className.replace("border-red-500",`border-${i}-500`)),g.disabled=!D,D?g.className=`flex-1 px-6 py-3 ${s?"bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700":"bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"} text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`:(g.className="flex-1 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed font-medium transition-all duration-200",E&&(g.style.backgroundColor="rgba(75, 85, 99, 0.6)",g.style.color="rgba(156, 163, 175, 0.8)",g.style.border="1px solid rgba(156, 163, 175, 0.3)"))};f.addEventListener("input",()=>{const h=f.value.length;y.textContent=`${h}/200`,h>190?y.className="text-xs font-medium text-red-500":h>=3?y.className=`text-xs font-medium text-${i}-600`:y.className="text-xs font-medium text-gray-500",B()}),m.addEventListener("input",B),l.querySelector("#cancel-btn").addEventListener("click",()=>{l.style.animation="modal-enter 0.2s ease-in reverse",setTimeout(()=>{document.body.removeChild(l),document.head.removeChild(d),a(null)},200)}),l.querySelector("#confirm-btn").addEventListener("click",()=>{const h=m.value.trim(),I=f.value.trim();g.disabled||(l.style.animation="modal-enter 0.2s ease-in reverse",setTimeout(()=>{document.body.removeChild(l),document.head.removeChild(d),a({amount:parseInt(h),reason:I.trim()})},200))}),l.addEventListener("keydown",h=>{h.key==="Escape"&&l.querySelector("#cancel-btn").click()}),l.addEventListener("click",h=>{h.target===l&&l.querySelector("#cancel-btn").click()})})}async function pe(e,t){try{const a=await window.apiRequest(`/usuarios/student-history/${e}`),s=document.createElement("div");s.className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4",s.style.position="fixed",s.style.top="0",s.style.left="0",s.style.width="100vw",s.style.height="100vh",s.style.zIndex="9999";const o=a.history.length>0?a.history.map(r=>{const i=new Date(r.appliedAt).toLocaleString("pt-BR");let c,u,l,d,m,f,y,g;return r.type==="reward"?(c="fas fa-gift",u="bg-gradient-to-r from-green-50 to-emerald-50",l="border-green-200",d="bg-gradient-to-br from-green-400 to-emerald-600",m="bg-green-100 text-green-800",f="Recompensa",y=`+${r.amount} XP`,g=`
            <div class="text-sm text-gray-600 mb-2">
              <i class="fas fa-chart-line mr-1"></i>
              XP: <span class="font-mono">${r.oldXp} → ${r.newXp}</span>
            </div>
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Motivo:</strong> ${r.reason}
            </div>`):r.type==="penalty"?(c="fas fa-exclamation-triangle",u="bg-gradient-to-r from-red-50 to-rose-50",l="border-red-200",d="bg-gradient-to-br from-red-400 to-rose-600",m="bg-red-100 text-red-800",f="Penalidade",y=`-${r.amount} XP`,g=`
            <div class="text-sm text-gray-600 mb-2">
              <i class="fas fa-chart-line mr-1"></i>
              XP: <span class="font-mono">${r.oldXp} → ${r.newXp}</span>
            </div>
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Motivo:</strong> ${r.reason}
            </div>`):r.type==="mission_approved"?(c="fas fa-check-circle",u="bg-gradient-to-r from-blue-50 to-cyan-50",l="border-blue-200",d="bg-gradient-to-br from-blue-400 to-cyan-600",m="bg-blue-100 text-blue-800",f="Missão Aprovada",y=`+${r.xpGained} XP`,g=`
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-tasks mr-1"></i>
              <strong>Missão:</strong> ${r.missionTitle}
            </div>
            ${r.feedback?`<div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Feedback:</strong> ${r.feedback}
            </div>`:""}`):r.type==="mission_rejected"&&(c="fas fa-times-circle",u="bg-gradient-to-r from-orange-50 to-red-50",l="border-orange-200",d="bg-gradient-to-br from-orange-400 to-red-600",m="bg-orange-100 text-orange-800",f="Missão Rejeitada",y="0 XP",g=`
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-tasks mr-1"></i>
              <strong>Missão:</strong> ${r.missionTitle}
            </div>
            ${r.feedback?`<div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Feedback:</strong> ${r.feedback}
            </div>`:""}`),`
            <div class="${u} border-2 ${l} rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
              <div class="flex items-start space-x-4">
                <div class="${d} p-2 rounded-full shadow-lg flex-shrink-0">
                  <i class="${c} text-white"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <span class="font-bold text-gray-800">${f}</span>
                      <span class="${m} px-2 py-1 rounded-full text-sm font-semibold">${y}</span>
                    </div>
                    <div class="text-xs text-gray-500">
                      ${i}
                    </div>
                  </div>
                  ${g}
                  <div class="text-xs text-gray-500">
                    <i class="fas fa-user-tie mr-1"></i>
                    Aplicado por: <span class="font-medium">${r.appliedByName}</span>
                  </div>
                </div>
              </div>
            </div>
          `}).join(""):`<div class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-history text-gray-400 text-2xl"></i>
                </div>
                <p class="text-gray-500 text-lg">Nenhuma ação registrada</p>
                <p class="text-gray-400 text-sm mt-1">O histórico aparecerá aqui conforme as ações forem aplicadas</p>
              </div>`;if(!document.getElementById("modal-animations")){const r=document.createElement("style");r.id="modal-animations",r.textContent=`
              @keyframes modal-enter {
                from {
                  opacity: 0;
                  transform: scale(0.9) translateY(-20px);
                }
                to {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }
              .animate-modal-enter {
                animation: modal-enter 0.3s ease-out;
              }
            `,document.head.appendChild(r)}s.innerHTML=`
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-modal-enter">
        <!-- Header moderno -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="bg-white bg-opacity-20 p-3 rounded-full">
                <i class="fas fa-history text-xl"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold">Histórico Completo</h3>
                <p class="text-white text-opacity-90 text-sm">${t}</p>
              </div>
            </div>
            <button id="close-btn" class="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        
        <!-- Estatísticas -->
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b">
          <div class="grid grid-cols-4 gap-4">
            <div class="text-center">
              <div class="bg-white rounded-xl p-3 shadow-sm">
                <div class="text-2xl font-bold text-blue-600">${a.student.currentXp}</div>
                <div class="text-sm text-gray-600 font-medium">XP Atual</div>
              </div>
            </div>
            <div class="text-center">
              <div class="bg-white rounded-xl p-3 shadow-sm">
                <div class="text-2xl font-bold text-purple-600">${a.student.level}</div>
                <div class="text-sm text-gray-600 font-medium">Nível</div>
              </div>
            </div>
            <div class="text-center">
              <div class="bg-white rounded-xl p-3 shadow-sm">
                <div class="text-2xl font-bold text-indigo-600">${a.totalEntries}</div>
                <div class="text-sm text-gray-600 font-medium">Registros</div>
              </div>
            </div>
            <div class="text-center">
              <div class="bg-white rounded-xl p-3 shadow-sm">
                <div class="text-2xl font-bold text-green-600">${a.history.filter(r=>r.type==="reward").length}</div>
                <div class="text-sm text-gray-600 font-medium">Recompensas</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Conteúdo principal -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-lg font-bold text-gray-800 flex items-center">
                <i class="fas fa-timeline mr-2 text-blue-500"></i>
                Timeline de Ações
              </h4>
              ${a.history.length>0?`
                <div class="text-sm text-gray-500">
                  ${a.history.length} registro${a.history.length!==1?"s":""} encontrado${a.history.length!==1?"s":""}
                </div>
              `:""}
            </div>
            <div class="space-y-4 history-container">
              ${o}
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t">
          <button id="close-modal-btn" class="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
            <i class="fas fa-times mr-2"></i>Fechar Histórico
          </button>
        </div>
      </div>
    `,document.body.appendChild(s);const n=()=>document.body.removeChild(s);s.querySelector("#close-btn").addEventListener("click",n),s.querySelector("#close-modal-btn").addEventListener("click",n),s.addEventListener("keydown",r=>{r.key==="Escape"&&n()}),s.addEventListener("click",r=>{r.target===s&&n()})}catch(a){alert(`Erro ao carregar histórico: ${a.message}`)}}function ze(){_e(),Ge(),Xe()}function _e(){k(".approve-btn",async e=>{const t=e.target.closest("button").getAttribute("data-user-id");await j("approve-user",{userId:parseInt(t)},"Usuário aprovado!");try{typeof loadPendingUsers=="function"&&loadPendingUsers(),typeof loadApprovedStudents=="function"&&loadApprovedStudents()}catch(a){console.error("Erro ao recarregar listas de usuários:",a)}}),k(".reject-btn",async e=>{const t=e.target.closest("button").getAttribute("data-user-id"),a=e.target.closest(".bg-white").querySelector("h3").textContent;se(`Rejeitar o usuário "${a}"?`,async()=>{await j("reject-user",{userId:parseInt(t)},"Usuário rejeitado!");try{typeof loadPendingUsers=="function"&&loadPendingUsers()}catch(s){console.error("Erro ao recarregar usuários pendentes:",s)}})})}function Ge(){k(".penalty-btn",async e=>{const t=e.target.closest("button").getAttribute("data-student-id"),a=e.target.closest(".bg-white").querySelector("h3").textContent,s=await Z("penalty",a);if(s){await j("penalty",{studentId:parseInt(t),penalty:s.amount,reason:s.reason},`Penalidade aplicada em ${a}`);try{typeof loadApprovedStudents=="function"&&loadApprovedStudents()}catch(o){console.error("Erro ao recarregar estudantes após penalidade:",o)}}}),k(".reward-btn",async e=>{const t=e.target.closest("button").getAttribute("data-student-id"),a=e.target.closest(".bg-white").querySelector("h3").textContent,s=await Z("reward",a);if(s){await j("reward",{studentId:parseInt(t),reward:s.amount,reason:s.reason},`Recompensa dada para ${a}`);try{typeof loadApprovedStudents=="function"&&loadApprovedStudents()}catch(o){console.error("Erro ao recarregar estudantes após recompensa:",o)}}}),k(".history-btn",async e=>{const t=e.target.closest("button").getAttribute("data-student-id"),a=e.target.closest(".bg-white").querySelector("h3").textContent;await pe(parseInt(t),a)}),k(".expel-btn",async e=>{const t=e.target.closest("button").getAttribute("data-student-id"),a=e.target.closest(".bg-white").querySelector("h3").textContent;se(`⚠️ Expulsar "${a}"?

Esta ação não pode ser desfeita!`,async()=>{await j("expel-student",{studentId:parseInt(t)},"Aluno expulso!");try{typeof loadApprovedStudents=="function"&&loadApprovedStudents()}catch(s){console.error("Erro ao recarregar estudantes após expulsão:",s)}})})}function Xe(){k(".edit-mission-btn",async e=>{const t=e.target.closest("button").getAttribute("data-mission-id");typeof editMission=="function"&&await editMission(t)}),k(".delete-mission-btn",async e=>{const t=e.target.closest(".bg-white").querySelector("h3").textContent,a=e.target.closest("button").getAttribute("data-mission-id");se(`⚠️ Excluir "${t}"?

Esta ação não pode ser desfeita!`,async()=>{typeof missionAction=="function"&&await missionAction(a,"DELETE","Missão excluída!")})})}async function j(e,t,a){try{const o=(await w(`/usuarios/${e}`,{method:"POST",body:JSON.stringify(t)}))?.message||a;x(o)}catch(s){p(`Erro: ${s.message}`)}}let Y=[];const _="master_alunos_data";function N(){const e=localStorage.getItem("username");if(!e)return;const t={alunos:b.alunos,turmas:b.turmas,timestamp:Date.now()};localStorage.setItem(`${_}_${e}`,JSON.stringify(t))}function Ve(){const e=localStorage.getItem("username");if(!e)return!1;const t=localStorage.getItem(`${_}_${e}`);if(t)try{const a=JSON.parse(t);return b.alunos=a.alunos||[],b.turmas=a.turmas||[],!0}catch(a){console.error("Erro ao carregar dados:",a)}return!1}const b={turmas:[],alunos:[]};function Je(){return b.turmas}function Ye(e){return b.alunos.filter(t=>t.turma===e)}async function Ke(){try{const e=await window.apiRequest("/turmas");e&&e.turmas&&(b.turmas=e.turmas,N())}catch(e){throw console.error("Erro ao carregar turmas da API:",e),e}}async function ae(){try{const e=await window.apiRequest("/usuarios/approved-students");Array.isArray(e)&&(b.alunos=e.map(t=>({id:t.id,fullname:t.fullname||t.username,turma:t.turma||t.assignedTurma||"Sem turma",username:t.username,class:t.class,curso:t.curso,xp:t.xp||0,level:t.level||1})),N())}catch(e){throw console.error("Erro ao carregar alunos aprovados:",e),e}}async function ye(){try{await Ke()}catch(t){console.warn("Erro ao carregar turmas da API:",t),Ve()}try{await ae()}catch(t){console.warn("Erro ao carregar alunos aprovados:",t)}window.originalStudents=[...b.alunos],window.Pendentes={getTurmas:Je,getUsersForTurma:Ye,renderTurmas:()=>L(),addTurma:async t=>{if(t&&!b.turmas.includes(t))try{return await window.apiRequest("/turmas",{method:"POST",body:JSON.stringify({nome:t})}),b.turmas.push(t),N(),L(),window.dispatchEvent(new CustomEvent("turmasUpdated",{detail:{turmas:b.turmas,action:"add",turma:t}})),!0}catch(a){return console.error("Erro ao adicionar turma via API:",a),!1}return!1}},setTimeout(()=>L(),100);const e=document.getElementById("form-criar-turma");e&&(e.onsubmit=async t=>{t.preventDefault();const a=document.getElementById("nome-turma");if(a?.value.trim()){const s=a.value.trim();try{await window.apiRequest("/turmas",{method:"POST",body:JSON.stringify({nome:s})}),b.turmas.push(s),a.value="",N(),L(),x("Turma criada!"),window.dispatchEvent(new CustomEvent("turmasUpdated",{detail:{turmas:b.turmas,action:"add",turma:s}}))}catch(o){console.error("Erro ao criar turma:",o),p("Erro ao criar turma: "+(o.message||o))}}})}function L(){const e=document.getElementById("lista-turmas");if(!e)return;const t={};b.alunos.forEach(s=>{t[s.turma]=(t[s.turma]||0)+1});const a=b.turmas.map(s=>{const o=t[s]||0;return`
      <div class="turma-card bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg" data-turma="${s}">
        <h3 class="font-bold text-lg">${s}</h3>
        <p class="text-gray-600">${o} aluno${o!==1?"s":""}</p>
      </div>
    `}).join("");e.innerHTML=`<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${a}</div>`,setTimeout(()=>{e.querySelectorAll(".turma-card").forEach(s=>{s.onclick=o=>{o.preventDefault();const n=s.dataset.turma;ve(n)}})},10)}function ve(e){const t=document.getElementById("turma-modal"),a=document.getElementById("turma-modal-title"),s=document.getElementById("turma-modal-list");if(!t||!a||!s)return;const o=b.alunos.filter(n=>n.turma===e);a.innerHTML=`<i class="fas fa-users text-purple-600"></i><span class="font-extrabold text-white text-lg">${e}</span>`,o.length===0?s.innerHTML='<div class="p-4 text-gray-500">Nenhum aluno</div>':(s.innerHTML=o.map(n=>`
      <li class="py-3 border-b border-gray-100 flex items-center gap-3">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-base border-2 border-white shadow-md">
            ${n.fullname.charAt(0)}
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-medium text-gray-800">${n.fullname}</div>
            <div class="text-xs text-gray-500">ID: ${n.id} | ${n.class||"Sem classe"}</div>
          </div>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <button class="trocar-btn bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg flex items-center gap-2 transition font-medium" data-user-id="${n.id}" data-turma="${e}">
            <i class="fas fa-exchange-alt"></i>
            <span class="hidden sm:inline">Trocar</span>
          </button>
        </div>
      </li>
    `).join(""),setTimeout(()=>{s.querySelectorAll(".trocar-btn").forEach(n=>{n.onclick=r=>{r.stopPropagation();const i=n.dataset.userId,c=n.dataset.turma;Ze(i,c)}})},10)),t.classList.remove("hidden"),We(t)}function We(e){const t=o=>{o.key==="Escape"&&(e.classList.add("hidden"),document.removeEventListener("keydown",t))};e.onclick=null,document.addEventListener("keydown",t),e.onclick=o=>{(o.target.id==="turma-modal-backdrop"||o.target===e)&&(e.classList.add("hidden"),document.removeEventListener("keydown",t))};const a=e.querySelector("#turma-modal-close"),s=e.querySelector("#turma-modal-close-btn");a&&(a.onclick=o=>{o.preventDefault(),e.classList.add("hidden"),document.removeEventListener("keydown",t)}),s&&(s.onclick=o=>{o.preventDefault(),e.classList.add("hidden"),document.removeEventListener("keydown",t)})}function Ze(e,t){const a=b.turmas.filter(l=>l!==t),s=b.alunos.find(l=>l.id==e);if(!s||a.length===0){p("Não há outras turmas disponíveis");return}const o=`
    <div id="modal-trocar-turma" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl w-96 shadow-2xl">
        <h3 class="font-bold text-lg mb-4">Trocar ${s.fullname} de turma</h3>
        <p class="mb-2">De: <strong>${t}</strong></p>
        <select id="nova-turma-select" class="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500">
          <option value="">Selecione nova turma</option>
          ${a.map(l=>`<option value="${l}">${l}</option>`).join("")}
        </select>
        <div class="flex gap-3">
          <button id="confirmar-troca" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition">
            Confirmar
          </button>
          <button id="cancelar-troca" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `,n=document.getElementById("modal-trocar-turma");n&&n.remove(),document.body.insertAdjacentHTML("beforeend",o);const r=document.getElementById("modal-trocar-turma"),i=document.getElementById("nova-turma-select"),c=document.getElementById("confirmar-troca"),u=document.getElementById("cancelar-troca");c.onclick=async()=>{const l=i.value;if(!l){p("Selecione uma turma"),i.focus();return}try{c.disabled=!0,c.textContent="Transferindo...",await window.apiRequest(`/usuarios/${e}/change-turma`,{method:"POST",body:JSON.stringify({novaTurma:l})}),x(`${s.fullname} transferido para ${l}`),r.remove(),document.getElementById("turma-modal").classList.add("hidden"),await ae(),L(),setTimeout(()=>ve(l),500)}catch(d){console.error("Erro ao trocar aluno de turma:",d),p("Erro ao trocar aluno de turma: "+(d.message||d)),c.disabled=!1,c.textContent="Confirmar"}},u.onclick=()=>r.remove(),r.onclick=l=>{l.target===r&&r.remove()},setTimeout(()=>i.focus(),100)}async function V(){try{if(!window.apiRequest)throw console.error("❌ [FRONTEND] window.apiRequest não está disponível"),new Error("API request function not available");const e=await window.apiRequest("/usuarios/pending-users");Y=Array.isArray(e)?e:[],ce(Y)}catch(e){console.error("❌ [FRONTEND] Erro ao carregar usuários pendentes:",e),console.error("Stack trace:",e.stack),Y=[],ce([])}L()}function ce(e){const t=document.getElementById("pending-users");if(!t)return;if(!e||e.length===0){t.innerHTML='<div class="text-center py-6 text-gray-500">Nenhum usuário pendente para sua área</div>';return}const a=e.map(s=>`
    <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition border-l-4 border-yellow-400">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold">
            ${(s.fullname||s.username||"U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 class="font-semibold text-gray-800">${s.fullname||s.username}</h4>
            <p class="text-sm text-gray-500">@${s.username}</p>
          </div>
        </div>
        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pendente</span>
      </div>
      
      <div class="space-y-1 mb-4">
        <p class="text-sm"><span class="font-medium">Curso:</span> ${s.curso||"Não informado"}</p>
        <p class="text-sm"><span class="font-medium">Classe:</span> ${s.class||"Não informada"}</p>
        ${s.email?`<p class="text-sm"><span class="font-medium">Email:</span> ${s.email}</p>`:""}
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Atribuir à turma:</label>
        <select class="assign-turma-select w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" data-user-id="${s.id}">
          <option value="">Selecione uma turma</option>
          ${b.turmas.map(o=>`<option value="${o}">${o}</option>`).join("")}
        </select>
        
        <div class="flex gap-2 mt-3">
          <button class="approve-btn flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition" 
                  data-user-id="${s.id}">
            <i class="fas fa-check mr-2"></i>Aprovar
          </button>
          <button class="reject-btn bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition" 
                  data-user-id="${s.id}">
            <i class="fas fa-times mr-2"></i>Rejeitar
          </button>
        </div>
      </div>
    </div>
  `).join("");t.innerHTML=a,setTimeout(()=>{t.querySelectorAll(".approve-btn").forEach(s=>{s.onclick=async()=>{const o=s.dataset.userId,n=t.querySelector(`select[data-user-id="${o}"]`),r=n?.value;if(!r||r.trim()===""||r==="Selecione uma turma"){p("Por favor, selecione uma turma antes de aprovar o usuário."),n&&(n.style.borderColor="#ef4444",n.focus(),setTimeout(()=>{n.style.borderColor=""},3e3));return}await Qe(o,r)}}),t.querySelectorAll(".reject-btn").forEach(s=>{s.onclick=async()=>{const o=s.dataset.userId;await et(o)}})},10)}async function Qe(e,t){try{console.log("✅ Aprovando usuário:",e,"para turma:",t),await window.apiRequest(`/usuarios/${e}/approve`,{method:"POST",body:JSON.stringify({turma:t})}),x(`Usuário aprovado com sucesso e atribuído à turma "${t}"!`),await V(),await ae(),L()}catch(a){console.error("Erro ao aprovar usuário:",a),p("Erro ao aprovar usuário: "+(a.message||a))}}async function et(e){if(confirm("Tem certeza que deseja rejeitar este usuário?"))try{console.log("❌ Rejeitando usuário:",e),await window.apiRequest(`/usuarios/${e}/reject`,{method:"POST"}),x("Usuário rejeitado"),await V()}catch(t){console.error("Erro ao rejeitar usuário:",t),p("Erro ao rejeitar usuário: "+(t.message||t))}}setTimeout(()=>{localStorage.getItem("username")==="tecno"&&ye()},500);typeof window<"u"&&(window.debugTurmas=()=>{console.log("=== DEBUG TURMAS ==="),console.log("Turmas:",DADOS_FIXOS.turmas),console.log("Alunos:",DADOS_FIXOS.alunos),console.log("localStorage:",localStorage.getItem(`${_}_${localStorage.getItem("username")}`)),L()},window.forcarSalvar=()=>{N(),console.log("💾 Dados salvos manualmente")},window.limparDados=()=>{const e=localStorage.getItem("username");localStorage.removeItem(`${_}_${e}`),console.log("🗑️ Dados limpos - recarregue a página")});document.addEventListener("DOMContentLoaded",()=>{const e=document.querySelector(".logo-icon");e&&e.addEventListener("click",()=>{e.classList.add("rolling"),e.addEventListener("animationend",()=>{e.classList.remove("rolling")},{once:!0})})});const q={beleza:{name:"👒 Beleza",classes:{"Estilista das Sombras":{},"Feiticeira das Unhas":{},"Encantador de Cores":{},"Artista das Luzes":{},"Cortes Fantasma":{},"Guardiã das Flores":{},"Alquimista do Perfume":{},"Mestre do Reflexo":{}}},gastronomia:{name:"👨‍🍳 Gastronomia",classes:{"Cozinheiro Arcano":{},"Alquimista dos Sabores":{},"Guardiã do Forno":{},"Mestre das Caldeiradas":{},"Confeiteiro Místico":{},"Senhor dos Temperos":{},"Sommelier Sagrado":{},"Druida da Nutrição":{}}},gestao:{name:"👩‍🎓 Gestão",classes:{"Senhor dos Números":{},"Administrador da Ordem":{},"Analista Visionário":{},"Estrategista de Elite":{},"Protetor do Equilíbrio":{},"Mediador das Alianças":{},"Juiz da Justiça":{},"Cronista do Progresso":{}}},oftalmo:{name:"👁️ Oftalmologia",classes:{"Vidente da Visão":{},"Guardiã do Olhar":{},"Caçador de Detalhes":{},"Mestre da Clareza":{},"Sentinela Invisível":{},"Oráculo das Lentes":{},"Defensor da Retina":{},"Ilusionista da Percepção":{}}},tecnologia:{name:"🖥️ Tecnologia",classes:{"Arqueiro do JavaScript":{},"Cafeicultor do Java":{},"Mago do CSS":{},"Paladino do HTML":{},"Bárbaro do Back-end":{},"Domador de Dados":{},"Elfo do Front-end":{},"Caçador de Bugs":{}}},idiomas:{name:"🌐 Idiomas",classes:{"Orador das Runas":{},"Tradutor das Sombras":{},"Bardo Poliglota":{},"Sábio dos Dialetos":{},"Emissário Universal":{},"Guardião da Palavra":{},"Feiticeiro da Pronúncia":{},"Lexicógrafo Arcano":{}}}};function tt(){const e=document.getElementById("curso-select"),t=document.getElementById("class-select");if(!e||!t){console.error("Elementos curso-select ou class-select não encontrados");return}e.addEventListener("change",function(){const a=e.value;if(t.innerHTML="",!a||!q[a]){t.innerHTML='<option value="">Escolha o curso primeiro</option>',t.disabled=!0;return}t.disabled=!1,t.innerHTML='<option value="">Escolha sua classe RPG</option>',Object.keys(q[a].classes).forEach(s=>{t.innerHTML+=`<option value="${s}">${s}</option>`}),T()})}document.getElementById("curso-select")&&document.getElementById("class-select")&&tt();function st(){at(),ot(),nt()}function at(){document.querySelectorAll(".btn-primary, .btn-secondary").forEach(t=>{t.addEventListener("mouseenter",function(){this.style.transform="translateY(-2px) scale(1.02)",this.style.transition="all 0.3s ease"}),t.addEventListener("mouseleave",function(){this.style.transform="translateY(0) scale(1)"}),t.addEventListener("mousedown",function(){this.style.transform="translateY(0) scale(0.98)"}),t.addEventListener("mouseup",function(){this.style.transform="translateY(-2px) scale(1.02)"})})}function ot(){const e=document.getElementById("register-form");function t(s){s&&(s.style.opacity="0",s.style.transform="translateY(20px)",setTimeout(()=>{s.style.transition="all 0.5s ease",s.style.opacity="1",s.style.transform="translateY(0)"},50))}const a=new MutationObserver(function(s){s.forEach(function(o){if(o.type==="attributes"&&o.attributeName==="class"){const n=o.target;n.id==="register-form"&&!n.classList.contains("hidden")&&(t(n),be())}})});e&&a.observe(e,{attributes:!0})}function be(){["reg-username","reg-fullname","reg-email","reg-password","curso-select","class-select"].forEach(a=>{const s=document.getElementById(a);s&&(s.value="",s.classList.remove("has-content"))}),["username-feedback","fullname-feedback","email-feedback","password-feedback","password-strength"].forEach(a=>{const s=document.getElementById(a);s&&s.classList.add("hidden")}),T()}function nt(){let e=0;const t=document.querySelector(".logo, h1");t&&t.addEventListener("click",function(){e++,e===5&&(document.body.style.filter="hue-rotate(180deg)",setTimeout(()=>{document.body.style.filter="none"},2e3),e=0)}),document.addEventListener("click",function(a){rt(a.clientX,a.clientY)})}function rt(e,t){const a=document.createElement("div");a.style.position="fixed",a.style.left=e+"px",a.style.top=t+"px",a.style.width="6px",a.style.height="6px",a.style.background="#667eea",a.style.borderRadius="50%",a.style.pointerEvents="none",a.style.zIndex="9999",a.style.transition="all 0.5s ease-out",document.body.appendChild(a),setTimeout(()=>{a.style.transform="translateY(-20px) scale(0)",a.style.opacity="0"},10),setTimeout(()=>{document.body.removeChild(a)},500)}const oe=document.createElement("style");oe.textContent=`
  .has-content {
    background: rgba(255, 255, 255, 0.95) !important;
  }
`;document.head.appendChild(oe);const ne=document.createElement("style");ne.textContent=`
  .password-bar.active {
    background: #22c55e !important;
  }
`;document.head.appendChild(ne);console.log("Estilos dinâmicos aplicados:",oe.textContent,ne.textContent);function he(e){return e.length>=5}function xe(e){const a=/^[A-Za-z\s]+$/.test(e);return e.length>=3&&a}function we(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function Ee(e){return{length:e.length>=8,uppercase:/[A-Z]/.test(e),lowercase:/[a-z]/.test(e),number:/[0-9]/.test(e),symbol:/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\\/]/.test(e)}}function de(){const e=document.getElementById("reg-username"),t=document.getElementById("username-feedback");if(!e||!t){console.error("Elementos reg-username ou username-feedback não encontrados");return}const a=e.value.trim();if(a.length===0){t.textContent="",t.classList.add("hidden"),t.classList.remove("text-red-500");return}he(a)?(t.textContent="",t.classList.add("hidden"),t.classList.remove("text-red-500")):(t.textContent="Faltam: pelo menos 5 caracteres",t.classList.remove("hidden"),t.classList.add("text-red-500"))}function ue(){const e=document.getElementById("reg-fullname"),t=document.getElementById("fullname-feedback");if(!e||!t){console.error("Elementos reg-fullname ou fullname-feedback não encontrados");return}const a=e.value.trim();if(a.length===0){t.textContent="",t.classList.add("hidden"),t.classList.remove("text-red-500");return}xe(a)?(t.textContent="",t.classList.add("hidden"),t.classList.remove("text-red-500")):(t.textContent="Nome completo deve ter pelo menos 3 caracteres e conter apenas letras e espaços.",t.classList.remove("hidden"),t.classList.add("text-red-500"))}function me(){const e=document.getElementById("reg-email"),t=document.getElementById("email-feedback");if(!e||!t){console.error("Elementos reg-email ou email-feedback não encontrados");return}const a=e.value.trim();if(a.length===0){t.textContent="",t.classList.add("hidden"),t.classList.remove("text-red-500");return}we(a)?(t.textContent="",t.classList.add("hidden"),t.classList.remove("text-red-500")):(t.textContent="Email inválido. Use o formato: exemplo@dominio.com",t.classList.remove("hidden"),t.classList.add("text-red-500"))}function fe(){const e=document.getElementById("reg-password"),t=document.getElementById("password-feedback"),a=document.getElementById("password-strength"),s=document.getElementById("password-strength-text");if(!e||!t||!a||!s){console.error("Elementos de senha não encontrados");return}const o=a.querySelectorAll(".password-bar"),n=e.value,r=Ee(n);let i=Object.values(r).filter(Boolean).length,c=i===5;if(n.length===0){t.textContent="",t.classList.add("hidden"),t.classList.remove("text-red-500"),a.classList.add("hidden"),o.forEach(d=>{d.classList.remove("active"),d.style.background="#e5e7eb"});return}a.classList.remove("hidden"),a.classList.add("mb-3"),t.innerHTML="",c?(t.textContent="",t.classList.add("hidden"),t.classList.remove("text-red-500"),t.classList.remove("dark:text-red-300")):(t.innerHTML='<span class="text-yellow-600"><i class="fas fa-exclamation-triangle"></i> Senha deve atender todos os critérios:</span>',t.classList.remove("hidden"),t.classList.add("text-red-500"),t.classList.add("dark:text-red-300"));let u=[{label:"Pelo menos 8 caracteres",valid:r.length},{label:"Uma letra maiúscula (A-Z)",valid:r.uppercase},{label:"Uma letra minúscula (a-z)",valid:r.lowercase},{label:"Um número (0-9)",valid:r.number},{label:"Um símbolo (!@#$%^&* etc.)",valid:r.symbol}],l="";u.forEach(d=>{l+=`<div class="flex items-center gap-2 mb-1">
      <span class="${d.valid?"text-green-600":"text-red-500"}">
        <i class="fas fa-${d.valid?"check":"times"}"></i>
      </span>
      ${d.label}
    </div>`}),s.innerHTML=l,o.forEach((d,m)=>{m<i?d.classList.add("active"):(d.classList.remove("active"),d.style.background="#e5e7eb")})}function Ie(){const e=document.getElementById("reg-username")?.value.trim(),t=document.getElementById("reg-fullname")?.value.trim(),a=document.getElementById("reg-email")?.value.trim(),s=document.getElementById("reg-password")?.value,o=document.getElementById("curso-select")?.value,n=document.getElementById("class-select")?.value;if(!e||!t||!a||!s||!o||!n)return console.log("Campos obrigatórios não preenchidos:",{username:e,fullname:t,email:a,password:s,curso:o,classe:n}),!1;const r=he(e),i=xe(t),c=we(a),u=Object.values(Ee(s)).every(Boolean);return console.log("Validações:",{usernameValid:r,fullnameValid:i,emailValid:c,passwordValid:u}),r&&i&&c&&u}function T(){const e=document.getElementById("registerSubmitButton");if(!e){console.error("Botão registerSubmitButton não encontrado");return}const t=Ie();e.disabled=!t,e.classList.toggle("opacity-50",!t),e.classList.toggle("cursor-not-allowed",!t)}function it(e){return{beleza:"beleza",gastronomia:"gastro",gestao:"gestao",oftalmo:"oftalmo",tecnologia:"tecno",idiomas:"idioma"}[e]||null}async function lt(){if(!Ie()){F("Preencha todos os campos corretamente!","error");return}const e=document.getElementById("reg-username").value.trim(),t=document.getElementById("reg-fullname").value.trim(),a=document.getElementById("reg-email").value.trim(),s=document.getElementById("reg-password").value,o=document.getElementById("curso-select").value,n=document.getElementById("class-select").value,r=it(o);console.log("[REGISTER FRONT] Dados enviados:",{username:e,fullname:t,email:a,password:s,curso:o,classe:n,masterArea:r});try{const i=await fetch(`${R}/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,fullname:t,email:a,password:s,curso:o,class:n,pending:!0,masterArea:r,isMaster:!1})});let c;try{c=await i.json()}catch{c={}}if(!i.ok){F(c.message||c.error||`Erro ${i.status}: ${i.statusText}`,"error");return}c.success?(F("Conta criada! Aguarde aprovação do mestre da área.","success"),be(),T()):F(c.message||"Erro ao criar213 conta.","error")}catch{F("Erro de conexão com o servidor.","error")}}document.addEventListener("DOMContentLoaded",()=>{console.log("DOMContentLoaded: Inicializando validações"),st(),de(),ue(),me(),fe(),T();const e=document.getElementById("reg-username"),t=document.getElementById("reg-fullname"),a=document.getElementById("reg-email"),s=document.getElementById("reg-password");document.getElementById("curso-select");const o=document.getElementById("class-select"),n=document.getElementById("registerSubmitButton");e?e.addEventListener("input",()=>{console.log("Input no username"),de(),T()}):console.error("Elemento reg-username não encontrado"),t?t.addEventListener("input",()=>{console.log("Input no fullname"),ue(),T()}):console.error("Elemento reg-fullname não encontrado"),a?a.addEventListener("input",()=>{console.log("Input no email"),me(),T()}):console.error("Elemento reg-email não encontrado"),s?s.addEventListener("input",()=>{console.log("Input no password"),fe(),T()}):console.error("Elemento reg-password não encontrado"),["curso-select","class-select"].forEach(r=>{const i=document.getElementById(r);i?i.addEventListener("change",()=>{console.log(`Change no ${r}`),T()}):console.error(`Elemento ${r} não encontrado`)}),o&&o.addEventListener("click",function(){this.disabled&&F("Por favor, escolha um curso primeiro!","warning")}),n?n.addEventListener("click",function(r){r.preventDefault(),console.log("Botão de cadastro clicado"),lt()}):console.error("Botão registerSubmitButton não encontrado")});function ct(){const e=document.documentElement,t=document.getElementById("theme-icon");e.getAttribute("data-theme")==="dark"?(e.removeAttribute("data-theme"),e.classList.remove("dark"),localStorage.setItem("theme","light"),t&&(t.className="fas fa-moon theme-icon-moon")):(e.setAttribute("data-theme","dark"),e.classList.add("dark"),localStorage.setItem("theme","dark"),t&&(t.className="fas fa-sun theme-icon-sun"))}function dt(){const e=localStorage.getItem("theme")||"light",t=document.documentElement,a=document.getElementById("theme-icon");e==="dark"?(t.setAttribute("data-theme","dark"),t.classList.add("dark"),a&&(a.className="fas fa-sun theme-icon-sun")):(t.removeAttribute("data-theme"),t.classList.remove("dark"),a&&(a.className="fas fa-moon theme-icon-moon"))}window.toggleTheme=ct;dt();let Q=[],K={};const ut={tecno:"tecnologia",gastro:"gastronomia",beleza:"beleza",gestao:"gestao",oftalmo:"oftalmo",idioma:"idiomas"};async function Se(){try{const e=document.getElementById("students-list");e&&(e.innerHTML='<p class="text-gray-500 py-4">Carregando alunos...</p>');const t=localStorage.getItem("username"),a=await w("/usuarios/approved-students");Array.isArray(a)||console.warn("[ALUNOS] resposta inesperada de approved-students:",a);const s=(a||[]).filter(n=>n.masterUsername===t);Q=s,window.originalStudents=Q,ft(s),gt(),await pt(),window.renderTurmas&&window.renderTurmas(),Le("student")?z():Te(s)}catch(e){console.error("[ALUNOS] Erro ao carregar alunos:",e);const t=document.getElementById("students-list");t&&(t.innerHTML=`<p class="text-red-500 py-4">Erro ao carregar alunos: ${e.message||e}</p>`),p("Erro ao carregar alunos: "+(e.message||e))}}function Te(e){const t=document.getElementById("students-list");if(!t){console.error("[ERROR] Container students-list não encontrado!");return}if(!e||e.length===0){t.innerHTML='<p class="text-gray-500 py-4">Nenhum aluno encontrado.</p>';return}t.innerHTML=e.map(a=>mt(a)).join("")}function mt(e){const t=e.turma||e.assignedTurma||"Turma não definida",a=e.level||1,s=e.xp||0;let o="bg-gray-500",n="fas fa-seedling";a>=10?(o="bg-gradient-to-r from-purple-500 to-pink-500",n="fas fa-crown"):a>=7?(o="bg-gradient-to-r from-yellow-400 to-orange-500",n="fas fa-star"):a>=4?(o="bg-gradient-to-r from-blue-400 to-blue-600",n="fas fa-rocket"):a>=2&&(o="bg-gradient-to-r from-green-400 to-green-600",n="fas fa-leaf");const i={"Arqueiro do JavaScript":"fab fa-js-square","Cafeicultor do Java":"fab fa-java","Mago do CSS":"fab fa-css3-alt","Paladino do HTML":"fab fa-html5","Bárbaro do Back-end":"fas fa-server","Domador de Dados":"fas fa-chart-bar","Elfo do Front-end":"fas fa-paint-brush","Caçador de Bugs":"fas fa-bug"}[e.class]||"fas fa-user";let c="";if(e.levelInfo&&!e.levelInfo.isMaxLevel){const u=e.levelInfo;c=`
      <div class="mt-3">
        <div class="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progresso do Nível</span>
          <span>${u.xpProgressInCurrentLevel}/${u.xpNeededForCurrentLevel} XP</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300" 
               style="width: ${u.progressPercentage}%"></div>
        </div>
        <div class="text-xs text-center text-gray-500 mt-1">${u.progressPercentage}% concluído</div>
      </div>
    `}else e.levelInfo?.isMaxLevel&&(c=`
      <div class="mt-3 text-center">
        <div class="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          <i class="fas fa-trophy mr-1"></i> NÍVEL MÁXIMO
        </div>
      </div>
    `);return`
    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <!-- Header do Card -->
      <div class="bg-gradient-to-r from-purple-500 to-blue-600 p-4 text-white relative">
        <div class="absolute top-2 right-2">
          <div class="${o} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
            <i class="${n} mr-1"></i>
            Nível ${a}
          </div>
        </div>
        <div class="flex items-center">
          <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
            <i class="${i} text-2xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-lg">${e.username}</h3>
            <p class="text-blue-100 text-sm">${t}</p>
          </div>
        </div>
      </div>

      <!-- Conteúdo do Card -->
      <div class="p-4">
        <!-- Informações Principais -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">${s}</div>
            <div class="text-xs text-gray-500">XP Total</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">${a}</div>
            <div class="text-xs text-gray-500">Nível Atual</div>
          </div>
        </div>

        <!-- Classe do Estudante -->
        <div class="bg-gray-50 rounded-lg p-3 mb-4">
          <div class="flex items-center">
            <i class="${i} text-lg text-gray-600 mr-2"></i>
            <span class="text-sm font-medium text-gray-700">${e.class||"Classe não definida"}</span>
          </div>
        </div>

        <!-- Barra de Progresso -->
        ${c}

        <!-- Botões de Ação Modernos -->
        <div class="mt-6 space-y-3">
          <!-- Primeira linha de botões -->
          <div class="grid grid-cols-2 gap-3">
            <button data-student-id="${e.id}" data-student-name="${e.username}" 
                    class="penalty-btn bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1">
              <i class="fas fa-minus-circle mr-2 text-base"></i>
              <span class="hidden sm:inline">Penalidade</span>
              <span class="sm:hidden">-XP</span>
            </button>
            <button data-student-id="${e.id}" data-student-name="${e.username}" 
                    class="reward-btn bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1">
              <i class="fas fa-plus-circle mr-2 text-base"></i>
              <span class="hidden sm:inline">Recompensa</span>
              <span class="sm:hidden">+XP</span>
            </button>
          </div>
          
          <!-- Segunda linha de botões -->
          <div class="grid grid-cols-2 gap-3">
            <button data-student-id="${e.id}" data-student-name="${e.username}" 
                    class="history-btn bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1">
              <i class="fas fa-history mr-2 text-base"></i>
              <span class="hidden sm:inline">Histórico</span>
              <span class="sm:hidden">Log</span>
            </button>
            <button data-student-id="${e.id}" data-student-name="${e.username}" 
                    class="expel-btn bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1">
              <i class="fas fa-user-times mr-2 text-base"></i>
              <span class="hidden sm:inline">Expulsar</span>
              <span class="sm:hidden">Del</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer com estatísticas adicionais -->
      <div class="bg-gray-50 px-4 py-2 border-t">
        <div class="flex justify-between text-xs text-gray-500">
          <span><i class="fas fa-calendar-alt mr-1"></i>Membro desde ${new Date().getFullYear()}</span>
          <span><i class="fas fa-clock mr-1"></i>Ativo</span>
        </div>
      </div>
    </div>
  `}function Le(e){if(e==="student"){const t=document.getElementById("student-year-filter")?.value,a=document.getElementById("student-class-filter")?.value,s=document.getElementById("student-level-filter")?.value;return t!=="all"||a!=="all"||s!=="all"}return!1}function z(){const e=document.getElementById("student-year-filter")?.value||"all",t=document.getElementById("student-class-filter")?.value||"all",a=document.getElementById("student-level-filter")?.value||"all";let s=Q||[];e!=="all"&&(s=s.filter(o=>(o.turma||o.assignedTurma)===e)),t!=="all"&&(s=s.filter(o=>o.class===t)),a!=="all"&&(s=s.filter(o=>(o.level||1)>=parseInt(a))),console.log("[FILTROS] Aplicando filtros:",{turmaFilter:e,classFilter:t,levelFilter:a,resultados:s.length}),Te(s)}function ft(e){K={},e.forEach(t=>{const a=t.turma||t.assignedTurma,s=t.class;if(a&&s){for(const[o,n]of Object.entries(q))if(n.classes[s]){K[a]=o;break}}}),console.log("[FILTROS] Mapa turma-área construído:",K)}function gt(){const e=document.getElementById("student-class-filter");if(!e)return;const t=localStorage.getItem("username");if(!t){console.warn("[FILTROS] Username do mestre não encontrado");return}const a=ut[t];if(!a||!q[a]){console.warn("[FILTROS] Área do mestre não encontrada:",t);return}console.log(`[FILTROS] Populando classes para mestre ${t} da área ${a}`),e.innerHTML='<option value="all">Todas as classes</option>',Object.keys(q[a].classes).forEach(s=>{const o=document.createElement("option");o.value=s,o.textContent=s,e.appendChild(o)})}async function pt(){try{const e=await w("/turmas");if(e&&e.turmas){const t=document.getElementById("student-year-filter");if(t){const a=t.value;t.innerHTML='<option value="all">Todas as turmas</option>',e.turmas.forEach(s=>{const o=document.createElement("option");o.value=s,o.textContent=s,t.appendChild(o)}),a&&a!=="all"&&(t.value=a)}}}catch(e){console.error("[FILTROS] Erro ao carregar turmas:",e)}}function yt(){const e=document.getElementById("student-year-filter"),t=document.getElementById("student-class-filter"),a=document.getElementById("student-level-filter"),s=document.getElementById("apply-student-filters");e&&e.addEventListener("change",z),[t,a].forEach(o=>{o&&o.addEventListener("change",z)}),s&&s.addEventListener("click",z)}let G=[],ee=[];function vt(e){if(!e)return null;if(e instanceof Date&&!isNaN(e.getTime()))return e;if(typeof e=="object"&&e.seconds!==void 0)return new Date(e.seconds*1e3);const t=new Date(e);return isNaN(t.getTime())?null:t}function re(e){if(e==="submission"){const t=document.getElementById("filter-submission-status")?.value,a=document.getElementById("filter-submission-turma")?.value,s=document.getElementById("filter-submission-class")?.value,o=document.getElementById("filter-submission-student")?.value,n=document.getElementById("filter-submission-mission")?.value;return t!=="all"||a!=="all"||s!=="all"||o&&o.trim()!==""||n&&n.trim()!==""}if(e==="mission"){const t=document.getElementById("filter-mission-turma")?.value,a=document.getElementById("filter-mission-class")?.value,s=document.getElementById("filter-mission-xp")?.value;return t!=="all"||a!=="all"||s&&s!==""}return!1}function ke(e,t="arquivo"){try{if(console.log("🔗 Abrindo arquivo:",{fileUrl:e,fileName:t}),!e||e==="[object Object]"){console.error("❌ URL inválida ou objeto:",e),p("URL do arquivo é inválida");return}if(e.includes("firebasestorage.googleapis.com")){const u=localStorage.getItem("token"),l=`${R}/files/proxy?url=${encodeURIComponent(e)}&token=${u}`;console.log("📡 Usando proxy para arquivo Firebase:",l);try{x("Carregando arquivo...");const d=document.createElement("a");d.href=l,d.target="_blank",d.rel="noopener noreferrer",document.body.appendChild(d),d.click(),document.body.removeChild(d);return}catch(d){console.error("❌ Erro ao buscar arquivo via proxy:",d)}e=l}const a=t.split(".").pop()?.toLowerCase()||"";console.log("📄 Extensão detectada:",a);const s=["png","jpg","jpeg","gif","svg","webp","bmp","ico"],o=["js","jsx","ts","tsx","html","css","json","xml","md","txt","py","java","c","cpp","h"],n=["pdf"],r=["mp4","webm","ogg"],i=["mp3","wav","ogg"];if(s.includes(a)||n.includes(a)||r.includes(a)||i.includes(a)){console.log("✅ Tipo renderizável pelo navegador, abrindo diretamente");const u=document.createElement("a");u.href=e,u.target="_blank",u.rel="noopener noreferrer",document.body.appendChild(u),u.click(),document.body.removeChild(u);return}if(o.includes(a)){console.log("📝 Arquivo de código, criando preview"),bt(e,t,a);return}console.log("⚠️ Tipo desconhecido, tentando abrir no navegador");const c=document.createElement("a");c.href=e,c.target="_blank",c.rel="noopener noreferrer",document.body.appendChild(c),c.click(),document.body.removeChild(c),x("Abrindo arquivo no navegador...")}catch(a){console.error("❌ Erro ao abrir arquivo:",a),p("Erro ao abrir arquivo: "+(a.message||a))}}function bt(e,t,a){try{if(console.log("📥 Criando preview para arquivo:",t),e.includes("firebasestorage.googleapis.com")){const o=localStorage.getItem("token"),n=`${R}/files/proxy?url=${encodeURIComponent(e)}&token=${o}`;console.log("📡 Usando proxy para arquivo Firebase no preview:",n),e=n}const s=document.createElement("a");s.href=e,s.target="_blank",s.rel="noopener noreferrer",document.body.appendChild(s),s.click(),document.body.removeChild(s),console.log("✅ Link de visualização aberto:",e),x("Abrindo arquivo para visualização...")}catch(s){console.error("❌ Erro ao criar preview:",s),p("Não foi possível carregar o preview. Baixando arquivo..."),ht(e,t)}}function M(e){return e?e.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r"):""}async function Be(e,t){try{if(console.log("⬇️ Download iniciado:",{fileUrl:e,fileName:t}),e.includes("firebasestorage.googleapis.com")){const s=localStorage.getItem("token");x("Preparando download...");const o=await fetch(`${R}/files/proxy?url=${encodeURIComponent(e)}&token=${s}`);if(!o.ok)throw new Error(`Erro ao baixar arquivo: ${o.status} ${o.statusText}`);const n=await o.blob(),r=URL.createObjectURL(n),i=document.createElement("a");i.href=r,i.download=t,i.target="_self",document.body.appendChild(i),i.click(),document.body.removeChild(i),setTimeout(()=>URL.revokeObjectURL(r),5e3),x("Download iniciado!"),console.log("✅ Download via proxy iniciado:",t);return}const a=document.createElement("a");a.href=e,a.download=t,a.target="_blank",document.body.appendChild(a),a.click(),document.body.removeChild(a)}catch(a){console.error("❌ Erro ao iniciar download:",a),p("Erro ao baixar arquivo: "+(a.message||a))}}function ht(e,t){Be(e,t)}function xt(e){const t=e.split("/").pop()?.split("?")[0]||"arquivo";ke(e,t)}async function X(){try{const e=document.getElementById("submissions-list");e&&(e.innerHTML='<p class="text-gray-500 py-4">Carregando submissões...</p>'),ee=await w("/submissoes")||[],await Fe(),window.originalStudents&&Pe(window.originalStudents),re("submission")?O():$e(ee)}catch(e){console.error("Erro ao carregar submissões:",e);const t=document.getElementById("submissions-list");t&&(t.innerHTML=`<p class="text-red-500 py-4">Erro: ${e.message||e}</p>`),p(e.message||e)}}async function U(){try{const e=document.getElementById("missions-list");e&&(e.innerHTML='<p class="text-gray-500 py-4">Carregando missões...</p>'),G=await w("/missoes")||[],await Fe(),window.originalStudents&&Pe(window.originalStudents),re("mission")?P():Ce(G)}catch(e){console.error("Erro ao carregar missões:",e);const t=document.getElementById("missions-list");t&&(t.innerHTML=`<p class="text-red-500 py-4">Erro: ${e.message||e}</p>`),p(e.message||e)}}function $e(e){const t=document.getElementById("submissions-list");if(!t)return;if(!e||e.length===0){t.innerHTML='<p class="text-gray-500 py-4">Nenhuma submissão encontrada.</p>';return}const a=e.sort((s,o)=>{const n=new Date(s.submittedAt||0);return new Date(o.submittedAt||0)-n});t.innerHTML=a.map(s=>wt(s)).join(""),t.querySelectorAll(".approve-submission-btn").forEach(s=>{s.onclick=async()=>{const o=s.dataset.submissionId;console.log("[MISSOES] Aprovando submissão:",o);try{const n=await w(`/submissoes/${o}/approve`,{method:"POST",body:JSON.stringify({feedback:""})});console.log("[MISSOES] Resposta da aprovação:",n),x("Submissão aprovada com sucesso!"),await X()}catch(n){console.error("[MISSOES] Erro ao aprovar submissão:",n),p("Erro ao aprovar submissão: "+(n.message||n))}}}),t.querySelectorAll(".reject-submission-btn").forEach(s=>{s.onclick=async()=>{const o=s.dataset.submissionId;console.log("[MISSOES] Rejeitando submissão:",o);try{const n=await w(`/submissoes/${o}/reject`,{method:"POST",body:JSON.stringify({feedback:""})});console.log("[MISSOES] Resposta da rejeição:",n),x("Submissão rejeitada com sucesso!"),await X()}catch(n){console.error("[MISSOES] Erro ao rejeitar submissão:",n),p("Erro ao rejeitar submissão: "+(n.message||n))}}})}function wt(e){console.log("📅 Debug submissão:",{id:e.id,submittedAt:e.submittedAt,typeOf:typeof e.submittedAt});const t={pending:"bg-yellow-100 text-yellow-800 border-yellow-300",approved:"bg-green-100 text-green-800 border-green-300",rejected:"bg-red-100 text-red-800 border-red-300"},a={pending:"fa-clock",approved:"fa-check-circle",rejected:"fa-times-circle"},s={pending:"Pendente",approved:"Aprovado",rejected:"Rejeitado"},o=r=>{if(!r)return"Data não informada";try{const i=vt(r);return i?i.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):(console.error("❌ Data inválida recebida:",r),"Data inválida")}catch(i){return console.error("Erro ao formatar data:",dateStr,i),"Data inválida"}};console.log("📎 Arquivos da submissão:",{id:e.id,hasFilePaths:!!e.filePaths,filePathsLength:e.filePaths?.length,filePathsType:Array.isArray(e.filePaths)?"array":typeof e.filePaths,hasFileUrls:!!e.fileUrls,fileUrlsLength:e.fileUrls?.length,fileUrlsType:Array.isArray(e.fileUrls)?"array":typeof e.fileUrls,hasFileUrl:!!e.fileUrl,fileUrlType:typeof e.fileUrl,filePaths:e.filePaths,fileUrls:e.fileUrls,fileUrl:e.fileUrl,fileUrlsElementTypes:Array.isArray(e.fileUrls)?e.fileUrls.map(r=>typeof r):null});let n="";if(e.fileUrls&&e.fileUrls.length>0)n=`
      <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <i class="fas fa-paperclip mr-2"></i>
          Arquivos enviados (${e.fileUrls.length})
        </h4>
        <div class="space-y-2">
          ${e.fileUrls.map((r,i)=>{let c=r,u=`arquivo${i+1}`;if(!r)return console.warn("⚠️ fileUrl ausente no índice",i),"";if(typeof r=="object"&&r.url)console.log("📦 fileUrl é objeto, extraindo URL:",r),c=r.url,u=r.name||u;else if(typeof r=="string")c=r,u=r.split("/").pop()?.split("?")[0]||u;else return console.error("❌ fileUrl com tipo inválido:",typeof r,r),"";const l=decodeURIComponent(u),d=M(c),m=M(l);return`
              <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                  <i class="fas fa-file-code text-blue-600 mr-2"></i>${l}
                </span>
                <div class="flex gap-2 ml-2">
                  <button onclick="window.downloadFileSecurely('${d}', '${m}')"
                     class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
                    <i class="fas fa-download mr-1"></i>Baixar
                  </button>
                  <button onclick="window.openFileWithPreview('${d}', '${m}')" 
                          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
                    <i class="fas fa-eye mr-1"></i>Ver
                  </button>
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    `;else if(e.filePaths&&e.filePaths.length>0)n=`
      <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <i class="fas fa-paperclip mr-2"></i>
          Arquivos enviados (${e.filePaths.length})
        </h4>
        <div class="space-y-2">
          ${e.filePaths.map((r,i)=>{const c=r.split("/").pop()||r.split("\\").pop()||`arquivo${i+1}`,u=e.fileUrls?.[i]||r,l=M(u),d=M(c);return`
              <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                  <i class="fas fa-file-code text-blue-600 mr-2"></i>${c}
                </span>
                <div class="flex gap-2 ml-2">
                  <button onclick="window.downloadFileSecurely('${l}', '${d}')"
                     class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
                    <i class="fas fa-download mr-1"></i>Baixar
                  </button>
                  <button onclick="window.openFileWithPreview('${l}', '${d}')" 
                          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
                    <i class="fas fa-eye mr-1"></i>Ver
                  </button>
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    `;else if(e.fileUrl&&typeof e.fileUrl=="string"){const r=e.fileUrl.split("/").pop()?.split("?")[0]||"arquivo",i=decodeURIComponent(r),c=M(e.fileUrl),u=M(i);n=`
      <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <i class="fas fa-paperclip mr-2"></i>
          Arquivo enviado
        </h4>
        <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
          <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
            <i class="fas fa-file-code text-blue-600 mr-2"></i>${i}
          </span>
          <div class="flex gap-2 ml-2">
            <button onclick="window.downloadFileSecurely('${c}', '${u}')"
               class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
              <i class="fas fa-download mr-1"></i>Baixar
            </button>
            <button onclick="window.openFileWithPreview('${c}', '${u}')" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
              <i class="fas fa-eye mr-1"></i>Ver
            </button>
          </div>
        </div>
      </div>
    `}else n=`
      <div class="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p class="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Nenhum arquivo foi enviado com esta submissão
        </p>
      </div>
    `;return`
    <div class="card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${e.status==="pending"?"border-yellow-400":e.status==="approved"?"border-green-400":"border-red-400"}">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-1">
            ${e.missionTitle||"Missão não informada"}
          </h3>
          ${e.missionDescription?`
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              ${e.missionDescription}
            </p>
          `:""}
        </div>
        <span class="inline-flex items-center ${t[e.status]||t.pending} text-xs font-semibold px-3 py-1 rounded-full border">
          <i class="fas ${a[e.status]||a.pending} mr-1"></i>
          ${s[e.status]||"Pendente"}
        </span>
      </div>

      <!-- Informações do Aluno -->
      <div class="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-750 rounded-lg">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Aluno</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              <i class="fas fa-user text-blue-600 mr-2"></i>${e.username||"Não informado"}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Turma</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              <i class="fas fa-users text-purple-600 mr-2"></i>${e.userTurma||e.turma||"Sem turma"}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Classe</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              <i class="fas fa-shield-alt text-green-600 mr-2"></i>${e.userClass||"Não informada"}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Data de Envio</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              <i class="fas fa-calendar-alt text-orange-600 mr-2"></i>${o(e.submittedAt)}
            </p>
          </div>
        </div>
      </div>

      <!-- Arquivos -->
      ${n}

      <!-- Feedback (se houver) -->
      ${e.feedback?`
        <div class="mb-4 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-400">
          <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
            <i class="fas fa-comment-alt mr-2"></i>Feedback
          </h4>
          <p class="text-sm text-blue-800 dark:text-blue-200">${e.feedback}</p>
        </div>
      `:""}

      <!-- Ações -->
      ${e.status==="pending"?`
        <div class="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button class="approve-submission-btn flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center"
                  data-submission-id="${e.id}">
            <i class="fas fa-check mr-2"></i>Aprovar
          </button>
          <button class="reject-submission-btn flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center"
                  data-submission-id="${e.id}">
            <i class="fas fa-times mr-2"></i>Rejeitar
          </button>
        </div>
      `:""}
    </div>
  `}function Ce(e){const t=document.getElementById("missions-list");if(!t)return;if(!e||e.length===0){t.innerHTML='<p class="text-gray-500 py-4">Nenhuma missão encontrada.</p>';return}const a=n=>{try{if(!n)return null;if(typeof n?.toDate=="function")return n.toDate();if(typeof n?.seconds=="number")return new Date(n.seconds*1e3);if(typeof n=="number")return new Date(n>1e12?n:n*1e3);const r=new Date(n);return isNaN(r.getTime())?null:r}catch{return null}},s=n=>a(n&&(n.createdAt??n.created_at??n.created??n.createdOn??n.created_time??n.createdTimestamp)||null),o=[...e].sort((n,r)=>{const i=(s(n)||new Date(0)).getTime();return(s(r)||new Date(0)).getTime()-i});t.innerHTML=o.map(n=>Et(n)).join(""),t.querySelectorAll(".edit-mission-btn").forEach(n=>{n.onclick=()=>{const r=n.dataset.missionId;try{De(r)}catch(i){console.warn("editMission não disponível:",i)}}}),t.querySelectorAll(".delete-mission-btn").forEach(n=>{n.onclick=async()=>{const r=n.dataset.missionId;if(confirm("Deletar missão?"))try{await w(`/missoes/${r}`,{method:"DELETE"}),x("Missão deletada com sucesso!"),await U()}catch(i){console.error("Erro ao deletar missão:",i),p("Erro ao deletar missão: "+(i.message||i))}}})}function Et(e){const t={facil:"bg-green-100 text-green-800",medio:"bg-yellow-100 text-yellow-800",dificil:"bg-red-100 text-red-800"},a={facil:"Fácil",medio:"Médio",dificil:"Difícil"};let s="facil";e.xp>=100?s="dificil":e.xp>=50&&(s="medio");const o=l=>!l||l==="geral"?"Geral":l,n=l=>!l||l===""||l===null||l===void 0?"Todas as turmas":l,r=l=>{try{if(!l)return null;if(typeof l?.toDate=="function")return l.toDate();if(typeof l?.seconds=="number")return new Date(l.seconds*1e3);if(typeof l=="number")return new Date(l>1e12?l:l*1e3);const d=new Date(l);return isNaN(d.getTime())?null:d}catch{return null}},c=(l=>r(l&&(l.createdAt??l.created_at??l.created??l.createdOn??l.created_time??l.createdTimestamp)||null))(e),u=c?c.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"Data não disponível";return`
    <div class="card bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-bold">${e.titulo||e.title||"Missão sem título"}</h3>
        <span class="text-xs text-gray-500" title="Data de criação">
          <i class="far fa-calendar-alt mr-1"></i>${u}
        </span>
      </div>
      <p class="text-gray-600 mb-3">${e.descricao||e.description||"Sem descrição"}</p>
      
      <div class="mb-3 flex flex-wrap gap-2">
        <span class="inline-block ${t[s]} text-xs px-2 py-1 rounded">
          ${a[s]}
        </span>
        <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          ${e.xp||0} XP
        </span>
        <span class="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
          ${o(e.targetClass)}
        </span>
        <span class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
          ${n(e.turma)}
        </span>
      </div>

      <div class="flex gap-2">
        <button class="edit-mission-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                data-mission-id="${e.id}">
          <i class="fas fa-edit mr-1"></i>Editar
        </button>
        <button class="delete-mission-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                data-mission-id="${e.id}">
          <i class="fas fa-trash mr-1"></i>Excluir
        </button>
      </div>
    </div>
  `}async function It(e,t,a){try{t==="DELETE"?(await w(`/missoes/${e}`,{method:"DELETE"}),x(a),U()):p("Ação não reconhecida")}catch(s){console.error("Erro na ação da missão:",s),p(`Erro: ${s.message}`)}}function O(){const e=document.getElementById("filter-submission-status")?.value||"all",t=document.getElementById("filter-submission-mission")?.value?.trim()||"",a=document.getElementById("filter-submission-turma")?.value||"all",s=document.getElementById("filter-submission-class")?.value||"all",o=document.getElementById("filter-submission-student")?.value?.trim().toLowerCase()||"";let n=ee||[];e!=="all"&&(n=n.filter(r=>r.status===e)),t&&(n=n.filter(r=>(r.missionTitle||"").toLowerCase().includes(t.toLowerCase()))),a!=="all"&&(n=n.filter(r=>(r.userTurma||r.studentTurma)===a)),s!=="all"&&(n=n.filter(r=>(r.userClass||r.studentClass)===s)),o&&(n=n.filter(r=>(r.username||r.studentUsername||r.studentName||"").toLowerCase().includes(o))),$e(n)}function P(){const e=document.getElementById("filter-mission-turma")?.value||"all",t=document.getElementById("filter-mission-class")?.value||"all",a=document.getElementById("filter-mission-xp")?.value||"";let s=G||[];e!=="all"&&(s=s.filter(o=>String(o.turmaId||o.turma||o.turmaName||o.classroom||"")==String(e))),t!=="all"&&(s=s.filter(o=>String(o.targetClass||"geral")==t)),a&&(a==="0-49"?s=s.filter(o=>(o.xp||0)>=0&&(o.xp||0)<50):a==="50-99"?s=s.filter(o=>(o.xp||0)>=50&&(o.xp||0)<100):a==="100+"&&(s=s.filter(o=>(o.xp||0)>=100))),Ce(s)}function Ae(){const e=document.getElementById("filter-mission-turma"),t=document.getElementById("filter-mission-class"),a=document.getElementById("filter-mission-xp"),s=document.getElementById("apply-mission-filters");e&&e.addEventListener("change",P),t&&t.addEventListener("change",P),a&&a.addEventListener("change",P),s&&s.addEventListener("click",P)}function Me(){const e=document.getElementById("filter-submission-status"),t=document.getElementById("filter-submission-mission"),a=document.getElementById("filter-submission-turma"),s=document.getElementById("filter-submission-class"),o=document.getElementById("filter-submission-student"),n=document.getElementById("apply-submission-filters");[e,t,a,s].forEach(r=>{r&&r.addEventListener("change",O)}),o&&o.addEventListener("keypress",r=>{r.key==="Enter"&&O()}),n&&n.addEventListener("click",O)}async function Fe(){try{const e=await w("/turmas");if(e&&e.turmas){const t=document.getElementById("filter-submission-turma");if(t){const s=t.value;t.innerHTML='<option value="all">Todas as turmas</option>',e.turmas.forEach(o=>{const n=document.createElement("option");n.value=o,n.textContent=o,t.appendChild(n)}),s&&s!=="all"&&(t.value=s)}const a=document.getElementById("filter-mission-turma");if(a){const s=a.value;a.innerHTML='<option value="all">Todas as turmas</option>',e.turmas.forEach(o=>{const n=document.createElement("option");n.value=o,n.textContent=o,a.appendChild(n)}),s&&s!=="all"&&(a.value=s)}console.log("[FILTROS] Turmas carregadas nos selects:",e.turmas.length)}}catch(e){console.error("[FILTROS] Erro ao carregar turmas:",e)}}function Pe(e){try{const t=[...new Set(e.map(o=>o.class).filter(Boolean))],a=document.getElementById("filter-submission-class");if(a){const o=a.value;a.innerHTML='<option value="all">Todas as classes</option>',t.forEach(n=>{const r=document.createElement("option");r.value=n,r.textContent=n,a.appendChild(r)}),o&&o!=="all"&&(a.value=o)}const s=document.getElementById("filter-mission-class");if(s){const o=s.value;s.innerHTML='<option value="all">Todas as classes</option>',t.forEach(n=>{const r=document.createElement("option");r.value=n,r.textContent=n,s.appendChild(r)}),o&&o!=="all"&&(s.value=o)}console.log("[FILTROS] Classes carregadas nos selects:",t.length)}catch(t){console.error("[FILTROS] Erro ao popular classes:",t)}}function Re(){const e=document.getElementById("create-mission-btn");e&&e.addEventListener("click",async t=>{t.preventDefault(),await St()})}function De(e){try{const t=G.find(l=>l.id==e);if(!t){p("Missão não encontrada");return}const a=document.getElementById("mission-title"),s=document.getElementById("mission-description"),o=document.getElementById("mission-xp"),n=document.getElementById("mission-turma"),r=document.getElementById("mission-class");a&&(a.value=t.titulo||t.title||""),s&&(s.value=t.descricao||t.description||""),o&&(o.value=t.xp||""),n&&(n.value=t.turma||""),r&&(r.value=t.targetClass||"geral");const i=document.getElementById("create-mission-btn"),c=document.getElementById("cancel-edit-btn");i&&(i.innerHTML='<i class="fas fa-save mr-2"></i>Salvar Alterações',i.className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition font-medium",i.dataset.editingId=e),c&&(c.style.display="block");const u=document.querySelector("#missions-content .bg-white.p-6");u&&u.scrollIntoView({behavior:"smooth",block:"start"}),x("Missão carregada para edição")}catch(t){console.error("Erro ao editar missão:",t),p("Erro ao carregar missão para edição")}}async function St(){try{const e=document.getElementById("mission-title"),t=document.getElementById("mission-description"),a=document.getElementById("mission-xp"),s=document.getElementById("mission-turma"),o=document.getElementById("mission-class");if(!e||!t||!a||!s||!o){p("Formulário de missão não encontrado. Recarregue a página."),console.error("Elementos do formulário não encontrados");return}const n=e.value.trim(),r=t.value.trim(),i=parseInt(a.value),c=s.value||null,u=o.value,l=document.getElementById("create-mission-btn"),d=l&&l.dataset.editingId,m=d?parseInt(l.dataset.editingId):null;if(!n){p("Título da missão é obrigatório");return}if(!r){p("Descrição da missão é obrigatória");return}if(!i||i<=0){p("XP da missão deve ser um número positivo");return}const f={titulo:n,descricao:r,xp:i,turma:c||null,targetClass:u||"geral"};let y,g;d?(y=await w(`/missoes/${m}`,{method:"PUT",body:JSON.stringify(f)}),g="Missão atualizada com sucesso!"):(f.status="ativa",y=await w("/missoes",{method:"POST",body:JSON.stringify(f)}),g="Missão criada com sucesso!"),x(g),ie(),U()}catch(e){console.error("Erro ao processar missão:",e);const t=document.getElementById("create-mission-btn")?.dataset.editingId?"atualizar":"criar";p(`Erro ao ${t} missão: ${e.message}`)}}function ie(){try{const e=document.getElementById("mission-title"),t=document.getElementById("mission-description"),a=document.getElementById("mission-xp"),s=document.getElementById("mission-turma"),o=document.getElementById("mission-class");e&&(e.value=""),t&&(t.value=""),a&&(a.value=""),s&&(s.value=""),o&&(o.value="geral");const n=document.getElementById("create-mission-btn"),r=document.getElementById("cancel-edit-btn");n&&(n.innerHTML='<i class="fas fa-plus mr-2"></i>Criar Missão',n.className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition font-medium",delete n.dataset.editingId),r&&(r.style.display="none"),x("Edição cancelada")}catch(e){console.error("Erro ao cancelar edição:",e),p("Erro ao cancelar edição")}}const S={beleza:{name:"👒 Beleza",classes:{"Estilista das Sombras":{},"Feiticeira das Unhas":{},"Encantador de Cores":{},"Artista das Luzes":{},"Cortes Fantasma":{},"Guardiã das Flores":{},"Alquimista do Perfume":{},"Mestre do Reflexo":{}}},gastronomia:{name:"👨‍🍳 Gastronomia",classes:{"Cozinheiro Arcano":{},"Alquimista dos Sabores":{},"Guardiã do Forno":{},"Mestre das Caldeiradas":{},"Confeiteiro Místico":{},"Senhor dos Temperos":{},"Sommelier Sagrado":{},"Druida da Nutrição":{}}},gestao:{name:"👩‍🎓 Gestão",classes:{"Senhor dos Números":{},"Administrador da Ordem":{},"Analista Visionário":{},"Estrategista de Elite":{},"Protetor do Equilíbrio":{},"Mediador das Alianças":{},"Juiz da Justiça":{},"Cronista do Progresso":{}}},oftalmo:{name:"👁️ Oftalmologia",classes:{"Vidente da Visão":{},"Guardiã do Olhar":{},"Caçador de Detalhes":{},"Mestre da Clareza":{},"Sentinela Invisível":{},"Oráculo das Lentes":{},"Defensor da Retina":{},"Ilusionista da Percepção":{}}},tecnologia:{name:"🖥️ Tecnologia",classes:{"Arqueiro do JavaScript":{},"Cafeicultor do Java":{},"Mago do CSS":{},"Paladino do HTML":{},"Bárbaro do Back-end":{},"Domador de Dados":{},"Elfo do Front-end":{},"Caçador de Bugs":{}}},idiomas:{name:"🌐 Idiomas",classes:{"Orador das Runas":{},"Tradutor das Sombras":{},"Bardo Poliglota":{},"Sábio dos Dialetos":{},"Emissário Universal":{},"Guardião da Palavra":{},"Feiticeiro da Pronúncia":{},"Lexicógrafo Arcano":{}}}};function H(e){if(!e)return null;const t=String(e).toLowerCase();return t.includes("tec")||t.includes("tech")||t.includes("inform")||t.includes("ti")?"tecnologia":t.includes("beleza")?"beleza":t.includes("gastr")||t.includes("cozinh")?"gastronomia":t.includes("gest")||t.includes("admin")||t.includes("management")?"gestao":t.includes("oftal")||t.includes("olho")?"oftalmo":t.includes("idiom")||t.includes("lingu")||t.includes("idiomas")?"idiomas":null}const W={"Guardião da Lógica":"tecnologia","Mestre Fullstack":"tecnologia","Grand Maître Cuisinier":"gastronomia","Chanceler Supremo":"gestao","Oráculo da Visão":"oftalmo","Artista Supremo da Forma":"beleza","Orador Supremo":"idiomas"};async function C(){try{const e=document.body?.dataset?.masterArea;if(e){const s=H(e);if(s)return s}const t=document.getElementById("master-area")||document.querySelector("[data-master-area]")||document.querySelector(".master-area");if(t){const s=t.dataset?.masterArea||t.textContent,o=H(s);if(o)return o}const a=document.querySelector('meta[name="master-area"]');if(a&&a.content){const s=H(a.content);if(s)return s}if(!C._cache)try{const s=["/usuarios/me","/perfil"];for(const o of s)try{const n=await w(o);if(!n)continue;const r=n.area||n.areaKey||n.areaSlug||n.allowedArea||n.classArea||n.area_name||n.roleArea||n.areaName,i=H(r);if(i)return C._cache=i,i;const c=n.class||n.classe||n.className;if(c&&W[c])return C._cache=W[c],W[c]}catch{}C._cache=null}catch{}return C._cache||null}catch(e){return console.warn("detectMasterArea erro:",e),null}}async function je(){try{const e=await C(),t=document.getElementById("mission-class"),a=document.getElementById("filter-mission-class"),s=(o,n)=>{const r=document.createElement("option");return r.value=o,r.textContent=n,r};if(t)if(t.innerHTML="",t.appendChild(s("geral","Geral (todas as classes)")),e&&S[e]){const o=document.createElement("optgroup");o.label=S[e].name||e,Object.keys(S[e].classes).forEach(n=>o.appendChild(s(n,n))),t.appendChild(o)}else Object.entries(S).forEach(([o,n])=>{const r=document.createElement("optgroup");r.label=n.name||o,Object.keys(n.classes).forEach(i=>r.appendChild(s(i,i))),t.appendChild(r)});a&&(a.innerHTML="",a.appendChild(s("all","Todas as classes")),e&&S[e]?Object.keys(S[e].classes).forEach(o=>a.appendChild(s(o,o))):Object.values(S).forEach(o=>{Object.keys(o.classes).forEach(n=>a.appendChild(s(n,n)))}))}catch(e){console.warn("populateMissionClassSelect erro:",e)}}async function le(e=0){try{const s=document.getElementById("lista-turmas"),o=document.getElementById("filter-mission-turma"),n=document.getElementById("mission-turma"),r=[];if(s&&s.children.length&&(s.querySelector(".grid")||s).querySelectorAll(".turma-card, [data-turma]").forEach(u=>{const l=u.dataset?.turma||u.querySelector?.("h3")?.textContent?.trim()||u.textContent?.trim();l&&r.push({id:l,name:l})}),r.length===0&&window.Pendentes?.getTurmas)try{const i=window.Pendentes.getTurmas();Array.isArray(i)&&i.forEach(c=>{r.push({id:c,name:c})})}catch(i){console.warn("Erro ao obter turmas do módulo pendentes:",i)}if(r.length===0&&e<6)return await new Promise(i=>setTimeout(i,300)),le(e+1);if(r.length===0)try{const i=await w("/turmas/me").catch(()=>w("/turmas"));Array.isArray(i)&&i.forEach(c=>{const u=c.id??c._id??c.turmaId??c.nome??c.name,l=c.nome||c.name||String(u);u&&r.push({id:String(u),name:l})})}catch(i){console.warn("Fallback API para turmas falhou:",i)}if(o&&(o.innerHTML='<option value="all">Todas as turmas</option>'+r.map(i=>`<option value="${i.id}">${i.name}</option>`).join("")),n){const i=n.querySelector('option[value=""]')?.textContent||"Turma (opcional - para atribuir a uma turma específica)";n.innerHTML=`<option value="">${i}</option>`+r.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}return window.dispatchEvent(new CustomEvent("turmasUpdated",{detail:{turmas:r}})),r}catch(t){return console.warn("populateTurmasFromPending erro:",t),[]}}function Tt(){try{const e=document.getElementById("lista-turmas");if(!e||!window.MutationObserver)return;new MutationObserver(a=>{let s=!1;for(const o of a)if(o.type==="childList"||o.type==="attributes"){s=!0;break}s&&(le().catch(o=>console.warn("Erro ao repopular turmas via observer:",o)),je().catch(o=>console.warn("Erro ao repopular classes via observer:",o)),Oe().catch(o=>console.warn("Erro ao repopular filtros de submissões via observer:",o)))}).observe(e,{childList:!0,subtree:!0,attributes:!0})}catch(e){console.warn("installTurmasObserver erro:",e)}}async function Lt(){try{Ae(),Me(),Re(),await kt(),Tt();const e=document.getElementById("apply-mission-filters");e&&e.addEventListener("click",P);const t=document.getElementById("apply-submission-filters");t&&t.addEventListener("click",O);const a=document.getElementById("cancel-edit-btn");a&&a.addEventListener("click",ie)}catch(e){console.error("[MISSOES] Erro na inicialização:",e)}}async function Oe(){try{const e=document.getElementById("filter-submission-turma"),t=document.getElementById("filter-submission-class");if(e){const a=document.getElementById("lista-turmas"),s=[];if(a&&a.children.length&&(a.querySelector(".grid")||a).querySelectorAll(".turma-card, [data-turma]").forEach(r=>{const i=r.dataset?.turma||r.querySelector?.("h3")?.textContent?.trim()||r.textContent?.trim();i&&s.push(i)}),s.length===0&&window.Pendentes?.getTurmas)try{const o=window.Pendentes.getTurmas();Array.isArray(o)&&s.push(...o)}catch(o){console.warn("Erro ao obter turmas do módulo pendentes:",o)}e.innerHTML='<option value="all">Todas as turmas</option>'+[...new Set(s)].sort().map(o=>`<option value="${o}">${o}</option>`).join("")}if(t){const a=await C(),s=[];a&&S[a]?s.push(...Object.keys(S[a].classes)):Object.values(S).forEach(o=>{s.push(...Object.keys(o.classes))}),t.innerHTML='<option value="all">Todas as classes</option>'+[...new Set(s)].sort().map(o=>`<option value="${o}">${o}</option>`).join("")}}catch(e){console.warn("Erro ao popular filtros de submissões:",e)}}async function kt(){try{await new Promise(e=>setTimeout(e,100)),await je(),await le(),await Oe()}catch(e){console.warn("[MISSOES] Erro ao configurar dados iniciais:",e)}}const te={container:null,init(){this.container||(this.container=document.createElement("div"),this.container.id="toast-container",this.container.className="fixed top-4 right-4 z-50 space-y-2",document.body.appendChild(this.container))},show(e,t="info"){this.init();const a={error:{class:"bg-red-500",icon:"exclamation-triangle"},success:{class:"bg-green-500",icon:"check-circle"},warning:{class:"bg-yellow-500",icon:"exclamation-circle"},info:{class:"bg-blue-500",icon:"info-circle"}},s=a[t]||a.info,o=document.createElement("div");o.className=`${s.class} text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`,o.innerHTML=`
            <div class="flex items-center">
                <i class="fas fa-${s.icon} mr-2"></i>
                <span>${e}</span>
            </div>
        `,this.container.appendChild(o),requestAnimationFrame(()=>{o.classList.remove("translate-x-full","opacity-0")}),setTimeout(()=>{o.classList.add("translate-x-full","opacity-0"),setTimeout(()=>{o.parentNode&&o.parentNode.removeChild(o)},300)},3e3)}};window.checkActiveFilters=function(e){return e==="student"?Le?.(e)||!1:(e==="submission"||e==="mission")&&re?.(e)||!1};(function(){const e=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",e)})();function Bt(){try{const e=document.querySelectorAll(".tab-button"),t=document.querySelectorAll(".tab-content"),a={students:"students-filters",submissions:"submissions-filters",missions:"missions-filters"},s={students:!1,submissions:!1,missions:!1,pending:!1},o={students:0,submissions:0,missions:0,pending:0},n=500,r=d=>{if(!d)return null;const m=(d.id||"").toLowerCase();return m.includes("student")?"students":m.includes("submission")?"submissions":m.includes("mission")?"missions":m.includes("pending")?"pending":null},i=async d=>{if(!d)return;const m=Date.now();if(!s[d]&&!(m-(o[d]||0)<n)){s[d]=!0,o[d]=m;try{$t(d),d==="students"?await Se?.():d==="submissions"?await X?.():d==="missions"?await U?.():d==="pending"&&await V?.()}catch(f){console.error("[MASTER] erro ao carregar aba",d,f);const y={students:"students-list",submissions:"submissions-list",missions:"missions-list",pending:"pending-users"},g=document.getElementById(y[d]);g&&(g.innerHTML=`<p class="text-red-500 py-4">Erro ao carregar: ${f?.message||f}</p>`)}finally{s[d]=!1,o[d]=Date.now()}}},c=d=>{if(!d)return null;e.forEach(v=>{v.classList.remove("active","border-purple-500","text-purple-600"),v.classList.add("text-gray-500")}),t.forEach(v=>v.classList.remove("active","has-active-filters")),d.classList.add("active","border-purple-500","text-purple-600"),d.classList.remove("text-gray-500");const m=d.id.replace(/^tab-/,""),f=`${m}-content`,y=document.getElementById(f);y&&y.classList.add("active"),Object.values(a).forEach(v=>{const E=document.getElementById(v);E&&(E.style.display="none")});const g=a[m];if(g){const v=document.getElementById(g);v&&(v.style.display="block")}return m==="students"?"students":m==="submissions"?"submissions":m==="missions"?"missions":m==="pending"?"pending":null};if(e.forEach(d=>{d.addEventListener("click",m=>{const f=c(d);setTimeout(()=>{f&&i(f)},40)},{passive:!0})}),t&&t.length){const d=new MutationObserver(m=>{for(const f of m)if(f.type==="attributes"&&f.attributeName==="class"){const y=f.target;if(y.classList&&y.classList.contains("active")){const g=r(y);g&&i(g)}}});t.forEach(m=>d.observe(m,{attributes:!0,attributeFilter:["class"]}))}const u=document.querySelector(".tab-content.active")||Array.from(document.querySelectorAll(".tab-content")).find(d=>d.offsetParent!==null),l=r(u);l&&i(l)}catch(e){console.warn("attachTabLoaders falhou:",e)}}function $t(e){try{if(e==="students"){const t=document.getElementById("students-list");t&&(t.innerHTML='<p class="text-gray-500 py-4">Carregando alunos...</p>')}else if(e==="submissions"){const t=document.getElementById("submissions-list");t&&(t.innerHTML='<p class="text-gray-500 py-4">Carregando submissões...</p>')}else if(e==="missions"){const t=document.getElementById("missions-list");t&&(t.innerHTML='<p class="text-gray-500 py-4">Carregando missões...</p>')}else if(e==="pending"){const t=document.getElementById("pending-users");t&&(t.innerHTML='<p class="text-gray-500 py-4">Carregando pendentes...</p>')}}catch(t){console.warn("showLoadingForTab falhou:",t)}}document.addEventListener("DOMContentLoaded",async()=>{if(Ue()){He(),ze(),window.apiRequest=w,window.Toast=te;try{await ye?.()}catch(e){console.warn("Erro ao setup de turmas:",e)}yt?.();try{await Lt?.()}catch(e){console.warn("Erro na inicialização do módulo de missões:",e),Re?.(),Ae?.(),Me?.()}Bt(),window.loadPendingUsers=V,window.loadApprovedStudents=Se,window.loadMissions=U,window.loadSubmissions=X,window.editMission=De,window.missionAction=It,window.cancelEdit=ie,window.openFileSecurely=xt,window.openFileWithPreview=ke,window.downloadFileSecurely=Be,window.renderTurmas=L,window.showPenaltyRewardModal=Z,window.showStudentHistoryModal=pe,console.log("[MASTER] Inicializando bug report system..."),Ct(),console.log("[MASTER] Inicializando theme toggle..."),Mt(),setTimeout(()=>{const e=document.getElementById("bug-report-btn");console.log("[MASTER] Botão de bug report após timeout:",e),e&&(console.log("[MASTER] Adicionando listener de teste..."),e.addEventListener("click",()=>{console.log("[MASTER] CLICK DETECTADO NO TESTE!")}))},1e3)}});function Ct(){console.log("[BUG REPORT] Inicializando sistema...");const e=document.getElementById("bug-report-btn"),t=document.getElementById("bug-report-modal"),a=document.getElementById("close-bug-modal"),s=document.getElementById("cancel-bug-report"),o=document.getElementById("bug-report-form");if(console.log("[BUG REPORT] Elementos:",{btn:!!e,modal:!!t,close:!!a,cancel:!!s,form:!!o}),!e||!t){console.error("[BUG REPORT] Elementos não encontrados!");return}e.addEventListener("click",()=>{console.log("[BUG REPORT] Botão clicado!"),t.classList.remove("hidden"),document.body.style.overflow="hidden"});function n(){t.classList.add("hidden"),document.body.style.overflow="auto",o&&o.reset()}a&&a.addEventListener("click",n),s&&s.addEventListener("click",n),t.addEventListener("click",r=>{r.target===t&&n()}),o&&o.addEventListener("submit",At)}async function At(e){e.preventDefault();const t=document.getElementById("submit-bug-report"),a=t.innerHTML;try{t.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...',t.disabled=!0;const s=new FormData(e.target),o=localStorage.getItem("username")||"Mestre Desconhecido",n=localStorage.getItem("email")||"email@desconhecido.com",r=s.get("title"),i=s.get("description"),c=s.get("screenshot");let u="";c&&c.size>0&&(console.log("[BUG REPORT] Tamanho original:",(c.size/1024).toFixed(2),"KB"),u=await new Promise((f,y)=>{const g=new FileReader;g.onload=v=>{const E=new Image;E.onload=()=>{const B=document.createElement("canvas"),h=B.getContext("2d");let I=E.width,$=E.height;const A=1200;I>A&&($=$*A/I,I=A),B.width=I,B.height=$,h.drawImage(E,0,0,I,$);const D=B.toDataURL("image/jpeg",.7);console.log("[BUG REPORT] Comprimida para:",(D.length/1024).toFixed(2),"KB"),f(D)},E.onerror=y,E.src=v.target.result},g.onerror=y,g.readAsDataURL(c)}));const l={title:r,description:i,userName:o,userEmail:n,url:window.location.href,screenshot:u||null};console.log("[BUG REPORT] Enviando para o backend...");const d=await fetch(`${R}/api/bug-report`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(l)}),m=await d.json();if(console.log("[BUG REPORT] Resposta:",m),d.ok&&m.success)te.show("✅ Bug reportado com sucesso! 📧 Email enviado","success"),document.getElementById("bug-report-modal").classList.add("hidden"),document.body.style.overflow="auto",e.target.reset();else throw new Error(m.message||"Erro ao enviar bug report")}catch(s){console.error("[BUG REPORT] Erro:",s),te.show("❌ Erro ao enviar bug report. Tente novamente.","error")}finally{t.innerHTML=a,t.disabled=!1}}function Mt(){const e=document.getElementById("theme-toggle"),t=document.getElementById("theme-icon");if(!e||!t){console.warn("[THEME] Elementos não encontrados");return}const a=localStorage.getItem("theme")||"light";ge(a),e.addEventListener("click",()=>{const o=(localStorage.getItem("theme")||"light")==="light"?"dark":"light";ge(o),localStorage.setItem("theme",o)})}function ge(e){const t=document.documentElement,a=document.body,s=document.getElementById("theme-icon");console.log("[THEME] Aplicando tema:",e),e==="dark"?(t.classList.add("dark"),a.classList.add("dark"),t.setAttribute("data-theme","dark"),s&&(s.classList.remove("fa-moon"),s.classList.add("fa-sun")),console.log("[THEME] Dark mode ativado")):(t.classList.remove("dark"),a.classList.remove("dark"),t.setAttribute("data-theme","light"),s&&(s.classList.remove("fa-sun"),s.classList.add("fa-moon")),console.log("[THEME] Light mode ativado"))}
