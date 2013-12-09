$(function() {
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
        var recentResults = e.results[e.results.length-1];

        var messages = "<table><tr><td>" + info['table'][voice_recog.lang].number + "</td>";
        message += "<td>" + info.table[voice_recog.lang].word + "</td>";
        message += "<td>" + info.table[voice_recog.lang].confidence + "</td></tr>";
        for (var i = 0; i < recentResults.length; ++i){
            var word = recentResults[i].transcript;
            var conf = recentResults[i].confidence;
            messages += "<tr><td>" + i + "</td><td>" + res + "</td><td>" + conf + "</td></tr>";
            msg['texts'].push(res);
        }
        messages += "</table>";
        $('#messages').append(messages);
        console.log(JSON.stringify(msg));
        tabletVoice.publish(msg);
    };

    var isSpeaking = false;
    $("#speak").on("click", function (){
        if (!isSpeaking) {
            console.log("speak on");
            voice_recog.start();
            isSpeaking = true;
            $("#speak").text("Stop");
        } else {
            console.log("speak off");
            voice_recog.stop();
            isSpeaking = false;
            $("#speak").text("Speak");
        }
    });
    $("#once").on("click", function(){
        if (voice_recog.continuous){
            voice_recog.stop();
            $("#speak").text("Speak").attr("disabled", "");
            voice_recog.continuous = false;
            $("#once").addClass("btn-primary");
            $("#continuous").removeClass("btn-primary");
        }
    });
    $("#continuous").on("click", function (){
        if (!voice_recog.continuous){
            $("#speak").text("Speak").attr("disabled", "disabled");
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
            voice_recog.stop();
            voice_recog.interimResults = false;
            voice_recog.start();
        }
    });


    var info = {
        table: {
            'ja-JP': {
                number: "番号",
                word: "認識された文章",
                confidence: "一致度"
            },
            'en-US': {
                number: "No.",
                word: "Words",
                confidence: "Confidence"
            },
            'ru-RU': {
                number: "№",
                word: "Слово",
                confidence: "Конфиденция"
            }
        }
    };
});
