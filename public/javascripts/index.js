if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', {scope: '/'})
    .then(function(reg) {
        // registration worked
        console.log('Registration succeeded. Scope is ' + reg.scope);
    }).catch(function(error) {
        // registration failed
        console.log('Registration failed with ' + error);
    });
}

document.addEventListener('DOMContentLoaded', event => {
    var map = L.map('map');
    var savedLocation = storedLocation;
    var mbIcon = L.icon({
        iconUrl: 'images/mb_logo.svg',
        iconSize: [64, 64],
        iconAnchor: [32, 32]
    });
    var locationMarker, locationCircle, mbMarker;
    var factoryDefaultLocation = [60.4465235742797, 22.249444415651517];
    var initialLocation = savedLocation ? savedLocation : factoryDefaultLocation;

    var Hydda_Full = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
        maxZoom: 18
    });
    Hydda_Full.addTo(map);

    map.setView(initialLocation, 16);

    if (savedLocation) {
        moveMbMarker(savedLocation);
    }
    
    document.querySelector('#locate-me').addEventListener("click", e => {
        map.locate({setView: true, maxZoom: 16});

        map.on('locationfound', e => {
            var radius = e.accuracy / 2;
            clearLocationMarker();
            locationMarker = L.marker(e.latlng).addTo(map);
            locationCircle = L.circle(e.latlng, radius).addTo(map);
        });
    });
    
    document.querySelector('#locate-mb').addEventListener("click", e => {
        map.setView(savedLocation, 16);
        queryLocationFromServer();
    });

    map.on('contextmenu', e => {
        moveMbMarker(e.latlng)
        map.setView(e.latlng);
        confirmSave(e.latlng);
        
    });
    function queryLocationFromServer() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.addEventListener("load", function() {
            if (this.status === 200) {
                var response = JSON.parse(this.responseText);
                if (response.result === "OK") {
                    if (savedLocation != response.latlon) {
                        savedLocation = response.latlon;
                    }
                    map.setView(savedLocation, 16);
                    moveMbMarker(savedLocation);
                }
            }
        });
        xmlhttp.open("GET", "/load");
        xmlhttp.send();
    }
    function confirmSave(latlng) {
        window.setTimeout(() => {
            var confirmed = window.confirm('Tallenetaanko mesen sijainti?');
            if (confirmed) {
                saveLocation(latlng);
            }
            else {
                moveMbMarker(savedLocation);
            }
        }, 1200);
    };
    function saveLocation(latlng) {
        savedLocation = latlng;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.addEventListener("load", function() {
            if (this.status === 200) {
                if (JSON.parse(this.responseText).result === "OK") {
                    window.alert("Sijainti tallennettu!");
                }
            }
        });
        xmlhttp.open("POST", "/save");
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify(latlng));
    }
    function clearLocationMarker() {
        if (locationMarker) {
            locationMarker.remove();
        }
        if (locationCircle) {
            locationCircle.remove();
        }
    }
    function moveMbMarker(latlng) {
        if (mbMarker) {
            mbMarker.remove();
        }
        mbMarker = L.marker(latlng, {icon: mbIcon}).addTo(map)
    }
}, false);