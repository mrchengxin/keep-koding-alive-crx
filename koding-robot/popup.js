function click() {
    var period1 = {'from':20, 'to':24};
    var period2 = {'from':0, 'to':8};
    chrome.extension.getBackgroundPage().VALID_PERIODS.push(period1);
    chrome.extension.getBackgroundPage().VALID_PERIODS.push(period2);
    chrome.extension.getBackgroundPage().REFRESH_INTERVAL = document.getElementById('refresh-interval').value;
    
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
