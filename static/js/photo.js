let sel_files = [];


$(document).ready(function () {
    $("#file").on("change", handleImgsFilesSelect);
})


function upload_menue(){
    $('#place-list').hide();
    $('#photo-place-test').show();
}


function clickPlace(lat, lng){
    $('#click-place-lat').val(lat);
    $('#click-place-lng').val(lng);
}


function fileUploadAction(){
    console.log("fileUploadAction");
    $("#file").trigger('click');
}


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
            let html = "<a href=\"javascript:void(0);\" onclick=\"deleteImageAction("+index+")\" id=\"img_id_"+index+"\"><span class=\"image-card\"><img src=\""+e.target.result + "\" data-file='"+f.name+"' class='sleProductFile' title='Click to remove'></span>";
            $(".images").append(html);
            index++;

            // let img_html = "<span class=\"image-card\"><img src=\""+e.target.result + "\"/></span>";
            // $(".images").append(img_html);
        }
        reader.readAsDataURL(f);
    })
}

function deleteImageAction(index){
    sel_files.splice(index,1);
    let img_id = "#img_id_"+ index;
    $(img_id).remove();

}

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
            let photo = response['all_photos']
            for (let i=0; i < photo.length; i++) {
                let lat = photo[i]['lat']
                let lng = photo[i]['lng']
                let file = photo[i]['file']
                let temp_html = `<span class="image-card"><img src="../static/photos/${file}"></span>`
                $('#post_photo').append(temp_html)

            }
        }
    })
}

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
        title: name, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
        image: markerImage // 마커 이미지
    });
    clickMarker.push(marker3);
}
