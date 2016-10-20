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
    container: document.querySelector('#corellContainer'),
    utils: getUtils()
  };
  var setup = getSetup();
  var updater = getChartUpdater();

  var start = moment().subtract(29, 'days');
  var end = moment();

  function cb(start, end) {
    $('#reportrange span').html(start.format('DD.MM.YYYY') + ' - ' + end.format('DD.MM.YYYY'));
  }

  $('#reportrange').daterangepicker({
    startDate: start,
    endDate: end,
    ranges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
  }, cb);

  cb(start, end);

  $('#btn-logout').click(function(e) {
    e.preventDefault();
    logout();
  });

  //retrieve the profile:
  var retrieve_profile = function() {
    var id_token = localStorage.getItem('id_token');
    if (id_token) {
      lock.getProfile(id_token, function (err, profile) {
        if (err) {
          return alert('There was an error getting the profile: ' + err.message);
        }
        // Display user information
        show_profile_info(profile);
      });
    }
  };

  function show_profile_info(profile){
    document.getElementById('username').innerHTML = profile.email;
    $('.avatar').attr('src', profile.picture).show();

  }

  var logout = function() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('profile');
    document.getElementById('profile-button').setAttribute('style', 'display: none');
    if (!app.isLoading) {
      app.spinner.setAttribute('hidden', false);
      app.container.setAttribute('hidden', true);
      app.isLoading = true;
    }
    window.location.href = "/";
  };



  var readCorrelations = function () {
    var url = 'http://192.168.0.247:5000';
    var correlations_id = '#correlationsdiv';
    var x_label_id = '#xLabel';
    var y_label_id = '#yLabel';
    var picker_id = '#reportrange';
    var correlationList;
    var time = new Object();
    var user_id	= JSON.parse(localStorage.getItem('profile')).email;
    var auth_token = localStorage.getItem('id_token');
    $.ajaxSetup({
      'beforeSend': function(xhr) {
        if (localStorage.getItem('id_token')) {
          xhr.setRequestHeader('Authorization',
            'Bearer ' + localStorage.getItem('id_token'));
        }
      }
    });
    correlationList = setup.get_correlationsList(url);
    setup.fillInXlabels(correlationList, x_label_id);
    setup.fillInYlabels(url, user_id, correlationList, correlations_id, x_label_id, y_label_id);

    $('body').on('change', x_label_id, function() {
      setup.fillInYlabels(url, user_id, correlationList, correlations_id, x_label_id, y_label_id);
    });
    $('body').on('change', y_label_id, function() {
      updater.update_correlations(url, user_id, correlationList, correlations_id)
    });
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  }
  var lock = app.utils.initLock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
    auth: {
      params: {scope: 'openid email'}
    },
    closable: false
  });

  if(!localStorage.getItem('id_token')){
    document.getElementById('profile-button').setAttribute('style', 'display: none');
    lock.show();
  }
  else{
    document.getElementById('profile-button').setAttribute('style', 'display: block');
    retrieve_profile();
    readCorrelations();
  }
  lock.on("authenticated", function(authResult) {
    lock.getProfile(authResult.idToken, function(error, profile) {
      if (error) {
        // Handle error
        return;
      }
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('profile', JSON.stringify(profile));
      // Display user information
      lock.hide();
      document.getElementById('profile-button').setAttribute('style', 'display: block');
      retrieve_profile();
      readCorrelations();
    });
  });

})();
