// listeners
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.command) {
        case 'login': {
            login(request.username, request.password);
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
        case 'logout': {
            logout();
            break;
        }
    }
});

// functions
/**
 * wait until given resource is loaded, then execute given function
 * 
 * @param isResourcesLoaded Function to check whether resources are loaded
 * @param callback Function to execute when resources are loaded
 * @param interval (Optional) Wait time before next check
 * @param maxWait (Optional) Max wait time, reload page after maxWait 
 */
function waitThenExecute(isResourcesLoaded, callback, interval, maxWait) {
    if (typeof interval === 'undefined') {
        interval = 100;
    }
    if (typeof maxWait === 'undefined') {
        maxWait = 1000 * 60 * 5;
    }
    var waitThenExecuteInternal = function(isResourcesLoaded, callback, interval, maxWait, passedTime) {
        if (passedTime > maxWait) {
            window.location.reload();
            return;
        } else {
            setTimeout(function() {
                if (isResourcesLoaded()) {
                    callback();
                } else {
                    waitThenExecuteInternal(isResourcesLoaded, callback, interval, maxWait, passedTime + interval);
                }
            }, interval);
        }
    };
    waitThenExecuteInternal(isResourcesLoaded, callback, interval, maxWait, 0);
}

/**
 * response vm status, with current username
 * 
 * @param vmStatus status of the vm, 'on' or 'off'
 * @response {vmStatus: vmStatus, currentUsername: currentUsername}
 */
function responseVmStatus(vmStatus) {
    waitThenExecute(function() {
        return document.getElementsByClassName('avatar-area').length > 0;
    }, function() {
        var currentUsername = document.getElementsByClassName('avatar-area')[0].querySelectorAll(':scope > .profile')[0].textContent;
        chrome.runtime.sendMessage({vmStatus: vmStatus, currentUsername: currentUsername});
    });
}

// login
function login(username, password) {
    document.querySelector('input[testpath="login-form-username"]').value = username;
    document.querySelector('input[testpath="login-form-password"]').value = password;
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
        });
    });
}

// check vm status
function checkVmStatus() {
    setTimeout(function() {
        var isDialogDisplayed = document.getElementsByClassName('kdmodal-shadow').length > 0;
        if (isDialogDisplayed) {
            waitThenExecute(function() {
                return document.getElementsByClassName('content-container')[0].firstElementChild.textContent.indexOf('turned off') > 0;
            }, function() {
                responseVmStatus('off');
            });
        } else {
            waitThenExecute(function() {
                return document.getElementsByClassName('untitledtxt').length == 0;
            }, function() {
                document.getElementsByClassName('vm-header')[0].querySelector(':scope > .buttons').children[0].click();
                waitThenExecute(function() {
                    return document.getElementsByClassName('refresh').length > 0;
                }, function() {
                    document.getElementsByClassName('refresh')[0].click();
                    waitThenExecute(function() {
                        return document.getElementsByClassName('jtreeitem').length > 1;
                    }, function() {
                        responseVmStatus('on');
                    });
                });
            });
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
            return document.getElementsByClassName('untitledtxt').length == 0;
        }, function() {
            document.getElementsByClassName('vm-header')[0].querySelector(':scope > .buttons').children[0].click();
            waitThenExecute(function() {
                return document.getElementsByClassName('refresh').length > 0;
            }, function() {
                document.getElementsByClassName('refresh')[0].click();
                waitThenExecute(function() {
                    return document.getElementsByClassName('jtreeitem').length > 1;
                }, function() {
                    responseVmStatus('on');
                });
            });
        });
    }, 500);
};

// logout
function logout() {
    document.querySelector('[testpath=logout-link]').click();
}