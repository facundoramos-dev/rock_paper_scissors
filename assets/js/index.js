// Seleccionamos los elementos del DOM por sus clases o IDs y los almacenamos en variables.
const userSelection = document.querySelector(".user__selection");
const containerName = document.querySelector("#containerName");
const containerGame = document.querySelector("#containerGame");
const containerPopUp = document.querySelector("#containerPopUp");
const containerMessageEnd = document.querySelector("#containerMessageEnd");
const overlay = document.querySelector("#overlay");
const userPoints = document.querySelector("#userPoints");
const cpuPoints = document.querySelector("#cpuPoints");
const buttonResetGame = `<button id="resetGame" onclick="handleResetGame()">Reiniciar</button>`;

// Variable que indica si hay una animación en progreso.
let animationInProgress = false;

// Diccionario para almacenar los ganadores del juego.
const winners = {
  0: "Empate",
  1: "Jugador",
  2: "CPU",
};

// Diccionario de las posibles manos y sus respectivos ganadores.
const possibilities = {
  0: { hand: "piedra", winner: "tijeras" },
  1: { hand: "papel", winner: "piedra" },
  2: { hand: "tijeras", winner: "papel" },
};

// Función para manejar el inicio del juego.
const handlePlayGame = async () => {
  if (!validateName()) return; // Validamos el nombre del jugador.
  const nickUserPlay = document.querySelector("#nickUserPlay").firstChild;
  const nick = document.querySelector("#nick")?.value;
  nickUserPlay.nodeValue = nick + ": ";
  winners[1] = nick;
  containerName.classList.add("pointerNone");
  await gsap.to(containerName, { opacity: 0 });
  await gsap.to(containerGame, { opacity: 1 });
  containerGame.classList.remove("pointerNone");
};

// Función para validar el nombre del jugador.
const validateName = () => {
  const nick = document.querySelector("#nick")?.value?.trim() ?? "";
  const nickError = document.querySelector("#errorNick");
  nickError.innerHTML = "";
  if (nick === "") nickError.innerHTML = "Por favor, introduzca un Nick";
  return nickError.innerHTML === "";
};

// Función para crear efectos de hover en las opciones de selección.
const createHoverEffect = () => {
  if (!userSelection) return;
  for (let child of userSelection.children) {
    child.addEventListener("click", (e) => selectHand(e.target.id));
    child.addEventListener("mouseenter", () => eventMouseEnter(child));
    child.addEventListener("mouseleave", () => eventMouseLeave(child));
  }
};

// Función para seleccionar una mano y jugar la partida.
const selectHand = async (id) => {
  animationInProgress = true;

  const textWinner = document.querySelector("#textWinner");

  const userHand = getHand(document.getElementById(id).dataset.hand);
  const cpuHand = getHand(generateRandomNumber(0, 2));
  const winner = determineWinners(userHand, cpuHand);
  const points = updatePoints(winner);
  const text = getTextPopUp(winner);
  textWinner.innerHTML = text;

  containerGame.classList.add("pointerNone");

  // Comprobamos si un jugador o cpu han alcanzado 3 puntos para determinar el ganador final.
  if (points.user >= 3 || points.cpu >= 3) {
    containerMessageEnd.innerHTML =
      points.cpu > points.user
        ? `Fue una buena partida ${winners[1]}, pero esta vez gano el <strong>CPU</strong>`
        : `Felicidades <strong>${winners[1]}</strong> has ganado.`;
    containerMessageEnd.innerHTML += buttonResetGame;
    await gsap.to(containerGame, { opacity: 0 });
    await gsap.to(containerMessageEnd, { opacity: 1 });
    containerMessageEnd.classList.remove("pointerNone");
  } else {
    await gsap.to(containerGame, { opacity: 0.8 });
    await Promise.all([
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1 }),
      gsap.fromTo(
        containerPopUp,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1 }
      ),
    ]);
    overlay.classList.remove("pointerNone");
  }
};

const getHand = (handSelect) => possibilities[handSelect] ?? {};

const generateRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const determineWinners = (user, cpu) => {
  if (user.hand === cpu.hand) return 0;
  return user.winner === cpu.hand ? 1 : 2;
};

const getTextPopUp = (winner) =>
  winner === 0
    ? "Esta ronda termina en un <strong>empate!!!</strong>"
    : `El ganador de esta ronda es <strong>${winners[winner]}</strong>`;

const eventMouseEnter = (child) =>
  !animationInProgress && gsap.to(child, { scale: 1.1, borderColor: "orange" });

const eventMouseLeave = (child) =>
  !animationInProgress && gsap.to(child, { scale: 1, borderColor: "black" });

const handleContinueGame = async () => {
  overlay.classList.add("pointerNone");

  await Promise.all([
    gsap.to(userSelection.children, { scale: 1, borderColor: "black" }),
    gsap.to([containerPopUp, overlay], { opacity: 0 }),
    gsap.to(containerGame, { opacity: 1 }),
  ]);

  containerGame.classList.remove("pointerNone");
  animationInProgress = false;
};

// Funccion para actualizar los puntos
const updatePoints = (winner) => {
  let userPointsNumber = Number(userPoints.textContent);
  let cpuPointsNumber = Number(cpuPoints.textContent);

  if (winner === 1) userPoints.textContent = ++userPointsNumber;
  if (winner === 2) cpuPoints.textContent = ++cpuPointsNumber;

  return { user: userPointsNumber, cpu: cpuPointsNumber };
};

// Función asincrónica para manejar el reinicio del juego.
const handleResetGame = async () => {
  // Restablecer el valor del campo de entrada de nombre a una cadena vacía.
  document.querySelector("#nick").value = "";
  gsap.to(userSelection.children, { scale: 1, borderColor: "black" });
  await gsap.to(containerMessageEnd, { opacity: 0 });
  await gsap.to(containerName, { opacity: 1 });
  containerMessageEnd.classList.add("pointerNone");
  containerName.classList.remove("pointerNone");

  // Establecer el contenido de puntos del jugador y cpu en "0".
  userPoints.textContent = "0";
  cpuPoints.textContent = "0";

  // Restablecer la variable que indica si hay una animación en progreso a "false".
  animationInProgress = false;
};

// ----------------- Execution Script -----------------

// Evento de clic en el botón "Jugar" para iniciar el juego.
document.querySelector("#play")?.addEventListener("click", handlePlayGame);
// Evento de clic en el botón "Continuar" para continuar después de mostrar resultados.
document
  .querySelector("#continueGame")
  ?.addEventListener("click", handleContinueGame);

// Llamamos a la función para crear efectos de hover en las opciones de selección.
createHoverEffect();
