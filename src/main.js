const proxy = "https://api.allorigins.win/get?url=";//"http://www.whateverorigin.org/get?url=";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const url = urlParams.get("url");

const defaultStart = `
<div id='content'>
<article>
<br>
<b>readify.me</b>
<pages>
<a href='{0}'>Home</a>
|
<a href='{2}'>View original page</a>
</pages>
<hr>
<h1>{3}</h1>
`

const defaultEnd = `
</article>
</div>`

var title = "Article";
var siteName = "Unknown";
var articleName = "Unknown";

String.prototype.format = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

function recursePage($element, pageHTML){
    $element.children().each(function (index, element) {
        if (this.tagName == "P") {
            pageHTML.push($(element).get(0).outerHTML);
        }
        else if (this.tagName == "H1") {
            articleName = $(element).text();
        }

        return recursePage($(this), pageHTML);
    });

    return pageHTML;
}

function getNewHTML(originalPage) {
    var pageHTML = recursePage(originalPage, []);
    
    return pageHTML.join("\n");
}

// get content of website provided in URL
$.getJSON(proxy + encodeURIComponent(url), function(data){
    if (data.contents) {
        var htmlContent = getNewHTML($(data.contents));
        var protocol = url.split("://")[0];
        var domain = protocol + "://"
            + url.split("//")[1]
            .split("/")[0]

        var pageHTML =
            defaultStart.format(domain, siteName, url, articleName)
            + htmlContent + defaultEnd;

        document.body.innerHTML = pageHTML;
        document.title = "readify.me - " + title;
    }
    
    // if website has no content, redirect to get-started page
    else {
        window.location.replace("https://readify.me/get-started");
    }
})