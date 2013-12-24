$(function() {
    var ros = new ROSLIB.Ros({
        url: "ws://" + location.hostname + ":8888"
    });

    var tabletVoice = new ROSLIB.Topic({
        ros: ros,
        name: "/Tablet/voice",
        messageType: 'jsk_gui_msgs/VoiceMessage'
    });

    var showMenuString = function (lang){
        setLanguage(lang||"ja");
        $("#continuous").text(_("continuous"));
        $("#once").text(_("once"));
        $("#speak").text(_("speak"));
        $("#language").text(_("language"));
        $("#detail-label").text(_("detail"));
        $("#status-label").text(_("status"));
        $("#clear-result").text(_("clear"));
        $("#result-label").text(_("result"));
        $("#publish-detail-label").text(_("publishdetail"));
    };

    var VoiceRecognition = window.webkitSpeechRecognition
        || window.mozSpeechRecognition
        || window.oSpeechRecognition
        || window.msSpeechRecognition
        || window.SpeechRecognition;

    if (!VoiceRecognition) $("body").html("<h1>This Browser is not supported.</h1>");

    var voice_recog = new VoiceRecognition();

    voice_recog.lang = "ja";
    voice_recog.continuous = false;
    voice_recog.interimResults = false;
    voice_recog.maxAlternatives = 5;

    voice_recog.onsoundstart = function(){
        console.log("recog start.");
        $("#status").text(_("soundstart"));
    };

    voice_recog.onspeechstart = function() {
        console.log("onspeechstart");
        $("#status").text(_("speechstart"));
    };

    voice_recog.onspeechend = function() {
        console.log("onspeechend");
        $("#status").text(_("speechend"));
    };
    voice_recog.onnomatch = function(){
        console.log("recog nomatch.");
        $('#status').text(_("nomatch"));
    };

    voice_recog.onerror = function(e){
        console.log("recog error.: " + e.error);
        $('#status').text(_("error") + ": " + e.error);
    };

    voice_recog.onsoundend = function(){
        console.log("recog soundend.");
        $('#status').text(_("soundend"));
    };

    var addRow3 = function(col1, col2, col3){
        return "<tr><td>"+col1+"</td><td>"+col2+"</td><td>"+col3+"</td></tr>";
    };

    isPublishDetail = false;
    voice_recog.onresult = function(e){
        var msg = new ROSLIB.Message({
            texts: []
        });
        var recentResults = e.results[e.results.length-1];

        var table = '<table class="table table-striped">'
        table += addRow3(_("number"), _("word"), _("confidence"));

        for (var i = e.resultIndex; i < e.results.length; ++i){
            var word = e.results[i][0].transcript;
            var conf = e.results[i][0].confidence;
            if (word != "")
                var num = i - e.resultIndex + 1;
                table += addRow3(num, word, conf);
            if (!isPublishDetail) {
                msg['texts'].push(word);
            } else {
                if (e.results[i][0].final) msg['texts'].push(word);
            }
        }
        table += "</table>";
        $('#messages').prepend(table);
        console.log(JSON.stringify(msg));
        tabletVoice.publish(msg);

        if (!voice_recog.continuous){
            console.log("speak off");
            voice_recog.stop();
            isSpeaking = false;
            $("#speak").text(_("speak"));
        }
    };

    var isSpeaking = false;
    $("#speak").on("click", function (){
        if (!isSpeaking) {
            console.log("speak on");
            voice_recog.start();
            isSpeaking = true;
            $("#speak").text(_("stop"));
        } else {
            console.log("speak off");
            voice_recog.stop();
            isSpeaking = false;
            $("#speak").text(_("speak"));
        }
    });
    $("#once").on("click", function(){
        if (voice_recog.continuous){
            $("#speak").text(info.menu[voice_recog.lang].speak).removeAttr("disabled");
            $("#once").addClass("btn-primary");
            $("#continuous").removeClass("btn-primary");
            voice_recog.abort();
            voice_recog.continuous = false;
        }
    });
    $("#continuous").on("click", function (){
        if (!voice_recog.continuous){
            $("#speak").text(_("speak")).attr("disabled", "disabled");
            $("#continuous").addClass("btn-primary");
            $("#once").removeClass("btn-primary");
            voice_recog.abort();
            voice_recog.continuous = true;
            voice_recog.start();
        }
    });
    $("#detail").click( function (){
        if (this.checked){
            console.log("detail enabled");
            voice_recog.abort();
            voice_recog.interimResults = true;
            voice_recog.start();
        } else {
            console.log("detail disabled");
            voice_recog.abort();
            voice_recog.interimResults = false;
            voice_recog.start();
        }
    });

    $("#publish-detail").click(function (){
        if (this.checked){
            console.log("publish detail enabled");
            isPublishDetail = true;
        } else {
            console.log("publish detail disabled");
            isPublishDetail = false;
        }
    });

    $("#lang-selector li").click(function (){
        var lang = $(this).attr("value");
        console.log("lang selected: " + lang);
        showMenuString(lang);
        voice_recog.lang = lang;
        voice_recog.start();
    });

    $("#clear-result").click(function (){
        console.log("clear result");
        $('#messages').html("");
    });

    showMenuString();
});
