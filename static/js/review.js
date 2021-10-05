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
    let like = 0 ///////////////////////////////////

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