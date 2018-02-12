/* eslint-disable require-jsdoc */
$(function() {
  // Peer object
  const peer = new Peer({
    key:  "31ae0608-e311-40fd-a878-cf006ec0a8df",
    debug: 3,
  });


  var cnt=1;

  //成績のための変数
  var tonSum = 0;
  var nanSum = 0;
  var shaSum = 0;
  var peSum = 0;

  var tonTumo = 0;
  var nanTumo = 0;
  var shaTumo = 0;
  var peTumo = 0;

  var tonHuri = 0;
  var nanHuri = 0;
  var shaHuri = 0;
  var peHuri = 0;

  let localStream;
  let room;
  peer.on('open', () => {
    $('#my-id').text(peer.id);
    // Get things started
    step1();
  });

  peer.on('error', err => {
    alert(err.message);
    // Return to step 2 if error occurs
    step2();
  });

  $('#make-call').on('submit', e => {
    console.log('make-call');
    e.preventDefault();
    // Initiate a call!
    const roomName = $('#join-room').val();
    if (!roomName) {
      return;
    }
    room = peer.joinRoom('mesh_video_' + roomName, {stream: localStream});

    //入室時の方角選択を取得
    var flagTon = document.getElementById("ton").checked;
    var flagNan = document.getElementById("nan").checked;
    var flagSha = document.getElementById("sha").checked;
    var flagPe  = document.getElementById("pe").checked;

    var myName = $('#name').val();
    var myDirecrion;

    //todo: かぶってたら弾く
    //todo: かぶってたら弾く
       if(flagTon){
           console.log("あなたは東");
           const tonName = $('#name').val();
           console.log(tonName);
           //各自の名前を反映
           $('.ton-agari').append(': '+tonName);
           myDirecrion = 'ton';
           $("#my").text(tonName);

       }
           if(flagNan){
        const nanName = $('#name').val();
        $('.nan-agari').append(': '+nanName);
        myDirecrion = 'nan';

    }
    if(flagSha){
        const shaName = $('#name').val();
        $('.sha-agari').append(': '+shaName);
        myDirecrion = 'sha';

    }
    if(flagPe){
        const peName = $('#name').val();
        $('.pe-agari').append(': '+peName);
        myDirecrion = 'pe';

    }
    //他の人に送信
    var message = {
      type: 'inroom',
      name: myName,
      direction: myDirecrion
    };
    room.send(JSON.stringify(message));

    //room名書き換え
    $('#room-id').text(roomName);

    step3(room);
  });

  $('#submit-agari').submit(function() {
    console.log('あがりが送信された');

  });


  $('#end-call').on('click', () => {
    room.close();
    step2();
  });

  // Retry if getUserMedia fails
  $('#step1-retry').on('click', () => {
    $('#step1-error').hide();
    step1();
  });

  // set up audio and video input selectors
  const audioSelect = $('#audioSource');
  const videoSelect = $('#videoSource');
  const selectors = [audioSelect, videoSelect];

  navigator.mediaDevices.enumerateDevices()
    .then(deviceInfos => {
      const values = selectors.map(select => select.val() || '');
      selectors.forEach(select => {
        const children = select.children(':first');
        while (children.length) {
          select.remove(children);
        }
      });

      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = $('<option>').val(deviceInfo.deviceId);

        if (deviceInfo.kind === 'audioinput') {
          option.text(deviceInfo.label ||
            'Microphone ' + (audioSelect.children().length + 1));
          audioSelect.append(option);
        } else if (deviceInfo.kind === 'videoinput') {
          option.text(deviceInfo.label ||
            'Camera ' + (videoSelect.children().length + 1));
          videoSelect.append(option);
        }
      }

      selectors.forEach((select, selectorIndex) => {
        if (Array.prototype.slice.call(select.children()).some(n => {
            return n.value === values[selectorIndex];
          })) {
          select.val(values[selectorIndex]);
        }
      });

      videoSelect.on('change', step1);
      audioSelect.on('change', step1);
    });

  function step1() {
    // Get audio/video stream
    const audioSource = $('#audioSource').val();
    const videoSource = $('#videoSource').val();
    const constraints = {
      audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
      video: {deviceId: videoSource ? {exact: videoSource} : undefined},
    };
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      $('#my-video').get(0).srcObject = stream;
      localStream = stream;

      if (room) {
        room.replaceStream(stream);
        return;
      }

      step2();
    }).catch(err => {
      $('#step1-error').show();
      console.error(err);
    });
  }

  function step2() {
    $('#their-videos').empty();
    $('#step1, #step3').hide();
    $('#step2').show();
    $('#join-room').focus();
  }

  function nameSet(msg){

   if(msg.direction==='ton'){
       console.log("東がきた");
       const tonName = msg.name;
       console.log(tonName);
       //各自の名前を反映
       $('.ton-agari').append(': '+tonName);
            $("#my").text(tonName);

   }
   if(msg.direction==='nan'){
     console.log("なんがきた");
     const nanName = msg.name;
          $("#video1").text(nanName);

       $('.nan-agari').append(': '+nanName);
   }
   if(msg.direction==='sha'){
     const shaName = msg.name;
          $("#video2").text(shaName);

       $('.sha-agari').append(': '+shaName);
   }
   if(msg.direction==='pe'){
     const peName = msg.name;
          $("#video3").text(peName);
       $('.pe-agari').append(': '+peName);
   }
 }

  function step3(room) {

    //新人に送信し返す時に使う
    // connection.on('data', message =>{
    //   console.log('昔の人から情報きた');
    //   const msg = JSON.parse(message.data);
    //   nameSet(msg);
    //
    // });

    room.on('data', message => {
      console.log('msgきた');
      console.log(message);
      console.log(message.data);
      const msg = JSON.parse(message.data);
      console.log(msg);
      if(msg.type==='inroom'){
        console.log('inroom');
        //名前設定
        nameSet(msg);

        //新人に送信し返す
        //未完成
        // peer.connect(message.src);
        // peer.on('connection', connection  =>{
        //   connection.send(
        //     message = {
        //       type: 'sinjin',
        //       name: myName,
        //       direction: myDirecrion
        //     });
        // });
      }

      if(msg.type==='agari'){}
      if(msg.type==='end'){}


    });


    // Wait for stream on the call, then set peer video display
    room.on('stream', stream => {
     const peerId = stream.peerId;
     const id = 'video_' + peerId + '_' + stream.id.replace('{', '').replace('}', '');

     const el = $('#their-video'+cnt).find('video').get(0);

     el.srcObject = stream;
     el.play();

     cnt++;

   });

    room.on('removeStream', function(stream) {
      const peerId = stream.peerId;
      $('#video_' + peerId + '_' + stream.id.replace('{', '').replace('}', '')).remove();
    });

    // UI stuff
    room.on('close', step2);
    room.on('peerLeave', peerId => {
      $('.video_' + peerId).remove();
    });
    $('#step1, #step2').hide();
    $('#step3').show();
  }
});
