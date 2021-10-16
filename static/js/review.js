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

            $('#place-info').show()
            $('#place-list').hide()

            showReview(_title, _address, 1)
        }
    })
}

function loadReview(_title, _address, _currentPage) {
    user_id = "manijang3"
    $.ajax({
        type: "GET",
        url: `/api/review/pagination?title=${_title}&address=${_address}&page=${_currentPage}&user_id=${user_id}`,
        data: {},
        success: function (response) {
            $('#review-list').empty()
            $('#review-pagination-ul').empty()

            let temp_html = ''
            let review_list = response['review-list']
            for (let i = 0; i < review_list.length; i++) {
                if (review_list[i]['user_id'] == user_id) {
                    temp_html = `<hr/>
                            <div class="row">
                                <div class="col-sm-3">${review_list[i]['user_id']}</div>
                                <div class="col-sm-8">
                                    ${review_list[i]['review']} <i class="fas fa-trash-alt" onclick="deleteReview('${_title}', '${_address}', '${user_id}')"></i>
                                </div>
                            </div>`
                } else {
                    temp_html = `<hr/>
                            <div class="row">
                                <div class="col-sm-3">${review_list[i]['user_id']}</div>
                                <div class="col-sm-8">
                                    ${review_list[i]['review']}
                                </div>
                            </div>`
                }

                $('#review-list').append(temp_html)
            }

            // 한 화면에 보여줄 페이지 수
            const pageBlock = 3;
            // 한 페이지에 보여줄 리뷰 수
            const pageSize = 3;
            const review_tot = response['count']

            if (review_tot > 0) {
                let pageTotCount = 0
                if (review_tot % pageSize == 0) {
                    pageTotCount = review_tot / pageSize
                } else {
                    pageTotCount = review_tot / pageSize + 1
                }

                const startPage = parseInt((_currentPage - 1) / pageBlock) * pageBlock + 1
                let endPage = startPage + pageBlock - 1;
                if (endPage > pageTotCount) {
                    endPage = pageTotCount;
                }

                if (startPage > pageBlock) {
                    $('#review-pagination-ul').append(`<li class="page-item"><a class="page-link" style="cursor:pointer; color: #5cb85c; font-weight: normal;" onclick="loadReview('${_title}', '${_address}', '${startPage - pageBlock}')">Previous</a></li>`)
                }

                for (let i = startPage; i <= endPage; i++) {
                    if (i == _currentPage) {
                        $('#review-pagination-ul').append(`<li class="page-item"><a class="page-link" style="cursor:pointer; color: #5cb85c; font-weight: normal;">${i}</a></li>`)
                    } else {
                        $('#review-pagination-ul').append(`<li class="page-item"><a class="page-link" style="cursor:pointer; color: #5cb85c; font-weight: normal;" onclick="loadReview('${_title}', '${_address}', '${i}')">${i}</a></li>`)
                    }
                }

                if (endPage < pageTotCount) { // 현재 블록의 마지막 페이지보다 페이지 전체 블록수가 클경우 다음 링크 생성
                    $('#review-pagination-ul').append(`<li class="page-item"><a class="page-link" style="cursor:pointer; color: #5cb85c; font-weight: normal;" onclick="loadReview('${_title}', '${_address}', '${startPage + pageBlock}')">Next</a></li>`)
                }
            }
        }
    })
}

function changeModelPhoto(filename) {
    $("#modal-photo-img").attr("src",filename)
}

function loadPhoto_my() {
    let title = $('#info-place-name').text()
    let address = $('#info-place-address').text()

    $.ajax({
        type: "GET",
        url: `/api/place/photo/my?title=${title}&address=${address}`,
        data: {},
        success: function (response) {
            $('#place-photo-my-div').empty()
            let filenames = response['photos']['filenames']
            for (let i = 0; i < filenames.length; i++) {
                let filename = filenames[i]
                let temp_html = `<div class="col-md-4">
                                        <div class="thumbnail">
                                            <a data-toggle="modal" data-target="#exampleModalLong" onclick="changeModelPhoto('/static/${filename}')">
                                                <img class="imgaa" style="width:130px; height: 80px; background-image:url('/static/${filename}');">
                                            </a>
                                            <div class="delete-box"><a>삭제</a></div>
                                        </div>
                                    </div>`
                $('#place-photo-my-div').append(temp_html)
            }
        }
    })
}

function loadPhoto_all() {
    let title = $('#info-place-name').text()
    let address = $('#info-place-address').text()

    $.ajax({
        type: "GET",
        url: `/api/place/photo/all?title=${title}&address=${address}`,
        data: {},
        success: function (response) {
            console.dir(response)
            $('#place-photo-all-div').empty()
            let filenames = response['photos']
            for (let i = 0; i < filenames.length; i++) {
                let filename = filenames[i]
                let temp_html = `<div class="col-md-4">
                                        <div class="thumbnail">성
                                            <a data-toggle="modal" data-target="#exampleModalLong" onclick="changeModelPhoto('/static/${filename}')">
                                                <img class="imgaa" style="width:130px; height: 80px; background-image:url('/static/${filename}');">
                                            </a>
                                        </div>
                                    </div>`
                $('#place-photo-all-div').append(temp_html)
            }
        }
    })
}


function showReview(_title, _address, _page) {
    $('#place-review-info').show();
    $('#place-photo-info').hide();

    loadReview(_title, _address, 1)
}

function showPhoto() {
    $('#place-review-info').hide();
    $('#place-photo-info').show();

    loadPhoto_my()
    loadPhoto_all()
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
            alert(response['msg'])
            window.location.reload() // 새로고침
        }
    })
}

function deleteReview(_title, _address, _user_id) {
    $.ajax({
        type: "DELETE",
        url: `/api/review`,
        data: {
            user_id: _user_id,
            title: _title,
            address: _address
        },
        success: function (response) {
            alert(response['msg'])
            window.location.reload() // 새로고침
        }
    })
}

function clickPhotoUpdate() {
    let formData = new FormData($('#fileForm')[0]);

    title = $('#info-place-name').text()
    address = $('#info-place-address').text()

    formData.append("title", title)
    formData.append("address", address)

    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: `/fileUpload`,
        data: formData,
        processData: false,
        contentType: false,
        cache: false,
        success: function (result) {
            alert(result['msg'])
        },
        error: function (e) {
            alert(e)
        }
    });
}

<<<<<<< HEAD

=======
>>>>>>> 0403b36257a8a71941c9bc9bc1f5470d1c985eff
function search_place() {
    $("#hello").hide() // 추천목록 숨기기
}