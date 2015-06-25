window.utility = (function(){
    var Service = function(){};

    // ==== dateToAgoString ===
    // accepts either date object of seconds-ago as a string or number.
    // returns a string in the format of "5 days, 22h 12m ago"
    Service.prototype.toAgoString = function(datex) {
        if(typeof datex !== 'object'){
            datex = +datex;
            var seconds = datex;
            var dateNow = new Date();
            var dateSecondsAgo = new Date(dateNow.getTime() - seconds*1000);
            datex = dateSecondsAgo;
        }
        var strings = [];
        var delta = (Math.abs(new Date() - datex) / 1000);

        // calculate (and subtract) whole days
        var days = Math.floor(delta / 86400);
        delta -= days * 86400;
        if (days > 0) {
            strings.push(days + ' days,')
        }

        // calculate (and subtract) whole hours
        var hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        if (hours > 0) {
            strings.push(hours + 'h')
        }

        // calculate (and subtract) whole minutes
        var minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        if (minutes > 0) {
            strings.push(minutes + 'm')
        }

        if (strings.length === 0) {
            strings.push(1 + 'm')
        }

        var result = strings.join(' ') + ' ago';
        return result;
    };


    Service.prototype.appendDOM = function( dom ){
        return function( el, init ){
            if( !init ) el.innerHTML = ( dom );
        };
    };

    return new Service();
})();