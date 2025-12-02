import{A as D}from"./config-C8MW31Vj.js";import{b as Te,c as g,d as ee,e as x}from"./mode-DIhV9zwq.js";/* empty css               */import{a as Y}from"./cadastro-CXvqSPSv.js";function $e(){const e=localStorage.getItem("token");if(!e)return!1;try{const t=e.split(".");if(t.length!==3)return!1;const a=JSON.parse(atob(t[1]));return!(a.exp&&new Date>new Date(a.exp*1e3))}catch{return!1}}function ke(){if(new URLSearchParams(window.location.search).get("debug")==="true")return localStorage.setItem("token","debug-token"),localStorage.setItem("isMaster","true"),localStorage.setItem("username","debug-master"),Te("Modo debug ativado - autenticação simulada"),!0;const t=localStorage.getItem("token"),a=localStorage.getItem("isMaster");return!t||a!=="true"||!$e()?(g("Acesso negado. Faça login como Mestre."),setTimeout(()=>{const s=window.location.hostname.includes("github.io")?"/RPG":"";window.location.href=`${s}/`},2e3),!1):!0}async function w(e,t={}){const a=localStorage.getItem("token");if(!a)throw console.error("[API REQUEST] Token não encontrado no localStorage"),new Error("Token não fornecido");const s={...t,headers:{"Content-Type":"application/json",Authorization:`Bearer ${a}`,...t.headers||{}}};console.log("[API REQUEST]",{endpoint:e,method:s.method||"GET",hasToken:!!a,headers:s.headers});const o=await fetch(`${D}${e}`,s);if(!o.ok){const r=await o.json().catch(()=>({error:o.statusText}));throw new Error(r.error||`HTTP ${o.status}`)}return o.json()}const X=new Map;function $(e,t){X.has(e)&&document.removeEventListener("click",X.get(e));const a=s=>{s.target.closest(e)&&t(s)};X.set(e,a),document.addEventListener("click",a)}function Be(){const e=document.getElementById("logout-btn");e&&e.addEventListener("click",()=>{localStorage.removeItem("token"),localStorage.removeItem("isMaster"),localStorage.removeItem("username");const t=window.location.hostname.includes("github.io")?"/RPG":"";window.location.href=`${t}/`})}async function K(e,t){return new Promise(a=>{const s=e==="reward",o=s?"Aplicar Recompensa":"Aplicar Penalidade",r=s?"fas fa-gift":"fas fa-exclamation-triangle",n=s?"bg-gradient-to-br from-green-400 to-emerald-600":"bg-gradient-to-br from-red-400 to-rose-600",l=s?"emerald":"red",c=s?"adicionar":"remover",u=s?"Reconheça o excelente trabalho do aluno com XP extra":"Aplique uma correção educativa removendo XP",i=document.createElement("div");i.className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4",i.style.position="fixed",i.style.top="0",i.style.left="0",i.style.width="100vw",i.style.height="100vh",i.style.zIndex="9999",i.innerHTML=`
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transform transition-all animate-modal-enter">
        <!-- Header com gradiente -->
        <div class="${s?"bg-gradient-to-r from-green-500 to-emerald-600":"bg-gradient-to-r from-red-500 to-rose-600"} px-6 py-4 text-white">
          <div class="flex items-center space-x-3">
            <div class="${n} p-3 rounded-full shadow-lg">
              <i class="${r} text-xl text-white"></i>
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
                  class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-${l}-500 focus:border-${l}-500 transition-all duration-200 text-lg font-semibold" 
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
                class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-${l}-500 focus:border-${l}-500 transition-all duration-200 resize-none" 
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
        `,document.head.appendChild(d),document.body.appendChild(i);const m=i.querySelector("#xp-amount"),f=i.querySelector("#reason-text"),b=i.querySelector("#char-count"),p=i.querySelector("#confirm-btn"),y=i.querySelector("#cancel-btn"),E=document.documentElement.getAttribute("data-theme")==="dark";E&&y&&(y.style.backgroundColor="rgba(55, 65, 81, 0.9)",y.style.borderColor="rgba(156, 163, 175, 0.5)",y.style.color="#f3f4f6",y.addEventListener("mouseenter",()=>{y.style.backgroundColor="rgba(75, 85, 99, 0.9)",y.style.borderColor="rgba(156, 163, 175, 0.7)",y.style.color="#ffffff"}),y.addEventListener("mouseleave",()=>{y.style.backgroundColor="rgba(55, 65, 81, 0.9)",y.style.borderColor="rgba(156, 163, 175, 0.5)",y.style.color="#f3f4f6"})),m.focus();const k=()=>{const h=m.value.trim(),I=f.value.trim(),B=h&&!isNaN(h)&&parseInt(h)>0&&parseInt(h)<=1e3,C=I.length>=3,F=B&&C;h&&!B?(m.className=m.className.replace("border-gray-200","border-red-300"),m.className=m.className.replace(`border-${l}-500`,"border-red-500")):(m.className=m.className.replace("border-red-300","border-gray-200"),m.className=m.className.replace("border-red-500",`border-${l}-500`)),I&&!C?(f.className=f.className.replace("border-gray-200","border-red-300"),f.className=f.className.replace(`border-${l}-500`,"border-red-500")):(f.className=f.className.replace("border-red-300","border-gray-200"),f.className=f.className.replace("border-red-500",`border-${l}-500`)),p.disabled=!F,F?p.className=`flex-1 px-6 py-3 ${s?"bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700":"bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"} text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`:(p.className="flex-1 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed font-medium transition-all duration-200",E&&(p.style.backgroundColor="rgba(75, 85, 99, 0.6)",p.style.color="rgba(156, 163, 175, 0.8)",p.style.border="1px solid rgba(156, 163, 175, 0.3)"))};f.addEventListener("input",()=>{const h=f.value.length;b.textContent=`${h}/200`,h>190?b.className="text-xs font-medium text-red-500":h>=3?b.className=`text-xs font-medium text-${l}-600`:b.className="text-xs font-medium text-gray-500",k()}),m.addEventListener("input",k),i.querySelector("#cancel-btn").addEventListener("click",()=>{i.style.animation="modal-enter 0.2s ease-in reverse",setTimeout(()=>{document.body.removeChild(i),document.head.removeChild(d),a(null)},200)}),i.querySelector("#confirm-btn").addEventListener("click",()=>{const h=m.value.trim(),I=f.value.trim();p.disabled||(i.style.animation="modal-enter 0.2s ease-in reverse",setTimeout(()=>{document.body.removeChild(i),document.head.removeChild(d),a({amount:parseInt(h),reason:I.trim()})},200))}),i.addEventListener("keydown",h=>{h.key==="Escape"&&i.querySelector("#cancel-btn").click()}),i.addEventListener("click",h=>{h.target===i&&i.querySelector("#cancel-btn").click()})})}async function ie(e,t){try{const a=await window.apiRequest(`/usuarios/student-history/${e}`),s=document.createElement("div");s.className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4",s.style.position="fixed",s.style.top="0",s.style.left="0",s.style.width="100vw",s.style.height="100vh",s.style.zIndex="9999";const o=a.history.length>0?a.history.map(n=>{const l=new Date(n.appliedAt).toLocaleString("pt-BR");let c,u,i,d,m,f,b,p;return n.type==="reward"?(c="fas fa-gift",u="bg-gradient-to-r from-green-50 to-emerald-50",i="border-green-200",d="bg-gradient-to-br from-green-400 to-emerald-600",m="bg-green-100 text-green-800",f="Recompensa",b=`+${n.amount} XP`,p=`
            <div class="text-sm text-gray-600 mb-2">
              <i class="fas fa-chart-line mr-1"></i>
              XP: <span class="font-mono">${n.oldXp} → ${n.newXp}</span>
            </div>
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Motivo:</strong> ${n.reason}
            </div>`):n.type==="penalty"?(c="fas fa-exclamation-triangle",u="bg-gradient-to-r from-red-50 to-rose-50",i="border-red-200",d="bg-gradient-to-br from-red-400 to-rose-600",m="bg-red-100 text-red-800",f="Penalidade",b=`-${n.amount} XP`,p=`
            <div class="text-sm text-gray-600 mb-2">
              <i class="fas fa-chart-line mr-1"></i>
              XP: <span class="font-mono">${n.oldXp} → ${n.newXp}</span>
            </div>
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Motivo:</strong> ${n.reason}
            </div>`):n.type==="mission_approved"?(c="fas fa-check-circle",u="bg-gradient-to-r from-blue-50 to-cyan-50",i="border-blue-200",d="bg-gradient-to-br from-blue-400 to-cyan-600",m="bg-blue-100 text-blue-800",f="Missão Aprovada",b=`+${n.xpGained} XP`,p=`
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-tasks mr-1"></i>
              <strong>Missão:</strong> ${n.missionTitle}
            </div>
            ${n.feedback?`<div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Feedback:</strong> ${n.feedback}
            </div>`:""}`):n.type==="mission_rejected"&&(c="fas fa-times-circle",u="bg-gradient-to-r from-orange-50 to-red-50",i="border-orange-200",d="bg-gradient-to-br from-orange-400 to-red-600",m="bg-orange-100 text-orange-800",f="Missão Rejeitada",b="0 XP",p=`
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-tasks mr-1"></i>
              <strong>Missão:</strong> ${n.missionTitle}
            </div>
            ${n.feedback?`<div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Feedback:</strong> ${n.feedback}
            </div>`:""}`),`
            <div class="${u} border-2 ${i} rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
              <div class="flex items-start space-x-4">
                <div class="${d} p-2 rounded-full shadow-lg flex-shrink-0">
                  <i class="${c} text-white"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <span class="font-bold text-gray-800">${f}</span>
                      <span class="${m} px-2 py-1 rounded-full text-sm font-semibold">${b}</span>
                    </div>
                    <div class="text-xs text-gray-500">
                      ${l}
                    </div>
                  </div>
                  ${p}
                  <div class="text-xs text-gray-500">
                    <i class="fas fa-user-tie mr-1"></i>
                    Aplicado por: <span class="font-medium">${n.appliedByName}</span>
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
              </div>`;if(!document.getElementById("modal-animations")){const n=document.createElement("style");n.id="modal-animations",n.textContent=`
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
            `,document.head.appendChild(n)}s.innerHTML=`
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
                <div class="text-2xl font-bold text-green-600">${a.history.filter(n=>n.type==="reward").length}</div>
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
    `,document.body.appendChild(s);const r=()=>document.body.removeChild(s);s.querySelector("#close-btn").addEventListener("click",r),s.querySelector("#close-modal-btn").addEventListener("click",r),s.addEventListener("keydown",n=>{n.key==="Escape"&&r()}),s.addEventListener("click",n=>{n.target===s&&r()})}catch(a){alert(`Erro ao carregar histórico: ${a.message}`)}}function Ae(){Ce(),Le(),Me()}function Ce(){$(".approve-btn",async e=>{const t=e.target.closest("button").getAttribute("data-user-id");await P("approve-user",{userId:parseInt(t)},"Usuário aprovado!");try{typeof loadPendingUsers=="function"&&loadPendingUsers(),typeof loadApprovedStudents=="function"&&loadApprovedStudents()}catch(a){console.error("Erro ao recarregar listas de usuários:",a)}}),$(".reject-btn",async e=>{const t=e.target.closest("button").getAttribute("data-user-id"),a=e.target.closest(".bg-white").querySelector("h3").textContent;ee(`Rejeitar o usuário "${a}"?`,async()=>{await P("reject-user",{userId:parseInt(t)},"Usuário rejeitado!");try{typeof loadPendingUsers=="function"&&loadPendingUsers()}catch(s){console.error("Erro ao recarregar usuários pendentes:",s)}})})}function Le(){$(".penalty-btn",async e=>{const t=e.target.closest("button").getAttribute("data-student-id"),a=e.target.closest(".bg-white").querySelector("h3").textContent,s=await K("penalty",a);if(s){await P("penalty",{studentId:parseInt(t),penalty:s.amount,reason:s.reason},`Penalidade aplicada em ${a}`);try{typeof loadApprovedStudents=="function"&&loadApprovedStudents()}catch(o){console.error("Erro ao recarregar estudantes após penalidade:",o)}}}),$(".reward-btn",async e=>{const t=e.target.closest("button").getAttribute("data-student-id"),a=e.target.closest(".bg-white").querySelector("h3").textContent,s=await K("reward",a);if(s){await P("reward",{studentId:parseInt(t),reward:s.amount,reason:s.reason},`Recompensa dada para ${a}`);try{typeof loadApprovedStudents=="function"&&loadApprovedStudents()}catch(o){console.error("Erro ao recarregar estudantes após recompensa:",o)}}}),$(".history-btn",async e=>{const t=e.target.closest("button").getAttribute("data-student-id"),a=e.target.closest(".bg-white").querySelector("h3").textContent;await ie(parseInt(t),a)}),$(".expel-btn",async e=>{const t=e.target.closest("button").getAttribute("data-student-id"),a=e.target.closest(".bg-white").querySelector("h3").textContent;ee(`⚠️ Expulsar "${a}"?

Esta ação não pode ser desfeita!`,async()=>{await P("expel-student",{studentId:parseInt(t)},"Aluno expulso!");try{typeof loadApprovedStudents=="function"&&loadApprovedStudents()}catch(s){console.error("Erro ao recarregar estudantes após expulsão:",s)}})})}function Me(){$(".edit-mission-btn",async e=>{const t=e.target.closest("button").getAttribute("data-mission-id");typeof editMission=="function"&&await editMission(t)}),$(".delete-mission-btn",async e=>{const t=e.target.closest(".bg-white").querySelector("h3").textContent,a=e.target.closest("button").getAttribute("data-mission-id");ee(`⚠️ Excluir "${t}"?

Esta ação não pode ser desfeita!`,async()=>{typeof missionAction=="function"&&await missionAction(a,"DELETE","Missão excluída!")})})}async function P(e,t,a){try{const o=(await w(`/usuarios/${e}`,{method:"POST",body:JSON.stringify(t)}))?.message||a;x(o)}catch(s){g(`Erro: ${s.message}`)}}let G=[];const U="master_alunos_data";function j(){const e=localStorage.getItem("username");if(!e)return;const t={alunos:v.alunos,turmas:v.turmas,timestamp:Date.now()};localStorage.setItem(`${U}_${e}`,JSON.stringify(t))}function Fe(){const e=localStorage.getItem("username");if(!e)return!1;const t=localStorage.getItem(`${U}_${e}`);if(t)try{const a=JSON.parse(t);return v.alunos=a.alunos||[],v.turmas=a.turmas||[],!0}catch(a){console.error("Erro ao carregar dados:",a)}return!1}const v={turmas:[],alunos:[]};function Pe(){return v.turmas}function Re(e){return v.alunos.filter(t=>t.turma===e)}async function je(){try{const e=await window.apiRequest("/turmas");e&&e.turmas&&(v.turmas=e.turmas,j())}catch(e){throw console.error("Erro ao carregar turmas da API:",e),e}}async function te(){try{const e=await window.apiRequest("/usuarios/approved-students");Array.isArray(e)&&(v.alunos=e.map(t=>({id:t.id,fullname:t.fullname||t.username,turma:t.turma||t.assignedTurma||"Sem turma",username:t.username,class:t.class,curso:t.curso,xp:t.xp||0,level:t.level||1})),j())}catch(e){throw console.error("Erro ao carregar alunos aprovados:",e),e}}async function le(){try{await je()}catch(t){console.warn("Erro ao carregar turmas da API:",t),Fe()}try{await te()}catch(t){console.warn("Erro ao carregar alunos aprovados:",t)}window.originalStudents=[...v.alunos],window.Pendentes={getTurmas:Pe,getUsersForTurma:Re,renderTurmas:()=>T(),addTurma:async t=>{if(t&&!v.turmas.includes(t))try{return await window.apiRequest("/turmas",{method:"POST",body:JSON.stringify({nome:t})}),v.turmas.push(t),j(),T(),window.dispatchEvent(new CustomEvent("turmasUpdated",{detail:{turmas:v.turmas,action:"add",turma:t}})),!0}catch(a){return console.error("Erro ao adicionar turma via API:",a),!1}return!1}},setTimeout(()=>T(),100);const e=document.getElementById("form-criar-turma");e&&(e.onsubmit=async t=>{t.preventDefault();const a=document.getElementById("nome-turma");if(a?.value.trim()){const s=a.value.trim();try{await window.apiRequest("/turmas",{method:"POST",body:JSON.stringify({nome:s})}),v.turmas.push(s),a.value="",j(),T(),x("Turma criada!"),window.dispatchEvent(new CustomEvent("turmasUpdated",{detail:{turmas:v.turmas,action:"add",turma:s}}))}catch(o){console.error("Erro ao criar turma:",o),g("Erro ao criar turma: "+(o.message||o))}}})}function T(){const e=document.getElementById("lista-turmas");if(!e)return;const t={};v.alunos.forEach(s=>{t[s.turma]=(t[s.turma]||0)+1});const a=v.turmas.map(s=>{const o=t[s]||0;return`
      <div class="turma-card bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg" data-turma="${s}">
        <h3 class="font-bold text-lg">${s}</h3>
        <p class="text-gray-600">${o} aluno${o!==1?"s":""}</p>
      </div>
    `}).join("");e.innerHTML=`<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${a}</div>`,setTimeout(()=>{e.querySelectorAll(".turma-card").forEach(s=>{s.onclick=o=>{o.preventDefault();const r=s.dataset.turma;ce(r)}})},10)}function ce(e){const t=document.getElementById("turma-modal"),a=document.getElementById("turma-modal-title"),s=document.getElementById("turma-modal-list");if(!t||!a||!s)return;const o=v.alunos.filter(r=>r.turma===e);a.innerHTML=`<i class="fas fa-users text-purple-600"></i><span class="font-extrabold text-white text-lg">${e}</span>`,o.length===0?s.innerHTML='<div class="p-4 text-gray-500">Nenhum aluno</div>':(s.innerHTML=o.map(r=>`
      <li class="py-3 border-b border-gray-100 flex items-center gap-3">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-base border-2 border-white shadow-md">
            ${r.fullname.charAt(0)}
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-medium text-gray-800">${r.fullname}</div>
            <div class="text-xs text-gray-500">ID: ${r.id} | ${r.class||"Sem classe"}</div>
          </div>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <button class="trocar-btn bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg flex items-center gap-2 transition font-medium" data-user-id="${r.id}" data-turma="${e}">
            <i class="fas fa-exchange-alt"></i>
            <span class="hidden sm:inline">Trocar</span>
          </button>
        </div>
      </li>
    `).join(""),setTimeout(()=>{s.querySelectorAll(".trocar-btn").forEach(r=>{r.onclick=n=>{n.stopPropagation();const l=r.dataset.userId,c=r.dataset.turma;Ne(l,c)}})},10)),t.classList.remove("hidden"),De(t)}function De(e){const t=o=>{o.key==="Escape"&&(e.classList.add("hidden"),document.removeEventListener("keydown",t))};e.onclick=null,document.addEventListener("keydown",t),e.onclick=o=>{(o.target.id==="turma-modal-backdrop"||o.target===e)&&(e.classList.add("hidden"),document.removeEventListener("keydown",t))};const a=e.querySelector("#turma-modal-close"),s=e.querySelector("#turma-modal-close-btn");a&&(a.onclick=o=>{o.preventDefault(),e.classList.add("hidden"),document.removeEventListener("keydown",t)}),s&&(s.onclick=o=>{o.preventDefault(),e.classList.add("hidden"),document.removeEventListener("keydown",t)})}function Ne(e,t){const a=v.turmas.filter(i=>i!==t),s=v.alunos.find(i=>i.id==e);if(!s||a.length===0){g("Não há outras turmas disponíveis");return}const o=`
    <div id="modal-trocar-turma" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl w-96 shadow-2xl">
        <h3 class="font-bold text-lg mb-4">Trocar ${s.fullname} de turma</h3>
        <p class="mb-2">De: <strong>${t}</strong></p>
        <select id="nova-turma-select" class="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500">
          <option value="">Selecione nova turma</option>
          ${a.map(i=>`<option value="${i}">${i}</option>`).join("")}
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
  `,r=document.getElementById("modal-trocar-turma");r&&r.remove(),document.body.insertAdjacentHTML("beforeend",o);const n=document.getElementById("modal-trocar-turma"),l=document.getElementById("nova-turma-select"),c=document.getElementById("confirmar-troca"),u=document.getElementById("cancelar-troca");c.onclick=async()=>{const i=l.value;if(!i){g("Selecione uma turma"),l.focus();return}try{c.disabled=!0,c.textContent="Transferindo...",await window.apiRequest(`/usuarios/${e}/change-turma`,{method:"POST",body:JSON.stringify({novaTurma:i})}),x(`${s.fullname} transferido para ${i}`),n.remove(),document.getElementById("turma-modal").classList.add("hidden"),await te(),T(),setTimeout(()=>ce(i),500)}catch(d){console.error("Erro ao trocar aluno de turma:",d),g("Erro ao trocar aluno de turma: "+(d.message||d)),c.disabled=!1,c.textContent="Confirmar"}},u.onclick=()=>n.remove(),n.onclick=i=>{i.target===n&&n.remove()},setTimeout(()=>l.focus(),100)}async function z(){try{if(!window.apiRequest)throw console.error("❌ [FRONTEND] window.apiRequest não está disponível"),new Error("API request function not available");const e=await window.apiRequest("/usuarios/pending-users");G=Array.isArray(e)?e:[],re(G)}catch(e){console.error("❌ [FRONTEND] Erro ao carregar usuários pendentes:",e),console.error("Stack trace:",e.stack),G=[],re([])}T()}function re(e){const t=document.getElementById("pending-users");if(!t)return;if(!e||e.length===0){t.innerHTML='<div class="text-center py-6 text-gray-500">Nenhum usuário pendente para sua área</div>';return}const a=e.map(s=>`
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
          ${v.turmas.map(o=>`<option value="${o}">${o}</option>`).join("")}
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
  `).join("");t.innerHTML=a,setTimeout(()=>{t.querySelectorAll(".approve-btn").forEach(s=>{s.onclick=async()=>{const o=s.dataset.userId,r=t.querySelector(`select[data-user-id="${o}"]`),n=r?.value;if(!n||n.trim()===""||n==="Selecione uma turma"){g("Por favor, selecione uma turma antes de aprovar o usuário."),r&&(r.style.borderColor="#ef4444",r.focus(),setTimeout(()=>{r.style.borderColor=""},3e3));return}await Oe(o,n)}}),t.querySelectorAll(".reject-btn").forEach(s=>{s.onclick=async()=>{const o=s.dataset.userId;await qe(o)}})},10)}async function Oe(e,t){try{console.log("✅ Aprovando usuário:",e,"para turma:",t),await window.apiRequest(`/usuarios/${e}/approve`,{method:"POST",body:JSON.stringify({turma:t})}),x(`Usuário aprovado com sucesso e atribuído à turma "${t}"!`),await z(),await te(),T()}catch(a){console.error("Erro ao aprovar usuário:",a),g("Erro ao aprovar usuário: "+(a.message||a))}}async function qe(e){if(confirm("Tem certeza que deseja rejeitar este usuário?"))try{console.log("❌ Rejeitando usuário:",e),await window.apiRequest(`/usuarios/${e}/reject`,{method:"POST"}),x("Usuário rejeitado"),await z()}catch(t){console.error("Erro ao rejeitar usuário:",t),g("Erro ao rejeitar usuário: "+(t.message||t))}}setTimeout(()=>{localStorage.getItem("username")==="tecno"&&le()},500);typeof window<"u"&&(window.debugTurmas=()=>{console.log("=== DEBUG TURMAS ==="),console.log("Turmas:",DADOS_FIXOS.turmas),console.log("Alunos:",DADOS_FIXOS.alunos),console.log("localStorage:",localStorage.getItem(`${U}_${localStorage.getItem("username")}`)),T()},window.forcarSalvar=()=>{j(),console.log("💾 Dados salvos manualmente")},window.limparDados=()=>{const e=localStorage.getItem("username");localStorage.removeItem(`${U}_${e}`),console.log("🗑️ Dados limpos - recarregue a página")});let W=[],J={};const Ue={tecno:"tecnologia",gastro:"gastronomia",beleza:"beleza",gestao:"gestao",oftalmo:"oftalmo",idioma:"idiomas"};async function de(){try{const e=document.getElementById("students-list");e&&(e.innerHTML='<p class="text-gray-500 py-4">Carregando alunos...</p>');const t=localStorage.getItem("username"),a=await w("/usuarios/approved-students");Array.isArray(a)||console.warn("[ALUNOS] resposta inesperada de approved-students:",a);const s=(a||[]).filter(r=>r.masterUsername===t);W=s,window.originalStudents=W,_e(s),ze(),await Xe(),window.renderTurmas&&window.renderTurmas(),me("student")?q():ue(s)}catch(e){console.error("[ALUNOS] Erro ao carregar alunos:",e);const t=document.getElementById("students-list");t&&(t.innerHTML=`<p class="text-red-500 py-4">Erro ao carregar alunos: ${e.message||e}</p>`),g("Erro ao carregar alunos: "+(e.message||e))}}function ue(e){const t=document.getElementById("students-list");if(!t){console.error("[ERROR] Container students-list não encontrado!");return}if(!e||e.length===0){t.innerHTML='<p class="text-gray-500 py-4">Nenhum aluno encontrado.</p>';return}t.innerHTML=e.map(a=>He(a)).join("")}function He(e){const t=e.turma||e.assignedTurma||"Turma não definida",a=e.level||1,s=e.xp||0;let o="bg-gray-500",r="fas fa-seedling";a>=10?(o="bg-gradient-to-r from-purple-500 to-pink-500",r="fas fa-crown"):a>=7?(o="bg-gradient-to-r from-yellow-400 to-orange-500",r="fas fa-star"):a>=4?(o="bg-gradient-to-r from-blue-400 to-blue-600",r="fas fa-rocket"):a>=2&&(o="bg-gradient-to-r from-green-400 to-green-600",r="fas fa-leaf");const l={"Arqueiro do JavaScript":"fab fa-js-square","Cafeicultor do Java":"fab fa-java","Mago do CSS":"fab fa-css3-alt","Paladino do HTML":"fab fa-html5","Bárbaro do Back-end":"fas fa-server","Domador de Dados":"fas fa-chart-bar","Elfo do Front-end":"fas fa-paint-brush","Caçador de Bugs":"fas fa-bug"}[e.class]||"fas fa-user";let c="";if(e.levelInfo&&!e.levelInfo.isMaxLevel){const u=e.levelInfo;c=`
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
            <i class="${r} mr-1"></i>
            Nível ${a}
          </div>
        </div>
        <div class="flex items-center">
          <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
            <i class="${l} text-2xl"></i>
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
            <i class="${l} text-lg text-gray-600 mr-2"></i>
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
  `}function me(e){if(e==="student"){const t=document.getElementById("student-year-filter")?.value,a=document.getElementById("student-class-filter")?.value,s=document.getElementById("student-level-filter")?.value;return t!=="all"||a!=="all"||s!=="all"}return!1}function q(){const e=document.getElementById("student-year-filter")?.value||"all",t=document.getElementById("student-class-filter")?.value||"all",a=document.getElementById("student-level-filter")?.value||"all";let s=W||[];e!=="all"&&(s=s.filter(o=>(o.turma||o.assignedTurma)===e)),t!=="all"&&(s=s.filter(o=>o.class===t)),a!=="all"&&(s=s.filter(o=>(o.level||1)>=parseInt(a))),console.log("[FILTROS] Aplicando filtros:",{turmaFilter:e,classFilter:t,levelFilter:a,resultados:s.length}),ue(s)}function _e(e){J={},e.forEach(t=>{const a=t.turma||t.assignedTurma,s=t.class;if(a&&s){for(const[o,r]of Object.entries(Y))if(r.classes[s]){J[a]=o;break}}}),console.log("[FILTROS] Mapa turma-área construído:",J)}function ze(){const e=document.getElementById("student-class-filter");if(!e)return;const t=localStorage.getItem("username");if(!t){console.warn("[FILTROS] Username do mestre não encontrado");return}const a=Ue[t];if(!a||!Y[a]){console.warn("[FILTROS] Área do mestre não encontrada:",t);return}console.log(`[FILTROS] Populando classes para mestre ${t} da área ${a}`),e.innerHTML='<option value="all">Todas as classes</option>',Object.keys(Y[a].classes).forEach(s=>{const o=document.createElement("option");o.value=s,o.textContent=s,e.appendChild(o)})}async function Xe(){try{const e=await w("/turmas");if(e&&e.turmas){const t=document.getElementById("student-year-filter");if(t){const a=t.value;t.innerHTML='<option value="all">Todas as turmas</option>',e.turmas.forEach(s=>{const o=document.createElement("option");o.value=s,o.textContent=s,t.appendChild(o)}),a&&a!=="all"&&(t.value=a)}}}catch(e){console.error("[FILTROS] Erro ao carregar turmas:",e)}}function Ge(){const e=document.getElementById("student-year-filter"),t=document.getElementById("student-class-filter"),a=document.getElementById("student-level-filter"),s=document.getElementById("apply-student-filters");e&&e.addEventListener("change",q),[t,a].forEach(o=>{o&&o.addEventListener("change",q)}),s&&s.addEventListener("click",q)}let H=[],Q=[];function Je(e){if(!e)return null;if(e instanceof Date&&!isNaN(e.getTime()))return e;if(typeof e=="object"&&e.seconds!==void 0)return new Date(e.seconds*1e3);const t=new Date(e);return isNaN(t.getTime())?null:t}function se(e){if(e==="submission"){const t=document.getElementById("filter-submission-status")?.value,a=document.getElementById("filter-submission-turma")?.value,s=document.getElementById("filter-submission-class")?.value,o=document.getElementById("filter-submission-student")?.value,r=document.getElementById("filter-submission-mission")?.value;return t!=="all"||a!=="all"||s!=="all"||o&&o.trim()!==""||r&&r.trim()!==""}if(e==="mission"){const t=document.getElementById("filter-mission-turma")?.value,a=document.getElementById("filter-mission-class")?.value,s=document.getElementById("filter-mission-xp")?.value;return t!=="all"||a!=="all"||s&&s!==""}return!1}function fe(e,t="arquivo"){try{if(console.log("🔗 Abrindo arquivo:",{fileUrl:e,fileName:t}),!e||e==="[object Object]"){console.error("❌ URL inválida ou objeto:",e),g("URL do arquivo é inválida");return}if(e.includes("firebasestorage.googleapis.com")){const u=localStorage.getItem("token"),i=`${D}/files/proxy?url=${encodeURIComponent(e)}&token=${u}`;console.log("📡 Usando proxy para arquivo Firebase:",i);try{x("Carregando arquivo...");const d=document.createElement("a");d.href=i,d.target="_blank",d.rel="noopener noreferrer",document.body.appendChild(d),d.click(),document.body.removeChild(d);return}catch(d){console.error("❌ Erro ao buscar arquivo via proxy:",d)}e=i}const a=t.split(".").pop()?.toLowerCase()||"";console.log("📄 Extensão detectada:",a);const s=["png","jpg","jpeg","gif","svg","webp","bmp","ico"],o=["js","jsx","ts","tsx","html","css","json","xml","md","txt","py","java","c","cpp","h"],r=["pdf"],n=["mp4","webm","ogg"],l=["mp3","wav","ogg"];if(s.includes(a)||r.includes(a)||n.includes(a)||l.includes(a)){console.log("✅ Tipo renderizável pelo navegador, abrindo diretamente");const u=document.createElement("a");u.href=e,u.target="_blank",u.rel="noopener noreferrer",document.body.appendChild(u),u.click(),document.body.removeChild(u);return}if(o.includes(a)){console.log("📝 Arquivo de código, criando preview"),Ve(e,t,a);return}console.log("⚠️ Tipo desconhecido, tentando abrir no navegador");const c=document.createElement("a");c.href=e,c.target="_blank",c.rel="noopener noreferrer",document.body.appendChild(c),c.click(),document.body.removeChild(c),x("Abrindo arquivo no navegador...")}catch(a){console.error("❌ Erro ao abrir arquivo:",a),g("Erro ao abrir arquivo: "+(a.message||a))}}function Ve(e,t,a){try{if(console.log("📥 Criando preview para arquivo:",t),e.includes("firebasestorage.googleapis.com")){const o=localStorage.getItem("token"),r=`${D}/files/proxy?url=${encodeURIComponent(e)}&token=${o}`;console.log("📡 Usando proxy para arquivo Firebase no preview:",r),e=r}const s=document.createElement("a");s.href=e,s.target="_blank",s.rel="noopener noreferrer",document.body.appendChild(s),s.click(),document.body.removeChild(s),console.log("✅ Link de visualização aberto:",e),x("Abrindo arquivo para visualização...")}catch(s){console.error("❌ Erro ao criar preview:",s),g("Não foi possível carregar o preview. Baixando arquivo..."),Ye(e,t)}}function L(e){return e?e.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r"):""}async function pe(e,t){try{if(console.log("⬇️ Download iniciado:",{fileUrl:e,fileName:t}),e.includes("firebasestorage.googleapis.com")){const s=localStorage.getItem("token");x("Preparando download...");const o=await fetch(`${D}/files/proxy?url=${encodeURIComponent(e)}&token=${s}`);if(!o.ok)throw new Error(`Erro ao baixar arquivo: ${o.status} ${o.statusText}`);const r=await o.blob(),n=URL.createObjectURL(r),l=document.createElement("a");l.href=n,l.download=t,l.target="_self",document.body.appendChild(l),l.click(),document.body.removeChild(l),setTimeout(()=>URL.revokeObjectURL(n),5e3),x("Download iniciado!"),console.log("✅ Download via proxy iniciado:",t);return}const a=document.createElement("a");a.href=e,a.download=t,a.target="_blank",document.body.appendChild(a),a.click(),document.body.removeChild(a)}catch(a){console.error("❌ Erro ao iniciar download:",a),g("Erro ao baixar arquivo: "+(a.message||a))}}function Ye(e,t){pe(e,t)}function Ke(e){const t=e.split("/").pop()?.split("?")[0]||"arquivo";fe(e,t)}async function _(){try{const e=document.getElementById("submissions-list");e&&(e.innerHTML='<p class="text-gray-500 py-4">Carregando submissões...</p>'),Q=await w("/submissoes")||[],await he(),window.originalStudents&&xe(window.originalStudents),se("submission")?R():ge(Q)}catch(e){console.error("Erro ao carregar submissões:",e);const t=document.getElementById("submissions-list");t&&(t.innerHTML=`<p class="text-red-500 py-4">Erro: ${e.message||e}</p>`),g(e.message||e)}}async function N(){try{const e=document.getElementById("missions-list");e&&(e.innerHTML='<p class="text-gray-500 py-4">Carregando missões...</p>'),H=await w("/missoes")||[],await he(),window.originalStudents&&xe(window.originalStudents),se("mission")?M():be(H)}catch(e){console.error("Erro ao carregar missões:",e);const t=document.getElementById("missions-list");t&&(t.innerHTML=`<p class="text-red-500 py-4">Erro: ${e.message||e}</p>`),g(e.message||e)}}function ge(e){const t=document.getElementById("submissions-list");if(!t)return;if(!e||e.length===0){t.innerHTML='<p class="text-gray-500 py-4">Nenhuma submissão encontrada.</p>';return}const a=e.sort((s,o)=>{const r=new Date(s.submittedAt||0);return new Date(o.submittedAt||0)-r});t.innerHTML=a.map(s=>We(s)).join(""),t.querySelectorAll(".approve-submission-btn").forEach(s=>{s.onclick=async()=>{const o=s.dataset.submissionId;console.log("[MISSOES] Aprovando submissão:",o);try{const r=await w(`/submissoes/${o}/approve`,{method:"POST",body:JSON.stringify({feedback:""})});console.log("[MISSOES] Resposta da aprovação:",r),x("Submissão aprovada com sucesso!"),await _()}catch(r){console.error("[MISSOES] Erro ao aprovar submissão:",r),g("Erro ao aprovar submissão: "+(r.message||r))}}}),t.querySelectorAll(".reject-submission-btn").forEach(s=>{s.onclick=async()=>{const o=s.dataset.submissionId;console.log("[MISSOES] Rejeitando submissão:",o);try{const r=await w(`/submissoes/${o}/reject`,{method:"POST",body:JSON.stringify({feedback:""})});console.log("[MISSOES] Resposta da rejeição:",r),x("Submissão rejeitada com sucesso!"),await _()}catch(r){console.error("[MISSOES] Erro ao rejeitar submissão:",r),g("Erro ao rejeitar submissão: "+(r.message||r))}}})}function We(e){console.log("📅 Debug submissão:",{id:e.id,submittedAt:e.submittedAt,typeOf:typeof e.submittedAt});const t={pending:"bg-yellow-100 text-yellow-800 border-yellow-300",approved:"bg-green-100 text-green-800 border-green-300",rejected:"bg-red-100 text-red-800 border-red-300"},a={pending:"fa-clock",approved:"fa-check-circle",rejected:"fa-times-circle"},s={pending:"Pendente",approved:"Aprovado",rejected:"Rejeitado"},o=n=>{if(!n)return"Data não informada";try{const l=Je(n);return l?l.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):(console.error("❌ Data inválida recebida:",n),"Data inválida")}catch(l){return console.error("Erro ao formatar data:",dateStr,l),"Data inválida"}};console.log("📎 Arquivos da submissão:",{id:e.id,hasFilePaths:!!e.filePaths,filePathsLength:e.filePaths?.length,filePathsType:Array.isArray(e.filePaths)?"array":typeof e.filePaths,hasFileUrls:!!e.fileUrls,fileUrlsLength:e.fileUrls?.length,fileUrlsType:Array.isArray(e.fileUrls)?"array":typeof e.fileUrls,hasFileUrl:!!e.fileUrl,fileUrlType:typeof e.fileUrl,filePaths:e.filePaths,fileUrls:e.fileUrls,fileUrl:e.fileUrl,fileUrlsElementTypes:Array.isArray(e.fileUrls)?e.fileUrls.map(n=>typeof n):null});let r="";if(e.fileUrls&&e.fileUrls.length>0)r=`
      <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <i class="fas fa-paperclip mr-2"></i>
          Arquivos enviados (${e.fileUrls.length})
        </h4>
        <div class="space-y-2">
          ${e.fileUrls.map((n,l)=>{let c=n,u=`arquivo${l+1}`;if(!n)return console.warn("⚠️ fileUrl ausente no índice",l),"";if(typeof n=="object"&&n.url)console.log("📦 fileUrl é objeto, extraindo URL:",n),c=n.url,u=n.name||u;else if(typeof n=="string")c=n,u=n.split("/").pop()?.split("?")[0]||u;else return console.error("❌ fileUrl com tipo inválido:",typeof n,n),"";const i=decodeURIComponent(u),d=L(c),m=L(i);return`
              <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                  <i class="fas fa-file-code text-blue-600 mr-2"></i>${i}
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
    `;else if(e.filePaths&&e.filePaths.length>0)r=`
      <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <i class="fas fa-paperclip mr-2"></i>
          Arquivos enviados (${e.filePaths.length})
        </h4>
        <div class="space-y-2">
          ${e.filePaths.map((n,l)=>{const c=n.split("/").pop()||n.split("\\").pop()||`arquivo${l+1}`,u=e.fileUrls?.[l]||n,i=L(u),d=L(c);return`
              <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                  <i class="fas fa-file-code text-blue-600 mr-2"></i>${c}
                </span>
                <div class="flex gap-2 ml-2">
                  <button onclick="window.downloadFileSecurely('${i}', '${d}')"
                     class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
                    <i class="fas fa-download mr-1"></i>Baixar
                  </button>
                  <button onclick="window.openFileWithPreview('${i}', '${d}')" 
                          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
                    <i class="fas fa-eye mr-1"></i>Ver
                  </button>
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    `;else if(e.fileUrl&&typeof e.fileUrl=="string"){const n=e.fileUrl.split("/").pop()?.split("?")[0]||"arquivo",l=decodeURIComponent(n),c=L(e.fileUrl),u=L(l);r=`
      <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <i class="fas fa-paperclip mr-2"></i>
          Arquivo enviado
        </h4>
        <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
          <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
            <i class="fas fa-file-code text-blue-600 mr-2"></i>${l}
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
    `}else r=`
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
      ${r}

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
  `}function be(e){const t=document.getElementById("missions-list");if(!t)return;if(!e||e.length===0){t.innerHTML='<p class="text-gray-500 py-4">Nenhuma missão encontrada.</p>';return}const a=r=>{try{if(!r)return null;if(typeof r?.toDate=="function")return r.toDate();if(typeof r?.seconds=="number")return new Date(r.seconds*1e3);if(typeof r=="number")return new Date(r>1e12?r:r*1e3);const n=new Date(r);return isNaN(n.getTime())?null:n}catch{return null}},s=r=>a(r&&(r.createdAt??r.created_at??r.created??r.createdOn??r.created_time??r.createdTimestamp)||null),o=[...e].sort((r,n)=>{const l=(s(r)||new Date(0)).getTime();return(s(n)||new Date(0)).getTime()-l});t.innerHTML=o.map(r=>Qe(r)).join(""),t.querySelectorAll(".edit-mission-btn").forEach(r=>{r.onclick=()=>{const n=r.dataset.missionId;try{Ee(n)}catch(l){console.warn("editMission não disponível:",l)}}}),t.querySelectorAll(".delete-mission-btn").forEach(r=>{r.onclick=async()=>{const n=r.dataset.missionId;if(confirm("Deletar missão?"))try{await w(`/missoes/${n}`,{method:"DELETE"}),x("Missão deletada com sucesso!"),await N()}catch(l){console.error("Erro ao deletar missão:",l),g("Erro ao deletar missão: "+(l.message||l))}}})}function Qe(e){const t={facil:"bg-green-100 text-green-800",medio:"bg-yellow-100 text-yellow-800",dificil:"bg-red-100 text-red-800"},a={facil:"Fácil",medio:"Médio",dificil:"Difícil"};let s="facil";e.xp>=100?s="dificil":e.xp>=50&&(s="medio");const o=i=>!i||i==="geral"?"Geral":i,r=i=>!i||i===""||i===null||i===void 0?"Todas as turmas":i,n=i=>{try{if(!i)return null;if(typeof i?.toDate=="function")return i.toDate();if(typeof i?.seconds=="number")return new Date(i.seconds*1e3);if(typeof i=="number")return new Date(i>1e12?i:i*1e3);const d=new Date(i);return isNaN(d.getTime())?null:d}catch{return null}},c=(i=>n(i&&(i.createdAt??i.created_at??i.created??i.createdOn??i.created_time??i.createdTimestamp)||null))(e),u=c?c.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"Data não disponível";return`
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
          ${r(e.turma)}
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
  `}async function Ze(e,t,a){try{t==="DELETE"?(await w(`/missoes/${e}`,{method:"DELETE"}),x(a),N()):g("Ação não reconhecida")}catch(s){console.error("Erro na ação da missão:",s),g(`Erro: ${s.message}`)}}function R(){const e=document.getElementById("filter-submission-status")?.value||"all",t=document.getElementById("filter-submission-mission")?.value?.trim()||"",a=document.getElementById("filter-submission-turma")?.value||"all",s=document.getElementById("filter-submission-class")?.value||"all",o=document.getElementById("filter-submission-student")?.value?.trim().toLowerCase()||"";let r=Q||[];e!=="all"&&(r=r.filter(n=>n.status===e)),t&&(r=r.filter(n=>(n.missionTitle||"").toLowerCase().includes(t.toLowerCase()))),a!=="all"&&(r=r.filter(n=>(n.userTurma||n.studentTurma)===a)),s!=="all"&&(r=r.filter(n=>(n.userClass||n.studentClass)===s)),o&&(r=r.filter(n=>(n.username||n.studentUsername||n.studentName||"").toLowerCase().includes(o))),ge(r)}function M(){const e=document.getElementById("filter-mission-turma")?.value||"all",t=document.getElementById("filter-mission-class")?.value||"all",a=document.getElementById("filter-mission-xp")?.value||"";let s=H||[];e!=="all"&&(s=s.filter(o=>String(o.turmaId||o.turma||o.turmaName||o.classroom||"")==String(e))),t!=="all"&&(s=s.filter(o=>String(o.targetClass||"geral")==t)),a&&(a==="0-49"?s=s.filter(o=>(o.xp||0)>=0&&(o.xp||0)<50):a==="50-99"?s=s.filter(o=>(o.xp||0)>=50&&(o.xp||0)<100):a==="100+"&&(s=s.filter(o=>(o.xp||0)>=100))),be(s)}function ye(){const e=document.getElementById("filter-mission-turma"),t=document.getElementById("filter-mission-class"),a=document.getElementById("filter-mission-xp"),s=document.getElementById("apply-mission-filters");e&&e.addEventListener("change",M),t&&t.addEventListener("change",M),a&&a.addEventListener("change",M),s&&s.addEventListener("click",M)}function ve(){const e=document.getElementById("filter-submission-status"),t=document.getElementById("filter-submission-mission"),a=document.getElementById("filter-submission-turma"),s=document.getElementById("filter-submission-class"),o=document.getElementById("filter-submission-student"),r=document.getElementById("apply-submission-filters");[e,t,a,s].forEach(n=>{n&&n.addEventListener("change",R)}),o&&o.addEventListener("keypress",n=>{n.key==="Enter"&&R()}),r&&r.addEventListener("click",R)}async function he(){try{const e=await w("/turmas");if(e&&e.turmas){const t=document.getElementById("filter-submission-turma");if(t){const s=t.value;t.innerHTML='<option value="all">Todas as turmas</option>',e.turmas.forEach(o=>{const r=document.createElement("option");r.value=o,r.textContent=o,t.appendChild(r)}),s&&s!=="all"&&(t.value=s)}const a=document.getElementById("filter-mission-turma");if(a){const s=a.value;a.innerHTML='<option value="all">Todas as turmas</option>',e.turmas.forEach(o=>{const r=document.createElement("option");r.value=o,r.textContent=o,a.appendChild(r)}),s&&s!=="all"&&(a.value=s)}console.log("[FILTROS] Turmas carregadas nos selects:",e.turmas.length)}}catch(e){console.error("[FILTROS] Erro ao carregar turmas:",e)}}function xe(e){try{const t=[...new Set(e.map(o=>o.class).filter(Boolean))],a=document.getElementById("filter-submission-class");if(a){const o=a.value;a.innerHTML='<option value="all">Todas as classes</option>',t.forEach(r=>{const n=document.createElement("option");n.value=r,n.textContent=r,a.appendChild(n)}),o&&o!=="all"&&(a.value=o)}const s=document.getElementById("filter-mission-class");if(s){const o=s.value;s.innerHTML='<option value="all">Todas as classes</option>',t.forEach(r=>{const n=document.createElement("option");n.value=r,n.textContent=r,s.appendChild(n)}),o&&o!=="all"&&(s.value=o)}console.log("[FILTROS] Classes carregadas nos selects:",t.length)}catch(t){console.error("[FILTROS] Erro ao popular classes:",t)}}function we(){const e=document.getElementById("create-mission-btn");e&&e.addEventListener("click",async t=>{t.preventDefault(),await et()})}function Ee(e){try{const t=H.find(i=>i.id==e);if(!t){g("Missão não encontrada");return}const a=document.getElementById("mission-title"),s=document.getElementById("mission-description"),o=document.getElementById("mission-xp"),r=document.getElementById("mission-turma"),n=document.getElementById("mission-class");a&&(a.value=t.titulo||t.title||""),s&&(s.value=t.descricao||t.description||""),o&&(o.value=t.xp||""),r&&(r.value=t.turma||""),n&&(n.value=t.targetClass||"geral");const l=document.getElementById("create-mission-btn"),c=document.getElementById("cancel-edit-btn");l&&(l.innerHTML='<i class="fas fa-save mr-2"></i>Salvar Alterações',l.className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition font-medium",l.dataset.editingId=e),c&&(c.style.display="block");const u=document.querySelector("#missions-content .bg-white.p-6");u&&u.scrollIntoView({behavior:"smooth",block:"start"}),x("Missão carregada para edição")}catch(t){console.error("Erro ao editar missão:",t),g("Erro ao carregar missão para edição")}}async function et(){try{const e=document.getElementById("mission-title"),t=document.getElementById("mission-description"),a=document.getElementById("mission-xp"),s=document.getElementById("mission-turma"),o=document.getElementById("mission-class");if(!e||!t||!a||!s||!o){g("Formulário de missão não encontrado. Recarregue a página."),console.error("Elementos do formulário não encontrados");return}const r=e.value.trim(),n=t.value.trim(),l=parseInt(a.value),c=s.value||null,u=o.value,i=document.getElementById("create-mission-btn"),d=i&&i.dataset.editingId,m=d?parseInt(i.dataset.editingId):null;if(!r){g("Título da missão é obrigatório");return}if(!n){g("Descrição da missão é obrigatória");return}if(!l||l<=0){g("XP da missão deve ser um número positivo");return}const f={titulo:r,descricao:n,xp:l,turma:c||null,targetClass:u||"geral"};let b,p;d?(b=await w(`/missoes/${m}`,{method:"PUT",body:JSON.stringify(f)}),p="Missão atualizada com sucesso!"):(f.status="ativa",b=await w("/missoes",{method:"POST",body:JSON.stringify(f)}),p="Missão criada com sucesso!"),x(p),ae(),N()}catch(e){console.error("Erro ao processar missão:",e);const t=document.getElementById("create-mission-btn")?.dataset.editingId?"atualizar":"criar";g(`Erro ao ${t} missão: ${e.message}`)}}function ae(){try{const e=document.getElementById("mission-title"),t=document.getElementById("mission-description"),a=document.getElementById("mission-xp"),s=document.getElementById("mission-turma"),o=document.getElementById("mission-class");e&&(e.value=""),t&&(t.value=""),a&&(a.value=""),s&&(s.value=""),o&&(o.value="geral");const r=document.getElementById("create-mission-btn"),n=document.getElementById("cancel-edit-btn");r&&(r.innerHTML='<i class="fas fa-plus mr-2"></i>Criar Missão',r.className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition font-medium",delete r.dataset.editingId),n&&(n.style.display="none"),x("Edição cancelada")}catch(e){console.error("Erro ao cancelar edição:",e),g("Erro ao cancelar edição")}}const S={beleza:{name:"👒 Beleza",classes:{"Estilista das Sombras":{},"Feiticeira das Unhas":{},"Encantador de Cores":{},"Artista das Luzes":{},"Cortes Fantasma":{},"Guardiã das Flores":{},"Alquimista do Perfume":{},"Mestre do Reflexo":{}}},gastronomia:{name:"👨‍🍳 Gastronomia",classes:{"Cozinheiro Arcano":{},"Alquimista dos Sabores":{},"Guardiã do Forno":{},"Mestre das Caldeiradas":{},"Confeiteiro Místico":{},"Senhor dos Temperos":{},"Sommelier Sagrado":{},"Druida da Nutrição":{}}},gestao:{name:"👩‍🎓 Gestão",classes:{"Senhor dos Números":{},"Administrador da Ordem":{},"Analista Visionário":{},"Estrategista de Elite":{},"Protetor do Equilíbrio":{},"Mediador das Alianças":{},"Juiz da Justiça":{},"Cronista do Progresso":{}}},oftalmo:{name:"👁️ Oftalmologia",classes:{"Vidente da Visão":{},"Guardiã do Olhar":{},"Caçador de Detalhes":{},"Mestre da Clareza":{},"Sentinela Invisível":{},"Oráculo das Lentes":{},"Defensor da Retina":{},"Ilusionista da Percepção":{}}},tecnologia:{name:"🖥️ Tecnologia",classes:{"Arqueiro do JavaScript":{},"Cafeicultor do Java":{},"Mago do CSS":{},"Paladino do HTML":{},"Bárbaro do Back-end":{},"Domador de Dados":{},"Elfo do Front-end":{},"Caçador de Bugs":{}}},idiomas:{name:"🌐 Idiomas",classes:{"Orador das Runas":{},"Tradutor das Sombras":{},"Bardo Poliglota":{},"Sábio dos Dialetos":{},"Emissário Universal":{},"Guardião da Palavra":{},"Feiticeiro da Pronúncia":{},"Lexicógrafo Arcano":{}}}};function O(e){if(!e)return null;const t=String(e).toLowerCase();return t.includes("tec")||t.includes("tech")||t.includes("inform")||t.includes("ti")?"tecnologia":t.includes("beleza")?"beleza":t.includes("gastr")||t.includes("cozinh")?"gastronomia":t.includes("gest")||t.includes("admin")||t.includes("management")?"gestao":t.includes("oftal")||t.includes("olho")?"oftalmo":t.includes("idiom")||t.includes("lingu")||t.includes("idiomas")?"idiomas":null}const V={"Guardião da Lógica":"tecnologia","Mestre Fullstack":"tecnologia","Grand Maître Cuisinier":"gastronomia","Chanceler Supremo":"gestao","Oráculo da Visão":"oftalmo","Artista Supremo da Forma":"beleza","Orador Supremo":"idiomas"};async function A(){try{const e=document.body?.dataset?.masterArea;if(e){const s=O(e);if(s)return s}const t=document.getElementById("master-area")||document.querySelector("[data-master-area]")||document.querySelector(".master-area");if(t){const s=t.dataset?.masterArea||t.textContent,o=O(s);if(o)return o}const a=document.querySelector('meta[name="master-area"]');if(a&&a.content){const s=O(a.content);if(s)return s}if(!A._cache)try{const s=["/usuarios/me","/perfil"];for(const o of s)try{const r=await w(o);if(!r)continue;const n=r.area||r.areaKey||r.areaSlug||r.allowedArea||r.classArea||r.area_name||r.roleArea||r.areaName,l=O(n);if(l)return A._cache=l,l;const c=r.class||r.classe||r.className;if(c&&V[c])return A._cache=V[c],V[c]}catch{}A._cache=null}catch{}return A._cache||null}catch(e){return console.warn("detectMasterArea erro:",e),null}}async function Ie(){try{const e=await A(),t=document.getElementById("mission-class"),a=document.getElementById("filter-mission-class"),s=(o,r)=>{const n=document.createElement("option");return n.value=o,n.textContent=r,n};if(t)if(t.innerHTML="",t.appendChild(s("geral","Geral (todas as classes)")),e&&S[e]){const o=document.createElement("optgroup");o.label=S[e].name||e,Object.keys(S[e].classes).forEach(r=>o.appendChild(s(r,r))),t.appendChild(o)}else Object.entries(S).forEach(([o,r])=>{const n=document.createElement("optgroup");n.label=r.name||o,Object.keys(r.classes).forEach(l=>n.appendChild(s(l,l))),t.appendChild(n)});a&&(a.innerHTML="",a.appendChild(s("all","Todas as classes")),e&&S[e]?Object.keys(S[e].classes).forEach(o=>a.appendChild(s(o,o))):Object.values(S).forEach(o=>{Object.keys(o.classes).forEach(r=>a.appendChild(s(r,r)))}))}catch(e){console.warn("populateMissionClassSelect erro:",e)}}async function oe(e=0){try{const s=document.getElementById("lista-turmas"),o=document.getElementById("filter-mission-turma"),r=document.getElementById("mission-turma"),n=[];if(s&&s.children.length&&(s.querySelector(".grid")||s).querySelectorAll(".turma-card, [data-turma]").forEach(u=>{const i=u.dataset?.turma||u.querySelector?.("h3")?.textContent?.trim()||u.textContent?.trim();i&&n.push({id:i,name:i})}),n.length===0&&window.Pendentes?.getTurmas)try{const l=window.Pendentes.getTurmas();Array.isArray(l)&&l.forEach(c=>{n.push({id:c,name:c})})}catch(l){console.warn("Erro ao obter turmas do módulo pendentes:",l)}if(n.length===0&&e<6)return await new Promise(l=>setTimeout(l,300)),oe(e+1);if(n.length===0)try{const l=await w("/turmas/me").catch(()=>w("/turmas"));Array.isArray(l)&&l.forEach(c=>{const u=c.id??c._id??c.turmaId??c.nome??c.name,i=c.nome||c.name||String(u);u&&n.push({id:String(u),name:i})})}catch(l){console.warn("Fallback API para turmas falhou:",l)}if(o&&(o.innerHTML='<option value="all">Todas as turmas</option>'+n.map(l=>`<option value="${l.id}">${l.name}</option>`).join("")),r){const l=r.querySelector('option[value=""]')?.textContent||"Turma (opcional - para atribuir a uma turma específica)";r.innerHTML=`<option value="">${l}</option>`+n.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}return window.dispatchEvent(new CustomEvent("turmasUpdated",{detail:{turmas:n}})),n}catch(t){return console.warn("populateTurmasFromPending erro:",t),[]}}function tt(){try{const e=document.getElementById("lista-turmas");if(!e||!window.MutationObserver)return;new MutationObserver(a=>{let s=!1;for(const o of a)if(o.type==="childList"||o.type==="attributes"){s=!0;break}s&&(oe().catch(o=>console.warn("Erro ao repopular turmas via observer:",o)),Ie().catch(o=>console.warn("Erro ao repopular classes via observer:",o)),Se().catch(o=>console.warn("Erro ao repopular filtros de submissões via observer:",o)))}).observe(e,{childList:!0,subtree:!0,attributes:!0})}catch(e){console.warn("installTurmasObserver erro:",e)}}async function st(){try{ye(),ve(),we(),await at(),tt();const e=document.getElementById("apply-mission-filters");e&&e.addEventListener("click",M);const t=document.getElementById("apply-submission-filters");t&&t.addEventListener("click",R);const a=document.getElementById("cancel-edit-btn");a&&a.addEventListener("click",ae)}catch(e){console.error("[MISSOES] Erro na inicialização:",e)}}async function Se(){try{const e=document.getElementById("filter-submission-turma"),t=document.getElementById("filter-submission-class");if(e){const a=document.getElementById("lista-turmas"),s=[];if(a&&a.children.length&&(a.querySelector(".grid")||a).querySelectorAll(".turma-card, [data-turma]").forEach(n=>{const l=n.dataset?.turma||n.querySelector?.("h3")?.textContent?.trim()||n.textContent?.trim();l&&s.push(l)}),s.length===0&&window.Pendentes?.getTurmas)try{const o=window.Pendentes.getTurmas();Array.isArray(o)&&s.push(...o)}catch(o){console.warn("Erro ao obter turmas do módulo pendentes:",o)}e.innerHTML='<option value="all">Todas as turmas</option>'+[...new Set(s)].sort().map(o=>`<option value="${o}">${o}</option>`).join("")}if(t){const a=await A(),s=[];a&&S[a]?s.push(...Object.keys(S[a].classes)):Object.values(S).forEach(o=>{s.push(...Object.keys(o.classes))}),t.innerHTML='<option value="all">Todas as classes</option>'+[...new Set(s)].sort().map(o=>`<option value="${o}">${o}</option>`).join("")}}catch(e){console.warn("Erro ao popular filtros de submissões:",e)}}async function at(){try{await new Promise(e=>setTimeout(e,100)),await Ie(),await oe(),await Se()}catch(e){console.warn("[MISSOES] Erro ao configurar dados iniciais:",e)}}const Z={container:null,init(){this.container||(this.container=document.createElement("div"),this.container.id="toast-container",this.container.className="fixed top-4 right-4 z-50 space-y-2",document.body.appendChild(this.container))},show(e,t="info"){this.init();const a={error:{class:"bg-red-500",icon:"exclamation-triangle"},success:{class:"bg-green-500",icon:"check-circle"},warning:{class:"bg-yellow-500",icon:"exclamation-circle"},info:{class:"bg-blue-500",icon:"info-circle"}},s=a[t]||a.info,o=document.createElement("div");o.className=`${s.class} text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`,o.innerHTML=`
            <div class="flex items-center">
                <i class="fas fa-${s.icon} mr-2"></i>
                <span>${e}</span>
            </div>
        `,this.container.appendChild(o),requestAnimationFrame(()=>{o.classList.remove("translate-x-full","opacity-0")}),setTimeout(()=>{o.classList.add("translate-x-full","opacity-0"),setTimeout(()=>{o.parentNode&&o.parentNode.removeChild(o)},300)},3e3)}};window.checkActiveFilters=function(e){return e==="student"?me?.(e)||!1:(e==="submission"||e==="mission")&&se?.(e)||!1};(function(){const e=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",e)})();function ot(){try{const e=document.querySelectorAll(".tab-button"),t=document.querySelectorAll(".tab-content"),a={students:"students-filters",submissions:"submissions-filters",missions:"missions-filters"},s={students:!1,submissions:!1,missions:!1,pending:!1},o={students:0,submissions:0,missions:0,pending:0},r=500,n=d=>{if(!d)return null;const m=(d.id||"").toLowerCase();return m.includes("student")?"students":m.includes("submission")?"submissions":m.includes("mission")?"missions":m.includes("pending")?"pending":null},l=async d=>{if(!d)return;const m=Date.now();if(!s[d]&&!(m-(o[d]||0)<r)){s[d]=!0,o[d]=m;try{rt(d),d==="students"?await de?.():d==="submissions"?await _?.():d==="missions"?await N?.():d==="pending"&&await z?.()}catch(f){console.error("[MASTER] erro ao carregar aba",d,f);const b={students:"students-list",submissions:"submissions-list",missions:"missions-list",pending:"pending-users"},p=document.getElementById(b[d]);p&&(p.innerHTML=`<p class="text-red-500 py-4">Erro ao carregar: ${f?.message||f}</p>`)}finally{s[d]=!1,o[d]=Date.now()}}},c=d=>{if(!d)return null;e.forEach(y=>{y.classList.remove("active","border-purple-500","text-purple-600"),y.classList.add("text-gray-500")}),t.forEach(y=>y.classList.remove("active","has-active-filters")),d.classList.add("active","border-purple-500","text-purple-600"),d.classList.remove("text-gray-500");const m=d.id.replace(/^tab-/,""),f=`${m}-content`,b=document.getElementById(f);b&&b.classList.add("active"),Object.values(a).forEach(y=>{const E=document.getElementById(y);E&&(E.style.display="none")});const p=a[m];if(p){const y=document.getElementById(p);y&&(y.style.display="block")}return m==="students"?"students":m==="submissions"?"submissions":m==="missions"?"missions":m==="pending"?"pending":null};if(e.forEach(d=>{d.addEventListener("click",m=>{const f=c(d);setTimeout(()=>{f&&l(f)},40)},{passive:!0})}),t&&t.length){const d=new MutationObserver(m=>{for(const f of m)if(f.type==="attributes"&&f.attributeName==="class"){const b=f.target;if(b.classList&&b.classList.contains("active")){const p=n(b);p&&l(p)}}});t.forEach(m=>d.observe(m,{attributes:!0,attributeFilter:["class"]}))}const u=document.querySelector(".tab-content.active")||Array.from(document.querySelectorAll(".tab-content")).find(d=>d.offsetParent!==null),i=n(u);i&&l(i)}catch(e){console.warn("attachTabLoaders falhou:",e)}}function rt(e){try{if(e==="students"){const t=document.getElementById("students-list");t&&(t.innerHTML='<p class="text-gray-500 py-4">Carregando alunos...</p>')}else if(e==="submissions"){const t=document.getElementById("submissions-list");t&&(t.innerHTML='<p class="text-gray-500 py-4">Carregando submissões...</p>')}else if(e==="missions"){const t=document.getElementById("missions-list");t&&(t.innerHTML='<p class="text-gray-500 py-4">Carregando missões...</p>')}else if(e==="pending"){const t=document.getElementById("pending-users");t&&(t.innerHTML='<p class="text-gray-500 py-4">Carregando pendentes...</p>')}}catch(t){console.warn("showLoadingForTab falhou:",t)}}document.addEventListener("DOMContentLoaded",async()=>{if(ke()){Be(),Ae(),window.apiRequest=w,window.Toast=Z;try{await le?.()}catch(e){console.warn("Erro ao setup de turmas:",e)}Ge?.();try{await st?.()}catch(e){console.warn("Erro na inicialização do módulo de missões:",e),we?.(),ye?.(),ve?.()}ot(),window.loadPendingUsers=z,window.loadApprovedStudents=de,window.loadMissions=N,window.loadSubmissions=_,window.editMission=Ee,window.missionAction=Ze,window.cancelEdit=ae,window.openFileSecurely=Ke,window.openFileWithPreview=fe,window.downloadFileSecurely=pe,window.renderTurmas=T,window.showPenaltyRewardModal=K,window.showStudentHistoryModal=ie,console.log("[MASTER] Inicializando bug report system..."),nt(),console.log("[MASTER] Inicializando theme toggle..."),lt(),setTimeout(()=>{const e=document.getElementById("bug-report-btn");console.log("[MASTER] Botão de bug report após timeout:",e),e&&(console.log("[MASTER] Adicionando listener de teste..."),e.addEventListener("click",()=>{console.log("[MASTER] CLICK DETECTADO NO TESTE!")}))},1e3)}});function nt(){console.log("[BUG REPORT] Inicializando sistema...");const e=document.getElementById("bug-report-btn"),t=document.getElementById("bug-report-modal"),a=document.getElementById("close-bug-modal"),s=document.getElementById("cancel-bug-report"),o=document.getElementById("bug-report-form");if(console.log("[BUG REPORT] Elementos:",{btn:!!e,modal:!!t,close:!!a,cancel:!!s,form:!!o}),!e||!t){console.error("[BUG REPORT] Elementos não encontrados!");return}e.addEventListener("click",()=>{console.log("[BUG REPORT] Botão clicado!"),t.classList.remove("hidden"),document.body.style.overflow="hidden"});function r(){t.classList.add("hidden"),document.body.style.overflow="auto",o&&o.reset()}a&&a.addEventListener("click",r),s&&s.addEventListener("click",r),t.addEventListener("click",n=>{n.target===t&&r()}),o&&o.addEventListener("submit",it)}async function it(e){e.preventDefault();const t=document.getElementById("submit-bug-report"),a=t.innerHTML;try{t.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...',t.disabled=!0;const s=new FormData(e.target),o=localStorage.getItem("username")||"Mestre Desconhecido",r=localStorage.getItem("email")||"email@desconhecido.com",n=s.get("title"),l=s.get("description"),c=s.get("screenshot");let u="";c&&c.size>0&&(console.log("[BUG REPORT] Tamanho original:",(c.size/1024).toFixed(2),"KB"),u=await new Promise((f,b)=>{const p=new FileReader;p.onload=y=>{const E=new Image;E.onload=()=>{const k=document.createElement("canvas"),h=k.getContext("2d");let I=E.width,B=E.height;const C=1200;I>C&&(B=B*C/I,I=C),k.width=I,k.height=B,h.drawImage(E,0,0,I,B);const F=k.toDataURL("image/jpeg",.7);console.log("[BUG REPORT] Comprimida para:",(F.length/1024).toFixed(2),"KB"),f(F)},E.onerror=b,E.src=y.target.result},p.onerror=b,p.readAsDataURL(c)}));const i={title:n,description:l,userName:o,userEmail:r,url:window.location.href,screenshot:u||null};console.log("[BUG REPORT] Enviando para o backend...");const d=await fetch(`${D}/api/bug-report`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(i)}),m=await d.json();if(console.log("[BUG REPORT] Resposta:",m),d.ok&&m.success)Z.show("✅ Bug reportado com sucesso! 📧 Email enviado","success"),document.getElementById("bug-report-modal").classList.add("hidden"),document.body.style.overflow="auto",e.target.reset();else throw new Error(m.message||"Erro ao enviar bug report")}catch(s){console.error("[BUG REPORT] Erro:",s),Z.show("❌ Erro ao enviar bug report. Tente novamente.","error")}finally{t.innerHTML=a,t.disabled=!1}}function lt(){const e=document.getElementById("theme-toggle"),t=document.getElementById("theme-icon");if(!e||!t){console.warn("[THEME] Elementos não encontrados");return}const a=localStorage.getItem("theme")||"light";ne(a),e.addEventListener("click",()=>{const o=(localStorage.getItem("theme")||"light")==="light"?"dark":"light";ne(o),localStorage.setItem("theme",o)})}function ne(e){const t=document.documentElement,a=document.body,s=document.getElementById("theme-icon");console.log("[THEME] Aplicando tema:",e),e==="dark"?(t.classList.add("dark"),a.classList.add("dark"),t.setAttribute("data-theme","dark"),s&&(s.classList.remove("fa-moon"),s.classList.add("fa-sun")),console.log("[THEME] Dark mode ativado")):(t.classList.remove("dark"),a.classList.remove("dark"),t.setAttribute("data-theme","light"),s&&(s.classList.remove("fa-sun"),s.classList.add("fa-moon")),console.log("[THEME] Light mode ativado"))}
