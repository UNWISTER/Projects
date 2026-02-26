/******************************************************************************/
/* Constants                                                                  */
/******************************************************************************/

const VERSION = "1.0";

const RESSOURCES = [

"./",
"./index.html",
"./service_worker.js",

"./css/default.css",
"./css/bootstrap-5.3.8-dist/css/bootstrap.min.css",

"./favicon/apple-touch-icon.png",
"./favicon/favicon.ico",
"./favicon/favicon.svg",
"./favicon/favicon-96x96.png",
"./favicon/site.webmanifest",
"./favicon/web-app-manifest-192x192.png",
"./favicon/web-app-manifest-512x512.png",
"./img/logo_app.png",
"./img/logo_map.png",
"./img/poubelles.png",
"./img/etoile.png",
"./img/attention.jpg",
"./img/background.jpg",

"./js/js/bootstrap.bundle.min.js",
"./js/pwa.js"
];

/******************************************************************************/

/******************************************************************************/
/* Listeners                                                                  */
/******************************************************************************/

self.addEventListener("install", onInstall);
self.addEventListener("fetch", onFetch);

/******************************************************************************/
/******************************************************************************/
/* Install                                                                    */
/******************************************************************************/

function onInstall(event)
{
	console.debug("onInstall()");

	event.waitUntil(caching());
	self.skipWaiting();
}

/******************************************************************************/

async function caching()
{
	console.debug("caching()");

	const KEYS = await caches.keys();

	if( ! KEYS.includes(VERSION))
	{
		console.log("Caching version:", VERSION);
		const CACHE = await caches.open(VERSION);
		await CACHE.addAll(RESSOURCES);

		for(const KEY of KEYS)
		{
			if(KEY !== VERSION)
			{
				console.log("Suppress old cache version:", KEY);
				await caches.delete(KEY);
			}
		}
	}
}

/******************************************************************************/
/******************************************************************************/
/* Fetch                                                                      */
/******************************************************************************/

function onFetch(event)
{
	console.debug("onFetch()");

	event.respondWith(getResponse(event.request));
}

/******************************************************************************/

async function getResponse(request)
{
	console.debug("getResponse()");

	const RESPONSE = await caches.match(request);

	if(RESPONSE)
	{
		console.log("Fetch from cache", request.url);
		return RESPONSE;
	}
	else
	{
		console.log("Fetch from server", request.url);
		return fetch(request);
	}
}

/******************************************************************************/
