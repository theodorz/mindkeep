var app = angular.module('mindkeep', ['ngCookies', 'ui.router']);

app.config(function($httpProvider) {
    $httpProvider.defaults.headers.delete = { 'Content-Type' : 'application/json' };
});

app.service('baseApi', function($http) {
	var service = {
		base: 'https://pm2xofozqg.execute-api.eu-west-1.amazonaws.com/prod'
	};

	service.get = function(path, params) {
		params = params ? params : {};
		return $http({ 
			url: service.base + path, 
			method: 'GET',
			params: params
		}).then(function(result) {
			return result.data;
		});
	};

	service.post = function(path, params, body) {
		params = params ? params : {};
		return $http({
			url: service.base + path, 
			method: 'POST',
			data: body,
			params: params
		}).then(function(result) {
			return result.data;
		});
	};

	service.put = function(path, params, body) {
		params = params ? params : {};
		return $http({
			url: service.base + path, 
			method: 'PUT',
			data: body,
			params: params
		}).then(function(result) {
			return result.data;
		});
	};

	service.delete = function(path, params, body) {
		params = params ? params : {};
		return $http({
			url: service.base + path, 
			method: 'DELETE',
			params: params,
			data: body
		}).then(function(result) {
			return result.data;
		});
	};
	return service;
});

app.factory('auth', function(baseApi, $cookies, $q) {
	var service = {};
	var	sessionPromise = null;

	var querySession = function(data) { 
		var params = data ? data : {};
		params.sessionId = $cookies.get('mk-session');
 
		sessionPromise = baseApi.post('/sessions', null, params)
		.then(function(session) { 
			if(!session)
				return null;
			$cookies.put('mk-session', session.id);
			service.session = session;
			return session;
		});

		return sessionPromise;
	};

	service.getSession = function(data) {
		if(!data && sessionPromise)
			return sessionPromise;
		return querySession(data);
	};

	service.logout = function() {
		if(FB) FB.logout();
		return querySession({ logout: true });
	};

	service.getUser = function() { 
		return service.getSession()
		.then(function(session) {
			return session.user;
		});
	};

	return service;	
});

app.factory('api', function(auth, baseApi) {
	var service = {};
	service.base = baseApi.base;

	service.get = function(path, data) {
		data = data ? data : {};
		data.sessionId = auth.session.id; 
		return baseApi.get(path, data);
	};
	service.post = function(path, data) { 
		data = data ? data : {};
		var params = { sessionId : auth.session.id };
		return baseApi.post(path, params, data);
	};

	service.put = function(path, data) { 
		data = data ? data : {};
		var params = { sessionId : auth.session.id };
		return baseApi.put(path, params, data);
	};

	service.delete = function(path, data) { 
		data = data ? data : {};
		var params = { sessionId : auth.session.id };
		return baseApi.delete(path, params, data);
	};
	return service;
});

app.run(function($window, auth) { 
	$window.fbAsyncInit = function() {
		FB.init({ 
		  appId: '1732167897022532',
		  status: true, 
		  cookie: true, 
		  xfbml: true,
		  version: 'v2.4'
		});

		
		FB.Event.subscribe('auth.authResponseChange', function(res) {

			if (res.status === 'connected') {
				auth.getUser().then(function(user) {
					if(user)
						return;
					return auth.getSession({ 
						fbAuth : res.authResponse
					});
				});
			}
			else {

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

app.config(function($stateProvider, $locationProvider) {
  $stateProvider
   .state('front', {
    url: '/',
    templateUrl: 'front.html',
    controller: 'FrontController',
    resolve: {
      /*delay: function($q, $timeout) {
        var delay = $q.defer();
        $timeout(delay.resolve, 1000);
        return delay.promise;
      }*/
    }
  })
  .state('app', { 
    templateUrl: 'app.html',
    controller: 'AppController',
	resolve: { 
		session: function(auth) {
			return auth.getSession();
		}
	}
  })
  .state('app.start', {
	url: '/start',
	templateUrl: 'start.html',
	controller: 'StartController'
  })
  .state('app.all', {
	url: '/all',
	templateUrl: 'all.html',
	controller: 'AllController'
  })
  .state('review', {
	url: '/review',
	templateUrl: 'review.html',
	controller: 'ReviewController'
  })
  .state('app.inbox', {
	url: '/inbox'
  })
  .state('app.import', {
	url: '/import',
	templateUrl: 'import.html',
	controller: 'ImportController'
  });

  $locationProvider.html5Mode(true);
});

app.directive('keypressEvents', [ '$document','$rootScope', function($document, $rootScope) {
	var handler = function(e) {
		$rootScope.$broadcast('keypress', e.which);
		$rootScope.$broadcast('keypress:' + e.which, e);
	};
	return {
		restrict: 'A',
		link: function() {
			$document.unbind('keyup', handler);
			$document.bind('keyup', handler);
		}
  };
}
]);
