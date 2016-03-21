var VALID_PERIODS = [];
var REFRESH_INTERVAL = null;
var NEW_CREATED_TAB = null;

function shouldKeepVMOn() {
    var day = new Date();
    var hour = day.getHours();
    for (var i = 0; i < VALID_PERIODS.length; i++) {
        if (VALID_PERIODS[i].from <= hour && hour < VALID_PERIODS[i].to) {
            return true;
        }
    }
    return false;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.vmStatus == 'on') {
        console.log('bg: first time to recreate session');
        chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: 'recreate-session'}, null);
        console.log(VALID_PERIODS);
        console.log('REFRESH_INTERVAL = ' + REFRESH_INTERVAL);
        if (shouldKeepVMOn()) {
            console.log('bg: start the alarm');
            chrome.alarms.create('recreate-session-alarm', {periodInMinutes: parseFloat(REFRESH_INTERVAL)});
        }
    } else if (request.vmStatus == 'off') {
        console.log('bg: turn on');
        chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: 'turn-on'}, null);
    }
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    console.log('bg: alarm is triggered');
    console.log('bg: recreate session');
    chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: "recreate-session"}, null);
    if (!shouldKeepVMOn()) {
        chrome.alarms.clear(alarm.name);
        console.log('bg: alarm is cleared');
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tabId == NEW_CREATED_TAB.id && changeInfo.status == 'complete') {
        if (tab.url == 'https://koding.com/Login') {
            console.log('bg: login');
            chrome.tabs.sendMessage(tab.id, {command: 'login'}, null);
        } else if (tab.url == 'https://koding.com/IDE/koding-vm-0/my-workspace') {
            console.log('bg: check vm status');
            chrome.tabs.sendMessage(tab.id, {command: 'check-vm-status'}, null);
        }
    }
});