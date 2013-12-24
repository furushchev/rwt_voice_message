(function(window, undefined) {
        /* The loaded JSON message store will be set on this object */
    window.__msgStore = {};
    window.__persistMsgStore = function(lang, data) {
        if(window.localStorage) {
            localStorage.setItem("localizationMsgStore"+lang, JSON.stringify(data));
            window.__msgStore = data;
        } else {
            window.__msgStore = data;
        }
    };
    window.__getLanguageJSON = function(lang) {
        var res = $.getJSON("locale/" + lang + ".json", function (json){
            window.__persistMsgStore(lang, json);
        });
    };
    window.setLanguage = function(l) {
        var lang = l || "ja-JP";
        if(window.localStorage) {
            console.log("localstorage enabled");
            var localMsgStore = localStorage.getItem("localizationMsgStore"+lang);
            if(localMsgStore) {
                console.log("use local cache");
                window.__msgStore = JSON.parse(localMsgStore);
            } else {
                window.__getLanguageJSON(lang);
            }
        } else {
            window.__getLanguageJSON(lang);
        }
    };

    window._ = function (key){
        return window.__msgStore[key] || key;
    };

})(window);
