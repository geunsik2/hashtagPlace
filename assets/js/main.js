var global = {
	insta: [],
	tour: [],
	sgg: [
		{ name: '군위군', cnt: 0 },
		{ name: '달성군', cnt: 0 },
		{ name: '수성구', cnt: 0 },
		{ name: '달서구', cnt: 0 },
		{ name: '동구', cnt: 0 },
		{ name: '서구', cnt: 0 },
		{ name: '남구', cnt: 0 },
		{ name: '북구', cnt: 0 },
		{ name: '중구', cnt: 0 },
	],
	option: ['district', 'age', 'gender']
};

$(function() {
	var $window = $(window),
		$head = $('head'),
		$body = $('body');

	// Breakpoints.
	breakpoints({
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
		small: ['481px', '736px'],
		xsmall: ['361px', '480px'],
		xxsmall: [null, '360px'],
		'xlarge-to-max': '(min-width: 1681px)',
		'small-to-xlarge': '(min-width: 481px) and (max-width: 1680px)'
	});

	// Stops animations/transitions until the page has ...

	// ... loaded.
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
		}, 100);
	});

	// ... stopped resizing.
	var resizeTimeout;

	$window.on('resize', function () {

		// Mark as resizing.
		$body.addClass('is-resizing');

		// Unmark after delay.
		clearTimeout(resizeTimeout);

		resizeTimeout = setTimeout(function () {
			$body.removeClass('is-resizing');
		}, 100);
	});

	// Object fit images.
	if (!browser.canUse('object-fit') || browser.name == 'safari')
		$('.image.object').each(function () {
			var $this = $(this),
				$img = $this.children('img');

			// Hide original image.
			$img.css('opacity', '0');

			// Set background.
			$this
				.css('background-image', 'url("' + $img.attr('src') + '")')
				.css('background-size', $img.css('object-fit') ? $img.css('object-fit') : 'cover')
				.css('background-position', $img.css('object-position') ? $img.css('object-position') : 'center');
		});

	// Sidebar.
	var $sidebar = $('#sidebar'),
		$sidebar_inner = $sidebar.children('.inner');

	// Inactive by default on <= large.
	breakpoints.on('<=large', function () {
		$sidebar.addClass('inactive');
	});

	breakpoints.on('>large', function () {
		$sidebar.removeClass('inactive');
	});

	// Hack: Workaround for Chrome/Android scrollbar position bug.
	if (browser.os == 'android' && browser.name == 'chrome')
		$('<style>#sidebar .inner::-webkit-scrollbar { display: none; }</style>').appendTo($head);

	// Toggle.
	$('<a href="#sidebar" class="toggle">Toggle</a>')
		.appendTo($sidebar)
		.on('click', function (event) {

			// Prevent default.
			event.preventDefault();
			event.stopPropagation();

			// Toggle.
			$sidebar.toggleClass('inactive');
		});

	// Events.

	// Link clicks.
	$sidebar.on('click', 'a', function (event) {

		// >large? Bail.
		if (breakpoints.active('>large'))
			return;

		// Vars.
		var $a = $(this),
			href = $a.attr('href'),
			target = $a.attr('target');

		// Prevent default.
		event.preventDefault();
		event.stopPropagation();

		// Check URL.
		if (!href || href == '#' || href == '')
			return;

		// Hide sidebar.
		$sidebar.addClass('inactive');

		// Redirect to href.
		setTimeout(function () {
			if (target == '_blank')
				window.open(href);
			else
				window.location.href = href;
		}, 500);

	});

	// Prevent certain events inside the panel from bubbling.
	$sidebar.on('click touchend touchstart touchmove', function (event) {

		// >large? Bail.
		if (breakpoints.active('>large'))
			return;

		// Prevent propagation.
		event.stopPropagation();
	});

	// Hide panel on body click/tap.
	$body.on('click touchend', function (event) {

		// >large? Bail.
		if (breakpoints.active('>large'))
			return;

		// Deactivate.
		$sidebar.addClass('inactive');
	});

	// Scroll lock.
	// Note: If you do anything to change the height of the sidebar's content, be sure to
	// trigger 'resize.sidebar-lock' on $window so stuff doesn't get out of sync.

	$window.on('load.sidebar-lock', function () {
		var sh, wh, st;

		// Reset scroll position to 0 if it's 1.
		if ($window.scrollTop() == 1)
			$window.scrollTop(0);

		$window.on('scroll.sidebar-lock', function () {
			var x, y;

			// <=large? Bail.
			if (breakpoints.active('<=large')) {

				$sidebar_inner
					.data('locked', 0)
					.css('position', '')
					.css('top', '');

				return;
			}

			// Calculate positions.
			x = Math.max(sh - wh, 0);
			y = Math.max(0, $window.scrollTop() - x);

			// Lock/unlock.
			if ($sidebar_inner.data('locked') == 1) {
				if (y <= 0) {
					$sidebar_inner
						.data('locked', 0)
						.css('position', '')
						.css('top', '');
				}
				else {
					$sidebar_inner
						.css('top', -1 * x);
				}
			}
			else {
				if (y > 0) {
					$sidebar_inner
						.data('locked', 1)
						.css('position', 'fixed')
						.css('top', -1 * x);
				}
			}

		}).on('resize.sidebar-lock', function () {

			// Calculate heights.
			wh = $window.height();
			sh = $sidebar_inner.outerHeight() + 30;

			// Trigger scroll.
			$window.trigger('scroll.sidebar-lock');
		}).trigger('resize.sidebar-lock');
	});

	// Menu.
	var $menu = $('#menu'),
		$menu_openers = $menu.children('ul').find('.opener');

	// Openers.
	$menu_openers.each(function () {
		var $this = $(this);

		$this.on('click', function (event) {

			// Prevent default.
			event.preventDefault();

			// Toggle.
			$menu_openers.not($this).removeClass('active');
			$this.toggleClass('active');

			// Trigger resize (sidebar lock).
			$window.triggerHandler('resize.sidebar-lock');
		});
	});
		
	// Detailed information.
	$(document).on('click', '.marker', function() {	// 마커 클릭할 때마다 active 클래스 부여 및 제거.
		$(this).toggleClass('active');	// 선택한 요소에 active 클래스가 없으면 추가하고, 있으면 제거.

		if($(this).hasClass('active')) {	// 선택한 요소가 active 클래스를 가지고 있으면 true, 안 가지고 있으면 false 반환
			$(this).find('.detailWrap').css({display: "flex"});	// true일 때 detailWrap 보이게 설정.
		} else {
			$(this).find('.detailWrap').css({display: "none"});	// false일 때 detailWrap 안 보이게 설정.
		}
	});

	// Refresh.
	$(document).on('click', '.refresh', function() {	// 서비스명이나 로고 클릭 시 새로고침.
		document.location.reload();
	});

	// District.
	$(document).on('click', '.district', function() {	// 클래스명이 district인 객체 클릭 시 함수 호출.
		global.option.splice(0, 1, $(this).text().substr(0, $(this).text().indexOf('(')));	// 군∙구 데이터가 담긴 global.option[0]을 클릭한 행정구역으로 치환한다.
		$(this).parent().addClass('active').siblings().removeClass('active');	// district의 부모 객체에 active 클래스를 부여하고 그를 제외한 모든 형제 객체에 active 클래스를 제거한다.
	});

	// Age.
	$(document).on('click', '.age', function() {	// 클래스명이 age인 객체 클릭 시 함수 호출.
		global.option.splice(1, 1, $(this).parent().data('idx'));	// 나이 데이터가 담긴 global.option[1]을 비우고 클릭한 객체의 부모 객체의 데이터 속성(data-idx)을 담는다.
		$(this).parent().addClass('active').siblings().removeClass('active');	// age의 부모 객체에 active 클래스를 부여하고 그를 제외한 모든 형제 객체에 active 클래스를 제거한다.
	});

	// Gender.
	$(document).on('click', '.gender',function() {	// 클래스명이 gender인 객체 클릭 시 함수 호출.
		global.option.splice(2, 1, $(this).parent().data('idx'));	// 성별 데이터가 담긴 global.option[2]을 비우고 클릭한 객체의 부모 객체의 데이터 속성(data-idx)을 담는다.
		$(this).parent().addClass('active').siblings().removeClass('active');	// gender의 부모 객체에 active 클래스를 부여하고 그를 제외한 모든 형제 객체에 active 클래스를 제거한다.
	})

	// Condition.
	$(document).on('click', '#conditonSubmit', function() {	// 모든 조건 선택 후 조회 버튼 클릭 시 이벤트 발생.		
		if(global.option[0] != 'district' && global.option[1] != 'age' && global.option[2] != 'gender') {
			// 행정구역, 연령, 성별 모두 선택해야만 검색한다.
			var sgg = global.option[0];	// option[0]: 행정구역

			$.ajax({	// 선택한 행정구역의 성_연령 방문 집중률 파일을 불러온다.
				url: `/data/csv/${sgg}_관광지별 성_연령 방문 집중률 조회.csv`,
				dataType: 'text',
				success: data => {	// 선택한 행정구역의 성_연령 방문 집중률 결과
					var arr = data.split('\n');	// 불러온 데이터를 행 단위로 잘라서 arr에 대입한다. (arr: 1차원 배열)

					arr.forEach((val, key) => { // arr의 모든 요소를 순회한다.
						arr[key] = val.split(',');	// 행 단위로 저장한 데이터를 열(쉼표) 단위로 잘라서 arr에 대입한다. (arr: 2차원 배열)
					});
	
					global.tour = arr;	// global.tour에 가공을 끝낸 데이터 대입.
					
					global.tour.sort((a, b) => {	// 관광지별 성_연령 방문 집중률 데이터를 내림차순으로 정렬한다.
						return b[global.option[1] + global.option[2]] - a[global.option[1] + global.option[2]];
						// global.option[1]: 선택한 연령의 인덱스
						// global.option[2]: 선택한 성별의 인덱스
					});
						
					var kakaoArr = [];	// 카카오 API 검색할 데이터가 담길 배열
	
					global.tour.forEach((val, key) => {	// 검색할 데이터가 담긴 global.tour의 모든 요소를 순회한다.
						if(val[1].indexOf('(') == -1) {	// 장소이름에 괄호가 들어갔는지 검사한다.
							var content = val[1];	// content에 장소이름을 대입한다.
						} else {
							var content = val[1].substr(0, val[1].indexOf('('));	// 장소이름에 소괄호가 시작되는 인덱스부터 끝까지 제거한 뒤 content에 대입한다.
						}
						$.ajax({	// 카카오 API 검색: 성_연령 방문 집중률 데이터
							url: 'https://dapi.kakao.com/v2/local/search/keyword',
							type: 'get',
							dataType: 'json',
							headers: {
								"Authorization": "KakaoAK 0d6d834a6637f754d4acac9913cd23e1"
							},
							data: {
								query: content
							},
							async: false,
							success: function(json) {	// 카카오 API 검색 결과
								if(json.documents[0] === undefined) {	// 검색 결과 없을 시 해당 장소 건너뛴다.
									return;
								}
								kakaoArr.push(json.documents[0]);	// 검색 결과를 kakaoArr에 대입한다.
							}, 
						});
					});
	
					try {
						$('.resultWrap').empty();	// 검색 결과를 띄울 div태그를 비운다.
						createResult(kakaoArr);	// div태그에 검색 결과를 띄운다.
					} catch(e) {}
				}
			});
		} else {	// 행정구역, 연령, 성별 중 하나라도 선택 안 했을 경우 조회하지 않는다.
			return;
		}
	});	

	// Load instagram crawling data.
	$.ajax({
		url: '/data/csv/insta.csv',
		dataType: 'text',
		
		success: data => {	// 인스타 크롤링 데이터 가공.
			var arr = data.split('\n');	// 불러온 데이터를 행 단위로 잘라서 arr에 대입한다. (arr: 1차원 배열)

			// arr.shift();	// 불필요한 첫 번째 행 제거.
			// arr.pop();	// 불필요한 마지막 행 제거.

			global.insta = arr;	// 가공한 크롤링 데이터를 global.insta에 대입.

			global.sgg.forEach(val => {	// 군∙구 데이터가 담긴 global.sgg의 모든 요소를 순회.
				global.insta.forEach(ins => {	// 가공한 크롤링 데이터가 담긴 global.insta의 모든 요소를 순회.
					if (ins.indexOf(val.name) != -1) {	// 인스타 크롤링 데이터에 global.sgg에 존재하는 군∙구를 찾을 경우
						val.cnt = val.cnt + 1;	// 해당하는 군∙구의 카운터 1 증가.
					}
				});
			});

			global.sgg.sort((a, b) => {	// 군∙구 데이터를 내림차순으로 정렬.
				return b.cnt - a.cnt;
			});

			// 정렬한 군∙구 데이터로 html 태그 생성
			$('#district_list').after(`
				<ul>
					<li><a class="district" href="#">${global.sgg[0].name}(${global.sgg[0].cnt})</a></li>
					<li><a class="district" href="#">${global.sgg[1].name}(${global.sgg[1].cnt})</a></li>
					<li><a class="district" href="#">${global.sgg[2].name}(${global.sgg[2].cnt})</a></li>
					<li><a class="district" href="#">${global.sgg[3].name}(${global.sgg[3].cnt})</a></li>
					<li><a class="district" href="#">${global.sgg[4].name}(${global.sgg[4].cnt})</a></li>
					<li><a class="district" href="#">${global.sgg[5].name}(${global.sgg[5].cnt})</a></li>
					<li><a class="district" href="#">${global.sgg[6].name}(${global.sgg[6].cnt})</a></li>
					<li><a class="district" href="#">${global.sgg[7].name}(${global.sgg[7].cnt})</a></li>
					<li><a class="district" href="#">${global.sgg[8].name}(${global.sgg[8].cnt})</a></li>
				</ul>`
			);
		}
	});
});

// Search.
function searchSubmit() {	// 검색창에 원하는 키워드 입력 후 엔터키나 돋보기 아이콘 클릭하면 함수 호출.
	var content = $("#search_keyword_query").val();	// 검색창 내용을 content에 대입.
	
	if (content === "") {	// 검색창이 공백일 경우 검색 안 함.
		alert("검색어를 입력해주세요.");	// 검색어를 입력해달라는 알림 띄우기.
		return false;
	} else {	// 검색창이 공백이 아닐 경우 입력한 내용으로 검색.
		$.ajax({	// 카카오 API 검색
			url: 'https://dapi.kakao.com/v2/local/search/keyword',
			type: 'get',
			dataType: 'json',
			headers: {
				"Authorization": "KakaoAK 0d6d834a6637f754d4acac9913cd23e1"
			},
			data: {
				query: content,
			},
			success: function(json) {	// 카카오 API 검색 결과.
				$('.resultWrap').empty();	// 검색 결과를 띄울 div태그를 비운다.
				var arrJson = json.documents;	// 검색 결과를 arrJson에 대입.
				
				try {
					createResult(arrJson);	// 검색 결과를 div태그에 띄운다.
				} catch(e) {}
			}
		});
	}
}

// Create result.
function createResult(arrJson) {	// 카카오 API 검색 결과로 html 태그 생성.
	arrJson.forEach((val, index) => {	// 검색 결과가 담긴 arrJson의 모든 요소 순회.
		$('.resultWrap').append(`
		<div class="item">
			<a href="#" onclick="Module.getViewCamera().setLocation(new Module.JSVector3D(${val.x}, ${val.y}, 1000.0)); Module.getViewCamera().setTilt(90);">
				<p class="placeNum">${index + 1}</p>
				<div class="rightWrap">
					<p class="placeName">${val.place_name}</p>
					<p class="roadAddress">${val.road_address_name}</p>
					<p class="address">${val.address_name}</p>
					<p class="phone">${val.phone}</p>
				</div>
			</a>
		</div>`);
	});

	$('.item').click(function() {	// 검색 결과 클릭 시 마커 생성하는 함수 호출.
		setTimeout(() => {	// 0.5초 지연을 줘서 지도가 로딩되기 전에 createDivObject()가 먼저 호출되는 것을 방지한다.
			createDivObject(	// marker 객체 생성 함수.
				Number(arrJson[$(this).index()].x), 
				Number(arrJson[$(this).index()].y),
				arrJson[$(this).index()].id,
				arrJson[$(this).index()].place_name,
				arrJson[$(this).index()].road_address_name,
				arrJson[$(this).index()].address_name,
				arrJson[$(this).index()].phone,
				arrJson[$(this).index()].place_url
			);
		}, 500);
	});
}

// Marker.
function createDivObject(x, y, id, p_name, r_address, address, phone, url) {
	var layerList = new Module.JSLayerList(true);	// JSLayerList API 생성.

	if (layerList.nameAtLayer("HTML_OBJEC_LAYER") == null) {	// 아이디가 "HTML_OBJEC_LAYER"인 layer가 없다면 오브젝트 생성.
		var layer = layerList.createLayer("HTML_OBJEC_LAYER", Module.ELT_POLYHEDRON);
	} else { // 아이디가 "HTML_OBJEC_LAYER"인 layer가 있다면 해당 layer를 대입.
		var layer = layerList.nameAtLayer("HTML_OBJEC_LAYER");
	}
	layer.setMaxDistance(10000);	// 레이어 가시 범위를 10000m로 설정.

	let element = document.createElement("div");	// 변수 element에 div 태그 생성 후 대입.
	let parameter = {
		position: new Module.JSVector3D(x, y, Module.getMap().getTerrHeightFast(x, y)), // JSVector3D(경도, 위도, 고도): 위치 지정
		// getTerrHeightFast(경도, 위도): 해당 좌표의 지형 높이값을 반환.
		container: "divcontainer",	// div를 담을 Container 명칭 지정(명칭에 해당되는 div가 없다면 createHTMLObject 작업중 생성)
		canvas: Module.canvas,	// 화면 사이즈 설정을 위한 canvas 설정
		element: element,	// 엔진 오브젝트와 연동할 HTML Element
		verticalAlign: "middle",	// 수직 정렬 (top, middle, bottom, px 지원 )	|| 태그 미 설정 시 [Default top]
		horizontalAlign: "center",	// 수평 정렬 (left, center, right, px 지원 )	|| 태그 미 설정 시 [Default left]
	};

	if (layer.keyAtObject("div_object" + id) != null) { // 이미 생성된 오브젝트 삭제
		layer.removeAtKey("div_object" + id);
	}

	let object = Module.createHTMLObject("div_object" + id);	// 객체 식별을 위해 카카오 API에서 받아온 id 결합.
	let complet = object.createbyJson(parameter);
	
	if (complet.result == 1) {
		layer.addObject(object, 0);
		// element 태그에 해당되는 HTML Element에 UI Element 추가
		$(element).html(	// 마커 클릭했을 때 표출할 상세정보 html 태그 생성
			`<div class="detailWrap">
				<p style="font-size: 18px; font-weight: bold;">${p_name}</p>
				<p>${r_address}</p>
				<p style="color: #919191">(지번) ${address}</p>
				<p style="color: green">${phone}</p>
				<p>
					<a style="color: blue; border-bottom: none;" onclick="window.open('${url}')">상세보기</a>
					<span>∙</span>
					<a style="background-image: linear-gradient(to right, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5);
						background-clip: text; -webkit-background-clip: text; color: transparent;"
						onclick="window.open('https://www.instagram.com/explore/tags/${p_name.replace(/\s/gi, '')}/')">인스타그램
					</a>
				</p>
			</div>
			<div class="markerWrap">
				<img src="./assets/images/map/map_pin.png">
				<p style="font-size: 20px; font-weight: bold; text-shadow: 3px 3px 3px black";>${p_name}</p>
			</div>
			`
		).addClass('marker');	// element에 marker 클래스 부여.
	}
}
  
function setAltitude(value) {	// 고도 설정
	let camera = Module.getViewCamera();	// camera 객체 생성

	if(camera.getAltitude() + value < 1000) {	// 현재 고도에 500을 더하거나 뺀 값이 1000보다 작을 때 확대 버튼 비활성화.
		$('.incAltitude').attr("disabled", true);
	} else {
		$('.incAltitude').attr("disabled", false);
	}

	camera.setAltitude(camera.getAltitude() + value);	// 현재 고도에 500을 더하거나 뺀 값으로 고도 설정.
}

// 분석(거리, 면적, 고도)
var mouseFlag = "";

/* 마우스 상태 변경 */
function setMouseState(_type){
	if (_type == "move") {
		// 지도 이동 마우스 모드 변경
		Module.XDSetMouseState(Module.MML_MOVE_GRAB);
		mouseFlag = "";
		clearAnalysis();
	}
	else if (_type == "measure") {
		// 거리 측정 마우스 모드 변경
		Module.XDSetMouseState(Module.MML_ANALYS_DISTANCE_STRAIGHT);
		mouseFlag = "distance";
		clearAnalysis();
	} else if (_type == "measure1") {
		// 거리 측정 마우스 모드 변경
		Module.XDSetMouseState(Module.MML_ANALYS_AREA_PLANE);
		mouseFlag = "area";
		clearAnalysis();
	} else if (_type == "measure2") {
		// 거리 측정 마우스 모드 변경
		Module.XDSetMouseState(Module.MML_ANALYS_ALTITUDE);
		mouseFlag = "altitude";
		clearAnalysis();
	}
}

let m_mercount = 0;	// 측정 오브젝트 갯수
let m_objcount = 0;	// 측정 오브젝트를 표시하는 POI 갯수

/* callBackAddPoint에 지정된 함수 [마우스 왼쪽 클릭 시 이벤트 발생]*/
function addPoint(e) {
	if(mouseFlag == "distance") {
		// e 구성요소
		// dMidLon, dMidLat, dMidAlt : 이전 입력 된 지점과 현재 지점을 중점(경위 고도)
		// dLon, dLat, dAlt : 현재 입력 된 지점(경위 고도)
		// dDistance		: 현재 점과 이전 점과의 길이
		// dTotalDistance	: 모든 점과의 길이
		
		let partDistance = e.dDistance,
			totalDistance = e.dTotalDistance;
	
		if (partDistance == 0 && totalDistance == 0) {
			m_objcount = 0;	// POI 갯수 초기화
			createPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), "rgba(255, 204, 198, 0.8)", "Start", true);
		} else {
			if (e.dDistance > 0.01) {
				createPOI(new Module.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), "rgba(255, 255, 0, 0.8)", e.dDistance, false);
			}
			createPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), "rgba(255, 204, 198, 0.8)", e.dTotalDistance, true);
		}
	} else if(mouseFlag == "area") {
		// e 구성요소
		// dLon, dLat, dAlt : 면적 중심 좌표(경위 고도)
		// dArea			: 면적 크기	
		createAreaPOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), "rgba(255, 204, 198, 0.8)", e.dArea, true);
	}
}

/* callBackCompletePoint에 지정된 함수 [마우스 더블 클릭 시 이벤트 발생]*/
function endPoint(e) {
	Module.XDSetMouseState(Module.MML_MOVE_GRAB);
	viewListOBjKey(e);
	m_mercount++;
}

// =============================================== POI 생성 과정
/* 정보 표시 POI */
function createPOI(_position, _color, _value, _balloonType) {
	if(mouseFlag == "distance") {
		// 매개 변수
		// _position : POI 생성 위치
		// _color : drawIcon 구성 색상
		// _value : drawIcon 표시 되는 텍스트
		// _balloonType : drawIcon 표시 되는 모서리 옵션(true : 각진 모서리, false : 둥근 모서리)
	
		// POI 아이콘 이미지를 그릴 Canvas 생성
		var drawCanvas = document.createElement('canvas');
		// 캔버스 사이즈(이미지 사이즈)
		drawCanvas.width = 100;
		drawCanvas.height = 100;
	
		// 아이콘 이미지 데이터 반환
		let imageData = drawIcon(drawCanvas, _color, _value, _balloonType);
	
		let Symbol = Module.getSymbol();
	
		let layerList = new Module.JSLayerList(true);
		let layer = layerList.nameAtLayer("MEASURE_POI");
	
		poi = Module.createPoint(m_mercount + "_POI_" + m_objcount);
		poi.setPosition(_position);												// 위치 설정
		poi.setImage(imageData, drawCanvas.width, drawCanvas.height);			// 아이콘 설정
		layer.addObject(poi, 0);												// POI 레이어 등록
		m_objcount++;
	} else if(mouseFlag == "area") {
		// 매개 변수
		// _position : POI 생성 위치
		// _color : drawIcon 구성 색상
		// _value : drawIcon 표시 되는 텍스트
		// _balloonType : drawIcon 표시 되는 모서리 옵션(true : 각진 모서리, false : 둥근 모서리)
	
		// POI 아이콘 이미지를 그릴 Canvas 생성
		var drawCanvas = document.createElement('canvas');
		// 캔버스 사이즈(이미지 사이즈)
		drawCanvas.width = 100;
		drawCanvas.height = 100;
	
		// 아이콘 이미지 데이터 반환
		let imageData = drawIcon(drawCanvas, _color, _value, _balloonType);
	
		let Symbol = Module.getSymbol();
	
		let layerList = new Module.JSLayerList(true);
		let layer = layerList.nameAtLayer("MEASURE_POI");
	
		// POI가 존재 하면 삭제 후 생성
		let key = m_mercount + "_POI";
		layer.removeAtKey(key);
		
		// POI 생성 과정
		poi = Module.createPoint(m_mercount + "_POI");
		poi.setPosition(_position);												// 위치 설정
		poi.setImage(imageData, drawCanvas.width, drawCanvas.height);			// 아이콘 설정
		layer.addObject(poi, 0);												// POI 레이어 등록
	}
}

/* 아이콘 이미지 데이터 반환 */
function drawIcon(_canvas, _color, _value, _balloonType) {
	if(mouseFlag == "distance" || mouseFlag == "area") {
		// 컨텍스트 반환 및 배경 초기화
		var ctx = _canvas.getContext('2d'),
		width = _canvas.width,
		height = _canvas.height
		;
		ctx.clearRect(0, 0, width, height);
	
		// 배경 Draw Path 설정 후 텍스트 그리기
		if (_balloonType) {
			drawBalloon(ctx, height * 0.5, width, height, 5, height * 0.25, _color);
			setText(ctx, width * 0.5, height * 0.2, _value);
		} else {
			drawRoundRect(ctx, 0, height * 0.3, width, height * 0.25, 5, _color);
			setText(ctx, width * 0.5, height * 0.5, _value);
		}
		return ctx.getImageData(0, 0, _canvas.width, _canvas.height).data;
	} else if(mouseFlag == "altitude") {
		// 컨텍스트 반환 및 배경 초기화
		var ctx = _canvas.getContext('2d'),
		width = _canvas.width,
		height = _canvas.height
		;
		ctx.clearRect(0, 0, width, height);

		// 배경과 높이 값 텍스트 그리기
		if (_balloonType == -1) {
			drawRoundRect(ctx, 50, 20, 100, 20, 5, _color);		// 오브젝트 높이 값이 유효하지 않는 경우

		} else {
			drawRoundRect(ctx, 50, 5, 100, 35, 5, _color);		// 오브젝트 높이 값이 유효한 경우
			setText(ctx, width*0.5, height*0.2, '지면고도 : ' + setKilloUnit(_balloonType, 0.001, 0));
		}
		setText(ctx, width*0.5, height*0.2+15, '해발고도 : '+ setKilloUnit(_value, 0.001, 0));

		// 위치 표시 점 그리기
		drawDot(ctx, width, height);

		return ctx.getImageData(0, 0, _canvas.width, _canvas.height).data;
	}
}

/* 말풍선 배경 그리기 */
function drawBalloon(ctx,
	marginBottom, width, height,
	barWidth, barHeight,
	color) {

	var wCenter = width * 0.5,
		hCenter = height * 0.5;

	// 말풍선 형태의 Draw Path 설정
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(0, height - barHeight - marginBottom);
	ctx.lineTo(wCenter - barWidth, height - barHeight - marginBottom);
	ctx.lineTo(wCenter, height - marginBottom);
	ctx.lineTo(wCenter + barWidth, height - barHeight - marginBottom);
	ctx.lineTo(width, height - barHeight - marginBottom);
	ctx.lineTo(width, 0);
	ctx.closePath();

	// 말풍선 그리기
	ctx.fillStyle = color;
	ctx.fill();
}

/* 둥근 사각형 배경 그리기 */
function drawRoundRect(ctx,
	x, y,
	width, height, radius,
	color) {

	if (width < 2 * radius) radius = width * 0.5;
	if (height < 2 * radius) radius = height * 0.5;

	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + width, y, x + width, y + height, radius);
	ctx.arcTo(x + width, y + height, x, y + height, radius);
	ctx.arcTo(x, y + height, x, y, radius);
	ctx.arcTo(x, y, x + width, y, radius);
	ctx.closePath();

	// 사각형 그리기
	ctx.fillStyle = color;
	ctx.fill();

	return ctx;
}

/* 텍스트 그리기 */
function setText(_ctx, _posX, _posY, _value) {
	if(mouseFlag == "distance") {
		var strText = "";
	
		// 텍스트 문자열 설정
		if (typeof _value == 'number') {
			strText = setKilloUnit(_value, 0.001, 0);
		} else {
			strText = _value;
		}
	
		// 텍스트 스타일 설정
		_ctx.font = "bold 16px sans-serif";
		_ctx.textAlign = "center";
		_ctx.fillStyle = "rgb(0, 0, 0)";
	
		// 텍스트 그리기
		_ctx.fillText(strText, _posX, _posY);
	} else if(mouseFlag == "area") {
		var strText = "";

		// 텍스트 문자열 설정
		var strText = setTextComma(_value.toFixed(2)) + '㎡';

		// 텍스트 스타일 설정
		_ctx.font = "bold 16px sans-serif";
		_ctx.textAlign = "center";
		_ctx.fillStyle = "rgb(0, 0, 0)";

		// 텍스트 그리기
		_ctx.fillText(strText, _posX, _posY);
	} else if(mouseFlag == "altitude") {
		_ctx.font = "bold 12px sans-serif";
		_ctx.textAlign = "center";

		_ctx.fillStyle = "rgb(255, 255, 255)";
		_ctx.fillText(_value, _posX, _posY);
	}
}

/* m/km 텍스트 변환 */
function setKilloUnit(_text, _meterToKilloRate, _decimalSize) {

	if (_decimalSize < 0) {
		_decimalSize = 0;
	}
	if (typeof _text == "number") {
		if (_text < 1.0 / (_meterToKilloRate * Math.pow(10, _decimalSize))) {
			_text = _text.toFixed(1).toString() + 'm';
		} else {
			_text = (_text * _meterToKilloRate).toFixed(2).toString() + '㎞';
		}
	}
	return _text;
}

//=============================================== 측정 목록 및 삭제 관련
function viewListOBjKey(_key) {
	let cell = document.getElementById("objList");
	let li = document.createElement('li');
	
	// 측정 객체 리스트 추가( ui )
	li.id = _key
	li.innerHTML = "<a href='#' onclick=\"deleteObject('" + _key + "');\">" + _key + "</a>"
	cell.appendChild(li);
}

function deleteObject(_key) {
	Module.XDClearDistanceObject(_key);
	Module.XDClearAreaObject(_key);
	let li = document.getElementById(_key);
	li.remove();										// 선택 <a> 컨트롤러 삭제

	// 오브젝트 삭제
	let layerList = new Module.JSLayerList(true);
	let layer = layerList.nameAtLayer("MEASURE_POI");
	let list = layer.getObjectKeyList();

	let key = _key.replace(/[^0-9]/g, '') + "_POI_";	// [생성순서]_POI_ 형태로 객체 생성
	let strlist = list.split(",");
	strlist.forEach((item, index) => {
		if (item.indexOf(key) !== -1) {
			layer.removeAtKey(item)						// 키값으로 레이어에 들어간 오브젝트 삭제
		}
	});
	// 화면 재 갱신
	Module.XDRenderData();
}

/* 분석 내용 초기화 */
function clearAnalysis() {
	if(mouseFlag == altitude) {
		var layer1 = GLOBAL.Layer,
		symbol = GLOBAL.Symbol;
		if (layer1 == null) {
			return;
		}
	
		// 등록된 아이콘 리스트 삭제
		var i, len, icon, poi;
		for (i=0, len=layer1.getObjectCount(); i<len; i++) {
	
			poi = layer1.keyAtObject("POI"+i);
			icon = poi.getIcon();
	
		// 아이콘을 참조 중인 POI 삭제
		layer1.removeAtKey("POI"+i);
	
		// 아이콘을 심볼에서 삭제
		symbol.deleteIcon(icon.getId());
		}
	} else {
		// POI, Icon 키 지정 인덱스 초기화
		GLOBAL.nIndex = 0;
		// 실행 중인 분석 내용 초기화
		Module.XDClearDistanceMeasurement();
		Module.XDClearAreaMeasurement();
		m_mercount = 0;
		
		// 레이어 삭제
		let layerList = new Module.JSLayerList(true);
		let layer = layerList.nameAtLayer("MEASURE_POI");
		layer.removeAll();
		
		// <ui> 모든 노드 삭제
		let cell = document.getElementById("objList");
		while ( cell.hasChildNodes() ) { 
			cell.removeChild( cell.firstChild ); 
		}
	}
}

// 면적 측정
//=============================================== POI 생성 과정
/* 정보 표시 POI */
function createAreaPOI(_position, _color, _value, _balloonType) {
	// 매개 변수
	// _position : POI 생성 위치
	// _color : drawIcon 구성 색상
	// _value : drawIcon 표시 되는 텍스트
	// _balloonType : drawIcon 표시 되는 모서리 옵션(true : 각진 모서리, false : 둥근 모서리)

	// POI 아이콘 이미지를 그릴 Canvas 생성
	var drawCanvas = document.createElement('canvas');
	// 캔버스 사이즈(이미지 사이즈)
	drawCanvas.width = 100;
	drawCanvas.height = 100;

	// 아이콘 이미지 데이터 반환
	let imageData = drawIcon(drawCanvas, _color, _value, _balloonType);

	let Symbol = Module.getSymbol();

	let layerList = new Module.JSLayerList(true);
	let layer = layerList.nameAtLayer("MEASURE_POI");

	// POI가 존재 하면 삭제 후 생성
	let key = m_mercount + "_POI";
	layer.removeAtKey(key);
	
	// POI 생성 과정
	poi = Module.createPoint(m_mercount + "_POI");
	poi.setPosition(_position);												// 위치 설정
	poi.setImage(imageData, drawCanvas.width, drawCanvas.height);			// 아이콘 설정
	layer.addObject(poi, 0);												// POI 레이어 등록
}

/* 단위 표현 */
function setTextComma(str) {
	str = String(str);
	return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

// 고도 측정/* 이벤트 설정 */
function initEvent(canvas) {
    // 거리측정 이벤트 설정
    canvas.addEventListener("Fire_EventAddAltitudePoint", function(e){
        createAltitudePOI(new Module.JSVector3D(e.dLon, e.dLat, e.dAlt), "rgba(10, 10, 0, 0.5)", e.dGroundAltitude, e.dObjectAltitude);
    });
}

/* 분석 내용 출력 POI 생성 */
function createAltitudePOI(_position, _color, _value, _subValue) {

    // POI 아이콘 이미지를 그릴 Canvas 생성
    var drawCanvas = document.createElement('canvas');
    drawCanvas.width = 200;
    drawCanvas.height = 100;

    // 아이콘 이미지 데이터 반환
    var imageData = drawIcon(drawCanvas, _color, _value, _subValue), nIndex = GLOBAL.nIndex;

    // 심볼에 아이콘 이미지 등록
    if (GLOBAL.Symbol.insertIcon("Icon"+nIndex, imageData, drawCanvas.width, drawCanvas.height)) {

        // 등록한 아이콘 객체 반환
        var icon = GLOBAL.Symbol.getIcon("Icon"+nIndex);

        // JSPoint 객체 생성
        var count = GLOBAL.Layer.getObjectCount(),
		poi = Module.createPoint("POI"+nIndex)
            ;

        poi.setPosition(_position); // 위치 설정
        poi.setIcon(icon); // 아이콘 설정

        // 레이어에 오브젝트 추가
        GLOBAL.Layer.addObject(poi, 0);

        // 인덱스 값 상승
        GLOBAL.nIndex++;
    }
}

/* 위치 표시 점 그리기 */
function drawDot(ctx, width, height) {

	ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.arc(width*0.5, height*0.5, 2, 0, 2*Math.PI, false);
	ctx.closePath();

	ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
	ctx.fill();
	ctx.lineWidth = 8;
	ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
	ctx.stroke();
}
