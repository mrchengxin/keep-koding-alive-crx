function start() {
    var bgPage = chrome.extension.getBackgroundPage();
    bgPage.PERIOD_ACCOUNTS[0].account.username = document.getElementById('username0').value;
    bgPage.PERIOD_ACCOUNTS[0].account.password = document.getElementById('password0').value;
    bgPage.PERIOD_ACCOUNTS[1].account.username = document.getElementById('username1').value;
    bgPage.PERIOD_ACCOUNTS[1].account.password = document.getElementById('password1').value;
    bgPage.PERIOD_ACCOUNTS[2].account.username = document.getElementById('username2').value;
    bgPage.PERIOD_ACCOUNTS[2].account.password = document.getElementById('password2').value;
    
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
