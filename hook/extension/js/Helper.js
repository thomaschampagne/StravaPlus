/**
 *   Contructor
 */
function Helper() {

}

/**
 * Define prototype
 */
Helper.prototype = {

};

/**
 * Static method call test
 */
Helper.log = function(tag, object) {
    if (env.debugMode) {
        console.log('<' + tag + '>');
        console.log(object);
        console.log('</' + tag + '>');
    }
};

Helper.HHMMSStoSeconds = function(str) {
    var p = str.split(':'),
        s = 0,
        m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }
    return s;
};

Helper.secondsToHHMMSS = function(secondsParam, trimLeadingZeros) {
    var sec_num = parseInt(secondsParam, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = hours + ':' + minutes + ':' + seconds;
    return trimLeadingZeros ? Helper.trimLeadingZerosHHMMSS(time) : time;
};

Helper.median = function(valuesSorted) {
    var half = Math.floor(valuesSorted.length / 2);
    if (valuesSorted.length % 2)
        return valuesSorted[half];
    else
        return (valuesSorted[half - 1] + valuesSorted[half]) / 2.0;
};

Helper.upperQuartile = function(valuesSorted) {

    if (valuesSorted.length < 3) {
        return (0);
    }

    if (Helper.isEven(valuesSorted.length)) {
        var valuesSortedUpperHalf = valuesSorted.slice(valuesSorted.length / 2);
    } else {
        var valuesSortedUpperHalf = valuesSorted.slice((valuesSorted.length + 1) / 2);
    }

    return Helper.median(valuesSortedUpperHalf);
};

Helper.lowerQuartile = function(valuesSorted) {

    if (valuesSorted.length < 3) {
        return (0);
    }

    if (Helper.isEven(valuesSorted.length)) {
        var valuesSortedLowerHalf = valuesSorted.slice(0, valuesSorted.length / 2);
    } else {
        var valuesSortedLowerHalf = valuesSorted.slice(0, (valuesSorted.length - 1) / 2);
    }

    return Helper.median(valuesSortedLowerHalf);
};


// Use abstract equality == for "is number" test
Helper.isEven = function(n) {
    return n == parseFloat(n) ? !(n % 2) : void 0;
}


Helper.heartrateFromHeartRateReserve = function(hrr, maxHr, restHr) {
    return (parseFloat(hrr) / 100 * (parseInt(maxHr) - parseInt(restHr)) + parseInt(restHr)).toFixed(0);
};

Helper.heartRateReserveFromHeartrate = function(hr, maxHr, restHr) {
    return (parseFloat(hr) - parseInt(restHr)) / (parseInt(maxHr) - parseInt(restHr));
};


Helper.setToStorage = function(extensionId, storageType, key, value, callback) {

    // Sending message to background page
    chrome.runtime.sendMessage(extensionId, {
            method: StravistiX.setToStorageMethod,
            params: {
                storage: storageType,
                'key': key,
                'value': value
            }
        },
        function(response) {
            callback(response);
        }
    );
};

Helper.getFromStorage = function(extensionId, storageType, key, callback) {
    // Sending message to background page
    chrome.runtime.sendMessage(extensionId, {
            method: StravistiX.getFromStorageMethod,
            params: {
                storage: storageType,
                'key': key
            }
        },
        function(response) {
            callback(response);
        }
    );
};

Helper.includeJs = function(scriptUrl) {
    var link = document.createElement('link');
    link.href = chrome.extension.getURL(scriptUrl);
    link.type = 'text/css';
    link.rel = 'stylesheet';
    (document.head || document.documentElement).appendChild(link);
};

Helper.formatNumber = function(n, c, d, t) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

Helper.secondsToDHM = function(sec_num, trimZeros) {
    var days = Math.floor(sec_num / 86400);
    var hours = Math.floor((sec_num - (days * 86400)) / 3600);
    var minutes = Math.floor((sec_num - (days * 86400) - (hours * 3600)) / 60);
    if (trimZeros && days === 0) {
        if (hours === 0) {
            return minutes + 'm';
        }
        return hours + 'h ' + minutes + 'm';
    }
    return days + 'd ' + hours + 'h ' + minutes + 'm';
};

Helper.trimLeadingZerosHHMMSS = function(time) {
    var result = time.replace(/^(0*:)*/, '').replace(/^0*/, '') || "0";
    if (result.indexOf(":") < 0) {
        return result + "s";
    }
    return result;
};

Helper.guid = function() {
    // from http://stackoverflow.com/a/105074
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};
