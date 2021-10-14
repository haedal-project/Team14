// 마커를 담을 배열입니다
var markers = [];
var count=0;

var mapContainer = document.getElementById('map'), // 지도를 표시할 div
    mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
        level: 3 // 지도의 확대 레벨
    };

// 지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places();

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({zIndex: 1});


if (count == 1){
    searchPlaces();
}

// 키워드 검색을 요청하는 함수입니다
function searchPlaces() {
    var keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        // 키워드로 장소를 검색합니다
        alert('키워드를 입력해주세요!');
        return false;
    }
    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    ps.keywordSearch(keyword, placesSearchCB);
}

// 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        count = 1
        // 정상적으로 검색이 완료됐으면
        // 검색 목록과 마커를 표출합니다
        displayPlaces(data);

        // 페이지 번호를 표출합니다
        displayPagination(pagination);

    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {

        alert('검색 결과가 존재하지 않습니다.');
        return;

    } else if (status === kakao.maps.services.Status.ERROR) {

        alert('검색 결과 중 오류가 발생했습니다.');
        return;
    }
}

// 검색 결과 목록과 마커를 표출하는 함수입니다
function displayPlaces(places) {
    var listEl = document.getElementById('placesList'),
        menuEl = document.getElementById('menu_wrap'),
        fragment = document.createDocumentFragment(),
        bounds = new kakao.maps.LatLngBounds(),
        listStr = '';

    // 검색 결과 목록에 추가된 항목들을 제거합니다
    removeAllChildNods(listEl);

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();

    let positions = []
    let addresses = []
    let lat = []
    let lng = []

    for (var i = 0; i < places.length; i++) {
        // 마커를 생성하고 지도에 표시합니다
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
            marker = addMarker(placePosition, i),
            itemEl = getListItem(i, places[i]), // 검색 결과 항목 Element를 생성합니다
            address = places[i].address_name;

        lat.push(places[i].y);
        lng.push(places[i].x)
        addresses.push(address);
        positions.push(placePosition);

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        bounds.extend(placePosition);

        // 마커와 검색결과 항목에 mouseover 했을때
        // 해당 장소에 인포윈도우에 장소명을 표시합니다
        // mouseout 했을 때는 인포윈도우를 닫습니다
        (function (marker, title) {
            var num = markers.indexOf(marker)

            kakao.maps.event.addListener(marker, 'mouseover', function () {
                //var content = '<div style=";z-index:1;" id="info_box">' + title + '(평점:)<br>주소 '+addresses[num] +' </div>'; (수정 전 평점 지우기)
                var content = '<div style=";z-index:1;" id="info_box">' + title + '<br>주소 '+ addresses[num] +' </div>';


                // var content = '<div style="padding:5px;z-index:1;max-width:1200px">' + title + '(평점:)<br>주소 '+addresses[num] +' </div>';
                infowindow.setContent(content);
                infowindow.open(map, marker);
                // displayInfowindow(marker, title);
            });

            kakao.maps.event.addListener(marker, 'mouseout', function () {
                infowindow.close();
            });

            kakao.maps.event.addListener(marker, 'click', function() {
                map.setLevel(level = 2);
                map.setCenter(positions[num]);

                // 지도를 찍었을 때
                clickPlaceMarker(title, lat[num], lng[num], addresses[num])
            });

            itemEl.onmouseover = function () {
                //var content = '<div style="padding:5px;z-index:1;">' + title + '<br>평점 <br>주소 '+addresses[num] +' </div>'; 수정 전 평점 지우기
                var content = '<div style="padding:5px;z-index:1;" id="info_box">' + title + '<br>주소 '+addresses[num] +' </div>';
                map.setLevel(level = 4);
                map.panTo(positions[num]);
                infowindow.setContent(content);
                infowindow.open(map, marker);
            };

            itemEl.onclick = function () {
                map.setLevel(level = 2);
                map.setCenter(positions[num]);

                // 검색된 장소를 찍었을 때
                clickPlaceMarker(title, lat[num], lng[num], addresses[num])
            };
            itemEl.onmouseout = function () {
                infowindow.close();
            };
        })(marker, places[i].place_name);

        fragment.appendChild(itemEl);
    }
    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    map.setBounds(bounds);

    // 검색결과 항목들을 검색결과 목록 Elemnet에 추가합니다
    listEl.appendChild(fragment);
    // menuEl.scrollTop = 0; --?????

    $('#place-info').hide();
    $('#place-list').show();

}

function getListItem(index, places) {
    var el = document.createElement('a'),
        itemStr = '<a href="#" class="list-group-item list-group-item-action flex-column align-items-start"\n' +
            'style="margin: 10px;">\n' +
            '<div class="d-flex w-100 justify-content-between">\n' +
            '<h5 class="mb-1">' + places.place_name + '</h5>\n' +
            // '<small class="text-muted">평점(4.5점)</small>\n' +
            '<small class="text-muted"></small>\n' +
            '</div>';
    if (places.road_address_name) {
        itemStr += '    <span>' + places.road_address_name + '</span>' +
            '   <span class="mb-1">' + places.address_name + '</span>';
    } else {
        itemStr += '    <span>' + places.address_name + '</span>';
    }
    itemStr += '  <span class="tel">' + places.phone + '</span>' +
        '</a>';

    el.innerHTML = itemStr;
    el.className = 'item';

    return el;
}
// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(position, idx, title) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
        imageSize = new kakao.maps.Size(36, 37),  // 마커 이미지의 크기
        imgOptions = {
            spriteSize: new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin: new kakao.maps.Point(0, (idx * 46) + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
        marker = new kakao.maps.Marker({
            position: position, // 마커의 위치
            image: markerImage,
        });

    marker.setMap(map); // 지도 위에 마커를 표출합니다
    markers.push(marker);  // 배열에 생성된 마커를 추가합니다

    return marker;
}
// 지도 위에 표시되고 있는 마커를 모두 제거합니다
function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}
// 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i;
    // 기존에 추가된 페이지번호를 삭제합니다
    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild(paginationEl.lastChild);
    }

    for (i = 1; i <= pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;

        if (i === pagination.current) {
            el.className = 'on';
        } else {
            el.onclick = (function (i) {
                return function () {
                    pagination.gotoPage(i);
                }
            })(i);
        }
        fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
}

// 검색결과 목록의 자식 Element를 제거하는 함수입니다
function removeAllChildNods(el) {
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}


function showbest() {
    $.ajax({
        type: 'GET',
        url: '/api/recommend?sample_give=샘플데이터',
        data: {},
        success: function (response) {
            let store = response['like'] //서버에서 적힌거
            for (let i=0; i < store.length; i++){
                // db에서 받아올 것들
                let name = store[i]["title"]
                let x = store[i]["x"]
                let y = store[i]["y"]
                let like = store[i]["like"]

                let temp_html = `<a href="#" class="list-group-item list-group-item-action flex-column align-items-start" style="margin: 10px;">
                                <div class="d-flex w-100 justify-content-between">
                          <h5 class="mb-1">${name}<small class="text-muted"></small></h5> <!-- 안에 평점 -->
                                    <span><button type="button" onclick="modal('${name}')" id="like_button" class="btn btn-danger" >❤</button> + ${like}</span>
                                </div>
                            </a>
                    `
                // 마커를 표시할 위치와 title 객체 배열입니다
                $("#hello").append(temp_html)

                // 추천마커 이미지의 이미지 주소입니다
                var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

                // 마커 이미지의 이미지 크기 입니다
                var imageSize = new kakao.maps.Size(24, 35);

                // 마커 이미지를 생성합니다
                var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

                // 마커를 생성합니다
                var marker = new kakao.maps.Marker({
                    map: map, // 마커를 표시할 지도
                    position: new kakao.maps.LatLng(x, y),// 마커를 표시할 위치
                    title : name, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
                    image : markerImage // 마커 이미지
                });

            }
        }
    });
}



function modal(name) {
    alert(name + "에 좋아요를 하실려면 로그인 해주세요");
    $('#articleModal').modal('show');
}


function loginpage() {
    let id = $("#idinput").val()
    //window.location.href = "/login?id_give=${id}"
    window.location.href = "/login"
    $.ajax({
        type: 'POST',
        url: '/api/login',
        data: {id_give: id},
        success: function (response) {
            alert(id+"로"+response['msg']);
        }
    });

}


function clickPlaceMarker(title, lat, lng, address) {
    $('#info-place-name').text(title)
    $('#info-place-address').text(address)
    $('#info-place-lng').val(lng)
    $('#info-place-lat').val(lat)

    $('#place-info').show();
    $('#place-list').hide();

    showReview();
}

function makeReview() {
    // let name = $('#name').val()
    let name = $('#info-place-name').text()
    let review = $('#review').val()
    let lng = $('#info-place-lng').val()
    let lat = $('#info-place-lat').val()
    // let rating = $('#rating').val()
    let like = 0

    $.ajax({
        type: "POST",
        url: "/placereview",
        data: {name_give: name, review_give: review, rating_give: like, 'lat_give': lat, 'lng_give': lng},
        success: function (response) {
            alert(response["msg"]);
            window.location.reload();
        }
    })
}

function showReview() {
    let name = $('#info-place-name').text()
    $('#review-box').empty();
    $.ajax({
        type: "GET",
        url: `/placereview?name=${name}`,
        data: {},
        success: function (response) {
            let reviews = response['all_reviews']
            for (let i = 0; i < reviews.length; i++) {
                // let name = reviews[i]['name']
                let review = reviews[i]['review']
                // let rating = reviews[i]['rating']

                let temp_html = `<li class="list-group-item">${review}</li>`
                $('#review-box').append(temp_html)

                /*
                * */
            }
        }
    })
}

function search_place(){
     $("#hello").hide() // 추천목록 숨기기
}