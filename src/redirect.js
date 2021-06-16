// get redirect url from page and set new window location
var url = window.location.href.split("/").slice(3);
window.location.replace("https://readify.me?url=" + url);