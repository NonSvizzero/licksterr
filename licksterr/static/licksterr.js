/* HOMEPAGE */

function addUploadListener() {
    const button = document.getElementById("uploadBtn");
    button.addEventListener("click", function (e) {
        e.preventDefault();
        let tracks = [];
        $('.track-checkbox').each(function (i, obj) {
            if (obj.checked) {
                tracks.push(obj.value);
            }
        });
        const file = document.getElementById("uploadFile").files[0];
        uploadFile(file, tracks);
        $('#uploadPlaceholder').innerText = "Waiting for server..."
    });
}

function addRemoveListener() {
    $('.remove-song-button').each(function (i, obj) {
        obj.addEventListener("click", function (e) {
            e.preventDefault();
            $.ajax({
                url: '/songs/' + obj.value,
                type: 'DELETE',
                success: function (result) {
                    window.location.reload();
                }
            });
        });
    });
}

function uploadFile(file, tracks) {
    var fd = new FormData();
    fd.append("tab", file);
    fd.append("tracks", JSON.stringify(tracks));
    let is_analysis = tracks.length > 0;
    $.ajax({
        url: (is_analysis) ? "/upload" : "/tabinfo",
        type: "POST",
        data: fd,
        processData: false,
        contentType: false,
        success: function (response) {
            if (is_analysis) {
                window.location.reload();
            } else {
                var $container = $('#trackSelect');
                for (let [key, value] of Object.entries(response)) {
                    $container.append($('<label />').html(value)
                        .prepend($('<input/>').attr({type: 'checkbox', value: key, class: 'track-checkbox'})));
                }
                $('#uploadPlaceholder').innerText = '';
            }
        },
        error: function (jqXHR, textStatus, errorMessage) {
            console.log(errorMessage); // Optional
        }
    });
}

/* PLAYER */

/* Note circles */

function createNoteCircles(intervals) {
    getFretElements().each(function (i, text) {
        let x = text.x.baseVal[0].value;
        let y = text.y.baseVal[0].value;
        let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        let $circle = $(circle).attr({
            cx: x + (text.innerHTML.length / 2 + 1) * 3,
            cy: y,
            r: 8,
            class: "note note-" + intervals[i].toString(),
        });
        $(text).after($circle);
    });
}

function getFretElements() {
    texts = $("text[dominant-baseline='middle']");
    return texts;
}

function updateNoteColors(colors) {
    colors.forEach(function (color, i) {
        className = ".note-" + i;
        classContainer = $("head").find('style[data-class="' + className + '"]');
        if (color) {
            classContainer.html(className + ' {' +
                'fill:' + color + '; display:block' +
                '}');
        } else {
            classContainer.html(className + ' {display:none}');
        }
    });
}

/* Form shape information */

function findMeasures() {
    $("svg").slice(1).each(function (i, svg) {
        let start = null;
        let xs = {};
        let y = null;
        $(svg).find("rect").each(function (j, rect) {
            let x = rect.x.baseVal.value;
            start = start ? start : x;
            if (j > 6 && start === x) {
                // We have examined all pentagram, no need to go on with the tab, because we already know measures
                // positions and lengths. Exit loop and keep only the y offset of the tablature.
                y = rect.y.baseVal.value;
                return false;
            }
            let width = rect.width.baseVal.value;
            if (width > 20) {
                xs[x] = width;
            }
        });
        console.log(xs, y);
    });
}
