
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

                let temp_html = `
                            <a href="#" class="list-group-item list-group-item-action flex-column align-items-start" style="margin: 10px;">
                                <div class="d-flex w-100 justify-content-between">
                          <h5 class="mb-1">${name}<small class="text-muted"></small></h5> <!-- 안에 평점 -->
                                    <span><button type="button" onclick="plus('${name}')" id="like_button" class="btn btn-danger" >♡</button> + ${like}</span>
                                </div>
                            </a>`
                // 마커를 표시할 위치와 title 객체 배열입니다
                $("#hello").append(temp_html)

                // 추천마커 이미지의 이미지 주소입니다
                let imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

                // 마커 이미지의 이미지 크기 입니다
                let imageSize = new kakao.maps.Size(24, 35);

                // 마커 이미지를 생성합니다
                let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

                // 마커를 생성합니다
                let marker = new kakao.maps.Marker({
                    map: map, // 마커를 표시할 지도
                    position: new kakao.maps.LatLng(x, y),// 마커를 표시할 위치
                    title : name, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
                    image : markerImage // 마커 이미지
                });

            }
        }
    });
}


function plus(name) { //이름을 받는 함수
    $.ajax({ //like값을 올리기
        type: 'POST',
        url: '/api/like_button',
        data: {name_give: name}, // 이름을 건네준다.
        success: function (response) {
            alert(response['msg']);
            window.location.reload() // 새로고침
        }
    });
}