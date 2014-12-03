
$(function() {
  var editor = ace.edit('editor');
  editor.setTheme('ace/theme/monokai');
  editor.getSession().setMode('ace/mode/javascript');

  var session = editor.getSession();
  
  session.on('change', function() {
    var value = session.getValue();
    console.log(value);
  });

  $('#step-1').click( function() {
    session.insert({row: 2, column: 0}, '\nvar incomeScale = d3.scale.log().domain([100, 100000]).range([0, width]);\nvar lifeScale = d3.scale.linear().domain([10, 90]).range([height, 0]);\nvar populationScale = d3.scale.sqrt() .domain([0, 1e9]).range([1, 50]);\n\n');
    
    $('#iframe').contents().find('body').html('step-1 html');
  });

  $('#step-2').click( function() {
    session.insert({row: 7, column: 0}, 'var incomeAxis = d3.svg.axis()\n .orient("bottom")\n .scale(incomeScale) .ticks(5, d3.format(",d"));\n\n');

    $('#iframe').contents().find('body').html('step-2 html');
    
  });

  $('#step-3').click( function() {
    session.insert({row: 10, column: 0}, 'var lifeAxis = d3.svg.axis()\n .orient("left")\n .scale(lifeScale);\n\n');

    $('#iframe').contents().find('body').html('step-3 html');
  });

  $('#step-4').click( function() {
    session.insert({row: 16, column: 0}, 'var svg = d3.select("body").append("svg")\n .attr("width", width + 2*offset)\n .attr("height", height + 2*offset)\n .attr("transform", "translate(" + offset + "," + offset + ")");');

    $('#iframe').contents().find('body').html('step-4 html');
  });
  
  $('#step-5').click( function() {
    session.insert({row: 19, column: 0}, 'svg.append("g")\n .attr("class", "incomeAxis")\n .attr("fill", "none")\n .attr("stroke", "black")\n .attr("shape-rendering", "crispEdges") .attr("transform", "translate(0," + height + ")") .call(incomeAxis);');

    $('#iframe').contents().find('body').html('Complete !');

  });
  


});


var app = angular.module('myapp', ['ui.ace']);

/*
angular.module('todoApp', [])
  .controller('TodoController', ['$scope', function($scope) {
    $scope.todos = [
      {text:'learn angular', done:true},
      {text:'build an angular app', done:false}];
    
    $scope.addTodo = function() {
      $scope.todos.push({text:$scope.todoText, done:false});
      $scope.todoText = '';
    };
    
    $scope.remaining = function() {
      var count = 0;
      angular.forEach($scope.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };
    
    $scope.archive = function() {
      var oldTodos = $scope.todos;
      $scope.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) $scope.todos.push(todo);
      });
    };
  }]);


function HelloWorldController($scope) {
  $scope.message = 'Hello World';
}
*/a
