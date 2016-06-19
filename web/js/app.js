var app = angular.module('mindkeep', ['ngCookies']);

app.run(function($http, $rootScope, $cookies) { 

	$rootScope.updateSession = function(data) {
		var params = data ? data : {};
		params.sessionId = $cookies.get('mk-session');
 
		$http.post('https://pm2xofozqg.execute-api.eu-west-1.amazonaws.com/prod/sessions', params)
			.then(function(result) {
				console.log(result);
				$rootScope.session = result.data;
				$cookies.put('mk-session', $rootScope.session.id);
		});
	};

	$rootScope.updateSession();	

});

app.run(function($window, $rootScope) { 
	$window.fbAsyncInit = function() {
		FB.init({ 
		  appId: '1732167897022532',
		  status: true, 
		  cookie: true, 
		  xfbml: true,
		  version: 'v2.4'
		});

		
		FB.Event.subscribe('auth.authResponseChange', function(res) {

			console.log(res);

			if (res.status === 'connected') {
				$rootScope.updateSession({ 
					fbAuth : res.authResponse
				});
				

			  /*
			   The user is already logged,
			   is possible retrieve his personal info
			  */
			  //_self.getUserInfo();

			  /*
			   This is also the point where you should create a
			   session for the current user.
			   For this purpose you can use the data inside the
			   res.authResponse object.
			  */
			}
			else {

			  /*
			   The user is not logged to the app, or into Facebook:
			   destroy the session on the server.
			  */
			}
		});	
	};

  	(function(d){
		var js,
		id = 'facebook-jssdk',
		ref = d.getElementsByTagName('script')[0];

		if (d.getElementById(id)) {
		  return;
		}

		js = d.createElement('script');
		js.id = id;
		js.async = true;
		js.src = "//connect.facebook.net/en_US/all.js";

		ref.parentNode.insertBefore(js, ref);

	}(document));

});
