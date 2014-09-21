angular.module('lets_share', ['ionic', 'ui.bootstrap.datetimepicker'])

.factory('Projects', function() {
  return {
    all: function() {
      var projectString = window.localStorage['projects'];
      if(projectString) {
        return angular.fromJson(projectString);
      }
      return [];
    },
    save: function(projects) {
      window.localStorage['projects'] = angular.toJson(projects);
    },
    newProject: function(projectTitle) {
      // Add a new project
      return {
        title: projectTitle,
        tasks: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveProject']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveProject'] = index;
    }
  }
})



.controller('MainCtrl', function($scope, $q, $ionicLoading,$timeout, $http, $ionicModal, Projects) {

    // A utility function for creating a new project
    // with the given projectTitle
    var createProject = function(projectTitle) {
        var newProject = Projects.newProject(projectTitle);
        $scope.projects.push(newProject);
        Projects.save($scope.projects);
        $scope.selectProject(newProject, $scope.projects.length - 1);
    }

    var myArray = [{
        "title": "Home"
    }, {
        "title": "Rides"
    }, {
        "title": "Settings"
    }, {
        "title": "Logout"
    }];

    // radio button logic
    $scope.active = 'Hatchback';

    $scope.setActive = function(type) {
        $scope.active = type;
    };

    $scope.isActive = function(type) {
        return type === $scope.active;
    };

    //datetimepicker
    $scope.onTimeSet = function(newDate, oldDate) {
        console.log(newDate);
        console.log(oldDate);
    }

    // Load or initialize projects
    // $scope.projects = Projects.all(); commented to show only menu listing
    $scope.projects = myArray

    // Grab the last active, or the first project
    $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

    // Called to create a new project
    $scope.newProject = function() {
        var projectTitle = prompt('Project name');
        if (projectTitle) {
            createProject(projectTitle);
        }
    };

    // Called to select the given project
    $scope.selectProject = function(project, index) {
        $scope.activeProject = project;
        Projects.setLastActiveIndex(index);
        $scope.sideMenuController.close();
    };

    $scope.completionChanged = function() {
        Projects.save($scope.projects);
    };

    // Create our modal
    $ionicModal.fromTemplateUrl('load-modal.html', function(modal) {
        $scope.taskModal = modal;
    }, {
        focusFirstInput: false,
        scope: $scope
    });

    $scope.createTask = function(task) {
        if (!$scope.activeProject) {
            return;
        }
        $scope.activeProject.tasks.push({
            title: task.title
        });
        $scope.taskModal.hide();

        // Inefficient, but save all the projects
        Projects.save($scope.projects);

        task.title = "";
    };

    $scope.newTask = function() {
        $scope.taskModal.show();
    };

    $scope.closeNewTask = function() {
        $scope.taskModal.hide();
    }

    $scope.toggleProjects = function() {
        $scope.sideMenuController.toggleLeft();
    };



    $scope.load_show = function() {
    $ionicLoading.show({
      template: 'Loading...'
    });
  };
  $scope.load_hide = function(){
    $ionicLoading.hide();
  };
    //   $scope.myForm = {};
    //        $scope.from = "Chennai";
    //        $scope.to  = "Trichy";
    //        $scope.date  = "date";
    //        $scope.time  = "time";
    //   $scope.submit = function() {
    // alert($scope.from);
    // alert($scope.to);
    // alert($scope.date);
    // alert($scope.time);

    //         if ($scope.text) {
    //           $scope.list.push(this.text);
    //           $scope.text = '';
    //         }
    //       };

    // Try to create the first project, make sure to defer
    // this by using $timeout so everything is initialized
    // properly

    $scope.formData = {};
    $scope.test = function(formData) {
      // $http({
      //     method: 'POST',
      //     url: 'http://srinivasan.ngrok.com/bookings',
      //      data: formData
      // }).success(function () {
      //   alert("success on post request");
      // });

        var content=jQuery.ajax({
            type: 'POST',
            url: 'http://srinivasan.ngrok.com/bookings/search',
            data: formData,
            dataType: 'json',
            global: false,
            async:false,
            beforeSend: function() { 
                $scope.loading = $ionicLoading.show({
                    content: 'Please wait while our server gives you the best ride!',
                    showBackdrop: false
                });
            },
            complete: function() { 
                setInterval(function(){
                    $scope.loading.hide()
                }, 4000);
            },
            success: function(response) {

                $("#head").removeAttr( "hidden" )
                $scope.status=response.status.button
            }
        }).responseText;



    };
    $timeout(function() {
        if ($scope.projects.length == 0) {
            while (true) {
                var projectTitle = prompt('Your first project title:');
                if (projectTitle) {
                    createProject(projectTitle);
                    break;
                }
            }
        }
    });

    // MAP specific

    $scope.initMapAutoSuggest = function() {
        google.maps.event.addDomListener(window, "load", doGoogleSuggestInit)
    }

    function doGoogleSuggestInit() {
        var source = document.getElementById('source');
        var dest = document.getElementById('destination');
        var options = {
            componentRestrictions: {
                country: 'in'
            }
        }
        new google.maps.places.Autocomplete(source, options);
        new google.maps.places.Autocomplete(dest, options);
    } //doGoogleSuggestInit


    $scope.mapCreated = function(map) {
        $scope.map = map;
    };

    $scope.generateRoute = function() {
        //debugger
        // needs refactor
        $scope.source = document.getElementById("source").value
        $scope.destination = document.getElementById("destination").value

        console.log("generate");
        if (!$scope.map) {
            return;
        }

        $scope.loading = $ionicLoading.show({
            content: 'Generating route',
            showBackdrop: false
        });
        var sourceGeocoding = $q.defer()
        var destGeocoding = $q.defer()
        var allGeocoding = $q.all([sourceGeocoding.promise, destGeocoding.promise])
        allGeocoding.then(plotMap);

        sourceLatlng = geocodeAddress("source")
        destLatLng = geocodeAddress("dest")

        function plotMap() {
            var request = {
                // origin: new google.maps.LatLng(sourceLatlng.k, sourceLatlng.B),
                // destination: new google.maps.LatLng(destLatLng.k, destLatLng.B),
                origin: sourceLatlng,
                destination: destLatLng,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function(response, status) {
                //debugger
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                } else {
                    console.log("directionsService err")
                }
                $scope.loading.hide();
            });
        }//plotMap


        function geocodeAddress(type) {
            address = (type == "source" ? $scope.source : $scope.destination)
            geocoder.geocode({
                'address': address,
                region: 'IN'
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    latLng = results[0].geometry.location
                    if (type == "source") {
                        sourceLatlng = latLng
                        sourceGeocoding.resolve(type + "Geocoding done!")
                    } else {
                        destLatLng = latLng
                        destGeocoding.resolve(type + "Geocoding done!")
                    }
                    console.log(latLng)

                } else {
                    alert("Geocode was not successful for the following reason: " + status);
                }
            });
        }//geocodeAddress
    }; //genereateRoute



})

.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {
      function initialize() {
        var mapOptions = {
          zoom: 14,
          center: bangloreLatlng
        }
        map = new google.maps.Map($element[0], mapOptions);
        directionsDisplay.setMap(map);
        
        $scope.onCreate({map: map});

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });
      }

      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
})

.directive('ngEnter', function () {
    // for maps route gen
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
})



// GLobal shit
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();
var map;
// var sourceLatlng = new google.maps.LatLng(37.7699298, -122.4469157);
// var destLatLng = new google.maps.LatLng(37.7683909618184, -122.51089453697205);
var sourceLatlng
var destLatLng
var geocoder = new google.maps.Geocoder();
var bangloreLatlng = new google.maps.LatLng(12.9715987, 77.59456269999998)

