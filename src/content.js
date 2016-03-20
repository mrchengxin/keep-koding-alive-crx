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
        case 'check-status': {
            checkVMStatus(sender.tab);
            break;
        }
    }
});

// functions
function login() {
    document.querySelector('input[testpath="login-form-username"]').value = "world201502";
    document.querySelector('input[testpath="login-form-password"]').value = "world201502";
    document.querySelector('button[testpath="login-button"]').click();
}

function recreateSession() {
    document.getElementsByClassName('plus')[0].click();
    setTimeout(function() {
        var sessionMenu = document.getElementsByClassName('new-terminal')[0].nextElementSibling;
        sessionMenu.className = sessionMenu.className.replace('hidden', '');
        if (document.getElementsByClassName('terminate-all').length > 0) {
            document.getElementsByClassName('terminate-all')[0].click();
            setTimeout(function() {
                document.getElementsByClassName('plus')[0].click();
                setTimeout(function() {
                    var newSessionMenu = document.getElementsByClassName('new-terminal')[0].nextElementSibling;
                    newSessionMenu.className = newSessionMenu.className.replace('hidden', '');
                    setTimeout(function() {
                        document.getElementsByClassName('new-session')[0].click();
                    }, 1000);
                }, 1000);
            }, 5000);
        } else {
            document.getElementsByClassName('new-session')[0].click();
        }
    }, 1000);
}

function checkVMStatus(tab) {
	setTimeout(function() {
		var isDialogDisplayed = document.getElementsByClassName('kdmodal-shadow').length > 0;
		if (isDialogDisplayed) {
            var dialogInfo = document.getElementsByClassName('content-container')[0].firstElementChild.textContent;
            if (dialogInfo.indexOf('turned off') > 0) {
                document.getElementsByClassName('content-container')[0].children[1].click();
                checkVMStatus();
            } else {
                checkVMStatus();
            }
		} else {
            var isResourcesLoaded = document.getElementsByClassName('jtreeitem').length > 1;
			if (isResourcesLoaded) {
                chrome.runtime.sendMessage({vmStatus: "on"}, function(){});
            } else {
                checkVMStatus();
            }
		}
	}, 500);
};