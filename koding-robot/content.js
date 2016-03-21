// listeners
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.command) {
        case 'login': {
            login();
            break;
        }
        case 'recreate-session': {
            recreateSession();
            break;
        }
        case 'check-vm-status': {
            checkVmStatus();
            break;
        }
        case 'turn-on': {
            turnOn();
            break;
        }
    }
});

// functions
/**
 * @Param isResourcesLoaded function to check whether resources are loaded
 * @Param callback function to execute when resources are loaded
 * @Param interval wait time before next check
 */
function waitThenExecute(isResourcesLoaded, callback, interval) {
    setTimeout(function() {
        if (isResourcesLoaded()) {
            callback();
        } else {
            waitThenExecute(isResourcesLoaded, callback, interval);
        }
    }, interval);
}

// login
function login() {
    document.querySelector('input[testpath="login-form-username"]').value = "world201502";
    document.querySelector('input[testpath="login-form-password"]').value = "world201502";
    document.querySelector('button[testpath="login-button"]').click();
}

// recreate session
function recreateSession() {
    if (document.getElementsByClassName('plus')[0].parentElement.children.length > 1) {
        var children = document.getElementsByClassName('plus')[0].parentElement.children;
        for (var i = children.length - 2; i >= 0; i--) {
            children[i].querySelectorAll(':scope > .close-tab')[0].click();
        }
    }
    
    waitThenExecute(function() {
        return document.getElementsByClassName('plus')[0].parentElement.children.length < 2;
    }, function() {
        document.getElementsByClassName('plus')[0].click();
        waitThenExecute(function() {
            return document.getElementsByClassName('kdcontextmenu').length > 0;
        }, function() {
            var sessionMenu = document.getElementsByClassName('new-terminal')[0].nextElementSibling;
            sessionMenu.className = sessionMenu.className.replace('hidden', '');
            document.getElementsByClassName('new-session')[0].click();
        }, 100);
    }, 100);
}

// check vm status
function checkVmStatus() {
    setTimeout(function() {
        var isDialogDisplayed = document.getElementsByClassName('kdmodal-shadow').length > 0;
        if (isDialogDisplayed) {
            waitThenExecute(function() {
                return document.getElementsByClassName('content-container')[0].firstElementChild.textContent.indexOf('turned off') > 0;
            }, function() {
                chrome.runtime.sendMessage({vmStatus: 'off'});
            }, 100);
        } else {
            waitThenExecute(function() {
                return document.getElementsByClassName('jtreeitem').length > 1;
            }, function() {
                chrome.runtime.sendMessage({vmStatus: 'on'});
            }, 100);
        }
    }, 500);
}

// turn on the vm, and wait until workspace is fully loaded
function turnOn() {
    document.getElementsByClassName('content-container')[0].children[1].click();
    waitThenExecute(function() {
        return document.getElementsByClassName('kdmodal-shadow').length == 0;
    }, function() {
        waitThenExecute(function() {
            return document.getElementsByClassName('jtreeitem').length > 1;
        }, function() {
            chrome.runtime.sendMessage({vmStatus: 'on'});
        }, 100);
    }, 500);
};