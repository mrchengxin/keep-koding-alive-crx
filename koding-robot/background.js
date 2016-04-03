var PERIOD_ACCOUNTS = [
    {
        periods: [{from:22, to:24}, {from:0, to:6}],
        account: {username:null, password:null}
    },
    {
        periods: [{from:6, to:14}],
        account: {username:null, password:null}},
    {
        periods: [{from:14, to:22}],
        account: {username:null, password:null}
    }
];
var REFRESH_INTERVAL = '5.0'; //5 minutes
var NEW_CREATED_TAB = null;
var ALARM_NAME_RECREATE_SESSION = 'recreate-session-alarm';
var CURRENT_ACCOUNT_USERNAME = null;

function getCurrentAccount() {
    var day = new Date();
    var hour = day.getHours();
    for (var i = 0, maxI = PERIOD_ACCOUNTS.length; i < maxI; i++) {
        var periodAccount = PERIOD_ACCOUNTS[i];
        for (var j = 0, maxJ = periodAccount.periods.length; j < maxJ; j++) {
            if (periodAccount.periods[j].from <= hour && hour < periodAccount.periods[j].to) {
                return periodAccount.account;
            }
        }
    }
    return null;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.currentUsername !== getCurrentAccount().username) {
        console.log('bg: logout');
        console.log('bg: switch to ' + getCurrentAccount().username + ', ' + new Date());
        chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: "logout"}, null);
    } else {
        CURRENT_ACCOUNT_USERNAME = request.currentUsername;
        if (request.vmStatus == 'on') {
            console.log('bg: first time to recreate session, ' + new Date());
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
        }
    }
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    // switch to the other user at given time
    var day = new Date();
    var hour = day.getHours();
    for (var i = 0, maxI = PERIOD_ACCOUNTS.length; i < maxI; i++) {
        if (hour === PERIOD_ACCOUNTS[i].periods[0].from) {
            if (CURRENT_ACCOUNT_USERNAME !== PERIOD_ACCOUNTS[i].account.username) {
                chrome.alarms.clear(alarm.name);
                console.log('bg: alarm is cleared');
                
                console.log('bg: logout');
                console.log('bg: switch to ' + getCurrentAccount().username + ', ' + new Date());
                chrome.tabs.sendMessage(NEW_CREATED_TAB.id, {command: "logout"}, null);
                return;
            }
        }
    }
    // recreate session
    if (getCurrentAccount() !== null) {
        console.log('bg: alarm is triggered');
        console.log('bg: recreate session, ' + new Date());
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
                    chrome.tabs.sendMessage(tab.id, {command: 'check-vm-status'}, null);
                }
            });
        } else if (tab.url == 'http://www.koding.com/') {
            chrome.tabs.update(NEW_CREATED_TAB.id, {url: 'https://koding.com/Login'}, null);
        }
    }
});