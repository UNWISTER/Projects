/******************************************************************************/
/* Constants                                                                  */
/******************************************************************************/

const INSTALL_BUTTON = document.getElementById("install_button");
const DIALOG = new bootstrap.Modal(document.getElementById('dialog_install'));
const SNACKBARCONTAINER = document.getElementById("snackbar");
/******************************************************************************/
/* Listeners                                                                  */
/******************************************************************************/

INSTALL_BUTTON.addEventListener("click", installPwa);
document.getElementById("dialog_close").addEventListener("click", closeDialogue);
document.getElementById("reload_pwa").addEventListener("click", reloadPwa);
/******************************************************************************/
/* Global Variable                                                            */
/******************************************************************************/

let beforeInstallPromptEvent;

/******************************************************************************/
/* Main                                                                       */
/******************************************************************************/

main();

function main()
{
	console.debug("main()");

	if(window.matchMedia("(display-mode: standalone)").matches)
	{
		console.log("Running as PWA");

		registerServiceWorker();
	}
	else
	{
		console.log("Running as Web page");

		window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
		window.addEventListener("appinstalled", onAppInstalled);
	}
}

/******************************************************************************/
/* Install PWA                                                                */
/******************************************************************************/

function onBeforeInstallPrompt(event)
{
  console.debug("onBeforeInstallPrompt()");

  event.preventDefault();
	DIALOG.show();
  beforeInstallPromptEvent = event;
}
function closeDialogue()
{
	DIALOG.hide();
}

/**************************************/

async function installPwa()
{
	console.debug("installPwa()");
  DIALOG.hide();
	const RESULT = await beforeInstallPromptEvent.prompt();

	switch(RESULT.outcome)
	{
		case "accepted": console.log("PWA Install accepted"); break;
		case "dismissed": console.log("PWA Install dismissed"); break;
	}

	INSTALL_BUTTON.disabled = true;
	window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
}

/**************************************/

function onAppInstalled()
{
	console.debug("onAppInstalled()");

	registerServiceWorker();
}

/******************************************************************************/
/* Register Service Worker                                                    */
/******************************************************************************/

async function registerServiceWorker()
{
	console.debug("registerServiceWorker()");

	if("serviceWorker" in navigator)
	{
		console.log("Register Service Worker…");

		try
		{
			const REGISTRATION = await navigator.serviceWorker.register("./service_worker.js");
			REGISTRATION.onupdatefound = onUpdateFound;

			console.log("Service Worker registration successful with scope:", REGISTRATION.scope);
		}
		catch(error)
		{
			console.error("Service Worker registration failed:", error);
		}
	}
	else
	{
		console.warn("Service Worker not supported…");
	}
}

/******************************************************************************/
/* Update Service Worker                                                    */
/******************************************************************************/

function onUpdateFound(event)
{
	console.debug("onUpdateFound()");

	const REGISTRATION = event.target;
	const SERVICE_WORKER = REGISTRATION.installing;
	SERVICE_WORKER.addEventListener("statechange", onStateChange);
}

/**************************************/

function onStateChange(event)
{
	const SERVICE_WORKER = event.target;

	console.debug("onStateChange", SERVICE_WORKER.state);

	if(SERVICE_WORKER.state == "installed" && navigator.serviceWorker.controller)
	{
    console.log("PWA Updated");

		const toastBootstrap = bootstrap.Toast.getOrCreateInstance(SNACKBARCONTAINER)
    	toastBootstrap.show()

	}
}

/**************************************/

function reloadPwa()
{
	console.debug("reloadPwa()");
	window.location.reload();
}

/******************************************************************************/
