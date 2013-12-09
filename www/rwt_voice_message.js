$(function() {
    var unicodeEscape = function(str) {
        var code, pref = {1: '\\u000', 2: '\\u00', 3: '\\u0', 4: '\\u'};
        return str.replace(/\W/g, function(c) {
            return pref[(code = c.charCodeAt(0).toString(16)).length] + code;
        });
    };

    var ros = new ROSLIB.Ros({
        url: "ws://" + location.hostname + ":8888"
    });

    var tabletVoice = new ROSLIB.Topic({
        ros: ros,
        name: "/Tablet/voice",
        messageType: 'jsk_gui_msgs/VoiceMessage'
    });

    var voice_recog = new webkitSpeechRecognition();
    voice_recog.lang = "ja-JP";
    voice_recog.continuous = false;
    voice_recog.interimResults = false;

    voice_recog.onsoundstart = function(){
        console.log("recog start.");
        $("#status").text("recognizing...");
    };

    voice_recog.onnomatch = function(){
        console.log("recog nomatch.");
        $('#status').text("No match found. Try again.");
    };

    voice_recog.onerror = function(){
        console.log("recog error.");
        $('#status').text("Error.");
    };

    voice_recog.onsoundend = function(){
        console.log("recog soundend.");
        $('#status').text("Idle.");
    };

    voice_recog.onresult = function(e){
        var msg = new ROSLIB.Message({
            texts: []
        });
        var results = e.results;
        var messages = "";

        messages += "<ul>";
        for (var j = 0; j < results[results.length-1].length; ++j){
            var res = results[results.length-1][j].transcript;
            messages += "<li>" + res + "</li>";
            msg['texts'].push(res);
        }

        messages += "</ul>";
        $('#messages').append(messages);
        console.log(JSON.stringify(msg));
        tabletVoice.publish(msg);
    };

    var isSpeaking = false;
    $("#speak").on("click", function (){
        if (!isSpeaking) {
            console.log("start");
            voice_recog.start();
            isSpeaking = true;
            $("#speak").text("Stop");
        } else {
            console.log("stop");
            voice_recog.stop();
            isSpeaking = false;
            $("#speak").text("Speak");
        }
    });
    $("#once").on("click", function(){
        if (voice_recog.continuous){
            voice_recog.stop();
            $("#speak").text("Speak").attr("style", "");
            voice_recog.continuous = false;
            $("#once").addClass("btn-primary");
            $("#continuous").removeClass("btn-primary");
        }
    });
    $("#continuous").on("click", function (){
        if (!voice_recog.continuous){
            $("#speak").text("Speak").attr("style", "visibility:hidden");
            voice_recog.continuous = true;
            $("#continuous").addClass("btn-primary");
            $("#once").removeClass("btn-primary");
            voice_recog.start();
        }
    });
    $("#detail").click( function (){
        if (this.checked){
            voice_recog.stop();
            voice_recog.interimResults = true;
            voice_recog.start();
        } else {
            voice.recog.stop();
            voice_recog.interimResults = false;
            voice_recog.start();
        }
    });
});
