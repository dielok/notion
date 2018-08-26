function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function postHmnd(url, data, success, dataType) {
    
    return $.ajax({
        url: url,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: data,
        method: "post",
        dataType: dataType,
        success: success
    });
    
}

function getHmnd(url, data, success, error, dataType) {
    
    return $.ajax({
        url: url,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: data,
        method: "get",
        dataType: dataType,
        success: success,
        error: error
    });
    
}

function putHmnd(url, data, success, dataType) {
    
    return $.ajax({
        url: url,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: data,
        method: "put",
        dataType: dataType,
        success: success
    });
    
}

function deleteHmnd(url, data, success, dataType) {
    
    return $.ajax({
        url: url,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: data,
        method: "delete",
        dataType: dataType,
        success: success
    });
    
}

function Notes() {}

Notes.token = null;

Notes.create = function(note) {
    
    var url = "https://www.humanoid.fivetwenty.de/rest/public/notes";
    
    var data = note;
    data.token = this.token;
    
    postHmnd(url, data);
    
};

Notes.read = function(uuid, callback, errCallback) {
    
    console.log("this", this.token);
    
    var url = 'https://www.humanoid.fivetwenty.de/rest/public/notes';
    
    if (uuid) url = url + "/" + uuid;
    
    var data = {
        token: this.token
    };
    
    getHmnd(url, data, callback, errCallback);
    
};

Notes.update = function(note) {
    
    if ( ! note.note_id) return;
    
    var url = "https://www.humanoid.fivetwenty.de/rest/public/notes/" + note.note_id;
    
    var data = note;
    data.token = this.token;
    
    putHmnd(url, data);
    
};

Notes.delete = function(uuid) {
    
    var url = 'https://www.humanoid.fivetwenty.de/rest/public/notes/' + uuid;
    
    var data = {
        token: this.token
    };
    
    deleteHmnd(url, data);
    
};

function createBubble(note) {
    
    var $bubble = $('.bubble.new')
        .clone().removeClass('new')
        .insertAfter('.bubble.search');
    
    var $textarea = $('.textarea', $bubble);
    
    $textarea
    .on('keyup', function(e) {
        
        var parent = null;
        if (document.selection) {
            parent = document.selection.createRange().parentElement();
        } else if (window.getSelection){
            var range = window.getSelection().getRangeAt(0);
            console.log("range", range);
            parent = ( ! range.commonAncestorContainer.tagName) ? range.commonAncestorContainer.parentNode : range.commonAncestorContainer;
        }
        
        
        var $line = $(parent);
        
        if ($line.hasClass("textarea")) return;
        
        if (e.keyCode === 13) {
            
            $line.removeClass();
            
        }
        
        var tests = {
            h1: /^# .*/.test($line.text()),
            h2: /^## .*/.test($line.text()),
            ul: /^- .*/.test($line.text())
        };
        
        $line.removeClass();
        
        for (tag in tests) {
            if (tests[tag] === true) $line.addClass(tag);
        }
        
    })
    
    .on('paste', function (e) {
        e.preventDefault();
        var text = null;
        text = (e.originalEvent || e).clipboardData.getData('text/plain');
        document.execCommand("insertText", false, text);
    });
    
    if (note) {
        
        $textarea.html(note.text);
        $bubble.data("note", note);
        
    }
    
    $(".delete", $bubble).on('click', function() {
        
        var $button = $(this);
        
        if ($button.hasClass('confirm')) {
            
            Notes.delete($bubble.data("note").note_id);
            
            $bubble.remove();
            
        } else {
            
            $button.addClass('confirm');
            
        }
    
    });
    
    $bubble.on('click', function(event) {
        
        event.stopPropagation();
        
        $('.bubble').removeClass("active");
        $bubble.addClass("active");
        
        $textarea
            .attr('contenteditable', 'true')
            .focus();
        
    });
    
    $(".update", $bubble).on('click', function(event) {
        
        event.stopPropagation();
        
        var note = $bubble.data("note");
        note.text = $textarea.html();
        
        console.log("note", note);
        
        Notes.update(note);
        
        console.log($bubble);
        $bubble.removeClass("active");
        
        $textarea.blur().attr('contenteditable', 'false');
        
        $('html, body').animate({
            scrollTop: $bubble.offset().top - 50
        }, 300);
        
    });
    
    return $bubble;
    
}

Notes.token = localStorage.getItem('token');

Notes.read(undefined, function(data) {
    
    $('body').addClass('bubbles');
    
    var notes = data;
    
    if (notes) {
        
        for (var i = 0; i < notes.length; i++) {
            
            createBubble(notes[i]);
            
        }
        
    }
    
},
function() {
    
    console.log("READ ERROR");
    $('body').addClass('login');
    
});

$(window).on("touchstart click", function() {
    
    $('.bubble:not(.search)').removeClass("active");
    
    // close fresh bubble if empty
    var $fresh = $('.bubble.fresh');
    
    if ( ! $('.textarea', $fresh).text().trim()) {
        
        $fresh.remove();
        
    }
    
    $('.textarea').blur().attr('contenteditable', 'false');
    
});

$('.bubble.new button.new').on('click', function(event) {
    
    event.stopPropagation();
    
    var $bubble = createBubble().addClass("fresh");
    
    $('.bubble').removeClass("active");
        $bubble.addClass("active");
    
    var $textarea = $bubble.find(".textarea").attr('contenteditable', 'true').focus();
    
    $("button.save", $bubble).on('click', function() {
        
        var note = {
            uuid: generateUUID(),
            text: $textarea.html()
        };
        
        Notes.create(note);
        
        $bubble
            .data("note", note)
            .removeClass("fresh");
        
    });
    
});

function toggleSearchResults() {
    
    if ($(this).val().length) {
        
        $('.bubble.search').addClass('active');
        
    } else {
        
        $('.bubble.search').removeClass('active');
        
    }
    
}

$('.bubble.new input').on('keyup', toggleSearchResults);

$(document).on('ready', function() {
    
    toggleSearchResults.apply($('.bubble.new input')[0]);
    
});

$('form[name=signin]').on('submit', function() {
    
    var form = $(this);
    
    postHmnd(form.attr('action'), form.serialize(), function(data) {
        
        localStorage.setItem('token', data.token);
        Notes.token = data.token;
        
        Notes.read(undefined, function(data) {
            
            console.log("data", data);
            
            var notes = data;
            
            if (notes) {
                
                for (var i = 0; i < notes.length; i++) {
                    
                    createBubble(notes[i]);
                    
                }
                
            }
            
            $('section.login').addClass('done');
            $('body').addClass('bubbles');
            
        });
        
    }).done(function() {
        
        
        
    });
    
    return false;
    
});
