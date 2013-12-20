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
        $("#clear-result").text(info.menu[voice_recog.lang].clear);
        $("#result-label").text(info.menu[voice_recog.lang].result);
        $("#publish-detail-label").text(info.menu[voice_recog.lang].publishdetail);
    };

    var VoiceRecognition = window.webkitSpeechRecognition
		|| window.mozSpeechRecognition
		|| window.oSpeechRecognition
		|| window.msSpeechRecognition
		|| window.SpeechRecognition;

	if (!VoiceRecognition){
		document.body.innerHTML = "<h1>This Browser is not supported.</h1>"
	}

	var voice_recog = new VoiceRecognition();

	                 
    voice_recog.lang = "ja-JP";
    voice_recog.continuous = false;
    voice_recog.interimResults = false;
    voice_recog.maxAlternatives = 5;

    voice_recog.onsoundstart = function(){
        console.log("recog start.");
        $("#status").text(info.status[voice_recog.lang].soundstart);
    };

    voice_recog.onspeechstart = function() {
        console.log("onspeechstart");
        $("#status").text("speech start");
    };

    voice_recog.onspeechend = function() {
        console.log("onspeechend");
        $("#status").text("speech end");
    };
    voice_recog.onnomatch = function(){
        console.log("recog nomatch.");
        $('#status').text(info.status[voice_recog.lang].nomatch);
    };

    voice_recog.onerror = function(e){
        console.log("recog error.: " + e.error);
        $('#status').text(info.status[voice_recog.lang].error + ": " + e.error);
    };

    voice_recog.onsoundend = function(){
        console.log("recog soundend.");
        $('#status').text(info.status[voice_recog.lang].soundend);
    };

    isPublishDetail = false;
    voice_recog.onresult = function(e){
        var msg = new ROSLIB.Message({
            texts: []
        });
        var recentResults = e.results[e.results.length-1];

        var message = "<table class=\"table table-striped\"><tr><td>" + info.table[voice_recog.lang].number + "</td>";
        message += "<td>" + info.table[voice_recog.lang].word + "</td>";
        message += "<td>" + info.table[voice_recog.lang].confidence + "</td></tr>";

        for (var i = e.resultIndex; i < e.results.length; ++i){
            var word = e.results[i][0].transcript;
            var conf = e.results[i][0].confidence;
            if (word != "")
                message += "<tr><td>" + (i - e.resultIndex + 1) + "</td><td>" + word + "</td><td>" + conf + "</td></tr>";
            if (!isPublishDetail) {
                msg['texts'].push(word);
            } else {
                console.log("debug");
                if (e.results[i][0].final) msg['texts'].push(word);
            }
        }

        message += "</table>";
        $('#messages').prepend(message);
        console.log(JSON.stringify(msg));
        tabletVoice.publish(msg);

		if (!voice_recog.continuous){
            console.log("speak off");
            voice_recog.stop();
            isSpeaking = false;
            $("#speak").text(info.menu[voice_recog.lang].speak);
		}			
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
            $("#speak").text(info.menu[voice_recog.lang].speak).removeAttr("disabled");
            $("#once").addClass("btn-primary");
            $("#continuous").removeClass("btn-primary");
            voice_recog.abort();
            voice_recog.continuous = false;
        }
    });
    $("#continuous").on("click", function (){
        if (!voice_recog.continuous){
            $("#speak").text(info.menu[voice_recog.lang].speak).attr("disabled", "disabled");
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
        console.log("lang selected: " + $(this).attr('value'));
        voice_recog.lang = $(this).attr('value');
        voice_recog.start();
        showMenuString();
    });

    $("#clear-result").click(function (){
        console.log("clear result");
        $('#messages').html("");
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
                publishdetail: "途中結果のパブリッシュ",
                clear: "履歴の削除",
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
                publishdetail: "Publish Detail",
                clear: "Clear History",
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
                publishdetail: "Publish Detail",
                clear: "Чистить",
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
