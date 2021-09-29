$(document).ready(function () {
    showReview();
});

function makeReview() {
    let name = $('#name').val()
    let review = $('#review').val()
    let rating = $('#rating').val()

    $.ajax({
        type: "POST",
        url: "/placereview",
        data: {name_give: name, review_give: review, rating_give: rating},
        success: function (response) {
            alert(response["msg"]);
            window.location.reload();
        }
    })
}

function showReview() {
    $.ajax({
        type: "GET",
        url: "/placereview",
        data: {},
        success: function (response) {
            let reviews = response['all_reviews']
            for (let i = 0; i < reviews.length; i++) {
                let name = reviews[i]['name']
                let review = reviews[i]['review']
                let rating = reviews[i]['rating']

                let temp_html = ` <tr>
                            <td>${name}</td>
                            <td>${review}</td>
                            <td>${rating}</td>
                        </tr> `

                $('#reviews-box').append(temp_html)
            }
        }
    })
}


