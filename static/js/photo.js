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
    sel_files = []
    $(".images").empty()

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
function addFiles() {
            $("#upload").append("<input type='file' name='file'>");
        }

function uploadphoto() {

    let form_data = new FormData()

    let lat = $('#click-place-lat').val();
    let lng = $('#click-place-lng').val();

    for (let i=0; i<sel_files.length; i++) {
        form_data.append("file_give", sel_files[i])
    }
        form_data.append("lat_give", lat)
        form_data.append("lng_give", lng)

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

function  submitAction(){
    let data = new FormData();

    for (let i=0,len=sel_files.length; i<len; i++){
        let name = "image_"+i;
        data.append(name,sel_files[i]);
    }
    data.append("image_count", sel_files.length);

    let xhr = new XMLHttpRequest();
    xhr.open("POST","./")
}
