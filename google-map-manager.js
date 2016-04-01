angular.module('google-maps-manager', [ 'google-maps-manager'])
    .factory("GoogleMapManager", [function () {
        var MapMarkerManager;

        MapMarkerManager = (function(mapId, dataSource, mapOptions) {
            MapMarkerManager.type = 'MapMarkerManager';

            function MapMarkerManager(mapId, dataSource, mapOptions) {
                this.mapOptions = mapOptions != null ? mapOptions : {};
                this.markerClickEvent = null;
                this.mapIdleEvent = null;
                this.markers = [];
                this.isClusterer = false;
                this.map = null;
                this.type = MapMarkerManager.type;
                this.clearMarkers = bind(this.clearMarkers, this);
                this.deleteMarkers = bind(this.deleteMarkers, this);
                this.findIndexMarker = bind(this.findIndexMarker, this);
                this.initialize = bind(this.initialize, this)(mapId, dataSource, mapOptions);
                this.markerClusterer =  new MarkerClusterer(this.map, this.markers, {maxZoom: 16});
                this.setMarkers = bind(this.setMarkers, this);
                this.setZoom = bind(this.setZoom, this);
                this.updateMarkerIcon = bind(this.updateMarkerIcon, this);
                this.removeMarker = bind(this.removeMarker, this);
                this.searchAndRemoveMarkers = bind(this.searchAndRemoveMarkers, this);
                this.isMarkerPresent = bind(this.isMarkerPresent, this);

            }

            MapMarkerManager.prototype.initialize = function (mapId, dataSource, mapOptions) {
                this.isClusterer = this.mapOptions.isClusterer;
                this.map = new google.maps.Map(mapId, mapOptions);
                var _this = this;
                console.log('Change the zoom level', + this.map.getZoom());

                this.map.addListener('zoom_changed', function() {
                    console.log('Change the zoom level', + _this.map.getZoom());
                });

                google.maps.event.addListener(this.map, 'idle',  function () {
                    var bounds = this.getBounds();

                    if(_this.mapIdleEvent)
                        _this.mapIdleEvent({northEastLat: bounds.getNorthEast().lat(), northEastLng: bounds.getNorthEast().lng(),
                            southWestLat: bounds.getSouthWest().lat(),  southWestLng: bounds.getSouthWest().lng()});
                });
            };

            MapMarkerManager.prototype.searchAndRemoveMarkers = function (dataMarkers) {
                var _this = this;
                console.log("begin")
                console.log(dataMarkers)
                angular.forEach(this.markers, function (marker, index) {
                    var isPresent = false;
                    angular.forEach(dataMarkers.data, function (dataMarker) {
                        console.log(marker)
                        console.log(dataMarker)
                        if(dataMarker.id == marker.data.id){
                            isPresent=true;
                            return;
                        }
                    });
                    if(!isPresent)
                    {
                        console.log(isPresent);
                        _this.markerClusterer.removeMarker(marker,false);
                        marker.setMap(null);
                        delete _this.markers[index];
                    }
                });
                console.log("end")
            };

            MapMarkerManager.prototype.clearMarkers = function () {
                angular.forEach(this.markers, function (marker) {
                    marker.setMap(null);
                });
            };

            MapMarkerManager.prototype.deleteMarkers = function () {
                //    this.clearMarkers();
                this.markerClusterer.clearMarkers();
                this.markers = [];

                //this.markerClusterer.resetViewport();
                //this.markerClusterer.redraw();

                //this.markerClusterer.resetViewport();
                // this.markerClusterer.redraw();

            };

            MapMarkerManager.prototype.findIndexMarker = function (dataMarker) {
                var position = -1;
                angular.forEach(this.markers, function (marker, index) {
                    if (marker.data.id === dataMarker.id) {
                        position = index;
                        return;
                    }
                });
                return position;
            };

            MapMarkerManager.prototype.isMarkerPresent = function (data) {
                var isPresent = false;
                var _this = this;
                angular.forEach(this.markers, function (marker, index) {
                    if(_this.markers[index].data.id==data.id)
                    {
                        isPresent = true
                    }
                });
                return isPresent;
            };

            MapMarkerManager.prototype.setMarkers = function (dataSource) {
                if(this.map){
                    var _this = this;
                    this.markerClusterer.addMarkers
                    //  this.searchAndRemoveMarkers(dataSource);
                    angular.forEach(dataSource.data, function (dataMarker, index) {
                        if(!_this.isMarkerPresent(dataMarker)){
                            var length = _this.markers.push(new google.maps.Marker({
                                position: new google.maps.LatLng(dataMarker.latitude, dataMarker.longitude),
                                pan: true,
                                fit: true,
                                icon: dataMarker.marker_image_url,
                                map: _this.map
                            }));

                            _this.markers[length-1].data = dataMarker;

                            _this.markerClusterer.addMarker(_this.markers[length-1], false);

                            google.maps.event.addListener(_this.markers[length-1], "click", function () {
                                if(_this.markerClickEvent)
                                    _this.markerClickEvent(this)
                            });
                        }
                    });

                    if(this.isClusterer){
                        if(this.markerClusterer){
                            console.log('clear markers');
                            //  this.markerClusterer.clearMarkers();
                            //
                            //this.markerClusterer.resetViewport();
                            //
                          //this.markerClusterer.redraw();

                        }
                    }
                }
            };

            MapMarkerManager.prototype.setZoom = function () {
                var bounds = new google.maps.LatLngBounds();
                if (this.map&&this.markers.length > 0) {
                    angular.forEach(this.markers, function (marker) {
                        bounds.extend(marker.getPosition());
                    });
                    this.map.setCenter(bounds.getCenter());
                    this.map.fitBounds(bounds);

                    if (this.markers.length === 1) {
                        this.map.setZoom(16);
                    }
                }
            };

            MapMarkerManager.prototype.updateMarkerIcon = function (dataMarker) {
                var index = this.findIndexMarker(dataMarker);

                if (index != -1)
                    this.markers[index].setIcon(dataMarker.marker_image_url);
            };


            MapMarkerManager.prototype.removeMarker = function (dataMarker) {
                var index = this.findIndexMarker(dataMarker);
                if (index != -1) {
                    this.markers[index].setMap(null); // set this.markers setMap to null to remove it from this.map
                    delete this.markers[index]; // delete marker instance from this.markers object
                }
            };
            return MapMarkerManager;

        })();
        return MapMarkerManager;
    }]);