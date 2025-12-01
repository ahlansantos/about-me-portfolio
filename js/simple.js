/* ======================================================
   BOOT SEQUENCE
====================================================== */


let desktopStarted = false;

document.addEventListener("keydown", e => {
    if (e.key === "Enter" && !desktopStarted) {
        startDesktop();
    }
});


function startDesktop() {
    desktopStarted = true
    const boot = document.getElementById("boot");
    const desk = document.getElementById("desktop");

    boot.style.display = "none";
    desk.classList.remove("hidden");

    const snd = document.getElementById("bootSound");
    snd.volume = 0.45;
    snd.play().catch(() => {});

    // Optional: Open About window automatically
    setTimeout(() => {
        openWindow("about");
    }, 400);
}

/* ======================================================
   WINDOW SYSTEM
====================================================== */

let zIndexCounter = 50;
const windowState = {}; // store maximize/restore states

function openWindow(id) {
    const win = document.getElementById(id);
    win.style.display = "block";
    focusWindow(win);
    addToTaskbar(id);
}

function closeWindow(id) {
    const win = document.getElementById(id);
    win.style.display = "none";
    removeFromTaskbar(id);
}

function minimize(id) {
    const win = document.getElementById(id);
    win.style.display = "none";

    const btn = document.querySelector(`[data-window='${id}']`);
    if (btn) btn.classList.remove("active");
}

function maximize(id) {
    const win = document.getElementById(id);

    if (!windowState[id]) windowState[id] = {};

    if (!windowState[id].maximized) {
        // Save previous state
        windowState[id].oldTop = win.style.top;
        windowState[id].oldLeft = win.style.left;
        windowState[id].oldWidth = win.style.width;
        windowState[id].oldHeight = win.style.height;

        // Maximize
        win.style.top = "0px";
        win.style.left = "0px";
        win.style.width = "100vw";
        win.style.height = "calc(100vh - 36px)";

        windowState[id].maximized = true;
    } else {
        // Restore
        win.style.top = windowState[id].oldTop;
        win.style.left = windowState[id].oldLeft;
        win.style.width = windowState[id].oldWidth;
        win.style.height = windowState[id].oldHeight;

        windowState[id].maximized = false;
    }

    focusWindow(win);
}

function focusWindow(win) {
    zIndexCounter++;
    win.style.zIndex = zIndexCounter;

    // highlight active window button
    const id = win.id;
    const btn = document.querySelector(`[data-window='${id}']`);
    if (btn) {
        document.querySelectorAll(".taskbtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }
}

/* ======================================================
   DRAG WINDOWS
====================================================== */

let offsetX = 0;
let offsetY = 0;

function drag(e, id) {
    const win = document.getElementById(id);
    focusWindow(win);

    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;

    function move(ev) {
        win.style.left = ev.clientX - offsetX + "px";
        win.style.top = ev.clientY - offsetY + "px";
        keepInBounds(win);
    }

    function stop() {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", stop);
    }

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
}

function keepInBounds(win) {
    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight - 36;

    if (win.offsetLeft < 0) win.style.left = "0px";
    if (win.offsetTop < 0) win.style.top = "0px";
    if (win.offsetLeft > maxX) win.style.left = maxX + "px";
    if (win.offsetTop > maxY) win.style.top = maxY + "px";
}

/* ======================================================
   TASKBAR
====================================================== */

function addToTaskbar(id) {
    const taskbar = document.getElementById("taskbar");

    // Already exists
    if (document.querySelector(`[data-window='${id}']`)) return;

    const btn = document.createElement("button");
    btn.classList.add("taskbtn");
    btn.dataset.window = id;
    btn.textContent = id;
    btn.onclick = () => toggleWindow(id);

    taskbar.appendChild(btn);
}

function removeFromTaskbar(id) {
    const btn = document.querySelector(`[data-window='${id}']`);
    if (btn) btn.remove();
}

function toggleWindow(id) {
    const win = document.getElementById(id);

    if (win.style.display === "none") {
        win.style.display = "block";
        focusWindow(win);
    } else {
        win.style.display = "none";
    }
}

/* ======================================================
   TERMINAL
====================================================== */

function terminalCommand(e) {
    if (e.key !== "Enter") return;

    const input = document.getElementById("termInput");
    const output = document.getElementById("terminal-output");
    const cmd = input.value.trim();

    output.innerHTML += `<p>ahlan-os:~$ ${cmd}</p>`;

    switch (cmd) {

        case "help":
            output.innerHTML += `<p>Commands: help, clear, neofetch, exit, about --secret</p>`;
            break;

        case "clear":
            output.innerHTML = "";
            break;

        case "exit":
            closeWindow("terminal");
            break;

        case "neofetch":
            output.innerHTML += `
<pre>
PelkOS v1.0
Developer: Áhlan Santos
Kernel: Hybrid NT/LX (simulated)
Theme: Pelk Dark
Resolution: ${window.innerWidth}x${window.innerHeight}
</pre>`;
            break;

        case "about --secret":
            output.innerHTML += `<p>Secret: Áhlan builds engines even before learning graphics math fully.</p>`;
            break;

        default:
            output.innerHTML += `<p>Command not found: ${cmd}</p>`;
    }

    input.value = "";
    output.scrollTop = output.scrollHeight;
}


/* ======================================================
   CLOCK
====================================================== */

function updateClock() {
    const clock = document.getElementById("clock");
    const now = new Date();

    let h = now.getHours().toString().padStart(2, "0");
    let m = now.getMinutes().toString().padStart(2, "0");

    clock.textContent = `${h}:${m}`;
}

setInterval(updateClock, 1000);
updateClock();
