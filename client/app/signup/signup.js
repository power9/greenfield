angular.module('pledgr.signup', [])

.controller('SignupController', function($scope, $window, Auth, SMS) {
  $scope.user = {
    first:'First',
    last:'Last',
    username: 'username@example.com',
    password: '',
    male: false,
    female: false,
    animals: false,
    arts: false,
    education: false,
    environment: false,
    health: false,
    humanService: false,
    international: false,
    publicBenefit: false,
    religion: false,
    local: false,
    phone: '(111)111-1111',
    code:'test',
    pledge: 100.00
  };


  $scope.form = {
    selected : null,
    fieldsets : null,
    nextDisabled : false,
    prevDisabled : true
  }
  
  $scope.form.selected = angular.element(document.querySelector('#signup-form'));
  $scope.form.fieldsets = $($scope.form.selected).find('fieldset');

  $scope.formNext = function() {
    var form =  angular.element(document.querySelector('#signup-form fieldset.active'));
      angular.element(form).fadeOut('fast', function(){
          console.log($(this).next('fieldset').length);
          $(this).next('fieldset').fadeIn().addClass('active');
      }).removeClass('active');
  };

  $scope.formPrev = function() {
    var form =  angular.element(document.querySelector('#signup-form fieldset.active'));
      angular.element(form).fadeOut('fast', function(){
          $(this).prev('fieldset').fadeIn().addClass('active');
      }).removeClass('active');
  };


  $scope.signup = function() {
    Auth.signup($scope.user)
    // .then(function(token) {
    //     $window.localStorage.setItem('token', token);
    //     // $location.path('/userhome');
    //   })
      .catch(function(error) {
        console.error(error);
      });
  };

  $scope.sendCode = function() {
    var phone = $scope.user.phone.match(/\d/g).join('');
    SMS.sendCode({
      phone: phone
    })
    .then(function(sent) {
      if (!sent) {
        console.error('Error sending message. Please try again later.');
      }
    });
  };

  $scope.verifyCode = function() {
    var phone = $scope.user.phone.match(/\d/g).join('');
    SMS.verifyCode({
      phone: phone,
      code: $scope.user.code
    })
    .then(function(found) {
      if (found) {
        console.log('Code found');
      } else {
        console.log('Code not found');
        $('#verify').$invalid = true;

      }
    });
  };
});

