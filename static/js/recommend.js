///// ############ recommend.js는 전부 수정 했습니다 !!! ###########
let id = "test1" //////////// 기본 id 값을 test1으로 설정
num = 0

function ec() {
    if (num == 0) {
        $("#check_button").empty()
        $("#check_button").append("전체 추천 장소 띄우기")
        withshowbest()
        $("#hello").empty()
        num = num + 1
    } else {
        $("#hello").empty()
        $("#check_button").empty()
        $("#check_button").append("반려동물 입장 가능 장소만 보기")
        num = num - 1
        showbest()
    }
}

function like_button() {
    $.ajax({
        type: 'GET',
        url: '/api/place',
        data: {},
        success: function (response) {
            place = response["place-info"]
            count = place["like_count"]
            if (num == 0) {
                let temp = ``
                temp = `<button type="button" style="float: right;" id="like_button" class="btn btn-danger" onclick="like_button()">ෆ+${count}</button>`
                num = num + 1
            } else {
                temp = `<button type="button" style="float: right;" id="like_button" class="btn btn-danger" onclick="like_button()">ෆ+${count}</button>`
                num = num - 1
            }
            $("#reviewlike").append(temp)
        }
    })
}


function withshowbest() { 
    $.ajax({
        type: 'GET',
        url: 'api/login/recommend',
        data: {id_give: id},
        success: function (response) {
            let places = response['places']
            let login = response['login_like']
            let none_star = response["none_star"]
            for (let i = 0; i < places.length; i++) {
                let name = places[i]["title"]
                let x = parseFloat(places[i]["lat"][i + 1])
                let y = parseFloat(places[i]["lng"][i + 1])
                let like_count = places[i]["like_count"]
                let percent = places[i]["percent"]
                let like = ""
                try {
                    like = login[i]
                } catch {
                    like = none_star;
                }
                let temp_html = ``
                if (parseInt(percent) >= 50) {
                    if (like == "True") {
                        temp_html = `<div onclick="bestPosition(x,y)" class="list-group-item list-group-item-action flex-column align-items-start" style="margin: 10px; cursor:pointer;">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h5 class="mb-1">${name}<small class="text-muted"></small></h5> 
                                            <span><button type="button" onclick="plus('${name}')" id="like_button_red" class="btn btn-danger" >❤</button> + ${like_count}</span>
                                        </div>
                                    </div>`
                    } else {
                        temp_html = `<div onclick="bestPosition(x,y)" class="list-group-item list-group-item-action flex-column align-items-start" style="margin: 10px; cursor:pointer;">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h5 class="mb-1">${name}<small class="text-muted"></small></h5> 
                                            <span><button type="button" onclick="plus('${name}')" id="like_button_white" class="btn btn-danger" >ෆ</button> + ${like_count}</span>
                                        </div>
                                    </div>`
                    }
                }
                
                $("#hello").append(temp_html)

                let imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
                let imageSize = new kakao.maps.Size(24, 35);
                let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
                getAddr(x, y);
                function getAddr(x, y) {
                    let geocoder = new kakao.maps.services.Geocoder();
                    let coord = new kakao.maps.LatLng(x, y);
                    let callback = function (result, status) {

                        if (status === kakao.maps.services.Status.OK) {
                            console.log(result[0]["road_address"]["address_name"]);
                            let address = result[0]["road_address"]["address_name"]
                            
                            let marker = new kakao.maps.Marker({
                                map: map, 
                                position: new kakao.maps.LatLng(x, y),
                                title: `${name} \n${address}`, 
                                image: markerImage 
                            });
                        }

                    };
                    geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
                }
            }
        }
    });
}

function showbest() {
    $.ajax({
        type: 'GET',
        url: '/api/login/recommend',
        data: {id_give: id},
        success: function (response) {
            let store = response['places']
            let login = response['login_like']
            let none_star = response["none_star"]
            for (let i = 0; i < store.length; i++) {
                let name = store[i]["title"]
                let x = parseFloat(store[i]["lat"])
                let y = parseFloat(store[i]["lng"])
                let like_count = store[i]["like_count"]
                let like = ""
                let temp_html = ``
                try {
                    like = login[i]["like"]
                } catch {
                    like = none_star;
                }
                console.log(like)
                if (like == "True") {
                    temp_html = `<div onclick="bestPosition(x,y)" class="list-group-item list-group-item-action flex-column align-items-start" style="margin: 10px; cursor:pointer;">
                                     <div class="d-flex w-100 justify-content-between">
                                         <h5 class="mb-1">${name}<small class="text-muted"></small></h5> 
                                         <span><button type="button" onclick="plus('${name}')" id="like_button_red" class="btn btn-danger" >❤</button> + ${like_count}</span>
                                     </div>
                                 </div>`
                } else {
                    temp_html = `<div onclick="bestPosition(x,y)" class="list-group-item list-group-item-action flex-column align-items-start" style="margin: 10px; cursor:pointer;">
                                    <div class="d-flex w-100 justify-content-between">
                                         <h5 class="mb-1">${name}<small class="text-muted"></small></h5> 
                                         <span><button type="button" onclick="plus('${name}')" id="like_button_white" class="btn btn-danger" >ෆ</button> + ${like_count}</span>
                                    </div>
                                 </div>`
                }onclick="bestPosition(x,y)"
                $("#hello").append(temp_html)
                let imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
                let imageSize = new kakao.maps.Size(24, 35);
                let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

                getAddr(x, y);

                function getAddr(x, y) {

                    let geocoder = new kakao.maps.services.Geocoder();
                    let coord = new kakao.maps.LatLng(x, y);
                    let callback = function (result, status) {

                        if (status === kakao.maps.services.Status.OK) {
                            console.log(result[0]["road_address"]["address_name"]);
                            let address = result[0]["road_address"]["address_name"]
                            
                            let marker = new kakao.maps.Marker({
                                map: map, 
                                position: new kakao.maps.LatLng(x, y),
                                title: `${name} \n${address}`,
                                image: markerImage 
                            });
                        }
                    };
                    geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
                }
            }
        }
    });
}


function plus(name) { 
    if (id == "test1") {
        alert("로그인 후 이용해 주세요")
        window.location.href = "/login"
    } else {
        $.ajax({
            type: 'POST',
            url: '/api/like_button',
            data: {name_give: name},
            success: function (response) {
                alert(response['msg']);
                window.location.reload() 
            }
        });
    }
}

function bestPosition(x,y){
    alert("99999 동작 중")
    let position = new kakao.maps.LatLng(x, y)
    map.setLevel(level = 5);
    map.panTo(position);
}
