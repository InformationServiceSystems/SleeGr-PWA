/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Your custom JavaScript goes here

  var AUTH0_CLIENT_ID='kMlSIl3Itqt6mQetzGXES6biAVFei6k8';
  var AUTH0_DOMAIN='app-iss.eu.auth0.com';
  var app = {
    isLoading: true,
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    lock: new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
      auth: {
        params: {scope: 'openid email'}
      },
      closable: false
    })

  };


  $('#btn-logout').click(function(e) {
    e.preventDefault();
    logout();
  })

  app.lock.on("authenticated", function(authResult) {
    app.lock.getProfile(authResult.idToken, function(error, profile) {
      if (error) {
        // Handle error
        return;
      }
      localStorage.setItem('id_token', authResult.idToken);
      // Display user information
      app.lock.hide();
      document.getElementById('add').setAttribute('style', 'display: block');
      app.retrieve_profile();
    });
  });



  //retrieve the profile:
  app.retrieve_profile = function() {
    var id_token = localStorage.getItem('id_token');
    if (id_token) {
      app.lock.getProfile(id_token, function (err, profile) {
        if (err) {
          return alert('There was an error getting the profile: ' + err.message);
        }
        console.log(profile);
        // Display user information
        show_profile_info(profile);
      });
    }
  };

  function show_profile_info(profile){
    document.getElementById('username').innerHTML = profile.email;
    $('.avatar').attr('src', profile.picture).show();

  }

  if(!localStorage.getItem('id_token')){
    document.getElementById('add').setAttribute('style', 'display: none');
    app.lock.show();
  }
  else{
    document.getElementById('add').setAttribute('style', 'display: block');
    app.retrieve_profile();
  }
  var logout = function() {
    localStorage.removeItem('id_token');
    document.getElementById('add').setAttribute('style', 'display: none');
    window.location.href = "/";
  };

})();
