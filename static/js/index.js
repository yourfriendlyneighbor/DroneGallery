angular.module('DroneGallery', [])
    .controller('MainController', ['$scope', '$http', ($scope, $http) => {
        $(".button-collapse").sideNav();
        $('.materialboxed').materialbox();

        console.log("ლ(╹◡╹ლ) Help me by trying to hack this website ⊂◉‿◉つ ")

        $scope.photo = {};

        $scope.submit = function(){
            var formData = new FormData;

            for(key in $scope.photo){
                console.log(key, "key..");
                console.log($scope.photo[key]);

                formData.append(key, $scope.photo[key])
            }

            var file = $('#file')[0].files[0];
            formData.append('image', file);

            $http.post('/postPhoto', formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then((res) => {
                $scope.photo = res.data
            })

        }

    }])
