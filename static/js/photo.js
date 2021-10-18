let sel_files = [];

$(document).ready(function () {
    click_map();
    get_photos();
    $("#file").on("change", handleImgsFilesSelect);
    $("#photo-file-input").on("change", handleImgsFilesSelect2);
})

// 지도 클릭 이벤트
function click_map() {
    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
        infowindow.close();
        removeMarker2();
    });

    kakao.maps.event.addListener(map, 'rightclick', function(mouseEvent) {
        removeMarker2();
        $('#post_photo').empty()

        // 클릭한 위도, 경도 정보를 가져옵니다
        let latlng = mouseEvent.latLng;

        let imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

        // 마커 이미지의 이미지 크기 입니다
        let imageSize = new kakao.maps.Size(24, 35);

        // 마커 이미지를 생성합니다
        let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

        // 마커를 생성합니다
        let marker2 = new kakao.maps.Marker({
            map: map, // 마커를 표시할 지도
            position: new kakao.maps.LatLng(latlng.getLat(),latlng.getLng()),// 마커를 표시할 위치
            image : markerImage // 마커 이미지
        });

        marker2.setMap(map);
        clickMarker.push(marker2);

        let content = '<div style=";z-index:1;" id="info_box">'+ '<button class="btn btn-primary" style="margin: 0 0 0 0;" onclick="upload_menue()">사진 등록</button>'+'</div>';

        infowindow.setContent(content);
        infowindow.open(map,marker2);
        map.panTo(latlng);

        //위도 경도 값 저장
        $('#click-place-lat').val(latlng.getLat());
        $('#click-place-lng').val(latlng.getLng());
    });

}

function upload_menue(){
    $('#place-info').hide();
    $('#place-list').hide();
    $('#photo-place-test').show();
}

//선택 이미지 미리보기
function handleImgsFilesSelect(e){
    sel_files = [];
    $(".images").empty();

    let files = e.target.files;
    let filesArr = Array.prototype.slice.call(files);

    let index = 0;
    filesArr.forEach(function (f){
        if(!f.type.match("image.*")) {
            alert("확장자는 이미지 확장자만 가능합니다.")
            return;
        }
        sel_files.push(f);

        let reader = new FileReader();
        reader.onload = function(e){
            let html = "<a href=\"javascript:void(0);\" onclick=\"deleteImageAction("+index+")\" id=\"img_id_"+index+"\">" +
                            "<span class=\"image-card\">" +
                                "<img src=\""+e.target.result + "\" data-file='"+f.name+"' class='sleProductFile' title='Click to remove'>" +
                                "<button class=\"delete-box\" onclick=\"deleteImageAction("+index+")\"><a>삭제</a></button>\n" +
                            "</span>";
            $(".images").append(html);
            index++;
        }
        reader.readAsDataURL(f);
    })
}

// 미리보기 이미지 클릭 시 삭제
function deleteImageAction(index){
    sel_files.splice(index,1);
    let img_id = "#img_id_"+ index;
    $(img_id).remove();
}

// 사진 업로드 버튼 클릭시 db에 lat, lng, files 값을 저장
function uploadphoto() {
    let form_data = new FormData();

    let lat = $('#click-place-lat').val();
    let lng = $('#click-place-lng').val();

    for (let i=0; i<sel_files.length; i++) {
        form_data.append("file_give", sel_files[i])
    }
        form_data.append("lat_give", lat)
        form_data.append("lng_give", lng)

    make_latlng_Marker(lat, lng)

    $.ajax({
        type: "POST",
        url: "/api/photo",
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            alert(response["msg"])
            window.location.reload()
        }
    });
}

function get_photos() {
    $.ajax({
        type: "GET",
        url: "/api/photo",
        data: {},
        success: function (response) {
            let photo = response['all_latlng']
            for (let i=0; i < photo.length; i++) {
                let lat = photo[i]['lat']
                let lng = photo[i]['lng']
                make_latlng_Marker(lat, lng)
            }
        }
    })
}

// 마커 그려주기 & 마커 클릭시 해당 좌표에 저장된 이미지 업로드
function make_latlng_Marker(lat, lng){
    // 추천마커 이미지의 이미지 주소입니다
    let imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

    // 마커 이미지의 이미지 크기 입니다
    let imageSize = new kakao.maps.Size(24, 35);

    // 마커 이미지를 생성합니다
    let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

    // 마커를 생성합니다
    let marker3 = new kakao.maps.Marker({
        map: map, // 마커를 표시할 지도
        position: new kakao.maps.LatLng(lat, lng),// 마커를 표시할 위치
        image: markerImage, // 마커 이미지
        clickable: true
    });
    // 마커 맵에 그려주기
    marker3.setMap(map);

    //마커 클릭시 해당 좌표값을 비교하여 사진 가져오기
    kakao.maps.event.addListener( marker3, 'click', function() {
        $('#photo-place-test').show();
        $('#place-list').hide();

        $.ajax({
            type: "GET",
            url: `/api/photo/latlng?lat=${lat}&lng=${lng}`,
            data: {},
            success: function (response) {
                $('#post_photo').empty()
                let photo = response['latlng_photos']
                for (let i=0; i < photo.length; i++) {
                    let file = photo[i]['file']
                    let temp_html = `<a style="cursor: pointer; "data-toggle="modal" data-target="#exampleModalLong" onclick="changeModelPhoto('../static/photos/${file}')">
                                                <span class="image-card"><img src="../static/photos/${file}"></span>
                                            </a>`

                    $('#post_photo').append(temp_html)
                }
            }
        });
    });
}
