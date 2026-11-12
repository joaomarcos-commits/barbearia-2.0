/* ===== Menu hambúrguer (celular) ===== */

const botaoMenu = document.querySelector(".menu-toggle");
const menu = document.querySelector("#menu");

function alternarMenu(abrir) {
    menu.classList.toggle("aberto", abrir);

    botaoMenu.setAttribute("aria-expanded", abrir);

    botaoMenu.setAttribute(
        "aria-label",
        abrir ? "Fechar menu" : "Abrir menu"
    );
}

botaoMenu.addEventListener("click", () => {
    alternarMenu(!menu.classList.contains("aberto"));
});


/* ===== Fecha o menu ao escolher um link ===== */

menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        alternarMenu(false);
    });
});


/* ===== Sombra no cabeçalho quando a página rola ===== */

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
    header.classList.toggle("rolou", window.scrollY > 10);
});


/* ===== Botões de agendamento abrem o WhatsApp ===== */

// Troque pelo número real da barbearia (55 + DDD + número)
const NUMERO_WHATSAPP = "5511999999999";

const MENSAGEM = "Olá! Quero agendar um horário no Barber Studio.";

document.querySelectorAll("[data-agendar]").forEach((botao) => {

    botao.addEventListener("click", (evento) => {

        evento.preventDefault();

        const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(MENSAGEM)}`;

        window.open(url, "_blank", "noopener,noreferrer");

    });

});


/* ===== Ano automático no rodapé ===== */

document.querySelector("#ano").textContent = new Date().getFullYear();
