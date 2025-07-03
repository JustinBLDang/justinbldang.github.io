//#region HTML Variables
let textElement, loginButtonElement, copyButtonElement, clientIDElement;
let clientId;

//#region Spotify Variables
const redirectUrl = 'https://justinbldang.github.io/spotify-authorization/';             
const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const scope = 'user-read-currently-playing';
let currentState;

//#region Misc Variables
let recievedError = false;

//#region Buttons
async function CopyTextToClipboard(text){
  try {
    await navigator.clipboard.writeText(text);
  }
  catch(error) {
    console.error(error);
  }
}
//#endregion Buttons

//#region Spotify Authorization
const utf8ToBase64 = (data) => {
  const bytes = new TextEncoder().encode(data);
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function AuthorizeSpotifyLogin() {
  clientId = clientIDElement.value;
  await redirectToSpotifyAuthorize();
}

async function redirectToSpotifyAuthorize() {
  currentState = utf8ToBase64(generateRandomString(16));
  localStorage.setItem('state', currentState);

  const authUrl = new URL(authorizationEndpoint)
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUrl,
    state: currentState
  };
  
  authUrl.search = new URLSearchParams(params).toString();
  window.location.assign(authUrl.toString()); // Redirect the user to the authorization server for login
}
//#endregion Spotify Authorization

//#region Page Setup
function OnPageLoad(){
  // fetch params
  const args = new URLSearchParams(window.location.search);
  const code = args.get('code');
  const error = args.get('error');
  const state = args.get('state');

  // Callback handling
  if(code && state != localStorage.getItem('state')){
    console.error("Spotify Authorization returned incorrect state, aborting.");
    renderTemplate("Authentication", "logged-in-fail-template", {error_state: "Spotify's response was invalid."});
  }
  else if(error){
    renderTemplate("Authentication", "logged-in-fail-template", {error_state: error});
    
    // Remove code from URL so we can refresh correctly.
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    url.searchParams.delete("state");

    const updatedUrl = url.search ? url.href : url.href.replace('?', '');
    window.history.replaceState({}, document.title, updatedUrl);
  }
  else if(code) {
    // Display code for copy and paste
    renderTemplate("Authentication", "logged-in-success-template", {login_state: code});

    // Remove code from URL so we can refresh correctly.
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("state");

    const updatedUrl = url.search ? url.href : url.href.replace('?', '');
    window.history.replaceState({}, document.title, updatedUrl);
  }

  renderTemplate("Login", "login");

  // Event Listeners, Element Assignment
  textElement = document.getElementById("copy-text");
  loginButtonElement = document.getElementById("login-button");
  copyButtonElement = document.getElementById("copy-text-button");
  clientIDElement = document.getElementById("client-id-input");

  loginButtonElement.addEventListener("click", () => { AuthorizeSpotifyLogin(); });
  if(copyButtonElement){ copyButtonElement.addEventListener("click", () => { CopyTextToClipboard(textElement.innerText); }); }
}

function renderTemplate(targetId, templateId, data = null) {
  const template = document.getElementById(templateId);
  const clone = template.content.cloneNode(true);

  const elements = clone.querySelectorAll("*");

  elements.forEach(element => {
    const attributes = [...element.attributes].filter(a => a.name.startsWith("data-bind"));
    attributes.forEach(attribute => {
      const target = attribute.name.replace(/data-bind-/, "").replace(/data-bind/, "");
      const targetProp = target === "" ? "innerHTML" : target;

      try{
        AssignDataBind(element, targetProp, attribute.value, data);
        element.removeAttribute(attribute.name);
      }
      catch (error) {
        console.error(error);
        console.log("Unable to remove attribute " + attribute.name + " from " + element);
      }
    });
  });

  const target = document.getElementById(targetId);
  target.innerHTML = "";
  target.appendChild(clone);
}

const AssignDataBind = (element, property, targetData, data) => {
  try{
    element[property] = data[targetData];
  }
  catch(error){
    console.error(`(AssignDataBind) Error binding data(Does element/property exist?)\n` + error);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  OnPageLoad();
});
//#endregion Page Setup