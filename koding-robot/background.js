var DAY_ACCOUNT = {"periods":[{"from":8, "to":22}], "account":{"username":null, "password":null}};
var NIGHT_ACCOUNT = {"periods":[{"from":22, "to":24}, {"from":0, "to":8}], "account":{"username":null, "password":null}};
var REFRESH_INTERVAL = 5; // 5 minutes
var NEW_CREATED_TAB = null;
var ALARM_NAME_RECREATE_SESSION = 'recreate-session-alarm';
var CURRENT_ACCOUNT = null;

function getCurrentAccount() {
    var day = new Date();
    var hour = day.getHours();
    for (var i = 0; i < DAY_ACCOUNT.periods.length; i++) {
        if (DAY_ACCOUNT.periods[i].from <= hour && hour < DAY_ACCOUNT.periods[i].to) {
            return DAY_ACCOUNT.account;
        }
    }
    for (var i = 0; i < NIGHT_ACCOUNT.periods.length; i++) {
        if (NIGHT_ACCOUNT.periods[i].from <= hour && hour < NIGHT_ACCOUNT.periods[i].to) {
            return NIGHT_ACCOUNT.account;
        }
    }
    return null;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.vmStatus == 'on') {
        console.log('bg: remember current username');
        chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: 'get-current-username'}, function(response) {
            CURRENT_ACCOUNT = response.username;
        });
        
        console.log('bg: first time to recreate session');
        chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: 'recreate-session'}, null);
        
        console.log(getCurrentAccount());
        console.log('REFRESH_INTERVAL = ' + REFRESH_INTERVAL);
        if (getCurrentAccount() !== null) {
            console.log('bg: start the alarm');
            chrome.alarms.create(ALARM_NAME_RECREATE_SESSION, {periodInMinutes: parseFloat(REFRESH_INTERVAL)});
        }
    } else if (request.vmStatus == 'off') {
        console.log('bg: turn on');
        chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: 'turn-on'}, null);
    } else if (request.vmStatus == 'wrong-user') {
        console.log('bg: logout');
        console.log('bg: switch to ' + getCurrentAccount().username);
        chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: "logout"}, null);
    }
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    // switch to the other user at given time
    var day = new Date();
    var hour = day.getHours();
    if (hour == DAY_ACCOUNT.periods[0].from) {
        if (CURRENT_ACCOUNT !== DAY_ACCOUNT.account.username) {
            chrome.alarms.clear(alarm.name);
            console.log('bg: alarm is cleared');
            
            console.log('bg: logout');
            console.log('bg: switch to ' + getCurrentAccount().username);
            chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: "logout"}, null);
            return;
        }
    } else if (hour == NIGHT_ACCOUNT.periods[0].from) {
        if (CURRENT_ACCOUNT !== NIGHT_ACCOUNT.account.username) {
            chrome.alarms.clear(alarm.name);
            console.log('bg: alarm is cleared');
            
            console.log('bg: logout');
            console.log('bg: switch to ' + getCurrentAccount().username);
            chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: "logout"}, null);
            return;
        }
    }
    // recreate session
    if (getCurrentAccount() !== null) {
        console.log('bg: alarm is triggered');
        console.log('bg: recreate session');
        chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: "recreate-session"}, null);
    } else {
        chrome.alarms.clear(alarm.name);
        console.log('bg: alarm is cleared');
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tabId == NEW_CREATED_TAB.id && changeInfo.status == 'complete') {
        if (tab.url == 'https://koding.com/Login') {
            console.log('bg: login');
            var account = getCurrentAccount();
            chrome.tabs.sendMessage(tab.id, {command: 'login', username: account.username, password: account.password}, null);
        } else if (tab.url == 'https://koding.com/IDE/koding-vm-0/my-workspace') {
            chrome.alarms.get(ALARM_NAME_RECREATE_SESSION, function(alarm) {
                if (alarm == null) {
                    console.log('bg: check vm status');
                    var account = getCurrentAccount();
                    chrome.tabs.sendMessage(tab.id, {command: 'check-vm-status', username: account.username}, null);
                }
            });
        } else if (tab.url == 'http://www.koding.com/') {
            chrome.tabs.update(NEW_CREATED_TAB.id, {url: 'https://koding.com/Login'}, null);
        }
    }
});