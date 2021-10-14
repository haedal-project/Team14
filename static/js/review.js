function clickPlaceMarker(_title, _address, _lat, _lng) {
    $.ajax({
        type: "GET",
        url: `/api/place?title=${_title}`,
        data: {},
        success: function (response) {
            let place_info = response['place-info']

            $('#info-place-name').text(_title)
            $('#info-place-address').text(_address)
            $('#info-place-rating').text(`${place_info['rating']} 점 / 5.0 점`)
            $('#info-place-review-count').text(`리뷰 ${place_info['review_count']}건`)
            $('#info-place-enter-amount').text(`리뷰어 ${place_info['enter_amount']}%가 이 가게에 출입함`)


            $('#info-place-lat').val(_lat)
            $('#info-place-lng').val(_lng)

            $('#place-info').show();
            $('#place-list').hide();

            showReview();
        }
    })
}


function showReview() {
    $('#place-review-info').show();
    $('#place-photo-info').hide();
}

function showPhoto() {
    $('#place-review-info').hide();
    $('#place-photo-info').show();
}

function registerReview() {
    let _enter_with_check = $('#enter-with-check').is(':checked')
    let _rating = $("#review-rating-radio option:selected").val()
    let _review_content = $('#review-content').val()
    let _lat = $('#info-place-lat').val();
    let _lng = $('#info-place-lng').val();
    let _user_id = 'manijang2'
    let _title = $('#info-place-name').text()
    let _address = $('#info-place-address').text()

    $.ajax({
        type: "POST",
        url: `/api/review`,
        data: {
            user_id: _user_id,
            enter_with_check: _enter_with_check,
            rating: _rating,
            review: _review_content,
            lat: _lat,
            lng: _lng,
            title: _title,
            address: _address
        },
        success: function (response) {
            console.dir(response)
            alert(response['msg'])
            window.location.reload() // 새로고침
        }
    })

}


function search_place() {
    $("#hello").hide() // 추천목록 숨기기
}