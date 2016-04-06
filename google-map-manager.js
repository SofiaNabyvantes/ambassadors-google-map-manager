angular.module('google-maps-manager', [ 'google-maps-manager'])
    .factory("GoogleMapManager", ['$timeout', function ($timeout) {
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
                this.setMarkers = bind(this.setMarkers, this);
                this.setZoom = bind(this.setZoom, this);
                this.updateMarkerIcon = bind(this.updateMarkerIcon, this);
                this.removeMarker = bind(this.removeMarker, this);
                this.addMarker = bind(this.addMarker, this);
                this.isMarkerPresent = bind(this.isMarkerPresent, this);
                this.markerClusterer =  new MarkerClusterer(this.map, this.markers, {maxZoom: 16});
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

            MapMarkerManager.prototype.clearMarkers = function () {
                angular.forEach(this.markers, function (marker) {
                    marker.setMap(null);
                });
            };

            MapMarkerManager.prototype.addMarker = function (dataMarker) {
                if(!this.isMarkerPresent(dataMarker)) {
                    var  id =  getMarkerUniqueId(dataMarker.latitude, dataMarker.longitude);

                    this.markers[id] = new google.maps.Marker({
                        position: new google.maps.LatLng(dataMarker.latitude, dataMarker.longitude),
                        pan: true,
                        fit: true,
                        map: this.map,
                        icon: dataMarker[this.mapOptions.icon],
                        id: id
                    });

                    this.markers[id].data = dataMarker;

                    if(this.mapOptions.isClusterer)
                        this.markerClusterer.addMarker(this.markers[id], false);


                    google.maps.event.addListener(this.markers[id], "click", function () {
                        if (this.markerClickEvent)
                            this.markerClickEvent(this)
                    });
                }
            };

            MapMarkerManager.prototype.deleteMarkers = function () {
                this.clearMarkers();
                this.markers = [];

                if(this.mapOptions.isClusterer)
                    this.markerClusterer.clearMarkers();
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
                return  this.markers[getMarkerUniqueId(data.latitude, data.longitude)]
            };

            MapMarkerManager.prototype.setMarkers = function (dataSource) {
                var _this = this;
                angular.forEach(dataSource.data, function (dataMarker, index) {
                    if(!_this.isMarkerPresent(dataMarker)) {
                        var  id =  getMarkerUniqueId(dataMarker.latitude, dataMarker.longitude);

                        _this.markers[id] = new google.maps.Marker({
                            position: new google.maps.LatLng(dataMarker.latitude, dataMarker.longitude),
                            pan: true,
                            fit: true,
                            map: _this.map,
                            icon: dataMarker[_this.mapOptions.icon],
                            id: id
                        });

                        _this.markers[id].data = dataMarker;

                        if(_this.mapOptions.isClusterer)
                            _this.markerClusterer.addMarker(_this.markers[id], false);


                        google.maps.event.addListener(_this.markers[id], "click", function () {
                            if (_this.markerClickEvent)
                                _this.markerClickEvent(this)
                        });
                    }
                });
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
                var marker = this.markers[getMarkerUniqueId(dataMarker.latitude, dataMarker.longitude)];

                if (marker && this.mapOptions.icon)
                    marker.setIcon(dataMarker[this.mapOptions.icon]);
            };


            MapMarkerManager.prototype.removeMarker = function (dataMarker) {
                var marker = this.markers[getMarkerUniqueId(dataMarker.latitude, dataMarker.longitude)];

                if (marker) {
                    marker.setMap(null); // set this.markers setMap to null to remove it from this.map
                    delete marker; // delete marker instance from this.markers object
                }
            };

            var getMarkerUniqueId = function(lat, lng) {
                return lat + '_' + lng;
            };

            return MapMarkerManager;

        })();
        return MapMarkerManager;
    }]);