function User() {
    
    this.login = function(mail, password) {
        
        $.ajax({
            type: "POST",
            dataType: "json",
            url: baseurl + 'users/sessions/',
            data: {
                mail: mail,
                password: password
            },
            success: function(data) {
                
                if (data.token) {
                    
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user_id", data.user_id);
                    
                    window.location.href = '.';
                    
                }
                
            },
            error: function(data) {
                
                console.log("error, data ", data);
                
                if (data.responseJSON.msg === "VERIFICATION FAILED") {
                    
                    alert("Nutzername und Passwort stimmen leider nicht.");
                    
                } else {
                    
                    alert("Ein unerwarteter Fehler ist aufgetreten. Wir wurden informiert. Bitte versuchen Sie es später erneut. Auf www.twitter.de/humanoidjourney werden sie über Fehlerbehebungen informiert.");
                    
                }
                
            }
            
        });
        
    };
    
    this.lost = function(mail) {
        
        $.ajax({
            type: "PATCH",
            dataType: "json",
            url: baseurl + 'users/',
            data: {
                mail: mail
            },
            success: function(data) {
                
                console.log("success, data ", data);
                
            },
            error: function(data) {
                
                console.log("error, data ", data);
                
            }
            
        });
        
    };
    
    this.logout = function() {
        
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        
        window.location.href = "login.html";
        
    };
    
    this.getProfile = function(callback) {
        
        var token = localStorage.getItem('token');
        
        $.ajax({
            type: "GET",
            dataType: "json",
            url: baseurl + 'users/',
            data: {
                token: token
            },
            success: function(data) {
                
                callback(data);
                
            },
            error: function(data) {
                
                console.log("error, data ", data);
                
            }
        
        });
        
    };
    
    this.putProfile = function(profile, callback) {
        
        var token = localStorage.getItem('token');
        
        $.ajax({
            type: "PUT",
            dataType: "json",
            url: baseurl + 'users/' + profile['user_id'] + '/',
            data: $.extend({}, { token: token }, profile),
            success: function(data) {
                
                callback(data);
                
            },
            error: function(data) {
                
                console.log("error, data ", data);
                
            }
        
        });
        
    }
    
    $('#logout').click(this.logout);
    
}