// proxy used to access webpage content
const proxy = "https://api.allorigins.win/get?url=";

// config file variables
var filesCounted = 0;
var files = {
    "footerContent": "footerContent.txt",
    "headerContent": "headerContent.txt",
    "blacklistedContent": "blacklistedContent.json",
    "endOfContent": "endOfContent.json",
    "whitelistedClasses": "whitelistedClasses.json",
    "whitelistedLinks": "whitelistedLinks.json"
};

// get redirect url from page and set new window location
var url = window.location.href.split("/").slice(3).join("/");
var protocol;
var domain;

// if testing on local machine, redirect to test page
/*if (url == "404.html") {
    url = "https://www.bbc.co.uk/news/newsbeat-65791039";
}*/

if (url.indexOf("://") == -1) {
    url = "http://" + url;
}

try {
    protocol = url.split("://")[0];
    domain = protocol + "://"
        + url.split("//")[1]
        .split("/")[0];
}
catch {
    console.log("Invalid URL");
}

// // if dark mode requested
// if (url[0] == "d") {
//     url = url.slice(1);
// }

// // used to test on local machine
// var url = "https://news.sky.com/story/joe-biden-vladimir-putin-summit-talks-between-us-and-russian-presidents-have-concluded-12334154";

var title = "Article";
var siteName = "Unknown";
var articleName = "Unknown";

// implement String.format
String.prototype.format = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

function convertLinks(element) {
    // for every whitelisted link type, check if element has link
    files.whitelistedLinks.forEach(function(item, index) {
        if (element.hasAttribute(item)) {
            attribute = $(element).attr(item);

            // if link is of local type, add correct domain to front of url
            if (!attribute.startsWith("http")) {
                if (attribute.startsWith("/")) {
                    $(element).attr(item, domain + attribute);
                }
                else {
                    $(element).attr(item,
                        url.split("/")
                        .slice(0, -1)
                        .join("/") + "/"
                        + attribute
                    );
                }
            }
        }
    })

    return element;
}

function recursePage($element, pageHTML){
    // for every element on page, if class is whitelisted, update links
    $element.children().each(function (index, element) {
        if (files.whitelistedClasses.includes(this.tagName)) {
            element = convertLinks(element);

            // if element is an image, add contentimg tag
            if (this.tagName == "IMG") {
                $(element).attr("id", "contentimg");
            }

            // add element to pageHTML list
            pageHTML.push($(element).get(0).outerHTML);
        }

        // continue recursing until iterated through all elements
        return recursePage($(this), pageHTML);
    });

    return pageHTML;
}

function removeUselessInfo(pageHTML) {
    var removeRemainingContent = false;
    var lastImages = [];

    // for every child of article, remove spaces and convert line to lowercase
    pageHTML.find("article").children().each(function (index, element) {
        line = $(element).text().replace(/\s/g, "").toLowerCase();

        // if removing all remaining content, remove line and continue
        if (removeRemainingContent) {
            this.remove();
            return;
        }

        // if element is image, add to lastImages array
        if (this.tagName == "IMG") { 
            lastImages.push(this);
        }

        // if element is header, store as title
        else if (this.tagName == "H1") {
            title = $(element).text();
        }

        // if too many images in a row, remove all images and then reset array
        else {
            if (lastImages.length >= 5) {
                lastImages.map((element) => { element.remove(); });
            }
            lastImages = [];
        }

        // if line includes any listed strings, remove all remaining content
        for (var i = 0; i < files.endOfContent.length; i++) {
            content = files.endOfContent[i];
            if (line.includes(content)) {
                this.remove();
                removeRemainingContent = true;
                break;
            }
        }

        // if removing remaining content, continue to next iteration
        if (removeRemainingContent) {
            return;
        }

        // if blacklisted terms are in line, remove line
        for (var i = 0; i < files.blacklistedContent.length; i++) {
            content = files.blacklistedContent[i];
            if (line.includes(content)) {
                this.remove();
                break;
            }
        }
    })

    return pageHTML;
}

function loadWebpage() {
    // get content of website provided in URL
    $.getJSON(proxy + encodeURIComponent(url), function(data){
        // if data exists, recurse through page content
        if (data.contents) {
            var htmlContent = recursePage(($(data.contents)), [])
                .join("\n");
            
            // remove useless info from new page content
            var pageHTML = removeUselessInfo($(
                files.headerContent.format(domain, siteName, url)
                + htmlContent + files.footerContent
            ))[0].outerHTML;

            // update body and title
            document.body.innerHTML = pageHTML;
            document.title = title;
        }
        
        // if website has no content, redirect to error page
        else {
            window.location.replace("https://readify.me/error");
        }
    })
}

// if url is valid, get file contents and update variables
if (protocol) {
    filesLength = Object.keys(files).length;

    for (let [key, value] of Object.entries(files)) {
        $.get("/config/" + files[key], function(data) {
            filesCounted++;
            files[key] = data;

            // if all files loaded, load webpage
            if (filesCounted == filesLength) {
                loadWebpage();
            }
        })
    }
}

// otherwise, redirect to error page
else {
    window.location.replace("https://readify.me/error");
}