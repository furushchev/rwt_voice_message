$(function() {
    var ros = new ROSLIB.Ros({
        url: "ws://" + location.hostname + ":8888"
    });

    var tabletVoice = new ROSLIB.Topic({
        ros: ros,
        name: "/Tablet/voice",
        messageType: 'jsk_gui_msgs/VoiceMessage'
    });

    var showMenuString = function (){
        $("#continuous").text(info.menu[voice_recog.lang].continuous);
        $("#once").text(info.menu[voice_recog.lang].once);
        $("#speak").text(info.menu[voice_recog.lang].speak);
        $("#language").text(info.menu[voice_recog.lang].language);
        $("#detail-label").text(info.menu[voice_recog.lang].detail);
        $("#status-label").text(info.menu[voice_recog.lang].status);
        $("#result-label").text(info.menu[voice_recog.lang].result);
    };

    var voice_recog = new webkitSpeechRecognition();
    voice_recog.lang = "ja-JP";
    voice_recog.continuous = false;
    voice_recog.interimResults = false;

    voice_recog.onsoundstart = function(){
        console.log("recog start.");
        $("#status").text(info.status[voice_recog.lang].soundstart);
    };

    voice_recog.onnomatch = function(){
        console.log("recog nomatch.");
        $('#status').text(info.status[voice_recog.lang].nomatch);
    };

    voice_recog.onerror = function(){
        console.log("recog error.");
        $('#status').text(info.status[voice_recog.lang].error);
    };

    voice_recog.onsoundend = function(){
        console.log("recog soundend.");
        $('#status').text(info.status[voice_recog.lang].soundend);
    };

    voice_recog.onresult = function(e){
        var msg = new ROSLIB.Message({
            texts: []
        });
        var recentResults = e.results[e.results.length-1];

        var message = "<table class=\"table table-striped\"><tr><td>" + info.table[voice_recog.lang].number + "</td>";
        message += "<td>" + info.table[voice_recog.lang].word + "</td>";
        message += "<td>" + info.table[voice_recog.lang].confidence + "</td></tr>";
        for (var i = 0; i < recentResults.length; ++i){
            var word = recentResults[i].transcript;
            var conf = recentResults[i].confidence;
            message += "<tr><td>" + i + "</td><td>" + word + "</td><td>" + conf + "</td></tr>";
            msg['texts'].push(word);
        }
        message += "</table>";
        $('#messages').append(message);
        console.log(JSON.stringify(msg));
        tabletVoice.publish(msg);
    };

    var isSpeaking = false;
    $("#speak").on("click", function (){
        if (!isSpeaking) {
            console.log("speak on");
            voice_recog.start();
            isSpeaking = true;
            $("#speak").text(info.menu[voice_recog.lang].stop);
        } else {
            console.log("speak off");
            voice_recog.stop();
            isSpeaking = false;
            $("#speak").text(info.menu[voice_recog.lang].speak);
        }
    });
    $("#once").on("click", function(){
        if (voice_recog.continuous){
            voice_recog.stop();
            $("#speak").text(info.menu[voice_recog.lang].speak).attr("disabled", "");
            voice_recog.continuous = false;
            $("#once").addClass("btn-primary");
            $("#continuous").removeClass("btn-primary");
        }
    });
    $("#continuous").on("click", function (){
        if (!voice_recog.continuous){
            $("#speak").text(info.menu[voice_recog.lang].speak).attr("disabled", "disabled");
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

    $("#lang-selector li").click(function (){
        console.log("lang selected: " + $(this).attr('value'));
        voice_recog.lang = $(this).attr('value');
        showMenuString();
    });

    info = {
        menu: {
            'ja-JP': {
                continuous: "連続",
                once: "一回",
                speak: "開始",
                stop: "停止",
                language: "言語",
                detail: "途中結果の表示",
                status: "状態",
                result: "結果"
            },
            'en-US': {
                continuous: "Continuous",
                once: "Once",
                speak: "Speak",
                stop: "Stop",
                language: "Language",
                detail: "Show Detail",
                status: "Current Status",
                result: "Results"
            },
            'ru-RU': {
                continuous: "Непрерывный",
                once: "Один раз",
                speak: "Разговор",
                stop: "Выкл.",
                language: "Язык",
                detail: "Показать подробность",
                status: "Статус",
                result: "Результат"
            },
        },
        status: {
            'ja-JP': {
                soundstart: "認識中",
                nomatch: "一致なし",
                error: "エラー",
                soundend: "待機"
            },
            'en-US': {
                soundstart: "Recognizing...",
                nomatch: "No match.",
                error: "Error.",
                soundend: "Idle."
            },
            'ru-RU': {
                soundstart: "Жду разговор...",
                nomatch: "Ничего найденно.",
                error: "Идет ошибку.",
                soundend: "Жду комманду..."
            },
        },
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
    showMenuString();
});
