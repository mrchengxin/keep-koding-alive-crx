function start() {
    var bgPage = chrome.extension.getBackgroundPage();
    bgPage.DAY_ACCOUNT.account.username = document.getElementById('day-username').value;
    bgPage.DAY_ACCOUNT.account.password = document.getElementById('day-password').value;
    bgPage.NIGHT_ACCOUNT.account.username = document.getElementById('night-username').value;
    bgPage.NIGHT_ACCOUNT.account.password = document.getElementById('night-password').value;
    
    chrome.tabs.create({
        url: "https://koding.com/Login",
        pinned: true
    }, function(tab) {
        console.log(tab);
        chrome.extension.getBackgroundPage().NEW_CREATED_TAB = tab;
        window.close;
    });
}

function stop() {
    
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-start').addEventListener('click', start);
    document.getElementById('btn-stop').addEventListener('click', stop);
});
