const i=`
.custom-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    font-family: Inter, system-ui, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: white;
    z-index: 10000;
    animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    word-wrap: break-word;
}

.custom-toast.success {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.custom-toast.error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.custom-toast.warning {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.custom-toast.info {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}
`;if(typeof document<"u"&&!document.getElementById("custom-toast-styles")){const t=document.createElement("style");t.id="custom-toast-styles",t.textContent=i,document.head.appendChild(t)}function a(t,o="info",e=3e3){if(typeof document>"u")return;const n=document.createElement("div");return n.className=`custom-toast ${o}`,n.textContent=t,document.body.appendChild(n),setTimeout(()=>{n.remove()},e+300),n}function c(t,o={}){const e=o.duration||3e3;return a(t,"success",e)}function d(t,o={}){const e=o.duration||5e3;return a(t,"error",e)}function u(t,o={}){const e=o.duration||3e3;return a(t,"warning",e)}function l(t,o={}){const e=o.duration||3e3;return a(t,"info",e)}function p(t,o="info",e={}){switch(o){case"success":return c(t,e);case"error":return d(t,e);case"warning":return u(t,e);case"info":default:return l(t,e)}}function y(t,o,e=null){const n=confirm(t);return n&&o?o():!n&&e&&e(),n}function m(){const t=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",t),console.log("[THEME] Tema carregado:",t),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{s(t),r()}):(s(t),r())}function f(){const o=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",o),localStorage.setItem("theme",o),s(o)}function s(t){const o=document.getElementById("theme-icon");if(!o){console.error("[THEME] Ícone do tema não encontrado!");return}const e=o.closest(".theme-toggle")?.querySelector(".lumus-nox-tooltip");t==="dark"?(o.classList.remove("fa-sun","theme-icon-sun"),o.classList.add("fa-moon","theme-icon-moon","fas"),e&&(e.textContent="Nox"),console.log("[THEME] Ícone alterado para MOON (dark mode)")):(o.classList.remove("fa-moon","theme-icon-moon"),o.classList.add("fa-sun","theme-icon-sun","fas"),e&&(e.textContent="Lumus"),console.log("[THEME] Ícone alterado para SUN (light mode)")),o.style.display="inline-block",o.style.opacity="1",o.style.visibility="visible"}function r(){document.querySelectorAll(".theme-toggle").forEach(t=>{t.addEventListener("mouseenter",()=>{const e=t.querySelector(".lumus-nox-tooltip");e&&(e.style.opacity="1",e.style.transform="translateX(-50%) scale(1)")}),t.addEventListener("mouseleave",()=>{const e=t.querySelector(".lumus-nox-tooltip");e&&(e.style.opacity="0",e.style.transform="translateX(-50%) scale(0.95)")});let o;t.addEventListener("touchstart",e=>{e.preventDefault();const n=t.querySelector(".lumus-nox-tooltip");n&&(n.style.opacity="1",n.style.transform="translateX(-50%) scale(1)",o=setTimeout(()=>{n.style.opacity="0",n.style.transform="translateX(-50%) scale(0.95)"},2e3))}),t.addEventListener("touchend",()=>{clearTimeout(o)})})}window.toggleTheme=f;window.applyThemeOnLoad=m;export{m as a,u as b,d as c,y as d,c as e,p as s,f as t};
