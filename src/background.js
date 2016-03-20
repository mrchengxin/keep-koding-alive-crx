// chrome.alarms.create({
//     delayInMinutes: 0.1
// });

// chrome.alarms.onAlarm.addListener(function() {
//     console.log("alarm is triggered");
//     chrome.tabs.query({url: "https://www.google.com/*"}, function(tabs) {
//         console.log(tabs.length);
//         console.log(tabs[0].url);
//         console.log(tabs[0].id);
//         chrome.tabs.sendMessage(tabs[0].id, {greeting: "bg"}, function(response) {
//             console.log(response.farewell);
//         });
//     });
// });

var NEW_CREATED_TAB = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.vmStatus == 'on') {
        chrome.tabs.sendMessage(sender.tab.id, {command: "recreate-session"}, null);
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tabId == NEW_CREATED_TAB.id && changeInfo.status == 'complete') {
        if (tab.url == 'https://koding.com/Login') {
            console.log('bg: login');
            chrome.tabs.sendMessage(tab.id, {command: "login"}, null);
        } else if (tab.url == 'https://koding.com/IDE/koding-vm-0/my-workspace') {
            console.log('bg: check status');
            chrome.tabs.sendMessage(tab.id, {command: "check-status"}, null);
        }
    }
});