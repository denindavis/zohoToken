/******** replace below values with your own     ********/

let clientId    = '1000.L86CQYOC6IPLBH7VHL8F4FOUH66ICK';                                       //YOUR CLIENT ID
let scope       = `Desk.tickets.ALL,Desk.basic.ALL`;                                           //YOUR SCOPES 
let redirectUri = 'https://denindavis.github.io/zohoToken/redirect.html'; //YOUR REDIRECT URL 
let oauthDomain = 'https://accounts.zoho.com';

var clientConfig = {
   "live" : {
       "clientId" : '1000.L86CQYOC6IPLBH7VHL8F4FOUH66ICK',
       "domain"   : 'https://accounts.zoho.com'
   },
   "local": {
       "clientId" : '1000.Z19HZLE42ODY7QKWI39I7HA2HVTIQC',
       "domain"   : 'https://accounts.localzoho.com'
   },
   "dev": {
       "clientId" : '1000.Y6XSTF5WOFO51G6AG3D77M5IYVP4KF',
       "domain"   : 'https://accounts.csez.zohocorpin.com'
   }
};

let currentAppServer = 'live';
let callback_after_authorize = (function(generatedOauthToken){
                                    document.getElementById("oauthtoken").innerHTML = generatedOauthToken;
                                    console.log('OAuthtoken = ' + generatedOauthToken );
                                });

/******** replace above values with your own     ********/


let ci;
let ct;
let generatedOauthToken = null;

function initiateAuthroizeFromInput(e){
    console.log(e);
    e.preventDefault();
    clientId    = document.getElementById("client_id").value.trim();
    scope       = document.getElementById("scopes").value.trim();
    redirectUri = document.getElementById("redirect_uri").value.trim();
    initiateAuthorize();
}

function selectAppServer(appServer){
    currentAppServer = appServer;
    clientId    = clientConfig[appServer].clientId;
    oauthDomain = clientConfig[appServer].domain;
    window.localStorage.setItem("last_appserver", appServer);
    console.log('current appserver - ' +appServer);
}

function initiateAuthorize(e){
    e.preventDefault();
    scope = M.Chips.getInstance($('.chips')).chipsData.map(a => a.tag).join().trim();
    if(scope.length==0) {alert("Select Scopes"); return}
    window.localStorage.setItem("last_scope", scope);
    let authWindow = window.open(`${oauthDomain}/oauth/v2/auth?response_type=token&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=1234`,
                            '_blank',
                            'width=500,height=500'
                    );
    let authPromise = new Promise((res, rej) => {
        ci = setInterval(() => { /*checking hash value in every one second till reached 50sec or throw reject timeout */
            try {
                let hashData = authWindow.location.hash;
                if(hashData) {
                    res(hashData);
                    authWindow.close();
                }
            }
            catch (e) {
                console.log('hash not yet received');
            }
      }, 1000);
      ct = setTimeout(() => {
                rej('timeout reached');
                ci();
                authWindow.close();
          }, 50000);
    });
    authPromise.then(
        hash => {
            generatedOauthToken = getAccessToken(hash);
            callback_after_authorize(generatedOauthToken);
        },
        err => console.log(' error... ', err)
    );
}

function syncScopesForAutoFill(){
    window.localStorage.setItem("last_scope", document.getElementById("scopes").value.trim());
}

function initDefaultValue(){
   let lastScope = window.localStorage.last_scope
  if(!lastScope){
        window.localStorage.setItem("last_scope", "Desk.tickets.ALL,Desk.settings.ALL,Desk.search.READ,Desk.basic.READ");
    }
    lastScope.split(",").map(a => ({"tag":a})).forEach(b=> M.Chips.getInstance($('.chips')).addChip(b));
}

function hideElem(id){
  document.getElementById(id).style.display='none';
}

function getParameterByName(name, hash) {
    let match = RegExp(`[#&]${name}=([^&]*)`).exec(hash);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function getAccessToken(hash) {
    return getParameterByName('access_token', hash);
}
