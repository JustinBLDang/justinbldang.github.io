const redirectUrl = 'https://justinbldang.github.io/spotify-authorization/';             
const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = 'user-read-currently-playing user-read-private user-read-email';

// On page load, try to fetch auth code from current browser search URL
const args = new URLSearchParams(window.location.search);
const code = args.get('code');

const template = document.getElementById("login");
const clone = template.content.cloneNode(true);

const elements = clone.querySelectorAll("*");
console.log(elements);
// If we find a code, we're in a callback, do a token exchange
// if (code) {
//   // Display code for copy and paste
//   renderTemplate("main", "logged-in-template");

//   // Remove code from URL so we can refresh correctly.
//   const url = new URL(window.location.href);
//   url.searchParams.delete("code");

//   const updatedUrl = url.search ? url.href : url.href.replace('?', '');
//   window.history.replaceState({}, document.title, updatedUrl);
// }

// // Otherwise we're not logged in, so render the login template
// if (!currentToken.access_token) {
//   renderTemplate("main", "login");
// }

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function loginWithSpotifyClick() {
  await redirectToSpotifyAuthorize();
}

async function redirectToSpotifyAuthorize() {
  currentState = utf8ToBase64(generateRandomString(16));

  const authUrl = new URL(authorizationEndpoint)
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUrl,
    state: currentState
  };
  
  authUrl.search = new URLSearchParams(params).toString();
  window.open(authUrl.toString(), "test").focus(); // Redirect the user to the authorization server for login
}

function renderTemplate(targetId, templateId, data = null) {
  const template = document.getElementById(templateId);
  const clone = template.content.cloneNode(true);

  const elements = clone.querySelectorAll("*");

  elements.forEach(ele => {
    const bindingAttrs = [...ele.attributes].filter(a => a.name.startsWith("data-bind"));
    bindingAttrs.forEach(attr => {

      const target = attr.name.replace(/data-bind-/, "").replace(/data-bind/, "");
      const targetType = target.startsWith("onclick") ? "HANDLER" : "PROPERTY";
      const targetProp = target === "" ? "innerHTML" : target;

      const prefix = targetType === "PROPERTY" ? "data." : "";
      const expression = prefix + attr.value.replace(/;\n\r\n/g, "");

      // Maybe use a framework with more validation here ;)
      try {
        ele[targetProp] = targetType === "PROPERTY" ? eval(expression) : () => { eval(expression) };
        ele.removeAttribute(attr.name);
      } catch (ex) {
        console.error(`Error binding ${expression} to ${targetProp}`, ex);
      }
    });
  });

  const target = document.getElementById(targetId);
  target.innerHTML = "";
  target.appendChild(clone);
}