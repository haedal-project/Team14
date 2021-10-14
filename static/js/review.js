

function clickPlaceMarker(title, lat, lng, address) {

    $('#info-place-name').text(title)
    $('#info-place-address').text(address)
    $('#info-place-lng').val(lng)
    $('#info-place-lat').val(lat)

    $('#place-info').show();
    $('#place-list').hide();



    showReview();
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
                let review = reviews[i]['review']
                let temp_html = `<li class="list-group-item">${review}</li>`
                $('#review-box').append(temp_html)
            }
        }
    })
}

function search_place(){
     $("#hello").hide() // 추천목록 숨기기
}