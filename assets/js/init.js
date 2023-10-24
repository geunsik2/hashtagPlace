// 엔진 로드 후 실행할 초기화 함수(Module.postRun)
function init() {

	// 엔진 초기화 API 호출(필수)
	Module.initialize({
		container: document.getElementById("map"),
		terrain : {
			dem : {
				url : "http://xdworld.vworld.kr:8080",
				servername : "XDServer3d",
				name : "dem",
				encoding : true
			},
			image : {
				url : "http://xdworld.vworld.kr:8080",
				servername : "XDServer3d",
				name : "tile_mo_HD"
			},
		},
		defaultKey : "ezbBD(h2eFCmDQFQd9QpdzDS#zJRdJDm4!Epe(a2EzcbEzb2"
	});

	// 카메라 위치 설정
	Module.getViewCamera().setLocation(new Module.JSVector3D(128.68231393106973, 35.8346856841486, 1000.0));

	var layer = Module.getTileLayerList().createXDServerLayer({
		url : "https://xdworld.vworld.kr",
		servername : "XDServer3d",
		name : "facility_build",
		type : 9,
		minLevel : 0,
		maxLevel : 15
	});
	Module.setVisibleRange("facility_build", 3.0, 100000.0);

	// 객체 선택 이벤트 설정
	Module.canvas.addEventListener("Fire_EventSelectedObject", function(e){
		printObjectProperties(e);
	});
	
	// 마우스 모드를 객체 선택 모드로 설정
	Module.XDSetMouseState(Module.MML_SELECT_POINT);

	// 아이콘 관리 심볼 생성
	GLOBAL.Symbol = Module.getSymbol();

	// 거리, 면적 분석 출력 POI 레이어 생성
	let layerList = new Module.JSLayerList(true);
	let printLayer = layerList.createLayer("MEASURE_POI", Module.ELT_3DPOINT);
	printLayer.setMaxDistance(20000.0);
	printLayer.setSelectable(false);

	// 고도 분석 출력 POI 레이어 생성
	GLOBAL.Layer = layerList.createLayer("MEASURE_POI", Module.ELT_3DPOINT);
	GLOBAL.Layer.setMaxDistance(20000.0);
	GLOBAL.Layer.setSelectable(false);

	Module.XDEMapCreateLayer("facility_build", "http://xdworld.vworld.kr:8080", 8080, true, true, false, 9, 0, 15);
	
    initEvent(Module.canvas);
	
	// 거리측정 라인 랜더 옵션 설정
	Module.getOption().SetDistanceMeasureLineDepthBuffer(false);	// WEBGL GL_DEPTH_TEST 설정
 
	// 면적측정 라인 랜더 옵션 설정
	Module.getOption().SetAreaMeasurePolygonDepthBuffer(false);	// WEBGL GL_DEPTH_TEST 설정

	// 콜백 함수 설정 지속적으로 사용
	Module.getOption().callBackAddPoint(addPoint);		// 마우스 입력시 발생하는 콜백 성공 시 success 반환 실패 시 실패 오류 반환
	Module.getOption().callBackCompletePoint(endPoint);	// 측정 종료(더블클릭) 시 발생하는 콜백 성공 시 success 반환 실패 시 실패 오류 반환
}

// 엔진 파일 로드
;(function(){   	

	// 1. XDWorldEM.asm.js 파일 로드
	var file = "./assets/js/XDWorldEM.asm.js";
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', file, true);
	xhr.onload = function() {
	
		var script = document.createElement('script');
		script.innerHTML = xhr.responseText;
		document.body.appendChild(script);
		
		// 2. XDWorldEM.html.mem 파일 로드
		setTimeout(function() {
			(function() {
				var memoryInitializer = "./assets/js/XDWorldEM.html.mem";
				var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
				xhr.open('GET', memoryInitializer, true);
					xhr.responseType = 'arraybuffer';
					xhr.onload =  function(){
						
						// 3. XDWorldEM.js 파일 로드
						var url = "./assets/js/XDWorldEM.js";
						var xhr = new XMLHttpRequest();
						xhr.open('GET',url , true);
						xhr.onload = function(){
							var script = document.createElement('script');
							script.innerHTML = xhr.responseText;
							document.body.appendChild(script);
						};
						xhr.send(null);
					}
					xhr.send(null);
				})();
			}, 1);
		};
		xhr.send(null);
	}
)();

window.onresize = function() {
	if (typeof Module == "object") {
		try {
			Module.Resize(window.innerWidth, window.innerHeight);
			Module.XDRenderData();
		} catch(e) {}
	}
};

var Module = {
	TOTAL_MEMORY: 256*1024*1024,
	postRun: [init],
};

var GLOBAL = {
	Symbol : null,	// 아이콘 관리 
	Layer : null,	// POI 저장 레이어
	nIndex : 0		// POI, Icon 생성 인덱스
};