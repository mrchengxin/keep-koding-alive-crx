function click() {
    chrome.tabs.create({
        url: "https://koding.com/Login",
        pinned: false
    }, function(tab) {
        console.log(tab);
        chrome.extension.getBackgroundPage().NEW_CREATED_TAB = tab;
        window.close;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-start').addEventListener('click', click);
});
