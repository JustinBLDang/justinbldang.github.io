//#region htmlVariables
let textElement, loginButtonElement, copyButtonElement;

//#region Spotify Variables
const redirectUrl = 'https://justinbldang.github.io/spotify-authorization/';             
const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const scope = 'user-read-currently-playing user-read-private user-read-email';
let currentState;

window.addEventListener("load", () => {
  OnPageLoad();

});


// On page load, fetch params
const args = new URLSearchParams(window.location.search);
const code = args.get('code');
const error = args.get('error');
const state = args.get('state');

// If we find a code, we're in a callback, do a token exchange
if (code) {
  if(state != localStorage.getItem('state')){
    throw new Error("Spotify Authorization returned incorrect state, aborting.");
  }
  
  // Display code for copy and paste
  renderTemplate("main", "logged-in-success-template", {login_state: code});

  // Remove code from URL so we can refresh correctly.
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");

  const updatedUrl = url.search ? url.href : url.href.replace('?', '');
  window.history.replaceState({}, document.title, updatedUrl);
}
else {
  if(error){
    renderTemplate("main", "logged-in-fail-template", {error_state: error});
  }
  else
  {
    renderTemplate("main", "login");
  }
}

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
  textElement = document.getElementById("copy-text-element");
  loginButtonElement = document.getElementById("login-button");
  copyButtonElement = document.getElementById("copy-text-button");

  loginButtonElement.addEventListener("click", AuthorizeSpotifyLogin);
  copyButtonElement.addEventListener("click", () => { CopyTextToClipboard(textElement.innerText); });
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
        AssignDataBind(element, targetProp, data);
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

const AssignDataBind = (element, property, data) => {
  try{
    switch(property){
      case 'login_state':
        element[property] = data.login_state;
        return;
      case 'error_state':
        element[property] = data.error_state;
        return;
      case 'innerHTML':
        return;
      default:
        console.error(property + ": Property data assignment not supported.");
        return;
    }
  }
  catch(error){
    console.error(`Error binding ${data[property]} to ${property}(Does element/property exist?)`, error);
    return false;
  }
}
//#endregion Page Setup