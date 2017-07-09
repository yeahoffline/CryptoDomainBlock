function blockRequest(requestUrl) {
  let url = new URL(requestUrl);
  const parsed = psl.parse(url.hostname);
  const matchedKnownTld = knownTLDs[parsed.sld];
  return {
    cancel: (knownTLDs[parsed.sld] !== undefined && knownTLDs[parsed.sld].indexOf(parsed.tld) === -1),
    sld: parsed.sld,
    tld: parsed.tld,
    hostname: url.hostname,
    knownTld: knownTLDs[parsed.sld]
  };
}

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const blockResult = blockRequest(details.url);
    if(blockResult.cancel === true) {
      chrome.notifications.create("CryptoDomainBlocking", {
        type: "basic",
        title: blockResult.sld+"."+blockResult.tld.toUpperCase()+" blocked",
        message: "Looking for "+blockResult.sld+"."+blockResult.knownTld+" ?",
        iconUrl: "icons/icon48.png",
        priority: 2,
        requireInteraction: true,
        isClickable: true
      });
    }
    return { cancel: blockResult.cancel };
  },
  {urls: [
    "https://*/*",
    "http://*/*"
  ]},
  ["blocking"]
);
