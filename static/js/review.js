function clickPlaceMarker(_title, _address) {

    let _id = "12132121"
    let user_id = "manijang2"

    console.log('clickPlaceMarker()', _title, _address)

    $.ajax({
        type: "GET",
        url: `/api/place?id=${_id}&user_id=${user_id}`,
        data: {},
        success: function (response) {

            let place_info = response['place-info']

            console.dir(place_info)

            $('#info-place-name').text(_title)
            $('#info-place-address').text(_address)

            $('#info-place-rating').text(`${place_info['rating']} 점 / 5.0 점`)
            $('#info-place-review-count').text(`리뷰 ${place_info['review_count']}건`)

            $('#like_button').val(place_info['like'])
            if (place_info['like'] == true) {
                $('#like_button').removeClass('btn-success').addClass('btn-danger')
            }

            $('#info-place-enter-amount').text(`리뷰어 ${place_info['enter_amount']}%가 이 가게에 출입함`)


            $('#place-info').show();
            $('#place-list').hide();
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
                let review = reviews[i]['review']
                let temp_html = `<li class="list-group-item">${review}</li>`
                $('#review-box').append(temp_html)
            }
        }
    })
}

function search_place() {
    $("#hello").hide() // 추천목록 숨기기
}