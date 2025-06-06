const redirectUrl = 'https://justinbldang.github.io/spotify-authorization/';             
const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope = 'user-read-currently-playing user-read-private user-read-email';

// On page load, try to fetch auth code from current browser search URL
const args = new URLSearchParams(window.location.search);
const code = args.get('code');

// If we find a code, we're in a callback, do a token exchange
if (code) {
  // Display code for copy and paste
  renderTemplate("main", "logged-in-template", {login_state: code});

  // Remove code from URL so we can refresh correctly.
  const url = new URL(window.location.href);
  url.searchParams.delete("code");

  const updatedUrl = url.search ? url.href : url.href.replace('?', '');
  window.history.replaceState({}, document.title, updatedUrl);
}
else {
  renderTemplate("main", "login");
}

async function loginWithSpotifyClick() {
  await redirectToSpotifyAuthorize();
}

async function redirectToSpotifyAuthorize() {

  const authUrl = new URL(authorizationEndpoint)
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUrl
  };
  
  authUrl.search = new URLSearchParams(params).toString();
  window.location.assign(authUrl.toString()); // Redirect the user to the authorization server for login
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
        console.error("Unable to remove attribute " + attribute.name + " from " + element);
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
      case login_state:
        element[property] = data.login_state;
        return true;
      default:
        console.error(property + ": Property data assignment not supported.");
        return false;
    }
  }
  catch(error){
    console.error(`Error binding ${data[property]} to ${targetProp}`, ex);
    return false;
  }
}