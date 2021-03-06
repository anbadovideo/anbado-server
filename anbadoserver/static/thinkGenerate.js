/**
 *
 * Date: 9/22/13
 *
 * @author anbado video, haksudol
 * @since 0.1
 *
 * Copyright 2013 anbado video

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 *
 */


var anbado = window.anbado || {};

/**
 * think 객체에 대한 정보 생성
 *
 * @param think
 */

function thinkGenerate(think) { // video interaction event generation




    if (think.step === 1) { // 생성중인 이벤트
        think.occuredAbsoluteTime = (new Date());

        think.permission = "friends";
        think.secUnit = 100 * Math.round(CLIENTVAR.popcornobj.currentTime() / CLIENTVAR.popcornobj.duration());
        think.parentID = CLIENTVAR.transferEvent.parentID === undefined ? -1 : CLIENTVAR.transferEvent.parentID;
        think.childrenIDarray = [];

        thinkTypeCheck(think);


//        console.log("current" + think.clickTime);
        endup();
    }
    else if (think.step === 3) {// 생성å완료된 이벤트의 경우

        thinkTypeCheck(think);
//        console.log("current" + think.clickTime);


    }


}

/**
 * 서버에서 받은 think인지, 현재 세션에서 생성된 think인지를 체크합니다. 현재 세션에서 생성된 객체라면 이를 서버에 post 하는 과정을 거칩니다.
 *
 * @param think
 */

var thinkTypeCheck = function(think) {
    if (think.step === 1) { // 만들어지고 있는 이벤트


        switch (think.category) {

            case "textinput1":

                eaDisplaySetting(think);

                data.push({
                    'start': new Date(CLIENTVAR.pageGenerationTime.getTime() + think.clickTime * 1000),
                    'content': '<img src="' + think.profileImg.src + '" style="width:32px; height:32px;">' + think.content
                });


                anbado.realtime.postEvent({
                    user_id: userID,
                    video_id: videoID,
                    appeared: think.clickTime,
                    disappeared: think.clickTime + 5,
                    content: think.content,
                    category: 'text',
                    parent_id: -1,
                    permission: 'public',
                    coord: [think.x, think.y],
                    size: [CLIENTVAR.popcornobj.media.width, CLIENTVAR.popcornobj.media.height]
                });

                drawTimelineVisualization();

                break;
            case "textinput2":
                eaDisplaySetting(think);
                break;
            case "image":
                eaDisplaySetting(think);
                data.push({
                    'start': new Date(CLIENTVAR.pageGenerationTime.getTime() + think.clickTime * 1000),
                    'content': '<img src="' + think.profileImg.src + '" style="width:32px; height:32px;">' + '<img src="' + think.content + '"style="width:32px; height:32px;">'
                });

                anbado.realtime.postEvent({
                    user_id: userID,
                    video_id: videoID,
                    appeared: think.clickTime,
                    disappeared: think.clickTime + 5,
                    content: think.content,
                    category: 'image',
                    parent_id: -1,
                    permission: 'public',
                    coord: [think.x, think.y],
                    size: [CLIENTVAR.popcornobj.media.width, CLIENTVAR.popcornobj.media.height]
                });
                drawTimelineVisualization();
                break;

            default :
                console.log("not in event type");
                break;
        }



        happybutton(think); // 외부 이벤트의 경우에는 차트를 증가시키지 않음
    }
    if (think.step === 3) {          // 서버로부터 생각 입력하는 경우

        switch (think.category) {
            case "textinput1":
                eaDisplaySetting(think);

                data.push({
                    'start': new Date(CLIENTVAR.pageGenerationTime.getTime() + think.clickTime * 1000),
                    'content': '<img src="' + think.profileImg.src + '" style="width:32px; height:32px;">' + think.content
                });

                drawTimelineVisualization();

                break;
            case "textinput2":
//                eaDisplaySetting(eventObject);
                break;
            case 'image':
                eaDisplaySetting(think);
                data.push({
                    'start': new Date(CLIENTVAR.pageGenerationTime.getTime() + think.clickTime * 1000),
                    'content': '<img src="' + think.profileImg.src + '" style="width:32px; height:32px;">' + '<img src="' + think.content + '"style="width:32px; height:32px;">'
                });

                drawTimelineVisualization();
                break;

            default :
//                alert(eventObject.category);
                break;

        }
    }
}


var commentReply = function(think) { // stage mousedown event 가 발생하므로, 여기서 바로 패널을 옮김

    //TODO: diplayInput 패널 함수에 조건을 통해 이 함수를 합쳐야함. 조건체크를 해야하기 때문
    isItCommentReply = true;
//    console.log("this is " + think);


// 선 그리기 위한 컴포넌트들
    var shape = new createjs.Shape();
    shape.regX = 20;
    shape.regY = -20;
    var graphics = shape.graphics;
    var color = createjs.Graphics.getHSL(
        Math.cos((32) * 0.01) * 180,
        100,
        50,
        1.0);
    graphics.setStrokeStyle(10, "round").beginStroke(color);
    think.eaCanvasDisplayObject.addChildAt(shape, 1);


//    console.log(think.parentID);
    if (think.parentID === -1) { // 혼자 있던 이벤트를 클릭한 경우. 이 경우 eventObject는 클릭된 이벤트 정보가 넘어온다.
//        console.log("in minus one");
        think.parentID = think.ID; // 대댓글 연결이 시작되지 않은 상태에서는 클릭된 원본 아이디의 위치를 기억함
        CLIENTVAR.tempEvent.x = think.x + 40;

        CLIENTVAR.tempEvent.y = think.y + 66 * (think.childrenIDarray.length + 1);
//        eventObject.childrenIDarray.push(eventObject.ID); // 하위 이벤트들의 아이디를 기록함


        shape.graphics.moveTo(think.childrenIDarray.length === 0 ? think.x : think.x + 40, think.y + 66 * (think.childrenIDarray.length))
            .lineTo(think.x + 40, think.y + 66 * (think.childrenIDarray.length + 1));
    }
    else {
        console.log("else case"); // 최상위 객체 이외의 연관 객체 중 하나를 선택한 경우
        CLIENTVAR.tempEvent.parentID = think.parentID; // 이미 댓글이 달려있는 경우에는 그것을 고려하여 최상위 이벤트를 기록함
        CLIENTVAR.tempEvent.x = think.x;

        CLIENTVAR.tempEvent.y = CLIENTVAR.eventList[think.parentID].y + 66 * (CLIENTVAR.eventList[think.parentID].childrenIDarray.length + 1);


        // easeljs 를 통해 선을 그림
        for (var temp = 0; temp < CLIENTVAR.eventList[think.parentID].childrenIDarray.length; temp++) {
//            console.log("in for");

            // set up our drawing properties:

            shape.graphics.moveTo(CLIENTVAR.eventList[think.parentID].x, CLIENTVAR.eventList[think.parentID].y)
                .lineTo(CLIENTVAR.eventList[CLIENTVAR.eventList[think.parentID].childrenIDarray[temp]].x, CLIENTVAR.eventList[CLIENTVAR.eventList[think.parentID].childrenIDarray[temp]].y);

        }
    }
    displayInputPanel(CLIENTVAR.tempEvent);
}


/**
 * 입력된 생각 객체를 캔버스 위에 추가할 수 있도록 캔버스 도형을 생성합니다.
 *
 * @param think : 서버에서 받은 think와 현재 세션에서 입력된 think가 전달됩니다.
 */

function eaDisplaySetting(think) { // 객체를 캔버스에 저장하고 이벤트를 리스트에 넣게 되는 단계 (이것은 그리는 단계에서는 그러하고, 서버에서 받아오는 단계에서는 미리 저장한다



    var textFont = 'Nanum Gothic';
    think.eaCanvasDisplayObject = new createjs.Container();


    /**
     * 생각을 만든 사람 이름
     *
     * @type {createjs.Text}
     */
    var eaTextName = new createjs.Text(think.ownerName, 'bold 11px ' + textFont.toString(), '#00ddff');
    eaTextName.regX = -2;
    eaTextName.regY = 23;
    eaTextName.x = think.x;
    eaTextName.y = think.y;

    /**
     * 생각을 만든 사람의 프로필 사진
     * @type {createjs.Shape}
     */

    var eaProfileImage = new createjs.Shape();

    /**
     * 프로필 사진이 그려질 반경
     */
    var profileRadius;

    profileRadius = (think.profileImg.width > think.profileImg.height ? think.profileImg.height/2 : think.profileImg.width/2); // 프로파일 반지름을 설정해줌. 짦은 변을 기준으로
    eaProfileImage.graphics.beginBitmapFill(think.profileImg).drawCircle(think.profileImg.width/2, think.profileImg.height/2, profileRadius); //

//    console.log(think.profileImg.width/2);

    var profileImgSize = 18;
    eaProfileImage.scaleX = profileImgSize / profileRadius; // 스케일을 조정하여 사이즈 조절
    eaProfileImage.scaleY = profileImgSize / profileRadius;

//    eaProfileImage.graphics.beginBitmapFill(think.profileImg).drawCircle(think.profileImg.width/2, think.profileImg.height/2, (think.profileImg.width > think.profileImg.height ? 50 : 50)); // profile example. 가로 세로중 짦은 변의 1/2를 반지름으로 하게 된다.
//    eaProfileImage.scaleX = eaProfileImage.scaleY = eaProfileImage.scale = 0.5;
    eaProfileImage.regX = 0;
    eaProfileImage.regY = 0;


    if (think.category === 'textinput1' || think.category === 'textinput2') {

        eaProfileImage.x = think.x - 44;
        eaProfileImage.y = think.y - 24;

        if (think.eventTypeArg === "textinput2") {
            think.x = 100;
            think.y = 0 + CLIENTVAR.totalChat * 50;
            CLIENTVAR.totalChat++;
        }

        var eaTextContent = new createjs.Text(think.content, 15 + "px " + textFont.toString(), "#ffffff");
        eaTextContent.regX = -2;
        eaTextContent.regY = 10;
        eaTextContent.x = think.x;
        eaTextContent.y = think.y;
        eaTextContent.shadowColor = "red";

        var eaBackPanel = new createjs.Shape();
        eaBackPanel.graphics.beginFill("rgba(0,0,0,0.3)").drawRoundRect(think.x, think.y, (eaTextContent.getTransformedBounds().width>eaTextName.getTransformedBounds().width ? eaTextContent.getTransformedBounds().width : eaTextName.getTransformedBounds().width) + 60, eaTextContent.getTransformedBounds().height+ 23, 100); // 불투명도가 계속해서 높아지는 버그가 있음. easeljs issue인 듯
        eaBackPanel.regX = 40;
        eaBackPanel.regY = 27;

        // 백패널 추가후 텍스트 올림
        think.eaCanvasDisplayObject.addChild(eaBackPanel); // 뒷 배경과 무관하게 넣어주기 위해서 백패널을 이용함
        think.eaCanvasDisplayObject.addChild(eaTextName);

        think.eaCanvasDisplayObject.addChild(eaTextContent);
    }
    else if (think.category === 'image') {
//    else if (think.category === "emoticon0"  || think.category === "emoticon1" || think.category === "emoticon2" || think.category === "emoticon3") {

        eaProfileImage.x = think.x - 44;
        eaProfileImage.y = think.y - 16;

        var eaEmoticon = new createjs.Shape(); // make emoticon easeljs object

        eaEmoticon.scaleX = eaEmoticon.scaleY = eaEmoticon.scale = 0.4;
        eaEmoticon.graphics.beginBitmapFill(think.contentImg).drawCircle(50, 50, 48); //
//        setTimeout(function(){
        eaEmoticon.regX = 0;
        eaEmoticon.regY = 0;
        eaEmoticon.x = think.x + 7;
        eaEmoticon.y = think.y - 5;

        /**
         * 뒷 부분에 투명하게 패널을 넣어 시각성을 확보하며 이질감을 줄이도록 합니다.
         * @type {createjs.Shape}
         */

        var eaBackPanel = new createjs.Shape();

        eaBackPanel.graphics.beginFill("rgba(0,25,0,0.5)").drawRoundRect(think.x, think.y, (50>eaTextName.getTransformedBounds().width ? 50 : eaTextName.getTransformedBounds().width) + 64, 50 + eaTextName.getTransformedBounds().height, 100); // 불투명도가 계속해서 높아지는 버그가 있음. easeljs issue인 듯
        eaBackPanel.regX = 40;
        eaBackPanel.regY = 23;

        think.eaCanvasDisplayObject.addChild(eaBackPanel); // 뒷 배경과 무관하게 넣어주기 위해서 백패널을 이용함

        think.eaCanvasDisplayObject.addChild(eaTextName);
        think.eaCanvasDisplayObject.addChild(eaEmoticon);

    }


   think.eaCanvasDisplayObject.addChild(eaProfileImage); // 뒷 배경과 무관하게 넣어주기 위해서 백패널을 이용함



    if (think.eventTypeArg === "textinput2") {

        CLIENTVAR.chatLeftStage.addChild(think.eaCanvasDisplayObject);
        CLIENTVAR.chatLeftStage.update();
    }
    else { // 일반 텍스트 입력 및 이모티콘인 경우 경우
        CLIENTVAR.stage.addChild(think.eaCanvasDisplayObject);

    }


    if (think.parentID !== -1) { // 최상위 객체인지 확인하고 그게 아닌 경우에 이벤트에 관계 목록을 추가한다.

        CLIENTVAR.eventList[think.parentID].childrenIDarray.push(think.ID); // 하위 이벤트들의 아이디를 기록함 최상위 부모 노드에 기록함
    }
    CLIENTVAR.eventList.push(think); // 전체 이벤트 목록에 저장

    think.step = 2;
    CLIENTVAR.totalEvent++; // 이벤트 아이디를 증가시

    endup();
}


function endup() { // 이벤트 후 처리 부분

}

function getFocus() {

    $("#textinput1").focus();
}

