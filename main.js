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

function Notes() {}

Notes.create = function(note) {
    
    $.ajax({
        url: 'https://quiet-glade-6673.getsandbox.com/notes',
        type: 'POST',
        data: JSON.stringify(note),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: false
    });
    
};

Notes.read = function(uuid, callback) {
    
    var url = 'https://quiet-glade-6673.getsandbox.com/notes';
    
    if (uuid) url = url + "/" + uuid;
    
    $.ajax({
        url: url,
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: false,
        success: callback
    });
    
};

Notes.update = function(note) {
    
    if ( ! note.uuid) return;
    
    $.ajax({
        url: 'https://quiet-glade-6673.getsandbox.com/notes/' + note.uuid,
        type: 'PUT',
        data: JSON.stringify(note),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: false,
        success: function(data) {
            console.log("success", data);
        }
    });
    
};

Notes.delete = function(uuid) {
    
    $.ajax({
        url: 'https://quiet-glade-6673.getsandbox.com/notes/' + uuid,
        type: 'DELETE',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: false
    });
    
};

function createBubble(note) {
    
    var $bubble = $('.bubble.new')
        .clone().removeClass('new')
        .insertAfter('.bubble.new');
    
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
            h2: /^## .*/.test($line.text())
        };
        
        $line.removeClass();
        
        for (tag in tests) {
            if (tests[tag] === true) $line.addClass(tag);
        }
        
    });
    
    if (note) {
        
        $textarea.html(note.text);
        $bubble.data("note", note);
        
    }
    
    $(".delete", $bubble).on('click', function() {
        
        var $button = $(this);
        
        if ($button.hasClass('confirm')) {
            
            Notes.delete($bubble.data("note").uuid);
            
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

Notes.read(undefined, function(data) {
    
    var notes = data;
    
    if (notes) {
        
        for (var i = 0; i < notes.length; i++) {
            
            createBubble(notes[i]);
            
        }
        
    }

});



$(window).on("touchstart click", function() {
    
    $('.bubble').removeClass("active");
    
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