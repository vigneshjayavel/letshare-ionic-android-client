angular.module('lets_share', ['ionic','ui.bootstrap.datetimepicker'])

/**
 * The Projects factory handles saving and loading projects
 * from local storage, and also lets us save and load the
 * last active project index.
 */
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

.controller('TodoCtrl', function($scope, $timeout, $http, $ionicModal, Projects) {

  // A utility function for creating a new project
  // with the given projectTitle
  var createProject = function(projectTitle) {
    var newProject = Projects.newProject(projectTitle);
    $scope.projects.push(newProject);
    Projects.save($scope.projects);
    $scope.selectProject(newProject, $scope.projects.length-1);
  }

  var myArray = [
  { "title": "Home"}, 
  { "title": "Rides"}, 
  { "title": "Settings"}, 
  { "title": "Logout"}
];

    // radio button logic
    $scope.active = 'Hatchback';

    $scope.setActive = function(type) {
        $scope.active = type;
    };

    $scope.isActive = function(type) {
        return type === $scope.active;
    };

    //datetimepicker
    $scope.onTimeSet = function (newDate, oldDate) {
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
    if(projectTitle) {
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
  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    focusFirstInput: false,
    scope: $scope
  });

  $scope.createTask = function(task) {
    if(!$scope.activeProject) {
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
      debugger
      // $http({
      //     method: 'POST',
      //     url: 'http://srinivasan.ngrok.com/bookings',
      //      data: formData
      // }).success(function () {
      //   alert("success on post request");
      // });

jQuery.ajax({
    type: 'POST',
    url: 'http://srinivasan.ngrok.com/bookings',
    data: formData,
    dataType: 'json',
    success: function() {
      alert("success on post request");
    }
});

      };
  $timeout(function() {
    if($scope.projects.length == 0) {
      while(true) {
        var projectTitle = prompt('Your first project title:');
        if(projectTitle) {
          createProject(projectTitle);
          break;
        }
      }
    }
  });

});


