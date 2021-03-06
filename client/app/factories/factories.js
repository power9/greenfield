angular.module('pledgr.factories', [])

.factory('CreditCards', function($http, $state,$window, Auth, Account) {
  Stripe.setPublishableKey("pk_test_d4qfvAGCTfij33GxuvYkZKUl");
  
  var cards = {data:[]};
  var formData = {
    number: "",
    cvc: "",
    expmonth: "",
    expyear: ""
  };
  
  var getCards = function() {
    $('#payment-form').get(0).reset();
    cards.data = [];
    
    var token = $window.localStorage.getItem('token');
    if(!token) {
      $state.go('signin');
    }
    else {
      Account.getUserData(token).then(function(res) {
        if(res.data) {
          $http.get('/card/get', {params: {user: res.data.username}})
          .success(function (res) {
            for(var i = 0; i < res.data.length; i++) {
              cards.data.push(res.data[i]);
            }
          })
          .error(function(error,user){
            console.log(error,user);
          });
        }
        else {
          $state.go('signin');
        }
      });
    }
  };

  var addCard = function() {
     var $form = $('#payment-form');
     var authToken = $window.localStorage.getItem('token');
     Stripe.card.createToken($form, 
        function (status, response) {
          if (response.error) {

          } else {
            // response contains id and card, which contains additional card details
            var token = response.id;
            Account.getUserData(authToken).then(function(res) {
              $http({
                url: '/card/add',
                method: "POST",
                data: {
                  user: res.data.username, 
                  stripeToken: token,
                  endingDigits: formData.number.slice(-4),
                  exp: (formData.expmonth 
                      + '/' + formData.expyear)
                },
                headers: {'Content-Type': 'application/json'}
              })
              .then(function (res) {
                  if(res.data === "SUCCESS") {
                    cards.data.push({endingDigits: formData.number.slice(-4), exp: formData.expmonth 
                      + '/' + formData.expyear});
                  }
              });
            });

            $form.get(0).reset();
          }
        }
     ); 
  };

  var deleteCard = function(card) {
    var authToken = $window.localStorage.getItem('token');
    Account.getUserData(authToken).then(function(res) {
      $http({
        url: '/card/delete',
        method: "POST",
        data: {user: res.data.username, endingDigits: card.endingDigits},
        headers: {'Content-Type': 'application/json'}
      })
      .then(function (res) {
        if(res.data === "SUCCESS") {
          for(var i = 0; i < cards.data.length; i++) {
            if(cards.data[i].endingDigits === card.endingDigits) {
              cards.data.splice(i, 1);
            }
          }
        }
      });
    });      
  }

  return {
    getCards: getCards,
    addCard: addCard,
    deleteCard: deleteCard,
    formData: formData,
    cards: cards
  }
})


.factory('Account', function($http) {
  var getUserData = function(token) {
    return $http({
      method: 'GET',
      url: '/api/users/account',
      headers: {
        'x-access-token': token
      }
    })
    .then(function(data) {
      return data
    });
  };

  return {
    getUserData: getUserData
  }
})

.factory('Auth', function($http, $state) {
  var signup = function(data) {
    return $http({
      method: 'POST',
      url: '/api/users/signup',
      data: data
    })
    .then(function(resp) {
      return resp.data.token;
    });
  };

  var checkToken = function(token) {
    return $http({
      method: 'GET',
      url: '/api/users/signedin',
      headers: {
        'x-access-token': token
      }
    })
    .then(function(resp) {
      return resp.status;
    });
  };

  var signin = function(user) {
    return $http({
      method: 'POST',
      url: '/api/users/signin',
      data: user
    })
    .then(function(resp) {
      return resp.data;
      // return resp.data.token;
    });
  };

  return {
    signup: signup,
    signin: signin,
    checkToken: checkToken
  };
})

.factory('SMS', function($http) {
  var sendCode = function(data) {
    return $http({
      method: 'POST',
      url: '/api/sms/send',
      data: data
    })
    .then(function(resp) {
      return resp.data.sent;
    });
  };

  var verifyCode = function(data) {
    return $http({
      method: 'POST',
      url: '/api/sms/verify',
      data: data
    })
    .then(function(resp) {
      return resp.data.found;
    });
  };

  return {
    sendCode: sendCode,
    verifyCode: verifyCode
  };
})

.factory('Categories', function($http) {
  var getCategories = function() {
    return $http({
      method: 'GET',
      url: '/api/charity/category'
    })
    .then(function(resp) {
      return resp.data;
    });
  };

  var getSubCategories = function() {
    return $http({
      method: 'GET',
      url: '/api/charity/subCategory'
    })
    .then(function(resp) {
      return resp.data;
    });
  };

  return {
    getCategories: getCategories,
    getSubCategories: getSubCategories
  };
})

.factory('Charities', function($http) {
  var register = function(data) {
    return $http({
      method: 'POST',
      url: '/api/charity',
      data: data
    })
    .then(function(resp) {
      return resp.data;
    });
  };

  var getUnvetted = function() {
    return $http({
      method: 'GET',
      url: '/api/charity/unvetted'
    })
    .then(function(resp) {
      return resp.data;
    });
  };

  var vet = function(charity) {
    return $http({
      method: 'PUT',
      url: '/api/charity',
      data: charity
    })
    .then(function(resp) {
      console.log(resp.data);
      return resp.data;
    });
  };

  return {
    register: register,
    getUnvetted: getUnvetted,
    vet: vet
  };
});
